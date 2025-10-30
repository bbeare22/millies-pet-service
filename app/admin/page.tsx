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
      <section className="py-10 md:py-12">
        <div className="container max-w-md space-y-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-center">Admin Login</h1>
          <form
            action="/api/admin/login"
            method="post"
            className="card space-y-4 mx-auto w-full"
          >
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input id="password" name="password" type="password" className="input min-h-12" required />
            </div>
            <button className="btn w-full sm:w-auto" type="submit">Sign in</button>
          </form>
        </div>
      </section>
    );
  }

  // LOGGED IN → dashboard + logout button
  return (
    <section className="py-10 md:py-12">
      <div className="container space-y-6">
        {/* Header: center on small screens, row on md+ */}
        <div className="flex flex-col items-center gap-3 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold">Admin Dashboard</h1>
          <form action="/api/admin/logout" method="post">
            <button className="btn-ghost w-full sm:w-auto" type="submit">Log out</button>
          </form>
        </div>

        <AdminBookingsClient />
      </div>
    </section>
  );
}
