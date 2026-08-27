import { NextResponse } from 'next/server';
import { getDbAdminStats } from '@/lib/db/orders';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
    }

    const stats = await getDbAdminStats();
    return NextResponse.json({ stats });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to load stats.' }, { status: 500 });
  }
}
