/**
 * AI Summarization API - Batch Processing
 * POST /api/ai/summarize/batch
 *
 * Generates AI summaries and quality scores for multiple deals concurrently
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { deals } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { anthropicClient, handleAnthropicError } from '@/lib/ai/client';
import { AI_CONFIG } from '@/lib/ai/config';
import { enforceRateLimit, checkRateLimit } from '@/lib/ai/rate-limiter';
import { AIError, AIErrorCode } from '@/lib/ai/types';
import {
  DEAL_SUMMARIZATION_SYSTEM_PROMPT,
  buildDealSummarizationMessages,
  validateDealSummaryResponse,
  type DealPromptInput,
} from '@/lib/ai/prompts/summarize-deal';
import {
  successResponse,
  errorResponse,
  HTTP_STATUS,
} from '@/lib/api/response';
import {
  handleApiError,
  ValidationError,
} from '@/lib/api/error-handler';

/**
 * Maximum number of deals to process in a single batch
 */
const MAX_BATCH_SIZE = 10;

/**
 * Maximum concurrent requests to Claude API
 */
const MAX_CONCURRENCY = 10;

/**
 * Request body schema using Zod
 */
const BatchSummarizeRequestSchema = z.object({
  dealIds: z
    .array(z.string().uuid('Each deal ID must be a valid UUID'))
    .min(1, 'At least one deal ID is required')
    .max(MAX_BATCH_SIZE, `Maximum ${MAX_BATCH_SIZE} deals per batch`),
});

/**
 * Individual deal result (success or failure)
 */
interface DealSummaryResult {
  dealId: string;
  success: boolean;
  summary?: string;
  aiQualityScore?: number;
  tags?: string[];
  priceDropSignificance?: 'high' | 'medium' | 'low' | 'none';
  scoreBreakdown?: {
    authenticityScore: number;
    priceDropScore: number;
    relevanceScore: number;
    descriptionQualityScore: number;
  };
  reasoning?: string;
  summarizedAt?: string;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Batch response structure
 */
interface BatchSummarizeResponse {
  total: number;
  successful: number;
  failed: number;
  results: DealSummaryResult[];
}

/**
 * Get client IP address from request headers
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIp) {
    return realIp;
  }
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  return 'anonymous';
}

/**
 * Simple concurrency limiter (lightweight alternative to p-limit)
 */
class ConcurrencyLimiter {
  private running = 0;
  private queue: Array<() => void> = [];

  constructor(private limit: number) {}

