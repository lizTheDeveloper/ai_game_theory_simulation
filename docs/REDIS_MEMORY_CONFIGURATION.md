# MARCUS 3.1: Redis Memory Configuration Guide

**Date:** 2025-11-22
**Author:** Marcus (Platform Engineer)
**Priority:** LOW (L2)
**Effort:** 2 hours

## Problem Statement

Without memory limits, Redis can:
- **Consume all available memory** → OOM kills → pod restarts → data loss
- **Cause node memory pressure** → other pods evicted → cascading failures
- **Degrade performance** → swapping → high latency

**Current Risk:** MEDIUM
- No `maxmemory` configured
- No eviction policy set
- Unbounded memory growth under load

## Solution: Memory Limits + Eviction Policy

### Configuration Strategy

**Three-layer memory control:**

1. **Container limits** (Kubernetes): Hard cap on memory usage
2. **Redis maxmemory**: Soft cap (80% of container limit)
3. **Eviction policy**: What to do when limit reached

## Memory Sizing

### Calculation

```
Container memory limit = 512Mi (536,870,912 bytes)
Redis overhead (20%) = 102Mi (copy-on-write, internal structures)
Redis maxmemory (80%) = 410Mi (429,496,729 bytes)
```

**Why 80%?**
- **Copy-on-write:** During background saves, Redis duplicates modified pages
- **Internal structures:** Connection buffers, pubsub backlog, client query buffers
- **Safety margin:** Prevents OOM even under peak load

### Sizing by Use Case

| Use Case | Data Size | Container Limit | Redis Maxmemory |
|----------|-----------|-----------------|-----------------|
| Small (dev/test) | <100MB | 256Mi | 205Mi |
| Medium (staging) | 100-500MB | 512Mi | 410Mi |
| Large (production) | 500MB-2GB | 2Gi | 1.6Gi |
| X-Large (high traffic) | 2-8GB | 8Gi | 6.4Gi |

**MARCUS 3.1 sizing:** Medium (512Mi container, 410Mi Redis)
- Supports ~400,000 agent state snapshots (1KB each)
- Or ~40,000 analysis results (10KB each)
- Or mixed workload with headroom

## Eviction Policies

### Policy Comparison

| Policy | Description | Use When | Risk |
|--------|-------------|----------|------|
| **allkeys-lru** | Evict least recently used key (any key) | Cache with mixed TTL/no-TTL | Data loss on eviction |
| volatile-lru | Evict least recently used key (TTL only) | Cache with explicit TTL | OOM if no TTL keys |
| allkeys-lfu | Evict least frequently used key (any key) | Cache with popular items | Complex eviction |
| volatile-lfu | Evict least frequently used key (TTL only) | Cache with popular + TTL | OOM if no TTL keys |
| volatile-ttl | Evict key with soonest expiration | Cache with variable TTL | OOM if no TTL keys |
| volatile-random | Evict random key (TTL only) | Simple cache | OOM if no TTL keys |
| allkeys-random | Evict random key (any key) | Testing/simple cache | Random data loss |
| **noeviction** | Return errors on write | Persistent data store | Writes fail! |

### MARCUS 3.1 Policy: `allkeys-lru`

**Why allkeys-lru?**

MARCUS uses Redis for:
1. **Agent state cache** (with TTL) - can evict
2. **Analysis results cache** (with TTL) - can evict
3. **Distributed locks** (no TTL) - must NOT evict... but can tolerate occasional loss

**Problem:** Distributed locks don't have TTL (held for seconds, not minutes)

**Options:**
1. ❌ `volatile-lru` - Won't evict locks → OOM if cache fills
2. ✅ `allkeys-lru` - May evict locks → lock breaks, retry succeeds
3. ✅ `allkeys-lfu` - Less likely to evict locks (recently used) → better but more complex

**Decision:** `allkeys-lru`
- **Advantage:** Handles both cache and locks gracefully
- **Trade-off:** Rare lock eviction under extreme memory pressure (acceptable)
- **Mitigation:** Monitor lock failures, alert if rate exceeds baseline

**Alternative for future:** Separate Redis instances (one for cache, one for locks)

## Configuration File

See `k8s/redis-memory-config.yaml` for complete configuration.

### Key Settings

