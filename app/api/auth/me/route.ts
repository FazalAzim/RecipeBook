import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { findUserById } from '@/lib/db/users';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ user: null });
    }

    const payload = await verifySessionToken(token);
    if (!payload?.id) {
      const response = NextResponse.json({ user: null });
      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }

    const user = await findUserById(payload.id);
    if (!user) {
      // Stale JWT after user was deleted — clear cookie so UI logs out
      const response = NextResponse.json({ user: null });
      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }

    return NextResponse.json({ user });
  } catch (error: unknown) {
    console.error('Session retrieval error:', error);
    return NextResponse.json({ user: null });
  }
}
