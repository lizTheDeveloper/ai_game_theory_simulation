# MARCUS 3.0 Operator Runbook

Quick reference for common operational tasks and incident response.

## Quick Links
- **Grafana**: http://grafana.marcus.example.com
- **Prometheus**: http://prometheus.marcus.example.com  
- **Jaeger**: http://jaeger.marcus.example.com
- **API Docs**: https://api.marcus.example.com/docs
- **Logs (Loki)**: http://loki.marcus.example.com

## Common Incidents

### HIGH Error Rate (>5%)
**Alert**: `HighErrorRate`  
**Check**: Grafana → Citation Analysis Dashboard  
**Actions**:
1. Check orchestrator logs: `kubectl logs -n marcus-platform deployment/orchestrator --tail=100`
2. Check agent health: `curl https://api.marcus.example.com/api/admin/agents -d '{"action":"health"}'`
3. Check database: `kubectl logs -n marcus-platform statefulset/postgres-primary`
4. Restart unhealthy agents: `kubectl rollout restart deployment/citation-agent -n marcus-platform`

### Database Pool Exhaustion
**Alert**: `DatabasePoolExhaustion`
**Check**: Prometheus → `db_pool_active_connections`
**Actions**:
1. Scale orchestrator: `kubectl scale deployment/orchestrator --replicas=5 -n marcus-platform`
2. Check slow queries: Check PostgreSQL logs for queries >1s
3. If critical: Restart PostgreSQL replicas (not primary!)

### Rate Limit Issues
**Symptom**: 429 responses
**Check**: `http_requests_total{status="429"}`
**Actions**:
1. Identify source IP: Check logs for repeated IPs
2. Adjust limits: Edit `k8s/configmap.yaml` RATE_LIMIT_MAX_REQUESTS
3. Block malicious IPs: Add to rate limiter blacklist

## Deployment Procedures

### Rolling Update
```bash
# Update image tag
kubectl set image deployment/orchestrator orchestrator=ghcr.io/404genenotfound/marcus-orchestrator:v3.1.0 -n marcus-platform

# Watch rollout
kubectl rollout status deployment/orchestrator -n marcus-platform

# Rollback if needed
kubectl rollout undo deployment/orchestrator -n marcus-platform
```

### Scaling
```bash
# Manual scale
kubectl scale deployment/orchestrator --replicas=10 -n marcus-platform

# Check HPA status
kubectl get hpa -n marcus-platform
```

## Monitoring

**Key Metrics**:
- Citation throughput: `rate(citations_analyzed_total[5m])`
- Error rate: `rate(http_requests_total{status=~"5.."}[5m])`
- Agent health: `agent_health_status`
- DB connections: `db_pool_active_connections`

**Dashboards**:
1. Citation Analysis (main overview)
2. Agent Performance (per-agent metrics)
3. Infrastructure (DB, Redis, Kubernetes)
4. Security (auth failures, rate limits, CSP violations)

## Backup & Recovery

**Database Backup**:
```bash
kubectl exec postgres-primary-0 -n marcus-platform -- pg_dump -U marcus_app citation_integrity > backup-$(date +%Y%m%d).sql
```

**Restore**:
```bash
kubectl exec -i postgres-primary-0 -n marcus-platform -- psql -U marcus_app citation_integrity < backup-20251117.sql
```

## Contact
- **On-call**: pagerduty/marcus-platform
- **Escalation**: platform-team@example.com
