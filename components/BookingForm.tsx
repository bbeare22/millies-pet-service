'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type Service = {
  id: number;
  name: string;
  description: string | null;
  priceCents: number;
  durationMin: number;
  isActive: boolean;
};

type Booking = { id: number; start: string };

type SType = 'walk' | 'dropin' | 'overnightBoarding' | 'overnightSitting' | 'addon' | 'other';
type TimeRange = { start: string; end: string };
type DayWindows = { weekend: TimeRange[]; weekday: TimeRange[] };
type HM = `${number}:${number}`;

/** Availability (client): */
const WINDOWS: Record<'walk'|'dropin'|'overnight'|'addon', DayWindows> = {
  walk: {
    weekend: [{ start: '08:00', end: '19:30' }],
    weekday: [{ start: '18:30', end: '19:30' }],
  },
  dropin: {
    weekend: [{ start: '08:00', end: '20:30' }],
    weekday: [{ start: '18:30', end: '20:30' }],
  },
  overnight: {
    // Only Fri/Sat/Sun are allowed for new overnight starts. (Pickups can be Mon 11:59pm.)
    weekend: [{ start: '06:30', end: '20:30' }], // used for Sat/Sun display when relevant
    weekday: [{ start: '18:00', end: '20:30' }], // only for Friday (see day filter below)
  },
  addon: {
    weekend: [{ start: '08:00', end: '20:30' }],
    weekday: [{ start: '18:30', end: '20:30' }],
  },
};

const SERVICE_TO_KEY: Record<SType, 'walk'|'dropin'|'overnight'|'addon'|null> = {
  walk: 'walk',
  dropin: 'dropin',
  overnightBoarding: 'overnight',
  overnightSitting: 'overnight',
  addon: 'addon',
  other: null,
};

function pad2(n: number) { return String(n).padStart(2, '0'); }
function hhmm(date: Date): HM { return `${pad2(date.getHours())}:${pad2(date.getMinutes())}` as HM; }
function timeToMinutes(t: string) { const [h, m] = t.split(':').map(Number); return h*60+m; }
function rangesToSlots(ranges: TimeRange[], step = 30): HM[] {
  const out: HM[] = [];
  for (const r of ranges) {
    const a = new Date(2000,0,1,+r.start.slice(0,2),+r.start.slice(3,5));
    const b = new Date(2000,0,1,+r.end.slice(0,2),+r.end.slice(3,5));
    for (let t = new Date(a); t <= b; t.setMinutes(t.getMinutes()+step)) {
      out.push(hhmm(t));
    }
  }
  return Array.from(new Set(out));
}
function getWeekday(dateStr: string) { return new Date(`${dateStr}T00:00:00`).getDay(); } // 0..6

function classify(s: Service | null): SType {
  if (!s) return 'other';
  const n = s.name.toLowerCase();
  if (n.startsWith('dog walk')) return 'walk';
  if (n.startsWith('drop-in') || n.startsWith('drop in') || n.startsWith('potty break')) return 'dropin';
  if (n.startsWith('boarding')) return 'overnightBoarding';
  if (n.startsWith('sitting')) return 'overnightSitting';
  if (n.startsWith('add-on') || n.startsWith('addon') || n.includes('add-on')) return 'addon';
  return 'other';
}

/** returns allowed windows for (service, weekday) with special rule for overnights */
function windowsFor(sType: SType, wd: number): TimeRange[] {
  const key = SERVICE_TO_KEY[sType];
  if (!key) return [];
  // Overnights: only Fri/Sat/Sun starts (5,6,0). Friday uses "weekday" (18:00–20:30), Sat/Sun use "weekend".
  if (key === 'overnight') {
    if (wd === 5) return WINDOWS.overnight.weekday;  // Fri
    if (wd === 6 || wd === 0) return WINDOWS.overnight.weekend; // Sat/Sun
    return []; // no Tue–Thu or Monday starts
  }
  // Walks/Drop-ins/Add-ons use Sat–Mon “weekend”, Tue–Fri “weekday”
  const weekendDays = (wd === 6 || wd === 0 || wd === 1);
  const set = WINDOWS[key];
  return weekendDays ? set.weekend : set.weekday;
}

