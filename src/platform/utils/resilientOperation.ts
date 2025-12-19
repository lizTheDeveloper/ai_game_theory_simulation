/**
 * MARCUS 3.1 - Resilient Operation Wrapper (M1)
 *
 * Combines circuit breaker, retry handler, and error classifier for
 * comprehensive error recovery.
 *
 * Features:
 * - Automatic error classification (transient vs permanent)
 * - Circuit breaker protection (prevent cascading failures)
 * - Exponential backoff retry (intelligent retry strategy)
 * - Fallback support (graceful degradation)
 * - Metrics integration (Prometheus tracking)
 *
 * Usage:
 * ```typescript
 * const resilient = new ResilientOperation({
 *   name: 'database_query',
 *   component: 'agent_state_manager'
 * });
 *
 * const result = await resilient.execute(
 *   async () => db.query('SELECT * FROM agents'),
 *   async () => ({ cached: true, data: [] })  // Fallback
 * );
 * ```
 *
 * Author: Marcus (Platform Engineer)
 * Date: 2025-11-22
 */

import { CircuitBreaker, CircuitBreakerConfig, CircuitBreakerOpenError } from '../resilience/circuitBreaker';
import { retryWithBackoff, RetryConfig } from '../resilience/retryHandler';
import { ErrorClassifier, ErrorCategory } from './errorClassifier';

// ============================================================================
// Configuration
// ============================================================================

export interface ResilientOperationConfig {
  /** Operation name for logging and metrics */
  name: string;

  /** Component name (e.g., 'agent_wrapper', 'database', 'redis') */
  component: string;

  /** Circuit breaker configuration (optional - defaults provided) */
  circuitBreaker?: Partial<CircuitBreakerConfig>;

  /** Retry configuration (optional - defaults provided) */
  retry?: Partial<RetryConfig>;

  /** Whether to use fallback on failure (default: true) */
  enableFallback?: boolean;

  /** Whether to classify errors automatically (default: true) */
  enableErrorClassification?: boolean;
}

// ============================================================================
// Resilient Operation Wrapper
// ============================================================================

export class ResilientOperation {
  private circuitBreaker: CircuitBreaker;
  private config: ResilientOperationConfig;
  private retryConfig: RetryConfig;

