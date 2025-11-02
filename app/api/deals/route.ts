/**
 * Deals API Route
 * GET /api/deals - Query deals with filtering, pagination, and sorting
 */

import { NextRequest } from 'next/server';
import {
  getTopDeals,
  getDealsByCategory,
  getArchivedDeals,
  DealQueryOptions
} from '@/lib/db/queries/deals';
import { getCategoryBySlug } from '@/lib/db/queries/categories';
import { successResponse } from '@/lib/api/response';
import { handleApiError, ValidationError } from '@/lib/api/error-handler';

/**
 * Query parameter interface
 */
interface DealsQueryParams {
  category?: string;
  archived?: string;
  limit?: string;
  offset?: string;
  sort?: string;
}

/**
 * Parse and validate query parameters
 */
function parseQueryParams(searchParams: URLSearchParams): {
  category?: string;
  archived: boolean;
  limit: number;
  offset: number;
  sort: 'score' | 'created_at' | 'price';
} {
  // Get query parameters
  const category = searchParams.get('category') || undefined;
  const archivedParam = searchParams.get('archived');
  const limitParam = searchParams.get('limit');
  const offsetParam = searchParams.get('offset');
  const sortParam = searchParams.get('sort');

  // Parse archived parameter
  const archived = archivedParam === 'true';

  // Parse and validate limit
  let limit = 10; // default
  if (limitParam) {
    const parsedLimit = parseInt(limitParam, 10);
    if (isNaN(parsedLimit) || parsedLimit < 1) {
      throw new ValidationError('Limit must be a positive integer', {
        field: 'limit',
        value: limitParam,
      });
    }
    if (parsedLimit > 100) {
      throw new ValidationError('Limit cannot exceed 100', {
        field: 'limit',
        value: parsedLimit,
      });
    }
    limit = parsedLimit;
  }

  // Parse and validate offset
  let offset = 0; // default
  if (offsetParam) {
    const parsedOffset = parseInt(offsetParam, 10);
    if (isNaN(parsedOffset) || parsedOffset < 0) {
      throw new ValidationError('Offset must be a non-negative integer', {
        field: 'offset',
        value: offsetParam,
      });
    }
    offset = parsedOffset;
  }

  // Parse and validate sort parameter
  let sort: 'score' | 'created_at' | 'price' = 'score'; // default
  if (sortParam) {
    if (!['score', 'created_at', 'price'].includes(sortParam)) {
      throw new ValidationError(
        'Sort must be one of: score, created_at, price',
        {
          field: 'sort',
          value: sortParam,
          allowed: ['score', 'created_at', 'price'],
        }
      );
    }
    sort = sortParam as 'score' | 'created_at' | 'price';
  }

  return {
    category,
    archived,
    limit,
    offset,
    sort,
  };
}

/**
 * GET /api/deals
 *
 * Query parameters:
 * - category (string): Filter by category slug
 * - archived (boolean): Show archived deals (default: false)
 * - limit (number): Number of deals to return (default: 10, max: 100)
 * - offset (number): Pagination offset (default: 0)
 * - sort (string): Sort by 'score', 'created_at', or 'price' (default: 'score')
 *
 * Response format:
 * {
 *   success: true,
 *   data: {
 *     deals: DealWithVotes[],
 *     pagination: {
 *       limit: number,
 *       offset: number,
 *       total: number
 *     }
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const { category, archived, limit, offset, sort } = parseQueryParams(searchParams);

    // Build query options
    const queryOptions: DealQueryOptions = {
      limit,
      offset,
      sortBy: sort,
      sortOrder: 'desc', // Always descending for initial implementation
    };

    let deals;
    let categoryId: string | undefined;

    // Handle different query scenarios
    if (archived) {
      // Query archived deals
      deals = await getArchivedDeals(queryOptions);
    } else if (category) {
      // Query deals by category slug
      // First, resolve category slug to ID
      const categoryData = await getCategoryBySlug(category);

      if (!categoryData) {
        throw new ValidationError(`Category '${category}' not found`, {
          field: 'category',
          value: category,
        });
      }

      categoryId = categoryData.id;
      deals = await getDealsByCategory(categoryId, queryOptions);
    } else {
      // Query all active deals
      deals = await getTopDeals(limit);

      // Apply offset manually for top deals (since getTopDeals doesn't support offset)
      if (offset > 0) {
        deals = deals.slice(offset);
      }
    }

    // Get total count for pagination
    // Note: In a production app, you'd want to run a separate COUNT query
    // For now, we'll return the number of results we got
    const total = deals.length;

    // Return standardized response
    return successResponse({
      deals,
      pagination: {
        limit,
        offset,
        total,
      },
    });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/deals',
      method: 'GET',
    });
  }
}
