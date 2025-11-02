/**
 * AI Response Caching Layer
 *
 * Implements caching for AI responses to reduce API calls and improve performance
 */

import { unstable_cache } from 'next/cache';
import { AI_CONFIG } from './config';
import { CacheMetadata } from './types';

/**
 * Generates a stable cache key from request parameters
 *
 * @param params - Object containing request parameters
 * @returns Deterministic cache key string
 *
 * @example
 * ```typescript
 * const key = generateCacheKey({ title: 'Product', description: 'Description' });
 * // Returns: 'ai:hash-of-params'
 * ```
 */
export function generateCacheKey(params: Record<string, unknown>): string {
  // Sort keys to ensure consistent ordering
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {} as Record<string, unknown>);

  // Create a stable string representation
  const paramString = JSON.stringify(sortedParams);

  // Simple hash function (for production, consider using crypto.createHash)
  let hash = 0;
  for (let i = 0; i < paramString.length; i++) {
    const char = paramString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return `ai:${Math.abs(hash).toString(36)}`;
}

/**
 * Creates a cached version of an AI function
 *
 * Uses Next.js unstable_cache to cache AI responses with automatic revalidation
 *
 * @param fn - Async function to cache
 * @param keyPrefix - Prefix for cache keys
 * @param options - Cache options
 * @returns Cached version of the function
 *
 * @example
 * ```typescript
 * const cachedSummarize = createCachedFunction(
 *   async (params: SummarizeRequest) => {
 *     // AI call logic
 *   },
 *   'summarize',
 *   { revalidate: 3600 }
 * );
 * ```
 */
export function createCachedFunction<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  keyPrefix: string,
  options: {
    revalidate?: number;
    tags?: string[];
  } = {}
): (...args: TArgs) => Promise<TResult> {
  if (!AI_CONFIG.cache.enabled) {
    return fn;
  }

  const revalidate = options.revalidate ?? AI_CONFIG.cache.duration;

  return async (...args: TArgs): Promise<TResult> => {
    // Generate cache key from arguments
    const cacheKey = `${keyPrefix}:${generateCacheKey({ args })}`;

    // Create cached version using Next.js unstable_cache
    const cachedFn = unstable_cache(
      async () => fn(...args),
      [cacheKey],
      {
        revalidate,
        tags: options.tags || [keyPrefix, 'ai'],
      }
    );

    return cachedFn();
  };
}

/**
 * Cache wrapper for AI summarization requests
 *
 * @param fn - Summarization function to cache
 * @returns Cached summarization function
 */
export function withSummarizationCache<T extends (...args: any[]) => Promise<any>>(
  fn: T
): T {
  return createCachedFunction(fn, 'ai:summarize', {
    revalidate: AI_CONFIG.cache.duration,
    tags: ['ai', 'summarize'],
  }) as T;
}

/**
 * Cache wrapper for AI quality scoring requests
 *
 * @param fn - Quality scoring function to cache
 * @returns Cached quality scoring function
 */
export function withQualityScoreCache<T extends (...args: any[]) => Promise<any>>(
  fn: T
): T {
  return createCachedFunction(fn, 'ai:quality-score', {
    revalidate: AI_CONFIG.cache.duration,
    tags: ['ai', 'quality-score'],
  }) as T;
}

/**
 * Invalidates all AI-related caches
 *
 * @param tag - Optional specific tag to invalidate
 *
 * @example
 * ```typescript
 * import { revalidateTag } from 'next/cache';
 *
 * // Invalidate all AI caches
 * revalidateTag('ai');
 *
 * // Invalidate only summarization caches
 * revalidateTag('summarize');
 * ```
 */
export function invalidateAICache(tag?: string): void {
  // Note: This function serves as documentation
  // In Next.js, use revalidateTag() from 'next/cache' directly:
  // import { revalidateTag } from 'next/cache';
  // revalidateTag(tag || 'ai');

  console.log(`To invalidate AI cache, use: revalidateTag('${tag || 'ai'}')`);
}

/**
 * Gets cache metadata for debugging and monitoring
 *
 * @param keyPrefix - Cache key prefix
 * @param params - Request parameters
 * @returns Cache metadata
 */
export function getCacheMetadata(
  keyPrefix: string,
  params: Record<string, unknown>
): CacheMetadata {
  const cacheKey = `${keyPrefix}:${generateCacheKey(params)}`;
  const now = Date.now();

  return {
    key: cacheKey,
    createdAt: now,
    expiresAt: now + AI_CONFIG.cache.duration * 1000,
  };
}

/**
 * Manual cache storage for custom caching needs
 * (Not recommended for production - use Next.js cache APIs instead)
 */
class SimpleCache<T> {
  private cache = new Map<string, { value: T; expiresAt: number }>();

  /**
   * Gets a value from the cache
   *
   * @param key - Cache key
   * @returns Cached value or undefined if not found or expired
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      return undefined;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  /**
   * Sets a value in the cache
   *
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time to live in seconds (default: from config)
   */
  set(key: string, value: T, ttl: number = AI_CONFIG.cache.duration): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl * 1000,
    });
  }

  /**
   * Deletes a value from the cache
   *
   * @param key - Cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clears all cached values
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Gets the number of cached entries
   */
  size(): number {
    return this.cache.size;
  }
}

/**
 * Simple in-memory cache instance
 * Use for development or non-critical caching
 */
export const memoryCache = new SimpleCache();
