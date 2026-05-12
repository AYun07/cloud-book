"use strict";
/**
 * Cloud Book - 统一错误处理
 * 遵循云开发最佳实践
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCodes = exports.RateLimitError = exports.StorageError = exports.LLMError = exports.ConflictError = exports.UnauthorizedError = exports.NotFoundError = exports.ValidationError = exports.CloudBookError = void 0;
exports.isCloudBookError = isCloudBookError;
exports.handleError = handleError;
class CloudBookError extends Error {
    code;
    details;
    statusCode;
    constructor(message, code, details, statusCode = 500) {
        super(message);
        this.code = code;
        this.details = details;
        this.statusCode = statusCode;
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
exports.CloudBookError = CloudBookError;
class ValidationError extends CloudBookError {
    constructor(message, details) {
        super(message, 'VALIDATION_ERROR', details, 400);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class NotFoundError extends CloudBookError {
    constructor(resource, id) {
        super(id ? `${resource} with id '${id}' not found` : `${resource} not found`, 'NOT_FOUND', { resource, id }, 404);
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
class UnauthorizedError extends CloudBookError {
    constructor(message = 'Unauthorized access') {
        super(message, 'UNAUTHORIZED', undefined, 401);
        this.name = 'UnauthorizedError';
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ConflictError extends CloudBookError {
    constructor(message, details) {
        super(message, 'CONFLICT', details, 409);
        this.name = 'ConflictError';
    }
}
exports.ConflictError = ConflictError;
class LLMError extends CloudBookError {
    provider;
    model;
    constructor(message, provider, model, details) {
        super(message, 'LLM_ERROR', { provider, model, ...details }, 502);
        this.provider = provider;
        this.model = model;
        this.name = 'LLMError';
    }
}
exports.LLMError = LLMError;
class StorageError extends CloudBookError {
    constructor(message, details) {
        super(message, 'STORAGE_ERROR', details, 500);
        this.name = 'StorageError';
    }
}
exports.StorageError = StorageError;
class RateLimitError extends CloudBookError {
    retryAfter;
    constructor(retryAfter, details) {
        super('Rate limit exceeded', 'RATE_LIMIT', { retryAfter, ...details }, 429);
        this.retryAfter = retryAfter;
        this.name = 'RateLimitError';
    }
}
exports.RateLimitError = RateLimitError;
exports.ErrorCodes = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    UNAUTHORIZED: 'UNAUTHORIZED',
    CONFLICT: 'CONFLICT',
    LLM_ERROR: 'LLM_ERROR',
    STORAGE_ERROR: 'STORAGE_ERROR',
    RATE_LIMIT: 'RATE_LIMIT',
    INTERNAL_ERROR: 'INTERNAL_ERROR'
};
function isCloudBookError(error) {
    return error instanceof CloudBookError;
}
function handleError(error, context) {
    if (isCloudBookError(error)) {
        if (context) {
            console.error(`[${context}]`, error.toJSON());
        }
        return error;
    }
    if (error instanceof Error) {
        const cloudBookError = new CloudBookError(error.message, exports.ErrorCodes.INTERNAL_ERROR, { originalError: error.name, stack: error.stack }, 500);
        if (context) {
            console.error(`[${context}]`, cloudBookError.toJSON());
        }
        return cloudBookError;
    }
    const unknownError = new CloudBookError('An unknown error occurred', exports.ErrorCodes.INTERNAL_ERROR, { error: String(error) }, 500);
    if (context) {
        console.error(`[${context}]`, unknownError.toJSON());
    }
    return unknownError;
}
//# sourceMappingURL=errors.js.map