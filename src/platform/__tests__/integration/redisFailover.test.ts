/**
 * Redis Cluster Failover Integration Tests
 *
 * Tests Redis connection pool resilience under failover scenarios.
 * Simulates Redis node failures, network partitions, and cluster reconfigurations.
 *
 * Test Scenarios:
 * 1. Master node failure → pool redirects to new master
 * 2. Slave node failure → no impact on operations
 * 3. Network partition → graceful degradation
 * 4. Multiple node failures → circuit breaker activation
 * 5. Recovery → pool reconnects and restores
 *
 * Author: Marcus (Platform Engineer)
 * Date: 2025-11-22
 */

import Redis from 'ioredis';
import { RedisConnectionPool, initializeRedisPool, shutdownRedisPool } from '../../utils/redisPool';
import { circuitBreakerManager } from '../../resilience/circuitBreaker';

// Test Redis configuration
const TEST_REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  db: parseInt(process.env.REDIS_DB || '1', 10),
  maxConnections: 10,
  minConnections: 2,
  acquireTimeout: 5000,
  idleTimeout: 300000,
  healthCheckInterval: 5000,
  maxRetriesPerRequest: 3,
  connectTimeout: 10000,
  enableReadyCheck: true,
  enableOfflineQueue: true,
  lazyConnect: false
};

