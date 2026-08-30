import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_for_hackathon');

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Paths that do not require authentication
  const isPublicPath = pathname === '/' || 
                       pathname.startsWith('/api/') ||
                       pathname.startsWith('/_next');

  if (isPublicPath) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Redirect to login page if token is missing
    const loginUrl = new URL('/', request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verify the JWT token
    await jwtVerify(token, JWT_SECRET);
    return NextResponse.next();
  } catch (error) {
    console.error('JWT Verification failed:', error);
    if (pathname.startsWith('/api/')) {
      const response = NextResponse.json({ error: 'Session expired' }, { status: 401 });
      response.cookies.delete('auth_token');
      return response;
    }
    const loginUrl = new URL('/', request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('auth_token');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all dashboard page routes, excluding static assets and API routes:
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
