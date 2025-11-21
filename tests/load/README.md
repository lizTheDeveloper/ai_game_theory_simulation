# MARCUS 3.0 - Load Testing Suite

**Phase 3.3: Load Testing**

This directory contains load testing tools for the MARCUS platform to validate performance under realistic and extreme traffic conditions.

---

## 📋 Overview

**Purpose:** Validate that the MARCUS platform meets performance requirements under load:
- ✅ **99.9% success rate** at 50 RPS (sustained load)
- ✅ **P95 latency <2s** for citation analysis
- ✅ **No crashes or memory leaks** during extended tests
- ✅ **Graceful degradation** at high load (>100 RPS)

**Tools:**
- **k6 API Load Test** (`api-load-test.js`) - HTTP API load testing with 4 scenarios
- **Agent Stress Test** (`agent-stress-test.ts`) - Multi-agent stress testing with 3 scenarios
- **Connection Pool Tuning** (`../docs/database-pool-tuning.md`) - Database optimization guide

---

## 🚀 Quick Start

### Prerequisites

```bash
# Install k6 (for api-load-test.js)
sudo snap install k6

# Ensure MARCUS platform is running
npm run dev

# Set admin password
export ADMIN_PASSWORD='your_secure_password'
```

### Run Baseline Test (k6)

```bash
# 10 RPS for 5 minutes
K6_SCENARIO=baseline ADMIN_PASSWORD=<password> k6 run tests/load/api-load-test.js
```

### Run Agent Stress Test

```bash
# Burst test: 100 citations simultaneously
npx tsx tests/load/agent-stress-test.ts --scenario burst --admin-password <password>
```

---

## 📊 k6 API Load Test

**File:** `api-load-test.js`

**What it tests:** HTTP API performance under various load patterns.

### Scenarios

#### 1. Baseline (10 RPS, 5 minutes)
```bash
K6_SCENARIO=baseline ADMIN_PASSWORD=<password> k6 run tests/load/api-load-test.js
```

**Purpose:** Establish baseline performance metrics
**Expected:** 0 errors, P95 <500ms, throughput ≥10 req/s

---

#### 2. Sustained (50 RPS, 10 minutes)
```bash
K6_SCENARIO=sustained ADMIN_PASSWORD=<password> k6 run tests/load/api-load-test.js
```

**Purpose:** Validate production-level sustained load
**Expected:** <1% errors, P95 <2000ms, throughput ≥50 req/s

**Success Criteria (PRIMARY TEST):**
- ✅ Error rate <1%
- ✅ P95 latency <2000ms
- ✅ No memory leaks (check Grafana)
- ✅ No connection pool exhaustion

---

#### 3. Spike (100 RPS, 2 minutes)
```bash
K6_SCENARIO=spike ADMIN_PASSWORD=<password> k6 run tests/load/api-load-test.js
```

**Purpose:** Test sudden traffic spikes
**Stages:**
- 30s: Warm-up (10 RPS)
- 10s: Spike up (10 → 100 RPS)
- 2m: Hold spike (100 RPS)
- 10s: Spike down (100 → 10 RPS)
- 1m: Recovery (10 RPS)

**Expected:** P95 <2000ms during spike, graceful recovery

---

#### 4. Stress (Gradual Ramp, 24 minutes)
```bash
K6_SCENARIO=stress ADMIN_PASSWORD=<password> k6 run tests/load/api-load-test.js
```

**Purpose:** Find breaking point
**Stages:**
- 2m: Warm-up (10 RPS)
- 5m: Normal load (50 RPS)
- 5m: High load (100 RPS)
- 5m: Stress (200 RPS)
- 5m: Breaking point (300 RPS)
- 2m: Cool-down (0 RPS)

**Expected:** Identify max sustainable RPS, observe degradation patterns

---

### Interpreting Results

**k6 outputs a summary at the end:**
```
Load Test Summary (sustained)
==================================================

Requests:
  Total: 30000
  Failed: 15 (0.05%)
  Rate: 50.12 req/s

Response Times:
  Avg: 842.45ms
  P50: 756.23ms
  P95: 1823.67ms  ✅ PASS (<2000ms)
  P99: 2145.89ms
  Max: 3421.12ms

Custom Metrics:
  Successful Analyses: 29985
  Error Rate: 0.05%  ✅ PASS (<1%)
  Auth Failures: 0

Success Criteria:
  P95 < 2000ms: ✅ PASS (1823.67ms)
  Error Rate < 1%: ✅ PASS (0.05%)
```

