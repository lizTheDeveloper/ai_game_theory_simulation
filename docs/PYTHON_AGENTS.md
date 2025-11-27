# MARCUS 3.0 Python Agent System Architecture

## Overview

The MARCUS 3.0 Platform integrates Python AI agents with a TypeScript backend to provide citation integrity analysis through multi-agent consensus. This document describes the complete architecture, data flow, and integration patterns.

---

## System Architecture

```
┌────────────────────────────────────────────────────────────┐
│                 TypeScript Platform Layer                   │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐  │
│  │ API Server   │   │ Orchestrator │   │ State Manager│  │
│  │ (Express)    │   │              │   │ (PG + Redis) │  │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘  │
└─────────┼──────────────────┼──────────────────┼──────────┘
          │                  │                  │
          │           ┌──────▼──────┐           │
          │           │ Process     │           │
          │           │ Manager     │           │
          │           └──────┬──────┘           │
          │                  │                  │
    ┌─────▼─────┐      ┌────▼────┐       ┌────▼─────┐
    │ Agent 1   │ ...  │ Agent N │       │ Database │
    │ (Python)  │      │ (Python)│       │          │
    └───────────┘      └─────────┘       └──────────┘
         │                  │                   │
         └──────────────────┴───────────────────┘
                           │
                    ┌──────▼──────┐
                    │ PostgreSQL  │
                    │   + Redis   │
                    └─────────────┘
```

---

## Components

### 1. Python Agent (`citation_integrity_agent.py`)

**Purpose:** Analyzes citation integrity using nested learning with 4-level memory hierarchy.

**Key Features:**
- **9 Citation Behaviors:** From always_accept to combined_heuristic
- **4-Level Memory:**
  - Immediate (I): Last 10 citations - working memory
  - Short-term (S): Last 100 citations - recent patterns
  - Long-term (L): Aggregated statistics - learned behaviors
  - Persistent (P): Cross-session knowledge - core competencies
- **Reputation-Based Learning:** Behaviors with high success rates are favored
- **Local Surprise Signal:** Rapid adaptation when predictions fail
- **IPC Protocol:** JSON messages via stdin/stdout

**Dependencies:**
```bash
pip install psycopg2-binary redis numpy colorlog
```

### 2. PythonAgentWrapper (TypeScript)

**Purpose:** Manages Python agent processes and handles IPC communication.

**Responsibilities:**
- Spawn Python agent processes
- JSON message protocol (stdin/stdout)
- Health monitoring (10-second intervals)
- Automatic restart on crash (up to `maxRestarts`)
- Request retry with exponential backoff
- Graceful shutdown (SIGTERM → SIGKILL after 5s)

**IPC Message Format:**

Request:
```json
{
  "type": "request",
  "requestId": "agent_001_1732000000_0.123",
  "method": "analyze_citation",
  "params": {
    "document": {
      "text": "According to Smith et al. (2024)...",
      "claimedSource": "Smith et al. 2024",
      "actualSource": "Smith, J., et al. (2024)...",
      "metadata": {}
    }
  }
}
```

Response:
```json
{
  "type": "response",
  "requestId": "agent_001_1732000000_0.123",
  "data": {
    "integrityScore": 0.85,
    "behaviorUsed": "combined_heuristic",
    "confidence": 0.92,
    "detectedViolations": [],
    "metadata": {},
    "agentId": "agent_001",
    "agentReputation": 0.78
  }
}
```

### 3. AgentStateManager (TypeScript)

**Purpose:** Persist agent learning state across restarts using PostgreSQL + Redis.

**Caching Strategy:**
- **Write-through:** Updates go to both Redis and PostgreSQL
- **Cache-aside:** Reads check Redis first, fall back to PostgreSQL
- **TTL:** 1 hour for Redis cache
- **Optimistic Locking:** Version field prevents concurrent update conflicts

