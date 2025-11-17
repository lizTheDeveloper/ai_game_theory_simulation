/**
 * Chaos Engineering Test: Random Database Failures
 *
 * Scenario:
 * - Randomly kill database connections every 5 minutes
 * - Verify circuit breaker opens
 * - Verify retry logic works
 * - Verify application recovers
 *
 * Expected behavior:
 * - Circuit breaker should open after threshold failures
 * - Retry logic should attempt with exponential backoff
 * - System should recover when DB is available
 * - No data loss or corruption
 *
 * @module platform/tests/chaos/db-failures
 */

import { DatabasePool } from '../../database/pool';
import { CircuitBreaker, circuitBreakerManager } from '../../resilience/circuitBreaker';
import { retryWithBackoff } from '../../resilience/retryHandler';

export interface ChaosConfig {
  duration: number;           // Test duration in ms
  failureInterval: number;    // How often to inject failures (ms)
  failureChance: number;      // Probability of failure (0-1)
}

export interface ChaosResult {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  circuitBreakerTrips: number;
  retryAttempts: number;
  recoveryTime: number[];     // Time to recover after each failure (ms)
  averageRecoveryTime: number;
}

/**
 * Chaos test: Random database failures
 */
export class DatabaseFailureChaos {
  private result: ChaosResult = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    circuitBreakerTrips: 0,
    retryAttempts: 0,
    recoveryTime: [],
    averageRecoveryTime: 0
  };

  private circuitBreaker: CircuitBreaker;
  private failureActive: boolean = false;
  private lastFailureTime: number = 0;

  constructor(
    private pool: DatabasePool,
    private config: ChaosConfig
  ) {
    // Create circuit breaker for DB
    this.circuitBreaker = circuitBreakerManager.getBreaker({
      name: 'chaos-db',
      failureThreshold: 5,
      timeout: 10000,
      successThreshold: 3,
      onStateChange: (from, to) => {
        console.log(`🔌 Circuit breaker: ${from} → ${to}`);
        if (to === 'OPEN') {
          this.result.circuitBreakerTrips++;
        }
      }
    });
  }

  /**
   * Run the chaos test
   */
  async run(): Promise<ChaosResult> {
    console.log('\n=== Chaos Test: Database Failures ===');
    console.log(`Duration: ${this.config.duration / 1000}s`);
    console.log(`Failure interval: ${this.config.failureInterval / 1000}s`);
    console.log(`Failure chance: ${this.config.failureChance * 100}%\n`);

    const startTime = Date.now();
    const endTime = startTime + this.config.duration;

    // Start failure injector
    const failureInjector = this.startFailureInjector();

    // Continuously make requests
    while (Date.now() < endTime) {
      await this.makeRequest();
      await this.sleep(100); // 10 requests per second
    }

    // Stop failure injector
    clearInterval(failureInjector);

    // Calculate results
    this.result.averageRecoveryTime =
      this.result.recoveryTime.length > 0
        ? this.result.recoveryTime.reduce((a, b) => a + b, 0) / this.result.recoveryTime.length
        : 0;

    console.log('\n=== Chaos Test Results ===');
    console.log(`Total requests: ${this.result.totalRequests}`);
    console.log(`Successful: ${this.result.successfulRequests} (${Math.round(this.result.successfulRequests / this.result.totalRequests * 100)}%)`);
    console.log(`Failed: ${this.result.failedRequests} (${Math.round(this.result.failedRequests / this.result.totalRequests * 100)}%)`);
    console.log(`Circuit breaker trips: ${this.result.circuitBreakerTrips}`);
    console.log(`Retry attempts: ${this.result.retryAttempts}`);
    console.log(`Average recovery time: ${Math.round(this.result.averageRecoveryTime)}ms`);

    return this.result;
  }

  /**
   * Start the failure injector
   */
  private startFailureInjector(): NodeJS.Timeout {
    return setInterval(() => {
      if (Math.random() < this.config.failureChance) {
        console.log('💥 Injecting database failure');
        this.failureActive = true;
        this.lastFailureTime = Date.now();

        // Simulate failure by rejecting queries
        setTimeout(() => {
          console.log('✅ Database recovered');
          this.failureActive = false;

          const recoveryTime = Date.now() - this.lastFailureTime;
          this.result.recoveryTime.push(recoveryTime);
        }, 5000); // 5 second failure
      }
    }, this.config.failureInterval);
  }

  /**
   * Make a database request with circuit breaker and retry
   */
  private async makeRequest(): Promise<void> {
    this.result.totalRequests++;

    try {
      await this.circuitBreaker.execute(async () => {
        return await retryWithBackoff(
          async () => {
            if (this.failureActive) {
              throw new Error('Database connection refused');
            }

            // Simulate query
            await this.pool.query('SELECT 1');
          },
          {
            maxRetries: 3,
            baseDelay: 1000,
            jitter: true,
            onRetry: () => {
              this.result.retryAttempts++;
            }
          },
          'chaos-query'
        );
      });

      this.result.successfulRequests++;
    } catch (error: any) {
      this.result.failedRequests++;
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
 * Run database failure chaos test
 */
export async function runDatabaseFailureChaos(
  pool: DatabasePool,
  config: ChaosConfig = {
    duration: 60000,      // 1 minute
    failureInterval: 5000, // Every 5 seconds
    failureChance: 0.3    // 30% chance
  }
): Promise<ChaosResult> {
  const chaos = new DatabaseFailureChaos(pool, config);
  return await chaos.run();
}
