import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    const products = categoryId
      ? await db.products.findByCategory(categoryId)
      : await db.products.findAll();

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
