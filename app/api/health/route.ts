import { NextResponse } from 'next/server';
import { pingMongo } from '@/lib/mongodb';

export const runtime = 'nodejs';

export async function GET() {
  const status = await pingMongo();

  return NextResponse.json(status, {
    status: status.connected ? 200 : status.configured ? 503 : 500,
  });
}
