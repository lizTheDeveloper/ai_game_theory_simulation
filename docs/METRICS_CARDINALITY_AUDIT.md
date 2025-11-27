# MARCUS 3.1: Prometheus Metrics Cardinality Audit

**Date:** 2025-11-22
**Author:** Marcus (Platform Engineer)
**Priority:** LOW (L1)
**Effort:** 4 hours

## Executive Summary

Cardinality explosion in metrics can cause:
- Prometheus storage exhaustion
- Query performance degradation
- Memory pressure on monitoring infrastructure
- Scraape timeouts

**Current Status:** MEDIUM RISK
- Several metrics have unbounded label values
- Estimated worst-case cardinality: ~5,000-10,000 time series
- Target: <1,000 time series per metric

## Cardinality Analysis

### Critical Issues (UNBOUNDED)

#### 1. `agent_id` Labels

**Affected Metrics:**
- `marcus_agent_status{agent_id}`
- `marcus_agent_request_duration_seconds{agent_id, method}`
- `marcus_citation_analysis_total{agent_id, result}`
- `marcus_citation_analysis_duration_seconds{agent_id}`
- `marcus_agent_process_restarts_total{agent_id}`

**Problem:**
- Agent IDs are dynamic: `agent_001`, `agent_002`, ... `agent_NNN`
- If we scale to 100 agents: 100 time series per metric
- If agents restart and get new IDs: unbounded growth

**Impact:**
- `agent_id` appears in 5 metrics
- 100 agents × 5 metrics = 500 base time series
- With `method` dimension (3-5 methods): 1,500-2,500 time series
- **Acceptable** if agent count is bounded

**Fix:**
- ✅ Agent IDs are currently bounded (configured at startup)
- ✅ Agent registry prevents ID reuse
- ⚠️ Add validation: reject agent_id values that don't match pattern `agent_\d{3}`
- ⚠️ Add metric: `marcus_agent_count_total` (single gauge, no labels)

**Risk Level:** MEDIUM (bounded by config, but needs validation)

---

#### 2. `route` Label in HTTP Metrics

**Affected Metrics:**
- `marcus_http_request_duration_seconds{method, route, status_code}`
- `marcus_http_requests_total{method, route, status_code}`

**Problem:**
- Routes are normalized by `normalizeRoutePath()` function
- BUT: 404 errors will have unbounded route values (any invalid URL)
- Example: `/api/citations/malicious-probe-12345` → `/api/citations/:id` (good)
- Example: `/random/invalid/path/12345` → `/random/invalid/path/12345` (BAD)

**Impact:**
- Attackers can generate unlimited unique 404 URLs
- Each unique route creates new time series
- Potential: UNBOUNDED

**Fix:**
- ✅ Use catch-all bucket for unmatched routes: `route="other"`
- ✅ Limit normalized routes to known set (whitelist)
- ✅ Add `route="unknown"` for 404s

**Risk Level:** HIGH (currently unbounded for 404s)

---

#### 3. `command` Label in Redis Metrics

**Affected Metrics:**
- `marcus_redis_command_duration_seconds{command}`
- `marcus_redis_commands_duration{command}` (duplicate!)

**Problem:**
- Redis supports 200+ commands
- Current implementation: `command: 'generic'` (good!)
- BUT: redisCommandDuration allows arbitrary commands

**Impact:**
- If we track all Redis commands: 200 time series
- **Acceptable** if we limit to common commands

**Fix:**
- ✅ Current: uses `command: 'generic'` (safe)
- ⚠️ If command-specific tracking needed: whitelist common commands
  - `get`, `set`, `setex`, `expire`, `del`, `exists`, `ping`
  - Use `other` bucket for everything else

**Risk Level:** LOW (currently using 'generic')

---

#### 4. `error_type` Label

**Affected Metrics:**
- `marcus_errors_total{error_type, component, severity}`
- `marcus_redis_connection_errors_total{error_type}`

**Problem:**
- Error types are dynamic based on exceptions
- Example: `TypeError: Cannot read property 'x' of undefined`
- If we use exception messages as error_type: UNBOUNDED

**Impact:**
- Potential for unbounded growth if error messages are used
- Need to classify errors into fixed types

**Fix:**
- ✅ Define error type taxonomy (max 20 types):
  - `connection_error`
  - `timeout_error`
  - `validation_error`
  - `authentication_error`
  - `authorization_error`
  - `database_error`
  - `redis_error`
  - `agent_error`
  - `circuit_breaker_error`
  - `rate_limit_error`
  - `unknown_error` (catch-all)
- ✅ Map exceptions to types in error handling middleware

**Risk Level:** MEDIUM (depends on implementation)

---

#### 5. `queue_name` Label

**Affected Metrics:**
- `marcus_queue_depth{queue_name}`
- `marcus_queue_processing_lag_seconds{queue_name}`
- `marcus_queue_throughput_items_per_second{queue_name}`
- `marcus_queue_processing_duration_seconds{queue_name}`

**Problem:**
- Queue names are application-defined
- If queues are dynamically created: unbounded

