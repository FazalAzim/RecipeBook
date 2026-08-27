import { MongoClient, Db, type MongoClientOptions } from 'mongodb';

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const clientOptions: MongoClientOptions = {
  maxPoolSize: 10,
  minPoolSize: 0,
  maxIdleTimeMS: 10_000,
  serverSelectionTimeoutMS: 10_000,
  socketTimeoutMS: 45_000,
};

function sanitizeMongoUri(raw: string): string {
  return raw.trim().replace(/^['"]|['"]$/g, '');
}

export function getMongoUri(): string {
  return sanitizeMongoUri(process.env.MONGODB_URI || '');
}

export function isMongoConfigured(): boolean {
  const uri = getMongoUri();
  return uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://');
}

export function getMongoDbName(): string {
  const fromEnv = (process.env.MONGODB_DB_NAME || '').trim();
  if (fromEnv) return fromEnv;

  const uri = getMongoUri();
  try {
    const pathname = new URL(uri).pathname.replace(/^\//, '');
    if (pathname) {
      return pathname.split('?')[0];
    }
  } catch {
    // Ignore malformed URL parsing errors.
  }

  return 'recipebooks';
}

function getClientPromise(): Promise<MongoClient> | null {
  const uri = getMongoUri();
  if (!isMongoConfigured()) {
    return null;
  }

  // Reuse the client across HMR (dev) and warm serverless invocations (Vercel).
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, clientOptions);
    global._mongoClientPromise = client.connect();
  }

  return global._mongoClientPromise;
}

let warnedMissingUri = false;

export async function getDb(dbName?: string): Promise<Db | null> {
  if (!isMongoConfigured()) {
    if (!warnedMissingUri) {
      console.warn(
        '⚠️ MONGODB_URI is not set or invalid in environment variables. Using in-memory fallback.'
      );
      warnedMissingUri = true;
    }
    return null;
  }

  try {
    const clientPromise = getClientPromise();
    if (!clientPromise) {
      return null;
    }

    const connectedClient = await clientPromise;
    return connectedClient.db(dbName || getMongoDbName());
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    global._mongoClientPromise = undefined;
    return null;
  }
}

export async function pingMongo(): Promise<{
  configured: boolean;
  connected: boolean;
  dbName: string;
  error?: string;
}> {
  const dbName = getMongoDbName();

  if (!isMongoConfigured()) {
    return {
      configured: false,
      connected: false,
      dbName,
      error: 'MONGODB_URI is missing or invalid.',
    };
  }

  try {
    const db = await getDb(dbName);
    if (!db) {
      return {
        configured: true,
        connected: false,
        dbName,
        error: 'Could not initialize MongoDB client.',
      };
    }

    await db.command({ ping: 1 });
    return {
      configured: true,
      connected: true,
      dbName,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown MongoDB error.';
    global._mongoClientPromise = undefined;
    return {
      configured: true,
      connected: false,
      dbName,
      error: message,
    };
  }
}

export default getClientPromise;