**Schema:**
```sql
CREATE TABLE agent_states (
    agent_id VARCHAR(50) PRIMARY KEY,
    reputation FLOAT NOT NULL DEFAULT 0.5,
    total_citations INTEGER NOT NULL DEFAULT 0,
    detected_violations INTEGER NOT NULL DEFAULT 0,
    current_behavior VARCHAR(50),
    memory_state JSONB NOT NULL DEFAULT '{}'::jsonb,
    exploration_rate FLOAT NOT NULL DEFAULT 0.2,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0
);
```

### 4. CitationAgentOrchestrator (TypeScript)

**Purpose:** Coordinate multiple agents for consensus-based analysis.

**Multi-Agent Workflow:**

1. **Distribution:** Send document to all healthy agents in parallel
2. **Collection:** Wait for responses with timeout
3. **Filtering:** Remove failed agent responses
4. **Consensus Calculation:** Measure agreement using variance
   - High consensus = low standard deviation of integrity scores
   - Formula: `consensus = max(0, 1 - (stdDev / 0.5))`
5. **Aggregation:** Weighted average by agent reputation
6. **Recommendations:** Generate based on consensus and integrity
7. **Persistence:** Save to database for analytics

**Graceful Degradation:**
- Platform continues if ≥50% agents respond
- Throws error if 0 agents respond
- Logs warning if <50% agents respond

### 5. MetricsCollector (TypeScript)

**Purpose:** Prometheus metrics for observability.

**Metrics:**
- `citation_accuracy_total` (Gauge) - Current accuracy
- `citation_latency_ms` (Histogram) - Analysis latency distribution
- `citation_throughput` (Gauge) - Citations processed per second
- `citation_consensus` (Gauge) - Agent consensus level (0-1)
- `citation_agent_failures_total` (Counter) - Agent failures by ID

**Export:** Prometheus text format at `/metrics` endpoint

---

## Data Flow

### Citation Analysis Request

```
1. HTTP POST /api/citations/analyze
   ↓
2. API Server validates request (JWT, schema)
   ↓
3. Orchestrator.analyzeDocument()
   ↓
4. Parallel IPC calls to Python agents
   ↓
5. Each agent:
   - Selects behavior (reputation + exploration)
   - Analyzes citation
   - Returns integrityScore + metadata
   ↓
6. Orchestrator:
   - Filters failures
   - Calculates consensus
   - Aggregates results
   - Persists to database
   ↓
7. HTTP 200 with aggregated analysis
```

### State Persistence Flow

```
1. Agent processes citation
   ↓
2. Updates internal memory (4 levels)
   ↓
3. Orchestrator calls stateManager.saveState()
   ↓
4. AgentStateManager:
   - Writes to Redis (cache)
   - Writes to PostgreSQL (persistence)
   - Increments version (optimistic locking)
   ↓
5. State persisted for next session
```

---

## Configuration

### Environment Variables

```bash
# Agent Configuration
NUM_AGENTS=3                     # Number of agents to spawn
AGENT_SCRIPT_PATH=./agents/...   # Path to Python agent script

# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=marcus_platform
DB_USER=postgres
DB_PASSWORD=your_password

# Redis (Caching + Coordination)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=your_redis_password

# Performance Tuning
AGENT_TIMEOUT=30000              # Agent request timeout (ms)
MAX_RESTARTS=3                   # Max agent restarts before fail
REQUEST_TIMEOUT=5000             # API request timeout (ms)
CACHE_TTL=3600                   # Redis cache TTL (seconds)

# Monitoring
METRICS_PORT=9090                # Prometheus metrics port
LOG_LEVEL=info                   # debug|info|warn|error
HEALTH_CHECK_INTERVAL=10000      # Agent health check interval (ms)
```

### Platform Configuration (TypeScript)

```typescript
const config: PlatformConfig = {
  numAgents: 5,
  agentScriptPath: './agents/citation_integrity_agent.py',
  agentTimeout: 30000,
  maxRestarts: 3,

  database: {
    host: 'localhost',
    port: 5432,
    database: 'marcus_platform',
    user: 'postgres',
    password: 'password',
    poolSize: 20
  },

  redis: {
    host: 'localhost',
    port: 6379,
    db: 0,
    ttl: 3600,
    password: 'redis_password'
  },

  performance: {
    maxConcurrentRequests: 100,
    requestTimeout: 5000,
    cacheTTL: 3600
  },

  monitoring: {
    metricsPort: 9090,
    logLevel: 'info',
    healthCheckInterval: 10000
  }
};
```

