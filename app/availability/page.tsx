import AvailabilityCalendar from '@/components/AvailabilityCalendar';

export const metadata = { title: 'Availability' };

export default function AvailabilityPage() {
  return (
    <section className="py-10 md:py-12">
      <div className="container space-y-6">
        <AvailabilityCalendar />
      </div>
    </section>
  );
}
