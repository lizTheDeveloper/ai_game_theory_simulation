# MARCUS 3.1: Metrics Cardinality Best Practices Guide

**Date:** 2025-11-22
**Author:** Marcus (Platform Engineer)

## What is Metrics Cardinality?

**Cardinality** = the number of unique time series for a metric.

A time series is defined by metric name + unique label combination:
```
marcus_http_requests_total{method="GET", route="/api/citations", status_code="200"}
marcus_http_requests_total{method="GET", route="/api/citations", status_code="404"}
marcus_http_requests_total{method="POST", route="/api/citations", status_code="201"}
```

Each unique combination = 1 time series.

**High cardinality** = many unique time series per metric.

## Why Cardinality Matters

### Storage Explosion

Each time series consumes:
- **Memory:** ~3KB in Prometheus
- **Disk:** ~1-2 bytes per data point (compressed)
- **Index:** Metadata storage

**Example:**
- 10,000 time series × 3KB = 30MB memory
- 100,000 time series × 3KB = 300MB memory
- 1,000,000 time series × 3KB = 3GB memory

### Query Performance Degradation

Prometheus must scan all matching time series:
- **Low cardinality (100 series):** Query in <10ms
- **Medium cardinality (1,000 series):** Query in 50-100ms
- **High cardinality (10,000+ series):** Query in 500ms-5s

### Scrape Timeouts

Prometheus scrapes /metrics endpoint every 15s:
- **Low cardinality:** Scrape in <100ms
- **High cardinality:** Scrape in >5s (timeout!)

## Cardinality Budget

**Rule of Thumb:** <1,000 time series per metric

**Platform-wide target:** <10,000 total time series

**Calculation:**
```
Metric cardinality = Product of unique values per label

Example:
marcus_http_requests_total{method, route, status_code}
- method: 10 values (GET, POST, PUT, DELETE, PATCH, ...)
- route: 20 values (/api/citations, /api/agents, ...)
- status_code: 30 values (200, 201, 400, 404, 500, ...)

Cardinality = 10 × 20 × 30 = 6,000 time series
```

## Common Cardinality Traps

### 1. User IDs / Request IDs / UUIDs

❌ **BAD:**
```typescript
httpRequests.inc({ user_id: req.user.id }); // Unbounded!
```

✅ **GOOD:**
```typescript
httpRequests.inc({ user_type: classifyUser(req.user) }); // Bounded
```

### 2. Dynamic Routes (404s, Attacks)

❌ **BAD:**
```typescript
httpRequests.inc({ route: req.path }); // /any/random/path/12345
```

✅ **GOOD:**
```typescript
httpRequests.inc({ route: normalizeRoute(req.path) }); // /other
```

### 3. Exception Messages

❌ **BAD:**
```typescript
errors.inc({ error: error.message }); // "TypeError: Cannot read property 'x' of undefined at line 42..."
```

✅ **GOOD:**
```typescript
errors.inc({ error_type: classifyError(error) }); // validation_error
```

### 4. Full Error Stack Traces

❌ **BAD:**
```typescript
errors.inc({ stack: error.stack }); // Unique per error!
```

✅ **GOOD:**
```typescript
errors.inc({ error_type: classifyError(error), component: 'database' });
```

### 5. Timestamps in Labels

❌ **BAD:**
```typescript
cache.set({ key: `user:${userId}:${Date.now()}` }); // Unbounded!
```

✅ **GOOD:**
```typescript
cache.set({ cache_type: 'user_session' }); // Bounded
```

## Cardinality Control Strategies

### Strategy 1: Whitelisting

Define a fixed set of allowed values:

```typescript
export function normalizeRoute(path: string): string {
  const knownRoutes = [
    '/health',
    '/metrics',
    '/api/citations',
    '/api/agents'
  ];

  if (knownRoutes.includes(path)) {
    return path;
  }

  return 'other'; // Catch-all bucket
}
```

**When to use:** Label values should be known at development time

### Strategy 2: Bucketing

Group continuous or high-cardinality values:

```typescript
export function bucketStatusCode(statusCode: number): string {
  if (statusCode >= 200 && statusCode < 300) return '2xx';
  if (statusCode >= 400 && statusCode < 500) return '4xx';
  return 'unknown';
}
```

**When to use:** Values have natural groupings (status codes, latency ranges)

### Strategy 3: Classification

Map dynamic values to fixed taxonomy:

```typescript
export function classifyError(error: Error): string {
  if (error.message.includes('timeout')) return 'timeout_error';
  if (error.message.includes('connection')) return 'connection_error';
  return 'unknown_error';
}
```

**When to use:** Dynamic values can be categorized semantically

### Strategy 4: Prefix Extraction