**Impact:**
- Expected queues: `citation_analysis`, `state_sync`, `dead_letter`
- If bounded to ~5-10 queues: ACCEPTABLE

**Fix:**
- ✅ Whitelist known queue names
- ✅ Reject unknown queue names with warning

**Risk Level:** LOW (expected to be small, fixed set)

---

#### 6. `lock_name` Label

**Affected Metrics:**
- `marcus_lock_contention_total{lock_name, result}`
- `marcus_lock_acquisition_duration_seconds{lock_name}`
- `marcus_lock_hold_duration_seconds{lock_name}`

**Problem:**
- Lock names include agent IDs: `agent:agent_001:state`
- 100 agents × 3 lock types = 300 time series
- **Acceptable** if agent count is bounded

**Impact:**
- Lock names: `agent:{agent_id}:state`, `analysis:{timestamp}`, ...
- Pattern-based, bounded by agent count

**Fix:**
- ✅ Use lock name prefixes only: `agent_state`, `analysis`, `sync`
- ✅ Drop dynamic portions (agent_id, timestamp)

**Risk Level:** MEDIUM (bounded, but can be optimized)

---

### Medium Issues (BOUNDED BUT LARGE)

#### 7. `breaker_name` Label

**Affected Metrics:**
- `marcus_circuit_breaker_state{breaker_name}`
- `marcus_circuit_breaker_failures_total{breaker_name}`

**Current Cardinality:** ~5-10 circuit breakers (database, redis, agents, external_api, ...)

**Fix:** ✅ Already bounded, no action needed

**Risk Level:** LOW

---

#### 8. `component` Label

**Affected Metrics:**
- `marcus_errors_total{error_type, component, severity}`
- `marcus_error_rate{component}`

**Current Cardinality:** ~10-20 components (orchestrator, database, redis, agents, api, ...)

**Fix:** ✅ Whitelist known components

**Risk Level:** LOW

---

### Low Issues (WELL-BOUNDED)

#### 9. Fixed-Value Labels

These labels have small, fixed value sets:

- `pool_type`: `total`, `idle` (2 values)
- `state`: `spawning`, `running`, `stopping`, `stopped`, `crashed`, `zombie` (6 values)
- `result`: `success`, `failure`, `timeout`, `acquired` (4-5 values)
- `status_code`: HTTP status codes (40-50 common values)
- `method`: HTTP methods (5-10 values)
- `type`: `used`, `peak`, `rss` for memory (3 values)
- `token_type`: `access`, `refresh` (2 values)
- `cache_type`: `redis`, `memory` (2 values)
- `sync_type`: `agent_state`, `analysis_result` (2 values)
- `severity`: `critical`, `high`, `medium`, `low` (4 values)

**Risk Level:** NONE

---

## Cardinality Budget

### Worst-Case Calculation

| Metric Group | Base Cardinality | Multiplier | Total |
|--------------|------------------|------------|-------|
| Agent metrics (5 metrics) | 5 | 100 agents × 5 methods | 2,500 |
| HTTP metrics (2 metrics) | 2 | 20 routes × 10 methods × 30 status codes | 12,000 |
| Redis metrics (4 metrics) | 4 | 10 commands | 40 |
| Process metrics (3 metrics) | 3 | 100 agents × 6 states | 1,800 |
| Queue metrics (4 metrics) | 4 | 5 queues | 20 |
| Lock metrics (3 metrics) | 3 | 100 agents × 3 lock types | 900 |
| Circuit breaker (2 metrics) | 2 | 10 breakers | 20 |
| Error metrics (2 metrics) | 2 | 20 types × 20 components × 4 severities | 3,200 |
| Other bounded metrics | ~20 | Small multipliers | ~200 |
| **TOTAL** | | | **~20,680** |

**ALERT:** Exceeds 10,000 time series threshold!

---

## Optimization Strategy

### Priority 1: Fix Unbounded Labels

1. **HTTP routes** - Add whitelist + `other` bucket
2. **Error types** - Error classification taxonomy
3. **Lock names** - Use prefixes only

### Priority 2: Reduce High-Cardinality Labels

1. **Agent metrics** - Add validation, prevent ID reuse
2. **HTTP status codes** - Bucket into ranges (2xx, 3xx, 4xx, 5xx)
3. **Lock names** - Use lock type instead of full name

### Priority 3: Add Cardinality Monitoring

1. **Metric:** `marcus_metric_cardinality{metric_name}` - track time series count per metric
2. **Alert:** Trigger if any metric exceeds 1,000 time series

---

## Implementation Plan

### Phase 1: Label Value Validation (2 hours)

Create `src/platform/monitoring/metricsHelpers.ts`:

