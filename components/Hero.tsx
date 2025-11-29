'use client';

import Link from 'next/link';

export default function Hero() {
  return (
    <section className="hero-watermark py-12 md:py-20">
      <div className="container grid md:grid-cols-2 gap-10 items-center">

        {/* LEFT COLUMN */}
        <div className="text-center md:text-left animate-fadeIn space-y-4">

          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-text drop-shadow-sm">
            Loving, reliable care for your best friend.
          </h1>

          <p className="text-base sm:text-lg text-gray-700 max-w-prose mx-auto md:mx-0 leading-relaxed">
            Reliable, insured, and pet-first care for your best friend.
            Book walks, drop-ins, and overnight sitting.
          </p>

          {/* BUTTONS */}
          <div className="pt-2 grid grid-cols-2 gap-3 sm:flex sm:flex-nowrap justify-center md:justify-start">
            <Link
              href="/services"
              className="
                btn w-full sm:w-auto text-center
                border border-[#7B6C57]/30
                shadow-md shadow-[#7B6C57]/25
                hover:-translate-y-[2px]
                hover:shadow-lg hover:shadow-[#7B6C57]/40
                transition-all duration-300
              "
            >
              View Services
            </Link>

            <Link
              href="/contact"
              className="
                btn-ghost w-full sm:w-auto text-center
                border border-[#7B6C57]/20
                shadow-sm shadow-[#7B6C57]/15
                hover:-translate-y-[2px]
                hover:shadow-md hover:shadow-[#7B6C57]/30
                transition-all duration-300
              "
            >
              Contact
            </Link>
          </div>

          <p className="text-xs text-gray-500 pt-1">
            Serving Colorado Springs & nearby areas.
          </p>
        </div>

        {/* RIGHT COLUMN — FEATURE LIST CARD */}
        <div
          className="
            rounded-2xl bg-white p-6
            border border-[#7B6C57]
            shadow-md shadow-[#7B6C57]/40
            relative overflow-hidden
            animate-fadeIn delay-100
            hover:shadow-lg hover:shadow-[#7B6C57]/50
            transition-all duration-500
          "
          style={{
            boxShadow:
              '0 6px 18px rgba(123,108,87,0.40), 0 3px 9px rgba(123,108,87,0.30)',
          }}
        >
          {/* Inner vignette */}
          <div
            className="absolute inset-0 pointer-events-none rounded-2xl"
            style={{
              boxShadow: 'inset 0 0 18px rgba(0,0,0,0.22)',
            }}
          />

          <ul className="space-y-4 text-gray-700 text-sm sm:text-base relative z-10">
            {[
              'Fully insured & background checked',
              'Simple, transparent pricing',
              'Overnight sitting available',
              'Pet CPR Certified',
            ].map((item, i) => (
              <li
                key={i}
                className="
                  flex items-center gap-3
                  group
                "
              >
                {/* Paw icon */}
                <img
                  src="/paw.png"
                  alt=""
                  className="
                    w-6 h-6 object-contain opacity-90
                    group-hover:scale-110
                    transition-transform duration-300
                  "
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* GLOBAL ANIMATION MATCHING REVIEWS/GALLERY */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.55s ease-out both;
        }
        .delay-100 {
          animation-delay: 0.1s;
        }
      `}</style>
    </section>
  );
}
