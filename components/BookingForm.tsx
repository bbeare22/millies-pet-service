'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BookingForm() {
  const router = useRouter();

  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/services', { cache: 'no-store' });
        const data = await res.json();
        setServices(data.services || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Combine date + time to ISO string
  function combineDateTime(date: string, time: string) {
    if (!date || !time) return null;
    const iso = new Date(`${date}T${time}`);
    if (Number.isNaN(iso.getTime())) return null;
    return iso.toISOString();
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);

    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);

    const startDate = String(fd.get('startDate') || '');
    const startTime = String(fd.get('startTime') || '');
    const startISO = combineDateTime(startDate, startTime);

    if (!startISO) {
      setMessage('Please choose a valid date and time.');
      return;
    }

    const payload = {
      serviceId: fd.get('serviceId'),
      customerName: fd.get('customerName'),
      email: fd.get('email'),
      phone: fd.get('phone'),
      start: startISO,
      notes: fd.get('notes') || ''
    };

    try {
      setSubmitting(true);
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // If the API returns JSON, try to parse it (but don't crash the UX if it doesn't)
      let data: any = {};
      try { data = await res.json(); } catch {}

      if (res.ok) {
        // Hard confirmation so users always see success
        router.push('/book/thank-you');
      } else {
        setMessage(data?.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setMessage('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // Keeps pickers visible when focusing on small screens
  function scrollIntoViewCentered(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  if (loading) return <p>Loading...</p>;

  return (
    <form onSubmit={onSubmit} className="card space-y-4" aria-live="polite">
      <div>
        <label className="label" htmlFor="serviceId">Service</label>
        <select id="serviceId" name="serviceId" required className="input min-h-12">
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — ${(s.priceCents / 100).toFixed(2)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="customerName">Your Name</label>
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
          <label className="label" htmlFor="email">Email</label>
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="phone">Phone</label>
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

        {/* Split date and time to avoid oversized datetime picker */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="startDate">Date</label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              required
              className="input min-h-12"
              onFocus={scrollIntoViewCentered}
            />
          </div>
          <div>
            <label className="label" htmlFor="startTime">Time</label>
            <input
              id="startTime"
              name="startTime"
              type="time"
              required
              className="input min-h-12"
              onFocus={scrollIntoViewCentered}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="notes">Notes (optional)</label>
        <textarea id="notes" name="notes" className="input" rows={4} placeholder="Gate code, pup preferences, etc." />
      </div>

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
