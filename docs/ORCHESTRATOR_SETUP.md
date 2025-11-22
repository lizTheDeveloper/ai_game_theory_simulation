# MARCUS 3.0 Orchestrator Setup

## Installation

### 1. Install Missing Dependencies

```bash
# UUID library for task ID generation (required by worker-orchestrator-server.ts)
npm install uuid @types/uuid
```

### 2. Build Docker Images

```bash
# Build worker orchestrator (recommended)
docker compose build citation-worker-orchestrator

# Build citation workers
docker compose build citation-agent

# (Optional) Build spawn-agents orchestrator
# Uncomment service in docker-compose.yml first
# docker compose build orchestrator-spawn-agents
```

### 3. Start Services

**Worker Service Architecture (Recommended):**
```bash
docker compose up -d citation-worker-orchestrator citation-agent postgres redis
```

**Spawn-Agents Architecture (Legacy):**
```bash
# First, uncomment orchestrator-spawn-agents in docker-compose.yml
docker compose up -d orchestrator-spawn-agents postgres redis
```

### 4. Verify Running

```bash
# Check health
curl http://localhost:3002/health | jq

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-11-22T...",
  "components": {
    "redis": "healthy",
    "database": "healthy"
  },
  "queue": {
    "depth": 0
  }
}
```

### 5. Test Analysis

```bash
# Submit task
TASK_ID=$(curl -X POST http://localhost:3002/api/citations/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "document": {
      "text": "According to Smith et al. (2024), AI alignment is critical.",
      "claimedSource": "Smith et al. 2024"
    }
  }' | jq -r '.task_id')

echo "Task ID: $TASK_ID"

# Wait 2 seconds for processing
sleep 2

# Get result
curl http://localhost:3002/api/citations/$TASK_ID | jq
```

## Troubleshooting

### Error: "Cannot find module 'uuid'"

**Cause:** Missing uuid dependency

**Fix:**
```bash
npm install uuid @types/uuid
docker compose build citation-worker-orchestrator
docker compose restart citation-worker-orchestrator
```

### Error: "connection refused" on :3002

**Cause:** Worker orchestrator not running

**Fix:**
```bash
docker compose ps citation-worker-orchestrator
docker compose logs citation-worker-orchestrator
docker compose up -d citation-worker-orchestrator
```

### Error: "No workers processing tasks"

**Cause:** Citation workers not running

**Fix:**
```bash
docker compose ps citation-agent
docker compose logs citation-agent
docker compose up -d citation-agent
```

### Queue Depth Growing

**Cause:** Not enough workers for load

**Fix:**
```bash
# Scale to 10 workers
docker compose up -d --scale citation-agent=10
```

## Next Steps

1. ✅ Install uuid dependency
2. ✅ Build Docker images
3. ✅ Start services
4. ✅ Verify health
5. ✅ Test analysis
6. 📖 Read full testing guide: `docs/ORCHESTRATOR_TESTING_GUIDE.md`
7. 📖 Read architecture comparison: `docs/ORCHESTRATOR_ARCHITECTURES.md`

## Quick Reference

| Service                      | Port  | Purpose                          |
|------------------------------|-------|----------------------------------|
| citation-worker-orchestrator | 3002  | Task submission/retrieval API    |
| orchestrator-spawn-agents    | 3003  | Legacy architecture (commented)  |
| postgres                     | 5433  | Database (host port)             |
| redis                        | 6380  | Queue/cache (host port)          |
| grafana                      | 3001  | Monitoring dashboards            |
| prometheus                   | 9090  | Metrics collection               |

**Default Architecture:** Worker Service (port 3002)
**Legacy Architecture:** Spawn-Agents (port 3003, commented out)

**See `docs/ORCHESTRATOR_QUICK_START.md` for 5-minute guide.**
