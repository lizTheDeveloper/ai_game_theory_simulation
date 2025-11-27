# Service Level Objectives (SLOs)

**MARCUS 3.1 Platform - Production Quality Standards**

This document defines measurable SLOs for the MARCUS citation integrity platform.

## Overview

SLOs define the **target reliability** and **performance characteristics** of the platform. They are:
- **Measurable** - Tracked via Prometheus metrics
- **Achievable** - Based on historical data + 10% buffer
- **Business-aligned** - Impact user experience
- **Monitored** - Alerting when SLOs violated

---

## Core SLOs

### 1. Latency SLOs

**Objective:** 95% of requests complete within target latency.

| Endpoint | P95 Target | P99 Target | Measurement |
|----------|-----------|-----------|-------------|
| `POST /api/citations/analyze` | < 500ms | < 1s | `histogram_quantile(0.95, marcus_http_request_duration_seconds_bucket{route="/api/citations/analyze"})` |
| `GET /api/agents` | < 100ms | < 250ms | `histogram_quantile(0.95, marcus_http_request_duration_seconds_bucket{route="/api/agents"})` |
| `GET /health` | < 50ms | < 100ms | `histogram_quantile(0.95, marcus_http_request_duration_seconds_bucket{route="/health"})` |
| **Agent Analysis** | < 200ms | < 500ms | `histogram_quantile(0.95, marcus_agent_request_duration_seconds_bucket)` |

**Alert Threshold:** P95 > target for 5 consecutive minutes

**Example Alert:**
```yaml
- alert: HighP95Latency
  expr: histogram_quantile(0.95, rate(marcus_http_request_duration_seconds_bucket{route="/api/citations/analyze"}[5m])) > 0.5
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "P95 latency exceeded 500ms SLO"
    description: "Current P95: {{ $value }}s (target: 0.5s)"
```

---

### 2. Error Rate SLO

**Objective:** < 1% error rate (5xx errors) over 5-minute window.

| Component | Target Error Rate | Measurement |
|-----------|------------------|-------------|
| **Overall Platform** | < 1% | `sum(rate(marcus_http_requests_total{status_code=~"5.."}[5m])) / sum(rate(marcus_http_requests_total[5m]))` |
| **Citation Analysis** | < 0.5% | `sum(rate(marcus_citation_analysis_total{result="error"}[5m])) / sum(rate(marcus_citation_analysis_total[5m]))` |
| **Agent Communication** | < 2% | `sum(rate(marcus_errors_total{component="agent_wrapper"}[5m])) / sum(rate(marcus_agent_request_duration_seconds_count[5m]))` |

**Alert Threshold:** Error rate > 1% for 5 consecutive minutes

**Error Classification (for debugging):**
- `validation` - Client sent invalid data (not counted toward SLO)
- `network` - Transient network errors (counted, should be retried)
- `database` - Database unavailable (counted, critical)
- `auth` - Authentication failures (not counted if 401)
- `agent` - Agent process failures (counted, critical)
- `timeout` - Request timeout (counted, investigate performance)

**Example Alert:**
```yaml
- alert: HighErrorRate
  expr: sum(rate(marcus_errors_total{severity="error"}[5m])) / sum(rate(marcus_http_requests_total[5m])) > 0.01
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "Error rate exceeded 1% SLO"
    description: "Current error rate: {{ $value | humanizePercentage }} (target: <1%)"
```

---

### 3. Availability SLO

**Objective:** 99.9% uptime (43 minutes downtime/month).

| Service | Target Availability | Measurement |
|---------|-------------------|-------------|
| **Orchestrator** | 99.9% | `avg_over_time(up{job="marcus-orchestrator"}[30d])` |
| **Database** | 99.95% | `avg_over_time(up{job="postgres"}[30d])` |
| **Redis** | 99.95% | `avg_over_time(up{job="redis"}[30d])` |
| **Agent Pool** | 95% healthy | `sum(marcus_agent_status) / count(marcus_agent_status)` |

**Alert Threshold:**
- Critical: Service down for > 5 minutes
- Warning: < 95% agents healthy

**Planned Downtime:** Excluded from SLO calculation (use maintenance windows).

**Example Alert:**
```yaml
- alert: ServiceDown
  expr: up{job="marcus-orchestrator"} == 0
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "MARCUS orchestrator is down"
    description: "Service has been unavailable for 5+ minutes"
```

---

### 4. Throughput SLO