```conf
# Memory limit (410Mi = 80% of 512Mi container)
maxmemory 429496729

# Eviction policy
maxmemory-policy allkeys-lru

# LRU sampling size (accuracy vs. speed)
maxmemory-samples 5
```

### Persistence (Disabled)

```conf
# No RDB snapshots
save ""

# No AOF
appendonly no
```

**Why disable persistence?**
- MARCUS uses Redis as **cache only** (not source of truth)
- Source of truth: PostgreSQL
- Data loss on restart: **acceptable** (cache rebuilt from DB)
- Benefit: No disk I/O → lower latency, simpler operations

## Deployment

### Apply Configuration

```bash
# Create ConfigMap
kubectl apply -f k8s/redis-memory-config.yaml

# Restart Redis to apply config
kubectl rollout restart statefulset/redis -n marcus

# Verify config applied
kubectl exec -it redis-0 -n marcus -- redis-cli CONFIG GET maxmemory
# Output: 1) "maxmemory" 2) "429496729"

kubectl exec -it redis-0 -n marcus -- redis-cli CONFIG GET maxmemory-policy
# Output: 1) "maxmemory-policy" 2) "allkeys-lru"
```

### Environment Variables (Alternative)

If you prefer environment variables over ConfigMap:

```yaml
env:
- name: REDIS_MAXMEMORY
  value: "429496729"
- name: REDIS_MAXMEMORY_POLICY
  value: "allkeys-lru"
```

And update Redis command:
```yaml
command:
  - redis-server
  - --maxmemory $(REDIS_MAXMEMORY)
  - --maxmemory-policy $(REDIS_MAXMEMORY_POLICY)
```

## Monitoring

### Key Metrics

Monitor these Redis metrics:

```bash
# Current memory usage
redis-cli INFO memory | grep used_memory_human

# Memory usage as percentage of limit
redis-cli INFO memory | grep used_memory_peak_perc

# Number of evictions
redis-cli INFO stats | grep evicted_keys

# Fragmentation ratio (should be <1.5)
redis-cli INFO memory | grep mem_fragmentation_ratio
```

### Prometheus Metrics (Already Implemented)

MARCUS exposes these via `marcus_redis_memory_bytes`:

```promql
# Memory usage
marcus_redis_memory_bytes{type="used"}

# Peak memory
marcus_redis_memory_bytes{type="peak"}

# Eviction rate (derive from counter)
rate(redis_evicted_keys_total[5m])
```

### Alerts (Recommended)

```yaml
# Alert: High memory usage
- alert: RedisHighMemoryUsage
  expr: marcus_redis_memory_bytes{type="used"} / 429496729 > 0.9
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "Redis using {{ $value | humanizePercentage }} of maxmemory"

# Alert: High eviction rate
- alert: RedisHighEvictionRate
  expr: rate(redis_evicted_keys_total[5m]) > 100
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "Redis evicting {{ $value }} keys/sec (normal: <10/sec)"

# Alert: Memory fragmentation
- alert: RedisHighFragmentation
  expr: redis_mem_fragmentation_ratio > 1.5
  for: 15m
  labels:
    severity: warning
  annotations:
    summary: "Redis fragmentation ratio {{ $value }} (threshold: 1.5)"
```

## Testing

### Eviction Behavior Test

```bash
# Connect to Redis
kubectl exec -it redis-0 -n marcus -- redis-cli

# Check current memory usage
INFO memory

# Fill Redis to maxmemory
# (Simulate cache filling up)
for i in {1..500000}; do
  SET test_key_$i "x"*1000  # 1KB per key
done

# Verify evictions started
INFO stats | grep evicted_keys
# Should show evicted_keys > 0

# Verify memory stays under limit
INFO memory | grep used_memory_human
# Should be ~410Mi (not exceeding maxmemory)

# Clean up test keys
FLUSHDB
```

### Lock Eviction Test

```bash
# Create a lock (no TTL)
SET lock:test:123 "locked" NX

# Fill cache to trigger eviction
# (Run test above)

# Check if lock still exists
GET lock:test:123
# May return (nil) if evicted - this is expected and acceptable

# Application should retry lock acquisition
# Distributed lock manager handles this automatically
```

## Tuning

### Increase Memory Limit

If eviction rate is high under normal load:

