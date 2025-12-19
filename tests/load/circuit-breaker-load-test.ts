/**
 * Circuit Breaker Load Test - Phase 3.4.3
 *
 * Tests circuit breaker behavior under various failure scenarios:
 * 1. Database failure simulation
 * 2. Redis failure simulation
 * 3. Verify circuit opens within 5 failures
 * 4. Verify fast-fail (<100ms) when circuit is open
 * 5. Verify automatic recovery after service restoration
 * 6. Ensure no cascading failures
 *
 * Usage:
 *   npx tsx tests/load/circuit-breaker-load-test.ts
 */

import { CircuitBreaker, CircuitState, CircuitBreakerOpenError } from '../../src/platform/resilience/circuitBreaker';

// ============================================================================
// Configuration
// ============================================================================

interface TestResults {
  testName: string;
  passed: boolean;
  details: string;
  metrics?: any;
}

const results: TestResults[] = [];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logTest(testNumber: number, testName: string) {
  log(`\n[TEST ${testNumber}] ${testName}`, colors.yellow);
}

function logPass(message: string) {
  log(`✅ PASS: ${message}`, colors.green);
}

function logFail(message: string) {
  log(`❌ FAIL: ${message}`, colors.red);
}

function logInfo(message: string) {
  log(`   ${message}`, colors.cyan);
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Simulate a service that fails N times then succeeds
 */
class FlakeyService {
  private callCount = 0;
  private failuresBeforeSuccess: number;
  private delayMs: number;

  constructor(failuresBeforeSuccess: number, delayMs: number = 10) {
    this.failuresBeforeSuccess = failuresBeforeSuccess;
    this.delayMs = delayMs;
  }

  async call(): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, this.delayMs));

    this.callCount++;

    if (this.callCount <= this.failuresBeforeSuccess) {
      throw new Error(`Service failure ${this.callCount}/${this.failuresBeforeSuccess}`);
    }

    return `Success after ${this.callCount} calls`;
  }

  reset() {
    this.callCount = 0;
  }

  getCallCount(): number {
    return this.callCount;
  }
}

/**
 * Measure execution time
 */
async function measureTime<T>(fn: () => Promise<T>): Promise<{ result?: T; error?: Error; duration: number }> {
  const start = Date.now();
  try {
    const result = await fn();
    return { result, duration: Date.now() - start };
  } catch (error) {
    return { error: error as Error, duration: Date.now() - start };
  }
}

// ============================================================================
// Test 1: Circuit Opens After Threshold Failures
// ============================================================================

async function testCircuitOpensAfterThreshold(): Promise<TestResults> {
  logTest(1, 'Circuit opens after threshold failures');

  const breaker = new CircuitBreaker({
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 1000,
    resetTimeout: 5000,
    name: 'test-threshold',
  });

  const service = new FlakeyService(10); // Will always fail

  let failureCount = 0;
  let circuitOpenErrorCount = 0;

  // Send 10 requests (should open after 5)
  for (let i = 0; i < 10; i++) {
    try {
      await breaker.execute(() => service.call());
    } catch (err) {
      if (err instanceof CircuitBreakerOpenError) {
        circuitOpenErrorCount++;
        logInfo(`Request ${i + 1}: Circuit is OPEN (fast-fail)`);
      } else {
        failureCount++;
        logInfo(`Request ${i + 1}: Service failure`);
      }
    }
  }

  const metrics = breaker.getMetrics();
  const state = breaker.getState();

  logInfo(`Failure count: ${failureCount}`);
  logInfo(`Circuit open rejections: ${circuitOpenErrorCount}`);
  logInfo(`Circuit state: ${state}`);
  logInfo(`Consecutive failures: ${metrics.consecutiveFailures}`);

  const passed = state === CircuitState.OPEN &&
                 failureCount === 5 &&
                 circuitOpenErrorCount === 5;

  if (passed) {
    logPass('Circuit opened after exactly 5 failures');
  } else {
    logFail(`Expected 5 failures then OPEN state, got ${failureCount} failures, state: ${state}`);
  }

  return {
    testName: 'Circuit opens after threshold',
    passed,
    details: `${failureCount} failures, ${circuitOpenErrorCount} rejections, state: ${state}`,
    metrics,
  };
}

// ============================================================================
// Test 2: Fast-Fail When Circuit is Open
// ============================================================================

