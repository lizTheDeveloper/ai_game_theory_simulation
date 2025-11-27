/**
 * Unit tests for Circuit Breaker Pattern
 *
 * Tests circuit breaker state transitions, failure handling, and recovery
 *
 * @group unit
 */

import {
  CircuitBreaker,
  CircuitBreakerManager,
  CircuitState,
  CircuitBreakerOpenError,
  CircuitBreakerTimeoutError
} from '../../resilience/circuitBreaker';

describe('CircuitBreaker', () => {
  // Helper to create a test breaker with fast timeouts
  const createTestBreaker = (overrides = {}) => {
    return new CircuitBreaker({
      failureThreshold: 3,
      successThreshold: 2,
      timeout: 100,
      resetTimeout: 200,
      name: 'test-breaker',
      ...overrides
    });
  };

  // Helper to create async function that fails N times then succeeds
  const createFlakeyService = (failCount: number) => {
    let attempts = 0;
    return async () => {
      attempts++;
      if (attempts <= failCount) {
        throw new Error(`Service failure ${attempts}`);
      }
      return 'success';
    };
  };

  // Helper to wait for time to pass
  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  describe('Constructor', () => {
    it('should create circuit breaker with valid config', () => {
      const breaker = createTestBreaker();
      expect(breaker.getState()).toBe(CircuitState.CLOSED);
    });

    it('should reject failureThreshold < 1', () => {
      expect(() => new CircuitBreaker({
        failureThreshold: 0,
        successThreshold: 2,
        timeout: 1000,
        resetTimeout: 5000
      })).toThrow('failureThreshold must be >= 1');
    });

    it('should reject successThreshold < 1', () => {
      expect(() => new CircuitBreaker({
        failureThreshold: 3,
        successThreshold: 0,
        timeout: 1000,
        resetTimeout: 5000
      })).toThrow('successThreshold must be >= 1');
    });

    it('should reject timeout < 1', () => {
      expect(() => new CircuitBreaker({
        failureThreshold: 3,
        successThreshold: 2,
        timeout: 0,
        resetTimeout: 5000
      })).toThrow('timeout must be >= 1');
    });

    it('should reject resetTimeout < 1', () => {
      expect(() => new CircuitBreaker({
        failureThreshold: 3,
        successThreshold: 2,
        timeout: 1000,
        resetTimeout: 0
      })).toThrow('resetTimeout must be >= 1');
    });
  });

  describe('Circuit State - CLOSED', () => {
    it('should start in CLOSED state', () => {
      const breaker = createTestBreaker();
      expect(breaker.getState()).toBe(CircuitState.CLOSED);
    });

    it('should execute successful requests', async () => {
      const breaker = createTestBreaker();
      const result = await breaker.execute(async () => 'success');
      expect(result).toBe('success');
    });

    it('should track successful executions', async () => {
      const breaker = createTestBreaker();
      await breaker.execute(async () => 'success');
      const metrics = breaker.getMetrics();
      expect(metrics.totalRequests).toBe(1);
      expect(metrics.totalSuccesses).toBe(1);
      expect(metrics.totalFailures).toBe(0);
    });

    it('should remain CLOSED on single failure', async () => {
      const breaker = createTestBreaker({ failureThreshold: 3 });
      try {
        await breaker.execute(async () => { throw new Error('fail'); });
      } catch (e) {
        // Expected
      }
      expect(breaker.getState()).toBe(CircuitState.CLOSED);
    });

    it('should transition to OPEN after failure threshold reached', async () => {
      const breaker = createTestBreaker({ failureThreshold: 3 });

      // Fail 3 times
      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(async () => { throw new Error('fail'); });
        } catch (e) {
          // Expected
        }
      }

      expect(breaker.getState()).toBe(CircuitState.OPEN);
    });

    it('should reset consecutive failures on success', async () => {
      const breaker = createTestBreaker({ failureThreshold: 3 });

      // Fail twice
      for (let i = 0; i < 2; i++) {
        try {
          await breaker.execute(async () => { throw new Error('fail'); });
        } catch (e) {
          // Expected
        }
      }

      // Succeed
      await breaker.execute(async () => 'success');

      // Consecutive failures should reset
      const metrics = breaker.getMetrics();
      expect(metrics.consecutiveFailures).toBe(0);
      expect(breaker.getState()).toBe(CircuitState.CLOSED);
    });
  });

  describe('Circuit State - OPEN', () => {
    it('should reject requests immediately when OPEN', async () => {
      const breaker = createTestBreaker({ failureThreshold: 2 });

      // Open the circuit
      for (let i = 0; i < 2; i++) {
        try {
          await breaker.execute(async () => { throw new Error('fail'); });
        } catch (e) {
          // Expected
        }
      }

      // Attempt should be rejected immediately
      await expect(
        breaker.execute(async () => 'success')
      ).rejects.toThrow(CircuitBreakerOpenError);
    });

    it('should increment rejections when OPEN', async () => {
      const breaker = createTestBreaker({ failureThreshold: 2 });

      // Open the circuit
      for (let i = 0; i < 2; i++) {
        try {
          await breaker.execute(async () => { throw new Error('fail'); });
        } catch (e) {
          // Expected
        }
      }

      // Reject requests
      try {
        await breaker.execute(async () => 'success');
      } catch (e) {
        // Expected CircuitBreakerOpenError
      }

      const metrics = breaker.getMetrics();
      expect(metrics.totalRejections).toBeGreaterThan(0);
    });

    it('should transition to HALF_OPEN after reset timeout', async () => {
      const breaker = createTestBreaker({
        failureThreshold: 2,
        resetTimeout: 50  // Short timeout for testing
      });

      // Open the circuit
      for (let i = 0; i < 2; i++) {
        try {
          await breaker.execute(async () => { throw new Error('fail'); });
        } catch (e) {
          // Expected
        }
      }

      expect(breaker.getState()).toBe(CircuitState.OPEN);

      // Wait for reset timeout
      await wait(60);

      // Next execution should trigger HALF_OPEN transition
      // (fails because we don't handle it, but state should change)
      try {
        await breaker.execute(async () => { throw new Error('still failing'); });
      } catch (e) {
        // Expected
      }

      // Circuit should be OPEN again after failing in HALF_OPEN
      expect(breaker.getState()).toBe(CircuitState.OPEN);
    });
  });

  describe('Circuit State - HALF_OPEN', () => {
    it('should allow trial requests in HALF_OPEN state', async () => {
      const breaker = createTestBreaker({
        failureThreshold: 2,
        successThreshold: 2,
        resetTimeout: 50
      });

      // Open the circuit
      for (let i = 0; i < 2; i++) {
        try {
          await breaker.execute(async () => { throw new Error('fail'); });
        } catch (e) {
          // Expected
        }
      }

      // Wait for reset timeout
      await wait(60);

      // Execute successful request (triggers HALF_OPEN)
      await breaker.execute(async () => 'success');

      // We can't directly assert HALF_OPEN because success might close it
      // But we can verify that the request was allowed through
      const metrics = breaker.getMetrics();
      expect(metrics.totalSuccesses).toBe(1);
    });

    it('should reopen circuit on failure in HALF_OPEN state', async () => {
      const breaker = createTestBreaker({
        failureThreshold: 2,
        resetTimeout: 50
      });

      // Open the circuit
      for (let i = 0; i < 2; i++) {
        try {
          await breaker.execute(async () => { throw new Error('fail'); });
        } catch (e) {
          // Expected
        }
      }

      // Wait for reset timeout
      await wait(60);

      // Fail in HALF_OPEN state
      try {
        await breaker.execute(async () => { throw new Error('still failing'); });
      } catch (e) {
        // Expected
      }

      // Circuit should be OPEN again
      expect(breaker.getState()).toBe(CircuitState.OPEN);
    });

    it('should close circuit after success threshold reached', async () => {
      const breaker = createTestBreaker({
        failureThreshold: 2,
        successThreshold: 2,
        resetTimeout: 50
      });

      // Open the circuit
      for (let i = 0; i < 2; i++) {
        try {
          await breaker.execute(async () => { throw new Error('fail'); });
        } catch (e) {
          // Expected
        }
      }

      // Wait for reset timeout
      await wait(60);

      // Succeed twice (success threshold)
      await breaker.execute(async () => 'success 1');
      await breaker.execute(async () => 'success 2');

      // Circuit should be CLOSED
      expect(breaker.getState()).toBe(CircuitState.CLOSED);
    });
  });

  describe('Timeout Handling', () => {
    it('should timeout slow requests', async () => {
      const breaker = createTestBreaker({ timeout: 50 });

      await expect(
        breaker.execute(async () => {
          await wait(100); // Slower than timeout
          return 'too slow';
        })
      ).rejects.toThrow(CircuitBreakerTimeoutError);
    });

    it('should count timeouts as failures', async () => {
      const breaker = createTestBreaker({ timeout: 50, failureThreshold: 2 });

      // Timeout twice
      for (let i = 0; i < 2; i++) {
        try {
          await breaker.execute(async () => {
            await wait(100);
            return 'too slow';
          });
        } catch (e) {
          // Expected
        }
      }

      // Circuit should be OPEN
      expect(breaker.getState()).toBe(CircuitState.OPEN);
    });
  });

  describe('Metrics', () => {
    it('should track all request metrics', async () => {
      const breaker = createTestBreaker();

      // Success
      await breaker.execute(async () => 'success');

      // Failure
      try {
        await breaker.execute(async () => { throw new Error('fail'); });
      } catch (e) {
        // Expected
      }

      const metrics = breaker.getMetrics();
      expect(metrics.totalRequests).toBe(2);
      expect(metrics.totalSuccesses).toBe(1);
      expect(metrics.totalFailures).toBe(1);
      expect(metrics.consecutiveSuccesses).toBe(0);
      expect(metrics.consecutiveFailures).toBe(1);
    });

    it('should record last failure and success times', async () => {
      const breaker = createTestBreaker();

      await breaker.execute(async () => 'success');
      const metrics1 = breaker.getMetrics();
      expect(metrics1.lastSuccessTime).toBeInstanceOf(Date);

      try {
        await breaker.execute(async () => { throw new Error('fail'); });
      } catch (e) {
        // Expected
      }
      const metrics2 = breaker.getMetrics();
      expect(metrics2.lastFailureTime).toBeInstanceOf(Date);
    });
  });

  describe('Manual Control', () => {
    it('should force OPEN with forceOpen()', () => {
      const breaker = createTestBreaker();
      expect(breaker.getState()).toBe(CircuitState.CLOSED);

      breaker.forceOpen();
      expect(breaker.getState()).toBe(CircuitState.OPEN);
    });

    it('should force CLOSED with forceClosed()', async () => {
      const breaker = createTestBreaker({ failureThreshold: 1 });

      // Open the circuit
      try {
        await breaker.execute(async () => { throw new Error('fail'); });
      } catch (e) {
        // Expected
      }

      breaker.forceClosed();
      expect(breaker.getState()).toBe(CircuitState.CLOSED);
    });

    it('should reset with reset()', async () => {
      const breaker = createTestBreaker({ failureThreshold: 2 });

      // Open the circuit
      for (let i = 0; i < 2; i++) {
        try {
          await breaker.execute(async () => { throw new Error('fail'); });
        } catch (e) {
          // Expected
        }
      }

      breaker.reset();

      expect(breaker.getState()).toBe(CircuitState.CLOSED);
      const metrics = breaker.getMetrics();
      expect(metrics.failures).toBe(0);
      expect(metrics.consecutiveFailures).toBe(0);
    });
  });
});

