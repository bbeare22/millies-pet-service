import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: list bookings
export async function GET() {
  const bookings = await prisma.booking.findMany({
    include: { service: true },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
  return NextResponse.json({ bookings });
}

// PATCH: update status
// body: { id: number, action: 'confirm' | 'cancel' }
export async function PATCH(req: Request) {
  const { id, action } = await req.json().catch(() => ({}));
  if (!id || !['confirm', 'cancel'].includes(action)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const status = action === 'confirm' ? 'CONFIRMED' : 'CANCELLED';
  const updated = await prisma.booking.update({
    where: { id: Number(id) },
    data: { status },
  });

  return NextResponse.json({ booking: updated });
}

// DELETE: delete a booking
// body: { id: number }
export async function DELETE(req: Request) {
  const { id } = await req.json().catch(() => ({}));
  if (!id) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  await prisma.booking.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
