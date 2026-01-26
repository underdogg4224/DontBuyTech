# AI Prompts - Deal Summarization

This module provides prompt engineering for AI-powered deal summarization and quality scoring using Claude.

## Overview

The deal summarization system analyzes product deals and returns:
- **Summary**: 2-3 sentence consumer-friendly summary
- **Quality Score**: 0-100 score based on 4 criteria
- **Tags**: 3-5 extracted feature tags
- **Price Drop Assessment**: Significance rating (high/medium/low/none)
- **Score Breakdown**: Transparent scoring across 4 dimensions

## Quality Scoring Criteria

### 1. Deal Authenticity (0-30 points)
- Legitimacy of the deal and product
- Brand reputation and recognition
- Description matches title
- Red flag detection

### 2. Price Drop Significance (0-25 points)
- Discount percentage
- Original price realism
- Market value comparison
- Genuine savings assessment

### 3. Product Relevance (0-25 points)
- Consumer usefulness
- Problem-solving capability
- Target audience size
- Trend/seasonality

### 4. Description Quality (0-20 points)
- Completeness and detail
- Key specifications provided
- Clarity and writing quality
- Purchase decision support

## Usage Example

```typescript
import { anthropicClient } from '@/lib/ai/client';
import { AI_CONFIG } from '@/lib/ai/config';
import {
  buildDealSummarizationMessages,
  DEAL_SUMMARIZATION_SYSTEM_PROMPT,
  validateDealSummaryResponse,
  type DealPromptInput,
  type DealSummaryResponse,
} from '@/lib/ai/prompts';

async function summarizeDeal(dealData: DealPromptInput): Promise<DealSummaryResponse> {
  // Build messages for Claude
  const messages = buildDealSummarizationMessages(dealData);

  // Call Claude API
  const response = await anthropicClient.messages.create({
    model: AI_CONFIG.model,
    max_tokens: AI_CONFIG.maxTokens,
    system: DEAL_SUMMARIZATION_SYSTEM_PROMPT,
    messages,
  });

  // Extract text content
  const textContent = response.content.find((block) => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  // Validate and parse response
  const validation = validateDealSummaryResponse(textContent.text);
  if (!validation.valid) {
    throw new Error(`Invalid response: ${validation.error}`);
  }

  return validation.data!;
}

// Example usage
const result = await summarizeDeal({
  title: 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones',
  description: 'Experience exceptional sound quality with Sony\'s latest flagship headphones...',
  price: 329.99,
  originalPrice: 399.99,
  brand: 'Sony',
  category: 'Electronics',
});

console.log('Summary:', result.summary);
console.log('Quality Score:', result.qualityScore);
console.log('Tags:', result.tags);
console.log('Price Drop:', result.priceDropSignificance);
console.log('Breakdown:', result.scoreBreakdown);
```

## Response Format

```typescript
{
  "summary": "2-3 sentence summary of the product and deal",
  "qualityScore": 88,
  "reasoning": "Explanation covering all 4 scoring dimensions",
  "tags": ["tag-1", "tag-2", "tag-3"],
  "priceDropSignificance": "medium",
  "scoreBreakdown": {
    "authenticityScore": 28,
    "priceDropScore": 18,
    "relevanceScore": 23,
    "descriptionQualityScore": 19
  }
}
```

## Key Features

### Prompt Building
- **buildDealPrompt()**: Creates formatted user prompt from deal data
- **buildDealSummarizationMessages()**: Builds complete message array for Claude API

### Validation
- **validateDealSummaryResponse()**: Validates JSON structure and ranges
- **handleSummarizationError()**: Standardized error handling

### Type Safety
- Full TypeScript types for inputs and outputs
- Compile-time validation of prompt data
- Runtime JSON validation

## Prompt Design Principles

1. **Specificity**: Clear, directive instructions to Claude
2. **Structure**: Explicit JSON schema for consistent parsing
3. **Examples**: Reference examples for expected output quality
4. **Reasoning**: Requests explanations for transparency
5. **Edge Cases**: Handles missing prices, poor descriptions, suspicious deals
6. **Objectivity**: Critical assessment guidelines to maintain quality standards

## Testing

See `EXAMPLE_DEAL_INPUT` and `EXAMPLE_EXPECTED_RESPONSE` in `summarize-deal.ts` for reference data.

## Error Handling

The validation function checks for:
- Valid JSON syntax
- Required fields presence
- Type correctness
- Value ranges (scores, significance levels)
- Score breakdown consistency

Returns detailed error messages for debugging.
