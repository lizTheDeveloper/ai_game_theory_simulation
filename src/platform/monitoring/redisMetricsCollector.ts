/**
 * MARCUS 3.0 Citation Integrity Platform
 * Redis Metrics Collector
 *
 * Periodically collects Redis performance metrics and updates Prometheus gauges/counters.
 *
 * Metrics collected:
 * - Memory usage (used, peak, RSS)
 * - Connected clients
 * - Keyspace hits/misses (rate tracking)
 * - Command latency (via monitoring)
 *
 * @module redisMetricsCollector
 * @author Marcus (Platform Engineer)
 */

import Redis from 'ioredis';
import {
  redisMemoryUsage,
  redisConnectedClients,
  redisKeyspaceHits,
  redisKeyspaceMisses,
  redisCommandsDuration
} from './metricsEndpoint';

export interface RedisMetricsCollectorConfig {
  collectionIntervalMs: number; // How often to collect metrics
  enableCommandMonitoring: boolean; // Track individual command latency
}

export class RedisMetricsCollector {
  private redis: Redis;
  private config: RedisMetricsCollectorConfig;
  private intervalHandle: NodeJS.Timeout | null = null;
  private lastKeyspaceStats: { hits: number; misses: number } | null = null;

  constructor(redis: Redis, config: Partial<RedisMetricsCollectorConfig> = {}) {
    this.redis = redis;
    this.config = {
      collectionIntervalMs: config.collectionIntervalMs || 10000, // Default: 10 seconds
      enableCommandMonitoring: config.enableCommandMonitoring !== false, // Default: true
    };

    // Setup command monitoring if enabled
    if (this.config.enableCommandMonitoring) {
      this.setupCommandMonitoring();
    }
  }

  /**
   * Start periodic metrics collection
   */
  start(): void {
    if (this.intervalHandle) {
      console.warn('⚠️ RedisMetricsCollector already running');
      return;
    }

    console.log(`✅ Starting Redis metrics collection (interval: ${this.config.collectionIntervalMs}ms)`);

    // Collect immediately on start
    this.collectMetrics().catch(err => {
      console.error('❌ Failed to collect initial Redis metrics:', err);
    });

    // Then collect periodically
    this.intervalHandle = setInterval(() => {
      this.collectMetrics().catch(err => {
        console.error('❌ Failed to collect Redis metrics:', err);
      });
    }, this.config.collectionIntervalMs);
  }

