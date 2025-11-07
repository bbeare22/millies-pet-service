'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const links = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services & Pricing' },
  { href: '/policies', label: 'Policies' },
  { href: '/contact', label: 'Contact' },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-gray-200 bg-white/70 backdrop-blur sticky top-0 z-50">
      <div className="container relative flex items-center justify-between h-16 px-3">
        {/* Left: Logo + desktop title */}
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/millies-logo.png"
            alt="Millie's Pet Service LLC"
            className="h-12 w-12 md:h-14 md:w-14 rounded-full object-cover border border-gray-200 shadow-sm"
            style={{ marginBottom: '0' }}
          />
          <span className="hidden sm:inline font-semibold text-brand-dark text-lg tracking-tight">
            Millie’s Pet Service LLC
          </span>
        </Link>

        {/* Mobile centered title (keeps logo on left) */}
        <div className="absolute inset-0 flex items-center justify-center md:hidden pointer-events-none">
          <span className="font-semibold text-sm whitespace-nowrap" style={{ color: '#5C3A1B' }}>
            Millie’s Pet Service LLC
          </span>
        </div>

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

      {/* Mobile Dropdown */}
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
