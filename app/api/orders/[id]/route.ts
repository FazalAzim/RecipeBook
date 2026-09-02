import { NextRequest, NextResponse } from 'next/server';
import { getDbOrderById, getDbOrderByExternalPaymentId } from '@/lib/db/orders';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let order = await getDbOrderById(id);

    if (!order) {
      order = await getDbOrderByExternalPaymentId(id);
    }

    if (!order) {
      return NextResponse.json({ error: 'Order record not found.' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error fetching order.' }, { status: 500 });
  }
}
