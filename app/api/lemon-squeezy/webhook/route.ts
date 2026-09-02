import { NextRequest, NextResponse } from 'next/server';
import {
  isLemonSqueezyConfigured,
  parseLemonSqueezyWebhookEvent,
  verifyLemonSqueezyWebhookSignature,
} from '@/lib/lemon-squeezy';
import {
  createDbOrder,
  getDbOrderByLemonSqueezyOrderId,
  getDbOrderByPaymentReferenceId,
} from '@/lib/db/orders';

export async function POST(req: NextRequest) {
  if (!isLemonSqueezyConfigured()) {
    return NextResponse.json({ error: 'Lemon Squeezy is not configured.' }, { status: 500 });
  }

  const signature = req.headers.get('x-signature');

  let event;
  try {
    const rawBody = await req.text();
    verifyLemonSqueezyWebhookSignature(rawBody, signature);
    event = parseLemonSqueezyWebhookEvent(rawBody);
  } catch (err: any) {
    console.error('⚠️ Lemon Squeezy webhook signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.meta.event_name === 'order_created') {
    try {
      const lemonOrderId = event.data.id;
      const orderStatus = event.data.attributes.status;

      if (orderStatus && orderStatus !== 'paid') {
        return NextResponse.json({ received: true, status: 'ignored_unpaid' });
      }

      const existingOrder = await getDbOrderByLemonSqueezyOrderId(lemonOrderId);
      if (existingOrder) {
        console.info(`Order already processed for Lemon Squeezy order: ${lemonOrderId}`);
        return NextResponse.json({ received: true, status: 'already_processed' });
      }

      const customData = event.meta.custom_data || {};
      const paymentReferenceId = customData.payment_reference_id;
      const userId = customData.user_id || `ls_guest_${Date.now()}`;
      const customerName =
        customData.customer_name || event.data.attributes.user_name || 'Gourmet Customer';
      const customerEmail =
        customData.customer_email || event.data.attributes.user_email || '';

      if (paymentReferenceId) {
        const existingByReference = await getDbOrderByPaymentReferenceId(paymentReferenceId);
        if (existingByReference) {
          console.info(`Order already processed for payment reference: ${paymentReferenceId}`);
          return NextResponse.json({ received: true, status: 'already_processed' });
        }
      }

      const items: Array<{ bookId: string; quantity: number }> = customData.items_json
        ? JSON.parse(customData.items_json)
        : [];

      if (items.length > 0 && customerEmail) {
        await createDbOrder({
          userId,
          customerName,
          customerEmail,
          cartItems: items,
          paymentMethod: 'lemon_squeezy',
          paymentReferenceId,
          lemonSqueezyOrderId: lemonOrderId,
        });
        console.info(`✅ Successfully fulfilled Lemon Squeezy order for ${customerEmail}`);
      }
    } catch (orderErr) {
      console.error('❌ Error processing Lemon Squeezy order fulfillment:', orderErr);
      return NextResponse.json(
        { error: 'Order fulfillment failed in database.' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
