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

type Booking = {
  id: number;
  start: string; // ISO
};

/* ----------------- Weekly availability ------------------
   Sat/Sun/Mon: 06:00–20:30
   Tue–Fri:     18:00–20:30
--------------------------------------------------------- */
type TimeRange = { start: string; end: string };
const WEEKLY: Record<number, TimeRange[]> = {
  0: [{ start: '06:00', end: '20:30' }], // Sun
  1: [{ start: '06:00', end: '20:30' }], // Mon
  2: [{ start: '18:00', end: '20:30' }], // Tue
  3: [{ start: '18:00', end: '20:30' }], // Wed
  4: [{ start: '18:00', end: '20:30' }], // Thu
  5: [{ start: '18:00', end: '20:30' }], // Fri
  6: [{ start: '06:00', end: '20:30' }], // Sat
};

/* ------- Extra time windows (by service type) -----------
   Drop-in (Potty Break): 06:30–20:30
   Walk (Dog Walk):       08:00–19:00
--------------------------------------------------------- */
const EXTRA_WINDOWS: Record<'dropin'|'walk', TimeRange> = {
  dropin: { start: '06:30', end: '20:30' },
  walk:   { start: '08:00', end: '19:00' },
};

/* --------------------- helpers ------------------------- */
function pad2(n: number) { return String(n).padStart(2, '0'); }
function hhmm(date: Date) { return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`; }

function timeToMinutes(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}
function within(t: string, r: TimeRange) {
  const x = timeToMinutes(t);
  return x >= timeToMinutes(r.start) && x <= timeToMinutes(r.end);
}
function rangesToSlots(ranges: TimeRange[], stepMin = 30) {
  const out: string[] = [];
  for (const r of ranges) {
    const start = new Date(2000, 0, 1, +r.start.slice(0, 2), +r.start.slice(3, 5));
    const end   = new Date(2000, 0, 1, +r.end.slice(0, 2),   +r.end.slice(3, 5));
    for (let t = new Date(start); t <= end; t.setMinutes(t.getMinutes() + stepMin)) {
      out.push(hhmm(t));
    }
  }
  return Array.from(new Set(out));
}
function getWeekday(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).getDay(); // 0..6
}
function allowedTimeListForDate(dateStr: string) {
  const wd = getWeekday(dateStr);
  const ranges = WEEKLY[wd] || [];
  return rangesToSlots(ranges, 30);
}
function classifyService(s: Service | null): 'walk' | 'dropin' | 'other' {
  if (!s) return 'other';
  if (s.name.startsWith('Dog Walk')) return 'walk';
  if (s.name.startsWith('Potty Break')) return 'dropin';
  return 'other';
}
function filterByServiceWindow(times: string[], sType: 'walk'|'dropin'|'other') {
  if (sType === 'walk')   return times.filter(t => within(t, EXTRA_WINDOWS.walk));
  if (sType === 'dropin') return times.filter(t => within(t, EXTRA_WINDOWS.dropin));
  return times;
}
/* ------------------------------------------------------- */

export default function BookingForm() {
  const router = useRouter();
  const params = useSearchParams();

  // data
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // form
  const [serviceId, setServiceId] = useState<number | null>(null);
  const [petCount, setPetCount] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // NEW: vaccine confirmation + optional upload
  const [confirmVaccinated, setConfirmVaccinated] = useState(false);
  const [vaccineFileName, setVaccineFileName] = useState<string>('');

  // Prefill from /availability -> /book
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
        const bJson   = bRes.ok ? await bRes.json() : { bookings: [] };

        const list = (svcJson.services || []) as Service[];
        setServices(list);
        setBookings((bJson.bookings || []) as Booking[]);

        // initial service
        let initId: number | null = null;
        if (prefillServiceId) {
          const parsed = Number(prefillServiceId);
          if (Number.isFinite(parsed) && list.some(s => s.id === parsed)) {
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
    () => services.find(s => s.id === serviceId) || null,
    [services, serviceId]
  );
  const serviceType = classifyService(selectedService);

  // pets visibility + limits
  const showPetSelector = useMemo(() => {
    if (!selectedService) return false;
    return selectedService.name.startsWith('Dog Walk')
        || selectedService.name.startsWith('Boarding')
        || selectedService.name.startsWith('Sitting');
  }, [selectedService]);

  const maxPets = useMemo(() => {
    if (!selectedService) return 1;
    if (selectedService.name.startsWith('Dog Walk')) return 2;
    if (selectedService.name.startsWith('Boarding')) return 4;
    if (selectedService.name.startsWith('Sitting'))  return 4;
    return 1;
  }, [selectedService]);

  useEffect(() => {
    if (petCount > maxPets) setPetCount(maxPets);
    if (petCount < 1) setPetCount(1);
  }, [maxPets, petCount]);

  // price calc (same rules you had)
  function computeTotalCents(s: Service | null, pets: number): number {
    if (!s) return 0;
    if (s.name.startsWith('Dog Walk')) {
      if (pets <= 1) return s.priceCents;
      if (s.name.includes('(20')) return 2550;
      if (s.name.includes('(30')) return 3900;
      if (s.name.includes('(60')) return 4800;
      return s.priceCents;
    }
    if (s.name.startsWith('Boarding')) {
      const extras = Math.max(0, Math.min(pets - 1, 3));
      return 2500 + extras * 1800;
    }
    if (s.name.startsWith('Sitting')) {
      const extras = Math.max(0, pets - 1);
      return 3000 + extras * 2300;
    }
    return s.priceCents;
  }
  const totalCents = computeTotalCents(selectedService, petCount);
  const totalDisplay = `$${(totalCents / 100).toFixed(2)}`;

  // allowed times for chosen date, intersected with service window
  const allowedTimesBase = useMemo(() => (startDate ? allowedTimeListForDate(startDate) : []), [startDate]);
  const allowedTimes = useMemo(
    () => filterByServiceWindow(allowedTimesBase, serviceType),
    [allowedTimesBase, serviceType]
  );

  // block booking if slot already booked
  function slotIsBooked(dateStr: string, timeStr: string) {
    if (!dateStr || !timeStr) return false;
    return bookings.some(b => {
      if (!b.start?.startsWith(dateStr)) return false;
      return hhmm(new Date(b.start)) === timeStr;
    });
  }

  const timeMin = allowedTimes[0];
  const timeMax = allowedTimes[allowedTimes.length - 1];

  function combineDateTime(date: string, time: string) {
    if (!date || !time) return null;
    const iso = new Date(`${date}T${time}`);
    if (Number.isNaN(iso.getTime())) return null;
    return iso.toISOString();
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);

    if (!startDate || !startTime) {
      setMessage('Please choose a date and time.');
      return;
    }

    if (!confirmVaccinated) {
      setMessage('Please confirm your dog(s) are vaccinated before booking.');
      return;
    }

    // Validate against weekly + service window (client side)
    if (!allowedTimes.includes(startTime)) {
      setMessage('Selected time is not available for this service.');
      return;
    }
    if (slotIsBooked(startDate, startTime)) {
      setMessage('That slot has just been booked. Please pick another time.');
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
    const vaccineLine = `Vaccinations confirmed. ${vaccineFileName ? `Proof file: ${vaccineFileName}.` : 'No proof file uploaded.'}`;
    const notes = [baseNotes, petsLine, vaccineLine].filter(Boolean).join('\n');

    const payload = {
      serviceId,
      customerName: fd.get('customerName'),
      email: fd.get('email'),
      phone: fd.get('phone'),
      start: startISO,
      notes,
      petCount,
      estimatedTotalCents: totalCents,
      confirmVaccinated: true,
      vaccineProofName: vaccineFileName || null,
    };

    try {
      setSubmitting(true);
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let body: any = {};
      try { body = await res.json(); } catch {}

      if (res.ok) {
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
          onChange={(e) => {
            setServiceId(Number(e.target.value));
            // if current time now invalid for new service type, clear it
            if (startTime && !filterByServiceWindow(
                allowedTimesBase,
                classifyService(services.find(s => s.id === Number(e.target.value)) || null
              )).includes(startTime)) {
              setStartTime('');
            }
            setMessage(null);
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
            <label className="label" htmlFor="petCount">How many pets?</label>
            <select
              id="petCount"
              className="input min-h-12"
              value={petCount}
              onChange={(e) => setPetCount(Number(e.target.value))}
            >
              {Array.from({ length: maxPets }, (_, i) => i + 1).map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            {selectedService?.name.startsWith('Dog Walk') && (
              <p className="mt-1 text-xs text-gray-600">Walks support up to 2 dogs with special 2-dog pricing.</p>
            )}
            {selectedService?.name.startsWith('Boarding') && (
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
            <input
              id="startDate"
              name="startDate"
              type="date"
              required
              className="input min-h-12"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setMessage(null); }}
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
              value={startTime}
              min={timeMin}
              max={timeMax}
              step={60 * 30}
              onChange={(e) => { setStartTime(e.target.value); setMessage(null); }}
              onFocus={scrollIntoViewCentered}
            />
            {startDate && (
              <p className="mt-1 text-xs text-gray-600">
                Allowed times for this service: {allowedTimes.length ? `${allowedTimes[0]} — ${allowedTimes[allowedTimes.length - 1]} (30m steps)` : '—'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="label" htmlFor="notes">Notes (optional)</label>
        <textarea id="notes" name="notes" className="input" rows={4} placeholder="Gate code, pup preferences, etc." />
      </div>

      {/* Vaccine Requirement + Upload */}
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
        <p className="font-semibold mb-1">🐾 Vaccine Requirement</p>
        <p className="mb-3">
          Dogs must be vaccinated for <strong>Rabies</strong>, <strong>Distemper</strong>, and <strong>Bordetella</strong>.
        </p>

        <label className="inline-flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            className="h-4 w-4 accent-amber-600"
            checked={confirmVaccinated}
            onChange={(e) => setConfirmVaccinated(e.target.checked)}
            aria-required="true"
          />
          <span>I confirm my dog(s) are vaccinated.</span>
        </label>

        <div className="mt-2">
          <label className="label" htmlFor="vaccineProof">Upload proof (optional)</label>
          <input
            id="vaccineProof"
            name="vaccineProof"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            className="input min-h-12"
            onChange={(e) => setVaccineFileName(e.currentTarget.files?.[0]?.name || '')}
          />
          {vaccineFileName && (
            <p className="text-xs text-gray-600 mt-1">Selected: {vaccineFileName}</p>
          )}
        </div>
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
