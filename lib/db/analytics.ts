import { getDb, isMongoConfigured } from '../mongodb';

export interface DailyPageViewDoc {
  date: string; // YYYY-MM-DD UTC
  pageViews: number;
  visitorIds: string[];
}

export interface VisitStats {
  pageViewsAllTime: number;
  pageViewsToday: number;
  uniqueVisitorsAllTime: number;
  uniqueVisitorsLast7Days: number;
  uniqueVisitorsToday: number;
}

export interface VisitDayPoint {
  date: string;
  pageViews: number;
  uniqueVisitors: number;
}

export interface VisitStatsWithSeries extends VisitStats {
  series: VisitDayPoint[];
}

/** In-memory fallback when MongoDB is unavailable. */
const inMemoryDaily: Map<string, DailyPageViewDoc> = new Map();

function utcDateString(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

function daysAgoUtc(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return utcDateString(d);
}

export async function ensureAnalyticsIndexes(): Promise<void> {
  const db = await getDb();
  if (!db || !isMongoConfigured()) {
    throw new Error('MongoDB is not configured. Set MONGODB_URI before creating indexes.');
  }

  await db.collection('page_views_daily').createIndex(
    { date: 1 },
    { unique: true, name: 'page_views_daily_date_unique' }
  );
}

export async function recordPageView(visitorId: string): Promise<void> {
  if (!visitorId || visitorId.length > 80) return;

  const date = utcDateString();
  const db = await getDb();

  if (db && isMongoConfigured()) {
    await db.collection<DailyPageViewDoc>('page_views_daily').updateOne(
      { date },
      {
        $inc: { pageViews: 1 },
        $addToSet: { visitorIds: visitorId },
        $setOnInsert: { date },
      },
      { upsert: true }
    );
    return;
  }

  const existing = inMemoryDaily.get(date) || { date, pageViews: 0, visitorIds: [] };
  existing.pageViews += 1;
  if (!existing.visitorIds.includes(visitorId)) {
    existing.visitorIds.push(visitorId);
  }
  inMemoryDaily.set(date, existing);
}

function aggregateDocs(docs: DailyPageViewDoc[]): VisitStats {
  const today = utcDateString();
  const since7 = daysAgoUtc(6);

  let pageViewsAllTime = 0;
  let pageViewsToday = 0;
  const allVisitors = new Set<string>();
  const last7Visitors = new Set<string>();
  const todayVisitors = new Set<string>();

  for (const doc of docs) {
    pageViewsAllTime += doc.pageViews || 0;
    for (const id of doc.visitorIds || []) {
      allVisitors.add(id);
      if (doc.date >= since7) last7Visitors.add(id);
      if (doc.date === today) todayVisitors.add(id);
    }
    if (doc.date === today) {
      pageViewsToday = doc.pageViews || 0;
    }
  }

  return {
    pageViewsAllTime,
    pageViewsToday,
    uniqueVisitorsAllTime: allVisitors.size,
    uniqueVisitorsLast7Days: last7Visitors.size,
    uniqueVisitorsToday: todayVisitors.size,
  };
}

export async function getVisitStats(seriesDays = 30): Promise<VisitStatsWithSeries> {
  const empty: VisitStatsWithSeries = {
    pageViewsAllTime: 0,
    pageViewsToday: 0,
    uniqueVisitorsAllTime: 0,
    uniqueVisitorsLast7Days: 0,
    uniqueVisitorsToday: 0,
    series: buildSeries([], seriesDays),
  };

  const db = await getDb();
  if (db && isMongoConfigured()) {
    try {
      const docs = await db
        .collection<DailyPageViewDoc>('page_views_daily')
        .find({})
        .project({ date: 1, pageViews: 1, visitorIds: 1 })
        .toArray();
      const typed = docs as DailyPageViewDoc[];
      return {
        ...aggregateDocs(typed),
        series: buildSeries(typed, seriesDays),
      };
    } catch (err) {
      console.warn('Error loading visit stats:', err);
      return empty;
    }
  }

  const memDocs = Array.from(inMemoryDaily.values());
  return {
    ...aggregateDocs(memDocs),
    series: buildSeries(memDocs, seriesDays),
  };
}

/** Fill last N UTC days so charts have continuous X-axis. */
function buildSeries(docs: DailyPageViewDoc[], days: number): VisitDayPoint[] {
  const byDate = new Map(docs.map((d) => [d.date, d]));
  const series: VisitDayPoint[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = daysAgoUtc(i);
    const doc = byDate.get(date);
    series.push({
      date,
      pageViews: doc?.pageViews || 0,
      uniqueVisitors: doc?.visitorIds?.length || 0,
    });
  }

  return series;
}
