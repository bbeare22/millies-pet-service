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
    <header
      className="
        sticky top-0 z-50 
        bg-white/80 backdrop-blur 
        border-b border-[#7B6C57]/20
        shadow-[0_4px_14px_rgba(123,108,87,0.15)]
      "
    >
      <div className="container relative flex items-center justify-between h-16 px-3">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <img
            src="/millies-logo.png"
            alt="Millie's Pet Service"
            className="
              h-12 w-12 md:h-14 md:w-14 rounded-full object-cover 
              border border-[#7B6C57]/30 shadow-sm
              transition-transform group-hover:scale-[1.03]
            "
          />
          <span className="hidden sm:inline font-semibold text-brand-dark text-lg tracking-tight">
            Millie’s Pet Service LLC
          </span>
        </Link>

        {/* Mobile title */}
        <div className="absolute inset-0 flex items-center justify-center md:hidden pointer-events-none">
          <span className="font-semibold text-sm text-[#7B6C57] whitespace-nowrap">
            Millie’s Pet Service LLC
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1.5">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-xl transition
                  ${active
                    ? "text-[#7B6C57] font-semibold bg-[#7B6C57]/10 shadow-sm"
                    : "text-gray-700 hover:text-[#7B6C57]"
                  }
                  hover:bg-[#7B6C57]/5 hover:-translate-y-[1px]
                `}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile menu button */}
        <button
          className="
            md:hidden p-2 rounded-xl 
            hover:bg-[#7B6C57]/10 transition
          "
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen((s) => !s)}
        >
          <div className="space-y-1.5">
            <span className="block w-6 h-0.5 bg-[#7B6C57]"></span>
            <span className="block w-6 h-0.5 bg-[#7B6C57]"></span>
            <span className="block w-6 h-0.5 bg-[#7B6C57]"></span>
          </div>
        </button>
      </div>

      {/* Mobile Dropdown */}
      {open && (
        <div className="md:hidden border-t border-[#7B6C57]/20 bg-white/95 backdrop-blur-sm">
          <nav className="container py-2 flex flex-col gap-1">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`
                    flex items-center gap-2 px-3 py-3 rounded-xl text-base transition
                    ${active
                      ? "bg-[#7B6C57]/10 text-[#7B6C57] font-semibold"
                      : "text-gray-700 hover:bg-[#7B6C57]/5"
                    }
                  `}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
