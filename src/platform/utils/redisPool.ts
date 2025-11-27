/**
 * MARCUS 3.0 Redis Connection Pool Manager
 *
 * HIGH PRIORITY #1: Centralized Redis connection pooling
 *
 * Problem:
 * - Each component creates independent Redis connections without pooling
 * - Will exhaust connections at scale (>100 workers)
 * - Current: ~10-15 connections per component × N components = explosion
 *
 * Solution:
 * - Single connection pool shared across all components
 * - Configurable pool size based on worker count
 * - Connection health monitoring and automatic reconnection
 * - Metrics: active connections, idle connections, errors
 *
 * Expected Outcome:
 * - Controlled connection count (max = workers × 2)
 * - Connection reuse reduces handshake overhead
 * - Automatic recovery from connection failures
 * - Observable via Prometheus metrics
 *
 * Author: Marcus (Platform Engineer)
 * Date: 2025-11-22
 */

import Redis from 'ioredis';
import { Gauge, Counter } from 'prom-client';
import { EventEmitter } from 'events';

// ============================================================================
// Prometheus Metrics
// ============================================================================

const redisConnectionsActive = new Gauge({
  name: 'marcus_redis_connections_active',
  help: 'Number of active Redis connections in the pool'
});

const redisConnectionsIdle = new Gauge({
  name: 'marcus_redis_connections_idle',
  help: 'Number of idle Redis connections in the pool'
});

const redisConnectionErrors = new Counter({
  name: 'marcus_redis_connection_errors_total',
  help: 'Total number of Redis connection errors',
  labelNames: ['error_type']
});

const redisCommandDuration = new Gauge({
  name: 'marcus_redis_command_duration_ms',
  help: 'Redis command execution duration in milliseconds',
  labelNames: ['command']
});

// ============================================================================
// Configuration
// ============================================================================

export interface RedisPoolConfig {
  host: string;
  port: number;
  db: number;
  password?: string;

  // Pool configuration
  maxConnections: number;        // Maximum pool size (default: workers × 2)
  minConnections: number;        // Minimum idle connections (default: 2)
  acquireTimeout: number;        // Max time to wait for connection (ms)
  idleTimeout: number;          // Time before idle connection is closed (ms)

  // Health check configuration
  healthCheckInterval: number;   // Health check frequency (ms)
  maxRetriesPerRequest: number;  // Max retries for failed commands
  connectTimeout: number;        // Connection timeout (ms)

  // Advanced options
  enableReadyCheck: boolean;     // Wait for READY event before using
  enableOfflineQueue: boolean;   // Queue commands when disconnected
  lazyConnect: boolean;          // Delay connection until first command
}

export const DEFAULT_REDIS_POOL_CONFIG: Partial<RedisPoolConfig> = {
  maxConnections: parseInt(process.env.REDIS_POOL_SIZE || '20', 10),
  minConnections: 2,
  acquireTimeout: 5000,
  idleTimeout: 300000,  // 5 minutes
  healthCheckInterval: 10000,  // 10 seconds
  maxRetriesPerRequest: 3,
  connectTimeout: 10000,
  enableReadyCheck: true,
  enableOfflineQueue: true,
  lazyConnect: false
};

// ============================================================================
// Redis Connection Pool
// ============================================================================

export class RedisConnectionPool extends EventEmitter {
  private config: RedisPoolConfig;
  private activeConnections: Set<Redis> = new Set();
  private idleConnections: Redis[] = [];
  private pendingAcquires: Array<{
    resolve: (client: Redis) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
  }> = [];
  private healthCheckInterval?: NodeJS.Timeout;
  private isShuttingDown: boolean = false;
  private totalCreated: number = 0;

  constructor(config: RedisPoolConfig) {
    super();
    this.config = config;

    // Initialize minimum connections
    this.initializePool();

    // Start health monitoring
    this.startHealthMonitoring();

    console.log(`✅ Redis connection pool initialized (max: ${config.maxConnections}, min: ${config.minConnections})`);
  }

  /**
   * Initialize pool with minimum connections.
   */
  private async initializePool(): Promise<void> {
    const promises = [];
    for (let i = 0; i < this.config.minConnections; i++) {
      promises.push(this.createConnection());
    }
    await Promise.all(promises);
  }

