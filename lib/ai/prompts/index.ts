/**
 * AI Prompts Module
 *
 * Centralized exports for all AI prompt templates and utilities
 */

export {
  // Deal summarization types
  type DealPromptInput,
  type DealSummaryResponse,
  type ValidationResult,

  // System prompt
  DEAL_SUMMARIZATION_SYSTEM_PROMPT,

  // Prompt building functions
  buildDealPrompt,
  buildDealSummarizationMessages,

  // Validation
  validateDealSummaryResponse,
  handleSummarizationError,

  // Examples for reference/testing
  EXAMPLE_DEAL_INPUT,
  EXAMPLE_EXPECTED_RESPONSE,
} from './summarize-deal';
