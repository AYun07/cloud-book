import { describe, it, expect, beforeEach } from 'vitest';
import { CacheManager } from '../src/modules/CacheManager/CacheManager';

describe('CacheManager', () => {
  let cache: CacheManager;

  beforeEach(() => {
    cache = new CacheManager({ maxSize: 100, ttl: 60000 });
  });

  describe('set and get', () => {
    it('should store and retrieve value', () => {
      cache.set('key1', { data: 'test' });
      const value = cache.get('key1');
      
      expect(value).toBeDefined();
      expect(value).toEqual({ data: 'test' });
    });

    it('should return undefined for non-existent key', () => {
      const value = cache.get('nonexistent');
      
      expect(value).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should delete existing key', () => {
      cache.set('key1', 'value1');
      const deleted = cache.delete('key1');
      
      expect(deleted).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear all cached items', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.clear();
      
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBeUndefined();
    });
  });

  describe('getStats', () => {
    it('should return cache statistics', () => {
      cache.set('key1', 'value1');
      cache.get('key1');
      cache.get('nonexistent');
      
      const stats = cache.getStats();
      
      expect(stats).toBeDefined();
      expect(stats.size).toBeGreaterThanOrEqual(0);
    });
  });
});
