import { NextRequest, NextResponse } from 'next/server';
import { getDbOrderById, getDbOrderByStripeSessionId } from '@/lib/db/orders';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let order = await getDbOrderById(id);

    // If not found by ORD id, check if id is a Stripe checkout session id
    if (!order && id.startsWith('cs_')) {
      order = await getDbOrderByStripeSessionId(id);
    }

    if (!order) {
      return NextResponse.json({ error: 'Order record not found.' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error fetching order.' }, { status: 500 });
  }
}
