import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_for_hackathon');

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Paths that do not require authentication
  const isPublicPath = pathname === '/' || pathname.startsWith('/api/auth') || pathname.startsWith('/api/webhooks') || pathname.startsWith('/_next');

  if (isPublicPath) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
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
    // Redirect to login on token error (expired, invalid, etc.)
    const loginUrl = new URL('/', request.url);
    // Optional: Clear the invalid cookie
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('auth_token');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