  constructor(config: ResilientOperationConfig) {
    this.config = {
      enableFallback: true,
      enableErrorClassification: true,
      ...config
    };

    // Initialize circuit breaker with defaults
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,          // Open after 5 failures in 60s
      successThreshold: 2,           // Close after 2 successes in half-open
      timeout: 30000,                // 30s request timeout
      resetTimeout: 30000,           // Try half-open after 30s
      name: config.name,
      ...config.circuitBreaker
    });

    // Initialize retry config with defaults
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 100,                // Start with 100ms
      maxDelay: 30000,               // Cap at 30s
      jitter: true,
      retryIf: this.shouldRetry.bind(this),
      onRetry: this.onRetry.bind(this),
      ...config.retry
    };

    console.log(`✅ ResilientOperation initialized: ${config.name}`);
  }

  /**
   * Execute operation with comprehensive error recovery.
   *
   * Flow:
   * 1. Check circuit breaker state (fail fast if open)
   * 2. Classify error on failure
   * 3. Retry if transient error
   * 4. Use fallback if available
   * 5. Update circuit breaker state
   *
   * @param operation Operation to execute
   * @param fallback Optional fallback function
   * @returns Operation result or fallback result
   */
  async execute<T>(
    operation: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
    try {
      // Execute with circuit breaker protection
      const result = await this.circuitBreaker.execute(async () => {
        // Execute with retry handler
        return await retryWithBackoff(
          operation,
          this.retryConfig
        );
      });

      return result;

    } catch (error: any) {
      // Classify error
      const classification = this.config.enableErrorClassification
        ? ErrorClassifier.classify(error, this.config.component)
        : null;

      console.error(`❌ ${this.config.name} failed:`, {
        error: error.message,
        classification: classification ? {
          category: classification.category,
          severity: classification.severity,
          suggestedAction: classification.suggestedAction
        } : 'not classified'
      });

      // Try fallback if enabled and available
      if (this.config.enableFallback && fallback) {
        if (classification?.category === ErrorCategory.FALLBACK ||
            error instanceof CircuitBreakerOpenError) {
          console.warn(`⚠️ Using fallback for ${this.config.name}`);
          return await fallback();
        }
      }

      // Re-throw if no fallback
      throw error;
    }
  }

  /**
   * Determine if error should be retried (uses error classifier).
   */
  private shouldRetry(error: any): boolean {
    if (!this.config.enableErrorClassification) {
      // Default retry logic (from retryHandler)
      return ErrorClassifier.isRetryable(error);
    }

    const classification = ErrorClassifier.classify(error, this.config.component);

    // Only retry transient errors
    if (classification.category === ErrorCategory.TRANSIENT) {
      console.warn(`⚠️ Transient error detected for ${this.config.name}: ${classification.errorType}`);
      return true;
    }

    // Don't retry permanent errors
    if (classification.category === ErrorCategory.PERMANENT) {
      console.error(`❌ Permanent error for ${this.config.name}: ${classification.errorType}`);
      return false;
    }

    // Circuit breaker errors should fail fast
    if (classification.category === ErrorCategory.CIRCUIT_BREAKER) {
      console.error(`🚨 Circuit breaker triggered for ${this.config.name}: ${classification.errorType}`);
      return false;
    }

    // Fallback errors should not retry (use fallback instead)
    if (classification.category === ErrorCategory.FALLBACK) {
      console.warn(`⚠️ Fallback recommended for ${this.config.name}: ${classification.errorType}`);
      return false;
    }

    return false;
  }

  /**
   * Called on each retry attempt (logging).
   */
  private onRetry(attempt: number, delay: number, error: any): void {
    const classification = ErrorClassifier.classify(error, this.config.component);
    console.warn(`🔄 Retry ${attempt} for ${this.config.name} after ${delay}ms: ${classification.errorType}`);
  }

  /**
   * Get circuit breaker metrics.
   */
  getMetrics() {
    return this.circuitBreaker.getMetrics();
  }

  /**
   * Reset circuit breaker (for testing or manual intervention).
   */
  reset(): void {
    this.circuitBreaker.reset();
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create resilient database operation.
 */
export function resilientDatabaseOperation(name: string): ResilientOperation {
  return new ResilientOperation({
    name: `database_${name}`,
    component: 'database',
    circuitBreaker: {
      failureThreshold: 5,
      resetTimeout: 30000,
      timeout: 10000  // 10s timeout for database queries
    },
    retry: {
      maxRetries: 3,
      baseDelay: 100,
      maxDelay: 5000
    }
  });
}

/**
 * Create resilient Redis operation.
 */
export function resilientRedisOperation(name: string): ResilientOperation {
  return new ResilientOperation({
    name: `redis_${name}`,
    component: 'redis',
    circuitBreaker: {
      failureThreshold: 10,  // Redis failures more tolerable
      resetTimeout: 10000,   // Faster recovery
      timeout: 5000          // 5s timeout for cache operations
    },
    retry: {
      maxRetries: 2,
      baseDelay: 50,
      maxDelay: 1000
    }
  });
}

/**
 * Create resilient agent operation.
 */
export function resilientAgentOperation(agentId: string): ResilientOperation {
  return new ResilientOperation({
    name: `agent_${agentId}`,
    component: 'agent_wrapper',
    circuitBreaker: {
      failureThreshold: 3,   // Agents fail independently
      resetTimeout: 60000,   // Give agents time to recover
      timeout: 30000         // 30s timeout for agent operations
    },
    retry: {
      maxRetries: 3,
      baseDelay: 200,
      maxDelay: 10000
    }
  });
}

/**
 * Create resilient HTTP operation.
 */
export function resilientHttpOperation(endpoint: string): ResilientOperation {
  return new ResilientOperation({
    name: `http_${endpoint}`,
    component: 'http_client',
    circuitBreaker: {
      failureThreshold: 5,
      resetTimeout: 30000,
      timeout: 15000
    },
    retry: {
      maxRetries: 3,
      baseDelay: 100,
      maxDelay: 5000
    }
  });
}

// ============================================================================
// Example Usage
// ============================================================================

/*
// Database query with automatic retry + circuit breaker
const dbOperation = resilientDatabaseOperation('get_agent_state');

const agentState = await dbOperation.execute(
  async () => db.query('SELECT * FROM agent_states WHERE agent_id = $1', [agentId]),
  async () => ({ cached: true, state: null })  // Fallback to null
);

// Redis operation with fallback
const redisOperation = resilientRedisOperation('get_cache');

const cachedValue = await redisOperation.execute(
  async () => redis.get(cacheKey),
  async () => null  // Fallback to null (cache miss)
);

// Agent operation (no fallback - fail loudly)
const agentOperation = resilientAgentOperation('agent_001');

const result = await agentOperation.execute(
  async () => agent.analyzeCitation(document)
  // No fallback - we want to know if agent fails
);
*/
