import { NextRequest, NextResponse } from 'next/server';
import { getDbBookById, updateDbBook, deleteDbBook } from '@/lib/db/books';
import { getSessionUser } from '@/lib/auth';

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
