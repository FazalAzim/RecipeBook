import { NextRequest, NextResponse } from 'next/server';
import { getDbBookById } from '@/lib/db/books';
import { savePendingCheckout } from '@/lib/db/pending-checkouts';
import {
  createLemonSqueezyCheckout,
  createPaymentReferenceId,
  isLemonSqueezyConfigured,
  type LineItemDetail,
} from '@/lib/lemon-squeezy';
import { buildCheckoutCoverUrl } from '@/lib/r2';
import { getSessionUser } from '@/lib/auth';

function getCheckoutAppOrigin(req: NextRequest): string {
  const envUrl = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
  if (envUrl.startsWith('http://') || envUrl.startsWith('https://')) {
    return envUrl;
  }

  const origin = req.headers.get('origin');
  if (origin) return origin.replace(/\/$/, '');

  const proto = req.headers.get('x-forwarded-proto') || 'https';
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  if (host) return `${proto}://${host}`.replace(/\/$/, '');

  return 'http://localhost:3000';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, customerEmail, customerName } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart items cannot be empty.' }, { status: 400 });
    }

    if (!customerEmail) {
      return NextResponse.json({ error: 'Customer email is required.' }, { status: 400 });
    }

    const sessionUser = await getSessionUser();
    const userId = sessionUser?.id || `guest_${Date.now()}`;
    const name = customerName || sessionUser?.name || 'Gourmet Customer';
    const origin = getCheckoutAppOrigin(req);

    const verifiedLineItems: LineItemDetail[] = [];

    for (const item of items) {
      const book = await getDbBookById(item.bookId);
      if (!book) {
        return NextResponse.json(
          { error: `Recipe book "${item.bookId}" is no longer available.` },
          { status: 404 }
        );
      }

      const coverImageUrl = buildCheckoutCoverUrl(book.id, origin);

      verifiedLineItems.push({
        bookId: book.id,
        title: book.title,
        unitPrice: Number(book.price),
        quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
        coverImageUrl,
      });
    }

    if (!isLemonSqueezyConfigured()) {
      return NextResponse.json(
        {
          error:
            'Lemon Squeezy is not configured. Please set LEMON_SQUEEZY_API_KEY, LEMON_SQUEEZY_STORE_ID, and LEMON_SQUEEZY_VARIANT_ID.',
          isLemonSqueezyConfigured: false,
        },
        { status: 503 }
      );
    }

    const paymentReferenceId = createPaymentReferenceId();
    const successUrl = `${origin}/order-confirmation/${paymentReferenceId}?payment_success=true`;
    const cancelUrl = `${origin}/checkout?canceled=true`;

    const totalCents = verifiedLineItems.reduce(
      (sum, item) => sum + Math.round(item.unitPrice * 100) * Math.max(1, Math.floor(item.quantity)),
      0
    );

    const checkout = await createLemonSqueezyCheckout({
      paymentReferenceId,
      userId,
      customerName: name,
      customerEmail: customerEmail.trim().toLowerCase(),
      items: verifiedLineItems,
      successUrl,
      cancelUrl,
    });

    await savePendingCheckout({
      paymentReferenceId,
      userId,
      customerName: name,
      customerEmail: customerEmail.trim().toLowerCase(),
      items: verifiedLineItems.map((item) => ({
        bookId: item.bookId,
        quantity: Math.max(1, Math.floor(item.quantity)),
      })),
      totalCents,
      lemonSqueezyCheckoutId: checkout.checkoutId,
    });

    return NextResponse.json({
      checkoutId: checkout.checkoutId,
      paymentReferenceId: checkout.paymentReferenceId,
      url: checkout.url,
    });
  } catch (error: any) {
    console.error('Lemon Squeezy checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize Lemon Squeezy checkout.' },
      { status: 500 }
    );
  }
}
