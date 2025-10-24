import { Suspense } from 'react';
import AdminBookingsClient from '@/components/AdminBookingsClient';

export const metadata = {
  title: 'Admin · Bookings',
};

export const dynamic = 'force-dynamic';

export default function AdminPage() {
  return (
    <div className="py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin · Bookings</h1>
        <form action="/api/admin/logout" method="POST">
          <button className="btn-ghost" type="submit">Log out</button>
        </form>
      </div>

      <Suspense fallback={<p>Loading…</p>}>
        <AdminBookingsClient />
      </Suspense>
    </div>
  );
}
