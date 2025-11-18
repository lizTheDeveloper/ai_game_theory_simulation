/**
 * Database Connection Pool
 *
 * Manages PostgreSQL connection pool with:
 * - Configurable min/max connections
 * - Health checks and dead connection removal
 * - Pool metrics and monitoring
 * - Graceful degradation on pool exhaustion
 * - Slow query logging
 *
 * @module platform/database/pool
 */

import { Pool, PoolClient, PoolConfig, QueryResult } from 'pg';
import { EventEmitter } from 'events';
import { Counter, Gauge, Histogram } from 'prom-client';

export interface DatabasePoolConfig extends PoolConfig {
  healthCheckInterval?: number;  // Health check interval (ms, default: 30000)
  slowQueryThreshold?: number;   // Log queries slower than this (ms, default: 1000)
  poolExhaustionThreshold?: number;  // Alert if utilization > this (default: 0.9)
}

export interface PoolMetrics {
  totalConnections: number;
  idleConnections: number;
  activeConnections: number;
  waitingClients: number;
  utilization: number;  // activeConnections / max
  slowQueryCount: number;
}

/**
 * Database Connection Pool with monitoring and health checks
 */
export class DatabasePool extends EventEmitter {
  private pool: Pool;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private slowQueryCount: number = 0;

  // Prometheus metrics
  private connectionGauge: Gauge<string>;
  private queryCounter: Counter<string>;
  private queryLatency: Histogram<string>;
  private poolUtilizationGauge: Gauge<string>;

  constructor(private config: DatabasePoolConfig) {
    super();

    // Create pool with defaults
    this.pool = new Pool({
      ...config,
      min: config.min ?? 10,
      max: config.max ?? 50,
      idleTimeoutMillis: config.idleTimeoutMillis ?? 30000,
      connectionTimeoutMillis: config.connectionTimeoutMillis ?? 5000,
      allowExitOnIdle: config.allowExitOnIdle ?? false
    });

    // Initialize Prometheus metrics
    this.connectionGauge = new Gauge({
      name: 'db_pool_connections',
      help: 'Database pool connection counts',
      labelNames: ['state']
    });

    this.queryCounter = new Counter({
      name: 'db_queries_total',
      help: 'Total database queries',
      labelNames: ['result']
    });

    this.queryLatency = new Histogram({
      name: 'db_query_latency_ms',
      help: 'Database query latency',
      buckets: [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000]
    });

    this.poolUtilizationGauge = new Gauge({
      name: 'db_pool_utilization',
      help: 'Database pool utilization (0-1)'
    });

    // Set up event handlers
    this.setupEventHandlers();

    // Start health checks
    this.startHealthChecks();
  }

  /**
   * Set up pool event handlers
   */
  private setupEventHandlers(): void {
    this.pool.on('connect', () => {
      console.log('🔌 Database connection established');
      this.updateMetrics();
    });

    this.pool.on('acquire', () => {
      this.updateMetrics();
    });

    this.pool.on('remove', () => {
      console.log('🔌 Database connection removed');
      this.updateMetrics();
    });

    this.pool.on('error', (err: Error) => {
      console.error('❌ Database pool error:', err.message);
      this.emit('error', err);
    });
  }

  /**
   * Update Prometheus metrics
   */
  private updateMetrics(): void {
    const totalCount = this.pool.totalCount;
    const idleCount = this.pool.idleCount;
    const waitingCount = this.pool.waitingCount;

    this.connectionGauge.set({ state: 'total' }, totalCount);
    this.connectionGauge.set({ state: 'idle' }, idleCount);
    this.connectionGauge.set({ state: 'active' }, totalCount - idleCount);
    this.connectionGauge.set({ state: 'waiting' }, waitingCount);

    const max = this.config.max ?? 50;
    const utilization = totalCount / max;
    this.poolUtilizationGauge.set(utilization);

    // Alert if pool utilization too high
    const threshold = this.config.poolExhaustionThreshold ?? 0.9;
    if (utilization > threshold) {
      this.emit('poolExhaustion', {
        utilization,
        threshold,
        total: totalCount,
        max
      });
      console.log(`🚨 Database pool exhaustion: ${Math.round(utilization * 100)}% utilized`);
    }
  }

