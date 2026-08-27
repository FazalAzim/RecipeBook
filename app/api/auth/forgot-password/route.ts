import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail } from '@/lib/db/users';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await findUserByEmail(cleanEmail);

    if (!user) {
      return NextResponse.json(
        { error: 'No registered account found with that email address.' },
        { status: 404 }
      );
    }

    // Return success response (in production, would send reset email)
    return NextResponse.json({
      success: true,
      message: 'Password reset link has been dispatched to your email address.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error processing password reset request.' },
      { status: 500 }
    );
  }
}
