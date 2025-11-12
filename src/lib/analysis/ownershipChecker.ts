import { Product, OwnershipCheck } from '@/types';

export function checkOwnership(
  targetProduct: Product,
  ownedProducts: Product[]
): OwnershipCheck {
  const relevantProducts = ownedProducts.filter(
    owned =>
      owned.category === targetProduct.category ||
      hasOverlappingFeatures(owned, targetProduct)
  );

  const ownedProductsAnalysis = relevantProducts.map(owned => {
    const featureOverlap = calculateFeatureOverlap(owned, targetProduct);
    const canReplace = determineReplacement(owned, targetProduct, featureOverlap);
    const limitations = identifyLimitations(owned, targetProduct);

    return {
      product: owned,
      featureOverlap,
      canReplace,
      limitations,
    };
  });

  // Sort by feature overlap
  ownedProductsAnalysis.sort((a, b) => b.featureOverlap - a.featureOverlap);

  const hasAlternative = ownedProductsAnalysis.some(
    analysis => analysis.featureOverlap >= 70
  );

  const recommendation = generateRecommendation(
    targetProduct,
    ownedProductsAnalysis,
    hasAlternative
  );

  return {
    hasAlternative,
    ownedProducts: ownedProductsAnalysis,
    recommendation,
  };
}

function hasOverlappingFeatures(product1: Product, product2: Product): boolean {
  const features1 = new Set(product1.features);
  const features2 = new Set(product2.features);

  const commonFeatures = [...features1].filter(f => features2.has(f));
  return commonFeatures.length >= 2; // At least 2 common features
}

function calculateFeatureOverlap(
  ownedProduct: Product,
  targetProduct: Product
): number {
  const ownedFeatures = new Set(ownedProduct.features);
  const targetFeatures = new Set(targetProduct.features);

  const commonFeatures = [...targetFeatures].filter(f => ownedFeatures.has(f));
  const overlapPercentage = (commonFeatures.length / targetFeatures.size) * 100;

  return Math.round(overlapPercentage);
}

function determineReplacement(
  ownedProduct: Product,
  targetProduct: Product,
  featureOverlap: number
): boolean {
  // Can replace if:
  // 1. High feature overlap (>= 80%)
  // 2. Same category and overlap >= 70%
  // 3. Owned product is newer or comparable

  if (featureOverlap >= 80) {
    return true;
  }

  if (
    ownedProduct.category === targetProduct.category &&
    featureOverlap >= 70
  ) {
    // Check if owned product is not too old
    if (ownedProduct.releaseDate && targetProduct.releaseDate) {
      const ownedYear = new Date(ownedProduct.releaseDate).getFullYear();
      const targetYear = new Date(targetProduct.releaseDate).getFullYear();

      // If owned product is within 2 years of target, it can replace
      return targetYear - ownedYear <= 2;
    }

    return true;
  }

  return false;
}

function identifyLimitations(
  ownedProduct: Product,
  targetProduct: Product
): string[] {
  const limitations: string[] = [];

  const ownedFeatures = new Set(ownedProduct.features);
  const targetFeatures = new Set(targetProduct.features);

  // Find missing features
  const missingFeatures = [...targetFeatures].filter(f => !ownedFeatures.has(f));

  if (missingFeatures.length > 0) {
    limitations.push(
      `Missing features: ${missingFeatures.slice(0, 3).join(', ')}`
    );
  }

  // Check performance difference (based on price as proxy)
  if (targetProduct.price > ownedProduct.price * 1.5) {
    limitations.push(
      'Significantly lower performance tier'
    );
  }

  // Check age difference
  if (ownedProduct.releaseDate && targetProduct.releaseDate) {
    const ownedYear = new Date(ownedProduct.releaseDate).getFullYear();
    const targetYear = new Date(targetProduct.releaseDate).getFullYear();
    const yearsDifference = targetYear - ownedYear;

    if (yearsDifference > 3) {
      limitations.push(`${yearsDifference} years older technology`);
    }
  }

  // Check brand/ecosystem
  if (ownedProduct.brand !== targetProduct.brand) {
    limitations.push('Different brand ecosystem');
  }

  if (limitations.length === 0) {
    return ['None - comparable alternative'];
  }

  return limitations;
}

function generateRecommendation(
  targetProduct: Product,
  ownedProductsAnalysis: OwnershipCheck['ownedProducts'],
  hasAlternative: boolean
): string {
  if (ownedProductsAnalysis.length === 0) {
    return 'You don\'t own any similar products. Consider if this purchase aligns with your needs.';
  }

  const bestMatch = ownedProductsAnalysis[0];

  if (hasAlternative && bestMatch.canReplace) {
    return `Your ${bestMatch.product.name} can handle ${bestMatch.featureOverlap}% of what the ${targetProduct.name} does. Consider using it instead.`;
  }

  if (bestMatch.featureOverlap >= 50) {
    const limitations = bestMatch.limitations.join('; ');
    return `Your ${bestMatch.product.name} covers ${bestMatch.featureOverlap}% of the features but has limitations: ${limitations}. Evaluate if the upgrade is worth $${targetProduct.price}.`;
  }

  return `Your existing devices have minimal overlap (${bestMatch.featureOverlap}%) with this product. This may fill a genuine gap in your tech collection.`;
}

export function analyzeProductRedundancy(
  userProducts: Product[],
  targetProduct: Product
): {
  redundancyLevel: 'high' | 'medium' | 'low' | 'none';
  redundantProducts: Product[];
  suggestion: string;
} {
  const check = checkOwnership(targetProduct, userProducts);

  let redundancyLevel: 'high' | 'medium' | 'low' | 'none';
  const redundantProducts = check.ownedProducts
    .filter(analysis => analysis.featureOverlap >= 50)
    .map(analysis => analysis.product);

  if (check.hasAlternative) {
    redundancyLevel = 'high';
  } else if (redundantProducts.length > 0) {
    const maxOverlap = Math.max(
      ...check.ownedProducts.map(a => a.featureOverlap)
    );
    redundancyLevel = maxOverlap >= 60 ? 'medium' : 'low';
  } else {
    redundancyLevel = 'none';
  }

  let suggestion: string;
  switch (redundancyLevel) {
    case 'high':
      suggestion = 'You already own a device that can do most of what this product offers. Save your money.';
      break;
    case 'medium':
      suggestion = 'You own similar devices. Carefully evaluate if the new features justify the cost.';
      break;
    case 'low':
      suggestion = 'Some overlap with existing devices, but this product offers distinct value.';
      break;
    case 'none':
      suggestion = 'This product fills a unique role in your tech ecosystem.';
      break;
  }

  return {
    redundancyLevel,
    redundantProducts,
    suggestion,
  };
}
