import { getDb, isMongoConfigured } from '../mongodb';
import { resolveR2AssetUrl } from '../r2';
import type { Book, FilterState } from '../types';

/** Legacy demo/seed catalog IDs — removed so only admin-created books remain. */
const LEGACY_SEED_BOOK_IDS = [
  'book-pk-01',
  'book-asia-04',
  'book-it-02',
  'book-med-03',
  'book-des-05',
  'book-fam-06',
  'book-eu-dessert-01',
];

const LEGACY_SEED_CATEGORIES = ['Pakistani & South Asian', 'Asian & Street Food'];

// Runtime cache when MongoDB is unavailable (dev without DB)
let inMemoryBooks: Book[] = [];

let legacyBooksPurged = false;

/** One-time cleanup of hardcoded seed/demo books from MongoDB. */
export async function purgeLegacySeedBooks(): Promise<void> {
  if (legacyBooksPurged) return;

  const db = await getDb();
  if (!db) return;

  const result = await db.collection('books').deleteMany({
    $or: [
      { id: { $in: LEGACY_SEED_BOOK_IDS } },
      { category: { $in: LEGACY_SEED_CATEGORIES } },
    ],
  });

  if (result.deletedCount > 0) {
    console.info(`Removed ${result.deletedCount} legacy seed cookbook(s) from MongoDB.`);
  }

  legacyBooksPurged = true;
}

function mapDocToBook(d: Record<string, unknown>): Book {
  const id = (d.id || (d._id as { toString(): string }).toString()) as string;
  return {
    id,
    title: d.title as string,
    author: d.author as string,
    description: d.description as string,
    category: d.category as string,
    cuisine: d.cuisine as string,
    tags: (d.tags || []) as string[],
    price: Number(d.price),
    coverImageUrl: resolveR2AssetUrl((d.coverImageUrl || '') as string),
    pdfFileUrl: (d.pdfFileUrl || '') as string,
    pdfFileName: (d.pdfFileName || '') as string,
    fileSize: (d.fileSize || '') as string,
    pageCount: Number(d.pageCount || 100),
    salesCount: Number(d.salesCount || 0),
    isPublished: Boolean(d.isPublished),
    featured: Boolean(d.featured),
    rating: Number(d.rating || 5.0),
    reviewCount: Number(d.reviewCount || 1),
    createdAt: d.createdAt ? new Date(d.createdAt as string).toISOString() : new Date().toISOString(),
    updatedAt: d.updatedAt ? new Date(d.updatedAt as string).toISOString() : new Date().toISOString(),
  };
}

export async function getDbBooks(
  filters?: Partial<FilterState>,
  includeUnpublished = false
): Promise<Book[]> {
  const db = await getDb();

  let books: Book[];

  if (db && isMongoConfigured()) {
    try {
      await purgeLegacySeedBooks();

      const query: Record<string, unknown> = {};
      if (!includeUnpublished) {
        query.isPublished = true;
      }

      const docs = await db.collection('books').find(query).toArray();
      books = docs.map((d) => mapDocToBook(d as Record<string, unknown>));
    } catch (err) {
      console.warn('MongoDB query error for books, using memory fallback:', err);
      books = [...inMemoryBooks];
    }
  } else {
    books = [...inMemoryBooks];
  }

  if (!includeUnpublished) {
    books = books.filter((b) => b.isPublished);
  }

  return applyFilters(books, filters);
}

export async function getDbBookById(bookId: string): Promise<Book | null> {
  const db = await getDb();
  if (db && isMongoConfigured()) {
    try {
      await purgeLegacySeedBooks();

      const doc = await db.collection('books').findOne({
        $or: [{ id: bookId }, { _id: (bookId.length === 24 ? { $oid: bookId } : undefined) as any }],
      });
      if (doc) {
        return mapDocToBook(doc as Record<string, unknown>);
      }
    } catch (err) {
      console.warn('Error fetching book from MongoDB:', err);
    }
  }

  return inMemoryBooks.find((b) => b.id === bookId) || null;
}

export async function createDbBook(
  bookData: Omit<Book, 'id' | 'createdAt' | 'updatedAt' | 'salesCount'>,
  options?: { bookId?: string }
): Promise<Book> {
  const bookId = options?.bookId || `book-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date();

  const newBook: Book = {
    ...bookData,
    id: bookId,
    salesCount: 0,
    rating: 5.0,
    reviewCount: 1,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  const db = await getDb();
  if (db && isMongoConfigured()) {
    await db.collection('books').insertOne({
      ...newBook,
      createdAt: now,
      updatedAt: now,
    });
  }

  inMemoryBooks.unshift(newBook);
  return newBook;
}

export async function updateDbBook(bookId: string, updates: Partial<Book>): Promise<Book | null> {
  const now = new Date();
  const db = await getDb();

  if (db && isMongoConfigured()) {
    await db.collection('books').updateOne(
      { id: bookId },
      { $set: { ...updates, updatedAt: now } }
    );
  }

  const index = inMemoryBooks.findIndex((b) => b.id === bookId);
  if (index > -1) {
    inMemoryBooks[index] = {
      ...inMemoryBooks[index],
      ...updates,
      updatedAt: now.toISOString(),
    };
  }

  return getDbBookById(bookId);
}

export async function toggleDbBookPublish(bookId: string, isPublished: boolean): Promise<void> {
  await updateDbBook(bookId, { isPublished });
}

export async function deleteDbBook(bookId: string): Promise<{ softDeleted: boolean }> {
  const book = await getDbBookById(bookId);
  if (book && book.salesCount > 0) {
    // Soft delete to protect library access
    await toggleDbBookPublish(bookId, false);
    return { softDeleted: true };
  }

  const db = await getDb();
  if (db && isMongoConfigured()) {
    await db.collection('books').deleteOne({ id: bookId });
  }

  inMemoryBooks = inMemoryBooks.filter((b) => b.id !== bookId);
  return { softDeleted: false };
}

export async function incrementBookSalesCount(bookId: string, quantity = 1): Promise<void> {
  const db = await getDb();
  if (db && isMongoConfigured()) {
    await db.collection('books').updateOne(
      { id: bookId },
      { $inc: { salesCount: quantity } }
    );
  }

  const book = inMemoryBooks.find((b) => b.id === bookId);
  if (book) {
    book.salesCount = (book.salesCount || 0) + quantity;
  }
}

function applyFilters(books: Book[], filters?: Partial<FilterState>): Book[] {
  if (!filters) return books;

  let result = [...books];

  if (filters.searchQuery && filters.searchQuery.trim() !== '') {
    const q = filters.searchQuery.trim().toLowerCase();
    result = result.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.cuisine.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (filters.category && filters.category !== 'All' && filters.category !== '') {
    result = result.filter((b) => b.category === filters.category);
  }

  if (filters.cuisine && filters.cuisine !== 'All' && filters.cuisine !== '') {
    result = result.filter((b) => b.cuisine === filters.cuisine);
  }

  if (filters.selectedTag && filters.selectedTag !== '') {
    result = result.filter((b) => b.tags.includes(filters.selectedTag!));
  }

  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        result.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }
  }

  return result;
}
