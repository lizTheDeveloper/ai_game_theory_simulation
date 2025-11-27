# MARCUS 3.0 - Database Connection Pool Tuning Guide

**Phase 3.3.3: Connection Pool Optimization**

This guide helps you tune PostgreSQL and Redis connection pools for optimal performance under load.

---

## 📊 Why Connection Pool Tuning Matters

**Problem:** Connection creation is expensive
- PostgreSQL: 5-10ms to establish connection
- Overhead adds up at scale (1000 req/s = 5-10 seconds of connection overhead)

**Solution:** Connection pooling
- Reuse existing connections
- Maintain pool of ready connections
- Balance between too few (exhaustion) and too many (memory waste)

---

## 🎯 Current Configuration

**PostgreSQL Pool (Node.js pg library):**
```typescript
// Default configuration (src/platform/api/server.ts)
database: {
  max: 20,           // Maximum connections
  min: 2,            // Minimum connections
  idleTimeoutMillis: 30000,    // Close idle connections after 30s
  connectionTimeoutMillis: 2000, // Wait 2s for connection from pool
}
```

**Redis Pool (ioredis library):**
```typescript
// Default configuration
redis: {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false,
}
```

---

## 🔍 When to Tune

**Signs you need to tune connection pools:**

1. **Pool Exhausted Errors**
   ```
   Error: Timeout acquiring connection from pool
   Error: Connection pool exhausted
   ```

2. **High Connection Wait Time**
   - P95 wait time >100ms
   - Visible in Grafana: Database Metrics dashboard

3. **Under-Utilization**
   - Pool max = 20, but peak usage = 5
   - Wasting memory on idle connections

4. **Connection Churn**
   - Connections constantly created/destroyed
   - High `pg_stat_database.numbackends` variance

---

## 📈 Determining Optimal Pool Size

### Formula

```
Optimal Pool Size = (Core Count × 2) + Effective Spindle Count
```

**For MARCUS:**
- 4-core VM: (4 × 2) + 1 = **9 connections minimum**
- 8-core VM: (8 × 2) + 1 = **17 connections minimum**

**Rule of thumb:**
- **Minimum:** 2× core count
- **Maximum:** 4× core count (diminishing returns beyond this)
- **Start conservative:** Use minimum, increase if needed

### Experimentation

Test different pool sizes under load:

```bash
# Test pool size 5
DATABASE_POOL_SIZE=5 npm run dev &
K6_SCENARIO=sustained ADMIN_PASSWORD=<password> k6 run tests/load/api-load-test.js

# Test pool size 10
DATABASE_POOL_SIZE=10 npm run dev &
K6_SCENARIO=sustained ADMIN_PASSWORD=<password> k6 run tests/load/api-load-test.js

# Test pool size 20
DATABASE_POOL_SIZE=20 npm run dev &
K6_SCENARIO=sustained ADMIN_PASSWORD=<password> k6 run tests/load/api-load-test.js

# Test pool size 50
DATABASE_POOL_SIZE=50 npm run dev &
K6_SCENARIO=sustained ADMIN_PASSWORD=<password> k6 run tests/load/api-load-test.js
```

**Measure:**
- Connection wait time (Grafana: Database dashboard)
- Query throughput (queries/sec)
- Memory usage (`ps aux | grep node`)
- Error rate (pool exhausted errors)

**Optimal size:** Lowest pool size where:
- ✅ Connection wait time <50ms (P95)
- ✅ No pool exhausted errors
- ✅ Query throughput meets target (>1000 queries/sec)

---

## 🔧 Tuning PostgreSQL Connection Pool

### Step 1: Check Current Usage

```sql
-- Current connections
SELECT count(*) FROM pg_stat_activity;

-- Max connections configured
SHOW max_connections;

-- Connection usage by database
SELECT datname, count(*)
FROM pg_stat_activity
GROUP BY datname;
```

### Step 2: Monitor Pool Metrics

**Grafana Dashboard:** Database Metrics
- Connection pool usage chart
- Alert: Pool >90% full

**Prometheus Query:**
```promql
# Connection pool usage %
pg_stat_database_numbackends / pg_settings_max_connections
```

### Step 3: Tune Pool Size

**Option A: Environment Variable (recommended)**
```bash
# .env file
DATABASE_POOL_SIZE=20

# Restart service
sudo systemctl restart marcus-platform
```

**Option B: Code Change**
```typescript
// src/platform/api/server.ts
database: {
  max: parseInt(process.env.DB_POOL_SIZE || '20', 10),
  min: 2,
  // ...
}
```

### Step 4: Tune PostgreSQL max_connections

If application pool exceeds PostgreSQL max_connections:

```bash
# Check current max
sudo -u postgres psql -c "SHOW max_connections;"

# Increase max (requires restart)
sudo -u postgres psql -c "ALTER SYSTEM SET max_connections = 100;"
sudo systemctl restart postgresql

# Verify
sudo -u postgres psql -c "SHOW max_connections;"
```

**Warning:** Each connection uses ~10MB RAM. 100 connections = ~1GB memory.

---

## ⚡ Tuning Redis Connection Pool

### Step 1: Check Current Usage

```bash
# Connected clients
redis-cli INFO clients | grep connected_clients

# Max clients configured
redis-cli CONFIG GET maxclients
```

### Step 2: Monitor Redis Metrics

**Grafana Dashboard:** Redis Metrics
- Connected clients chart
- Memory usage chart

**Prometheus Query:**
```promql
# Connected clients
redis_connected_clients

# Max clients
redis_config_maxclients
```

### Step 3: Tune Redis Configuration

**Option A: redis.conf (persistent)**
```bash
# Edit config
sudo nano /etc/redis/redis.conf

# Find and update:
maxclients 10000

# Restart Redis
sudo systemctl restart redis
```

