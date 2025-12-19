/**
 * Circuit Breaker Implementation for External Dependencies
 *
 * Prevents cascading failures when external services (PostgreSQL, Redis)
 * become unavailable or degraded. Implements the circuit breaker pattern:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Service failing, requests rejected immediately
 * - HALF_OPEN: Recovery testing, limited requests allowed
 *
 * @module circuit-breaker
 * @author Marcus (Platform Engineer)
 * @date 2025-11-22
 */

export enum CircuitState {
  CLOSED = 'CLOSED',     // Normal operation
  OPEN = 'OPEN',         // Failing, reject all requests
  HALF_OPEN = 'HALF_OPEN' // Testing recovery
}

export interface CircuitBreakerConfig {
  // Failure threshold - percentage of requests that must fail before opening
  failureThreshold: number;  // 0-1 (e.g., 0.5 = 50%)

  // Minimum requests before calculating failure rate
  minimumRequests: number;

  // Timeout for individual requests (ms)
  timeout: number;

  // How long to wait before attempting recovery (ms)
  resetTimeout: number;

  // How many requests to allow in HALF_OPEN state
  halfOpenRequests: number;

  // Name for logging
  name: string;
}

interface RequestMetrics {
  total: number;
  failures: number;
  successes: number;
  timeouts: number;
  lastFailureTime: number;
}

export class CircuitBreaker<T = any> {
  private state: CircuitState = CircuitState.CLOSED;
  private config: CircuitBreakerConfig;
  private metrics: RequestMetrics = {
    total: 0,
    failures: 0,
    successes: 0,
    timeouts: 0,
    lastFailureTime: 0
  };
  private halfOpenAttempts: number = 0;
  private resetTimer: NodeJS.Timeout | null = null;

  constructor(config: CircuitBreakerConfig) {
    this.config = config;
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<R>(fn: () => Promise<R>): Promise<R> {
    // Check circuit state
    if (this.state === CircuitState.OPEN) {
      throw new CircuitBreakerOpenError(
        `Circuit breaker OPEN for ${this.config.name} - service unavailable`
      );
    }

    if (this.state === CircuitState.HALF_OPEN) {
      // Limit concurrent requests in HALF_OPEN
      if (this.halfOpenAttempts >= this.config.halfOpenRequests) {
        throw new CircuitBreakerOpenError(
          `Circuit breaker HALF_OPEN for ${this.config.name} - recovery in progress`
        );
      }
      this.halfOpenAttempts++;
    }

    // Execute with timeout
    try {
      const result = await this.executeWithTimeout(fn);
      this.recordSuccess();
      return result;
    } catch (err) {
      this.recordFailure(err);
      throw err;
    }
  }

  /**
   * Execute function with timeout
   */
  private async executeWithTimeout<R>(fn: () => Promise<R>): Promise<R> {
    return Promise.race([
      fn(),
      new Promise<R>((_, reject) => {
        setTimeout(() => {
          reject(new CircuitBreakerTimeoutError(
            `Request to ${this.config.name} timed out after ${this.config.timeout}ms`
          ));
        }, this.config.timeout);
      })
    ]);
  }

  /**
   * Record successful request
   */
  private recordSuccess(): void {
    this.metrics.total++;
    this.metrics.successes++;

    if (this.state === CircuitState.HALF_OPEN) {
      console.log(`✅ Circuit breaker ${this.config.name}: HALF_OPEN success (${this.halfOpenAttempts}/${this.config.halfOpenRequests})`);

      // If enough successful requests in HALF_OPEN, close circuit
      if (this.halfOpenAttempts >= this.config.halfOpenRequests) {
        this.transitionToState(CircuitState.CLOSED);
        this.resetMetrics();
      }
    }
  }

  /**
   * Record failed request
   */
  private recordFailure(err: any): void {
    this.metrics.total++;
    this.metrics.failures++;
    this.metrics.lastFailureTime = Date.now();

    if (err instanceof CircuitBreakerTimeoutError) {
      this.metrics.timeouts++;
    }

    // If in HALF_OPEN and we fail, immediately go back to OPEN
    if (this.state === CircuitState.HALF_OPEN) {
      console.log(`❌ Circuit breaker ${this.config.name}: HALF_OPEN failure - reopening`);
      this.transitionToState(CircuitState.OPEN);
      this.scheduleReset();
      return;
    }

    // Check if we should open the circuit
    if (this.shouldOpen()) {
      console.log(`🚨 Circuit breaker ${this.config.name}: Opening circuit - failure threshold exceeded`);
      this.transitionToState(CircuitState.OPEN);
      this.scheduleReset();
    }
  }

  /**
   * Check if circuit should open based on failure rate
   */
  private shouldOpen(): boolean {
    if (this.state !== CircuitState.CLOSED) {
      return false;
    }

    // Need minimum requests before making decision
    if (this.metrics.total < this.config.minimumRequests) {
      return false;
    }

    const failureRate = this.metrics.failures / this.metrics.total;
    return failureRate >= this.config.failureThreshold;
  }

  /**
   * Schedule transition to HALF_OPEN after reset timeout
   */
  private scheduleReset(): void {
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
    }

    this.resetTimer = setTimeout(() => {
      console.log(`⚠️ Circuit breaker ${this.config.name}: Attempting recovery (HALF_OPEN)`);
      this.transitionToState(CircuitState.HALF_OPEN);
      this.halfOpenAttempts = 0;
    }, this.config.resetTimeout);
  }

