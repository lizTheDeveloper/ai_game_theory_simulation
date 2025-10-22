/**
 * LLM Request Queue with Semaphore & Rate Limiting
 *
 * Manages concurrent requests and rate limits for LLM API calls.
 * Useful for:
 * - Free tier APIs (Grok, Claude, GPT-4 with token limits)
 * - Rate-limited endpoints (requests per minute/hour/day)
 * - Backpressure management during Monte Carlo simulations
 */

export interface QueueConfig {
  /** Maximum concurrent requests (default: 1 for sequential) */
  maxConcurrent: number;

  /** Maximum requests per minute (0 = no limit) */
  maxRequestsPerMinute: number;

  /** Maximum requests per hour (0 = no limit) */
  maxRequestsPerHour: number;

  /** Maximum requests per day (0 = no limit) */
  maxRequestsPerDay: number;

  /** Retry failed requests (default: true) */
  retryOnFailure: boolean;

  /** Max retries per request (default: 3) */
  maxRetries: number;

  /** Retry delay in ms (default: 1000) */
  retryDelayMs: number;
}

export const DEFAULT_QUEUE_CONFIG: QueueConfig = {
  maxConcurrent: 1, // Sequential by default (safe for all APIs)
  maxRequestsPerMinute: 0, // No limit
  maxRequestsPerHour: 0,
  maxRequestsPerDay: 0,
  retryOnFailure: true,
  maxRetries: 3,
  retryDelayMs: 1000
};

interface QueuedRequest<T> {
  id: string;
  execute: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: any) => void;
  retries: number;
  enqueuedAt: number;
}

interface RateLimitWindow {
  startTime: number;
  count: number;
}

/**
 * Semaphore-based request queue with rate limiting
 */
export class LLMRequestQueue {
  private config: QueueConfig;
  private queue: QueuedRequest<any>[] = [];
  private activeRequests: number = 0;
  private requestId: number = 0;

  // Rate limit tracking
  private minuteWindow: RateLimitWindow = { startTime: Date.now(), count: 0 };
  private hourWindow: RateLimitWindow = { startTime: Date.now(), count: 0 };
  private dayWindow: RateLimitWindow = { startTime: Date.now(), count: 0 };

