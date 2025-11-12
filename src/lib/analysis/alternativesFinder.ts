import { Product, Alternative } from '@/types';

export function findAlternatives(
  product: Product,
  availableProducts: Product[]
): Alternative[] {
  const alternatives: Alternative[] = [];

  // Filter products in same category
  const sameCategory = availableProducts.filter(
    p => p.id !== product.id && p.category === product.category
  );

  // Score and rank alternatives
  for (const altProduct of sameCategory) {
    const comparisonScore = calculateComparisonScore(product, altProduct);
    const priceComparison = calculatePriceComparison(product, altProduct);
    const prosAndCons = generateProsAndCons(product, altProduct);
    const recommendationReason = generateRecommendation(
      product,
      altProduct,
      comparisonScore,
      priceComparison
    );

    alternatives.push({
      product: altProduct,
      comparisonScore,
      priceComparison,
      prosAndCons,
      recommendationReason,
    });
  }

  // Sort by score (best alternatives first)
  alternatives.sort((a, b) => b.comparisonScore - a.comparisonScore);

  // Return top 5 alternatives
  return alternatives.slice(0, 5);
}

function calculateComparisonScore(
  original: Product,
  alternative: Product
): number {
  let score = 50; // Base score

  // Feature comparison
  const originalFeatures = new Set(original.features);
  const alternativeFeatures = new Set(alternative.features);
  const commonFeatures = [...originalFeatures].filter(f =>
    alternativeFeatures.has(f)
  );
  const featureMatchPercentage =
    (commonFeatures.length / originalFeatures.size) * 100;
  score += (featureMatchPercentage - 50) * 0.3; // Weight: 30%

  // Price consideration (cheaper is better)
  const priceDifference = ((original.price - alternative.price) / original.price) * 100;
  if (priceDifference > 0) {
    score += Math.min(priceDifference * 0.5, 25); // Weight: up to 25%
  } else {
    score += Math.max(priceDifference * 0.3, -15); // Weight: up to -15%
  }

  // Rating consideration
  if (alternative.rating && original.rating) {
    const ratingDifference = (alternative.rating - original.rating) * 5;
    score += ratingDifference; // Weight: 5 points per rating point
  }

  // Brand consideration (same brand gets slight bonus)
  if (original.brand === alternative.brand) {
    score += 5;
  }

  return Math.max(0, Math.min(100, score));
}

function calculatePriceComparison(
  original: Product,
  alternative: Product
): Alternative['priceComparison'] {
  const savings = original.price - alternative.price;
  const percentage = (savings / original.price) * 100;

  return {
    savings: Math.round(savings * 100) / 100,
    percentage: Math.round(percentage * 10) / 10,
  };
}

function generateProsAndCons(
  original: Product,
  alternative: Product
): Alternative['prosAndCons'] {
  const pros: string[] = [];
  const cons: string[] = [];

  // Price comparison
  if (alternative.price < original.price) {
    const savings = original.price - alternative.price;
    pros.push(`Saves $${savings.toFixed(2)} (${((savings / original.price) * 100).toFixed(1)}%)`);
  } else {
    const extra = alternative.price - original.price;
    cons.push(`Costs $${extra.toFixed(2)} more`);
  }

  // Features comparison
  const originalFeatures = new Set(original.features);
  const alternativeFeatures = new Set(alternative.features);

  const uniqueToAlternative = [...alternativeFeatures].filter(
    f => !originalFeatures.has(f)
  );
  const uniqueToOriginal = [...originalFeatures].filter(
    f => !alternativeFeatures.has(f)
  );

  if (uniqueToAlternative.length > 0) {
    pros.push(
      `Additional features: ${uniqueToAlternative.slice(0, 2).join(', ')}`
    );
  }

  if (uniqueToOriginal.length > 0) {
    cons.push(`Missing: ${uniqueToOriginal.slice(0, 2).join(', ')}`);
  }

  // Rating comparison
  if (alternative.rating && original.rating) {
    if (alternative.rating > original.rating) {
      pros.push(`Higher rating (${alternative.rating}/5 vs ${original.rating}/5)`);
    } else if (alternative.rating < original.rating) {
      cons.push(`Lower rating (${alternative.rating}/5 vs ${original.rating}/5)`);
    }
  }

  // Same brand
  if (original.brand === alternative.brand) {
    pros.push('Same trusted brand');
  }

  return { pros, cons };
}

function generateRecommendation(
  original: Product,
  alternative: Product,
  score: number,
  priceComp: Alternative['priceComparison']
): string {
  if (score >= 80) {
    if (priceComp.savings > 0) {
      return `Excellent alternative that saves you $${priceComp.savings.toFixed(2)} while maintaining quality`;
    }
    return 'Outstanding alternative with comparable or better features';
  } else if (score >= 60) {
    if (priceComp.savings > 100) {
      return `Good budget option with significant savings of $${priceComp.savings.toFixed(2)}`;
    }
    return 'Solid alternative worth considering';
  } else if (score >= 40) {
    return 'Consider this if price is your main concern';
  } else {
    return 'May not meet your needs as well as the original';
  }
}

export function matchAlternativesByFeatures(
  targetFeatures: string[],
  products: Product[]
): Product[] {
  const scored = products.map(product => {
    const matchCount = targetFeatures.filter(feature =>
      product.features.includes(feature)
    ).length;
    const matchPercentage = (matchCount / targetFeatures.length) * 100;

    return {
      product,
      score: matchPercentage,
    };
  });

  return scored
    .filter(item => item.score >= 50) // At least 50% feature match
    .sort((a, b) => b.score - a.score)
    .map(item => item.product);
}
