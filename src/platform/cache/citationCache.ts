/**
 * Citation Verification Cache
 *
 * LRU cache with TTL for verified citations.
 *
 * Features:
 * - LRU (Least Recently Used) eviction
 * - TTL (Time To Live) expiration (default: 7 days)
 * - Manual invalidation (source updates, refresh)
 * - Persistent storage (optional)
 * - Cache hit rate tracking
 *
 * Usage:
 * ```typescript
 * const cache = new CitationCache({
 *   maxSize: 1000,
 *   ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
 *   persistent: true
 * });
 *
 * // Store result
 * cache.set(cacheKey, verificationResult);
 *
 * // Retrieve result
 * const result = cache.get(cacheKey);
 *
 * // Invalidate
 * cache.invalidate(cacheKey);
 * ```
 *
 * Task: 2.1.4 (Phase 1 Week 2)
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { assertDefined } from '@/simulation/utils/assertions';
import { Citation, VerificationResult } from '../mcp/citationClient';

/**
 * Cache entry
 */
interface CacheEntry {
  /**
   * Cache key
   */
  key: string;

  /**
   * Verification result
   */
  result: VerificationResult;

  /**
   * Entry timestamp
   */
  timestamp: number;

  /**
   * Last accessed timestamp
   */
  lastAccessed: number;

  /**
   * Access count
   */
  accessCount: number;

  /**
   * Expiration timestamp
   */
  expiresAt: number;
}

/**
 * Cache configuration
 */
export interface CitationCacheConfig {
  /**
   * Maximum cache size (entries)
   * Default: 1000
   */
  maxSize?: number;

  /**
   * Time to live (ms)
   * Default: 7 * 24 * 60 * 60 * 1000 (7 days)
   */
  ttl?: number;

  /**
   * Enable persistent storage
   * Default: false
   */
  persistent?: boolean;

  /**
   * Persistence file path
   * Default: '/logs/citation_cache.json'
   */
  persistencePath?: string;

  /**
   * Auto-save interval (ms)
   * Default: 60000 (1 minute)
   */
  autoSaveInterval?: number;

  /**
   * Enable logging
   * Default: false
   */
  enableLogging?: boolean;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  size: number;
  maxSize: number;
  hits: number;
  misses: number;
  hitRate: number;
  evictions: number;
  expirations: number;
  avgAccessCount: number;
}

/**
 * Citation Cache
 *
 * LRU cache for citation verification results.
 */
export class CitationCache {
  private config: Required<CitationCacheConfig>;
  private cache: Map<string, CacheEntry>;
  private hits: number;
  private misses: number;
  private evictions: number;
  private expirations: number;
  private autoSaveTimer?: NodeJS.Timeout;

  constructor(config?: CitationCacheConfig) {
    this.config = {
      maxSize: config?.maxSize ?? 1000,
      ttl: config?.ttl ?? 7 * 24 * 60 * 60 * 1000, // 7 days
      persistent: config?.persistent ?? false,
      persistencePath: config?.persistencePath ?? '/logs/citation_cache.json',
      autoSaveInterval: config?.autoSaveInterval ?? 60000,
      enableLogging: config?.enableLogging ?? false,
    };

    this.cache = new Map();
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
    this.expirations = 0;

    // Load from file if persistent
    if (this.config.persistent) {
      this.loadFromFile();

      // Start auto-save timer
      this.autoSaveTimer = setInterval(() => {
        this.saveToFile();
      }, this.config.autoSaveInterval);
    }
  }

  /**
   * Get cached verification result
   *
   * @param claim - Claim text
   * @param citation - Citation metadata
   * @returns Verification result or null if not cached/expired
   */
  public get(claim: string, citation: Citation): VerificationResult | null {
    const key = this.generateKey(claim, citation);
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // Check if expired
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.expirations++;
      this.misses++;
      return null;
    }

    // Update access metadata
    entry.lastAccessed = Date.now();
    entry.accessCount++;

    this.hits++;

    if (this.config.enableLogging) {
      console.log(`✅ CitationCache: HIT for ${key.substring(0, 16)}...`);
    }

