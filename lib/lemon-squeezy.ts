import crypto from 'node:crypto';
import {
  getLemonSqueezyApiKey,
  getLemonSqueezyMode,
  getLemonSqueezyVariantId,
} from './env';

const API_BASE = 'https://api.lemonsqueezy.com/v1';

export interface LineItemDetail {
  bookId: string;
  title: string;
  unitPrice: number;
  quantity: number;
  coverImageUrl?: string;
}

export interface LemonSqueezyCheckoutResult {
  checkoutId: string;
  paymentReferenceId: string;
  url: string;
}

interface LemonSqueezyApiResponse<T> {
  data: T;
}

interface LemonSqueezyCheckoutData {
  id: string;
  attributes: {
    url: string;
  };
}

export function isLemonSqueezyConfigured(): boolean {
  const apiKey = getLemonSqueezyApiKey();
  const storeId = process.env.LEMON_SQUEEZY_STORE_ID || '';
  const variantId = getLemonSqueezyVariantId();

  return Boolean(apiKey && storeId.trim() && variantId);
}

function getRequiredConfig() {
  const apiKey = getLemonSqueezyApiKey();
  const storeId = process.env.LEMON_SQUEEZY_STORE_ID?.trim();
  const variantId = getLemonSqueezyVariantId();
  const webhookSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET?.trim();
  const mode = getLemonSqueezyMode();

  if (!apiKey || !storeId || !variantId) {
    throw new Error(
      `Lemon Squeezy is not configured for mode "${mode}". Set LEMON_SQUEEZY_API_KEY (or LEMON_SQUEEZY_API_KEY_${mode.toUpperCase()}), LEMON_SQUEEZY_STORE_ID, and LEMON_SQUEEZY_VARIANT_ID (or LEMON_SQUEEZY_VARIANT_ID_${mode.toUpperCase()}).`
    );
  }

  return { apiKey, storeId, variantId, webhookSecret, mode };
}

async function lemonSqueezyRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const { apiKey } = getRequiredConfig();

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
      Authorization: `Bearer ${apiKey}`,
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      (payload as { errors?: Array<{ detail?: string }> })?.errors?.[0]?.detail ||
      `Lemon Squeezy API request failed (${response.status}).`;
    throw new Error(message);
  }

  return payload as T;
}

