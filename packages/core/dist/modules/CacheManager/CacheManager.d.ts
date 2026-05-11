/**
 * 缓存管理系统
 * 支持多种缓存策略
 */
export interface CacheConfig {
    maxSize: number;
    ttl: number;
    storage: 'memory' | 'localStorage' | 'disk';
    serializer?: 'json' | 'msgpack' | 'binary';
}
export interface CacheEntry<T> {
    key: string;
    value: T;
    timestamp: number;
    expiresAt: number;
    size: number;
    hits: number;
}
export interface CacheStats {
    size: number;
    maxSize: number;
    hitRate: number;
    hits: number;
    misses: number;
    evictions: number;
}
export declare class CacheManager<T = any> {
    private cache;
    private config;
    private stats;
    private storageKey;
    constructor(config: Partial<CacheConfig> & {
        storageKey: string;
    });
    set(key: string, value: T, ttl?: number): void;
    get(key: string): T | undefined;
    has(key: string): boolean;
    delete(key: string): boolean;
    clear(): void;
    getOrSet(key: string, factory: () => T | Promise<T>, ttl?: number): T | Promise<T>;
    getOrSetAsync(key: string, factory: () => Promise<T>, ttl?: number): Promise<T>;
    invalidate(pattern: RegExp | string): number;
    getStats(): CacheStats;
    private evict;
    private calculateSize;
    private saveToStorage;
    private loadFromStorage;
    cleanup(): number;
    getEntries(): Array<{
        key: string;
        entry: CacheEntry<T>;
    }>;
}
export declare class MultiLevelCache {
    private l1;
    private l2;
    constructor(config: {
        l1Config: Partial<CacheConfig>;
        l2Config: Partial<CacheConfig>;
    });
    set(key: string, value: any, ttl?: number): void;
    get(key: string): any;
    invalidate(pattern: RegExp | string): number;
    clear(): void;
    getStats(): {
        l1: CacheStats;
        l2: CacheStats;
    };
}
export default CacheManager;
//# sourceMappingURL=CacheManager.d.ts.map