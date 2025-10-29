import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const runtime = 'edge'; 

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }

    
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }


    const key = `vax/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;

    const blob = await put(key, file, {
      access: 'public',
      contentType: file.type || 'application/octet-stream',
    });

    return NextResponse.json({ url: blob.url });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Upload failed' }, { status: 500 });
  }
}
