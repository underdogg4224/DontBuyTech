import { Product, ProductAnalysis, Recommendation } from '@/types';
import { assessNeed } from './needAssessment';
import { findAlternatives } from './alternativesFinder';
import { checkOwnership } from './ownershipChecker';
import { analyzeEnvironmentalImpact } from './environmentalImpact';
import { calculateTotalCostOfOwnership } from './costCalculator';

export interface AnalysisOptions {
  userResponses?: Record<string, boolean>;
  ownedProducts?: Product[];
  availableProducts?: Product[];
  includeInsurance?: boolean;
  warrantyYears?: number;
  usageHoursPerDay?: number;
}

export function analyzeProduct(
  product: Product,
  options: AnalysisOptions = {}
): ProductAnalysis {
  const {
    userResponses,
    ownedProducts = [],
    availableProducts = [],
    includeInsurance = false,
    warrantyYears = 1,
    usageHoursPerDay = 8,
  } = options;

  // Perform all analyses
  const needAssessment = assessNeed(product, userResponses);

  const alternatives = findAlternatives(product, availableProducts);

  const ownershipCheck = checkOwnership(product, ownedProducts);

  const environmentalImpact = analyzeEnvironmentalImpact(
    product,
    alternatives.map(alt => alt.product)
  );

  const totalCostOfOwnership = calculateTotalCostOfOwnership({
    product,
    warrantyYears,
    includeInsurance,
    usageHoursPerDay,
  });

  const overallRecommendation = generateOverallRecommendation(
    product,
    needAssessment,
    alternatives,
    ownershipCheck,
    environmentalImpact,
    totalCostOfOwnership
  );

  return {
    product,
    needAssessment,
    alternatives,
    ownershipCheck,
    environmentalImpact,
    totalCostOfOwnership,
    overallRecommendation,
  };
}

function generateOverallRecommendation(
  product: Product,
  needAssessment: ProductAnalysis['needAssessment'],
  alternatives: ProductAnalysis['alternatives'],
  ownershipCheck: ProductAnalysis['ownershipCheck'],
  environmentalImpact: ProductAnalysis['environmentalImpact'],
  tco: ProductAnalysis['totalCostOfOwnership']
): Recommendation {
  let score = 50; // Start neutral
  const keyPoints: string[] = [];

  // Factor 1: Need Assessment (40% weight)
  score += (needAssessment.score - 50) * 0.4;
  keyPoints.push(
    `Need level: ${needAssessment.verdict} (${needAssessment.score}/100)`
  );

  // Factor 2: Ownership Check (30% weight)
  if (ownershipCheck.hasAlternative) {
    score -= 20;
    keyPoints.push('You already own a similar device');
  } else if (ownershipCheck.ownedProducts.length > 0) {
    const maxOverlap = Math.max(
      ...ownershipCheck.ownedProducts.map(p => p.featureOverlap)
    );
    score -= (maxOverlap / 100) * 15;
    keyPoints.push(`${maxOverlap}% overlap with your existing devices`);
  } else {
    keyPoints.push('No similar devices in your collection');
  }

  // Factor 3: Better Alternatives Available (20% weight)
  if (alternatives.length > 0) {
    const bestAlt = alternatives[0];
    if (
      bestAlt.comparisonScore > 75 &&
      bestAlt.priceComparison.savings > 0
    ) {
      score -= 15;
      keyPoints.push(
        `Better alternative available saving $${bestAlt.priceComparison.savings.toFixed(2)}`
      );
    }
  }

  // Factor 4: Environmental Impact (10% weight)
  if (environmentalImpact.sustainability.score < 40) {
    score -= 5;
    keyPoints.push('High environmental impact');
  } else if (environmentalImpact.sustainability.score > 70) {
    score += 3;
    keyPoints.push('Good environmental profile');
  }

  // Factor 5: Total Cost of Ownership
  if (tco.totalThreeYears > product.price * 1.5) {
    keyPoints.push(
      `True 3-year cost: $${tco.totalThreeYears.toFixed(2)} (${Math.round(((tco.totalThreeYears - product.price) / product.price) * 100)}% over initial price)`
    );
  }

  // Determine verdict
  let verdict: Recommendation['verdict'];
  let summary: string;

  if (score >= 65) {
    verdict = 'buy';
    summary = `This product is a good fit for your needs. ${needAssessment.verdict === 'essential' ? 'It addresses essential requirements.' : 'It will provide meaningful value.'}`;
  } else if (score >= 45) {
    verdict = 'consider_alternatives';
    summary = alternatives.length > 0
      ? `Consider alternatives like ${alternatives[0].product.name} which offers similar features${alternatives[0].priceComparison.savings > 0 ? ` at a lower price` : ''}.`
      : 'This purchase is optional. Take time to evaluate if it truly fits your needs.';
  } else if (score >= 30) {
    verdict = 'wait';
    summary = ownershipCheck.hasAlternative
      ? 'Your existing devices can handle most of what this product does. Consider waiting for a significant upgrade or price drop.'
      : 'The value proposition isn\'t strong. Consider waiting for newer models or better alternatives.';
  } else {
    verdict = 'skip';
    summary = ownershipCheck.hasAlternative
      ? 'Save your money. You already own a device that serves this purpose well enough.'
      : `This purchase doesn't align with your needs. The ${needAssessment.verdict} verdict suggests you should skip it.`;
  }

  return {
    verdict,
    confidence: Math.round(Math.abs(score - 50) * 2),
    summary,
    keyPoints,
    bestAlternative: alternatives.length > 0 ? alternatives[0] : undefined,
  };
}

export function quickAnalysis(product: Product): {
  shouldBuy: boolean;
  reason: string;
  confidence: number;
} {
  // Simplified quick analysis without full context
  const needScore = assessNeed(product).score;

  let shouldBuy = needScore >= 55;
  let reason: string;
  let confidence: number;

  if (needScore >= 75) {
    reason = 'Strong need indicated';
    confidence = 85;
  } else if (needScore >= 55) {
    reason = 'Moderate benefit expected';
    confidence = 60;
  } else if (needScore >= 35) {
    reason = 'Optional purchase - not essential';
    confidence = 55;
    shouldBuy = false;
  } else {
    reason = 'Low value for most users';
    confidence = 75;
    shouldBuy = false;
  }

  return {
    shouldBuy,
    reason,
    confidence,
  };
}
