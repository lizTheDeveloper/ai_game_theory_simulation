# MARCUS 3.0 Orchestrator Testing Guide

Complete testing guide for both orchestrator architectures: Spawn-Agents (legacy) and Worker Service (recommended).

---

## Prerequisites

**Required:**
- Docker and Docker Compose installed
- PostgreSQL client (for database queries)
- Redis CLI (for queue inspection)
- curl or httpie (for API testing)
- jq (for JSON parsing)

**Environment Setup:**
```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

**Minimal .env:**
```bash
POSTGRES_USER=marcus
POSTGRES_PASSWORD=changeme
POSTGRES_DB=citation_integrity
NUM_AGENTS=3
LOG_LEVEL=INFO
```

---

## Architecture 1: Worker Service Pattern (Recommended)

### 1.1 Start Services

```bash
# Start infrastructure (PostgreSQL, Redis)
docker compose up -d postgres redis

# Wait for health checks
docker compose ps | grep healthy

# Start worker orchestrator and workers
docker compose up -d citation-worker-orchestrator citation-agent

# Verify all services running
docker compose ps
```

**Expected Output:**
```
NAME                         STATUS              PORTS
marcus-postgres             Up (healthy)        5432/tcp -> 5433
marcus-redis                Up (healthy)        6379/tcp -> 6380
marcus-worker-orchestrator  Up (healthy)        3000/tcp -> 3002
citation-agent-1            Up                  (no ports)
citation-agent-2            Up                  (no ports)
citation-agent-3            Up                  (no ports)
```

### 1.2 Health Check

```bash
# Check orchestrator health
curl http://localhost:3002/health | jq

# Expected response
{
  "status": "healthy",
  "timestamp": "2025-11-22T10:00:00.000Z",
  "components": {
    "redis": "healthy",
    "database": "healthy"
  },
  "queue": {
    "depth": 0
  }
}
```

### 1.3 Submit Citation Analysis Task

```bash
# Submit task via API
TASK_ID=$(curl -X POST http://localhost:3002/api/citations/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "document": {
      "text": "According to Smith et al. (2024), AI alignment is critical for safety.",
      "claimedSource": "Smith et al. 2024"
    }
  }' | jq -r '.task_id')

echo "Task ID: $TASK_ID"

# Expected response
{
  "task_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "status": "queued",
  "message": "Task submitted successfully"
}
```

### 1.4 Monitor Task Processing

```bash
# Watch worker logs (real-time)
docker compose logs citation-agent -f

