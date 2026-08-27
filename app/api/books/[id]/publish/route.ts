import { NextRequest, NextResponse } from 'next/server';
import { toggleDbBookPublish, getDbBookById } from '@/lib/db/books';
import { getSessionUser } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { isPublished } = body;

    if (typeof isPublished !== 'boolean') {
      return NextResponse.json({ error: 'isPublished boolean is required.' }, { status: 400 });
    }

    await toggleDbBookPublish(id, isPublished);
    const book = await getDbBookById(id);

    return NextResponse.json({ book });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update publish state.' }, { status: 500 });
  }
}
