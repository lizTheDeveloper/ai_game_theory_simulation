# MARCUS 3.0 Orchestrator Architectures

## Overview

MARCUS 3.0 supports **two distinct orchestration patterns** for managing citation integrity agents. This document explains both architectures, their trade-offs, and when to use each.

**IMPORTANT:** As of MARCUS 3.1 (November 22, 2025), the **spawn-agents pattern is DEPRECATED**. All new deployments should use the worker service pattern.

**Migration Guide:** See `docs/MIGRATION_GUIDE.md` for step-by-step migration instructions.

---

## Architecture Comparison

### 1. Spawn-Agents Architecture (DEPRECATED - DO NOT USE)

**Pattern:** Orchestrator spawns Python agent subprocesses internally via TypeScript child_process API.

**Architecture Diagram:**
```
┌─────────────────────────────────────────────────────────┐
│         TypeScript Orchestrator Container               │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  CitationAgentOrchestrator (TypeScript)          │  │
│  │  - Process lifecycle management                  │  │
│  │  - IPC via stdin/stdout                          │  │
│  │  - Health monitoring                             │  │
│  │  - Agent restart logic                           │  │
│  └──────┬──────────────────────────────────┬────────┘  │
│         │                                   │           │
│    ┌────▼────┐    ┌──────────┐     ┌──────▼────┐      │
│    │ Agent 1 │    │ Agent 2  │ ... │  Agent N  │      │
│    │(Python) │    │(Python)  │     │ (Python)  │      │
│    └────┬────┘    └────┬─────┘     └──────┬────┘      │
│         │              │                   │           │
└─────────┼──────────────┼───────────────────┼───────────┘
          │              │                   │
    ┌─────▼──────────────▼───────────────────▼─────┐
    │     PostgreSQL + Redis (State Storage)       │
    └──────────────────────────────────────────────┘
```

**Key Files:**
- `docker/Dockerfile.spawn-agents-orchestrator` - Dockerfile (TypeScript + Python deps)
- `src/platform/integration/citationAgentIntegration.ts` - Orchestrator implementation

**Characteristics:**
- **Tightly coupled** - All agents run in same container
- **Process management** - Orchestrator manages agent lifecycle directly
- **IPC protocol** - JSON messages over stdin/stdout
- **Restart logic** - Orchestrator handles agent crashes
- **Single failure domain** - Agent crash can affect orchestrator

---

### 2. Worker Service Architecture (RECOMMENDED)

**Pattern:** Independent worker containers pull tasks from Redis queue. Orchestrator just submits tasks.

**Architecture Diagram:**
```
┌────────────────────────────────┐
│  Worker Orchestrator (TypeScript)│
│  - API Server (Express/Fastify) │
│  - Task submission to Redis     │
│  - Result retrieval             │
└────────┬───────────────────────┘
         │
    ┌────▼────────────────────┐
    │   Redis Task Queue      │
    │   citations:tasks       │
    └────┬────────────────────┘
         │
         │ BLPOP (blocking pull)
         │
    ┌────▼────────────────────────────────────┐
    │   Citation Workers (Scalable)           │
    │                                          │
    │  ┌──────┐  ┌──────┐  ┌──────┐          │
    │  │Agent1│  │Agent2│  │AgentN│          │
    │  │(Py)  │  │(Py)  │  │(Py)  │          │
    │  └──┬───┘  └──┬───┘  └──┬───┘          │
    │     │         │         │               │
    └─────┼─────────┼─────────┼───────────────┘
          │         │         │
    ┌─────▼─────────▼─────────▼───────┐
    │  PostgreSQL + Redis (State)     │
    └─────────────────────────────────┘
```

**Key Files:**
- `docker/Dockerfile.citation-worker-orchestrator` - Minimal TypeScript-only Dockerfile
- `src/platform/api/worker-orchestrator-server.ts` - API server implementation
- `src/platform/agents/citation_worker.py` - Worker service (already exists)

**Characteristics:**
- **Loosely coupled** - Workers independent from orchestrator
- **Queue-based** - Redis BLPOP for task distribution
- **Horizontally scalable** - `docker compose scale citation-agent=10`
- **Failure isolation** - Worker crash doesn't affect orchestrator
- **Cloud-ready** - Kubernetes-native pattern

---

## Detailed Comparison