# Expected log output
citation-agent-1  | 🔍 Processing task f47ac10b-58cc-4372-a567-0e02b2c3d479
citation-agent-1  | ✅ Task f47ac10b-58cc-4372-a567-0e02b2c3d479 completed - Integrity: 0.82
```

### 1.5 Retrieve Result

```bash
# Check task status (poll every 1s until completed)
while true; do
  STATUS=$(curl -s http://localhost:3002/api/citations/$TASK_ID | jq -r '.status')
  echo "Status: $STATUS"
  if [ "$STATUS" = "completed" ]; then
    break
  fi
  sleep 1
done

# Get full result
curl http://localhost:3002/api/citations/$TASK_ID | jq

# Expected response
{
  "task_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "status": "completed",
  "result": {
    "integrity_score": 0.82,
    "behavior_used": "conservative",
    "confidence": 0.91,
    "detected_violations": [],
    "metadata": { ... },
    "agent_id": "agent_001",
    "agent_reputation": 0.75
  },
  "submitted_at": 1700650000000,
  "completed_at": 1700650005000
}
```

### 1.6 Inspect Redis Queue

```bash
# Check queue depth
docker compose exec redis redis-cli LLEN citations:tasks

# Check result keys
docker compose exec redis redis-cli KEYS "citations:results:*"

# Get specific result
docker compose exec redis redis-cli GET "citations:results:$TASK_ID"
```

### 1.7 Inspect PostgreSQL Database

```bash
# Connect to database
docker compose exec postgres psql -U marcus -d citation_integrity

# Query tasks
SELECT task_id, status, submitted_at, completed_at
FROM citation_tasks
ORDER BY submitted_at DESC
LIMIT 10;

# Exit
\q
```

### 1.8 Scale Workers

```bash
# Scale to 10 workers (zero downtime)
docker compose up -d --scale citation-agent=10

# Verify scaling
docker compose ps citation-agent

# Expected: 10 containers running

# Submit 20 tasks to test parallelism
for i in {1..20}; do
  curl -X POST http://localhost:3002/api/citations/analyze \
    -H "Content-Type: application/json" \
    -d "{\"document\": {\"text\": \"Test $i\", \"claimedSource\": \"Test\"}}" &
done
wait

# Check queue stats
curl http://localhost:3002/api/queue/stats | jq

# Expected: All 20 tasks processed quickly
```

### 1.9 Performance Testing

```bash
# Load test with Apache Bench (100 requests, 10 concurrent)
ab -n 100 -c 10 -T application/json \
  -p /tmp/citation_payload.json \
  http://localhost:3002/api/citations/analyze

# Payload file
cat > /tmp/citation_payload.json <<EOF
{
  "document": {
    "text": "Load test citation",
    "claimedSource": "Test 2024"
  }
}
EOF

# Expected metrics:
# - Requests per second: ~20-50 (depends on worker count)
# - Mean latency: ~100ms
# - p95 latency: ~200ms
```

### 1.10 Failure Testing

```bash
# Kill a worker mid-task
docker compose kill citation-agent-1

# Submit task (should still work with remaining workers)
curl -X POST http://localhost:3002/api/citations/analyze \
  -H "Content-Type: application/json" \
  -d '{"document": {"text": "Test", "claimedSource": "Test"}}'

# Worker should restart automatically
docker compose ps citation-agent

# Restart all workers (orchestrator unaffected)
docker compose restart citation-agent

# Orchestrator should continue accepting tasks
curl http://localhost:3002/health
```

### 1.11 Cleanup

```bash
# Stop services
docker compose down

# Remove volumes (data persists otherwise)
docker compose down -v

# Remove images
docker compose down --rmi all
```

---

## Architecture 2: Spawn-Agents Pattern (Legacy)

### 2.1 Enable Spawn-Agents Architecture

**Edit `docker-compose.yml`:**
```yaml
# Uncomment the orchestrator-spawn-agents service (lines 101-127)
# Comment out citation-worker-orchestrator (lines 132-163)
```

**OR use override file:**
```bash
# Create docker-compose.override.yml
cat > docker-compose.override.yml <<EOF
version: '3.8'

services:
  # Disable worker orchestrator
  citation-worker-orchestrator:
    scale: 0

  # Enable spawn-agents orchestrator
  orchestrator-spawn-agents:
    build:
      context: .
      dockerfile: docker/Dockerfile.spawn-agents-orchestrator
    image: marcus-spawn-agents-orchestrator:latest
    container_name: marcus-orchestrator-spawn-agents
    environment:
      DATABASE_URL: postgresql://marcus:changeme@postgres:5432/citation_integrity
      REDIS_URL: redis://redis:6379/0
      NUM_AGENTS: 3
      API_PORT: 3000
    ports:
      - "3003:3000"
    depends_on:
      - postgres
      - redis
    networks:
      - marcus-network
EOF
```

### 2.2 Start Spawn-Agents Orchestrator

```bash
# Start infrastructure
docker compose up -d postgres redis

# Start spawn-agents orchestrator (builds agents internally)
docker compose up -d orchestrator-spawn-agents

# Verify running
docker compose ps orchestrator-spawn-agents
```

### 2.3 Monitor Internal Agents

```bash
# Watch orchestrator logs (includes all agent logs)
docker compose logs orchestrator-spawn-agents -f

# Expected output:
# ✅ Agent agent_000 started (PID: 1234)
# ✅ Agent agent_001 started (PID: 1235)
# ✅ Agent agent_002 started (PID: 1236)
# ✅ Orchestrator initialized with 3 agents
```

### 2.4 Submit Analysis (via Parent Server)

**Note:** Spawn-agents orchestrator is typically used as a library by `src/platform/api/server.ts`, not standalone.

**Option A: Use Parent Server**
```bash
# Start main API server (imports orchestrator)
npm run start:platform

# Submit via parent API
curl -X POST http://localhost:3000/api/citations/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Smith 2024 citation",
    "claimedSource": "Smith 2024"
  }' | jq
```

**Option B: Direct Orchestrator Testing (programmatic)**
```typescript
// test-spawn-agents.ts
import { CitationIntegrityPlatform, PlatformConfig } from './src/platform/integration/citationAgentIntegration';

const config: PlatformConfig = {
  numAgents: 3,
  agentScriptPath: './src/platform/agents/citation_integrity_agent.py',
  // ... rest of config
};

const platform = new CitationIntegrityPlatform(config);
await platform.start();

const result = await platform.analyzeDocument({
  text: 'Test citation',
  claimedSource: 'Test 2024'
});

