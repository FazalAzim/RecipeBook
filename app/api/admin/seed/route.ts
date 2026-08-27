import { NextResponse } from 'next/server';
import { ensureBooksSeeded } from '@/lib/db/books';
import { ensureDefaultUsers } from '@/lib/db/users';
import { getSessionUser } from '@/lib/auth';

export async function POST() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
    }

    await ensureBooksSeeded();
    await ensureDefaultUsers();

    return NextResponse.json({ success: true, message: 'Database seeded with default cookbooks and admin account.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Seeding failed.' }, { status: 500 });
  }
}
