# MARCUS Monitoring Quick Reference

**One-page guide for common monitoring operations**

---

## 🚀 Quick Start

```bash
# Start monitoring stack
docker-compose up -d

# Check service health
docker-compose ps

# View logs
docker-compose logs -f grafana prometheus loki jaeger
```

---

## 🌐 Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| Grafana Dashboards | http://localhost:3001 | admin/changeme |
| Prometheus | http://localhost:9090 | - |
| Jaeger UI | http://localhost:16686 | - |
| AlertManager | http://localhost:9093 | - |

---

## 📊 Dashboards

1. **Citation Analysis** - Quality, performance, throughput
2. **Agent Performance** - Health, accuracy, resources
3. **Infrastructure** - DB, Redis, circuit breakers, API
4. **Security** - Auth, rate limiting, audit logs
5. **Business Metrics** - Usage, SLAs, costs
6. **Baseline Monitoring** - Anomaly detection

---

## 🔔 Alert Severity

| Level | Response Time | Action |
|-------|--------------|--------|
| 🚨 CRITICAL | Immediate | Page on-call |
| ⚠️ WARNING | 1 hour | Investigate |
| ℹ️ INFO | Track trends | No action |

---

## 📝 Log Queries (Loki)

```logql
# All errors
{job="marcus-platform", level="error"}

# Specific citation
{job="marcus-platform"} | json | citation_id="abc123"

# Slow requests
{job="marcus-platform"} | json | duration > 100

# Security audit
{job="security-audit"}

# Trace correlation
{job=~".+"} | json | trace_id="trace-id-here"
```

---

## 🔍 Trace Queries (Jaeger)

- **Service:** `marcus-platform` or `marcus-citation-agent`
- **Operation:** `citation.analyze`, `database.query`
- **Tags:** `error=true`, `citation.behavior=proper_attribution`
- **Duration:** Min 100ms (find slow requests)

---

## 📈 Baseline Collection

```bash
# Collect 7-day baseline
npx tsx scripts/collect-baseline.ts \
  --environment prod \
  --duration 7d \
  --output baselines/prod-baseline.json

# View baseline summary
cat baselines/prod-baseline.json | jq '.metrics'
```

---

## 🩺 Health Checks

```bash
# Prometheus
curl http://localhost:9090/-/healthy

# Grafana
curl http://localhost:3001/api/health

# Loki
curl http://localhost:3100/ready

# Jaeger
curl http://localhost:16686/

# Platform
curl http://localhost:3000/health
```

---

## 🔧 Common Issues

### Dashboard Not Loading
```bash
docker-compose restart grafana
curl -u admin:changeme http://localhost:3001/api/datasources
```

### Logs Not Appearing
```bash
docker-compose logs promtail
curl http://localhost:3100/ready
```

### Traces Missing
```bash
docker-compose logs jaeger
curl http://localhost:16686/api/services
```

### Alerts Not Firing
```bash
curl http://localhost:9090/api/v1/rules
curl http://localhost:9090/api/v1/alerts
```

---

## 📞 Escalation

1. **Platform Issues** → #platform-ops
2. **Database Issues** → #database-ops
3. **Security Incidents** → #security-incidents

**PagerDuty:** Check on-call schedule

---

## 📚 Documentation

- Full Runbook: `docs/MARCUS_MONITORING_RUNBOOK.md`
- Phase Summary: `docs/MARCUS_2.0_PHASE_4_SUMMARY.md`
- Deployment: `docs/MARCUS_DEPLOYMENT_CHECKLIST.md`

---

**Last Updated:** 2025-11-17
**Maintained By:** Marcus (Platform Engineer)
