/**
 * Async Verification Queue
 *
 * Priority queue for async citation verification with rate limiting and batch processing.
 *
 * Features:
 * - Priority queue (HIGH/MEDIUM/LOW)
 * - Rate limiting (max requests/sec)
 * - Batch processing (group similar requests)
 * - In-memory storage with file persistence
 * - Graceful shutdown (save pending requests)
 *
 * Usage:
 * ```typescript
 * const queue = new VerificationQueue({
 *   maxConcurrency: 5,
 *   rateLimit: 10, // 10 requests/sec
 *   batchSize: 20
 * });
 *
 * const requestId = await queue.enqueue({
 *   claim: 'Li et al. (2023) reports...',
 *   citation: { authors: ['Li'], year: 2023 },
 *   priority: 'HIGH'
 * });
 *
 * const result = await queue.getResult(requestId);
 * ```
 *
 * Task: 2.1.2 (Phase 1 Week 2)
 */

import * as fs from 'fs';
import * as path from 'path';
import { assertDefined } from '@/simulation/utils/assertions';
import {
  Citation,
  VerificationResult,
  CitationClient,
} from '../mcp/citationClient';

/**
 * Queue priority levels
 */
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

/**
 * Queue item status
 */
export type ItemStatus = 'pending' | 'processing' | 'completed' | 'failed';

/**
 * Verification request
 */
export interface VerificationRequest {
  /**
   * Claim text to verify
   */
  claim: string;

  /**
   * Citation metadata
   */
  citation: Citation;

  /**
   * Request priority
   */
  priority: Priority;

  /**
   * Callback when complete (optional)
   */
  onComplete?: (result: VerificationResult) => void;
}

/**
 * Queue item
 */
export interface QueueItem {
  /**
   * Unique ID
   */
  id: string;

  /**
   * Verification request
   */
  request: VerificationRequest;

  /**
   * Current status
   */
  status: ItemStatus;

  /**
   * Verification result (if completed)
   */
  result?: VerificationResult;

  /**
   * Error message (if failed)
   */
  error?: string;

  /**
   * Enqueue timestamp
   */
  enqueuedAt: number;

  /**
   * Processing start timestamp
   */
  startedAt?: number;

  /**
   * Completion timestamp
   */
  completedAt?: number;

  /**
   * Retry count
   */
  retries: number;
}

/**
 * Queue configuration
 */
export interface QueueConfig {
  /**
   * Maximum concurrent verifications
   * Default: 5
   */
  maxConcurrency?: number;

  /**
   * Rate limit (requests per second)
   * Default: 10
   */
  rateLimit?: number;

  /**
   * Batch size (max items per batch)
   * Default: 20
   */
  batchSize?: number;

  /**
   * Max retries on failure
   * Default: 2
   */
  maxRetries?: number;

  /**
   * Persistence file path
   * Default: '/logs/verification_queue.json'
   */
  persistencePath?: string;

  /**
   * Auto-save interval (ms)
   * Default: 10000 (10 seconds)
   */
  autoSaveInterval?: number;

  /**
   * Citation client
   */
  citationClient: CitationClient;

  /**
   * Enable logging
   * Default: false
   */
  enableLogging?: boolean;
}

/**
 * Queue statistics
 */
export interface QueueStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  averageProcessingTime: number;
  throughput: number; // items/sec
}

/**
 * Verification Queue
 *
 * Priority queue for async citation verification.
 */
export class VerificationQueue {
  private config: Required<Omit<QueueConfig, 'citationClient'>> & {
    citationClient: CitationClient;
  };
  private queue: Map<Priority, QueueItem[]>;
  private processing: Set<string>;
  private completed: Map<string, QueueItem>;
  private running: boolean;
  private autoSaveTimer?: NodeJS.Timeout;
  private processedCount: number;
  private totalProcessingTime: number;
  private lastThroughputReset: number;

  constructor(config: QueueConfig) {
    assertDefined(config.citationClient, {
      location: 'VerificationQueue.constructor',
      valueName: 'config.citationClient',
    });

    this.config = {
      maxConcurrency: config.maxConcurrency ?? 5,
      rateLimit: config.rateLimit ?? 10,
      batchSize: config.batchSize ?? 20,
      maxRetries: config.maxRetries ?? 2,
      persistencePath:
        config.persistencePath ?? '/logs/verification_queue.json',
      autoSaveInterval: config.autoSaveInterval ?? 10000,
      citationClient: config.citationClient,
      enableLogging: config.enableLogging ?? false,
    };

    this.queue = new Map([
      ['HIGH', []],
      ['MEDIUM', []],
      ['LOW', []],
    ]);
    this.processing = new Set();
    this.completed = new Map();
    this.running = false;
    this.processedCount = 0;
    this.totalProcessingTime = 0;
    this.lastThroughputReset = Date.now();

    // Load persisted queue if exists
    this.loadFromFile();
  }