  /**
   * Stop periodic metrics collection
   */
  stop(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
      console.log('✅ Stopped Redis metrics collection');
    }
  }

  /**
   * Collect all Redis metrics via INFO command
   */
  private async collectMetrics(): Promise<void> {
    try {
      // Get Redis INFO for memory and stats sections
      const [memoryInfo, statsInfo] = await Promise.all([
        this.redis.info('memory'),
        this.redis.info('stats')
      ]);

      // Parse and update memory metrics
      this.parseMemoryMetrics(memoryInfo);

      // Parse and update stats metrics
      this.parseStatsMetrics(statsInfo);

      // Get connected clients count
      const clientList = await this.redis.client('LIST');
      const clientCount = clientList.split('\n').filter(line => line.trim()).length;
      redisConnectedClients.set(clientCount);

    } catch (err) {
      console.error('❌ Error collecting Redis metrics:', err);
      throw err;
    }
  }

  /**
   * Parse memory section from Redis INFO
   */
  private parseMemoryMetrics(memoryInfo: string): void {
    const lines = memoryInfo.split('\n');

    for (const line of lines) {
      if (line.startsWith('used_memory:')) {
        const value = parseInt(line.split(':')[1], 10);
        redisMemoryUsage.set({ type: 'used' }, value);
      } else if (line.startsWith('used_memory_peak:')) {
        const value = parseInt(line.split(':')[1], 10);
        redisMemoryUsage.set({ type: 'peak' }, value);
      } else if (line.startsWith('used_memory_rss:')) {
        const value = parseInt(line.split(':')[1], 10);
        redisMemoryUsage.set({ type: 'rss' }, value);
      }
    }
  }

  /**
   * Parse stats section from Redis INFO
   *
   * Note: Redis provides cumulative hits/misses, so we calculate
   * the delta since last collection to get rates
   */
  private parseStatsMetrics(statsInfo: string): void {
    const lines = statsInfo.split('\n');
    let hits = 0;
    let misses = 0;

    for (const line of lines) {
      if (line.startsWith('keyspace_hits:')) {
        hits = parseInt(line.split(':')[1], 10);
      } else if (line.startsWith('keyspace_misses:')) {
        misses = parseInt(line.split(':')[1], 10);
      }
    }

    // Calculate delta since last collection
    if (this.lastKeyspaceStats) {
      const hitsDelta = hits - this.lastKeyspaceStats.hits;
      const missesDelta = misses - this.lastKeyspaceStats.misses;

      // Only increment if delta is positive (protects against Redis restart)
      if (hitsDelta > 0) {
        redisKeyspaceHits.inc(hitsDelta);
      }
      if (missesDelta > 0) {
        redisKeyspaceMisses.inc(missesDelta);
      }
    }

    // Store for next collection
    this.lastKeyspaceStats = { hits, misses };
  }

  /**
   * Setup command monitoring to track latency per command type
   *
   * WARNING: This adds overhead to every Redis command. Disable in
   * high-throughput scenarios if latency becomes an issue.
   */
  private setupCommandMonitoring(): void {
    // Monkey-patch Redis send_command to track timing
    const originalSendCommand = (this.redis as any).sendCommand;

    (this.redis as any).sendCommand = function(command: any, stream?: any) {
      const commandName = command.name?.toUpperCase() || 'UNKNOWN';
      const startTime = Date.now();

      // Call original send_command
      const result = originalSendCommand.call(this, command, stream);

      // Wrap promise to measure latency
      if (result && typeof result.then === 'function') {
        return result.then(
          (value: any) => {
            const duration = (Date.now() - startTime) / 1000; // Convert to seconds
            redisCommandsDuration.observe({ command: commandName }, duration);
            return value;
          },
          (err: any) => {
            const duration = (Date.now() - startTime) / 1000;
            redisCommandsDuration.observe({ command: commandName }, duration);
            throw err;
          }
        );
      }

      return result;
    };

    console.log('✅ Redis command monitoring enabled (tracks per-command latency)');
  }

  /**
   * Get current metrics snapshot (for debugging)
   */
  async getMetricsSnapshot(): Promise<{
    memory: { used: number; peak: number; rss: number };
    clients: number;
    keyspace: { hits: number; misses: number };
  }> {
    const [memoryInfo, statsInfo] = await Promise.all([
      this.redis.info('memory'),
      this.redis.info('stats')
    ]);

    const memory = { used: 0, peak: 0, rss: 0 };
    const keyspace = { hits: 0, misses: 0 };

    // Parse memory
    memoryInfo.split('\n').forEach(line => {
      if (line.startsWith('used_memory:')) {
        memory.used = parseInt(line.split(':')[1], 10);
      } else if (line.startsWith('used_memory_peak:')) {
        memory.peak = parseInt(line.split(':')[1], 10);
      } else if (line.startsWith('used_memory_rss:')) {
        memory.rss = parseInt(line.split(':')[1], 10);
      }
    });

    // Parse stats
    statsInfo.split('\n').forEach(line => {
      if (line.startsWith('keyspace_hits:')) {
        keyspace.hits = parseInt(line.split(':')[1], 10);
      } else if (line.startsWith('keyspace_misses:')) {
        keyspace.misses = parseInt(line.split(':')[1], 10);
      }
    });

    const clientList = await this.redis.client('LIST');
    const clients = clientList.split('\n').filter(line => line.trim()).length;

    return { memory, clients, keyspace };
  }
}