  /**
   * Start health checks
   */
  private startHealthChecks(): void {
    const interval = this.config.healthCheckInterval ?? 30000;

    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.healthCheck();
      } catch (error: any) {
        console.error(`❌ Database health check failed: ${error.message}`);
        this.emit('healthCheckFailed', error);
      }
    }, interval);

    console.log(`🏥 Database health checks started (every ${interval}ms)`);
  }

  /**
   * Stop health checks
   */
  private stopHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * Execute health check query
   */
  async healthCheck(): Promise<boolean> {
    const startTime = Date.now();

    try {
      const result = await this.pool.query('SELECT 1 AS health');
      const latency = Date.now() - startTime;

      if (result.rows[0]?.health !== 1) {
        throw new Error('Health check returned unexpected value');
      }

      return true;
    } catch (error: any) {
      console.error(`❌ Health check failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Execute a query with monitoring
   */
  async query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const startTime = Date.now();

    try {
      const result = await this.pool.query<T>(text, params);
      const latency = Date.now() - startTime;

      // Track metrics
      this.queryCounter.inc({ result: 'success' });
      this.queryLatency.observe(latency);

      // Log slow queries
      const slowThreshold = this.config.slowQueryThreshold ?? 1000;
      if (latency > slowThreshold) {
        this.slowQueryCount++;
        console.log(`🐌 Slow query (${latency}ms): ${text.substring(0, 100)}...`);
        this.emit('slowQuery', { text, params, latency });
      }

      return result;
    } catch (error: any) {
      const latency = Date.now() - startTime;

      this.queryCounter.inc({ result: 'error' });
      this.queryLatency.observe(latency);

      console.error(`❌ Query error (${latency}ms): ${error.message}`);
      throw error;
    }
  }

  /**
   * Get a client from the pool
   */
  async connect(): Promise<PoolClient> {
    try {
      const client = await this.pool.connect();
      return client;
    } catch (error: any) {
      console.error(`❌ Failed to acquire connection: ${error.message}`);
      throw error;
    }
  }

  /**
   * Execute a transaction
   */
  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.connect();

    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get pool metrics
   */
  getMetrics(): PoolMetrics {
    const totalCount = this.pool.totalCount;
    const idleCount = this.pool.idleCount;
    const waitingCount = this.pool.waitingCount;
    const max = this.config.max ?? 50;

    return {
      totalConnections: totalCount,
      idleConnections: idleCount,
      activeConnections: totalCount - idleCount,
      waitingClients: waitingCount,
      utilization: totalCount / max,
      slowQueryCount: this.slowQueryCount
    };
  }

  /**
   * Check if pool is healthy
   */
  isHealthy(): boolean {
    const metrics = this.getMetrics();

    // Healthy if:
    // 1. Pool not exhausted (utilization < threshold)
    // 2. No waiting clients (or very few)
    const threshold = this.config.poolExhaustionThreshold ?? 0.9;

    return metrics.utilization < threshold && metrics.waitingClients < 5;
  }

  /**
   * Gracefully close the pool
   */
  async close(): Promise<void> {
    this.stopHealthChecks();

    console.log('🔌 Closing database pool...');

    try {
      await this.pool.end();
      console.log('✅ Database pool closed');
    } catch (error: any) {
      console.error(`❌ Error closing pool: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get underlying pool (for advanced use cases)
   */
  getPool(): Pool {
    return this.pool;
  }
}

/**
 * Create a database pool with standard configuration
 */
export function createDatabasePool(config: DatabasePoolConfig): DatabasePool {
  return new DatabasePool(config);
}

/**
 * Singleton database pool instance
 *
 * IMPORTANT: This must be initialized before use by calling initializePool()
 * or by setting it manually. Files that import this should handle the case
 * where it may not be initialized yet.
 *
 * Usage:
 * ```typescript
 * import { pool, initializePool } from './pool';
 *
 * // Initialize once at startup
 * initializePool(config);
 *
 * // Use in queries
 * await pool.query('SELECT * FROM users');
 * ```
 */
export let pool: DatabasePool;

/**
 * Initialize the singleton pool instance
 *
 * @param config Database pool configuration
 * @returns The initialized pool instance
 */
export function initializePool(config: DatabasePoolConfig): DatabasePool {
  if (pool) {
    console.warn('⚠️ Database pool already initialized, replacing existing instance');
  }

  pool = new DatabasePool(config);
  console.log('✅ Singleton database pool initialized');

  return pool;
}

/**
 * Check if the singleton pool is initialized
 */
export function isPoolInitialized(): boolean {
  return pool !== undefined;
}
