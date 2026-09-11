import { getDb, isMongoConfigured } from '../mongodb';
import type { UserProfile, UserRole } from '../types';

export interface UserDocument {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

/** Dev-only fallback when MongoDB is unavailable. Never seeded with default accounts. */
let inMemoryUsers: UserDocument[] = [];

function mapUserDoc(doc: UserDocument & { _id?: { toString(): string } }): UserDocument {
  return {
    id: doc.id || doc._id?.toString() || '',
    name: doc.name,
    email: doc.email,
    passwordHash: doc.passwordHash,
    role: doc.role,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function ensureUserIndexes(): Promise<void> {
  const db = await getDb();
  if (!db || !isMongoConfigured()) {
    throw new Error('MongoDB is not configured. Set MONGODB_URI before creating indexes.');
  }

  await db.collection('users').createIndex(
    { email: 1 },
    { unique: true, name: 'users_email_unique' }
  );
}

export async function findUserByEmail(email: string): Promise<UserDocument | null> {
  const cleanEmail = email.trim().toLowerCase();

  const db = await getDb();
  if (db && isMongoConfigured()) {
    try {
      const doc = await db.collection<UserDocument>('users').findOne({ email: cleanEmail });
      if (doc) {
        return mapUserDoc(doc as UserDocument & { _id?: { toString(): string } });
      }
    } catch (err) {
      console.warn('Error finding user by email in MongoDB:', err);
    }
  }

  return inMemoryUsers.find((u) => u.email.toLowerCase() === cleanEmail) || null;
}

export async function findUserById(id: string): Promise<UserProfile | null> {
  const db = await getDb();
  if (db && isMongoConfigured()) {
    try {
      const doc = await db.collection<UserDocument>('users').findOne({
        $or: [{ id }, { _id: (id.length === 24 ? { $oid: id } : undefined) as any }],
      });
      if (doc) {
        return {
          id: doc.id || (doc as any)._id.toString(),
          name: doc.name,
          email: doc.email,
          role: doc.role,
          createdAt: doc.createdAt,
        };
      }
    } catch (err) {
      console.warn('Error finding user by id in MongoDB:', err);
    }
  }

  const found = inMemoryUsers.find((u) => u.id === id);
  if (!found) return null;
  return {
    id: found.id,
    name: found.name,
    email: found.email,
    role: found.role,
    createdAt: found.createdAt,
  };
}

/**
 * Creates a customer account. Role is always "customer" — admins are created via scripts/create-admin only.
 */
export async function createUser(
  name: string,
  email: string,
  passwordHash: string
): Promise<UserProfile> {
  return insertUser(name, email, passwordHash, 'customer');
}

/** Creates an admin account. Intended for trusted setup scripts only. */
export async function createAdminUser(
  name: string,
  email: string,
  passwordHash: string
): Promise<UserProfile> {
  return insertUser(name, email, passwordHash, 'admin');
}

async function insertUser(
  name: string,
  email: string,
  passwordHash: string,
  role: UserRole
): Promise<UserProfile> {
  const cleanEmail = email.trim().toLowerCase();
  const existing = await findUserByEmail(cleanEmail);
  if (existing) {
    throw new Error('An account with this email address already exists.');
  }

  const userId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date();

  const newUser: UserDocument = {
    id: userId,
    name: name.trim(),
    email: cleanEmail,
    passwordHash,
    role,
    createdAt: now,
    updatedAt: now,
  };

  const db = await getDb();
  if (db && isMongoConfigured()) {
    await db.collection<UserDocument>('users').insertOne(newUser);
  } else {
    inMemoryUsers.push(newUser);
  }

  return {
    id: userId,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    createdAt: now.toISOString(),
  };
}
