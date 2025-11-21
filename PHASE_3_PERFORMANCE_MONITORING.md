# MARCUS 3.0 - Phase 3: Performance & Monitoring

**Date:** November 20, 2025
**Branch:** `claude/build-marcus-agent-016LTPXuAb6A3hYDwTvMjyof`
**Status:** 🚀 READY TO BEGIN

---

## 📊 Phase 2 Summary (Complete)

**Completed:**
- ✅ JWT secrets generated (256-bit)
- ✅ Database migrations applied (users, citations, agents, audit tables)
- ✅ Admin password changed to secure random password
- ✅ Test configuration fixed (5 commits):
  - PostgreSQL port 5433
  - Prometheus metric cleanup
  - CircuitBreaker enum export
  - Indigenous paradigm socialCohesion structure
  - Clean test output (--forceExit, verbose: false)

**Platform State:**
```
🟢 OPERATIONAL
├── HTTP Server: port 3000 ✅
├── Database: PostgreSQL 5433 ✅
├── Redis: port 6379 ✅ (auth disabled)
├── Python Agents: 9/9 running ✅
└── Admin: admin@marcus.local (secure password) ✅
```

---

## 🎯 Phase 3 Objectives

**Focus:** Measure, monitor, and optimize platform performance

**Goal:** Ensure MARCUS 3.0 can handle production workloads with:
- Predictable performance under load
- Real-time monitoring and alerting
- Graceful degradation during failures
- Comprehensive health checking

---

## 📋 Phase 3 Tasks

### **3.1 Performance Benchmarking** (Priority: HIGH)

**Objective:** Establish baseline performance metrics

#### **3.1.1 Citation Analysis Throughput**
**Goal:** Measure how many citations can be analyzed per second

**Tasks:**
- [ ] Create benchmark script: `scripts/benchmark/citation-throughput.ts`
- [ ] Test scenarios:
  - Single agent performance (1 agent, sequential)
  - Multi-agent parallel (3 agents, concurrent)
  - Maximum load (9 agents, concurrent)
- [ ] Measure:
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
- Database queries: <100ms average

**Deliverable:** `benchmarks/citation_throughput_baseline_YYYYMMDD.md`

---

#### **3.1.2 Agent Response Times**
**Goal:** Measure IPC communication latency

**Tasks:**
- [ ] Create benchmark script: `scripts/benchmark/agent-latency.ts`
- [ ] Measure:
  - Agent spawn time (cold start)
  - IPC message round-trip time
  - Agent processing time (pure computation)
  - Memory usage per agent
  - CPU usage per agent

**Success Criteria:**
- Cold start: <3 seconds
- IPC round-trip: <50ms
- Processing time: <500ms per citation
- Memory: <100MB per agent
- CPU: <50% per agent (single core)

**Deliverable:** `benchmarks/agent_latency_baseline_YYYYMMDD.md`

---

#### **3.1.3 Database Performance**
**Goal:** Identify slow queries and optimize indexes

**Tasks:**
- [ ] Enable PostgreSQL slow query logging
- [ ] Run load test and capture slow queries
- [ ] Analyze query patterns:
  - Most frequent queries
  - Slowest queries
  - Missing indexes
- [ ] Create indexes for slow queries
- [ ] Re-run benchmarks to verify improvements

**Success Criteria:**
- No queries >100ms at baseline load
- All tables have appropriate indexes
- Connection pool never exhausted

**Deliverable:** `benchmarks/database_performance_YYYYMMDD.md`

---

### **3.2 Monitoring Setup** (Priority: HIGH)

**Objective:** Real-time visibility into platform health

#### **3.2.1 Prometheus Metrics Collection**
**Goal:** Export platform metrics for monitoring

**Tasks:**
- [ ] Install Prometheus: `sudo apt install prometheus`
- [ ] Configure Prometheus scrape: `http://localhost:3000/metrics`
- [ ] Verify metrics collection:
  - HTTP request counts and latencies
  - Database connection pool stats
  - Redis cache hit/miss rates
  - Agent status (running/failed)
  - Circuit breaker state changes

**Success Criteria:**
- Metrics endpoint responding
- Prometheus scraping every 15 seconds
- All critical metrics present

**Deliverable:** `/etc/prometheus/prometheus.yml` configuration

