/**
 * Distributed Locking Utility
 *
 * Redis-based distributed locks using SET NX EX pattern.
 * Used to prevent race conditions in multi-orchestrator deployments (e.g., 3 K8s replicas).
 *
 * Pattern: SET key value NX EX seconds
 * - NX = only set if not exists (atomic)
 * - EX = expiration in seconds (prevents deadlocks)
 *
 * Critical for:
 * - Agent state updates (prevent concurrent writes to same agent)
 * - Analysis result persistence (prevent duplicate entries)
 * - Process lifecycle management (prevent double-spawns)
 *
 * H1 FIX: Now supports RedisConnectionPool for shared connection management.
 *
 * Author: Marcus (Platform Engineer)
 * Date: 2025-11-22
 * Updated: 2025-11-28 (H1: Support RedisConnectionPool)
 */

import Redis from 'ioredis';
import { RedisConnectionPool } from './redisPool';

export interface LockOptions {
  /**
   * Lock timeout in milliseconds.
   * After this time, the lock is automatically released.
   * Default: 10000ms (10 seconds)
   */
  lockTimeout?: number;

  /**
   * How long to wait trying to acquire the lock (milliseconds).
   * Default: 5000ms (5 seconds)
   */
  acquireTimeout?: number;

  /**
   * How often to retry acquiring the lock (milliseconds).
   * Default: 50ms
   */
  retryInterval?: number;
}

export interface Lock {
  /**
   * Resource name being locked
   */
  resource: string;

  /**
   * Unique token for this lock (prevents accidental unlocking by other processes)
   */
  token: string;

  /**
   * Release the lock
   */
  release: () => Promise<boolean>;

  /**
   * Extend the lock timeout (useful for long operations)
   */
  extend: (additionalMs: number) => Promise<boolean>;
}

/**
 * Type for Redis client - can be either a direct client or a connection pool
 */
type RedisClient = Redis | RedisConnectionPool;

/**
 * Distributed lock manager using Redis.
 *
 * H1 FIX: Now supports both direct Redis client and RedisConnectionPool.
 * Using the pool is recommended for production to prevent connection exhaustion.
 *
 * Usage with pool (recommended):
 * ```typescript
 * const pool = new RedisConnectionPool({ host: 'localhost', port: 6379 });
 * const lockManager = new DistributedLockManager(pool);
 *
 * // Acquire lock
 * const lock = await lockManager.acquireLock('agent:agent_001:state', {
 *   lockTimeout: 10000,
 *   acquireTimeout: 5000
 * });
 *
 * try {
 *   // Critical section - only one process can execute this at a time
 *   await updateAgentState(agentId, newState);
 * } finally {
 *   // Always release lock
 *   await lock.release();
 * }
 * ```
 *
 * Usage with direct client (legacy):
 * ```typescript
 * const redis = new Redis({ host: 'localhost', port: 6379 });
 * const lockManager = new DistributedLockManager(redis);
 * ```
 */
export class DistributedLockManager {
  private readonly redisClient: Redis | null;
  private readonly redisPool: RedisConnectionPool | null;
  private readonly usesPool: boolean;

  constructor(redis: RedisClient) {
    // H1 FIX: Detect if we're using a pool or direct client
    if (redis instanceof RedisConnectionPool) {
      this.redisPool = redis;
      this.redisClient = null;
      this.usesPool = true;
    } else {
      this.redisClient = redis;
      this.redisPool = null;
      this.usesPool = false;
    }
  }

  /**
   * Execute a Redis command, using either the pool or direct client.
   * 
   * H1 FIX: Abstraction layer to support both connection modes.
   */
  private async executeRedisCommand<T>(
    command: (redis: Redis) => Promise<T>
  ): Promise<T> {
    if (this.usesPool && this.redisPool) {
      return this.redisPool.execute(command);
    } else if (this.redisClient) {
      return command(this.redisClient);
    } else {
      throw new Error('No Redis connection available');
    }
  }

