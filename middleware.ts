import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const AUTH_SECRET = process.env.AUTH_SECRET || 'dev_secret_fallback_key_at_least_32_characters_long_12345';
const secretKey = new TextEncoder().encode(AUTH_SECRET);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect Admin Portal Pages (except /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = req.cookies.get('recipebooks_session')?.value;

    if (!token) {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, secretKey);
      if (payload.role !== 'admin') {
        const loginUrl = new URL('/admin/login', req.url);
        loginUrl.searchParams.set('error', 'access_denied');
        return NextResponse.redirect(loginUrl);
      }
    } catch {
      const loginUrl = new URL('/admin/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
