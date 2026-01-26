/**
 * Enhanced deal ranking algorithm
 * Combines votes, AI quality, category popularity, and time decay
 * to produce a comprehensive ranking score
 */

import { calculateExponentialDecay, calculateAgeInDays } from './decay';
import { calculateQualityBoost, calculateCategoryBoost } from './boost';
import type { RankingMetadata } from '../types/deal';

/**
 * Input parameters for ranking calculation
 */
export interface RankingInput {
  /** Unique deal identifier */
  dealId: string;

  /** Number of upvotes */
  upvotes: number;

  /** Number of downvotes */
  downvotes: number;

  /** When the deal was created */
  createdAt: Date;

  /** AI quality assessment score (0-100), optional */
  aiQualityScore?: number | null;

  /** Category popularity score (0-100+), optional */
  categoryPopularity?: number;

  /** Discount percentage (0-100), optional */
  discountPercentage?: number | null;
}

/**
 * Output of ranking calculation
 * Contains the final score and detailed breakdown
 */
export interface RankingOutput {
  /** Final ranking score */
  finalScore: number;

  /** Detailed metadata for storage and debugging */
  metadata: RankingMetadata;
}

/**
 * Calculate enhanced ranking score for a deal
 *
 * Formula: finalScore = (baseScore + aiQualityBoost + categoryBoost) × freshnessDecay
 *
 * Components:
 * - baseScore: upvotes - downvotes (can be negative)
 * - aiQualityBoost: (aiQualityScore / 100) × 50 (max 50 points)
 * - categoryBoost: categoryPopularity × 0.1
 * - freshnessDecay: e^(-days/30) (exponential decay with 30-day half-life)
 *
 * @param input - Deal data required for ranking calculation
 * @returns Ranking output with final score and metadata
 *
 * @example
 * const result = calculateDealRanking({
 *   dealId: 'abc-123',
 *   upvotes: 150,
 *   downvotes: 10,
 *   createdAt: new Date('2024-10-15'),
 *   aiQualityScore: 85,
 *   categoryPopularity: 45,
 * });
 *
 * console.log(result.finalScore); // e.g., 182.5
 * console.log(result.metadata); // Detailed breakdown
 */
export function calculateDealRanking(input: RankingInput): RankingOutput {
  const {
    dealId,
    upvotes,
    downvotes,
    createdAt,
    aiQualityScore,
    categoryPopularity = 0,
    discountPercentage,
  } = input;

  // 1. Calculate base score from votes
  // This is the community consensus: positive votes minus negative votes
  const baseScore = upvotes - downvotes;

  // 2. Calculate AI quality boost
  // High-quality deals (as assessed by AI) get up to 50 bonus points
  const aiQualityBoost = calculateQualityBoost(aiQualityScore, 50);

  // 3. Calculate category boost
  // Popular categories get a small boost (max ~10 points for 100% popularity)
  const categoryBoost = calculateCategoryBoost(categoryPopularity, 0.1);

  // 4. Calculate discount boost (optional enhancement)
  // Better discounts get a small boost (max 20 points for 100% discount)
  const discountBoost = discountPercentage
    ? (discountPercentage / 100) * 20
    : 0;

  // 5. Calculate time-based freshness decay
  // Uses exponential decay: newer deals are favored
  // After 30 days, a deal's score is reduced to ~50% of its original value
  const freshnessDecay = calculateExponentialDecay(createdAt, 30);

  // 6. Combine all components into final score
  // The decay is multiplicative to ensure old deals eventually fade away
  // even if they have high votes/quality
  const combinedScore = baseScore + aiQualityBoost + categoryBoost + discountBoost;
  const finalScore = combinedScore * freshnessDecay;

  // 7. Calculate age for metadata
  const ageInDays = calculateAgeInDays(createdAt);

  // 8. Build detailed metadata for transparency and debugging
  const metadata: RankingMetadata = {
    // Component scores
    base_score: baseScore,
    ai_quality_component: aiQualityBoost,
    category_component: categoryBoost,
    discount_component: discountBoost,
    combined_pre_decay: combinedScore,

    // Decay information
    freshness_decay: freshnessDecay,
    age_in_days: ageInDays,

    // Vote breakdown
    upvotes,
    downvotes,
    net_votes: baseScore,

    // Input scores
    ai_quality_score: aiQualityScore ?? null,
    category_popularity: categoryPopularity,
    discount_percentage: discountPercentage ?? null,

    // Final result
    final_rank: finalScore,

    // Timestamp
    calculated_at: new Date().toISOString(),
  };

  return {
    finalScore: Math.round(finalScore * 100) / 100, // Round to 2 decimal places
    metadata,
  };
}

