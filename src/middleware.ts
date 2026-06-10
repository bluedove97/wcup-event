import { NextRequest, NextResponse } from 'next/server';

const ADMIN_SESSION_COOKIE = 'admin_session';
const USER_SESSION_COOKIE = 'user_session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  // Protect /admin/* sub-paths (not /admin login page itself)
  if (pathname.startsWith('/admin/')) {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  // Protect /betting and /my-bets — require user login
  if (pathname.startsWith('/betting') || pathname.startsWith('/my-bets')) {
    const token = request.cookies.get(USER_SESSION_COOKIE)?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
