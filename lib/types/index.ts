/**
 * Type definitions index
 * Central export point for all application types
 */

// Deal types
export type {
  Deal,
  DealWithVotes,
  CreateDealInput,
  UpdateDealInput,
  DealFilterOptions,
  PaginatedDeals,
  DealCategory,
} from './deal';

export { DealStatus } from './deal';

// Vote types
export type {
  Vote,
  CreateVoteInput,
  UpdateVoteInput,
  VoteWithDeal,
  VoteAggregation,
  UserVoteStatus,
} from './vote';

export { VoteType } from './vote';

// Category types
export type {
  Category,
  CategoryWithStats,
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoryFilterOptions,
  PopularCategory,
} from './category';

// Database types
export type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
  QueryResult,
  MutationResult,
  PaginationMeta,
  PaginatedResponse,
  SortOptions,
  Filter,
  FilterOperator,
  QueryOptions,
  DatabaseError,
  TransactionCallback,
  AuditFields,
  SoftDeleteFields,
} from './database';

export { DatabaseErrorCode } from './database';
