# MARCUS 3.0 - Phase 1: Python Agent System Deployment

**Branch:** `claude/build-marcus-agent-016LTPXuAb6A3hYDwTvMjyof`
**Date:** 2025-11-20
**Status:** Ready for deployment on production VM

---

## Overview

Phase 1 deploys the Python Agent System for citation integrity analysis. This phase integrates Python AI agents with the existing TypeScript platform.

**What's Included:**
- ✅ Python agent framework (1,042 lines - already implemented)
- ✅ TypeScript integration layer (1,250 lines - already implemented)
- ✅ API endpoints (623 lines - already implemented)
- ✅ Database migration (225 lines - ready to apply)
- ✅ Integration tests (575 lines - ready to run)
- ✅ Documentation (3,400+ lines - complete)

**Time Required:** 30-60 minutes

---

## Prerequisites

On your production VM (`/home/g7throwawayplz/ai_game_theory_simulation`):

- ✅ PostgreSQL running (port 5433)
- ✅ Redis running (port 6379)
- ✅ Node.js installed
- ✅ Python 3.9+ installed
- ✅ Git repository up to date

---

## Phase 1 Steps

### Step 1: Pull Latest Code

```bash
cd /home/g7throwawayplz/ai_game_theory_simulation
git pull origin claude/build-marcus-agent-016LTPXuAb6A3hYDwTvMjyof
```

**What this includes:**
- Python agent system implementation
- TypeScript integration layer
- Database migration
- Integration tests
- Complete documentation

---

### Step 2: Install Python Dependencies

```bash
# Check if pip is available
which pip3 || which pip

# Install Python agent dependencies
pip3 install -r src/platform/agents/requirements.txt

# Expected packages:
# - asyncio
# - psycopg2-binary (PostgreSQL driver)
# - redis (Redis client)
# - numpy (for nested learning calculations)
# - typing-extensions (type hints)
```

**Expected output:**
```
Successfully installed psycopg2-binary-2.9.9 redis-5.0.1 numpy-1.26.2 ...
```

---

### Step 3: Apply Database Migration

**⚠️ IMPORTANT:** This migration adds tables for agent system. Existing data is not affected.

```bash
# Verify PostgreSQL is running
sudo systemctl status postgresql

# Apply migration as postgres user
sudo -u postgres psql -d marcus -f src/platform/database/migrations/006_agent_system_schema.sql
```

**What this migration does:**
1. Creates `agent_states` table for learning state persistence
2. Updates `citation_analyses` table with agent metadata
3. Adds strategic indexes for performance
4. Adds optimistic locking (version field)

**Expected output:**
```
CREATE TABLE
CREATE INDEX
CREATE INDEX
CREATE INDEX
ALTER TABLE
```

**Verify migration:**
```bash
# Check agent_states table exists
sudo -u postgres psql -d marcus -c "\d agent_states"

# Should show table structure with columns:
# - agent_id (text, primary key)
# - memory_state (jsonb)
# - reputation_scores (jsonb)
# - version (integer)
# - created_at, updated_at (timestamps)
```

---

### Step 4: Configure Environment

```bash
# Check .env file exists
ls -la .env

# Verify required variables are set
grep -E "(DATABASE_URL|REDIS_URL|JWT_SECRET)" .env
```

**Required environment variables:**
```bash
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5433
DATABASE_NAME=marcus
DATABASE_USER=marcus
DATABASE_PASSWORD=your_password_here

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password_here

# JWT (already set from previous steps)
JWT_SECRET=your_256bit_secret_here
JWT_REFRESH_SECRET=your_256bit_refresh_secret_here

# Agent System (new)
ENABLE_AGENTS=true
NUM_AGENTS=3
AGENT_TIMEOUT_MS=30000
```

**Add agent configuration if missing:**
```bash
cat >> .env <<EOF

# Python Agent System
ENABLE_AGENTS=true
NUM_AGENTS=3
AGENT_TIMEOUT_MS=30000
EOF
```

---

### Step 5: Run Integration Tests

**Test authentication system (baseline):**
```bash
./scripts/run_integration_tests.sh
```

**Expected output:** `18/18 tests passing` ✅

