/**
 * Deal queries
 * Reusable database queries for deals with enhanced ranking algorithm
 */

import { db } from '../index';
import { deals } from '../schema';
import { eq, desc, asc, and, sql, SQL } from 'drizzle-orm';
import { getVoteCount } from './votes';
import {
  calculateDealRanking,
  calculateBatchRankings,
  type RankingInput,
  type RankingOutput,
} from '../../ranking';

/**
 * Options for deal queries
 */
export interface DealQueryOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'score' | 'created_at' | 'price';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Simple in-memory cache for ranking calculations
 * Cache entries expire after 5 minutes
 */
interface RankingCacheEntry {
  ranking: RankingOutput;
  cachedAt: number;
}

const RANKING_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const rankingCache = new Map<string, RankingCacheEntry>();

/**
 * Get cached ranking if available and not expired
 */
function getCachedRanking(dealId: string): RankingOutput | null {
  const entry = rankingCache.get(dealId);
  if (!entry) return null;

  const now = Date.now();
  if (now - entry.cachedAt > RANKING_CACHE_TTL) {
    rankingCache.delete(dealId);
    return null;
  }

  return entry.ranking;
}

/**
 * Cache a ranking calculation
 */
function cacheRanking(dealId: string, ranking: RankingOutput): void {
  rankingCache.set(dealId, {
    ranking,
    cachedAt: Date.now(),
  });
}

/**
 * Clear ranking cache for a specific deal
 */
export function clearRankingCache(dealId?: string): void {
  if (dealId) {
    rankingCache.delete(dealId);
  } else {
    rankingCache.clear();
  }
}

/**
 * Calculate ranking score for a deal
 * Formula: score = votes_count * freshness_factor
 * freshness_factor = 1 / (1 + hours_since_posted / 24)
 *
 * This ensures newer deals with similar votes rank higher,
 * and the impact of time decay is gradual (half-life of ~24 hours)
 */
export function calculateDealScore(votesCount: number, createdAt: Date): number {
  const now = new Date();
  const hoursSincePosted = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
  const freshnessFactor = 1 / (1 + hoursSincePosted / 24);
  return votesCount * freshnessFactor;
}

/**
 * SQL fragment for calculating score dynamically
 * Used in queries to calculate score on-the-fly
 */
const scoreSQL = sql<number>`
  (votes_count * (1.0 / (1.0 + EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400)))
`;

/**
 * Get top N deals by category with calculated ranking score
 *
 * @param categoryId - Category UUID
 * @param limit - Number of deals to return (default: 10)
 * @param useEnhancedRanking - Whether to use enhanced ranking algorithm (default: false for compatibility)
 * @returns Array of top-ranked deals with calculated score
 */
export async function getTopDealsByCategory(
  categoryId: string,
  limit: number = 10,
  useEnhancedRanking: boolean = false
) {
  try {
    if (useEnhancedRanking) {
      // Use enhanced ranking algorithm
      const results = await getDealsWithEnhancedRanking({
        categoryId,
        limit,
        offset: 0,
      });
      return results;
    }

    // Use legacy ranking for backward compatibility
    const results = await db
      .select({
        id: deals.id,
        title: deals.title,
        description: deals.description,
        price: deals.price,
        original_price: deals.original_price,
        discount_percentage: deals.discount_percentage,
        url: deals.url,
        image_url: deals.image_url,
        category_id: deals.category_id,
        brand: deals.brand,
        votes_count: deals.votes_count,
        created_at: deals.created_at,
        expires_at: deals.expires_at,
        archived: deals.archived,
        summary: deals.summary,
        ai_quality_score: deals.ai_quality_score,
        summarized_at: deals.summarized_at,
        archived_at: deals.archived_at,
        archive_reason: deals.archive_reason,
        ranking_metadata: deals.ranking_metadata,
        calculated_score: scoreSQL,
      })
      .from(deals)
      .where(
        and(
          eq(deals.category_id, categoryId),
          eq(deals.archived, false)
        )
      )
      .orderBy(desc(scoreSQL))
      .limit(limit);

    return results;
  } catch (error) {
    console.error('Error fetching top deals by category:', error);
    throw new Error(`Failed to fetch top deals for category ${categoryId}`);
  }
}

