/**
 * API Error Handler
 *
 * Global error handling utilities for Next.js API routes
 * Provides error type detection, logging, and user-friendly error messages
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { errorResponse, validationErrorResponse, HTTP_STATUS } from './response';

/**
 * Error Types
 */
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  DATABASE = 'DATABASE',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  EXTERNAL_API = 'EXTERNAL_API',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Custom Application Error
 */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    public errorCode?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Validation Error
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, HTTP_STATUS.UNPROCESSABLE_ENTITY, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Database Error
 */
export class DatabaseError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'DATABASE_ERROR', details);
    this.name = 'DatabaseError';
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

/**
 * Authentication Error
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, HTTP_STATUS.UNAUTHORIZED, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Authorization Error
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, HTTP_STATUS.FORBIDDEN, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

/**
 * Not Found Error
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Rate Limit Error
 */
export class RateLimitError extends AppError {
  constructor(public retryAfter?: number) {
    super('Too many requests', HTTP_STATUS.TOO_MANY_REQUESTS, 'RATE_LIMIT_EXCEEDED', {
      retryAfter,
    });
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * Detects the type of error
 *
 * @param error - The error to detect
 * @returns ErrorType enum value
 */
function detectErrorType(error: unknown): ErrorType {
  if (error instanceof ValidationError || error instanceof ZodError) {
    return ErrorType.VALIDATION;
  }
  if (error instanceof DatabaseError) {
    return ErrorType.DATABASE;
  }
  if (error instanceof AuthenticationError) {
    return ErrorType.AUTHENTICATION;
  }
  if (error instanceof AuthorizationError) {
    return ErrorType.AUTHORIZATION;
  }
  if (error instanceof NotFoundError) {
    return ErrorType.NOT_FOUND;
  }
  if (error instanceof RateLimitError) {
    return ErrorType.RATE_LIMIT;
  }

  // Check for common database error patterns
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes('database') || message.includes('sqlite') || message.includes('sql')) {
      return ErrorType.DATABASE;
    }
    if (message.includes('fetch') || message.includes('network') || message.includes('api')) {
      return ErrorType.EXTERNAL_API;
    }
  }

  return ErrorType.UNKNOWN;
}

/**
 * Formats Zod validation errors into a readable format
 *
 * @param error - Zod validation error
 * @returns Object mapping field names to error messages
 */
function formatZodError(error: ZodError): Record<string, string[]> {
  const formattedErrors: Record<string, string[]> = {};

  error.issues.forEach((err) => {
    const path = err.path.join('.');
    const message = err.message;

    if (!formattedErrors[path]) {
      formattedErrors[path] = [];
    }
    formattedErrors[path].push(message);
  });

  return formattedErrors;
}

/**
 * Logs error details for monitoring and debugging
 *
 * @param error - The error to log
 * @param context - Additional context information
 */
function logError(error: unknown, context?: Record<string, unknown>): void {
  const errorType = detectErrorType(error);
  const timestamp = new Date().toISOString();

  // In production, this would integrate with a logging service (e.g., Sentry, LogRocket)
  console.error('[API Error]', {
    timestamp,
    type: errorType,
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : error,
    context,
  });

  // For database errors, log additional details
  if (errorType === ErrorType.DATABASE) {
    console.error('[Database Error Details]', {
      timestamp,
      error,
    });
  }
}

/**
 * Converts technical error messages to user-friendly messages
 *
 * @param error - The error to convert
 * @returns User-friendly error message
 */
function getUserFriendlyMessage(error: unknown): string {
  const errorType = detectErrorType(error);

  switch (errorType) {
    case ErrorType.VALIDATION:
      return 'Please check your input and try again.';
    case ErrorType.DATABASE:
      return 'A database error occurred. Please try again later.';
    case ErrorType.AUTHENTICATION:
      return 'Authentication required. Please sign in.';
    case ErrorType.AUTHORIZATION:
      return 'You do not have permission to perform this action.';
    case ErrorType.NOT_FOUND:
      return error instanceof Error ? error.message : 'Resource not found.';
    case ErrorType.RATE_LIMIT:
      return 'Too many requests. Please slow down.';
    case ErrorType.EXTERNAL_API:
      return 'An external service is unavailable. Please try again later.';
    default:
      return 'An unexpected error occurred. Please try again later.';
  }
}

/**
 * Global error handler for API routes
 *
 * @param error - The error to handle
 * @param context - Optional context information for logging
 * @returns NextResponse with appropriate error response
 *
 * @example
 * try {
 *   // API logic
 * } catch (error) {
 *   return handleApiError(error, { userId: session.user.id });
 * }
 */
export function handleApiError(
  error: unknown,
  context?: Record<string, unknown>
): NextResponse {
  // Log the error
  logError(error, context);

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const formattedErrors = formatZodError(error);
    return validationErrorResponse(formattedErrors);
  }

  // Handle custom application errors
  if (error instanceof AppError) {
    return errorResponse(
      error.message,
      error.statusCode,
      error.errorCode,
      error.details
    );
  }

  // Handle generic errors
  if (error instanceof Error) {
    // In production, don't expose internal error messages
    const isDevelopment = process.env.NODE_ENV === 'development';
    const message = isDevelopment ? error.message : getUserFriendlyMessage(error);

    return errorResponse(
      message,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      'INTERNAL_ERROR',
      isDevelopment ? { stack: error.stack } : undefined
    );
  }

  // Handle unknown errors
  return errorResponse(
    'An unexpected error occurred',
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    'UNKNOWN_ERROR'
  );
}

/**
 * Wraps an API route handler with error handling
 *
 * @param handler - The API route handler function
 * @returns Wrapped handler with automatic error handling
 *
 * @example
 * export const GET = withErrorHandler(async (request) => {
 *   const deals = await getDeals();
 *   return successResponse(deals);
 * });
 */
export function withErrorHandler<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T
): T {
  return (async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  }) as T;
}

/**
 * Asserts that a value is truthy, throwing NotFoundError if not
 *
 * @param value - The value to check
 * @param message - Error message if value is falsy
 * @throws NotFoundError if value is falsy
 *
 * @example
 * const deal = await db.query.deals.findFirst(...);
 * assertFound(deal, 'Deal');
 */
export function assertFound<T>(
  value: T | null | undefined,
  resource: string = 'Resource'
): asserts value is T {
  if (!value) {
    throw new NotFoundError(resource);
  }
}

/**
 * Asserts that a user is authenticated, throwing AuthenticationError if not
 *
 * @param user - The user object to check
 * @throws AuthenticationError if user is null/undefined
 *
 * @example
 * const session = await getServerSession();
 * assertAuthenticated(session?.user);
 */
export function assertAuthenticated<T>(
  user: T | null | undefined
): asserts user is T {
  if (!user) {
    throw new AuthenticationError();
  }
}

/**
 * Asserts that a user is authorized, throwing AuthorizationError if not
 *
 * @param condition - The authorization condition to check
 * @param message - Optional custom error message
 * @throws AuthorizationError if condition is false
 *
 * @example
 * assertAuthorized(deal.userId === session.user.id, 'You can only edit your own deals');
 */
export function assertAuthorized(
  condition: boolean,
  message?: string
): asserts condition {
  if (!condition) {
    throw new AuthorizationError(message);
  }
}
