/**
 * Chaos Engineering Test: High Load
 *
 * Scenario:
 * - Generate 10x normal traffic
 * - Verify rate limiting works
 * - Verify no cascading failures
 * - Monitor resource usage
 *
 * Expected behavior:
 * - Rate limiting protects system
 * - Response times increase but system remains stable
 * - No cascading failures or resource exhaustion
 * - System recovers after load returns to normal
 *
 * @module platform/tests/chaos/high-load
 */

import { DatabasePool } from '../../database/pool';
import Redis from 'ioredis';

export interface HighLoadConfig {
  duration: number;
  normalRPS: number;      // Normal requests per second
  peakRPS: number;        // Peak requests per second (10x normal)
  rampUpTime: number;     // Time to ramp up to peak (ms)
  rampDownTime: number;   // Time to ramp down from peak (ms)
}

export interface HighLoadResult {
  totalRequests: number;
  successfulRequests: number;
  rateLimitedRequests: number;
  failedRequests: number;
  latencyP50: number;
  latencyP95: number;
  latencyP99: number;
  maxLatency: number;
  throughput: number;     // Actual requests per second
  errorRate: number;
  peakResourceUsage: {
    dbConnections: number;
    redisConnections: number;
    memoryMB: number;
  };
}

/**
 * Chaos test: High load
 */
export class HighLoadChaos {
  private result: HighLoadResult = {
    totalRequests: 0,
    successfulRequests: 0,
    rateLimitedRequests: 0,
    failedRequests: 0,
    latencyP50: 0,
    latencyP95: 0,
    latencyP99: 0,
    maxLatency: 0,
    throughput: 0,
    errorRate: 0,
    peakResourceUsage: {
      dbConnections: 0,
      redisConnections: 0,
      memoryMB: 0
    }
  };

  private latencies: number[] = [];

  constructor(
    private dbPool: DatabasePool,
    private redis: Redis,
    private config: HighLoadConfig
  ) {}

  /**
   * Run the chaos test
   */
  async run(): Promise<HighLoadResult> {
    console.log('\n=== Chaos Test: High Load ===');
    console.log(`Duration: ${this.config.duration / 1000}s`);
    console.log(`Normal RPS: ${this.config.normalRPS}`);
    console.log(`Peak RPS: ${this.config.peakRPS}`);
    console.log(`Ramp up time: ${this.config.rampUpTime / 1000}s\n`);

    const startTime = Date.now();
    const endTime = startTime + this.config.duration;

    let currentRPS = this.config.normalRPS;

    // Resource monitoring
    const resourceMonitor = setInterval(() => {
      this.monitorResources();
    }, 1000);

    // Load generation
    while (Date.now() < endTime) {
      const elapsed = Date.now() - startTime;

      // Calculate current RPS based on phase
      if (elapsed < this.config.rampUpTime) {
        // Ramp up phase
        const progress = elapsed / this.config.rampUpTime;
        currentRPS = this.config.normalRPS + (this.config.peakRPS - this.config.normalRPS) * progress;
      } else if (elapsed > this.config.duration - this.config.rampDownTime) {
        // Ramp down phase
        const timeRemaining = endTime - Date.now();
        const progress = timeRemaining / this.config.rampDownTime;
        currentRPS = this.config.normalRPS + (this.config.peakRPS - this.config.normalRPS) * progress;
      } else {
        // Peak phase
        currentRPS = this.config.peakRPS;
      }

      // Generate load
      const requestsThisCycle = Math.floor(currentRPS / 10); // 10 cycles per second
      const promises: Promise<void>[] = [];

      for (let i = 0; i < requestsThisCycle; i++) {
        promises.push(this.makeRequest());
      }

      await Promise.all(promises);
      await this.sleep(100);
    }

    clearInterval(resourceMonitor);

    // Calculate results
    this.calculateLatencyPercentiles();
    this.result.throughput = this.result.totalRequests / (this.config.duration / 1000);
    this.result.errorRate = this.result.failedRequests / this.result.totalRequests;

    console.log('\n=== Chaos Test Results ===');
    console.log(`Total requests: ${this.result.totalRequests}`);
    console.log(`Successful: ${this.result.successfulRequests} (${Math.round(this.result.successfulRequests / this.result.totalRequests * 100)}%)`);
    console.log(`Rate limited: ${this.result.rateLimitedRequests} (${Math.round(this.result.rateLimitedRequests / this.result.totalRequests * 100)}%)`);
    console.log(`Failed: ${this.result.failedRequests} (${Math.round(this.result.failedRequests / this.result.totalRequests * 100)}%)`);
    console.log(`\nLatency:`);
    console.log(`  P50: ${Math.round(this.result.latencyP50)}ms`);
    console.log(`  P95: ${Math.round(this.result.latencyP95)}ms`);
    console.log(`  P99: ${Math.round(this.result.latencyP99)}ms`);
    console.log(`  Max: ${Math.round(this.result.maxLatency)}ms`);
    console.log(`\nThroughput: ${Math.round(this.result.throughput)} req/s`);
    console.log(`Error rate: ${(this.result.errorRate * 100).toFixed(2)}%`);
    console.log(`\nPeak resource usage:`);
    console.log(`  DB connections: ${this.result.peakResourceUsage.dbConnections}`);
    console.log(`  Memory: ${Math.round(this.result.peakResourceUsage.memoryMB)}MB`);

    return this.result;
  }