/**
 * Get a single deal by ID with all details
 *
 * @param id - Deal UUID
 * @returns Deal object or null if not found
 */
export async function getDealById(id: string) {
  try {
    const result = await db
      .select({
        id: deals.id,
        title: deals.title,
        description: deals.description,
        price: deals.price,
        original_price: deals.original_price,
        discount_percentage: deals.discount_percentage,
        url: deals.url,
        image_url: deals.image_url,
        category_id: deals.category_id,
        brand: deals.brand,
        score: deals.score,
        votes_count: deals.votes_count,
        created_at: deals.created_at,
        expires_at: deals.expires_at,
        archived: deals.archived,
        summary: deals.summary,
        ai_quality_score: deals.ai_quality_score,
        summarized_at: deals.summarized_at,
        archived_at: deals.archived_at,
        archive_reason: deals.archive_reason,
        ranking_metadata: deals.ranking_metadata,
        calculated_score: scoreSQL,
      })
      .from(deals)
      .where(eq(deals.id, id))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error(`Error fetching deal ${id}:`, error);
    throw new Error(`Failed to fetch deal with id ${id}`);
  }
}

/**
 * Get all deals in a category with filters and pagination
 *
 * @param categoryId - Category UUID
 * @param options - Query options (limit, offset, sorting)
 * @returns Array of deals matching criteria
 */
export async function getDealsByCategory(
  categoryId: string,
  options: DealQueryOptions & { useEnhancedRanking?: boolean } = {}
) {
  try {
    const {
      limit = 20,
      offset = 0,
      sortBy = 'score',
      sortOrder = 'desc',
      useEnhancedRanking = false,
    } = options;

    // If sorting by score and enhanced ranking is enabled, use enhanced algorithm
    if (sortBy === 'score' && useEnhancedRanking) {
      return await getDealsWithEnhancedRanking({
        categoryId,
        limit,
        offset,
      });
    }

    // Use legacy SQL-based ranking for backward compatibility
    // Determine sorting column
    let orderByColumn: SQL | typeof deals.created_at | typeof deals.price;
    switch (sortBy) {
      case 'created_at':
        orderByColumn = deals.created_at;
        break;
      case 'price':
        orderByColumn = deals.price;
        break;
      case 'score':
      default:
        orderByColumn = scoreSQL;
        break;
    }

    // Build query
    const query = db
      .select({
        id: deals.id,
        title: deals.title,
        description: deals.description,
        price: deals.price,
        original_price: deals.original_price,
        discount_percentage: deals.discount_percentage,
        url: deals.url,
        image_url: deals.image_url,
        category_id: deals.category_id,
        brand: deals.brand,
        votes_count: deals.votes_count,
        created_at: deals.created_at,
        expires_at: deals.expires_at,
        archived: deals.archived,
        summary: deals.summary,
        ai_quality_score: deals.ai_quality_score,
        summarized_at: deals.summarized_at,
        archived_at: deals.archived_at,
        archive_reason: deals.archive_reason,
        ranking_metadata: deals.ranking_metadata,
        calculated_score: scoreSQL,
      })
      .from(deals)
      .where(
        and(
          eq(deals.category_id, categoryId),
          eq(deals.archived, false)
        )
      )
      .limit(limit)
      .offset(offset);

    // Apply sorting
    const results = await (sortOrder === 'desc'
      ? query.orderBy(desc(orderByColumn))
      : query.orderBy(asc(orderByColumn)));

    return results;
  } catch (error) {
    console.error('Error fetching deals by category:', error);
    throw new Error(`Failed to fetch deals for category ${categoryId}`);
  }
}

/**
 * Get archived deals with pagination
 *
 * @param options - Query options (limit, offset, sorting)
 * @returns Array of archived deals
 */