  /**
   * Create a new Redis connection.
   */
  private async createConnection(): Promise<Redis> {
    if (this.totalCreated >= this.config.maxConnections) {
      throw new Error(`Redis pool exhausted (max: ${this.config.maxConnections})`);
    }

    const client = new Redis({
      host: this.config.host,
      port: this.config.port,
      db: this.config.db,
      password: this.config.password,
      maxRetriesPerRequest: this.config.maxRetriesPerRequest,
      connectTimeout: this.config.connectTimeout,
      enableReadyCheck: this.config.enableReadyCheck,
      enableOfflineQueue: this.config.enableOfflineQueue,
      lazyConnect: this.config.lazyConnect,
      retryStrategy: (times: number) => {
        // Exponential backoff with max 3 seconds
        const delay = Math.min(times * 100, 3000);
        console.warn(`⚠️ Redis connection retry ${times}, delay: ${delay}ms`);
        return delay;
      }
    });

    // Set up event handlers
    client.on('error', (err) => {
      console.error('❌ Redis connection error:', err);
      redisConnectionErrors.inc({ error_type: 'connection' });
      this.emit('error', err);
    });

    client.on('close', () => {
      console.warn('⚠️ Redis connection closed');
      this.activeConnections.delete(client);
      this.idleConnections = this.idleConnections.filter(c => c !== client);
      this.updateMetrics();
    });

    client.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...');
    });

    client.on('ready', () => {
      console.log('✅ Redis connection ready');
      this.emit('connection_ready', client);
    });

    this.totalCreated++;
    this.idleConnections.push(client);
    this.updateMetrics();

    return client;
  }

  /**
   * Acquire a connection from the pool.
   *
   * Blocks until a connection is available or timeout is reached.
   */
  async acquire(): Promise<Redis> {
    if (this.isShuttingDown) {
      throw new Error('Pool is shutting down');
    }

    // Try to get an idle connection
    const idleClient = this.idleConnections.pop();
    if (idleClient) {
      this.activeConnections.add(idleClient);
      this.updateMetrics();
      return idleClient;
    }

    // Try to create a new connection if under limit
    if (this.totalCreated < this.config.maxConnections) {
      try {
        const newClient = await this.createConnection();
        this.activeConnections.add(newClient);
        this.updateMetrics();
        return newClient;
      } catch (err) {
        console.error('❌ Failed to create new Redis connection:', err);
        redisConnectionErrors.inc({ error_type: 'creation' });
      }
    }

    // Wait for a connection to become available
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        const index = this.pendingAcquires.findIndex(p => p.resolve === resolve);
        if (index >= 0) {
          this.pendingAcquires.splice(index, 1);
        }
        reject(new Error(`Redis connection acquire timeout (${this.config.acquireTimeout}ms)`));
        redisConnectionErrors.inc({ error_type: 'acquire_timeout' });
      }, this.config.acquireTimeout);

      this.pendingAcquires.push({ resolve, reject, timeout });
    });
  }

  /**
   * Release a connection back to the pool.
   */
  release(client: Redis): void {
    if (!this.activeConnections.has(client)) {
      console.warn('⚠️ Attempted to release connection not in active set');
      return;
    }

    this.activeConnections.delete(client);

    // Check if there are pending acquires
    const pending = this.pendingAcquires.shift();
    if (pending) {
      clearTimeout(pending.timeout);
      this.activeConnections.add(client);
      pending.resolve(client);
      this.updateMetrics();
      return;
    }

    // Return to idle pool
    this.idleConnections.push(client);
    this.updateMetrics();

    // Close excess idle connections
    this.pruneIdleConnections();
  }

  /**
   * Execute a Redis command with automatic connection management.
   *
   * @param fn Function that takes a Redis client and returns a promise
   * @returns Result of the command
   */
  async execute<T>(fn: (client: Redis) => Promise<T>): Promise<T> {
    const client = await this.acquire();
    const startTime = Date.now();

    try {
      const result = await fn(client);
      const duration = Date.now() - startTime;

      // Track command duration (extract command name if possible)
      redisCommandDuration.set({ command: 'generic' }, duration);

      return result;
    } finally {
      this.release(client);
    }
  }

  /**
   * Prune excess idle connections to maintain pool size.
   */
  private pruneIdleConnections(): void {
    while (this.idleConnections.length > this.config.minConnections) {
      const client = this.idleConnections.shift();
      if (client) {
        client.disconnect();
        this.totalCreated--;
      }
    }
  }

  /**
   * Update Prometheus metrics.
   */
  private updateMetrics(): void {
    redisConnectionsActive.set(this.activeConnections.size);
    redisConnectionsIdle.set(this.idleConnections.length);
  }

  /**
   * Start health monitoring for pool connections.
   */
  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, this.config.healthCheckInterval);
  }

  /**
   * Perform health check on all connections.
   */
  private async performHealthCheck(): Promise<void> {
    const checks: Promise<void>[] = [];

    // Check idle connections
    for (const client of this.idleConnections) {
      checks.push(
        client.ping()
          .then(() => {
            // Connection healthy
          })
          .catch((err) => {
            console.error('❌ Health check failed for idle connection:', err);
            redisConnectionErrors.inc({ error_type: 'health_check' });

            // Remove unhealthy connection
            this.idleConnections = this.idleConnections.filter(c => c !== client);
            client.disconnect();
            this.totalCreated--;

            // Create replacement if below minimum
            if (this.totalCreated < this.config.minConnections) {
              this.createConnection().catch(console.error);
            }
          })
      );
    }

    await Promise.allSettled(checks);
    this.updateMetrics();
  }

  /**
   * Get pool statistics.
   */
  getStats(): {
    active: number;
    idle: number;
    total: number;
    pending: number;
    maxConnections: number;
  } {
    return {
      active: this.activeConnections.size,
      idle: this.idleConnections.length,
      total: this.totalCreated,
      pending: this.pendingAcquires.length,
      maxConnections: this.config.maxConnections
    };
  }

  /**
   * Check if pool is healthy.
   */
  isHealthy(): boolean {
    return (
      this.totalCreated > 0 &&
      !this.isShuttingDown &&
      this.activeConnections.size < this.config.maxConnections
    );
  }

  /**
   * Shutdown pool and close all connections.
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down Redis connection pool...');
    this.isShuttingDown = true;

    // Clear health check interval
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    // Reject pending acquires
    for (const pending of this.pendingAcquires) {
      clearTimeout(pending.timeout);
      pending.reject(new Error('Pool shutting down'));
    }
    this.pendingAcquires = [];

    // Close all connections
    const closePromises: Promise<void>[] = [];

    for (const client of this.activeConnections) {
      closePromises.push(
        client.quit().catch(() => client.disconnect())
      );
    }

    for (const client of this.idleConnections) {
      closePromises.push(
        client.quit().catch(() => client.disconnect())
      );
    }

    await Promise.allSettled(closePromises);

    this.activeConnections.clear();
    this.idleConnections = [];
    this.totalCreated = 0;
    this.updateMetrics();

    console.log('✅ Redis connection pool shutdown complete');
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let globalPool: RedisConnectionPool | null = null;

/**
 * Initialize global Redis connection pool.
 *
 * Call this once at application startup.
 */
