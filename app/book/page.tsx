import { Suspense } from 'react';
import BookingForm from '@/components/BookingForm';

export const metadata = { title: 'Book a Service' };
export const dynamic = 'force-dynamic';

export default function BookPage() {
  return (
    <section className="py-10 md:py-12">
      <div className="container space-y-6 text-center md:text-left max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold">Book a Service</h1>
        <p className="text-gray-600">
          Fill out the form and we'll confirm by email &amp; text.
        </p>
      </div>

      <div className="container mt-8">
        <Suspense fallback={<div className="text-gray-600">Loading form…</div>}>
          <BookingForm />
        </Suspense>
      </div>
    </section>
  );
}
