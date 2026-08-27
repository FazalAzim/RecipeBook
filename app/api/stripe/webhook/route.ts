import { NextRequest, NextResponse } from 'next/server';
import { constructStripeEvent, isStripeConfigured } from '@/lib/stripe';
import { createDbOrder, getDbOrderByStripeSessionId } from '@/lib/db/orders';
import type Stripe from 'stripe';

export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 500 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header.' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await req.text();
    event = constructStripeEvent(rawBody, signature);
  } catch (err: any) {
    console.error('⚠️ Stripe webhook signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const sessionId = session.id;
      const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : undefined;

      // Idempotency: avoid duplicate order creation
      const existingOrder = await getDbOrderByStripeSessionId(sessionId);
      if (existingOrder) {
        console.info(`Order already processed for Stripe session: ${sessionId}`);
        return NextResponse.json({ received: true, status: 'already_processed' });
      }

      const metadata = session.metadata || {};
      const userId = metadata.userId || `stripe_guest_${Date.now()}`;
      const customerName = metadata.customerName || session.customer_details?.name || 'Gourmet Customer';
      const customerEmail = metadata.customerEmail || session.customer_details?.email || session.customer_email || '';

      const items: Array<{ bookId: string; quantity: number }> = metadata.itemsJson
        ? JSON.parse(metadata.itemsJson)
        : [];

      if (items.length > 0 && customerEmail) {
        await createDbOrder({
          userId,
          customerName,
          customerEmail,
          cartItems: items,
          paymentMethod: 'stripe',
          stripeSessionId: sessionId,
          stripePaymentIntentId: paymentIntentId,
        });
        console.info(`✅ Successfully fulfilled Stripe order for ${customerEmail}`);
      }
    } catch (orderErr) {
      console.error('❌ Error processing Stripe order fulfillment:', orderErr);
      return NextResponse.json(
        { error: 'Order fulfillment failed in database.' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
