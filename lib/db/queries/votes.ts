/**
 * Vote queries
 * Reusable database queries for voting functionality
 */

import { db } from '../index';
import { votes, deals } from '../schema';
import { eq, and, sql } from 'drizzle-orm';
import { recalculateDealRanking, clearRankingCache } from './deals';

/**
 * Vote type enum
 */
export const VoteType = {
  UPVOTE: 1,
  DOWNVOTE: -1,
} as const;

export type VoteTypeValue = typeof VoteType[keyof typeof VoteType];

/**
 * Vote result interface
 */
export interface VoteResult {
  id: string;
  deal_id: string;
  user_id: string;
  vote_type: number;
  created_at: Date;
}

/**
 * Vote count result interface
 */
export interface VoteCount {
  upvotes: number;
  downvotes: number;
  total: number;
}

/**
 * Get vote count for a deal
 * Returns upvotes, downvotes, and total
 *
 * @param dealId - Deal UUID
 * @returns Vote count statistics
 */
export async function getVoteCount(dealId: string): Promise<VoteCount> {
  try {
    const result = await db
      .select({
        upvotes: sql<number>`COUNT(CASE WHEN vote_type = 1 THEN 1 END)`,
        downvotes: sql<number>`COUNT(CASE WHEN vote_type = -1 THEN 1 END)`,
        total: sql<number>`SUM(vote_type)`,
      })
      .from(votes)
      .where(eq(votes.deal_id, dealId));

    const voteData = result[0];

    return {
      upvotes: Number(voteData?.upvotes || 0),
      downvotes: Number(voteData?.downvotes || 0),
      total: Number(voteData?.total || 0),
    };
  } catch (error) {
    console.error(`Error fetching vote count for deal ${dealId}:`, error);
    throw new Error(`Failed to get vote count for deal ${dealId}`);
  }
}

/**
 * Get a user's vote on a specific deal
 *
 * @param dealId - Deal UUID
 * @param userId - User ID
 * @returns User's vote or null if not voted
 */
export async function getUserVote(
  dealId: string,
  userId: string
): Promise<VoteResult | null> {
  try {
    const result = await db
      .select()
      .from(votes)
      .where(
        and(
          eq(votes.deal_id, dealId),
          eq(votes.user_id, userId)
        )
      )
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error(`Error fetching user vote for deal ${dealId}:`, error);
    throw new Error(`Failed to get user vote for deal ${dealId}`);
  }
}

/**
 * Create or update a vote
 * If user has already voted, updates the vote type
 * If user hasn't voted, creates a new vote
 * Also updates the deal's vote count
 *
 * @param dealId - Deal UUID
 * @param userId - User ID
 * @param voteType - Vote type (1 for upvote, -1 for downvote)
 * @returns Created or updated vote
 */
export async function createVote(
  dealId: string,
  userId: string,
  voteType: VoteTypeValue
): Promise<VoteResult> {
  try {
    // Validate vote type
    if (voteType !== VoteType.UPVOTE && voteType !== VoteType.DOWNVOTE) {
      throw new Error('Invalid vote type. Must be 1 (upvote) or -1 (downvote)');
    }

    // Check if user has already voted
    const existingVote = await getUserVote(dealId, userId);

    let result: VoteResult;

    if (existingVote) {
      // Update existing vote
      const updated = await db
        .update(votes)
        .set({ vote_type: voteType })
        .where(eq(votes.id, existingVote.id))
        .returning();

      result = updated[0];
    } else {
      // Create new vote
      const inserted = await db
        .insert(votes)
        .values({
          deal_id: dealId,
          user_id: userId,
          vote_type: voteType,
        })
        .returning();

      result = inserted[0];
    }

    // Update deal's vote count
    await updateDealVoteCount(dealId);

    return result;
  } catch (error) {
    console.error(`Error creating/updating vote for deal ${dealId}:`, error);
    throw new Error(`Failed to create/update vote for deal ${dealId}`);
  }
}

/**
 * Delete a vote
 * Removes user's vote from a deal and updates vote count
 *
 * @param voteId - Vote UUID
 * @returns True if deleted successfully
 */