```typescript
/**
 * Validate and normalize agent_id
 */
export function normalizeAgentId(agentId: string): string {
  if (!/^agent_\d{3}$/.test(agentId)) {
    console.warn(`Invalid agent_id: ${agentId}, using 'unknown'`);
    return 'unknown';
  }
  return agentId;
}

/**
 * Normalize HTTP route to known set
 */
export function normalizeRoute(path: string): string {
  // Known routes (whitelist)
  const knownRoutes = [
    '/health',
    '/metrics',
    '/api/citations',
    '/api/citations/:id',
    '/api/citations/:id/verify',
    '/api/agents',
    '/api/agents/:id',
    '/api/auth/login',
    '/api/auth/logout',
    '/api/auth/refresh'
  ];

  const normalized = normalizeRoutePath(path);
  if (knownRoutes.includes(normalized)) {
    return normalized;
  }

  return 'other';
}

/**
 * Bucket HTTP status codes into ranges
 */
export function bucketStatusCode(statusCode: number): string {
  if (statusCode >= 200 && statusCode < 300) return '2xx';
  if (statusCode >= 300 && statusCode < 400) return '3xx';
  if (statusCode >= 400 && statusCode < 500) return '4xx';
  if (statusCode >= 500 && statusCode < 600) return '5xx';
  return 'unknown';
}

/**
 * Classify error into taxonomy
 */
export function classifyError(error: Error): string {
  const message = error.message.toLowerCase();
  const name = error.name.toLowerCase();

  if (message.includes('timeout') || name.includes('timeout')) return 'timeout_error';
  if (message.includes('connection') || message.includes('econnreset')) return 'connection_error';
  if (message.includes('authentication') || message.includes('unauthorized')) return 'authentication_error';
  if (message.includes('authorization') || message.includes('forbidden')) return 'authorization_error';
  if (message.includes('database') || message.includes('postgres')) return 'database_error';
  if (message.includes('redis')) return 'redis_error';
  if (message.includes('agent')) return 'agent_error';
  if (message.includes('circuit breaker')) return 'circuit_breaker_error';
  if (message.includes('rate limit')) return 'rate_limit_error';
  if (message.includes('validation') || name === 'validationerror') return 'validation_error';

  return 'unknown_error';
}

/**
 * Normalize lock name to type prefix
 */
export function normalizeLockName(lockName: string): string {
  if (lockName.startsWith('agent:')) return 'agent_state';
  if (lockName.startsWith('analysis:')) return 'analysis';
  if (lockName.startsWith('sync:')) return 'sync';
  return 'other';
}

/**
 * Normalize queue name to known set
 */
export function normalizeQueueName(queueName: string): string {
  const knownQueues = [
    'citation_analysis',
    'state_sync',
    'dead_letter',
    'health_check',
    'metrics_collection'
  ];

  if (knownQueues.includes(queueName)) {
    return queueName;
  }

  console.warn(`Unknown queue name: ${queueName}, using 'other'`);
  return 'other';
}

/**
 * Normalize Redis command to common set
 */
export function normalizeRedisCommand(command: string): string {
  const commonCommands = [
    'get', 'set', 'setex', 'expire', 'del',
    'exists', 'ping', 'incr', 'decr', 'hget',
    'hset', 'lpush', 'rpush', 'lpop', 'rpop'
  ];

  const normalized = command.toLowerCase();
  if (commonCommands.includes(normalized)) {
    return normalized;
  }

  return 'other';
}

/**
 * Normalize component name to known set
 */
export function normalizeComponent(component: string): string {
  const knownComponents = [
    'orchestrator',
    'database',
    'redis',
    'agent',
    'api',
    'auth',
    'circuit_breaker',
    'state_manager',
    'metrics',
    'health_check'
  ];

  const normalized = component.toLowerCase();
  if (knownComponents.includes(normalized)) {
    return normalized;
  }

  return 'other';
}
```

### Phase 2: Update Metrics Usage (1.5 hours)

Update all metric call sites to use normalization functions.

### Phase 3: Add Cardinality Monitoring (30 minutes)

```typescript
/**
 * Track metric cardinality
 */
const metricCardinalityGauge = new promClient.Gauge({
  name: 'marcus_metric_cardinality',
  help: 'Number of time series per metric',
  labelNames: ['metric_name']
});

/**
 * Calculate cardinality for all metrics
 */
export async function updateCardinalityMetrics(): Promise<void> {
  const metrics = await register.getMetricsAsJSON();

  for (const metric of metrics) {
    const cardinality = metric.values.length;
    metricCardinalityGauge.set({ metric_name: metric.name }, cardinality);

    if (cardinality > 1000) {
      console.warn(`⚠️ High cardinality detected: ${metric.name} has ${cardinality} time series`);
    }
  }
}
```

### Phase 4: Documentation (30 minutes)

Create `docs/METRICS_CARDINALITY_GUIDE.md` with best practices.

---

## Success Criteria

- ✅ All metrics have bounded cardinality (<1,000 time series)
- ✅ No unbounded label values
- ✅ Cardinality monitoring in place
- ✅ Alerts configured for high cardinality
- ✅ Documentation complete

---

## Expected Outcome

**Before:**
- Worst-case: ~20,000 time series
- Unbounded growth potential (HTTP routes, errors)

**After:**
- Bounded: <5,000 time series
- All labels validated and normalized
- Cardinality monitoring alerts
- Storage/query performance preserved
