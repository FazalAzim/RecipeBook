import { getDb, isMongoConfigured } from '../mongodb';
import { getDbBookById, getDbBooks, incrementBookSalesCount } from './books';
import { addItemsToLibrary } from './library';
import type { CartItem, Order, OrderItem, PaymentMethod } from '../types';

let inMemoryOrders: Order[] = [];

export async function createDbOrder(params: {
  userId: string;
  customerName: string;
  customerEmail: string;
  cartItems: CartItem[] | { bookId: string; quantity: number }[];
  paymentMethod: PaymentMethod;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
}): Promise<Order> {
  const { userId, customerName, customerEmail, cartItems, paymentMethod, stripeSessionId, stripePaymentIntentId } = params;

  if (!cartItems || cartItems.length === 0) {
    throw new Error('Order items cannot be empty.');
  }

  // Idempotency check for Stripe webhooks
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
      console.warn('Error saving order to MongoDB:', err);
    }
  }

  inMemoryOrders.unshift(orderData);

  // Grant instant library access to verified purchaser
  await addItemsToLibrary({
    userId: orderData.userId,
    customerEmail: cleanEmail,
    orderId,
    items: verifiedOrderItems,
  });

  // Increment sales count on purchased books
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

      return docs.map((d) => ({
        id: (d.id || d._id.toString()) as string,
        userId: d.userId as string,
        customerName: d.customerName as string,
        customerEmail: d.customerEmail as string,
        items: d.items as OrderItem[],
        subtotal: Number(d.subtotal),
        total: Number(d.total),
        paymentMethod: d.paymentMethod as PaymentMethod,
        paymentStatus: d.paymentStatus as any,
        orderStatus: d.orderStatus as any,
        stripeSessionId: d.stripeSessionId as string,
        stripePaymentIntentId: d.stripePaymentIntentId as string,
        createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
      }));
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
        return {
          id: (doc.id || doc._id.toString()) as string,
          userId: doc.userId as string,
          customerName: doc.customerName as string,
          customerEmail: doc.customerEmail as string,
          items: doc.items as OrderItem[],
          subtotal: Number(doc.subtotal),
          total: Number(doc.total),
          paymentMethod: doc.paymentMethod as PaymentMethod,
          paymentStatus: doc.paymentStatus as any,
          orderStatus: doc.orderStatus as any,
          stripeSessionId: doc.stripeSessionId as string,
          stripePaymentIntentId: doc.stripePaymentIntentId as string,
          createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
        };
      }
    } catch (err) {
      console.warn('Error querying MongoDB order by ID:', err);
    }
  }

  return inMemoryOrders.find((o) => o.id === orderId) || null;
}

export async function getDbOrderByStripeSessionId(sessionId: string): Promise<Order | null> {
  const db = await getDb();
  if (db && isMongoConfigured()) {
    try {
      const doc = await db.collection('orders').findOne({ stripeSessionId: sessionId });
      if (doc) {
        return {
          id: (doc.id || doc._id.toString()) as string,
          userId: doc.userId as string,
          customerName: doc.customerName as string,
          customerEmail: doc.customerEmail as string,
          items: doc.items as OrderItem[],
          subtotal: Number(doc.subtotal),
          total: Number(doc.total),
          paymentMethod: doc.paymentMethod as PaymentMethod,
          paymentStatus: doc.paymentStatus as any,
          orderStatus: doc.orderStatus as any,
          stripeSessionId: doc.stripeSessionId as string,
          stripePaymentIntentId: doc.stripePaymentIntentId as string,
          createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
        };
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
