/**
 * Chaos Engineering Test: Redis Cache Failures
 *
 * Scenario:
 * - Randomly flush Redis cache
 * - Inject network delays (100-500ms)
 * - Verify degraded operation (fallback to DB)
 * - Verify cache miss handling
 *
 * Expected behavior:
 * - System continues operating without cache
 * - Cache misses trigger DB queries
 * - Performance degrades but system remains functional
 * - Cache repopulates after recovery
 *
 * @module platform/tests/chaos/redis-failures
 */

import Redis from 'ioredis';
import { CircuitBreaker, circuitBreakerManager } from '../../resilience/circuitBreaker';
import { DatabasePool } from '../../database/pool';

export interface RedisChaosConfig {
  duration: number;
  flushInterval: number;
  networkDelayChance: number;
  maxNetworkDelay: number;
}

export interface RedisChaosResult {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  cacheFlushes: number;
  networkDelays: number;
  averageLatency: number;
  degradedOperationTime: number;
}

/**
 * Chaos test: Redis cache failures
 */
export class RedisCacheFailureChaos {
  private result: RedisChaosResult = {
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    cacheFlushes: 0,
    networkDelays: 0,
    averageLatency: 0,
    degradedOperationTime: 0
  };

  private latencies: number[] = [];
  private circuitBreaker: CircuitBreaker;
  private degradedStart: number | null = null;

  constructor(
    private redis: Redis,
    private dbPool: DatabasePool,
    private config: RedisChaosConfig
  ) {
    this.circuitBreaker = circuitBreakerManager.getBreaker({
      name: 'chaos-redis',
      failureThreshold: 3,
      timeout: 15000,
      successThreshold: 2,
      fallback: () => null  // Fallback to DB on Redis failure
    });
  }

  /**
   * Run the chaos test
   */
  async run(): Promise<RedisChaosResult> {
    console.log('\n=== Chaos Test: Redis Cache Failures ===');
    console.log(`Duration: ${this.config.duration / 1000}s`);
    console.log(`Flush interval: ${this.config.flushInterval / 1000}s`);
    console.log(`Network delay chance: ${this.config.networkDelayChance * 100}%\n`);

    const startTime = Date.now();
    const endTime = startTime + this.config.duration;

    // Start chaos injectors
    const flushInjector = this.startFlushInjector();

    // Continuously make requests
    while (Date.now() < endTime) {
      await this.makeRequest();
      await this.sleep(50); // 20 requests per second
    }

    // Stop injectors
    clearInterval(flushInjector);

    // Calculate results
    if (this.degradedStart !== null) {
      this.result.degradedOperationTime += Date.now() - this.degradedStart;
    }

    this.result.averageLatency =
      this.latencies.length > 0
        ? this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length
        : 0;

    console.log('\n=== Chaos Test Results ===');
    console.log(`Total requests: ${this.result.totalRequests}`);
    console.log(`Cache hits: ${this.result.cacheHits} (${Math.round(this.result.cacheHits / this.result.totalRequests * 100)}%)`);
    console.log(`Cache misses: ${this.result.cacheMisses} (${Math.round(this.result.cacheMisses / this.result.totalRequests * 100)}%)`);
    console.log(`Cache flushes: ${this.result.cacheFlushes}`);
    console.log(`Network delays injected: ${this.result.networkDelays}`);
    console.log(`Average latency: ${Math.round(this.result.averageLatency)}ms`);
    console.log(`Degraded operation time: ${Math.round(this.result.degradedOperationTime / 1000)}s`);

    return this.result;
  }

  /**
   * Start cache flush injector
   */
  private startFlushInjector(): NodeJS.Timeout {
    return setInterval(async () => {
      console.log('💥 Flushing Redis cache');
      await this.redis.flushdb();
      this.result.cacheFlushes++;

      // Mark degraded operation start
      if (this.degradedStart === null) {
        this.degradedStart = Date.now();
      }

      // Cache repopulates over time
      setTimeout(() => {
        if (this.degradedStart !== null) {
          this.result.degradedOperationTime += Date.now() - this.degradedStart;
          this.degradedStart = null;
        }
      }, 10000); // 10 seconds to repopulate
    }, this.config.flushInterval);
  }

  /**
   * Make a cache request with fallback to DB
   */
  private async makeRequest(): Promise<void> {
    this.result.totalRequests++;
    const startTime = Date.now();

    try {
      // Try cache first
      const cacheResult = await this.circuitBreaker.execute(async () => {
        // Inject network delay
        if (Math.random() < this.config.networkDelayChance) {
          const delay = Math.random() * this.config.maxNetworkDelay;
          this.result.networkDelays++;
          await this.sleep(delay);
        }

        return await this.redis.get('test-key');
      });

      if (cacheResult !== null) {
        this.result.cacheHits++;
      } else {
        this.result.cacheMisses++;

        // Fallback to database
        await this.dbPool.query('SELECT 1');

        // Repopulate cache
        await this.redis.set('test-key', 'test-value', 'EX', 60);
      }

      const latency = Date.now() - startTime;
      this.latencies.push(latency);
    } catch (error: any) {
      // Cache completely failed, use DB
      this.result.cacheMisses++;
      await this.dbPool.query('SELECT 1');

      const latency = Date.now() - startTime;
      this.latencies.push(latency);
    }
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Run Redis cache failure chaos test
 */
export async function runRedisCacheFailureChaos(
  redis: Redis,
  dbPool: DatabasePool,
  config: RedisChaosConfig = {
    duration: 60000,          // 1 minute
    flushInterval: 15000,     // Every 15 seconds
    networkDelayChance: 0.2,  // 20% chance
    maxNetworkDelay: 500      // Up to 500ms
  }
): Promise<RedisChaosResult> {
  const chaos = new RedisCacheFailureChaos(redis, dbPool, config);
  return await chaos.run();
}
