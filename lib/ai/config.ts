/**
 * AI Configuration Constants
 *
 * Centralized configuration for Claude API integration
 */

/**
 * Claude model configuration
 */
export const AI_CONFIG = {
  /**
   * Primary Claude model to use for all operations
   * Claude 3.5 Sonnet provides the best balance of quality and speed
   */
  model: 'claude-3-5-sonnet-20241022',

  /**
   * Maximum tokens to generate in responses
   * For product summaries, 1024 tokens is typically sufficient
   */
  maxTokens: 1024,

  /**
   * Request timeout in milliseconds
   * 30 seconds is a reasonable timeout for most AI operations
   */
  timeout: 30000,

  /**
   * Retry configuration for failed requests
   */
  retry: {
    /** Maximum number of retry attempts */
    maxAttempts: 3,

    /** Initial delay in milliseconds before first retry */
    initialDelay: 1000,

    /** Multiplier for exponential backoff */
    backoffMultiplier: 2,

    /** Maximum delay between retries in milliseconds */
    maxDelay: 10000,
  },

  /**
   * Cache configuration
   */
  cache: {
    /** Cache duration in seconds (24 hours) */
    duration: 60 * 60 * 24,

    /** Enable caching for AI responses */
    enabled: true,
  },

  /**
   * Rate limiting configuration
   */
  rateLimit: {
    /** Maximum requests per minute per IP */
    requestsPerMinute: 100,

    /** Token bucket refill rate (tokens per second) */
    refillRate: 100 / 60, // 100 requests per minute = ~1.67 per second

    /** Maximum bucket capacity */
    bucketCapacity: 100,
  },
} as const;

/**
 * System prompts for different AI tasks
 */
export const SYSTEM_PROMPTS = {
  /**
   * System prompt for product summarization
   */
  summarize: `You are an expert product analyst. Your task is to create concise, informative summaries of products.

Guidelines:
- Focus on key features and benefits
- Use clear, consumer-friendly language
- Be objective and factual
- Highlight what makes the product unique
- Keep summaries between 50-150 words unless specified otherwise

Format your response as plain text without markdown formatting.`,

  /**
   * System prompt for quality scoring
   */
  qualityScore: `You are an expert product evaluator. Your task is to assess product quality based on descriptions, pricing, and reviews.

Scoring criteria:
- Description Quality (0-100): Completeness, clarity, and detail of product information
- Value for Money (0-100): Price appropriateness relative to features and quality
- Review Sentiment (0-100): Overall sentiment from customer reviews (if available)

Provide scores and clear reasoning. Be critical but fair in your assessment.

Format your response as JSON with this structure:
{
  "score": <overall score 0-100>,
  "breakdown": {
    "descriptionQuality": <score 0-100>,
    "valueForMoney": <score 0-100>,
    "reviewSentiment": <score 0-100 or null>
  },
  "reasoning": "<brief explanation>"
}`,
} as const;

/**
 * Environment variable keys
 */
export const ENV_KEYS = {
  ANTHROPIC_API_KEY: 'ANTHROPIC_API_KEY',
} as const;
