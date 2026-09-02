import { getDb, isMongoConfigured } from '../mongodb';

export interface PendingCheckoutItem {
  bookId: string;
  quantity: number;
}

export interface PendingCheckout {
  paymentReferenceId: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  items: PendingCheckoutItem[];
  totalCents: number;
  lemonSqueezyCheckoutId?: string;
  status: 'pending' | 'fulfilled';
  createdAt: string;
  fulfilledAt?: string;
}

let inMemoryPendingCheckouts: PendingCheckout[] = [];

export async function savePendingCheckout(checkout: Omit<PendingCheckout, 'status' | 'createdAt'>): Promise<void> {
  const record: PendingCheckout = {
    ...checkout,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  const db = await getDb();
  if (db && isMongoConfigured()) {
    await db.collection('pending_checkouts').updateOne(
      { paymentReferenceId: checkout.paymentReferenceId },
      { $set: record },
      { upsert: true }
    );
  }

  const index = inMemoryPendingCheckouts.findIndex(
    (entry) => entry.paymentReferenceId === checkout.paymentReferenceId
  );
  if (index > -1) {
    inMemoryPendingCheckouts[index] = record;
  } else {
    inMemoryPendingCheckouts.unshift(record);
  }
}

export async function getPendingCheckoutByReferenceId(
  paymentReferenceId: string
): Promise<PendingCheckout | null> {
  const db = await getDb();
  if (db && isMongoConfigured()) {
    try {
      const doc = await db.collection('pending_checkouts').findOne({ paymentReferenceId });
      if (doc) {
        return doc as unknown as PendingCheckout;
      }
    } catch (err) {
      console.warn('Error loading pending checkout:', err);
    }
  }

  return inMemoryPendingCheckouts.find((entry) => entry.paymentReferenceId === paymentReferenceId) || null;
}

export async function markPendingCheckoutFulfilled(paymentReferenceId: string): Promise<void> {
  const now = new Date().toISOString();
  const db = await getDb();

  if (db && isMongoConfigured()) {
    await db.collection('pending_checkouts').updateOne(
      { paymentReferenceId },
      { $set: { status: 'fulfilled', fulfilledAt: now } }
    );
  }

  const entry = inMemoryPendingCheckouts.find((item) => item.paymentReferenceId === paymentReferenceId);
  if (entry) {
    entry.status = 'fulfilled';
    entry.fulfilledAt = now;
  }
}