  /**
   * Acquire a distributed lock.
   *
   * Blocks until lock is acquired or acquireTimeout is reached.
   *
   * @param resource Resource name to lock (e.g., 'agent:agent_001:state')
   * @param options Lock configuration
   * @returns Lock object with release() method
   * @throws Error if lock cannot be acquired within acquireTimeout
   */
  async acquireLock(
    resource: string,
    options: LockOptions = {}
  ): Promise<Lock> {
    const {
      lockTimeout = 10000,
      acquireTimeout = 5000,
      retryInterval = 50
    } = options;

    const lockKey = `lock:${resource}`;
    const token = `${process.pid}:${Date.now()}:${Math.random()}`;
    const lockTimeoutSeconds = Math.ceil(lockTimeout / 1000);

    const startTime = Date.now();

    while (true) {
      // Try to acquire lock (SET NX EX)
      const acquired = await this.executeRedisCommand(async (redis) => {
        return redis.set(
          lockKey,
          token,
          'EX', // Expiration in seconds
          lockTimeoutSeconds,
          'NX'  // Only set if not exists
        );
      });

      if (acquired === 'OK') {
        // Lock acquired successfully
        console.log(`🔒 Lock acquired: ${resource} (token: ${token})`);

        return {
          resource,
          token,
          release: async () => this.releaseLock(lockKey, token),
          extend: async (additionalMs: number) => this.extendLock(lockKey, token, additionalMs)
        };
      }

      // Check if we've exceeded acquireTimeout
      const elapsed = Date.now() - startTime;
      if (elapsed >= acquireTimeout) {
        throw new Error(
          `❌ CRITICAL: Failed to acquire lock for ${resource} after ${acquireTimeout}ms. ` +
          `Lock may be held by another process.`
        );
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryInterval));
    }
  }

  /**
   * Release a lock.
   *
   * Uses Lua script for atomic check-and-delete to prevent
   * accidentally releasing someone else's lock.
   *
   * @param lockKey Redis key for the lock
   * @param token Unique token for this lock
   * @returns true if released, false if lock was already gone or owned by someone else
   */
  private async releaseLock(lockKey: string, token: string): Promise<boolean> {
    // Lua script for atomic check-and-delete
    // Only delete if the token matches (prevents releasing someone else's lock)
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;

    const result = await this.executeRedisCommand(async (redis) => {
      return redis.eval(script, 1, lockKey, token) as Promise<number>;
    });

    if (result === 1) {
      console.log(`🔓 Lock released: ${lockKey.replace('lock:', '')}`);
      return true;
    } else {
      console.warn(`⚠️ Lock already released or expired: ${lockKey.replace('lock:', '')}`);
      return false;
    }
  }

  /**
   * Extend a lock's timeout.
   *
   * Useful for long-running operations that need to hold the lock longer.
   *
   * @param lockKey Redis key for the lock
   * @param token Unique token for this lock
   * @param additionalMs Additional milliseconds to extend the lock
   * @returns true if extended, false if lock is gone or owned by someone else
   */
  private async extendLock(lockKey: string, token: string, additionalMs: number): Promise<boolean> {
    // Lua script for atomic check-and-extend
    const additionalSeconds = Math.ceil(additionalMs / 1000);
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("expire", KEYS[1], ARGV[2])
      else
        return 0
      end
    `;

    const result = await this.executeRedisCommand(async (redis) => {
      return redis.eval(script, 1, lockKey, token, additionalSeconds) as Promise<number>;
    });

    if (result === 1) {
      console.log(`⏰ Lock extended: ${lockKey.replace('lock:', '')} (+${additionalMs}ms)`);
      return true;
    } else {
      console.warn(`⚠️ Could not extend lock (expired or owned by another process): ${lockKey.replace('lock:', '')}`);
      return false;
    }
  }

  /**
   * Check if a resource is currently locked.
   *
   * @param resource Resource name to check
   * @returns true if locked, false otherwise
   */
  async isLocked(resource: string): Promise<boolean> {
    const lockKey = `lock:${resource}`;
    const exists = await this.executeRedisCommand(async (redis) => {
      return redis.exists(lockKey);
    });
    return exists === 1;
  }

  /**
   * Force release a lock (USE WITH CAUTION).
   *
   * This bypasses token checking - only use in emergency situations
   * or during cleanup/shutdown.
   *
   * @param resource Resource name to unlock
   * @returns true if lock was deleted
   */
  async forceRelease(resource: string): Promise<boolean> {
    const lockKey = `lock:${resource}`;
    const result = await this.executeRedisCommand(async (redis) => {
      return redis.del(lockKey);
    });
    if (result === 1) {
      console.warn(`⚠️ Lock force-released: ${resource}`);
      return true;
    }
    return false;
  }

  /**
   * Close the Redis connection.
   *
   * CRITICAL: Must be called during shutdown to prevent process hang.
   * The Redis connection keeps the Node.js event loop alive.
   * 
   * H1 FIX: Only closes connection if using direct client.
   * If using pool, the pool manages connection lifecycle.
   */
  async close(): Promise<void> {
    if (this.usesPool) {
      // Pool manages its own connections - don't close here
      console.log('🔓 DistributedLockManager using shared pool (no dedicated connection to close)');
    } else if (this.redisClient) {
      await this.redisClient.quit();
      console.log('🔓 DistributedLockManager Redis connection closed');
    }
  }
}

/**
 * Convenience wrapper for executing code with automatic lock management.
 *
 * Acquires lock, executes function, releases lock (even if function throws).
 *
 * Usage:
 * ```typescript
 * await withLock(lockManager, 'agent:agent_001:state', async () => {
 *   await updateAgentState(agentId, newState);
 * });
 * ```
 *
 * @param lockManager Lock manager instance
 * @param resource Resource name to lock
 * @param fn Function to execute while holding the lock
 * @param options Lock configuration
 * @returns Result of fn()
 */
export async function withLock<T>(
  lockManager: DistributedLockManager,
  resource: string,
  fn: () => Promise<T>,
  options?: LockOptions
): Promise<T> {
  const lock = await lockManager.acquireLock(resource, options);

  try {
    return await fn();
  } finally {
    await lock.release();
  }
}
