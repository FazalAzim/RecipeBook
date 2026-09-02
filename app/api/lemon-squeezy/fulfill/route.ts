import { NextRequest, NextResponse } from 'next/server';
import { fulfillCheckoutOrder } from '@/lib/db/fulfillment';
import { isLemonSqueezyConfigured } from '@/lib/lemon-squeezy';

export async function POST(req: NextRequest) {
  try {
    if (!isLemonSqueezyConfigured()) {
      return NextResponse.json({ error: 'Lemon Squeezy is not configured.' }, { status: 503 });
    }

    const body = await req.json();
    const paymentReferenceId = body.paymentReferenceId as string;

    if (!paymentReferenceId) {
      return NextResponse.json({ error: 'paymentReferenceId is required.' }, { status: 400 });
    }

    const order = await fulfillCheckoutOrder({
      paymentReferenceId,
      verifyPayment: true,
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Payment not verified yet or checkout session expired.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error('Lemon Squeezy fulfill error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fulfill order.' },
      { status: 500 }
    );
  }
}
