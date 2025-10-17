import BookingForm from '@/components/BookingForm';

export const metadata = { title: 'Book a Service' };

export default function BookPage() {
  return (
    <div className="py-10 space-y-6">
      <h1 className="text-3xl font-bold">Book a Service</h1>
      <p className="text-gray-600">Fill out the form and we'll confirm by email & text.</p>
      <BookingForm />
    </div>
  );
}