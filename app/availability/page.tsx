'use client';
import { useState } from 'react';
import { addDays, format } from 'date-fns';

export const metadata = { title: 'Availability' };

const slots = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"];

export default function AvailabilityPage() {
  const [d] = useState(new Date());
  const days = Array.from({ length: 7 }, (_, i) => addDays(d, i));

  return (
    <div className="py-10 space-y-6">
      <h1 className="text-3xl font-bold">Availability</h1>
      <p className="text-gray-600">Request any open time. Actual confirmation will be sent after review.</p>
      <div className="grid md:grid-cols-3 gap-6">
        {days.map(day => (
          <div key={String(day)} className="card">
            <h3 className="font-semibold mb-3">{format(day, 'EEEE, MMM d')}</h3>
            <div className="flex flex-wrap gap-2">
              {slots.map(s => (
                <a key={s} href={`/book?date=${format(day, 'yyyy-MM-dd')}&time=${s}`} className="px-3 py-1 rounded-xl border hover:bg-gray-50">{s}</a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}