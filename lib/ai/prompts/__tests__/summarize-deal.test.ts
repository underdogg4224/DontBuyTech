/**
 * Tests for Deal Summarization Prompt System
 */

import {
  buildDealPrompt,
  buildDealSummarizationMessages,
  validateDealSummaryResponse,
  EXAMPLE_DEAL_INPUT,
  EXAMPLE_EXPECTED_RESPONSE,
  type DealPromptInput,
} from '../summarize-deal';

describe('Deal Summarization Prompts', () => {
  describe('buildDealPrompt', () => {
    it('should build a complete prompt with all fields', () => {
      const prompt = buildDealPrompt(EXAMPLE_DEAL_INPUT);

      expect(prompt).toContain('Sony WH-1000XM5');
      expect(prompt).toContain('$329.99');
      expect(prompt).toContain('$399.99');
      expect(prompt).toContain('18%');
      expect(prompt).toContain('Sony');
      expect(prompt).toContain('noise cancellation');
    });

    it('should handle missing optional fields', () => {
      const minimalDeal: DealPromptInput = {
        title: 'Test Product',
        description: 'A test product description',
        price: 99.99,
      };

      const prompt = buildDealPrompt(minimalDeal);

      expect(prompt).toContain('Test Product');
      expect(prompt).toContain('$99.99');
      expect(prompt).toContain('No discount information available');
      expect(prompt).not.toContain('Brand:');
      expect(prompt).not.toContain('Category:');
    });

    it('should calculate discount if not provided', () => {
      const deal: DealPromptInput = {
        title: 'Product',
        description: 'Description',
        price: 80,
        originalPrice: 100,
        // discountPercentage not provided
      };

      const prompt = buildDealPrompt(deal);

      expect(prompt).toContain('20%'); // Should calculate 20% discount
    });
  });

  describe('buildDealSummarizationMessages', () => {
    it('should return properly formatted messages array', () => {
      const messages = buildDealSummarizationMessages(EXAMPLE_DEAL_INPUT);

      expect(messages).toHaveLength(1);
      expect(messages[0].role).toBe('user');
      expect(messages[0].content).toContain('Sony WH-1000XM5');
    });
  });

  describe('validateDealSummaryResponse', () => {
    it('should validate a correct response', () => {
      const validJson = JSON.stringify(EXAMPLE_EXPECTED_RESPONSE);
      const result = validateDealSummaryResponse(validJson);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(result.data?.qualityScore).toBe(88);
    });

    it('should handle markdown code blocks', () => {
      const jsonWithMarkdown = '```json\n' + JSON.stringify(EXAMPLE_EXPECTED_RESPONSE) + '\n```';
      const result = validateDealSummaryResponse(jsonWithMarkdown);

      expect(result.valid).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should reject invalid JSON', () => {
      const result = validateDealSummaryResponse('not valid json');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('JSON parsing failed');
    });

    it('should reject missing required fields', () => {
      const incomplete = {
        summary: 'Test summary',
        // missing other required fields
      };
      const result = validateDealSummaryResponse(JSON.stringify(incomplete));

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Validation errors');
    });

    it('should reject invalid quality score range', () => {
      const invalid = {
        ...EXAMPLE_EXPECTED_RESPONSE,
        qualityScore: 150, // Out of range
      };
      const result = validateDealSummaryResponse(JSON.stringify(invalid));

      expect(result.valid).toBe(false);
      expect(result.error).toContain('qualityScore must be a number between 0 and 100');
    });

    it('should reject invalid price drop significance', () => {
      const invalid = {
        ...EXAMPLE_EXPECTED_RESPONSE,
        priceDropSignificance: 'invalid',
      };
      const result = validateDealSummaryResponse(JSON.stringify(invalid));

      expect(result.valid).toBe(false);
      expect(result.error).toContain('priceDropSignificance must be one of');
    });

    it('should reject score breakdown exceeding limits', () => {
      const invalid = {
        ...EXAMPLE_EXPECTED_RESPONSE,
        scoreBreakdown: {
          authenticityScore: 35, // Max is 30
          priceDropScore: 18,
          relevanceScore: 23,
          descriptionQualityScore: 19,
        },
      };
      const result = validateDealSummaryResponse(JSON.stringify(invalid));

      expect(result.valid).toBe(false);
      expect(result.error).toContain('authenticityScore must be between 0 and 30');
    });

    it('should reject mismatched score totals', () => {
      const invalid = {
        ...EXAMPLE_EXPECTED_RESPONSE,
        qualityScore: 100, // Doesn't match breakdown total
      };
      const result = validateDealSummaryResponse(JSON.stringify(invalid));

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Score breakdown total');
    });

    it('should sanitize tags to lowercase', () => {
      const response = {
        ...EXAMPLE_EXPECTED_RESPONSE,
        tags: ['WIRELESS', 'Noise-Cancelling', 'premium'],
      };
      const result = validateDealSummaryResponse(JSON.stringify(response));

      expect(result.valid).toBe(true);
      expect(result.data?.tags).toEqual(['wireless', 'noise-cancelling', 'premium']);
    });

    it('should trim whitespace from text fields', () => {
      const response = {
        ...EXAMPLE_EXPECTED_RESPONSE,
        summary: '  Summary with extra spaces  ',
        reasoning: '  Reasoning with spaces  ',
      };
      const result = validateDealSummaryResponse(JSON.stringify(response));

      expect(result.valid).toBe(true);
      expect(result.data?.summary).toBe('Summary with extra spaces');
      expect(result.data?.reasoning).toBe('Reasoning with spaces');
    });
  });
});
