/**
 * TypeScript types and interfaces for AI integration
 */

/**
 * Request payload for product summarization
 */
export interface SummarizeRequest {
  /** Product title */
  title: string;
  /** Product description */
  description: string;
  /** Product features (optional) */
  features?: string[];
  /** Maximum length of summary in words */
  maxLength?: number;
}

/**
 * Response from product summarization
 */
export interface SummarizeResponse {
  /** Generated summary text */
  summary: string;
  /** Estimated quality score (0-100) */
  confidence?: number;
  /** Number of tokens used */
  tokensUsed?: number;
}

/**
 * Request payload for quality scoring
 */
export interface QualityScoreRequest {
  /** Product title */
  title: string;
  /** Product description */
  description: string;
  /** Product price */
  price: number;
  /** Product reviews (optional) */
  reviews?: Array<{
    rating: number;
    comment: string;
  }>;
}

/**
 * Response from quality scoring
 */
export interface QualityScoreResponse {
  /** Overall quality score (0-100) */
  score: number;
  /** Breakdown of score components */
  breakdown: {
    /** Description quality (0-100) */
    descriptionQuality: number;
    /** Value for money (0-100) */
    valueForMoney: number;
    /** Review sentiment (0-100) */
    reviewSentiment?: number;
  };
  /** Explanation of the score */
  reasoning: string;
}

/**
 * AI API error types
 */
export class AIError extends Error {
  constructor(
    message: string,
    public code: AIErrorCode,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'AIError';
  }
}

/**
 * AI error codes
 */
export enum AIErrorCode {
  MISSING_API_KEY = 'MISSING_API_KEY',
  INVALID_API_KEY = 'INVALID_API_KEY',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  TIMEOUT = 'TIMEOUT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_REQUEST = 'INVALID_REQUEST',
  API_ERROR = 'API_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Rate limiter result
 */
export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Remaining requests in the current window */
  remaining: number;
  /** Time until rate limit resets (in milliseconds) */
  resetTime: number;
}

/**
 * Cache entry metadata
 */
export interface CacheMetadata {
  /** When the cache entry was created */
  createdAt: number;
  /** When the cache entry expires */
  expiresAt: number;
  /** Cache key */
  key: string;
}