  /**
   * Transition to new state
   */
  private transitionToState(newState: CircuitState): void {
    const oldState = this.state;
    this.state = newState;

    console.log(`🔄 Circuit breaker ${this.config.name}: ${oldState} → ${newState}`);

    if (newState === CircuitState.CLOSED) {
      console.log(`✅ Circuit breaker ${this.config.name}: Recovered - service healthy`);
    }
  }

  /**
   * Reset metrics (when circuit closes)
   */
  private resetMetrics(): void {
    this.metrics = {
      total: 0,
      failures: 0,
      successes: 0,
      timeouts: 0,
      lastFailureTime: 0
    };
    this.halfOpenAttempts = 0;
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
  getMetrics(): RequestMetrics & { state: CircuitState } {
    return {
      ...this.metrics,
      state: this.state
    };
  }

  /**
   * Force open (for testing/maintenance)
   */
  forceOpen(): void {
    this.transitionToState(CircuitState.OPEN);
  }

  /**
   * Force close (for testing/recovery)
   */
  forceClose(): void {
    this.transitionToState(CircuitState.CLOSED);
    this.resetMetrics();
  }
}

/**
 * Circuit breaker error classes
 */
export class CircuitBreakerOpenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CircuitBreakerOpenError';
  }
}

export class CircuitBreakerTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CircuitBreakerTimeoutError';
  }
}

/**
 * Factory for common circuit breaker configurations
 */
export class CircuitBreakerFactory {
  /**
   * Database circuit breaker (conservative - databases are critical)
   */
  static forDatabase(name: string = 'PostgreSQL'): CircuitBreaker {
    return new CircuitBreaker({
      name,
      failureThreshold: 0.5,      // 50% failure rate
      minimumRequests: 10,         // Need 10 requests before deciding
      timeout: 5000,               // 5 second timeout
      resetTimeout: 30000,         // 30 seconds before retry
      halfOpenRequests: 3          // 3 successful requests to close
    });
  }

  /**
   * Cache circuit breaker (aggressive - cache can fail without major impact)
   */
  static forCache(name: string = 'Redis'): CircuitBreaker {
    return new CircuitBreaker({
      name,
      failureThreshold: 0.7,      // 70% failure rate (more tolerant)
      minimumRequests: 5,          // Fewer requests needed
      timeout: 2000,               // 2 second timeout
      resetTimeout: 10000,         // 10 seconds before retry
      halfOpenRequests: 2          // 2 successful requests to close
    });
  }

  /**
   * Custom circuit breaker
   */
  static custom(config: CircuitBreakerConfig): CircuitBreaker {
    return new CircuitBreaker(config);
  }
}
