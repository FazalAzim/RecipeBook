import { MongoClient, Db } from 'mongodb';

const options = {};

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export function getMongoUri(): string {
  return (process.env.MONGODB_URI || '').trim();
}

export function isMongoConfigured(): boolean {
  const uri = getMongoUri();
  return uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://');
}

function getClientPromise(): Promise<MongoClient> | null {
  const uri = getMongoUri();
  if (!isMongoConfigured()) {
    return null;
  }

  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  }

  const client = new MongoClient(uri, options);
  return client.connect();
}

let warnedMissingUri = false;

export async function getDb(dbName = 'recipebooks'): Promise<Db | null> {
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
    return connectedClient.db(dbName);
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    return null;
  }
}

export default getClientPromise;
