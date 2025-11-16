/**
 * Auto-Save Error Handler
 *
 * Handles failures in auto-save operations with retry logic and fallback mechanisms.
 *
 * Features:
 * - Exponential backoff retry (3 attempts)
 * - Fallback to file storage if MCP unavailable
 * - Error categorization (transient vs. permanent)
 * - Circuit breaker pattern (stop retrying if MCP down)
 *
 * Usage:
 * ```typescript
 * const handler = new AutoSaveErrorHandler({
 *   fallbackDir: '/logs/failed_saves',
 *   maxRetries: 3
 * });
 *
 * try {
 *   await mcpClient.addTask(agent_id, task);
 * } catch (error) {
 *   await handler.handleError(error, { agent_id, task });
 * }
 * ```
 *
 * Task: 1.4.4 (Phase 1 Week 2)
 */

import * as fs from 'fs';
import * as path from 'path';
import { assertDefined } from '@/simulation/utils/assertions';

/**
 * Error category
 */
export type ErrorCategory =
  | 'transient' // Temporary error, retry possible
  | 'permanent' // Permanent error, don't retry
  | 'rate_limit' // Rate limit exceeded
  | 'network' // Network error
  | 'unknown'; // Unknown error

/**
 * Save operation
 */
export interface SaveOperation {
  agent_id: string;
  type: 'task' | 'learning' | 'conversation';
  content: string;
  timestamp: number;
}

/**
 * Error handler configuration
 */
export interface ErrorHandlerConfig {
  /**
   * Maximum retry attempts
   * Default: 3
   */
  maxRetries?: number;

  /**
   * Initial retry delay (ms)
   * Default: 1000 (1 second)
   */
  initialRetryDelay?: number;

  /**
   * Retry backoff multiplier
   * Default: 2 (exponential backoff)
   */
  backoffMultiplier?: number;

  /**
   * Fallback directory for file storage
   * Default: '/logs/failed_saves'
   */
  fallbackDir?: string;

  /**
   * Circuit breaker threshold (failures before circuit opens)
   * Default: 5
   */
  circuitBreakerThreshold?: number;

  /**
   * Circuit breaker reset timeout (ms)
   * Default: 60000 (1 minute)
   */
  circuitBreakerResetTimeout?: number;

  /**
   * Enable logging
   * Default: false
   */
  enableLogging?: boolean;
}

/**
 * Error handling result
 */
export interface ErrorHandlingResult {
  /**
   * Success flag
   */
  success: boolean;

  /**
   * Number of retry attempts
   */
  attempts: number;

  /**
   * Error category
   */
  category: ErrorCategory;

  /**
   * Fallback used?
   */
  usedFallback: boolean;

  /**
   * Fallback file path (if fallback used)
   */
  fallbackPath?: string;

  /**
   * Final error (if failed)
   */
  error?: Error;
}

/**
 * Error statistics
 */
export interface ErrorStats {
  totalErrors: number;
  byCategory: Record<ErrorCategory, number>;
  totalRetries: number;
  fallbacksUsed: number;
  circuitBreakerTrips: number;
}

/**
 * Circuit breaker states
 */
type CircuitState = 'closed' | 'open' | 'half_open';

/**
 * Auto-Save Error Handler
 *
 * Handles auto-save failures with retry and fallback logic.
 */
export class AutoSaveErrorHandler {
  private config: Required<ErrorHandlerConfig>;
  private stats: ErrorStats;
  private circuitState: CircuitState;
  private circuitFailureCount: number;
  private circuitResetTimer?: NodeJS.Timeout;

  constructor(config?: ErrorHandlerConfig) {
    this.config = {
      maxRetries: config?.maxRetries ?? 3,
      initialRetryDelay: config?.initialRetryDelay ?? 1000,
      backoffMultiplier: config?.backoffMultiplier ?? 2,
      fallbackDir: config?.fallbackDir ?? '/logs/failed_saves',
      circuitBreakerThreshold: config?.circuitBreakerThreshold ?? 5,
      circuitBreakerResetTimeout:
        config?.circuitBreakerResetTimeout ?? 60000,
      enableLogging: config?.enableLogging ?? false,
    };

    this.stats = {
      totalErrors: 0,
      byCategory: {
        transient: 0,
        permanent: 0,
        rate_limit: 0,
        network: 0,
        unknown: 0,
      },
      totalRetries: 0,
      fallbacksUsed: 0,
      circuitBreakerTrips: 0,
    };

    this.circuitState = 'closed';
    this.circuitFailureCount = 0;

    // Ensure fallback directory exists
    this.ensureFallbackDir();
  }

