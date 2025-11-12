// Longevity Prediction Engine
// Predicts product lifespan based on support cycles, repairability, and other factors

import type { Product, LongevityPrediction } from '@/types';
import { differenceInYears } from 'date-fns';

/**
 * Predict product longevity and support lifespan
 */
export function predictLongevity(product: Product): LongevityPrediction {
  const positiveFactors: string[] = [];
  const negativeFactors: string[] = [];

  // Calculate support lifespan
  let supportLifespan = 3; // Default: 3 years
  if (product.supportEndDate) {
    supportLifespan = differenceInYears(product.supportEndDate, product.releaseDate);
    if (supportLifespan >= 5) {
      positiveFactors.push(`${supportLifespan} years of official support is excellent`);
    } else if (supportLifespan >= 3) {
      positiveFactors.push(`${supportLifespan} years of official support is standard`);
    } else {
      negativeFactors.push(`Only ${supportLifespan} years of official support is concerning`);
    }
  } else {
    negativeFactors.push('No official support end date announced');
  }

  // Repairability assessment
  const repairabilityScore = product.repairabilityScore || 5;
  if (repairabilityScore >= 7) {
    positiveFactors.push(
      `High repairability score (${repairabilityScore}/10) means easier and cheaper repairs`
    );
  } else if (repairabilityScore >= 5) {
    positiveFactors.push(
      `Moderate repairability score (${repairabilityScore}/10) - some parts can be replaced`
    );
  } else {
    negativeFactors.push(
      `Low repairability score (${repairabilityScore}/10) - expensive or impossible repairs`
    );
  }

  // Warranty assessment
  const warrantyYears = product.warrantyYears || 1;
  if (warrantyYears >= 3) {
    positiveFactors.push(`${warrantyYears}-year warranty shows manufacturer confidence`);
  } else if (warrantyYears === 1) {
    negativeFactors.push('Standard 1-year warranty only - consider extended warranty');
  }

  // Category-specific longevity factors
  const categoryLongevity: Record<string, { expected: number; factors: string[] }> = {
    '1': {
      // Smartphones
      expected: 4,
      factors: [
        'Phones typically last 3-5 years',
        'Battery degradation is the main concern',
        'Software updates usually stop after 3-5 years',
      ],
    },
    '2': {
      // Laptops
      expected: 6,
      factors: [
        'Laptops typically last 5-7 years',
        'Battery and keyboard are common failure points',
        'Storage and RAM upgrades can extend lifespan',
      ],
    },
    '3': {
      // Tablets
      expected: 5,
      factors: [
        'Tablets typically last 4-6 years',
        'Battery degradation affects usability',
        'Software support determines practical lifespan',
      ],
    },
  };

  const categoryInfo = categoryLongevity[product.categoryId] || {
    expected: 4,
    factors: ['Expected lifespan depends on usage and care'],
  };

  // Spec-based longevity factors
  const specs = product.specifications;

  // RAM assessment
  if (specs.ram) {
    const ramAmount = parseInt(specs.ram);
    if (ramAmount >= 16) {
      positiveFactors.push('16GB+ RAM will stay relevant for years');
    } else if (ramAmount >= 8) {
      positiveFactors.push('8GB RAM is adequate for most tasks for 3-4 years');
    } else {
      negativeFactors.push('Less than 8GB RAM may feel slow within 2-3 years');
    }
  }

  // Storage assessment
  if (specs.storage) {
    const storageAmount = parseInt(specs.storage);
    if (storageAmount >= 512) {
      positiveFactors.push('Ample storage space won\'t be a limiting factor');
    } else if (storageAmount >= 256) {
      positiveFactors.push('256GB storage is sufficient for most users');
    } else {
      negativeFactors.push('128GB or less may require frequent management');
    }
  }

  // Battery assessment (for mobile devices)
  if (specs.battery) {
    const batteryCapacity = parseInt(specs.battery);
    if (batteryCapacity >= 4500) {
      positiveFactors.push('Large battery will degrade gracefully over time');
    } else if (batteryCapacity < 3500) {
      negativeFactors.push('Smaller battery may need replacement after 2-3 years');
    }
  }

  // Build quality indicators
  if (specs.waterResistance && specs.waterResistance.includes('IP68')) {
    positiveFactors.push('IP68 water resistance protects against damage');
  }

  if (specs.usbC) {
    positiveFactors.push('USB-C is future-proof as the universal standard');
  }

  // Calculate expected lifespan
  let expectedLifespan = categoryInfo.expected;

  // Adjust based on factors
  if (repairabilityScore >= 7) expectedLifespan += 1;
  if (repairabilityScore <= 3) expectedLifespan -= 1;
  if (supportLifespan >= 5) expectedLifespan += 1;
  if (supportLifespan < 3) expectedLifespan -= 1;

  // Adjust for specs
  if (specs.ram && parseInt(specs.ram) >= 16) expectedLifespan += 1;
  if (specs.ram && parseInt(specs.ram) < 8) expectedLifespan -= 1;

  // Calculate longevity score (1-10)
  let longevityScore = 5; // Start at neutral

  // Positive factors
  longevityScore += Math.min(positiveFactors.length * 0.5, 3);

  // Negative factors
  longevityScore -= Math.min(negativeFactors.length * 0.7, 3);

  // Support and repairability heavily influence score
  longevityScore += (repairabilityScore - 5) * 0.3;
  longevityScore += (supportLifespan - 3) * 0.5;

  // Clamp between 1 and 10
  longevityScore = Math.max(1, Math.min(10, longevityScore));

  // Generate recommendation
  let recommendation = '';
  if (longevityScore >= 8) {
    recommendation = `Excellent long-term investment. This device should serve you well for ${expectedLifespan}+ years with proper care. ${repairabilityScore >= 7 ? 'High repairability means cost-effective maintenance.' : ''}`;
  } else if (longevityScore >= 6.5) {
    recommendation = `Good longevity. Expect ${expectedLifespan} years of reliable use. ${supportLifespan >= 5 ? 'Extended support period is a major plus.' : 'Consider extended warranty for peace of mind.'}`;
  } else if (longevityScore >= 5) {
    recommendation = `Average lifespan. Plan for ${expectedLifespan} years of use, but be prepared for potential issues. ${repairabilityScore < 5 ? 'Low repairability means expensive repairs if something breaks.' : ''}`;
  } else if (longevityScore >= 3) {
    recommendation = `Below-average longevity. May only last ${expectedLifespan} years before becoming obsolete or requiring replacement. ${negativeFactors.length > 2 ? 'Multiple concerning factors affect long-term value.' : ''}`;
  } else {
    recommendation = `Poor long-term value. Expect ${expectedLifespan} years or less before replacement. Consider a more future-proof option unless this meets immediate short-term needs only.`;
  }

  // Add category-specific insights
  categoryInfo.factors.forEach((factor) => {
    if (!positiveFactors.includes(factor) && !negativeFactors.includes(factor)) {
      positiveFactors.push(factor);
    }
  });

  return {
    expectedLifespan,
    supportLifespan,
    repairabilityScore,
    longevityScore: Math.round(longevityScore * 10) / 10,
    factors: {
      positive: positiveFactors,
      negative: negativeFactors,
    },
    recommendation,
  };
}

