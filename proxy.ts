import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import getSessionOptions from '@/session/options';
import TSessionPayload from '@/types/session-payload';

export default async function proxy(request: NextRequest) {
  const session = await getIronSession<TSessionPayload>(await cookies(), getSessionOptions());

  const isLoggedIn = !!session.user;
  const { pathname } = request.nextUrl;

  // Define public routes that don't require authentication
  const PUBLIC_ROUTES = ['/login'];
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  // If logged in and trying to access login page, redirect to home
  if (isLoggedIn && isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If not logged in and trying to access protected route, redirect to login
  if (!isLoggedIn && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    // Optional: save the intended destination to redirect back after login
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, favicon.svg (favicon files)
     * - API routes that handle their own auth
     * - Static assets
     */
    '/((?!_next/static|_next/image|favicon.ico|favicon.svg|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
