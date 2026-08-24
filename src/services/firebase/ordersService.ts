import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
  updateDoc
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import { booksService } from './booksService';
import { LocalDataEngine } from './mockEngine';
import type { CartItem, Order, OrderItem, PaymentMethod } from '../../types';

export const ordersService = {
  async createOrder(
    userId: string,
    customerName: string,
    customerEmail: string,
    cartItems: CartItem[],
    paymentMethod: PaymentMethod
  ): Promise<Order> {
    if (cartItems.length === 0) {
      throw new Error('Cart is empty. Cannot create an order.');
    }

    const cleanEmail = customerEmail.trim().toLowerCase();
    const cleanName = customerName.trim() || 'Gourmet Customer';

    // Step 1: Server-side price recalculation (Never trust prices sent blindly from client state)
    const verifiedOrderItems: OrderItem[] = [];
    let calculatedSubtotal = 0;

    for (const item of cartItems) {
      const liveBook = await booksService.getBookById(item.bookId);
      if (!liveBook) {
        throw new Error(`Recipe book "${item.title}" is no longer available.`);
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
      createdAt: new Date().toISOString(),
    };

    if (isFirebaseConfigured && db) {
      // 1. Create order doc in Firestore
      await setDoc(doc(db, 'orders', orderId), {
        ...orderData,
        createdAt: serverTimestamp(),
      });

      // 2. Populate customer's Library collection and increment book salesCount
      for (const item of verifiedOrderItems) {
        const libraryId = `${orderData.userId}_${item.bookId}_${orderId.substring(4, 9)}`;
        const libraryDocRef = doc(db, 'libraries', libraryId);
        
        await setDoc(libraryDocRef, {
          id: libraryId,
          userId: orderData.userId,
          customerEmail: cleanEmail,
          bookId: item.bookId,
          orderId,
          title: item.title,
          author: item.author || 'Chef',
          coverImageUrl: item.coverImageUrl,
          pdfFileName: item.pdfFileName,
          fileSize: item.fileSize,
          pdfFileUrl: item.pdfFileUrl || '',
          purchasedAt: serverTimestamp(),
          downloadCount: 0,
          lastDownloadedAt: null,
        }, { merge: true });

        // Increment salesCount in Firestore
        try {
          await updateDoc(doc(db, 'books', item.bookId), {
            salesCount: increment(item.quantity)
          });
        } catch (err) {
          console.warn('Could not increment book salesCount:', err);
        }
      }

      return orderData;
    }

    // Fallback persistent engine
    LocalDataEngine.saveOrder(orderData);

    // Add items to local customer library
    verifiedOrderItems.forEach(item => {
      LocalDataEngine.addToLibrary({
        id: `${orderData.userId}_${item.bookId}`,
        userId: orderData.userId,
        customerEmail: cleanEmail,
        bookId: item.bookId,
        orderId,
        title: item.title,
        author: item.author || 'Chef',
        coverImageUrl: item.coverImageUrl,
        pdfFileName: item.pdfFileName,
        fileSize: item.fileSize,
        pdfFileUrl: item.pdfFileUrl || '#',
        purchasedAt: new Date().toISOString(),
        downloadCount: 0,
        lastDownloadedAt: null,
      });
    });

    return orderData;
  },

  async getOrders(userId?: string, email?: string): Promise<Order[]> {
    if (isFirebaseConfigured && db) {
      try {
        const ordersRef = collection(db, 'orders');
        let q = query(ordersRef, orderBy('createdAt', 'desc'));
        if (userId) {
          q = query(ordersRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
        } else if (email) {
          q = query(ordersRef, where('customerEmail', '==', email.toLowerCase()), orderBy('createdAt', 'desc'));
        }
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
      } catch (err) {
        console.warn('Firestore orders query error, falling back to local dataset:', err);
      }
    }

    const orders = LocalDataEngine.getOrders(userId);
    if (email) {
      return orders.filter(o => o.customerEmail?.toLowerCase() === email.toLowerCase());
    }
    return orders;
  },

  async getOrderById(orderId: string): Promise<Order | null> {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDoc(doc(db, 'orders', orderId));
        if (snap.exists()) {
          return { id: snap.id, ...snap.data() } as Order;
        }
      } catch (err) {
        console.warn('Error fetching order by ID:', err);
      }
    }

    const orders = LocalDataEngine.getOrders();
    return orders.find(o => o.id === orderId) || null;
  },

  async getAdminStats(): Promise<{
    totalBooks: number;
    booksSold: number;
    totalRevenue: number;
    totalOrders: number;
  }> {
    const books = await booksService.getBooks(undefined, true);
    const orders = await this.getOrders();

    const paidOrders = orders.filter(o => o.paymentStatus === 'paid');
    const totalOrders = paidOrders.length;
    
    let booksSold = 0;
    let totalRevenue = 0;

    paidOrders.forEach(order => {
      totalRevenue += Number(order.total) || 0;
      order.items.forEach(item => {
        booksSold += Number(item.quantity) || 0;
      });
    });

    return {
      totalBooks: books.length,
      booksSold,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalOrders
    };
  }
};
