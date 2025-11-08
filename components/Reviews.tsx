'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Review = {
  id: string;
  name: string;
  rating: number; // 1–5
  text: string;
  photoDataUrl?: string;
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


const LS_KEY = 'millies-reviews-v1';

/* --------------------------- StarRating component -------------------------- */

function StarRating({
  value,
  onChange,
  size = 'md',
  idBase = 'rating',
}: {
  value: number; // 1-5
  onChange: (next: number) => void;
  size?: 'sm' | 'md' | 'lg';
  idBase?: string;
}) {
  const stars = [1, 2, 3, 4, 5];
  const sizeClass =
    size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-lg' : 'text-2xl';

  return (
    <div role="radiogroup" aria-label="Star rating" className="flex items-center gap-1">
      {stars.map((star) => {
        const checked = value >= star;
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            id={`${idBase}-${star}`}
            onClick={() => onChange(star)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                e.preventDefault();
                onChange(Math.min(5, value + 1));
              } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                e.preventDefault();
                onChange(Math.max(1, value - 1));
              }
            }}
            className={[
              'transition-transform',
              'duration-150',
              'hover:scale-110',
              'focus:scale-110',
              'outline-none',
            ].join(' ')}
          >
            <span
              className={`${sizeClass} leading-none ${
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

/* -------------------------- Image resize helper --------------------------- */

async function fileToResizedDataURL(
  file: File,
  maxWidth = 1200,
  quality = 0.85
): Promise<string | undefined> {
  try {
    // Prefer createImageBitmap if available
    if ('createImageBitmap' in window) {
      const bitmap = await createImageBitmap(file);
      const ratio = bitmap.width > maxWidth ? maxWidth / bitmap.width : 1;
      const targetW = Math.round(bitmap.width * ratio);
      const targetH = Math.round(bitmap.height * ratio);

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) return undefined;
      ctx.drawImage(bitmap, 0, 0, targetW, targetH);
      return canvas.toDataURL('image/jpeg', quality);
    }

    // Fallback: use Image + FileReader
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result as string);
      fr.onerror = () => reject(new Error('Failed to read image'));
      fr.readAsDataURL(file);
    });

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('Failed to load image'));
      i.src = dataUrl;
    });

    const ratio = img.width > maxWidth ? maxWidth / img.width : 1;
    const targetW = Math.round(img.width * ratio);
    const targetH = Math.round(img.height * ratio);

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;
    ctx.drawImage(img, 0, 0, targetW, targetH);
    return canvas.toDataURL('image/jpeg', quality);
  } catch {
    return undefined;
  }
}

/* --------------------------------- Reviews -------------------------------- */

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [text, setText] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      const saved = raw ? (JSON.parse(raw) as Review[]) : [];
      const merged = [...PRESET_REVIEWS, ...saved];
      setReviews(merged.filter((r) => r.rating >= 4));
    } catch {
      setReviews(PRESET_REVIEWS.filter((r) => r.rating >= 4));
    }
  }, []);

  // Save only user-submitted reviews in LS (not presets)
  const userReviews = useMemo(
    () => reviews.filter((r) => !PRESET_REVIEWS.find((p) => p.id === r.id)),
    [reviews]
  );
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(userReviews));
    } catch {}
  }, [userReviews]);

  function renderStars(value: number) {
    return (
      <span aria-label={`${value} out of 5 stars`} className="text-yellow-500">
        {'★'.repeat(value)}
        <span className="text-gray-300">{'★'.repeat(5 - value)}</span>
      </span>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;

    setSubmitting(true);

    let dataUrl: string | undefined = undefined;
    if (photo) {
      dataUrl = await fileToResizedDataURL(photo, 1200, 0.85);
    }

    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? 'u-' + crypto.randomUUID()
        : 'u-' + Math.random().toString(36).slice(2);

    const next: Review = {
      id,
      name: name.trim(),
      rating: Math.max(1, Math.min(5, rating)),
      text: text.trim(),
      photoDataUrl: dataUrl,
      createdAt: Date.now(),
    };

    // Add to list (still show only 4–5★), sort newest first
    setReviews((prev) =>
      [next, ...prev]
        .filter((r) => r.rating >= 4)
        .sort((a, b) => b.createdAt - a.createdAt)
    );

    // Reset form
    setName('');
    setRating(5);
    setText('');
    setPhoto(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setSubmitting(false);
  }

  const visible = useMemo(
    () => [...reviews].sort((a, b) => b.createdAt - a.createdAt),
    [reviews]
  );

  return (
    <section className="space-y-4">
      <h3 className="text-lg md:text-xl font-bold text-center md:text-left">Reviews</h3>
      <p className="text-gray-600 text-center md:text-left text-sm">
        Happy pet? Leave a review!
      </p>

      {/* Reviews grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {visible.length === 0 && (
          <div className="rounded-xl border p-4 text-center text-gray-600">
            No reviews yet. Be the first to share your experience!
          </div>
        )}
        {visible.map((r) => (
          <article key={r.id} className="rounded-xl border bg-white p-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">{r.name}</h4>
              {renderStars(r.rating)}
            </div>
            <p className="mt-2 text-sm text-gray-700">{r.text}</p>
            {r.photoDataUrl && (
              <div className="mt-3 overflow-hidden rounded-lg border">
                <img
                  src={r.photoDataUrl}
                  alt={`${r.name}'s review photo`}
                  className="w-full h-40 object-cover"
                />
              </div>
            )}
          </article>
        ))}
      </div>

      {/* Form */}
      <div className="rounded-xl border bg-white p-4">
        <h4 className="font-semibold text-center md:text-left">Leave a review</h4>
        <form className="mt-3 grid gap-3" onSubmit={handleSubmit}>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="rev-name">Your Name</label>
              <input
                id="rev-name"
                className="input min-h-12 w-full"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="rev-rating">Rating</label>
              <div className="flex items-center justify-between sm:justify-start gap-3">
                <StarRating
                  value={rating}
                  onChange={(n) => setRating(n)}
                  size="lg"
                  idBase="rev-rating"
                />
                <span className="text-sm text-gray-600" aria-live="polite">
                  {rating} / 5
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="label" htmlFor="rev-text">Review</label>
            <textarea
              id="rev-text"
              className="input w-full"
              rows={4}
              placeholder="Tell us about your experience!"
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="rev-photo">Photo (optional)</label>
            <input
              ref={fileInputRef}
              id="rev-photo"
              type="file"
              accept="image/*"
              className="input h-12 w-full"
              onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
            />
            <p className="text-xs text-gray-500 mt-1">
              JPG/PNG recommended; larger images will be downscaled.
            </p>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <button
              type="submit"
              className="btn w-full max-w-xs sm:w-auto"
              disabled={submitting}
            >
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
