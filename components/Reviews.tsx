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
  { id: 'r1', name: 'Hannah M.', rating: 5, text: 'Millie is wonderful with our shy rescue! Dependable and kind.', createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7 },
  { id: 'r2', name: 'Jason P.', rating: 5, text: 'Great communication and our pup comes home happy and tired!', createdAt: Date.now() - 1000 * 60 * 60 * 24 * 12 },
  { id: 'r3', name: 'Emily R.', rating: 5, text: 'Absolutely love Millie! She treats my dog like family and always goes the extra mile.', createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20 },
  { id: 'r4', name: 'Tom & Sarah L.', rating: 5, text: 'We’ve used several sitters, but Millie is by far the best — super reliable and friendly!', createdAt: Date.now() - 1000 * 60 * 60 * 24 * 25 },
];

const MAX_VISIBLE = 10;

/* --------------------------- Star Rating --------------------------- */

function StarRating({ value, onChange, size = 'md' }: any) {
  const stars = [1, 2, 3, 4, 5];
  const sizeClass = size === 'lg' ? 'text-3xl' : 'text-2xl';

  return (
    <div className="flex items-center gap-1">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110 focus:scale-110"
        >
          <span className={`${sizeClass} ${value >= star ? 'text-yellow-500' : 'text-gray-300'}`}>
            ★
          </span>
        </button>
      ))}
    </div>
  );
}

/* ------------------------- Image Resize Helper ------------------------- */

async function fileToResizedDataURL(file: File, maxWidth = 1200, quality = 0.85) {
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
      i.onerror = () => reject(new Error("Failed to load image"));
      i.src = dataUrl;
    });

    const ratio = img.width > maxWidth ? maxWidth / img.width : 1;
    const canvas = document.createElement('canvas');
    canvas.width = img.width * ratio;
    canvas.height = img.height * ratio;
    const ctx = canvas.getContext('2d');
    if (!ctx) return dataUrl;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', quality);
  } catch {
    return undefined;
  }
}

/* ----------------------------- Reviews Main ----------------------------- */

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle');
  const [loading, setLoading] = useState(true);
  const [modalImg, setModalImg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /* ----------------------------- Load Reviews ----------------------------- */

  useEffect(() => {
  let cancelled = false;

  (async () => {
    try {
      const res = await fetch('/api/reviews', { cache: 'no-store' });
      const data = (await res.json()) as { reviews?: Review[] };
      const fromServer = (data.reviews ?? []).filter((r) => r.rating >= 4);

      const merged = [...PRESET_REVIEWS, ...fromServer]
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, MAX_VISIBLE);

      if (!cancelled) setReviews(merged);
    } finally {
      if (!cancelled) setLoading(false);
    }
  })();

  
  return () => {
    cancelled = true;
  };
}, []);


  /* ------------------------------ Submit Review ------------------------------ */

  async function handleSubmit(e: any) {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;

    let dataUrl;
    if (photo) dataUrl = await fileToResizedDataURL(photo);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, rating, text, photoDataUrl: dataUrl ?? null }),
      });

      const data = (await res.json()) as { review: Review };

      setReviews((prev) =>
        [data.review, ...prev].sort((a, b) => b.createdAt - a.createdAt).slice(0, MAX_VISIBLE)
      );

      setName('');
      setText('');
      setRating(5);
      setStatus('sent');

      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      setStatus('error');
    }
  }

  /* ----------------------------- Render Stars ----------------------------- */

  function renderStars(value: number) {
    return (
      <span className="text-yellow-500">
        {'★'.repeat(value)}
        <span className="text-gray-300">{'★'.repeat(5 - value)}</span>
      </span>
    );
  }

  /* ----------------------------- Visible Reviews ----------------------------- */

  const visible = useMemo(
    () => [...reviews].sort((a, b) => b.createdAt - a.createdAt),
    [reviews]
  );

  /* ----------------------------- Component Return ----------------------------- */

  return (
    <section className="space-y-4">

      {/* Modal for enlarged photos */}
      {modalImg && (
        <div
          onClick={() => setModalImg(null)}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
        >
          <img src={modalImg} className="max-w-[90%] max-h-[90%] rounded-xl shadow-2xl" />
        </div>
      )}

        <h3 className="text-xl font-bold text-center md:text-left">Reviews</h3>
        <p className="text-gray-600 text-center md:text-left text-sm">Happy pet? Leave a review!</p>

      {/* ----------------------------- Review Cards ----------------------------- */}

      <div className="grid md:grid-cols-2 gap-6">
        {loading ? (
          <div className="rounded-xl border p-4 text-center text-gray-600">Loading reviews…</div>
        ) : (
          visible.map((r) => (
            <article
              key={r.id}
              className="
                relative p-5 rounded-2xl bg-white border border-[#7B6C57]
                shadow-md shadow-[#7B6C57]/40
                hover:shadow-lg hover:shadow-[#7B6C57]/50
                transition-all duration-500
                animate-fadeIn
                overflow-hidden
              "
              style={{
                boxShadow:
                  '0 6px 18px rgba(123,108,87,0.40), 0 3px 9px rgba(123,108,87,0.30)',
              }}
            >
              {/* Inner vignette */}
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{ boxShadow: 'inset 0 0 18px rgba(0,0,0,0.22)' }}
              />

              {/* Content */}
              <div className="relative z-10 space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/paw.png"
                      width={34}
                      height={34}
                      alt="avatar"
                      className="rounded-full"
                    />
                    <h4 className="font-semibold">{r.name}</h4>
                  </div>

                  <div className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full shadow">
                    {r.rating} ★
                  </div>
                </div>

                {/* Review text */}
                <p className="text-sm leading-relaxed text-gray-800">{r.text}</p>

                {/* Photo */}
                {r.photoDataUrl && (
                  <div
                    onClick={() => setModalImg(r.photoDataUrl!)}
                    className="
                      overflow-hidden rounded-xl border border-[#7B6C57]
                      shadow cursor-pointer
                      hover:scale-[1.02] transition duration-300
                    "
                  >
                    <img
                      src={r.photoDataUrl}
                      className="w-full h-44 object-cover"
                      alt="review photo"
                    />
                  </div>
                )}
              </div>
            </article>
          ))
        )}
      </div>

      {/* ----------------------------- Form ----------------------------- */}

      <div
        className="
          p-6 rounded-2xl bg-white border border-[#7B6C57]
          shadow-md shadow-[#7B6C57]/40
        "
        style={{
          boxShadow:
            '0 6px 18px rgba(123,108,87,0.40), 0 3px 9px rgba(123,108,87,0.30)',
        }}
      >
        <h4 className="font-semibold mb-2">Leave a review</h4>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Your Name</label>
              <input
                className="input w-full min-h-12 focus:ring-2 focus:ring-[#7B6C57]/40"
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
          </div>

          <button className="btn w-full sm:w-auto" type="submit">
            Submit Review
          </button>

          {status === 'sent' && <p className="text-green-600 text-xs">Review submitted!</p>}
          {status === 'error' && <p className="text-red-600 text-xs">Unable to submit.</p>}
        </form>
      </div>

      {/* Animation */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.55s ease-out both;
        }
      `}</style>
    </section>
  );
}
