# MARCUS 3.0 Resilience Architecture

**Version:** 3.0
**Last Updated:** 2025-11-17
**Status:** Production-Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Circuit Breaker Pattern](#circuit-breaker-pattern)
3. [Retry Logic](#retry-logic)
4. [Dead Letter Queue](#dead-letter-queue)
5. [Database Connection Pooling](#database-connection-pooling)
6. [Graceful Shutdown](#graceful-shutdown)
7. [Chaos Engineering](#chaos-engineering)
8. [Monitoring & Metrics](#monitoring--metrics)
9. [Configuration](#configuration)
10. [Operations Guide](#operations-guide)

---

## Overview

The MARCUS 3.0 Citation Integrity Platform implements comprehensive resilience patterns to handle failures gracefully, recover automatically, and maintain service availability.

### Design Principles

1. **Fail Fast** - Detect failures quickly, don't let them cascade
2. **Degrade Gracefully** - Reduce functionality rather than complete failure
3. **Recover Automatically** - Self-healing without manual intervention
4. **Observe Everything** - Comprehensive metrics and logging
5. **Test Continuously** - Regular chaos engineering validates resilience

### Resilience Components

| Component | Purpose | Failure Mode |
|-----------|---------|--------------|
| **Circuit Breaker** | Prevent cascading failures | Fail fast when service unavailable |
| **Retry Logic** | Handle transient failures | Exponential backoff with jitter |
| **Dead Letter Queue** | Persist failed operations | Retry with backoff, eventual consistency |
| **Connection Pool** | Manage database resources | Queue requests, reject when exhausted |
| **Graceful Shutdown** | Clean termination | Drain requests, close connections |

---

## Circuit Breaker Pattern

### Purpose

Protects against cascading failures by detecting repeated failures and temporarily blocking requests to failing services.

### States

```
CLOSED (normal)
   ↓ (failures >= threshold)
OPEN (failing)
   ↓ (timeout expired)
HALF_OPEN (testing recovery)
   ↓ (successes >= threshold)
CLOSED (recovered)
```

### Configuration

```typescript
import { circuitBreakerManager } from '@/platform/resilience/circuitBreaker';

const dbBreaker = circuitBreakerManager.getBreaker({
  name: 'postgresql',
  failureThreshold: 5,      // Open after 5 failures
  timeout: 60000,           // Stay open for 60 seconds
  successThreshold: 3,      // Close after 3 successes in HALF_OPEN
  fallback: () => ({        // Optional fallback function
    success: false,
    error: 'Database unavailable'
  })
});
```

### Usage

```typescript
// Wrap risky operations in circuit breaker
const result = await dbBreaker.execute(async () => {
  return await db.query('SELECT * FROM agents');
});
```

### Metrics

- `circuit_breaker_requests_total{breaker, result}` - Total requests
- `circuit_breaker_state{breaker}` - Current state (0=CLOSED, 1=OPEN, 2=HALF_OPEN)
- `circuit_breaker_latency_ms{breaker}` - Request latency

### Best Practices

1. **One breaker per service** - Database, Redis, external APIs
2. **Tune thresholds** - Based on service SLO and error rates
3. **Provide fallbacks** - Graceful degradation when circuit is open
4. **Monitor state transitions** - Alert on OPEN state

---

## Retry Logic

### Purpose

Handles transient failures (network blips, temporary unavailability) by retrying with exponential backoff.

### Retry Conditions

**Retries on:**
- Network errors (ECONNREFUSED, ETIMEDOUT, ENOTFOUND)
- HTTP 5xx errors (500-599)
- Database connection errors (57P03, 53300, 08006)

**Does NOT retry on:**
- HTTP 4xx errors (client errors)
- Validation errors
- Unknown errors

### Configuration

```typescript
import { retryWithBackoff } from '@/platform/resilience/retryHandler';

const result = await retryWithBackoff(
  async () => db.query('SELECT 1'),
  {
    maxRetries: 3,        // Max 3 retry attempts
    baseDelay: 1000,      // Start with 1 second
    maxDelay: 30000,      // Cap at 30 seconds
    jitter: true,         // Add randomness (prevent thundering herd)
    onRetry: (attempt, delay, error) => {
      console.log(`Retry ${attempt} after ${delay}ms: ${error.message}`);
    }
  },
  'db-query' // Operation name for metrics
);
```

### Backoff Algorithm

```
delay = min(baseDelay * 2^attempt, maxDelay)

Example (baseDelay=1000, maxDelay=30000):
- Attempt 1: 1000ms   (1s)
- Attempt 2: 2000ms   (2s)
- Attempt 3: 4000ms   (4s)
- Attempt 4: 8000ms   (8s)
- Attempt 5: 16000ms  (16s)
- Attempt 6: 30000ms  (30s, capped)
```

With jitter, delay is multiplied by random factor between 0.5 and 1.5.

### Metrics

- `retry_attempts_total{operation, result}` - Total retry attempts
- `retry_latency_ms{operation}` - Total operation latency (including retries)

### Best Practices

1. **Combine with circuit breaker** - Retry when circuit is CLOSED, fail fast when OPEN
2. **Use jitter** - Prevents thundering herd when service recovers
3. **Set appropriate limits** - Don't retry indefinitely
4. **Custom retry conditions** - Different services have different failure modes

---

## Dead Letter Queue

### Purpose

Stores failed operations for retry with exponential backoff. Ensures eventual consistency and no data loss.

### Architecture

```
Request → Processing → Success ✓
              ↓ (failure)
        Dead Letter Queue
              ↓
        Background Worker
              ↓
        Retry with Backoff
              ↓
        Success ✓ or Permanent Failure ❌
```

### Configuration

```typescript
import { DeadLetterQueue } from '@/platform/resilience/deadLetterQueue';
import Redis from 'ioredis';

const redis = new Redis({ host: 'localhost', port: 6379 });

const dlq = new DeadLetterQueue({
  redis,
  queueName: 'citation-analysis-dlq',
  maxRetries: 5,
  retryDelays: [
    60 * 1000,          // 1 minute
    5 * 60 * 1000,      // 5 minutes
    30 * 60 * 1000,     // 30 minutes
    2 * 60 * 60 * 1000, // 2 hours
    6 * 60 * 60 * 1000  // 6 hours
  ],
  pollingInterval: 10000,  // Check every 10 seconds
  alertThreshold: 100      // Alert if depth > 100
});
```

### Usage

**Add to DLQ:**

```typescript
await dlq.add({
  operation: 'citation-analysis',
  payload: { documentId: 123, text: '...' },
  error: 'Agent timeout',
  retryCount: 0,
  maxRetries: 5,
  metadata: { userId: 'user-123' }
});
```

**Start Background Worker:**

```typescript
dlq.startWorker(async (payload) => {
  // Retry the operation
  await citationOrchestrator.analyzeDocument(payload);
});
```

**Manual Operations (Admin API):**

```bash
# View DLQ items
curl http://localhost:3000/api/admin/dlq

# Retry specific item
curl -X POST http://localhost:3000/api/admin/dlq/:id/retry

# Remove item
curl -X DELETE http://localhost:3000/api/admin/dlq/:id

# Get stats
curl http://localhost:3000/api/admin/dlq/stats
```

### Metrics

- `dlq_depth{queue}` - Number of items in DLQ
- `dlq_retries_total{queue, result}` - Retry attempts (success/failure)
- `dlq_permanent_failures_total{queue, operation}` - Permanent failures

### Best Practices

1. **Set appropriate retry delays** - Balance recovery speed vs. load
2. **Monitor DLQ depth** - Alert when > threshold
3. **Review permanent failures** - May indicate bugs or config issues
4. **Clear old items** - Prevent unbounded growth

---

## Database Connection Pooling

### Purpose

Manages PostgreSQL connections efficiently, preventing exhaustion and improving performance.

### Configuration

```typescript
import { createDatabasePool } from '@/platform/database/pool';

const pool = createDatabasePool({
  host: 'localhost',
  port: 5432,
  database: 'marcus',
  user: 'postgres',
  password: process.env.DB_PASSWORD,

  // Pool settings
  min: 10,                      // Minimum connections
  max: 50,                      // Maximum connections
  idleTimeoutMillis: 30000,     // Close idle connections after 30s
  connectionTimeoutMillis: 5000, // Fail if can't acquire in 5s

  // Monitoring
  healthCheckInterval: 30000,    // Health check every 30s
  slowQueryThreshold: 1000,      // Log queries > 1s
  poolExhaustionThreshold: 0.9   // Alert if utilization > 90%
});
```

### Usage

**Simple Query:**

```typescript
const result = await pool.query('SELECT * FROM agents WHERE id = $1', [agentId]);
```

**Transaction:**

```typescript
const result = await pool.transaction(async (client) => {
  await client.query('INSERT INTO agents (id, reputation) VALUES ($1, $2)', [id, 0.5]);
  await client.query('INSERT INTO agent_metrics (agent_id, metric, value) VALUES ($1, $2, $3)', [id, 'init', 1]);
  return { success: true };
});
```

**Health Check:**

```typescript
const healthy = await pool.healthCheck();
if (!healthy) {
  console.error('Database unhealthy!');
}
```

### Metrics

- `db_pool_connections{state}` - Connection counts (total, idle, active, waiting)
- `db_pool_utilization` - Pool utilization (0-1)
- `db_queries_total{result}` - Query counts (success/error)
- `db_query_latency_ms` - Query latency histogram

### Best Practices

1. **Size pool appropriately** - Based on concurrency and query patterns
2. **Monitor utilization** - Alert if consistently > 80%
3. **Index strategically** - Reduce query latency
4. **Use transactions** - For multi-step operations
5. **Close connections** - Call `pool.close()` on shutdown

---

## Graceful Shutdown

### Purpose

Ensures clean termination of the platform on SIGTERM/SIGINT, preventing data loss and incomplete requests.

### Shutdown Sequence

```
1. Stop accepting new requests (close HTTP server)
   ↓
2. Wait for in-flight requests (max 30s)
   ↓
3. Stop background workers (DLQ, metrics)
   ↓
4. Close database connections (drain pool)
   ↓
5. Disconnect Redis
   ↓
6. Terminate Python agents (SIGTERM → SIGKILL)
   ↓
7. Shutdown custom resources
   ↓
8. Exit cleanly (code 0)
```

### Configuration

```typescript
import { gracefulShutdown } from '@/platform/resilience/gracefulShutdown';

// Register resources
gracefulShutdown.registerHttpServer(httpServer);
gracefulShutdown.registerDatabasePool(dbPool);
gracefulShutdown.registerRedisClient(redisClient);
gracefulShutdown.registerPythonAgent(agentProcess);
gracefulShutdown.registerDLQWorker(dlq);

// Custom resource
gracefulShutdown.registerResource({
  name: 'custom-service',
  priority: 5,  // Lower priority shuts down first
  shutdown: async () => {
    await customService.close();
  }
});

// Shutdown is automatic on SIGTERM/SIGINT
// No manual invocation needed
```

### Health Check During Shutdown

```typescript
app.get('/health', (req, res) => {
  const status = gracefulShutdown.getHealthStatus();

  if (status.shutting_down) {
    res.status(503).json(status);
  } else {
    res.status(200).json(status);
  }
});
```

### Timeouts

| Phase | Timeout | Action on Timeout |
|-------|---------|-------------------|
| In-flight requests | 30s | Force close |
| Python agents | 10s | SIGKILL |
| Total shutdown | 60s | Force exit |

### Best Practices

1. **Register all resources** - Ensure nothing is orphaned
2. **Test shutdown** - Send SIGTERM in development
3. **Monitor shutdown time** - Should be < 10s normally
4. **Handle SIGKILL gracefully** - May happen in Kubernetes

---

## Chaos Engineering

### Purpose

Validates resilience by intentionally injecting failures and measuring recovery.

### Test Scenarios

| Scenario | Failure Injected | Expected Behavior |
|----------|------------------|-------------------|
| **Database Failures** | Random connection failures | Circuit breaker opens, retries work, system recovers |
| **Redis Failures** | Cache flushes, network delays | Degraded operation (DB fallback), cache repopulates |
| **Agent Crashes** | Kill random agents | Requests reroute, agents restart, no user-facing failures |
| **High Load** | 10x normal traffic | Rate limiting protects, no cascading failures |

### Running Chaos Tests

**All scenarios (1 minute each):**

```bash
./scripts/run-chaos-tests.sh
```

**Individual scenario:**

```bash
npx tsx src/platform/tests/chaos/db-failures.ts \
  --duration 60000 \
  --failure-interval 5000 \
  --failure-chance 0.3
```

### Chaos Test Schedule

- **Development:** On-demand
- **CI/CD:** Weekly (full suite, 1 hour)
- **Production:** Monthly (non-peak hours)

### Success Criteria

| Metric | Target |
|--------|--------|
| Availability during chaos | > 99% |
| Request success rate | > 95% |
| Recovery time | < 30 seconds |
| No cascading failures | 0 incidents |
| No data loss | 0 items |

---

## Monitoring & Metrics

### Prometheus Metrics

**Circuit Breaker:**
- `circuit_breaker_requests_total{breaker, result}`
- `circuit_breaker_state{breaker}`
- `circuit_breaker_latency_ms{breaker}`

**Retry Logic:**
- `retry_attempts_total{operation, result}`
- `retry_latency_ms{operation}`

**Dead Letter Queue:**
- `dlq_depth{queue}`
- `dlq_retries_total{queue, result}`
- `dlq_permanent_failures_total{queue, operation}`

**Database Pool:**
- `db_pool_connections{state}`
- `db_pool_utilization`
- `db_queries_total{result}`
- `db_query_latency_ms`

### Grafana Dashboards

**Resilience Overview:**
- Circuit breaker states (all services)
- DLQ depth over time
- Database pool utilization
- Retry rates and latencies

**Chaos Test Results:**
- Availability during chaos
- Recovery times
- Error rates
- Resource usage

### Alerts

| Alert | Condition | Severity |
|-------|-----------|----------|
| Circuit Breaker Open | State = OPEN for > 5 min | CRITICAL |
| DLQ Depth High | Depth > 100 | HIGH |
| Pool Exhaustion | Utilization > 90% for > 2 min | HIGH |
| Permanent Failures | Rate > 10/min | MEDIUM |
| Slow Queries | P95 > 2s | MEDIUM |

---

## Configuration

### Environment Variables

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=marcus
DB_USER=postgres
DB_PASSWORD=<secret>
DB_POOL_MIN=10
DB_POOL_MAX=50

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# Resilience
CIRCUIT_BREAKER_FAILURE_THRESHOLD=5
CIRCUIT_BREAKER_TIMEOUT=60000
RETRY_MAX_ATTEMPTS=3
RETRY_BASE_DELAY=1000
DLQ_MAX_RETRIES=5
DLQ_POLLING_INTERVAL=10000
```

### Production Tuning

**High-Traffic Scenario:**
- Increase `DB_POOL_MAX` to 100
- Reduce `DLQ_POLLING_INTERVAL` to 5000
- Increase `CIRCUIT_BREAKER_TIMEOUT` to 120000

**Low-Latency Scenario:**
- Reduce `RETRY_BASE_DELAY` to 500
- Increase `DB_POOL_MIN` to 20
- Use local Redis instance

---

## Operations Guide

### Common Operations

**View DLQ Items:**

```bash
curl http://localhost:3000/api/admin/dlq | jq
```

**Manually Retry DLQ Item:**

```bash
curl -X POST http://localhost:3000/api/admin/dlq/<item-id>/retry
```

**Reset Circuit Breaker:**

```typescript
import { circuitBreakerManager } from '@/platform/resilience/circuitBreaker';

const breaker = circuitBreakerManager.getBreaker({ name: 'postgresql' });
breaker.reset();
```

**Check Database Pool Health:**

```typescript
const metrics = pool.getMetrics();
console.log(`Pool: ${metrics.activeConnections}/${metrics.totalConnections} (${Math.round(metrics.utilization * 100)}%)`);
```

### Troubleshooting

**Circuit breaker stuck OPEN:**

1. Check service health: `curl http://service/health`
2. Review error logs
3. Manually reset if needed: `breaker.reset()`
4. Investigate root cause

**DLQ growing unbounded:**

1. Check DLQ stats: `GET /api/admin/dlq/stats`
2. Review permanent failures
3. Check for configuration issues
4. Increase worker capacity or retry delays

**Pool exhausted:**

1. Check pool metrics: `pool.getMetrics()`
2. Look for connection leaks (unreleased clients)
3. Increase pool size if legitimate load
4. Review slow queries (may be holding connections)

---

## References

- [Circuit Breaker Pattern - Martin Fowler](https://martinfowler.com/bliki/CircuitBreaker.html)
- [Exponential Backoff And Jitter - AWS Architecture Blog](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/)
- [Principles of Chaos Engineering](https://principlesofchaos.org/)
- [PostgreSQL Connection Pooling](https://node-postgres.com/features/pooling)

---

*MARCUS 3.0 Resilience Architecture - Production-Ready Platform Engineering*
