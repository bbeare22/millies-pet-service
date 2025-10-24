import ServiceList from '@/components/ServiceList';

export const metadata = { title: 'Services & Pricing' };

export default function ServicesPage() {
  return (
    <section className="py-10 md:py-12">
      <div className="container space-y-6">
        <h1 className="text-3xl md:text-4xl font-extrabold">Services & Pricing</h1>
        <p className="text-gray-700">
          Select 1 or 2 dogs to preview pricing for walks and overnight services.
        </p>
        <ServiceList />
      </div>
    </section>
  );
}
