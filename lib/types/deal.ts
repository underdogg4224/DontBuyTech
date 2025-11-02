/**
 * Deal domain types
 * Represents deals/products posted by users
 */

/**
 * Deal status enumeration
 */
export enum DealStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  ARCHIVED = 'archived',
}

/**
 * Deal category types
 * Based on common e-commerce categories
 */
export type DealCategory =
  | 'electronics'
  | 'clothing'
  | 'home'
  | 'sports'
  | 'books'
  | 'toys'
  | 'food'
  | 'beauty'
  | 'automotive'
  | 'health'
  | 'other';

/**
 * Archive reason enumeration
 */
export type ArchiveReason = 'expired' | 'broken_link' | 'low_quality' | 'downvoted';

/**
 * Ranking metadata structure
 * Stores detailed ranking calculation factors
 */
export interface RankingMetadata {
  /** AI quality score component */
  ai_quality_component?: number;
  /** Recency score component */
  recency_component?: number;
  /** Popularity score component */
  popularity_component?: number;
  /** Final calculated rank */
  final_rank?: number;
  /** Timestamp when ranking was calculated */
  calculated_at?: string;
  /** Additional debug information */
  [key: string]: any;
}

/**
 * Core Deal interface
 * Represents a deal/product in the database
 */
export interface Deal {
  /** Unique identifier (UUID) */
  id: string;
  /** Deal title */
  title: string;
  /** Detailed description of the deal */
  description: string;
  /** Current price */
  price: number;
  /** Original price before discount */
  original_price: number | null;
  /** Discount percentage (0-100) */
  discount_percentage: number | null;
  /** URL to the deal/product page */
  url: string;
  /** URL to the product image */
  image_url: string | null;
  /** Category ID (foreign key) */
  category_id: string;
  /** Brand name */
  brand: string | null;
  /** Calculated score based on votes (can be negative) */
  score: number;
  /** Total number of votes (upvotes + downvotes) */
  votes_count: number;
  /** Timestamp when deal was created */
  created_at: Date | string;
  /** Timestamp when deal expires (nullable) */
  expires_at: Date | string | null;
  /** Whether the deal is archived */
  archived: boolean;
  /** Vector embedding for semantic search (pgvector) */
  embedding: number[] | null;

  // Phase 2: AI Features
  /** AI-generated summary of the deal */
  summary: string | null;
  /** AI quality assessment score (0-100) */
  ai_quality_score: number | null;
  /** Timestamp when AI summary was generated */
  summarized_at: Date | string | null;
  /** Timestamp when deal was archived */
  archived_at: Date | string | null;
  /** Reason for archiving the deal */
  archive_reason: ArchiveReason | null;
  /** Detailed ranking calculation metadata */
  ranking_metadata: RankingMetadata | null;
}

/**
 * Deal with vote information
 * Extended deal interface including aggregated vote data and user-specific vote status
 */
export interface DealWithVotes extends Deal {
  /** Number of upvotes */
  upvotes: number;
  /** Number of downvotes */
  downvotes: number;
  /** Current user's vote type (1 for upvote, -1 for downvote, null if not voted) */
  user_vote: 1 | -1 | null;
  /** Category details */
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

/**
 * Deal creation input
 * Required fields for creating a new deal
 */
export interface CreateDealInput {
  title: string;
  description: string;
  price: number;
  original_price?: number;
  url: string;
  image_url?: string;
  category_id: string;
  brand?: string;
  expires_at?: Date | string;
}

/**
 * Deal update input
 * Partial fields for updating an existing deal
 */
export interface UpdateDealInput {
  title?: string;
  description?: string;
  price?: number;
  original_price?: number;
  url?: string;
  image_url?: string;
  category_id?: string;
  brand?: string;
  expires_at?: Date | string | null;
  archived?: boolean;
}

/**
 * Deal filter options
 * Query parameters for filtering deals
 */
export interface DealFilterOptions {
  /** Filter by category ID */
  category_id?: string;
  /** Filter by minimum score */
  min_score?: number;
  /** Filter by status */
  status?: DealStatus;
  /** Search query for semantic search */
  search?: string;
  /** Sort field */
  sort_by?: 'score' | 'created_at' | 'price' | 'discount_percentage';
  /** Sort order */
  sort_order?: 'asc' | 'desc';
  /** Pagination: page number (1-indexed) */
  page?: number;
  /** Pagination: items per page */
  limit?: number;
}

/**
 * Paginated deal response
 */
export interface PaginatedDeals {
  deals: DealWithVotes[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