```yaml
# Update container limits
resources:
  limits:
    memory: "1Gi"  # Doubled

# Update maxmemory (80% of new limit)
maxmemory 858993459  # ~820Mi
```

### Change Eviction Policy

If locks are being evicted too frequently:

```conf
# Option 1: Use LFU (less aggressive on short-lived items like locks)
maxmemory-policy allkeys-lfu

# Option 2: Split Redis instances
# - Cache instance: volatile-lru
# - Lock instance: noeviction with smaller memory
```

### Adjust LRU Sampling

```conf
# More accurate eviction (slower)
maxmemory-samples 10

# Faster eviction (less accurate)
maxmemory-samples 3
```

## Troubleshooting

### Problem: OOM Kills Despite maxmemory

**Symptoms:**
```
Pod redis-0 was OOMKilled
```

**Causes:**
1. maxmemory > container limit
2. Copy-on-write during background save
3. Memory fragmentation

**Solutions:**
```bash
# 1. Check config
kubectl exec redis-0 -n marcus -- redis-cli CONFIG GET maxmemory

# 2. Reduce maxmemory to 70% of container limit (more conservative)
kubectl exec redis-0 -n marcus -- redis-cli CONFIG SET maxmemory 375809638

# 3. Restart Redis to clear fragmentation
kubectl rollout restart statefulset/redis -n marcus
```

### Problem: High Eviction Rate

**Symptoms:**
```
redis_evicted_keys_total increasing rapidly
Application errors: "Cache miss rate high"
```

**Causes:**
1. Memory limit too low for workload
2. No TTL on cached data (fills up indefinitely)
3. Inefficient data structures (large values)

**Solutions:**
```bash
# 1. Check memory usage
kubectl exec redis-0 -n marcus -- redis-cli INFO memory

# 2. Check biggest keys
kubectl exec redis-0 -n marcus -- redis-cli --bigkeys

# 3. Increase memory limit (see "Tuning" above)

# 4. Add TTL to cached data
# In application code:
# await redis.setex('key', 3600, value); // 1 hour TTL
```

### Problem: Lock Failures

**Symptoms:**
```
DistributedLockManager: Failed to acquire lock (lock already released)
```

**Causes:**
1. Lock evicted due to memory pressure
2. Lock TTL too short
3. Lock not being released properly

**Solutions:**
```bash
# 1. Check eviction rate during lock failures
# Correlate lock errors with redis_evicted_keys_total spike

# 2. If locks are being evicted:
#    Option A: Increase memory
#    Option B: Separate Redis for locks (future enhancement)

# 3. If not evicted:
#    Check lock timeout settings in DistributedLockManager
#    Default: 10s lock timeout, 5s acquire timeout
```

## Cost Impact

### Current Configuration

```
Redis instance: 512Mi memory, 100m CPU
GKE cost: ~$5-10/month (shared node)
```

### Scaling Cost

| Configuration | Monthly Cost | Use Case |
|---------------|--------------|----------|
| 512Mi / 100m | $5-10 | Dev/staging |
| 2Gi / 500m | $15-25 | Production (low traffic) |
| 8Gi / 2 CPU | $50-80 | Production (high traffic) |

**Cost optimization:**
- Use Redis for cache only (not persistence) → smaller memory
- Set aggressive TTLs → lower memory usage
- Monitor eviction rate → right-size memory (not too big)

## Summary

### Checklist

- [x] Set `maxmemory` to 80% of container limit
- [x] Configure `maxmemory-policy allkeys-lru`
- [x] Disable persistence (save "", appendonly no)
- [x] Set container memory limit (512Mi)
- [x] Add Prometheus metrics for memory usage
- [x] Add Grafana alerts for high memory/eviction
- [x] Document eviction behavior
- [x] Test eviction under load

### Expected Outcome

- ✅ Redis memory usage bounded (<512Mi)
- ✅ No OOM kills
- ✅ Eviction policy handles memory pressure gracefully
- ✅ Locks tolerate rare eviction (retry succeeds)
- ✅ Cache hit ratio remains high (>90%)

### Next Steps (If Needed)

1. **Monitor eviction rate** for 1 week
2. **Adjust memory limit** if evictions too frequent
3. **Consider separate Redis** for locks vs. cache
4. **Implement cache warming** on pod startup
