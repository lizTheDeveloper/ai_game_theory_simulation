# MARCUS 3.0 Python Agent System - Quick Start

Get the citation integrity platform running with Python AI agents in under 10 minutes.

---

## Prerequisites

- **Node.js** 18+ and **npm**
- **Python** 3.8+
- **PostgreSQL** 14+
- **Redis** 7+

---

## Installation

### 1. Install Node.js Dependencies

```bash
npm install
```

### 2. Install Python Dependencies

```bash
pip install -r src/platform/agents/requirements.txt
```

**Dependencies:**
- `psycopg2-binary` - PostgreSQL adapter
- `redis` - Redis client
- `numpy` - Numerical computing
- `colorlog` - Enhanced logging

### 3. Setup Database

Create PostgreSQL database and apply schema:

```bash
# Create database and user
./setup_test_db.sh

# Or manually:
sudo -u postgres psql << SQL
CREATE USER marcus WITH PASSWORD 'marcus_dev_password';
CREATE DATABASE marcus_test OWNER marcus;
GRANT ALL PRIVILEGES ON DATABASE marcus_test TO marcus;
SQL

# Apply migrations
psql -U marcus -d marcus_test -f src/platform/database/auth-schema.sql
psql -U marcus -d marcus_test -f src/platform/database/migrations/005_complete_schema.sql
psql -U marcus -d marcus_test -f src/platform/database/migrations/006_agent_system_schema.sql
```

### 4. Start Redis

```bash
# Ubuntu/Debian
sudo systemctl start redis

# macOS (Homebrew)
brew services start redis

# Or run in foreground
redis-server
```

### 5. Configure Environment

Create `.env` file in project root:

```bash
# Copy template
cp src/platform/.env.example .env

# Edit configuration
nano .env
```

**Minimum configuration:**
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=marcus_test
DB_USER=marcus
DB_PASSWORD=marcus_dev_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# JWT Secrets (generate random strings)
JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)

# Server
PORT=3000
CORS_ORIGINS=http://localhost:3333,http://localhost:3000

# Agents
NUM_AGENTS=3
```

---

## Starting the Platform

### Option 1: With Agents (Recommended)

Start the complete platform with citation agents:

```bash
npx tsx src/platform/startup.ts --enable-agents --num-agents=3
```

**Expected Output:**
```
🚀 MARCUS 3.0 Citation Integrity Platform
==========================================

📝 Loading configuration...
💾 Initializing database connection pool...
✅ Database pool initialized
🤖 Initializing Citation Agent Orchestrator...
   ✅ Agent script found
   ✅ Orchestrator initialized
🌐 Starting HTTP server...

✅ MARCUS 3.0 Platform OPERATIONAL
📍 Server: http://0.0.0.0:3000
📊 Metrics: http://0.0.0.0:9090/metrics
📝 Health: http://0.0.0.0:3000/health

Press Ctrl+C to shutdown gracefully.
```

### Option 2: API Server Only

Start without agents (for testing API independently):

```bash
npx tsx src/platform/startup.ts
```

---

## Verifying Installation

### 1. Health Check

```bash
curl http://localhost:3000/health
```

**Expected:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-20T10:00:00.000Z",
  "database": "connected",
  "redis": "connected"
}
```

### 2. Login and Get Token

```bash
# Login as default admin
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@marcus.local",
    "password": "SecurePassword123!"
  }'
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "admin@marcus.local",
    "role": "admin"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900
}
```

### 3. Analyze Citation

```bash
# Save token
TOKEN="<accessToken from above>"

# Analyze citation
curl -X POST http://localhost:3000/api/citations/analyze \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "According to Smith et al. (2024), AI alignment is critical.",
    "claimedSource": "Smith et al. 2024",
    "actualSource": "Smith, J., et al. (2024). AI Alignment Research. Nature."
  }'
```

**Expected:**
```json
{
  "integrity": {
    "score": 0.87,
    "consensus": 0.92,
    "confidence": 0.92
  },
  "analysis": {
    "numAgents": 3,
    "behaviorDistribution": {
      "combined_heuristic": 2,
      "strict_match": 1
    },
    "recommendations": [
      "✅ Citation appears valid - high integrity and consensus"
    ],
    "latencyMs": 342
  },
  "results": [...],
  "timestamp": "2025-11-20T10:00:00.000Z"
}
```

### 4. Check Agent Status

```bash
curl -X POST http://localhost:3000/api/admin/agents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "health"}'
```

**Expected:**
```json
{
  "total": 3,
  "healthy": 3,
  "unhealthy": 0,
  "agents": [
    {
      "agentId": "agent_000",
      "reputation": 0.5,
      "totalCitations": 1,
      "isHealthy": true,
      ...
    },
    ...
  ]
}
```

### 5. View Prometheus Metrics

```bash
curl http://localhost:9090/metrics
```

**Expected:**
```
# HELP citation_latency_ms Citation analysis latency in milliseconds
# TYPE citation_latency_ms histogram
citation_latency_ms_bucket{le="100"} 0
citation_latency_ms_bucket{le="250"} 0
citation_latency_ms_bucket{le="500"} 1
...
```

---

## Running Tests

### Unit Tests

```bash
npm test
```

### Integration Tests (Requires Database)

```bash
# Setup test database
./setup_test_db.sh

# Run integration tests
npm test -- agentIntegration.test.ts
```

