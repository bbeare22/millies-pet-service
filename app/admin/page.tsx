import AdminBookingsClient from '@/components/AdminBookingsClient';

export const metadata = {
  title: 'Admin · Bookings',
};

export default function AdminPage() {
  // The table and actions are in a client component for interactivity
  return (
    <div className="py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin · Bookings</h1>
        <form action="/api/admin/logout" method="POST">
          <button className="btn-ghost" type="submit">Log out</button>
        </form>
      </div>
      <AdminBookingsClient />
    </div>
  );
}
