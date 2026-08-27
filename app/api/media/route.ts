import { NextRequest, NextResponse } from 'next/server';
import {
  extractR2KeyFromStoredValue,
  getR2Object,
  getR2PresignedDownloadUrl,
  isR2Configured,
} from '@/lib/r2';

const ALLOWED_PREFIXES = ['covers/', 'pdfs/'] as const;

function isAllowedKey(key: string): boolean {
  if (!key || key.includes('..')) return false;
  return ALLOWED_PREFIXES.some((prefix) => key.startsWith(prefix));
}

export async function GET(req: NextRequest) {
  try {
    const keyParam = req.nextUrl.searchParams.get('key');
    if (!keyParam) {
      return NextResponse.json({ error: 'Missing file key.' }, { status: 400 });
    }

    const key = decodeURIComponent(keyParam);
    if (!isAllowedKey(key)) {
      return NextResponse.json({ error: 'Invalid file key.' }, { status: 400 });
    }

    if (!isR2Configured()) {
      return NextResponse.json({ error: 'File storage is not configured.' }, { status: 503 });
    }

    // Cover images are public marketplace assets.
    if (key.startsWith('covers/')) {
      const signedUrl = await getR2PresignedDownloadUrl(key, 3600);
      return NextResponse.redirect(signedUrl);
    }

    // PDFs must use the authorized download endpoint.
    return NextResponse.json(
      { error: 'Use /api/download/[bookId] for PDF access.' },
      { status: 403 }
    );
  } catch (error: unknown) {
    console.error('Media proxy error:', error);
    return NextResponse.json({ error: 'Failed to load media file.' }, { status: 500 });
  }
}

export async function HEAD(req: NextRequest) {
  try {
    const keyParam = req.nextUrl.searchParams.get('key');
    if (!keyParam) {
      return new NextResponse(null, { status: 400 });
    }

    const key = decodeURIComponent(keyParam);
    if (!key.startsWith('covers/') || !isR2Configured()) {
      return new NextResponse(null, { status: 404 });
    }

    const object = await getR2Object(key);
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Content-Type': (object.ContentType as string) || 'image/jpeg',
        'Content-Length': object.ContentLength?.toString() || '0',
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
