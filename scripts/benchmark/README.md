# MARCUS 3.0 - Performance Benchmarking Suite

**Phase 3.1: Performance Benchmarking**

This directory contains performance benchmarking tools for MARCUS 3.0 Citation Integrity Platform.

---

## 📊 Benchmark Scripts

### 3.1.1 Citation Throughput Benchmark

**Script:** `citation-throughput.ts`

**Purpose:** Measure citation analysis performance under different loads

**Metrics:**
- Citations per second (throughput)
- Average latency per citation
- P50, P95, P99 latency percentiles
- Database query times
- Redis cache hit rate

**Success Criteria:**
- Single agent: ≥5 citations/sec
- Multi-agent (3): ≥12 citations/sec
- Maximum (9): ≥25 citations/sec
- P95 latency: <2 seconds

**Usage:**

```bash
# Basic usage (100 citations per scenario)
npx tsx scripts/benchmark/citation-throughput.ts

# Custom number of citations
npx tsx scripts/benchmark/citation-throughput.ts --num-citations=200

# Custom output file
npx tsx scripts/benchmark/citation-throughput.ts --output=benchmarks/custom_results.md

# With environment variables
ADMIN_PASSWORD=<password> \
MARCUS_API_URL=http://localhost:3000 \
NUM_CITATIONS=150 \
  npx tsx scripts/benchmark/citation-throughput.ts
```

**Output:** `benchmarks/citation_throughput_baseline_YYYYMMDD.md`

**Environment Variables:**
- `MARCUS_API_URL` - API base URL (default: `http://localhost:3000`)
- `ADMIN_EMAIL` - Admin email (default: `admin@marcus.local`)
- `ADMIN_PASSWORD` - Admin password (required)
- `NUM_CITATIONS` - Citations per scenario (default: 100)
- `OUTPUT_PATH` - Output file path

---

### 3.1.2 Agent Latency Benchmark

**Script:** `agent-latency.ts`

**Purpose:** Measure IPC communication latency between TypeScript platform and Python agents

**Metrics:**
- Agent spawn time (cold start)
- IPC message round-trip time
- Agent processing time (pure computation)
- Network overhead analysis

**Success Criteria:**
- Cold start: <3 seconds
- IPC round-trip: <50ms
- Processing time: <500ms per citation
- P95 latency: <2000ms

**Usage:**

```bash
# Basic usage (50 samples)
npx tsx scripts/benchmark/agent-latency.ts

# Custom number of samples
npx tsx scripts/benchmark/agent-latency.ts --num-samples=100

# Custom output file
npx tsx scripts/benchmark/agent-latency.ts --output=benchmarks/custom_latency.md

# With environment variables
ADMIN_PASSWORD=<password> \
MARCUS_API_URL=http://localhost:3000 \
NUM_SAMPLES=75 \
  npx tsx scripts/benchmark/agent-latency.ts
```

**Output:** `benchmarks/agent_latency_baseline_YYYYMMDD.md`

**Environment Variables:**
- `MARCUS_API_URL` - API base URL (default: `http://localhost:3000`)
- `ADMIN_EMAIL` - Admin email (default: `admin@marcus.local`)
- `ADMIN_PASSWORD` - Admin password (required)
- `NUM_SAMPLES` - Number of latency samples (default: 50)
- `OUTPUT_PATH` - Output file path

---

### 3.1.3 Database Performance Analysis

**Script:** `setup-slow-query-logging.sh` + `analyze-database-performance.sh`

**Purpose:** Enable PostgreSQL slow query logging and analyze database performance

**Metrics:**
- Slow queries (>100ms)
- Most frequent queries
- Missing indexes
- Connection pool usage
- Cache hit ratio

**Success Criteria:**
- No queries >100ms at baseline load
- All tables have appropriate indexes
- Connection pool never exhausted
- Cache hit ratio >95%

**Usage:**

```bash
# Step 1: Enable slow query logging (run once)
sudo ./scripts/benchmark/setup-slow-query-logging.sh

# Step 2: Run benchmarks to generate queries
npx tsx scripts/benchmark/citation-throughput.ts

# Step 3: Analyze database performance
sudo ./scripts/benchmark/analyze-database-performance.sh

# Custom output file
sudo ./scripts/benchmark/analyze-database-performance.sh benchmarks/custom_db_report.md
```

**Output:** `benchmarks/database_performance_YYYYMMDD.md`

**What it analyzes:**
- Slow queries from PostgreSQL logs (last 24 hours)
- Table sizes and row counts
- Index usage statistics
- Sequential scan vs index scan ratios
- Connection pool statistics
- Cache hit ratio

---

## 🚀 Quick Start

### Prerequisites

1. **MARCUS 3.0 Platform Running:**
   ```bash
   # Verify platform is running
   curl http://localhost:3000/health
   ```

2. **Admin Credentials:**
   ```bash
   # Get admin password
   sudo cat /tmp/marcus_admin_credentials.txt
   # Or from environment
   export ADMIN_PASSWORD=<password-from-file>
   ```

3. **Dependencies Installed:**
   ```bash
   npm install
   ```

### Running All Benchmarks

```bash
# Enable database slow query logging
sudo ./scripts/benchmark/setup-slow-query-logging.sh

# Run citation throughput benchmark
ADMIN_PASSWORD=<password> npx tsx scripts/benchmark/citation-throughput.ts

# Run agent latency benchmark
ADMIN_PASSWORD=<password> npx tsx scripts/benchmark/agent-latency.ts

# Analyze database performance
sudo ./scripts/benchmark/analyze-database-performance.sh

# View results
ls -lh benchmarks/
```

