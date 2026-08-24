import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './config';
import type { UserProfile, UserRole } from '../../types';

const MOCK_USERS_KEY = 'recipebooks_mock_auth_users';
const MOCK_SESSION_KEY = 'recipebooks_mock_auth_session';

// Pre-seeded local users for instant testing if Firebase credentials are not set
const DEFAULT_MOCK_USERS: Array<UserProfile & { passwordHash: string }> = [
  {
    id: 'admin-user-001',
    name: 'Master Chef Admin',
    email: 'admin@recipebooks.com',
    role: 'admin',
    passwordHash: 'admin123',
    createdAt: new Date('2026-01-01').toISOString()
  },
  {
    id: 'cust-user-001',
    name: 'Amina Zahir',
    email: 'customer@recipebooks.com',
    role: 'customer',
    passwordHash: 'customer123',
    createdAt: new Date('2026-01-10').toISOString()
  }
];

function getLocalUsers(): Array<UserProfile & { passwordHash: string }> {
  const raw = localStorage.getItem(MOCK_USERS_KEY);
  if (!raw) {
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(DEFAULT_MOCK_USERS));
    return DEFAULT_MOCK_USERS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return DEFAULT_MOCK_USERS;
  }
}

function saveLocalUsers(users: Array<UserProfile & { passwordHash: string }>): void {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
}

function profileFromAuthUser(
  fbUser: FirebaseUser,
  fallbackName?: string,
  role: UserRole = 'customer'
): UserProfile {
  return {
    id: fbUser.uid,
    name: fallbackName || fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
    email: (fbUser.email || '').toLowerCase(),
    role,
    createdAt: new Date().toISOString(),
  };
}

function profileFromDoc(userId: string, data: { [key: string]: unknown }, emailFallback = ''): UserProfile {
  return {
    id: userId,
    name: (data.name as string) || emailFallback.split('@')[0] || 'User',
    email: (data.email as string) || emailFallback,
    role: (data.role as UserRole) || 'customer',
    createdAt: data.createdAt as UserProfile['createdAt'],
  };
}

async function ensureUserDocument(
  uid: string,
  profile: Pick<UserProfile, 'name' | 'email' | 'role'>
): Promise<void> {
  if (!db) return;
  await setDoc(doc(db, 'users', uid), {
    name: profile.name,
    email: profile.email,
    role: profile.role || 'customer',
    createdAt: serverTimestamp(),
  });
}

export const authService = {
  async registerUser(name: string, email: string, password: string, role: UserRole = 'customer'): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();

    if (isFirebaseConfigured && auth && db) {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const uid = userCredential.user.uid;
      
      const userProfile: UserProfile = {
        id: uid,
        name: name.trim(),
        email: cleanEmail,
        role: role,
        createdAt: new Date().toISOString(),
      };

      try {
        await ensureUserDocument(uid, userProfile);
      } catch (e) {
        console.error('Error creating user profile document:', e);
        // Auth account already exists — still return the session so signup is not stuck.
      }

      return userProfile;
    }

    // Local persistent simulation
    const users = getLocalUsers();
    if (users.some(u => u.email === cleanEmail)) {
      throw new Error('An account with this email already exists.');
    }

    const newUser: UserProfile & { passwordHash: string } = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      email: cleanEmail,
      role: role,
      passwordHash: password,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveLocalUsers(users);

    const profile: UserProfile = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt
    };

    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(profile));
    window.dispatchEvent(new Event('auth_state_changed'));
    return profile;
  },

  async loginUser(email: string, password: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();

    if (isFirebaseConfigured && auth && db) {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const uid = userCredential.user.uid;
      const fallbackProfile = profileFromAuthUser(userCredential.user, cleanEmail.split('@')[0]);

      try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (!userDoc.exists()) {
          try {
            await ensureUserDocument(uid, fallbackProfile);
          } catch (e) {
            console.error('Error creating missing user profile:', e);
          }
          return fallbackProfile;
        }

        return profileFromDoc(uid, userDoc.data(), cleanEmail);
      } catch (e) {
        console.error('Error fetching user profile:', e);
        return fallbackProfile;
      }
    }

    // Local persistent simulation
    const users = getLocalUsers();
    const found = users.find(u => u.email === cleanEmail);
    if (!found || found.passwordHash !== password) {
      throw new Error('Invalid email or password. Please check your credentials.');
    }

    const profile: UserProfile = {
      id: found.id,
      name: found.name,
      email: found.email,
      role: found.role,
      createdAt: found.createdAt
    };

    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(profile));
    window.dispatchEvent(new Event('auth_state_changed'));
    return profile;
  },

  async logoutUser(): Promise<void> {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
    localStorage.removeItem(MOCK_SESSION_KEY);
    window.dispatchEvent(new Event('auth_state_changed'));
  },

  async resetPassword(email: string): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();
    if (isFirebaseConfigured && auth) {
      await sendPasswordResetEmail(auth, cleanEmail);
      return;
    }

    const users = getLocalUsers();
    const exists = users.some(u => u.email === cleanEmail);
    if (!exists) {
      throw new Error('No registered account found with that email address.');
    }
    // Simulated success for test mode
    return;
  },

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    if (isFirebaseConfigured && db) {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          return profileFromDoc(userId, userDoc.data());
        }
      } catch (e) {
        console.error('Error fetching user profile:', e);
      }
      return null;
    }

    const users = getLocalUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return null;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };
  },

  onAuthChange(callback: (user: UserProfile | null) => void): () => void {
    if (isFirebaseConfigured && auth && db) {
      const firestoreInstance = db;
      const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          const fallback = profileFromAuthUser(fbUser);
          try {
            let userDoc = await getDoc(doc(firestoreInstance, 'users', fbUser.uid));

            // Signup writes the profile right after Auth; the first read can race it.
            if (!userDoc.exists()) {
              await new Promise((resolve) => setTimeout(resolve, 400));
              userDoc = await getDoc(doc(firestoreInstance, 'users', fbUser.uid));
            }

            if (userDoc.exists()) {
              callback(profileFromDoc(fbUser.uid, userDoc.data(), fbUser.email || ''));
              return;
            }

            try {
              await ensureUserDocument(fbUser.uid, fallback);
            } catch (createErr) {
              console.error('Error creating user profile:', createErr);
            }
            callback(fallback);
          } catch (e) {
            console.error('Error fetching user profile:', e);
            // Keep the Auth session. callback(null) was bouncing users back to login.
            callback(fallback);
          }
        } else {
          callback(null);
        }
      });
      return unsubscribe;
    }

    // Local persistent change listener
    const checkState = () => {
      const raw = localStorage.getItem(MOCK_SESSION_KEY);
      if (raw) {
        try {
          callback(JSON.parse(raw));
        } catch {
          callback(null);
        }
      } else {
        callback(null);
      }
    };

    checkState();
    window.addEventListener('auth_state_changed', checkState);
    window.addEventListener('storage', checkState);

    return () => {
      window.removeEventListener('auth_state_changed', checkState);
      window.removeEventListener('storage', checkState);
    };
  }
};
