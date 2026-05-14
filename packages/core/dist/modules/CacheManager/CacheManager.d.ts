/**
 * 缓存管理模块
 * 提供基于内存的缓存功能，支持 TTL 和 LRU 驱逐策略
 */
export interface CacheConfig {
    maxSize: number;
    ttl: number;
    storage: 'memory' | 'localStorage';
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
/**
 * 两级缓存管理器
 * L1 为进程内内存缓存，L2 为 localStorage 持久化缓存
 * L1 命中时直接返回，L1 未命中时查询 L2 并回填 L1
 */
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