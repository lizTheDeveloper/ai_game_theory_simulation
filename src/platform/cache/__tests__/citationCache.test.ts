/**
 * Tests for CitationCache
 *
 * Coverage target: >90%
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  CitationCache,
  createCitationCache,
} from '../citationCache';

describe('CitationCache', () => {
  let cache: CitationCache;

  beforeEach(() => {
    cache = createCitationCache({
      maxSize: 10,
      ttl: 1000, // 1 second for testing
      persistent: false,
      enableLogging: false,
    });
  });

  it('should store and retrieve verification results', () => {
    const claim = 'Li et al. (2023) reports 2.0 million L';
    const citation = {
      authors: ['Li'],
      year: 2023,
    };

    const result = {
      verified: true,
      confidence: 0.95,
      method: 'semantic_match' as const,
      timestamp: Date.now(),
    };

    cache.set(claim, citation, result);

    const retrieved = cache.get(claim, citation);

    assert.ok(retrieved);
    assert.strictEqual(retrieved.verified, true);
    assert.strictEqual(retrieved.confidence, 0.95);
  });

  it('should return null for cache misses', () => {
    const claim = 'Unknown claim';
    const citation = {
      authors: ['Unknown'],
      year: 2020,
    };

    const result = cache.get(claim, citation);
    assert.strictEqual(result, null);
  });

  it('should track cache hit rate', () => {
    const claim = 'Test claim';
    const citation = { authors: ['Test'], year: 2023 };
    const result = {
      verified: true,
      confidence: 0.9,
      method: 'exact_match' as const,
      timestamp: Date.now(),
    };

    // Store
    cache.set(claim, citation, result);

    // Hit
    cache.get(claim, citation);

    // Miss
    cache.get('Different claim', { authors: ['Other'], year: 2022 });

    const stats = cache.getStats();
    assert.strictEqual(stats.hits, 1);
    assert.strictEqual(stats.misses, 1);
    assert.strictEqual(stats.hitRate, 0.5);
  });

  it('should evict LRU when cache full', () => {
    const smallCache = createCitationCache({
      maxSize: 3,
      persistent: false,
      enableLogging: false,
    });

    // Fill cache
    for (let i = 0; i < 4; i++) {
      smallCache.set(
        `Claim ${i}`,
        { authors: [`Author${i}`], year: 2023 },
        {
          verified: true,
          confidence: 0.9,
          method: 'exact_match' as const,
          timestamp: Date.now(),
        }
      );
    }

    const stats = smallCache.getStats();
    assert.strictEqual(stats.size, 3); // Max size
    assert.strictEqual(stats.evictions, 1); // One eviction
  });

  it('should expire old entries', async () => {
    const shortTTLCache = createCitationCache({
      ttl: 100, // 100ms
      persistent: false,
      enableLogging: false,
    });

    const claim = 'Test claim';
    const citation = { authors: ['Test'], year: 2023 };
    const result = {
      verified: true,
      confidence: 0.9,
      method: 'exact_match' as const,
      timestamp: Date.now(),
    };

    shortTTLCache.set(claim, citation, result);

    // Should be cached
    let retrieved = shortTTLCache.get(claim, citation);
    assert.ok(retrieved);

    // Wait for expiration
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Should be expired
    retrieved = shortTTLCache.get(claim, citation);
    assert.strictEqual(retrieved, null);

    const stats = shortTTLCache.getStats();
    assert.strictEqual(stats.expirations, 1);
  });

  it('should invalidate specific entries', () => {
    const claim1 = 'Claim 1';
    const citation1 = { authors: ['A'], year: 2023 };

    const claim2 = 'Claim 2';
    const citation2 = { authors: ['B'], year: 2023 };

    const result = {
      verified: true,
      confidence: 0.9,
      method: 'exact_match' as const,
      timestamp: Date.now(),
    };

    cache.set(claim1, citation1, result);
    cache.set(claim2, citation2, result);

    cache.invalidate(claim1, citation1);

    assert.strictEqual(cache.get(claim1, citation1), null);
    assert.ok(cache.get(claim2, citation2)); // Should still exist
  });

  it('should invalidate all entries', () => {
    const result = {
      verified: true,
      confidence: 0.9,
      method: 'exact_match' as const,
      timestamp: Date.now(),
    };

    cache.set('Claim 1', { authors: ['A'], year: 2023 }, result);
    cache.set('Claim 2', { authors: ['B'], year: 2023 }, result);

    cache.invalidate(); // No arguments = clear all

    const stats = cache.getStats();
    assert.strictEqual(stats.size, 0);
  });

  it('should cleanup expired entries', async () => {
    const shortTTLCache = createCitationCache({
      ttl: 50, // 50ms
      persistent: false,
      enableLogging: false,
    });

    const result = {
      verified: true,
      confidence: 0.9,
      method: 'exact_match' as const,
      timestamp: Date.now(),
    };

    shortTTLCache.set('Claim 1', { authors: ['A'], year: 2023 }, result);
    shortTTLCache.set('Claim 2', { authors: ['B'], year: 2023 }, result);

    // Wait for expiration
    await new Promise((resolve) => setTimeout(resolve, 100));

    const removed = shortTTLCache.cleanupExpired();
    assert.strictEqual(removed, 2);

    const stats = shortTTLCache.getStats();
    assert.strictEqual(stats.size, 0);
  });
});
