export interface UploadedAsset {
  url: string;
  key: string;
  fileName: string;
  fileSize: string;
}

/**
 * Uploads a cover image or PDF via presigned R2 URL (browser → R2 directly).
 * Avoids Vercel's ~4.5 MB serverless request body limit for large PDFs.
 */
export async function uploadBookAsset(
  file: File,
  type: 'cover' | 'pdf',
  bookId: string
): Promise<UploadedAsset> {
  const contentType =
    file.type || (type === 'pdf' ? 'application/pdf' : 'image/jpeg');

  const presignRes = await fetch('/api/uploads/presign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type,
      bookId,
      fileName: file.name,
      fileSize: file.size,
      contentType,
    }),
  });

  if (!presignRes.ok) {
    const errData = await presignRes.json().catch(() => ({}));
    throw new Error(
      errData.error ||
        (type === 'pdf'
          ? 'PDF upload setup failed. Ensure Cloudflare R2 is configured on this deployment.'
          : 'Cover upload setup failed.')
    );
  }

  const meta = (await presignRes.json()) as UploadedAsset & {
    uploadUrl: string;
    contentType: string;
  };

  const putRes = await fetch(meta.uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': meta.contentType,
    },
  });

  if (!putRes.ok) {
    throw new Error(
      `Direct upload to storage failed (${putRes.status}). ` +
        'In Cloudflare R2 bucket settings, add a CORS rule allowing PUT from your site origin.'
    );
  }

  return {
    url: meta.url,
    key: meta.key,
    fileName: meta.fileName,
    fileSize: meta.fileSize,
  };
}
