# MARCUS Platform Monitoring & Observability Runbook

**Version:** 2.0
**Last Updated:** 2025-11-17
**Maintainer:** Marcus (Platform Engineering)

## Table of Contents

1. [Overview](#overview)
2. [Monitoring Stack Architecture](#monitoring-stack-architecture)
3. [Quick Start](#quick-start)
4. [Dashboards](#dashboards)
5. [Alerts](#alerts)
6. [Log Aggregation](#log-aggregation)
7. [Distributed Tracing](#distributed-tracing)
8. [Performance Baselines](#performance-baselines)
9. [Troubleshooting](#troubleshooting)
10. [Runbooks](#runbooks)

---

## Overview

The MARCUS 3.0 Citation Integrity Platform uses a comprehensive observability stack:

- **Metrics:** Prometheus + Grafana
- **Logs:** Loki + Promtail
- **Traces:** OpenTelemetry + Jaeger
- **Alerts:** Prometheus Alertmanager
- **Baselines:** Statistical baseline collection and anomaly detection

**Monitoring Philosophy:** Proactive issue detection through metrics, logs, and traces correlation.

---

## Monitoring Stack Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   MARCUS Platform                        │
│  ┌───────────────┐      ┌──────────────────┐           │
│  │ Orchestrator  │      │ Citation Agents  │           │
│  │ (TypeScript)  │      │    (Python)      │           │
│  └───────┬───────┘      └────────┬─────────┘           │
│          │                       │                       │
│    ┌─────▼─────┬────────────────▼─────┬────────────┐   │
│    │  Metrics  │       Logs           │   Traces   │   │
│    │ (prom-    │   (structured        │ (OpenTel)  │   │
│    │  client)  │    JSON logs)        │            │   │
│    └─────┬─────┴───────┬──────────────┴─────┬──────┘   │
└──────────┼─────────────┼────────────────────┼──────────┘
           │             │                    │
     ┌─────▼─────┐  ┌────▼────────┐   ┌──────▼──────┐
     │Prometheus │  │   Promtail  │   │   Jaeger    │
     │  :9090    │  │   (shipper) │   │   :16686    │
     └─────┬─────┘  └────┬────────┘   └──────┬──────┘
           │             │                    │
           │        ┌────▼────────┐           │
           │        │    Loki     │           │
           │        │   :3100     │           │
           │        └─────────────┘           │
           │                                  │
     ┌─────▼──────────────────────────────────▼──────┐
     │              Grafana :3001                     │
     │  (Unified visualization + dashboards)          │
     └────────────────────────────────────────────────┘
```

**Access Points:**
- Grafana: http://localhost:3001 (admin/changeme)
- Prometheus: http://localhost:9090
- Jaeger UI: http://localhost:16686
- Loki API: http://localhost:3100
- AlertManager: http://localhost:9093

---

## Quick Start

### 1. Start Monitoring Stack

```bash
# Start all services
docker-compose up -d

# Verify services are healthy
docker-compose ps

# Check logs
docker-compose logs -f grafana prometheus loki jaeger
```

### 2. Access Dashboards

Navigate to Grafana: http://localhost:3001

**Default credentials:** admin / changeme (change on first login)

**Available dashboards:**
1. Citation Analysis Overview
2. Agent Performance
3. Infrastructure Health
4. Security Monitoring
5. Business Metrics
6. Baseline Monitoring & Anomaly Detection

### 3. Collect Performance Baselines

```bash
# Collect 7-day production baseline
npx tsx scripts/collect-baseline.ts --environment prod --duration 7d

# Output: baselines/production-baseline.json

# Import baseline metrics to Prometheus
# (Manual: Add baseline_* metrics to Prometheus via recording rules or external metrics)
```

### 4. View Traces

Navigate to Jaeger UI: http://localhost:16686

- Select service: `marcus-platform` or `marcus-citation-agent`
- Search by operation: `citation.analyze`, `database.query`, etc.
- Filter by tags: `citation.behavior`, `agent.id`, `error=true`

### 5. Query Logs

In Grafana → Explore → Loki:

```logql
# All errors in last hour
{job="marcus-platform", level="error"}

# Security audit events
{job="security-audit", event_type="auth"}

# Slow database queries
{job="postgresql"} |~ "duration: [0-9]{3,}\\.[0-9]{3} ms"

# Logs for specific trace
{job="marcus-platform"} | json | trace_id="abc123def456"
```

---

## Dashboards

### Dashboard 1: Citation Analysis Overview

**Purpose:** Monitor citation analysis quality and performance.

**Key Panels:**
- Citation throughput (citations/sec)
- Mean integrity score over time
- Consensus level gauge
- Accuracy, precision, recall, F1 metrics
- Top citation behaviors detected
- Processing latency (p50, p95, p99)

**When to use:** Daily operational monitoring, performance tracking.

**SLA Targets:**
- Throughput: >10 citations/sec
- Latency p95: <100ms
- Accuracy: >80%
- Consensus: >80%

---

### Dashboard 2: Agent Performance

**Purpose:** Monitor health, performance, and resource usage of citation agents.

**Key Panels:**
- Active/healthy agents count
- Per-agent accuracy and response times
- Agent reputation scores
- Memory/CPU usage per agent
- Agent restart events

**When to use:** Debugging agent issues, capacity planning.

**Alert Conditions:**
- Any unhealthy agents for >3 minutes
- Agent restart rate >3/hour
- Memory usage >80% of limit

---

### Dashboard 3: Infrastructure Health

**Purpose:** Monitor database, cache, circuit breakers, and API performance.

**Key Panels:**
- PostgreSQL connection pool utilization
- Redis memory usage and cache hit rate
- Circuit breaker states (DB, Redis, agents)
- Retry attempts and success rates
- DLQ depth
- Database query latency
- API request rate

**When to use:** Infrastructure troubleshooting, capacity planning.

**Alert Conditions:**
- DB pool >90% utilized
- Cache hit rate <70%
- Any circuit breaker in OPEN state
- DLQ depth >100

---

### Dashboard 4: Security Monitoring

**Purpose:** Monitor authentication, authorization, rate limiting, and security events.

**Key Panels:**
- Failed authentication attempts
- Rate limiting violations by IP/endpoint
- Security audit events
- Blocked IPs count
- Session creation/termination rate
- Input validation failures
- CSRF token validation failures
- Security scan results (vulnerabilities)

**When to use:** Security incident response, compliance auditing.

**Alert Conditions:**
- Failed auth rate >10/sec for 5 minutes
- CSRF validation failures >5/sec

---

### Dashboard 5: Business Metrics

**Purpose:** Monitor business KPIs, SLAs, and usage patterns.

**Key Panels:**
- Total citations analyzed (counter)
- Active users count
- API usage by endpoint
- Average processing time per citation
- Error rate percentage
- Uptime percentage (SLA)
- Cost per citation

**When to use:** Business reporting, SLA tracking, capacity planning.

**SLA Targets:**
- Uptime: >99.9%
- Error rate: <1%
- Latency SLA compliance: >95%

---

### Dashboard 6: Baseline Monitoring & Anomaly Detection

**Purpose:** Detect performance anomalies by comparing to statistical baselines.

**Key Panels:**
- Latency vs baseline (with tolerance bands)
- Throughput vs baseline
- Accuracy anomaly detection
- Consensus trend (7-day moving average)
- Anomaly score (standard deviations from baseline)
- Performance degradation alert

**When to use:** Proactive performance monitoring, regression detection.

**Alert Conditions:**
- Latency >50% above baseline
- Throughput >30% below baseline
- Accuracy >10% below baseline

---

## Alerts

### Alert Severity Levels

**CRITICAL:** Page immediately, requires immediate action
**WARNING:** Investigate soon, may escalate if not resolved
**INFO:** Track for trends, no immediate action required

### Alert Routing

```
CRITICAL → PagerDuty + Slack #alerts
WARNING  → Slack #monitoring
INFO     → Slack #observability
```

### Critical Alerts

| Alert | Condition | Impact | Runbook |
|-------|-----------|--------|---------|
| MARCUSPlatformDown | Platform down >1min | Service outage | [Platform Down](#platform-down) |
| HighErrorRate | 5xx rate >5% for 5min | User impact | [High Error Rate](#high-error-rate) |
| DatabaseConnectionPoolExhausted | Pool >90% for 2min | Service degradation | [DB Pool Exhaustion](#db-pool-exhaustion) |
| CircuitBreakerOpen | Circuit breaker OPEN | Service degradation | [Circuit Breaker](#circuit-breaker) |
| AllAgentsUnhealthy | All agents down >2min | Service outage | [All Agents Down](#all-agents-down) |
| SecurityBreach | Failed auth >50/sec | Security incident | [Security Incident](#security-incident) |

### Warning Alerts

| Alert | Condition | Impact | Runbook |
|-------|-----------|--------|---------|
| HighLatency | p95 >100ms for 10min | SLA violation | [High Latency](#high-latency) |
| LowConsensus | Consensus <80% for 15min | Quality degradation | [Low Consensus](#low-consensus) |
| DLQDepthHigh | DLQ >100 for 5min | Processing backlog | [DLQ Backlog](#dlq-backlog) |
| CacheHitRateLow | Hit rate <70% for 10min | Performance impact | [Low Cache Hit Rate](#low-cache-hit-rate) |

---

## Log Aggregation

### Log Levels

- **ERROR:** System failures, uncaught exceptions
- **WARN:** Degraded performance, retry attempts
- **INFO:** Business events (citation analyzed, user authenticated)
- **DEBUG:** Detailed flow (development only, dropped in production)

### Common Log Queries

```logql
# All errors in platform
{job="marcus-platform", level="error"}

# Errors for specific citation
{job="marcus-platform"} | json | citation_id="abc123"

# High latency requests
{job="marcus-platform"} | json | duration > 100

# Agent failures
{job="citation-agents", level="error"}

# Security audit trail
{job="security-audit"}

# Failed database queries
{job="postgresql", level="ERROR"}

# All logs for trace ID (log-trace correlation)
{job=~".+"} | json | trace_id="1234567890abcdef"
```

### Log Retention

- **Production:** 90 days
- **Staging:** 30 days
- **Development:** 7 days

---

## Distributed Tracing

### Trace Visualization

Jaeger UI shows end-to-end request flow:

```
HTTP Request → Orchestrator
  └─ Input Validation
  └─ Agent Distribution
      ├─ Agent 1: Citation Evaluation
      ├─ Agent 2: Citation Evaluation
      └─ Agent N: Citation Evaluation
  └─ Consensus Calculation
  └─ Database Save
  └─ Cache Update
```

### Trace Queries

**By Service:**
- Service: `marcus-platform`
- Operation: `citation.analyze`

**By Tags:**
- `citation.behavior`: `proper_attribution`
- `agent.id`: `agent-1`
- `error`: `true`
- `http.status_code`: `500`

**By Duration:**
- Min duration: 100ms (find slow requests)

### Trace-Log Correlation

1. Find trace ID in Jaeger UI
2. Copy trace ID: `1234567890abcdef`
3. Query Loki: `{job="marcus-platform"} | json | trace_id="1234567890abcdef"`
4. View correlated logs for that request

---

## Performance Baselines

### Baseline Collection

Run weekly to update baselines:

```bash
npx tsx scripts/collect-baseline.ts \
  --environment prod \
  --duration 7d \
  --interval 1m \
  --output baselines/production-baseline-$(date +%Y%m%d).json
```

### Baseline Metrics

Collected metrics:
- Citation latency (p50, p95, p99)
- Throughput (citations/sec)
- Accuracy, F1 score, consensus
- Database query latency
- Cache hit rate
- Memory usage
- CPU utilization
- Error rate

### Anomaly Detection

Dashboard shows:
- Current metric vs baseline
- Tolerance bands (±20%)
- Standard deviation bands (±3σ)
- Anomaly alerts (>50% deviation)

---

## Troubleshooting

### Service Health Checks

```bash
# Check all services
docker-compose ps

# Check specific service logs
docker-compose logs -f orchestrator
docker-compose logs -f citation-agent

# Restart unhealthy service
docker-compose restart orchestrator
```

### Prometheus Not Scraping

```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# Check metrics endpoint
curl http://localhost:3000/metrics

# Reload Prometheus config
curl -X POST http://localhost:9090/-/reload
```

### Grafana Dashboard Not Loading

```bash
# Check Grafana logs
docker-compose logs grafana

# Verify datasource
curl -u admin:changeme http://localhost:3001/api/datasources

# Re-provision dashboards
docker-compose restart grafana
```

### Loki Not Receiving Logs

```bash
# Check Promtail logs
docker-compose logs promtail

# Verify Loki is ready
curl http://localhost:3100/ready

# Test log ingestion
curl -X POST -H "Content-Type: application/json" \
  http://localhost:3100/loki/api/v1/push \
  -d '{"streams":[{"stream":{"job":"test"},"values":[["'$(date +%s)000000000'","test message"]]}]}'
```

### Jaeger Not Showing Traces

```bash
# Check Jaeger health
curl http://localhost:16686/

# Verify trace export
# Check application logs for OpenTelemetry errors

# Test trace ingestion
curl -X POST http://localhost:14268/api/traces \
  -H "Content-Type: application/json" \
  -d '{"data":[{"traceID":"test","spans":[{"traceID":"test","spanID":"abc","operationName":"test"}]}]}'
```

---

## Runbooks

### Platform Down

**Alert:** MARCUSPlatformDown
**Severity:** CRITICAL
**Impact:** Complete service outage

**Diagnosis:**
1. Check orchestrator health: `curl http://localhost:3000/health`
2. Check container status: `docker-compose ps orchestrator`
3. Check logs: `docker-compose logs --tail=100 orchestrator`

**Resolution:**
1. Restart orchestrator: `docker-compose restart orchestrator`
2. If restart fails, check dependencies (DB, Redis)
3. Verify configuration: `docker-compose config`
4. Escalate if issue persists >5 minutes

**Prevention:**
- Enable auto-restart policy
- Add health check probes
- Monitor dependency health

---

### High Error Rate

**Alert:** HighErrorRate
**Severity:** CRITICAL
**Impact:** User experience degradation

**Diagnosis:**
1. Check error logs: `{job="marcus-platform", level="error"}`
2. Check traces for failing requests (filter by `error=true`)
3. Identify common error patterns

**Resolution:**
1. If database errors → Check DB connection pool
2. If agent errors → Check agent health status
3. If validation errors → Check input data quality
4. Rollback recent deployment if regression

**Prevention:**
- Add input validation
- Implement circuit breakers
- Monitor error rate continuously

---

### DB Pool Exhaustion

**Alert:** DatabaseConnectionPoolExhausted
**Severity:** CRITICAL
**Impact:** Service degradation, timeouts

**Diagnosis:**
1. Check pool metrics in Grafana dashboard
2. Identify slow queries: `{job="postgresql"} |~ "duration: [0-9]{3,}"`
3. Check for connection leaks

**Resolution:**
1. Increase pool size (temporary): Update `DB_POOL_MAX` env var
2. Optimize slow queries
3. Check for unclosed connections in code
4. Restart affected services

**Prevention:**
- Set connection timeouts
- Monitor pool utilization
- Optimize database queries

---

### Circuit Breaker

**Alert:** CircuitBreakerOpen
**Severity:** CRITICAL
**Impact:** Dependent service unavailable

**Diagnosis:**
1. Check which circuit breaker: `circuit_breaker_state{breaker="<name>"}`
2. Check target service health (DB, Redis, agents)
3. Review recent errors leading to trip

**Resolution:**
1. Fix underlying service issue
2. Wait for circuit breaker to half-open (automatic)
3. Monitor recovery
4. Manually reset if needed (with caution)

**Prevention:**
- Monitor service health continuously
- Set appropriate circuit breaker thresholds
- Implement graceful degradation

---

### All Agents Down

**Alert:** AllAgentsUnhealthy
**Severity:** CRITICAL
**Impact:** Cannot process citations

**Diagnosis:**
1. Check agent container status: `docker-compose ps citation-agent`
2. Check agent logs: `docker-compose logs citation-agent`
3. Verify agent health endpoint

**Resolution:**
1. Restart agents: `docker-compose restart citation-agent`
2. Check resource exhaustion (memory, CPU)
3. Verify agent dependencies (DB, Redis)
4. Scale up if capacity issue

**Prevention:**
- Monitor agent resource usage
- Set appropriate resource limits
- Implement auto-restart policy

---

### High Latency

**Alert:** HighLatency
**Severity:** WARNING
**Impact:** SLA violation

**Diagnosis:**
1. Check latency breakdown in Jaeger traces
2. Identify bottleneck (DB, agents, network)
3. Check resource utilization

**Resolution:**
1. If DB slow → Optimize queries, add indexes
2. If agent slow → Scale up agents
3. If network slow → Check network latency
4. If cache miss → Improve cache hit rate

**Prevention:**
- Monitor latency continuously
- Set performance budgets
- Optimize critical paths

---

### Low Consensus

**Alert:** LowConsensus
**Severity:** WARNING
**Impact:** Quality degradation

**Diagnosis:**
1. Check agent agreement distribution in dashboard
2. Review recent agent behavior changes
3. Check for adversarial inputs

**Resolution:**
1. Review agent configurations
2. Check for model drift
3. Investigate recent data changes
4. Re-train agents if needed

**Prevention:**
- Monitor consensus trends
- Validate agent outputs
- Implement agent quality checks

---

### Security Incident

**Alert:** SecurityBreach (excessive failed auth)
**Severity:** CRITICAL
**Impact:** Potential breach attempt

**Diagnosis:**
1. Identify source IPs: Check security dashboard
2. Review failed auth attempts: `{job="security-audit", event_type="auth", result="failure"}`
3. Check for patterns (brute force, credential stuffing)

**Resolution:**
1. Block offending IPs immediately
2. Enable rate limiting (if not already)
3. Review authentication logs
4. Reset compromised credentials
5. Escalate to security team

**Prevention:**
- Implement rate limiting
- Use strong authentication
- Monitor security metrics
- Regular security audits

---

## Maintenance

### Regular Tasks

**Daily:**
- Review critical/warning alerts
- Check dashboard anomalies
- Verify backup completion

**Weekly:**
- Review baseline metrics
- Update baseline if needed
- Review security audit logs

**Monthly:**
- Update Grafana dashboards
- Review alert thresholds
- Update runbooks

**Quarterly:**
- Conduct chaos engineering tests
- Review monitoring stack capacity
- Update documentation

---

## Contact

**On-call rotation:** Check PagerDuty schedule

**Escalation:**
1. Platform Team → #platform-ops
2. Database Team → #database-ops
3. Security Team → #security-incidents

**Documentation:**
- Runbooks: `docs/MARCUS_MONITORING_RUNBOOK.md`
- Deployment: `docs/MARCUS_DEPLOYMENT_CHECKLIST.md`
- Architecture: `reviews/marcus-agent-architecture-review.md`

---

**Last Updated:** 2025-11-17
**Maintainer:** Marcus (Platform Engineer)
**Motto:** "In God we trust. All others must bring data."
