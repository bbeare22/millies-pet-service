import Image from "next/image";
import ContactForm from '@/components/ContactForm';

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <section className="py-10 md:py-12">
      <div className="container space-y-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center md:text-left">Contact</h1>
        <p className="text-gray-600 text-center md:text-left">
          Have questions or want to schedule a meet-and-greet? Reach out below.
        </p>

        <div className="grid md:grid-cols-2 gap-6">

          <div className="card space-y-4">
            <div>
              <h2 className="font-semibold">Get in touch</h2>
              <div className="mt-2 text-sm">
                <div className="flex items-center gap-2">
                  <span>📞</span>
                  <a className="underline" href="tel:+17197614151">(719) 761-4151 (text or call)</a>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span>✉️</span>
                  <a className="underline" href="mailto:hello@mpetserv.com">mpetserv@gmail.com</a>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-3">
              <h3 className="font-medium">Notes</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-700">
                <li><strong>Hours of service:</strong> Friday 6:00pm – Monday 8:30pm</li>
                <li><strong>Sitting:</strong> please contact Millie to confirm sitting times and availability.</li>
              </ul>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-3">
              <h3 className="font-medium">Accepted Payments</h3>
              <div className="mt-2 flex flex-wrap gap-2 text-sm">
                <span className="px-2 py-1 rounded-xl border">Zelle</span>
                <span className="px-2 py-1 rounded-xl border">PayPal</span>
                <span className="px-2 py-1 rounded-xl border">Venmo</span>
                <span className="px-2 py-1 rounded-xl border">Apple Pay</span>
              </div>
            </div>

            <ContactForm />

            <div className="text-pink-600 text-sm font-semibold flex items-center gap-1">
              <span className="animate-pulse text-2xl leading-none">♥</span>
              Love &amp; Cuddles are FREE!
              </div>
          </div>

          <div className="card overflow-hidden">
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
      
            <div className="mt-12 mb-10 flex justify-center">
              <img
                src="/millies-logo.png"
                alt="Millie's Pet Service LLC logo"
                className="h-40 w-40 sm:h-56 sm:w-56 md:h-[20rem] md:w-[20rem] lg:h-[22rem] lg:w-[22rem] rounded-full object-cover border border-gray-300 shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
