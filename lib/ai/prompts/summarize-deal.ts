/**
 * AI Prompts for Deal Summarization and Quality Scoring
 *
 * This module provides prompt templates for Claude to analyze and score deals.
 * It includes functions for building prompts, validating responses, and type definitions.
 */

import { AIError, AIErrorCode } from '../types';

/**
 * Input data for deal summarization prompt
 */
export interface DealPromptInput {
  /** Product/deal title */
  title: string;
  /** Full product description */
  description: string;
  /** Current price */
  price: number;
  /** Original price before discount (optional) */
  originalPrice?: number;
  /** Discount percentage if available */
  discountPercentage?: number;
  /** Product brand (optional) */
  brand?: string;
  /** Product category (optional) */
  category?: string;
  /** Product URL (optional, for context) */
  url?: string;
}

/**
 * Expected JSON response structure from Claude
 */
export interface DealSummaryResponse {
  /** 2-3 sentence summary highlighting key features */
  summary: string;
  /** Overall quality score (0-100) */
  qualityScore: number;
  /** Detailed explanation of the quality score */
  reasoning: string;
  /** Extracted feature tags (3-5 tags) */
  tags: string[];
  /** Price drop significance assessment */
  priceDropSignificance: 'high' | 'medium' | 'low' | 'none';
  /** Score breakdown for transparency */
  scoreBreakdown: {
    /** Deal authenticity score (0-30) */
    authenticityScore: number;
    /** Price drop significance score (0-25) */
    priceDropScore: number;
    /** Product relevance score (0-25) */
    relevanceScore: number;
    /** Description quality score (0-20) */
    descriptionQualityScore: number;
  };
}

/**
 * Validation result for parsed JSON responses
 */
export interface ValidationResult {
  /** Whether the response is valid */
  valid: boolean;
  /** Error message if validation failed */
  error?: string;
  /** Sanitized and validated data */
  data?: DealSummaryResponse;
}

/**
 * System prompt for deal summarization and quality scoring
 *
 * This prompt instructs Claude on how to analyze deals and return structured data.
 */
export const DEAL_SUMMARIZATION_SYSTEM_PROMPT = `You are an expert product analyst and deal evaluator. Your task is to analyze product deals and provide:
1. A concise, consumer-friendly summary
2. A comprehensive quality score
3. Extracted feature tags
4. Price drop assessment

**Guidelines:**

**Summary (2-3 sentences):**
- Highlight the most important features and benefits
- Use clear, accessible language for general consumers
- Mention any standout aspects (brand reputation, unique features, exceptional value)
- Be objective and factual
- Focus on what makes this deal noteworthy

**Quality Scoring (0-100 total):**

You must score across 4 dimensions:

1. **Deal Authenticity (0-30 points):**
   - Is this a legitimate deal from a real product?
   - Does the description match the title?
   - Are there red flags (too good to be true, suspicious claims)?
   - Is the product/brand recognizable and reputable?

2. **Price Drop Significance (0-25 points):**
   - How substantial is the discount?
   - Is the original price realistic (not inflated)?
   - Does the deal represent genuine savings?
   - Consider market value for similar products

3. **Product Relevance (0-25 points):**
   - Is this a useful product for most consumers?
   - Does it solve a real problem or need?
   - Is it a trending or seasonal item?
   - Consider target audience size

4. **Description Quality (0-20 points):**
   - How complete and detailed is the description?
   - Are key specifications provided?
   - Is the description clear and well-written?
   - Are there sufficient details to make a purchase decision?

**Tags Extraction:**
- Extract 3-5 key feature tags from the product
- Use lowercase, hyphenated format (e.g., "wireless-charging", "noise-cancellation")
- Focus on technical features, use cases, or benefits
- Make tags specific and useful for search/filtering

**Price Drop Significance:**
- "high": >40% discount or exceptional value
- "medium": 20-40% discount
- "low": 10-20% discount
- "none": <10% discount or no original price available

**Critical Instructions:**
- Be critical and honest in your assessment
- Penalize unclear descriptions, suspicious pricing, or low-quality products
- If description is poor or missing key info, give low description quality score
- If price drop seems fake or inflated, give low price drop score
- Quality scores should range from 40-95 for most products (reserve extremes for outliers)

**Output Format:**
Return ONLY valid JSON with no markdown formatting, no code blocks, no explanatory text.
Use this exact structure:

{
  "summary": "2-3 sentence summary here",
  "qualityScore": 75,
  "reasoning": "Brief explanation of overall score covering all 4 dimensions",
  "tags": ["tag-1", "tag-2", "tag-3"],
  "priceDropSignificance": "medium",
  "scoreBreakdown": {
    "authenticityScore": 25,
    "priceDropScore": 15,
    "relevanceScore": 20,
    "descriptionQualityScore": 15
  }
}`;

