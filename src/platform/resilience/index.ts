/**
 * MARCUS 3.0 Resilience Framework
 *
 * Production-ready resilience patterns for handling failures gracefully,
 * recovering automatically, and maintaining service availability.
 *
 * @module platform/resilience
 */

// Circuit Breaker
export {
  CircuitBreaker,
  CircuitBreakerManager,
  CircuitState as CircuitBreakerState,  // Export with alias for backward compatibility
  circuitBreakerManager,
  type CircuitBreakerConfig,
  type CircuitBreakerMetrics
} from './circuitBreaker';

// Retry Handler
export {
  retryWithBackoff,
  RetryHandler,
  isTransientError,
  isPermanentError,
  withRetry,
  type RetryConfig,
  type RetryMetrics
} from './retryHandler';

// Dead Letter Queue
export {
  DeadLetterQueue,
  type DLQItem,
  type DLQConfig,
  type DLQStats
} from './deadLetterQueue';

// Graceful Shutdown
export {
  GracefulShutdown,
  gracefulShutdown,
  type ShutdownConfig,
  type ShutdownResource
} from './gracefulShutdown';

/**
 * Quick Start Example
 *
 * ```typescript
 * import {
 *   circuitBreakerManager,
 *   retryWithBackoff,
 *   DeadLetterQueue,
 *   gracefulShutdown
 * } from '@/platform/resilience';
 *
 * // Create circuit breaker
 * const dbBreaker = circuitBreakerManager.getBreaker({
 *   name: 'postgresql',
 *   failureThreshold: 5,
 *   timeout: 60000,
 *   successThreshold: 3
 * });
 *
 * // Make resilient request
 * const result = await dbBreaker.execute(async () => {
 *   return await retryWithBackoff(
 *     async () => db.query('SELECT 1'),
 *     { maxRetries: 3, baseDelay: 1000 },
 *     'db-query'
 *   );
 * });
 *
 * // Register for graceful shutdown
 * gracefulShutdown.registerDatabasePool(dbPool);
 * ```
 */
