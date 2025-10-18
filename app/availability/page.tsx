import AvailabilityClient from '@/components/AvailabilityClient';

export const metadata = { title: 'Availability' };

export default function AvailabilityPage() {
  return (
    <section className="py-10 md:py-12">
      <div className="container space-y-6">
        <h1 className="text-3xl md:text-4xl font-extrabold">Availability</h1>
        <p className="text-gray-700">
          Pick a day and time to start a booking. Availability is updated regularly.
        </p>
        <div className="card">
          <AvailabilityClient />
        </div>
      </div>
    </section>
  );
}