describe('CircuitBreakerManager', () => {
  let manager: CircuitBreakerManager;

  beforeEach(() => {
    manager = new CircuitBreakerManager();
  });

  describe('getBreaker', () => {
    it('should create breaker with config on first access', () => {
      const breaker = manager.getBreaker('service-a', {
        failureThreshold: 5,
        successThreshold: 2,
        timeout: 1000,
        resetTimeout: 5000
      });

      expect(breaker).toBeDefined();
      expect(breaker.getState()).toBe(CircuitState.CLOSED);
    });

    it('should return existing breaker on subsequent access', () => {
      const breaker1 = manager.getBreaker('service-a', {
        failureThreshold: 5,
        successThreshold: 2,
        timeout: 1000,
        resetTimeout: 5000
      });

      const breaker2 = manager.getBreaker('service-a');

      expect(breaker2).toBe(breaker1);
    });

    it('should throw error if breaker not found and no config provided', () => {
      expect(() => manager.getBreaker('nonexistent')).toThrow(
        'Circuit breaker nonexistent not found and no config provided'
      );
    });

    it('should manage multiple breakers by name', () => {
      manager.getBreaker('service-a', {
        failureThreshold: 3,
        successThreshold: 2,
        timeout: 1000,
        resetTimeout: 5000
      });

      manager.getBreaker('service-b', {
        failureThreshold: 5,
        successThreshold: 3,
        timeout: 2000,
        resetTimeout: 10000
      });

      const allBreakers = manager.getAllBreakers();
      expect(allBreakers.size).toBe(2);
      expect(allBreakers.has('service-a')).toBe(true);
      expect(allBreakers.has('service-b')).toBe(true);
    });
  });

  describe('getAllMetrics', () => {
    it('should return metrics for all breakers', async () => {
      const breaker1 = manager.getBreaker('service-a', {
        failureThreshold: 3,
        successThreshold: 2,
        timeout: 1000,
        resetTimeout: 5000
      });

      const breaker2 = manager.getBreaker('service-b', {
        failureThreshold: 3,
        successThreshold: 2,
        timeout: 1000,
        resetTimeout: 5000
      });

      await breaker1.execute(async () => 'success');
      await breaker2.execute(async () => 'success');

      const allMetrics = manager.getAllMetrics();
      expect(allMetrics['service-a'].totalSuccesses).toBe(1);
      expect(allMetrics['service-b'].totalSuccesses).toBe(1);
    });
  });

  describe('resetAll', () => {
    it('should reset all breakers', async () => {
      const breaker = manager.getBreaker('service-a', {
        failureThreshold: 2,
        successThreshold: 2,
        timeout: 1000,
        resetTimeout: 5000
      });

      // Open the circuit
      for (let i = 0; i < 2; i++) {
        try {
          await breaker.execute(async () => { throw new Error('fail'); });
        } catch (e) {
          // Expected
        }
      }

      expect(breaker.getState()).toBe(CircuitState.OPEN);

      manager.resetAll();

      expect(breaker.getState()).toBe(CircuitState.CLOSED);
    });
  });
});
