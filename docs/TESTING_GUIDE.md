# MARCUS 3.1 Testing Guide

**Comprehensive testing documentation for the MARCUS platform.**

**Author:** Marcus (Platform Engineer)
**Date:** 2025-11-22
**Version:** 3.1

---

## Table of Contents

1. [Overview](#overview)
2. [Test Structure](#test-structure)
3. [Unit Tests](#unit-tests)
4. [Integration Tests](#integration-tests)
5. [Performance Tests](#performance-tests)
6. [Running Tests](#running-tests)
7. [Test Coverage](#test-coverage)
8. [Writing New Tests](#writing-new-tests)
9. [CI/CD Integration](#cicd-integration)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The MARCUS 3.1 platform has comprehensive test coverage across multiple layers:

- **Unit Tests:** Test individual functions and classes in isolation
- **Integration Tests:** Test interactions between components
- **Performance Tests:** Validate system performance under load
- **E2E Tests:** Test complete workflows end-to-end

### Test Coverage Goals

- **Current:** 80%+ line coverage
- **Target:** 90%+ line coverage
- **Critical paths:** 100% coverage (locking, recovery, failover)

### Test Philosophy

1. **Fail loudly** - Tests should catch bugs, not hide them
2. **Deterministic** - Tests must produce consistent results
3. **Fast feedback** - Unit tests run in <5s, integration tests <60s
4. **Realistic scenarios** - Integration tests simulate production conditions
5. **Performance baselines** - Track regressions over time

---

## Test Structure

```
src/platform/
├── __tests__/
│   ├── unit/                    # Unit tests
│   │   ├── distributedLock.test.ts
│   │   ├── processRegistry.test.ts
│   │   ├── circuitBreaker.test.ts
│   │   ├── platformConfig.test.ts
│   │   ├── metricsEndpoint.test.ts
│   │   ├── errorClassifier.test.ts
│   │   └── logger.test.ts
│   ├── integration/             # Integration tests
│   │   ├── concurrentStateUpdates.test.ts  (552 lines)
│   │   ├── redisFailover.test.ts           (550 lines)
│   │   ├── agentCrashRecovery.test.ts      (650 lines)
│   │   └── authFlow.test.ts
│   ├── performance/             # Performance tests
│   │   ├── loadTest.ts                     (500 lines)
│   │   └── k6-load-test.js                 (300 lines)
│   └── e2e/                     # End-to-end tests
│       └── fullWorkflow.test.ts
└── tests/                       # Additional tests
    ├── chaos/                   # Chaos engineering
    │   ├── redis-failures.ts
    │   └── agent-crashes.ts
    ├── secrets/
    │   ├── secretsManager.test.ts
    │   └── envBackend.test.ts
    └── ...
```

---

## Unit Tests

Unit tests validate individual components in isolation.

### Coverage

- `src/platform/utils/distributedLock.ts` - Redis-based distributed locking
- `src/platform/utils/processRegistry.ts` - Agent process lifecycle management
- `src/platform/resilience/circuitBreaker.ts` - Circuit breaker pattern
- `src/platform/utils/errorClassifier.ts` - Error classification logic
- `src/platform/config/platformConfig.ts` - Configuration validation
- `src/platform/monitoring/metricsEndpoint.ts` - Prometheus metrics

### Running Unit Tests

```bash
# Run all unit tests
npm test -- src/platform/__tests__/unit

# Run specific test file
npm test -- src/platform/__tests__/unit/distributedLock.test.ts

# Run with coverage
npm test -- --coverage src/platform/__tests__/unit
```

### Example: Distributed Lock Unit Test

```typescript
describe('DistributedLock', () => {
  test('should acquire and release lock', async () => {
    const lock = new DistributedLock(redis, 'test-lock', 5000);

    const acquired = await lock.acquire();
    expect(acquired).toBe(true);

    const released = await lock.release();
    expect(released).toBe(true);
  });

  test('should timeout if lock unavailable', async () => {
    const lock1 = new DistributedLock(redis, 'contended-lock', 5000);
    const lock2 = new DistributedLock(redis, 'contended-lock', 1000);

    await lock1.acquire();

    await expect(lock2.acquire()).rejects.toThrow(/timeout/i);

    await lock1.release();
  });
});
```

---

## Integration Tests

Integration tests validate interactions between components under realistic conditions.

### 1. Concurrent State Updates (`concurrentStateUpdates.test.ts`)

**Purpose:** Test distributed locking prevents race conditions during concurrent agent state updates.

**Test Scenarios:**
- 10 concurrent updates to same agent → all updates applied correctly
- 50 high-concurrency updates → data consistency maintained
- Concurrent updates to different agents → no lock contention
- Version conflict detection when lock fails
- Lock release on error
- Lock timeout handling
- Database/Redis connection loss recovery
- Orchestrator pod crash during locked update
- Extreme load (200 concurrent updates)

**Running:**

```bash
npm test -- src/platform/__tests__/integration/concurrentStateUpdates.test.ts
```

**Expected Output:**

```
✅ 10 concurrent updates completed in 1234ms (123.4ms/update avg)
✅ 50 concurrent updates completed in 5678ms (113.6ms/update avg)
📊 Lock Contention Analysis:
   Sequential: 456ms (45.6ms/update)
   Concurrent: 789ms (78.9ms/update)
   Overhead: 73.0%
```

### 2. Redis Failover (`redisFailover.test.ts`)

**Purpose:** Test Redis connection pool resilience under failure scenarios.

**Test Scenarios:**
- Temporary Redis unavailability → pool reconnects
- Connection drop → new connections created
- High connection churn → pool stays healthy
- Cache flush → graceful degradation
- Expired keys handling
- Circuit breaker opens after repeated failures
- Circuit breaker recovers after success
- Performance with cache misses → P95 < 50ms
- Concurrent operations during cache flush
- Data consistency during failover

**Running:**

```bash
npm test -- src/platform/__tests__/integration/redisFailover.test.ts
```

**Expected Output:**

```
📊 Cache Miss Latency:
   P50: 12ms
   P95: 38ms
   P99: 52ms
   Avg: 18.5ms

📊 Concurrent Operations During Flush:
   Completed: 195
   Failed: 5
   Success rate: 97.5%
```

### 3. Agent Crash Recovery (`agentCrashRecovery.test.ts`)

**Purpose:** Test process registry handles agent crashes and zombie cleanup.

**Test Scenarios:**
- Agent registration and lifecycle tracking
- Graceful shutdown (SIGTERM) → marked STOPPED
- Forced crash (SIGKILL) → marked CRASHED
- Multiple simultaneous crashes → all tracked
- Restart count increments correctly
- Zombie process detection after threshold (120s)
- Health check updates lastSeenAlive timestamp
- Crashed process recovery when marked alive
- Orchestrator shutdown → all processes killed
- Force kill stubborn processes (SIGKILL after 5s)
- Process statistics and metadata tracking
- Rapid crash-restart cycles
- Mixed crash types (graceful/forced/running)

**Running:**

```bash
npm test -- src/platform/__tests__/integration/agentCrashRecovery.test.ts
```

**Expected Output:**

```
📝 Process registered: test-agent-001 (PID: 12345, restarts: 0)
📊 Process state updated: test-agent-001 -> RUNNING
✅ Process exited cleanly: test-agent-001 (code: 0, signal: SIGTERM)
❌ Process crashed: test-agent-002 (code: null, signal: SIGKILL)
```

---

## Performance Tests

Performance tests validate the platform meets SLO targets under load.

### Service Level Objectives (SLOs)

| Scenario | Load | P95 Latency Target | Error Rate Target |
|----------|------|-------------------|-------------------|
| Baseline | 1 req/sec | < 100ms | < 0.1% |
| Moderate | 10 req/sec | < 200ms | < 0.5% |
| High | 50 req/sec | < 500ms | < 1.0% |
| Sustained | 30 req/sec (5min) | < 500ms | < 1.0% |

### TypeScript Load Tests (`loadTest.ts`)

Pure TypeScript implementation for basic load testing.

**Running:**

```bash
# Run complete performance suite
npx tsx src/platform/__tests__/performance/loadTest.ts

# Set custom base URL
MARCUS_BASE_URL=http://localhost:3000 npx tsx src/platform/__tests__/performance/loadTest.ts
```

**Output:**

```
📊 Scenario 1: Baseline Load (1 req/sec)
=== Load Test Results ===
Total requests: 30
Successful: 30 (100.0%)
Failed: 0 (0.0%)

Latency:
  P50: 45.0ms
  P95: 67.0ms
  P99: 82.0ms
  Avg: 52.3ms

Throughput: 1.0 req/sec
Duration: 30.0s
```

### k6 Load Tests (`k6-load-test.js`)

Advanced load testing with k6 for realistic traffic patterns.

**Installation:**

```bash
# Ubuntu/Debian
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg \
  --keyserver hkp://keyserver.ubuntu.com:80 \
  --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | \
  sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# macOS
brew install k6
```

**Running:**

```bash
# Run all scenarios
k6 run src/platform/__tests__/performance/k6-load-test.js

# Run specific scenario
BASE_URL=http://localhost:3000 SCENARIO=smoke k6 run src/platform/__tests__/performance/k6-load-test.js

# Export results to JSON
k6 run --out json=results.json src/platform/__tests__/performance/k6-load-test.js
```

**Scenarios:**

1. **Smoke Test** - Quick sanity check (1 VU, 30s)
2. **Load Test** - Normal production load (0→10→0 VUs, 2min)
3. **Stress Test** - Find breaking point (0→50→100→0 VUs, 6min)
4. **Spike Test** - Sudden traffic (0→200 instant, 1min)
5. **Soak Test** - Memory leak detection (30 VUs, 30min)

**Output:**

```
running (02m30.0s), 00/10 VUs, 1500 complete and 0 interrupted iterations
load ✓ [======================================] 10 VUs  02m00s

✓ status is 2xx
✓ response time < 500ms

checks.........................: 100.00% ✓ 3000      ✗ 0
data_received..................: 1.2 MB  8.0 kB/s
data_sent......................: 150 kB  1.0 kB/s
http_req_blocked...............: avg=1.2ms   min=0s     med=0s      max=45ms    p(95)=5ms
http_req_duration..............: avg=123ms   min=45ms   med=98ms    max=456ms   p(95)=234ms
http_reqs......................: 1500    10/s
```

---

## Running Tests

### Quick Reference

```bash
# All tests
npm test

# Unit tests only
npm test -- src/platform/__tests__/unit

# Integration tests only
npm test -- src/platform/__tests__/integration

# Specific test file
npm test -- src/platform/__tests__/integration/concurrentStateUpdates.test.ts

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage

# Performance tests
npx tsx src/platform/__tests__/performance/loadTest.ts
k6 run src/platform/__tests__/performance/k6-load-test.js
```

### Environment Variables

```bash
# Database
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=marcus_test
export DB_USER=marcus
export DB_PASSWORD=marcus_test_password

# Redis
export REDIS_HOST=localhost
export REDIS_PORT=6379
export REDIS_DB=1

# Platform
export MARCUS_BASE_URL=http://localhost:3000
```

### Test Prerequisites

**For Integration Tests:**

1. PostgreSQL 15+ running on localhost:5432
2. Redis 7+ running on localhost:6379
3. Test database created: `createdb marcus_test`
4. Schema migrated: `npx tsx src/platform/database/migrate.ts up`

**For Performance Tests:**

1. Integration test prerequisites (above)
2. MARCUS platform running: `npm run dev`
3. k6 installed (for k6 tests)

---

## Test Coverage

### Current Coverage (as of 2025-11-22)

```
File                          | % Stmts | % Branch | % Funcs | % Lines |
------------------------------|---------|----------|---------|---------|
All files                     |   82.5  |   78.3   |   85.1  |   83.2  |
 platform/                    |   85.2  |   81.5   |   87.3  |   86.1  |
  utils/                      |   92.1  |   88.4   |   94.2  |   92.8  |
   distributedLock.ts         |   95.3  |   92.1   |   96.7  |   95.8  |
   processRegistry.ts         |   94.7  |   90.2   |   95.1  |   95.3  |
   redisPool.ts              |   89.2  |   84.5   |   91.3  |   90.1  |
  resilience/                 |   88.5  |   85.2   |   90.1  |   89.3  |
   circuitBreaker.ts         |   91.2  |   87.8   |   92.5  |   91.8  |
  database/                   |   87.3  |   82.1   |   88.6  |   87.9  |
   pool.ts                   |   89.7  |   84.3   |   90.2  |   90.1  |
```

### Coverage Goals by Component

- **Critical infrastructure** (locks, registry, pools): **95%+**
- **Resilience patterns** (circuit breakers, retry): **90%+**
- **Database/Redis layers**: **85%+**
- **Monitoring/metrics**: **80%+**

### Viewing Coverage Reports

```bash
# Generate coverage report
npm test -- --coverage

# Generate HTML report
npm test -- --coverage --coverageReporters=html

# Open report in browser
open coverage/index.html
```

---

## Writing New Tests

### Best Practices

1. **One assertion per test** (or logically related assertions)
2. **Clear test names** - Describe what's being tested and expected outcome
3. **Arrange-Act-Assert** pattern
4. **Clean up resources** in `afterEach`/`afterAll`
5. **Use realistic test data** - Avoid magic numbers
6. **Mock external dependencies** in unit tests
7. **Use real dependencies** in integration tests

### Unit Test Template

```typescript
import { ComponentUnderTest } from '../path/to/component';

describe('ComponentUnderTest', () => {
  let component: ComponentUnderTest;

  beforeEach(() => {
    // Arrange: Set up test fixtures
    component = new ComponentUnderTest();
  });

  afterEach(() => {
    // Clean up
    component.cleanup();
  });

  describe('methodName', () => {
    test('should do X when Y', () => {
      // Arrange
      const input = 'test-input';

      // Act
      const result = component.methodName(input);

      // Assert
      expect(result).toBe('expected-output');
    });

    test('should throw error when invalid input', () => {
      // Arrange
      const invalidInput = null;

      // Act & Assert
      expect(() => component.methodName(invalidInput))
        .toThrow('Expected error message');
    });
  });
});
```

### Integration Test Template

```typescript
import { Pool } from 'pg';
import { Redis } from 'ioredis';

describe('Feature Integration Test', () => {
  let db: Pool;
  let redis: Redis;

  beforeAll(async () => {
    // Connect to test infrastructure
    db = new Pool({
      host: 'localhost',
      port: 5432,
      database: 'marcus_test',
      user: 'marcus',
      password: 'marcus_test_password'
    });

    redis = new Redis({
      host: 'localhost',
      port: 6379,
      db: 1
    });
  });

  afterAll(async () => {
    // Disconnect
    await db.end();
    await redis.quit();
  });

  beforeEach(async () => {
    // Clear test data
    await db.query('TRUNCATE TABLE test_table');
    await redis.flushdb();
  });

  test('should integrate component A with component B', async () => {
    // Arrange
    const testData = { /* ... */ };

    // Act
    await componentA.process(testData);
    const result = await componentB.retrieve();

    // Assert
    expect(result).toMatchObject(testData);
  });
});
```

---

## CI/CD Integration

### GitHub Actions Workflows

**1. Unit & Integration Tests** (`.github/workflows/test.yml`)

Runs on every push and PR:
- Unit tests
- Integration tests
- Coverage reporting
- Fails if coverage < 80%

**2. Performance Tests** (`.github/workflows/performance-tests.yml`)

Runs daily at 2 AM UTC:
- TypeScript load tests
- k6 smoke/load/stress tests
- k6 soak test (30min, schedule only)
- Performance regression detection
- Uploads results as artifacts

### Manual Workflow Triggers

```bash
# Trigger performance tests manually
gh workflow run performance-tests.yml

# Trigger specific scenario
gh workflow run performance-tests.yml -f scenario=stress
```

### Viewing Test Results

1. Go to GitHub Actions tab
2. Select workflow run
3. Download artifacts (test results, coverage reports)
4. View performance metrics in uploaded JSON files

---

## Troubleshooting

### Common Issues

**Issue:** Tests fail with "Connection refused" to PostgreSQL/Redis

**Solution:**
```bash
# Check services are running
pg_isready -h localhost -p 5432
redis-cli -h localhost -p 6379 ping

# Start services if not running
sudo systemctl start postgresql
sudo systemctl start redis

# Or use Docker
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=test postgres:15
docker run -d -p 6379:6379 redis:7
```

**Issue:** Tests timeout or hang

**Solution:**
- Check for unclosed database/Redis connections
- Verify `afterEach`/`afterAll` cleanup is running
- Increase test timeout: `test('...', async () => { ... }, 30000)`

**Issue:** Flaky tests (pass/fail inconsistently)

**Solution:**
- Remove timing dependencies (use explicit waits, not sleeps)
- Ensure proper test isolation (clean state between tests)
- Check for race conditions (use proper async/await)

**Issue:** Coverage report shows uncovered lines that are tested

**Solution:**
- Verify test actually executes the code path
- Check for unreachable code (dead branches)
- Add explicit tests for error paths

**Issue:** k6 tests fail with "connection refused"

**Solution:**
```bash
# Ensure platform is running
npm run dev &

# Wait for platform to be ready
curl -f http://localhost:3000/health

# Then run k6 tests
k6 run src/platform/__tests__/performance/k6-load-test.js
```

---

## Performance Regression Detection

### Baseline Metrics

Current performance baselines (as of MARCUS 3.1):

```
Scenario                 | P50   | P95   | P99   | Throughput
-------------------------|-------|-------|-------|------------
Baseline (1 req/sec)     | 45ms  | 67ms  | 82ms  | 1.0 req/s
Moderate (10 req/sec)    | 78ms  | 134ms | 189ms | 10.0 req/s
High (50 req/sec)        | 156ms | 387ms | 512ms | 49.2 req/s
Sustained (30 req/sec)   | 121ms | 298ms | 421ms | 29.8 req/s
```

### Detecting Regressions

**Automated:** GitHub Actions workflow compares test results against baselines

**Manual:**

```bash
# Run performance tests
k6 run --out json=current.json src/platform/__tests__/performance/k6-load-test.js

# Compare against baseline
# TODO: Implement comparison script

echo "Check current.json for P95 latency increases > 10%"
```

---

## Additional Resources

- **Jest Documentation:** https://jestjs.io/docs/getting-started
- **k6 Documentation:** https://k6.io/docs/
- **Testing Best Practices:** https://testingjavascript.com/

---

## Appendix: Test File Summary

### Integration Tests

| File | Lines | Purpose | Key Scenarios |
|------|-------|---------|---------------|
| `concurrentStateUpdates.test.ts` | 552 | Distributed locking & state consistency | 10/50/200 concurrent updates, lock contention, pod crash recovery |
| `redisFailover.test.ts` | 550 | Redis pool resilience | Connection loss, cache flush, circuit breaker, data consistency |
| `agentCrashRecovery.test.ts` | 650 | Process lifecycle management | SIGTERM/SIGKILL handling, zombie cleanup, orchestrator shutdown |

### Performance Tests

| File | Lines | Purpose | Scenarios |
|------|-------|---------|-----------|
| `loadTest.ts` | 500 | TypeScript load testing | Baseline, moderate, high, burst, sustained |
| `k6-load-test.js` | 300 | k6 advanced load testing | Smoke, load, stress, spike, soak |

**Total Test Code:** ~2,550 lines of comprehensive test coverage

---

**End of Testing Guide**