  // Statistics
  private stats = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    retriedRequests: 0,
    queuedRequests: 0,
    rateLimitHits: 0
  };

  constructor(config: Partial<QueueConfig> = {}) {
    this.config = { ...DEFAULT_QUEUE_CONFIG, ...config };
  }

  /**
   * Enqueue a request (returns promise that resolves when request completes)
   */
  async enqueue<T>(execute: () => Promise<T>): Promise<T> {
    this.stats.totalRequests++;
    this.stats.queuedRequests++;

    return new Promise<T>((resolve, reject) => {
      const request: QueuedRequest<T> = {
        id: `req_${this.requestId++}`,
        execute,
        resolve,
        reject,
        retries: 0,
        enqueuedAt: Date.now()
      };

      this.queue.push(request);
      this.processQueue();
    });
  }

  /**
   * Process queued requests respecting concurrency & rate limits
   */
  private async processQueue(): Promise<void> {
    // Check if we can process more requests
    if (this.activeRequests >= this.config.maxConcurrent) {
      return; // At capacity
    }

    if (this.queue.length === 0) {
      return; // Nothing to process
    }

    // Check rate limits
    if (this.isRateLimited()) {
      this.stats.rateLimitHits++;
      // Schedule retry after rate limit window expires
      const delay = this.getNextAvailableSlot();
      setTimeout(() => this.processQueue(), delay);
      return;
    }

    // Take next request from queue
    const request = this.queue.shift();
    if (!request) return;

    this.stats.queuedRequests--;
    this.activeRequests++;
    this.recordRequest();

    // Execute request
    try {
      const result = await request.execute();
      this.stats.successfulRequests++;
      request.resolve(result);
    } catch (error) {
      // Retry logic
      if (this.config.retryOnFailure && request.retries < this.config.maxRetries) {
        request.retries++;
        this.stats.retriedRequests++;

        // Re-enqueue with delay
        setTimeout(() => {
          this.queue.unshift(request); // Priority for retries
          this.processQueue();
        }, this.config.retryDelayMs * request.retries); // Exponential backoff
      } else {
        this.stats.failedRequests++;
        request.reject(error);
      }
    } finally {
      this.activeRequests--;
      // Process next request
      setImmediate(() => this.processQueue());
    }
  }

  /**
   * Check if any rate limit is currently exceeded
   */
  private isRateLimited(): boolean {
    const now = Date.now();

    // Minute limit
    if (this.config.maxRequestsPerMinute > 0) {
      if (now - this.minuteWindow.startTime >= 60000) {
        // Reset window
        this.minuteWindow = { startTime: now, count: 0 };
      }
      if (this.minuteWindow.count >= this.config.maxRequestsPerMinute) {
        return true;
      }
    }

    // Hour limit
    if (this.config.maxRequestsPerHour > 0) {
      if (now - this.hourWindow.startTime >= 3600000) {
        this.hourWindow = { startTime: now, count: 0 };
      }
      if (this.hourWindow.count >= this.config.maxRequestsPerHour) {
        return true;
      }
    }

    // Day limit
    if (this.config.maxRequestsPerDay > 0) {
      if (now - this.dayWindow.startTime >= 86400000) {
        this.dayWindow = { startTime: now, count: 0 };
      }
      if (this.dayWindow.count >= this.config.maxRequestsPerDay) {
        return true;
      }
    }

    return false;
  }

  /**
   * Record a request against rate limit windows
   */
  private recordRequest(): void {
    const now = Date.now();

    if (this.config.maxRequestsPerMinute > 0) {
      if (now - this.minuteWindow.startTime >= 60000) {
        this.minuteWindow = { startTime: now, count: 0 };
      }
      this.minuteWindow.count++;
    }

    if (this.config.maxRequestsPerHour > 0) {
      if (now - this.hourWindow.startTime >= 3600000) {
        this.hourWindow = { startTime: now, count: 0 };
      }
      this.hourWindow.count++;
    }

    if (this.config.maxRequestsPerDay > 0) {
      if (now - this.dayWindow.startTime >= 86400000) {
        this.dayWindow = { startTime: now, count: 0 };
      }
      this.dayWindow.count++;
    }
  }

  /**
   * Calculate delay until next available request slot
   */
  private getNextAvailableSlot(): number {
    const now = Date.now();
    let minDelay = 1000; // Default 1 second

    if (this.config.maxRequestsPerMinute > 0 && this.minuteWindow.count >= this.config.maxRequestsPerMinute) {
      const windowEnd = this.minuteWindow.startTime + 60000;
      minDelay = Math.max(minDelay, windowEnd - now);
    }

    if (this.config.maxRequestsPerHour > 0 && this.hourWindow.count >= this.config.maxRequestsPerHour) {
      const windowEnd = this.hourWindow.startTime + 3600000;
      minDelay = Math.max(minDelay, windowEnd - now);
    }

    if (this.config.maxRequestsPerDay > 0 && this.dayWindow.count >= this.config.maxRequestsPerDay) {
      const windowEnd = this.dayWindow.startTime + 86400000;
      minDelay = Math.max(minDelay, windowEnd - now);
    }

    return minDelay;
  }

  /**
   * Get queue statistics
   */
  getStats() {
    return {
      ...this.stats,
      activeRequests: this.activeRequests,
      pendingRequests: this.queue.length,
      rateLimitStatus: {
        minute: this.config.maxRequestsPerMinute > 0
          ? `${this.minuteWindow.count}/${this.config.maxRequestsPerMinute}`
          : 'unlimited',
        hour: this.config.maxRequestsPerHour > 0
          ? `${this.hourWindow.count}/${this.config.maxRequestsPerHour}`
          : 'unlimited',
        day: this.config.maxRequestsPerDay > 0
          ? `${this.dayWindow.count}/${this.config.maxRequestsPerDay}`
          : 'unlimited'
      }
    };
  }

  /**
   * Clear the queue (useful for testing or cancelling pending requests)
   */
  clear(): void {
    for (const request of this.queue) {
      request.reject(new Error('Queue cleared'));
    }
    this.queue = [];
    this.stats.queuedRequests = 0;
  }

  /**
   * Wait for all active requests to complete
   */
  async drain(): Promise<void> {
    while (this.activeRequests > 0 || this.queue.length > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}
