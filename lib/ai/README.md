# AI Utilities Documentation

Complete AI integration infrastructure for Claude API in DontBuyTech.

## Overview

This module provides a robust, production-ready integration with Anthropic's Claude API, including:

- ✅ Singleton client instance with automatic retry logic
- ✅ Response caching with Next.js integration
- ✅ Token bucket rate limiting (100 req/min per IP)
- ✅ Comprehensive error handling
- ✅ TypeScript types and interfaces
- ✅ Environment-based configuration

## Quick Start

### 1. Environment Setup

Add your Anthropic API key to `.env.local`:

```bash
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

### 2. Basic Usage

```typescript
import { anthropicClient, AI_CONFIG } from '@/lib/ai';

// Simple AI request
const response = await anthropicClient.messages.create({
  model: AI_CONFIG.model,
  max_tokens: AI_CONFIG.maxTokens,
  messages: [
    {
      role: 'user',
      content: 'Summarize this product: ...',
    },
  ],
});
```

### 3. With Rate Limiting

```typescript
import { enforceRateLimit, anthropicClient } from '@/lib/ai';

export async function POST(request: Request) {
  // Get client IP
  const ip = request.headers.get('x-forwarded-for') || 'anonymous';

  // Check rate limit
  enforceRateLimit(ip);

  // Make AI request
  const response = await anthropicClient.messages.create({...});

  return Response.json(response);
}
```

### 4. With Caching

```typescript
import { withSummarizationCache, anthropicClient } from '@/lib/ai';

async function summarizeProduct(title: string, description: string) {
  const response = await anthropicClient.messages.create({...});
  return response;
}

// Cached version (24-hour cache)
export const cachedSummarize = withSummarizationCache(summarizeProduct);
```

## Module Structure

```
lib/ai/
├── index.ts          # Main exports
├── client.ts         # Anthropic client singleton
├── config.ts         # Configuration constants
├── types.ts          # TypeScript interfaces
├── cache.ts          # Response caching
├── rate-limiter.ts   # Rate limiting
└── README.md         # This file
```

## Configuration

All configuration is centralized in `config.ts`:

```typescript
export const AI_CONFIG = {
  model: 'claude-3-5-sonnet-20241022',
  maxTokens: 1024,
  timeout: 30000, // 30 seconds
  retry: {
    maxAttempts: 3,
    initialDelay: 1000,
    backoffMultiplier: 2,
    maxDelay: 10000,
  },
  cache: {
    duration: 86400, // 24 hours
    enabled: true,
  },
  rateLimit: {
    requestsPerMinute: 100,
    refillRate: 1.67,
    bucketCapacity: 100,
  },
};
```

## API Reference

### Client (`client.ts`)

#### `anthropicClient`
Singleton Anthropic client instance with retry logic.

#### `withRetry<T>(fn, options?)`
Wraps a function with exponential backoff retry logic.

**Parameters:**
- `fn`: Async function to retry
- `options`: Retry configuration (optional)

**Returns:** Promise resolving to function result

#### `handleAnthropicError(error)`
Converts Anthropic SDK errors to AIError instances.

---

### Rate Limiting (`rate-limiter.ts`)

#### `enforceRateLimit(identifier, cost?)`
Enforces rate limiting and throws if exceeded.

**Parameters:**
- `identifier`: Client identifier (typically IP address)
- `cost`: Token cost (default: 1)

**Throws:** `AIError` if rate limit exceeded

#### `checkRateLimit(identifier, cost?)`
Checks rate limit without throwing.

**Returns:** `RateLimitResult` with `allowed`, `remaining`, `resetTime`

#### `getRateLimitStatus(identifier)`
Gets current rate limit status without consuming tokens.

#### `resetRateLimit(identifier)`
Resets rate limit for testing/admin purposes.

---

### Caching (`cache.ts`)

#### `withSummarizationCache(fn)`
Wraps a summarization function with caching.

#### `withQualityScoreCache(fn)`
Wraps a quality scoring function with caching.

#### `createCachedFunction(fn, keyPrefix, options?)`
Creates a cached version of any function.

**Parameters:**
- `fn`: Function to cache
- `keyPrefix`: Cache key prefix
- `options`: Cache configuration

#### `generateCacheKey(params)`
Generates deterministic cache keys from parameters.

#### `memoryCache`
Simple in-memory cache for development use.

---

### Types (`types.ts`)

#### Interfaces
- `SummarizeRequest` - Product summarization input
- `SummarizeResponse` - Summarization output
- `QualityScoreRequest` - Quality scoring input
- `QualityScoreResponse` - Quality score output
- `RateLimitResult` - Rate limit check result
- `CacheMetadata` - Cache entry metadata

#### Classes
- `AIError` - Custom error with code and retry flag
- `AIErrorCode` - Enum of error codes

---

## Error Handling

All AI operations can throw `AIError` with specific error codes:

```typescript
import { AIError, AIErrorCode } from '@/lib/ai';

