import { getDb, isMongoConfigured } from '../mongodb';

/** Idempotency indexes for concurrent webhook + /fulfill fulfillment. */
export async function ensureOrderIndexes(): Promise<void> {
  const db = await getDb();
  if (!db || !isMongoConfigured()) {
    throw new Error('MongoDB is not configured. Set MONGODB_URI before creating indexes.');
  }

  const orders = db.collection('orders');

  await orders.createIndex(
    { paymentReferenceId: 1 },
    { unique: true, name: 'orders_paymentReferenceId_unique' }
  );

  await orders.createIndex(
    { lemonSqueezyOrderId: 1 },
    { unique: true, sparse: true, name: 'orders_lemonSqueezyOrderId_unique' }
  );
}
