/**
 * Deal queries
 * Reusable database queries for deals with ranking algorithm
 */

import { db } from '../index';
import { deals } from '../schema';
import { eq, desc, asc, and, sql, SQL } from 'drizzle-orm';

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
 * @returns Array of top-ranked deals with calculated score
 */
export async function getTopDealsByCategory(
  categoryId: string,
  limit: number = 10
) {
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
  options: DealQueryOptions = {}
) {
  try {
    const {
      limit = 20,
      offset = 0,
      sortBy = 'score',
      sortOrder = 'desc',
    } = options;

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
 * Update deal score in database
 * Should be called after vote changes
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