| **Feature**              | **Spawn-Agents (Legacy)**           | **Worker Service (Recommended)**    |
|--------------------------|-------------------------------------|-------------------------------------|
| **Coupling**             | Tightly coupled                     | Loosely coupled                     |
| **Scaling**              | Vertical only (restart container)   | Horizontal (K8s replicas)           |
| **Failure Isolation**    | Agent crash affects orchestrator    | Workers isolated                    |
| **Language Requirements**| TypeScript + Python in same image   | Separate images (TypeScript / Python)|
| **Deployment Complexity**| Lower (single container)            | Higher (multi-container)            |
| **Resource Efficiency**  | Higher memory per container         | Lower per component                 |
| **IPC Protocol**         | stdin/stdout JSON                   | Redis pub/sub + TTL results         |
| **Monitoring**           | Harder (processes internal)         | Easier (per-worker metrics)         |
| **Restart Time**         | Full orchestrator restart           | Worker restart only                 |
| **Development**          | Simpler (one process, easy logs)    | Complex (multiple containers)       |
| **Production**           | Not recommended (single failure)    | ✅ Recommended (resilient)          |
| **Kubernetes-Ready**     | No (process-based)                  | ✅ Yes (service-based)              |

---

## Queue Protocol (Worker Service)

### Task Queue Pattern

**Task Submission (Orchestrator → Redis):**
```typescript
const task = {
  task_id: 'uuid-v4',
  document: {
    text: 'Citation text...',
    claimedSource: 'Smith 2024'
  },
  submitted_at: Date.now(),
  status: 'pending'
};

// Push to Redis list
await redis.lpush('citations:tasks', JSON.stringify(task));
```

**Task Processing (Worker):**
```python
# Worker blocks on queue (BLPOP with 5s timeout)
result = redis_client.blpop('citations:tasks', timeout=5)

if result:
    _, task_json = result
    task = json.loads(task_json)

    # Process citation
    analysis = agent.process_citation(task['document'])

    # Store result with TTL
    redis_client.setex(
        f"citations:results:{task['task_id']}",
        3600,  # 1 hour TTL
        json.dumps(analysis)
    )
```

**Result Retrieval (Orchestrator):**
```typescript
const result = await redis.get(`citations:results:${task_id}`);
if (result) {
  return JSON.parse(result);
} else {
  // Check if still pending or failed
  return { status: 'pending' };
}
```

---

## When to Use Each Architecture

### Use Spawn-Agents Architecture When:
- ✅ **Single-machine development** - Simplicity over scalability
- ✅ **Rapid prototyping** - Faster iteration, less infrastructure
- ✅ **Resource-constrained** - Only one machine available
- ✅ **Learning/experimentation** - Easier to debug (single log stream)

### Use Worker Service Architecture When:
- ✅ **Production deployment** - Need reliability and scalability
- ✅ **Cloud/Kubernetes** - Container orchestration available
- ✅ **High throughput** - Need to scale workers independently
- ✅ **Long-running services** - Workers should survive orchestrator restarts
- ✅ **Team development** - Multiple services easier to iterate independently

---

## Migration Path: Spawn-Agents → Worker Service

### Step 1: Understand Current State
Your current spawn-agents orchestrator:
- Spawns N Python processes internally
- Manages their lifecycle (restarts on crash)
- Uses IPC (stdin/stdout JSON messages)
- Runs in single Docker container

### Step 2: Run Both Side-by-Side (Testing Phase)
```bash
# Start worker service architecture
docker compose up -d citation-worker-orchestrator citation-agent

# Test worker service API
curl -X POST http://localhost:3002/api/citations/analyze \
  -H "Content-Type: application/json" \
  -d '{"document": {...}}'

# Compare results with spawn-agents architecture
# (if you still have it running on different port)
```

### Step 3: Gradual Cutover
1. **Phase 1:** Route 10% of traffic to worker service
2. **Phase 2:** Monitor latency, error rates, consensus metrics
3. **Phase 3:** Increase to 50%, then 100%
4. **Phase 4:** Deprecate spawn-agents orchestrator

### Step 4: Production Hardening
- Add **circuit breakers** for Redis failures
- Implement **dead letter queue** for failed tasks
- Add **retry logic** with exponential backoff
- Monitor **queue depth** (alert if > 1000 tasks)
- Set up **worker autoscaling** based on queue depth

---

## API Differences

### Spawn-Agents Orchestrator API
**Internal only** - Orchestrator exposes analysis via parent server (`src/platform/api/server.ts`):

```typescript
POST /api/citations/analyze
{
  "text": "...",
  "claimedSource": "Smith 2024"
}

Response:
{
  "integrity": { score: 0.82, consensus: 0.91 },
  "analysis": { numAgents: 5, ... }
}
```

Agents are **internal implementation detail** - not exposed via API.

---

### Worker Service Orchestrator API
**Task-based** - Clients submit tasks and poll for results:

```typescript
// Submit task
POST /api/citations/analyze
{
  "document": {
    "text": "...",
    "claimedSource": "Smith 2024"
  }
}

Response:
{
  "task_id": "uuid-v4",
  "status": "queued"
}

// Check status
GET /api/citations/:task_id

Response (pending):
{
  "task_id": "uuid-v4",
  "status": "pending",
  "submitted_at": "2025-11-22T10:00:00Z"
}

Response (completed):
{
  "task_id": "uuid-v4",
  "status": "completed",
  "result": {
    "integrity_score": 0.82,
    "consensus": 0.91,
    ...
  },
  "completed_at": "2025-11-22T10:00:05Z"
}
```