**Test Python agent system (new):**
```bash
# Run agent integration tests
npm test -- agentIntegration.test.ts

# This tests:
# - Agent spawning and lifecycle
# - IPC communication (TypeScript ↔ Python)
# - Citation analysis roundtrip
# - State persistence
# - Multi-agent consensus
# - Metrics collection
```

**Expected output:**
```
PASS src/platform/__tests__/agentIntegration.test.ts
  Python Agent Integration Tests
    Agent Lifecycle
      ✓ should spawn Python agent process (500ms)
      ✓ should communicate via IPC protocol (200ms)
      ✓ should shutdown agent gracefully (100ms)
    Citation Analysis
      ✓ should analyze citation and return score (1500ms)
      ✓ should persist analysis to database (300ms)
      ✓ should update agent learning state (200ms)
    Multi-Agent Consensus
      ✓ should coordinate multiple agents (2000ms)
      ✓ should calculate variance-based consensus (100ms)
      ✓ should handle agent failures gracefully (800ms)
    Metrics Collection
      ✓ should collect agent performance metrics (100ms)

Test Suites: 1 passed, 1 total
Tests:       10 passed, 10 total
Time:        6.5s
```

**If tests fail:**
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Check Redis is running: `sudo systemctl status redis-server`
- Check Python is accessible: `which python3`
- Check Python packages installed: `pip3 list | grep -E "(psycopg2|redis|numpy)"`
- Check database migration applied: `sudo -u postgres psql -d marcus -c "\d agent_states"`

---

### Step 6: Test Python Agent Directly

**Test Python agent standalone (without TypeScript):**
```bash
# Navigate to agents directory
cd src/platform/agents

# Test agent directly via Python
echo '{
  "type": "analyze_citation",
  "data": {
    "text": "According to Smith et al. (2024), climate change...",
    "claimed_source": "Smith et al. 2024",
    "context": {}
  }
}' | python3 citation_integrity_agent.py
```

**Expected output:**
```json
{
  "type": "analysis_result",
  "data": {
    "credibility_score": 0.75,
    "confidence": 0.82,
    "behaviors_used": ["proximity_check", "author_verification"],
    "local_surprise": 0.15,
    "agent_id": "agent_standalone"
  }
}
```

**If Python agent fails:**
- Check Python version: `python3 --version` (need 3.9+)
- Check dependencies: `pip3 install -r requirements.txt`
- Check Python path: `which python3`
- Test with verbose output: `python3 citation_integrity_agent.py --verbose`

---

### Step 7: Start MARCUS Platform with Agents

**Start platform with agent system enabled:**
```bash
# Option 1: Using startup script
npx tsx src/platform/startup.ts --enable-agents --num-agents=3

# Option 2: Using environment variable
ENABLE_AGENTS=true NUM_AGENTS=3 npx tsx src/platform/startup.ts
```

**Expected startup logs:**
```
🚀 MARCUS 3.0 - Citation Integrity Platform
============================================

📊 Configuration:
   Database: localhost:5433/marcus
   Redis: localhost:6379
   API Port: 3000
   Agents: ENABLED (3 agents)

🔌 Connecting to services...
   ✅ PostgreSQL connected
   ✅ Redis connected

🤖 Spawning Python agents...
   ✅ Agent agent_1 spawned (PID: 12345)
   ✅ Agent agent_2 spawned (PID: 12346)
   ✅ Agent agent_3 spawned (PID: 12347)

🎯 Agent health check...
   ✅ agent_1: healthy (response_time: 15ms)
   ✅ agent_2: healthy (response_time: 12ms)
   ✅ agent_3: healthy (response_time: 18ms)

🌐 Starting API server...
   ✅ Server listening on http://localhost:3000

✅ MARCUS platform ready!
```

**If startup fails:**
- Check logs: `tail -f logs/marcus_$(date +%Y%m%d).log`
- Check agent processes: `ps aux | grep citation_integrity_agent`
- Check ports are available: `lsof -i :3000 -i :5433 -i :6379`
- Check database migration: `sudo -u postgres psql -d marcus -c "\d agent_states"`

---

