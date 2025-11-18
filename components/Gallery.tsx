'use client';

import { useEffect, useState } from 'react';

type GalleryItem = {
  id: string;
  src: string;
  alt: string;
};

const ITEMS_PER_PAGE = 6;
const ROTATE_MS = 7000;   
const FADE_MS = 1500;     

const items: GalleryItem[] = [
  { id: 'g1', src: '/images/gallery/1.avif', alt: 'Happy pup on a walk' },
  { id: 'g2', src: '/images/gallery/2.avif', alt: 'Cat relaxing at home' },
  { id: 'g3', src: '/images/gallery/3.avif', alt: 'Two dogs after a drop-in visit' },
  { id: 'g4', src: '/images/gallery/4.avif', alt: 'Cozy overnight sitting' },
  { id: 'g5', src: '/images/gallery/5.avif', alt: 'Puppy play time' },
  { id: 'g6', src: '/images/gallery/6.avif', alt: 'Neighborhood walk' },

  { id: 'g7', src: '/images/gallery/7.png', alt: 'Dog enjoying outdoor time' },
  { id: 'g8', src: '/images/gallery/8.jpg', alt: 'Cat getting attention during a visit' },
  { id: 'g9', src: '/images/gallery/9.jpg', alt: 'Relaxed pup on the couch' },
  { id: 'g10', src: '/images/gallery/10.jpg', alt: 'Dog and toys during a drop-in' },
  { id: 'g11', src: '/images/gallery/11.jpg', alt: 'Leashed walk around the neighborhood' },
  { id: 'g12', src: '/images/gallery/12.jpg', alt: 'Happy pet after a visit' },

  { id: 'g13', src: '/images/gallery/13.jpg', alt: 'Playful pup in the yard' },
  { id: 'g14', src: '/images/gallery/14.jpg', alt: 'Dog snuggling on the couch' },
  { id: 'g15', src: '/images/gallery/15.jpg', alt: 'Walk with a happy dog' },
  { id: 'g16', src: '/images/gallery/16.jpg', alt: 'Pet enjoying cuddle time' },
  { id: 'g17', src: '/images/gallery/17.jpg', alt: 'Silly dog moment' },
  { id: 'g18', src: '/images/gallery/18.jpg', alt: 'Calm pup during a visit' },

  { id: 'g19', src: '/images/gallery/19.jpg', alt: 'Playful pup in the yard' },
  { id: 'g20', src: '/images/gallery/20.jpg', alt: 'Dog snuggling on the couch' },
  { id: 'g21', src: '/images/gallery/21.jpg', alt: 'Walk with a happy dog' },
  { id: 'g22', src: '/images/gallery/22.jpg', alt: 'Pet enjoying cuddle time' },
  { id: 'g23', src: '/images/gallery/23.jpg', alt: 'Silly dog moment' },
  { id: 'g24', src: '/images/gallery/24.avif', alt: 'Calm pup during a visit' },
];

export default function Gallery() {
  const [page, setPage] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));

 
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (mq) {
      setReducedMotion(mq.matches);
      const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, []);

 
  useEffect(() => {
    if (reducedMotion || totalPages <= 1) return;

    const id = window.setInterval(() => {
      
      setIsFadingOut(true);

     
      window.setTimeout(() => {
        setPage((prev) => (prev + 1) % totalPages);
        setIsFadingOut(false);
      }, FADE_MS);
    }, ROTATE_MS);

    return () => window.clearInterval(id);
  }, [reducedMotion, totalPages]);

  const visibleItems = reducedMotion
    ? items 
    : items.slice(page * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE + ITEMS_PER_PAGE);

  return (
    <section className="space-y-3">
      <h3 className="text-lg md:text-xl font-bold text-center md:text-left">
        Gallery
      </h3>
      <p className="text-gray-600 text-center md:text-left text-sm">
        A few highlights from walks, drop-ins, and sitting.
      </p>

      <div
        className={[
          'grid grid-cols-2 sm:grid-cols-3 gap-3',
          !reducedMotion ? 'transition-opacity duration-[1500ms]' : '',
          !reducedMotion && isFadingOut ? 'opacity-0' : '',
          !reducedMotion && !isFadingOut ? 'opacity-100' : '',
        ].join(' ')}
      >
        {visibleItems.map((img) => (
          <div
            key={`${img.id}-page-${reducedMotion ? 'all' : page}`}
            className="rounded-xl overflow-hidden border bg-white transition-transform duration-200 hover:scale-[1.01]"
          >
            <img
              src={img.src}
              alt={img.alt}
              loading="lazy"
              className="w-full h-40 sm:h-52 md:h-60 object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