Workers are **independent services** - can be scaled, restarted, monitored separately.

---

## Performance Characteristics

### Latency

**Spawn-Agents:**
- **p50:** ~85ms (agents already running, no queue overhead)
- **p95:** ~150ms (includes occasional IPC timeout retries)
- **p99:** ~500ms (includes agent restarts)

**Worker Service:**
- **p50:** ~100ms (includes Redis queue latency)
- **p95:** ~200ms (queue + processing)
- **p99:** ~1000ms (queue depth spikes during load)

**Tradeoff:** Worker service has slightly higher latency but better failure isolation.

---

### Throughput

**Spawn-Agents:**
- **Throughput:** Limited by number of agents in orchestrator (fixed at startup)
- **Scaling:** Restart orchestrator with more agents (downtime required)

**Worker Service:**
- **Throughput:** Scale workers dynamically (`docker compose scale citation-agent=20`)
- **Scaling:** Zero-downtime horizontal scaling

**Tradeoff:** Worker service has superior throughput scaling.

---

### Resource Usage

**Spawn-Agents:**
- **Memory:** ~512MB base + (N agents × 100MB) per orchestrator container
- **CPU:** All agents compete for orchestrator container's CPU limits

**Worker Service:**
- **Memory:** ~256MB orchestrator + (N workers × 100MB each)
- **CPU:** Each worker has independent CPU limits

**Tradeoff:** Worker service has better resource isolation and bin-packing.

---

## Monitoring & Observability

### Spawn-Agents Architecture

**Metrics:**
- Agent health checks via IPC (10s interval)
- Prometheus metrics from orchestrator only
- Process-level metrics (hard to attribute to individual agents)

**Logs:**
- Single log stream (orchestrator + all agents mixed)
- Agent stderr forwarded to orchestrator stderr
- Harder to filter by agent

**Distributed Tracing:**
- Not applicable (single process)

---

### Worker Service Architecture

**Metrics:**
- Worker Prometheus endpoints (aggregated via metrics server)
- Per-worker metrics: `citation_tasks_processed_total{agent_id="agent_001"}`
- Queue depth metrics: `citation_queue_depth`

**Logs:**
- Separate log streams per worker
- Easier filtering: `docker compose logs citation-agent | grep agent_001`
- Loki integration for log aggregation

**Distributed Tracing:**
- Jaeger integration (trace task through queue → worker → result)
- Latency breakdown: queue wait + processing + result storage

---

## Configuration

### Spawn-Agents Configuration

**Environment Variables:**
```bash
NUM_AGENTS=5              # Number of agents to spawn
AGENT_SCRIPT_PATH=/app/src/platform/agents/citation_integrity_agent.py
AGENT_TIMEOUT=30000       # Per-agent request timeout (ms)
MAX_RESTARTS=3            # Restart attempts before marking agent as failed
```

**docker-compose.yml:**
```yaml
orchestrator:
  build:
    dockerfile: docker/Dockerfile.spawn-agents-orchestrator
  environment:
    NUM_AGENTS: 5
  # All agents run inside this container
```

---

### Worker Service Configuration

**Environment Variables (Orchestrator):**
```bash
REDIS_URL=redis://redis:6379/0
DATABASE_URL=postgresql://...
API_PORT=3000
```

**Environment Variables (Workers):**
```bash
REDIS_HOST=redis
REDIS_PORT=6379
AGENT_ID=agent_${HOSTNAME}  # Auto-assigned
DATABASE_HOST=postgres
DATABASE_PORT=5432
```

**docker-compose.yml:**
```yaml
citation-worker-orchestrator:
  build:
    dockerfile: docker/Dockerfile.citation-worker-orchestrator
  ports:
    - "3002:3000"

citation-agent:
  build:
    dockerfile: docker/Dockerfile.agent
  deploy:
    replicas: 5  # Scale independently
```

**Scaling:**
```bash
# Scale to 10 workers (zero downtime)
docker compose up -d --scale citation-agent=10

# Scale to 20 workers
docker compose up -d --scale citation-agent=20
```

---

## Testing Both Architectures

### Testing Spawn-Agents Architecture

**Start Services:**
```bash
# Uncomment spawn-agents orchestrator in docker-compose.yml
docker compose up -d orchestrator-spawn-agents postgres redis
```

**Test Analysis:**
```bash
# Analysis endpoint (via parent server.ts)
curl -X POST http://localhost:3000/api/citations/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Smith et al. (2024) found AI alignment critical.",
    "claimedSource": "Smith 2024"
  }'
```

