import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { recordPageView } from '@/lib/db/analytics';

const VISITOR_COOKIE = 'rb_vid';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/** Dedupe Strict Mode / rapid re-fires: visitorId+path within 30s */
const recentHits = new Map<string, number>();
const DEDUPE_MS = 30_000;

const BOT_UA =
  /bot|crawl|spider|slurp|mediapartners|adsbot|bingpreview|facebookexternalhit|whatsapp|telegram|preview/i;

function isBot(ua: string | null): boolean {
  if (!ua) return false;
  return BOT_UA.test(ua);
}

function shouldSkipPath(path: string): boolean {
  return path.startsWith('/admin') || path.startsWith('/api');
}

function pruneRecentHits(now: number) {
  if (recentHits.size < 500) return;
  for (const [key, ts] of recentHits) {
    if (now - ts > DEDUPE_MS) recentHits.delete(key);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ua = req.headers.get('user-agent');
    if (isBot(ua)) {
      return NextResponse.json({ ok: true, skipped: 'bot' });
    }

    let path = '/';
    try {
      const body = await req.json();
      if (typeof body?.path === 'string' && body.path.startsWith('/')) {
        path = body.path.slice(0, 200);
      }
    } catch {
      // empty body is fine
    }

    if (shouldSkipPath(path)) {
      return NextResponse.json({ ok: true, skipped: 'path' });
    }

    let visitorId = req.cookies.get(VISITOR_COOKIE)?.value;
    const isNewCookie = !visitorId;
    if (!visitorId || visitorId.length > 80) {
      visitorId = randomUUID();
    }

    const now = Date.now();
    pruneRecentHits(now);
    const dedupeKey = `${visitorId}:${path}`;
    const last = recentHits.get(dedupeKey);
    if (last && now - last < DEDUPE_MS) {
      const response = NextResponse.json({ ok: true, skipped: 'dedupe' });
      if (isNewCookie) {
        response.cookies.set(VISITOR_COOKIE, visitorId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: COOKIE_MAX_AGE,
        });
      }
      return response;
    }
    recentHits.set(dedupeKey, now);

    await recordPageView(visitorId);

    const response = NextResponse.json({ ok: true });
    if (isNewCookie) {
      response.cookies.set(VISITOR_COOKIE, visitorId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: COOKIE_MAX_AGE,
      });
    }
    return response;
  } catch (error: unknown) {
    console.error('Visit tracking error:', error);
    // Never break the site for analytics failures
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