**Green flags (✅ PASS):**
- Error rate <1%
- P95 latency <2000ms
- No auth failures
- Throughput meets target

**Red flags (❌ FAIL):**
- Error rate >1% (check logs: `sudo journalctl -u marcus-platform -n 100`)
- P95 latency >2000ms (run database performance analysis)
- Connection pool exhausted errors (see tuning guide)
- Memory leaks (check Grafana: Memory Usage dashboard)

**Report Location:** `tests/load/load-test-results_sustained_YYYY-MM-DD.json`

---

## 🔥 Agent Stress Test

**File:** `agent-stress-test.ts`

**What it tests:** Multi-agent system resilience under extreme conditions.

### Scenarios

#### 1. Burst Test
```bash
npx tsx tests/load/agent-stress-test.ts --scenario burst --admin-password <password>
```

**What it does:** Submit 100 citations simultaneously (parallel burst)

**Success Criteria:**
- ✅ All 100 citations complete successfully
- ✅ No agent crashes
- ✅ Average latency <3000ms
- ✅ All agents remain healthy

---

#### 2. Sustained Test
```bash
npx tsx tests/load/agent-stress-test.ts --scenario sustained --admin-password <password>
```

**What it does:** 50 citations/sec for 5 minutes (15,000 citations total)

**Success Criteria:**
- ✅ <1% error rate
- ✅ Throughput ≥45 citations/sec
- ✅ P95 latency <2000ms
- ✅ No memory leaks

---

#### 3. Agent Failure Test
```bash
npx tsx tests/load/agent-stress-test.ts --scenario failure --admin-password <password>
```

**What it does:**
1. Start citation analysis
2. Kill random agents mid-request
3. Verify platform recovers gracefully

**Success Criteria:**
- ✅ Platform detects agent failures
- ✅ Requests fail gracefully (no crashes)
- ✅ Surviving agents continue processing
- ✅ Platform restarts failed agents (if auto-restart enabled)

---

### Interpreting Results

**Report generated:** `tests/load/agent-stress-test_burst_YYYY-MM-DD.md`

**Example report:**
```markdown
# MARCUS Agent Stress Test Report

**Scenario:** burst
**Date:** 2025-11-21T14:32:15Z

## Summary

- Total Citations: 100
- Successful: 98 (98.00%)
- Failed: 2 (2.00%)
- Duration: 24.56s
- Throughput: 4.07 citations/sec

## Latency

- Avg: 2456ms
- P50: 2234ms
- P95: 3421ms
- P99: 3876ms
- Max: 4123ms

## Result: ❌ FAIL

**Issues:**
- 2 citations failed (target: 0 failures)
- Average latency 2456ms exceeds 2000ms
```

**Green flags (✅ PASS):**
- All citations complete successfully
- No agent crashes
- Average latency <3000ms (burst) or <2000ms (sustained)
- All agents remain healthy

**Red flags (❌ FAIL):**
- Citation failures (check agent logs)
- High latency (run agent latency benchmark: `npx tsx scripts/benchmark/agent-latency.ts`)
- Agent crashes (check system logs: `ps aux | grep python`)
- Memory leaks (check Grafana: Agent Health dashboard)

---

## 🔧 Connection Pool Tuning

**Before running load tests**, tune your database connection pools for optimal performance.

**See:** `docs/database-pool-tuning.md` for comprehensive guide

**Quick tuning steps:**
1. Check current pool size: `grep DATABASE_POOL_SIZE .env`
2. Run baseline test with different pool sizes:
   ```bash
   DATABASE_POOL_SIZE=10 npm run dev &
   K6_SCENARIO=sustained k6 run tests/load/api-load-test.js

   DATABASE_POOL_SIZE=20 npm run dev &
   K6_SCENARIO=sustained k6 run tests/load/api-load-test.js
   ```
3. Monitor connection wait time in Grafana
4. Use optimal pool size where:
   - ✅ Connection wait time <50ms (P95)
   - ✅ No pool exhausted errors
   - ✅ Query throughput meets target

