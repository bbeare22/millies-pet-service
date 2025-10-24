import { NextResponse } from 'next/server';

export async function GET() {
  const secret = process.env.ADMIN_SECRET;
  // If the middleware allowed us here, the cookie is present.
  // Still double-check for safety:
  // (In Next API routes, cookies are read by middleware. Here, just return ok.)
  if (!secret) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }
  // If the user wasn't authorized, middleware would have blocked this with 401 already.
  return NextResponse.json({ ok: true });
}
