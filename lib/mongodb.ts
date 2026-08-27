import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient> | null = null;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export function isMongoConfigured(): boolean {
  return Boolean(uri && uri.trim() !== '' && uri.startsWith('mongodb'));
}

if (isMongoConfigured()) {
  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
} else {
  console.warn('⚠️ MONGODB_URI is not set or invalid in environment variables.');
}

export async function getDb(dbName = 'recipebooks'): Promise<Db | null> {
  if (!clientPromise) {
    return null;
  }
  try {
    const connectedClient = await clientPromise;
    return connectedClient.db(dbName);
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    return null;
  }
}

export default clientPromise;