/**
 * Compare longevity between two products
 */
export function compareLongevity(
  product1: Product,
  product2: Product
): {
  product1Longevity: LongevityPrediction;
  product2Longevity: LongevityPrediction;
  recommendation: string;
} {
  const product1Longevity = predictLongevity(product1);
  const product2Longevity = predictLongevity(product2);

  const scoreDiff = product2Longevity.longevityScore - product1Longevity.longevityScore;
  const lifespanDiff = product2Longevity.expectedLifespan - product1Longevity.expectedLifespan;
  const priceDiff = product2.currentPrice - product1.currentPrice;

  let recommendation = '';

  if (scoreDiff >= 2) {
    recommendation = `${product2.name} has significantly better longevity (${product2Longevity.longevityScore}/10 vs ${product1Longevity.longevityScore}/10). The extra ${lifespanDiff} year(s) of expected lifespan ${priceDiff > 0 ? `justifies the $${priceDiff} premium` : 'makes it an even better value'}.`;
  } else if (scoreDiff >= 1) {
    recommendation = `${product2.name} has moderately better longevity (${product2Longevity.longevityScore}/10 vs ${product1Longevity.longevityScore}/10). ${priceDiff > 200 ? 'Consider if the longer lifespan is worth the extra cost.' : 'Good value for improved longevity.'}`;
  } else if (scoreDiff >= -1 && scoreDiff <= 1) {
    recommendation = `Similar longevity (${product2Longevity.longevityScore}/10 vs ${product1Longevity.longevityScore}/10). Choose based on other factors like price and features rather than longevity.`;
  } else if (scoreDiff <= -2) {
    recommendation = `${product1.name} has significantly better longevity (${product1Longevity.longevityScore}/10 vs ${product2Longevity.longevityScore}/10). ${priceDiff < 0 ? `Despite being cheaper, ${product2.name} is a poor long-term value.` : `The cost savings on ${product2.name} may not offset the shorter lifespan.`}`;
  } else {
    recommendation = `${product1.name} has moderately better longevity (${product1Longevity.longevityScore}/10 vs ${product2Longevity.longevityScore}/10). Factor this into your decision.`;
  }

  return {
    product1Longevity,
    product2Longevity,
    recommendation,
  };
}
