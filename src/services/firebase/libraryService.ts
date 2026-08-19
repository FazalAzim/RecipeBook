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
  async getUserLibrary(userId: string): Promise<LibraryItem[]> {
    if (!userId) return [];

    if (isFirebaseConfigured && db) {
      try {
        const libraryRef = collection(db, 'libraries');
        const q = query(libraryRef, where('userId', '==', userId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as LibraryItem));
      } catch (err) {
        console.warn('Error querying Firestore libraries, checking local engine:', err);
      }
    }

    return LocalDataEngine.getLibraries(userId);
  },

  async isBookPurchased(userId: string, bookId: string): Promise<boolean> {
    if (!userId || !bookId) return false;
    const library = await this.getUserLibrary(userId);
    return library.some(item => item.bookId === bookId);
  },

  async downloadBookPdf(userId: string, bookId: string): Promise<{ downloadUrl: string; fileName: string }> {
    if (!userId) {
      throw new Error('Authentication required to download recipe books.');
    }

    const libraryItems = await this.getUserLibrary(userId);
    const item = libraryItems.find(i => i.bookId === bookId);

    if (!item) {
      throw new Error('Access denied: You must purchase this recipe book before downloading.');
    }

    // Step 1: Update download metrics in Firestore or local engine
    if (isFirebaseConfigured && db) {
      const libraryDocId = `${userId}_${bookId}`;
      try {
        const docRef = doc(db, 'libraries', libraryDocId);
        await updateDoc(docRef, {
          downloadCount: increment(1),
          lastDownloadedAt: serverTimestamp()
        });
      } catch (err) {
        console.warn('Could not update download metric in Firestore:', err);
      }
    } else {
      LocalDataEngine.recordDownload(userId, bookId);
    }

    // Step 2: Prepare downloadable PDF URL
    let downloadUrl = item.pdfFileUrl;

    if (!downloadUrl || downloadUrl === '#' || downloadUrl === '') {
      downloadUrl = createSamplePdfBlob(item.title, item.author || 'Master Chef');
    }

    const fileName = item.pdfFileName || `${item.title.replace(/[^a-zA-Z0-9]/g, '_')}_Cookbook.pdf`;

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