---

#### **3.2.2 Grafana Dashboards**
**Goal:** Visual dashboards for platform monitoring

**Tasks:**
- [ ] Install Grafana: `sudo apt install grafana`
- [ ] Create dashboards:
  - **Platform Overview:** Request rate, error rate, latency
  - **Agent Health:** Agent status, throughput, errors
  - **Database:** Query time, connection pool, transactions/sec
  - **Redis:** Operations/sec, cache hit rate, memory usage
  - **Circuit Breakers:** State changes, trip events, recovery time

**Success Criteria:**
- 5 dashboards created and functional
- All critical metrics visible
- Dashboards refreshing every 5 seconds

**Deliverable:** `dashboards/marcus-platform-overview.json`

---

#### **3.2.3 Alert Configuration**
**Goal:** Notify operators of issues

**Tasks:**
- [ ] Configure Prometheus alerts:
  - High error rate (>5% of requests)
  - Slow response time (P95 >2 seconds)
  - Database connection pool exhausted
  - Redis down
  - Agent failures (>2 agents down)
  - Circuit breaker open (critical services)

**Success Criteria:**
- 6 alert rules configured
- Test alerts firing correctly
- Alerts documented with runbooks

**Deliverable:** `/etc/prometheus/alerts/marcus-platform.yml`

---

### **3.3 Load Testing** (Priority: MEDIUM)

**Objective:** Verify platform handles production load

#### **3.3.1 API Load Testing with k6**
**Goal:** Test HTTP API under sustained load

**Tasks:**
- [ ] Install k6: `sudo snap install k6`
- [ ] Create load test script: `tests/load/api-load-test.js`
- [ ] Test scenarios:
  - Baseline: 10 RPS for 5 minutes
  - Sustained: 50 RPS for 10 minutes
  - Spike: 100 RPS for 2 minutes
  - Stress: Gradually increase to breaking point

**Metrics to track:**
- Request success rate
- Response time distribution
- Errors by type
- Database connections used
- Memory/CPU usage

**Success Criteria:**
- 99.9% success rate at 50 RPS
- P95 latency <2s at 50 RPS
- No crashes or memory leaks
- Graceful degradation at high load

**Deliverable:** `tests/load/load-test-results_YYYYMMDD.md`

---

#### **3.3.2 Multi-Agent Stress Testing**
**Goal:** Test agent system under concurrent load

**Tasks:**
- [ ] Create stress test: `scripts/stress-test-agents.ts`
- [ ] Scenarios:
  - Burst: 100 citations submitted simultaneously
  - Sustained: 50 citations/sec for 5 minutes
  - Agent failure: Kill agents mid-request (test recovery)

**Success Criteria:**
- No agent crashes
- All citations eventually processed
- Dead letter queue working (failed requests queued)
- Circuit breakers tripping appropriately

**Deliverable:** `benchmarks/agent_stress_test_YYYYMMDD.md`

---

#### **3.3.3 Database Connection Pool Tuning**
**Goal:** Optimize pool size for workload

**Tasks:**
- [ ] Test different pool sizes: 5, 10, 20, 50
- [ ] Measure at each size:
  - Connection wait time
  - Query throughput
  - Memory usage
- [ ] Identify optimal pool size

**Success Criteria:**
- Pool size never exhausted at target load
- No excessive idle connections
- Documented pool size recommendations

**Deliverable:** `docs/database-pool-tuning.md`

---

### **3.4 Production Readiness** (Priority: MEDIUM)

**Objective:** Ensure platform ready for production deployment

#### **3.4.1 Health Check Improvements**
**Goal:** Comprehensive health endpoint

**Tasks:**
- [ ] Enhance `/health` endpoint to check:
  - Database connectivity (query test)
  - Redis connectivity (ping test)
  - Agent availability (count running)
  - Disk space (>10% free)
  - Memory usage (<90%)
- [ ] Add `/ready` endpoint (Kubernetes readiness)
- [ ] Add `/live` endpoint (Kubernetes liveness)

**Success Criteria:**
- Health check completes in <500ms
- Returns detailed status for each component
- Kubernetes-compatible format

**Deliverable:** Updated health endpoints in `src/platform/server.ts`

---

