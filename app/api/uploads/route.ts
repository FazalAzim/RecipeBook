import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { uploadToR2, isR2Configured } from '@/lib/r2';

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const uploadType = (formData.get('type') as string) || 'cover'; // 'cover' | 'pdf'
    const bookId = (formData.get('bookId') as string) || `book-${Date.now()}`;

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const timestamp = Date.now();

    if (uploadType === 'cover') {
      // Validate Cover Image
      const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!validMimes.includes(file.type) && !/\.(jpg|jpeg|png|webp)$/i.test(file.name)) {
        return NextResponse.json(
          { error: 'Invalid image format. Supported formats: JPG, PNG, WebP.' },
          { status: 400 }
        );
      }
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: 'Image size must not exceed 10 MB.' }, { status: 400 });
      }

      const key = `covers/${bookId}/${timestamp}-${safeName}`;
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      if (isR2Configured()) {
        const uploadResult = await uploadToR2(buffer, key, file.type || 'image/jpeg');
        return NextResponse.json({
          url: uploadResult.url,
          key: uploadResult.key,
          fileName: file.name,
          fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        });
      } else {
        // Fallback for local testing before R2 credentials are set
        const base64 = `data:${file.type || 'image/jpeg'};base64,${buffer.toString('base64')}`;
        return NextResponse.json({
          url: base64,
          key,
          fileName: file.name,
          fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          notice: 'Saved locally as data URL (Cloudflare R2 credentials not set in .env.local)',
        });
      }
    } else if (uploadType === 'pdf') {
      // Validate PDF File
      if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
        return NextResponse.json(
          { error: 'Invalid document format. Only PDF files are allowed.' },
          { status: 400 }
        );
      }
      if (file.size > 50 * 1024 * 1024) {
        return NextResponse.json({ error: 'PDF size must not exceed 50 MB.' }, { status: 400 });
      }

      const key = `pdfs/${bookId}/${timestamp}-${safeName}`;
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      if (isR2Configured()) {
        const uploadResult = await uploadToR2(buffer, key, 'application/pdf');
        return NextResponse.json({
          url: uploadResult.url,
          key: uploadResult.key,
          fileName: file.name,
          fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        });
      } else {
        return NextResponse.json({
          url: `/api/download/${bookId}?sample=true`,
          key,
          fileName: file.name,
          fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          notice: 'Saved locally (Cloudflare R2 credentials not set in .env.local)',
        });
      }
    } else {
      return NextResponse.json({ error: 'Invalid upload type specified.' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('File upload API error:', error);
    return NextResponse.json({ error: error.message || 'File upload failed.' }, { status: 500 });
  }
}
