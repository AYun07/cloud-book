/**
 * 缓存管理系统
 * 支持多种缓存策略
 */

declare const localStorage: {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
} | undefined;

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

export class CacheManager<T = any> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private config: CacheConfig;
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0
  };
  private storageKey: string;

  constructor(config: Partial<CacheConfig> & { storageKey: string }) {
    this.config = {
      maxSize: config.maxSize || 1000,
      ttl: config.ttl || 3600000,
      storage: config.storage || 'memory',
      serializer: config.serializer || 'json',
      ...config
    };
    this.storageKey = config.storageKey;
    
    if (this.config.storage !== 'memory') {
      this.loadFromStorage();
    }
  }

  set(key: string, value: T, ttl?: number): void {
    const now = Date.now();
    const entry: CacheEntry<T> = {
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

  get(key: string): T | undefined {
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

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.saveToStorage();
      return false;
    }
    return true;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.saveToStorage();
    }
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, evictions: 0 };
    this.saveToStorage();
  }

  getOrSet(key: string, factory: () => T | Promise<T>, ttl?: number): T | Promise<T> {
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

  async getOrSetAsync(key: string, factory: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = this.get(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await factory();
    this.set(key, value, ttl);
    return value;
  }

  invalidate(pattern: RegExp | string): number {
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

  getStats(): CacheStats {
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

  private evict(): void {
    let oldestKey: string | null = null;
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

  private calculateSize(value: T): number {
    try {
      return JSON.stringify(value).length;
    } catch {
      return 0;
    }
  }

  private saveToStorage(): void {
    if (this.config.storage === 'memory') return;

    try {
      const data = Array.from(this.cache.entries()).map(([k, entry]) => ({
        ...entry,
        key: k
      }));

      if (this.config.storage === 'localStorage' && typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
      }
    } catch (error) {
      console.error('Failed to save cache to storage:', error);
    }
  }

  private loadFromStorage(): void {
    if (this.config.storage === 'memory') return;

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
    } catch (error) {
      console.error('Failed to load cache from storage:', error);
    }
  }

  cleanup(): number {
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

  getEntries(): Array<{ key: string; entry: CacheEntry<T> }> {
    return Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      entry
    }));
  }
}

export class MultiLevelCache {
  private l1: CacheManager;
  private l2: CacheManager;

  constructor(config: {
    l1Config: Partial<CacheConfig>;
    l2Config: Partial<CacheConfig>;
  }) {
    this.l1 = new CacheManager({ ...config.l1Config, storageKey: 'l1_cache' });
    this.l2 = new CacheManager({ ...config.l2Config, storageKey: 'l2_cache' });
  }

  set(key: string, value: any, ttl?: number): void {
    this.l1.set(key, value, ttl);
    this.l2.set(key, value, ttl);
  }

  get(key: string): any {
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

  invalidate(pattern: RegExp | string): number {
    const l1Count = this.l1.invalidate(pattern);
    const l2Count = this.l2.invalidate(pattern);
    return l1Count + l2Count;
  }

  clear(): void {
    this.l1.clear();
    this.l2.clear();
  }

  getStats(): { l1: CacheStats; l2: CacheStats } {
    return {
      l1: this.l1.getStats(),
      l2: this.l2.getStats()
    };
  }
}

export default CacheManager;
