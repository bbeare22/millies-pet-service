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
  { id: 'g7', src: '/images/gallery/7.png', alt: 'Playful pup in the yard' },
  { id: 'g8', src: '/images/gallery/8.jpg', alt: 'Dog snuggling on the couch' },
  { id: 'g9', src: '/images/gallery/9.jpg', alt: 'Walk with a happy dog' },
  { id: 'g10', src: '/images/gallery/10.jpg', alt: 'Pet enjoying cuddle time' },
  { id: 'g11', src: '/images/gallery/11.jpg', alt: 'Silly dog moment' },
  { id: 'g12', src: '/images/gallery/12.jpg', alt: 'Calm pup during a visit' },

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
  { id: 'g24', src: '/images/gallery/24.jpg', alt: 'Calm pup during a visit' },
];

export default function Gallery() {
  const [page, setPage] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [modalImg, setModalImg] = useState<string | null>(null);

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
    <section className="space-y-4 animate-fadeIn">
      {/* Modal matches Reviews.tsx */}
      {modalImg && (
        <div
          onClick={() => setModalImg(null)}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
        >
          <img
            src={modalImg}
            alt="Gallery photo"
            className="max-w-[90%] max-h-[90%] rounded-xl shadow-2xl"
          />
        </div>
      )}

      <h3 className="text-xl font-bold text-center md:text-left">Gallery</h3>
      <p className="text-gray-600 text-center md:text-left text-sm">
        A few highlights from walks, drop-ins, and sittings.
      </p>

      {/* GRID */}
      <div
        className={[
          'grid grid-cols-2 sm:grid-cols-3 gap-4',
          !reducedMotion ? 'transition-opacity duration-[1500ms]' : '',
          isFadingOut ? 'opacity-0' : 'opacity-100',
        ].join(' ')}
      >
        {visibleItems.map((img) => (
          <div
            key={`${img.id}-page-${reducedMotion ? 'all' : page}`}
            onClick={() => setModalImg(img.src)}
            className={[
              'relative group rounded-2xl overflow-hidden cursor-pointer',
              'bg-white border border-[#7B6C57]/30',
              'shadow-md hover:shadow-lg hover:-translate-y-[2px]',
              'transition-all duration-300',
            ].join(' ')}
            style={{
              boxShadow:
                '0 6px 18px rgba(123,108,87,0.35), 0 3px 9px rgba(123,108,87,0.25)',
            }}
          >
            {/* Inner frame shadow */}
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl"
              style={{ boxShadow: 'inset 0 0 18px rgba(0,0,0,0.22)' }}
            />

            {/* Vignette overlay */}
            <div
              className="pointer-events-none absolute inset-0 opacity-60 group-hover:opacity-40 transition-opacity duration-500"
              style={{
                background:
                  'radial-gradient(circle, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 100%)',
              }}
            />

            {/* IMAGE */}
            <img
              src={img.src}
              alt={img.alt}
              loading="lazy"
              className={[
                'w-full h-40 sm:h-52 md:h-60 object-cover',
                'transition-transform duration-500',
                'group-hover:scale-[1.04]',
              ].join(' ')}
            />

            {/* Strong hover shadow */}
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                boxShadow:
                  '0 10px 25px rgba(123,108,87,0.5), 0 6px 14px rgba(123,108,87,0.35)',
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
