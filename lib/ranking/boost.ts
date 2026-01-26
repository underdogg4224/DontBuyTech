/**
 * Category and engagement boosting functions for deal ranking
 * Implements dynamic boosting based on category popularity and engagement metrics
 */

/**
 * Category engagement statistics
 * Used to calculate category-specific boosts
 */
export interface CategoryEngagement {
  categoryId: string;
  totalDeals: number;
  totalVotes: number;
  avgVotesPerDeal: number;
  activeDeals: number;
}

/**
 * Calculate category popularity score
 * Based on total engagement metrics relative to overall platform activity
 *
 * Formula: popularity = (categoryEngagement / totalEngagement) * 100
 * This gives a percentage representing the category's share of total activity
 *
 * @param categoryEngagement - Total votes/engagement in the category
 * @param totalEngagement - Total votes/engagement across all categories
 * @returns Popularity score (0-100+, can exceed 100 for very popular categories)
 *
 * @example
 * // Category with 500 votes out of 5000 total
 * calculateCategoryPopularity(500, 5000) // 10
 *
 * // Very popular category with 2000 votes out of 5000 total
 * calculateCategoryPopularity(2000, 5000) // 40
 */
export function calculateCategoryPopularity(
  categoryEngagement: number,
  totalEngagement: number
): number {
  // Avoid division by zero
  if (totalEngagement === 0) {
    return 0;
  }

  const popularity = (categoryEngagement / totalEngagement) * 100;
  return Math.max(0, popularity);
}

/**
 * Calculate category boost for ranking
 * Applies a multiplier to popular categories to surface their deals
 *
 * Formula: boost = categoryPopularity * multiplier
 * Default multiplier: 0.1 (so a category with 50% popularity gets +5 points)
 *
 * @param categoryPopularity - Popularity score (0-100+)
 * @param multiplier - How much to weight category popularity (default: 0.1)
 * @returns Boost value to add to deal score
 *
 * @example
 * // Category with 50% popularity
 * calculateCategoryBoost(50) // 5.0
 *
 * // Category with 10% popularity
 * calculateCategoryBoost(10) // 1.0
 *
 * // Category with 100% popularity (theoretical max)
 * calculateCategoryBoost(100) // 10.0
 */
export function calculateCategoryBoost(
  categoryPopularity: number,
  multiplier: number = 0.1
): number {
  return categoryPopularity * multiplier;
}

/**
 * Calculate engagement velocity
 * Measures how quickly a deal is gaining votes/engagement
 * Higher velocity = more boost
 *
 * @param votesCount - Total votes on the deal
 * @param ageInHours - Age of the deal in hours
 * @returns Votes per hour rate
 *
 * @example
 * // Deal with 100 votes in 10 hours
 * calculateEngagementVelocity(100, 10) // 10 votes/hour
 *
 * // New deal with 50 votes in 2 hours (hot!)
 * calculateEngagementVelocity(50, 2) // 25 votes/hour
 */
export function calculateEngagementVelocity(
  votesCount: number,
  ageInHours: number
): number {
  // Avoid division by zero - treat very new deals (< 1 hour) as 1 hour
  const effectiveAge = Math.max(1, ageInHours);
  return votesCount / effectiveAge;
}

/**
 * Calculate velocity boost
 * Rewards deals that are gaining traction quickly
 *
 * @param velocity - Votes per hour
 * @param threshold - Minimum velocity to start boosting (default: 5)
 * @param multiplier - Boost multiplier (default: 2)
 * @returns Boost value based on velocity
 *
 * @example
 * // High velocity deal (20 votes/hour)
 * calculateVelocityBoost(20) // 30
 *
 * // Medium velocity (8 votes/hour)
 * calculateVelocityBoost(8) // 6
 *
 * // Low velocity (2 votes/hour)
 * calculateVelocityBoost(2) // 0 (below threshold)
 */
export function calculateVelocityBoost(
  velocity: number,
  threshold: number = 5,
  multiplier: number = 2
): number {
  if (velocity < threshold) {
    return 0;
  }

  return (velocity - threshold) * multiplier;
}

/**
 * Calculate quality boost from AI score
 * Converts AI quality score (0-100) to a ranking boost
 *
 * Formula: boost = (aiScore / 100) * maxBoost
 * Default maxBoost: 50 points
 *
 * @param aiQualityScore - AI quality assessment (0-100)
 * @param maxBoost - Maximum boost points (default: 50)
 * @returns Boost value to add to deal score
 *
 * @example
 * // High quality deal (90/100)
 * calculateQualityBoost(90) // 45
 *
 * // Medium quality (50/100)
 * calculateQualityBoost(50) // 25
 *
 * // Low quality (20/100)
 * calculateQualityBoost(20) // 10
 *
 * // Missing AI score
 * calculateQualityBoost(null) // 0
 */
export function calculateQualityBoost(
  aiQualityScore: number | null | undefined,
  maxBoost: number = 50
): number {
  if (aiQualityScore == null || aiQualityScore < 0) {
    return 0;
  }

  // Ensure AI score is capped at 100
  const normalizedScore = Math.min(100, aiQualityScore);
  return (normalizedScore / 100) * maxBoost;
}

/**
 * Calculate discount boost
 * Rewards deals with better discounts
 *
 * @param discountPercentage - Discount percentage (0-100)
 * @param multiplier - Boost multiplier (default: 0.2)
 * @returns Boost value based on discount
 *
 * @example
 * // Great discount (80%)
 * calculateDiscountBoost(80) // 16
 *
 * // Good discount (50%)
 * calculateDiscountBoost(50) // 10
 *
 * // Small discount (10%)
 * calculateDiscountBoost(10) // 2
 */
export function calculateDiscountBoost(
  discountPercentage: number | null | undefined,
  multiplier: number = 0.2
): number {
  if (discountPercentage == null || discountPercentage <= 0) {
    return 0;
  }

  // Cap at 100% discount
  const normalizedDiscount = Math.min(100, discountPercentage);
  return normalizedDiscount * multiplier;
}

/**
 * Get boost category for debugging/display
 * Categorizes the boost level
 *
 * @param boostValue - The calculated boost value
 * @returns Human-readable category
 */
export function getBoostCategory(boostValue: number): string {
  if (boostValue === 0) return 'None';
  if (boostValue < 5) return 'Low';
  if (boostValue < 15) return 'Medium';
  if (boostValue < 30) return 'High';
  return 'Very High';
}

/**
 * Calculate combined boost from all factors
 * Aggregates multiple boost sources into a single value
 *
 * @param params - Object containing all boost parameters
 * @returns Total boost value
 */
export interface CombinedBoostParams {
  aiQualityScore?: number | null;
  categoryPopularity?: number;
  discountPercentage?: number | null;
  votesCount?: number;
  ageInHours?: number;
}

export function calculateCombinedBoost(params: CombinedBoostParams): number {
  const {
    aiQualityScore,
    categoryPopularity = 0,
    discountPercentage,
    votesCount = 0,
    ageInHours = 1,
  } = params;

  // Calculate individual boosts
  const qualityBoost = calculateQualityBoost(aiQualityScore);
  const categoryBoost = calculateCategoryBoost(categoryPopularity);
  const discountBoost = calculateDiscountBoost(discountPercentage);

  // Calculate velocity boost if deal is recent enough (< 48 hours)
  let velocityBoost = 0;
  if (ageInHours < 48) {
    const velocity = calculateEngagementVelocity(votesCount, ageInHours);
    velocityBoost = calculateVelocityBoost(velocity);
  }

  // Sum all boosts
  return qualityBoost + categoryBoost + discountBoost + velocityBoost;
}
