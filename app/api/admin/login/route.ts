import { NextResponse } from 'next/server';

const ADMIN_COOKIE = 'admin_session';

export async function POST(req: Request) {
  const contentType = req.headers.get('content-type') || '';
  let password = '';

  if (contentType.includes('application/json')) {
    const body = await req.json().catch(() => ({}));
    password = String(body?.password || '');
  } else {
    const form = await req.formData();
    password = String(form.get('password') || '');
  }

  const secret = process.env.ADMIN_SECRET || '';
  if (!secret) {
    return NextResponse.json({ error: 'ADMIN_SECRET not set' }, { status: 500 });
  }
  if (password !== secret) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  // Set cookie and redirect back to /admin
  const res = NextResponse.redirect(new URL('/admin', req.url));
  res.cookies.set(ADMIN_COOKIE, '1', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV !== 'development',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}
