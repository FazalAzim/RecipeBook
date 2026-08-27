import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { findUserById } from '@/lib/db/users';

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ user: null });
    }

    const fullProfile = await findUserById(sessionUser.id);
    return NextResponse.json({ user: fullProfile || sessionUser });
  } catch (error: any) {
    console.error('Session retrieval error:', error);
    return NextResponse.json({ user: null });
  }
}
