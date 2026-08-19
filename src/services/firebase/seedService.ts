import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import { INITIAL_BOOKS, LocalDataEngine } from './mockEngine';

export const seedService = {
  async seedDatabase(): Promise<{ count: number }> {
    if (isFirebaseConfigured && db) {
      let count = 0;
      for (const book of INITIAL_BOOKS) {
        const docRef = doc(db, 'books', book.id);
        const bookData = {
          ...book,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(docRef, bookData, { merge: true });
        count++;
      }
      return { count };
    }

    // Local engine seeding
    LocalDataEngine.resetToDefault();
    return { count: INITIAL_BOOKS.length };
  }
};
