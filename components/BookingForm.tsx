'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/** ---------- Types ---------- */
type Service = {
  id: number;
  name: string;
  description: string | null;
  priceCents: number;
  durationMin: number;
  isActive: boolean;
};

type Booking = {
  id: number;
  start: string; // ISO
};

type SType =
  | 'walk'
  | 'dropin'
  | 'overnightBoarding'
  | 'overnightSitting'
  | 'addon'
  | 'other';

type TimeRange = { start: string; end: string };
type DayWindows = { weekend: TimeRange[]; weekday: TimeRange[] };

/** ---------- Availability rules (single source of truth on the client) ----------
 *  Walk:      Sat–Mon 08:00–19:30 • Tue–Fri 18:30–19:30
 *  Drop-in:   Sat–Mon 06:30–20:30 • Tue–Fri 18:30–20:30
 *  Overnight: Sat–Mon 06:30–20:30 • Tue–Fri 18:00–20:30
 *  Add-ons:   Sat–Mon 06:30–20:30 • Tue–Fri 18:30–20:30
 *  (Sat, Sun, Mon are treated as "weekend" window. Tue–Fri as "weekday".)
 */
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
function getWeekday(dateStr: string) {
  // 0=Sun...6=Sat
  return new Date(`${dateStr}T00:00:00`).getDay();
}
function isWeekend(wd: number) {
  // Sat (6), Sun (0), Mon (1) count as "weekend" for these rules
  return wd === 6 || wd === 0 || wd === 1;
}

/** Map service to its type */
function classifyService(s: Service | null): SType {
  if (!s) return 'other';
  const n = s.name.toLowerCase();
  if (n.startsWith('dog walk')) return 'walk';
  if (n.startsWith('potty break')) return 'dropin';
  if (n.startsWith('boarding')) return 'overnightBoarding';
  if (n.startsWith('sitting')) return 'overnightSitting';
  if (n.startsWith('add-on') || n.startsWith('addon') || n.includes('add-on')) return 'addon';
  return 'other';
}

function windowsForServiceAndDay(sType: SType, wd: number): TimeRange[] {
  const key = SERVICE_TO_KEY[sType];
  if (!key) return [];
  const set = WINDOWS[key];
  return isWeekend(wd) ? set.weekend : set.weekday;
}

