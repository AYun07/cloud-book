/**
 * Cloud Book - 统一错误处理
 * 遵循云开发最佳实践
 */

export class CloudBookError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'CloudBookError';
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
        statusCode: this.statusCode,
        timestamp: new Date().toISOString()
      }
    };
  }
}

export class ValidationError extends CloudBookError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', details, 400);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends CloudBookError {
  constructor(resource: string, id?: string) {
    super(
      id ? `${resource} with id '${id}' not found` : `${resource} not found`,
      'NOT_FOUND',
      { resource, id },
      404
    );
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends CloudBookError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 'UNAUTHORIZED', undefined, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ConflictError extends CloudBookError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'CONFLICT', details, 409);
    this.name = 'ConflictError';
  }
}

export class LLMError extends CloudBookError {
  constructor(
    message: string,
    public provider?: string,
    public model?: string,
    details?: Record<string, any>
  ) {
    super(message, 'LLM_ERROR', { provider, model, ...details }, 502);
    this.name = 'LLMError';
  }
}

export class StorageError extends CloudBookError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'STORAGE_ERROR', details, 500);
    this.name = 'StorageError';
  }
}

export class RateLimitError extends CloudBookError {
  constructor(
    public retryAfter: number,
    details?: Record<string, any>
  ) {
    super('Rate limit exceeded', 'RATE_LIMIT', { retryAfter, ...details }, 429);
    this.name = 'RateLimitError';
  }
}

export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  CONFLICT: 'CONFLICT',
  LLM_ERROR: 'LLM_ERROR',
  STORAGE_ERROR: 'STORAGE_ERROR',
  RATE_LIMIT: 'RATE_LIMIT',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
} as const;

export function isCloudBookError(error: unknown): error is CloudBookError {
  return error instanceof CloudBookError;
}

export function handleError(error: unknown, context?: string): CloudBookError {
  if (isCloudBookError(error)) {
    if (context) {
      console.error(`[${context}]`, error.toJSON());
    }
    return error;
  }

  if (error instanceof Error) {
    const cloudBookError = new CloudBookError(
      error.message,
      ErrorCodes.INTERNAL_ERROR,
      { originalError: error.name, stack: error.stack },
      500
    );
    if (context) {
      console.error(`[${context}]`, cloudBookError.toJSON());
    }
    return cloudBookError;
  }

  const unknownError = new CloudBookError(
    'An unknown error occurred',
    ErrorCodes.INTERNAL_ERROR,
    { error: String(error) },
    500
  );
  if (context) {
    console.error(`[${context}]`, unknownError.toJSON());
  }
  return unknownError;
}
