# MARCUS 3.0 Monitoring Overview

**Complete monitoring stack with 5 production-ready Grafana dashboards and 16 automated alerts.**

This document provides a high-level overview of the MARCUS monitoring infrastructure. For detailed setup instructions, see `monitoring/README.md`.

---

## 🎯 At a Glance

**Monitoring Stack:**
- ✅ Prometheus - Metrics collection and alerting
- ✅ Grafana - 5 pre-built dashboards
- ✅ Exporters - PostgreSQL, Redis, Node
- ✅ Alerts - 16 critical/high/medium alerts
- ✅ Setup Script - `sudo ./scripts/setup-monitoring.sh` (5-10 min)

**Access Points:**
- Grafana UI: http://localhost:5000 (admin/admin)
- Prometheus UI: http://localhost:9090
- Alert Manager: http://localhost:9093

**NOTE:** Port 5000 (not 3000) - Game Simulation is on port 4000. See `docs/PORT_SEPARATION.md`.

---

## 📊 Dashboard Suite

### Dashboard 1: Platform Overview
**Purpose:** High-level platform health and performance

**Metrics:**
- **Request Rate:** HTTP requests per second by endpoint
- **Error Rate:** 5xx errors as percentage of total requests
- **P95 Response Time:** 95th percentile latency (target: <500ms)
- **Active Connections:** Database connection pool usage
- **Platform Uptime:** Rolling 30-day uptime percentage

**Key Insights:**
- Detect traffic spikes and anomalies
- Identify error rate increases
- Monitor response time degradation
- Track connection pool saturation

**Alerts:**
- 🚨 High Error Rate >5%
- ⚠️ Slow Response >1s (P95)

**File:** `monitoring/grafana/dashboards/platform-overview.json`

---

### Dashboard 2: Agent Health
**Purpose:** Monitor Python agent performance and failures

**Metrics:**
- **Agent Status:** Health check per agent type (✅/❌)
- **Agent Throughput:** Citations analyzed per minute
- **Agent Response Time:** P95 latency per agent
- **Agent Errors:** Breakdown by error type (timeout, parse, API)

**Key Insights:**
- Identify failed or slow agents
- Monitor processing throughput
- Detect error patterns
- Track agent pool health

**Alerts:**
- 🚨 >2 Agents Down (Critical)
- ⚠️ Agent Response >500ms (Medium)

**File:** `monitoring/grafana/dashboards/agent-health.json`

---

### Dashboard 3: Database Metrics
**Purpose:** PostgreSQL performance and optimization

**Metrics:**
- **Query Time (P95):** Slowest queries (target: <50ms)
- **Connection Pool:** Active vs idle connections (alert: >90%)
- **Cache Hit Ratio:** Percentage of queries served from cache (target: >90%)
- **Transactions/Second:** Database throughput
- **Table Sizes:** Largest tables for optimization
- **Top 10 Slowest Queries:** Queries with P95 >100ms

**Key Insights:**
- Identify query performance bottlenecks
- Monitor connection pool exhaustion
- Optimize cache configuration
- Prioritize query optimization efforts

**Alerts:**
- 🚨 Database Down (Critical)
- 🚨 Connection Pool >90% (High)
- ⚠️ Cache Hit Ratio <90% (Medium)

**File:** `monitoring/grafana/dashboards/database-metrics.json`

---

### Dashboard 4: Redis Metrics
**Purpose:** Cache performance and memory management

**Metrics:**
- **Operations/Second:** GET/SET operations per second
- **Memory Usage:** Current vs max memory (alert: >90%)
- **Cache Hit Rate:** Hits vs misses (target: >80%)
- **Evicted Keys:** Keys removed per hour due to memory pressure
- **Connected Clients:** Active Redis connections
- **Keyspace:** Number of keys per database

**Key Insights:**
- Monitor cache effectiveness
- Detect memory pressure
- Identify eviction patterns
- Optimize cache strategy

**Alerts:**
- 🚨 Redis Down (Critical)
- 🚨 Memory Usage >90% (High)

**File:** `monitoring/grafana/dashboards/redis-metrics.json`

---

### Dashboard 5: Circuit Breakers
**Purpose:** Monitor circuit breaker health and failures

**Metrics:**
- **Circuit Breaker States:** Status grid (CLOSED/OPEN/HALF-OPEN)
  - 🟢 CLOSED: Normal operation
  - 🔴 OPEN: Circuit tripped (service failing)
  - 🟡 HALF-OPEN: Testing recovery
- **Circuit Breaker Trips:** Timeline of CB state changes
- **Success Rate by CB:** Percentage of successful requests
- **Recovery Time:** Average time from OPEN to CLOSED

**Monitored Services:**
- Database
- Redis
- Authentication
- Agent API

**Key Insights:**
- Detect cascading failures
- Monitor service recovery
- Identify flaky services
- Track circuit breaker effectiveness

**Alerts:**
- 🚨 Critical CB Open >5min (High)

**File:** `monitoring/grafana/dashboards/circuit-breakers.json`

---

## 🚨 Alert Configuration

