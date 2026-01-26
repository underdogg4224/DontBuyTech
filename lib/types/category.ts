/**
 * Category domain types
 * Represents product/deal categories
 */

/**
 * Core Category interface
 * Represents a deal category in the database
 */
export interface Category {
  /** Unique identifier (UUID) */
  id: string;
  /** Display name of the category */
  name: string;
  /** URL-friendly slug */
  slug: string;
  /** Category description */
  description: string | null;
  /** Icon name or identifier for UI display */
  icon: string | null;
  /** Timestamp when category was created */
  created_at?: Date | string;
}

/**
 * Category with statistics
 * Extended category interface including aggregated statistics
 */
export interface CategoryWithStats extends Category {
  /** Number of active deals in this category */
  deal_count: number;
  /** Number of active (non-expired, non-archived) deals */
  active_deal_count: number;
  /** Average score of deals in this category */
  average_score?: number;
  /** Total number of votes across all deals in category */
  total_votes?: number;
}

/**
 * Category creation input
 * Required fields for creating a new category
 */
export interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

/**
 * Category update input
 * Partial fields for updating an existing category
 */
export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  description?: string | null;
  icon?: string | null;
}

/**
 * Category filter options
 * Query parameters for filtering categories
 */
export interface CategoryFilterOptions {
  /** Search by name or slug */
  search?: string;
  /** Only return categories with active deals */
  has_active_deals?: boolean;
  /** Sort by field */
  sort_by?: 'name' | 'deal_count' | 'created_at';
  /** Sort order */
  sort_order?: 'asc' | 'desc';
}

/**
 * Popular categories
 * Categories sorted by activity/popularity
 */
export interface PopularCategory extends CategoryWithStats {
  /** Rank based on activity */
  rank: number;
  /** Trending score (based on recent activity) */
  trending_score?: number;
}
