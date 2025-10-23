import { LRUCache } from 'lru-cache';

interface CacheOptions {
  max: number;           // Max items
  ttl: number;           // Time to live (ms)
  updateAgeOnGet: boolean;
}

// In-memory cache for API responses
const cache = new LRUCache<string, any>({
  max: 500,              // Max 500 cached responses
  ttl: 1000 * 60 * 5,    // 5 minute TTL
  updateAgeOnGet: true,  // Refresh on access
});

export function getCached<T>(key: string): T | undefined {
  return cache.get(key) as T | undefined;
}

export function setCached<T>(key: string, value: T): void {
  cache.set(key, value);
}

export function invalidateCache(pattern?: string): void {
  if (!pattern) {
    cache.clear();
  } else {
    // Invalidate keys matching pattern
    const keys = Array.from(cache.keys());
    keys.filter(k => k.includes(pattern)).forEach(k => cache.delete(k));
  }
}

export function getCacheStats() {
  return {
    size: cache.size,
    max: cache.max,
    hits: cache.calculatedSize,
  };
}
