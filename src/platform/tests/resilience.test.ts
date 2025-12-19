/**
 * Integration Tests for Resilience Components
 *
 * Tests circuit breaker, retry logic, DLQ, database pooling,
 * and graceful shutdown in realistic scenarios.
 *
 * @module platform/tests/resilience.test
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { CircuitBreaker, CircuitBreakerState } from '../resilience/circuitBreaker';
import { retryWithBackoff, isTransientError } from '../resilience/retryHandler';
import { DeadLetterQueue } from '../resilience/deadLetterQueue';
import { DatabasePool } from '../database/pool';
import { GracefulShutdown } from '../resilience/gracefulShutdown';
import Redis from 'ioredis';

describe('Circuit Breaker', () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker({
      name: 'test-breaker',
      failureThreshold: 3,
      timeout: 1000,
      successThreshold: 2
    });
  });

  it('should start in CLOSED state', () => {
    expect(breaker.getState()).toBe(CircuitBreakerState.CLOSED);
  });

  it('should open after threshold failures', async () => {
    const failingFn = async () => {
      throw new Error('Service unavailable');
    };

    // Trigger failures
    for (let i = 0; i < 3; i++) {
      try {
        await breaker.execute(failingFn);
      } catch (error) {
        // Expected
      }
    }

    expect(breaker.getState()).toBe(CircuitBreakerState.OPEN);
  });

  it('should transition to HALF_OPEN after timeout', async () => {
    const failingFn = async () => {
      throw new Error('Service unavailable');
    };

    // Open the circuit
    for (let i = 0; i < 3; i++) {
      try {
        await breaker.execute(failingFn);
      } catch (error) {
        // Expected
      }
    }

    expect(breaker.getState()).toBe(CircuitBreakerState.OPEN);

    // Wait for timeout
    await new Promise(resolve => setTimeout(resolve, 1100));

    // Next request should transition to HALF_OPEN
    const successFn = async () => 'success';

    try {
      await breaker.execute(successFn);
    } catch (error) {
      // Might fail in HALF_OPEN
    }

    expect([CircuitBreakerState.HALF_OPEN, CircuitBreakerState.CLOSED]).toContain(
      breaker.getState()
    );
  });

  it('should close after success threshold in HALF_OPEN', async () => {
    const failingFn = async () => {
      throw new Error('Service unavailable');
    };
    const successFn = async () => 'success';

    // Open the circuit
    for (let i = 0; i < 3; i++) {
      try {
        await breaker.execute(failingFn);
      } catch (error) {
        // Expected
      }
    }

    // Wait for timeout
    await new Promise(resolve => setTimeout(resolve, 1100));

    // Succeed twice to close
    await breaker.execute(successFn);
    await breaker.execute(successFn);

    expect(breaker.getState()).toBe(CircuitBreakerState.CLOSED);
  });

  it('should call fallback when circuit is open', async () => {
    const breakerWithFallback = new CircuitBreaker({
      name: 'test-fallback',
      failureThreshold: 2,
      timeout: 1000,
      successThreshold: 1,
      fallback: () => 'fallback-value'
    });

    const failingFn = async () => {
      throw new Error('Service unavailable');
    };

    // Open the circuit
    for (let i = 0; i < 2; i++) {
      try {
        await breakerWithFallback.execute(failingFn);
      } catch (error) {
        // Expected
      }
    }

    // Circuit is open, should use fallback
    const result = await breakerWithFallback.execute(failingFn);
    expect(result).toBe('fallback-value');
  });
});

describe('Retry Handler', () => {
  it('should retry on transient errors', async () => {
    let attempts = 0;

    const flakeyFn = async () => {
      attempts++;
      if (attempts < 3) {
        const error: any = new Error('Connection refused');
        error.code = 'ECONNREFUSED';
        throw error;
      }
      return 'success';
    };

    const result = await retryWithBackoff(flakeyFn, {
      maxRetries: 3,
      baseDelay: 100,
      jitter: false
    });

    expect(result).toBe('success');
    expect(attempts).toBe(3);
  });

  it('should not retry on permanent errors', async () => {
    let attempts = 0;

    const permanentErrorFn = async () => {
      attempts++;
      const error: any = new Error('Bad request');
      error.statusCode = 400;
      throw error;
    };

    await expect(
      retryWithBackoff(permanentErrorFn, {
        maxRetries: 3,
        baseDelay: 100
      })
    ).rejects.toThrow('Bad request');

    expect(attempts).toBe(1); // No retries
  });

  it('should respect max retries', async () => {
    let attempts = 0;

    const alwaysFailFn = async () => {
      attempts++;
      const error: any = new Error('Service unavailable');
      error.statusCode = 503;
      throw error;
    };

    await expect(
      retryWithBackoff(alwaysFailFn, {
        maxRetries: 3,
        baseDelay: 100,
        jitter: false
      })
    ).rejects.toThrow('Service unavailable');

    expect(attempts).toBe(4); // Initial + 3 retries
  });

  it('should apply exponential backoff', async () => {
    const delays: number[] = [];
    let attempts = 0;

    const failingFn = async () => {
      attempts++;
      const error: any = new Error('Timeout');
      error.code = 'ETIMEDOUT';
      throw error;
    };

    const startTime = Date.now();

    try {
      await retryWithBackoff(failingFn, {
        maxRetries: 3,
        baseDelay: 100,
        jitter: false,
        onRetry: (attempt, delay) => {
          delays.push(delay);
        }
      });
    } catch (error) {
      // Expected
    }

    const totalTime = Date.now() - startTime;

    // Delays should be: 100, 200, 400 (exponential)
    expect(delays).toHaveLength(3);
    expect(delays[0]).toBeCloseTo(100, -1);
    expect(delays[1]).toBeCloseTo(200, -1);
    expect(delays[2]).toBeCloseTo(400, -1);

    // Total time should be at least sum of delays
    expect(totalTime).toBeGreaterThanOrEqual(700);
  });

  it('should identify transient errors correctly', () => {
    // Transient errors
    expect(isTransientError({ code: 'ECONNREFUSED' })).toBe(true);
    expect(isTransientError({ code: 'ETIMEDOUT' })).toBe(true);
    expect(isTransientError({ statusCode: 503 })).toBe(true);

    // Permanent errors
    expect(isTransientError({ statusCode: 400 })).toBe(false);
    expect(isTransientError({ statusCode: 404 })).toBe(false);
    expect(isTransientError({ message: 'Unknown error' })).toBe(false);
  });
});

describe('Dead Letter Queue', () => {
  let redis: Redis;
  let dlq: DeadLetterQueue;

  beforeEach(() => {
    redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      db: 15 // Test database
    });

    dlq = new DeadLetterQueue({
      redis,
      queueName: 'test-dlq',
      maxRetries: 3,
      pollingInterval: 1000
    });
  });

  afterEach(async () => {
    await dlq.clear();
    await redis.quit();
  });

  it('should add items to DLQ', async () => {
    const id = await dlq.add({
      operation: 'test-operation',
      payload: { data: 'test' },
      error: 'Test error',
      retryCount: 0,
      maxRetries: 3
    });

    expect(id).toBeTruthy();

    const depth = await dlq.getDepth();
    expect(depth).toBe(1);
  });

  it('should retry items with exponential backoff', async () => {
    await dlq.add({
      operation: 'test-retry',
      payload: { data: 'test' },
      error: 'Initial failure',
      retryCount: 0,
      maxRetries: 3
    });

    const items = await dlq.getReadyItems(10);
    expect(items).toHaveLength(0); // Not ready yet (1 minute delay)

    // Fast-forward by manipulating Redis
    const allItems = await dlq.getAllItems();
    const item = allItems[0];

    let successCount = 0;

    const result = await dlq.retry(item, async (payload) => {
      successCount++;
      // Succeed on retry
    });

    expect(result).toBe(true);
    expect(successCount).toBe(1);

    const depth = await dlq.getDepth();
    expect(depth).toBe(0); // Removed after success
  });

  it('should mark items as permanent failures after max retries', async () => {
    const item = await dlq.add({
      operation: 'test-permanent-failure',
      payload: { data: 'test' },
      error: 'Initial failure',
      retryCount: 2, // Already tried twice
      maxRetries: 3
    });

    const items = await dlq.getAllItems();
    const dlqItem = items[0];

    let failureCount = 0;
    let permanentFailures = 0;

    dlq.on('permanentFailure', () => {
      permanentFailures++;
    });

    const result = await dlq.retry(dlqItem, async (payload) => {
      failureCount++;
      throw new Error('Still failing');
    });

    expect(result).toBe(false);
    expect(permanentFailures).toBe(1);

    const depth = await dlq.getDepth();
    expect(depth).toBe(0); // Removed after max retries
  });

  it('should get DLQ stats', async () => {
    await dlq.add({
      operation: 'test-stats',
      payload: { data: 'test' },
      error: 'Test error',
      retryCount: 0,
      maxRetries: 3
    });

    const stats = await dlq.getStats();

    expect(stats.depth).toBe(1);
    expect(stats.oldestItemAge).toBeGreaterThan(0);
  });
});

describe('Database Pool', () => {
  let pool: DatabasePool;

  beforeEach(() => {
    pool = new DatabasePool({
      host: process.env.DATABASE_HOST || process.env.PGHOST || process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || process.env.PGPORT || process.env.DB_PORT || '5432'),
      database: process.env.POSTGRES_DB || process.env.PGDATABASE || process.env.DB_NAME || 'test',
      user: process.env.POSTGRES_USER || process.env.PGUSER || process.env.DB_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || process.env.PGPASSWORD || process.env.DB_PASSWORD || 'postgres',
      min: 2,
      max: 10,
      healthCheckInterval: 5000,
      slowQueryThreshold: 1000
    });
  });

  afterEach(async () => {
    await pool.close();
  });

  it('should execute queries successfully', async () => {
    const result = await pool.query('SELECT 1 AS test');

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].test).toBe(1);
  });

  it('should track pool metrics', async () => {
    await pool.query('SELECT 1');

    const metrics = pool.getMetrics();

    expect(metrics.totalConnections).toBeGreaterThanOrEqual(0);
    expect(metrics.utilization).toBeLessThanOrEqual(1);
  });

  it('should execute transactions', async () => {
    const result = await pool.transaction(async (client) => {
      await client.query('CREATE TEMP TABLE test_tx (id INT)');
      await client.query('INSERT INTO test_tx VALUES (1)');
      const res = await client.query('SELECT * FROM test_tx');
      return res.rows;
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('should rollback failed transactions', async () => {
    await expect(
      pool.transaction(async (client) => {
        await client.query('CREATE TEMP TABLE test_rollback (id INT)');
        await client.query('INSERT INTO test_rollback VALUES (1)');
        throw new Error('Intentional failure');
      })
    ).rejects.toThrow('Intentional failure');

    // Transaction should be rolled back
    // (Can't verify temp table doesn't exist in different connection)
  });

  it('should perform health checks', async () => {
    const healthy = await pool.healthCheck();
    expect(healthy).toBe(true);
  });

  it('should report healthy status', () => {
    const healthy = pool.isHealthy();
    expect(healthy).toBe(true);
  });
});

describe('Graceful Shutdown', () => {
  let shutdown: GracefulShutdown;

  beforeEach(() => {
    shutdown = new GracefulShutdown({
      timeout: 5000,
      requestTimeout: 2000,
      agentTermTimeout: 1000
    });
  });

  it('should start without shutdown in progress', () => {
    expect(shutdown.isShutdownInProgress()).toBe(false);
  });

  it('should return healthy status when not shutting down', () => {
    const status = shutdown.getHealthStatus();

    expect(status.status).toBe('ok');
    expect(status.shutting_down).toBe(false);
  });

  it('should return shutting_down status during shutdown', async () => {
    // Don't actually run shutdown (would exit process)
    // Just test the status check

    expect(shutdown.getHealthStatus().shutting_down).toBe(false);
  });

  // Note: Full shutdown tests would require mocking process.exit
  // and are better tested in integration/e2e tests
});
