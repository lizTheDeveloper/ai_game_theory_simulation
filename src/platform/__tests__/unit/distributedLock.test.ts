/**
 * Distributed Lock Unit Tests
 *
 * Tests Redis-based distributed locking for race condition prevention.
 *
 * Author: Marcus (Platform Engineer)
 * Date: 2025-11-22
 */

import Redis from 'ioredis';
import { DistributedLockManager, withLock } from '../../utils/distributedLock';

describe('DistributedLockManager', () => {
  let redis: Redis;
  let lockManager: DistributedLockManager;

  beforeAll(() => {
    redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      db: parseInt(process.env.REDIS_DB || '1') // Use DB 1 for tests
    });

    lockManager = new DistributedLockManager(redis);
  });

  afterAll(async () => {
    await redis.quit();
  });

  beforeEach(async () => {
    // Clear all locks before each test
    const keys = await redis.keys('lock:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  });

  describe('acquireLock', () => {
    test('should acquire lock successfully', async () => {
      const lock = await lockManager.acquireLock('test:resource1');

      expect(lock).toBeDefined();
      expect(lock.resource).toBe('test:resource1');
      expect(lock.token).toBeDefined();

      // Lock should exist in Redis
      const exists = await redis.exists('lock:test:resource1');
      expect(exists).toBe(1);

      await lock.release();
    });

    test('should block until lock is available', async () => {
      // Acquire first lock
      const lock1 = await lockManager.acquireLock('test:resource2', {
        lockTimeout: 2000
      });

      // Try to acquire second lock (should block)
      const start = Date.now();

      const lock2Promise = lockManager.acquireLock('test:resource2', {
        lockTimeout: 2000,
        acquireTimeout: 3000,
        retryInterval: 50
      });

      // Release first lock after 1 second
      setTimeout(async () => {
        await lock1.release();
      }, 1000);

      // Second lock should acquire after ~1 second
      const lock2 = await lock2Promise;
      const elapsed = Date.now() - start;

      expect(elapsed).toBeGreaterThanOrEqual(900); // Allow some timing variance
      expect(elapsed).toBeLessThan(1500);

      await lock2.release();
    });

    test('should timeout if lock cannot be acquired', async () => {
      // Acquire first lock
      const lock1 = await lockManager.acquireLock('test:resource3', {
        lockTimeout: 10000
      });

      // Try to acquire second lock with short timeout
      await expect(
        lockManager.acquireLock('test:resource3', {
          acquireTimeout: 500,
          retryInterval: 50
        })
      ).rejects.toThrow(/Failed to acquire lock/);

      await lock1.release();
    });

    test('should auto-expire after lockTimeout', async () => {
      const lock = await lockManager.acquireLock('test:resource4', {
        lockTimeout: 1000 // 1 second
      });

      // Wait for lock to expire
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Should be able to acquire lock again (previous one expired)
      const lock2 = await lockManager.acquireLock('test:resource4', {
        acquireTimeout: 500
      });

      expect(lock2).toBeDefined();

      await lock2.release();
    });
  });

  describe('release', () => {
    test('should release lock successfully', async () => {
      const lock = await lockManager.acquireLock('test:resource5');

      const released = await lock.release();

      expect(released).toBe(true);

      // Lock should not exist in Redis
      const exists = await redis.exists('lock:test:resource5');
      expect(exists).toBe(0);
    });

    test('should not release someone else\'s lock', async () => {
      const lock1 = await lockManager.acquireLock('test:resource6', {
        lockTimeout: 10000
      });

      // Manually change the token in Redis (simulate another process's lock)
      await redis.set('lock:test:resource6', 'different-token', 'EX', 10);

      // Try to release - should fail
      const released = await lock1.release();

      expect(released).toBe(false);

      // Lock should still exist
      const exists = await redis.exists('lock:test:resource6');
      expect(exists).toBe(1);

      // Cleanup
      await redis.del('lock:test:resource6');
    });

    test('should handle double release gracefully', async () => {
      const lock = await lockManager.acquireLock('test:resource7');

      const released1 = await lock.release();
      const released2 = await lock.release();

      expect(released1).toBe(true);
      expect(released2).toBe(false); // Already released
    });
  });

  describe('extend', () => {
    test('should extend lock timeout', async () => {
      const lock = await lockManager.acquireLock('test:resource8', {
        lockTimeout: 2000 // 2 seconds
      });

      // Get initial TTL
      const ttl1 = await redis.ttl('lock:test:resource8');
      expect(ttl1).toBeGreaterThan(0);
      expect(ttl1).toBeLessThanOrEqual(2);

      // Extend by 5 seconds
      const extended = await lock.extend(5000);
      expect(extended).toBe(true);

      // Get new TTL (should be ~5 seconds)
      const ttl2 = await redis.ttl('lock:test:resource8');
      expect(ttl2).toBeGreaterThan(4);
      expect(ttl2).toBeLessThanOrEqual(5);

      await lock.release();
    });

    test('should not extend expired lock', async () => {
      const lock = await lockManager.acquireLock('test:resource9', {
        lockTimeout: 500 // 0.5 seconds
      });

      // Wait for lock to expire
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Try to extend expired lock
      const extended = await lock.extend(5000);
      expect(extended).toBe(false);
    });
  });

  describe('isLocked', () => {
    test('should detect locked resource', async () => {
      const lock = await lockManager.acquireLock('test:resource10');

      const locked = await lockManager.isLocked('test:resource10');
      expect(locked).toBe(true);

      await lock.release();

      const lockedAfter = await lockManager.isLocked('test:resource10');
      expect(lockedAfter).toBe(false);
    });

    test('should return false for unlocked resource', async () => {
      const locked = await lockManager.isLocked('test:resource11');
      expect(locked).toBe(false);
    });
  });

  describe('forceRelease', () => {
    test('should force release any lock', async () => {
      const lock = await lockManager.acquireLock('test:resource12');

      const forced = await lockManager.forceRelease('test:resource12');
      expect(forced).toBe(true);

      // Lock should be gone
      const exists = await redis.exists('lock:test:resource12');
      expect(exists).toBe(0);
    });

    test('should handle non-existent lock', async () => {
      const forced = await lockManager.forceRelease('test:resource13');
      expect(forced).toBe(false);
    });
  });

  describe('withLock helper', () => {
    test('should execute function with automatic lock management', async () => {
      let executed = false;

      await withLock(lockManager, 'test:resource14', async () => {
        // Verify lock is held during execution
        const locked = await lockManager.isLocked('test:resource14');
        expect(locked).toBe(true);

        executed = true;
      });

      expect(executed).toBe(true);

      // Lock should be released after execution
      const lockedAfter = await lockManager.isLocked('test:resource14');
      expect(lockedAfter).toBe(false);
    });

    test('should release lock even if function throws', async () => {
      await expect(
        withLock(lockManager, 'test:resource15', async () => {
          throw new Error('Test error');
        })
      ).rejects.toThrow('Test error');

      // Lock should still be released
      const locked = await lockManager.isLocked('test:resource15');
      expect(locked).toBe(false);
    });

    test('should return function result', async () => {
      const result = await withLock(lockManager, 'test:resource16', async () => {
        return 42;
      });

      expect(result).toBe(42);
    });

    test('should prevent concurrent execution', async () => {
      let concurrentExecutions = 0;
      let maxConcurrent = 0;

      const task = async (id: number) => {
        return withLock(lockManager, 'test:resource17', async () => {
          concurrentExecutions++;
          maxConcurrent = Math.max(maxConcurrent, concurrentExecutions);

          // Simulate work
          await new Promise(resolve => setTimeout(resolve, 100));

          concurrentExecutions--;
        });
      };

      // Run 5 tasks concurrently
      await Promise.all([
        task(1),
        task(2),
        task(3),
        task(4),
        task(5)
      ]);

      // Only 1 task should execute at a time
      expect(maxConcurrent).toBe(1);
    });
  });

  describe('concurrent access scenarios', () => {
    test('should handle multiple locks on different resources', async () => {
      const lock1 = await lockManager.acquireLock('test:resource18');
      const lock2 = await lockManager.acquireLock('test:resource19');
      const lock3 = await lockManager.acquireLock('test:resource20');

      expect(await lockManager.isLocked('test:resource18')).toBe(true);
      expect(await lockManager.isLocked('test:resource19')).toBe(true);
      expect(await lockManager.isLocked('test:resource20')).toBe(true);

      await lock1.release();
      await lock2.release();
      await lock3.release();
    });

    test('should handle rapid acquire/release cycles', async () => {
      for (let i = 0; i < 10; i++) {
        const lock = await lockManager.acquireLock('test:resource21');
        await lock.release();
      }

      // Should not have any locks left
      const locked = await lockManager.isLocked('test:resource21');
      expect(locked).toBe(false);
    });
  });
});
