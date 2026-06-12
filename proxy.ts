import { NextRequest, NextResponse } from 'next/server';
import { adminCookieValue, ADMIN_COOKIE_NAME } from '@/utils/adminAuth';

// Guards the admin pages and the admin-only API routes.
// The cookie must match a hash derived from ADMIN_PASSWORD — a forged
// cookie with an arbitrary value no longer passes.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPage = pathname.startsWith('/admin') && !pathname.includes('/admin/login');
  const isAdminApi =
    pathname.startsWith('/api/admin') ||
    ['/api/generate-images', '/api/generate-mesh', '/api/refine-character', '/api/export-character'].includes(pathname);

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  const cookie = request.cookies.get(ADMIN_COOKIE_NAME);
  const valid =
    !!adminPassword && !!cookie && cookie.value === (await adminCookieValue(adminPassword));

  if (valid) {
    return NextResponse.next();
  }

  if (isAdminApi) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.redirect(new URL('/admin/login', request.url));
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/generate-images',
    '/api/generate-mesh',
    '/api/refine-character',
    '/api/export-character',
  ],
};
