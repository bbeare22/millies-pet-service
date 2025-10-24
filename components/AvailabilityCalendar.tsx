'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';

type TimeRange = { start: string; end: string };
type WeeklySchedule = Record<number, TimeRange[]>;

// Single schedule:
// - Sat/Sun/Mon = 06:00–20:30
// - Tue–Fri = 18:00–20:30
const schedule: WeeklySchedule = {
  0: [{ start: '06:30', end: '20:30' }], // Sun
  1: [{ start: '06:30', end: '20:30' }], // Mon
  2: [{ start: '18:00', end: '20:30' }], // Tue
  3: [{ start: '18:00', end: '20:30' }], // Wed
  4: [{ start: '18:00', end: '20:30' }], // Thu
  5: [{ start: '18:00', end: '20:30' }], // Fri
  6: [{ start: '06:30', end: '20:30' }], // Sat
};

// Generate HH:mm slots every 30 minutes, inclusive of the end time.
function rangesToSlots(ranges: TimeRange[], stepMin = 30): string[] {
  const out: string[] = [];
  for (const r of ranges) {
    const start = new Date(2000, 0, 1, +r.start.slice(0, 2), +r.start.slice(3, 5));
    const end = new Date(2000, 0, 1, +r.end.slice(0, 2), +r.end.slice(3, 5));
    // include end time as a valid start
    for (let t = new Date(start); t <= end; t.setMinutes(t.getMinutes() + stepMin)) {
      const hh = String(t.getHours()).padStart(2, '0');
      const mm = String(t.getMinutes()).padStart(2, '0');
      out.push(`${hh}:${mm}`);
    }
  }
  return Array.from(new Set(out));
}

export default function AvailabilityCalendar() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(today));
  const [selectedDate, setSelectedDate] = useState<Date | null>(today);
  const [bookings, setBookings] = useState<{ id: number; start: string }[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/bookings', { cache: 'no-store' });
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        setBookings(data.bookings || []);
      } catch (e) {
        console.error('Failed to load bookings', e);
        setBookings([]);
      }
    })();
  }, []);

  // Build the visible matrix of days (6 rows x 7 columns)
  const monthMatrix = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    const days: Date[] = [];
    for (let d = start; d <= end; d = addDays(d, 1)) days.push(d);
    const weeks: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
    return weeks;
  }, [currentMonth]);

  function daySlots(date: Date) {
    const ranges = schedule[getDay(date)] || [];
    return rangesToSlots(ranges, 30);
  }

  function availableSlots(date: Date) {
    const slots = daySlots(date);
    if (!slots.length) return [];
    const dateStr = format(date, 'yyyy-MM-dd');
    const booked = bookings
      .filter((b) => b.start?.startsWith(dateStr))
      .map((b) => format(new Date(b.start), 'HH:mm'));
    const bookedSet = new Set(booked);
    return slots.filter((s) => !bookedSet.has(s));
  }

  function fullyBooked(date: Date) {
    const all = daySlots(date);
    return all.length > 0 && availableSlots(date).length === 0;
  }

  const selectedSlots = selectedDate ? availableSlots(selectedDate) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-extrabold">Availability</h2>
        <p className="text-gray-700 text-sm sm:text-base">
          Sat–Mon: 6:30am–8:30pm • Tue–Fri: 6:00pm–8:30pm. Pick a date to see open times.
        </p>
      </div>

      {/* Month controls */}
      <div className="flex items-center justify-between">
        <button className="btn-ghost" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>←</button>
        <h3 className="text-lg sm:text-xl font-bold">{format(currentMonth, 'MMMM yyyy')}</h3>
        <button className="btn-ghost" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>→</button>
      </div>

      {/* Calendar grid */}
      <div className="card">
        <div className="grid grid-cols-7 gap-2 text-xs sm:text-sm font-semibold text-gray-600 mb-2">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
            <div key={d} className="text-center">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {monthMatrix.map((week, i) => (
            <div key={i} className="contents">
              {week.map((day) => {
                const inMonth = isSameMonth(day, currentMonth);
                const hasAny = daySlots(day).length > 0;
                const isFull = fullyBooked(day);
                const selected = selectedDate && isSameDay(day, selectedDate);

                const cn = [
                  'aspect-square rounded-xl p-2 border text-sm transition flex items-start justify-start',
                  inMonth ? 'bg-white' : 'bg-gray-50',
                  selected ? 'border-brand ring-2 ring-brand/30' : 'border-gray-200',
                  hasAny && !isFull ? 'hover:bg-gray-50' : 'opacity-50 bg-gray-100 cursor-not-allowed',
                ].join(' ');

                return (
                  <button
                    key={day.toISOString()}
                    className={cn}
                    onClick={() => hasAny && !isFull && setSelectedDate(day)}
                    disabled={!hasAny || isFull}
                    aria-pressed={selected ? 'true' : 'false'}
                  >
                    <span className="font-semibold">{format(day, 'd')}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Slots for selected day */}
      {selectedDate && (
        <div className="card space-y-3">
          <h4 className="text-lg sm:text-xl font-bold">
            {format(selectedDate, 'EEEE, MMM d')}
          </h4>

          {selectedSlots.length ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {selectedSlots.map((t) => {
                const dateParam = format(selectedDate, 'yyyy-MM-dd');
                const label = format(new Date(`${dateParam}T${t}`), 'h:mm a');
                return (
                  <Link
                    key={t}
                    href={{ pathname: '/book', query: { date: dateParam, time: t } }}
                    className="px-3 py-2 rounded-xl border border-gray-300 text-center hover:bg-gray-50"
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-600">No open times for this day.</p>
          )}
        </div>
      )}
    </div>
  );
}