**Option B: Runtime (temporary)**
```bash
redis-cli CONFIG SET maxclients 10000
```

### Step 4: Tune Application Redis Pool

```typescript
// src/platform/api/server.ts
redis: {
  maxRetriesPerRequest: 3,
  connectTimeout: 10000,
  lazyConnect: false,
  // Additional options:
  // maxRedirections: 16,
  // retryStrategy: (times) => Math.min(times * 50, 2000),
}
```

---

## 📊 Monitoring Pool Health

### Key Metrics to Watch

**PostgreSQL:**
- **Active connections:** Should stay below 80% of pool max
- **Connection wait time:** P95 <50ms
- **Pool exhausted errors:** Should be 0

**Redis:**
- **Connected clients:** Should be stable
- **Blocked clients:** Should be 0
- **Evicted keys:** Indicates memory pressure

### Alerts to Configure

**Prometheus Alert Rules:**
```yaml
# Database connection pool near exhaustion
- alert: DatabaseConnectionPoolHigh
  expr: pg_stat_database_numbackends / pg_settings_max_connections > 0.8
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "Database connection pool usage >80%"
    description: "Current: {{ $value | humanizePercentage }}"

# Redis connection spike
- alert: RedisConnectionSpike
  expr: rate(redis_connected_clients[5m]) > 100
  for: 2m
  labels:
    severity: warning
  annotations:
    summary: "Redis connection spike detected"
```

---

## 🧪 Load Testing Scenarios

### Scenario 1: Baseline (Current Pool Size)

```bash
# Run baseline test
DATABASE_POOL_SIZE=20 npm run dev &
ADMIN_PASSWORD=<password> K6_SCENARIO=sustained k6 run tests/load/api-load-test.js

# Monitor in Grafana:
# - Database connection pool usage
# - Query response time
# - Error rate
```

### Scenario 2: Stress Test (Exceed Pool Capacity)

```bash
# Intentionally small pool
DATABASE_POOL_SIZE=5 npm run dev &
ADMIN_PASSWORD=<password> K6_SCENARIO=spike k6 run tests/load/api-load-test.js

# Expected: Pool exhausted errors when traffic spikes
```

### Scenario 3: Optimal Pool (Tuned)

```bash
# Tuned pool size
DATABASE_POOL_SIZE=16 npm run dev &
ADMIN_PASSWORD=<password> K6_SCENARIO=stress k6 run tests/load/api-load-test.js

# Goal: No errors, low latency, efficient memory usage
```

---

## 💡 Best Practices

### Do's ✅

1. **Start Conservative**
   - Begin with 2× core count
   - Increase gradually based on load testing

2. **Monitor Continuously**
   - Set up Grafana dashboards
   - Configure alerts for pool exhaustion

3. **Test Under Load**
   - Use k6 for realistic load tests
   - Measure connection wait time

4. **Document Changes**
   - Record pool size changes
   - Note performance before/after

5. **Use Environment Variables**
   - Make pool size configurable
   - Avoid hardcoding in code

### Don'ts ❌

1. **Don't Set Pool Too Large**
   - Memory waste
   - Overwhelms PostgreSQL
   - Diminishing returns beyond 4× cores

2. **Don't Ignore Idle Timeouts**
   - Set `idleTimeoutMillis` to close idle connections
   - Prevents connection leak

3. **Don't Skip Load Testing**
   - Production traffic patterns differ from dev
   - Test before deploying pool changes

4. **Don't Forget PostgreSQL Limits**
   - Application pool must fit within `max_connections`
   - Reserve connections for superuser, monitoring

5. **Don't Tune Without Metrics**
   - Always measure before and after
   - Use Grafana dashboards

---

## 🔍 Troubleshooting

### Issue 1: Pool Exhausted Errors

**Symptoms:**
```
Error: Timeout acquiring connection from pool
Error: Connection pool exhausted
```

**Diagnosis:**
```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity WHERE state = 'active';

-- Check long-running queries
SELECT pid, now() - query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active' AND now() - query_start > interval '5 seconds'
ORDER BY duration DESC;
```

**Solutions:**
1. Increase pool size: `DATABASE_POOL_SIZE=30`
2. Optimize slow queries (see database performance analysis)
3. Increase `connectionTimeoutMillis` (temporary fix)

### Issue 2: High Memory Usage

**Symptoms:**
- Node.js process using >2GB RAM
- OOM (Out of Memory) errors

**Diagnosis:**
```bash
# Check memory usage
ps aux | grep node

# Check pool size
grep DATABASE_POOL_SIZE .env
```

**Solutions:**
1. Reduce pool size: `DATABASE_POOL_SIZE=10`
2. Set `idleTimeoutMillis` to close idle connections faster
3. Increase server RAM

### Issue 3: Connection Churn

**Symptoms:**
- High CPU usage from connection creation
- `pg_stat_database.numbackends` constantly changing

**Diagnosis:**
```sql
-- Monitor connection changes
SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;
-- Run multiple times, watch for large swings
```

**Solutions:**
1. Increase `min` connections to keep pool warm
2. Adjust `idleTimeoutMillis` (increase to keep connections longer)
3. Use connection pooler like PgBouncer for extreme cases

---

## 📚 References

- **PostgreSQL Connection Pooling:** https://node-postgres.com/apis/pool
- **ioredis Documentation:** https://github.com/redis/ioredis
- **Connection Pool Sizing:** https://github.com/brettwooldridge/HikariCP/wiki/About-Pool-Sizing
- **Load Testing:** `tests/load/README.md`
- **Monitoring:** `monitoring/README.md`

---

**Last Updated:** 2025-11-21
**Phase:** 3.3 (Load Testing)
**Status:** Ready for Use ✅
