# MARCUS Platform Migration Guide

**Last Updated:** November 22, 2025
**Author:** Marcus (Platform Engineer)

---

## Table of Contents

1. [Spawn-Agents → Worker Service Migration](#spawn-agents-worker-service-migration)
2. [Breaking Changes](#breaking-changes)
3. [Version Compatibility Matrix](#version-compatibility-matrix)

---

## Spawn-Agents → Worker Service Migration

### Overview

**What Changed:** MARCUS 3.1 deprecates the spawn-agents orchestrator pattern in favor of the worker service pattern.

**Why:** Worker service pattern provides:
- Horizontal scalability (scale agents independently)
- Better resilience (worker failures don't affect orchestrator)
- Kubernetes-native autoscaling (HPA support)
- Operational simplicity (independent deployments)

**Timeline:**
- MARCUS 3.0 (Nov 2025): Both patterns supported, spawn-agents marked LEGACY
- **MARCUS 3.1 (Nov 2025)**: Spawn-agents DEPRECATED, archived to `legacy/`
- MARCUS 4.0 (TBD): Spawn-agents code removal planned

---

### Architecture Comparison

#### OLD: Spawn-Agents Pattern (DEPRECATED)

```
┌─────────────────────────────────────────────────────────┐
│         TypeScript Orchestrator Container               │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  CitationAgentOrchestrator (TypeScript)          │  │
│  └──────┬──────────────────────────────────┬────────┘  │
│         │                                   │           │
│    ┌────▼────┐    ┌──────────┐     ┌──────▼────┐      │
│    │ Agent 1 │    │ Agent 2  │ ... │  Agent N  │      │
│    │(Python) │    │(Python)  │     │ (Python)  │      │
│    └─────────┘    └──────────┘     └───────────┘      │
└─────────────────────────────────────────────────────────┘
```

**Problems:**
- Tight coupling (agents in same container)
- Limited scalability (vertical only)
- Single point of failure

#### NEW: Worker Service Pattern (RECOMMENDED)

```
┌────────────────────────────────┐
│  Worker Orchestrator           │
│  - API Server                  │
│  - Task submission to Redis    │
└────────┬───────────────────────┘
         │
    ┌────▼────────────────────┐
    │   Redis Task Queue      │
    └────┬────────────────────┘
         │
    ┌────▼────────────────────────────────────┐
    │   Citation Workers (Scalable)           │
    │  ┌──────┐  ┌──────┐  ┌──────┐          │
    │  │Agent1│  │Agent2│  │AgentN│          │
    │  └──────┘  └──────┘  └──────┘          │
    └──────────────────────────────────────────┘
```

**Advantages:**
- Horizontal scalability
- Resilience
- Kubernetes HPA support
- Independent deployments

---

### Step-by-Step Migration

#### Step 1: Update docker-compose.yml

**OLD configuration (spawn-agents):**
```yaml
orchestrator-spawn-agents:
  build:
    context: .
    dockerfile: docker/Dockerfile.spawn-agents-orchestrator
  ports:
    - "3003:3000"
  environment:
    NUM_AGENTS: 3
```

**NEW configuration (worker service):**
```yaml
# Orchestrator (API server only)
citation-worker-orchestrator:
  build:
    context: .
    dockerfile: docker/Dockerfile.citation-worker-orchestrator
  ports:
    - "3002:3000"
  environment:
    REDIS_HOST: redis
    REDIS_PORT: 6379

# Workers (scalable)
citation-agent:
  build:
    context: .
    dockerfile: docker/Dockerfile.agent
  environment:
    REDIS_HOST: redis
    REDIS_PORT: 6379
  deploy:
    replicas: 3  # Scale as needed
```

**What to change:**
1. Comment out or remove `orchestrator-spawn-agents` service
2. Enable `citation-worker-orchestrator` service (should be active by default)
3. Ensure `citation-agent` service is present with `deploy.replicas` configured

#### Step 2: Update Kubernetes Manifests

**Remove spawn-agents deployment (if it exists):**
```bash
# Check if spawn-agents deployment exists
kubectl get deployment -n marcus-platform | grep spawn

# If found, delete it
kubectl delete deployment spawn-agents-orchestrator -n marcus-platform
```

**Verify worker service deployment:**
```bash
# Check orchestrator deployment
kubectl get deployment orchestrator -n marcus-platform

# Check agent deployment
kubectl get deployment citation-agent -n marcus-platform

# Verify HPA is configured
kubectl get hpa -n marcus-platform
```

Expected output:
```
NAME                 READY   UP-TO-DATE   AVAILABLE
orchestrator         3/3     3            3
citation-agent       3/3     3            3

NAME                    REFERENCE               TARGETS          MINPODS   MAXPODS
citation-agent-hpa      Deployment/citation-agent   2/10 (20%)      3         100
```

#### Step 3: Update Environment Variables

**Spawn-agents environment variables (OLD):**
```bash
# These variables are NO LONGER USED
NUM_AGENTS=3
AGENT_TIMEOUT=30000
AGENT_RESTART_DELAY=5000
```

**Worker service environment variables (NEW):**
```bash
# Orchestrator configuration
REDIS_HOST=redis-cluster-0.redis-cluster.marcus-platform.svc.cluster.local
REDIS_PORT=6379
REDIS_PASSWORD=<secret>
TASK_QUEUE_NAME=citations:tasks
RESULT_TTL=3600

# Worker configuration (for citation-agent containers)
REDIS_HOST=redis-cluster-0.redis-cluster.marcus-platform.svc.cluster.local
REDIS_PORT=6379
REDIS_PASSWORD=<secret>
AGENT_ID=${HOSTNAME}  # Auto-generated from pod name
```

**Migration checklist:**
- [ ] Remove `NUM_AGENTS` from orchestrator config
- [ ] Add `REDIS_HOST` and `REDIS_PORT` to orchestrator
- [ ] Configure Redis queue name (`TASK_QUEUE_NAME`)
- [ ] Set result TTL (`RESULT_TTL`)
- [ ] Configure worker environment variables

#### Step 4: Test Migration

**Local testing with docker-compose:**
```bash
# Start services
docker-compose up -d

# Check orchestrator logs
docker-compose logs -f citation-worker-orchestrator

# Check worker logs
docker-compose logs -f citation-agent

# Submit test request
curl -X POST http://localhost:3002/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "Test citation", "source": "Test"}'

# Verify workers picked up task
docker-compose logs citation-agent | grep "Processing task"
```

**Kubernetes testing:**
```bash
# Check pod status
kubectl get pods -n marcus-platform

# Check orchestrator logs
kubectl logs -n marcus-platform -l app=orchestrator --tail=100

# Check worker logs
kubectl logs -n marcus-platform -l app=citation-agent --tail=100

# Submit test request via ingress
curl -X POST https://marcus.yourdomain.com/analyze \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text": "Test citation", "source": "Test"}'
```

#### Step 5: Scale Workers (Kubernetes)

**Manual scaling:**
```bash
# Scale to 10 workers
kubectl scale deployment citation-agent -n marcus-platform --replicas=10

# Verify scaling
kubectl get pods -n marcus-platform -l app=citation-agent
```

**Autoscaling with HPA:**
```bash
# HPA should already be configured (see k8s/hpa-citation-workers.yaml)
kubectl get hpa citation-agent-hpa -n marcus-platform

# Test autoscaling by generating load
kubectl run -n marcus-platform load-test --image=busybox --restart=Never -- \
  sh -c "while true; do wget -q -O- http://orchestrator:3000/analyze; done"

# Watch HPA scale up
kubectl get hpa citation-agent-hpa -n marcus-platform --watch
```

#### Step 6: Verify Metrics

**Check Prometheus metrics:**
```bash
# Port-forward Prometheus
kubectl port-forward -n marcus-platform svc/prometheus 9090:9090

# Open browser: http://localhost:9090

# Query worker queue metrics
citations_queue_depth  # Should show queue size
citations_queue_lag    # Should show processing lag
citations_worker_count # Should show active workers
```

**Check Grafana dashboards:**
```bash
# Port-forward Grafana
kubectl port-forward -n marcus-platform svc/grafana 3000:3000

# Open browser: http://localhost:3000
# Username: admin
# Password: (from secrets)

# View dashboards:
# - MARCUS Citation Platform Overview
# - Worker Performance Metrics
# - Queue Health Dashboard
```

---

### Rollback Procedure

If you need to rollback to spawn-agents pattern:

**Warning:** Rollback is NOT RECOMMENDED. Spawn-agents is deprecated and will be removed in MARCUS 4.0.

**Emergency rollback steps:**

1. **Uncomment spawn-agents in docker-compose.yml:**
   ```yaml
   orchestrator-spawn-agents:
     # ... (uncomment entire service block)
   ```

2. **Stop worker services:**
   ```bash
   docker-compose stop citation-worker-orchestrator citation-agent
   ```

3. **Start spawn-agents orchestrator:**
   ```bash
   docker-compose up -d orchestrator-spawn-agents
   ```

4. **For Kubernetes:**
   ```bash
   # Scale down worker pattern
   kubectl scale deployment orchestrator -n marcus-platform --replicas=0
   kubectl scale deployment citation-agent -n marcus-platform --replicas=0

   # Deploy spawn-agents (requires creating deployment manifest)
   # NOT RECOMMENDED - create GitHub issue instead
   ```

**Better alternative:** File a GitHub issue describing the problem with worker service pattern. The platform team will help debug and fix the issue.

---

### Breaking Changes

#### API Endpoint Changes

**Spawn-agents pattern (OLD):**
```bash
POST /analyze-citation
```

**Worker service pattern (NEW):**
```bash
# Same endpoint, but async by default
POST /analyze

# Optional: Poll for result
GET /analyze/{request_id}/status
GET /analyze/{request_id}/result
```

**Migration notes:**
- Endpoint names remain the same
- Response format unchanged for synchronous requests
- New async endpoints available for long-running requests

#### Configuration Changes

**Removed environment variables:**
- `NUM_AGENTS` - Workers scale independently via HPA
- `AGENT_TIMEOUT` - Configured per-worker instead
- `AGENT_RESTART_DELAY` - Kubernetes handles restart logic

**New environment variables:**
- `REDIS_HOST` - Redis cluster endpoint
- `REDIS_PORT` - Redis port (default: 6379)
- `TASK_QUEUE_NAME` - Queue name for tasks (default: `citations:tasks`)
- `RESULT_TTL` - Result cache TTL in seconds (default: 3600)

#### Docker Image Changes

**Old image:**
```
ghcr.io/your-org/marcus-spawn-agents-orchestrator:v3.0.0
```

**New images:**
```
ghcr.io/your-org/marcus-citation-worker-orchestrator:v3.1.0
ghcr.io/your-org/marcus-citation-agent:v3.1.0
```

---

### Version Compatibility Matrix

| MARCUS Version | Spawn-Agents | Worker Service | Default Pattern |
|----------------|--------------|----------------|-----------------|
| 3.0            | Supported    | Supported      | Worker Service  |
| 3.1            | DEPRECATED   | **Recommended** | Worker Service  |
| 4.0 (planned)  | REMOVED      | **Only Option** | Worker Service  |

---

### Troubleshooting

#### Workers not picking up tasks

**Symptoms:**
- Orchestrator submits tasks to Redis
- Workers remain idle
- Queue depth increases

**Diagnosis:**
```bash
# Check Redis queue
kubectl exec -n marcus-platform redis-0 -- redis-cli LLEN citations:tasks

# Check worker logs
kubectl logs -n marcus-platform -l app=citation-agent | grep "Waiting for tasks"
```

**Solutions:**
1. Verify Redis connection: `REDIS_HOST` and `REDIS_PORT` correct
2. Check Redis password: `REDIS_PASSWORD` matches cluster password
3. Verify queue name: `TASK_QUEUE_NAME` matches orchestrator configuration
4. Check worker health: `kubectl get pods -n marcus-platform`

#### High queue lag

**Symptoms:**
- Queue depth consistently high
- Tasks waiting >5 seconds
- P95 latency above SLO

**Diagnosis:**
```bash
# Check current worker count
kubectl get pods -n marcus-platform -l app=citation-agent | wc -l

# Check HPA status
kubectl get hpa citation-agent-hpa -n marcus-platform

# Check queue metrics
kubectl port-forward -n marcus-platform svc/prometheus 9090:9090
# Query: citations_queue_lag
```

**Solutions:**
1. Scale workers manually: `kubectl scale deployment citation-agent --replicas=20`
2. Adjust HPA thresholds: Lower target queue depth (currently 10)
3. Increase max replicas: Edit `k8s/hpa-citation-workers.yaml`

#### Orchestrator can't connect to Redis

**Symptoms:**
- Orchestrator logs: "ECONNREFUSED" or "ETIMEDOUT"
- Tasks not submitted to queue

**Diagnosis:**
```bash
# Check Redis cluster health
kubectl get pods -n marcus-platform -l app=redis-cluster

# Check Redis service
kubectl get svc -n marcus-platform redis-cluster

# Test connection from orchestrator pod
kubectl exec -n marcus-platform orchestrator-<pod-id> -- \
  redis-cli -h redis-cluster-0.redis-cluster.marcus-platform.svc.cluster.local -p 6379 PING
```

**Solutions:**
1. Verify Redis cluster is running: All 6 pods should be Ready
2. Check `REDIS_HOST` format: Should be full FQDN for StatefulSet
3. Verify network policy: Ensure orchestrator can reach Redis namespace

---

### Support

If you encounter issues during migration:

1. **Check documentation:**
   - `docs/ORCHESTRATOR_ARCHITECTURES.md` - Architecture details
   - `docs/TROUBLESHOOTING_GUIDE.md` - Common issues
   - `src/platform/legacy/spawn-agents-orchestrator/README.md` - Deprecation notice

2. **Review logs:**
   - Orchestrator: `kubectl logs -n marcus-platform -l app=orchestrator`
   - Workers: `kubectl logs -n marcus-platform -l app=citation-agent`
   - Redis: `kubectl logs -n marcus-platform -l app=redis-cluster`

3. **File GitHub issue:**
   - Title: "[Migration] Spawn-agents → Worker Service Issue"
   - Include: Logs, environment variables, deployment manifests
   - Tag: `@marcus-platform-engineer`

---

**Last Updated:** November 22, 2025
**Migration Support:** marcus@platform.engineering
