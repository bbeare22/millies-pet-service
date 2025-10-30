import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

type SType = 'walk' | 'dropin' | 'overnightBoarding' | 'overnightSitting' | 'addon' | 'other';
type TimeRange = { start: string; end: string };
type DayWindows = { weekend: TimeRange[]; weekday: TimeRange[] };

const WINDOWS: Record<'walk'|'dropin'|'overnight'|'addon', DayWindows> = {
  walk: {
    weekend: [{ start: '08:00', end: '19:30' }],
    weekday: [{ start: '18:30', end: '19:30' }],
  },
  dropin: {
    weekend: [{ start: '08:00', end: '20:30' }],
    weekday: [{ start: '18:30', end: '20:30' }],
  },
  overnight: {
    weekend: [{ start: '06:30', end: '20:30' }], // Sat/Sun
    weekday: [{ start: '18:00', end: '20:30' }], // Friday only
  },
  addon: {
    weekend: [{ start: '08:00', end: '20:30' }],
    weekday: [{ start: '18:30', end: '20:30' }],
  },
};

function pad2(n: number) { return String(n).padStart(2, '0'); }
function hhmm(d: Date) { return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`; }
function timeToMinutes(t: string) { const [h,m] = t.split(':').map(Number); return h*60+m; }
function within(t: string, r: TimeRange) {
  const x = timeToMinutes(t); return x >= timeToMinutes(r.start) && x <= timeToMinutes(r.end);
}
function rangesToSlots(r: TimeRange[], step = 30) {
  const out: string[] = [];
  for (const a of r) {
    const s = new Date(2000,0,1,+a.start.slice(0,2),+a.start.slice(3,5));
    const e = new Date(2000,0,1,+a.end.slice(0,2),+a.end.slice(3,5));
    for (let t = new Date(s); t <= e; t.setMinutes(t.getMinutes()+step)) out.push(hhmm(t));
  }
  return Array.from(new Set(out));
}

function classify(name: string): SType {
  const n = name.toLowerCase();
  if (n.startsWith('dog walk')) return 'walk';
  if (n.startsWith('drop-in') || n.startsWith('drop in') || n.startsWith('potty break')) return 'dropin';
  if (n.startsWith('boarding')) return 'overnightBoarding';
  if (n.startsWith('sitting')) return 'overnightSitting';
  if (n.startsWith('add-on') || n.startsWith('addon') || n.includes('add-on')) return 'addon';
  return 'other';
}

/** server mirrors client rule: overnight starts ONLY on Fri/Sat/Sun */
function windowsFor(sType: SType, wd: number): TimeRange[] {
  const map: Record<string, DayWindows> = WINDOWS;
  const key = ((): 'walk'|'dropin'|'overnight'|'addon'|null => {
    if (sType === 'walk') return 'walk';
    if (sType === 'dropin') return 'dropin';
    if (sType === 'overnightBoarding' || sType === 'overnightSitting') return 'overnight';
    if (sType === 'addon') return 'addon';
    return null;
  })();
  if (!key) return [];

  if (key === 'overnight') {
    if (wd === 5) return map.overnight.weekday;       // Friday
    if (wd === 6 || wd === 0) return map.overnight.weekend; // Sat/Sun
    return []; // block Mon–Thu new starts
  }

  const weekendDays = (wd === 6 || wd === 0 || wd === 1);
  return weekendDays ? map[key].weekend : map[key].weekday;
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
    startDate.setSeconds(0,0);

    const service = await prisma.service.findUnique({ where: { id: Number(serviceId) } });
    if (!service) return NextResponse.json({ error: 'Service not found.' }, { status: 400 });

    const sType = classify(service.name);
    const wd = startDate.getDay();
    const allowed = rangesToSlots(windowsFor(sType, wd), 30);
    const timeStr = hhmm(startDate);

    if (!allowed.includes(timeStr)) {
      return NextResponse.json({ error: 'Selected time is outside availability for this service.' }, { status: 400 });
    }

    const conflict = await prisma.booking.findFirst({ where: { start: startDate } });
    if (conflict) {
      return NextResponse.json({ error: 'That time was just booked. Please select another slot.' }, { status: 409 });
    }

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
