/**
 * Dead Letter Queue (DLQ) Implementation
 *
 * Stores failed operations for retry with exponential backoff.
 * Uses Redis sorted sets for persistence and ordering.
 *
 * Features:
 * - Automatic retry with backoff (1m, 5m, 30m, 2h)
 * - Max retries: 5 attempts
 * - Background worker for processing
 * - Admin API for manual intervention
 * - Alerts when DLQ depth exceeds threshold
 *
 * @module platform/resilience/deadLetterQueue
 */

import Redis from 'ioredis';
import { EventEmitter } from 'events';
import { Counter, Gauge } from 'prom-client';
import { retryWithBackoff } from './retryHandler';

export interface DLQItem {
  id: string;
  operation: string;
  payload: any;
  error: string;
  retryCount: number;
  maxRetries: number;
  firstFailedAt: number;
  lastFailedAt: number;
  nextRetryAt: number;
  metadata?: Record<string, any>;
}

export interface DLQConfig {
  redis: Redis;
  queueName?: string;
  maxRetries?: number;
  retryDelays?: number[];      // Delays in ms for each retry
  pollingInterval?: number;     // How often to check DLQ (ms)
  alertThreshold?: number;      // Alert if DLQ depth exceeds this
}

export interface DLQStats {
  depth: number;
  oldestItemAge: number | null;
  retryRate: number;
  successRate: number;
  permanentFailures: number;
}

// Default retry delays: 1m, 5m, 30m, 2h, 6h
const DEFAULT_RETRY_DELAYS = [
  60 * 1000,        // 1 minute
  5 * 60 * 1000,    // 5 minutes
  30 * 60 * 1000,   // 30 minutes
  2 * 60 * 60 * 1000,  // 2 hours
  6 * 60 * 60 * 1000   // 6 hours
];

/**
 * Dead Letter Queue implementation using Redis
 */
export class DeadLetterQueue extends EventEmitter {
  private queueKey: string;
  private metadataKey: string;
  private workerRunning: boolean = false;
  private workerInterval: NodeJS.Timeout | null = null;

  // Prometheus metrics
  private depthGauge: Gauge<string>;
  private retryCounter: Counter<string>;
  private permanentFailureCounter: Counter<string>;

  constructor(private config: DLQConfig) {
    super();

    const queueName = config.queueName || 'dlq';
    this.queueKey = `${queueName}:queue`;
    this.metadataKey = `${queueName}:metadata`;

    // Initialize Prometheus metrics
    this.depthGauge = new Gauge({
      name: 'dlq_depth',
      help: 'Number of items in dead letter queue',
      labelNames: ['queue']
    });

    this.retryCounter = new Counter({
      name: 'dlq_retries_total',
      help: 'Total DLQ retry attempts',
      labelNames: ['queue', 'result']
    });

    this.permanentFailureCounter = new Counter({
      name: 'dlq_permanent_failures_total',
      help: 'Total permanent DLQ failures',
      labelNames: ['queue', 'operation']
    });
  }

