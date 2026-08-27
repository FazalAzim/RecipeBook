import { MongoClient, Db, type MongoClientOptions } from 'mongodb';

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const clientOptions: MongoClientOptions = {
  maxPoolSize: 10,
  minPoolSize: 0,
  maxIdleTimeMS: 10_000,
  serverSelectionTimeoutMS: 15_000,
  connectTimeoutMS: 15_000,
  socketTimeoutMS: 45_000,
  // Vercel serverless can fail DNS over IPv6 for some Atlas clusters.
  family: 4,
};

function sanitizeMongoUri(raw: string): string {
  return raw
    .replace(/^\uFEFF/, '')
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .replace(/\r?\n/g, '');
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
  const match = uri.match(/mongodb(?:\+srv)?:\/\/[^/]+\/([^?]+)/i);
  if (match?.[1]) {
    return match[1];
  }

  return 'recipebooks';
}

async function connectMongoClient(): Promise<MongoClient> {
  const uri = getMongoUri();
  if (!isMongoConfigured()) {
    throw new Error('MONGODB_URI is missing or invalid.');
  }

  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, clientOptions);
    global._mongoClientPromise = client.connect().catch((error) => {
      global._mongoClientPromise = undefined;
      throw error;
    });
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
    const client = await connectMongoClient();
    return client.db(dbName || getMongoDbName());
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    return null;
  }
}

export async function pingMongo(): Promise<{
  configured: boolean;
  connected: boolean;
  dbName: string;
  error?: string;
  diagnostics?: {
    uriScheme: string;
    uriLength: number;
    hasDbNameEnv: boolean;
  };
}> {
  const dbName = getMongoDbName();
  const uri = getMongoUri();

  if (!isMongoConfigured()) {
    return {
      configured: false,
      connected: false,
      dbName,
      error: 'MONGODB_URI is missing or invalid.',
      diagnostics: {
        uriScheme: uri.split(':')[0] || 'none',
        uriLength: uri.length,
        hasDbNameEnv: Boolean(process.env.MONGODB_DB_NAME?.trim()),
      },
    };
  }

  try {
    const client = await connectMongoClient();
    await client.db(dbName).command({ ping: 1 });

    return {
      configured: true,
      connected: true,
      dbName,
      diagnostics: {
        uriScheme: uri.split(':')[0],
        uriLength: uri.length,
        hasDbNameEnv: Boolean(process.env.MONGODB_DB_NAME?.trim()),
      },
    };
  } catch (error) {
    global._mongoClientPromise = undefined;

    const message = error instanceof Error ? error.message : 'Unknown MongoDB error.';
    return {
      configured: true,
      connected: false,
      dbName,
      error: message,
      diagnostics: {
        uriScheme: uri.split(':')[0],
        uriLength: uri.length,
        hasDbNameEnv: Boolean(process.env.MONGODB_DB_NAME?.trim()),
      },
    };
  }
}

export default connectMongoClient;
