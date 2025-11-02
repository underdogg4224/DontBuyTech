/**
 * Rate Limiter using Token Bucket Algorithm
 *
 * Implements per-IP rate limiting to prevent API abuse
 */

import { AI_CONFIG } from './config';
import { AIError, AIErrorCode, RateLimitResult } from './types';

/**
 * Token bucket for a single client/IP
 */
interface TokenBucket {
  /** Current number of tokens in the bucket */
  tokens: number;
  /** Last time the bucket was refilled */
  lastRefill: number;
}

/**
 * In-memory storage for token buckets per IP
 * In production, consider using Redis for distributed rate limiting
 */
const buckets = new Map<string, TokenBucket>();

/**
 * Cleanup interval for removing old buckets (every 5 minutes)
 */
const CLEANUP_INTERVAL = 5 * 60 * 1000;

/**
 * Maximum age for inactive buckets (10 minutes)
 */
const MAX_BUCKET_AGE = 10 * 60 * 1000;

/**
 * Periodically clean up old buckets to prevent memory leaks
 */
setInterval(() => {
  const now = Date.now();
  const keysToDelete: string[] = [];

  // Convert iterator to array for compatibility
  Array.from(buckets.entries()).forEach(([key, bucket]) => {
    if (now - bucket.lastRefill > MAX_BUCKET_AGE) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach((key) => {
    buckets.delete(key);
  });

  if (keysToDelete.length > 0) {
    console.log(`Cleaned up ${keysToDelete.length} inactive rate limit buckets`);
  }
}, CLEANUP_INTERVAL);

/**
 * Gets or creates a token bucket for a given identifier
 *
 * @param identifier - Unique identifier (typically IP address)
 * @returns Token bucket for the identifier
 */
function getBucket(identifier: string): TokenBucket {
  let bucket = buckets.get(identifier);

  if (!bucket) {
    bucket = {
      tokens: AI_CONFIG.rateLimit.bucketCapacity,
      lastRefill: Date.now(),
    };
    buckets.set(identifier, bucket);
  }

  return bucket;
}

/**
 * Refills tokens in the bucket based on elapsed time
 *
 * @param bucket - Token bucket to refill
 * @returns Updated bucket with refilled tokens
 */
function refillBucket(bucket: TokenBucket): TokenBucket {
  const now = Date.now();
  const timePassed = now - bucket.lastRefill;
  const tokensToAdd = (timePassed / 1000) * AI_CONFIG.rateLimit.refillRate;

  bucket.tokens = Math.min(
    AI_CONFIG.rateLimit.bucketCapacity,
    bucket.tokens + tokensToAdd
  );
  bucket.lastRefill = now;

  return bucket;
}

/**
 * Checks if a request is allowed under rate limiting rules
 *
 * @param identifier - Unique identifier (typically IP address)
 * @param cost - Token cost of the request (default: 1)
 * @returns Rate limit result indicating if request is allowed
 *
 * @example
 * ```typescript
 * const result = checkRateLimit(req.ip);
 * if (!result.allowed) {
 *   throw new AIError('Rate limit exceeded', AIErrorCode.RATE_LIMIT_EXCEEDED);
 * }
 * ```
 */
export function checkRateLimit(
  identifier: string,
  cost: number = 1
): RateLimitResult {
  const bucket = getBucket(identifier);
  refillBucket(bucket);

  const allowed = bucket.tokens >= cost;

  if (allowed) {
    bucket.tokens -= cost;
  }

  // Calculate time until bucket is refilled to capacity
  const tokensNeeded = AI_CONFIG.rateLimit.bucketCapacity - bucket.tokens;
  const resetTime = Math.ceil((tokensNeeded / AI_CONFIG.rateLimit.refillRate) * 1000);

  return {
    allowed,
    remaining: Math.floor(bucket.tokens),
    resetTime,
  };
}

/**
 * Enforces rate limiting and throws an error if limit is exceeded
 *
 * @param identifier - Unique identifier (typically IP address)
 * @param cost - Token cost of the request (default: 1)
 * @throws {AIError} If rate limit is exceeded
 *
 * @example
 * ```typescript
 * // In API route
 * enforceRateLimit(req.ip || 'anonymous');
 * ```
 */
export function enforceRateLimit(identifier: string, cost: number = 1): void {
  const result = checkRateLimit(identifier, cost);

  if (!result.allowed) {
    throw new AIError(
      `Rate limit exceeded. ${result.remaining} requests remaining. Try again in ${Math.ceil(result.resetTime / 1000)} seconds.`,
      AIErrorCode.RATE_LIMIT_EXCEEDED,
      true
    );
  }
}

/**
 * Gets the current rate limit status for an identifier
 *
 * @param identifier - Unique identifier (typically IP address)
 * @returns Rate limit result without consuming tokens
 *
 * @example
 * ```typescript
 * const status = getRateLimitStatus(req.ip);
 * console.log(`Remaining requests: ${status.remaining}`);
 * ```
 */
export function getRateLimitStatus(identifier: string): RateLimitResult {
  const bucket = getBucket(identifier);
  refillBucket(bucket);

  const tokensNeeded = AI_CONFIG.rateLimit.bucketCapacity - bucket.tokens;
  const resetTime = Math.ceil((tokensNeeded / AI_CONFIG.rateLimit.refillRate) * 1000);

  return {
    allowed: bucket.tokens >= 1,
    remaining: Math.floor(bucket.tokens),
    resetTime,
  };
}

/**
 * Resets the rate limit for a specific identifier
 * Useful for testing or administrative purposes
 *
 * @param identifier - Unique identifier to reset
 */
export function resetRateLimit(identifier: string): void {
  buckets.delete(identifier);
}

/**
 * Gets the total number of active rate limit buckets
 * Useful for monitoring and debugging
 *
 * @returns Number of active buckets
 */
export function getActiveBucketCount(): number {
  return buckets.size;
}
