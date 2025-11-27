/**
 * MARCUS 3.0 Citation Integrity Platform
 * Unified Metrics Collector Service
 *
 * Central coordinator for all periodic metric updates. Implements the pull-based
 * Prometheus model by continuously updating gauge values from infrastructure state.
 *
 * Addresses architecture-skeptic review Issue #7: No Metric Registry Coordination
 *
 * Responsibilities:
 * - Update database pool metrics (size, idle, waiting)
 * - Update circuit breaker states (when registry provided)
 * - Coordinate with specialized collectors (Redis)
 * - Provide single lifecycle management for all metric updates
 * - Ensure metrics are fresh when Prometheus scrapes
 *
 * @module metricsCollector
 * @author Marcus (Platform Engineer)
 */

import { Pool } from 'pg';
import Redis from 'ioredis';
import { dbPoolSize, dbPoolWaiting } from './metricsEndpoint';
import { RedisMetricsCollector } from './redisMetricsCollector';

/**
 * Circuit breaker interface for metric collection
 * (Avoids circular dependency with circuitBreaker.ts)
 */
export interface CircuitBreakerLike {
  getMetrics(): {
    name: string;
    state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
    failures: number;
    successes: number;
    consecutiveFailures: number;
    consecutiveSuccesses: number;
    totalRejections: number;
  };
}

export interface MetricsCollectorConfig {
  /**
   * How often to update infrastructure metrics (ms)
   * Default: 5000 (5 seconds)
   *
   * Balance considerations:
   * - Too frequent: Unnecessary overhead
   * - Too infrequent: Stale metrics on Prometheus scrape
   * - Prometheus default scrape interval: 15s
   * - Recommendation: 5-10s (2-3 updates per scrape)
   */
  updateIntervalMs: number;

  /**
   * Enable Redis metrics collection
   * Default: true
   */
  enableRedisMetrics: boolean;

  /**
   * Redis collector configuration (if enabled)
   */
  redisCollectorConfig?: {
    collectionIntervalMs: number;
    enableCommandMonitoring: boolean;
  };
}

/**
 * Unified metrics collector service
 */
export class MetricsCollector {
  private pool: Pool;
  private redis: Redis;
  private config: MetricsCollectorConfig;
  private intervalHandle: NodeJS.Timeout | null = null;
  private redisCollector: RedisMetricsCollector | null = null;
  private circuitBreakers: Map<string, CircuitBreakerLike> = new Map();
  private isRunning: boolean = false;

  constructor(
    pool: Pool,
    redis: Redis,
    config: Partial<MetricsCollectorConfig> = {}
  ) {
    this.pool = pool;
    this.redis = redis;
    this.config = {
      updateIntervalMs: config.updateIntervalMs || 5000,
      enableRedisMetrics: config.enableRedisMetrics !== false,
      redisCollectorConfig: config.redisCollectorConfig || {
        collectionIntervalMs: 10000,
        enableCommandMonitoring: true
      }
    };

    // Initialize Redis collector if enabled
    if (this.config.enableRedisMetrics) {
      this.redisCollector = new RedisMetricsCollector(
        this.redis,
        this.config.redisCollectorConfig
      );
    }
  }

  /**
   * Register a circuit breaker for metrics collection
   *
   * Circuit breakers should call this on creation to be tracked
   */
  registerCircuitBreaker(name: string, circuitBreaker: CircuitBreakerLike): void {
    this.circuitBreakers.set(name, circuitBreaker);
    console.log(`✅ Registered circuit breaker for metrics: ${name}`);
  }

  /**
   * Unregister a circuit breaker
   */
  unregisterCircuitBreaker(name: string): void {
    this.circuitBreakers.delete(name);
    console.log(`✅ Unregistered circuit breaker: ${name}`);
  }

