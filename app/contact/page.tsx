import Image from "next/image";
import ContactForm from "@/components/ContactForm";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <section className="py-10 md:py-12 animate-fadeIn">
      <div className="container space-y-6">

        {/* Header */}
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold">Contact</h1>
          <p className="text-gray-600 mt-2">
            Have questions or want to schedule a meet-and-greet? Reach out below.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">

          {/* LEFT COLUMN — full card wrapper */}
          <div
            className={[
              "rounded-2xl border border-[#7B6C57]/30 bg-white",
              "shadow-md hover:shadow-lg transition-all duration-300",
              "p-5 space-y-6",
            ].join(" ")}
          >
            {/* Contact Info */}
            <div className="space-y-2 text-center md:text-left">
              <h2 className="font-semibold">Get in touch</h2>

              <div className="mt-1 text-sm flex flex-col items-center md:items-start gap-2">
                <a
                  className="underline hover:text-[#7B6C57] transition flex items-center gap-1"
                  href="tel:+17197614151"
                >
                  📞 (719) 761-4151 (text or call)
                </a>

                <a
                  className="underline hover:text-[#7B6C57] transition flex items-center gap-1"
                  href="mailto:mpetserv@gmail.com"
                >
                  ✉️ mpetserv@gmail.com
                </a>
              </div>
            </div>

            {/* Notes */}
            <div className="rounded-xl border border-gray-200 bg-white p-3 text-center md:text-left shadow-sm">
              <h3 className="font-medium">Notes</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-700">
                <li>
                  <strong>Hours of service:</strong> Friday 6:00pm – Monday 8:30pm
                </li>
                <li>
                  <strong>Sitting hours:</strong> Contact Millie to confirm availability.
                </li>
              </ul>
            </div>

            {/* Payments */}
            <div className="rounded-xl border border-gray-200 bg-white p-3 text-center md:text-left shadow-sm">
              <h3 className="font-medium">Accepted Payments</h3>

              <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-2 text-sm">
                {["Zelle", "PayPal", "Venmo", "Apple Pay", "Cash"].map((p) => (
                  <span
                    key={p}
                    className="px-3 py-1 rounded-xl border border-gray-300 bg-white shadow-sm"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div className="text-center md:text-left">
              <ContactForm />

              <div className="text-pink-600 text-sm font-semibold flex items-center justify-center md:justify-start gap-1 mt-2">
                <span className="animate-pulse text-2xl leading-none">♥</span>
                Love &amp; Cuddles are FREE!
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN — image card */}
          <div
            className={[
              "rounded-2xl border border-[#7B6C57]/30 bg-white shadow-md",
              "hover:shadow-lg transition-all duration-300 overflow-hidden",
            ].join(" ")}
          >
            <div className="relative w-full aspect-[4/3] bg-gray-100">
              <Image
                src="/images/contact-hero.png"
                alt="Millie with pets"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>

            <div className="flex justify-center pt-10 pb-8 md:pt-16 md:pb-10">
              <img
                src="/millies-logo.png"
                alt="Millie's Pet Service LLC logo"
                className="h-40 w-40 sm:h-56 sm:w-56 md:h-[20rem] md:w-[20rem] rounded-full object-cover border border-[#7B6C57]/40 shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