### Alert Groups

**1. Platform Health (3 alerts)**
| Alert | Severity | Threshold | Action |
|-------|----------|-----------|--------|
| Platform Down | 🚨 Critical | /health endpoint down | Page on-call, all-hands |
| High Error Rate | 🚨 High | >5% 5xx errors | Investigate logs, rollback if needed |
| Slow Response | ⚠️ Medium | P95 >1s | Check slow queries, CPU usage |

**2. Database Health (3 alerts)**
| Alert | Severity | Threshold | Action |
|-------|----------|-----------|--------|
| Database Down | 🚨 Critical | PostgreSQL unreachable | Emergency DB restore |
| Connection Pool | 🚨 High | >90% pool usage | Kill long queries, increase pool |
| Cache Hit Ratio | ⚠️ Medium | <90% | Review query patterns, add indexes |

**3. Redis Health (2 alerts)**
| Alert | Severity | Threshold | Action |
|-------|----------|-----------|--------|
| Redis Down | 🚨 Critical | Redis unreachable | Restart Redis, failover |
| Memory Usage | 🚨 High | >90% max memory | Flush old keys, increase maxmemory |

**4. Agent Health (2 alerts)**
| Alert | Severity | Threshold | Action |
|-------|----------|-----------|--------|
| Multiple Agents Down | 🚨 Critical | >2 agents unhealthy | Restart agent pool |
| Slow Agent Response | ⚠️ Medium | P95 >500ms | Check Python logs, resource usage |

**5. Circuit Breakers (1 alert)**
| Alert | Severity | Threshold | Action |
|-------|----------|-----------|--------|
| Critical CB Open | 🚨 High | CB open >5min | Check underlying service, manual intervention |

**6. System Resources (3 alerts)**
| Alert | Severity | Threshold | Action |
|-------|----------|-----------|--------|
| High CPU | 🚨 High | >90% for 5min | Identify CPU hog, scale horizontally |
| High Memory | 🚨 High | >90% for 5min | Check for memory leaks, restart |
| Disk Full | 🚨 Critical | >90% disk usage | Clean logs, expand volume |

**Alert File:** `monitoring/alerting/marcus-platform.yml`

---

## 🔧 Quick Setup

### 1. Install Monitoring Stack

```bash
# Run automated setup script
cd ~/ai_game_theory_simulation
sudo ./scripts/setup-monitoring.sh
```

**Installation time:** 5-10 minutes

**Services installed:**
- Prometheus → http://localhost:9090
- Grafana → http://localhost:5000 (MARCUS monitoring only)
- Node Exporter → http://localhost:9100
- PostgreSQL Exporter → http://localhost:9187
- Redis Exporter → http://localhost:9121

**NOTE:** Grafana is on port 5000. Port 4000 is used by Game Simulation (separate system).

### 2. Configure Grafana

```bash
# Access Grafana
open http://localhost:5000

# Login: admin/admin (change password on first login)

# Add Prometheus data source:
# Settings → Data Sources → Add Prometheus
# URL: http://localhost:9090
# Access: Server (default)
# Save & Test
```

### 3. Import Dashboards

**Option A: Auto-provision (Recommended)**
```bash
# Dashboards auto-installed to:
/var/lib/grafana/dashboards/

# Restart Grafana to load:
sudo systemctl restart grafana-server
```

**Option B: Manual import**
```bash
# Grafana UI → Dashboards → Import
# Upload JSON file from: monitoring/grafana/dashboards/

# Import all 5:
- platform-overview.json
- agent-health.json
- database-metrics.json
- redis-metrics.json
- circuit-breakers.json
```

### 4. Configure Alerting

**Option A: Prometheus Alertmanager**
```bash
# Install Alertmanager
sudo apt-get install prometheus-alertmanager

# Configure routes
sudo nano /etc/prometheus/alertmanager.yml

# Restart
sudo systemctl restart prometheus-alertmanager
```

**Option B: Grafana Alerts**
```bash
# Grafana UI → Alerting → Notification channels
# Add: Slack, PagerDuty, Email, Webhook

# Alerts already configured in dashboards
# Customize thresholds as needed
```

### 5. Verify Setup

```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# Should show:
# - marcus-platform (up)
# - node-exporter (up)
# - postgres-exporter (up)
# - redis-exporter (up)

# Check Grafana health
curl http://localhost:5000/api/health

# Access dashboards
open http://localhost:5000/dashboards
```

---

## 📈 Common Queries (PromQL)

### Platform Metrics

**Request rate (last 5 min):**
```promql
rate(http_requests_total{job="marcus-platform"}[5m])
```

**Error rate percentage:**
```promql
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) * 100
```

