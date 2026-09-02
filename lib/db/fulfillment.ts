import { createDbOrder, getDbOrderByExternalPaymentId, getDbOrderByPaymentReferenceId } from './orders';
import {
  getPendingCheckoutByReferenceId,
  markPendingCheckoutFulfilled,
  type PendingCheckoutItem,
} from './pending-checkouts';
import { findVerifiedLemonSqueezyOrder } from '../lemon-squeezy';
import type { Order } from '../types';

export interface FulfillCheckoutParams {
  paymentReferenceId: string;
  lemonSqueezyOrderId?: string;
  lemonSqueezyCheckoutId?: string;
  userId?: string;
  customerName?: string;
  customerEmail?: string;
  items?: PendingCheckoutItem[];
  /** When true, verifies payment with Lemon Squeezy API before fulfilling (redirect flow). */
  verifyPayment?: boolean;
}

export async function fulfillCheckoutOrder(params: FulfillCheckoutParams): Promise<Order | null> {
  const { paymentReferenceId } = params;

  const existingByReference = await getDbOrderByPaymentReferenceId(paymentReferenceId);
  if (existingByReference) {
    await markPendingCheckoutFulfilled(paymentReferenceId);
    return existingByReference;
  }

  if (params.lemonSqueezyOrderId) {
    const existingByLemonOrder = await getDbOrderByExternalPaymentId(params.lemonSqueezyOrderId);
    if (existingByLemonOrder) {
      await markPendingCheckoutFulfilled(paymentReferenceId);
      return existingByLemonOrder;
    }
  }

  const pending = await getPendingCheckoutByReferenceId(paymentReferenceId);
  if (!pending) {
    console.warn(`No pending checkout found for reference: ${paymentReferenceId}`);
    return null;
  }

  const userId = params.userId || pending.userId;
  const customerName = params.customerName || pending.customerName;
  const customerEmail = (params.customerEmail || pending.customerEmail).trim().toLowerCase();
  const items = params.items?.length ? params.items : pending.items;

  if (!items.length || !customerEmail) {
    console.warn(`Missing fulfillment data for reference: ${paymentReferenceId}`);
    return null;
  }

  let lemonSqueezyOrderId = params.lemonSqueezyOrderId;

  if (params.verifyPayment && !lemonSqueezyOrderId) {
    const verified = await findVerifiedLemonSqueezyOrder(
      customerEmail,
      pending.totalCents,
      new Date(new Date(pending.createdAt).getTime() - 60_000)
    );

    if (verified) {
      lemonSqueezyOrderId = verified.orderId;
    } else if (process.env.NODE_ENV !== 'development') {
      return null;
    } else {
      console.warn(
        `DEV: fulfilling ${paymentReferenceId} without Lemon Squeezy API verification (webhook/tunnel may be unavailable).`
      );
    }
  }

  const order = await createDbOrder({
    userId,
    customerName,
    customerEmail,
    cartItems: items,
    paymentMethod: 'lemon_squeezy',
    paymentReferenceId,
    lemonSqueezyOrderId,
    lemonSqueezyCheckoutId: params.lemonSqueezyCheckoutId || pending.lemonSqueezyCheckoutId,
  });

  await markPendingCheckoutFulfilled(paymentReferenceId);
  return order;
}
