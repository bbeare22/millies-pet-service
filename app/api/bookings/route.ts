import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      where: { status: { not: 'CANCELLED' } },
      select: { id: true, start: true },
    });
    return NextResponse.json({ bookings });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ bookings: [] });
  }
}
