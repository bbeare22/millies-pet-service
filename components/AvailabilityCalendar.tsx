'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { addMonths, format, isSameDay, startOfDay } from 'date-fns';

type Booking = {
  id: number;
  start: string; // ISO
};

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Allowed windows (24h) */
const WINDOW = {
  weekendAllDay: { start: { h: 6, m: 30 }, end: { h: 20, m: 30 } }, // Sat–Mon
  weekdayEvening: { start: { h: 18, m: 0 }, end: { h: 20, m: 30 } }, // Tue–Fri
};

function toHM(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes()
  ).padStart(2, '0')}`;
}

/** Build slots at :00 and :30 between start..end inclusive */
function buildSlotsFor(date: Date) {
  const dow = date.getDay(); // 0=Sun ... 6=Sat
  const w =
    dow === 0 || dow === 6 || dow === 1
      ? WINDOW.weekendAllDay
      : WINDOW.weekdayEvening;

  const base = startOfDay(date);
  const start = new Date(base);
  start.setHours(w.start.h, w.start.m, 0, 0);
  const end = new Date(base);
  end.setHours(w.end.h, w.end.m, 0, 0);

  const out: string[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    out.push(toHM(cur));
    cur.setMinutes(cur.getMinutes() + 30);
  }
  return out;
}

/** Normalize ISO to minute precision (no seconds/ms) */
function minuteISO(iso: string) {
  const d = new Date(iso);
  d.setSeconds(0, 0);
  return d.toISOString();
}

export default function AvailabilityCalendar() {
  const router = useRouter();
  const [cursor, setCursor] = useState<Date>(new Date());
  const [selected, setSelected] = useState<Date | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  // Load bookings
  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/bookings', { cache: 'no-store' });
      const data = await res.json();
      setBookings(Array.isArray(data?.bookings) ? data.bookings : []);
    } catch (e) {
      console.error('Failed to load bookings', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();

    // Refresh when window regains focus or tab becomes visible
    const onFocus = () => load();
    const onVis = () => document.visibilityState === 'visible' && load();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVis);

    // Listen for booking-created broadcast from booking page
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'booking-created') load();
    };
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // Build a Set of booked minute-ISO strings for quick lookups
  const bookedSet = useMemo(() => {
    const s = new Set<string>();
    for (const b of bookings) s.add(minuteISO(b.start));
    return s;
  }, [bookings]);

  // Month scaffold
  const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
  const weeks: Date[][] = [];
  {
    // fill calendar matrix (sun..sat rows)
    let d = new Date(monthStart);
    d.setDate(d.getDate() - d.getDay());
    while (d <= monthEnd || d.getDay() !== 0) {
      const row: Date[] = [];
      for (let i = 0; i < 7; i++) {
        row.push(new Date(d));
        d.setDate(d.getDate() + 1);
      }
      weeks.push(row);
    }
  }

  // All slots for selected day and whether each is booked
  const daySlots = useMemo(() => {
    if (!selected) return [];
    const slots = buildSlotsFor(selected);
    return slots.map((hm) => {
      const [H, M] = hm.split(':').map(Number);
      const tmp = new Date(selected);
      tmp.setHours(H, M, 0, 0);
      const iso = minuteISO(tmp.toISOString());
      const isBooked = bookedSet.has(iso);
      return { hm, iso, isBooked };
    });
  }, [selected, bookedSet]);

  function selectDay(d: Date) {
    setSelected(d);
    // Scroll to the slots list for convenience
    const el = document.getElementById('slots');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function goBook(iso: string, disabled: boolean) {
    if (disabled) return;
    const d = new Date(iso);
    const dateStr = format(d, 'yyyy-MM-dd');
    const timeStr = format(d, 'HH:mm');
    router.push(`/book?date=${dateStr}&time=${timeStr}`);
  }

  return (
    <section className="py-6 space-y-4">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-xl font-semibold">Availability</h1>
          <p className="text-xs text-gray-600">
            Sat–Mon: 6:30am–8:30pm • Tue–Fri: 6:00pm–8:30pm. Pick a date to see open times.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="btn-ghost text-sm px-3 py-1.5"
            onClick={() => setCursor((d) => addMonths(d, -1))}
            aria-label="Previous month"
          >
            ←
          </button>
          <div className="text-sm font-medium">
            {format(cursor, 'MMMM yyyy')}
          </div>
          <button
            className="btn-ghost text-sm px-3 py-1.5"
            onClick={() => setCursor((d) => addMonths(d, 1))}
            aria-label="Next month"
          >
            →
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="rounded-2xl border border-gray-200 bg-white p-2 shadow-sm">
        <div className="grid grid-cols-7 gap-2 px-1 pb-2">
          {DAY_LABELS.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-500 py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {weeks.map((row, i) => (
            <div key={i} className="contents">
              {row.map((d) => {
                const inMonth = d.getMonth() === cursor.getMonth();
                // Determine if the *whole day* is fully booked
                const slots = buildSlotsFor(d);
                const allTaken = slots.every((hm) => {
                  const [H, M] = hm.split(':').map(Number);
                  const x = new Date(d);
                  x.setHours(H, M, 0, 0);
                  return bookedSet.has(minuteISO(x.toISOString()));
                });

                const isSelected = selected && isSameDay(d, selected);

                return (
                  <button
                    key={d.toISOString()}
                    onClick={() => selectDay(d)}
                    disabled={!inMonth || allTaken}
                    className={[
                      'h-24 rounded-xl border text-left p-2 transition',
                      inMonth ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 text-gray-400',
                      allTaken ? 'opacity-50 cursor-not-allowed' : 'hover:border-brand/50',
                      isSelected ? 'ring-2 ring-brand/40' : ''
                    ].join(' ')}
                    aria-pressed={isSelected}
                  >
                    <div className="text-xs font-medium">{format(d, 'd')}</div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Slots for the selected day */}
      <div id="slots" className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        {selected ? (
          <>
            <h2 className="text-sm font-semibold mb-3">
              {format(selected, 'EEEE, MMM d')}
              {loading && <span className="ml-2 text-xs text-gray-400">(refreshing…)</span>}
            </h2>
            <div className="flex flex-wrap gap-2">
              {daySlots.map(({ hm, iso, isBooked }) => (
                <button
                  key={iso}
                  onClick={() => goBook(iso, isBooked)}
                  disabled={isBooked}
                  className={[
                    'px-4 py-2 rounded-xl text-sm border transition',
                    isBooked
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white hover:bg-brand/5 border-gray-200'
                  ].join(' ')}
                >
                  {format(new Date(iso), 'h:mm a')}
                </button>
              ))}
              {daySlots.length === 0 && (
                <p className="text-sm text-gray-600">No times available this day.</p>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-600">Select a date to view available times.</p>
        )}
      </div>
    </section>
  );
}