**Recommended starting point:**
- **4-core VM:** `DATABASE_POOL_SIZE=16`
- **8-core VM:** `DATABASE_POOL_SIZE=32`

---

## 📈 Monitoring During Load Tests

**Always monitor with Grafana dashboards during load tests.**

### Key Dashboards

1. **Platform Overview** (`http://localhost:3000/grafana/d/platform-overview`)
   - Request rate (should match k6 target RPS)
   - Error rate (should be <1%)
   - P95 response time (should be <2000ms)
   - Uptime (should be 100%)

2. **Agent Health** (`http://localhost:3000/grafana/d/agent-health`)
   - Agent status (all should be "healthy")
   - Agent throughput (should be evenly distributed)
   - Agent response time P95 (should be <500ms)

3. **Database Metrics** (`http://localhost:3000/grafana/d/database-metrics`)
   - Connection pool usage (should stay <80%)
   - Query duration P95 (should be <100ms)
   - Cache hit ratio (should be >90%)

4. **Redis Metrics** (`http://localhost:3000/grafana/d/redis-metrics`)
   - Connected clients (should be stable)
   - Cache hit rate (should be >80%)
   - Memory usage (should stay <90%)

5. **Circuit Breakers** (`http://localhost:3000/grafana/d/circuit-breakers`)
   - All circuit breakers should be CLOSED (green)
   - No trips during normal operation

---

## 🐛 Troubleshooting

### Issue 1: High Error Rate (>1%)

**Symptoms:**
```
Error Rate: 5.23%  ❌ FAIL (>1%)
Failed: 523 (5.23%)
```

**Diagnosis:**
```bash
# Check platform logs
sudo journalctl -u marcus-platform -n 100

# Check agent health
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/agents/health
```

**Solutions:**
1. Increase agent count (if agent saturation)
2. Optimize slow database queries (run `scripts/benchmark/analyze-database-performance.sh`)
3. Increase connection pool size (see tuning guide)

---

### Issue 2: High Latency (P95 >2s)

**Symptoms:**
```
P95: 3421.67ms  ❌ FAIL (>2000ms)
```

**Diagnosis:**
```bash
# Run agent latency benchmark
npx tsx scripts/benchmark/agent-latency.ts

# Analyze database performance
./scripts/benchmark/analyze-database-performance.sh

# Check slow queries
sudo -u postgres psql -c "
  SELECT query, calls, total_exec_time, mean_exec_time
  FROM pg_stat_statements
  ORDER BY mean_exec_time DESC
  LIMIT 10;
"
```

**Solutions:**
1. Optimize slow database queries (add indexes, rewrite queries)
2. Increase Redis cache hit rate (check eviction policy)
3. Scale agent count horizontally
4. Profile Python agents for bottlenecks

---

### Issue 3: Connection Pool Exhausted

**Symptoms:**
```
Error: Timeout acquiring connection from pool
Error: Connection pool exhausted
```

**Diagnosis:**
```bash
# Check current pool usage
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity;"

# Check pool configuration
grep DATABASE_POOL_SIZE .env
```

**Solutions:**
1. Increase pool size: `DATABASE_POOL_SIZE=30` in `.env`
2. Check for connection leaks (long-running queries)
3. Increase PostgreSQL max_connections: `sudo -u postgres psql -c "ALTER SYSTEM SET max_connections = 100;"`

**See:** `docs/database-pool-tuning.md` for comprehensive guide

---

### Issue 4: Memory Leaks

**Symptoms:**
- Node.js process memory grows continuously
- OOM (Out of Memory) errors

**Diagnosis:**
```bash
# Check memory usage
ps aux | grep node

# Monitor in Grafana: System Resources → Memory Usage
```

**Solutions:**
1. Reduce connection pool size
2. Increase `idleTimeoutMillis` to close idle connections
3. Profile Node.js memory usage: `node --inspect scripts/...`
4. Increase server RAM

---

### Issue 5: Agent Failures

**Symptoms:**
```
Agent Health: 7/10 healthy  ❌ FAIL
Agent Errors: 45 errors in last 5m
```

**Diagnosis:**
```bash
# Check agent processes
ps aux | grep python

# Check agent logs
sudo journalctl -u marcus-platform | grep "Agent"
```

