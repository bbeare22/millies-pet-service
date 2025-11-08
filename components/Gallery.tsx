'use client';

import { useEffect, useState } from 'react';

type GalleryItem = {
  id: string;
  src: string;
  alt: string;
};

const placeholder: GalleryItem[] = [
  { id: 'g1', src: '/images/gallery/1.avif', alt: 'Happy pup on a walk' },
  { id: 'g2', src: '/images/gallery/2.avif', alt: 'Cat at home check-in' },
  { id: 'g3', src: '/images/gallery/3.avif', alt: 'Two dogs after a drop-in' },
  { id: 'g4', src: '/images/gallery/4.avif', alt: 'Cozy overnight sitting' },
  { id: 'g5', src: '/images/gallery/5.avif', alt: 'Puppy play time' },
  { id: 'g6', src: '/images/gallery/6.avif', alt: 'Neighborhood walk' },
];

export default function Gallery() {
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    setReducedMotion(Boolean(mq?.matches));
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq?.addEventListener?.('change', handler);
    return () => mq?.removeEventListener?.('change', handler);
  }, []);

  return (
    <section className="space-y-3">
      <h3 className="text-lg md:text-xl font-bold text-center md:text-left">Gallery</h3>
      <p className="text-gray-600 text-center md:text-left text-sm">
        A few highlights from walks, drop-ins, and sitting. (More coming soon!)
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {placeholder.map((img, idx) => {
          const delay = reducedMotion ? 0 : idx * 60; 
          return (
            <div
              key={img.id}
              className={[
                'rounded-xl overflow-hidden border bg-white',
                'transition-transform duration-200 hover:scale-[1.01]',
              ].join(' ')}
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className={[
                  'w-full h-32 sm:h-40 md:h-44 object-cover',
                  'transition-all duration-700',
                  mounted && !reducedMotion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
                ].join(' ')}
                style={{ transitionDelay: `${delay}ms` }}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
