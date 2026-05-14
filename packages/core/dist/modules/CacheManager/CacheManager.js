"use strict";
/**
 * 缓存管理模块
 * 提供基于内存的缓存功能，支持 TTL 和 LRU 驱逐策略
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiLevelCache = exports.CacheManager = void 0;
class CacheManager {
    cache = new Map();
    config;
    stats = {
        hits: 0,
        misses: 0,
        evictions: 0
    };
    storageKey;
    constructor(config) {
        this.config = {
            maxSize: config.maxSize || 1000,
            ttl: config.ttl || 3600000,
            storage: config.storage || 'memory',
            ...config
        };
        this.storageKey = config.storageKey;
        if (this.config.storage !== 'memory') {
            this.loadFromStorage();
        }
    }
    set(key, value, ttl) {
        const now = Date.now();
        const entry = {
            key,
            value,
            timestamp: now,
            expiresAt: now + (ttl || this.config.ttl),
            size: this.calculateSize(value),
            hits: 0
        };
        if (this.cache.size >= this.config.maxSize && !this.cache.has(key)) {
            this.evict();
        }
        this.cache.set(key, entry);
        this.saveToStorage();
    }
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            this.stats.misses++;
            return undefined;
        }
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            this.stats.misses++;
            this.saveToStorage();
            return undefined;
        }
        entry.hits++;
        this.stats.hits++;
        return entry.value;
    }
    has(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return false;
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            this.saveToStorage();
            return false;
        }
        return true;
    }
    delete(key) {
        const deleted = this.cache.delete(key);
        if (deleted) {
            this.saveToStorage();
        }
        return deleted;
    }
    clear() {
        this.cache.clear();
        this.stats = { hits: 0, misses: 0, evictions: 0 };
        this.saveToStorage();
    }
    getOrSet(key, factory, ttl) {
        const cached = this.get(key);
        if (cached !== undefined) {
            return cached;
        }
        const result = factory();
        if (result instanceof Promise) {
            return result.then(value => {
                this.set(key, value, ttl);
                return value;
            });
        }
        this.set(key, result, ttl);
        return result;
    }
    async getOrSetAsync(key, factory, ttl) {
        const cached = this.get(key);
        if (cached !== undefined) {
            return cached;
        }
        const value = await factory();
        this.set(key, value, ttl);
        return value;
    }
    invalidate(pattern) {
        let count = 0;
        const keys = Array.from(this.cache.keys());
        for (const key of keys) {
            const matches = typeof pattern === 'string'
                ? key === pattern
                : pattern.test(key);
            if (matches) {
                this.cache.delete(key);
                count++;
            }
        }
        if (count > 0) {
            this.saveToStorage();
        }
        return count;
    }
    getStats() {
        const total = this.stats.hits + this.stats.misses;
        return {
            size: this.cache.size,
            maxSize: this.config.maxSize,
            hitRate: total > 0 ? this.stats.hits / total : 0,
            hits: this.stats.hits,
            misses: this.stats.misses,
            evictions: this.stats.evictions
        };
    }
    evict() {
        let oldestKey = null;
        let oldestTime = Date.now();
        for (const [key, entry] of this.cache) {
            if (entry.expiresAt < oldestTime) {
                oldestTime = entry.expiresAt;
                oldestKey = key;
            }
        }
        if (oldestKey) {
            this.cache.delete(oldestKey);
            this.stats.evictions++;
        }
    }
    calculateSize(value) {
        try {
            return JSON.stringify(value).length;
        }
        catch {
            return 0;
        }
    }
    saveToStorage() {
        if (this.config.storage === 'memory')
            return;
        try {
            const data = Array.from(this.cache.entries()).map(([k, entry]) => ({
                ...entry,
                key: k
            }));
            if (this.config.storage === 'localStorage' && typeof localStorage !== 'undefined') {
                localStorage.setItem(this.storageKey, JSON.stringify(data));
            }
        }
        catch (error) {
            console.error('Failed to save cache to storage:', error);
        }
    }
    loadFromStorage() {
        if (this.config.storage === 'memory')
            return;
        try {
            if (this.config.storage === 'localStorage' && typeof localStorage !== 'undefined') {
                const stored = localStorage.getItem(this.storageKey);
                if (stored) {
                    const data = JSON.parse(stored);
                    for (const item of data) {
                        if (Date.now() < item.expiresAt) {
                            this.cache.set(item.key, item);
                        }
                    }
                }
            }
        }
        catch (error) {
            console.error('Failed to load cache from storage:', error);
        }
    }
    cleanup() {
        const now = Date.now();
        let count = 0;
        for (const [key, entry] of this.cache) {
            if (now > entry.expiresAt) {
                this.cache.delete(key);
                count++;
            }
        }
        if (count > 0) {
            this.saveToStorage();
        }
        return count;
    }
    getEntries() {
        return Array.from(this.cache.entries()).map(([key, entry]) => ({
            key,
            entry
        }));
    }
}
exports.CacheManager = CacheManager;
/**
 * 两级缓存管理器
 * L1 为进程内内存缓存，L2 为 localStorage 持久化缓存
 * L1 命中时直接返回，L1 未命中时查询 L2 并回填 L1
 */
class MultiLevelCache {
    l1;
    l2;
    constructor(config) {
        this.l1 = new CacheManager({ ...config.l1Config, storageKey: 'l1_cache' });
        this.l2 = new CacheManager({ ...config.l2Config, storageKey: 'l2_cache' });
    }
    set(key, value, ttl) {
        this.l1.set(key, value, ttl);
        this.l2.set(key, value, ttl);
    }
    get(key) {
        const l1Value = this.l1.get(key);
        if (l1Value !== undefined) {
            return l1Value;
        }
        const l2Value = this.l2.get(key);
        if (l2Value !== undefined) {
            this.l1.set(key, l2Value);
            return l2Value;
        }
        return undefined;
    }
    invalidate(pattern) {
        const l1Count = this.l1.invalidate(pattern);
        const l2Count = this.l2.invalidate(pattern);
        return l1Count + l2Count;
    }
    clear() {
        this.l1.clear();
        this.l2.clear();
    }
    getStats() {
        return {
            l1: this.l1.getStats(),
            l2: this.l2.getStats()
        };
    }
}
exports.MultiLevelCache = MultiLevelCache;
exports.default = CacheManager;
//# sourceMappingURL=CacheManager.js.map