export function createPaymentReferenceId(): string {
  return `ls_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}

/**
 * Creates a Lemon Squeezy hosted checkout with server-verified cart pricing.
 * Uses a generic store variant with custom_price for dynamic multi-item carts.
 */
export async function createLemonSqueezyCheckout(params: {
  paymentReferenceId: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  items: LineItemDetail[];
  successUrl: string;
  cancelUrl: string;
}): Promise<LemonSqueezyCheckoutResult> {
  const { storeId, variantId } = getRequiredConfig();

  const totalCents = params.items.reduce(
    (sum, item) => sum + Math.round(item.unitPrice * 100) * Math.max(1, Math.floor(item.quantity)),
    0
  );

  if (totalCents <= 0) {
    throw new Error('Checkout total must be greater than zero.');
  }

  const itemCount = params.items.reduce((sum, item) => sum + Math.max(1, Math.floor(item.quantity)), 0);
  const primaryTitle = params.items[0]?.title || 'Digital Recipe Book';
  const productName =
    params.items.length === 1
      ? primaryTitle
      : `Recipe Books Bundle (${itemCount} item${itemCount === 1 ? '' : 's'})`;

  const productDescription = params.items
    .map((item) => `${item.title} x${Math.max(1, Math.floor(item.quantity))}`)
    .join(' • ');

  const coverImages = params.items
    .map((item) => item.coverImageUrl)
    .filter((url): url is string => typeof url === 'string' && url.length > 0 && url.length <= 255)
    .slice(0, 3);

  if (coverImages.length === 0) {
    console.warn('Lemon Squeezy checkout created without product media (no cover URL ≤255 chars).');
  } else {
    console.info('Lemon Squeezy checkout media:', coverImages);
  }

  const response = await lemonSqueezyRequest<LemonSqueezyApiResponse<LemonSqueezyCheckoutData>>(
    '/checkouts',
    {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            custom_price: totalCents,
            product_options: {
              name: productName,
              description: productDescription,
              media: coverImages,
              redirect_url: params.successUrl,
              receipt_button_text: 'Go to My Library',
              receipt_link_url: params.successUrl.replace(/\/order-confirmation\/[^/?]+.*$/, '/library'),
              receipt_thank_you_note: 'Your digital recipe books are ready for instant download.',
            },
            checkout_options: {
              embed: false,
              media: true,
              logo: true,
              desc: true,
              discount: true,
            },
            checkout_data: {
              email: params.customerEmail,
              name: params.customerName,
              custom: {
                payment_reference_id: params.paymentReferenceId,
                user_id: params.userId,
                customer_name: params.customerName,
                customer_email: params.customerEmail,
                items_json: JSON.stringify(
                  params.items.map((item) => ({
                    bookId: item.bookId,
                    quantity: Math.max(1, Math.floor(item.quantity)),
                    unitPrice: item.unitPrice,
                  }))
                ),
              },
            },
            preview: false,
          },
          relationships: {
            store: {
              data: {
                type: 'stores',
                id: storeId,
              },
            },
            variant: {
              data: {
                type: 'variants',
                id: variantId,
              },
            },
          },
        },
      }),
    }
  );

  const checkoutId = response.data.id;
  const checkoutUrl = response.data.attributes.url;

  if (!checkoutUrl) {
    throw new Error('Lemon Squeezy did not return a checkout URL.');
  }

  return {
    checkoutId,
    paymentReferenceId: params.paymentReferenceId,
    url: checkoutUrl,
  };
}

export interface LemonSqueezyWebhookEvent {
  meta: {
    event_name: string;
    custom_data?: Record<string, string>;
  };
  data: {
    type: string;
    id: string;
    attributes: {
      status?: string;
      user_name?: string;
      user_email?: string;
      identifier?: string;
      subtotal?: number;
      subtotal_usd?: number;
      total?: number;
      total_usd?: number;
      refunded?: boolean | null;
      created_at?: string;
    };
  };
}

interface LemonSqueezyOrdersListResponse {
  data: Array<{
    id: string;
    attributes: {
      status: string;
      user_email: string;
      subtotal: number;
      subtotal_usd: number;
      total: number;
      total_usd: number;
      refunded: boolean | null;
      created_at: string;
    };
  }>;
}

/**
 * Finds a recently paid Lemon Squeezy order matching email + cart subtotal.
 * Used to fulfill orders when webhooks cannot reach local/dev environments.
 */
export async function findVerifiedLemonSqueezyOrder(
  customerEmail: string,
  expectedSubtotalCents: number,
  createdAfter: Date
): Promise<{ orderId: string } | null> {
  const { storeId } = getRequiredConfig();
  const normalizedEmail = customerEmail.trim().toLowerCase();

  const endpoints = [
    `/orders?filter[store_id]=${storeId}&filter[user_email]=${encodeURIComponent(normalizedEmail)}&page[size]=15`,
    `/orders?filter[store_id]=${storeId}&page[size]=25`,
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await lemonSqueezyRequest<LemonSqueezyOrdersListResponse>(endpoint);
      const match = (response.data || []).find((order) => {
        const attrs = order.attributes;
        if (!attrs || attrs.status !== 'paid' || attrs.refunded) return false;
        if ((attrs.user_email || '').toLowerCase() !== normalizedEmail) return false;

        const orderCreatedAt = new Date(attrs.created_at);
        if (Number.isNaN(orderCreatedAt.getTime()) || orderCreatedAt < createdAfter) return false;

        const subtotalCents = Number(attrs.subtotal_usd ?? attrs.subtotal ?? 0);
        return subtotalCents === expectedSubtotalCents;
      });

      if (match) {
        return { orderId: match.id };
      }
    } catch (err) {
      console.warn('Lemon Squeezy order lookup failed:', err);
    }
  }

  return null;
}

/**
 * Verifies Lemon Squeezy webhook requests using the X-Signature HMAC header.
 */
export function verifyLemonSqueezyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null
): void {
  const { webhookSecret } = getRequiredConfig();

  if (!webhookSecret) {
    throw new Error('LEMON_SQUEEZY_WEBHOOK_SECRET is not configured.');
  }

  if (!signatureHeader) {
    throw new Error('Missing X-Signature header.');
  }

  const digest = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
  const digestBuffer = Buffer.from(digest, 'utf8');
  const signatureBuffer = Buffer.from(signatureHeader, 'utf8');

  if (
    digestBuffer.length !== signatureBuffer.length ||
    !crypto.timingSafeEqual(digestBuffer, signatureBuffer)
  ) {
    throw new Error('Invalid webhook signature.');
  }
}

export function parseLemonSqueezyWebhookEvent(rawBody: string): LemonSqueezyWebhookEvent {
  return JSON.parse(rawBody) as LemonSqueezyWebhookEvent;
}
