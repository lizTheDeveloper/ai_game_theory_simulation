/**
 * Circuit Breaker Pattern Implementation
 *
 * Protects against cascading failures by detecting repeated failures
 * and temporarily blocking requests to failing services.
 *
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Service is failing, requests fail fast
 * - HALF_OPEN: Testing if service recovered
 *
 * @module platform/resilience/circuitBreaker
 */

import { EventEmitter } from 'events';
import { Counter, Gauge, Histogram } from 'prom-client';

export enum CircuitBreakerState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

export interface CircuitBreakerConfig {
  name: string;
  failureThreshold: number;      // Failures before opening (default: 5)
  timeout: number;                // Time in OPEN state (ms, default: 60000)
  successThreshold: number;       // Successes in HALF_OPEN before closing (default: 3)
  fallback?: () => any;          // Optional fallback function
  onStateChange?: (from: CircuitBreakerState, to: CircuitBreakerState) => void;
}

export interface CircuitBreakerMetrics {
  successCount: number;
  failureCount: number;
  totalRequests: number;
  stateTransitions: number;
  lastFailureTime: number | null;
  lastSuccessTime: number | null;
}

/**
 * Circuit Breaker implementation with Prometheus metrics
 */
export class CircuitBreaker extends EventEmitter {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private totalRequests: number = 0;
  private stateTransitions: number = 0;
  private lastFailureTime: number | null = null;
  private lastSuccessTime: number | null = null;
  private nextAttemptTime: number = 0;

  // Prometheus metrics
  private requestCounter: Counter<string>;
  private stateGauge: Gauge<string>;
  private latencyHistogram: Histogram<string>;

  constructor(private config: CircuitBreakerConfig) {
    super();

    // Initialize Prometheus metrics
    this.requestCounter = new Counter({
      name: `circuit_breaker_requests_total`,
      help: 'Total requests through circuit breaker',
      labelNames: ['breaker', 'result']
    });

    this.stateGauge = new Gauge({
      name: `circuit_breaker_state`,
      help: 'Circuit breaker state (0=CLOSED, 1=OPEN, 2=HALF_OPEN)',
      labelNames: ['breaker']
    });

    this.latencyHistogram = new Histogram({
      name: `circuit_breaker_latency_ms`,
      help: 'Circuit breaker request latency',
      labelNames: ['breaker'],
      buckets: [10, 25, 50, 75, 100, 250, 500, 1000, 2500, 5000]
    });

    this.updateStateMetric();
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.totalRequests++;

    if (this.state === CircuitBreakerState.OPEN) {
      if (Date.now() < this.nextAttemptTime) {
        // Circuit is open, fail fast
        this.requestCounter.inc({ breaker: this.config.name, result: 'rejected' });

        if (this.config.fallback) {
          return this.config.fallback();
        }

        throw new Error(`Circuit breaker [${this.config.name}] is OPEN`);
      } else {
        // Timeout expired, transition to HALF_OPEN
        this.transitionTo(CircuitBreakerState.HALF_OPEN);
      }
    }

    const startTime = Date.now();

    try {
      const result = await fn();

      const latency = Date.now() - startTime;
      this.latencyHistogram.observe({ breaker: this.config.name }, latency);

      this.onSuccess();
      return result;
    } catch (error) {
      const latency = Date.now() - startTime;
      this.latencyHistogram.observe({ breaker: this.config.name }, latency);

      this.onFailure();
      throw error;
    }
  }

