import { NextRequest, NextResponse } from 'next/server';
import { isDbBookPurchased, recordDbDownload } from '@/lib/db/library';
import { getDbBookById } from '@/lib/db/books';
import { getSessionUser } from '@/lib/auth';
import {
  getR2Object,
  getR2PresignedDownloadUrl,
  isR2Configured,
  resolvePdfStorageKey,
} from '@/lib/r2';

function generateSamplePdfBuffer(title: string, author: string): Buffer {
  const content = `%PDF-1.4
%
1 0 obj
<<
  /Type /Catalog
  /Pages 2 0 R
>>
endobj
2 0 obj
<<
  /Type /Pages
  /Kids [3 0 R]
  /Count 1
>>
endobj
3 0 obj
<<
  /Type /Page
  /Parent 2 0 R
  /MediaBox [0 0 612 792]
  /Resources <<
    /Font <<
      /F1 4 0 R
    >>
  >>
  /Contents 5 0 R
>>
endobj
4 0 obj
<<
  /Type /Font
  /Subtype /Type1
  /BaseFont /Helvetica-Bold
>>
endobj
5 0 obj
<< /Length 320 >>
stream
BT
/F1 22 Tf
50 700 Td
(${title.replace(/[()]/g, '')}) Tj
/F1 14 Tf
0 -30 Td
(Author: ${author.replace(/[()]/g, '')}) Tj
0 -40 Td
(Official Edition - Verified RecipeBooks Purchase) Tj
0 -30 Td
(Thank you for purchasing this authentic digital recipe cookbook!) Tj
0 -30 Td
(Enjoy your culinary journey with full recipes, photos, and guides.) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000015 00000 n 
0000000068 00000 n 
0000000125 00000 n 
0000000251 00000 n 
0000000336 00000 n 
trailer
<<
  /Size 6
  /Root 1 0 R
>>
startxref
710
%%EOF`;

  return Buffer.from(content, 'utf-8');
}

async function streamPdfFromR2(key: string, fileName: string): Promise<NextResponse> {
  const object = await getR2Object(key);
  if (!object.Body) {
    throw new Error('PDF file is empty in storage.');
  }

  const bytes = await object.Body.transformToByteArray();

  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: {
      'Content-Type': (object.ContentType as string) || 'application/pdf',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
      'Content-Length': String(bytes.byteLength),
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { bookId } = await params;
    const { searchParams } = new URL(req.url);
    const emailParam = searchParams.get('email');
    const directSample = searchParams.get('sample') === 'true';

    const sessionUser = await getSessionUser();
    const isAdmin = sessionUser?.role === 'admin';
    const userId = sessionUser?.id;
    const userEmail = emailParam || sessionUser?.email;

    const book = await getDbBookById(bookId);
    if (!book) {
      return NextResponse.json({ error: 'Recipe book not found.' }, { status: 404 });
    }

    // Preview placeholder only — never for real purchases.
    if (directSample && isAdmin) {
      const fileName = book.pdfFileName || `${book.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      const pdfBuffer = generateSamplePdfBuffer(book.title, book.author);
      return new NextResponse(new Uint8Array(pdfBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
          'Content-Length': pdfBuffer.byteLength.toString(),
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });
    }

    let isAuthorized = isAdmin;

    if (!isAuthorized && (userId || userEmail)) {
      isAuthorized = await isDbBookPurchased(userId, userEmail, bookId);
    }

    if (!isAuthorized) {
      return NextResponse.json(
        {
          error: 'Access Denied: You have not purchased this recipe book or your session has expired.',
        },
        { status: 403 }
      );
    }

    const identifier = userId || userEmail || 'verified_customer';
    await recordDbDownload(identifier, bookId);

    const fileName = book.pdfFileName || `${book.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

    if (!isR2Configured()) {
      return NextResponse.json(
        {
          error:
            'PDF storage is not configured on this server. Please contact support or re-upload the cookbook PDF from the admin panel after storage is configured.',
        },
        { status: 503 }
      );
    }

    const storageKey = await resolvePdfStorageKey(book.id, book.pdfFileUrl, book.pdfFileName);
    if (!storageKey) {
      return NextResponse.json(
        {
          error:
            'The cookbook PDF was not found in storage. Please re-upload the PDF from Admin → Edit Book.',
        },
        { status: 404 }
      );
    }

    // Presigned redirect handles large files without serverless response-size limits.
    try {
      const signedUrl = await getR2PresignedDownloadUrl(storageKey, 300);
      return NextResponse.redirect(signedUrl);
    } catch (presignErr) {
      console.warn('R2 presigned URL failed, streaming PDF directly:', presignErr);
      return streamPdfFromR2(storageKey, fileName);
    }
  } catch (error: unknown) {
    console.error('Download error:', error);
    const message = error instanceof Error ? error.message : 'Error processing book download.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
