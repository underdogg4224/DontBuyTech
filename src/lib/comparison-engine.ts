// Smart Tech Comparison Engine
// Intelligently compares products, detects marketing gimmicks, and provides plain-language explanations

import type {
  Product,
  SpecComparison,
  MarketingGimmick,
  RealImprovement,
  YearOverYearAnalysis,
  Comparison,
} from '@/types';

// Marketing gimmick patterns to detect
const GIMMICK_PATTERNS = {
  // Buzzwords that often mean little
  buzzwords: ['AI-powered', 'neural', 'smart', 'revolutionary', 'innovative'],

  // Specs that sound impressive but rarely matter in practice
  trivialSpecs: ['processorName', 'brandName', 'marketingFeatures'],

  // Minimal improvements marketed as major upgrades
  minimalImprovements: {
    battery: 100, // Less than 100mAh difference
    ram: 2, // Less than 2GB difference
    storage: 64, // Less than 64GB difference
    camera: 2, // Less than 2MP difference
    weight: 10, // Less than 10g difference
  },
};

/**
 * Compare two spec values and determine the type of improvement
 */
function compareSpecValues(
  spec: string,
  value1: any,
  value2: any
): { difference: string; improvementType: 'significant' | 'marginal' | 'none' | 'worse' } {
  // Handle numeric comparisons
  if (typeof value1 === 'number' && typeof value2 === 'number') {
    const diff = value2 - value1;
    const percentDiff = (diff / value1) * 100;

    if (Math.abs(percentDiff) < 5) {
      return { difference: `${percentDiff.toFixed(1)}%`, improvementType: 'none' };
    } else if (Math.abs(percentDiff) < 15) {
      return {
        difference: `${percentDiff.toFixed(1)}%`,
        improvementType: diff > 0 ? 'marginal' : 'worse',
      };
    } else {
      return {
        difference: `${percentDiff.toFixed(1)}%`,
        improvementType: diff > 0 ? 'significant' : 'worse',
      };
    }
  }

  // Handle boolean comparisons
  if (typeof value1 === 'boolean' && typeof value2 === 'boolean') {
    if (value1 === value2) {
      return { difference: 'No change', improvementType: 'none' };
    }
    return {
      difference: value2 ? 'Added' : 'Removed',
      improvementType: value2 ? 'significant' : 'worse',
    };
  }

  // Handle string comparisons
  if (value1 === value2) {
    return { difference: 'No change', improvementType: 'none' };
  }

  return { difference: 'Different', improvementType: 'marginal' };
}

/**
 * Generate plain-language explanation for spec differences
 */
function generateExplanation(spec: string, value1: any, value2: any, improvementType: string): string {
  const explanations: Record<string, (v1: any, v2: any) => string> = {
    processor: (v1, v2) =>
      `Newer processor (${v2} vs ${v1}). In real-world use, you'll see ${
        improvementType === 'significant' ? '15-25%' : '5-10%'
      } faster performance in demanding tasks like gaming and video editing.`,

    ram: (v1, v2) => {
      const diff = parseInt(v2) - parseInt(v1);
      if (diff >= 8) {
        return `Significant RAM upgrade (${v2} vs ${v1}). You'll be able to keep more apps open and multitask more smoothly.`;
      }
      return `Modest RAM increase (${v2} vs ${v1}). You might notice slightly better multitasking, but most users won't see a dramatic difference.`;
    },

    storage: (v1, v2) => {
      const storage1 = parseInt(v1);
      const storage2 = parseInt(v2);
      if (storage2 >= storage1 * 2) {
        return `Double the storage (${v2} vs ${v1}). Great if you store lots of photos, videos, or large apps.`;
      }
      return `More storage (${v2} vs ${v1}). Helpful for media-heavy users, but consider if you actually need the extra space.`;
    },

    battery: (v1, v2) => {
      const bat1 = parseInt(v1);
      const bat2 = parseInt(v2);
      const diff = bat2 - bat1;
      if (diff < 100) {
        return `Minimal battery change (${v2} vs ${v1}). In practice, you won't notice any real difference in battery life.`;
      }
      const hoursDiff = Math.round((diff / bat1) * 10);
      return `Battery capacity increased (${v2} vs ${v1}). Expect about ${hoursDiff / 10} hours more usage time in real-world conditions.`;
    },

    camera: (v1, v2) => {
      const mp1 = parseInt(v1);
      const mp2 = parseInt(v2);
      if (mp1 >= 12 && mp2 - mp1 < 12) {
        return `Higher megapixel count (${v2} vs ${v1}), but above 12MP, megapixels matter less than sensor quality and image processing. Don't expect dramatically better photos.`;
      }
      return `Camera upgrade (${v2} vs ${v1}). May see improved detail in photos, especially when zooming or cropping.`;
    },

    display: (v1, v2) => {
      if (v1.includes('120Hz') && v2.includes('120Hz')) {
        return `Display specs similar (${v2} vs ${v1}). Both have high refresh rates, so scrolling will feel equally smooth.`;
      }
      return `Display updated (${v2} vs ${v1}). ${v2.includes('120Hz') ? 'The 120Hz refresh rate makes scrolling noticeably smoother.' : ''}`;
    },

    chargingSpeed: (v1, v2) => {
      const watts1 = parseInt(v1);
      const watts2 = parseInt(v2);
      const diff = watts2 - watts1;
      if (diff < 5) {
        return `Charging speed nearly identical (${v2} vs ${v1}). You won't notice any real-world difference in charging time.`;
      }
      const timeSaved = Math.round((diff / watts1) * 30);
      return `Faster charging (${v2} vs ${v1}). Your device will charge about ${timeSaved} minutes faster.`;
    },

    weight: (v1, v2) => {
      const diff = Math.abs(parseInt(v2) - parseInt(v1));
      if (diff < 10) {
        return `Weight essentially the same (${v2} vs ${v1}). The difference is too small to notice in daily use.`;
      }
      return `${parseInt(v2) < parseInt(v1) ? 'Lighter' : 'Heavier'} (${v2} vs ${v1}). ${
        diff > 30 ? 'Noticeable difference, especially during extended use.' : 'Slight difference that most users won\'t notice.'
      }`;
    },
  };

  if (explanations[spec]) {
    return explanations[spec](value1, value2);
  }

  // Default explanation
  return `Changed from ${value1} to ${value2}. ${
    improvementType === 'significant'
      ? 'This is a meaningful upgrade worth considering.'
      : improvementType === 'marginal'
      ? 'This is a minor change that may not be noticeable in daily use.'
      : 'This change is unlikely to impact your experience.'
  }`;
}