---

## Error Handling

### Agent Process Failures

**Scenario:** Agent process crashes or becomes unresponsive.

**Recovery:**
1. PythonAgentWrapper detects process exit
2. Rejects pending requests with error
3. Attempts automatic restart (up to `maxRestarts`)
4. Exponential backoff between restarts
5. If all restarts fail, agent marked as failed
6. Orchestrator continues with remaining agents

### IPC Communication Failures

**Scenario:** Message send/receive fails.

**Recovery:**
1. Timeout triggers after `agentTimeout` ms
2. Automatic retry with exponential backoff
3. Up to `maxRetries` attempts (default: 3)
4. Backoff delays: 100ms, 200ms, 400ms, 800ms
5. After exhausting retries, request fails
6. Error bubbled up to API caller

### Version Conflicts (Optimistic Locking)

**Scenario:** Concurrent updates to agent state.

**Handling:**
```typescript
try {
  await stateManager.saveState(agentState);
} catch (err) {
  if (err.message.includes('Version conflict')) {
    // Reload latest state
    const latest = await stateManager.loadState(agentId);
    // Merge changes
    const merged = mergeAgentState(agentState, latest);
    // Retry save
    await stateManager.saveState(merged);
  }
}
```

### Graceful Degradation

**Philosophy:** Platform continues operating with degraded performance rather than complete failure.

**Degradation Levels:**
- **100% agents healthy:** Full performance, high consensus
- **50-99% agents:** Warning logged, reduced consensus
- **1-49% agents:** Warning + metrics alert, low consensus
- **0% agents:** Error thrown, analysis unavailable

---

## Performance Characteristics

### Latency

**Single Agent Analysis:**
- Cold start: ~500-1000ms (process spawn)
- Warm: ~50-200ms (IPC + analysis)
- p95: ~250ms
- p99: ~500ms

**Multi-Agent Consensus (N=5):**
- p50: ~300ms
- p95: ~600ms
- p99: ~1000ms

**Bottlenecks:**
- Agent spawn time (only on restart)
- Python process startup
- Database round-trips

### Throughput

- **Single agent:** ~10-20 citations/sec
- **Multi-agent (N=5):** ~50-100 citations/sec (parallel)
- **Concurrency limit:** Configurable via `maxConcurrentRequests`

### Memory Usage

- **Per agent:** ~50-100MB (Python process + memory)
- **Orchestrator:** ~200-500MB (Node.js)
- **Database connections:** Pooled (default: 20)
- **Redis:** ~10-50MB (cache)

### Scalability

**Horizontal:**
- Spawn more agents → linear throughput increase
- Each agent is independent process
- Communication overhead: O(N) per request

**Vertical:**
- More CPU → faster analysis
- More memory → larger agent pools
- Faster disk → quicker database persistence

---

## Monitoring & Observability

### Prometheus Metrics

Access at `http://localhost:9090/metrics`

```prometheus
# Latency distribution
citation_latency_ms_bucket{le="100"} 245
citation_latency_ms_bucket{le="250"} 489
citation_latency_ms_bucket{le="500"} 498

# Consensus gauge
citation_consensus 0.87

# Agent failures
citation_agent_failures_total{agent_id="agent_001"} 2
citation_agent_failures_total{agent_id="agent_002"} 0
```

### Health Checks

**Platform Health:**
```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-20T10:00:00.000Z",
  "agents": {
    "total": 5,
    "healthy": 5
  },
  "database": "connected",
  "redis": "connected"
}
```

**Agent Health:**
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/admin/agents \
  -d '{"action": "health"}'
