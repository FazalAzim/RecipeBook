import { NextRequest, NextResponse } from 'next/server';
import { getDbBookById, updateDbBook, deleteDbBook } from '@/lib/db/books';
import { getSessionUser } from '@/lib/auth';
import { normalizeCompareAtPrice } from '@/lib/pricing';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const book = await getDbBookById(id);

    if (!book) {
      return NextResponse.json({ error: 'Recipe book not found.' }, { status: 404 });
    }

    if (!book.isPublished) {
      const sessionUser = await getSessionUser();
      if (!sessionUser || sessionUser.role !== 'admin') {
        return NextResponse.json({ error: 'Recipe book not found or unpublished.' }, { status: 404 });
      }
    }

    return NextResponse.json({ book });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error fetching book.' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
    }

    const { id } = await params;
    const updates = await req.json();

    if ('compareAtPrice' in updates || 'price' in updates) {
      const existing = await getDbBookById(id);
      if (!existing) {
        return NextResponse.json({ error: 'Book not found.' }, { status: 404 });
      }

      const nextPrice =
        updates.price != null ? Number(updates.price) : Number(existing.price);

      if ('compareAtPrice' in updates) {
        updates.compareAtPrice = normalizeCompareAtPrice(nextPrice, updates.compareAtPrice);
      } else if (existing.compareAtPrice != null) {
        // Sale price changed: drop stale compare-at if it is no longer higher
        const kept = normalizeCompareAtPrice(nextPrice, existing.compareAtPrice);
        if (kept == null) {
          updates.compareAtPrice = undefined;
        }
      }
    }

    const updated = await updateDbBook(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Book not found.' }, { status: 404 });
    }

    return NextResponse.json({ book: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update recipe book.' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
    }

    const { id } = await params;
    const result = await deleteDbBook(id);

    return NextResponse.json({
      success: true,
      softDeleted: result.softDeleted,
      message: result.softDeleted
        ? 'Book has past purchases: unpublished safely to preserve customer downloads.'
        : 'Book deleted successfully.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete recipe book.' }, { status: 500 });
  }
}
