'use client';

import { useEffect, useMemo, useState } from 'react';

type Service = {
  id: number;
  name: string;
  description: string;
  priceCents: number;
  durationMin: number;
  isActive: boolean;
};

function isWalk(s: Service) {
  return s.name.startsWith('Dog Walk');
}
function isBoarding(s: Service) {
  return s.name.startsWith('Boarding');
}
function isSitting(s: Service) {
  return s.name.startsWith('Sitting');
}
function isAddon(s: Service) {
  return (s.durationMin ?? 0) === 0 && !isBoarding(s) && !isSitting(s);
}

function displayPriceCents(s: Service, dogs: number): number {
  // Walks: special 2-dog prices
  if (isWalk(s)) {
    if (dogs <= 1) return s.priceCents;
    if (s.name.includes('(20')) return 2550;
    if (s.name.includes('(30')) return 3900;
    if (s.name.includes('(60')) return 4800;
    return s.priceCents;
  }

  // Overnight: base + per-extra dog
  if (isBoarding(s)) {
    const extras = Math.max(0, Math.min(dogs - 1, 3));
    return 2500 + extras * 1800;
  }
  if (isSitting(s)) {
    const extras = Math.max(0, dogs - 1);
    return 3000 + extras * 2300;
  }

  // Potty Breaks & Add-ons: flat
  return s.priceCents;
}

export default function ServiceList() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [dogs, setDogs] = useState<1 | 2>(1);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/services', { cache: 'no-store' });
        const data = await res.json();
        setServices((data.services || []).filter((s: Service) => s.isActive));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const grouped = useMemo(() => {
    return {
      walks: services.filter(isWalk),
      potty: services.filter((s) => s.name.startsWith('Potty Break')),
      overnight: services.filter((s) => isBoarding(s) || isSitting(s)),
      addons: services.filter(isAddon),
    };
  }, [services]);

  if (loading) return <p>Loading services…</p>;

  return (
    <div className="space-y-10">
      {/* Toggle */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl md:text-2xl font-extrabold">Services & Pricing</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Show prices for:</span>
          <div className="inline-flex rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <button
              className={`px-3 py-1.5 text-sm ${dogs === 1 ? 'bg-brand text-white' : 'hover:bg-gray-50'}`}
              onClick={() => setDogs(1)}
            >
              1 dog
            </button>
            <button
              className={`px-3 py-1.5 text-sm border-l border-gray-200 ${dogs === 2 ? 'bg-brand text-white' : 'hover:bg-gray-50'}`}
              onClick={() => setDogs(2)}
            >
              2 dogs
            </button>
          </div>
        </div>
      </div>

      {/* Walks */}
      {grouped.walks.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-lg font-bold">Dog Walks</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {grouped.walks.map((s) => (
              <article key={s.id} className="card">
                <h4 className="font-semibold">{s.name}</h4>
                {s.description && <p className="mt-1 text-sm text-gray-600">{s.description}</p>}
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-semibold">${(displayPriceCents(s, dogs) / 100).toFixed(2)}</span>
                  {s.durationMin > 0 && (
                    <span className="text-xs text-gray-500">{s.durationMin} min</span>
                  )}
                </div>
              </article>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            Walk prices reflect your selection (1 or 2 dogs). Two-dog pricing: 20m $25.50 • 30m $39.00 • 60m $48.00.
          </p>
        </section>
      )}

      {/* Potty Breaks */}
      {grouped.potty.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-lg font-bold">Potty Breaks</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {grouped.potty.map((s) => (
              <article key={s.id} className="card">
                <h4 className="font-semibold">{s.name}</h4>
                {s.description && <p className="mt-1 text-sm text-gray-600">{s.description}</p>}
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-semibold">${(displayPriceCents(s, dogs) / 100).toFixed(2)}</span>
                  {s.durationMin > 0 && (
                    <span className="text-xs text-gray-500">{s.durationMin} min</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Overnight */}
      {grouped.overnight.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-lg font-bold">Overnight (Boarding & Sitting)</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {grouped.overnight.map((s) => (
              <article key={s.id} className="card">
                <h4 className="font-semibold">{s.name}</h4>
                {s.description && <p className="mt-1 text-sm text-gray-600">{s.description}</p>}
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-semibold">${(displayPriceCents(s, dogs) / 100).toFixed(2)}</span>
                  {s.durationMin > 0 && (
                    <span className="text-xs text-gray-500">overnight</span>
                  )}
                </div>
              </article>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            Boarding adds $18 per additional dog (up to 3). Sitting adds $23 per additional dog. Prices reflect your 1-or-2 dog selection here.
          </p>
        </section>
      )}

      {/* Add-ons */}
      {grouped.addons.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-lg font-bold">Add-ons</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {grouped.addons.map((s) => (
              <article key={s.id} className="card">
                <h4 className="font-semibold">{s.name}</h4>
                {s.description && <p className="mt-1 text-sm text-gray-600">{s.description}</p>}
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-semibold">${(s.priceCents / 100).toFixed(2)}</span>
                  {/* duration hidden for add-ons */}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