export default function BookingForm() {
  const router = useRouter();
  const params = useSearchParams();

  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const [serviceId, setServiceId] = useState<number | null>(null);
  const [petCount, setPetCount] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState<HM | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Add-ons (checklist)
  const [addonMeds, setAddonMeds] = useState(false);
  const [addonPickup, setAddonPickup] = useState(false);

  // Vaccines
  const [vaxAck, setVaxAck] = useState(false);
  const [vaxFile, setVaxFile] = useState<File | null>(null);

  // Weather acknowledgement
  const [weatherAck, setWeatherAck] = useState(false);

  // Prefill
  const prefillServiceId = params.get('serviceId');
  const prefillDate = params.get('date');
  const prefillTime = params.get('time');

  useEffect(() => {
    (async () => {
      try {
        const [svcRes, bRes] = await Promise.all([
          fetch('/api/services', { cache: 'no-store' }),
          fetch('/api/bookings', { cache: 'no-store' }),
        ]);
        const svc = await svcRes.json();
        const b = bRes.ok ? await bRes.json() : { bookings: [] };
        setServices(svc.services || []);
        setBookings(b.bookings || []);

        let init: number | null = null;
        if (prefillServiceId) {
          const parsed = Number(prefillServiceId);
          if (Number.isFinite(parsed) && (svc.services || []).some((s: Service) => s.id === parsed)) init = parsed;
        }
        if (init == null && (svc.services || []).length) init = (svc.services[0] as Service).id;
        setServiceId(init);

        if (prefillDate) setStartDate(prefillDate);
        if (prefillTime) setStartTime(prefillTime as HM);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = useMemo(() => services.find(s => s.id === serviceId) || null, [services, serviceId]);
  const sType = classify(selected);

  // Show pet selector only for Walks / Overnight
  const showPetSelector =
    !!selected &&
    (selected.name.startsWith('Dog Walk') || selected.name.startsWith('Boarding') || selected.name.startsWith('Sitting'));
  const maxPets =
    selected?.name.startsWith('Dog Walk')
      ? 2
      : selected && (selected.name.startsWith('Boarding') || selected.name.startsWith('Sitting'))
      ? 3
      : 1;
  useEffect(() => { if (petCount > maxPets) setPetCount(maxPets); }, [maxPets, petCount]);

  // Price calc incl. add-ons
  function priceCents(s: Service | null, pets: number) {
    if (!s) return 0;
    let base = s.priceCents;
    if (s.name.startsWith('Dog Walk')) {
      if (pets > 1) {
        if (s.name.includes('(20')) base = 2550;
        else if (s.name.includes('(30')) base = 3900;
        else if (s.name.includes('(60')) base = 4800;
      }
    } else if (s.name.startsWith('Boarding')) {
      const extras = Math.max(0, Math.min(pets - 1, 3));
      base = 2500 + extras * 1800;
    } else if (s.name.startsWith('Sitting')) {
      const extras = Math.max(0, pets - 1);
      base = 3000 + extras * 2300;
    }
    // add-ons
    if (addonMeds) base += 500;
    if (addonPickup) base += 700;
    return base;
  }
  const totalCents = priceCents(selected, petCount);
  const totalDisplay = `$${(totalCents/100).toFixed(2)}`;

  const allowedTimes = useMemo(() => {
    if (!startDate) return [] as HM[];
    const wd = getWeekday(startDate);
    const windows = windowsFor(sType, wd);
    return rangesToSlots(windows, 30);
  }, [sType, startDate]);

  const timeMin = allowedTimes[0];
  const timeMax = allowedTimes[allowedTimes.length - 1];

  function slotTaken(dateStr: string, timeStr: string) {
    return bookings.some(b => b.start?.startsWith(dateStr) && hhmm(new Date(b.start)) === timeStr);
  }

  function combine(date: string, time: string) {
    if (!date || !time) return null;
    const d = new Date(`${date}T${time}`); if (Number.isNaN(d.getTime())) return null;
    d.setSeconds(0,0);
    return d.toISOString();
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);

    if (!serviceId) return setMessage('Please choose a service.');
    if (!startDate || !startTime) return setMessage('Please choose a date and time.');
    if (!vaxAck) return setMessage('Please confirm your pet’s vaccinations are current.');
    if (!weatherAck) return setMessage('Please acknowledge the inclement weather policy.');

    // validate window & conflicts
    if (!allowedTimes.includes(startTime)) return setMessage('Selected time is not available for this service.');
    if (slotTaken(startDate, startTime)) return setMessage('That slot has just been booked. Please choose another time.');

    const iso = combine(startDate, startTime);
    if (!iso) return setMessage('Please choose a valid date/time.');

    const fd = new FormData(e.currentTarget);
    const baseNotes = String(fd.get('notes') || '').trim();
    const lines = [
      `Pets: ${petCount}${selected ? ` (${selected.name})` : ''}`,
      addonMeds ? 'Add-on: Administration of Meds' : '',
      addonPickup ? 'Add-on: Pickup/Drop-off (each way, up to 10 miles)' : '',
      'Weather policy acknowledged',
      `Estimated total: ${totalDisplay}`,
    ].filter(Boolean);

    const notes = baseNotes ? `${baseNotes}\n${lines.join('\n')}` : lines.join('\n');

    const payload = {
      serviceId,
      customerName: fd.get('customerName'),
      email: fd.get('email'),
      phone: fd.get('phone'),
      start: iso,
      notes,
      petCount,
      estimatedTotalCents: totalCents,
      // NOTE: vaxFile is not uploaded yet; backend to be implemented later.
    };

    try {
      setSubmitting(true);
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      let body: any = {}; try { body = await res.json(); } catch {}

      if (res.ok) {
        try { localStorage.setItem('booking-created', String(Date.now())); } catch {}
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

  // Filter service dropdown to EXCLUDE add-ons (they are checkboxes)
  const serviceOptions = services.filter(s => !s.name.toLowerCase().startsWith('add-on'));

  return (
    <form onSubmit={onSubmit} className="card space-y-4" aria-live="polite">
      {/* Service (no add-ons here) */}
      <div>
        <label className="label" htmlFor="serviceId">Service</label>
        <select
          id="serviceId"
          name="serviceId"
          required
          className="input min-h-12"
          value={serviceId ?? undefined}
          onChange={(e) => {
            const nextId = Number(e.target.value);
            setServiceId(nextId);
            setMessage(null);
            if (startDate && startTime) {
              const wd = getWeekday(startDate);
              const nextType = classify(services.find(s => s.id === nextId) || null);
              const newAllowed = rangesToSlots(windowsFor(nextType, wd), 30);
              if (!newAllowed.includes(startTime)) setStartTime('');
            }
          }}
        >
          {serviceOptions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — ${(s.priceCents / 100).toFixed(2)}
            </option>
          ))}
        </select>
        {selected?.description && (
          <p className="mt-1 text-xs text-gray-600">{selected.description}</p>
        )}
      </div>

      {/* Add-ons (optional) */}
      <div>
        <label className="label">Add-ons (optional)</label>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="inline-flex items-center gap-2 rounded-xl border border-gray-200 p-2">
            <input type="checkbox" checked={addonMeds} onChange={(e) => setAddonMeds(e.target.checked)} />
            <span>Administration of Meds — $5.00</span>
          </label>
          <label className="inline-flex items-center gap-2 rounded-xl border border-gray-200 p-2">
            <input type="checkbox" checked={addonPickup} onChange={(e) => setAddonPickup(e.target.checked)} />
            <span>Pickup/Drop-off (each way, up to 10 miles) — $7.00</span>
          </label>
        </div>
      </div>

      {/* Pets (walks/overnight) */}
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
              id="startDate" name="startDate" type="date" required className="input min-h-12"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setMessage(null);
                if (startTime && e.target.value) {
                  const wd = getWeekday(e.target.value);
                  const newAllowed = rangesToSlots(windowsFor(sType, wd), 30);
                  if (!newAllowed.includes(startTime)) setStartTime('');
                }
              }}
              onFocus={scrollIntoViewCentered}
            />
          </div>
          <div>
            <label className="label" htmlFor="startTime">Time</label>
            <input
              id="startTime" name="startTime" type="time" required className="input min-h-12"
              value={startTime} min={timeMin} max={timeMax} step={60*30}
              onChange={(e) => { setStartTime(e.target.value as HM); setMessage(null); }}
              onFocus={scrollIntoViewCentered}
            />
            {startDate && (
              <p className="mt-1 text-xs text-gray-600">
                Allowed times: {allowedTimes.length ? `${allowedTimes[0]} — ${allowedTimes[allowedTimes.length - 1]} (30m steps)` : '—'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="label" htmlFor="notes">Notes (optional)</label>
        <textarea id="notes" name="notes" className="input" rows={4} placeholder="Gate code, pet preferences, etc." />
      </div>

      {/* Vaccination acknowledgement + upload */}
      <div className="space-y-2">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm">
          Pets must be vaccinated for <strong>Rabies</strong>, <strong>Distemper</strong>, and <strong>Bordetella</strong>. By checking below, you confirm your pet’s vaccines are current.
        </div>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" className="h-4 w-4" checked={vaxAck} onChange={(e) => setVaxAck(e.target.checked)} />
          <span className="text-sm">I confirm required vaccinations are current.</span>
        </label>
        <div>
          <label className="label" htmlFor="vax">Upload vaccine records</label>
          <input id="vax" type="file" accept="image/*,application/pdf" className="input" onChange={(e) => setVaxFile(e.target.files?.[0] ?? null)} />
          {vaxFile && <p className="text-xs mt-1 text-gray-600">Selected: {vaxFile.name}</p>}
        </div>
      </div>

      {/* Weather acknowledgement */}
      <div className="space-y-2">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          In cases of inclement weather, services may be <strong>adjusted, rescheduled, or cancelled</strong> for safety. Please acknowledge this policy before submitting your request.
        </div>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={weatherAck}
            onChange={(e) => setWeatherAck(e.target.checked)}
          />
          <span className="text-sm">I understand the inclement weather policy.</span>
        </label>
      </div>

      {/* Price summary */}
      <div className="rounded-xl bg-gray-50 border border-gray-200 p-3 text-sm flex items-center justify-between">
        <span className="text-gray-700">Estimated total for this visit</span>
        <span className="font-semibold">{totalDisplay}</span>
      </div>

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