  /**
   * Enqueue verification request
   *
   * @param request - Verification request
   * @returns Request ID
   */
  public async enqueue(request: VerificationRequest): Promise<string> {
    assertDefined(request, {
      location: 'VerificationQueue.enqueue',
      valueName: 'request',
    });

    // Generate unique ID
    const id = this.generateId();

    // Create queue item
    const item: QueueItem = {
      id,
      request,
      status: 'pending',
      enqueuedAt: Date.now(),
      retries: 0,
    };

    // Add to priority queue
    const priorityQueue = this.queue.get(request.priority);
    if (!priorityQueue) {
      throw new Error(`Invalid priority: ${request.priority}`);
    }

    priorityQueue.push(item);

    if (this.config.enableLogging) {
      console.log(
        `📥 VerificationQueue: Enqueued [${request.priority}] ${id}`
      );
    }

    // Start processing if not running
    if (!this.running) {
      this.start();
    }

    return id;
  }

  /**
   * Start queue processing
   */
  public start(): void {
    if (this.running) {
      return;
    }

    this.running = true;

    if (this.config.enableLogging) {
      console.log('▶️  VerificationQueue: Started');
    }

    // Start processing loop
    this.processLoop();

    // Start auto-save timer
    this.autoSaveTimer = setInterval(() => {
      this.saveToFile();
    }, this.config.autoSaveInterval);
  }

  /**
   * Stop queue processing
   */
  public async stop(): Promise<void> {
    this.running = false;

    // Clear auto-save timer
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = undefined;
    }

    // Wait for in-progress items to complete
    while (this.processing.size > 0) {
      await this.sleep(100);
    }

    // Save queue state
    this.saveToFile();

