'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  isSameMonth, isSameDay, format, addDays, getDay
} from 'date-fns';

type TimeRange = { start: string; end: string };
type WeeklySchedule = Record<number, TimeRange[]>;
type Mode = 'walks' | 'overnight';

// Walks & Drop-ins: Tue–Fri after 6pm; Sat/Sun/Mon all day (9–19 for nice slots)
const walks: WeeklySchedule = {
  0: [{ start: '06:30', end: '21:00' }], // Sun
  1: [{ start: '06:30', end: '21:00' }], // Mon
  2: [{ start: '18:00', end: '23:59' }], // Tue
  3: [{ start: '18:00', end: '23:59' }], // Wed
  4: [{ start: '18:00', end: '23:59' }], // Thu
  5: [{ start: '18:00', end: '23:59' }], // Fri
  6: [{ start: '06:30', end: '21:00' }], // Sat
};

// Overnight (Sitting/Boarding): Fri after 6pm; Sat/Sun/Mon all day.
// Note: pets must be picked up by 11:59pm (shown as a note).
const overnight: WeeklySchedule = {
  0: [{ start: '09:00', end: '23:59' }], // Sun
  1: [{ start: '09:00', end: '23:59' }], // Mon
  2: [],                                  // Tue
  3: [],                                  // Wed
  4: [],                                  // Thu
  5: [{ start: '19:00', end: '23:59' }], // Fri
  6: [{ start: '09:00', end: '23:59' }], // Sat
};

function rangesToSlots(ranges: TimeRange[], isOvernight: boolean) {
  const out: string[] = [];
  for (const r of ranges) {
    const stepMin = isOvernight ? 240 : 60; // fewer options for overnight
    const start = new Date(2000, 0, 1, +r.start.slice(0, 2), +r.start.slice(3, 5));
    const end   = new Date(2000, 0, 1, +r.end.slice(0, 2),   +r.end.slice(3, 5));
    for (let t = new Date(start); t < end; t.setMinutes(t.getMinutes() + stepMin)) {
      const hh = String(t.getHours()).padStart(2, '0');
      const mm = String(t.getMinutes()).padStart(2, '0');
      out.push(`${hh}:${mm}`);
    }
  }
  return out;
}

export default function AvailabilityCalendar() {
  const today = new Date();
  const [mode, setMode] = useState<Mode>('walks');
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(today));
  const [selectedDate, setSelectedDate] = useState<Date | null>(today);
  const [bookings, setBookings] = useState<{id:number;start:string}[]>([]);

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

  const schedule = mode === 'overnight' ? overnight : walks;

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
    return rangesToSlots(schedule[getDay(date)] || [], mode === 'overnight');
  }

  function availableSlots(date: Date) {
    const slots = daySlots(date);
    if (!slots.length) return [];
    const dateStr = format(date, 'yyyy-MM-dd');
    const booked = bookings
      .filter((b) => b.start?.startsWith(dateStr))
      .map((b) => format(new Date(b.start), 'HH:mm'));
    return slots.filter((s) => !booked.includes(s));
  }

  function fullyBooked(date: Date) {
    const all = daySlots(date);
    return all.length > 0 && availableSlots(date).length === 0;
  }

  const selectedSlots = selectedDate ? availableSlots(selectedDate) : [];

  return (
    <div className="space-y-6">
      {/* mode toggle */}
      <div className="inline-flex rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <button
          className={`px-4 py-2 text-sm ${mode === 'walks' ? 'bg-brand text-white' : 'hover:bg-gray-50'}`}
          onClick={() => setMode('walks')}
        >
          Walks & Drop-ins
        </button>
        <button
          className={`px-4 py-2 text-sm border-l border-gray-200 ${mode === 'overnight' ? 'bg-brand text-white' : 'hover:bg-gray-50'}`}
          onClick={() => setMode('overnight')}
        >
          Overnight (Sitting/Boarding)
        </button>
      </div>

      {/* month controls */}
      <div className="flex items-center justify-between">
        <button className="btn-ghost" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>←</button>
        <h2 className="text-xl sm:text-2xl font-extrabold">{format(currentMonth, 'MMMM yyyy')}</h2>
        <button className="btn-ghost" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>→</button>
      </div>

      {/* calendar */}
      <div className="card">
        <div className="grid grid-cols-7 gap-2 text-xs sm:text-sm font-semibold text-gray-600 mb-2">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (<div key={d} className="text-center">{d}</div>))}
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

      {/* slots for selected day */}
      {selectedDate && (
        <div className="card space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-lg sm:text-xl font-bold">{format(selectedDate, 'EEEE, MMM d')}</h3>
            {mode === 'overnight' && (
              <p className="text-xs sm:text-sm text-gray-600">
                Pets must be picked up by 11:59pm.
              </p>
            )}
          </div>

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