/**
 * Detect if a spec difference is a marketing gimmick
 */
function detectGimmick(
  spec: string,
  value1: any,
  value2: any,
  improvementType: string
): { isGimmick: boolean; reason?: string } {
  // Check for minimal battery improvements marketed as major
  if (spec === 'battery') {
    const diff = Math.abs(parseInt(value2) - parseInt(value1));
    if (diff < GIMMICK_PATTERNS.minimalImprovements.battery) {
      return {
        isGimmick: true,
        reason: `Battery difference is only ${diff}mAh, which translates to less than 15 minutes of extra usage. Marketing may exaggerate this as "all-day battery."`,
      };
    }
  }

  // Check for camera megapixel gimmicks
  if (spec === 'camera') {
    const mp1 = parseInt(value1);
    const mp2 = parseInt(value2);
    if (mp1 >= 12 && mp2 > mp1 && mp2 - mp1 < 12) {
      return {
        isGimmick: true,
        reason: `Megapixel increase from ${mp1}MP to ${mp2}MP sounds impressive, but above 12MP, image quality depends more on sensor size and processing. This is often marketed as "professional-grade photography" but won't significantly improve your photos.`,
      };
    }
  }

  // Check for processor name changes without real improvement
  if (spec === 'processor' && improvementType === 'marginal') {
    return {
      isGimmick: true,
      reason: `Processor has a newer name, but benchmarks show less than 10% real-world performance gain. Marketing will emphasize the new chip name, but you won't notice much difference in daily use.`,
    };
  }

  // Check for minimal RAM upgrades
  if (spec === 'ram') {
    const diff = Math.abs(parseInt(value2) - parseInt(value1));
    if (diff < GIMMICK_PATTERNS.minimalImprovements.ram) {
      return {
        isGimmick: true,
        reason: `RAM increase of only ${diff}GB is marketed as "blazing fast multitasking" but won't make a noticeable difference in real-world performance for most users.`,
      };
    }
  }

  // Check for weight changes that are imperceptible
  if (spec === 'weight') {
    const diff = Math.abs(parseInt(value2) - parseInt(value1));
    if (diff < GIMMICK_PATTERNS.minimalImprovements.weight) {
      return {
        isGimmick: true,
        reason: `Weight difference of ${diff}g is marketed as "ultra-lightweight" or "incredibly portable," but this is too small to feel in actual use.`,
      };
    }
  }

  return { isGimmick: false };
}

/**
 * Compare specifications between two products
 */
export function compareProducts(product1: Product, product2: Product): {
  specComparisons: SpecComparison[];
  marketingGimmicks: MarketingGimmick[];
  realImprovements: RealImprovement[];
} {
  const specComparisons: SpecComparison[] = [];
  const marketingGimmicks: MarketingGimmick[] = [];
  const realImprovements: RealImprovement[] = [];

  // Get all unique spec keys
  const allSpecs = new Set([
    ...Object.keys(product1.specifications),
    ...Object.keys(product2.specifications),
  ]);

  for (const spec of allSpecs) {
    const value1 = product1.specifications[spec];
    const value2 = product2.specifications[spec];

    // Skip if both values are undefined
    if (value1 === undefined && value2 === undefined) continue;

    const { difference, improvementType } = compareSpecValues(spec, value1, value2);
    const explanation = generateExplanation(spec, value1, value2, improvementType);
    const { isGimmick, reason } = detectGimmick(spec, value1, value2, improvementType);

    specComparisons.push({
      specName: spec,
      product1Value: value1,
      product2Value: value2,
      difference,
      explanation,
      improvementType,
      isMarketingGimmick: isGimmick,
      gimmickReason: reason,
    });

    if (isGimmick && reason) {
      marketingGimmicks.push({
        feature: spec,
        reason,
        actualImpact: 'Minimal to none in real-world usage',
      });
    }

    if (improvementType === 'significant' && !isGimmick) {
      realImprovements.push({
        feature: spec,
        improvement: difference,
        practicalBenefit: explanation,
        worthUpgrade: true,
      });
    }
  }

  return { specComparisons, marketingGimmicks, realImprovements };
}

