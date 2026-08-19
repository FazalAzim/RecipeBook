import type { Book, Order, LibraryItem } from '../../types';

// Initial sample gourmet cookbooks for immediate out-of-the-box delight
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
    pdfFileUrl: '#',
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
    pdfFileUrl: '#',
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
    pdfFileUrl: '#',
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
    pdfFileUrl: '#',
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
    pdfFileUrl: '#',
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
    pdfFileUrl: '#',
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

const STORAGE_KEYS = {
  USERS: 'recipebooks_users_db',
  BOOKS: 'recipebooks_books_db',
  ORDERS: 'recipebooks_orders_db',
  LIBRARIES: 'recipebooks_libraries_db',
  CURRENT_USER: 'recipebooks_current_user',
  FILES: 'recipebooks_files_db'
};

// Generate a dummy downloadable PDF Blob URL with real recipe book PDF text
export function createSamplePdfBlob(bookTitle: string, author: string): string {
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
<< /Length 280 >>
stream
BT
/F1 24 Tf
50 700 Td
(${bookTitle.replace(/[()]/g, '')}) Tj
/F1 14 Tf
0 -30 Td
(Author: ${author.replace(/[()]/g, '')}) Tj
0 -40 Td
(Thank you for purchasing this authentic digital recipe cookbook!) Tj
0 -30 Td
(Official Edition - RecipeBooks Market) Tj
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
670
%%EOF`;

  const blob = new Blob([content], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
}

// Local Storage Helper
export class LocalDataEngine {
  static getBooks(): Book[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(INITIAL_BOOKS));
      return INITIAL_BOOKS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_BOOKS;
    }
  }

  static saveBooks(books: Book[]): void {
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
  }

  static getBook(id: string): Book | undefined {
    return this.getBooks().find(b => b.id === id);
  }

  static createBook(book: Omit<Book, 'id' | 'createdAt' | 'updatedAt' | 'salesCount'> & { id?: string; createdAt?: string; updatedAt?: string; salesCount?: number }): Book {
    const books = this.getBooks();
    const newBook: Book = {
      ...book,
      id: book.id || `book-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: book.createdAt || new Date().toISOString(),
      updatedAt: book.updatedAt || new Date().toISOString(),
      salesCount: book.salesCount || 0,
      rating: 5.0,
      reviewCount: 1,
    };
    books.unshift(newBook);
    this.saveBooks(books);
    return newBook;
  }

  static updateBook(id: string, updates: Partial<Book>): Book {
    const books = this.getBooks();
    const index = books.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Book not found');
    const updated = {
      ...books[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    books[index] = updated;
    this.saveBooks(books);
    return updated;
  }

  static deleteBook(id: string): boolean {
    const books = this.getBooks();
    const filtered = books.filter(b => b.id !== id);
    this.saveBooks(filtered);
    return true;
  }

  static getOrders(userId?: string): Order[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    const orders: Order[] = raw ? JSON.parse(raw) : [];
    if (userId) {
      return orders.filter(o => o.userId === userId);
    }
    return orders;
  }

  static saveOrder(order: Order): void {
    const orders = this.getOrders();
    orders.unshift(order);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    // Update sales count for purchased books
    const books = this.getBooks();
    order.items.forEach(item => {
      const book = books.find(b => b.id === item.bookId);
      if (book) {
        book.salesCount = (book.salesCount || 0) + item.quantity;
      }
    });
    this.saveBooks(books);
  }

  static getLibraries(userId: string): LibraryItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LIBRARIES);
    const list: LibraryItem[] = raw ? JSON.parse(raw) : [];
    return list.filter(item => item.userId === userId);
  }

  static addToLibrary(item: LibraryItem): void {
    const raw = localStorage.getItem(STORAGE_KEYS.LIBRARIES);
    const list: LibraryItem[] = raw ? JSON.parse(raw) : [];
    // Avoid duplicate entry for exact order and book
    const exists = list.find(l => l.userId === item.userId && l.bookId === item.bookId);
    if (!exists) {
      list.unshift(item);
      localStorage.setItem(STORAGE_KEYS.LIBRARIES, JSON.stringify(list));
    }
  }

  static recordDownload(userId: string, bookId: string): void {
    const raw = localStorage.getItem(STORAGE_KEYS.LIBRARIES);
    if (!raw) return;
    const list: LibraryItem[] = JSON.parse(raw);
    const item = list.find(l => l.userId === userId && l.bookId === bookId);
    if (item) {
      item.downloadCount = (item.downloadCount || 0) + 1;
      item.lastDownloadedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.LIBRARIES, JSON.stringify(list));
    }
  }

  static resetToDefault(): void {
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(INITIAL_BOOKS));
  }
}
