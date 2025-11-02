/**
 * Time decay functions for deal ranking
 * Implements various decay algorithms to reduce deal scores over time
 */

/**
 * Calculate exponential decay factor based on age
 *
 * Uses the formula: e^(-days/halfLife)
 * This creates a smooth exponential decay where older items
 * gradually lose ranking weight
 *
 * @param createdAt - When the deal was created
 * @param halfLife - Number of days for the score to decay to 50% (default: 30)
 * @returns Decay factor between 0 and 1 (1 = new, 0 = very old)
 *
 * @example
 * // A deal posted today
 * calculateExponentialDecay(new Date()) // ~1.0
 *
 * // A deal posted 30 days ago (one half-life)
 * calculateExponentialDecay(daysAgo(30)) // ~0.5
 *
 * // A deal posted 60 days ago (two half-lives)
 * calculateExponentialDecay(daysAgo(60)) // ~0.25
 */
export function calculateExponentialDecay(
  createdAt: Date,
  halfLife: number = 30
): number {
  const now = new Date();
  const ageInMs = now.getTime() - createdAt.getTime();
  const ageInDays = ageInMs / (1000 * 60 * 60 * 24);

  // Exponential decay formula: e^(-days/halfLife)
  const decayFactor = Math.exp(-ageInDays / halfLife);

  // Ensure result is between 0 and 1
  return Math.max(0, Math.min(1, decayFactor));
}

/**
 * Calculate linear decay factor with a grace period
 *
 * Provides no decay for the first `graceDays`, then linearly
 * decreases to 0 over `decayWindow` days
 *
 * @param createdAt - When the deal was created
 * @param graceDays - Days before decay starts (default: 7)
 * @param decayWindow - Days over which score decays to 0 (default: 90)
 * @returns Decay factor between 0 and 1
 *
 * @example
 * // Within grace period (first 7 days)
 * calculateLinearDecay(daysAgo(5)) // 1.0
 *
 * // After grace period
 * calculateLinearDecay(daysAgo(37)) // ~0.67 (30 days into 90-day window)
 */
export function calculateLinearDecay(
  createdAt: Date,
  graceDays: number = 7,
  decayWindow: number = 90
): number {
  const now = new Date();
  const ageInMs = now.getTime() - createdAt.getTime();
  const ageInDays = ageInMs / (1000 * 60 * 60 * 24);

  // No decay during grace period
  if (ageInDays <= graceDays) {
    return 1.0;
  }

  // Linear decay after grace period
  const daysIntoDecay = ageInDays - graceDays;
  const decayFactor = 1 - (daysIntoDecay / decayWindow);

  // Ensure result is between 0 and 1
  return Math.max(0, Math.min(1, decayFactor));
}

/**
 * Calculate age in days from a date
 * Helper function for other calculations
 *
 * @param createdAt - The date to calculate age from
 * @returns Number of days since the date (can be fractional)
 */
export function calculateAgeInDays(createdAt: Date): number {
  const now = new Date();
  const ageInMs = now.getTime() - createdAt.getTime();
  return ageInMs / (1000 * 60 * 60 * 24);
}

/**
 * Calculate freshness score (0-100)
 * Converts decay factor to a more human-readable score
 *
 * @param createdAt - When the deal was created
 * @param decayType - Type of decay to use ('exponential' or 'linear')
 * @returns Freshness score from 0-100
 */
export function calculateFreshnessScore(
  createdAt: Date,
  decayType: 'exponential' | 'linear' = 'exponential'
): number {
  const decayFactor = decayType === 'exponential'
    ? calculateExponentialDecay(createdAt)
    : calculateLinearDecay(createdAt);

  return Math.round(decayFactor * 100);
}

/**
 * Calculate half-life remaining percentage
 * Shows what percentage of the original "freshness" remains
 *
 * @param createdAt - When the deal was created
 * @param halfLife - Number of days for half-life (default: 30)
 * @returns Percentage remaining (0-100)
 */
export function calculateHalfLifeRemaining(
  createdAt: Date,
  halfLife: number = 30
): number {
  const ageInDays = calculateAgeInDays(createdAt);
  const halfLivesPassed = ageInDays / halfLife;
  const remaining = Math.pow(0.5, halfLivesPassed) * 100;

  return Math.max(0, Math.min(100, remaining));
}

/**
 * Get human-readable freshness category
 * Categorizes deals by age for UI display
 *
 * @param createdAt - When the deal was created
 * @returns Freshness category string
 */
export function getFreshnessCategory(createdAt: Date): string {
  const ageInDays = calculateAgeInDays(createdAt);

  if (ageInDays < 1) return 'Brand New';
  if (ageInDays < 3) return 'Hot';
  if (ageInDays < 7) return 'Fresh';
  if (ageInDays < 14) return 'Recent';
  if (ageInDays < 30) return 'Aging';
  if (ageInDays < 60) return 'Old';
  return 'Very Old';
}
