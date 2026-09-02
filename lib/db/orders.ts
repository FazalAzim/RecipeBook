import { getDb, isMongoConfigured } from '../mongodb';
import { getDbBookById, getDbBooks, incrementBookSalesCount } from './books';
import { addItemsToLibrary } from './library';
import type { CartItem, Order, OrderItem, PaymentMethod } from '../types';

let inMemoryOrders: Order[] = [];

function isMongoDuplicateKeyError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const mongoError = error as { code?: number; writeErrors?: Array<{ code?: number }> };
  if (mongoError.code === 11000) return true;

  return mongoError.writeErrors?.some((entry) => entry.code === 11000) ?? false;
}

async function findExistingOrderForIdempotencyKeys(params: {
  paymentReferenceId?: string;
  lemonSqueezyOrderId?: string;
  stripeSessionId?: string;
}): Promise<Order | null> {
  if (params.lemonSqueezyOrderId) {
    const byLemonOrder = await getDbOrderByLemonSqueezyOrderId(params.lemonSqueezyOrderId);
    if (byLemonOrder) return byLemonOrder;
  }

  if (params.paymentReferenceId) {
    const byReference = await getDbOrderByPaymentReferenceId(params.paymentReferenceId);
    if (byReference) return byReference;
  }

  if (params.stripeSessionId) {
    const byStripeSession = await getDbOrderByStripeSessionId(params.stripeSessionId);
    if (byStripeSession) return byStripeSession;
  }

  return null;
}

function mapOrderDoc(doc: Record<string, unknown>): Order {
  return {
    id: (doc.id || (doc._id as { toString(): string }).toString()) as string,
    userId: doc.userId as string,
    customerName: doc.customerName as string,
    customerEmail: doc.customerEmail as string,
    items: doc.items as OrderItem[],
    subtotal: Number(doc.subtotal),
    total: Number(doc.total),
    paymentMethod: doc.paymentMethod as PaymentMethod,
    paymentStatus: doc.paymentStatus as Order['paymentStatus'],
    orderStatus: doc.orderStatus as Order['orderStatus'],
    paymentReferenceId: doc.paymentReferenceId as string | undefined,
    lemonSqueezyOrderId: doc.lemonSqueezyOrderId as string | undefined,
    lemonSqueezyCheckoutId: doc.lemonSqueezyCheckoutId as string | undefined,
    stripeSessionId: doc.stripeSessionId as string | undefined,
    stripePaymentIntentId: doc.stripePaymentIntentId as string | undefined,
    createdAt: doc.createdAt ? new Date(doc.createdAt as string).toISOString() : new Date().toISOString(),
  };
}

