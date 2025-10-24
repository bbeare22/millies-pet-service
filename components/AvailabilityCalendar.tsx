'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  format,
  addDays,
  getDay,
} from 'date-fns';

// ---- Millie's recurring weekly availability ----
type TimeRange = { start: string; end: string };
type WeeklySchedule = Record<number, TimeRange[]>;

const weeklySchedule: WeeklySchedule = {
  0: [{ start: '09:00', end: '19:00' }], // Sun
  1: [{ start: '09:00', end: '19:00' }], // Mon
  2: [{ start: '19:00', end: '22:00' }], // Tue
  3: [{ start: '19:00', end: '22:00' }], // Wed
  4: [{ start: '19:00', end: '22:00' }], // Thu
  5: [{ start: '19:00', end: '22:00' }], // Fri
  6: [{ start: '09:00', end: '19:00' }], // Sat
};

// Build time slots for each range
function generateSlotsForRanges(ranges: TimeRange[]): string[] {
  const slots: string[] = [];
  for (const r of ranges) {
    const [sh, sm] = r.start.split(':').map(Number);
    const [eh, em] = r.end.split(':').map(Number);
    const stepMinutes = sh <= 9 && eh >= 19 ? 120 : 60; // every 2 hrs for daytime, every hr for evening
    for (let h = sh; h < eh; h += stepMinutes / 60) {
      const hh = String(Math.floor(h)).padStart(2, '0');
      slots.push(`${hh}:00`);
    }
  }
  return slots;
}

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AvailabilityCalendar() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(today));
  const [selectedDate, setSelectedDate] = useState<Date | null>(today);
  const [bookings, setBookings] = useState<any[]>([]);

  // fetch all bookings
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/bookings');
        const data = await res.json();
        setBookings(data.bookings || []);
      } catch (err) {
        console.error('Failed to load bookings', err);
      }
    })();
  }, []);

  // calculate month matrix
  const monthMatrix = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    const days: Date[] = [];
    for (let d = start; d <= end; d = addDays(d, 1)) days.push(d);
    const weeks: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
    return weeks;
  }, [currentMonth]);

  // Determine slots available for the selected date
  function getAvailableSlots(date: Date) {
    const dow = getDay(date);
    const allSlots = generateSlotsForRanges(weeklySchedule[dow] || []);
    if (!allSlots.length) return [];

    const dateStr = format(date, 'yyyy-MM-dd');
    const bookedTimes = bookings
      .filter((b) => b.start?.startsWith(dateStr))
      .map((b) => format(new Date(b.start), 'HH:mm'));

    return allSlots.filter((s) => !bookedTimes.includes(s));
  }

  const selectedSlots = selectedDate ? getAvailableSlots(selectedDate) : [];

  // check if a given date is fully booked
  function isFullyBooked(date: Date) {
    const dow = getDay(date);
    const ranges = weeklySchedule[dow];
    if (!ranges) return true;
    const available = getAvailableSlots(date);
    return available.length === 0;
  }

  return (
    <div className="space-y-6">
      {/* Month header */}
      <div className="flex items-center justify-between gap-3">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="btn-ghost">
          ←
        </button>
        <h2 className="text-xl sm:text-2xl font-extrabold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="btn-ghost">
          →
        </button>
      </div>

      {/* Calendar grid */}
      <div className="card">
        {/* Week labels */}
        <div className="grid grid-cols-7 gap-2 text-xs sm:text-sm font-semibold text-gray-600 mb-2">
          {weekdayLabels.map((w) => (
            <div key={w} className="text-center">{w}</div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-2">
          {monthMatrix.map((week, i) => (
            <div key={i} className="contents">
              {week.map((day) => {
                const inMonth = isSameMonth(day, currentMonth);
                const selected = selectedDate && isSameDay(day, selectedDate);
                const fullyBooked = isFullyBooked(day);
                const style = [
                  'aspect-square rounded-xl p-2 flex flex-col items-center justify-start border text-sm transition',
                  inMonth ? 'bg-white' : 'bg-gray-50',
                  selected ? 'border-brand ring-2 ring-brand/30' : 'border-gray-200',
                  fullyBooked ? 'opacity-50 bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-50',
                ].join(' ');

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => !fullyBooked && setSelectedDate(day)}
                    disabled={fullyBooked}
                    className={style}
                  >
                    <span className="font-semibold">{format(day, 'd')}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Slots below calendar */}
      {selectedDate && (
        <div className="card space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-lg sm:text-xl font-bold">
              {format(selectedDate, 'EEEE, MMM d')}
            </h3>
          </div>

          {selectedSlots.length > 0 ? (
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

