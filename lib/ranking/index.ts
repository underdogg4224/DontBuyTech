/**
 * Ranking system exports
 * Central export point for all ranking-related functionality
 */

// Core algorithm
export {
  calculateDealRanking,
  calculateBatchRankings,
  recalculateWithComparison,
  estimateVoteImpact,
  getRankingTier,
  validateRankingInput,
  calculateDealRankingSafe,
  type RankingInput,
  type RankingOutput,
} from './algorithm';

// Time decay functions
export {
  calculateExponentialDecay,
  calculateLinearDecay,
  calculateAgeInDays,
  calculateFreshnessScore,
  calculateHalfLifeRemaining,
  getFreshnessCategory,
} from './decay';

// Boost calculations
export {
  calculateCategoryPopularity,
  calculateCategoryBoost,
  calculateEngagementVelocity,
  calculateVelocityBoost,
  calculateQualityBoost,
  calculateDiscountBoost,
  calculateCombinedBoost,
  getBoostCategory,
  type CategoryEngagement,
  type CombinedBoostParams,
} from './boost';

// Re-export RankingMetadata type from shared types
export type { RankingMetadata } from '../types/deal';
