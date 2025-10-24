import Image from 'next/image';
import contactHero from '@/public/images/contact-hero.png';

export const metadata = {
  title: 'Contact',
  description: "Get in touch with Millie's Pet Service",
};

export default function ContactPage() {
  return (
    <div className="py-10 space-y-8">
      {/* Contact Details on Top */}
      <section className="card text-center md:text-left">
        <h1 className="text-2xl font-bold mb-1">Contact Millie</h1>

        {/* Slogan with animated heart */}
        <p className="text-pink-600 font-semibold text-lg mb-4 flex items-center justify-center md:justify-start gap-2">
          Love &amp; Cuddles are FREE!
          <span
            aria-hidden="true"
            className="inline-block animate-pulse text-red-500 text-xl"
          >
            ❤️
          </span>
        </p>

        <p className="text-gray-600 mb-3">
          Questions about services or availability? Send a message and we’ll get back to you ASAP.
        </p>
        <ul className="space-y-1 text-sm text-gray-700">
          <li>
            <span className="font-semibold">Email:</span>{' '}
            <a className="underline hover:no-underline" href="mailto:mpetserv@gmail.com">
              mpetserv@gmail.com
            </a>
          </li>
          <li>
            <span className="font-semibold">Booking:</span>{' '}
            <a className="underline hover:no-underline" href="/book">Request a booking</a>
          </li>
        </ul>
      </section>

      {/* Photo + Form side by side */}
      <section className="grid gap-6 md:grid-cols-2 items-stretch">
        {/* Illustration */}
        <div className="relative w-full h-[400px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm flex items-center justify-center">
          <Image
            src={contactHero}
            alt="Friendly dog and cat illustration"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain p-8"
          />
        </div>

        {/* Message form */}
        <div className="card flex flex-col justify-between h-full">
          <form
            action="https://formspree.io/f/your-endpoint"
            method="POST"
            className="space-y-4 flex-grow"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="label">Name</label>
                <input id="name" name="name" className="input min-h-12" required />
              </div>
              <div>
                <label htmlFor="email" className="label">Email</label>
                <input id="email" name="email" type="email" className="input min-h-12" required />
              </div>
            </div>

            <div>
              <label htmlFor="message" className="label">Message</label>
              <textarea id="message" name="message" rows={6} className="input" required />
            </div>

            <button className="btn w-full sm:w-auto" type="submit">Send Message</button>
          </form>
        </div>
      </section>
    </div>
  );
}
