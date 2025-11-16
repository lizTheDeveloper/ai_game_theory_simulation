/**
 * Redis Cache Client
 *
 * Production-grade Redis caching layer for:
 * - Citation verification results
 * - Session storage
 * - Rate limiting
 * - Distributed locking
 *
 * Features:
 * - Connection pooling
 * - Automatic retry on failure
 * - Health checks
 * - Metrics tracking
 * - TTL support
 * - Fallback to in-memory cache
 */

import { createClient, RedisClientType } from 'redis';
import { CitationCache } from './citationCache'; // Fallback

export interface RedisCacheConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
  enableOfflineQueue?: boolean;
  maxRetriesPerRequest?: number;
  retryStrategy?: (retries: number) => number | null;
  defaultTTL?: number; // Default TTL in seconds
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  errors: number;
  hitRate: number;
  avgLatencyMs: number;
}

export class RedisCache {
  private client: RedisClientType;
  private fallbackCache: CitationCache | null = null;
  private connected = false;
  private keyPrefix: string;
  private defaultTTL: number;

  // Metrics
  private hits = 0;
  private misses = 0;
  private sets = 0;
  private deletes = 0;
  private errors = 0;
  private totalLatencyMs = 0;
  private operationCount = 0;

  constructor(config: RedisCacheConfig) {
    this.keyPrefix = config.keyPrefix || 'citation:';
    this.defaultTTL = config.defaultTTL || 7 * 24 * 60 * 60; // 7 days

    const redisUrl = config.password
      ? `redis://:${config.password}@${config.host}:${config.port}/${config.db || 0}`
      : `redis://${config.host}:${config.port}/${config.db || 0}`;

    this.client = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: config.retryStrategy || this.defaultRetryStrategy,
      },
    }) as RedisClientType;

    this.setupEventHandlers();

    // Fallback to in-memory cache if Redis unavailable
    if (process.env.REDIS_FALLBACK_ENABLED === 'true') {
      this.fallbackCache = new CitationCache({
        maxSize: 1000,
        ttl: this.defaultTTL * 1000, // Convert to ms
        persistent: false,
      });
    }
  }

  /**
   * Connect to Redis
   */
  async connect(): Promise<void> {
    if (this.connected) return;

    try {
      await this.client.connect();
      this.connected = true;
      console.log('✅ Redis connected successfully');
    } catch (error) {
      console.error('❌ Redis connection failed:', error);
      if (this.fallbackCache) {
        console.warn('⚠️  Using fallback in-memory cache');
      } else {
        throw error;
      }
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    if (!this.connected) return;

    try {
      await this.client.quit();
      this.connected = false;
      console.log('✅ Redis disconnected');
    } catch (error) {
      console.error('❌ Redis disconnect error:', error);
      await this.client.disconnect(); // Force disconnect
    }
  }

  /**
   * Get value from cache
   */
  async get<T = any>(key: string): Promise<T | null> {
    const startTime = Date.now();
    const fullKey = this.keyPrefix + key;

    try {
      if (!this.connected && this.fallbackCache) {
        return this.fallbackCache.get(key) as T | null;
      }

      const value = await this.client.get(fullKey);

      this.recordLatency(Date.now() - startTime);

      if (value === null) {
        this.misses++;
        return null;
      }

      this.hits++;
      return JSON.parse(value) as T;
    } catch (error) {
      this.errors++;
      console.error('❌ Redis GET error:', error);

      if (this.fallbackCache) {
        return this.fallbackCache.get(key) as T | null;
      }

      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set<T = any>(key: string, value: T, ttl?: number): Promise<boolean> {
    const startTime = Date.now();
    const fullKey = this.keyPrefix + key;
    const ttlSeconds = ttl || this.defaultTTL;

    try {
      if (!this.connected && this.fallbackCache) {
        this.fallbackCache.set(key, value as any);
        return true;
      }

      const serialized = JSON.stringify(value);
      await this.client.setEx(fullKey, ttlSeconds, serialized);

      this.recordLatency(Date.now() - startTime);
      this.sets++;

      return true;
    } catch (error) {
      this.errors++;
      console.error('❌ Redis SET error:', error);

      if (this.fallbackCache) {
        this.fallbackCache.set(key, value as any);
        return true;
      }

      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<boolean> {
    const startTime = Date.now();
    const fullKey = this.keyPrefix + key;

    try {
      if (!this.connected && this.fallbackCache) {
        this.fallbackCache.invalidate(key);
        return true;
      }

      const result = await this.client.del(fullKey);

      this.recordLatency(Date.now() - startTime);
      this.deletes++;

      return result > 0;
    } catch (error) {
      this.errors++;
      console.error('❌ Redis DELETE error:', error);

      if (this.fallbackCache) {
        this.fallbackCache.invalidate(key);
        return true;
      }

      return false;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    const fullKey = this.keyPrefix + key;

    try {
      if (!this.connected && this.fallbackCache) {
        return this.fallbackCache.get(key) !== null;
      }

      const result = await this.client.exists(fullKey);
      return result > 0;
    } catch (error) {
      this.errors++;
      console.error('❌ Redis EXISTS error:', error);
      return false;
    }
  }

  /**
   * Increment counter (atomic)
   */
  async increment(key: string, amount = 1): Promise<number> {
    const fullKey = this.keyPrefix + key;

    try {
      if (!this.connected) {
        throw new Error('Redis not connected - increment not available in fallback');
      }

      return await this.client.incrBy(fullKey, amount);
    } catch (error) {
      this.errors++;
      console.error('❌ Redis INCR error:', error);
      throw error;
    }
  }

  /**
   * Set with expiration (NX - only if not exists)
   */
  async setNX(key: string, value: any, ttl: number): Promise<boolean> {
    const fullKey = this.keyPrefix + key;

    try {
      if (!this.connected) {
        throw new Error('Redis not connected - setNX not available in fallback');
      }

      const serialized = JSON.stringify(value);
      const result = await this.client.set(fullKey, serialized, {
        EX: ttl,
        NX: true,
      });

      return result === 'OK';
    } catch (error) {
      this.errors++;
      console.error('❌ Redis SETNX error:', error);
      return false;
    }
  }

  /**
   * Distributed lock (for rate limiting, mutex)
   */
  async acquireLock(lockKey: string, ttl: number): Promise<boolean> {
    return this.setNX(lockKey, { locked: true, timestamp: Date.now() }, ttl);
  }

  async releaseLock(lockKey: string): Promise<boolean> {
    return this.delete(lockKey);
  }

  /**
   * Pattern-based key deletion
   */
  async deletePattern(pattern: string): Promise<number> {
    const fullPattern = this.keyPrefix + pattern;

    try {
      if (!this.connected) {
        throw new Error('Redis not connected - deletePattern not available in fallback');
      }

      let cursor = 0;
      let deletedCount = 0;

      do {
        const result = await this.client.scan(cursor, {
          MATCH: fullPattern,
          COUNT: 100,
        });

        cursor = result.cursor;
        const keys = result.keys;

        if (keys.length > 0) {
          const deleted = await this.client.del(keys);
          deletedCount += deleted;
        }
      } while (cursor !== 0);

      return deletedCount;
    } catch (error) {
      this.errors++;
      console.error('❌ Redis DELETE PATTERN error:', error);
      return 0;
    }
  }

  /**
   * Flush all keys with prefix
   */
  async flush(): Promise<void> {
    await this.deletePattern('*');
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    latencyMs: number;
    connected: boolean;
  }> {
    const startTime = Date.now();

    try {
      await this.client.ping();
      const latencyMs = Date.now() - startTime;

      return {
        healthy: true,
        latencyMs,
        connected: this.connected,
      };
    } catch (error) {
      return {
        healthy: false,
        latencyMs: Date.now() - startTime,
        connected: this.connected,
      };
    }
  }

  /**
   * Get cache metrics
   */
  getMetrics(): CacheMetrics {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? this.hits / total : 0;
    const avgLatencyMs =
      this.operationCount > 0 ? this.totalLatencyMs / this.operationCount : 0;

    return {
      hits: this.hits,
      misses: this.misses,
      sets: this.sets,
      deletes: this.deletes,
      errors: this.errors,
      hitRate,
      avgLatencyMs,
    };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.hits = 0;
    this.misses = 0;
    this.sets = 0;
    this.deletes = 0;
    this.errors = 0;
    this.totalLatencyMs = 0;
    this.operationCount = 0;
  }

  /**
   * Get Redis info
   */
  async getInfo(): Promise<string> {
    try {
      if (!this.connected) {
        return 'Redis not connected';
      }

      return await this.client.info();
    } catch (error) {
      return `Error fetching info: ${error}`;
    }
  }

  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      console.log('🔗 Redis connecting...');
    });

    this.client.on('ready', () => {
      console.log('✅ Redis ready');
      this.connected = true;
    });

    this.client.on('error', (err) => {
      console.error('🚨 Redis error:', err);
      this.errors++;
    });

    this.client.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...');
    });

    this.client.on('end', () => {
      console.log('🔌 Redis connection closed');
      this.connected = false;
    });
  }

  private defaultRetryStrategy(retries: number): number | null {
    // Stop retrying after 10 attempts
    if (retries > 10) {
      console.error('❌ Redis max retries exceeded');
      return null;
    }

    // Exponential backoff: 100ms, 200ms, 400ms, ..., max 3s
    return Math.min(100 * Math.pow(2, retries), 3000);
  }

  private recordLatency(latencyMs: number): void {
    this.totalLatencyMs += latencyMs;
    this.operationCount++;
  }
}

