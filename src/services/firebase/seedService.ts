import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db, isFirebaseConfigured } from './config';
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
  },

  async seedAdminAccount(): Promise<{ created: boolean; message: string }> {
    if (!isFirebaseConfigured || !auth || !db) {
      return { created: false, message: 'Firebase is not configured. Admin exists in local mock data.' };
    }

    const adminEmail = 'admin@recipebooks.com';
    const adminPassword = 'admin123';
    const adminName = 'Master Chef Admin';

    try {
      // Try creating a new Auth account
      const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, 'users', uid), {
        name: adminName,
        email: adminEmail,
        role: 'admin',
        createdAt: serverTimestamp(),
      });

      return { created: true, message: 'Admin account created successfully.' };
    } catch (e: unknown) {
      const error = e as { code?: string; message?: string };

      if (error.code === 'auth/email-already-in-use') {
        // Auth account exists — sign in to get the uid and ensure the Firestore doc exists
        try {
          const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
          const uid = userCredential.user.uid;
          const userDoc = await getDoc(doc(db, 'users', uid));

          if (!userDoc.exists()) {
            await setDoc(doc(db, 'users', uid), {
              name: adminName,
              email: adminEmail,
              role: 'admin',
              createdAt: serverTimestamp(),
            });
            return { created: true, message: 'Admin Firestore profile created for existing Auth account.' };
          }

          // Ensure role is admin
          const data = userDoc.data();
          if (data.role !== 'admin') {
            await setDoc(doc(db, 'users', uid), { ...data, role: 'admin' }, { merge: true });
            return { created: true, message: 'Existing account upgraded to admin role.' };
          }

          return { created: false, message: 'Admin account already exists with correct role.' };
        } catch (loginErr) {
          return { created: false, message: `Admin Auth account exists but login failed: ${(loginErr as Error).message}` };
        }
      }

      return { created: false, message: `Failed to create admin: ${error.message}` };
    }
  },
};
