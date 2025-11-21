# MARCUS 3.0 - Monitoring & Observability

**Phase 3.2: Monitoring Setup**

Comprehensive monitoring stack for MARCUS 3.0 Citation Integrity Platform using Prometheus + Grafana.

---

## 📊 Stack Overview

**Monitoring Components:**
- **Prometheus** - Metrics collection and alerting
- **Grafana** - Dashboards and visualization
- **Node Exporter** - System metrics (CPU, memory, disk)
- **PostgreSQL Exporter** - Database metrics
- **Redis Exporter** - Cache metrics

**Metrics Collected:**
- HTTP request rates and latency
- Agent health and performance
- Database query performance
- Redis cache hit rates
- Circuit breaker states
- System resources (CPU, memory, disk)

---

## 🚀 Quick Start

### Installation

```bash
# On marcus-test-vm (requires sudo)
cd ~/ai_game_theory_simulation
sudo ./scripts/setup-monitoring.sh
```

**Installation time:** ~5-10 minutes

**What gets installed:**
- Prometheus (port 9090)
- Grafana (port 3000)
- Node Exporter (port 9100)
- PostgreSQL Exporter (port 9187)
- Redis Exporter (port 9121)

### Post-Installation Configuration

**1. Configure Grafana Data Source:**
```bash
# Open Grafana
http://localhost:3000

# Login: admin/admin (change on first login)

# Add Prometheus data source:
# - URL: http://localhost:9090
# - Access: Server (default)
# - Save & Test
```

**2. Import Dashboards:**

Dashboards are pre-installed in `/var/lib/grafana/dashboards/`:
- `platform-overview.json` - Request rate, errors, latency
- `agent-health.json` - Agent status and performance
- `database-metrics.json` - Query time, connections, cache
- `redis-metrics.json` - Operations, memory, cache hits
- `circuit-breakers.json` - Circuit breaker states

Import via Grafana UI or auto-provision.

**3. Generate JWT Token for Prometheus:**

```bash
# Login to MARCUS platform and get access token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@marcus.local","password":"<admin-password>"}'

# Save token to Prometheus config
echo "YOUR_ACCESS_TOKEN" | sudo tee /etc/prometheus/marcus_token.txt
sudo chmod 600 /etc/prometheus/marcus_token.txt

# Restart Prometheus
sudo systemctl restart prometheus
```

---

## 📈 Dashboards

### 1. Platform Overview
**File:** `grafana/dashboards/platform-overview.json`

**Metrics:**
- Request rate (req/sec)
- Error rate (%)
- P95 response time
- Active connections
- Uptime

**Use cases:**
- Monitor overall platform health
- Detect traffic spikes
- Identify error rate increases

---

### 2. Agent Health
**File:** `grafana/dashboards/agent-health.json`

**Metrics:**
- Agent status (healthy/unhealthy)
- Agent throughput (citations/sec)
- Agent response time (P95)
- Agent errors by type

**Use cases:**
- Monitor Python agent health
- Identify slow agents
- Detect agent failures

**Alerts:**
- Agent response time >500ms (P95)
- >2 agents unhealthy

---

### 3. Database Metrics
**File:** `grafana/dashboards/database-metrics.json`

**Metrics:**
- Query time (P95)
- Connection pool usage
- Cache hit ratio
- Transactions per second
- Table sizes

**Use cases:**
- Identify slow queries
- Monitor connection pool
- Optimize cache hit ratio

**Alerts:**
- Connection pool >90% full
- Cache hit ratio <90%

---

### 4. Redis Metrics
**File:** `grafana/dashboards/redis-metrics.json`

**Metrics:**
- Operations per second
- Cache hit rate
- Memory usage
- Connected clients
- Evicted keys

**Use cases:**
- Monitor cache performance
- Detect memory pressure
- Optimize eviction policy

**Alerts:**
- Memory usage >90%

---

### 5. Circuit Breakers
**File:** `grafana/dashboards/circuit-breakers.json`

**Metrics:**
- Circuit breaker states (CLOSED/OPEN/HALF_OPEN)
- Circuit breaker trips
- Recovery time
- Success rate by service

**Use cases:**
- Monitor service resilience
- Detect cascading failures
- Track recovery times

**Alerts:**
- Circuit breaker open for critical services (database, redis)

---

## 🚨 Alert Rules

**File:** `alerting/marcus-platform.yml`

