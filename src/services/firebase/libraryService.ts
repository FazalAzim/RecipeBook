import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  increment,
  serverTimestamp,
  doc
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import { LocalDataEngine, createSamplePdfBlob } from './mockEngine';
import type { LibraryItem } from '../../types';

export const libraryService = {
  async getUserLibrary(userId?: string, userEmail?: string): Promise<LibraryItem[]> {
    if (!userId && !userEmail) return [];

    const itemsMap = new Map<string, LibraryItem>();

    if (isFirebaseConfigured && db) {
      try {
        const libraryRef = collection(db, 'libraries');

        if (userId) {
          const qUser = query(libraryRef, where('userId', '==', userId));
          const snapUser = await getDocs(qUser);
          snapUser.docs.forEach(d => {
            const item = { id: d.id, ...d.data() } as LibraryItem;
            itemsMap.set(item.bookId, item);
          });
        }

        if (userEmail) {
          const qEmail = query(libraryRef, where('customerEmail', '==', userEmail.toLowerCase().trim()));
          const snapEmail = await getDocs(qEmail);
          snapEmail.docs.forEach(d => {
            const item = { id: d.id, ...d.data() } as LibraryItem;
            itemsMap.set(item.bookId, item);
          });
        }

        return Array.from(itemsMap.values());
      } catch (err) {
        console.warn('Error querying Firestore libraries, checking local engine:', err);
      }
    }

    if (userId) {
      LocalDataEngine.getLibraries(userId).forEach(i => itemsMap.set(i.bookId, i));
    }
    return Array.from(itemsMap.values());
  },

  async isBookPurchased(userId?: string, userEmail?: string, bookId?: string): Promise<boolean> {
    if (!bookId || (!userId && !userEmail)) return false;
    const library = await this.getUserLibrary(userId, userEmail);
    return library.some(item => item.bookId === bookId);
  },

  async downloadBookPdf(
    userIdentifier: string,
    bookId: string,
    customerEmail?: string
  ): Promise<{ downloadUrl: string; fileName: string }> {
    const libraryItems = await this.getUserLibrary(userIdentifier, customerEmail || userIdentifier);
    const item = libraryItems.find(i => i.bookId === bookId);

    // Step 1: Update download metrics in Firestore or local engine
    if (isFirebaseConfigured && db && item) {
      try {
        const docRef = doc(db, 'libraries', item.id);
        await updateDoc(docRef, {
          downloadCount: increment(1),
          lastDownloadedAt: serverTimestamp()
        });
      } catch (err) {
        console.warn('Could not update download metric in Firestore:', err);
      }
    } else {
      LocalDataEngine.recordDownload(userIdentifier, bookId);
    }

    // Step 2: Prepare downloadable PDF URL
    let downloadUrl = item?.pdfFileUrl;

    if (!downloadUrl || downloadUrl === '#' || downloadUrl === '') {
      const bookTitle = item?.title || 'Authentic_Recipe_Cookbook';
      const bookAuthor = item?.author || 'Master Chef';
      downloadUrl = createSamplePdfBlob(bookTitle, bookAuthor);
    }

    const fileName = item?.pdfFileName || `${(item?.title || 'Recipe_Cookbook').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

    // Step 3: Trigger real browser download
    try {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.warn('Direct anchor download failed, opening in new tab:', e);
      window.open(downloadUrl, '_blank');
    }

    return { downloadUrl, fileName };
  }
};
