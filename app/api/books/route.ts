import { NextRequest, NextResponse } from 'next/server';
import { getDbBooks, createDbBook } from '@/lib/db/books';
import { getSessionUser } from '@/lib/auth';
import { normalizeCompareAtPrice } from '@/lib/pricing';
import type { FilterState } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const filters: Partial<FilterState> = {
      searchQuery: searchParams.get('search') || searchParams.get('searchQuery') || '',
      category: searchParams.get('category') || '',
      cuisine: searchParams.get('cuisine') || '',
      selectedTag: searchParams.get('tag') || searchParams.get('selectedTag') || '',
      sortBy: (searchParams.get('sortBy') as any) || 'featured',
    };

    const includeUnpublished = searchParams.get('includeUnpublished') === 'true';

    // If requesting unpublished books, verify admin authorization
    if (includeUnpublished) {
      const sessionUser = await getSessionUser();
      if (!sessionUser || sessionUser.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
      }
    }

    const books = await getDbBooks(filters, includeUnpublished);
    return NextResponse.json({ books });
  } catch (error: any) {
    console.error('Error fetching books:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch recipe books.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Administrator access required.' }, { status: 403 });
    }

    const bookData = await req.json();

    if (!bookData.title || !bookData.author || !bookData.price) {
      return NextResponse.json(
        { error: 'Title, author, and price are required fields.' },
        { status: 400 }
      );
    }

    const price = Number(bookData.price);
    const compareAtPrice = normalizeCompareAtPrice(price, bookData.compareAtPrice);

    const requestedId =
      typeof bookData.id === 'string' && /^book-[a-zA-Z0-9_-]+$/.test(bookData.id.trim())
        ? bookData.id.trim()
        : undefined;

    const newBook = await createDbBook(
      {
        title: bookData.title.trim(),
        author: bookData.author.trim(),
        description: bookData.description || '',
        category: bookData.category || 'General',
        cuisine: bookData.cuisine || 'International',
        tags: Array.isArray(bookData.tags) ? bookData.tags : [],
        price,
        ...(compareAtPrice != null ? { compareAtPrice } : {}),
        coverImageUrl:
          bookData.coverImageUrl ||
          'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80',
        pdfFileUrl: bookData.pdfFileUrl || '',
        pdfFileName: bookData.pdfFileName || `${bookData.title.replace(/\s+/g, '_')}.pdf`,
        fileSize: bookData.fileSize || '5.0 MB',
        pageCount: Number(bookData.pageCount || 100),
        isPublished: Boolean(bookData.isPublished ?? true),
        featured: Boolean(bookData.featured ?? false),
      },
      requestedId ? { bookId: requestedId } : undefined
    );

    return NextResponse.json({ book: newBook }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating book:', error);
    return NextResponse.json({ error: error.message || 'Failed to create recipe book.' }, { status: 500 });
  }
}
