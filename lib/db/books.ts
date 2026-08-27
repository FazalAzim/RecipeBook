import { getDb, isMongoConfigured } from '../mongodb';
import { resolveR2AssetUrl } from '../r2';
import type { Book, FilterState } from '../types';

export const INITIAL_BOOKS: Book[] = [
  {
    id: 'book-pk-01',
    title: 'Traditional Pakistani Flavors & Royal Curries',
    author: 'Chef Ayla Farooq',
    description: 'An authentic culinary journey through Lahore, Karachi, and Peshawar. Featuring step-by-step masterclasses on slow-cooked Biryanis, tender Nihari, succulent Karahi, fragrant aromatic rice, and house-blended garam masalas.',
    category: 'Pakistani & South Asian',
    cuisine: 'Pakistani',
    tags: ['Biryani', 'Curry', 'Slow Cook', 'Authentic', 'Halal', 'Spices'],
    price: 19.99,
    coverImageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80',
    pdfFileUrl: '',
    pdfFileName: 'Traditional_Pakistani_Recipes_v2.pdf',
    fileSize: '6.4 MB',
    pageCount: 148,
    createdAt: new Date('2026-01-15').toISOString(),
    updatedAt: new Date('2026-02-01').toISOString(),
    salesCount: 342,
    isPublished: true,
    featured: true,
    rating: 4.9,
    reviewCount: 88,
  },
  {
    id: 'book-it-02',
    title: 'Italian Homemade Pasta: The Nonna’s Handbook',
    author: 'Chef Marco Rossi',
    description: 'Master the timeless craft of artisanal pasta from scratch. From silky tagliatelle and hand-pinched tortellini to rich Tuscan ragù, Roman carbonara, and airy focaccia. Packed with high-resolution folding diagrams.',
    category: 'Italian & European',
    cuisine: 'Italian',
    tags: ['Pasta', 'Handmade', 'Comfort Food', 'Tuscan', 'Sauces'],
    price: 24.50,
    coverImageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d628169b?auto=format&fit=crop&w=800&q=80',
    pdfFileUrl: '',
    pdfFileName: 'Italian_Homemade_Pasta_Masterclass.pdf',
    fileSize: '8.2 MB',
    pageCount: 196,
    createdAt: new Date('2026-01-20').toISOString(),
    updatedAt: new Date('2026-02-10').toISOString(),
    salesCount: 520,
    isPublished: true,
    featured: true,
    rating: 5.0,
    reviewCount: 142,
  },
  {
    id: 'book-med-03',
    title: 'Healthy Mediterranean: Sun-Drenched Everyday Meals',
    author: 'Dr. Elena Vasquez',
    description: 'Nourishing, heart-healthy recipes rich in extra virgin olive oil, crisp vegetables, fresh seafood, herbs, and vibrant citrus. Includes complete 30-day seasonal meal plans and dietitian nutritional breakdowns.',
    category: 'Mediterranean & Healthy',
    cuisine: 'Mediterranean',
    tags: ['Healthy', 'Olive Oil', 'Heart-Smart', 'Seafood', 'Salads', 'Clean Eating'],
    price: 18.00,
    coverImageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    pdfFileUrl: '',
    pdfFileName: 'Healthy_Mediterranean_Cooking.pdf',
    fileSize: '5.1 MB',
    pageCount: 160,
    createdAt: new Date('2026-02-05').toISOString(),
    updatedAt: new Date('2026-02-14').toISOString(),
    salesCount: 290,
    isPublished: true,
    featured: true,
    rating: 4.8,
    reviewCount: 64,
  },
  {
    id: 'book-asia-04',
    title: 'Easy Asian Wok & Street Food Express',
    author: 'Chef Kenji Chen',
    description: 'Fast, high-heat wok cooking made simple for home kitchens. Crispy dumplings, hand-pulled noodles, Thai basil stir-fries, and sizzling Korean street barbecue ready in under 25 minutes with staple pantry items.',
    category: 'Asian & Street Food',
    cuisine: 'Asian',
    tags: ['Wok', 'Quick & Easy', 'Street Food', 'Noodles', 'Stir Fry'],
    price: 16.99,
    coverImageUrl: 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=800&q=80',
    pdfFileUrl: '',
    pdfFileName: 'Easy_Asian_Wok_Street_Food.pdf',
    fileSize: '4.8 MB',
    pageCount: 130,
    createdAt: new Date('2026-02-08').toISOString(),
    updatedAt: new Date('2026-02-16').toISOString(),
    salesCount: 415,
    isPublished: true,
    featured: false,
    rating: 4.9,
    reviewCount: 97,
  },
  {
    id: 'book-des-05',
    title: 'Traditional Desserts & French Patisserie Master',
    author: 'Pastry Chef Claire Dupont',
    description: 'Precision pastry techniques demystified. Create flawless glossy fruit tarts, flaky croissants, cardamom gulab jamuns, velvety chocolate mousses, and elegant celebration cakes with confidence.',
    category: 'Desserts & Baking',
    cuisine: 'French',
    tags: ['Baking', 'Pastry', 'Desserts', 'Cakes', 'Sweet Treats', 'Chocolate'],
    price: 22.00,
    coverImageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    pdfFileUrl: '',
    pdfFileName: 'Traditional_Desserts_and_Baking.pdf',
    fileSize: '9.6 MB',
    pageCount: 220,
    createdAt: new Date('2026-01-28').toISOString(),
    updatedAt: new Date('2026-02-12').toISOString(),
    salesCount: 180,
    isPublished: true,
    featured: false,
    rating: 4.9,
    reviewCount: 51,
  },
  {
    id: 'book-fam-06',
    title: 'Quick Family Meals: 30-Minute Weeknight Magic',
    author: 'Sarah Jenkins',
    description: 'Stress-free, kid-approved, one-pot and sheet-pan dinners that bring everyone together. Includes budget shopping guides, freezer-prep tips, and minimal cleanup techniques for busy households.',
    category: 'Quick & Family Meals',
    cuisine: 'American',
    tags: ['One Pot', 'Weeknight', 'Family Friendly', 'Budget', '30 Minutes'],
    price: 14.99,
    coverImageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
    pdfFileUrl: '',
    pdfFileName: 'Quick_Family_Meals_30Min.pdf',
    fileSize: '3.9 MB',
    pageCount: 112,
    createdAt: new Date('2026-02-10').toISOString(),
    updatedAt: new Date('2026-02-18').toISOString(),
    salesCount: 310,
    isPublished: true,
    featured: true,
    rating: 4.7,
    reviewCount: 73,
  }
];