export async function createDbOrder(params: {
  userId: string;
  customerName: string;
  customerEmail: string;
  cartItems: CartItem[] | { bookId: string; quantity: number }[];
  paymentMethod: PaymentMethod;
  paymentReferenceId?: string;
  lemonSqueezyOrderId?: string;
  lemonSqueezyCheckoutId?: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
}): Promise<Order> {
  const {
    userId,
    customerName,
    customerEmail,
    cartItems,
    paymentMethod,
    paymentReferenceId,
    lemonSqueezyOrderId,
    lemonSqueezyCheckoutId,
    stripeSessionId,
    stripePaymentIntentId,
  } = params;

  if (!cartItems || cartItems.length === 0) {
    throw new Error('Order items cannot be empty.');
  }

  // Idempotency checks for payment webhooks
  if (lemonSqueezyOrderId) {
    const existing = await getDbOrderByLemonSqueezyOrderId(lemonSqueezyOrderId);
    if (existing) {
      return existing;
    }
  }

  if (paymentReferenceId) {
    const existing = await getDbOrderByPaymentReferenceId(paymentReferenceId);
    if (existing) {
      return existing;
    }
  }

  if (stripeSessionId) {
    const existing = await getDbOrderByStripeSessionId(stripeSessionId);
    if (existing) {
      return existing;
    }
  }

  const cleanEmail = customerEmail.trim().toLowerCase();
  const cleanName = customerName.trim() || 'Gourmet Customer';

  // Server-side price recalculation (Never trust prices sent from client)
  const verifiedOrderItems: OrderItem[] = [];
  let calculatedSubtotal = 0;

  for (const item of cartItems) {
    const liveBook = await getDbBookById(item.bookId);
    if (!liveBook) {
      throw new Error(`Recipe book "${item.bookId}" is no longer available.`);
    }

    const verifiedUnitPrice = Number(liveBook.price);
    const verifiedQuantity = Math.max(1, Math.floor(item.quantity));
    const lineSubtotal = Number((verifiedUnitPrice * verifiedQuantity).toFixed(2));
    calculatedSubtotal += lineSubtotal;

    verifiedOrderItems.push({
      bookId: liveBook.id,
      title: liveBook.title,
      author: liveBook.author,
      quantity: verifiedQuantity,
      unitPrice: verifiedUnitPrice,
      subtotal: lineSubtotal,
      coverImageUrl: liveBook.coverImageUrl,
      pdfFileName: liveBook.pdfFileName,
      fileSize: liveBook.fileSize,
      pdfFileUrl: liveBook.pdfFileUrl,
    });
  }

  const calculatedTotal = Number(calculatedSubtotal.toFixed(2));
  const orderId = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const now = new Date();

  const orderData: Order = {
    id: orderId,
    userId: userId || `guest_${Date.now()}`,
    customerName: cleanName,
    customerEmail: cleanEmail,
    items: verifiedOrderItems,
    subtotal: calculatedSubtotal,
    total: calculatedTotal,
    paymentMethod,
    paymentStatus: 'paid',
    orderStatus: 'completed',
    paymentReferenceId,
    lemonSqueezyOrderId,
    lemonSqueezyCheckoutId,
    stripeSessionId,
    stripePaymentIntentId,
    createdAt: now.toISOString(),
  };

  const db = await getDb();
  if (db && isMongoConfigured()) {
    try {
      await db.collection('orders').insertOne({
        ...orderData,
        createdAt: now,
      });
    } catch (err) {
      if (isMongoDuplicateKeyError(err)) {
        const existing = await findExistingOrderForIdempotencyKeys({
          paymentReferenceId,
          lemonSqueezyOrderId,
          stripeSessionId,
        });

        if (existing) {
          return existing;
        }
      }

      throw err instanceof Error ? err : new Error('Failed to save order to MongoDB.');
    }

    inMemoryOrders.unshift(orderData);

    // Side effects run only after a successful (non-duplicate) insert.
    await addItemsToLibrary({
      userId: orderData.userId,
      customerEmail: cleanEmail,
      orderId,
      items: verifiedOrderItems,
    });

    for (const item of verifiedOrderItems) {
      await incrementBookSalesCount(item.bookId, item.quantity);
    }

    return orderData;
  }

  inMemoryOrders.unshift(orderData);

  await addItemsToLibrary({
    userId: orderData.userId,
    customerEmail: cleanEmail,
    orderId,
    items: verifiedOrderItems,
  });

  for (const item of verifiedOrderItems) {
    await incrementBookSalesCount(item.bookId, item.quantity);
  }

  return orderData;
}

export async function getDbOrders(userId?: string, email?: string): Promise<Order[]> {
  const db = await getDb();
  if (db && isMongoConfigured()) {
    try {
      const query: Record<string, unknown> = {};
      if (userId) {
        query.userId = userId;
      } else if (email) {
        query.customerEmail = email.toLowerCase().trim();
      }

      const docs = await db
        .collection('orders')
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();

      return docs.map((d) => mapOrderDoc(d as Record<string, unknown>));
    } catch (err) {
      console.warn('Error querying MongoDB orders:', err);
    }
  }

  if (userId) {
    return inMemoryOrders.filter((o) => o.userId === userId);
  }
  if (email) {
    return inMemoryOrders.filter((o) => o.customerEmail.toLowerCase() === email.toLowerCase());
  }
  return inMemoryOrders;
}

