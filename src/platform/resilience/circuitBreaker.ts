/**
 * Circuit Breaker Pattern Implementation
 *
 * Prevents cascading failures by breaking circuits to failing services.
 * Implements the three states: CLOSED, OPEN, HALF_OPEN.
 *
 * Usage:
 * ```typescript
 * const breaker = new CircuitBreaker({
 *   failureThreshold: 5,
 *   successThreshold: 2,
 *   timeout: 60000,
 *   resetTimeout: 30000
 * });
 *
 * try {
 *   const result = await breaker.execute(async () => {
 *     return await unreliableService();
 *   });
 * } catch (err) {
 *   if (err instanceof CircuitBreakerOpenError) {
 *     // Circuit is open, service is temporarily unavailable
 *     // Use fallback or cached data
 *   }
 * }
 * ```
 *
 * @module resilience/circuitBreaker
 * @author Marcus (Platform Engineer)
 */

import { circuitBreakerState, circuitBreakerFailures } from '../monitoring/metricsEndpoint';

export enum CircuitState {
  CLOSED = 'CLOSED',    // Normal operation
  OPEN = 'OPEN',        // Circuit is open, requests fail fast
  HALF_OPEN = 'HALF_OPEN'  // Testing if service recovered
}

export interface CircuitBreakerConfig {
  /** Number of failures before opening circuit */
  failureThreshold: number;

  /** Number of consecutive successes to close circuit from half-open */
  successThreshold: number;

  /** Request timeout in milliseconds */
  timeout: number;

  /** Time to wait before attempting half-open (milliseconds) */
  resetTimeout: number;

  /** Optional name for logging */
  name?: string;
}

export interface CircuitBreakerMetrics {
  state: CircuitState;
  failures: number;
  successes: number;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
  lastFailureTime: Date | null;
  lastSuccessTime: Date | null;
  totalRequests: number;
  totalFailures: number;
  totalSuccesses: number;
  totalRejections: number;  // Rejected due to open circuit
}

/**
 * Error thrown when circuit breaker is in OPEN state
 */
export class CircuitBreakerOpenError extends Error {
  constructor(name?: string) {
    super(`Circuit breaker ${name || 'unnamed'} is OPEN - request rejected`);
    this.name = 'CircuitBreakerOpenError';
  }
}

/**
 * Error thrown when request times out
 */
export class CircuitBreakerTimeoutError extends Error {
  constructor(timeout: number, name?: string) {
    super(`Circuit breaker ${name || 'unnamed'} request timed out after ${timeout}ms`);
    this.name = 'CircuitBreakerTimeoutError';
  }
}