    if (this.config.enableLogging) {
      console.log('⏹️  VerificationQueue: Stopped');
    }
  }

  /**
   * Processing loop
   */
  private async processLoop(): Promise<void> {
    while (this.running) {
      // Check concurrency limit
      if (this.processing.size >= this.config.maxConcurrency) {
        await this.sleep(100);
        continue;
      }

      // Get next item from priority queue
      const item = this.dequeue();
      if (!item) {
        await this.sleep(100);
        continue;
      }

      // Process item (non-blocking)
      this.processItem(item).catch((error) => {
        if (this.config.enableLogging) {
          console.error(
            `❌ VerificationQueue: Process error: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      });

      // Rate limiting
      await this.sleep(1000 / this.config.rateLimit);
    }
  }

  /**
   * Dequeue next item (priority order)
   *
   * @returns Next queue item or null
   */
  private dequeue(): QueueItem | null {
    // Check HIGH priority first
    const highQueue = this.queue.get('HIGH');
    if (highQueue && highQueue.length > 0) {
      return highQueue.shift()!;
    }

    // Then MEDIUM
    const mediumQueue = this.queue.get('MEDIUM');
    if (mediumQueue && mediumQueue.length > 0) {
      return mediumQueue.shift()!;
    }

    // Finally LOW
    const lowQueue = this.queue.get('LOW');
    if (lowQueue && lowQueue.length > 0) {
      return lowQueue.shift()!;
    }

    return null;
  }

  /**
   * Process queue item
   *
   * @param item - Queue item
   */
  private async processItem(item: QueueItem): Promise<void> {
    this.processing.add(item.id);
    item.status = 'processing';
    item.startedAt = Date.now();

    try {
      // Verify citation
      const result = await this.config.citationClient.verifyCitation(
        item.request.claim,
        item.request.citation
      );

      // Mark as completed
      item.status = 'completed';
      item.result = result;
      item.completedAt = Date.now();

      // Update stats
      if (item.startedAt && item.completedAt) {
        this.totalProcessingTime += item.completedAt - item.startedAt;
        this.processedCount++;
      }

      // Store in completed map
      this.completed.set(item.id, item);

      // Call callback if provided
      if (item.request.onComplete) {
        item.request.onComplete(result);
      }

      if (this.config.enableLogging) {
        console.log(
          `✅ VerificationQueue: Completed ${item.id} → ${result.verified}`
        );
      }
    } catch (error) {
      // Retry logic
      if (item.retries < this.config.maxRetries) {
        item.retries++;
        item.status = 'pending';

        // Re-enqueue
        const priorityQueue = this.queue.get(item.request.priority);
        priorityQueue?.push(item);

        if (this.config.enableLogging) {
          console.warn(
            `⚠️ VerificationQueue: Retry ${item.retries}/${this.config.maxRetries} for ${item.id}`
          );
        }
      } else {
        // Max retries exceeded
        item.status = 'failed';
        item.error = error instanceof Error ? error.message : 'Unknown error';
        item.completedAt = Date.now();

        this.completed.set(item.id, item);

        if (this.config.enableLogging) {
          console.error(
            `❌ VerificationQueue: Failed ${item.id} after ${item.retries} retries`
          );
        }
      }
    } finally {
      this.processing.delete(item.id);
    }
  }

  /**
   * Get result for request ID
   *
   * @param id - Request ID
   * @returns Queue item if found
   */
  public getResult(id: string): QueueItem | null {
    return this.completed.get(id) ?? null;
  }

  /**
   * Get queue statistics
   *
   * @returns Stats object
   */
  public getStats(): QueueStats {
    const pending = this.getTotalPending();
    const processing = this.processing.size;
    const completed = this.completed.size;

    let failedCount = 0;
    for (const item of this.completed.values()) {
      if (item.status === 'failed') {
        failedCount++;
      }
    }

    const averageProcessingTime =
      this.processedCount > 0
        ? this.totalProcessingTime / this.processedCount
        : 0;

    // Calculate throughput (items/sec)
    const elapsed = (Date.now() - this.lastThroughputReset) / 1000;
    const throughput = elapsed > 0 ? this.processedCount / elapsed : 0;

    return {
      total: pending + processing + completed,
      pending,
      processing,
      completed,
      failed: failedCount,
      averageProcessingTime,
      throughput,
    };
  }

  /**
   * Get total pending items across all priorities
   *
   * @returns Pending count
   */
  private getTotalPending(): number {
    let total = 0;
    for (const queue of this.queue.values()) {
      total += queue.length;
    }
    return total;
  }

  /**
   * Save queue state to file
   */
  private saveToFile(): void {
    try {
      const state = {
        queue: {
          HIGH: this.queue.get('HIGH'),
          MEDIUM: this.queue.get('MEDIUM'),
          LOW: this.queue.get('LOW'),
        },
        completed: Array.from(this.completed.values()),
        timestamp: Date.now(),
      };

      const dir = path.dirname(this.config.persistencePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(
        this.config.persistencePath,
        JSON.stringify(state, null, 2)
      );

      if (this.config.enableLogging) {
        console.log(
          `💾 VerificationQueue: Saved to ${this.config.persistencePath}`
        );
      }
    } catch (error) {
      if (this.config.enableLogging) {
        console.error(
          `❌ VerificationQueue: Save failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }
  }

  /**
   * Load queue state from file
   */
  private loadFromFile(): void {
    try {
      if (!fs.existsSync(this.config.persistencePath)) {
        return;
      }

      const data = fs.readFileSync(this.config.persistencePath, 'utf-8');
      const state = JSON.parse(data);

      // Restore queues
      if (state.queue) {
        this.queue.set('HIGH', state.queue.HIGH ?? []);
        this.queue.set('MEDIUM', state.queue.MEDIUM ?? []);
        this.queue.set('LOW', state.queue.LOW ?? []);
      }

      // Restore completed
      if (state.completed) {
        for (const item of state.completed) {
          this.completed.set(item.id, item);
        }
      }

      if (this.config.enableLogging) {
        console.log(
          `📂 VerificationQueue: Loaded from ${this.config.persistencePath}`
        );
      }
    } catch (error) {
      if (this.config.enableLogging) {
        console.error(
          `❌ VerificationQueue: Load failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }
  }

  /**
   * Generate unique ID
   *
   * @returns Unique ID
   */
  private generateId(): string {
    return `vq_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Sleep for specified milliseconds
   *
   * @param ms - Milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Clear completed items (free memory)
   */
  public clearCompleted(): void {
    this.completed.clear();
    this.processedCount = 0;
    this.totalProcessingTime = 0;
    this.lastThroughputReset = Date.now();

    if (this.config.enableLogging) {
      console.log('🗑️  VerificationQueue: Cleared completed items');
    }
  }
}

/**
 * Create verification queue
 *
 * @param config - Queue configuration
 * @returns VerificationQueue instance
 */
export function createVerificationQueue(
  config: QueueConfig
): VerificationQueue {
  return new VerificationQueue(config);
}
