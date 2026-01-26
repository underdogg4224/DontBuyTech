/**
 * API Response Utilities
 *
 * Standardized response helpers for Next.js API routes
 * Provides consistent response formatting and HTTP status codes
 */

import { NextResponse } from 'next/server';

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  // Success
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,

  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // Server Errors
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Standard API Response Structure
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

/**
 * Creates a standardized success response
 *
 * @param data - The response data
 * @param status - HTTP status code (default: 200)
 * @returns NextResponse with standardized success format
 *
 * @example
 * return successResponse({ deals: [...] }, HTTP_STATUS.OK);
 */
export function successResponse<T>(
  data: T,
  status: number = HTTP_STATUS.OK
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  return NextResponse.json(response, { status });
}

/**
 * Creates a standardized error response
 *
 * @param message - Error message
 * @param status - HTTP status code (default: 500)
 * @param code - Optional error code for client handling
 * @param details - Optional additional error details
 * @returns NextResponse with standardized error format
 *
 * @example
 * return errorResponse('Deal not found', HTTP_STATUS.NOT_FOUND, 'DEAL_NOT_FOUND');
 */
export function errorResponse(
  message: string,
  status: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  code?: string,
  details?: unknown
): NextResponse<ApiResponse> {
  const response: ApiResponse = {
    success: false,
    error: {
      message,
      code,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  return NextResponse.json(response, { status });
}

/**
 * Creates a success response for created resources
 *
 * @param data - The created resource data
 * @returns NextResponse with 201 status
 *
 * @example
 * return createdResponse({ id: '123', title: 'New Deal' });
 */
export function createdResponse<T>(
  data: T
): NextResponse<ApiResponse<T>> {
  return successResponse(data, HTTP_STATUS.CREATED);
}

/**
 * Creates a no content response
 *
 * @returns NextResponse with 204 status
 *
 * @example
 * return noContentResponse(); // For successful DELETE operations
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: HTTP_STATUS.NO_CONTENT });
}

/**
 * Creates a validation error response
 *
 * @param errors - Validation error details
 * @returns NextResponse with 422 status
 *
 * @example
 * return validationErrorResponse({ email: 'Invalid email format' });
 */
export function validationErrorResponse(
  errors: Record<string, string | string[]>
): NextResponse<ApiResponse> {
  return errorResponse(
    'Validation failed',
    HTTP_STATUS.UNPROCESSABLE_ENTITY,
    'VALIDATION_ERROR',
    errors
  );
}

/**
 * Creates an unauthorized error response
 *
 * @param message - Optional custom message
 * @returns NextResponse with 401 status
 *
 * @example
 * return unauthorizedResponse('Invalid session token');
 */
export function unauthorizedResponse(
  message: string = 'Unauthorized'
): NextResponse<ApiResponse> {
  return errorResponse(message, HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED');
}

/**
 * Creates a forbidden error response
 *
 * @param message - Optional custom message
 * @returns NextResponse with 403 status
 *
 * @example
 * return forbiddenResponse('Insufficient permissions');
 */
export function forbiddenResponse(
  message: string = 'Forbidden'
): NextResponse<ApiResponse> {
  return errorResponse(message, HTTP_STATUS.FORBIDDEN, 'FORBIDDEN');
}

/**
 * Creates a not found error response
 *
 * @param resource - Optional resource name
 * @returns NextResponse with 404 status
 *
 * @example
 * return notFoundResponse('Deal');
 */
export function notFoundResponse(
  resource: string = 'Resource'
): NextResponse<ApiResponse> {
  return errorResponse(
    `${resource} not found`,
    HTTP_STATUS.NOT_FOUND,
    'NOT_FOUND'
  );
}

/**
 * Creates a rate limit error response
 *
 * @param retryAfter - Seconds until retry is allowed
 * @returns NextResponse with 429 status
 *
 * @example
 * return rateLimitResponse(60);
 */
export function rateLimitResponse(
  retryAfter?: number
): NextResponse<ApiResponse> {
  const headers: HeadersInit = {};
  if (retryAfter) {
    headers['Retry-After'] = retryAfter.toString();
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        message: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
        details: retryAfter ? { retryAfter } : undefined,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status: HTTP_STATUS.TOO_MANY_REQUESTS, headers }
  );
}
