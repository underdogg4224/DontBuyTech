import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const history = await db.priceHistory.findByProduct(productId);

    return NextResponse.json(history);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch price history' }, { status: 500 });
  }
}
