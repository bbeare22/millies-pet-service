import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

type ReviewRow = {
  id: string;
  name: string;
  rating: number;
  text: string;
  photoDataUrl: string | null;
  createdAt: number;
};

export async function GET() {
  try {
    const { rows } = await pool.query(
      `
      SELECT
        id,
        name,
        rating,
        text,
        photo_data_url AS "photoDataUrl",
        EXTRACT(EPOCH FROM created_at) * 1000 AS "createdAt"
      FROM reviews
      WHERE rating >= 4
      ORDER BY created_at DESC
      LIMIT 10;
      `
    );

    return NextResponse.json({ reviews: rows as ReviewRow[] });
  } catch (err) {
    console.error('GET /api/reviews error:', err);
    return NextResponse.json(
      { error: 'Failed to load reviews' },
      { status: 500 }
    );
  }
}

// POST /api/reviews – create a new review
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const name = String(body.name ?? '').trim();
    const rating = Number(body.rating ?? 0);
    const text = String(body.text ?? '').trim();
    const photoDataUrl =
      typeof body.photoDataUrl === 'string' && body.photoDataUrl.length > 0
        ? body.photoDataUrl
        : null;

    if (!name || !text || !Number.isFinite(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Invalid review payload' },
        { status: 400 }
      );
    }

    const { rows } = await pool.query(
      `
      INSERT INTO reviews (name, rating, text, photo_data_url)
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        name,
        rating,
        text,
        photo_data_url AS "photoDataUrl",
        EXTRACT(EPOCH FROM created_at) * 1000 AS "createdAt";
      `,
      [name, rating, text, photoDataUrl]
    );

    const review = rows[0] as ReviewRow;

    return NextResponse.json({ review });
  } catch (err) {
    console.error('POST /api/reviews error:', err);
    return NextResponse.json(
      { error: 'Failed to save review' },
      { status: 500 }
    );
  }
}
