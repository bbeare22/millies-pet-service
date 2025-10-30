import Hero from '@/components/Hero';
import ServiceCard from '@/components/ServiceCard';
import { prisma } from '@/lib/prisma';

export default async function HomePage() {
  const services = await prisma.service.findMany({ where: { isActive: true }, take: 3 });

  return (
    <div className="space-y-12">
      <Hero />
      <section>
        <h2 className="text-2xl font-bold mb-4 text-center md:text-left">Popular Services</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {services.map((s) => (
            <ServiceCard
              key={s.id}
              name={s.name}
              description={s.description}
              priceCents={s.priceCents}
              durationMin={s.durationMin}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
