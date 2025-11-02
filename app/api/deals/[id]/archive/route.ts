/**
 * Archive Deal API Route
 * POST /api/deals/[id]/archive - Manually archive a deal
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getDealById } from '@/lib/db/queries/deals';
import { archiveDeal } from '@/lib/archiving';
import { successResponse } from '@/lib/api/response';
import {
  handleApiError,
  NotFoundError,
  ValidationError,
} from '@/lib/api/error-handler';
import type { ArchiveReason } from '@/lib/types/deal';

/**
 * Request body validation schema
 */
const ArchiveRequestSchema = z.object({
  reason: z
    .enum(['expired', 'broken_link', 'low_quality', 'downvoted'])
    .optional()
    .describe('Optional reason for archiving'),
});

type ArchiveRequest = z.infer<typeof ArchiveRequestSchema>;

/**
 * Route parameters interface
 */
interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST /api/deals/[id]/archive
 *
 * Manually archive a deal with an optional reason
 *
 * Request body:
 * {
 *   reason?: 'expired' | 'broken_link' | 'low_quality' | 'downvoted'
 * }
 *
 * Response format:
 * {
 *   success: true,
 *   data: {
 *     deal: Deal,
 *     archivedAt: string,
 *     archiveReason: string
 *   }
 * }
 *
 * Error responses:
 * - 404: Deal not found
 * - 422: Validation error (already archived, invalid reason)
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    // TODO: Phase 4 - Add authentication check
    // const session = await getServerSession();
    // assertAuthenticated(session?.user);

    // TODO: Phase 4 - Add authorization check
    // Only admins or deal owners should be able to manually archive deals
    // assertAuthorized(
    //   session.user.role === 'admin' || deal.user_id === session.user.id,
    //   'Only administrators or deal owners can archive deals'
    // );

    // Fetch the deal
    const deal = await getDealById(id);

    if (!deal) {
      throw new NotFoundError('Deal');
    }

    // Check if deal is already archived
    if (deal.archived) {
      throw new ValidationError('Deal is already archived', {
        field: 'archived',
        value: true,
        dealId: id,
      });
    }

    // Parse and validate request body
    let archiveReason: ArchiveReason = 'low_quality'; // Default reason

    try {
      const body = await request.json();
      const validatedBody = ArchiveRequestSchema.parse(body);

      if (validatedBody.reason) {
        archiveReason = validatedBody.reason;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw error;
      }
      // If JSON parsing fails or body is empty, use default reason
      // This allows POST requests without a body
    }

    // Archive the deal
    await archiveDeal(id, archiveReason);

    // Fetch updated deal
    const updatedDeal = await getDealById(id);

    if (!updatedDeal) {
      throw new Error('Failed to fetch updated deal after archiving');
    }

    // Return success response
    return successResponse({
      deal: updatedDeal,
      archivedAt: updatedDeal.archived_at,
      archiveReason: updatedDeal.archive_reason,
    });
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, {
      route: `/api/deals/${id}/archive`,
      method: 'POST',
    });
  }
}
