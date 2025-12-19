# Resilience Framework

Production-ready resilience patterns for the MARCUS 3.0 Citation Integrity Platform.

## Quick Start

```typescript
import { circuitBreakerManager } from './circuitBreaker';
import { retryWithBackoff } from './retryHandler';
import { DeadLetterQueue } from './deadLetterQueue';
import { createDatabasePool } from '../database/pool';
import { gracefulShutdown } from './gracefulShutdown';

// 1. Create circuit breakers for each service
const dbBreaker = circuitBreakerManager.getBreaker({
  name: 'postgresql',
  failureThreshold: 5,
  timeout: 60000,
  successThreshold: 3
});

// 2. Set up database pool
const dbPool = createDatabasePool({
  host: 'localhost',
  port: 5432,
  database: 'marcus',
  min: 10,
  max: 50
});

// 3. Create Dead Letter Queue
const dlq = new DeadLetterQueue({
  redis: redisClient,
  queueName: 'citation-analysis',
  maxRetries: 5
});

// 4. Register resources for graceful shutdown
gracefulShutdown.registerDatabasePool(dbPool);
gracefulShutdown.registerRedisClient(redisClient);
gracefulShutdown.registerDLQWorker(dlq);

// 5. Make resilient requests
async function analyzeCitation(doc: Document) {
  try {
    return await dbBreaker.execute(async () => {
      return await retryWithBackoff(
        async () => {
          return await citationService.analyze(doc);
        },
        { maxRetries: 3, baseDelay: 1000 },
        'citation-analysis'
      );
    });
  } catch (error) {
    // Add to DLQ for later retry
    await dlq.add({
      operation: 'citation-analysis',
      payload: doc,
      error: error.message,
      retryCount: 0,
      maxRetries: 5
    });

    throw error;
  }
}
```

## Components

### Circuit Breaker (`circuitBreaker.ts`)

Prevents cascading failures by failing fast when a service is unavailable.

**States:** CLOSED → OPEN → HALF_OPEN → CLOSED

**Usage:**
```typescript
const breaker = circuitBreakerManager.getBreaker({
  name: 'service-name',
  failureThreshold: 5,    // Open after 5 failures
  timeout: 60000,         // Stay open for 60s
  successThreshold: 3     // Close after 3 successes
});

const result = await breaker.execute(async () => {
  return await riskyOperation();
});
```

### Retry Handler (`retryHandler.ts`)

Retries transient failures with exponential backoff and jitter.

**Usage:**
```typescript
const result = await retryWithBackoff(
  async () => await operation(),
  {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    jitter: true
  },
  'operation-name'
);
```

### Dead Letter Queue (`deadLetterQueue.ts`)

Stores failed operations for retry with exponential backoff.

**Usage:**
```typescript
const dlq = new DeadLetterQueue({
  redis: redisClient,
  queueName: 'my-queue',
  maxRetries: 5
});

// Add failed operation
await dlq.add({
  operation: 'process-document',
  payload: { id: 123 },
  error: 'Timeout',
  retryCount: 0,
  maxRetries: 5
});

// Start background worker
dlq.startWorker(async (payload) => {
  await processDocument(payload);
});
```

### Database Pool (`../database/pool.ts`)

Manages PostgreSQL connections with health checks and monitoring.

**Usage:**
```typescript
const pool = createDatabasePool({
  host: 'localhost',
  port: 5432,
  database: 'marcus',
  min: 10,
  max: 50
});

// Simple query
const result = await pool.query('SELECT * FROM agents');

// Transaction
await pool.transaction(async (client) => {
  await client.query('INSERT INTO ...');
  await client.query('UPDATE ...');
});
```

### Graceful Shutdown (`gracefulShutdown.ts`)

Ensures clean termination on SIGTERM/SIGINT.

**Usage:**
```typescript
import { gracefulShutdown } from './gracefulShutdown';

// Register resources (happens once at startup)
gracefulShutdown.registerHttpServer(httpServer);
gracefulShutdown.registerDatabasePool(dbPool);
gracefulShutdown.registerRedisClient(redisClient);

// Shutdown happens automatically on SIGTERM/SIGINT
```

## Chaos Engineering

Test resilience with chaos scenarios:

```bash
# Run all scenarios
./scripts/run-chaos-tests.sh

# Individual scenarios
npx tsx src/platform/tests/chaos/db-failures.ts
npx tsx src/platform/tests/chaos/redis-failures.ts
npx tsx src/platform/tests/chaos/agent-crashes.ts
npx tsx src/platform/tests/chaos/high-load.ts
```

## Monitoring

All components emit Prometheus metrics:

- `circuit_breaker_state{breaker}` - Circuit breaker state
- `retry_attempts_total{operation, result}` - Retry attempts
- `dlq_depth{queue}` - Dead letter queue depth
- `db_pool_connections{state}` - Database pool connections
- `db_pool_utilization` - Pool utilization

Access metrics at: `http://localhost:3000/metrics`

## Architecture

```
┌─────────────────────────────────────────┐
│         Application Layer                │
│  ┌───────────────────────────────────┐  │
│  │   Circuit Breaker (fail fast)     │  │
│  └───────────┬───────────────────────┘  │
│              │                           │
│  ┌───────────▼───────────────────────┐  │
│  │   Retry Handler (exponential)     │  │
│  └───────────┬───────────────────────┘  │
│              │                           │
│              ├─────────────────────────┐ │
│              │                         │ │
│    ┌─────────▼──────┐    ┌────────────▼─┴┐
│    │  Service Call  │    │ Dead Letter   │
│    │   (success)    │    │ Queue (DLQ)   │
│    └────────────────┘    └────────────────┘
│                                            │
└────────────────────────────────────────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
┌───▼────┐  ┌───▼──────┐  ┌─▼──────┐
│Database│  │  Redis   │  │ Agents │
│  Pool  │  │  Cache   │  │Python  │
└────────┘  └──────────┘  └────────┘
```

## Best Practices

1. **Combine patterns** - Use circuit breaker + retry + DLQ together
2. **Set appropriate thresholds** - Based on service SLOs
3. **Monitor everything** - Circuit breaker states, DLQ depth, pool utilization
4. **Test with chaos** - Regular chaos engineering validates resilience
5. **Fail fast** - Don't let failures cascade
6. **Degrade gracefully** - Reduce functionality, don't crash
7. **Recover automatically** - Self-healing without manual intervention

## Documentation

- [Complete Architecture Guide](../../../docs/RESILIENCE_ARCHITECTURE.md)
- [Chaos Engineering Guide](../tests/chaos/README.md)
- [Operations Runbook](../../../docs/OPERATIONS.md)

---

*MARCUS 3.0 Resilience Framework - Production-Ready Platform Engineering*