  /**
   * Handle successful execution
   */
  private onSuccess(): void {
    this.requestCounter.inc({ breaker: this.config.name, result: 'success' });
    this.lastSuccessTime = Date.now();

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.successCount++;

      if (this.successCount >= this.config.successThreshold) {
        // Service recovered, close circuit
        this.transitionTo(CircuitBreakerState.CLOSED);
      }
    } else if (this.state === CircuitBreakerState.CLOSED) {
      // Reset failure count on success
      this.failureCount = 0;
    }
  }

  /**
   * Handle failed execution
   */
  private onFailure(): void {
    this.requestCounter.inc({ breaker: this.config.name, result: 'failure' });
    this.lastFailureTime = Date.now();
    this.failureCount++;

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      // Failure in HALF_OPEN, reopen circuit
      this.transitionTo(CircuitBreakerState.OPEN);
    } else if (this.state === CircuitBreakerState.CLOSED) {
      if (this.failureCount >= this.config.failureThreshold) {
        // Threshold exceeded, open circuit
        this.transitionTo(CircuitBreakerState.OPEN);
      }
    }
  }

  /**
   * Transition to a new state
   */
  private transitionTo(newState: CircuitBreakerState): void {
    const oldState = this.state;

    if (oldState === newState) {
      return;
    }

    this.state = newState;
    this.stateTransitions++;

    // Reset counters on state change
    if (newState === CircuitBreakerState.OPEN) {
      this.nextAttemptTime = Date.now() + this.config.timeout;
      this.successCount = 0;
    } else if (newState === CircuitBreakerState.HALF_OPEN) {
      this.successCount = 0;
      this.failureCount = 0;
    } else if (newState === CircuitBreakerState.CLOSED) {
      this.failureCount = 0;
      this.successCount = 0;
    }

    this.updateStateMetric();
    this.emit('stateChange', { from: oldState, to: newState, breaker: this.config.name });

    if (this.config.onStateChange) {
      this.config.onStateChange(oldState, newState);
    }
  }

  /**
   * Update Prometheus state metric
   */
  private updateStateMetric(): void {
    const stateValue =
      this.state === CircuitBreakerState.CLOSED ? 0 :
      this.state === CircuitBreakerState.OPEN ? 1 : 2;

    this.stateGauge.set({ breaker: this.config.name }, stateValue);
  }

  /**
   * Get current state
   */
  getState(): CircuitBreakerState {
    return this.state;
  }

  /**
   * Get current metrics
   */
  getMetrics(): CircuitBreakerMetrics {
    return {
      successCount: this.successCount,
      failureCount: this.failureCount,
      totalRequests: this.totalRequests,
      stateTransitions: this.stateTransitions,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime
    };
  }

  /**
   * Manually reset the circuit breaker
   */
  reset(): void {
    this.transitionTo(CircuitBreakerState.CLOSED);
    this.failureCount = 0;
    this.successCount = 0;
  }

  /**
   * Check if circuit breaker is healthy
   */
  isHealthy(): boolean {
    return this.state !== CircuitBreakerState.OPEN;
  }
}

/**
 * Circuit Breaker Manager - manages multiple circuit breakers
 */
export class CircuitBreakerManager {
  private breakers: Map<string, CircuitBreaker> = new Map();

  /**
   * Create or get a circuit breaker
   */
  getBreaker(config: CircuitBreakerConfig): CircuitBreaker {
    const existing = this.breakers.get(config.name);
    if (existing) {
      return existing;
    }

    const breaker = new CircuitBreaker(config);
    this.breakers.set(config.name, breaker);

    // Log state changes
    breaker.on('stateChange', ({ from, to, breaker: name }) => {
      console.log(`🔌 Circuit breaker [${name}] state: ${from} → ${to}`);
    });

    return breaker;
  }

  /**
   * Get all circuit breakers
   */
  getAllBreakers(): Map<string, CircuitBreaker> {
    return this.breakers;
  }

  /**
   * Get health status of all breakers
   */
  getHealthStatus(): { name: string; state: CircuitBreakerState; healthy: boolean }[] {
    return Array.from(this.breakers.entries()).map(([name, breaker]) => ({
      name,
      state: breaker.getState(),
      healthy: breaker.isHealthy()
    }));
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    this.breakers.forEach(breaker => breaker.reset());
  }
}

// Singleton instance
export const circuitBreakerManager = new CircuitBreakerManager();
