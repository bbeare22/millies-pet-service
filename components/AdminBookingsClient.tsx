'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type Booking = {
  id: number;
  customerName: string;
  email: string;
  phone: string;
  start: string; // ISO (service date/time)
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  notes: string | null;
  service: { name: string };
  createdAt: string; // ISO (when booking was created)
};

export default function AdminBookingsClient() {
  const router = useRouter();
  const search = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const needsLogin = search.get('login') === '1';

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/admin/bookings', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (active) setBookings(data.bookings || []);
      } catch (e: any) {
        if (active) setError(e.message || 'Failed to load');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // 🔽 NEW: always show soonest service first (then by createdAt)
  const sortedBookings = useMemo(() => {
    return [...bookings].sort((a, b) => {
      const ta = new Date(a.start).getTime();
      const tb = new Date(b.start).getTime();
      if (ta !== tb) return ta - tb;
      const ca = new Date(a.createdAt).getTime();
      const cb = new Date(b.createdAt).getTime();
      return ca - cb;
    });
  }, [bookings]);

  async function doAction(id: number, action: 'confirm' | 'cancel' | 'delete') {
    setError(null);
    try {
      if (action === 'delete') {
        const res = await fetch('/api/admin/bookings', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });
        if (!res.ok) throw new Error('Delete failed');
      } else {
        const res = await fetch('/api/admin/bookings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, action }),
        });
        if (!res.ok) throw new Error('Update failed');
      }

      startTransition(() => router.refresh());
      // Optimistic update (will keep sort via useMemo)
      setBookings(prev =>
        action === 'delete'
          ? prev.filter(b => b.id !== id)
          : prev.map(b =>
              b.id === id
                ? { ...b, status: action === 'confirm' ? 'CONFIRMED' : 'CANCELLED' }
                : b
            )
      );
    } catch (e: any) {
      setError(e.message || 'Action failed');
    }
  }

  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get('password') || '');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.replace('/admin');
      router.refresh();
    } else {
      setError('Invalid password');
    }
  }

  if (needsLogin) {
    return (
      <div className="card max-w-md">
        <h2 className="text-xl font-semibold mb-3">Admin login</h2>
        <form onSubmit={login} className="space-y-3">
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input id="password" name="password" type="password" className="input min-h-12" required />
          </div>
          <button className="btn w-full sm:w-auto" type="submit">Sign in</button>
        </form>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>
    );
  }

  if (loading) return <p>Loading…</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (!sortedBookings.length) return <p>No bookings yet.</p>;

  const statusBadge = (s: Booking['status']) => {
    const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold';
    if (s === 'CONFIRMED') return `${base} bg-green-100 text-green-800`;
    if (s === 'CANCELLED') return `${base} bg-red-100 text-red-800`;
    return `${base} bg-yellow-100 text-yellow-800`;
  };

  const ActionButtons = ({ b }: { b: Booking }) => (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => doAction(b.id, 'confirm')}
        className="btn text-xs px-3 py-1"
        disabled={isPending || b.status === 'CONFIRMED'}
      >
        Confirm
      </button>
      <button
        onClick={() => doAction(b.id, 'cancel')}
        className="btn-ghost text-xs px-3 py-1"
        disabled={isPending || b.status === 'CANCELLED'}
      >
        Cancel
      </button>
      <button
        onClick={() => doAction(b.id, 'delete')}
        className="text-xs px-3 py-1 rounded-2xl border border-gray-300 hover:bg-gray-50"
        disabled={isPending}
        title="Delete booking"
      >
        Delete
      </button>
    </div>
  );

  // Mobile cards (smaller screens)
  const MobileList = () => (
    <div className="md:hidden space-y-3">
      {sortedBookings.map(b => {
        const dt = new Date(b.start);
        const when = dt.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
        return (
          <div key={b.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm text-gray-500">{when}</div>
                <div className="text-base font-semibold mt-0.5">{b.customerName}</div>
                <div className="text-sm text-gray-700">{b.service?.name}</div>
              </div>
              <span className={statusBadge(b.status)}>{b.status}</span>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2">
              <div className="text-sm">
                <div className="text-gray-500">Email</div>
                <a className="underline break-words" href={`mailto:${b.email}`}>{b.email}</a>
              </div>
              <div className="text-sm">
                <div className="text-gray-500">Phone</div>
                <a className="underline" href={`tel:${b.phone}`}>{b.phone}</a>
              </div>
              {b.notes ? (
                <div className="text-sm">
                  <div className="text-gray-500">Notes</div>
                  <div className="whitespace-pre-wrap break-words">{b.notes}</div>
                </div>
              ) : null}
            </div>

            <div className="mt-3">
              <ActionButtons b={b} />
            </div>
          </div>
        );
      })}
    </div>
  );

  // Desktop/tablet table (md+)
  const DesktopTable = () => (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-sm border-separate border-spacing-y-2">
        <thead>
          <tr className="text-left text-gray-600">
            <th className="px-3 py-2">When</th>
            <th className="px-3 py-2">Customer</th>
            <th className="px-3 py-2">Service</th>
            <th className="px-3 py-2">Contact</th>
            <th className="px-3 py-2">Notes</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedBookings.map(b => {
            const dt = new Date(b.start);
            const when = dt.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
            return (
              <tr key={b.id} className="bg-white shadow-sm rounded-xl align-top">
                <td className="px-3 py-2 whitespace-nowrap">{when}</td>
                <td className="px-3 py-2">
                  <div className="font-medium">{b.customerName}</div>
                </td>
                <td className="px-3 py-2">{b.service?.name}</td>
                <td className="px-3 py-2">
                  <div className="break-words max-w-[28ch]">
                    <a className="underline" href={`mailto:${b.email}`}>{b.email}</a>
                  </div>
                  <div className="text-gray-600">
                    <a className="underline" href={`tel:${b.phone}`}>{b.phone}</a>
                  </div>
                </td>
                <td className="px-3 py-2 max-w-[32ch]">
                  <div className="truncate" title={b.notes || ''}>{b.notes || '—'}</div>
                </td>
                <td className="px-3 py-2">
                  <span className={statusBadge(b.status)}>{b.status}</span>
                </td>
                <td className="px-3 py-2">
                  <ActionButtons b={b} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Bookings</h2>
        <div className="text-xs text-gray-500">{sortedBookings.length} total</div>
      </div>

      <MobileList />
      <DesktopTable />
    </div>
  );
}
