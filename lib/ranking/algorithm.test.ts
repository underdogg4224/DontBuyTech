/**
 * Unit tests for ranking algorithm
 * These tests demonstrate how the ranking system works
 * and verify correct calculations
 */

import { describe, it, expect } from '@jest/globals';
import {
  calculateDealRanking,
  calculateBatchRankings,
  recalculateWithComparison,
  estimateVoteImpact,
  getRankingTier,
  validateRankingInput,
  calculateDealRankingSafe,
  type RankingInput,
} from './algorithm';

describe('Enhanced Ranking Algorithm', () => {
  describe('calculateDealRanking', () => {
    it('should calculate score for a basic deal with only votes', () => {
      const input: RankingInput = {
        dealId: 'test-1',
        upvotes: 100,
        downvotes: 10,
        createdAt: new Date(), // Brand new deal
      };

      const result = calculateDealRanking(input);

      // Base score: 100 - 10 = 90
      // No AI boost, no category boost
      // Decay: ~1.0 (brand new)
      // Expected: ~90
      expect(result.finalScore).toBeGreaterThan(85);
      expect(result.finalScore).toBeLessThan(95);
      expect(result.metadata.base_score).toBe(90);
      expect(result.metadata.upvotes).toBe(100);
      expect(result.metadata.downvotes).toBe(10);
    });

    it('should apply AI quality boost correctly', () => {
      const input: RankingInput = {
        dealId: 'test-2',
        upvotes: 50,
        downvotes: 5,
        createdAt: new Date(),
        aiQualityScore: 80, // High quality
      };

      const result = calculateDealRanking(input);

      // Base score: 45
      // AI boost: (80/100) * 50 = 40
      // Combined: 85
      // Decay: ~1.0
      // Expected: ~85
      expect(result.metadata.ai_quality_component).toBe(40);
      expect(result.finalScore).toBeGreaterThan(80);
      expect(result.finalScore).toBeLessThan(90);
    });

    it('should apply category boost correctly', () => {
      const input: RankingInput = {
        dealId: 'test-3',
        upvotes: 30,
        downvotes: 2,
        createdAt: new Date(),
        categoryPopularity: 50, // Popular category
      };

      const result = calculateDealRanking(input);

      // Base score: 28
      // Category boost: 50 * 0.1 = 5
      // Combined: 33
      expect(result.metadata.category_component).toBe(5);
      expect(result.finalScore).toBeGreaterThan(30);
    });

    it('should apply time decay for older deals', () => {
      // Deal from 30 days ago (one half-life)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const input: RankingInput = {
        dealId: 'test-4',
        upvotes: 100,
        downvotes: 0,
        createdAt: thirtyDaysAgo,
      };

      const result = calculateDealRanking(input);

      // Base score: 100
      // Decay after 30 days: ~0.5 (50%)
      // Expected: ~50
      expect(result.finalScore).toBeGreaterThan(45);
      expect(result.finalScore).toBeLessThan(55);
      expect(result.metadata.age_in_days).toBeGreaterThan(29);
      expect(result.metadata.freshness_decay).toBeGreaterThan(0.4);
      expect(result.metadata.freshness_decay).toBeLessThan(0.6);
    });

    it('should handle negative scores (more downvotes than upvotes)', () => {
      const input: RankingInput = {
        dealId: 'test-5',
        upvotes: 10,
        downvotes: 50,
        createdAt: new Date(),
      };

      const result = calculateDealRanking(input);

      // Base score: 10 - 50 = -40
      expect(result.metadata.base_score).toBe(-40);
      expect(result.finalScore).toBeLessThan(0);
    });

    it('should handle missing optional parameters', () => {
      const input: RankingInput = {
        dealId: 'test-6',
        upvotes: 20,
        downvotes: 5,
        createdAt: new Date(),
        aiQualityScore: null,
        categoryPopularity: undefined,
      };

      const result = calculateDealRanking(input);

      expect(result.metadata.ai_quality_component).toBe(0);
      expect(result.metadata.category_component).toBe(0);
      expect(result.finalScore).toBeGreaterThan(0);
    });

    it('should combine all boost factors correctly', () => {
      const input: RankingInput = {
        dealId: 'test-7',
        upvotes: 100,
        downvotes: 10,
        createdAt: new Date(),
        aiQualityScore: 90, // Excellent quality
        categoryPopularity: 60, // Very popular category
        discountPercentage: 75, // Great discount
      };

      const result = calculateDealRanking(input);

      // Base: 90
      // AI boost: (90/100) * 50 = 45
      // Category boost: 60 * 0.1 = 6
      // Discount boost: (75/100) * 20 = 15
      // Combined: 156
      expect(result.metadata.base_score).toBe(90);
      expect(result.metadata.ai_quality_component).toBe(45);
      expect(result.metadata.category_component).toBe(6);
      expect(result.metadata.discount_component).toBe(15);
      expect(result.metadata.combined_pre_decay).toBe(156);
      expect(result.finalScore).toBeGreaterThan(150);
    });
  });

  describe('calculateBatchRankings', () => {
    it('should calculate rankings for multiple deals', () => {
      const inputs: RankingInput[] = [
        {
          dealId: 'batch-1',
          upvotes: 100,
          downvotes: 10,
          createdAt: new Date(),
        },
        {
          dealId: 'batch-2',
          upvotes: 50,
          downvotes: 5,
          createdAt: new Date(),
          aiQualityScore: 80,
        },
        {
          dealId: 'batch-3',
          upvotes: 30,
          downvotes: 2,
          createdAt: new Date(),
          categoryPopularity: 50,
        },
      ];

      const results = calculateBatchRankings(inputs);

      expect(results).toHaveLength(3);
      expect(results[0].metadata.base_score).toBe(90);
      expect(results[1].metadata.ai_quality_component).toBe(40);
      expect(results[2].metadata.category_component).toBe(5);
    });
  });

  describe('recalculateWithComparison', () => {
    it('should calculate score delta from previous ranking', () => {
      const input: RankingInput = {
        dealId: 'compare-1',
        upvotes: 120, // Increased from 100
        downvotes: 10,
        createdAt: new Date(),
      };

      const previousMetadata = {
        final_rank: 90,
        calculated_at: new Date().toISOString(),
      };

      const result = recalculateWithComparison(input, previousMetadata);

      expect(result.scoreDelta).toBeGreaterThan(0); // Score increased
      expect(result.percentChange).toBeDefined();
    });

    it('should handle missing previous metadata', () => {
      const input: RankingInput = {
        dealId: 'compare-2',
        upvotes: 50,
        downvotes: 5,
        createdAt: new Date(),
      };

      const result = recalculateWithComparison(input, null);

      expect(result.scoreDelta).toBeUndefined();
      expect(result.percentChange).toBeUndefined();
    });
  });

  describe('estimateVoteImpact', () => {
    it('should estimate impact of upvote', () => {
      const currentRanking = calculateDealRanking({
        dealId: 'estimate-1',
        upvotes: 50,
        downvotes: 5,
        createdAt: new Date(),
      });

      const estimatedScore = estimateVoteImpact(currentRanking, 1);

      expect(estimatedScore).toBeGreaterThan(currentRanking.finalScore);
    });

    it('should estimate impact of downvote', () => {
      const currentRanking = calculateDealRanking({
        dealId: 'estimate-2',
        upvotes: 50,
        downvotes: 5,
        createdAt: new Date(),
      });

      const estimatedScore = estimateVoteImpact(currentRanking, -1);

      expect(estimatedScore).toBeLessThan(currentRanking.finalScore);
    });
  });

  describe('getRankingTier', () => {
    it('should categorize scores into tiers', () => {
      expect(getRankingTier(250)).toBe('Legendary');
      expect(getRankingTier(150)).toBe('Exceptional');
      expect(getRankingTier(75)).toBe('Great');
      expect(getRankingTier(30)).toBe('Good');
      expect(getRankingTier(10)).toBe('Fair');
      expect(getRankingTier(3)).toBe('New');
      expect(getRankingTier(-10)).toBe('Poor');
    });
  });

  describe('validateRankingInput', () => {
    it('should validate correct input', () => {
      const validInput: RankingInput = {
        dealId: 'valid-1',
        upvotes: 50,
        downvotes: 5,
        createdAt: new Date(),
      };

      expect(() => validateRankingInput(validInput)).not.toThrow();
    });

    it('should throw on missing deal ID', () => {
      const invalidInput: RankingInput = {
        dealId: '',
        upvotes: 50,
        downvotes: 5,
        createdAt: new Date(),
      };

      expect(() => validateRankingInput(invalidInput)).toThrow('Deal ID is required');
    });

    it('should throw on negative upvotes', () => {
      const invalidInput: RankingInput = {
        dealId: 'test',
        upvotes: -10,
        downvotes: 5,
        createdAt: new Date(),
      };

      expect(() => validateRankingInput(invalidInput)).toThrow('Upvotes cannot be negative');
    });

    it('should throw on invalid AI quality score', () => {
      const invalidInput: RankingInput = {
        dealId: 'test',
        upvotes: 50,
        downvotes: 5,
        createdAt: new Date(),
        aiQualityScore: 150, // Over 100
      };

      expect(() => validateRankingInput(invalidInput)).toThrow('AI quality score must be between 0 and 100');
    });

    it('should throw on invalid discount percentage', () => {
      const invalidInput: RankingInput = {
        dealId: 'test',
        upvotes: 50,
        downvotes: 5,
        createdAt: new Date(),
        discountPercentage: -10,
      };

      expect(() => validateRankingInput(invalidInput)).toThrow('Discount percentage must be between 0 and 100');
    });
  });

  describe('calculateDealRankingSafe', () => {
    it('should calculate with validation', () => {
      const validInput: RankingInput = {
        dealId: 'safe-1',
        upvotes: 50,
        downvotes: 5,
        createdAt: new Date(),
      };

      const result = calculateDealRankingSafe(validInput);
      expect(result.finalScore).toBeGreaterThan(0);
    });

    it('should throw on invalid input', () => {
      const invalidInput: RankingInput = {
        dealId: '',
        upvotes: 50,
        downvotes: 5,
        createdAt: new Date(),
      };

      expect(() => calculateDealRankingSafe(invalidInput)).toThrow();
    });
  });

  describe('Real-world scenarios', () => {
    it('scenario: viral new deal with high quality', () => {
      const input: RankingInput = {
        dealId: 'viral-1',
        upvotes: 500,
        downvotes: 20,
        createdAt: new Date(), // Just posted
        aiQualityScore: 95,
        categoryPopularity: 70,
        discountPercentage: 80,
      };

      const result = calculateDealRanking(input);

      // This should be a very high-ranking deal
      expect(result.finalScore).toBeGreaterThan(500);
      expect(getRankingTier(result.finalScore)).toBe('Legendary');
    });

    it('scenario: old deal with decent votes', () => {
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const input: RankingInput = {
        dealId: 'old-1',
        upvotes: 200,
        downvotes: 20,
        createdAt: sixtyDaysAgo,
        aiQualityScore: 70,
      };

      const result = calculateDealRanking(input);

      // Should be significantly reduced by decay (60 days = 2 half-lives = ~25% remaining)
      expect(result.finalScore).toBeLessThan(100);
      expect(result.metadata.freshness_decay).toBeLessThan(0.3);
    });

    it('scenario: controversial deal (many votes, mixed)', () => {
      const input: RankingInput = {
        dealId: 'controversial-1',
        upvotes: 100,
        downvotes: 95, // Nearly equal
        createdAt: new Date(),
        aiQualityScore: 40, // Low quality
      };

      const result = calculateDealRanking(input);

      // Base score: 5 (very low)
      // AI boost: 20 (low quality)
      // Total: 25
      expect(result.metadata.base_score).toBe(5);
      expect(result.finalScore).toBeLessThan(30);
      expect(getRankingTier(result.finalScore)).toBe('Good');
    });
  });
});
