import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

export function isStripeConfigured(): boolean {
  return Boolean(stripeSecretKey && stripeSecretKey.trim() !== '' && stripeSecretKey.startsWith('sk_'));
}

export const stripe = isStripeConfigured()
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-02-24.acacia' as Stripe.LatestApiVersion,
      typescript: true,
    })
  : null;

export interface LineItemDetail {
  bookId: string;
  title: string;
  unitPrice: number;
  quantity: number;
  coverImageUrl?: string;
}

/**
 * Creates a Stripe Checkout Session with server-verified prices and metadata
 */
export async function createStripeCheckoutSession(params: {
  userId: string;
  customerName: string;
  customerEmail: string;
  items: LineItemDetail[];
  successUrl: string;
  cancelUrl: string;
}): Promise<{ sessionId: string; url: string | null }> {
  if (!stripe) {
    throw new Error('Stripe is not configured. STRIPE_SECRET_KEY is missing.');
  }

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = params.items.map((item) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.title,
        description: 'Authentic Digital Recipe Book (Instant PDF)',
        images: item.coverImageUrl ? [item.coverImageUrl] : [],
        metadata: {
          bookId: item.bookId,
        },
      },
      unit_amount: Math.round(item.unitPrice * 100), // Stripe expects cents
    },
    quantity: Math.max(1, Math.floor(item.quantity)),
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: params.customerEmail,
    line_items: lineItems,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      userId: params.userId,
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      itemsJson: JSON.stringify(
        params.items.map((i) => ({
          bookId: i.bookId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        }))
      ),
    },
  });

  return {
    sessionId: session.id,
    url: session.url,
  };
}

/**
 * Verifies Stripe Webhook event signature
 */
export function constructStripeEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  if (!stripe) {
    throw new Error('Stripe is not configured.');
  }
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured.');
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