  /**
   * Handle save operation error with retry and fallback
   *
   * @param error - Error that occurred
   * @param operation - Save operation that failed
   * @param retryFn - Retry function (optional)
   * @returns Error handling result
   */
  public async handleError(
    error: Error,
    operation: SaveOperation,
    retryFn?: () => Promise<void>
  ): Promise<ErrorHandlingResult> {
    this.stats.totalErrors++;

    // Categorize error
    const category = this.categorizeError(error);
    this.stats.byCategory[category]++;

    if (this.config.enableLogging) {
      console.error(
        `❌ AutoSaveErrorHandler: [${category}] ${error.message}`
      );
    }

    // Check circuit breaker
    if (this.circuitState === 'open') {
      if (this.config.enableLogging) {
        console.warn(
          '🚨 AutoSaveErrorHandler: Circuit breaker OPEN, using fallback'
        );
      }

      const fallbackPath = await this.fallbackToFile(operation);
      return {
        success: false,
        attempts: 0,
        category,
        usedFallback: true,
        fallbackPath,
        error,
      };
    }

    // Determine if we should retry
    const shouldRetry =
      retryFn &&
      (category === 'transient' ||
        category === 'network' ||
        category === 'rate_limit');

    if (shouldRetry) {
      const retryResult = await this.retryWithBackoff(
        retryFn,
        this.config.maxRetries
      );

      if (retryResult.success) {
        // Reset circuit breaker on success
        this.resetCircuitBreaker();

        return {
          success: true,
          attempts: retryResult.attempts,
          category,
          usedFallback: false,
        };
      }

      // Retries failed
      this.stats.totalRetries += retryResult.attempts;
      this.recordCircuitFailure();

      // Fall back to file
      const fallbackPath = await this.fallbackToFile(operation);
      return {
        success: false,
        attempts: retryResult.attempts,
        category,
        usedFallback: true,
        fallbackPath,
        error: retryResult.error,
      };
    }

    // No retry for permanent errors
    this.recordCircuitFailure();

    const fallbackPath = await this.fallbackToFile(operation);
    return {
      success: false,
      attempts: 0,
      category,
      usedFallback: true,
      fallbackPath,
      error,
    };
  }

  /**
   * Categorize error type
   *
   * @param error - Error to categorize
   * @returns Error category
   */
  private categorizeError(error: Error): ErrorCategory {
    const message = error.message.toLowerCase();

    // Network errors
    if (
      message.includes('econnrefused') ||
      message.includes('enotfound') ||
      message.includes('timeout') ||
      message.includes('network')
    ) {
      return 'network';
    }

    // Rate limiting
    if (
      message.includes('rate limit') ||
      message.includes('too many requests') ||
      message.includes('429')
    ) {
      return 'rate_limit';
    }

    // Transient errors
    if (
      message.includes('temporarily unavailable') ||
      message.includes('503') ||
      message.includes('502')
    ) {
      return 'transient';
    }

    // Permanent errors
    if (
      message.includes('not found') ||
      message.includes('404') ||
      message.includes('unauthorized') ||
      message.includes('forbidden') ||
      message.includes('invalid')
    ) {
      return 'permanent';
    }

    return 'unknown';
  }

  /**
   * Retry operation with exponential backoff
   *
   * @param fn - Function to retry
   * @param maxAttempts - Maximum retry attempts
   * @returns Retry result
   */
  private async retryWithBackoff(
    fn: () => Promise<void>,
    maxAttempts: number
  ): Promise<{ success: boolean; attempts: number; error?: Error }> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await fn();
        return { success: true, attempts: attempt };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (this.config.enableLogging) {
          console.warn(
            `⚠️ AutoSaveErrorHandler: Retry ${attempt}/${maxAttempts} failed: ${lastError.message}`
          );
        }

