import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import {
  getR2PresignedUploadUrl,
  getR2StoredUrl,
  isR2Configured,
} from '@/lib/r2';

function formatFileSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
    }

    if (!isR2Configured()) {
      return NextResponse.json(
        {
          error:
            'Cloudflare R2 storage is not configured. Set CLOUDFLARE_R2_* environment variables.',
        },
        { status: 503 }
      );
    }

    const body = await req.json();
    const uploadType = (body.type as string) || 'cover';
    const bookId = (body.bookId as string) || `book-${Date.now()}`;
    const fileName = (body.fileName as string) || 'file';
    const fileSize = Number(body.fileSize) || 0;
    const contentType = (body.contentType as string) || 'application/octet-stream';

    const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const timestamp = Date.now();

    if (uploadType === 'cover') {
      const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!validMimes.includes(contentType) && !/\.(jpg|jpeg|png|webp)$/i.test(fileName)) {
        return NextResponse.json(
          { error: 'Invalid image format. Supported formats: JPG, PNG, WebP.' },
          { status: 400 }
        );
      }
      if (fileSize > 10 * 1024 * 1024) {
        return NextResponse.json({ error: 'Image size must not exceed 10 MB.' }, { status: 400 });
      }

      const key = `covers/${bookId}/${timestamp}-${safeName}`;
      const resolvedContentType = contentType || 'image/jpeg';
      const uploadUrl = await getR2PresignedUploadUrl(key, resolvedContentType);

      return NextResponse.json({
        uploadUrl,
        key,
        url: getR2StoredUrl(key),
        fileName,
        fileSize: formatFileSize(fileSize),
        contentType: resolvedContentType,
      });
    }

    if (uploadType === 'pdf') {
      if (contentType !== 'application/pdf' && !fileName.endsWith('.pdf')) {
        return NextResponse.json(
          { error: 'Invalid document format. Only PDF files are allowed.' },
          { status: 400 }
        );
      }
      if (fileSize > 50 * 1024 * 1024) {
        return NextResponse.json({ error: 'PDF size must not exceed 50 MB.' }, { status: 400 });
      }

      const key = `pdfs/${bookId}/${timestamp}-${safeName}`;
      const uploadUrl = await getR2PresignedUploadUrl(key, 'application/pdf');

      return NextResponse.json({
        uploadUrl,
        key,
        url: getR2StoredUrl(key),
        fileName,
        fileSize: formatFileSize(fileSize),
        contentType: 'application/pdf',
      });
    }

    return NextResponse.json({ error: 'Invalid upload type specified.' }, { status: 400 });
  } catch (error: unknown) {
    console.error('Presign upload error:', error);
    const message = error instanceof Error ? error.message : 'Failed to prepare upload.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