---

## 📈 Interpreting Results

### Citation Throughput

**Good Performance Indicators:**
- ✅ All scenarios meet target throughput
- ✅ P95 latency <2 seconds
- ✅ Low error rate (<1%)
- ✅ Consistent throughput across runs

**Performance Issues:**
- ❌ Throughput below target (add more agents, optimize queries)
- ❌ P95 latency >2 seconds (check database slow queries, agent processing)
- ❌ High error rate (check logs, fix bugs)
- ❌ Throughput degrades over time (memory leak, connection pool exhaustion)

### Agent Latency

**Good Performance Indicators:**
- ✅ IPC round-trip <50ms
- ✅ P95 latency <2000ms
- ✅ Low network overhead (<20% of total latency)
- ✅ All agents healthy

**Performance Issues:**
- ❌ IPC >50ms (agent compute-bound, optimize Python code)
- ❌ P95 >2000ms (slow database queries, agent bottlenecks)
- ❌ High network overhead (HTTP keep-alive, use Unix sockets)
- ❌ Unhealthy agents (check agent logs, restart agents)

### Database Performance

**Good Performance Indicators:**
- ✅ No slow queries (all <100ms)
- ✅ High index usage (>80%)
- ✅ Cache hit ratio >95%
- ✅ No sequential scans on large tables

**Performance Issues:**
- ❌ Many slow queries (add indexes, optimize queries)
- ❌ Low index usage (missing indexes, inefficient queries)
- ❌ Low cache hit ratio (increase `shared_buffers`)
- ❌ Sequential scans on large tables (missing indexes)

---

## 🔍 Troubleshooting

### Authentication Failed

**Error:** `Authentication failed. Check credentials in environment variables.`

**Solution:**
```bash
# Ensure ADMIN_PASSWORD is set
export ADMIN_PASSWORD=$(sudo cat /tmp/marcus_admin_credentials.txt | grep Password | cut -d: -f2 | xargs)

# Verify it's set
echo $ADMIN_PASSWORD

# Run benchmark again
npx tsx scripts/benchmark/citation-throughput.ts
```

### Platform Not Running

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:3000`

**Solution:**
```bash
# Check if platform is running
sudo systemctl status marcus-platform

# Start platform if needed
sudo systemctl start marcus-platform

# Check health
curl http://localhost:3000/health
```

### No Healthy Agents

**Error:** `No healthy agents found. Please start the platform with agents enabled.`

**Solution:**
```bash
# Check agent status
curl -X POST http://localhost:3000/api/admin/agents \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"action":"health"}'

# Restart platform with agents
sudo systemctl restart marcus-platform

# Wait for agents to initialize (30 seconds)
sleep 30
```

### Database Permission Denied

**Error:** `Permission denied` when running database scripts

**Solution:**
```bash
# Run database scripts with sudo
sudo ./scripts/benchmark/setup-slow-query-logging.sh
sudo ./scripts/benchmark/analyze-database-performance.sh
```

### PostgreSQL Logs Not Found

**Error:** `Log directory not found. Run setup-slow-query-logging.sh first.`

**Solution:**
```bash
# Enable slow query logging first
sudo ./scripts/benchmark/setup-slow-query-logging.sh

# Then run benchmarks to generate queries
ADMIN_PASSWORD=<password> npx tsx scripts/benchmark/citation-throughput.ts

# Then analyze performance
sudo ./scripts/benchmark/analyze-database-performance.sh
```

---

## 📁 Output Files

All benchmark results are saved to `benchmarks/` directory:

```
benchmarks/
├── citation_throughput_baseline_2025-11-21.md  # Throughput benchmark results
├── agent_latency_baseline_2025-11-21.md        # Latency benchmark results
└── database_performance_2025-11-21.md          # Database analysis report
```

**Reports include:**
- Executive summary with pass/fail status
- Detailed metrics tables
- Performance graphs (ASCII art)
- Recommendations for optimization
- Next steps

---

## 🎯 Success Criteria Summary

| Metric | Target | Critical? |
|--------|--------|-----------|
| **Throughput (9 agents)** | ≥25 citations/sec | ✅ Yes |
| **P95 Latency** | <2000ms | ✅ Yes |
| **IPC Round-Trip** | <50ms | ⚠️ Recommended |
| **Processing Time** | <500ms | ⚠️ Recommended |
| **Cache Hit Ratio** | >95% | ⚠️ Recommended |
| **Slow Queries** | 0 queries >100ms | ⚠️ Recommended |

---

## 🔗 Related Documentation

- **Phase 3 Plan:** `PHASE_3_PERFORMANCE_MONITORING.md`
- **Platform README:** `src/platform/README.md`
- **Master TOC:** `docs/MARCUS_MASTER_TABLE_OF_CONTENTS.md`

---

## 📞 Support

For issues with benchmarking:
1. Check logs: `sudo journalctl -u marcus-platform -n 100`
2. Verify platform health: `curl http://localhost:3000/health`
3. Review agent status: `POST /api/admin/agents {"action":"health"}`
4. Check database connectivity: `psql -h localhost -p 5432 -U marcus -d marcus_test -c "SELECT 1"`

---

**Last Updated:** 2025-11-21
**Phase:** 3.1 (Performance Benchmarking)
**Status:** Ready for Use ✅