Extract stable prefix from dynamic values:

```typescript
export function normalizeLockName(lockName: string): string {
  // agent:agent_001:state -> agent_state
  if (lockName.startsWith('agent:')) return 'agent_state';
  return 'other';
}
```

**When to use:** Values follow `prefix:dynamic_part` pattern

## Implementation Checklist

### Before Adding New Metrics

- [ ] Estimate cardinality: multiply unique values per label
- [ ] Is cardinality <1,000? If not, reduce labels
- [ ] Are all label values bounded? If not, add normalization
- [ ] Can any labels be removed? (Simplicity > detail)
- [ ] Document expected cardinality in code comments

### When Adding Labels

- [ ] Whitelist label values if known (finite set)
- [ ] Bucket/classify dynamic values (continuous, errors)
- [ ] Add validation/normalization functions
- [ ] Test with production-like data volume
- [ ] Monitor cardinality after deployment

### Monitoring Cardinality

- [ ] Enable cardinality monitoring: `startCardinalityMonitoring()`
- [ ] Set alerts for metrics >1,000 time series
- [ ] Review cardinality weekly (Prometheus queries)
- [ ] Prune unused/low-value labels

## Helper Functions (MARCUS 3.1)

All normalization helpers are in `src/platform/monitoring/metricsHelpers.ts`:

```typescript
import {
  normalizeAgentId,       // agent_001 -> agent_001 | unknown
  normalizeRoute,         // /api/citations/123 -> /api/citations/:id | other
  bucketStatusCode,       // 404 -> 4xx
  classifyError,          // Error -> timeout_error | connection_error | ...
  normalizeLockName,      // agent:agent_001:state -> agent_state
  normalizeQueueName,     // unknown_queue -> other
  normalizeRedisCommand,  // OBSCURE_CMD -> other
  normalizeComponent,     // unknown_component -> other
  normalizeSeverity       // CRITICAL -> critical
} from '@/platform/monitoring/metricsHelpers';
```

### Usage Examples

#### HTTP Metrics (Bounded Routes)

```typescript
httpRequestDuration.observe({
  method: req.method,
  route: normalizeRoute(req.path), // ✅ Bounded
  status_code: bucketStatusCode(res.statusCode) // ✅ Bucketed
}, duration);
```

#### Error Metrics (Classified)

```typescript
errorsByType.inc({
  error_type: classifyError(error), // ✅ Taxonomy
  component: normalizeComponent('database'), // ✅ Whitelist
  severity: normalizeSeverity('high') // ✅ Fixed set
});
```

#### Agent Metrics (Validated)

```typescript
agentStatus.set({
  agent_id: normalizeAgentId(agentId) // ✅ Validated format
}, 1);
```

## Cardinality Debugging

### Find High-Cardinality Metrics

```bash
# Prometheus query: count time series per metric
count by (__name__) ({__name__=~".+"})

# Top 10 highest cardinality metrics
topk(10, count by (__name__) ({__name__=~".+"}))
```

### Identify Problematic Labels

```bash
# Count unique values for a specific label
count by (agent_id) (marcus_agent_status)

# Find labels with >100 unique values
count by (route) (marcus_http_requests_total) > 100
```

### Check MARCUS Cardinality Metrics

```bash
# Current cardinality per metric
marcus_metric_cardinality

# Metrics exceeding threshold (>1,000)
marcus_metric_cardinality > 1000
```

## Alerts (Recommended)

```yaml
# Grafana alert: High cardinality
alert: HighMetricCardinality
expr: marcus_metric_cardinality > 1000
for: 5m
labels:
  severity: warning
annotations:
  summary: "Metric {{ $labels.metric_name }} has {{ $value }} time series (threshold: 1,000)"
```

## Best Practices Summary

1. **Design for bounded cardinality** - Always ask: "How many unique values?"
2. **Whitelist over blacklist** - Explicitly allow known values
3. **Classify dynamic values** - Map to fixed taxonomy
4. **Use histograms for high-cardinality data** - Latencies, sizes, counts
5. **Monitor cardinality continuously** - Catch explosions early
6. **Remove unused labels** - Simplicity reduces cardinality
7. **Test with production volume** - Cardinality surprises in production
8. **Document expected cardinality** - Help future developers

## References

- [Prometheus Best Practices: Metric and Label Naming](https://prometheus.io/docs/practices/naming/)
- [Avoiding Cardinality Explosion in Prometheus](https://www.robustperception.io/cardinality-is-key)
- [How Much Cardinality is Too Much?](https://www.robustperception.io/how-much-cardinality-is-too-much)

---

**CRITICAL:** All new metrics MUST use normalization helpers from `metricsHelpers.ts` to prevent cardinality explosion.