/**
 * Analyze year-over-year changes
 */
export function analyzeYearOverYear(product1: Product, product2: Product): YearOverYearAnalysis {
  const yearsDiff =
    (product2.releaseDate.getTime() - product1.releaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
  const priceDiff = product2.currentPrice - product1.msrp;
  const yearlyPriceChange = priceDiff / yearsDiff;

  const { specComparisons } = compareProducts(product1, product2);

  const significantImprovements = specComparisons
    .filter((sc) => sc.improvementType === 'significant' && !sc.isMarketingGimmick)
    .map((sc) => `${sc.specName}: ${sc.explanation}`);

  const minorImprovements = specComparisons
    .filter((sc) => sc.improvementType === 'marginal')
    .map((sc) => sc.specName);

  const removedFeatures = specComparisons
    .filter((sc) => sc.product1Value && !sc.product2Value)
    .map((sc) => sc.specName);

  let recommendation = '';
  if (significantImprovements.length >= 3 && yearlyPriceChange <= 50) {
    recommendation =
      'Strong upgrade. Multiple significant improvements at a reasonable price increase make this worth considering.';
  } else if (significantImprovements.length >= 2) {
    recommendation =
      'Moderate upgrade. Some good improvements, but evaluate if they match your specific needs.';
  } else if (significantImprovements.length === 1) {
    recommendation =
      'Weak upgrade. Limited real improvements. Consider keeping your current device unless that one improvement is critical to you.';
  } else {
    recommendation =
      'Skip this upgrade. No significant improvements justify the cost. Your current device will serve you well for another year.';
  }

  return {
    yearlyPriceChange,
    significantImprovements,
    minorImprovements,
    removedFeatures,
    recommendation,
  };
}

/**
 * Calculate upgrade recommendation and score
 */
export function calculateUpgradeRecommendation(
  product1: Product,
  product2: Product,
  realImprovements: RealImprovement[],
  marketingGimmicks: MarketingGimmick[]
): { recommendation: 'Highly Recommended' | 'Recommended' | 'Consider Your Needs' | 'Not Worth It' | 'Avoid'; score: number } {
  let score = 5; // Start at neutral

  // Add points for real improvements
  score += realImprovements.length * 1.5;

  // Subtract points for marketing gimmicks
  score -= marketingGimmicks.length * 0.5;

  // Consider price difference
  const priceDiff = product2.currentPrice - product1.currentPrice;
  if (priceDiff > 300) score -= 1;
  if (priceDiff > 500) score -= 1;
  if (priceDiff < 0) score += 1; // Cheaper and better!

  // Consider support longevity
  if (product2.supportEndDate && product1.supportEndDate) {
    const supportDiff =
      (product2.supportEndDate.getTime() - product1.supportEndDate.getTime()) /
      (1000 * 60 * 60 * 24 * 365);
    if (supportDiff >= 2) score += 1;
  }

  // Clamp score between 1 and 10
  score = Math.max(1, Math.min(10, score));

  let recommendation: 'Highly Recommended' | 'Recommended' | 'Consider Your Needs' | 'Not Worth It' | 'Avoid';
  if (score >= 8) {
    recommendation = 'Highly Recommended';
  } else if (score >= 6.5) {
    recommendation = 'Recommended';
  } else if (score >= 5) {
    recommendation = 'Consider Your Needs';
  } else if (score >= 3) {
    recommendation = 'Not Worth It';
  } else {
    recommendation = 'Avoid';
  }

  return { recommendation, score: Math.round(score * 10) / 10 };
}

/**
 * Main comparison function
 */
export function createComparison(product1: Product, product2: Product): Omit<Comparison, 'id' | 'createdAt'> {
  const { specComparisons, marketingGimmicks, realImprovements } = compareProducts(product1, product2);

  // Check if it's a year-over-year comparison (same brand and model series)
  const isYearOverYear =
    product1.brand === product2.brand &&
    Math.abs(
      (product2.releaseDate.getTime() - product1.releaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
    ) <= 1.5;

  const yearOverYearAnalysis = isYearOverYear ? analyzeYearOverYear(product1, product2) : undefined;

  const { recommendation, score } = calculateUpgradeRecommendation(
    product1,
    product2,
    realImprovements,
    marketingGimmicks
  );

  return {
    product1Id: product1.id,
    product2Id: product2.id,
    specComparisons,
    marketingGimmicks,
    realImprovements,
    upgradeRecommendation: recommendation,
    upgradeScore: score,
    isYearOverYear,
    yearOverYearAnalysis,
  };
}
