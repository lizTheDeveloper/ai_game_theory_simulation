# MARCUS 3.0 - Production Runbook

**Last Updated:** November 22, 2025
**Platform:** Google Kubernetes Engine (GKE)
**Namespace:** `marcus-platform`
**Monitoring Namespace:** `monitoring`

---

## Table of Contents

1. [Overview](#overview)
2. [Service Architecture](#service-architecture)
3. [Common Operations](#common-operations)
4. [Incident Response](#incident-response)
5. [Scaling Operations](#scaling-operations)
6. [Database Operations](#database-operations)
7. [Monitoring & Alerts](#monitoring--alerts)
8. [Backup & Recovery](#backup--recovery)
9. [Deployment Procedures](#deployment-procedures)
10. [Emergency Contacts](#emergency-contacts)

---

## Overview

This runbook provides operational procedures for the MARCUS 3.0 citation integrity platform running on GKE.

**Service Level Objectives (SLOs):**
- **Availability:** 99.5% (43.8 minutes downtime/month)
- **Latency (P95):** < 5 seconds for citation analysis
- **Error Rate:** < 1% of requests
- **Agent Consensus:** > 0.5 for valid citations

**On-Call Rotation:**
- Primary: Platform Team
- Escalation: Engineering Manager
- Pager: PagerDuty (if configured)

---

## Service Architecture

```
┌────────────────────────────────────────────────┐
│ Load Balancer (marcus.yourdomain.com)         │
└────────────────┬───────────────────────────────┘
                 │
    ┌────────────▼────────────┐
    │ Orchestrator (3 pods)   │  Port: 3000 (HTTP), 9090 (metrics)
    │ - Manages agent pool    │
    │ - Aggregates results    │
    │ - Exposes REST API      │
    └────────────┬────────────┘
                 │
    ┌────────────▼──────────────────┐
    │ Citation Agents (5+ pods)     │  Port: 8000 (HTTP), 9091 (metrics)
    │ - Process citation analysis   │
    │ - Nested learning algorithm   │
    │ - Queue-based workers         │
    └───────────┬───────────────────┘
                │
    ┌───────────▼──────────┬────────────────┐
    │                      │                │
┌───▼────────┐  ┌─────────▼──────┐  ┌──────▼────┐
│ PostgreSQL │  │ Redis Cluster  │  │ Prometheus│
│ (1P + 2R)  │  │ (6 nodes)      │  │ + Grafana │
│ Port: 5432 │  │ Port: 6379     │  │           │
└────────────┘  └────────────────┘  └───────────┘
```

**Key Endpoints:**
- **API:** `https://marcus.yourdomain.com/api/citations/analyze`
- **Health:** `https://marcus.yourdomain.com/health`
- **Metrics:** `https://marcus.yourdomain.com/metrics`
- **Grafana:** Port-forward or configured ingress
- **Prometheus:** Port-forward to monitoring namespace

---

## Common Operations

### Check Service Health

```bash
# Overall health check
kubectl get pods -n marcus-platform

# Check orchestrator health
kubectl exec -n marcus-platform deployment/orchestrator -- curl -s localhost:3000/health | jq

# Check agent health
kubectl get pods -n marcus-platform -l app=citation-agent -o json | \
  jq '.items[] | {name: .metadata.name, ready: .status.conditions[] | select(.type=="Ready") | .status}'

# Check database connectivity
kubectl exec -n marcus-platform postgres-primary-0 -- psql -U marcus -d citation_integrity -c "SELECT 1"

# Check Redis connectivity
kubectl exec -n marcus-platform redis-0 -- redis-cli -a $REDIS_PASSWORD ping
```

### View Logs

```bash
# Orchestrator logs (last 100 lines, follow)
kubectl logs -n marcus-platform -l app=orchestrator --tail=100 -f

# Agent logs (specific pod)
kubectl logs -n marcus-platform citation-agent-xxxxx-xxxxx --tail=100 -f

# All agent logs (merged)
kubectl logs -n marcus-platform -l app=citation-agent --tail=50 --prefix=true

# PostgreSQL logs
kubectl logs -n marcus-platform postgres-primary-0 --tail=100

# Redis logs
kubectl logs -n marcus-platform redis-0 --tail=100

# Filter for errors
kubectl logs -n marcus-platform -l app=orchestrator --tail=1000 | grep -i error
```

### Restart Services

```bash
# Rolling restart orchestrator (zero downtime)
kubectl rollout restart deployment orchestrator -n marcus-platform
kubectl rollout status deployment orchestrator -n marcus-platform

# Rolling restart agents
kubectl rollout restart deployment citation-agent -n marcus-platform

# Restart specific pod (for stuck pods)
kubectl delete pod <pod-name> -n marcus-platform

# Restart PostgreSQL (CAUTION: brief downtime)
kubectl rollout restart statefulset postgres-primary -n marcus-platform

# Restart Redis (CAUTION: may affect in-flight tasks)
kubectl rollout restart statefulset redis -n marcus-platform
```

### Update Configuration

```bash
# Edit ConfigMap
kubectl edit configmap marcus-config -n marcus-platform

# Edit Secrets
kubectl edit secret marcus-secrets -n marcus-platform

# After config changes, restart affected pods
kubectl rollout restart deployment orchestrator -n marcus-platform
kubectl rollout restart deployment citation-agent -n marcus-platform
```

---

## Incident Response

### Incident Severity Levels

| Level | Description | Response Time | Example |
|-------|-------------|---------------|---------|
| **P0** | Service down, data loss risk | Immediate | All pods crashed, database unavailable |
| **P1** | Major functionality broken | < 15 min | Orchestrator down, agents can't process tasks |
| **P2** | Degraded performance | < 1 hour | High latency, partial agent failures |
| **P3** | Minor issues, workaround available | < 4 hours | Single agent pod stuck, metrics delayed |

### Incident Response Checklist

1. **Acknowledge incident** (update status page if public)
2. **Assess severity** (use table above)
3. **Gather information:**
   ```bash
   # Capture current state
   kubectl get pods -n marcus-platform > incident-pods.txt
   kubectl get events -n marcus-platform --sort-by='.lastTimestamp' > incident-events.txt
   kubectl logs -n marcus-platform -l app=orchestrator --tail=500 > incident-orchestrator.log
   ```
4. **Check monitoring:**
   - Grafana dashboards for anomalies
   - Prometheus alerts
   - GCP Cloud Monitoring
5. **Apply fix** (see playbooks below)
6. **Verify resolution**
7. **Document post-mortem**

### Common Incident Playbooks

#### All Pods Down / Cluster Unreachable

```bash
# Check cluster status
gcloud container clusters describe marcus-platform --region=us-central1

# Check node status
kubectl get nodes

# If nodes are NotReady, check GCP console for node pool issues

# If cluster is down, check GKE status page
# https://status.cloud.google.com/

# If nodes are healthy but pods are down
kubectl get pods -n marcus-platform
kubectl describe pod <pod-name> -n marcus-platform

# Common fix: restart deployments
kubectl rollout restart deployment --all -n marcus-platform
```

#### High Error Rate / Failing Requests

```bash
# Check orchestrator logs for errors
kubectl logs -n marcus-platform -l app=orchestrator --tail=500 | grep -E "(ERROR|CRITICAL)"

# Check agent logs
kubectl logs -n marcus-platform -l app=citation-agent --tail=500 | grep -E "(ERROR|CRITICAL)"

# Check database connectivity
kubectl exec -n marcus-platform postgres-primary-0 -- psql -U marcus -d citation_integrity -c "SELECT COUNT(*) FROM agent_states"

# Check Redis connectivity
kubectl exec -n marcus-platform redis-0 -- redis-cli -a $REDIS_PASSWORD cluster info

# If database connection pool exhausted
kubectl edit configmap marcus-config -n marcus-platform
# Increase POSTGRES_POOL_MAX (default: 50)
kubectl rollout restart deployment orchestrator -n marcus-platform
```

#### High Latency / Slow Responses

```bash
# Check metrics
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090
# Visit: http://localhost:9090/graph
# Query: histogram_quantile(0.95, rate(citation_latency_ms_bucket[5m]))

# Check pod resource usage
kubectl top pods -n marcus-platform

# If CPU throttled
kubectl describe pod <pod-name> -n marcus-platform | grep -A 5 "Limits"

# Increase resources
kubectl edit deployment orchestrator -n marcus-platform
# Update resources.limits.cpu and resources.requests.cpu

# If too few agents
kubectl scale deployment citation-agent -n marcus-platform --replicas=10
```

#### Database Issues

```bash
# Check PostgreSQL status
kubectl exec -n marcus-platform postgres-primary-0 -- psql -U marcus -d citation_integrity -c "SELECT version()"

# Check replication lag
kubectl exec -n marcus-platform postgres-replica-0 -- psql -U marcus -d citation_integrity -c "SELECT now() - pg_last_xact_replay_timestamp() AS replication_lag"

# Check disk usage
kubectl exec -n marcus-platform postgres-primary-0 -- df -h /var/lib/postgresql/data

# If disk full, increase PVC size
kubectl edit pvc postgres-data-postgres-primary-0 -n marcus-platform
# Update spec.resources.requests.storage

# If replica out of sync
kubectl delete pod postgres-replica-0 -n marcus-platform
# Wait for pod to restart and resync
```

#### Redis Cluster Issues

```bash
# Check cluster health
kubectl exec -n marcus-platform redis-0 -- redis-cli -a $REDIS_PASSWORD cluster info

# Check cluster nodes
kubectl exec -n marcus-platform redis-0 -- redis-cli -a $REDIS_PASSWORD cluster nodes

# If cluster is in failed state
kubectl delete job redis-cluster-init -n marcus-platform
kubectl apply -f k8s/redis-statefulset.yaml

# If node is down
kubectl delete pod redis-<N> -n marcus-platform

# Manual cluster fix (if init job fails)
kubectl exec -n marcus-platform redis-0 -- redis-cli -a $REDIS_PASSWORD --cluster create \
  redis-0.redis-headless:6379 redis-1.redis-headless:6379 redis-2.redis-headless:6379 \
  redis-3.redis-headless:6379 redis-4.redis-headless:6379 redis-5.redis-headless:6379 \
  --cluster-replicas 1 --cluster-yes
```

---

## Scaling Operations

### Manual Scaling

```bash
# Scale agents (most common)
kubectl scale deployment citation-agent -n marcus-platform --replicas=10

# Scale orchestrator (for high API traffic)
kubectl scale deployment orchestrator -n marcus-platform --replicas=5

# Scale PostgreSQL replicas (read scaling)
kubectl scale statefulset postgres-replica -n marcus-platform --replicas=3
```

### Horizontal Pod Autoscaling (HPA)

```bash
# Enable HPA for agents
kubectl autoscale deployment citation-agent -n marcus-platform \
  --min=5 --max=20 --cpu-percent=70

# Enable HPA for orchestrator
kubectl autoscale deployment orchestrator -n marcus-platform \
  --min=2 --max=10 --cpu-percent=60

# Check HPA status
kubectl get hpa -n marcus-platform

# Describe HPA for details
kubectl describe hpa citation-agent -n marcus-platform
```

### Cluster Autoscaling

```bash
# Check node pool autoscaling
gcloud container node-pools describe default-pool \
  --cluster=marcus-platform \
  --region=us-central1 \
  --format="value(autoscaling)"

# Update node pool size
gcloud container node-pools update default-pool \
  --cluster=marcus-platform \
  --region=us-central1 \
  --enable-autoscaling \
  --min-nodes=2 \
  --max-nodes=10

# Add preemptible node pool for cost savings
gcloud container node-pools create preemptible-pool \
  --cluster=marcus-platform \
  --region=us-central1 \
  --preemptible \
  --num-nodes=2 \
  --min-nodes=0 \
  --max-nodes=5 \
  --enable-autoscaling \
  --machine-type=e2-standard-4
```

---

## Database Operations

### Backup PostgreSQL

```bash
# Manual backup to local file
kubectl exec -n marcus-platform postgres-primary-0 -- \
  pg_dump -U marcus -d citation_integrity -F custom > backup-$(date +%Y%m%d).dump

# Backup to GCS bucket
kubectl exec -n marcus-platform postgres-primary-0 -- \
  pg_dump -U marcus -d citation_integrity -F custom | \
  gcloud storage cp - gs://YOUR_BUCKET/backups/citation_integrity-$(date +%Y%m%d).dump

# Verify backup
gcloud storage ls gs://YOUR_BUCKET/backups/
```

### Restore PostgreSQL

```bash
# From local file
kubectl cp backup-20251122.dump marcus-platform/postgres-primary-0:/tmp/restore.dump
kubectl exec -n marcus-platform postgres-primary-0 -- \
  pg_restore -U marcus -d citation_integrity -c /tmp/restore.dump

# From GCS bucket
gcloud storage cp gs://YOUR_BUCKET/backups/citation_integrity-20251122.dump - | \
  kubectl exec -i -n marcus-platform postgres-primary-0 -- \
  pg_restore -U marcus -d citation_integrity -c
```

### Database Maintenance

```bash
# Vacuum database (reclaim space)
kubectl exec -n marcus-platform postgres-primary-0 -- \
  psql -U marcus -d citation_integrity -c "VACUUM ANALYZE"

# Reindex (improve query performance)
kubectl exec -n marcus-platform postgres-primary-0 -- \
  psql -U marcus -d citation_integrity -c "REINDEX DATABASE citation_integrity"

# Check table sizes
kubectl exec -n marcus-platform postgres-primary-0 -- \
  psql -U marcus -d citation_integrity -c "
    SELECT
      schemaname,
      tablename,
      pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
  "

# Check slow queries (if pg_stat_statements enabled)
kubectl exec -n marcus-platform postgres-primary-0 -- \
  psql -U marcus -d citation_integrity -c "
    SELECT query, calls, mean_exec_time, total_exec_time
    FROM pg_stat_statements
    ORDER BY mean_exec_time DESC
    LIMIT 10
  "
```

---

## Monitoring & Alerts

### Grafana Dashboards

**Access:**
```bash
kubectl port-forward -n monitoring svc/prometheus-grafana 3001:80
# Visit: http://localhost:3001
# Login: admin / <generated-password>
```

**Key Dashboards:**
- **MARCUS Platform Overview:** Overall health, latency, throughput
- **Agent Performance:** Per-agent metrics, consensus, learning curves
- **Database Performance:** Query latency, connection pool, replication lag
- **Kubernetes Cluster:** Node health, pod resource usage

### Prometheus Queries

**Access:**
```bash
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090
# Visit: http://localhost:9090
```

**Useful Queries:**
```promql
# P95 citation latency
histogram_quantile(0.95, rate(citation_latency_ms_bucket[5m]))

# Agent consensus
citation_consensus

# Request rate
rate(citation_requests_total[5m])

# Error rate
rate(citation_errors_total[5m]) / rate(citation_requests_total[5m])

# Pod CPU usage
sum(rate(container_cpu_usage_seconds_total{namespace="marcus-platform"}[5m])) by (pod)

# Pod memory usage
sum(container_memory_working_set_bytes{namespace="marcus-platform"}) by (pod)
```

### Alert Rules

**Critical Alerts (PagerDuty):**
- `HighAgentFailureRate` - > 10% failures/sec for 5 min
- `DatabaseConnectionFailures` - Any DB errors for 2 min
- `RedisConnectionFailures` - Any Redis errors for 2 min
- `FrequentPodRestarts` - Pods restarting > 1/min

**Warning Alerts (Slack):**
- `HighCitationLatency` - P95 > 5s for 5 min
- `LowAgentConsensus` - Consensus < 0.5 for 5 min

**Silence Alerts (during maintenance):**
```bash
# Via Alertmanager UI
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-alertmanager 9093:9093
# Visit: http://localhost:9093
# Create silence with matcher: namespace="marcus-platform"

# Via amtool CLI
kubectl exec -n monitoring alertmanager-prometheus-kube-prometheus-alertmanager-0 -- \
  amtool silence add namespace="marcus-platform" --duration=1h --comment="Maintenance window"
```

---

## Backup & Recovery

### Automated Backups

**Recommended:** Use GCP Cloud Storage lifecycle policies

1. **Create backup bucket:**
   ```bash
   gcloud storage buckets create gs://marcus-backups-$(gcloud config get-value project) \
     --location=us-central1 \
     --uniform-bucket-level-access
   ```

2. **Setup CronJob for daily backups:**
   ```yaml
   apiVersion: batch/v1
   kind: CronJob
   metadata:
     name: postgres-backup
     namespace: marcus-platform
   spec:
     schedule: "0 2 * * *"  # 2 AM daily
     jobTemplate:
       spec:
         template:
           spec:
             containers:
             - name: backup
               image: google/cloud-sdk:alpine
               command:
               - /bin/sh
               - -c
               - |
                 kubectl exec postgres-primary-0 -- pg_dump -U marcus -d citation_integrity -F custom | \
                 gcloud storage cp - gs://marcus-backups-PROJECT/postgres/backup-$(date +%Y%m%d-%H%M%S).dump
             restartPolicy: OnFailure
   ```

### Disaster Recovery

**RPO (Recovery Point Objective):** 24 hours (daily backups)
**RTO (Recovery Time Objective):** 1 hour

**Recovery Procedure:**

1. **Create new cluster:**
   ```bash
   ./scripts/gcp/deploy-to-gke.sh
   ```

2. **Restore database:**
   ```bash
   LATEST_BACKUP=$(gcloud storage ls gs://marcus-backups-PROJECT/postgres/ | tail -1)
   gcloud storage cp $LATEST_BACKUP - | \
     kubectl exec -i -n marcus-platform postgres-primary-0 -- \
     pg_restore -U marcus -d citation_integrity -c
   ```

3. **Verify data:**
   ```bash
   kubectl exec -n marcus-platform postgres-primary-0 -- \
     psql -U marcus -d citation_integrity -c "SELECT COUNT(*) FROM agent_states"
   ```

4. **Resume traffic:**
   ```bash
   kubectl apply -f k8s/ingress.yaml
   ```

---

## Deployment Procedures

### Rolling Update (Zero Downtime)

```bash
# Update orchestrator image
kubectl set image deployment/orchestrator \
  orchestrator=us-central1-docker.pkg.dev/PROJECT/marcus-images/marcus-orchestrator:v3.1.0 \
  -n marcus-platform

# Watch rollout
kubectl rollout status deployment/orchestrator -n marcus-platform

# Rollback if issues
kubectl rollout undo deployment/orchestrator -n marcus-platform
```

### Blue-Green Deployment

```bash
# Deploy "green" version alongside "blue"
kubectl apply -f k8s/orchestrator-deployment-green.yaml

# Test green version
kubectl port-forward -n marcus-platform svc/orchestrator-green 3002:3000
curl http://localhost:3002/health

# Switch traffic to green
kubectl patch svc orchestrator -n marcus-platform -p '{"spec":{"selector":{"version":"green"}}}'

# Monitor for issues, then delete blue
kubectl delete deployment orchestrator-blue -n marcus-platform
```

### Canary Deployment (Istio)

```bash
# Deploy canary version (10% traffic)
kubectl apply -f k8s/istio/virtual-service-canary.yaml

# Monitor metrics for canary pods
# If stable, increase to 50%, then 100%

# Promote canary to stable
kubectl apply -f k8s/orchestrator-deployment.yaml
```

---

## Emergency Contacts

| Role | Name | Contact | Escalation |
|------|------|---------|-----------|
| Primary On-Call | Platform Team | Slack: #marcus-oncall | 15 min |
| Secondary On-Call | Engineering Manager | PagerDuty | 30 min |
| Database Admin | DBA Team | Slack: #database-oncall | 1 hour |
| Security | Security Team | security@company.com | Immediate for P0 |
| GCP Support | Google Cloud | https://console.cloud.google.com/support | 1 hour (Premium) |

**Escalation Path:**
1. Primary On-Call (Platform Team)
2. Secondary On-Call (Engineering Manager)
3. VP Engineering
4. CTO

**Status Page:** (Configure at https://statuspage.io or similar)

**Communication Channels:**
- **Incidents:** #marcus-incidents (Slack)
- **Status Updates:** #marcus-status (Slack)
- **Post-Mortems:** Confluence / Google Docs

---

## Appendix

### Useful Commands

```bash
# Quick cluster overview
kubectl get all -n marcus-platform

# Resource usage summary
kubectl top pods -n marcus-platform --sort-by=memory
kubectl top nodes

# Events (last hour)
kubectl get events -n marcus-platform --sort-by='.lastTimestamp' | tail -20

# Pod IP addresses
kubectl get pods -n marcus-platform -o wide

# Shell into pod
kubectl exec -it -n marcus-platform <pod-name> -- /bin/bash

# Copy files from pod
kubectl cp marcus-platform/<pod-name>:/path/to/file ./local-file

# View resource quotas
kubectl describe resourcequota -n marcus-platform
```

### Performance Tuning

```bash
# Increase orchestrator replicas for high traffic
kubectl scale deployment orchestrator -n marcus-platform --replicas=5

# Increase database connection pool
kubectl edit configmap marcus-config -n marcus-platform
# POSTGRES_POOL_MAX: 100
kubectl rollout restart deployment orchestrator -n marcus-platform

# Increase agent timeout for complex citations
kubectl edit configmap marcus-config -n marcus-platform
# AGENT_TIMEOUT_MS: 60000
kubectl rollout restart deployment citation-agent -n marcus-platform
```

---

**Runbook Maintained By:** Platform Team
**Last Tested:** November 22, 2025
**Next Review:** December 22, 2025