  /**
   * Make a single request
   */
  private async makeRequest(): Promise<void> {
    this.result.totalRequests++;
    const startTime = Date.now();

    try {
      // Simulate request: cache check + DB query
      const cacheResult = await this.redis.get('test-key');

      if (!cacheResult) {
        await this.dbPool.query('SELECT 1');
        await this.redis.set('test-key', 'value', 'EX', 60);
      }

      const latency = Date.now() - startTime;
      this.latencies.push(latency);
      this.result.successfulRequests++;

      if (latency > this.result.maxLatency) {
        this.result.maxLatency = latency;
      }
    } catch (error: any) {
      const latency = Date.now() - startTime;

      if (error.message.includes('rate limit')) {
        this.result.rateLimitedRequests++;
      } else {
        this.result.failedRequests++;
      }

      this.latencies.push(latency);
    }
  }

  /**
   * Monitor resource usage
   */
  private monitorResources(): void {
    const metrics = this.dbPool.getMetrics();

    if (metrics.totalConnections > this.result.peakResourceUsage.dbConnections) {
      this.result.peakResourceUsage.dbConnections = metrics.totalConnections;
    }

    const memoryUsage = process.memoryUsage();
    const memoryMB = memoryUsage.heapUsed / 1024 / 1024;

    if (memoryMB > this.result.peakResourceUsage.memoryMB) {
      this.result.peakResourceUsage.memoryMB = memoryMB;
    }
  }

  /**
   * Calculate latency percentiles
   */
  private calculateLatencyPercentiles(): void {
    if (this.latencies.length === 0) {
      return;
    }

    const sorted = this.latencies.sort((a, b) => a - b);

    this.result.latencyP50 = sorted[Math.floor(sorted.length * 0.5)];
    this.result.latencyP95 = sorted[Math.floor(sorted.length * 0.95)];
    this.result.latencyP99 = sorted[Math.floor(sorted.length * 0.99)];
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Run high load chaos test
 */
export async function runHighLoadChaos(
  dbPool: DatabasePool,
  redis: Redis,
  config: HighLoadConfig = {
    duration: 120000,      // 2 minutes
    normalRPS: 10,         // 10 requests/sec normal
    peakRPS: 100,          // 100 requests/sec peak (10x)
    rampUpTime: 30000,     // 30s ramp up
    rampDownTime: 30000    // 30s ramp down
  }
): Promise<HighLoadResult> {
  const chaos = new HighLoadChaos(dbPool, redis, config);
  return await chaos.run();
}
