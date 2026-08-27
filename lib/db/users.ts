import { getDb, isMongoConfigured } from '../mongodb';
import { hashPassword } from '../auth';
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

// Fallback in-memory users
let inMemoryUsers: UserDocument[] = [];

export async function ensureDefaultUsers(): Promise<void> {
  const adminHash = await hashPassword('admin123');
  const customerHash = await hashPassword('customer123');

  const defaultUsers: UserDocument[] = [
    {
      id: 'admin-user-001',
      name: 'Master Chef Admin',
      email: 'admin@recipebooks.com',
      passwordHash: adminHash,
      role: 'admin',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    },
    {
      id: 'cust-user-001',
      name: 'Amina Zahir',
      email: 'customer@recipebooks.com',
      passwordHash: customerHash,
      role: 'customer',
      createdAt: new Date('2026-01-10'),
      updatedAt: new Date('2026-01-10'),
    },
  ];

  if (inMemoryUsers.length === 0) {
    inMemoryUsers = [...defaultUsers];
  }

  const db = await getDb();
  if (db && isMongoConfigured()) {
    try {
      const usersCol = db.collection<UserDocument>('users');
      for (const u of defaultUsers) {
        const existing = await usersCol.findOne({ email: u.email });
        if (!existing) {
          await usersCol.insertOne(u);
        }
      }
    } catch (err) {
      console.warn('Error seeding default users into MongoDB:', err);
    }
  }
}

export async function findUserByEmail(email: string): Promise<UserDocument | null> {
  const cleanEmail = email.trim().toLowerCase();
  await ensureDefaultUsers();

  const db = await getDb();
  if (db && isMongoConfigured()) {
    try {
      const doc = await db.collection<UserDocument>('users').findOne({ email: cleanEmail });
      if (doc) {
        return {
          id: doc.id || (doc as any)._id.toString(),
          name: doc.name,
          email: doc.email,
          passwordHash: doc.passwordHash,
          role: doc.role,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        };
      }
    } catch (err) {
      console.warn('Error finding user by email in MongoDB:', err);
    }
  }

  return inMemoryUsers.find((u) => u.email.toLowerCase() === cleanEmail) || null;
}

export async function findUserById(id: string): Promise<UserProfile | null> {
  await ensureDefaultUsers();

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

export async function createUser(
  name: string,
  email: string,
  passwordHash: string,
  role: UserRole = 'customer'
): Promise<UserProfile> {
  const cleanEmail = email.trim().toLowerCase();
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
  }

  inMemoryUsers.push(newUser);

  return {
    id: userId,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    createdAt: now.toISOString(),
  };
}