/**
 * Batch calculate rankings for multiple deals
 * More efficient than calling calculateDealRanking individually
 *
 * @param inputs - Array of ranking inputs
 * @returns Array of ranking outputs in the same order
 */
export function calculateBatchRankings(
  inputs: RankingInput[]
): RankingOutput[] {
  return inputs.map(input => calculateDealRanking(input));
}

/**
 * Recalculate and compare ranking changes
 * Useful for understanding how a deal's ranking evolved
 *
 * @param input - Current deal data
 * @param previousMetadata - Previous ranking metadata
 * @returns Ranking output with change delta
 */
export function recalculateWithComparison(
  input: RankingInput,
  previousMetadata: RankingMetadata | null
): RankingOutput & { scoreDelta?: number; percentChange?: number } {
  const result = calculateDealRanking(input);

  if (previousMetadata?.final_rank != null) {
    const scoreDelta = result.finalScore - previousMetadata.final_rank;
    const percentChange = previousMetadata.final_rank !== 0
      ? (scoreDelta / Math.abs(previousMetadata.final_rank)) * 100
      : 0;

    return {
      ...result,
      scoreDelta: Math.round(scoreDelta * 100) / 100,
      percentChange: Math.round(percentChange * 100) / 100,
    };
  }

  return result;
}

/**
 * Estimate ranking score impact of vote changes
 * Useful for preview/UI before actually updating
 *
 * @param currentRanking - Current ranking output
 * @param voteChange - Change in votes (1 for upvote, -1 for downvote)
 * @returns Estimated new final score
 */
export function estimateVoteImpact(
  currentRanking: RankingOutput,
  voteChange: 1 | -1
): number {
  const { metadata } = currentRanking;

  // Extract components
  const newBaseScore = (metadata.base_score ?? 0) + voteChange;
  const aiBoost = metadata.ai_quality_component ?? 0;
  const categoryBoost = metadata.category_component ?? 0;
  const discountBoost = metadata.discount_component ?? 0;
  const decay = metadata.freshness_decay ?? 1;

  // Recalculate
  const newCombined = newBaseScore + aiBoost + categoryBoost + discountBoost;
  const newFinalScore = newCombined * decay;

  return Math.round(newFinalScore * 100) / 100;
}

/**
 * Get ranking tier for UI display
 * Categorizes deals into tiers based on final score
 *
 * @param finalScore - The calculated ranking score
 * @returns Tier name
 */
export function getRankingTier(finalScore: number): string {
  if (finalScore >= 200) return 'Legendary';
  if (finalScore >= 100) return 'Exceptional';
  if (finalScore >= 50) return 'Great';
  if (finalScore >= 20) return 'Good';
  if (finalScore >= 5) return 'Fair';
  if (finalScore >= 0) return 'New';
  return 'Poor'; // Negative score (more downvotes than upvotes)
}

/**
 * Validate ranking input
 * Ensures input data is valid before calculation
 *
 * @param input - Ranking input to validate
 * @throws Error if input is invalid
 */
export function validateRankingInput(input: RankingInput): void {
  if (!input.dealId || input.dealId.trim() === '') {
    throw new Error('Deal ID is required');
  }

  if (input.upvotes < 0) {
    throw new Error('Upvotes cannot be negative');
  }

  if (input.downvotes < 0) {
    throw new Error('Downvotes cannot be negative');
  }

  if (!(input.createdAt instanceof Date) || isNaN(input.createdAt.getTime())) {
    throw new Error('Invalid createdAt date');
  }

  if (input.aiQualityScore != null && (input.aiQualityScore < 0 || input.aiQualityScore > 100)) {
    throw new Error('AI quality score must be between 0 and 100');
  }

  if (input.categoryPopularity != null && input.categoryPopularity < 0) {
    throw new Error('Category popularity cannot be negative');
  }

  if (input.discountPercentage != null && (input.discountPercentage < 0 || input.discountPercentage > 100)) {
    throw new Error('Discount percentage must be between 0 and 100');
  }
}

/**
 * Safe ranking calculation with validation
 * Wraps calculateDealRanking with input validation
 *
 * @param input - Ranking input
 * @returns Ranking output
 * @throws Error if input is invalid
 */
export function calculateDealRankingSafe(input: RankingInput): RankingOutput {
  validateRankingInput(input);
  return calculateDealRanking(input);
}