```

Response:
```json
{
  "total": 5,
  "healthy": 5,
  "unhealthy": 0,
  "agents": [
    {
      "agentId": "agent_001",
      "reputation": 0.78,
      "isHealthy": true,
      "totalCitations": 1523,
      "violationRate": 0.12
    },
    ...
  ]
}
```

### Logs

**Structured Logging:**
```typescript
console.log(`✅ Agent ${agentId} started (PID: ${pid})`);
console.error(`❌ Agent ${agentId} failed:`, err);
console.warn(`⚠️ Less than 50% of agents responded`);
```

**Log Levels:**
- `debug`: IPC messages, state changes
- `info`: Agent lifecycle, analysis results
- `warn`: Degraded performance, retries
- `error`: Failures, exceptions

---

## Deployment

### Local Development

```bash
# 1. Install dependencies
npm install
pip install -r src/platform/agents/requirements.txt

# 2. Setup database
./setup_test_db.sh

# 3. Apply migrations
psql -U marcus -d marcus_test -f src/platform/database/migrations/006_agent_system_schema.sql

# 4. Start platform with agents
npx tsx src/platform/startup.ts --enable-agents --num-agents=3
```

### Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# Scale agents
docker-compose up -d --scale citation-agent=10

# View logs
docker-compose logs -f orchestrator
docker-compose logs -f citation-agent

# Stop platform
docker-compose down
```

### Production Considerations

**Security:**
- Use JWT secrets from secure vault (not `.env`)
- Enable TLS/HTTPS
- Rate limiting on API endpoints
- Database connection encryption
- Redis password authentication

**Reliability:**
- Multiple agent instances for redundancy
- Database replication (PostgreSQL streaming)
- Redis persistence (AOF mode)
- Process manager (PM2 or systemd)
- Auto-restart on failure

**Performance:**
- Connection pooling (PostgreSQL)
- Redis caching strategy
- Agent pool sizing (tune `numAgents`)
- Load balancing (if multiple orchestrators)

**Monitoring:**
- Prometheus + Grafana dashboards
- Alert on agent failures
- Alert on low consensus
- Alert on high latency (p95 > threshold)
- Database query performance monitoring

---

## Troubleshooting

### Agent Won't Start

**Symptoms:** "Agent script not found" or "Failed to spawn"

**Solutions:**
1. Verify script path: `ls -la src/platform/agents/citation_integrity_agent.py`
2. Check Python version: `python3 --version` (need ≥3.8)
3. Install dependencies: `pip install -r src/platform/agents/requirements.txt`
4. Check file permissions: `chmod +x citation_integrity_agent.py`

### Agent Crashes Immediately

**Symptoms:** "Agent exited with code 1"

**Solutions:**
1. Check agent logs for import errors
2. Verify database connection (PostgreSQL running?)
3. Verify Redis connection (Redis running?)
4. Run agent manually: `python3 citation_integrity_agent.py test_agent`
5. Check for missing dependencies

### Low Consensus

**Symptoms:** Consensus < 0.5 frequently

**Causes:**
- Agents have diverged learning paths
- Ambiguous citations (genuinely hard to classify)
- Different agent reputations

**Solutions:**
1. Review agent behaviors (GET /api/admin/agents)
2. Check for outlier agents (very low/high reputation)
3. Reset agent state if corruption suspected
4. Increase exploration rate temporarily

### High Latency

**Symptoms:** p95 > 1000ms

**Solutions:**
1. Check database query performance
2. Increase connection pool size
3. Reduce number of agents (less coordination overhead)
4. Enable Redis caching
5. Profile slow queries
6. Consider horizontal scaling

---

## References

- **TypeScript Integration:** `src/platform/integration/citationAgentIntegration.ts`
- **Python Agent:** `src/platform/agents/citation_integrity_agent.py`
- **API Server:** `src/platform/api/server.ts`
- **Startup Script:** `src/platform/startup.ts`
- **Integration Tests:** `src/platform/__tests__/agentIntegration.test.ts`
- **Database Schema:** `src/platform/database/migrations/006_agent_system_schema.sql`

---

**Author:** Marcus (Platform Engineer)
**Date:** 2025-11-20
**Version:** MARCUS 3.0