    return entry.result;
  }

  /**
   * Store verification result in cache
   *
   * @param claim - Claim text
   * @param citation - Citation metadata
   * @param result - Verification result
   */
  public set(
    claim: string,
    citation: Citation,
    result: VerificationResult
  ): void {
    assertDefined(claim, {
      location: 'CitationCache.set',
      valueName: 'claim',
    });

    assertDefined(citation, {
      location: 'CitationCache.set',
      valueName: 'citation',
    });

    assertDefined(result, {
      location: 'CitationCache.set',
      valueName: 'result',
    });

    const key = this.generateKey(claim, citation);

    // Check if cache is full
    if (this.cache.size >= this.config.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    const now = Date.now();

    const entry: CacheEntry = {
      key,
      result,
      timestamp: now,
      lastAccessed: now,
      accessCount: 0,
      expiresAt: now + this.config.ttl,
    };

    this.cache.set(key, entry);

    if (this.config.enableLogging) {
      console.log(`💾 CitationCache: SET ${key.substring(0, 16)}...`);
    }
  }

  /**
   * Invalidate cache entry
   *
   * @param claim - Claim text (optional)
   * @param citation - Citation metadata (optional)
   */
  public invalidate(claim?: string, citation?: Citation): void {
    if (claim && citation) {
      // Invalidate specific entry
      const key = this.generateKey(claim, citation);
      this.cache.delete(key);

      if (this.config.enableLogging) {
        console.log(`🗑️  CitationCache: Invalidated ${key.substring(0, 16)}...`);
      }
    } else {
      // Invalidate all
      this.cache.clear();

      if (this.config.enableLogging) {
        console.log('🗑️  CitationCache: Cleared all entries');
      }
    }
  }

  /**
   * Generate cache key from claim and citation
   *
   * @param claim - Claim text
   * @param citation - Citation metadata
   * @returns Cache key (hash)
   */
  private generateKey(claim: string, citation: Citation): string {
    // Normalize claim (lowercase, trim, remove extra whitespace)
    const normalizedClaim = claim.toLowerCase().trim().replace(/\s+/g, ' ');

    // Build key data
    const keyData = {
      claim: normalizedClaim,
      authors: citation.authors.map((a) => a.toLowerCase()).sort(),
      year: citation.year,
      doi: citation.doi?.toLowerCase(),
    };

    // Hash key data
    const hash = crypto
      .createHash('sha256')
      .update(JSON.stringify(keyData))
      .digest('hex');

    return hash;
  }

  /**
   * Check if cache entry is expired
   *
   * @param entry - Cache entry
   * @returns True if expired
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() >= entry.expiresAt;
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let lruEntry: CacheEntry | null = null;
    let lruKey: string | null = null;

    for (const [key, entry] of this.cache.entries()) {
      if (!lruEntry || entry.lastAccessed < lruEntry.lastAccessed) {
        lruEntry = entry;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
      this.evictions++;

      if (this.config.enableLogging) {
        console.log(
          `🗑️  CitationCache: Evicted LRU ${lruKey.substring(0, 16)}...`
        );
      }
    }
  }

  /**
   * Clean up expired entries
   *
   * @returns Number of entries removed
   */
  public cleanupExpired(): number {
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        this.expirations++;
        removed++;
      }
    }

    if (this.config.enableLogging && removed > 0) {
      console.log(`🗑️  CitationCache: Cleaned up ${removed} expired entries`);
    }

    return removed;
  }

  /**
   * Get cache statistics
   *
   * @returns Stats object
   */
  public getStats(): CacheStats {
    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? this.hits / totalRequests : 0;

    let totalAccessCount = 0;
    for (const entry of this.cache.values()) {
      totalAccessCount += entry.accessCount;
    }
    const avgAccessCount =
      this.cache.size > 0 ? totalAccessCount / this.cache.size : 0;

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate,
      evictions: this.evictions,
      expirations: this.expirations,
      avgAccessCount,
    };
  }

  /**
   * Reset statistics
   */
  public resetStats(): void {
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
    this.expirations = 0;
  }

  /**
   * Save cache to file
   */
  private saveToFile(): void {
    if (!this.config.persistent) {
      return;
    }

    try {
      const data = {
        entries: Array.from(this.cache.values()),
        stats: {
          hits: this.hits,
          misses: this.misses,
          evictions: this.evictions,
          expirations: this.expirations,
        },
        timestamp: Date.now(),
      };

      const dir = path.dirname(this.config.persistencePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(
        this.config.persistencePath,
        JSON.stringify(data, null, 2)
      );

      if (this.config.enableLogging) {
        console.log(
          `💾 CitationCache: Saved to ${this.config.persistencePath}`
        );
      }
    } catch (error) {
      if (this.config.enableLogging) {
        console.error(
          `❌ CitationCache: Save failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }
  }

  /**
   * Load cache from file
   */
  private loadFromFile(): void {
    if (!this.config.persistent) {
      return;
    }

    try {
      if (!fs.existsSync(this.config.persistencePath)) {
        return;
      }

      const fileContent = fs.readFileSync(this.config.persistencePath, 'utf-8');
      const data = JSON.parse(fileContent);

      // Restore entries
      if (data.entries && Array.isArray(data.entries)) {
        for (const entry of data.entries) {
          // Skip expired entries
          if (Date.now() < entry.expiresAt) {
            this.cache.set(entry.key, entry);
          }
        }
      }

      // Restore stats
      if (data.stats) {
        this.hits = data.stats.hits ?? 0;
        this.misses = data.stats.misses ?? 0;
        this.evictions = data.stats.evictions ?? 0;
        this.expirations = data.stats.expirations ?? 0;
      }

      if (this.config.enableLogging) {
        console.log(
          `📂 CitationCache: Loaded ${this.cache.size} entries from ${this.config.persistencePath}`
        );
      }
    } catch (error) {
      if (this.config.enableLogging) {
        console.error(
          `❌ CitationCache: Load failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }
  }

  /**
   * Shutdown cache (save if persistent)
   */
  public async shutdown(): Promise<void> {
    // Clear auto-save timer
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = undefined;
    }

    // Final save
    if (this.config.persistent) {
      this.saveToFile();
    }

    if (this.config.enableLogging) {
      console.log('⏹️  CitationCache: Shutdown');
    }
  }

  /**
   * Get cache entry by exact key (for testing)
   *
   * @param key - Cache key
   * @returns Cache entry or null
   */
  public getByKey(key: string): CacheEntry | null {
    return this.cache.get(key) ?? null;
  }

  /**
   * Get all cache entries (for debugging)
   *
   * @returns Array of cache entries
   */
  public getAllEntries(): CacheEntry[] {
    return Array.from(this.cache.values());
  }
}

/**
 * Create citation cache
 *
 * @param config - Cache configuration
 * @returns CitationCache instance
 */
export function createCitationCache(
  config?: CitationCacheConfig
): CitationCache {
  return new CitationCache(config);
}
