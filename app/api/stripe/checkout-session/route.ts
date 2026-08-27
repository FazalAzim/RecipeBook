import { NextRequest, NextResponse } from 'next/server';
import { getDbBookById } from '@/lib/db/books';
import { createStripeCheckoutSession, isStripeConfigured, LineItemDetail } from '@/lib/stripe';
import { getSessionUser } from '@/lib/auth';

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
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Step 1: Server-side price recalculation (Never trust prices sent from client)
    const verifiedLineItems: LineItemDetail[] = [];

    for (const item of items) {
      const book = await getDbBookById(item.bookId);
      if (!book) {
        return NextResponse.json(
          { error: `Recipe book "${item.bookId}" is no longer available.` },
          { status: 404 }
        );
      }

      verifiedLineItems.push({
        bookId: book.id,
        title: book.title,
        unitPrice: Number(book.price),
        quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
        coverImageUrl: book.coverImageUrl.startsWith('/')
          ? `${origin}${book.coverImageUrl}`
          : book.coverImageUrl,
      });
    }

    const successUrl = `${origin}/order-confirmation/{CHECKOUT_SESSION_ID}?stripe_success=true`;
    const cancelUrl = `${origin}/checkout?canceled=true`;

    if (!isStripeConfigured()) {
      return NextResponse.json(
        {
          error: 'Stripe is not configured. Please configure STRIPE_SECRET_KEY in your environment, or use Direct Card Checkout.',
          isStripeConfigured: false,
        },
        { status: 503 }
      );
    }

    const session = await createStripeCheckoutSession({
      userId,
      customerName: name,
      customerEmail: customerEmail.trim().toLowerCase(),
      items: verifiedLineItems,
      successUrl,
      cancelUrl,
    });

    return NextResponse.json({ sessionId: session.sessionId, url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout session error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize Stripe checkout session.' },
      { status: 500 }
    );
  }
}
