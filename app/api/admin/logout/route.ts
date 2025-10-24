import { NextResponse } from 'next/server';

const ADMIN_COOKIE = 'admin_session';

export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL('/admin', req.url));
  res.cookies.set(ADMIN_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV !== 'development',
    path: '/',
    maxAge: 0,
  });
  return res;
}
