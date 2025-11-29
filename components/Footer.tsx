'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function Footer() {
  const pathname = usePathname();
  const year = new Date().getFullYear();

  const notHome = pathname !== '/';

  return (
    <footer className="mt-20">
      <div
        className="border-t pt-6 pb-8 text-center text-sm"
        style={{
          borderColor: '#7B6C5730',
          background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.02))',
        }}
      >
        {/* Nav with Paw Icons */}
        <div className="flex items-center justify-center gap-4 mb-3 select-none">

          {/* Left Paw */}
          <Image
            src="/paw.png"
            alt="paw icon"
            width={18}
            height={18}
            className="opacity-70"
          />

          {/* Navigation Links */}
          <nav className="flex items-center gap-4 text-gray-600 text-sm">
            {notHome && (
              <Link href="/" className="hover:text-[#7B6C57] transition">
                Home
              </Link>
            )}

            <Link href="/services" className="hover:text-[#7B6C57] transition">
              Services
            </Link>

            <Link href="/policies" className="hover:text-[#7B6C57] transition">
              Policies
            </Link>

            <Link href="/contact" className="hover:text-[#7B6C57] transition">
              Contact
            </Link>
          </nav>

          {/* Right Paw */}
          <Image
            src="/paw.png"
            alt="paw icon"
            width={18}
            height={18}
            className="opacity-70"
          />
        </div>

        {/* Copyright */}
        <p className="text-xs text-gray-500">
          © {year} Millie&apos;s Pet Service. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