/**
 * Circuit Breaker implementation
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private successes: number = 0;
  private consecutiveFailures: number = 0;
  private consecutiveSuccesses: number = 0;
  private lastFailureTime: Date | null = null;
  private lastSuccessTime: Date | null = null;
  private nextAttemptTime: number = 0;

  // Metrics
  private totalRequests: number = 0;
  private totalFailures: number = 0;
  private totalSuccesses: number = 0;
  private totalRejections: number = 0;

  constructor(private config: CircuitBreakerConfig) {
    if (config.failureThreshold < 1) {
      throw new Error('failureThreshold must be >= 1');
    }
    if (config.successThreshold < 1) {
      throw new Error('successThreshold must be >= 1');
    }
    if (config.timeout < 1) {
      throw new Error('timeout must be >= 1');
    }
    if (config.resetTimeout < 1) {
      throw new Error('resetTimeout must be >= 1');
    }

    // Initialize Prometheus metrics
    this.updatePrometheusMetrics();
  }

  /**
   * Update Prometheus metrics for circuit breaker state
   */
  private updatePrometheusMetrics(): void {
    const breakerName = this.config.name || 'unnamed';

    // Map state to numeric value (0=CLOSED, 1=HALF_OPEN, 2=OPEN)
    const stateValue = this.state === CircuitState.CLOSED ? 0 :
                       this.state === CircuitState.HALF_OPEN ? 1 : 2;

    circuitBreakerState.set({ breaker_name: breakerName }, stateValue);
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.totalRequests++;

    // Check if circuit should transition from OPEN to HALF_OPEN
    if (this.state === CircuitState.OPEN) {
      const now = Date.now();
      if (now >= this.nextAttemptTime) {
        console.log(`🔄 Circuit breaker ${this.config.name || 'unnamed'}: Transitioning to HALF_OPEN`);
        this.state = CircuitState.HALF_OPEN;
        this.consecutiveSuccesses = 0;
        this.updatePrometheusMetrics();
      } else {
        // Circuit still open
        this.totalRejections++;
        throw new CircuitBreakerOpenError(this.config.name);
      }
    }

    // Execute request with timeout
    try {
      const result = await this.executeWithTimeout(fn);
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure(err as Error);
      throw err;
    }
  }

  /**
   * Execute function with timeout
   */
  private async executeWithTimeout<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new CircuitBreakerTimeoutError(this.config.timeout, this.config.name));
      }, this.config.timeout);

      fn()
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((err) => {
          clearTimeout(timer);
          reject(err);
        });
    });
  }

  /**
   * Handle successful execution
   */
  private onSuccess(): void {
    this.totalSuccesses++;
    this.successes++;
    this.consecutiveSuccesses++;
    this.consecutiveFailures = 0;
    this.lastSuccessTime = new Date();

    if (this.state === CircuitState.HALF_OPEN) {
      // Check if we should close circuit
      if (this.consecutiveSuccesses >= this.config.successThreshold) {
        console.log(`✅ Circuit breaker ${this.config.name || 'unnamed'}: Closing circuit after ${this.consecutiveSuccesses} successes`);
        this.state = CircuitState.CLOSED;
        this.failures = 0;
        this.consecutiveFailures = 0;
        this.updatePrometheusMetrics();
      }
    }
  }

  /**
   * Handle failed execution
   */
  private onFailure(err: Error): void {
    this.totalFailures++;
    this.failures++;
    this.consecutiveFailures++;
    this.consecutiveSuccesses = 0;
    this.lastFailureTime = new Date();

    console.error(`❌ Circuit breaker ${this.config.name || 'unnamed'}: Failure (${this.consecutiveFailures}/${this.config.failureThreshold})`, err.message);

    if (this.state === CircuitState.HALF_OPEN) {
      // Failed during half-open, reopen circuit
      console.warn(`⚠️ Circuit breaker ${this.config.name || 'unnamed'}: Reopening circuit after failure in HALF_OPEN state`);
      this.openCircuit();
    } else if (this.state === CircuitState.CLOSED) {
      // Check if we should open circuit
      if (this.consecutiveFailures >= this.config.failureThreshold) {
        console.warn(`🚨 Circuit breaker ${this.config.name || 'unnamed'}: Opening circuit after ${this.consecutiveFailures} consecutive failures`);
        this.openCircuit();
      }
    }
  }

  /**
   * Open the circuit
   */
  private openCircuit(): void {
    this.state = CircuitState.OPEN;
    this.nextAttemptTime = Date.now() + this.config.resetTimeout;
    console.warn(`⏰ Circuit breaker ${this.config.name || 'unnamed'}: Next attempt at ${new Date(this.nextAttemptTime).toISOString()}`);

    // Update Prometheus metrics
    this.updatePrometheusMetrics();
    circuitBreakerFailures.inc({ breaker_name: this.config.name || 'unnamed' });
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Get metrics
   */
  getMetrics(): CircuitBreakerMetrics {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      consecutiveFailures: this.consecutiveFailures,
      consecutiveSuccesses: this.consecutiveSuccesses,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      totalRequests: this.totalRequests,
      totalFailures: this.totalFailures,
      totalSuccesses: this.totalSuccesses,
      totalRejections: this.totalRejections,
    };
  }

  /**
   * Reset circuit breaker to initial state
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.successes = 0;
    this.consecutiveFailures = 0;
    this.consecutiveSuccesses = 0;
    this.lastFailureTime = null;
    this.lastSuccessTime = null;
    this.nextAttemptTime = 0;
    console.log(`🔄 Circuit breaker ${this.config.name || 'unnamed'}: Reset to CLOSED state`);
  }

  /**
   * Force circuit to OPEN state (useful for testing or manual intervention)
   */
  forceOpen(): void {
    this.openCircuit();
    console.warn(`⚠️ Circuit breaker ${this.config.name || 'unnamed'}: Manually forced to OPEN state`);
  }

  /**
   * Force circuit to CLOSED state (useful for testing or manual intervention)
   */
  forceClosed(): void {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.consecutiveFailures = 0;
    console.log(`✅ Circuit breaker ${this.config.name || 'unnamed'}: Manually forced to CLOSED state`);
  }
}

/**
 * Circuit Breaker Manager
 *
 * Manages multiple circuit breakers by name
 */
export class CircuitBreakerManager {
  private breakers: Map<string, CircuitBreaker> = new Map();

  /**
   * Get or create a circuit breaker
   */
  getBreaker(name: string, config?: CircuitBreakerConfig): CircuitBreaker {
    let breaker = this.breakers.get(name);

    if (!breaker) {
      if (!config) {
        throw new Error(`Circuit breaker ${name} not found and no config provided`);
      }

      breaker = new CircuitBreaker({ ...config, name });
      this.breakers.set(name, breaker);
      console.log(`✅ Created circuit breaker: ${name}`);
    }

    return breaker;
  }

  /**
   * Get all breakers
   */
  getAllBreakers(): Map<string, CircuitBreaker> {
    return new Map(this.breakers);
  }

  /**
   * Get metrics for all breakers
   */
  getAllMetrics(): Record<string, CircuitBreakerMetrics> {
    const metrics: Record<string, CircuitBreakerMetrics> = {};

    for (const [name, breaker] of this.breakers.entries()) {
      metrics[name] = breaker.getMetrics();
    }

    return metrics;
  }

  /**
   * Reset all breakers
   */
  resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.reset();
    }
    console.log('🔄 All circuit breakers reset');
  }
}

/**
 * Global circuit breaker manager instance
 */
export const circuitBreakerManager = new CircuitBreakerManager();