#### **3.4.2 Graceful Shutdown Verification**
**Goal:** Ensure clean shutdown under load

**Tasks:**
- [ ] Test graceful shutdown:
  - Send SIGTERM during load test
  - Verify in-flight requests complete
  - Verify database connections close
  - Verify agents shut down cleanly
- [ ] Add shutdown timeout (30 seconds)
- [ ] Add force-kill after timeout

**Success Criteria:**
- No requests fail during shutdown
- No database connection leaks
- Shutdown completes in <10 seconds

**Deliverable:** Verified graceful shutdown implementation

---

#### **3.4.3 Circuit Breaker Load Testing**
**Goal:** Verify circuit breakers protect services

**Tasks:**
- [ ] Simulate database failure during load test
- [ ] Verify circuit breaker opens
- [ ] Verify requests fail fast (no timeouts)
- [ ] Verify circuit breaker recovers after database returns
- [ ] Test with Redis failure
- [ ] Test with agent failures

**Success Criteria:**
- Circuit opens within 5 failures
- Requests fail fast (<100ms)
- Circuit auto-recovers after service restored
- No cascading failures

**Deliverable:** Circuit breaker load test report

---

## 🛠️ Tools & Setup

### **Install Required Tools**

```bash
# On marcus-test-vm

# Prometheus (metrics collection)
sudo apt update
sudo apt install prometheus -y
sudo systemctl enable prometheus
sudo systemctl start prometheus

# Grafana (dashboards)
sudo apt install grafana -y
sudo systemctl enable grafana-server
sudo systemctl start grafana-server

# k6 (load testing)
sudo snap install k6

# PostgreSQL slow query logging
sudo -u postgres psql -c "ALTER SYSTEM SET log_min_duration_statement = 100;"
sudo systemctl restart postgresql
```

---

## 📈 Success Metrics

**Phase 3 is complete when:**

- [ ] Baseline performance metrics documented
- [ ] Prometheus + Grafana monitoring operational
- [ ] 5 dashboards created and functional
- [ ] 6 alert rules configured and tested
- [ ] Load testing completed with acceptable results
- [ ] Production readiness checklist 100% complete

**Key Performance Indicators:**
- Citation throughput: ≥25/sec (9 agents)
- P95 latency: <2 seconds
- Error rate: <1% under normal load
- Uptime: ≥99.9%

---

## 📁 Deliverables

**Benchmarks:**
- `benchmarks/citation_throughput_baseline_YYYYMMDD.md`
- `benchmarks/agent_latency_baseline_YYYYMMDD.md`
- `benchmarks/database_performance_YYYYMMDD.md`
- `benchmarks/agent_stress_test_YYYYMMDD.md`

**Monitoring:**
- `/etc/prometheus/prometheus.yml`
- `/etc/prometheus/alerts/marcus-platform.yml`
- `dashboards/marcus-platform-overview.json`
- `dashboards/agent-health.json`
- `dashboards/database-metrics.json`

**Load Tests:**
- `tests/load/api-load-test.js`
- `tests/load/load-test-results_YYYYMMDD.md`

**Documentation:**
- `docs/database-pool-tuning.md`
- `docs/monitoring-setup.md`
- `docs/alerting-runbooks.md`

---

## ⏭️ Phase 4 Preview: Production Deployment

After Phase 3, Phase 4 will include:

1. **Infrastructure as Code** - Terraform/Ansible for VM provisioning
2. **CI/CD Pipeline** - GitHub Actions for automated deployment
3. **Backup & Recovery** - Database backups, disaster recovery procedures
4. **Security Hardening** - Redis auth, SSL/TLS, firewall rules
5. **Logging & Audit** - Structured logging, audit trail, log aggregation

---

## 🚀 Getting Started

**Recommended order:**

1. **Start with benchmarking** - Establish baseline before making changes
2. **Set up monitoring** - Visibility before optimization
3. **Run load tests** - Validate under realistic conditions
4. **Production readiness** - Final checks before deployment

**First task:**
```bash
# Create benchmark scripts directory
mkdir -p scripts/benchmark benchmarks dashboards tests/load docs

# Start with citation throughput benchmark
# (I can create this script for you)
```

**Ready to begin Phase 3?** Let me know which task you'd like to start with! 🎯
