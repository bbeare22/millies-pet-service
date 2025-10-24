'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const links = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services & Pricing' },
  { href: '/availability', label: 'Availability' },
  { href: '/book', label: 'Book Now' },
  { href: '/contact', label: 'Contact' },
  { href: '/admin', label: 'Admin' } 
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-gray-200 bg-white/70 backdrop-blur sticky top-0 z-50 overflow-hidden">
      <div className="container flex items-center justify-between h-16 px-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/millies-logo.png"
            alt="Millie's Pet Service"
            className="object-contain"
            style={{ height: '64px', width: 'auto', marginBottom: '-6px' }}
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded-xl text-sm hover:bg-gray-100 transition ${
                pathname === l.href ? 'bg-gray-100 font-semibold text-brand-dark' : ''
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden inline-flex items-center justify-center rounded-xl p-2 hover:bg-gray-100"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen((s) => !s)}
        >
          <div className="space-y-1">
            <span className="block h-0.5 w-6 bg-gray-800"></span>
            <span className="block h-0.5 w-6 bg-gray-800"></span>
            <span className="block h-0.5 w-6 bg-gray-800"></span>
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <nav className="container py-2 flex flex-col">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-3 rounded-xl text-base ${
                  pathname === l.href
                    ? 'bg-gray-100 font-semibold text-brand-dark'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
