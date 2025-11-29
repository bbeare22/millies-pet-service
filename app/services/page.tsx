import ServiceList from '@/components/ServiceList';

export const metadata = { title: 'Services & Pricing' };

export default function ServicesPage() {
  return (
    <section className="py-10 md:py-12 animate-fadeIn">
      <div className="container space-y-6 text-center md:text-left max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold">Services & Pricing</h1>
      </div>

      <div className="container mt-8">
        <ServiceList />
      </div>
    </section>
  );
}
