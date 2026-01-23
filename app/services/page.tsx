import ServiceList from '@/components/ServiceList';

export const metadata = { title: 'Services & Pricing' };

export default function ServicesPage() {
  return (
    <section className="py-10 md:py-12 animate-fadeIn">
      <div className="container space-y-6 text-center md:text-left max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold">Services & Pricing</h1>

        {/* Bundle Callout */}
        <div
          className={[
            "rounded-2xl border border-[#7B6C57]/30 bg-white p-5",
            "shadow-md hover:shadow-lg hover:-translate-y-[2px]",
            "transition-all duration-300",
          ].join(" ")}
          style={{
            boxShadow:
              "0 6px 18px rgba(123,108,87,0.22), 0 3px 9px rgba(123,108,87,0.16)",
          }}
        >
          <div className="flex flex-col gap-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="inline-flex items-center rounded-full border border-[#7B6C57]/30 bg-[#7B6C57]/10 px-3 py-1 text-xs font-semibold text-[#7B6C57]">
                🐾 Bundle Deal
              </span>
              <span className="text-sm font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                Save $10
              </span>
            </div>

            <p className="text-gray-700 leading-relaxed">
              Bundle a <span className="font-semibold">Dog Walk + Drop-in</span> on the same visit and get{" "}
              <span className="font-semibold"> $10 off</span>.
              <span className="block text-sm text-gray-600 mt-1">
                Your walk time is always fully included — the discount applies to the bundle total.
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="container mt-8">
        <ServiceList />
      </div>
    </section>
  );
}
