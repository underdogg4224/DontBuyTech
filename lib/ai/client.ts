/**
 * Anthropic Claude API Client
 *
 * Singleton client instance for interacting with Claude AI
 */

import Anthropic from '@anthropic-ai/sdk';
import { AI_CONFIG, ENV_KEYS } from './config';
import { AIError, AIErrorCode } from './types';

/**
 * Validates that the Anthropic API key is present and properly formatted
 *
 * @throws {AIError} If API key is missing or invalid
 */
function validateApiKey(apiKey: string | undefined): string {
  if (!apiKey) {
    throw new AIError(
      'Anthropic API key is not configured. Please set ANTHROPIC_API_KEY in your environment variables.',
      AIErrorCode.MISSING_API_KEY,
      false
    );
  }

  if (typeof apiKey !== 'string' || apiKey.trim().length === 0) {
    throw new AIError(
      'Invalid Anthropic API key format. Please check your ANTHROPIC_API_KEY environment variable.',
      AIErrorCode.INVALID_API_KEY,
      false
    );
  }

  // Anthropic API keys typically start with 'sk-ant-'
  if (!apiKey.startsWith('sk-ant-')) {
    console.warn(
      'Warning: Anthropic API key does not start with expected prefix "sk-ant-". This may indicate an invalid key.'
    );
  }

  return apiKey;
}

/**
 * Creates and configures the Anthropic client instance
 *
 * @returns Configured Anthropic client
 * @throws {AIError} If API key is missing or invalid
 */
function createAnthropicClient(): Anthropic {
  try {
    const apiKey = validateApiKey(process.env[ENV_KEYS.ANTHROPIC_API_KEY]);

    const client = new Anthropic({
      apiKey,
      timeout: AI_CONFIG.timeout,
      maxRetries: AI_CONFIG.retry.maxAttempts,
    });

    return client;
  } catch (error) {
    if (error instanceof AIError) {
      throw error;
    }

    throw new AIError(
      `Failed to initialize Anthropic client: ${error instanceof Error ? error.message : 'Unknown error'}`,
      AIErrorCode.UNKNOWN_ERROR,
      false
    );
  }
}

/**
 * Singleton Anthropic client instance
 *
 * This client is reused across all AI operations to avoid creating
 * multiple connections and to ensure consistent configuration.
 *
 * @example
 * ```typescript
 * import { anthropicClient } from '@/lib/ai/client';
 *
 * const response = await anthropicClient.messages.create({
 *   model: AI_CONFIG.model,
 *   max_tokens: AI_CONFIG.maxTokens,
 *   messages: [{ role: 'user', content: 'Hello!' }],
 * });
 * ```
 */
export const anthropicClient = createAnthropicClient();

/**
 * Helper function to make AI requests with exponential backoff retry logic
 *
 * @param fn - Function that makes the API request
 * @param options - Retry options (defaults to AI_CONFIG.retry)
 * @returns Promise resolving to the API response
 * @throws {AIError} If all retry attempts fail
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts: number;
    initialDelay: number;
    backoffMultiplier: number;
    maxDelay: number;
  } = AI_CONFIG.retry
): Promise<T> {
  let lastError: Error | undefined;
  let delay = options.initialDelay;

  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on non-retryable errors
      if (error instanceof AIError && !error.retryable) {
        throw error;
      }

      // Don't retry on the last attempt
      if (attempt === options.maxAttempts) {
        break;
      }

      // Log retry attempt
      console.warn(
        `AI request failed (attempt ${attempt}/${options.maxAttempts}). Retrying in ${delay}ms...`,
        lastError.message
      );

      // Wait before retrying with exponential backoff
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * options.backoffMultiplier, options.maxDelay);
    }
  }

  // All retries exhausted
  throw new AIError(
    `AI request failed after ${options.maxAttempts} attempts: ${lastError?.message}`,
    AIErrorCode.API_ERROR,
    false
  );
}

/**
 * Wraps Anthropic API errors with our custom error type
 *
 * @param error - The original error from Anthropic SDK
 * @returns AIError with appropriate error code and retry flag
 */
export function handleAnthropicError(error: unknown): AIError {
  if (error instanceof AIError) {
    return error;
  }

  // Handle Anthropic SDK specific errors
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status?: number }).status;

    switch (status) {
      case 401:
        return new AIError(
          'Invalid API key. Please check your ANTHROPIC_API_KEY.',
          AIErrorCode.INVALID_API_KEY,
          false
        );
      case 429:
        return new AIError(
          'Rate limit exceeded. Please try again later.',
          AIErrorCode.RATE_LIMIT_EXCEEDED,
          true
        );
      case 408:
      case 504:
        return new AIError(
          'Request timeout. The AI service took too long to respond.',
          AIErrorCode.TIMEOUT,
          true
        );
      default:
        if (status && status >= 500) {
          return new AIError(
            `AI service error (${status}). Please try again later.`,
            AIErrorCode.API_ERROR,
            true
          );
        }
    }
  }

  // Generic error
  const message = error instanceof Error ? error.message : String(error);
  return new AIError(
    `Unexpected AI error: ${message}`,
    AIErrorCode.UNKNOWN_ERROR,
    true
  );
}