export function initializeRedisPool(config: RedisPoolConfig): RedisConnectionPool {
  if (globalPool) {
    console.warn('⚠️ Redis pool already initialized, returning existing instance');
    return globalPool;
  }

  globalPool = new RedisConnectionPool(config);
  return globalPool;
}

/**
 * Get global Redis connection pool.
 *
 * Throws error if pool not initialized.
 */
export function getRedisPool(): RedisConnectionPool {
  if (!globalPool) {
    throw new Error(
      '❌ CRITICAL: Redis pool not initialized. ' +
      'Call initializeRedisPool() at application startup.'
    );
  }
  return globalPool;
}

/**
 * Shutdown global Redis connection pool.
 */
export async function shutdownRedisPool(): Promise<void> {
  if (globalPool) {
    await globalPool.shutdown();
    globalPool = null;
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Execute Redis command with automatic connection management.
 *
 * Convenience wrapper around getRedisPool().execute().
 */
export async function withRedis<T>(fn: (client: Redis) => Promise<T>): Promise<T> {
  const pool = getRedisPool();
  return pool.execute(fn);
}

// ============================================================================
// Example Usage
// ============================================================================

/*
// Application startup
const pool = initializeRedisPool({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  db: parseInt(process.env.REDIS_DB || '0', 10),
  maxConnections: parseInt(process.env.REDIS_POOL_SIZE || '20', 10),
  minConnections: 2,
  acquireTimeout: 5000,
  idleTimeout: 300000,
  healthCheckInterval: 10000,
  maxRetriesPerRequest: 3,
  connectTimeout: 10000,
  enableReadyCheck: true,
  enableOfflineQueue: true,
  lazyConnect: false
});

// Use in application code
const value = await withRedis(async (redis) => {
  return await redis.get('some-key');
});

// Or acquire/release manually
const client = await pool.acquire();
try {
  await client.set('key', 'value');
  const value = await client.get('key');
} finally {
  pool.release(client);
}

// Application shutdown
await shutdownRedisPool();
*/
