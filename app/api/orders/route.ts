import { NextRequest, NextResponse } from 'next/server';
import { createDbOrder, getDbOrders } from '@/lib/db/orders';
import { getSessionUser } from '@/lib/auth';
import type { CartItem, PaymentMethod } from '@/lib/types';

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerName, customerEmail, items, paymentMethod = 'credit_card' } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Order items are required.' }, { status: 400 });
    }

    if (!customerEmail) {
      return NextResponse.json({ error: 'Customer email is required.' }, { status: 400 });
    }

    const sessionUser = await getSessionUser();
    const userId = sessionUser?.id || `guest_${Date.now()}`;
    const name = customerName || sessionUser?.name || 'Gourmet Customer';

    const order = await createDbOrder({
      userId,
      customerName: name,
      customerEmail: customerEmail.trim().toLowerCase(),
      cartItems: items as CartItem[],
      paymentMethod: paymentMethod as PaymentMethod,
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process order.' }, { status: 500 });
  }
}
