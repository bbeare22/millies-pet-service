import Hero from "@/components/Hero";
import ServiceCard from "@/components/ServiceCard";
import { SERVICES } from "@/data/services";
import Link from "next/link";

export const metadata = {
  title: "Millie’s Pet Service",
  description:
    "Loving, reliable care for your best friend. Walks, drop-ins, overnight sitting, and transport.",
};

export default function HomePage() {
  const featured = SERVICES.slice(0, 3);

  return (
    <div className="space-y-12">
      <Hero />
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-center md:text-left">Popular Services</h2>
          <Link href="/services" className="underline underline-offset-4 text-sm">
            See all services →
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {featured.map((s) => (
            <ServiceCard
              key={s.name}
              name={s.name}
              description={s.description}
              price={s.price}
              duration={s.duration}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