export async function getDbOrderById(orderId: string): Promise<Order | null> {
  const db = await getDb();
  if (db && isMongoConfigured()) {
    try {
      const doc = await db.collection('orders').findOne({
        $or: [{ id: orderId }, { _id: (orderId.length === 24 ? { $oid: orderId } : undefined) as any }],
      });
      if (doc) {
        return mapOrderDoc(doc as Record<string, unknown>);
      }
    } catch (err) {
      console.warn('Error querying MongoDB order by ID:', err);
    }
  }

  return inMemoryOrders.find((o) => o.id === orderId) || null;
}

export async function getDbOrderByPaymentReferenceId(referenceId: string): Promise<Order | null> {
  const db = await getDb();
  if (db && isMongoConfigured()) {
    try {
      const doc = await db.collection('orders').findOne({ paymentReferenceId: referenceId });
      if (doc) {
        return mapOrderDoc(doc as Record<string, unknown>);
      }
    } catch (err) {
      console.warn('Error finding order by payment reference ID:', err);
    }
  }

  return inMemoryOrders.find((o) => o.paymentReferenceId === referenceId) || null;
}

export async function getDbOrderByLemonSqueezyOrderId(orderId: string): Promise<Order | null> {
  const db = await getDb();
  if (db && isMongoConfigured()) {
    try {
      const doc = await db.collection('orders').findOne({ lemonSqueezyOrderId: orderId });
      if (doc) {
        return mapOrderDoc(doc as Record<string, unknown>);
      }
    } catch (err) {
      console.warn('Error finding order by Lemon Squeezy order ID:', err);
    }
  }

  return inMemoryOrders.find((o) => o.lemonSqueezyOrderId === orderId) || null;
}

/** Lookup by external payment reference (Lemon Squeezy reference, LS order id, or legacy Stripe session). */
export async function getDbOrderByExternalPaymentId(externalId: string): Promise<Order | null> {
  const byReference = await getDbOrderByPaymentReferenceId(externalId);
  if (byReference) return byReference;

  const byLemonOrder = await getDbOrderByLemonSqueezyOrderId(externalId);
  if (byLemonOrder) return byLemonOrder;

  if (externalId.startsWith('cs_')) {
    return getDbOrderByStripeSessionId(externalId);
  }

  return null;
}

export async function getDbOrderByStripeSessionId(sessionId: string): Promise<Order | null> {
  const db = await getDb();
  if (db && isMongoConfigured()) {
    try {
      const doc = await db.collection('orders').findOne({ stripeSessionId: sessionId });
      if (doc) {
        return mapOrderDoc(doc as Record<string, unknown>);
      }
    } catch (err) {
      console.warn('Error finding order by Stripe session ID:', err);
    }
  }

  return inMemoryOrders.find((o) => o.stripeSessionId === sessionId) || null;
}

export async function getDbAdminStats(): Promise<{
  totalBooks: number;
  booksSold: number;
  totalRevenue: number;
  totalOrders: number;
}> {
  const books = await getDbBooks(undefined, true);
  const orders = await getDbOrders();

  const paidOrders = orders.filter((o) => o.paymentStatus === 'paid');
  const totalOrders = paidOrders.length;

  let booksSold = 0;
  let totalRevenue = 0;

  paidOrders.forEach((order) => {
    totalRevenue += Number(order.total) || 0;
    order.items.forEach((item) => {
      booksSold += Number(item.quantity) || 0;
    });
  });

  return {
    totalBooks: books.length,
    booksSold,
    totalRevenue: Number(totalRevenue.toFixed(2)),
    totalOrders,
  };
}
