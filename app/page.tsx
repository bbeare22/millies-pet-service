import Hero from "@/components/Hero";
import ServiceCard from "@/components/ServiceCard";
import { SERVICES } from "@/data/services";
import Link from "next/link";
import Gallery from "@/components/Gallery";
import Reviews from "@/components/Reviews";

export const metadata = {
  title: "Millie’s Pet Service",
  description:
    "Loving, reliable care for your best friend. Walks, drop-ins, overnight sitting, and transport.",
};

export default function HomePage() {
  const featured = SERVICES.slice(0, 3);

  return (
    <div className="space-y-16">

      {/* HERO */}
      <Hero />

      {/* ----------------------- Popular Services ----------------------- */}
      <section className="animate-fadeIn">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-center md:text-left">
            Popular Services
          </h2>

          <Link
            href="/services"
            className="underline underline-offset-4 text-sm hover:text-[#7B6C57] transition"
          >
            See all services →
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {featured.map((s) => (
            <div
              key={s.name}
              className={[
                "rounded-2xl border border-[#7B6C57]/30 bg-white p-1",
                "shadow-md hover:shadow-lg hover:-translate-y-[2px]",
                "transition-all duration-300",
              ].join(" ")}
            >
              <ServiceCard
                name={s.name}
                description={s.description}
                price={s.price}
                duration={s.duration}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ----------------------- Gallery ----------------------- */}
      <Gallery />

      {/* ----------------------- Reviews ----------------------- */}
      <Reviews />

      {/* ---------------- Trusted & Certified ---------------- */}
      <section className="mt-10 space-y-4 animate-fadeIn">
        <h3 className="text-lg md:text-xl font-bold text-center md:text-left">
          Trusted &amp; Certified Care
        </h3>

        <p className="text-sm text-gray-600 text-center md:text-left max-w-2xl">
          Verified training and insurance partners dedicated to safe, professional pet care.
        </p>

        <div className="grid gap-5 sm:grid-cols-2">

          {/* Certification 1 */}
          <div
            className={[
              "rounded-2xl border border-[#7B6C57]/30 bg-white p-4",
              "shadow-md hover:shadow-lg hover:-translate-y-1",
              "transition-all duration-300 flex gap-4 items-center",
            ].join(" ")}
          >
            <img
              src="/images/certs/ahta-badge.png"
              alt="American Health Training Association certification badge"
              className="h-16 w-16 sm:h-20 sm:w-20 object-contain"
            />

            <div className="text-sm">
              <p className="font-semibold">Pet CPR &amp; First Aid Certified</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                Training completed with the American Health Training Association.
              </p>
            </div>
          </div>

          {/* Certification 2 */}
          <div
            className={[
              "rounded-2xl border border-[#7B6C57]/30 bg-white p-4",
              "shadow-md hover:shadow-lg hover:-translate-y-1",
              "transition-all duration-300 flex gap-4 items-center",
            ].join(" ")}
          >
            <img
              src="/images/certs/pci-badge.png"
              alt="PCI Pet Care Insurance badge"
              className="h-16 w-16 sm:h-20 sm:w-20 object-contain"
            />

            <div className="text-sm">
              <p className="font-semibold">Fully Insured with PCI</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                Coverage through PCI Pet Care Insurance for added protection.
              </p>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
