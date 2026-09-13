import { NextRequest, NextResponse } from 'next/server';
import { getDbBookById } from '@/lib/db/books';
import {
  extractR2KeyFromStoredValue,
  getR2PresignedDownloadUrl,
  hasR2PublicDomain,
  isR2Configured,
} from '@/lib/r2';

/**
 * Short, stable public cover URL for Lemon Squeezy checkout media
 * (their API rejects media URLs longer than 255 characters).
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { bookId } = await params;
    const book = await getDbBookById(bookId);

    if (!book?.coverImageUrl) {
      return NextResponse.json({ error: 'Cover not found.' }, { status: 404 });
    }

    const cover = book.coverImageUrl;

    // Absolute public URL already
    if (
      (cover.startsWith('http://') || cover.startsWith('https://')) &&
      !cover.includes('/api/media') &&
      !cover.includes('X-Amz-Signature') &&
      !cover.includes('r2.cloudflarestorage.com')
    ) {
      return NextResponse.redirect(cover, 302);
    }

    // Static public asset on this app
    if (cover.startsWith('/books/') || cover.startsWith('/favicon')) {
      const base = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
      if (base) {
        return NextResponse.redirect(`${base}${cover}`, 302);
      }
    }

    const key = extractR2KeyFromStoredValue(cover);
    if (key?.startsWith('covers/') && isR2Configured()) {
      if (hasR2PublicDomain()) {
        const publicUrl = (process.env.CLOUDFLARE_R2_PUBLIC_URL || '').replace(/\/$/, '');
        return NextResponse.redirect(`${publicUrl}/${key}`, 302);
      }
      const signed = await getR2PresignedDownloadUrl(key, 3600);
      return NextResponse.redirect(signed, 302);
    }

    // Fallback: relative media proxy on this origin
    if (cover.startsWith('/')) {
      const base = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
      if (base) {
        return NextResponse.redirect(`${base}${cover}`, 302);
      }
    }

    return NextResponse.json({ error: 'Unable to resolve cover.' }, { status: 404 });
  } catch (error: unknown) {
    console.error('Cover redirect error:', error);
    return NextResponse.json({ error: 'Failed to load cover.' }, { status: 500 });
  }
}
