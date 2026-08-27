import { getDb, isMongoConfigured } from '../mongodb';
import { resolveR2AssetUrl } from '../r2';
import type { LibraryItem, OrderItem } from '../types';

let inMemoryLibrary: LibraryItem[] = [];

export async function addItemsToLibrary(params: {
  userId: string;
  customerEmail: string;
  orderId: string;
  items: OrderItem[];
}): Promise<void> {
  const { userId, customerEmail, orderId, items } = params;
  const now = new Date();
  const db = await getDb();

  for (const item of items) {
    const libraryId = `${userId}_${item.bookId}_${orderId.substring(4, 9)}`;
    const libraryEntry: LibraryItem = {
      id: libraryId,
      userId,
      customerEmail: customerEmail.toLowerCase().trim(),
      bookId: item.bookId,
      orderId,
      title: item.title,
      author: item.author || 'Master Chef',
      coverImageUrl: item.coverImageUrl,
      pdfFileName: item.pdfFileName || `${item.title}.pdf`,
      fileSize: item.fileSize || '5.0 MB',
      pdfFileUrl: item.pdfFileUrl || '',
      purchasedAt: now.toISOString(),
      downloadCount: 0,
      lastDownloadedAt: null,
    };

    if (db && isMongoConfigured()) {
      try {
        await db.collection('libraries').updateOne(
          { userId, bookId: item.bookId },
          {
            $set: {
              ...libraryEntry,
              purchasedAt: now,
            },
          },
          { upsert: true }
        );
      } catch (err) {
        console.warn('Error saving to MongoDB libraries:', err);
      }
    }

    const existingIdx = inMemoryLibrary.findIndex(
      (l) => l.userId === userId && l.bookId === item.bookId
    );
    if (existingIdx > -1) {
      inMemoryLibrary[existingIdx] = libraryEntry;
    } else {
      inMemoryLibrary.unshift(libraryEntry);
    }
  }
}

export async function getDbUserLibrary(userId?: string, userEmail?: string): Promise<LibraryItem[]> {
  if (!userId && !userEmail) return [];

  const itemsMap = new Map<string, LibraryItem>();
  const db = await getDb();

  if (db && isMongoConfigured()) {
    try {
      const orConditions: Array<Record<string, unknown>> = [];
      if (userId) orConditions.push({ userId });
      if (userEmail) orConditions.push({ customerEmail: userEmail.toLowerCase().trim() });

      const docs = await db
        .collection('libraries')
        .find({ $or: orConditions })
        .sort({ purchasedAt: -1 })
        .toArray();

      docs.forEach((d) => {
        const item: LibraryItem = {
          id: (d.id || d._id.toString()) as string,
          userId: d.userId as string,
          customerEmail: d.customerEmail as string,
          bookId: d.bookId as string,
          orderId: d.orderId as string,
          title: d.title as string,
          author: d.author as string,
          coverImageUrl: resolveR2AssetUrl(d.coverImageUrl as string),
          pdfFileName: d.pdfFileName as string,
          fileSize: d.fileSize as string,
          pdfFileUrl: d.pdfFileUrl as string,
          purchasedAt: d.purchasedAt ? new Date(d.purchasedAt).toISOString() : new Date().toISOString(),
          downloadCount: Number(d.downloadCount || 0),
          lastDownloadedAt: d.lastDownloadedAt ? new Date(d.lastDownloadedAt).toISOString() : null,
        };
        itemsMap.set(item.bookId, item);
      });

      return Array.from(itemsMap.values());
    } catch (err) {
      console.warn('Error querying MongoDB libraries:', err);
    }
  }

  inMemoryLibrary.forEach((item) => {
    const matchUser = userId && item.userId === userId;
    const matchEmail = userEmail && item.customerEmail?.toLowerCase() === userEmail.toLowerCase().trim();
    if (matchUser || matchEmail) {
      itemsMap.set(item.bookId, item);
    }
  });

  return Array.from(itemsMap.values());
}

export async function isDbBookPurchased(
  userId?: string,
  userEmail?: string,
  bookId?: string
): Promise<boolean> {
  if (!bookId || (!userId && !userEmail)) return false;
  const library = await getDbUserLibrary(userId, userEmail);
  return library.some((item) => item.bookId === bookId);
}

export async function recordDbDownload(identifier: string, bookId: string): Promise<void> {
  const db = await getDb();
  const now = new Date();

  if (db && isMongoConfigured()) {
    try {
      await db.collection('libraries').updateOne(
        {
          bookId,
          $or: [{ userId: identifier }, { customerEmail: identifier.toLowerCase().trim() }],
        },
        {
          $inc: { downloadCount: 1 },
          $set: { lastDownloadedAt: now },
        }
      );
    } catch (err) {
      console.warn('Error recording download in MongoDB:', err);
    }
  }

  const item = inMemoryLibrary.find(
    (l) =>
      l.bookId === bookId &&
      (l.userId === identifier || l.customerEmail?.toLowerCase() === identifier.toLowerCase().trim())
  );
  if (item) {
    item.downloadCount = (item.downloadCount || 0) + 1;
    item.lastDownloadedAt = now.toISOString();
  }
}