  /**
   * Start periodic metrics collection
   */
  start(): void {
    if (this.isRunning) {
      console.warn('⚠️ MetricsCollector already running');
      return;
    }

    this.isRunning = true;
    console.log(`✅ Starting metrics collection (interval: ${this.config.updateIntervalMs}ms)`);

    // Start Redis collector if enabled
    if (this.redisCollector) {
      this.redisCollector.start();
    }

    // Collect immediately on start
    this.collectMetrics().catch(err => {
      console.error('❌ Failed to collect initial metrics:', err);
    });

    // Then collect periodically
    this.intervalHandle = setInterval(() => {
      this.collectMetrics().catch(err => {
        console.error('❌ Failed to collect metrics:', err);
      });
    }, this.config.updateIntervalMs);
  }

  /**
   * Stop periodic metrics collection
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }

    // Stop Redis collector if running
    if (this.redisCollector) {
      this.redisCollector.stop();
    }

    console.log('✅ Stopped metrics collection');
  }

  /**
   * Collect all infrastructure metrics
   */
  private async collectMetrics(): Promise<void> {
    // Run all metric updates in parallel for efficiency
    await Promise.all([
      this.updateDatabasePoolMetrics(),
      this.updateCircuitBreakerMetrics()
    ]);
  }

  /**
   * Update database pool metrics
   *
   * Metrics updated:
   * - marcus_db_pool_size{pool_type="total"}
   * - marcus_db_pool_size{pool_type="idle"}
   * - marcus_db_pool_waiting
   */
  private async updateDatabasePoolMetrics(): Promise<void> {
    try {
      const totalConnections = this.pool.totalCount;
      const idleConnections = this.pool.idleCount;
      const waitingClients = this.pool.waitingCount;

      dbPoolSize.set({ pool_type: 'total' }, totalConnections);
      dbPoolSize.set({ pool_type: 'idle' }, idleConnections);
      dbPoolWaiting.set(waitingClients);

    } catch (err) {
      console.error('❌ Error updating database pool metrics:', err);
    }
  }

  /**
   * Update circuit breaker metrics
   *
   * Note: Circuit breakers update their own Prometheus metrics on state
   * transitions. This method is reserved for future batch updates if needed.
   *
   * Currently a no-op since circuit breakers self-report via updatePrometheusMetrics()
   */
  private async updateCircuitBreakerMetrics(): Promise<void> {
    // Circuit breakers currently update their own metrics on state transitions
    // This method is available for future batch metric updates if needed

    // Example future implementation:
    // for (const [name, cb] of this.circuitBreakers) {
    //   const metrics = cb.getMetrics();
    //   circuitBreakerState.set({ breaker_name: name }, stateToNumber(metrics.state));
    // }
  }

  /**
   * Get collector status (for debugging/health checks)
   */
  getStatus(): {
    running: boolean;
    updateIntervalMs: number;
    redisMetricsEnabled: boolean;
    registeredCircuitBreakers: string[];
  } {
    return {
      running: this.isRunning,
      updateIntervalMs: this.config.updateIntervalMs,
      redisMetricsEnabled: this.config.enableRedisMetrics,
      registeredCircuitBreakers: Array.from(this.circuitBreakers.keys())
    };
  }

  /**
   * Force an immediate metric collection (for testing)
   */
  async collectNow(): Promise<void> {
    await this.collectMetrics();
  }
}

/**
 * Singleton instance management
 *
 * Provides a global metrics collector instance for the application.
 * Components can import and use this instance without dependency injection.
 */
let globalMetricsCollector: MetricsCollector | null = null;

export function initializeMetricsCollector(
  pool: Pool,
  redis: Redis,
  config?: Partial<MetricsCollectorConfig>
): MetricsCollector {
  if (globalMetricsCollector) {
    console.warn('⚠️ MetricsCollector already initialized, returning existing instance');
    return globalMetricsCollector;
  }

  globalMetricsCollector = new MetricsCollector(pool, redis, config);
  return globalMetricsCollector;
}

export function getMetricsCollector(): MetricsCollector | null {
  return globalMetricsCollector;
}

export function resetMetricsCollector(): void {
  if (globalMetricsCollector) {
    globalMetricsCollector.stop();
    globalMetricsCollector = null;
  }
}
