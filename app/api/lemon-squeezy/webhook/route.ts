import { NextRequest, NextResponse } from 'next/server';
import {
  isLemonSqueezyConfigured,
  parseLemonSqueezyWebhookEvent,
  verifyLemonSqueezyWebhookSignature,
} from '@/lib/lemon-squeezy';
import { fulfillCheckoutOrder } from '@/lib/db/fulfillment';

function parseWebhookItems(customData: Record<string, string>) {
  if (!customData.items_json) return [];

  try {
    return JSON.parse(customData.items_json) as Array<{ bookId: string; quantity: number }>;
  } catch {
    console.warn('Failed to parse items_json from Lemon Squeezy webhook custom_data.');
    return [];
  }
}

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
      const isRefunded = Boolean(event.data.attributes.refunded);

      if (isRefunded || (orderStatus && orderStatus !== 'paid')) {
        return NextResponse.json({ received: true, status: 'ignored_unpaid' });
      }

      const customData = event.meta.custom_data || {};
      const paymentReferenceId = customData.payment_reference_id;
      const userId = customData.user_id;
      const customerName =
        customData.customer_name || event.data.attributes.user_name || 'Gourmet Customer';
      const customerEmail =
        customData.customer_email || event.data.attributes.user_email || '';
      const items = parseWebhookItems(customData);

      if (!paymentReferenceId) {
        console.warn('Lemon Squeezy webhook missing payment_reference_id in custom_data.');
        return NextResponse.json({ received: true, status: 'missing_reference' });
      }

      const order = await fulfillCheckoutOrder({
        paymentReferenceId,
        lemonSqueezyOrderId: lemonOrderId,
        userId,
        customerName,
        customerEmail,
        items: items.length > 0 ? items : undefined,
        verifyPayment: false,
      });

      if (order) {
        console.info(`✅ Successfully fulfilled Lemon Squeezy order for ${order.customerEmail}`);
      } else {
        console.warn(`⚠️ Could not fulfill Lemon Squeezy order for reference: ${paymentReferenceId}`);
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
