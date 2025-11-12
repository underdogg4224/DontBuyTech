import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createComparison } from '@/lib/comparison-engine';
import { analyzePriceHistory } from '@/lib/price-prediction';
import { compareLongevity } from '@/lib/longevity-prediction';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const product1Id = searchParams.get('product1Id');
    const product2Id = searchParams.get('product2Id');

    if (!product1Id || !product2Id) {
      return NextResponse.json(
        { error: 'Both product1Id and product2Id are required' },
        { status: 400 }
      );
    }

    const product1 = await db.products.findById(product1Id);
    const product2 = await db.products.findById(product2Id);

    if (!product1 || !product2) {
      return NextResponse.json({ error: 'One or both products not found' }, { status: 404 });
    }

    // Create the comparison
    const comparison = createComparison(product1, product2);

    // Get price history and predictions
    const product1PriceHistory = await db.priceHistory.findByProduct(product1Id);
    const product2PriceHistory = await db.priceHistory.findByProduct(product2Id);

    const product1PricePrediction = analyzePriceHistory(product1, product1PriceHistory);
    const product2PricePrediction = analyzePriceHistory(product2, product2PriceHistory);

    // Get longevity predictions
    const longevityComparison = compareLongevity(product1, product2);

    // Compile full comparison result
    const result = {
      comparison: {
        ...comparison,
        id: `${product1Id}-${product2Id}`,
        createdAt: new Date(),
      },
      products: {
        product1,
        product2,
      },
      pricing: {
        product1: product1PricePrediction,
        product2: product2PricePrediction,
        priceDifference: product2.currentPrice - product1.currentPrice,
        savingsWithProduct1: product2.currentPrice > product1.currentPrice
          ? product2.currentPrice - product1.currentPrice
          : 0,
      },
      longevity: longevityComparison,
      summary: {
        recommendation: comparison.upgradeRecommendation,
        score: comparison.upgradeScore,
        keyPoints: [
          `${comparison.realImprovements.length} significant improvements`,
          `${comparison.marketingGimmicks.length} marketing gimmicks detected`,
          comparison.isYearOverYear ? 'Year-over-year comparison' : 'Cross-product comparison',
        ],
      },
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Comparison error:', error);
    return NextResponse.json({ error: 'Failed to create comparison' }, { status: 500 });
  }
}