  async run<T>(fn: () => Promise<T>): Promise<T> {
    while (this.running >= this.limit) {
      await new Promise<void>((resolve) => this.queue.push(resolve));
    }

    this.running++;
    try {
      return await fn();
    } finally {
      this.running--;
      const next = this.queue.shift();
      if (next) next();
    }
  }
}

/**
 * Summarizes a single deal
 */
async function summarizeDeal(
  deal: {
    id: string;
    title: string;
    description: string;
    price: string;
    original_price: string | null;
    discount_percentage: number | null;
    brand: string | null;
  },
  clientIp: string
): Promise<DealSummaryResult> {
  try {
    // Build prompt input
    const promptInput: DealPromptInput = {
      title: deal.title,
      description: deal.description,
      price: parseFloat(deal.price),
      originalPrice: deal.original_price
        ? parseFloat(deal.original_price)
        : undefined,
      discountPercentage: deal.discount_percentage ?? undefined,
      brand: deal.brand ?? undefined,
    };

    // Call Claude API
    const messages = buildDealSummarizationMessages(promptInput);
    const aiResponse = await anthropicClient.messages.create({
      model: AI_CONFIG.model,
      max_tokens: AI_CONFIG.maxTokens,
      system: DEAL_SUMMARIZATION_SYSTEM_PROMPT,
      messages,
    });

    // Extract text content from response
    const textContent = aiResponse.content.find(
      (block) => block.type === 'text'
    );

    if (!textContent || textContent.type !== 'text') {
      throw new AIError(
        'AI response did not contain text content',
        AIErrorCode.API_ERROR,
        true
      );
    }

    // Validate and parse AI response
    const validation = validateDealSummaryResponse(textContent.text);

    if (!validation.valid || !validation.data) {
      console.error(
        `[Deal ${deal.id}] AI response validation failed:`,
        validation.error
      );
      throw new AIError(
        `AI response validation failed: ${validation.error}`,
        AIErrorCode.INVALID_REQUEST,
        true
      );
    }

    const summaryData = validation.data;

    // Update deal in database
    const now = new Date();
    await db
      .update(deals)
      .set({
        summary: summaryData.summary,
        ai_quality_score: summaryData.qualityScore,
        summarized_at: now,
      })
      .where(eq(deals.id, deal.id));

    // Log success
    console.log(`[AI Batch Summarization] Success for deal ${deal.id}`, {
      qualityScore: summaryData.qualityScore,
      inputTokens: aiResponse.usage.input_tokens,
      outputTokens: aiResponse.usage.output_tokens,
    });

    return {
      dealId: deal.id,
      success: true,
      summary: summaryData.summary,
      aiQualityScore: summaryData.qualityScore,
      tags: summaryData.tags,
      priceDropSignificance: summaryData.priceDropSignificance,
      scoreBreakdown: summaryData.scoreBreakdown,
      reasoning: summaryData.reasoning,
      summarizedAt: now.toISOString(),
    };
  } catch (error) {
    // Log error
    console.error(`[AI Batch Summarization] Failed for deal ${deal.id}:`, error);

    // Handle AI errors gracefully
    const aiError =
      error instanceof AIError ? error : handleAnthropicError(error);

    return {
      dealId: deal.id,
      success: false,
      error: {
        code: aiError.code,
        message: aiError.message,
      },
    };
  }
}

/**
 * POST /api/ai/summarize/batch
 *
 * Request body:
 * {
 *   "dealIds": ["uuid1", "uuid2", ...]
 * }
 *
 * Response format:
 * {
 *   "success": true,
 *   "data": {
 *     "total": 5,
 *     "successful": 4,
 *     "failed": 1,
 *     "results": [
 *       {
 *         "dealId": "uuid",
 *         "success": true,
 *         "summary": "...",
 *         "aiQualityScore": 85,
 *         ...
 *       },
 *       {
 *         "dealId": "uuid2",
 *         "success": false,
 *         "error": {
 *           "code": "RATE_LIMIT_EXCEEDED",
 *           "message": "..."
 *         }
 *       }
 *     ]
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIp = getClientIp(request);

    // Parse and validate request body
    const body = await request.json().catch(() => {
      throw new ValidationError('Invalid JSON in request body');
    });

    const validationResult = BatchSummarizeRequestSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationError('Invalid request parameters', {
        errors: validationResult.error.format(),
      });
    }

    const { dealIds } = validationResult.data;

    // Check rate limit (batch requests cost more - 1 token per deal)
    const rateCheck = checkRateLimit(clientIp, dealIds.length);
    if (!rateCheck.allowed) {
      return errorResponse(
        `Rate limit would be exceeded. You have ${rateCheck.remaining} requests remaining. This batch requires ${dealIds.length} requests.`,
        HTTP_STATUS.TOO_MANY_REQUESTS,
        AIErrorCode.RATE_LIMIT_EXCEEDED,
        {
          remaining: rateCheck.remaining,
          required: dealIds.length,
          resetTime: rateCheck.resetTime,
        }
      );
    }

    // Consume rate limit tokens
    enforceRateLimit(clientIp, dealIds.length);

    // Fetch deals from database
    const dealsData = await db
      .select({
        id: deals.id,
        title: deals.title,
        description: deals.description,
        price: deals.price,
        original_price: deals.original_price,
        discount_percentage: deals.discount_percentage,
        brand: deals.brand,
        archived: deals.archived,
      })
      .from(deals)
      .where(inArray(deals.id, dealIds));

    // Filter out archived deals
    const activeDeals = dealsData.filter((deal) => !deal.archived);

    // Check for missing deals
    const foundIds = new Set(activeDeals.map((d) => d.id));
    const missingIds = dealIds.filter((id) => !foundIds.has(id));

    // Create error results for missing/archived deals
    const errorResults: DealSummaryResult[] = missingIds.map((id) => ({
      dealId: id,
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Deal not found or is archived',
      },
    }));

    // Process deals concurrently with rate limiting
    const limiter = new ConcurrencyLimiter(MAX_CONCURRENCY);
    const summaryPromises = activeDeals.map((deal) =>
      limiter.run(() => summarizeDeal(deal, clientIp))
    );

    // Wait for all summarizations to complete
    const summaryResults = await Promise.all(summaryPromises);

    // Combine results
    const allResults = [...summaryResults, ...errorResults];

    // Calculate statistics
    const successful = allResults.filter((r) => r.success).length;
    const failed = allResults.length - successful;

    // Log batch completion
    console.log('[AI Batch Summarization] Batch completed', {
      total: allResults.length,
      successful,
      failed,
      clientIp,
    });

    // Build response
    const response: BatchSummarizeResponse = {
      total: allResults.length,
      successful,
      failed,
      results: allResults,
    };

    return successResponse(response);
  } catch (error) {
    // Check for missing API key
    if (
      error instanceof AIError &&
      error.code === AIErrorCode.MISSING_API_KEY
    ) {
      return errorResponse(
        'AI service is not configured. Please contact the administrator to set up the ANTHROPIC_API_KEY environment variable.',
        HTTP_STATUS.SERVICE_UNAVAILABLE,
        'AI_SERVICE_NOT_CONFIGURED',
        {
          hint: 'Set ANTHROPIC_API_KEY in your environment variables',
        }
      );
    }

    // Handle AI-specific errors
    if (error instanceof AIError) {
      const statusCode =
        error.code === AIErrorCode.RATE_LIMIT_EXCEEDED
          ? HTTP_STATUS.TOO_MANY_REQUESTS
          : error.code === AIErrorCode.MISSING_API_KEY ||
            error.code === AIErrorCode.INVALID_API_KEY
          ? HTTP_STATUS.SERVICE_UNAVAILABLE
          : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      return errorResponse(error.message, statusCode, error.code, {
        retryable: error.retryable,
      });
    }

    return handleApiError(error, {
      route: '/api/ai/summarize/batch',
      method: 'POST',
    });
  }
}
