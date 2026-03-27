import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if trying to access admin routes (except login)
  if (pathname.startsWith('/admin') && !pathname.includes('/admin/login')) {
    // Check for authentication cookie
    const authCookie = request.cookies.get('admin-auth');

    if (!authCookie) {
      // No auth cookie, redirect to login
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