/** ---------- Component ---------- */
export default function BookingForm() {
  const router = useRouter();
  const params = useSearchParams();

  // data state
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // form state
  const [serviceId, setServiceId] = useState<number | null>(null);
  const [petCount, setPetCount] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [petDoor, setPetDoor] = useState(false); // for weekday "Sitting"

  // prefill from calendar click
  const prefillServiceId = params.get('serviceId');
  const prefillDogs = params.get('dogs');
  const prefillDate = params.get('date');
  const prefillTime = params.get('time');

  useEffect(() => {
    (async () => {
      try {
        const [svcRes, bRes] = await Promise.all([
          fetch('/api/services', { cache: 'no-store' }),
          fetch('/api/bookings', { cache: 'no-store' }),
        ]);
        const svcJson = await svcRes.json();
        const bJson = bRes.ok ? await bRes.json() : { bookings: [] };

        const list = (svcJson.services || []) as Service[];
        setServices(list);
        setBookings((bJson.bookings || []) as Booking[]);

        // initial service
        let initId: number | null = null;
        if (prefillServiceId) {
          const parsed = Number(prefillServiceId);
          if (Number.isFinite(parsed) && list.some((s) => s.id === parsed)) {
            initId = parsed;
          }
        }
        if (initId == null && list.length) initId = list[0].id;
        setServiceId(initId);

        if (prefillDogs === '2') setPetCount(2);
        if (prefillDate) setStartDate(prefillDate);
        if (prefillTime) setStartTime(prefillTime);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId) || null,
    [services, serviceId]
  );
  const serviceType = classifyService(selectedService);

  /** Pets UI & limits */
  const showPetSelector = useMemo(() => {
    if (!selectedService) return false;
    return (
      selectedService.name.startsWith('Dog Walk') ||
      selectedService.name.startsWith('Boarding') ||
      selectedService.name.startsWith('Sitting')
    );
  }, [selectedService]);

  const maxPets = useMemo(() => {
    if (!selectedService) return 1;
    if (selectedService.name.startsWith('Dog Walk')) return 2;
    if (selectedService.name.startsWith('Boarding')) return 4;
    if (selectedService.name.startsWith('Sitting')) return 4;
    return 1;
  }, [selectedService]);

  useEffect(() => {
    if (petCount > maxPets) setPetCount(maxPets);
    if (petCount < 1) setPetCount(1);
  }, [maxPets, petCount]);

  /** Price calc with Millie’s rules */
  function computeTotalCents(s: Service | null, pets: number): number {
    if (!s) return 0;

    // Dog Walk (2-dog special pricing)
    if (s.name.startsWith('Dog Walk')) {
      if (pets <= 1) return s.priceCents;
      if (s.name.includes('(20')) return 2550;
      if (s.name.includes('(30')) return 3900;
      if (s.name.includes('(60')) return 4800;
      return s.priceCents;
    }

    // Boarding (overnight at Millie’s home)
    if (s.name.startsWith('Boarding')) {
      const extras = Math.max(0, Math.min(pets - 1, 3));
      return 2500 + extras * 1800;
    }

    // Sitting (at pet parent’s home)
    if (s.name.startsWith('Sitting')) {
      const extras = Math.max(0, pets - 1);
      return 3000 + extras * 2300;
    }

    // Everything else (potty break, add-ons) = flat
    return s.priceCents;
  }
  const totalCents = computeTotalCents(selectedService, petCount);
  const totalDisplay = `$${(totalCents / 100).toFixed(2)}`;

  /** Allowed times for chosen date, per service-type windows */
  const allowedTimes = useMemo(() => {
    if (!startDate) return [];
    const wd = getWeekday(startDate);
    const windows = windowsForServiceAndDay(serviceType, wd);
    return rangesToSlots(windows, 30);
  }, [serviceType, startDate]);

  const timeMin = allowedTimes[0];
  const timeMax = allowedTimes[allowedTimes.length - 1];

  /** Check if a slot is already booked */
  function slotIsBooked(dateStr: string, timeStr: string) {
    if (!dateStr || !timeStr) return false;
    return bookings.some((b) => {
      if (!b.start?.startsWith(dateStr)) return false;
      return hhmm(new Date(b.start)) === timeStr;
    });
  }

  function combineDateTime(date: string, time: string) {
    if (!date || !time) return null;
    const iso = new Date(`${date}T${time}`);
    if (Number.isNaN(iso.getTime())) return null;
    // minute precision
    iso.setSeconds(0, 0);
    return iso.toISOString();
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);

    if (!serviceId) {
      setMessage('Please choose a service.');
      return;
    }
    if (!startDate || !startTime) {
      setMessage('Please choose a date and time.');
      return;
    }

    // Sitting on Tue–Fri requires pet door
    const wd = getWeekday(startDate);
    const isWeekday = !isWeekend(wd);
    if (serviceType === 'overnightSitting' && isWeekday && !petDoor) {
      setMessage('Weekday Sitting requires a pet door (please confirm checkbox).');
      return;
    }

    // Validate against per-service windows & existing bookings
    if (!allowedTimes.includes(startTime)) {
      setMessage('Selected time is not available for this service.');
      return;
    }
    if (slotIsBooked(startDate, startTime)) {
      setMessage('That slot has just been booked. Please choose another time.');
      return;
    }

    const startISO = combineDateTime(startDate, startTime);
    if (!startISO) {
      setMessage('Please choose a valid date and time.');
      return;
    }

    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);

    const baseNotes = String(fd.get('notes') || '').trim();
    const petsLine = `Pets: ${petCount}${selectedService ? ` (${selectedService.name})` : ''}. Estimated total: ${totalDisplay}.`;
    const doorLine =
      serviceType === 'overnightSitting' && isWeekday
        ? ` Weekday Sitting pet door: ${petDoor ? 'confirmed' : 'not confirmed'}`
        : '';
    const notes = baseNotes ? `${baseNotes}\n${petsLine}${doorLine}` : `${petsLine}${doorLine}`;

    const payload = {
      serviceId,
      customerName: fd.get('customerName'),
      email: fd.get('email'),
      phone: fd.get('phone'),
      start: startISO,
      notes,
      petCount,
      estimatedTotalCents: totalCents,
    };

    try {
      setSubmitting(true);
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let body: any = {};
      try {
        body = await res.json();
      } catch {}

      if (res.ok) {
        // Let the availability calendar know to refresh (it listens to storage)
        try {
          localStorage.setItem('booking-created', String(Date.now()));
        } catch {}
        // Hard redirect to confirmation
        router.push('/book/thank-you');
      } else {
        setMessage(body?.error || 'Something went wrong. Please try another time.');
      }
    } catch {
      setMessage('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // Keeps pickers visible on small screens
  function scrollIntoViewCentered(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  if (loading) return <p>Loading...</p>;

  const selectedName = selectedService?.name || '';

  return (
    <form onSubmit={onSubmit} className="card space-y-4" aria-live="polite">
      {/* Service */}
      <div>
        <label className="label" htmlFor="serviceId">
          Service
        </label>
        <select
          id="serviceId"
          name="serviceId"
          required
          className="input min-h-12"
          value={serviceId ?? undefined}
          onChange={(e) => {
            const nextId = Number(e.target.value);
            setServiceId(nextId);
            setMessage(null);
            // If current time becomes invalid for new service, clear it
            if (startDate && startTime) {
              const wd = getWeekday(startDate);
              const sType = classifyService(
                services.find((s) => s.id === nextId) || null
              );
              const newAllowed = rangesToSlots(
                windowsForServiceAndDay(sType, wd),
                30
              );
              if (!newAllowed.includes(startTime)) {
                setStartTime('');
              }
            }
          }}
        >
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — ${(s.priceCents / 100).toFixed(2)}
            </option>
          ))}
        </select>
        {selectedService?.description && (
          <p className="mt-1 text-xs text-gray-600">{selectedService.description}</p>
        )}
      </div>

      {/* Pets */}
      {showPetSelector && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="petCount">
              How many pets?
            </label>
            <select
              id="petCount"
              className="input min-h-12"
              value={petCount}
              onChange={(e) => setPetCount(Number(e.target.value))}
            >
              {Array.from({ length: maxPets }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            {selectedName.startsWith('Dog Walk') && (
              <p className="mt-1 text-xs text-gray-600">
                Walks support up to 2 dogs with special 2-dog pricing.
              </p>
            )}
            {selectedName.startsWith('Boarding') && (
              <p className="mt-1 text-xs text-gray-600">
                Up to 3 additional dogs. Pets must be picked up by 11:59pm.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Weekday Sitting requires pet door */}
      {selectedName.startsWith('Sitting') && (
        <div className="rounded-xl bg-gray-50 border border-gray-200 p-3 text-sm">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={petDoor}
              onChange={(e) => setPetDoor(e.target.checked)}
            />
            <span>
              Weekday Sitting (Tue–Fri) requires a pet door so your dog can roam
              inside/outside.
            </span>
          </label>
        </div>
      )}

      {/* Customer info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="customerName">
            Your Name
          </label>
          <input
            id="customerName"
            name="customerName"
            required
            className="input min-h-12"
            placeholder="Jane Doe"
            autoComplete="name"
          />
        </div>
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            required
            className="input min-h-12"
            placeholder="jane@email.com"
            autoComplete="email"
            inputMode="email"
          />
        </div>
      </div>

      {/* Phone + date/time */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="phone">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            required
            className="input min-h-12"
            placeholder="(719) 555-1234"
            autoComplete="tel"
            inputMode="tel"
            minLength={7}
            maxLength={25}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="startDate">
              Date
            </label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              required
              className="input min-h-12"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setMessage(null);
                // if date change makes current time invalid, clear it
                if (startTime && e.target.value) {
                  const wd = getWeekday(e.target.value);
                  const newAllowed = rangesToSlots(
                    windowsForServiceAndDay(serviceType, wd),
                    30
                  );
                  if (!newAllowed.includes(startTime)) {
                    setStartTime('');
                  }
                }
              }}
              onFocus={scrollIntoViewCentered}
            />
          </div>
          <div>
            <label className="label" htmlFor="startTime">
              Time
            </label>
            <input
              id="startTime"
              name="startTime"
              type="time"
              required
              className="input min-h-12"
              value={startTime}
              min={timeMin}
              max={timeMax}
              step={60 * 30}
              onChange={(e) => {
                setStartTime(e.target.value);
                setMessage(null);
              }}
              onFocus={scrollIntoViewCentered}
            />
            {startDate && (
              <p className="mt-1 text-xs text-gray-600">
                Allowed times: {allowedTimes.length ? `${allowedTimes[0]} — ${allowedTimes[allowedTimes.length - 1]} (30m steps)` : '—'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="label" htmlFor="notes">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          className="input"
          rows={4}
          placeholder="Gate code, pup preferences, etc."
        />
      </div>

      {/* Price summary */}
      <div className="rounded-xl bg-gray-50 border border-gray-200 p-3 text-sm flex items-center justify-between">
        <span className="text-gray-700">Estimated total for this visit</span>
        <span className="font-semibold">{totalDisplay}</span>
      </div>

      {/* Submit */}
      <button className="btn w-full sm:w-auto" type="submit" disabled={submitting}>
        {submitting ? 'Submitting…' : 'Request Booking'}
      </button>

      {message && (
        <div
          className="mt-2 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-800 p-3"
          role="status"
        >
          {message}
        </div>
      )}
    </form>
  );
}
