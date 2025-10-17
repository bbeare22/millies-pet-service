'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function StickyBookBar() {
  const pathname = usePathname();

  // Only show on mobile and not when already on the booking page
  if (pathname === '/book') return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-brand text-white py-3 px-6 shadow-lg md:hidden">
      <div className="container mx-auto flex justify-between items-center">
        <p className="text-sm font-medium">Ready to book?</p>
        <Link
          href="/book"
          className="bg-white text-brand font-semibold rounded-xl px-4 py-2 text-sm shadow-sm hover:bg-brand/10 hover:text-white transition-colors"
        >
          Book Now
        </Link>
      </div>
    </div>
  );
}
