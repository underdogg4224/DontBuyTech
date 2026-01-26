/**
 * Database queries index
 * Central export point for all database query functions
 */

// Deal queries
export {
  calculateDealScore,
  getTopDealsByCategory,
  getDealById,
  getDealsByCategory,
  getArchivedDeals,
  getTopDeals,
  updateDealScore,
  type DealQueryOptions,
} from './deals';

// Vote queries
export {
  getVoteCount,
  getUserVote,
  createVote,
  deleteVote,
  deleteUserVote,
  toggleVote,
  getVotesByDeal,
  VoteType,
  type VoteTypeValue,
  type VoteResult,
  type VoteCount,
} from './votes';

// Category queries
export {
  getAllCategories,
  getCategoryBySlug,
  getCategoryById,
  getCategoriesWithCounts,
  getTopCategories,
  getCategoryStatistics,
  categorySlugExists,
  categoryNameExists,
  type CategoryResult,
  type CategoryWithCount,
} from './categories';
