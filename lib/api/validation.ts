/**
 * API Validation Utilities
 *
 * Request validation helpers using Zod
 * Provides common validation schemas and middleware patterns
 */

import { z } from 'zod';
import { NextRequest } from 'next/server';
import { ValidationError } from './error-handler';

/**
 * Common Validation Schemas
 */

/**
 * URL validation schema
 */
export const urlSchema = z
  .string()
  .url('Must be a valid URL')
  .min(1, 'URL is required');

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .email('Must be a valid email address')
  .min(1, 'Email is required');

/**
 * Positive integer validation schema
 */
export const positiveIntSchema = z
  .number()
  .int('Must be an integer')
  .positive('Must be a positive number');

/**
 * Non-empty string validation schema
 */
export const nonEmptyStringSchema = z
  .string()
  .min(1, 'This field is required')
  .trim();

/**
 * Optional URL validation schema
 */
export const optionalUrlSchema = z
  .string()
  .url('Must be a valid URL')
  .optional()
  .or(z.literal(''));

/**
 * Deal Validation Schemas
 */

/**
 * Schema for creating a new deal
 */
export const createDealSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less')
    .trim(),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(2000, 'Description must be 2000 characters or less')
    .trim(),
  productUrl: urlSchema,
  productImageUrl: optionalUrlSchema,
  category: z
    .string()
    .min(1, 'Category is required')
    .trim(),
  tags: z
    .array(z.string().trim())
    .optional()
    .default([]),
  originalPrice: z
    .number()
    .positive('Original price must be positive')
    .optional(),
  dealPrice: z
    .number()
    .positive('Deal price must be positive')
    .optional(),
  affiliateUrl: optionalUrlSchema,
});

/**
 * Schema for updating a deal
 */
export const updateDealSchema = createDealSchema.partial();

/**
 * Schema for deal ID parameter
 */
export const dealIdSchema = z.object({
  id: z.string().uuid('Invalid deal ID format'),
});

/**
 * Vote Validation Schemas
 */

/**
 * Schema for creating/updating a vote
 */
export const voteSchema = z.object({
  dealId: z.string().uuid('Invalid deal ID'),
  value: z.enum(['up', 'down'], {
    message: 'Vote must be either "up" or "down"',
  }),
});

/**
 * Comment Validation Schemas
 */

/**
 * Schema for creating a comment
 */
export const createCommentSchema = z.object({
  dealId: z.string().uuid('Invalid deal ID'),
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment must be 1000 characters or less')
    .trim(),
  parentId: z
    .string()
    .uuid('Invalid parent comment ID')
    .optional(),
});

/**
 * Schema for updating a comment
 */
export const updateCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment must be 1000 characters or less')
    .trim(),
});

/**
 * Query Parameter Validation Schemas
 */

/**
 * Schema for pagination parameters
 */
export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive().max(1000)),
  limit: z
    .string()
    .optional()
    .default('20')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive().max(100)),
});

/**
 * Schema for sorting parameters
 */
export const sortSchema = z.object({
  sortBy: z
    .enum(['createdAt', 'score', 'title', 'dealPrice'])
    .optional()
    .default('createdAt'),
  sortOrder: z
    .enum(['asc', 'desc'])
    .optional()
    .default('desc'),
});

/**
 * Schema for filtering deals
 */
export const dealFilterSchema = z.object({
  category: z.string().optional(),
  tag: z.string().optional(),
  minPrice: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined))
    .pipe(z.number().positive().optional()),
  maxPrice: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined))
    .pipe(z.number().positive().optional()),
  search: z.string().optional(),
});

/**
 * Validation Helper Functions
 */

/**
 * Validates request body against a Zod schema
 *
 * @param data - The data to validate
 * @param schema - The Zod schema to validate against
 * @returns Validated and parsed data
 * @throws ValidationError if validation fails
 *
 * @example
 * const validatedData = await validateBody(await request.json(), createDealSchema);
 */
export function validateBody<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw result.error;
  }

  return result.data;
}

/**
 * Validates URL search parameters against a Zod schema
 *
 * @param searchParams - URL search parameters
 * @param schema - The Zod schema to validate against
 * @returns Validated and parsed parameters
 * @throws ValidationError if validation fails
 *
 * @example
 * const params = validateSearchParams(request.nextUrl.searchParams, paginationSchema);
 */
export function validateSearchParams<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): T {
  const params = Object.fromEntries(searchParams.entries());
  const result = schema.safeParse(params);

  if (!result.success) {
    throw result.error;
  }

  return result.data;
}

/**
 * Validates route parameters against a Zod schema
 *
 * @param params - Route parameters
 * @param schema - The Zod schema to validate against
 * @returns Validated and parsed parameters
 * @throws ValidationError if validation fails
 *
 * @example
 * const { id } = validateParams(params, dealIdSchema);
 */
export function validateParams<T>(
  params: unknown,
  schema: z.ZodSchema<T>
): T {
  const result = schema.safeParse(params);

  if (!result.success) {
    throw result.error;
  }

  return result.data;
}

/**
 * Parses and validates JSON from request body
 *
 * @param request - Next.js request object
 * @returns Parsed JSON data
 * @throws ValidationError if JSON parsing fails
 *
 * @example
 * const body = await parseRequestBody(request);
 * const validatedData = validateBody(body, createDealSchema);
 */
export async function parseRequestBody(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch (error) {
    throw new ValidationError('Invalid JSON in request body');
  }
}

/**
 * Validates request body in one step
 *
 * @param request - Next.js request object
 * @param schema - The Zod schema to validate against
 * @returns Validated and parsed data
 * @throws ValidationError if parsing or validation fails
 *
 * @example
 * export async function POST(request: NextRequest) {
 *   const data = await validateRequest(request, createDealSchema);
 *   // data is fully typed and validated
 * }
 */
export async function validateRequest<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<T> {
  const body = await parseRequestBody(request);
  return validateBody(body, schema);
}

/**
 * Validation middleware pattern helper
 *
 * @param schema - The Zod schema to validate against
 * @returns Middleware function that validates request body
 *
 * @example
 * const validateDeal = createValidationMiddleware(createDealSchema);
 *
 * export async function POST(request: NextRequest) {
 *   const data = await validateDeal(request);
 *   // data is fully typed and validated
 * }
 */
export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return async (request: NextRequest): Promise<T> => {
    return validateRequest(request, schema);
  };
}

/**
 * Type exports for TypeScript usage
 */
export type CreateDealInput = z.infer<typeof createDealSchema>;
export type UpdateDealInput = z.infer<typeof updateDealSchema>;
export type VoteInput = z.infer<typeof voteSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type PaginationParams = z.infer<typeof paginationSchema>;
export type SortParams = z.infer<typeof sortSchema>;
export type DealFilterParams = z.infer<typeof dealFilterSchema>;
