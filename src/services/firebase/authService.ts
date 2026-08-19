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

      // Create user document in Firestore
      await setDoc(doc(db, 'users', uid), {
        name: name.trim(),
        email: cleanEmail,
        role: role,
        createdAt: serverTimestamp(),
      });

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

      // Fetch user profile from Firestore
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (!userDoc.exists()) {
        // Fallback default profile if doc missing
        const fallbackProfile: UserProfile = {
          id: uid,
          name: userCredential.user.displayName || cleanEmail.split('@')[0],
          email: cleanEmail,
          role: 'customer',
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', uid), fallbackProfile);
        return fallbackProfile;
      }

      const data = userDoc.data();
      return {
        id: uid,
        name: data.name || cleanEmail.split('@')[0],
        email: data.email || cleanEmail,
        role: data.role || 'customer',
        createdAt: data.createdAt
      };
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
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          id: userId,
          name: data.name,
          email: data.email,
          role: data.role || 'customer',
          createdAt: data.createdAt
        };
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
          try {
            const userDoc = await getDoc(doc(firestoreInstance, 'users', fbUser.uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              callback({
                id: fbUser.uid,
                name: data.name || fbUser.email?.split('@')[0] || 'User',
                email: fbUser.email || '',
                role: data.role || 'customer',
                createdAt: data.createdAt
              });
            } else {
              callback({
                id: fbUser.uid,
                name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
                email: fbUser.email || '',
                role: 'customer',
                createdAt: new Date().toISOString()
              });
            }
          } catch (e) {
            console.error('Error fetching user profile:', e);
            callback(null);
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