// Memory store for instant mock fallback when MONGODB_URI is not yet filled
let inMemoryBooks: Book[] = [...INITIAL_BOOKS];

export async function ensureBooksSeeded(): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const count = await db.collection('books').countDocuments();
  if (count === 0) {
    console.info('🌱 Seeding initial recipe books into MongoDB...');
    const booksToInsert = INITIAL_BOOKS.map((b) => ({
      ...b,
      createdAt: new Date(b.createdAt),
      updatedAt: new Date(b.updatedAt),
    }));
    await db.collection('books').insertMany(booksToInsert);
  }
}

export async function getDbBooks(
  filters?: Partial<FilterState>,
  includeUnpublished = false
): Promise<Book[]> {
  const db = await getDb();

  let books: Book[];

  if (db && isMongoConfigured()) {
    try {
      await ensureBooksSeeded();
      const query: Record<string, unknown> = {};
      if (!includeUnpublished) {
        query.isPublished = true;
      }

      const docs = await db.collection('books').find(query).toArray();
      books = docs.map((d) => ({
        id: (d.id || d._id.toString()) as string,
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
        createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: d.updatedAt ? new Date(d.updatedAt).toISOString() : new Date().toISOString(),
      }));
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
      const doc = await db.collection('books').findOne({
        $or: [{ id: bookId }, { _id: (bookId.length === 24 ? { $oid: bookId } : undefined) as any }],
      });
      if (doc) {
        return {
          id: (doc.id || doc._id.toString()) as string,
          title: doc.title as string,
          author: doc.author as string,
          description: doc.description as string,
          category: doc.category as string,
          cuisine: doc.cuisine as string,
          tags: (doc.tags || []) as string[],
          price: Number(doc.price),
          coverImageUrl: resolveR2AssetUrl((doc.coverImageUrl || '') as string),
          pdfFileUrl: (doc.pdfFileUrl || '') as string,
          pdfFileName: (doc.pdfFileName || '') as string,
          fileSize: (doc.fileSize || '') as string,
          pageCount: Number(doc.pageCount || 100),
          salesCount: Number(doc.salesCount || 0),
          isPublished: Boolean(doc.isPublished),
          featured: Boolean(doc.featured),
          rating: Number(doc.rating || 5.0),
          reviewCount: Number(doc.reviewCount || 1),
          createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
          updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
        };
      }
    } catch (err) {
      console.warn('Error fetching book from MongoDB:', err);
    }
  }

  return inMemoryBooks.find((b) => b.id === bookId) || null;
}

export async function createDbBook(bookData: Omit<Book, 'id' | 'createdAt' | 'updatedAt' | 'salesCount'>): Promise<Book> {
  const bookId = `book-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
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
