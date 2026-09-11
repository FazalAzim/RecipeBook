import { NextResponse } from 'next/server';
import { getDbAdminStats } from '@/lib/db/orders';
import { getVisitStats } from '@/lib/db/analytics';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
    }

    const [salesStats, visitStats] = await Promise.all([getDbAdminStats(), getVisitStats()]);

    return NextResponse.json({
      stats: {
        ...salesStats,
        ...visitStats,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to load stats.' }, { status: 500 });
  }
}