### Step 8: Verify API Endpoints

**Test health endpoint:**
```bash
curl http://localhost:3000/health
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-20T12:00:00.000Z",
  "services": {
    "database": "connected",
    "redis": "connected",
    "agents": {
      "enabled": true,
      "count": 3,
      "healthy": 3
    }
  }
}
```

**Test agent status endpoint:**
```bash
# Get JWT token first (login as admin)
TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@marcus-platform.local","password":"YOUR_ADMIN_PASSWORD"}' \
  | jq -r '.accessToken')

# Check agent status
curl http://localhost:3000/api/admin/agents \
  -H "Authorization: Bearer $TOKEN"
```

**Expected response:**
```json
{
  "agents": [
    {
      "id": "agent_1",
      "status": "healthy",
      "pid": 12345,
      "uptime": 120,
      "requests_processed": 0,
      "avg_response_time": 0,
      "error_rate": 0.0
    },
    {
      "id": "agent_2",
      "status": "healthy",
      "pid": 12346,
      "uptime": 120,
      "requests_processed": 0,
      "avg_response_time": 0,
      "error_rate": 0.0
    },
    {
      "id": "agent_3",
      "status": "healthy",
      "pid": 12347,
      "uptime": 120,
      "requests_processed": 0,
      "avg_response_time": 0.0,
      "error_rate": 0.0
    }
  ],
  "consensus": {
    "enabled": true,
    "min_agents": 2,
    "reputation_weighted": true
  }
}
```

---

### Step 9: Test Citation Analysis

**Analyze a citation using the API:**
```bash
# Get JWT token (reuse from Step 8 or login again)
TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@marcus-platform.local","password":"YOUR_ADMIN_PASSWORD"}' \
  | jq -r '.accessToken')

# Submit citation for analysis
curl -X POST http://localhost:3000/api/citations/analyze \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "According to Smith et al. (2024), global temperatures have risen by 1.5°C since pre-industrial times.",
    "claimedSource": "Smith et al. 2024"
  }' | jq .
```

**Expected response:**
```json
{
  "analysis_id": "uuid-here",
  "timestamp": "2025-11-20T12:00:00.000Z",
  "result": {
    "credibility_score": 0.78,
    "confidence": 0.85,
    "consensus": 0.92,
    "agent_results": [
      {
        "agent_id": "agent_1",
        "score": 0.75,
        "confidence": 0.82,
        "behaviors_used": ["proximity_check", "author_verification"]
      },
      {
        "agent_id": "agent_2",
        "score": 0.80,
        "confidence": 0.88,
        "behaviors_used": ["citation_count", "journal_quality"]
      },
      {
        "agent_id": "agent_3",
        "score": 0.79,
        "confidence": 0.85,
        "behaviors_used": ["proximity_check", "temporal_check"]
      }
    ],
    "variance": 0.04,
    "metadata": {
      "total_agents": 3,
      "successful_responses": 3,
      "avg_response_time": 1250
    }
  }
}
```

**Verify in database:**
```bash
sudo -u postgres psql -d marcus -c "SELECT * FROM citation_analyses ORDER BY created_at DESC LIMIT 1;"
```

---

## Phase 1 Verification Checklist

After completing all steps, verify:

- [ ] Database migration applied: `\d agent_states` shows table
- [ ] Python dependencies installed: `pip3 list | grep psycopg2`
- [ ] Integration tests passing: `npm test -- agentIntegration.test.ts` (10/10)
- [ ] Platform starts with agents: Logs show "Agent agent_X spawned"
- [ ] Health check passes: `/health` endpoint shows `agents.healthy: 3`
- [ ] Agent status accessible: `/api/admin/agents` returns agent list
- [ ] Citation analysis works: `/api/citations/analyze` returns result
- [ ] Results persisted: `citation_analyses` table has records

---

## Troubleshooting

### Issue: Migration fails with "relation already exists"

**Cause:** Migration already applied or partial application

**Fix:**
```bash
# Check what tables exist
sudo -u postgres psql -d marcus -c "\dt"

# If agent_states exists but incomplete:
sudo -u postgres psql -d marcus -c "DROP TABLE IF EXISTS agent_states CASCADE;"

# Re-run migration
sudo -u postgres psql -d marcus -f src/platform/database/migrations/006_agent_system_schema.sql
```

