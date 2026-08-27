import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

function env(value: string | undefined): string {
  return (value || '').trim();
}

const endpoint = env(process.env.CLOUDFLARE_R2_ENDPOINT);
const accessKeyId = env(process.env.CLOUDFLARE_R2_ACCESS_KEY_ID);
const secretAccessKey = env(process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY);
const bucketName = env(process.env.CLOUDFLARE_R2_BUCKET_NAME) || 'recipe-bucket';
const publicUrl = env(process.env.CLOUDFLARE_R2_PUBLIC_URL);

export function isR2Configured(): boolean {
  return Boolean(endpoint && accessKeyId && secretAccessKey && bucketName);
}

/**
 * The S3 API endpoint is not a browser-accessible public URL.
 * Only a custom R2 public domain (e.g. https://cdn.example.com) can be used directly.
 */
export function hasR2PublicDomain(): boolean {
  if (!publicUrl) return false;
  if (publicUrl.includes('r2.cloudflarestorage.com')) return false;
  return true;
}

let s3ClientInstance: S3Client | null = null;

function getS3Client(): S3Client | null {
  if (!isR2Configured()) {
    return null;
  }
  if (!s3ClientInstance) {
    s3ClientInstance = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }
  return s3ClientInstance;
}

export interface UploadResult {
  key: string;
  url: string;
  bucket: string;
  size: number;
  contentType: string;
}

/**
 * Extract the R2 object key from a stored URL, proxy path, or raw key.
 */
export function extractR2KeyFromStoredValue(value: string): string | null {
  if (!value) return null;

  const trimmed = value.trim();
  if (trimmed.startsWith('covers/') || trimmed.startsWith('pdfs/')) {
    return trimmed;
  }

  try {
    if (trimmed.startsWith('/api/media')) {
      const query = trimmed.includes('?') ? trimmed.split('?')[1] : '';
      const key = new URLSearchParams(query).get('key');
      return key ? decodeURIComponent(key) : null;
    }

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const pathname = new URL(trimmed).pathname.replace(/^\/+/, '');
      const bucketPrefix = `${bucketName}/`;
      const normalizedPath = pathname.startsWith(bucketPrefix)
        ? pathname.slice(bucketPrefix.length)
        : pathname;

      if (normalizedPath.startsWith('covers/') || normalizedPath.startsWith('pdfs/')) {
        return normalizedPath;
      }
    }
  } catch {
    // Fall through
  }

  const coversIdx = trimmed.indexOf('covers/');
  if (coversIdx >= 0) {
    return trimmed.substring(coversIdx).split('?')[0];
  }

  const pdfsIdx = trimmed.indexOf('pdfs/');
  if (pdfsIdx >= 0) {
    return trimmed.substring(pdfsIdx).split('?')[0];
  }

  return null;
}

/**
 * Returns a browser-safe URL for an R2 object (via app proxy when bucket is private).
 */
export function getR2ProxyUrl(key: string): string {
  return `/api/media?key=${encodeURIComponent(key)}`;
}

/**
 * Rewrites stored R2 URLs to the app media proxy when needed.
 */
export function resolveR2AssetUrl(storedUrl: string): string {
  if (!storedUrl) return storedUrl;
  if (storedUrl.startsWith('data:')) return storedUrl;

  const key = extractR2KeyFromStoredValue(storedUrl);
  if (!key) return storedUrl;

  if (hasR2PublicDomain()) {
    return `${publicUrl.replace(/\/$/, '')}/${key}`;
  }

  return getR2ProxyUrl(key);
}

/**
 * Uploads a file buffer directly to Cloudflare R2 bucket
 */
export async function uploadToR2(
  fileBuffer: Buffer | Uint8Array,
  key: string,
  contentType: string
): Promise<UploadResult> {
  const client = getS3Client();
  if (!client) {
    throw new Error('Cloudflare R2 is not configured in environment variables.');
  }

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
  });

  await client.send(command);

  const fileUrl = hasR2PublicDomain()
    ? `${publicUrl.replace(/\/$/, '')}/${key}`
    : getR2ProxyUrl(key);

  return {
    key,
    url: fileUrl,
    bucket: bucketName,
    size: fileBuffer.byteLength,
    contentType,
  };
}

/**
 * Generates a short-lived secure signed download URL for private files
 */
export async function getR2PresignedDownloadUrl(
  key: string,
  expiresInSeconds = 300
): Promise<string> {
  const client = getS3Client();
  if (!client) {
    throw new Error('Cloudflare R2 is not configured in environment variables.');
  }

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

/**
 * Retrieves a file object from R2 directly for server-side streaming
 */
export async function getR2Object(key: string) {
  const client = getS3Client();
  if (!client) {
    throw new Error('Cloudflare R2 is not configured in environment variables.');
  }

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  return client.send(command);
}

/**
 * Deletes a file from R2
 */
export async function deleteFromR2(key: string): Promise<boolean> {
  const client = getS3Client();
  if (!client) return false;

  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    await client.send(command);
    return true;
  } catch (error) {
    console.error(`Error deleting ${key} from R2:`, error);
    return false;
  }
}

/**
 * Checks if a file exists in R2
 */
export async function checkFileExistsInR2(key: string): Promise<boolean> {
  const client = getS3Client();
  if (!client) return false;

  try {
    const command = new HeadObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    await client.send(command);
    return true;
  } catch {
    return false;
  }
}