**P95 response time:**
```promql
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

### Database Metrics

**Active connections:**
```promql
pg_stat_database_numbackends{datname="marcus_production"}
```

**Cache hit ratio:**
```promql
rate(pg_stat_database_blks_hit[5m]) / (rate(pg_stat_database_blks_hit[5m]) + rate(pg_stat_database_blks_read[5m])) * 100
```

**Slow queries (>100ms):**
```promql
pg_stat_statements_mean_exec_time_seconds{datname="marcus_production"} > 0.1
```

### Redis Metrics

**Operations per second:**
```promql
rate(redis_commands_processed_total[5m])
```

**Memory usage percentage:**
```promql
redis_memory_used_bytes / redis_memory_max_bytes * 100
```

**Cache hit rate:**
```promql
rate(redis_keyspace_hits_total[5m]) / (rate(redis_keyspace_hits_total[5m]) + rate(redis_keyspace_misses_total[5m])) * 100
```

### Agent Metrics

**Agent throughput:**
```promql
rate(marcus_agent_citations_processed_total[5m])
```

**Agent errors:**
```promql
rate(marcus_agent_errors_total[5m])
```

### Circuit Breaker Metrics

**Circuit breaker state:**
```promql
marcus_circuit_breaker_state{circuit="database"}
# 0 = CLOSED (healthy)
# 1 = HALF_OPEN (testing)
# 2 = OPEN (failing)
```

**Success rate:**
```promql
rate(marcus_circuit_breaker_successes[5m]) / rate(marcus_circuit_breaker_total[5m]) * 100
```

---

## 🔍 Troubleshooting

### Dashboard Not Loading

**Symptom:** Grafana dashboard shows "No data"

**Check:**
1. Prometheus targets healthy: http://localhost:9090/targets
2. Data source configured: Grafana → Settings → Data Sources
3. Time range: Dashboard → Time picker (try "Last 1 hour")
4. Metrics exist: Prometheus → Graph → Execute query

**Fix:**
```bash
# Restart Prometheus
sudo systemctl restart prometheus

# Check logs
sudo journalctl -u prometheus -n 50
```

### Alerts Not Firing

**Symptom:** Alert condition met but no notification

**Check:**
1. Alert rule syntax: http://localhost:9090/alerts
2. Notification channel configured: Grafana → Alerting → Channels
3. Alert state: Dashboard panel → Alert tab

**Fix:**
```bash
# Test alert manually
curl -X POST http://localhost:9093/api/v1/alerts \
  -H "Content-Type: application/json" \
  -d '{"labels":{"alertname":"test"}}'

# Check Alertmanager logs
sudo journalctl -u prometheus-alertmanager -n 50
```

### High Memory Usage (Prometheus)

**Symptom:** Prometheus using >2GB RAM

**Check:**
- Retention period: `--storage.tsdb.retention.time=30d`
- Scrape interval: `scrape_interval: 15s`
- Number of targets: http://localhost:9090/targets

**Fix:**
```bash
# Reduce retention to 15 days
sudo nano /etc/prometheus/prometheus.yml
# Add: --storage.tsdb.retention.time=15d

# Restart
sudo systemctl restart prometheus
```

### Exporter Down

**Symptom:** Target shows "DOWN" in Prometheus

**Check:**
```bash
# PostgreSQL Exporter
curl http://localhost:9187/metrics

# Redis Exporter
curl http://localhost:9121/metrics

# Node Exporter
curl http://localhost:9100/metrics
```

**Fix:**
```bash
# Restart exporter
sudo systemctl restart postgres_exporter
sudo systemctl restart redis_exporter
sudo systemctl restart node_exporter

# Check logs
sudo journalctl -u postgres_exporter -n 50
```

---

## 📚 Additional Resources

**Documentation:**
- Setup Guide: `monitoring/README.md`
- Alert Reference: `monitoring/alerting/marcus-platform.yml`
- Deployment Guide: `docs/MARCUS_DEPLOYMENT_GUIDE.md`
- Performance Tuning: `docs/MARCUS_PERFORMANCE_TUNING.md`
- Production Runbook: `docs/MARCUS_PRODUCTION_RUNBOOK.md`

**Prometheus Documentation:**
- https://prometheus.io/docs/prometheus/latest/querying/basics/
- https://prometheus.io/docs/alerting/latest/overview/

**Grafana Documentation:**
- https://grafana.com/docs/grafana/latest/dashboards/
- https://grafana.com/docs/grafana/latest/alerting/

**Exporters:**
- PostgreSQL Exporter: https://github.com/prometheus-community/postgres_exporter
- Redis Exporter: https://github.com/oliver006/redis_exporter
- Node Exporter: https://github.com/prometheus/node_exporter

---

## 🎯 Next Steps

1. **Install monitoring stack:**
   ```bash
   sudo ./scripts/setup-monitoring.sh
   ```

2. **Configure Grafana:**
   - Add Prometheus data source
   - Import 5 dashboards
   - Configure notification channels

3. **Set up alerting:**
   - Configure Alertmanager or Grafana alerts
   - Test alert notifications
   - Document on-call procedures

4. **Customize for your environment:**
   - Adjust alert thresholds
   - Add custom dashboards
   - Configure retention periods

5. **Integrate with existing tools:**
   - PagerDuty for critical alerts
   - Slack for team notifications
   - Status page for customer updates

**Questions?** See `monitoring/README.md` or contact platform-team@yourdomain.com
