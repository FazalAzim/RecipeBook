import { NextResponse } from 'next/server';
import { purgeLegacySeedBooks } from '@/lib/db/books';
import { getSessionUser } from '@/lib/auth';

/** Admin-only maintenance: removes legacy demo books. Does not create users. */
export async function POST() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
    }

    await purgeLegacySeedBooks();

    return NextResponse.json({
      success: true,
      message: 'Legacy demo books removed. No default users were created.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Initialization failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
