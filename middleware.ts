import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token');

  const { pathname } = request.nextUrl;

  const isProtectedRoute =
    pathname.startsWith('/employee') || pathname.startsWith('/admin');

  const isAuthRoute = pathname.startsWith('/auth');

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/employee/todo', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/employee/:path*', '/admin/:path*', '/auth/:path*'],
};
