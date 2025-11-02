/**
 * Restore Deal API Route
 * POST /api/deals/[id]/restore - Restore an archived deal
 */

import { NextRequest } from 'next/server';
import { getDealById } from '@/lib/db/queries/deals';
import { unarchiveDeal } from '@/lib/archiving';
import { successResponse } from '@/lib/api/response';
import {
  handleApiError,
  NotFoundError,
  ValidationError,
} from '@/lib/api/error-handler';

/**
 * Route parameters interface
 */
interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST /api/deals/[id]/restore
 *
 * Restore a previously archived deal
 *
 * No request body required
 *
 * Response format:
 * {
 *   success: true,
 *   data: {
 *     deal: Deal,
 *     restoredAt: string
 *   }
 * }
 *
 * Error responses:
 * - 404: Deal not found
 * - 422: Validation error (deal is not archived)
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
    // Only admins should be able to restore archived deals
    // assertAuthorized(
    //   session.user.role === 'admin',
    //   'Only administrators can restore archived deals'
    // );

    // Fetch the deal
    const deal = await getDealById(id);

    if (!deal) {
      throw new NotFoundError('Deal');
    }

    // Check if deal is actually archived
    if (!deal.archived) {
      throw new ValidationError('Deal is not archived', {
        field: 'archived',
        value: false,
        dealId: id,
        message: 'Cannot restore a deal that is not archived',
      });
    }

    // Restore the deal (unarchive)
    await unarchiveDeal(id);

    // Fetch updated deal
    const updatedDeal = await getDealById(id);

    if (!updatedDeal) {
      throw new Error('Failed to fetch updated deal after restoration');
    }

    // Return success response with restoration timestamp
    return successResponse({
      deal: updatedDeal,
      restoredAt: new Date().toISOString(),
    });
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, {
      route: `/api/deals/${id}/restore`,
      method: 'POST',
    });
  }
}