/**
 * Builds the user prompt with deal data
 *
 * @param deal - Deal data to analyze
 * @returns Formatted user prompt string
 */
export function buildDealPrompt(deal: DealPromptInput): string {
  const parts: string[] = [];

  // Add title
  parts.push(`**Product Title:**\n${deal.title}`);

  // Add pricing information
  parts.push('\n**Pricing:**');
  if (deal.originalPrice && deal.originalPrice > deal.price) {
    const calculatedDiscount = deal.discountPercentage ||
      Math.round(((deal.originalPrice - deal.price) / deal.originalPrice) * 100);
    parts.push(`- Current Price: $${deal.price.toFixed(2)}`);
    parts.push(`- Original Price: $${deal.originalPrice.toFixed(2)}`);
    parts.push(`- Discount: ${calculatedDiscount}%`);
    parts.push(`- Savings: $${(deal.originalPrice - deal.price).toFixed(2)}`);
  } else {
    parts.push(`- Price: $${deal.price.toFixed(2)}`);
    parts.push('- No discount information available');
  }

  // Add optional metadata
  if (deal.brand) {
    parts.push(`\n**Brand:**\n${deal.brand}`);
  }

  if (deal.category) {
    parts.push(`\n**Category:**\n${deal.category}`);
  }

  // Add description
  parts.push(`\n**Description:**\n${deal.description}`);

  // Add instruction
  parts.push('\n---\n');
  parts.push('Analyze this product deal and provide a quality assessment in JSON format as specified.');

  return parts.join('\n');
}

/**
 * Builds complete messages array for Claude API
 *
 * @param deal - Deal data to analyze
 * @returns Array of messages for Claude API
 */
export function buildDealSummarizationMessages(deal: DealPromptInput) {
  return [
    {
      role: 'user' as const,
      content: buildDealPrompt(deal),
    },
  ];
}

/**
 * Validates and parses JSON response from Claude
 *
 * @param responseText - Raw text response from Claude
 * @returns Validation result with parsed data or error
 */
