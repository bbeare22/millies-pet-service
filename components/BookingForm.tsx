'use client';
import { useEffect, useState } from 'react';

export default function BookingForm() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/services');
        const data = await res.json();
        setServices(data.services || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Helper: combine date + time into ISO string
  function combineDateTime(date: string, time: string) {
    // guard
    if (!date || !time) return null;
    const iso = new Date(`${date}T${time}`);
    if (Number.isNaN(iso.getTime())) return null;
    return iso.toISOString();
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
      // send ISO string; server will new Date(start)
      start: startISO,
      notes: fd.get('notes') || ''
    };

    setMessage(null);
    const res = await fetch('/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (res.ok) {
      setMessage('Success! Your request was submitted. We will confirm by email/text.');
      form.reset();
    } else {
      setMessage(data.error || 'Something went wrong.');
    }
  }

  // Smoothly center the calendar when it opens (desktop convenience)
  function scrollIntoViewCentered(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  if (loading) return <p>Loading...</p>;

  return (
    <form onSubmit={onSubmit} className="card space-y-4">
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
          <input id="customerName" name="customerName" required className="input min-h-12" placeholder="Jane Doe" autoComplete="name" />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" name="email" required className="input min-h-12" placeholder="jane@email.com" autoComplete="email" inputMode="email" />
        </div>
      </div>

      {/* Split date & time for better mobile/desktop behavior */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="phone">Phone</label>
          <input
            id="phone"
            name="phone"
            required
            className="input min-h-12"
            placeholder="+1 719 555 1234"
            autoComplete="tel"
            inputMode="tel"
            pattern="^[0-9+() -]{7,}$"
          />
        </div>

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

      <button className="btn w-full sm:w-auto" type="submit">Request Booking</button>
      {message && <p className="text-sm text-gray-700">{message}</p>}
    </form>
  );
}