try {
  await anthropicClient.messages.create({...});
} catch (error) {
  if (error instanceof AIError) {
    switch (error.code) {
      case AIErrorCode.MISSING_API_KEY:
        // Handle missing API key
        break;
      case AIErrorCode.RATE_LIMIT_EXCEEDED:
        // Handle rate limit
        break;
      case AIErrorCode.TIMEOUT:
        // Handle timeout
        break;
      default:
        // Handle other errors
    }

    // Check if retryable
    if (error.retryable) {
      // Retry logic
    }
  }
}
```

## System Prompts

Pre-configured system prompts are available in `config.ts`:

```typescript
import { SYSTEM_PROMPTS } from '@/lib/ai/config';

// For summarization
const response = await anthropicClient.messages.create({
  model: AI_CONFIG.model,
  max_tokens: AI_CONFIG.maxTokens,
  system: SYSTEM_PROMPTS.summarize,
  messages: [...],
});

// For quality scoring
const response = await anthropicClient.messages.create({
  system: SYSTEM_PROMPTS.qualityScore,
  messages: [...],
});
```

## Example: Complete API Route

```typescript
// app/api/summarize/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  anthropicClient,
  AI_CONFIG,
  SYSTEM_PROMPTS,
  enforceRateLimit,
  handleAnthropicError,
  withSummarizationCache,
  type SummarizeRequest,
  type SummarizeResponse,
} from '@/lib/ai';

async function summarizeProduct(
  request: SummarizeRequest
): Promise<SummarizeResponse> {
  const response = await anthropicClient.messages.create({
    model: AI_CONFIG.model,
    max_tokens: AI_CONFIG.maxTokens,
    system: SYSTEM_PROMPTS.summarize,
    messages: [
      {
        role: 'user',
        content: `Title: ${request.title}\n\nDescription: ${request.description}`,
      },
    ],
  });

  const summary = response.content[0].type === 'text'
    ? response.content[0].text
    : '';

  return {
    summary,
    tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
  };
}

// Cached version
const cachedSummarize = withSummarizationCache(summarizeProduct);

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    enforceRateLimit(ip);

    // Parse request
    const body: SummarizeRequest = await request.json();

    // Generate summary (cached)
    const result = await cachedSummarize(body);

    return NextResponse.json(result);
  } catch (error) {
    const aiError = handleAnthropicError(error);

    return NextResponse.json(
      { error: aiError.message },
      { status: aiError.code === 'RATE_LIMIT_EXCEEDED' ? 429 : 500 }
    );
  }
}
```

## Testing

The infrastructure includes helpful utilities for testing:

```typescript
import { resetRateLimit, memoryCache } from '@/lib/ai';

// Reset rate limit for a test user
resetRateLimit('test-ip');

// Clear memory cache
memoryCache.clear();
```

## Production Considerations

### 1. API Key Security
- Never commit `.env.local` to version control
- Use environment variables in production
- Rotate API keys regularly

### 2. Rate Limiting
- Current implementation uses in-memory storage
- For distributed systems, use Redis or similar
- Adjust limits based on your API tier

### 3. Caching
- Uses Next.js `unstable_cache` (may change in future versions)
- Consider external cache (Redis) for larger scale
- Monitor cache hit rates

### 4. Monitoring
- Log all AI errors with context
- Track rate limit violations
- Monitor API usage and costs
- Set up alerts for anomalies

## Troubleshooting

### "API key is not configured"
- Ensure `ANTHROPIC_API_KEY` is set in `.env.local`
- Restart your development server after adding env vars

### "Rate limit exceeded"
- Wait for the reset time indicated in the error
- Increase rate limits in `config.ts` if needed
- Implement user-based rate limiting instead of IP-based

### TypeScript errors
- Run `npm install` to ensure all types are installed
- Check `tsconfig.json` includes proper paths

## Next Steps

1. ✅ Infrastructure complete
2. ⏳ Implement API routes (Task 2.1)
3. ⏳ Add database integration (Task 2.2)
4. ⏳ Create UI components (Task 2.3)

---

**Version:** 1.0.0
**Last Updated:** 2025-11-02
**Maintainer:** @ai-engineer
