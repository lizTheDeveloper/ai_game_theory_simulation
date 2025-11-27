/**
 * Retry Handler with Exponential Backoff
 *
 * Implements retry logic with:
 * - Exponential backoff: delay = baseDelay * (2 ^ attempt)
 * - Jitter: Randomness to prevent thundering herd
 * - Configurable retry conditions
 * - Max retries and max delay limits
 *
 * @module platform/resilience/retryHandler
 */

import { Counter, Histogram } from 'prom-client';

export interface RetryConfig {
  maxRetries?: number;          // Maximum retry attempts (default: 3)
  baseDelay?: number;           // Base delay in ms (default: 1000)
  maxDelay?: number;            // Maximum delay in ms (default: 30000)
  jitter?: boolean;             // Add randomness to delay (default: true)
  retryIf?: (error: any) => boolean;  // Custom retry condition
  onRetry?: (attempt: number, delay: number, error: any) => void;
}

export interface RetryMetrics {
  totalAttempts: number;
  successfulRetries: number;
  failedRetries: number;
  averageAttempts: number;
}

// Default retry condition: retry on transient errors
const DEFAULT_RETRY_CONDITION = (error: any): boolean => {
  // Retry on network errors, timeouts, 5xx errors
  if (error.code === 'ECONNREFUSED' ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ENOTFOUND' ||
      error.code === 'ECONNRESET') {
    return true;
  }

  // Retry on HTTP 5xx errors
  if (error.statusCode >= 500 && error.statusCode < 600) {
    return true;
  }

  // Retry on specific database errors
  if (error.code === '57P03' ||  // PostgreSQL: cannot connect now
      error.code === '53300' ||  // PostgreSQL: too many connections
      error.code === '08006') {  // PostgreSQL: connection failure
    return true;
  }

  // Don't retry on 4xx errors (client errors)
  if (error.statusCode >= 400 && error.statusCode < 500) {
    return false;
  }

  // Default: don't retry
  return false;
};

/**
 * Calculate delay with exponential backoff and optional jitter
 */
function calculateDelay(
  attempt: number,
  baseDelay: number,
  maxDelay: number,
  jitter: boolean
): number {
  // Exponential backoff: delay = baseDelay * (2 ^ attempt)
  let delay = baseDelay * Math.pow(2, attempt);

  // Cap at maxDelay
  delay = Math.min(delay, maxDelay);

  // Add jitter (randomness between 0.5x and 1.5x)
  if (jitter) {
    const jitterFactor = 0.5 + Math.random();
    delay *= jitterFactor;
  }

  return Math.floor(delay);
}

/**
 * Sleep for specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Prometheus metrics
const retryCounter = new Counter({
  name: 'retry_attempts_total',
  help: 'Total retry attempts',
  labelNames: ['operation', 'result']
});

const retryLatency = new Histogram({
  name: 'retry_latency_ms',
  help: 'Retry operation latency including all attempts',
  labelNames: ['operation'],
  buckets: [100, 250, 500, 1000, 2500, 5000, 10000, 30000, 60000]
});

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {},
  operationName: string = 'unknown'
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    jitter = true,
    retryIf = DEFAULT_RETRY_CONDITION,
    onRetry
  } = config;

  const startTime = Date.now();
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();

      // Success
      retryCounter.inc({ operation: operationName, result: 'success' });

      const totalLatency = Date.now() - startTime;
      retryLatency.observe({ operation: operationName }, totalLatency);

      if (attempt > 0) {
        console.log(`✅ Retry succeeded for [${operationName}] after ${attempt} attempts`);
      }

      return result;
    } catch (error) {
      lastError = error;

      // Check if we should retry
      const shouldRetry = retryIf(error);

      if (!shouldRetry || attempt >= maxRetries) {
        // Don't retry or exhausted attempts
        retryCounter.inc({ operation: operationName, result: 'exhausted' });

        const totalLatency = Date.now() - startTime;
        retryLatency.observe({ operation: operationName }, totalLatency);

        throw error;
      }

      // Calculate delay
      const delay = calculateDelay(attempt, baseDelay, maxDelay, jitter);

      retryCounter.inc({ operation: operationName, result: 'retry' });

      console.log(
        `⚠️ Retry attempt ${attempt + 1}/${maxRetries} for [${operationName}] ` +
        `after ${delay}ms (error: ${error.message})`
      );

      if (onRetry) {
        onRetry(attempt + 1, delay, error);
      }

      // Wait before retrying
      await sleep(delay);
    }
  }

  // Should never reach here, but TypeScript needs it
  throw lastError;
}

/**
 * Retry handler class for tracking metrics
 */
export class RetryHandler {
  private totalAttempts: number = 0;
  private successfulRetries: number = 0;
  private failedRetries: number = 0;

  constructor(private name: string) {}

  /**
   * Execute with retry logic
   */
  async execute<T>(fn: () => Promise<T>, config?: RetryConfig): Promise<T> {
    this.totalAttempts++;

    try {
      const result = await retryWithBackoff(fn, {
        ...config,
        onRetry: (attempt, delay, error) => {
          // Track retry metrics
          if (config?.onRetry) {
            config.onRetry(attempt, delay, error);
          }
        }
      }, this.name);

      this.successfulRetries++;
      return result;
    } catch (error) {
      this.failedRetries++;
      throw error;
    }
  }

  /**
   * Get metrics
   */
  getMetrics(): RetryMetrics {
    return {
      totalAttempts: this.totalAttempts,
      successfulRetries: this.successfulRetries,
      failedRetries: this.failedRetries,
      averageAttempts: this.totalAttempts > 0
        ? this.successfulRetries / this.totalAttempts
        : 0
    };
  }

  /**
   * Reset metrics
   */
  reset(): void {
    this.totalAttempts = 0;
    this.successfulRetries = 0;
    this.failedRetries = 0;
  }
}

/**
 * Check if error is transient (can be retried)
 */
export function isTransientError(error: any): boolean {
  return DEFAULT_RETRY_CONDITION(error);
}

/**
 * Check if error is permanent (should not be retried)
 */
export function isPermanentError(error: any): boolean {
  return !isTransientError(error);
}

/**
 * Wrap a function with automatic retry logic
 */
export function withRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  config: RetryConfig = {}
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return retryWithBackoff(() => fn(...args), config, fn.name || 'wrapped');
  };
}
