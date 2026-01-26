/**
 * AI Summarization API - Single Deal
 * POST /api/ai/summarize
 *
 * Generates an AI summary and quality score for a single deal
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { deals } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { anthropicClient, handleAnthropicError } from '@/lib/ai/client';
import { AI_CONFIG } from '@/lib/ai/config';
import { enforceRateLimit } from '@/lib/ai/rate-limiter';
import { AIError, AIErrorCode } from '@/lib/ai/types';
import {
  DEAL_SUMMARIZATION_SYSTEM_PROMPT,
  buildDealSummarizationMessages,
  validateDealSummaryResponse,
  handleSummarizationError,
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
  NotFoundError,
} from '@/lib/api/error-handler';

/**
 * Request body schema using Zod
 */
const SummarizeRequestSchema = z.object({
  dealId: z.string().uuid('Deal ID must be a valid UUID'),
});

/**
 * Response data structure
 */
interface SummarizeResponse {
  dealId: string;
  summary: string;
  aiQualityScore: number;
  tags: string[];
  priceDropSignificance: 'high' | 'medium' | 'low' | 'none';
  scoreBreakdown: {
    authenticityScore: number;
    priceDropScore: number;
    relevanceScore: number;
    descriptionQualityScore: number;
  };
  reasoning: string;
  summarizedAt: string;
}

/**
 * Get client IP address from request headers
 */
function getClientIp(request: NextRequest): string {
  // Check common headers for client IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  // Use the first available IP
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIp) {
    return realIp;
  }
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Fallback to a generic identifier
  return 'anonymous';
}

/**
 * POST /api/ai/summarize
 *
 * Request body:
 * {
 *   "dealId": "uuid-string"
 * }
 *
 * Response format:
 * {
 *   "success": true,
 *   "data": {
 *     "dealId": "uuid",
 *     "summary": "...",
 *     "aiQualityScore": 85,
 *     "tags": ["tag1", "tag2"],
 *     "priceDropSignificance": "medium",
 *     "scoreBreakdown": {...},
 *     "reasoning": "...",
 *     "summarizedAt": "2024-01-01T00:00:00.000Z"
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIp = getClientIp(request);

    // Apply rate limiting (costs 1 token)
    enforceRateLimit(clientIp, 1);

    // Parse and validate request body
    const body = await request.json().catch(() => {
      throw new ValidationError('Invalid JSON in request body');
    });

    const validationResult = SummarizeRequestSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationError('Invalid request parameters', {
        errors: validationResult.error.format(),
      });
    }

    const { dealId } = validationResult.data;

    // Fetch deal from database
    const dealResults = await db
      .select({
        id: deals.id,
        title: deals.title,
        description: deals.description,
        price: deals.price,
        original_price: deals.original_price,
        discount_percentage: deals.discount_percentage,
        brand: deals.brand,
        category_id: deals.category_id,
        archived: deals.archived,
      })
      .from(deals)
      .where(eq(deals.id, dealId))
      .limit(1);

    const deal = dealResults[0];

    if (!deal) {
      throw new NotFoundError('Deal');
    }

    // Check if deal is archived
    if (deal.archived) {
      throw new ValidationError('Cannot summarize archived deals', {
        dealId,
        archived: true,
      });
    }

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
    let aiResponse;
    try {
      const messages = buildDealSummarizationMessages(promptInput);

      aiResponse = await anthropicClient.messages.create({
        model: AI_CONFIG.model,
        max_tokens: AI_CONFIG.maxTokens,
        system: DEAL_SUMMARIZATION_SYSTEM_PROMPT,
        messages,
      });
    } catch (error) {
      // Check if it's a missing API key error
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

      throw handleAnthropicError(error);
    }

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
      console.error('AI response validation failed:', validation.error);
      console.error('Raw response:', textContent.text);
      throw new AIError(
        `AI response validation failed: ${validation.error}`,
        AIErrorCode.INVALID_REQUEST,
        true
      );
    }

    const summaryData = validation.data;

    // Update deal in database with AI summary
    const now = new Date();
    await db
      .update(deals)
      .set({
        summary: summaryData.summary,
        ai_quality_score: summaryData.qualityScore,
        summarized_at: now,
      })
      .where(eq(deals.id, dealId));

    // Log AI request for monitoring
    console.log('[AI Summarization]', {
      dealId,
      qualityScore: summaryData.qualityScore,
      inputTokens: aiResponse.usage.input_tokens,
      outputTokens: aiResponse.usage.output_tokens,
      clientIp,
    });

    // Build response
    const response: SummarizeResponse = {
      dealId,
      summary: summaryData.summary,
      aiQualityScore: summaryData.qualityScore,
      tags: summaryData.tags,
      priceDropSignificance: summaryData.priceDropSignificance,
      scoreBreakdown: summaryData.scoreBreakdown,
      reasoning: summaryData.reasoning,
      summarizedAt: now.toISOString(),
    };

    return successResponse(response);
  } catch (error) {
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
      route: '/api/ai/summarize',
      method: 'POST',
    });
  }
}