console.log(result);
```

### 2.5 Check Agent Health

```bash
# Get agent statuses (if exposed via API)
# This requires implementing getAgentStatuses endpoint in spawn-agents mode

# Alternative: grep logs for health checks
docker compose logs orchestrator-spawn-agents | grep "health"
```

### 2.6 Restart Agent on Failure

```bash
# Agents auto-restart on crash (up to MAX_RESTARTS limit)
# Watch logs for restart attempts

docker compose logs orchestrator-spawn-agents | grep "Restarting agent"

# Expected:
# 🔄 Restarting agent agent_001 (attempt 1/3)
# ✅ Agent agent_001 started (PID: 5678)
```

### 2.7 Scale Agents

```bash
# Scaling requires restarting orchestrator with new NUM_AGENTS value

# Stop orchestrator
docker compose stop orchestrator-spawn-agents

# Update NUM_AGENTS in .env
export NUM_AGENTS=5

# Restart orchestrator
docker compose up -d orchestrator-spawn-agents

# Verify new agent count in logs
docker compose logs orchestrator-spawn-agents | grep "Orchestrator initialized"

# Expected:
# ✅ Orchestrator initialized with 5 agents
```

**⚠️ Note:** Scaling requires downtime (not recommended for production)

---

## Comparison Testing

### Side-by-Side Comparison

**Start both architectures on different ports:**

```bash
# Worker service on :3002
docker compose up -d citation-worker-orchestrator citation-agent

# Spawn-agents on :3003 (requires manual docker-compose.override.yml)
docker compose up -d orchestrator-spawn-agents
```

### Latency Comparison

```bash
# Test worker service latency
time curl -X POST http://localhost:3002/api/citations/analyze \
  -H "Content-Type: application/json" \
  -d '{"document": {"text": "Test", "claimedSource": "Test"}}'

# Test spawn-agents latency (via parent server)
time curl -X POST http://localhost:3003/api/citations/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "Test", "claimedSource": "Test"}'

# Expected:
# Worker service: ~100ms (queue overhead)
# Spawn-agents: ~85ms (direct IPC)
```

### Scalability Comparison

```bash
# Worker service: Scale to 20 workers (zero downtime)
docker compose up -d --scale citation-agent=20
# → Takes ~5 seconds, no downtime

# Spawn-agents: Scale to 20 agents (requires restart)
docker compose stop orchestrator-spawn-agents
export NUM_AGENTS=20
docker compose up -d orchestrator-spawn-agents
# → Takes ~30 seconds, full downtime
```

### Failure Resilience Comparison

```bash
# Worker service: Kill worker (orchestrator unaffected)
docker compose kill citation-agent-1
curl http://localhost:3002/health
# → Still healthy, other workers continue

# Spawn-agents: Kill agent process (orchestrator attempts restart)
docker compose exec orchestrator-spawn-agents pkill -f citation_integrity_agent
docker compose logs orchestrator-spawn-agents | tail -20
# → Agent restart attempts, potential orchestrator instability
```

---

## Troubleshooting

### Worker Service Issues

**Problem:** Tasks stuck in queue
```bash
# Check queue depth
docker compose exec redis redis-cli LLEN citations:tasks

# Check worker logs for errors
docker compose logs citation-agent | grep "❌"

# Solution: Scale workers or restart unhealthy workers
docker compose restart citation-agent
```

**Problem:** Workers not connecting to Redis
```bash
# Verify Redis reachability
docker compose exec citation-agent ping redis

# Check Redis credentials
docker compose exec redis redis-cli PING

# Solution: Check REDIS_HOST/PORT/PASSWORD env vars
```

**Problem:** Results not appearing
```bash
# Check if workers completed task
docker compose logs citation-agent | grep "completed"

# Check Redis TTL
docker compose exec redis redis-cli TTL "citations:results:TASK_ID"

# Solution: Increase RESULT_TTL or check worker write permissions
```

### Spawn-Agents Issues

**Problem:** Agent crashes repeatedly
```bash
# Check agent stderr
docker compose logs orchestrator-spawn-agents | grep "stderr"

# Check Python errors
docker compose logs orchestrator-spawn-agents | grep "Traceback"

# Solution: Fix Python agent code or increase MAX_RESTARTS
```

**Problem:** IPC timeout
```bash
# Check for timeout errors
docker compose logs orchestrator-spawn-agents | grep "timeout"

# Solution: Increase AGENT_TIMEOUT or reduce agent workload
```

**Problem:** Orchestrator OOM (Out of Memory)
```bash
# Check memory usage
docker stats marcus-orchestrator-spawn-agents

