/**
 * Voting API Route
 *
 * POST /api/votes - Create or toggle a vote
 *
 * Handles vote creation, removal, and updates with Reddit-style toggle behavior:
 * - If user hasn't voted: create vote
 * - If user voted same type: remove vote
 * - If user voted opposite: update to new type
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { handleApiError } from '@/lib/api/error-handler';
import { successResponse, HTTP_STATUS } from '@/lib/api/response';
import { validateRequest } from '@/lib/api/validation';
import {
  toggleVote,
  getVoteCount,
  getUserVote,
  VoteType,
  type VoteTypeValue
} from '@/lib/db/queries/votes';

/**
 * Vote request schema
 * Includes user_id temporarily (Phase 3) - will use auth session in Phase 4
 */
const createVoteSchema = z.object({
  deal_id: z.string().uuid('Invalid deal ID'),
  user_id: z.string().min(1, 'User ID is required'),
  vote_type: z.enum(['up', 'down'], {
    message: 'Vote type must be either "up" or "down"',
  }),
});

type CreateVoteInput = z.infer<typeof createVoteSchema>;
type VoteTypeString = 'up' | 'down';

/**
 * POST /api/votes
 *
 * Creates or toggles a vote on a deal
 *
 * @param request - Next.js request with body: { deal_id, user_id, vote_type }
 * @returns Vote counts and user's current vote status
 *
 * @example
 * POST /api/votes
 * Body: { "deal_id": "uuid", "user_id": "user123", "vote_type": "up" }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "voteCount": { "upvotes": 5, "downvotes": 2, "total": 3 },
 *     "userVote": "up"
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const body: CreateVoteInput = await validateRequest(request, createVoteSchema);
    const { deal_id, user_id, vote_type } = body;

    // Convert vote_type string to numeric VoteType enum
    const voteTypeValue: VoteTypeValue =
      vote_type === 'up' ? VoteType.UPVOTE : VoteType.DOWNVOTE;

    // Toggle vote (handles create/update/delete logic internally)
    // Returns null if vote was removed, vote object if created/updated
    await toggleVote(deal_id, user_id, voteTypeValue);

    // Get updated vote counts for the deal
    const voteCount = await getVoteCount(deal_id);

    // Get user's current vote status after toggle
    const userVote = await getUserVote(deal_id, user_id);

    // Convert numeric vote_type back to string for response
    const userVoteString: VoteTypeString | null = userVote
      ? (userVote.vote_type === VoteType.UPVOTE ? 'up' : 'down')
      : null;

    // Return standardized success response
    return successResponse(
      {
        voteCount,
        userVote: userVoteString,
      },
      HTTP_STATUS.OK
    );
  } catch (error) {
    // Handle all errors with centralized error handler
    return handleApiError(error, {
      endpoint: 'POST /api/votes',
      method: 'POST'
    });
  }
}
