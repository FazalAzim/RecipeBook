import { NextRequest, NextResponse } from 'next/server';
import { getDbOrders } from '@/lib/db/orders';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const emailParam = searchParams.get('email');
    const sessionUser = await getSessionUser();

    if (sessionUser?.role === 'admin') {
      // Admin can query all orders or by email
      const orders = await getDbOrders(undefined, emailParam || undefined);
      return NextResponse.json({ orders });
    }

    // Customer can only view their own orders
    if (sessionUser) {
      const orders = await getDbOrders(sessionUser.id, sessionUser.email);
      return NextResponse.json({ orders });
    }

    if (emailParam) {
      const orders = await getDbOrders(undefined, emailParam);
      return NextResponse.json({ orders });
    }

    return NextResponse.json({ orders: [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch orders.' }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json(
    {
      error: 'Direct order creation is disabled. Complete payment through Stripe Checkout.',
    },
    { status: 403 }
  );
}
