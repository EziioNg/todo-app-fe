import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token');

  const { pathname } = request.nextUrl;

  const isProtectedRoute =
    pathname.startsWith('/employee') || pathname.startsWith('/admin');
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  const AUTH_WHITELIST = [
    '/auth/verification-first-login',
    '/auth/update-password',
    '/auth/verification-admin',
  ];
  const isAuthRoute = pathname.startsWith('/auth');

  const isWhitelisted = AUTH_WHITELIST.some((route) =>
    pathname.startsWith(route),
  );
  if (isAuthRoute && token && !isWhitelisted) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/employee/:path*', '/admin/:path*', '/auth/:path*'],
};
