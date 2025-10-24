import { Suspense } from 'react';
import BookingForm from '@/components/BookingForm';

export const metadata = { title: 'Book a Service' };


export const dynamic = 'force-dynamic';

export default function BookPage() {
  return (
    <section className="py-10 space-y-6">
      <h1 className="text-3xl font-bold">Book a Service</h1>
      <p className="text-gray-600">
        Fill out the form and we'll confirm by email &amp; text.
      </p>

      {/* Wrap the client component that uses useSearchParams in Suspense */}
      <Suspense fallback={<div className="text-gray-600">Loading form…</div>}>
        <BookingForm />
      </Suspense>
    </section>
  );
}