**Alert Groups:**
1. **Platform Health** - Platform down, high error rate, slow response
2. **Database Health** - PostgreSQL down, connection pool exhausted, low cache hit
3. **Redis Health** - Redis down, high memory usage
4. **Agent Health** - Multiple agents down, agent slow response
5. **Circuit Breakers** - Critical circuit breaker open
6. **System Resources** - High CPU, high memory, low disk space

**Alert Severity Levels:**
- **Critical** - Immediate action required (platform down, database down)
- **High** - Requires attention within 15 minutes (high error rate, connection pool exhausted)
- **Medium** - Investigate within 1 hour (agent slow response, low cache hit ratio)

**Alert Destinations:**
- Console logs (default)
- Alertmanager (optional, requires configuration)
- Email/Slack/PagerDuty (via Alertmanager)

---

## 🔧 Configuration Files

**Prometheus:**
- Config: `prometheus/prometheus.yml`
- Alerts: `alerting/marcus-platform.yml`
- Token: `/etc/prometheus/marcus_token.txt` (generated post-install)

**Grafana:**
- Dashboards: `grafana/dashboards/*.json`
- Data source: Prometheus @ http://localhost:9090

**Exporters:**
- Node Exporter: System metrics (auto-configured)
- PostgreSQL Exporter: Database metrics (requires DATABASE_PASSWORD)
- Redis Exporter: Cache metrics (requires REDIS_PASSWORD)

---

## 📊 Metrics Reference

### HTTP Metrics
```promql
# Request rate
rate(http_requests_total[5m])

# Error rate
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])

# P95 latency
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

### Agent Metrics
```promql
# Agent status
agent_status{status="healthy"}

# Agent throughput
rate(citations_analyzed_total[5m])

# Agent response time (P95)
histogram_quantile(0.95, rate(agent_response_time_seconds_bucket[5m]))
```

### Database Metrics
```promql
# Connection pool usage
pg_stat_database_numbackends / pg_settings_max_connections

# Cache hit ratio
pg_stat_database_blks_hit / (pg_stat_database_blks_hit + pg_stat_database_blks_read)

# Transactions per second
rate(pg_stat_database_xact_commit[5m])
```

### Redis Metrics
```promql
# Cache hit rate
rate(redis_keyspace_hits_total[5m]) / (rate(redis_keyspace_hits_total[5m]) + rate(redis_keyspace_misses_total[5m]))

# Memory usage
redis_memory_used_bytes / redis_memory_max_bytes

# Operations per second
rate(redis_commands_total[5m])
```

---

## 🔍 Troubleshooting

### Prometheus Not Scraping MARCUS Platform

**Error:** `Get "http://localhost:3000/api/metrics": 401 Unauthorized`

**Solution:**
```bash
# Generate JWT token and save to file
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@marcus.local","password":"<password>"}' | \
  jq -r '.accessToken' | sudo tee /etc/prometheus/marcus_token.txt

sudo chmod 600 /etc/prometheus/marcus_token.txt
sudo systemctl restart prometheus
```

### Grafana Dashboards Not Showing Data

**Check:**
1. Prometheus data source configured correctly
2. Prometheus scraping targets successfully
3. Time range set correctly (default: last 1 hour)

```bash
# Verify Prometheus targets
curl http://localhost:9090/api/v1/targets | jq '.data.activeTargets[].health'
# Should show "up" for all targets
```

### PostgreSQL Exporter Not Working

**Error:** `connection refused` or `authentication failed`

**Solution:**
```bash
# Check DATABASE_PASSWORD environment variable
echo $DATABASE_PASSWORD

# Update PostgreSQL exporter config
sudo nano /etc/default/prometheus-postgres-exporter
# Update DATA_SOURCE_NAME with correct password

sudo systemctl restart prometheus-postgres-exporter
```

---

## 📖 Related Documentation

- **Phase 3 Plan:** `PHASE_3_PERFORMANCE_MONITORING.md`
- **Benchmarking:** `scripts/benchmark/README.md`
- **Master TOC:** `docs/MARCUS_MASTER_TABLE_OF_CONTENTS.md`
- **Production Runbook:** `docs/MARCUS_PRODUCTION_RUNBOOK.md`

---

**Last Updated:** 2025-11-21
**Phase:** 3.2 (Monitoring Setup)
**Status:** Ready for Deployment ✅
