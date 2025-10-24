
import { cookies } from 'next/headers';
import AdminBookingsClient from '@/components/AdminBookingsClient'; 


export const metadata = { title: 'Admin' };

const ADMIN_COOKIE = 'admin_session';

export default async function AdminPage() {
  const cookieStore = cookies();
  const authed = !!cookieStore.get(ADMIN_COOKIE)?.value;

  if (!authed) {
    // NOT LOGGED IN → simple HTML form posting to /api/admin/login
    return (
      <div className="container max-w-md py-16">
        <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
        <form action="/api/admin/login" method="post" className="space-y-4 card">
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input id="password" name="password" type="password" className="input min-h-12" required />
          </div>
          <button className="btn" type="submit">Sign in</button>
        </form>
      </div>
    );
  }

  // LOGGED IN → dashboard + logout button
  return (
    <div className="container py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <form action="/api/admin/logout" method="post">
          <button className="btn-ghost" type="submit">Log out</button>
        </form>
      </div>

      <AdminBookingsClient />
    </div>
  );
}
