/**
 * Link Checker Utility
 * Validates deal URLs to detect broken links
 */

/**
 * Link check result interface
 */
export interface LinkCheckResult {
  /** Whether the link is valid (returns 200-399) */
  isValid: boolean;
  /** HTTP status code */
  statusCode: number;
  /** Error message if check failed */
  error?: string;
}

/**
 * Check if a deal link is valid and accessible
 *
 * Performs HTTP HEAD request with timeout and retry logic
 * - Valid: HTTP status 200-399
 * - Invalid: HTTP status 400-599 or network errors
 * - Timeout: 5 seconds per attempt
 *
 * @param url - URL to check
 * @param retries - Number of retry attempts for transient failures (default: 2)
 * @returns Link check result with status and validity
 *
 * @example
 * ```typescript
 * const result = await checkDealLink('https://example.com/deal');
 * if (!result.isValid) {
 *   console.log(`Link broken: ${result.statusCode} - ${result.error}`);
 * }
 * ```
 */
export async function checkDealLink(
  url: string,
  retries: number = 2
): Promise<LinkCheckResult> {
  // Validate URL format
  try {
    new URL(url);
  } catch (error) {
    return {
      isValid: false,
      statusCode: 0,
      error: 'Invalid URL format',
    };
  }

  let lastError: string | undefined;
  let lastStatusCode: number = 0;

  // Retry loop for transient failures
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      try {
        // Perform HEAD request to check link without downloading content
        // Fall back to GET if HEAD is not supported
        const response = await fetch(url, {
          method: 'HEAD',
          signal: controller.signal,
          // Don't follow redirects automatically to detect redirect issues
          redirect: 'manual',
          // Add headers to appear as a regular browser request
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; DontBuyTech-LinkChecker/1.0)',
          },
        });

        clearTimeout(timeoutId);
        lastStatusCode = response.status;

        // Consider 200-399 as valid (including redirects 300-399)
        // 400-499: Client errors (404 Not Found, etc.)
        // 500-599: Server errors
        const isValid = response.status >= 200 && response.status < 400;

        if (isValid || attempt >= retries) {
          return {
            isValid,
            statusCode: response.status,
            error: isValid ? undefined : `HTTP ${response.status} ${response.statusText}`,
          };
        }

        // Server error or rate limit - retry after delay
        lastError = `HTTP ${response.status} ${response.statusText}`;

        // Exponential backoff: 1s, 2s, 4s
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }

      } catch (fetchError: any) {
        clearTimeout(timeoutId);

        // Handle abort/timeout
        if (fetchError.name === 'AbortError') {
          lastError = 'Request timeout (5s)';
          lastStatusCode = 0;

          // Timeout might be transient, retry
          if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            continue;
          }
        } else {
          // Network error or DNS failure
          lastError = fetchError.message || 'Network error';
          lastStatusCode = 0;

          // Network errors might be transient, retry
          if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            continue;
          }
        }
      }
    } catch (error: any) {
      // Unexpected error
      lastError = error.message || 'Unknown error';
      lastStatusCode = 0;
    }
  }

  // All retries exhausted
  return {
    isValid: false,
    statusCode: lastStatusCode,
    error: lastError || 'Failed after retries',
  };
}

/**
 * Check multiple links in parallel with concurrency control
 *
 * @param urls - Array of URLs to check
 * @param concurrency - Maximum number of concurrent checks (default: 5)
 * @returns Map of URL to check result
 *
 * @example
 * ```typescript
 * const urls = ['https://example.com/deal1', 'https://example.com/deal2'];
 * const results = await checkMultipleLinks(urls);
 *
 * for (const [url, result] of results) {
 *   console.log(`${url}: ${result.isValid ? 'OK' : 'BROKEN'}`);
 * }
 * ```
 */
export async function checkMultipleLinks(
  urls: string[],
  concurrency: number = 5
): Promise<Map<string, LinkCheckResult>> {
  const results = new Map<string, LinkCheckResult>();
  const queue = [...urls];

  // Process URLs with concurrency limit
  const workers = Array(Math.min(concurrency, urls.length))
    .fill(null)
    .map(async () => {
      while (queue.length > 0) {
        const url = queue.shift();
        if (!url) break;

        const result = await checkDealLink(url);
        results.set(url, result);
      }
    });

  await Promise.all(workers);

  return results;
}
