import Link from 'next/link';

export default function Hero() {
  return (
    <section className="hero-watermark">
      <div className="container py-10 md:py-16 grid md:grid-cols-2 gap-8 md:gap-10 items-center">
        {/* LEFT COLUMN — centered on small screens */}
        <div className="text-center md:text-left">
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-text">
            Loving, reliable care for your best friend.
          </h1>
          <p className="mt-3 text-base sm:text-lg text-gray-700 max-w-prose mx-auto md:mx-0">
            Reliable, insured, and pet-first care for your best friend. Book walks, drop-ins, and overnight sitting.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap justify-center md:justify-start">
            <Link href="/services" className="btn w-full sm:w-auto text-center">
              View Services
            </Link>
            <Link href="/contact" className="btn-ghost w-full sm:w-auto text-center">
              Contact
            </Link>
          </div>

          <p className="mt-3 text-xs text-gray-500">Serving Colorado Springs & nearby areas.</p>
        </div>

        {/* RIGHT COLUMN — always left-aligned */}
        <div className="card text-left">
          <ul className="space-y-3 text-gray-700 text-sm sm:text-base">
            <li className="flex gap-3"><span>✅</span> Fully insured & background checked</li>
            <li className="flex gap-3"><span>✅</span> Simple, transparent pricing</li>
            <li className="flex gap-3"><span>✅</span> Overnight sitting available</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
