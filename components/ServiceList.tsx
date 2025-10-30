'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Service = {
  id: number;
  name: string;
  description: string | null;
  priceCents: number;
  durationMin: number;
  isActive: boolean;
  category?: string | null;
};

export default function ServiceList() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  // Used only to preview 2-dog pricing for Dog Walks
  const [dogs, setDogs] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/services', { cache: 'no-store' });
        const data = await res.json();
        setServices(Array.isArray(data?.services) ? data.services : []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function displayPriceCents(s: Service, dogs: number) {
    // Special 2-dog pricing for walks
    if (s.name.startsWith('Dog Walk')) {
      if (dogs <= 1) return s.priceCents;
      if (s.name.includes('(20')) return 2550;
      if (s.name.includes('(30')) return 3900;
      if (s.name.includes('(60')) return 4800;
    }
    return s.priceCents;
  }

  if (loading) return <p>Loading…</p>;

  const grouped = {
    walks: services.filter((s) => s.isActive && s.name.startsWith('Dog Walk')),
    dropins: services.filter((s) => s.isActive && s.name.startsWith('Drop-in')),
    overnight: services.filter(
      (s) =>
        s.isActive &&
        (s.name.startsWith('Boarding') || s.name.startsWith('Sitting'))
    ),
    addons: services.filter((s) => s.isActive && s.name.startsWith('Add-on')),
  };

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
            Walks: Sat–Mon 8:00am–7:30pm • Tue–Fri 6:30pm–7:30pm
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2 items-center">
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
            Drop-ins: Sat–Mon 8:00am–8:30pm • Tue–Fri 6:30pm–8:30pm
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2 items-center">
          <span className="px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 text-xs font-semibold">
            Overnight: Fri 6:00pm → Mon 11:59pm
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2 items-center">
          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
            Add-ons: Sat–Mon 8:00am–8:30pm • Tue–Fri 6:30pm–8:30pm
          </span>
        </div>
      </div>

      {/* Walks */}
      {grouped.walks.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-lg font-bold text-center md:text-left">Dog Walks</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {grouped.walks.map((s) => (
              <article key={s.id} className="card">
                <h4 className="font-semibold">{s.name}</h4>
                {s.description && (
                  <p className="mt-1 text-sm text-gray-600">{s.description}</p>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-semibold">
                    ${(displayPriceCents(s, dogs) / 100).toFixed(2)}
                  </span>
                  {s.durationMin > 0 && (
                    <span className="text-xs text-gray-500">
                      {s.durationMin} min
                    </span>
                  )}
                </div>
                <div className="mt-4">
                  <Link className="btn" href={`/book?serviceId=${s.id}`}>
                    Book Now
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Drop-ins */}
      {grouped.dropins.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-lg font-bold text-center md:text-left">Drop-ins</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {grouped.dropins.map((s) => (
              <article key={s.id} className="card">
                <h4 className="font-semibold">{s.name}</h4>
                {s.description && (
                  <p className="mt-1 text-sm text-gray-600">{s.description}</p>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-semibold">
                    ${(s.priceCents / 100).toFixed(2)}
                  </span>
                  {s.durationMin > 0 && (
                    <span className="text-xs text-gray-500">
                      {s.durationMin} min
                    </span>
                  )}
                </div>
                <div className="mt-4">
                  <Link className="btn" href={`/book?serviceId=${s.id}`}>
                    Book Now
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Overnight */}
      {grouped.overnight.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-lg font-bold text-center md:text-left">Overnight (Boarding & Sitting)</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {grouped.overnight.map((s) => (
              <article key={s.id} className="card">
                <h4 className="font-semibold">{s.name}</h4>
                {s.description && (
                  <p className="mt-1 text-sm text-gray-600">{s.description}</p>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-semibold">
                    ${(s.priceCents / 100).toFixed(2)}
                  </span>
                </div>
                <div className="mt-4">
                  <Link className="btn" href={`/book?serviceId=${s.id}`}>
                    Book Now
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Add-ons */}
      {grouped.addons.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-lg font-bold text-center md:text-left">Add-ons</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {grouped.addons.map((s) => (
              <article key={s.id} className="card">
                <h4 className="font-semibold">{s.name}</h4>
                {s.description && (
                  <p className="mt-1 text-sm text-gray-600">{s.description}</p>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-semibold">
                    ${(s.priceCents / 100).toFixed(2)}
                  </span>
                </div>
                <div className="mt-4">
                  <Link className="btn" href={`/book?serviceId=${s.id}`}>
                    Add to Booking
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
