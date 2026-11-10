import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'plumya_token';
const DEFAULT_SECRET = 'plumya_super_secret_jwt_encryption_key_2026_xK9#mQ2!vL8';

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || DEFAULT_SECRET;
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  // ── 1. HONEYPOT / OBFUSCATION: Block standard /admin route ───────────
  // Anyone requesting /admin is rejected with 404 so they don't know the panel exists
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return NextResponse.rewrite(new URL('/not-found', request.url));
  }

  // ── 2. PROTECT THE SECRET ADMIN PANEL: /yonetim-plumya ────────────────
  if (pathname === '/yonetim-plumya' || pathname.startsWith('/yonetim-plumya/')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, getJwtSecret());
      if (payload.role !== 'admin') {
        // Not an admin: redirect to home or 404
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch {
      // Invalid or expired token
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── 3. PROTECT ADMIN API ROUTES: /api/admin/* ─────────────────────────
  if (pathname.startsWith('/api/admin/')) {
    if (!token) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekmektedir.' },
        { status: 401 }
      );
    }

    try {
      const { payload } = await jwtVerify(token, getJwtSecret());
      if (payload.role !== 'admin') {
        return NextResponse.json(
          { error: 'Yetkisiz erişim. Yönetici yetkisi gereklidir.' },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: 'Geçersiz veya süresi dolmuş oturum.' },
        { status: 401 }
      );
    }
  }

  // ── 4. ATTACH ESSENTIAL SECURITY HEADERS TO ALL RESPONSES ───────────
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/yonetim-plumya/:path*',
    '/api/admin/:path*',
  ],
};
