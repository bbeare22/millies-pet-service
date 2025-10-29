import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** ---------- Types & windows (must match client rules) ---------- */
type SType =
  | 'walk'
  | 'dropin'
  | 'overnightBoarding'
  | 'overnightSitting'
  | 'addon'
  | 'other';

type TimeRange = { start: string; end: string };
type DayWindows = { weekend: TimeRange[]; weekday: TimeRange[] };

const WINDOWS: Record<'walk' | 'dropin' | 'overnight' | 'addon', DayWindows> = {
  walk: {
    weekend: [{ start: '08:00', end: '19:30' }],
    weekday: [{ start: '18:30', end: '19:30' }],
  },
  dropin: {
    weekend: [{ start: '06:30', end: '20:30' }],
    weekday: [{ start: '18:30', end: '20:30' }],
  },
  overnight: {
    weekend: [{ start: '06:30', end: '20:30' }],
    weekday: [{ start: '18:00', end: '20:30' }],
  },
  addon: {
    weekend: [{ start: '06:30', end: '20:30' }],
    weekday: [{ start: '18:30', end: '20:30' }],
  },
};

const SERVICE_TO_KEY: Record<
  SType,
  'walk' | 'dropin' | 'overnight' | 'addon' | null
> = {
  walk: 'walk',
  dropin: 'dropin',
  overnightBoarding: 'overnight',
  overnightSitting: 'overnight',
  addon: 'addon',
  other: null,
};

function isWeekend(wd: number) {
  // Sat (6), Sun (0), Mon (1)
  return wd === 6 || wd === 0 || wd === 1;
}

/** ---------- Time helpers ---------- */
function pad2(n: number) {
  return String(n).padStart(2, '0');
}
function hhmm(date: Date) {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}
function timeToMinutes(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}
function within(t: string, r: TimeRange) {
  const x = timeToMinutes(t);
  return x >= timeToMinutes(r.start) && x <= timeToMinutes(r.end);
}
function rangesToSlots(ranges: TimeRange[], stepMin = 30): string[] {
  const out: string[] = [];
  for (const r of ranges) {
    const start = new Date(2000, 0, 1, +r.start.slice(0, 2), +r.start.slice(3, 5));
    const end = new Date(2000, 0, 1, +r.end.slice(0, 2), +r.end.slice(3, 5));
    for (let t = new Date(start); t <= end; t.setMinutes(t.getMinutes() + stepMin)) {
      out.push(hhmm(t));
    }
  }
  return Array.from(new Set(out));
}

function classifyServiceName(name: string): SType {
  const n = name.toLowerCase();
  if (n.startsWith('dog walk')) return 'walk';
  if (n.startsWith('potty break')) return 'dropin';
  if (n.startsWith('boarding')) return 'overnightBoarding';
  if (n.startsWith('sitting')) return 'overnightSitting';

  // Robust add-on detection (Administration of Meds, Vet Appointment, Pick up/Drop-off)
  if (
    /administration of meds/i.test(name) ||
    /vet/i.test(name) ||
    /(pick ?up|drop[- ]?off)/i.test(name) ||
    /add[- ]?on/i.test(name)
  ) {
    return 'addon';
  }
  return 'other';
}

function windowsForServiceAndDay(sType: SType, wd: number): TimeRange[] {
  const key = SERVICE_TO_KEY[sType];
  if (!key) return [];
  const set = WINDOWS[key];
  return isWeekend(wd) ? set.weekend : set.weekday;
}

/** ---------- POST /api/book ---------- */
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
    // normalize to minute precision (avoid ms/seconds mismatches)
    startDate.setSeconds(0, 0);

    // Load service (to know its type window)
    const service = await prisma.service.findUnique({
      where: { id: Number(serviceId) },
    });
    if (!service) {
      return NextResponse.json({ error: 'Service not found.' }, { status: 400 });
    }

    const sType = classifyServiceName(service.name);
    const wd = startDate.getDay();
    const allowedTimes = rangesToSlots(windowsForServiceAndDay(sType, wd), 30);
    const timeStr = hhmm(startDate);

    // 1) Must be within per-service availability window
    if (!allowedTimes.includes(timeStr)) {
      return NextResponse.json(
        { error: 'Selected time is outside availability for this service.' },
        { status: 400 }
      );
    }

    // 2) Not already booked (exact minute)
    const conflict = await prisma.booking.findFirst({
      where: { start: startDate },
    });
    if (conflict) {
      return NextResponse.json(
        { error: 'That time was just booked. Please select another slot.' },
        { status: 409 }
      );
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

    return NextResponse.json({ ok: true, bookingId: booking.id });
  } catch (e) {
    console.error('BOOK API ERROR:', e);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