  /**
   * Add an item to the DLQ
   */
  async add(item: Omit<DLQItem, 'id' | 'firstFailedAt' | 'lastFailedAt' | 'nextRetryAt'>): Promise<string> {
    const id = `${item.operation}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    const maxRetries = item.maxRetries ?? this.config.maxRetries ?? 5;
    const retryDelays = this.config.retryDelays || DEFAULT_RETRY_DELAYS;
    const nextRetryDelay = retryDelays[Math.min(item.retryCount, retryDelays.length - 1)];

    const dlqItem: DLQItem = {
      id,
      operation: item.operation,
      payload: item.payload,
      error: item.error,
      retryCount: item.retryCount,
      maxRetries,
      firstFailedAt: now,
      lastFailedAt: now,
      nextRetryAt: now + nextRetryDelay,
      metadata: item.metadata
    };

    // Add to sorted set (sorted by nextRetryAt)
    await this.config.redis.zadd(this.queueKey, dlqItem.nextRetryAt, id);

    // Store metadata
    await this.config.redis.hset(this.metadataKey, id, JSON.stringify(dlqItem));

    // Update depth metric
    const depth = await this.getDepth();
    this.depthGauge.set({ queue: this.config.queueName || 'dlq' }, depth);

    // Alert if threshold exceeded
    const alertThreshold = this.config.alertThreshold || 100;
    if (depth > alertThreshold) {
      this.emit('alert', {
        type: 'depth_exceeded',
        depth,
        threshold: alertThreshold
      });
      console.log(`🚨 DLQ depth exceeded threshold: ${depth} > ${alertThreshold}`);
    }

    console.log(`📥 Added to DLQ [${item.operation}]: ${id} (retry ${item.retryCount}/${maxRetries})`);

    return id;
  }

  /**
   * Get items ready for retry
   */
  async getReadyItems(limit: number = 10): Promise<DLQItem[]> {
    const now = Date.now();

    // Get items with nextRetryAt <= now
    const ids = await this.config.redis.zrangebyscore(
      this.queueKey,
      '-inf',
      now,
      'LIMIT', 0, limit
    );

    if (ids.length === 0) {
      return [];
    }

    // Get metadata for these items
    const metadataArray = await this.config.redis.hmget(this.metadataKey, ...ids);

    const items: DLQItem[] = [];
    for (let i = 0; i < ids.length; i++) {
      const metadata = metadataArray[i];
      if (metadata) {
        items.push(JSON.parse(metadata));
      }
    }

    return items;
  }

  /**
   * Remove an item from the DLQ
   */
  async remove(id: string): Promise<void> {
    await this.config.redis.zrem(this.queueKey, id);
    await this.config.redis.hdel(this.metadataKey, id);

    // Update depth metric
    const depth = await this.getDepth();
    this.depthGauge.set({ queue: this.config.queueName || 'dlq' }, depth);
  }

  /**
   * Retry an item
   */
  async retry(item: DLQItem, processor: (payload: any) => Promise<void>): Promise<boolean> {
    try {
      await processor(item.payload);

      // Success - remove from DLQ
      await this.remove(item.id);

      this.retryCounter.inc({ queue: this.config.queueName || 'dlq', result: 'success' });

      console.log(`✅ DLQ retry succeeded [${item.operation}]: ${item.id}`);

      this.emit('retrySuccess', item);
      return true;
    } catch (error: any) {
      // Failure - increment retry count
      item.retryCount++;
      item.lastFailedAt = Date.now();
      item.error = error.message;

      this.retryCounter.inc({ queue: this.config.queueName || 'dlq', result: 'failure' });

      if (item.retryCount >= item.maxRetries) {
        // Max retries exceeded - mark as permanent failure
        await this.remove(item.id);

        this.permanentFailureCounter.inc({
          queue: this.config.queueName || 'dlq',
          operation: item.operation
        });

        console.log(`❌ DLQ permanent failure [${item.operation}]: ${item.id} (max retries exceeded)`);

        this.emit('permanentFailure', item);
        return false;
      } else {
        // Schedule next retry with exponential backoff
        const retryDelays = this.config.retryDelays || DEFAULT_RETRY_DELAYS;
        const nextRetryDelay = retryDelays[Math.min(item.retryCount, retryDelays.length - 1)];
        item.nextRetryAt = Date.now() + nextRetryDelay;

        // Update in Redis
        await this.config.redis.zadd(this.queueKey, item.nextRetryAt, item.id);
        await this.config.redis.hset(this.metadataKey, item.id, JSON.stringify(item));

        console.log(`⚠️ DLQ retry failed [${item.operation}]: ${item.id} (retry ${item.retryCount}/${item.maxRetries}, next retry in ${Math.round(nextRetryDelay / 1000)}s)`);

        this.emit('retryFailure', item);
        return false;
      }
    }
  }

  /**
   * Get DLQ depth
   */
  async getDepth(): Promise<number> {
    return await this.config.redis.zcard(this.queueKey);
  }

  /**
   * Get DLQ stats
   */
  async getStats(): Promise<DLQStats> {
    const depth = await this.getDepth();

    // Get oldest item
    const oldestItems = await this.config.redis.zrange(this.queueKey, 0, 0);
    let oldestItemAge: number | null = null;

    if (oldestItems.length > 0) {
      const metadata = await this.config.redis.hget(this.metadataKey, oldestItems[0]);
      if (metadata) {
        const item: DLQItem = JSON.parse(metadata);
        oldestItemAge = Date.now() - item.firstFailedAt;
      }
    }

    // Get counter metrics (approximate)
    // In production, would fetch from Prometheus
    const stats: DLQStats = {
      depth,
      oldestItemAge,
      retryRate: 0,  // Would calculate from metrics
      successRate: 0,  // Would calculate from metrics
      permanentFailures: 0  // Would calculate from metrics
    };

    return stats;
  }

  /**
   * Get all items (for admin interface)
   */
  async getAllItems(offset: number = 0, limit: number = 50): Promise<DLQItem[]> {
    const ids = await this.config.redis.zrange(this.queueKey, offset, offset + limit - 1);

    if (ids.length === 0) {
      return [];
    }

    const metadataArray = await this.config.redis.hmget(this.metadataKey, ...ids);

    const items: DLQItem[] = [];
    for (const metadata of metadataArray) {
      if (metadata) {
        items.push(JSON.parse(metadata));
      }
    }

    return items;
  }

  /**
   * Start background worker
   */
  startWorker(processor: (payload: any) => Promise<void>): void {
    if (this.workerRunning) {
      console.log('⚠️ DLQ worker already running');
      return;
    }

    this.workerRunning = true;
    const pollingInterval = this.config.pollingInterval || 10000;  // 10 seconds

    this.workerInterval = setInterval(async () => {
      try {
        const items = await this.getReadyItems(10);

        for (const item of items) {
          await this.retry(item, processor);
        }
      } catch (error: any) {
        console.error(`❌ DLQ worker error: ${error.message}`);
        this.emit('workerError', error);
      }
    }, pollingInterval);

    console.log(`🔄 DLQ worker started (polling every ${pollingInterval}ms)`);
  }

  /**
   * Stop background worker
   */
  stopWorker(): void {
    if (this.workerInterval) {
      clearInterval(this.workerInterval);
      this.workerInterval = null;
    }
    this.workerRunning = false;
    console.log('⏸️ DLQ worker stopped');
  }

  /**
   * Clear the entire DLQ (admin operation)
   */
  async clear(): Promise<void> {
    await this.config.redis.del(this.queueKey);
    await this.config.redis.del(this.metadataKey);

    this.depthGauge.set({ queue: this.config.queueName || 'dlq' }, 0);

    console.log('🗑️ DLQ cleared');
  }
}
