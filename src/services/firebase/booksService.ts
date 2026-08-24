import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage, isFirebaseConfigured } from './config';
import { LocalDataEngine, INITIAL_BOOKS, createSamplePdfBlob } from './mockEngine';
import type { Book, FilterState } from '../../types';

export const booksService = {
  async getBooks(filters?: Partial<FilterState>, includeUnpublished = false): Promise<Book[]> {
    if (isFirebaseConfigured && db) {
      try {
        const booksRef = collection(db, 'books');
        let q = query(booksRef);

        if (!includeUnpublished) {
          q = query(booksRef, where('isPublished', '==', true));
        }

        const snapshot = await getDocs(q);
        let books: Book[] = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        } as Book));

        // If newly connected Firebase project has 0 books, auto-populate with initial gourmet cookbooks
        if (books.length === 0 && !includeUnpublished) {
          console.info('Populating initial recipe cookbooks in Firestore...');
          for (const sampleBook of INITIAL_BOOKS) {
            try {
              await setDoc(doc(db, 'books', sampleBook.id), {
                ...sampleBook,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            } catch (err) {
              console.warn('Could not auto-seed book:', err);
            }
          }
          books = INITIAL_BOOKS.filter(b => includeUnpublished ? true : b.isPublished);
        }

        return this.applyClientFilters(books, filters);
      } catch (error) {
        console.warn('Error querying live Firestore books, falling back to local dataset:', error);
      }
    }

    // Fallback persistent engine
    let books = LocalDataEngine.getBooks();
    if (!includeUnpublished) {
      books = books.filter(b => b.isPublished);
    }
    return this.applyClientFilters(books, filters);
  },

  applyClientFilters(books: Book[], filters?: Partial<FilterState>): Book[] {
    if (!filters) return books;

    let result = [...books];

    // Search query filter (matches title, author, or cuisine)
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.trim().toLowerCase();
      result = result.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.cuisine.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (filters.category && filters.category !== 'All' && filters.category !== '') {
      result = result.filter(b => b.category === filters.category);
    }

    // Cuisine filter
    if (filters.cuisine && filters.cuisine !== 'All' && filters.cuisine !== '') {
      result = result.filter(b => b.cuisine === filters.cuisine);
    }

    // Tag filter
    if (filters.selectedTag && filters.selectedTag !== '') {
      result = result.filter(b => b.tags.includes(filters.selectedTag!));
    }

    // Sorting
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
  },

  async getBookById(bookId: string): Promise<Book | null> {
    if (isFirebaseConfigured && db) {
      try {
        const docSnap = await getDoc(doc(db, 'books', bookId));
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as Book;
        }
      } catch (error) {
        console.warn('Error fetching live book by ID:', error);
      }
    }

    return LocalDataEngine.getBook(bookId) || INITIAL_BOOKS.find(b => b.id === bookId) || null;
  },

  async createBook(
    bookData: Omit<Book, 'id' | 'createdAt' | 'updatedAt' | 'salesCount'>,
    coverFile: File | null,
    pdfFile: File | null,
    onProgress?: (progress: number) => void
  ): Promise<Book> {
    const bookId = `book-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    let coverUrl = bookData.coverImageUrl || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80';
    let pdfUrl = bookData.pdfFileUrl || '#';
    const pdfName = pdfFile ? pdfFile.name : bookData.pdfFileName || `${bookData.title.replace(/\s+/g, '_')}.pdf`;
    const fileSize = pdfFile ? `${(pdfFile.size / (1024 * 1024)).toFixed(1)} MB` : bookData.fileSize || '4.5 MB';

    if (isFirebaseConfigured && storage && db) {
      // 1. Upload Cover Image to Firebase Storage
      if (coverFile) {
        try {
          const coverRef = ref(storage, `book-covers/${bookId}/${coverFile.name}`);
          const uploadTask = uploadBytesResumable(coverRef, coverFile);
          
          await new Promise<void>((resolve, reject) => {
            uploadTask.on(
              'state_changed',
              (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 50;
                if (onProgress) onProgress(Math.round(progress));
              },
              (error) => reject(error),
              async () => {
                coverUrl = await getDownloadURL(uploadTask.snapshot.ref);
                resolve();
              }
            );
          });
        } catch (e) {
          console.warn('Cover upload to Firebase Storage fallback to data URL:', e);
          coverUrl = URL.createObjectURL(coverFile);
        }
      }

      // 2. Upload PDF file to Firebase Storage
      if (pdfFile) {
        try {
          const pdfRef = ref(storage, `book-pdfs/${bookId}/${pdfFile.name}`);
          const uploadTask = uploadBytesResumable(pdfRef, pdfFile);

          await new Promise<void>((resolve, reject) => {
            uploadTask.on(
              'state_changed',
              (snapshot) => {
                const progress = 50 + (snapshot.bytesTransferred / snapshot.totalBytes) * 50;
                if (onProgress) onProgress(Math.round(progress));
              },
              (error) => reject(error),
              async () => {
                pdfUrl = await getDownloadURL(uploadTask.snapshot.ref);
                resolve();
              }
            );
          });
        } catch (e) {
          console.warn('PDF upload to Firebase Storage fallback to data URL:', e);
          pdfUrl = URL.createObjectURL(pdfFile);
        }
      }

      // 3. Save Book document in Firestore
      const newBookData = {
        ...bookData,
        coverImageUrl: coverUrl,
        pdfFileUrl: pdfUrl,
        pdfFileName: pdfName,
        fileSize: fileSize,
        salesCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'books', bookId), newBookData);
      return { id: bookId, ...newBookData } as unknown as Book;
    }

    // Fallback persistent engine
    if (coverFile) {
      coverUrl = URL.createObjectURL(coverFile);
    }
    if (pdfFile) {
      pdfUrl = URL.createObjectURL(pdfFile);
    } else if (!pdfUrl || pdfUrl === '#') {
      pdfUrl = createSamplePdfBlob(bookData.title, bookData.author);
    }

    if (onProgress) {
      onProgress(100);
    }

    return LocalDataEngine.createBook({
      ...bookData,
      id: bookId,
      coverImageUrl: coverUrl,
      pdfFileUrl: pdfUrl,
      pdfFileName: pdfName,
      fileSize: fileSize,
    });
  },

  async updateBook(
    bookId: string,
    bookData: Partial<Book>,
    newCoverFile?: File | null,
    newPdfFile?: File | null,
    onProgress?: (progress: number) => void
  ): Promise<Book> {
    const updates: Partial<Book> = { ...bookData };

    if (isFirebaseConfigured && storage && db) {
      if (newCoverFile) {
        try {
          const coverRef = ref(storage, `book-covers/${bookId}/${newCoverFile.name}`);
          const uploadTask = uploadBytesResumable(coverRef, newCoverFile);
          await new Promise<void>((resolve, reject) => {
            uploadTask.on('state_changed', null, reject, async () => {
              updates.coverImageUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            });
          });
        } catch {
          updates.coverImageUrl = URL.createObjectURL(newCoverFile);
        }
      }

      if (newPdfFile) {
        try {
          const pdfRef = ref(storage, `book-pdfs/${bookId}/${newPdfFile.name}`);
          const uploadTask = uploadBytesResumable(pdfRef, newPdfFile);
          await new Promise<void>((resolve, reject) => {
            uploadTask.on(
              'state_changed',
              (snap) => {
                if (onProgress) onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100));
              },
              reject,
              async () => {
                updates.pdfFileUrl = await getDownloadURL(uploadTask.snapshot.ref);
                updates.pdfFileName = newPdfFile.name;
                updates.fileSize = `${(newPdfFile.size / (1024 * 1024)).toFixed(1)} MB`;
                resolve();
              }
            );
          });
        } catch {
          updates.pdfFileUrl = URL.createObjectURL(newPdfFile);
          updates.pdfFileName = newPdfFile.name;
          updates.fileSize = `${(newPdfFile.size / (1024 * 1024)).toFixed(1)} MB`;
        }
      }

      updates.updatedAt = serverTimestamp();
      await updateDoc(doc(db, 'books', bookId), updates as any);
      const updated = await this.getBookById(bookId);
      return updated!;
    }

    // Fallback persistent engine
    if (newCoverFile) {
      updates.coverImageUrl = URL.createObjectURL(newCoverFile);
    }
    if (newPdfFile) {
      updates.pdfFileUrl = URL.createObjectURL(newPdfFile);
      updates.pdfFileName = newPdfFile.name;
      updates.fileSize = `${(newPdfFile.size / (1024 * 1024)).toFixed(1)} MB`;
    }

    return LocalDataEngine.updateBook(bookId, updates);
  },

  async togglePublishStatus(bookId: string, isPublished: boolean): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'books', bookId), {
          isPublished,
          updatedAt: serverTimestamp()
        });
        return;
      } catch (err) {
        console.warn('Could not update live doc, updating local:', err);
      }
    }
    LocalDataEngine.updateBook(bookId, { isPublished });
  },

  async deleteBook(bookId: string): Promise<{ softDeleted: boolean }> {
    // Check if book has prior purchases
    const book = await this.getBookById(bookId);
    if (book && (book.salesCount > 0)) {
      // Safe unpublish to avoid breaking customer library access
      await this.togglePublishStatus(bookId, false);
      return { softDeleted: true };
    }

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'books', bookId));
        return { softDeleted: false };
      } catch (err) {
        console.warn('Could not delete live doc, deleting local:', err);
      }
    }

    LocalDataEngine.deleteBook(bookId);
    return { softDeleted: false };
  }
};
