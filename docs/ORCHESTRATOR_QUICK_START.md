# MARCUS 3.0 Orchestrator Quick Start

5-minute guide to get either orchestrator architecture running.

---

## Worker Service Architecture (Recommended)

**Start Everything:**
```bash
docker compose up -d citation-worker-orchestrator citation-agent postgres redis
```

**Submit Task:**
```bash
TASK_ID=$(curl -X POST http://localhost:3002/api/citations/analyze \
  -H "Content-Type: application/json" \
  -d '{"document": {"text": "Test citation", "claimedSource": "Test 2024"}}' \
  | jq -r '.task_id')

echo "Task ID: $TASK_ID"
```

**Get Result:**
```bash
curl http://localhost:3002/api/citations/$TASK_ID | jq
```

**Scale Workers:**
```bash
docker compose up -d --scale citation-agent=10
```

**Stop:**
```bash
docker compose down
```

---

## Spawn-Agents Architecture (Legacy)

**Enable in docker-compose.yml:**
Uncomment lines 101-127 (orchestrator-spawn-agents service)

**Start:**
```bash
docker compose up -d orchestrator-spawn-agents postgres redis
```

**Test (via parent server):**
```bash
# Requires src/platform/api/server.ts running
npm run start:platform

curl -X POST http://localhost:3000/api/citations/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "Test", "claimedSource": "Test 2024"}' | jq
```

**Stop:**
```bash
docker compose down
```

---

## Key Differences

| Feature           | Worker Service       | Spawn-Agents          |
|-------------------|----------------------|-----------------------|
| **Port**          | :3002                | :3003                 |
| **API Pattern**   | Task-based (async)   | Direct (sync)         |
| **Scaling**       | `--scale` (instant)  | Restart (downtime)    |
| **Recommended**   | ✅ Production        | Development only      |

---

**Full Documentation:**
- Architecture comparison: `docs/ORCHESTRATOR_ARCHITECTURES.md`
- Testing guide: `docs/ORCHESTRATOR_TESTING_GUIDE.md`
