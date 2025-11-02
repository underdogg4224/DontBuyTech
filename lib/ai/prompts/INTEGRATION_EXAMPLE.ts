/**
 * Integration Example: Using Deal Summarization Prompts with Claude API
 *
 * This file demonstrates how to integrate the prompt system with the
 * Claude API client to summarize and score deals.
 */

import { anthropicClient, withRetry, handleAnthropicError } from '../client';
import { AI_CONFIG } from '../config';
import { AIError, AIErrorCode } from '../types';
import {
  buildDealSummarizationMessages,
  DEAL_SUMMARIZATION_SYSTEM_PROMPT,
  validateDealSummaryResponse,
  handleSummarizationError,
  type DealPromptInput,
  type DealSummaryResponse,
} from './summarize-deal';

/**
 * Options for deal summarization
 */
export interface SummarizeDealOptions {
  /** Maximum tokens for Claude response (default: from AI_CONFIG) */
  maxTokens?: number;
  /** Model to use (default: from AI_CONFIG) */
  model?: string;
  /** Enable retry on failure (default: true) */
  retry?: boolean;
}

/**
 * Summarizes and scores a deal using Claude AI
 *
 * @param dealData - Deal information to analyze
 * @param options - Optional configuration
 * @returns Promise resolving to deal summary and quality score
 * @throws {AIError} If API call fails or response is invalid
 *
 * @example
 * ```typescript
 * const summary = await summarizeDeal({
 *   title: 'MacBook Pro 14" M3',
 *   description: 'Latest MacBook Pro with M3 chip, 16GB RAM, 512GB SSD',
 *   price: 1599,
 *   originalPrice: 1999,
 *   brand: 'Apple',
 * });
 *
 * console.log(summary.summary);
 * console.log(`Quality Score: ${summary.qualityScore}/100`);
 * ```
 */
export async function summarizeDeal(
  dealData: DealPromptInput,
  options: SummarizeDealOptions = {}
): Promise<DealSummaryResponse> {
  const {
    maxTokens = AI_CONFIG.maxTokens,
    model = AI_CONFIG.model,
    retry = true,
  } = options;

  try {
    // Build messages for Claude
    const messages = buildDealSummarizationMessages(dealData);

    // Define API call function
    const callApi = async () => {
      return await anthropicClient.messages.create({
        model,
        max_tokens: maxTokens,
        system: DEAL_SUMMARIZATION_SYSTEM_PROMPT,
        messages,
      });
    };

    // Call Claude API with or without retry
    const response = retry
      ? await withRetry(callApi)
      : await callApi();

    // Extract text content from response
    const textContent = response.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new AIError(
        'Claude response did not contain text content',
        AIErrorCode.INVALID_REQUEST,
        false
      );
    }

    // Validate and parse JSON response
    const validation = validateDealSummaryResponse(textContent.text);
    if (!validation.valid) {
      throw new AIError(
        `Claude returned invalid response format: ${validation.error}`,
        AIErrorCode.INVALID_REQUEST,
        false
      );
    }

    return validation.data!;
  } catch (error) {
    // Handle Anthropic-specific errors
    if (error && typeof error === 'object' && 'status' in error) {
      throw handleAnthropicError(error);
    }

    // Handle other errors
    throw handleSummarizationError(error);
  }
}

/**
 * Batch summarize multiple deals
 *
 * @param deals - Array of deals to analyze
 * @param options - Optional configuration
 * @returns Promise resolving to array of summaries (null for failed deals)
 *
 * @example
 * ```typescript
 * const deals = [deal1, deal2, deal3];
 * const summaries = await summarizeDeals(deals);
 *
 * summaries.forEach((summary, index) => {
 *   if (summary) {
 *     console.log(`Deal ${index + 1}: Score ${summary.qualityScore}`);
 *   } else {
 *     console.log(`Deal ${index + 1}: Failed to summarize`);
 *   }
 * });
 * ```
 */
export async function summarizeDeals(
  deals: DealPromptInput[],
  options: SummarizeDealOptions = {}
): Promise<(DealSummaryResponse | null)[]> {
  const promises = deals.map(async (deal) => {
    try {
      return await summarizeDeal(deal, options);
    } catch (error) {
      console.error(`Failed to summarize deal "${deal.title}":`, error);
      return null;
    }
  });

  return await Promise.all(promises);
}

