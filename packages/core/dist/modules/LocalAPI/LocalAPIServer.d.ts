/**
 * 本地API代理服务
 * 支持离线状态下调用用户自备的云端API
 */
export interface LocalAPIConfig {
    port: number;
    host?: string;
    ssl?: {
        enabled: boolean;
        keyPath?: string;
        certPath?: string;
    };
    apiKeys: APIKeyConfig[];
    rateLimit?: {
        enabled: boolean;
        maxRequests: number;
        windowMs: number;
    };
    cache?: {
        enabled: boolean;
        maxSize: number;
        ttl: number;
    };
}
export interface APIKeyConfig {
    provider: string;
    apiKey: string;
    baseUrl?: string;
    models: string[];
    priority?: number;
}
export interface ProxyRequest {
    provider: string;
    model: string;
    messages: Array<{
        role: string;
        content: string;
    }>;
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
}
export interface ProxyResponse {
    id: string;
    model: string;
    choices: Array<{
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
    }>;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}
export interface CacheEntry {
    request: string;
    response: ProxyResponse;
    timestamp: number;
}
export declare class LocalAPIServer {
    private config;
    private server?;
    private requestCounts;
    private cache;
    constructor(config: LocalAPIConfig);
    start(): Promise<void>;
    stop(): Promise<void>;
    private handleRequest;
    private handleProxyRequest;
    private findApiKeyConfig;
    private callExternalAPI;
    private getDefaultBaseUrl;
    private checkRateLimit;
    private getCacheKey;
    private getCachedResponse;
    private setCachedResponse;
    private hashString;
    getStatus(): {
        running: boolean;
        uptime: number;
        requests: number;
    };
}
export declare class OfflineLLMManager {
    private localServer;
    private configs;
    private currentMode;
    constructor(configs: APIKeyConfig[]);
    initializeOfflineServer(port?: number): Promise<void>;
    shutdownOfflineServer(): Promise<void>;
    getMode(): 'online' | 'offline';
    addAPIKey(config: APIKeyConfig): void;
    removeAPIKey(provider: string): void;
    complete(prompt: string, options?: {
        model?: string;
        temperature?: number;
        maxTokens?: number;
    }): Promise<string>;
    private findProviderForModel;
    private callLocalServer;
    private callDirectAPI;
    private getDefaultBaseUrl;
}
export default LocalAPIServer;
//# sourceMappingURL=LocalAPIServer.d.ts.map