**Solutions:**
1. Restart unhealthy agents (platform should auto-restart)
2. Check Python dependencies (missing packages)
3. Increase agent timeout settings
4. Check IPC communication (network issues)

---

## 📚 Best Practices

### Before Running Load Tests

1. ✅ **Tune connection pools** (see `docs/database-pool-tuning.md`)
2. ✅ **Enable monitoring** (Prometheus + Grafana running)
3. ✅ **Set admin password** (`export ADMIN_PASSWORD='...'`)
4. ✅ **Start platform** (`npm run dev`)
5. ✅ **Verify baseline** (run health check: `curl http://localhost:3000/health`)

### During Load Tests

1. ✅ **Monitor Grafana dashboards** (watch for spikes, errors)
2. ✅ **Check system resources** (`top`, `free -h`, `df -h`)
3. ✅ **Watch logs** (`sudo journalctl -u marcus-platform -f`)
4. ✅ **Take notes** (record observations, anomalies)

### After Load Tests

1. ✅ **Review reports** (k6 JSON, agent stress test markdown)
2. ✅ **Analyze metrics** (Grafana time-series, Prometheus queries)
3. ✅ **Document findings** (update `benchmarks/` with results)
4. ✅ **Tune performance** (based on bottlenecks identified)
5. ✅ **Re-run tests** (validate improvements)

---

## 🎯 Success Criteria Summary

### k6 API Load Test (Sustained Scenario)

| Metric | Target | How to Check |
|--------|--------|--------------|
| Error Rate | <1% | k6 summary: "Error Rate < 1%: ✅ PASS" |
| P95 Latency | <2000ms | k6 summary: "P95 < 2000ms: ✅ PASS" |
| Throughput | ≥50 req/s | k6 summary: "Rate: 50.12 req/s" |
| Uptime | 100% | Grafana: Platform Overview → Uptime |

### Agent Stress Test (Sustained Scenario)

| Metric | Target | How to Check |
|--------|--------|--------------|
| Error Rate | <1% | Report: "Failed: 15 (0.05%)" |
| P95 Latency | <2000ms | Report: "P95: 1823.67ms" |
| Throughput | ≥45 citations/sec | Report: "Throughput: 48.23 citations/sec" |
| Agent Health | 100% healthy | Report: "All agents remain healthy" |

### Connection Pool Tuning

| Metric | Target | How to Check |
|--------|--------|--------------|
| Connection Wait Time | <50ms (P95) | Grafana: Database Metrics → Connection Wait Time |
| Pool Exhausted Errors | 0 | k6 summary: "Error: Connection pool exhausted" (should not appear) |
| Pool Utilization | 50-80% | Grafana: Database Metrics → Connection Pool Usage |
| Memory Usage | <90% | Grafana: System Resources → Memory Usage |

---

## 📝 Report Templates

### k6 API Load Test Report

**Location:** `tests/load/load-test-results_sustained_YYYY-MM-DD.json`

**Format:** JSON with metrics:
```json
{
  "metrics": {
    "http_reqs": { "values": { "count": 30000, "rate": 50.12 } },
    "http_req_duration": { "values": { "avg": 842.45, "p95": 1823.67 } },
    "http_req_failed": { "values": { "rate": 0.0005 } }
  }
}
```

### Agent Stress Test Report

**Location:** `tests/load/agent-stress-test_burst_YYYY-MM-DD.md`

**Format:** Markdown with:
- Summary (total, successful, failed, duration, throughput)
- Latency distribution (avg, P50, P95, P99, max)
- Agent health status
- Pass/fail verdict with issues

---

## 🔗 Related Documentation

- **Performance Benchmarking:** `scripts/benchmark/README.md` - Citation throughput, agent latency benchmarks
- **Connection Pool Tuning:** `docs/database-pool-tuning.md` - Database optimization guide
- **Monitoring Setup:** `monitoring/README.md` - Prometheus + Grafana configuration
- **Production Runbook:** `docs/MARCUS_PRODUCTION_RUNBOOK.md` - Troubleshooting guide
- **Deployment Guide:** `docs/MARCUS_DEPLOYMENT_GUIDE.md` - Production deployment steps

---

**Last Updated:** 2025-11-21
**Phase:** 3.3 (Load Testing)
**Status:** Ready for Use ✅
