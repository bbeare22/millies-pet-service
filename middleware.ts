import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PREFIXES = ['/admin', '/api/admin'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get('admin_session')?.value;
  const secret = process.env.ADMIN_SECRET;

  if (cookie && secret && cookie === secret) {
    return NextResponse.next();
  }

  // If API: return 401 JSON, else redirect to /admin?login=1
  if (pathname.startsWith('/api/')) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  const url = req.nextUrl.clone();
  url.pathname = '/admin';
  url.searchParams.set('login', '1');
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