async function testFastFailWhenOpen(): Promise<TestResults> {
  logTest(2, 'Requests fail fast (<100ms) when circuit is open');

  const breaker = new CircuitBreaker({
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 1000,
    resetTimeout: 10000,
    name: 'test-fast-fail',
  });

  const service = new FlakeyService(10); // Will always fail

  // Open the circuit by causing 3 failures
  for (let i = 0; i < 3; i++) {
    try {
      await breaker.execute(() => service.call());
    } catch (err) {
      // Expected
    }
  }

  // Now test fast-fail
  const fastFailTimes: number[] = [];

  for (let i = 0; i < 10; i++) {
    const { error, duration } = await measureTime(() =>
      breaker.execute(() => service.call())
    );

    if (error instanceof CircuitBreakerOpenError) {
      fastFailTimes.push(duration);
    }
  }

  const avgFastFailTime = fastFailTimes.reduce((a, b) => a + b, 0) / fastFailTimes.length;
  const maxFastFailTime = Math.max(...fastFailTimes);

  logInfo(`Fast-fail times: ${fastFailTimes.map(t => `${t}ms`).join(', ')}`);
  logInfo(`Average fast-fail time: ${avgFastFailTime.toFixed(2)}ms`);
  logInfo(`Maximum fast-fail time: ${maxFastFailTime}ms`);

  const passed = maxFastFailTime < 100 && avgFastFailTime < 50;

  if (passed) {
    logPass(`All fast-fails under 100ms (avg: ${avgFastFailTime.toFixed(2)}ms)`);
  } else {
    logFail(`Fast-fail too slow: max ${maxFastFailTime}ms, avg ${avgFastFailTime.toFixed(2)}ms`);
  }

  return {
    testName: 'Fast-fail when circuit open',
    passed,
    details: `Avg: ${avgFastFailTime.toFixed(2)}ms, Max: ${maxFastFailTime}ms`,
    metrics: { avgFastFailTime, maxFastFailTime, samples: fastFailTimes.length },
  };
}

// ============================================================================
// Test 3: Circuit Auto-Recovers After Service Restoration
// ============================================================================

async function testCircuitRecovery(): Promise<TestResults> {
  logTest(3, 'Circuit auto-recovers after service restoration');

  const breaker = new CircuitBreaker({
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 1000,
    resetTimeout: 2000, // 2 second reset timeout
    name: 'test-recovery',
  });

  // Service that fails 3 times then succeeds
  const service = new FlakeyService(3);

  // Step 1: Open the circuit
  logInfo('Step 1: Opening circuit with 3 failures...');
  for (let i = 0; i < 3; i++) {
    try {
      await breaker.execute(() => service.call());
    } catch (err) {
      // Expected
    }
  }

  let state = breaker.getState();
  logInfo(`Circuit state after failures: ${state}`);

  if (state !== CircuitState.OPEN) {
    logFail(`Circuit should be OPEN, but is ${state}`);
    return {
      testName: 'Circuit auto-recovery',
      passed: false,
      details: `Circuit did not open (state: ${state})`,
    };
  }

  // Step 2: Wait for reset timeout
  logInfo('Step 2: Waiting for reset timeout (2s)...');
  logInfo('         (Service is now healthy - failures exhausted)');
  await new Promise(resolve => setTimeout(resolve, 2500));

  // Step 3: Make requests that should succeed (service is now working)
  logInfo('Step 3: Testing recovery with successful requests...');

  // First request should trigger HALF_OPEN and succeed
  let firstSuccess = false;
  try {
    await breaker.execute(() => service.call());
    firstSuccess = true;
    logInfo('First request after timeout: SUCCESS (transitioned to HALF_OPEN)');
  } catch (err) {
    logInfo(`First request after timeout: FAILED - ${err instanceof Error ? err.message : 'unknown'}`);
  }

  state = breaker.getState();
  logInfo(`Circuit state after first request: ${state}`);

  // Second successful request should close circuit (successThreshold = 2)
  let secondSuccess = false;
  try {
    await breaker.execute(() => service.call());
    secondSuccess = true;
    logInfo('Second successful request: SUCCESS');
  } catch (err) {
    logInfo(`Second request: FAILED - ${err instanceof Error ? err.message : 'unknown'}`);
  }

  state = breaker.getState();
  logInfo(`Circuit state after second request: ${state}`);

  const passed = state === CircuitState.CLOSED && firstSuccess && secondSuccess;

  if (passed) {
    logPass('Circuit successfully recovered to CLOSED state');
  } else {
    logFail(`Circuit should be CLOSED but is ${state} (first: ${firstSuccess}, second: ${secondSuccess})`);
  }

  return {
    testName: 'Circuit auto-recovery',
    passed,
    details: `Final state: ${state}, successes: ${firstSuccess && secondSuccess}`,
    metrics: breaker.getMetrics(),
  };
}

// ============================================================================
// Test 4: No Cascading Failures
// ============================================================================