**Objective:** Handle 100 concurrent citation analyses without degradation.

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Peak Throughput** | 100 requests/sec | `sum(rate(marcus_citation_analysis_total[1m]))` |
| **Queue Processing** | < 10s lag | `max(marcus_queue_processing_lag_seconds)` |
| **Database Connections** | < 80% pool utilization | `marcus_db_pool_size{pool_type="active"} / marcus_db_pool_size{pool_type="total"}` |

**Alert Threshold:**
- Warning: Throughput degradation at 80% capacity
- Critical: Queue lag > 30s

**Example Alert:**
```yaml
- alert: QueueProcessingLag
  expr: max(marcus_queue_processing_lag_seconds) > 10
  for: 2m
  labels:
    severity: warning
  annotations:
    summary: "Queue processing lag exceeded 10s SLO"
    description: "Oldest item in queue: {{ $value }}s old"
```

---

### 5. State Synchronization SLO

**Objective:** 95% of state updates persisted within 100ms.

| Sync Type | P95 Target | Measurement |
|-----------|-----------|-------------|
| **Agent State** | < 100ms | `histogram_quantile(0.95, rate(marcus_state_sync_delay_seconds_bucket{sync_type="agent_state"}[5m]))` |
| **Analysis Results** | < 200ms | `histogram_quantile(0.95, rate(marcus_state_sync_delay_seconds_bucket{sync_type="analysis_result"}[5m]))` |

**Alert Threshold:** P95 sync delay > target for 5 minutes

**Example Alert:**
```yaml
- alert: HighStateSyncDelay
  expr: histogram_quantile(0.95, rate(marcus_state_sync_delay_seconds_bucket{sync_type="agent_state"}[5m])) > 0.1
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "State sync delay exceeded 100ms SLO"
    description: "P95 sync delay: {{ $value }}s (target: 0.1s)"
```

---

### 6. Cache Performance SLO

**Objective:** 90% cache hit ratio for Redis cache.

| Cache Type | Target Hit Ratio | Measurement |
|------------|-----------------|-------------|
| **Redis** | > 90% | `marcus_cache_hit_ratio{cache_type="redis"}` |
| **Memory** | > 95% | `marcus_cache_hit_ratio{cache_type="memory"}` |

**Calculated as:**
```
cache_hit_ratio = keyspace_hits / (keyspace_hits + keyspace_misses)
```

**Alert Threshold:** Hit ratio < 90% for 10 minutes

**Example Alert:**
```yaml
- alert: LowCacheHitRatio
  expr: marcus_cache_hit_ratio{cache_type="redis"} < 0.9
  for: 10m
  labels:
    severity: warning
  annotations:
    summary: "Redis cache hit ratio below 90% SLO"
    description: "Current hit ratio: {{ $value | humanizePercentage }} (target: >90%)"
```

---

### 7. Lock Contention SLO

**Objective:** < 1% lock acquisition failures.

| Lock Type | Target Failure Rate | Measurement |
|-----------|-------------------|-------------|
| **Agent State Lock** | < 1% | `rate(marcus_lock_contention_total{lock_name="agent:*:state", result="failed"}[5m])` |
| **Analysis Lock** | < 1% | `rate(marcus_lock_contention_total{lock_name="analysis:*", result="failed"}[5m])` |

**Alert Threshold:** Failure rate > 1% for 5 minutes

**Example Alert:**
```yaml
- alert: HighLockContention
  expr: rate(marcus_lock_contention_total{result="failed"}[5m]) > 0.01
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "Lock contention exceeded 1% SLO"
    description: "Lock: {{$labels.lock_name}}, failure rate: {{ $value | humanizePercentage }}"
```

---

## SLO Monitoring Dashboard

**Grafana Dashboard:** `marcusPlatformEnhanced.json`

**Key Panels:**
1. **SLO Compliance Summary** - Table showing all SLO metrics vs. targets
2. **Latency Distribution** - P50/P95/P99 over time
3. **Error Rate Trend** - Error % by component
4. **Availability Heatmap** - Uptime over 30 days
5. **Throughput vs. Capacity** - Current load vs. SLO limits

**Access:** http://grafana.marcus.svc.cluster.local/d/marcus-platform-enhanced

---

## Error Budget

**Error Budget = (1 - SLO) * Total Requests**

For 99.9% availability SLO:
- Allowed downtime: 43 minutes/month
- Allowed errors (1% error rate, 1M requests): 10,000 errors

**Error Budget Tracking:**
```promql
# Remaining error budget (%)
100 * (1 - (
  sum(rate(marcus_errors_total{severity="error"}[30d])) /
  sum(rate(marcus_http_requests_total[30d]))
))
```

