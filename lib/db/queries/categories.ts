/**
 * Category queries
 * Reusable database queries for category functionality
 */

import { db } from '../index';
import { categories, deals } from '../schema';
import { eq, sql, desc } from 'drizzle-orm';

/**
 * Category result interface
 */
export interface CategoryResult {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  created_at: Date;
}

/**
 * Category with deal count
 */
export interface CategoryWithCount extends CategoryResult {
  deal_count: number;
  active_deal_count: number;
}

/**
 * Get all categories
 * Returns all categories sorted alphabetically by name
 *
 * @returns Array of all categories
 */
export async function getAllCategories(): Promise<CategoryResult[]> {
  try {
    const results = await db
      .select()
      .from(categories)
      .orderBy(categories.name);

    return results;
  } catch (error) {
    console.error('Error fetching all categories:', error);
    throw new Error('Failed to fetch categories');
  }
}

/**
 * Get a category by slug
 *
 * @param slug - Category slug (URL-friendly identifier)
 * @returns Category object or null if not found
 */
export async function getCategoryBySlug(slug: string): Promise<CategoryResult | null> {
  try {
    const result = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error(`Error fetching category by slug ${slug}:`, error);
    throw new Error(`Failed to fetch category with slug ${slug}`);
  }
}

/**
 * Get a category by ID
 *
 * @param id - Category UUID
 * @returns Category object or null if not found
 */
export async function getCategoryById(id: string): Promise<CategoryResult | null> {
  try {
    const result = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error(`Error fetching category by id ${id}:`, error);
    throw new Error(`Failed to fetch category with id ${id}`);
  }
}

/**
 * Get all categories with deal counts
 * Useful for displaying category lists with activity indicators
 *
 * @returns Array of categories with deal counts
 */
export async function getCategoriesWithCounts(): Promise<CategoryWithCount[]> {
  try {
    const results = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        icon: categories.icon,
        created_at: categories.created_at,
        deal_count: sql<number>`COUNT(${deals.id})`,
        active_deal_count: sql<number>`COUNT(CASE WHEN ${deals.archived} = false THEN 1 END)`,
      })
      .from(categories)
      .leftJoin(deals, eq(deals.category_id, categories.id))
      .groupBy(categories.id)
      .orderBy(categories.name);

    return results.map(result => ({
      ...result,
      deal_count: Number(result.deal_count),
      active_deal_count: Number(result.active_deal_count),
    }));
  } catch (error) {
    console.error('Error fetching categories with counts:', error);
    throw new Error('Failed to fetch categories with deal counts');
  }
}

/**
 * Get top categories by active deal count
 * Useful for homepage "popular categories" section
 *
 * @param limit - Number of categories to return (default: 10)
 * @returns Array of categories sorted by active deal count
 */
export async function getTopCategories(limit: number = 10): Promise<CategoryWithCount[]> {
  try {
    const results = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        icon: categories.icon,
        created_at: categories.created_at,
        deal_count: sql<number>`COUNT(${deals.id})`,
        active_deal_count: sql<number>`COUNT(CASE WHEN ${deals.archived} = false THEN 1 END)`,
      })
      .from(categories)
      .leftJoin(deals, eq(deals.category_id, categories.id))
      .groupBy(categories.id)
      .orderBy(desc(sql`COUNT(CASE WHEN ${deals.archived} = false THEN 1 END)`))
      .limit(limit);

    return results.map(result => ({
      ...result,
      deal_count: Number(result.deal_count),
      active_deal_count: Number(result.active_deal_count),
    }));
  } catch (error) {
    console.error('Error fetching top categories:', error);
    throw new Error('Failed to fetch top categories');
  }
}

/**
 * Get category deal statistics
 * Returns detailed statistics for a single category
 *
 * @param categoryId - Category UUID
 * @returns Statistics object or null if category not found
 */
export async function getCategoryStatistics(categoryId: string) {
  try {
    const result = await db
      .select({
        category_id: categories.id,
        category_name: categories.name,
        total_deals: sql<number>`COUNT(${deals.id})`,
        active_deals: sql<number>`COUNT(CASE WHEN ${deals.archived} = false THEN 1 END)`,
        archived_deals: sql<number>`COUNT(CASE WHEN ${deals.archived} = true THEN 1 END)`,
        avg_price: sql<number>`AVG(${deals.price})`,
        min_price: sql<number>`MIN(${deals.price})`,
        max_price: sql<number>`MAX(${deals.price})`,
        total_votes: sql<number>`SUM(${deals.votes_count})`,
      })
      .from(categories)
      .leftJoin(deals, eq(deals.category_id, categories.id))
      .where(eq(categories.id, categoryId))
      .groupBy(categories.id)
      .limit(1);

    if (!result[0]) {
      return null;
    }

    const stats = result[0];

    return {
      category_id: stats.category_id,
      category_name: stats.category_name,
      total_deals: Number(stats.total_deals),
      active_deals: Number(stats.active_deals),
      archived_deals: Number(stats.archived_deals),
      avg_price: stats.avg_price ? parseFloat(String(stats.avg_price)) : 0,
      min_price: stats.min_price ? parseFloat(String(stats.min_price)) : 0,
      max_price: stats.max_price ? parseFloat(String(stats.max_price)) : 0,
      total_votes: Number(stats.total_votes || 0),
    };
  } catch (error) {
    console.error(`Error fetching category statistics for ${categoryId}:`, error);
    throw new Error(`Failed to fetch statistics for category ${categoryId}`);
  }
}

/**
 * Check if a category slug exists
 * Useful for validation when creating/updating categories
 *
 * @param slug - Category slug to check
 * @returns True if slug exists, false otherwise
 */
export async function categorySlugExists(slug: string): Promise<boolean> {
  try {
    const result = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);

    return result.length > 0;
  } catch (error) {
    console.error(`Error checking if category slug ${slug} exists:`, error);
    throw new Error(`Failed to check category slug ${slug}`);
  }
}

/**
 * Check if a category name exists
 * Useful for validation when creating/updating categories
 *
 * @param name - Category name to check
 * @returns True if name exists, false otherwise
 */
export async function categoryNameExists(name: string): Promise<boolean> {
  try {
    const result = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.name, name))
      .limit(1);

    return result.length > 0;
  } catch (error) {
    console.error(`Error checking if category name ${name} exists:`, error);
    throw new Error(`Failed to check category name ${name}`);
  }
}
