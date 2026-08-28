import { NextResponse } from 'next/server';
import { purgeLegacySeedBooks } from '@/lib/db/books';
import { ensureDefaultUsers } from '@/lib/db/users';
import { getSessionUser } from '@/lib/auth';

export async function POST() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
    }

    await purgeLegacySeedBooks();
    await ensureDefaultUsers();

    return NextResponse.json({
      success: true,
      message: 'Database initialized. Legacy demo books removed; admin account ready.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Initialization failed.' }, { status: 500 });
  }
}
