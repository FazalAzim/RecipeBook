import { NextRequest, NextResponse } from 'next/server';
import { getDbUserLibrary } from '@/lib/db/library';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const emailParam = searchParams.get('email');
    const sessionUser = await getSessionUser();

    const activeUserId = sessionUser?.id;
    const activeEmail = emailParam || sessionUser?.email;

    if (!activeUserId && !activeEmail) {
      return NextResponse.json({ items: [] });
    }

    const items = await getDbUserLibrary(activeUserId, activeEmail);
    return NextResponse.json({ items });
  } catch (error: any) {
    console.error('Error querying library:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve your recipe book library.' },
      { status: 500 }
    );
  }
}