export async function getArchivedDeals(options: DealQueryOptions = {}) {
  try {
    const {
      limit = 20,
      offset = 0,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = options;

    // Determine sorting column
    let orderByColumn: SQL | typeof deals.created_at | typeof deals.price;
    switch (sortBy) {
      case 'price':
        orderByColumn = deals.price;
        break;
      case 'score':
        orderByColumn = scoreSQL;
        break;
      case 'created_at':
      default:
        orderByColumn = deals.created_at;
        break;
    }

    // Build query
    const query = db
      .select({
        id: deals.id,
        title: deals.title,
        description: deals.description,
        price: deals.price,
        original_price: deals.original_price,
        discount_percentage: deals.discount_percentage,
        url: deals.url,
        image_url: deals.image_url,
        category_id: deals.category_id,
        brand: deals.brand,
        votes_count: deals.votes_count,
        created_at: deals.created_at,
        expires_at: deals.expires_at,
        archived: deals.archived,
        summary: deals.summary,
        ai_quality_score: deals.ai_quality_score,
        summarized_at: deals.summarized_at,
        archived_at: deals.archived_at,
        archive_reason: deals.archive_reason,
        ranking_metadata: deals.ranking_metadata,
      })
      .from(deals)
      .where(eq(deals.archived, true))
      .limit(limit)
      .offset(offset);

    // Apply sorting
    const results = await (sortOrder === 'desc'
      ? query.orderBy(desc(orderByColumn))
      : query.orderBy(asc(orderByColumn)));

    return results;
  } catch (error) {
    console.error('Error fetching archived deals:', error);
    throw new Error('Failed to fetch archived deals');
  }
}

/**
 * Get all active deals across all categories
 * Useful for homepage "hot deals" section
 *
 * @param limit - Number of deals to return
 * @returns Array of top-ranked active deals
 */
export async function getTopDeals(limit: number = 20) {
  try {
    const results = await db
      .select({
        id: deals.id,
        title: deals.title,
        description: deals.description,
        price: deals.price,
        original_price: deals.original_price,
        discount_percentage: deals.discount_percentage,
        url: deals.url,
        image_url: deals.image_url,
        category_id: deals.category_id,
        brand: deals.brand,
        votes_count: deals.votes_count,
        created_at: deals.created_at,
        expires_at: deals.expires_at,
        archived: deals.archived,
        summary: deals.summary,
        ai_quality_score: deals.ai_quality_score,
        summarized_at: deals.summarized_at,
        archived_at: deals.archived_at,
        archive_reason: deals.archive_reason,
        ranking_metadata: deals.ranking_metadata,
        calculated_score: scoreSQL,
      })
      .from(deals)
      .where(eq(deals.archived, false))
      .orderBy(desc(scoreSQL))
      .limit(limit);

    return results;
  } catch (error) {
    console.error('Error fetching top deals:', error);
    throw new Error('Failed to fetch top deals');
  }
}

/**
 * Update deal score in database (legacy)
 * Should be called after vote changes
 * @deprecated Use calculateAndStoreRanking instead for enhanced ranking
 *
 * @param dealId - Deal UUID
 * @param votesCount - Current vote count
 * @param createdAt - Deal creation timestamp
 */
export async function updateDealScore(
  dealId: string,
  votesCount: number,
  createdAt: Date
) {
  try {
    const newScore = calculateDealScore(votesCount, createdAt);

    await db
      .update(deals)
      .set({
        score: newScore,
        votes_count: votesCount,
      })
      .where(eq(deals.id, dealId));

    return newScore;
  } catch (error) {
    console.error(`Error updating deal score for ${dealId}:`, error);
    throw new Error(`Failed to update score for deal ${dealId}`);
  }
}

// ============================================================================
// ENHANCED RANKING FUNCTIONS
// ============================================================================

/**
 * Calculate and store enhanced ranking for a deal
 * Fetches all necessary data, calculates ranking, and updates database
 *
 * @param dealId - Deal UUID
 * @returns Updated ranking output
 */
export async function calculateAndStoreRanking(
  dealId: string
): Promise<RankingOutput> {
  try {
    // Check cache first
    const cached = getCachedRanking(dealId);
    if (cached) {
      return cached;
    }

    // Fetch deal data
    const deal = await db
      .select({
        id: deals.id,
        created_at: deals.created_at,
        ai_quality_score: deals.ai_quality_score,
        discount_percentage: deals.discount_percentage,
      })
      .from(deals)
      .where(eq(deals.id, dealId))
      .limit(1);

    if (!deal[0]) {
      throw new Error(`Deal ${dealId} not found`);
    }

    const dealData = deal[0];

    // Fetch vote counts
    const voteCount = await getVoteCount(dealId);

    // Prepare ranking input
    const rankingInput: RankingInput = {
      dealId,
      upvotes: voteCount.upvotes,
      downvotes: voteCount.downvotes,
      createdAt: new Date(dealData.created_at),
      aiQualityScore: dealData.ai_quality_score ?? 50, // Default to 50 if missing
      categoryPopularity: 0, // TODO: Calculate category popularity
      discountPercentage: dealData.discount_percentage,
    };

    // Calculate ranking
    const ranking = calculateDealRanking(rankingInput);

    // Update database with new score and metadata
    await db
      .update(deals)
      .set({
        score: ranking.finalScore,
        ranking_metadata: ranking.metadata,
      })
      .where(eq(deals.id, dealId));

    // Cache the result
    cacheRanking(dealId, ranking);

    return ranking;
  } catch (error) {
    console.error(`Error calculating ranking for deal ${dealId}:`, error);
    throw new Error(`Failed to calculate ranking for deal ${dealId}`);
  }
}

/**
 * Recalculate deal ranking (alias for calculateAndStoreRanking)
 * Useful for background jobs that update rankings after vote changes
 *
 * @param dealId - Deal UUID
 * @returns Updated ranking output
 */
export async function recalculateDealRanking(
  dealId: string
): Promise<RankingOutput> {
  // Clear cache to force recalculation
  clearRankingCache(dealId);
  return calculateAndStoreRanking(dealId);
}

/**
 * Get deals with enhanced ranking
 * Fetches deals, calculates rankings, and sorts by final score
 *
 * @param options - Query options with pagination and filtering
 * @returns Array of deals with calculated rankings
 */
export async function getDealsWithEnhancedRanking(
  options: DealQueryOptions & { categoryId?: string } = {}
) {
  try {
    const { limit = 20, offset = 0, categoryId } = options;

    // Build where clause
    const whereConditions = [eq(deals.archived, false)];
    if (categoryId) {
      whereConditions.push(eq(deals.category_id, categoryId));
    }

    // Fetch deals with all ranking-relevant fields
    const dealResults = await db
      .select({
        id: deals.id,
        title: deals.title,
        description: deals.description,
        price: deals.price,
        original_price: deals.original_price,
        discount_percentage: deals.discount_percentage,
        url: deals.url,
        image_url: deals.image_url,
        category_id: deals.category_id,
        brand: deals.brand,
        votes_count: deals.votes_count,
        created_at: deals.created_at,
        expires_at: deals.expires_at,
        archived: deals.archived,
        summary: deals.summary,
        ai_quality_score: deals.ai_quality_score,
        summarized_at: deals.summarized_at,
        archived_at: deals.archived_at,
        archive_reason: deals.archive_reason,
        score: deals.score,
        ranking_metadata: deals.ranking_metadata,
      })
      .from(deals)
      .where(and(...whereConditions));

    // Calculate rankings for all deals
    const dealsWithRankings = await Promise.all(
      dealResults.map(async (deal) => {
        // Get vote counts
        const voteCount = await getVoteCount(deal.id);

        // Prepare ranking input
        const rankingInput: RankingInput = {
          dealId: deal.id,
          upvotes: voteCount.upvotes,
          downvotes: voteCount.downvotes,
          createdAt: new Date(deal.created_at),
          aiQualityScore: deal.ai_quality_score ?? 50,
          categoryPopularity: 0, // TODO: Calculate category popularity
          discountPercentage: deal.discount_percentage,
        };

        // Calculate ranking
        const ranking = calculateDealRanking(rankingInput);

        return {
          ...deal,
          calculated_score: ranking.finalScore,
          ranking,
        };
      })
    );

    // Sort by final score (descending)
    dealsWithRankings.sort((a, b) => b.ranking.finalScore - a.ranking.finalScore);

    // Apply pagination
    const paginatedResults = dealsWithRankings.slice(offset, offset + limit);

    return paginatedResults;
  } catch (error) {
    console.error('Error fetching deals with enhanced ranking:', error);
    throw new Error('Failed to fetch deals with enhanced ranking');
  }
}

/**
 * Batch recalculate rankings for multiple deals
 * Optimized for background jobs
 *
 * @param dealIds - Array of deal UUIDs
 * @returns Array of updated rankings
 */
export async function batchRecalculateRankings(
  dealIds?: string[]
): Promise<RankingOutput[]> {
  try {
    // If no deal IDs provided, fetch all active deals
    let dealsToProcess = dealIds;

    if (!dealsToProcess) {
      const allDeals = await db
        .select({ id: deals.id })
        .from(deals)
        .where(eq(deals.archived, false));

      dealsToProcess = allDeals.map(d => d.id);
    }

    // Process deals in batches of 50 to avoid memory issues
    const BATCH_SIZE = 50;
    const results: RankingOutput[] = [];

    for (let i = 0; i < dealsToProcess.length; i += BATCH_SIZE) {
      const batchIds = dealsToProcess.slice(i, i + BATCH_SIZE);

      // Fetch batch data
      const batchDeals = await db
        .select({
          id: deals.id,
          created_at: deals.created_at,
          ai_quality_score: deals.ai_quality_score,
          discount_percentage: deals.discount_percentage,
        })
        .from(deals)
        .where(and(
          eq(deals.archived, false),
          sql`${deals.id} = ANY(${batchIds})`
        ));

      // Calculate rankings for batch
      const batchRankings = await Promise.all(
        batchDeals.map(async (deal) => {
          try {
            // Get vote counts
            const voteCount = await getVoteCount(deal.id);

            // Prepare ranking input
            const rankingInput: RankingInput = {
              dealId: deal.id,
              upvotes: voteCount.upvotes,
              downvotes: voteCount.downvotes,
              createdAt: new Date(deal.created_at),
              aiQualityScore: deal.ai_quality_score ?? 50,
              categoryPopularity: 0, // TODO: Calculate category popularity
              discountPercentage: deal.discount_percentage,
            };

            // Calculate ranking
            const ranking = calculateDealRanking(rankingInput);

            // Update database
            await db
              .update(deals)
              .set({
                score: ranking.finalScore,
                ranking_metadata: ranking.metadata,
              })
              .where(eq(deals.id, deal.id));

            // Clear cache
            clearRankingCache(deal.id);

            return ranking;
          } catch (error) {
            console.error(`Error processing deal ${deal.id} in batch:`, error);
            // Continue processing other deals even if one fails
            return null;
          }
        })
      );

      // Filter out failed rankings and add to results
      results.push(...batchRankings.filter((r): r is RankingOutput => r !== null));

      // Log progress
      console.log(`Processed ${Math.min(i + BATCH_SIZE, dealsToProcess.length)} / ${dealsToProcess.length} deals`);
    }

    return results;
  } catch (error) {
    console.error('Error in batch recalculate rankings:', error);
    throw new Error('Failed to batch recalculate rankings');
  }
}

/**
 * Recalculate all rankings for all active deals
 * Background job function for periodic ranking updates
 *
 * @returns Number of deals processed
 */
export async function recalculateAllRankings(): Promise<number> {
  try {
    console.log('Starting recalculation of all rankings...');

    const results = await batchRecalculateRankings();

    console.log(`Successfully recalculated rankings for ${results.length} deals`);

    return results.length;
  } catch (error) {
    console.error('Error recalculating all rankings:', error);
    throw new Error('Failed to recalculate all rankings');
  }
}