# Solution: Reduce NUM_AGENTS or increase container memory limit
```

---

## Performance Benchmarks

### Expected Performance (3 Workers/Agents)

| Metric                  | Worker Service | Spawn-Agents |
|-------------------------|----------------|--------------|
| **Mean Latency**        | ~100ms         | ~85ms        |
| **p95 Latency**         | ~200ms         | ~150ms       |
| **p99 Latency**         | ~1000ms        | ~500ms       |
| **Throughput**          | ~30 req/s      | ~35 req/s    |
| **Scalability**         | Horizontal     | Vertical     |
| **Downtime on Scale**   | Zero           | Full restart |

### Benchmark Scripts

**Load Test Worker Service:**
```bash
#!/bin/bash
# load-test-worker.sh

echo "Submitting 100 tasks..."
for i in {1..100}; do
  curl -X POST http://localhost:3002/api/citations/analyze \
    -H "Content-Type: application/json" \
    -d "{\"document\": {\"text\": \"Test $i\", \"claimedSource\": \"Test\"}}" \
    -s -o /dev/null &
done
wait

# Check completion
sleep 5
curl http://localhost:3002/api/queue/stats | jq '.recent_tasks'
```

**Load Test Spawn-Agents:**
```bash
#!/bin/bash
# load-test-spawn.sh

# Requires parent server running
for i in {1..100}; do
  curl -X POST http://localhost:3003/api/citations/analyze \
    -H "Content-Type: application/json" \
    -d "{\"text\": \"Test $i\", \"claimedSource\": \"Test\"}" \
    -s -o /dev/null &
done
wait

echo "Load test complete"
```

---

## Production Testing Checklist

### Worker Service Architecture

- [ ] Health checks return 200 OK
- [ ] Task submission returns 202 Accepted with task_id
- [ ] Tasks complete within 5 seconds (p95)
- [ ] Queue depth stays below 100 under load
- [ ] Workers restart automatically on crash
- [ ] Orchestrator survives worker failures
- [ ] Scaling to 10 workers succeeds without downtime
- [ ] PostgreSQL connection pool stable under load
- [ ] Redis commands complete within 10ms
- [ ] Prometheus metrics exposed at /api/metrics
- [ ] Logs structured and filterable by agent_id
- [ ] Graceful shutdown completes within 30s

### Spawn-Agents Architecture

- [ ] Orchestrator initializes all agents successfully
- [ ] Agents respond to health checks
- [ ] IPC communication stable (no timeouts under load)
- [ ] Agents restart on crash (up to MAX_RESTARTS)
- [ ] Memory usage stays below container limit
- [ ] Analysis completes within 5 seconds (p95)
- [ ] Orchestrator survives agent crashes
- [ ] Graceful shutdown closes all agent processes

---

## Migration Testing (Spawn-Agents → Worker Service)

### Phase 1: Baseline Metrics (Spawn-Agents)

```bash
# Record spawn-agents baseline
docker compose up -d orchestrator-spawn-agents

# Run load test
./load-test-spawn.sh

# Record metrics:
# - Mean latency: ___ms
# - p95 latency: ___ms
# - Throughput: ___req/s
# - Error rate: ___%
```

### Phase 2: Worker Service Parallel Testing

```bash
# Start worker service on different port
docker compose up -d citation-worker-orchestrator citation-agent

# Run same load test
./load-test-worker.sh

# Compare metrics:
# - Mean latency: ___ms (expected: +15ms)
# - p95 latency: ___ms (expected: +50ms)
# - Throughput: ___req/s (expected: similar)
# - Error rate: ___% (expected: lower)
```

### Phase 3: Gradual Cutover

```bash
# Route 10% traffic to worker service (load balancer config)
# Monitor for 1 hour

# If stable, increase to 50%
# Monitor for 1 hour

# If stable, increase to 100%
# Monitor for 24 hours

# Decommission spawn-agents orchestrator
docker compose stop orchestrator-spawn-agents
```

---

## Summary

**For Development:** Use Worker Service for consistency with production
**For Production:** Use Worker Service exclusively (horizontally scalable, resilient)

Both architectures are tested and preserved, but **Worker Service is strongly recommended** for all deployments.

**Next Steps:**
1. Run worker service tests locally
2. Verify all health checks pass
3. Benchmark performance under load
4. Deploy to staging environment
5. Monitor for 24 hours before production

---

**Author:** Marcus (Platform Engineer)
**Date:** 2025-11-22
**Version:** MARCUS 3.0
