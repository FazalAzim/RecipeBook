import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { getDbBookById } from '@/lib/db/books';
import {
  extractR2KeyFromStoredValue,
  getR2Object,
  isR2Configured,
} from '@/lib/r2';

export const runtime = 'nodejs';

function contentTypeFromPath(filePath: string): string {
  const lower = filePath.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  return 'image/jpeg';
}

async function streamFromUrl(url: string): Promise<NextResponse | null> {
  try {
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    if (!contentType.startsWith('image/')) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return null;
  }
}

/**
 * Serves book cover bytes at a short URL for Lemon Squeezy checkout media.
 * Must return the image itself (not a redirect) — LS does not reliably follow redirects
 * and rejects media URLs longer than 255 characters.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { bookId: rawId } = await params;
    const bookId = decodeURIComponent(rawId).replace(/\.jpe?g$/i, '').replace(/\.png$/i, '');
    const book = await getDbBookById(bookId);

    if (!book?.coverImageUrl) {
      return NextResponse.json({ error: 'Cover not found.' }, { status: 404 });
    }

    const cover = book.coverImageUrl;
    const title = (book.title || '').toLowerCase();

    // Title fallbacks for known storefront books (static public assets)
    const staticFallback =
      title.includes('dessert')
        ? 'books/dessert-dreams-cover.jpg'
        : title.includes('homemade')
          ? null
          : null;

    // 1) R2 object — stream bytes directly
    const key = extractR2KeyFromStoredValue(cover);
    if (key?.startsWith('covers/') && isR2Configured()) {
      try {
        const object = await getR2Object(key);
        if (object.Body) {
          const bytes = await object.Body.transformToByteArray();
          return new NextResponse(Buffer.from(bytes), {
            status: 200,
            headers: {
              'Content-Type': (object.ContentType as string) || contentTypeFromPath(key),
              'Cache-Control': 'public, max-age=86400, s-maxage=86400',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }
      } catch (err) {
        console.warn('R2 cover stream failed, trying fallbacks:', bookId, err);
      }
    }

    // 2) Local public asset (e.g. /books/dessert-dreams-cover.jpg)
    const localCandidates = [
      cover.startsWith('/') && !cover.startsWith('/api/') ? cover.replace(/^\/+/, '').split('?')[0] : null,
      staticFallback,
    ].filter(Boolean) as string[];

    for (const relative of localCandidates) {
      const filePath = path.join(process.cwd(), 'public', relative);
      const publicRoot = path.join(process.cwd(), 'public');
      if (!filePath.startsWith(publicRoot)) continue;
      try {
        const buffer = await readFile(filePath);
        return new NextResponse(buffer, {
          status: 200,
          headers: {
            'Content-Type': contentTypeFromPath(filePath),
            'Cache-Control': 'public, max-age=86400, s-maxage=86400',
            'Access-Control-Allow-Origin': '*',
          },
        });
      } catch {
        // try next candidate
      }
    }

    // 3) Absolute public image URL — proxy stream (keeps LS URL short)
    if (cover.startsWith('http://') || cover.startsWith('https://')) {
      const proxied = await streamFromUrl(cover);
      if (proxied) return proxied;
    }

    return NextResponse.json({ error: 'Unable to resolve cover.' }, { status: 404 });
  } catch (error: unknown) {
    console.error('Cover stream error:', error);
    return NextResponse.json({ error: 'Failed to load cover.' }, { status: 500 });
  }
}