export function validateDealSummaryResponse(responseText: string): ValidationResult {
  try {
    // Remove markdown code blocks if present
    let cleanedText = responseText.trim();

    // Remove ```json and ``` markers
    cleanedText = cleanedText.replace(/^```json\s*/i, '').replace(/```\s*$/, '');

    // Remove any leading/trailing whitespace again
    cleanedText = cleanedText.trim();

    // Parse JSON
    const parsed = JSON.parse(cleanedText);

    // Validate required fields
    if (!parsed || typeof parsed !== 'object') {
      return {
        valid: false,
        error: 'Response is not a valid JSON object',
      };
    }

    const errors: string[] = [];

    // Validate summary
    if (!parsed.summary || typeof parsed.summary !== 'string' || parsed.summary.trim().length === 0) {
      errors.push('Missing or invalid summary field');
    }

    // Validate qualityScore
    if (typeof parsed.qualityScore !== 'number' || parsed.qualityScore < 0 || parsed.qualityScore > 100) {
      errors.push('qualityScore must be a number between 0 and 100');
    }

    // Validate reasoning
    if (!parsed.reasoning || typeof parsed.reasoning !== 'string' || parsed.reasoning.trim().length === 0) {
      errors.push('Missing or invalid reasoning field');
    }

    // Validate tags
    if (!Array.isArray(parsed.tags) || parsed.tags.length === 0) {
      errors.push('tags must be a non-empty array');
    } else if (!parsed.tags.every((tag: unknown) => typeof tag === 'string')) {
      errors.push('All tags must be strings');
    }

    // Validate priceDropSignificance
    const validSignificance = ['high', 'medium', 'low', 'none'];
    if (!validSignificance.includes(parsed.priceDropSignificance)) {
      errors.push('priceDropSignificance must be one of: high, medium, low, none');
    }

    // Validate scoreBreakdown
    if (!parsed.scoreBreakdown || typeof parsed.scoreBreakdown !== 'object') {
      errors.push('Missing or invalid scoreBreakdown object');
    } else {
      const { authenticityScore, priceDropScore, relevanceScore, descriptionQualityScore } = parsed.scoreBreakdown;

      if (typeof authenticityScore !== 'number' || authenticityScore < 0 || authenticityScore > 30) {
        errors.push('authenticityScore must be between 0 and 30');
      }

      if (typeof priceDropScore !== 'number' || priceDropScore < 0 || priceDropScore > 25) {
        errors.push('priceDropScore must be between 0 and 25');
      }

      if (typeof relevanceScore !== 'number' || relevanceScore < 0 || relevanceScore > 25) {
        errors.push('relevanceScore must be between 0 and 25');
      }

      if (typeof descriptionQualityScore !== 'number' || descriptionQualityScore < 0 || descriptionQualityScore > 20) {
        errors.push('descriptionQualityScore must be between 0 and 20');
      }

      // Validate total equals sum of breakdown
      const breakdownTotal = authenticityScore + priceDropScore + relevanceScore + descriptionQualityScore;
      if (Math.abs(breakdownTotal - parsed.qualityScore) > 1) { // Allow 1 point rounding tolerance
        errors.push(`Score breakdown total (${breakdownTotal}) does not match qualityScore (${parsed.qualityScore})`);
      }
    }

    if (errors.length > 0) {
      return {
        valid: false,
        error: `Validation errors: ${errors.join('; ')}`,
      };
    }

    // Return sanitized data
    return {
      valid: true,
      data: {
        summary: parsed.summary.trim(),
        qualityScore: parsed.qualityScore,
        reasoning: parsed.reasoning.trim(),
        tags: parsed.tags.map((tag: string) => tag.toLowerCase().trim()),
        priceDropSignificance: parsed.priceDropSignificance,
        scoreBreakdown: {
          authenticityScore: parsed.scoreBreakdown.authenticityScore,
          priceDropScore: parsed.scoreBreakdown.priceDropScore,
          relevanceScore: parsed.scoreBreakdown.relevanceScore,
          descriptionQualityScore: parsed.scoreBreakdown.descriptionQualityScore,
        },
      },
    };
  } catch (error) {
    return {
      valid: false,
      error: `JSON parsing failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Helper function to handle deal summarization errors
 *
 * @param error - The error that occurred
 * @returns AIError with appropriate context
 */
export function handleSummarizationError(error: unknown): AIError {
  if (error instanceof AIError) {
    return error;
  }

  const message = error instanceof Error ? error.message : String(error);
  return new AIError(
    `Deal summarization failed: ${message}`,
    AIErrorCode.API_ERROR,
    true
  );
}

/**
 * Example usage for reference and testing
 */
export const EXAMPLE_DEAL_INPUT: DealPromptInput = {
  title: 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones',
  description: `Experience exceptional sound quality with Sony's latest flagship headphones.
  Features industry-leading noise cancellation, 30-hour battery life, multipoint connection,
  and premium comfort for all-day wear. Includes Auto NC Optimizer, Speak-to-Chat technology,
  and high-resolution audio support. Available in black and silver.`,
  price: 329.99,
  originalPrice: 399.99,
  discountPercentage: 18,
  brand: 'Sony',
  category: 'Electronics > Audio > Headphones',
};

/**
 * Example expected response for testing validation
 */
export const EXAMPLE_EXPECTED_RESPONSE: DealSummaryResponse = {
  summary: 'Sony WH-1000XM5 headphones offer industry-leading noise cancellation with 30-hour battery life and premium comfort. These flagship headphones feature multipoint connection, high-resolution audio support, and intelligent features like Auto NC Optimizer and Speak-to-Chat. An excellent choice for audiophiles and frequent travelers seeking top-tier wireless audio.',
  qualityScore: 88,
  reasoning: 'High authenticity score due to Sony\'s reputation and detailed specs (28/30). Good price drop of 18% from realistic MSRP (18/25). Strong relevance for audio enthusiasts and travelers (23/25). Excellent description with comprehensive feature list (19/20).',
  tags: ['noise-cancelling', 'wireless', 'premium-audio', 'long-battery', 'multipoint'],
  priceDropSignificance: 'low',
  scoreBreakdown: {
    authenticityScore: 28,
    priceDropScore: 18,
    relevanceScore: 23,
    descriptionQualityScore: 19,
  },
};