**Expected:**
```
PASS src/platform/__tests__/agentIntegration.test.ts
  Python Agent Integration
    PythonAgentWrapper
      ✓ should spawn Python agent process (2342 ms)
      ✓ should communicate via JSON IPC protocol (3124 ms)
      ✓ should analyze citation document (3456 ms)
    AgentStateManager
      ✓ should save agent state to PostgreSQL (234 ms)
      ✓ should load agent state from cache (Redis) (112 ms)
    CitationAgentOrchestrator
      ✓ should initialize multiple agents (5432 ms)
      ✓ should analyze document with multi-agent consensus (4321 ms)
      ✓ should persist analysis results to database (3987 ms)
    MetricsCollector
      ✓ should record latency metrics (45 ms)
      ✓ should generate Prometheus-compatible metrics (32 ms)

Test Suites: 1 passed, 1 total
Tests:       10 passed, 10 total
```

---

## Common Usage Patterns

### Analyze Multiple Citations

```bash
#!/bin/bash
TOKEN="<your_token>"

# Analyze 5 citations
for i in {1..5}; do
  echo "Analyzing citation $i..."
  curl -X POST http://localhost:3000/api/citations/analyze \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"text\": \"Citation $i text...\",
      \"claimedSource\": \"Source $i\"
    }" | jq '.integrity.score'
done
```

### Monitor Agent Health

```bash
#!/bin/bash
TOKEN="<your_token>"

# Check agent health every 10 seconds
while true; do
  clear
  echo "=== Agent Health Status ==="
  curl -s -X POST http://localhost:3000/api/admin/agents \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"action": "health"}' | jq '.agents[] | {agentId, reputation, totalCitations, isHealthy}'
  sleep 10
done
```

### Export Metrics to Grafana

1. Start Prometheus:
```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'marcus-platform'
    scrape_interval: 15s
    static_configs:
      - targets: ['localhost:9090']
```

```bash
prometheus --config.file=prometheus.yml
```

2. Add data source in Grafana:
- URL: `http://localhost:9090`
- Access: Server (default)

3. Create dashboard with queries:
```promql
# Latency p95
histogram_quantile(0.95, rate(citation_latency_ms_bucket[5m]))

# Consensus trend
citation_consensus

# Agent failures rate
rate(citation_agent_failures_total[5m])
```

---

## Troubleshooting

### Agents Not Starting

**Problem:** "Agent script not found"

**Solution:**
```bash
# Verify script exists
ls -la src/platform/agents/citation_integrity_agent.py

# Make executable
chmod +x src/platform/agents/citation_integrity_agent.py

# Test manually
python3 src/platform/agents/citation_integrity_agent.py test_agent
```

### Database Connection Failed

**Problem:** "connection to server... failed"

**Solution:**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -U marcus -d marcus_test -c "SELECT 1;"

# Check credentials in .env match database
```

### Redis Connection Failed

**Problem:** "Redis connection error"

**Solution:**
```bash
# Check Redis is running
redis-cli ping
# Should return: PONG

# Start if not running
sudo systemctl start redis

# Check port in .env matches Redis config
```

### Low Consensus

**Problem:** Consensus < 0.5 frequently

**Investigation:**
```bash
# Check agent reputations
curl -X POST http://localhost:3000/api/admin/agents \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"action": "list"}' | jq '.[] | {agentId, reputation}'

# Reset agent state if needed
psql -U marcus -d marcus_test -c "TRUNCATE agent_states CASCADE;"

# Restart platform
```

### High Latency

**Problem:** p95 latency > 1000ms

**Solutions:**
```bash
# Check database query performance
psql -U marcus -d marcus_test << SQL
SELECT query, calls, mean_exec_time, stddev_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
SQL

# Increase connection pool
# Edit .env: DB_POOL_SIZE=50

# Enable Redis caching
# Edit .env: CACHE_TTL=3600

# Restart platform
```

---

## Production Deployment

See full deployment guide: [PRODUCTION_DEPLOYMENT_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md)

**Quick checklist:**
- [ ] Generate secure JWT secrets (32+ bytes)
- [ ] Enable TLS/HTTPS
- [ ] Configure rate limiting
- [ ] Set up database replication
- [ ] Enable Redis persistence (AOF)
- [ ] Configure monitoring (Prometheus + Grafana)
- [ ] Set up automated backups
- [ ] Use process manager (PM2 or systemd)
- [ ] Configure log rotation
- [ ] Test disaster recovery plan

---

## Next Steps

1. **Explore the API:** Read [AGENT_API.md](./AGENT_API.md) for complete API reference
2. **Understand Architecture:** Read [PYTHON_AGENTS.md](./PYTHON_AGENTS.md) for deep dive
3. **Customize Agents:** Modify `src/platform/agents/citation_integrity_agent.py`
4. **Add Features:** Implement custom behaviors, memory strategies, or learning algorithms
5. **Scale Horizontally:** Deploy multiple orchestrators with load balancer

---

## Getting Help

**Documentation:**
- [PYTHON_AGENTS.md](./PYTHON_AGENTS.md) - Architecture deep dive
- [AGENT_API.md](./AGENT_API.md) - Complete API reference
- [PRODUCTION_DEPLOYMENT_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md) - Deployment guide

**Source Code:**
- Python Agent: `src/platform/agents/citation_integrity_agent.py`
- TypeScript Integration: `src/platform/integration/citationAgentIntegration.ts`
- API Server: `src/platform/api/server.ts`
- Tests: `src/platform/__tests__/agentIntegration.test.ts`

**Common Issues:**
- Check logs in `/logs/` directory
- Review test output for error details
- Verify all prerequisites are installed
- Ensure database migrations are applied

---

**Author:** Marcus (Platform Engineer)
**Date:** 2025-11-20
**Version:** MARCUS 3.0

🚀 **Ready to build production AI platforms!**