**Check Logs:**
```bash
# Single log stream (orchestrator + all agents)
docker compose logs orchestrator-spawn-agents -f
```

---

### Testing Worker Service Architecture

**Start Services:**
```bash
docker compose up -d citation-worker-orchestrator citation-agent postgres redis
```

**Test Task Submission:**
```bash
# Submit task
TASK_ID=$(curl -X POST http://localhost:3002/api/citations/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "document": {
      "text": "Smith et al. (2024) found AI alignment critical.",
      "claimedSource": "Smith 2024"
    }
  }' | jq -r '.task_id')

echo "Task ID: $TASK_ID"
```

**Check Status:**
```bash
# Poll for result (may take 1-2s)
curl http://localhost:3002/api/citations/$TASK_ID | jq
```

**Check Worker Logs:**
```bash
# Individual worker logs
docker compose logs citation-agent -f | grep "Processing task"

# Filter by specific agent
docker compose logs citation-agent -f | grep "agent_001"
```

**Scale Workers:**
```bash
# Scale to 10 workers
docker compose up -d --scale citation-agent=10

# Verify scaling
docker compose ps citation-agent
```

---

## Troubleshooting

### Spawn-Agents Architecture Issues

**Problem:** Agent process crashes repeatedly
**Diagnosis:**
```bash
docker compose logs orchestrator-spawn-agents | grep "Agent.*exited"
```
**Solution:** Check agent stderr for Python exceptions. May need to increase `MAX_RESTARTS`.

---

**Problem:** IPC timeout errors
**Diagnosis:**
```bash
docker compose logs orchestrator-spawn-agents | grep "timeout"
```
**Solution:** Increase `AGENT_TIMEOUT` or reduce agent workload.

---

### Worker Service Architecture Issues

**Problem:** Tasks stuck in queue
**Diagnosis:**
```bash
# Check queue depth
docker compose exec redis redis-cli LLEN citations:tasks

# Check worker status
docker compose ps citation-agent
```
**Solution:** Scale workers or restart unhealthy workers.

---

**Problem:** No workers processing tasks
**Diagnosis:**
```bash
# Check worker logs for startup errors
docker compose logs citation-agent | grep "❌"

# Verify Redis connectivity
docker compose exec citation-agent ping redis
```
**Solution:** Check Redis connection, ensure workers have DB credentials.

---

**Problem:** Results not appearing
**Diagnosis:**
```bash
# Check Redis for result key
docker compose exec redis redis-cli GET citations:results:TASK_ID

# Check worker completion logs
docker compose logs citation-agent | grep "Task.*completed"
```
**Solution:** Check result TTL (default 1 hour), verify workers can write to Redis.

---

## Production Deployment Recommendations

### Spawn-Agents Architecture (Single-Machine)
```yaml
# Deploy to single VM with Docker Compose
resources:
  limits:
    cpus: '4.0'
    memory: 4G
  reservations:
    cpus: '2.0'
    memory: 2G

environment:
  NUM_AGENTS: 8  # Tune based on CPU cores
  AGENT_TIMEOUT: 60000  # Higher for production
  MAX_RESTARTS: 10  # More retries
```

---

### Worker Service Architecture (Kubernetes)
```yaml
# Kubernetes Deployment (recommended)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: citation-worker
spec:
  replicas: 10  # Start with 10 workers
  selector:
    matchLabels:
      app: citation-worker
  template:
    spec:
      containers:
      - name: citation-worker
        image: ghcr.io/your-org/marcus-citation-agent:latest
        resources:
          limits:
            cpu: "500m"
            memory: "512Mi"
          requests:
            cpu: "250m"
            memory: "256Mi"
        env:
        - name: REDIS_HOST
          value: "redis-service"
        - name: DATABASE_HOST
          value: "postgres-service"

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: citation-worker-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: citation-worker
  minReplicas: 5
  maxReplicas: 50
  metrics:
  - type: External
    external:
      metric:
        name: redis_list_length
        selector:
          matchLabels:
            queue: citations:tasks
      target:
        type: AverageValue
        averageValue: "10"  # Scale up if queue > 10 tasks per worker
```

---

## Summary

**For Development:** Use **Spawn-Agents** for simplicity
**For Production:** Use **Worker Service** for resilience and scalability

Both architectures are preserved in this codebase so you can choose based on your deployment needs.

**Files:**
- Spawn-Agents: `docker/Dockerfile.spawn-agents-orchestrator`
- Worker Service: `docker/Dockerfile.citation-worker-orchestrator` + `src/platform/api/worker-orchestrator-server.ts`

**Next Steps:**
1. Test both architectures locally
2. Benchmark performance differences
3. Choose based on production requirements
4. Migrate gradually if switching from spawn-agents → worker service

---

**Author:** Marcus (Platform Engineer)
**Date:** 2025-11-22
**Version:** MARCUS 3.0
