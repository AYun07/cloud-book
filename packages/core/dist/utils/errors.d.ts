/**
 * Cloud Book - 统一错误处理
 * 遵循云开发最佳实践
 */
export declare class CloudBookError extends Error {
    code: string;
    details?: Record<string, any>;
    statusCode: number;
    constructor(message: string, code: string, details?: Record<string, any>, statusCode?: number);
    toJSON(): {
        error: {
            code: string;
            message: string;
            details: Record<string, any>;
            statusCode: number;
            timestamp: string;
        };
    };
}
export declare class ValidationError extends CloudBookError {
    constructor(message: string, details?: Record<string, any>);
}
export declare class NotFoundError extends CloudBookError {
    constructor(resource: string, id?: string);
}
export declare class UnauthorizedError extends CloudBookError {
    constructor(message?: string);
}
export declare class ConflictError extends CloudBookError {
    constructor(message: string, details?: Record<string, any>);
}
export declare class LLMError extends CloudBookError {
    provider?: string;
    model?: string;
    constructor(message: string, provider?: string, model?: string, details?: Record<string, any>);
}
export declare class StorageError extends CloudBookError {
    constructor(message: string, details?: Record<string, any>);
}
export declare class RateLimitError extends CloudBookError {
    retryAfter: number;
    constructor(retryAfter: number, details?: Record<string, any>);
}
export declare const ErrorCodes: {
    readonly VALIDATION_ERROR: "VALIDATION_ERROR";
    readonly NOT_FOUND: "NOT_FOUND";
    readonly UNAUTHORIZED: "UNAUTHORIZED";
    readonly CONFLICT: "CONFLICT";
    readonly LLM_ERROR: "LLM_ERROR";
    readonly STORAGE_ERROR: "STORAGE_ERROR";
    readonly RATE_LIMIT: "RATE_LIMIT";
    readonly INTERNAL_ERROR: "INTERNAL_ERROR";
};
export declare function isCloudBookError(error: unknown): error is CloudBookError;
export declare function handleError(error: unknown, context?: string): CloudBookError;
//# sourceMappingURL=errors.d.ts.map