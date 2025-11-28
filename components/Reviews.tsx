'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';

type Review = {
  id: string;
  name: string;
  rating: number;
  text: string;
  photoDataUrl?: string | null;
  createdAt: number;
};

const PRESET_REVIEWS: Review[] = [
  {
    id: 'r1',
    name: 'Hannah M.',
    rating: 5,
    text: 'Millie is wonderful with our shy rescue! Dependable and kind.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
  },
  {
    id: 'r2',
    name: 'Jason P.',
    rating: 5,
    text: 'Great communication and our pup comes home happy and tired!',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 12,
  },
  {
    id: 'r3',
    name: 'Emily R.',
    rating: 5,
    text: 'Absolutely love Millie! She treats my dog like family and always goes the extra mile.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
  },
  {
    id: 'r4',
    name: 'Tom & Sarah L.',
    rating: 5,
    text: 'We’ve used several sitters, but Millie is by far the best — super reliable and friendly!',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 25,
  },
];

const MAX_VISIBLE = 10;

/* --------------------------- Star Rating --------------------------- */

function StarRating({
  value,
  onChange,
  size = 'md',
  idBase = 'rating',
}: {
  value: number;
  onChange: (next: number) => void;
  size?: 'sm' | 'md' | 'lg';
  idBase?: string;
}) {
  const stars = [1, 2, 3, 4, 5];
  const sizeClass =
    size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-lg' : 'text-2xl';

  return (
    <div className="flex items-center gap-1">
      {stars.map((star) => {
        const checked = value >= star;
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-transform hover:scale-110 focus:scale-110"
          >
            <span
              className={`${sizeClass} ${
                checked ? 'text-yellow-500' : 'text-gray-300'
              }`}
            >
              ★
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------ Image Resize Helper ------------------------ */

async function fileToResizedDataURL(
  file: File,
  maxWidth = 1200,
  quality = 0.85
): Promise<string | undefined> {
  try {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result as string);
      fr.onerror = () => reject(new Error('Failed to read image'));
      fr.readAsDataURL(file);
    });

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new window.Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('Failed to load image'));
      i.src = dataUrl;
    });

    const ratio = img.width > maxWidth ? maxWidth / img.width : 1;
    const canvas = document.createElement('canvas');
    canvas.width = img.width * ratio;
    canvas.height = img.height * ratio;
    const ctx = canvas.getContext('2d');
    if (!ctx) return dataUrl;

    ctx.drawImage(img, 0, 0, img.width * ratio, img.height * ratio);
    return canvas.toDataURL('image/jpeg', quality);
  } catch {
    return undefined;
  }
}

/* -------------------------------- Reviews ------------------------------- */

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [text, setText] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle');
  const [modalImg, setModalImg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/reviews', { cache: 'no-store' });
        const data = (await res.json()) as { reviews?: Review[] };
        const fromServer = (data.reviews ?? []).filter((r) => r.rating >= 4);

        const visible = [...PRESET_REVIEWS, ...fromServer]
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, MAX_VISIBLE);

        if (!cancelled) setReviews(visible);
      } catch {
        if (!cancelled) setReviews(PRESET_REVIEWS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;

    setSubmitting(true);

    let dataUrl: string | undefined = undefined;
    if (photo) dataUrl = await fileToResizedDataURL(photo);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          rating,
          text: text.trim(),
          photoDataUrl: dataUrl ?? null,
        }),
      });

      const data = (await res.json()) as { review: Review };

      setReviews((prev) =>
        [...PRESET_REVIEWS, data.review, ...prev]
          .filter((r) => r.rating >= 4)
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, MAX_VISIBLE)
      );

      setName('');
      setText('');
      setRating(5);
      setPhoto(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setStatus('sent');
    } catch {
      setStatus('error');
    } finally {
      setSubmitting(false);
    }
  }

  /* ---------------------------- Render Stars ---------------------------- */

  function renderStars(value: number) {
    return (
      <span className="text-yellow-500">
        {'★'.repeat(value)}
        <span className="text-gray-300">{'★'.repeat(5 - value)}</span>
      </span>
    );
  }

  const visible = useMemo(
    () => [...reviews].sort((a, b) => b.createdAt - a.createdAt),
    [reviews]
  );

  return (
    <section className="space-y-6">

      {/* Modal */}
      {modalImg && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setModalImg(null)}
        >
          <img
            src={modalImg}
            className="max-w-[90%] max-h-[90%] rounded-xl shadow-2xl"
          />
        </div>
      )}

      <h3 className="text-xl font-bold text-center md:text-left">Reviews</h3>
      <p className="text-gray-600 text-center md:text-left text-sm">
        Happy pet? Leave a review!
      </p>

      {/* Review Cards */}
      <div className="grid md:grid-cols-2 gap-5">
        {loading && (
          <div className="rounded-xl border p-4 text-center text-gray-600">
            Loading reviews…
          </div>
        )}

        {!loading &&
          visible.map((r) => (
            <article
              key={r.id}
              className="rounded-xl border border-[#7B6C57]/30 bg-white p-5 shadow-md hover:shadow-lg transition-shadow animate-fadeIn flex flex-col gap-3"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Image
                    src="/paw.png"
                    width={32}
                    height={32}
                    alt="paw avatar"
                    className="rounded-full"
                  />
                  <h4 className="font-semibold">{r.name}</h4>
                </div>

                <div className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full shadow">
                  {r.rating} ★
                </div>
              </div>

              <p className="text-sm text-gray-700 leading-relaxed">{r.text}</p>

              {r.photoDataUrl && (
                <div
                  className="overflow-hidden rounded-lg border border-[#7B6C57] shadow cursor-pointer hover:scale-[1.01] transition"
                  onClick={() => setModalImg(r.photoDataUrl!)}
                >
                  <img
                    src={r.photoDataUrl}
                    alt="review photo"
                    className="w-full h-44 object-cover"
                  />
                </div>
              )}
            </article>
          ))}
      </div>

      {/* Form */}
      <div className="rounded-xl border border-[#7B6C57]/30 bg-white p-5 shadow-md">
        <h4 className="font-semibold mb-2">Leave a review</h4>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Your Name</label>
              <input
                className="input min-h-12 w-full focus:ring-2 focus:ring-[#7B6C57]/40"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label">Rating</label>
              <StarRating value={rating} onChange={setRating} size="lg" />
            </div>
          </div>

          <div>
            <label className="label">Review</label>
            <textarea
              className="input w-full focus:ring-2 focus:ring-[#7B6C57]/40"
              rows={4}
              placeholder="Tell us about your experience!"
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Photo (optional)</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="input h-12 w-full focus:ring-2 focus:ring-[#7B6C57]/40"
              onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
            />
            <p className="text-xs text-gray-500 mt-1">
              JPG/PNG recommended; larger images will be downscaled.
            </p>
          </div>

          <button
            type="submit"
            className="btn w-full sm:w-auto"
            disabled={submitting}
          >
            {submitting ? 'Submitting…' : 'Submit Review'}
          </button>

          {status === 'sent' && (
            <p className="text-xs text-green-600">Thank you for your review!</p>
          )}
          {status === 'error' && (
            <p className="text-xs text-red-600">Unable to submit review.</p>
          )}
        </form>
      </div>

      {/* Animation */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.45s ease-out;
        }
      `}</style>
    </section>
  );
}