        // Don't sleep after last attempt
        if (attempt < maxAttempts) {
          const delay =
            this.config.initialRetryDelay *
            Math.pow(this.config.backoffMultiplier, attempt - 1);
          await this.sleep(delay);
        }
      }
    }

    return {
      success: false,
      attempts: maxAttempts,
      error: lastError,
    };
  }

  /**
   * Fallback to file storage
   *
   * @param operation - Save operation
   * @returns Fallback file path
   */
  private async fallbackToFile(operation: SaveOperation): Promise<string> {
    this.stats.fallbacksUsed++;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${operation.agent_id}_${operation.type}_${timestamp}.json`;
    const filepath = path.join(this.config.fallbackDir, filename);

    const data = JSON.stringify(operation, null, 2);

    try {
      await fs.promises.writeFile(filepath, data, 'utf-8');

      if (this.config.enableLogging) {
        console.log(
          `💾 AutoSaveErrorHandler: Saved to fallback file: ${filepath}`
        );
      }

      return filepath;
    } catch (error) {
      if (this.config.enableLogging) {
        console.error(
          `❌ AutoSaveErrorHandler: Fallback file write failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
      throw error;
    }
  }

  /**
   * Record circuit breaker failure
   */
  private recordCircuitFailure(): void {
    this.circuitFailureCount++;

    if (
      this.circuitFailureCount >= this.config.circuitBreakerThreshold &&
      this.circuitState === 'closed'
    ) {
      this.tripCircuitBreaker();
    }
  }

  /**
   * Trip circuit breaker (open circuit)
   */
  private tripCircuitBreaker(): void {
    this.circuitState = 'open';
    this.stats.circuitBreakerTrips++;

    if (this.config.enableLogging) {
      console.warn(
        `🚨 AutoSaveErrorHandler: Circuit breaker OPENED after ${this.circuitFailureCount} failures`
      );
    }

    // Schedule reset
    this.circuitResetTimer = setTimeout(() => {
      this.circuitState = 'half_open';
      this.circuitFailureCount = 0;

      if (this.config.enableLogging) {
        console.log(
          '🔄 AutoSaveErrorHandler: Circuit breaker HALF-OPEN (testing)'
        );
      }
    }, this.config.circuitBreakerResetTimeout);
  }

  /**
   * Reset circuit breaker (close circuit)
   */
  private resetCircuitBreaker(): void {
    if (this.circuitState !== 'closed') {
      this.circuitState = 'closed';
      this.circuitFailureCount = 0;

      if (this.circuitResetTimer) {
        clearTimeout(this.circuitResetTimer);
        this.circuitResetTimer = undefined;
      }

      if (this.config.enableLogging) {
        console.log('✅ AutoSaveErrorHandler: Circuit breaker CLOSED (healthy)');
      }
    }
  }

  /**
   * Ensure fallback directory exists
   */
  private ensureFallbackDir(): void {
    try {
      if (!fs.existsSync(this.config.fallbackDir)) {
        fs.mkdirSync(this.config.fallbackDir, { recursive: true });
      }
    } catch (error) {
      if (this.config.enableLogging) {
        console.error(
          `❌ AutoSaveErrorHandler: Failed to create fallback directory: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }
  }

  /**
   * Sleep for specified milliseconds
   *
   * @param ms - Milliseconds to sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get error statistics
   *
   * @returns Stats object
   */
  public getStats(): Readonly<ErrorStats> {
    return Object.freeze({ ...this.stats });
  }

  /**
   * Get circuit breaker state
   *
   * @returns Circuit state
   */
  public getCircuitState(): CircuitState {
    return this.circuitState;
  }

  /**
   * Reset statistics
   */
  public resetStats(): void {
    this.stats = {
      totalErrors: 0,
      byCategory: {
        transient: 0,
        permanent: 0,
        rate_limit: 0,
        network: 0,
        unknown: 0,
      },
      totalRetries: 0,
      fallbacksUsed: 0,
      circuitBreakerTrips: 0,
    };
  }

  /**
   * Manually reset circuit breaker
   */
  public manualReset(): void {
    this.resetCircuitBreaker();
  }
}

/**
 * Create error handler
 *
 * @param config - Configuration
 * @returns AutoSaveErrorHandler instance
 */
export function createErrorHandler(
  config?: ErrorHandlerConfig
): AutoSaveErrorHandler {
  return new AutoSaveErrorHandler(config);
}