---

### Issue: Python agent fails with "ModuleNotFoundError"

**Cause:** Python dependencies not installed

**Fix:**
```bash
# Check Python version
python3 --version  # Need 3.9+

# Install dependencies
pip3 install -r src/platform/agents/requirements.txt

# Verify installation
pip3 list | grep -E "(psycopg2|redis|numpy)"
```

---

### Issue: Integration tests fail with "ECONNREFUSED"

**Cause:** PostgreSQL or Redis not running

**Fix:**
```bash
# Check services
sudo systemctl status postgresql
sudo systemctl status redis-server

# Start if stopped
sudo systemctl start postgresql
sudo systemctl start redis-server

# Verify connectivity
psql -U marcus -d marcus -c "SELECT 1;"
redis-cli ping
```

---

### Issue: Agents spawn but immediately die

**Cause:** Missing environment variables or database connection failure

**Fix:**
```bash
# Check agent logs
tail -f logs/agent_*.log

# Verify environment
grep -E "(DATABASE|REDIS)" .env

# Test Python agent standalone
cd src/platform/agents
python3 citation_integrity_agent.py --test
```

---

### Issue: Citation analysis times out

**Cause:** Agent processes hung or overloaded

**Fix:**
```bash
# Check agent processes
ps aux | grep citation_integrity_agent

# Check agent health
curl http://localhost:3000/api/admin/agents \
  -H "Authorization: Bearer $TOKEN"

# Restart platform
pkill -f "citation_integrity_agent"
npx tsx src/platform/startup.ts --enable-agents --num-agents=3
```

---

## Next Steps (After Phase 1)

Once Phase 1 is verified and working:

1. **Phase 2: Monitoring Infrastructure (2-3 hours)**
   - Set up Prometheus metrics collection
   - Configure Grafana dashboards
   - Set up alerting

2. **Phase 3: Load Testing (2-3 hours)**
   - Install k6
   - Create load test scenarios
   - Baseline performance metrics

3. **Security Configuration (5 minutes)**
   - Run `./scripts/generate_jwt_secrets.sh`
   - Run `sudo ./scripts/change_admin_password.sh`
   - Run `./scripts/final_deployment_checklist.sh`

---

## Architecture Reference

```
┌──────────────────── TypeScript Platform ──────────────────┐
│                                                            │
│  API Server          Orchestrator       State Manager     │
│  (Express)      →    (Multi-Agent)  ←→  (PG + Redis)     │
│  Port 3000               ↓                                │
└───────────────────────────┼────────────────────────────────┘
                            ↓
                   Process Manager
                            ↓
        ┌───────────────────┼───────────────────┐
        ↓                   ↓                   ↓
  agent_1.py          agent_2.py          agent_3.py
  [PID: 12345]        [PID: 12346]        [PID: 12347]
  [Nested Learning]   [Nested Learning]   [Nested Learning]
        ↓                   ↓                   ↓
        └───────────────────┼───────────────────┘
                            ↓
              PostgreSQL (5433) + Redis (6379)
```

---

## Files Reference

**Migration:**
- `src/platform/database/migrations/006_agent_system_schema.sql` (225 lines)

**Tests:**
- `src/platform/__tests__/agentIntegration.test.ts` (575 lines)

**Documentation:**
- `docs/PYTHON_AGENTS.md` (1,100 lines) - Architecture deep dive
- `docs/AGENT_API.md` (900 lines) - API reference
- `README_AGENTS.md` (400 lines) - Quick start guide

**Implementation:**
- `src/platform/agents/citation_integrity_agent.py` (1,042 lines)
- `src/platform/integration/citationAgentIntegration.ts` (1,250 lines)
- `src/platform/api/server.ts` (623 lines)
- `src/platform/startup.ts` (238 lines)

---

**Last Updated:** 2025-11-20
**Status:** ✅ Ready for deployment
**Estimated Time:** 30-60 minutes
**Next:** Phase 2 (Monitoring) or Security Configuration