/**
 * Filter deals by minimum quality score
 *
 * @param deals - Array of deals to filter
 * @param minScore - Minimum quality score (0-100)
 * @param options - Optional configuration
 * @returns Promise resolving to deals that meet the quality threshold
 *
 * @example
 * ```typescript
 * const highQualityDeals = await filterDealsByQuality(allDeals, 70);
 * console.log(`Found ${highQualityDeals.length} high-quality deals`);
 * ```
 */
export async function filterDealsByQuality(
  deals: DealPromptInput[],
  minScore: number = 60,
  options: SummarizeDealOptions = {}
): Promise<Array<{ deal: DealPromptInput; summary: DealSummaryResponse }>> {
  const summaries = await summarizeDeals(deals, options);

  return deals
    .map((deal, index) => ({
      deal,
      summary: summaries[index],
    }))
    .filter(
      (item): item is { deal: DealPromptInput; summary: DealSummaryResponse } =>
        item.summary !== null && item.summary.qualityScore >= minScore
    );
}

// ============================================================================
// Example Usage
// ============================================================================

/**
 * Example: Summarize a single deal
 */
async function exampleSingleDeal() {
  const deal: DealPromptInput = {
    title: 'Logitech MX Master 3S Wireless Mouse',
    description: `Premium wireless mouse with ultra-quiet clicks, 8K DPI sensor,
    ergonomic design, customizable buttons, USB-C charging, and multi-device
    connectivity. Works on any surface including glass. Compatible with
    Windows, Mac, Linux, iOS, and Android.`,
    price: 79.99,
    originalPrice: 99.99,
    discountPercentage: 20,
    brand: 'Logitech',
    category: 'Electronics > Computer Accessories',
  };

  try {
    const summary = await summarizeDeal(deal);

    console.log('=== Deal Summary ===');
    console.log('Summary:', summary.summary);
    console.log('\nQuality Score:', `${summary.qualityScore}/100`);
    console.log('Price Drop Significance:', summary.priceDropSignificance);
    console.log('\nTags:', summary.tags.join(', '));
    console.log('\nScore Breakdown:');
    console.log(`  - Authenticity: ${summary.scoreBreakdown.authenticityScore}/30`);
    console.log(`  - Price Drop: ${summary.scoreBreakdown.priceDropScore}/25`);
    console.log(`  - Relevance: ${summary.scoreBreakdown.relevanceScore}/25`);
    console.log(`  - Description Quality: ${summary.scoreBreakdown.descriptionQualityScore}/20`);
    console.log('\nReasoning:', summary.reasoning);
  } catch (error) {
    if (error instanceof AIError) {
      console.error(`AI Error (${error.code}):`, error.message);
      console.error('Retryable:', error.retryable);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

/**
 * Example: Batch process multiple deals
 */
async function exampleBatchDeals() {
  const deals: DealPromptInput[] = [
    {
      title: 'Deal 1',
      description: 'First deal description',
      price: 99.99,
    },
    {
      title: 'Deal 2',
      description: 'Second deal description',
      price: 149.99,
      originalPrice: 199.99,
    },
    {
      title: 'Deal 3',
      description: 'Third deal description',
      price: 49.99,
    },
  ];

  try {
    console.log(`Processing ${deals.length} deals...`);
    const summaries = await summarizeDeals(deals);

    summaries.forEach((summary, index) => {
      if (summary) {
        console.log(`\nDeal ${index + 1}: ${deals[index].title}`);
        console.log(`  Score: ${summary.qualityScore}/100`);
        console.log(`  Tags: ${summary.tags.join(', ')}`);
      } else {
        console.log(`\nDeal ${index + 1}: Failed to process`);
      }
    });
  } catch (error) {
    console.error('Batch processing error:', error);
  }
}

/**
 * Example: Filter deals by quality
 */
async function exampleFilterByQuality() {
  const deals: DealPromptInput[] = [
    // ... array of deals
  ];

  try {
    const minScore = 70;
    console.log(`Filtering deals with minimum score of ${minScore}...`);

    const qualityDeals = await filterDealsByQuality(deals, minScore);

    console.log(`\nFound ${qualityDeals.length} high-quality deals:`);
    qualityDeals.forEach(({ deal, summary }) => {
      console.log(`\n- ${deal.title}`);
      console.log(`  Score: ${summary.qualityScore}/100`);
      console.log(`  ${summary.summary}`);
    });
  } catch (error) {
    console.error('Filtering error:', error);
  }
}

// Uncomment to run examples:
// exampleSingleDeal();
// exampleBatchDeals();
// exampleFilterByQuality();
