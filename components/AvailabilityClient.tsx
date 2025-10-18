'use client';

import { useState } from 'react';
import { addDays, format } from 'date-fns';
import Link from 'next/link';

const slots = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"];

export default function AvailabilityClient() {
  const [dayOffset, setDayOffset] = useState(0);
  const day = addDays(new Date(), dayOffset);

  const yyyyMmDd = format(day, 'yyyy-MM-dd');
  const friendly = format(day, 'EEEE, MMM d');

  return (
    <div className="space-y-6">
      {/* Day picker */}
      <div className="flex items-center gap-3">
        <button
          className="btn-ghost"
          onClick={() => setDayOffset(o => Math.max(0, o - 1))}
          disabled={dayOffset === 0}
        >
          ← Previous
        </button>
        <div className="font-semibold">{friendly}</div>
        <button className="btn" onClick={() => setDayOffset(o => o + 1)}>
          Next →
        </button>
      </div>

      {/* Slots */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {slots.map((t) => {
          const label = format(new Date(`${yyyyMmDd}T${t}`), 'h:mm a');
          return (
            <Link
              key={t}
              href={{ pathname: '/book', query: { date: yyyyMmDd, time: t } }}
              className="px-3 py-2 rounded-xl border border-gray-300 text-center hover:bg-gray-50"
            >
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