export async function deleteVote(voteId: string): Promise<boolean> {
  try {
    // First, get the vote to know which deal to update
    const voteResult = await db
      .select()
      .from(votes)
      .where(eq(votes.id, voteId))
      .limit(1);

    const vote = voteResult[0];

    if (!vote) {
      throw new Error(`Vote ${voteId} not found`);
    }

    // Delete the vote
    await db
      .delete(votes)
      .where(eq(votes.id, voteId));

    // Update deal's vote count
    await updateDealVoteCount(vote.deal_id);

    return true;
  } catch (error) {
    console.error(`Error deleting vote ${voteId}:`, error);
    throw new Error(`Failed to delete vote ${voteId}`);
  }
}

/**
 * Delete a user's vote on a specific deal
 * Convenience method for removing vote by deal and user
 *
 * @param dealId - Deal UUID
 * @param userId - User ID
 * @returns True if deleted successfully
 */
export async function deleteUserVote(
  dealId: string,
  userId: string
): Promise<boolean> {
  try {
    const vote = await getUserVote(dealId, userId);

    if (!vote) {
      throw new Error(`User ${userId} has not voted on deal ${dealId}`);
    }

    return await deleteVote(vote.id);
  } catch (error) {
    console.error(`Error deleting user vote for deal ${dealId}:`, error);
    throw new Error(`Failed to delete user vote for deal ${dealId}`);
  }
}

/**
 * Toggle vote for a user on a deal
 * If user hasn't voted, creates vote
 * If user has voted with same type, removes vote
 * If user has voted with different type, updates vote
 *
 * @param dealId - Deal UUID
 * @param userId - User ID
 * @param voteType - Vote type (1 for upvote, -1 for downvote)
 * @returns Vote result or null if vote was removed
 */
export async function toggleVote(
  dealId: string,
  userId: string,
  voteType: VoteTypeValue
): Promise<VoteResult | null> {
  try {
    const existingVote = await getUserVote(dealId, userId);

    if (!existingVote) {
      // No existing vote, create new one
      return await createVote(dealId, userId, voteType);
    }

    if (existingVote.vote_type === voteType) {
      // Same vote type, remove vote
      await deleteVote(existingVote.id);
      return null;
    }

    // Different vote type, update vote
    return await createVote(dealId, userId, voteType);
  } catch (error) {
    console.error(`Error toggling vote for deal ${dealId}:`, error);
    throw new Error(`Failed to toggle vote for deal ${dealId}`);
  }
}

/**
 * Get all votes for a deal
 * Useful for displaying who voted on a deal
 *
 * @param dealId - Deal UUID
 * @returns Array of all votes for the deal
 */
export async function getVotesByDeal(dealId: string): Promise<VoteResult[]> {
  try {
    const results = await db
      .select()
      .from(votes)
      .where(eq(votes.deal_id, dealId));

    return results;
  } catch (error) {
    console.error(`Error fetching votes for deal ${dealId}:`, error);
    throw new Error(`Failed to get votes for deal ${dealId}`);
  }
}

/**
 * Update deal's vote count
 * Internal helper to synchronize vote count on deals table
 * Also triggers enhanced ranking recalculation
 *
 * @param dealId - Deal UUID
 */
async function updateDealVoteCount(dealId: string): Promise<void> {
  try {
    const voteCount = await getVoteCount(dealId);

    await db
      .update(deals)
      .set({ votes_count: voteCount.total })
      .where(eq(deals.id, dealId));

    // Clear cache and trigger ranking recalculation
    // This happens asynchronously to not block vote operations
    clearRankingCache(dealId);

    // Recalculate ranking in background (don't await to avoid blocking)
    recalculateDealRanking(dealId).catch(error => {
      console.error(`Background ranking recalculation failed for deal ${dealId}:`, error);
      // Non-critical error, don't throw
    });
  } catch (error) {
    console.error(`Error updating vote count for deal ${dealId}:`, error);
    throw new Error(`Failed to update vote count for deal ${dealId}`);
  }
}
