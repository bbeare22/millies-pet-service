import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

/* ----------------- Weekly availability ------------------
   Sat/Sun/Mon: 06:00–20:30
   Tue–Fri:     18:00–20:30
--------------------------------------------------------- */
type TimeRange = { start: string; end: string };

const WEEKLY: Record<number, TimeRange[]> = {
  0: [{ start: '06:00', end: '20:30' }],
  1: [{ start: '06:00', end: '20:30' }],
  2: [{ start: '18:00', end: '20:30' }],
  3: [{ start: '18:00', end: '20:30' }],
  4: [{ start: '18:00', end: '20:30' }],
  5: [{ start: '18:00', end: '20:30' }],
  6: [{ start: '06:00', end: '20:30' }],
};

/* ------- Extra time windows (by service type) ----------- */
const EXTRA_WINDOWS: Record<'dropin'|'walk', TimeRange> = {
  dropin: { start: '06:30', end: '20:30' },
  walk:   { start: '08:00', end: '19:00' },
};

function pad2(n: number) { return String(n).padStart(2, '0'); }
function hhmm(date: Date) { return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`; }
function timeToMinutes(t: string) { const [h, m] = t.split(':').map(Number); return h*60 + m; }

function within(t: string, r: TimeRange) {
  const x = timeToMinutes(t);
  return x >= timeToMinutes(r.start) && x <= timeToMinutes(r.end);
}

function rangesToSlots(ranges: TimeRange[], stepMin = 30) {
  const out: string[] = [];
  for (const r of ranges) {
    const start = new Date(2000, 0, 1, +r.start.slice(0, 2), +r.start.slice(3, 5));
    const end   = new Date(2000, 0, 1, +r.end.slice(0, 2),   +r.end.slice(3, 5));
    for (let t = new Date(start); t <= end; t.setMinutes(t.getMinutes() + stepMin)) {
      out.push(hhmm(t));
    }
  }
  return Array.from(new Set(out));
}
function allowedTimeListFor(date: Date) {
  const weekday = date.getDay();
  const ranges = WEEKLY[weekday] || [];
  return rangesToSlots(ranges, 30);
}
function classifyServiceName(name: string): 'walk'|'dropin'|'other' {
  if (name.startsWith('Dog Walk')) return 'walk';
  if (name.startsWith('Potty Break')) return 'dropin';
  return 'other';
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { serviceId, customerName, email, phone, start, notes } = body || {};

    if (!serviceId || !customerName || !email || !phone || !start) {
      return NextResponse.json({ error: 'Missing fields.' }, { status: 400 });
    }

    const startDate = new Date(start);
    if (Number.isNaN(startDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date/time.' }, { status: 400 });
    }

    // Load the service to know its type
    const service = await prisma.service.findUnique({ where: { id: Number(serviceId) } });
    if (!service) {
      return NextResponse.json({ error: 'Service not found.' }, { status: 400 });
    }
    const serviceType = classifyServiceName(service.name);

    // Build allowed time list for that day
    let allowedTimes = allowedTimeListFor(startDate);
    if (serviceType === 'walk') {
      allowedTimes = allowedTimes.filter(t => within(t, EXTRA_WINDOWS.walk));
    } else if (serviceType === 'dropin') {
      allowedTimes = allowedTimes.filter(t => within(t, EXTRA_WINDOWS.dropin));
    }

    const timeStr = hhmm(startDate);

    // 1) Must be within availability for the service
    if (!allowedTimes.includes(timeStr)) {
      return NextResponse.json({ error: 'Selected time is outside availability for this service.' }, { status: 400 });
    }

    // 2) Must not already be booked
    const conflict = await prisma.booking.findFirst({ where: { start: startDate } });
    if (conflict) {
      return NextResponse.json({ error: 'That time was just booked. Please select another slot.' }, { status: 409 });
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        serviceId: Number(serviceId),
        customerName: String(customerName),
        email: String(email),
        phone: String(phone),
        start: startDate,
        notes: notes ? String(notes) : '',
      },
    });

    // TODO: send notifications if SMTP/Twilio configured

    return NextResponse.json({ ok: true, bookingId: booking.id });
  } catch (e) {
    console.error('BOOK API ERROR:', e);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
