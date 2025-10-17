import { prisma } from '@/lib/prisma';
import ServiceCard from '@/components/ServiceCard';
import Link from 'next/link';

export const metadata = { title: 'Services & Pricing' };

export default async function ServicesPage() {
  const services = await prisma.service.findMany({ where: { isActive: true }, orderBy: { priceCents: 'asc' } });
  return (
    <div className="py-10 space-y-6">
      <h1 className="text-3xl font-bold">Services & Pricing</h1>
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {services.map(s => (
          <ServiceCard key={s.id} name={s.name} description={s.description} priceCents={s.priceCents} durationMin={s.durationMin} />
        ))}
      </div>
      <div>
        <Link href="/book" className="btn mt-4 inline-block">Book Now</Link>
      </div>
    </div>
  );
}