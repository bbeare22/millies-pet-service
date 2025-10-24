
import Image from 'next/image';

export const metadata = {
  title: 'Contact',
  description: "Get in touch with Millie's Pet Service",
};

export default function ContactPage() {
  return (
    <div className="py-10 space-y-8">
      {/* Hero */}
      <section className="grid gap-6 md:grid-cols-5 items-center">
        {/* Text */}
        <div className="md:col-span-2 space-y-3">
          <h1 className="text-3xl font-bold">Contact Millie</h1>
          <p className="text-gray-600">
            Questions about services or availability? Send a message and we’ll get back to you ASAP.
          </p>

          <ul className="mt-4 space-y-1 text-sm text-gray-700">
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
        </div>

        {/* Image */}
        <div className="md:col-span-3">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <Image
              src="/images/contact-hero.png"
              alt="Friendly dog and cat illustration"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-contain p-6"
            />
          </div>
        </div>
      </section>

      {/* Contact form (optional – keep or remove if you already have one) */}
      <section className="card max-w-2xl">
        <form
          action="https://formspree.io/f/your-endpoint" // replace or wire to your API if you like
          method="POST"
          className="space-y-4"
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
            <textarea id="message" name="message" rows={5} className="input" required />
          </div>

          <button className="btn w-full sm:w-auto" type="submit">Send Message</button>
        </form>
      </section>
    </div>
  );
}

