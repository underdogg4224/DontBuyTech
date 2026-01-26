/**
 * Vote domain types
 * Represents user votes on deals (upvotes/downvotes)
 */

/**
 * Vote type enumeration
 * Represents the type of vote a user can cast
 */
export enum VoteType {
  /** Upvote (+1) */
  UPVOTE = 1,
  /** Downvote (-1) */
  DOWNVOTE = -1,
}

/**
 * Core Vote interface
 * Represents a user's vote on a deal
 */
export interface Vote {
  /** Unique identifier (UUID) */
  id: string;
  /** Deal ID (foreign key) */
  deal_id: string;
  /** User ID (foreign key to auth.users) */
  user_id: string;
  /** Vote type: 1 for upvote, -1 for downvote */
  vote_type: VoteType;
  /** Timestamp when vote was created */
  created_at: Date | string;
}

/**
 * Vote creation input
 * Required fields for creating a new vote
 */
export interface CreateVoteInput {
  deal_id: string;
  user_id: string;
  vote_type: VoteType;
}

/**
 * Vote update input
 * For changing an existing vote
 */
export interface UpdateVoteInput {
  vote_type: VoteType;
}

/**
 * Vote with deal information
 * Extended vote interface including deal details
 */
export interface VoteWithDeal extends Vote {
  deal: {
    id: string;
    title: string;
    price: number;
    score: number;
  };
}

/**
 * Vote aggregation
 * Summarized vote statistics for a deal
 */
export interface VoteAggregation {
  /** Deal ID */
  deal_id: string;
  /** Total number of upvotes */
  upvotes: number;
  /** Total number of downvotes */
  downvotes: number;
  /** Net score (upvotes - downvotes) */
  score: number;
  /** Total vote count */
  total_votes: number;
}

/**
 * User vote status
 * Represents the current user's vote on a deal
 */
export interface UserVoteStatus {
  /** Whether user has voted */
  has_voted: boolean;
  /** User's vote type if voted */
  vote_type: VoteType | null;
  /** Vote ID if exists */
  vote_id: string | null;
}
