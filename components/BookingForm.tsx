'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type Service = {
  id: number;
  name: string;
  description: string;
  priceCents: number;
  durationMin: number;
  isActive: boolean;
};

export default function BookingForm() {
  const router = useRouter();
  const params = useSearchParams();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // form state
  const [serviceId, setServiceId] = useState<number | null>(null);
  const [petCount, setPetCount] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/services', { cache: 'no-store' });
        const data = await res.json();
        const list = (data.services || []) as Service[];
        setServices(list);
        if (list.length && serviceId == null) setServiceId(list[0].id);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Prefill from calendar (?date=YYYY-MM-DD&time=HH:mm)
  useEffect(() => {
    const d = params.get('date');
    const t = params.get('time');
    if (d) setStartDate(d);
    if (t) setStartTime(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // helpers
  function combineDateTime(date: string, time: string) {
    if (!date || !time) return null;
    const iso = new Date(`${date}T${time}`);
    if (Number.isNaN(iso.getTime())) return null;
    return iso.toISOString();
  }

  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId) || null,
    [services, serviceId]
  );

  // classify service names
  function isWalk(s: Service | null) {
    return !!s?.name.startsWith('Dog Walk');
  }
  function isOvernightBoarding(s: Service | null) {
    return !!s?.name.startsWith('Boarding');
  }
  function isOvernightSitting(s: Service | null) {
    return !!s?.name.startsWith('Sitting');
  }
  function isPottyBreak(s: Service | null) {
    return !!s?.name.startsWith('Potty Break');
  }
  function isAddon(s: Service | null) {
    return !!s && (s.durationMin ?? 0) === 0;
  }

  // pet selector visibility + limits
  const showPetSelector = useMemo(() => {
    if (!selectedService) return false;
    return isWalk(selectedService) || isOvernightBoarding(selectedService) || isOvernightSitting(selectedService);
  }, [selectedService]);

  const maxPets = useMemo(() => {
    if (!selectedService) return 1;
    if (isWalk(selectedService)) return 2; // capped at 2 (special pricing given)
    if (isOvernightBoarding(selectedService)) return 4; // “up to 3 additional”
    if (isOvernightSitting(selectedService)) return 4; // reasonable default
    return 1;
  }, [selectedService]);

  useEffect(() => {
    if (petCount > maxPets) setPetCount(maxPets);
    if (petCount < 1) setPetCount(1);
  }, [maxPets]); // adjust when switching services

  // price calculation
  function computeTotalCents(s: Service | null, pets: number): number {
    if (!s) return 0;

    // Walks: 2-dog special prices
    if (isWalk(s)) {
      if (pets <= 1) return s.priceCents;
      // duration in name: "(20 min)", "(30 min)", "(60 min)"
      if (s.name.includes('(20')) return 2550;
      if (s.name.includes('(30')) return 3900;
      if (s.name.includes('(60')) return 4800;
      return s.priceCents; // fallback
    }

    // Overnight boarding: $25 + $18 per extra (up to 3 additional)
    if (isOvernightBoarding(s)) {
      const extras = Math.max(0, Math.min(pets - 1, 3));
      return 2500 + extras * 1800;
    }

    // Overnight sitting: $30 + $23 per extra
    if (isOvernightSitting(s)) {
      const extras = Math.max(0, pets - 1);
      return 3000 + extras * 2300;
    }

    // Potty breaks & add-ons: flat
    return s.priceCents;
  }

  const totalCents = computeTotalCents(selectedService, petCount);
  const totalDisplay = `$${(totalCents / 100).toFixed(2)}`;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);

    const startISO = combineDateTime(startDate, startTime);
    if (!startISO) {
      setMessage('Please choose a valid date and time.');
      return;
    }

    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);

    // stitch notes with a pets line so the API stores it even if it ignores custom fields
    const baseNotes = String(fd.get('notes') || '').trim();
    const petsLine = `Pets: ${petCount}${selectedService ? ` (${selectedService.name})` : ''}. Estimated total: ${totalDisplay}.`;
    const notes = baseNotes ? `${baseNotes}\n${petsLine}` : petsLine;

    const payload = {
      serviceId,                                 // number | null
      customerName: fd.get('customerName'),
      email: fd.get('email'),
      phone: fd.get('phone'),
      start: startISO,
      notes,
      petCount,                                  // extra info (server can ignore safely)
      estimatedTotalCents: totalCents,           // extra info
    };

    try {
      setSubmitting(true);
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // don’t crash UX if body isn’t JSON
      try {
        await res.json();
      } catch {}

      if (res.ok) {
        router.push('/book/thank-you');
      } else {
        setMessage('Something went wrong. Please try again.');
      }
    } catch {
      setMessage('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function scrollIntoViewCentered(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  if (loading) return <p>Loading...</p>;

  return (
    <form onSubmit={onSubmit} className="card space-y-4" aria-live="polite">
      {/* Service */}
      <div>
        <label className="label" htmlFor="serviceId">Service</label>
        <select
          id="serviceId"
          name="serviceId"
          required
          className="input min-h-12"
          value={serviceId ?? undefined}
          onChange={(e) => setServiceId(Number(e.target.value))}
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

      {/* Pets (only for Walks/Overnights) */}
      {showPetSelector && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="petCount">How many pets?</label>
            <select
              id="petCount"
              className="input min-h-12"
              value={petCount}
              onChange={(e) => setPetCount(Number(e.target.value))}
            >
              {Array.from({ length: maxPets }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            {isWalk(selectedService) && (
              <p className="mt-1 text-xs text-gray-600">Walks support up to 2 dogs with special 2-dog pricing.</p>
            )}
            {isOvernightBoarding(selectedService) && (
              <p className="mt-1 text-xs text-gray-600">Up to 3 additional dogs. Pets must be picked up by 11:59pm.</p>
            )}
          </div>
        </div>
      )}

      {/* Customer info */}
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

      {/* Phone + date/time */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="phone">Phone</label>
          <input id="phone" name="phone" required className="input min-h-12" placeholder="(719) 555-1234" autoComplete="tel" inputMode="tel" minLength={7} maxLength={25} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="startDate">Date</label>
            <input id="startDate" name="startDate" type="date" required className="input min-h-12" value={startDate} onChange={(e) => setStartDate(e.target.value)} onFocus={scrollIntoViewCentered} />
          </div>
          <div>
            <label className="label" htmlFor="startTime">Time</label>
            <input id="startTime" name="startTime" type="time" required className="input min-h-12" value={startTime} onChange={(e) => setStartTime(e.target.value)} onFocus={scrollIntoViewCentered} />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="label" htmlFor="notes">Notes (optional)</label>
        <textarea id="notes" name="notes" className="input" rows={4} placeholder="Gate code, pup preferences, etc." />
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
        <div className="mt-2 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-800 p-3" role="status">
          {message}
        </div>
      )}
    </form>
  );
}