**Actions when error budget exhausted:**
1. **STOP** - Freeze new feature releases
2. **FOCUS** - All engineering on reliability
3. **ROOT CAUSE** - Deep dive into failures
4. **FIX** - Resolve systemic issues
5. **REVIEW** - Post-mortem + process improvements

---

## SLO Review Schedule

| Review Type | Frequency | Attendees | Output |
|------------|-----------|-----------|--------|
| **Weekly Check** | Monday 10 AM | On-call engineer | Email summary |
| **Monthly Deep Dive** | First Friday | Platform team | Report + action items |
| **Quarterly Adjustment** | Q1/Q2/Q3/Q4 | Engineering + Product | Updated SLO targets |

**Quarterly Review Questions:**
1. Are SLOs still achievable? (Should be ~90% met)
2. Are SLOs too loose? (>99% met → tighten)
3. Did we exhaust error budget? (Root cause analysis)
4. What improvements increased reliability?
5. Should we add new SLOs?

---

## SLO Violations - Response Runbook

### P95 Latency SLO Violated

**Symptoms:** Alert `HighP95Latency` fires

**Diagnosis:**
```bash
# Check current P95 latency
curl http://prometheus:9090/api/v1/query --data-urlencode 'query=histogram_quantile(0.95, rate(marcus_http_request_duration_seconds_bucket[5m]))'

# Check agent latencies
curl http://prometheus:9090/api/v1/query --data-urlencode 'query=histogram_quantile(0.95, rate(marcus_agent_request_duration_seconds_bucket[5m]))'

# Check database connection pool
kubectl exec deploy/orchestrator -n marcus -- curl -s localhost:9090/metrics | grep db_pool
```

**Common Causes:**
- Database slow queries → Check `pg_stat_activity`
- Redis connection pool exhausted → Scale Redis replicas
- Agent processes slow/stuck → Restart agents
- High request volume → Scale HPA

**Resolution:**
```bash
# Scale horizontally
kubectl scale deployment orchestrator -n marcus --replicas=5

# Or increase HPA targets
kubectl patch hpa orchestrator-hpa -n marcus --patch '{"spec":{"maxReplicas":10}}'
```

---

### Error Rate SLO Violated

**Symptoms:** Alert `HighErrorRate` fires

**Diagnosis:**
```bash
# Check error types
curl http://prometheus:9090/api/v1/query --data-urlencode 'query=sum by (error_type, component) (rate(marcus_errors_total[5m]))'

# Check recent errors in logs
kubectl logs -n marcus -l app=marcus-orchestrator --tail=100 | grep ERROR
```

**Common Causes:**
- Agent crashes → Check agent health
- Database connection failures → Check DB connectivity
- Redis unavailable → Check Redis cluster status
- Network issues → Check pod networking

**Resolution:**
```bash
# Restart unhealthy agents
kubectl delete pods -n marcus -l app=marcus-agent,health=unhealthy

# Verify database connectivity
kubectl run -it --rm pg-test --image=postgres:14 --restart=Never -- \
  psql -h postgres -U postgres -d citations -c "SELECT 1"
```

---

### Cache Hit Ratio SLO Violated

**Symptoms:** Alert `LowCacheHitRatio` fires

**Diagnosis:**
```bash
# Check cache hit ratio
curl http://prometheus:9090/api/v1/query --data-urlencode 'query=marcus_cache_hit_ratio{cache_type="redis"}'

# Check Redis memory
kubectl exec statefulset/redis -n marcus -- redis-cli INFO memory
```

**Common Causes:**
- Cache evictions (memory full) → Increase Redis memory
- TTL too short → Increase cache TTL
- Cache warming not working → Check initialization
- Traffic pattern changed → Re-evaluate caching strategy

**Resolution:**
```bash
# Increase Redis memory limit
kubectl patch statefulset redis -n marcus --patch '{"spec":{"template":{"spec":{"containers":[{"name":"redis","resources":{"limits":{"memory":"2Gi"}}}]}}}}'

# Manually warm cache (if needed)
kubectl exec deploy/orchestrator -n marcus -- node scripts/warmCache.js
```

---

## References

- **Prometheus Metrics:** `src/platform/monitoring/metricsEndpoint.ts`
- **Grafana Dashboard:** `src/platform/monitoring/grafanaDashboards/marcusPlatformEnhanced.json`
- **Alert Rules:** `k8s/prometheus-rules/slo-alerts.yaml`
- **Runbooks:** `docs/TROUBLESHOOTING_GUIDE.md`

---

**Last Updated:** 2025-11-22
**Maintained by:** Platform Engineering (Marcus)
**SLO Version:** 1.0