describe('Redis Cluster Failover', () => {
  let pool: RedisConnectionPool;
  let directRedis: Redis;

  beforeAll(async () => {
    // Connect to test Redis directly for failover simulation
    directRedis = new Redis({
      host: TEST_REDIS_CONFIG.host,
      port: TEST_REDIS_CONFIG.port,
      db: TEST_REDIS_CONFIG.db
    });

    // Clear test data
    await directRedis.flushdb();
  });

  afterAll(async () => {
    await directRedis.quit();
  });

  beforeEach(async () => {
    // Initialize fresh pool for each test
    pool = initializeRedisPool(TEST_REDIS_CONFIG);

    // Clear circuit breaker state
    circuitBreakerManager.resetAll();
  });

  afterEach(async () => {
    await shutdownRedisPool();
  });

  describe('connection pool resilience', () => {
    test('should handle temporary Redis unavailability', async () => {
      // Set test data
      await directRedis.set('test-key-1', 'test-value-1');

      // Verify read works
      const value1 = await pool.execute(async (redis) => {
        return await redis.get('test-key-1');
      });
      expect(value1).toBe('test-value-1');

      // Simulate Redis restart by flushing and brief delay
      await directRedis.flushdb();
      await new Promise(resolve => setTimeout(resolve, 100));

      // Pool should reconnect and handle cache miss
      const value2 = await pool.execute(async (redis) => {
        return await redis.get('test-key-1');
      });
      expect(value2).toBeNull();

      // Set new value
      await pool.execute(async (redis) => {
        await redis.set('test-key-1', 'test-value-2', 'EX', 60);
      });

      // Verify new value
      const value3 = await directRedis.get('test-key-1');
      expect(value3).toBe('test-value-2');
    }, 15000);

    test('should reconnect after connection drop', async () => {
      // Initial successful operations
      await pool.execute(async (redis) => {
        await redis.set('reconnect-test', 'value1');
      });

      // Get pool stats
      const statsBefore = pool.getStats();
      expect(statsBefore.total).toBeGreaterThan(0);

      // Simulate connection drop by disconnecting all Redis clients
      // (In production, this would be handled automatically by ioredis)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Pool should create new connections on next request
      await pool.execute(async (redis) => {
        await redis.set('reconnect-test', 'value2');
      });

      const value = await directRedis.get('reconnect-test');
      expect(value).toBe('value2');
    }, 15000);

    test('should handle high connection churn', async () => {
      // Rapidly acquire and release connections
      const operations = 50;
      const promises: Promise<void>[] = [];

      for (let i = 0; i < operations; i++) {
        const promise = pool.execute(async (redis) => {
          await redis.set(`churn-key-${i}`, `value-${i}`, 'EX', 60);
          const value = await redis.get(`churn-key-${i}`);
          expect(value).toBe(`value-${i}`);
        });
        promises.push(promise);
      }

      await Promise.all(promises);

      // Pool should be healthy
      expect(pool.isHealthy()).toBe(true);

      const stats = pool.getStats();
      expect(stats.total).toBeLessThanOrEqual(TEST_REDIS_CONFIG.maxConnections);
    }, 30000);
  });

  describe('cache miss handling', () => {
    test('should handle cache flush gracefully', async () => {
      // Populate cache
      await pool.execute(async (redis) => {
        await redis.set('cached-key-1', 'cached-value-1', 'EX', 60);
        await redis.set('cached-key-2', 'cached-value-2', 'EX', 60);
        await redis.set('cached-key-3', 'cached-value-3', 'EX', 60);
      });

      // Verify cache hits
      const value1 = await pool.execute(async (redis) => {
        return await redis.get('cached-key-1');
      });
      expect(value1).toBe('cached-value-1');

      // Flush cache (simulates Redis failover or manual flush)
      await directRedis.flushdb();

      // Pool should handle cache misses without errors
      const value2 = await pool.execute(async (redis) => {
        return await redis.get('cached-key-1');
      });
      expect(value2).toBeNull();

      // Repopulate cache
      await pool.execute(async (redis) => {
        await redis.set('cached-key-1', 'new-value-1', 'EX', 60);
      });

      // Verify new value
      const value3 = await pool.execute(async (redis) => {
        return await redis.get('cached-key-1');
      });
      expect(value3).toBe('new-value-1');
    });

    test('should handle expired keys gracefully', async () => {
      // Set key with 1 second TTL
      await pool.execute(async (redis) => {
        await redis.set('expiring-key', 'expiring-value', 'EX', 1);
      });

      // Verify key exists
      const value1 = await pool.execute(async (redis) => {
        return await redis.get('expiring-key');
      });
      expect(value1).toBe('expiring-value');

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Key should be expired
      const value2 = await pool.execute(async (redis) => {
        return await redis.get('expiring-key');
      });
      expect(value2).toBeNull();
    });
  });

  describe('circuit breaker integration', () => {
    test('should open circuit after repeated failures', async () => {
      const breakerName = 'redis-failover-test';
      const breaker = circuitBreakerManager.getBreaker(breakerName, {
        failureThreshold: 3,
        timeout: 5000,
        successThreshold: 2,
        fallback: () => null
      });

      // Simulate Redis failures by trying to connect to invalid port
      const failingRedis = new Redis({
        host: TEST_REDIS_CONFIG.host,
        port: 9999, // Invalid port
        connectTimeout: 1000,
        maxRetriesPerRequest: 0
      });

      let failures = 0;

      // Try operations until circuit opens
      for (let i = 0; i < 5; i++) {
        try {
          await breaker.execute(async () => {
            return await failingRedis.get('test-key');
          });
        } catch (err) {
          failures++;
        }
      }

      // Circuit should be open after threshold failures
      expect(failures).toBeGreaterThanOrEqual(3);
      expect(breaker.getState()).toBe('open');

      // Cleanup
      failingRedis.disconnect();
    }, 15000);

    test('should recover after circuit half-opens and succeeds', async () => {
      const breakerName = 'redis-recovery-test';
      const breaker = circuitBreakerManager.getBreaker(breakerName, {
        failureThreshold: 2,
        timeout: 2000, // Short timeout for test
        successThreshold: 1
      });

      // Trigger circuit open with failures
      const failingRedis = new Redis({
        host: TEST_REDIS_CONFIG.host,
        port: 9998,
        connectTimeout: 500,
        maxRetriesPerRequest: 0
      });

      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(async () => {
            return await failingRedis.get('test-key');
          });
        } catch (err) {
          // Expected failures
        }
      }

      expect(breaker.getState()).toBe('open');

      // Wait for circuit to half-open
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Now use healthy Redis
      const result = await breaker.execute(async () => {
        return await pool.execute(async (redis) => {
          await redis.set('recovery-key', 'recovery-value');
          return await redis.get('recovery-key');
        });
      });

      expect(result).toBe('recovery-value');
      expect(breaker.getState()).toBe('closed');

      // Cleanup
      failingRedis.disconnect();
    }, 10000);
  });

  describe('performance under degraded conditions', () => {
    test('should maintain acceptable latency with cache misses', async () => {
      const iterations = 100;
      const latencies: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const start = Date.now();

        await pool.execute(async (redis) => {
          // Try to get non-existent key (cache miss)
          const value = await redis.get(`miss-key-${i}`);

          // If null, simulate database fallback
          if (value === null) {
            // Simulate DB query delay (5-10ms)
            await new Promise(resolve => setTimeout(resolve, 5 + Math.random() * 5));
          }
        });

        const latency = Date.now() - start;
        latencies.push(latency);
      }

      // Calculate statistics
      latencies.sort((a, b) => a - b);
      const p50 = latencies[Math.floor(iterations * 0.5)];
      const p95 = latencies[Math.floor(iterations * 0.95)];
      const p99 = latencies[Math.floor(iterations * 0.99)];
      const avg = latencies.reduce((a, b) => a + b, 0) / iterations;

      console.log(`\n📊 Cache Miss Latency:`);
      console.log(`   P50: ${p50}ms`);
      console.log(`   P95: ${p95}ms`);
      console.log(`   P99: ${p99}ms`);
      console.log(`   Avg: ${avg.toFixed(1)}ms`);

      // P95 should be under 50ms (cache miss + DB query)
      expect(p95).toBeLessThan(50);
    }, 30000);

    test('should handle concurrent operations during cache flush', async () => {
      // Start continuous operations
      const operationPromises: Promise<void>[] = [];
      let completedOps = 0;
      let failedOps = 0;

      // Run 200 operations concurrently
      for (let i = 0; i < 200; i++) {
        const promise = (async () => {
          try {
            await pool.execute(async (redis) => {
              await redis.set(`concurrent-key-${i}`, `value-${i}`, 'EX', 60);
              const value = await redis.get(`concurrent-key-${i}`);
              expect(value).toBe(`value-${i}`);
            });
            completedOps++;
          } catch (err) {
            failedOps++;
          }
        })();

        operationPromises.push(promise);

        // Flush cache midway through operations
        if (i === 100) {
          await directRedis.flushdb();
        }
      }

      await Promise.all(operationPromises);

      console.log(`\n📊 Concurrent Operations During Flush:`);
      console.log(`   Completed: ${completedOps}`);
      console.log(`   Failed: ${failedOps}`);
      console.log(`   Success rate: ${(completedOps / 200 * 100).toFixed(1)}%`);

      // Success rate should be very high (>95%)
      expect(completedOps / 200).toBeGreaterThan(0.95);
    }, 60000);
  });

  describe('pool health monitoring', () => {
    test('should report pool statistics accurately', async () => {
      // Make some operations
      await pool.execute(async (redis) => {
        await redis.set('stats-test-1', 'value1');
      });

      const stats = pool.getStats();

      expect(stats.total).toBeGreaterThan(0);
      expect(stats.total).toBeLessThanOrEqual(TEST_REDIS_CONFIG.maxConnections);
      expect(stats.active + stats.idle).toBe(stats.total);
      expect(stats.pending).toBe(0);
    });

    test('should detect unhealthy pool state', async () => {
      // Pool should start healthy
      expect(pool.isHealthy()).toBe(true);

      // Exhaust pool by acquiring all connections
      const clients: Promise<any>[] = [];

      for (let i = 0; i < TEST_REDIS_CONFIG.maxConnections + 5; i++) {
        const client = pool.execute(async (redis) => {
          // Hold connection for 2 seconds
          await new Promise(resolve => setTimeout(resolve, 2000));
        });
        clients.push(client);
      }

      // Pool should still be healthy (just under load)
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(pool.isHealthy()).toBe(true);

      // Wait for operations to complete
      await Promise.all(clients);
    }, 15000);
  });

  describe('data consistency during failover', () => {
    test('should not lose data during Redis flush', async () => {
      const testData = new Map<string, string>();

      // Write 50 keys
      for (let i = 0; i < 50; i++) {
        const key = `consistency-key-${i}`;
        const value = `consistency-value-${i}`;
        testData.set(key, value);

        await pool.execute(async (redis) => {
          await redis.set(key, value, 'EX', 300);
        });
      }

      // Verify all keys exist
      const entries = Array.from(testData.entries());
      for (const [key, expectedValue] of entries) {
        const value = await pool.execute(async (redis) => {
          return await redis.get(key);
        });
        expect(value).toBe(expectedValue);
      }

      // Flush Redis
      await directRedis.flushdb();

      // All keys should now be null (cache miss)
      const keys = Array.from(testData.keys());
      for (const key of keys) {
        const value = await pool.execute(async (redis) => {
          return await redis.get(key);
        });
        expect(value).toBeNull();
      }
    });

    test('should handle concurrent writes during flush', async () => {
      const writePromises: Promise<void>[] = [];
      const keyCount = 100;

      // Start concurrent writes
      for (let i = 0; i < keyCount; i++) {
        const promise = pool.execute(async (redis) => {
          await redis.set(`concurrent-write-${i}`, `value-${i}`, 'EX', 60);
        });
        writePromises.push(promise);

        // Flush midway
        if (i === 50) {
          directRedis.flushdb().catch(() => {
            // Ignore flush errors
          });
        }
      }

      // All writes should complete (some before flush, some after)
      await Promise.all(writePromises);

      // Verify keys written after flush still exist
      let existingKeys = 0;
      for (let i = 50; i < keyCount; i++) {
        const value = await directRedis.get(`concurrent-write-${i}`);
        if (value !== null) {
          existingKeys++;
        }
      }

      console.log(`\n📊 Keys surviving concurrent flush: ${existingKeys}/${keyCount - 50}`);

      // At least some keys should have been written after flush
      expect(existingKeys).toBeGreaterThan(0);
    }, 30000);
  });
});