/**
 * Singleton Redis cache
 */
let redisCache: RedisCache | null = null;

export function getRedisCache(config?: RedisCacheConfig): RedisCache {
  if (!redisCache) {
    if (!config) {
      // Default config from environment
      config = {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0'),
        keyPrefix: process.env.REDIS_KEY_PREFIX || 'citation:',
        defaultTTL: parseInt(process.env.REDIS_DEFAULT_TTL || `${7 * 24 * 60 * 60}`),
      };
    }

    redisCache = new RedisCache(config);
  }

  return redisCache;
}

/**
 * Close singleton Redis cache
 */
export async function closeRedisCache(): Promise<void> {
  if (redisCache) {
    await redisCache.disconnect();
    redisCache = null;
  }
}

/**
 * Rate limiter using Redis
 */
export class RedisRateLimiter {
  private cache: RedisCache;
  private windowSeconds: number;

  constructor(cache: RedisCache, windowSeconds = 60) {
    this.cache = cache;
    this.windowSeconds = windowSeconds;
  }

  /**
   * Check if request is allowed
   * @param key - Unique identifier (IP, user ID, etc.)
   * @param limit - Max requests per window
   * @returns {allowed: boolean, remaining: number, resetAt: number}
   */
  async checkLimit(
    key: string,
    limit: number
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const rateLimitKey = `ratelimit:${key}`;

    try {
      const current = await this.cache.increment(rateLimitKey, 1);

      // Set TTL on first request
      if (current === 1) {
        await this.cache.client['expire'](rateLimitKey, this.windowSeconds);
      }

      const remaining = Math.max(0, limit - current);
      const resetAt = Date.now() + this.windowSeconds * 1000;

      return {
        allowed: current <= limit,
        remaining,
        resetAt,
      };
    } catch (error) {
      console.error('❌ Rate limit check failed:', error);
      // Fail open (allow request on error)
      return { allowed: true, remaining: limit, resetAt: Date.now() };
    }
  }
}

/**
 * Session storage using Redis
 */
export class RedisSessionStore {
  private cache: RedisCache;
  private sessionTTL: number;

  constructor(cache: RedisCache, sessionTTL = 24 * 60 * 60) {
    // 24 hours
    this.cache = cache;
    this.sessionTTL = sessionTTL;
  }

  async getSession<T = any>(sessionId: string): Promise<T | null> {
    return this.cache.get<T>(`session:${sessionId}`);
  }

  async setSession<T = any>(sessionId: string, data: T, ttl?: number): Promise<boolean> {
    return this.cache.set(`session:${sessionId}`, data, ttl || this.sessionTTL);
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    return this.cache.delete(`session:${sessionId}`);
  }

  async refreshSession(sessionId: string): Promise<boolean> {
    const session = await this.getSession(sessionId);
    if (!session) return false;
    return this.setSession(sessionId, session);
  }
}
