import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { UserProfile, UserRole } from './types';
import { findUserById } from './db/users';

const AUTH_SECRET = process.env.AUTH_SECRET || 'dev_secret_fallback_key_at_least_32_characters_long_12345';
const secretKey = new TextEncoder().encode(AUTH_SECRET);

export const SESSION_COOKIE_NAME = 'recipebooks_session';

export interface SessionPayload {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  [key: string]: unknown;
}

/**
 * Hashes a plaintext password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compares plaintext password against hashed password
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}

/**
 * Signs a JWT session token (valid for 7 days)
 */
export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);
}

/**
 * Verifies a JWT session token
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Gets the current authenticated session user from request cookies.
 * Always re-checks MongoDB so deleted users / role changes invalidate access.
 */
export async function getSessionUser(): Promise<UserProfile | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifySessionToken(token);
    if (!payload?.id) return null;

    const dbUser = await findUserById(payload.id);
    if (!dbUser) return null;

    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
      createdAt: dbUser.createdAt,
    };
  } catch {
    return null;
  }
}

/** Returns the session user only if they are an admin; otherwise null. */
export async function getAdminSessionUser(): Promise<UserProfile | null> {
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') return null;
  return user;
}
