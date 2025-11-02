/**
 * Database types and helpers
 * Type definitions for database tables and query helpers
 */

import { Deal } from './deal';
import { Vote } from './vote';
import { Category } from './category';

/**
 * Database table definitions
 * Maps table names to their row types
 */
export interface Database {
  public: {
    Tables: {
      deals: {
        Row: Deal;
        Insert: Omit<Deal, 'id' | 'score' | 'votes_count' | 'created_at' | 'archived'> & {
          id?: string;
          score?: number;
          votes_count?: number;
          created_at?: Date | string;
          archived?: boolean;
        };
        Update: Partial<Omit<Deal, 'id' | 'created_at'>>;
      };
      votes: {
        Row: Vote;
        Insert: Omit<Vote, 'id' | 'created_at'> & {
          id?: string;
          created_at?: Date | string;
        };
        Update: Partial<Omit<Vote, 'id' | 'deal_id' | 'user_id' | 'created_at'>>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at'> & {
          id?: string;
          created_at?: Date | string;
        };
        Update: Partial<Omit<Category, 'id' | 'created_at'>>;
      };
    };
    Views: {
      // Add views here if needed
    };
    Functions: {
      // Add custom database functions here
      search_deals?: {
        Args: {
          query_text: string;
          match_threshold?: number;
          match_count?: number;
        };
        Returns: Deal[];
      };
    };
    Enums: {
      // Add enums here if using PostgreSQL enums
    };
  };
}

/**
 * Helper type to extract table row type
 */
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

/**
 * Helper type to extract table insert type
 */
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

/**
 * Helper type to extract table update type
 */
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

/**
 * Generic query result type
 */
export interface QueryResult<T> {
  data: T | null;
  error: Error | null;
}

/**
 * Generic mutation result type
 */
export interface MutationResult<T> {
  data: T | null;
  error: Error | null;
  success: boolean;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  /** Current page (1-indexed) */
  page: number;
  /** Items per page */
  limit: number;
  /** Total number of items */
  total: number;
  /** Total number of pages */
  total_pages: number;
  /** Whether there's a next page */
  has_next: boolean;
  /** Whether there's a previous page */
  has_prev: boolean;
}

/**
 * Generic paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Sort options type
 */
export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}

/**
 * Filter operator types
 */
export type FilterOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'like'
  | 'ilike'
  | 'is'
  | 'not';

/**
 * Generic filter type
 */
export interface Filter {
  field: string;
  operator: FilterOperator;
  value: unknown;
}

/**
 * Query options
 */
export interface QueryOptions {
  filters?: Filter[];
  sort?: SortOptions;
  limit?: number;
  offset?: number;
}

/**
 * Database error types
 */
export enum DatabaseErrorCode {
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE = 'DUPLICATE',
  FOREIGN_KEY_VIOLATION = 'FOREIGN_KEY_VIOLATION',
  CONSTRAINT_VIOLATION = 'CONSTRAINT_VIOLATION',
  UNAUTHORIZED = 'UNAUTHORIZED',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Database error
 */
export interface DatabaseError extends Error {
  code: DatabaseErrorCode;
  details?: Record<string, unknown>;
}

/**
 * Transaction callback type
 */
export type TransactionCallback<T> = () => Promise<T>;

/**
 * Audit fields
 * Common fields for tracking record changes
 */
export interface AuditFields {
  created_at: Date | string;
  updated_at?: Date | string;
  created_by?: string;
  updated_by?: string;
}

/**
 * Soft delete fields
 */
export interface SoftDeleteFields {
  deleted_at?: Date | string | null;
  deleted_by?: string | null;
}