async function testNoCascadingFailures(): Promise<TestResults> {
  logTest(4, 'Circuit prevents cascading failures');

  // Create multiple circuit breakers (simulating multiple services)
  const databaseBreaker = new CircuitBreaker({
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 1000,
    resetTimeout: 5000,
    name: 'database',
  });

  const cacheBreaker = new CircuitBreaker({
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 1000,
    resetTimeout: 5000,
    name: 'cache',
  });

  const databaseService = new FlakeyService(10); // Always fails
  const cacheService = new FlakeyService(0); // Always succeeds

  logInfo('Simulating database failure while cache is healthy...');

  let databaseFailures = 0;
  let cacheSuccesses = 0;
  let totalAttempts = 10;

  for (let i = 0; i < totalAttempts; i++) {
    // Try database (will fail and eventually open circuit)
    try {
      await databaseBreaker.execute(() => databaseService.call());
    } catch (err) {
      databaseFailures++;
    }

    // Try cache (should continue working)
    try {
      await cacheBreaker.execute(() => cacheService.call());
      cacheSuccesses++;
    } catch (err) {
      logInfo(`Cache request ${i + 1} failed unexpectedly!`);
    }
  }

  logInfo(`Database failures: ${databaseFailures}/${totalAttempts}`);
  logInfo(`Cache successes: ${cacheSuccesses}/${totalAttempts}`);
  logInfo(`Database circuit state: ${databaseBreaker.getState()}`);
  logInfo(`Cache circuit state: ${cacheBreaker.getState()}`);

  // Cache should remain healthy despite database failures
  const passed = cacheSuccesses === totalAttempts &&
                 databaseBreaker.getState() === CircuitState.OPEN &&
                 cacheBreaker.getState() === CircuitState.CLOSED;

  if (passed) {
    logPass('Cache remained healthy despite database failures (no cascading)');
  } else {
    logFail('Failure cascaded to healthy services');
  }

  return {
    testName: 'No cascading failures',
    passed,
    details: `Cache: ${cacheSuccesses}/${totalAttempts} successful, DB circuit: ${databaseBreaker.getState()}`,
    metrics: {
      databaseState: databaseBreaker.getState(),
      cacheState: cacheBreaker.getState(),
      cacheSuccessRate: (cacheSuccesses / totalAttempts) * 100,
    },
  };
}

// ============================================================================
// Test 5: Circuit Breaker Metrics
// ============================================================================

async function testCircuitBreakerMetrics(): Promise<TestResults> {
  logTest(5, 'Circuit breaker metrics accuracy');

  const breaker = new CircuitBreaker({
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 1000,
    resetTimeout: 5000,
    name: 'test-metrics',
  });

  const service = new FlakeyService(3); // Fails 3 times then succeeds

  let expectedSuccesses = 0;
  let expectedFailures = 0;
  let expectedRejections = 0;

  // Make 10 requests
  for (let i = 0; i < 10; i++) {
    try {
      await breaker.execute(() => service.call());
      expectedSuccesses++;
    } catch (err) {
      if (err instanceof CircuitBreakerOpenError) {
        expectedRejections++;
      } else {
        expectedFailures++;
      }
    }
  }

  const metrics = breaker.getMetrics();

  logInfo(`Expected - Successes: ${expectedSuccesses}, Failures: ${expectedFailures}, Rejections: ${expectedRejections}`);
  logInfo(`Actual   - Successes: ${metrics.totalSuccesses}, Failures: ${metrics.totalFailures}, Rejections: ${metrics.totalRejections}`);
  logInfo(`Total requests: ${metrics.totalRequests}`);
  logInfo(`Circuit state: ${metrics.state}`);

  const passed = metrics.totalSuccesses === expectedSuccesses &&
                 metrics.totalFailures === expectedFailures &&
                 metrics.totalRejections === expectedRejections &&
                 metrics.totalRequests === 10;

  if (passed) {
    logPass('All metrics accurate');
  } else {
    logFail('Metrics mismatch');
  }

  return {
    testName: 'Circuit breaker metrics',
    passed,
    details: `${metrics.totalRequests} requests, ${metrics.totalSuccesses} successes, ${metrics.totalFailures} failures`,
    metrics,
  };
}

// ============================================================================
// Main Test Runner
// ============================================================================

async function runAllTests() {
  log('\n' + '='.repeat(70), colors.blue);
  log('🧪 Circuit Breaker Load Test - Phase 3.4.3', colors.blue);
  log('='.repeat(70), colors.blue);

  const testFunctions = [
    testCircuitOpensAfterThreshold,
    testFastFailWhenOpen,
    testCircuitRecovery,
    testNoCascadingFailures,
    testCircuitBreakerMetrics,
  ];

  for (const testFn of testFunctions) {
    try {
      const result = await testFn();
      results.push(result);
    } catch (err) {
      log(`\n❌ Test crashed: ${err instanceof Error ? err.message : 'unknown'}`, colors.red);
      results.push({
        testName: testFn.name,
        passed: false,
        details: `Test crashed: ${err instanceof Error ? err.message : 'unknown'}`,
      });
    }
  }

  // Print summary
  log('\n' + '='.repeat(70), colors.blue);
  log('📊 Test Summary', colors.blue);
  log('='.repeat(70), colors.blue);

  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;

  results.forEach((result, index) => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    const color = result.passed ? colors.green : colors.red;
    log(`${index + 1}. ${result.testName}: ${status}`, color);
    log(`   ${result.details}`);
  });

  log(`\nTotal: ${passedTests}/${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%)`, colors.blue);

  if (passedTests === totalTests) {
    log('\n✅ ALL TESTS PASSED - Circuit breakers working correctly!', colors.green);
    process.exit(0);
  } else {
    log(`\n❌ ${totalTests - passedTests} TEST(S) FAILED`, colors.red);
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
