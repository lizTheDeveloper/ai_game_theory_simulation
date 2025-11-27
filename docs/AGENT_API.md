# MARCUS 3.0 Agent System API Reference

Complete API reference for the Python Agent System, including HTTP endpoints, TypeScript interfaces, and Python agent methods.

---

## Table of Contents

1. [HTTP API Endpoints](#http-api-endpoints)
2. [TypeScript Interfaces](#typescript-interfaces)
3. [Python Agent Protocol](#python-agent-protocol)
4. [Database Schema](#database-schema)

---

## HTTP API Endpoints

All endpoints require JWT authentication unless marked as `(public)`.

### POST /api/citations/analyze

Analyze citation integrity using multi-agent consensus.

**Authentication:** Requires `citations:analyze` permission (operator or admin)

**Rate Limit:** 60 requests/hour per user

**Request:**
```http
POST /api/citations/analyze HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "text": "According to Smith et al. (2024), AI alignment is critical.",
  "claimedSource": "Smith et al. 2024",
  "actualSource": "Smith, J., et al. (2024). AI Alignment Research. Nature.",
  "metadata": {
    "documentId": "doc_12345",
    "tags": ["ai", "alignment"]
  }
}
```

**Response (200 OK):**
```json
{
  "integrity": {
    "score": 0.87,
    "consensus": 0.92,
    "confidence": 0.92
  },
  "analysis": {
    "numAgents": 5,
    "behaviorDistribution": {
      "combined_heuristic": 3,
      "strict_match": 2
    },
    "recommendations": [
      "✅ Citation appears valid - high integrity and consensus"
    ],
    "latencyMs": 342
  },
  "results": [
    {
      "integrityScore": 0.85,
      "behaviorUsed": "combined_heuristic",
      "confidence": 0.91,
      "detectedViolations": [],
      "agentId": "agent_001",
      "agentReputation": 0.78,
      "metadata": {}
    },
    ...
  ],
  "timestamp": "2025-11-20T10:00:00.000Z"
}
```

**Error Responses:**
```json
// 400 Bad Request - Validation error
{
  "error": "Validation Error",
  "message": "text is required"
}

// 401 Unauthorized - Missing or invalid token
{
  "error": "Unauthorized",
  "message": "Invalid token"
}

// 403 Forbidden - Insufficient permissions
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}

// 500 Internal Server Error - Agent failure
{
  "error": "Internal Server Error",
  "message": "Citation orchestrator not initialized. Start server with --enable-agents flag."
}
```

---

### POST /api/admin/agents

Manage citation agents (admin only).

**Authentication:** Requires admin role

**Request:**
```http
POST /api/admin/agents HTTP/1.1
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "action": "health"
}
```

**Actions:**

#### 1. List Agents
```json
{
  "action": "list"
}
```

Response:
```json
[
  {
    "agentId": "agent_001",
    "reputation": 0.78,
    "totalCitations": 1523,
    "detectedViolations": 184,
    "violationRate": 0.12,
    "currentBehavior": "combined_heuristic",
    "explorationRate": 0.15,
    "memorySize": {
      "immediate": 10,
      "shortterm": 100,
      "longtermStats": 5,
      "behaviorReputations": 9
    },
    "isHealthy": true,
    "timestamp": "2025-11-20T10:00:00.000Z"
  },
  ...
]
```

#### 2. Health Check
```json
{
  "action": "health"
}
```

Response:
```json
{
  "total": 5,
  "healthy": 5,
  "unhealthy": 0,
  "agents": [...]
}
```

#### 3. Restart Agent
```json
{
  "action": "restart",
  "agentId": "agent_001"
}
```

Response:
```json
{
  "message": "Agent agent_001 restart requested"
}
```

---

### GET /api/metrics

Get Prometheus metrics.

**Authentication:** Requires `metrics:read` permission

**Response (200 OK):**
```
# HELP citation_accuracy_total Current citation analysis accuracy
# TYPE citation_accuracy_total gauge
citation_accuracy_total 0.87

# HELP citation_latency_ms Citation analysis latency in milliseconds
# TYPE citation_latency_ms histogram
citation_latency_ms_bucket{le="100"} 245
citation_latency_ms_bucket{le="250"} 489
citation_latency_ms_bucket{le="500"} 498
citation_latency_ms_count 500
citation_latency_ms_sum 125000

# HELP citation_consensus Agent consensus level (0-1)
# TYPE citation_consensus gauge
citation_consensus 0.92

# HELP citation_agent_failures_total Total number of agent failures
# TYPE citation_agent_failures_total counter
citation_agent_failures_total{agent_id="agent_001"} 2
citation_agent_failures_total{agent_id="agent_002"} 0
```

---

### GET /health

Platform health check (public).

**Response (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-20T10:00:00.000Z",
  "uptime": 86400,
  "database": "connected",
  "redis": "connected"
}
```

**Response (503 Service Unavailable):**
```json
{
  "status": "unhealthy",
  "timestamp": "2025-11-20T10:00:00.000Z",
  "database": "error",
  "redis": "error",
  "error": "Connection refused"
}
```

---

## TypeScript Interfaces

### Core Types

```typescript
/**
 * Citation document to analyze
 */
export interface CitationDocument {
  text: string;                      // Citation text to verify
  claimedSource: string;             // What the citation claims to reference
  actualSource?: string;             // Ground truth (optional, for training)
  metadata?: Record<string, any>;    // Additional context
}

/**
 * Individual agent analysis result
 */
export interface CitationAnalysisResult {
  integrityScore: number;            // [0, 1] - How accurate the citation appears
  behaviorUsed: string;              // Which behavior the agent applied
  confidence: number;                // [0, 1] - Agent's confidence
  detectedViolations: string[];      // Specific issues found
  metadata: Record<string, any>;     // Additional analysis data
  agentId: string;                   // Agent identifier
  agentReputation: number;           // [0, 1] - Agent's current reputation
}

/**
 * Aggregated multi-agent analysis
 */
export interface AggregatedAnalysis {
  meanIntegrity: number;             // [0, 1] - Weighted average integrity score
  consensus: number;                 // [0, 1] - How much agents agree
  numAgents: number;                 // Number of agents that responded
  behaviorDistribution: Record<string, number>; // Behavior usage counts
  recommendations: string[];         // Generated recommendations
  individualResults: CitationAnalysisResult[]; // All agent results
  latencyMs: number;                 // Total analysis time (ms)
  timestamp: string;                 // ISO 8601 timestamp
}

/**
 * Agent persistent state
 */
export interface AgentState {
  agentId: string;                   // Unique identifier
  reputation: number;                // [0, 1] - Current reputation
  totalCitations: number;            // Total citations processed
  detectedViolations: number;        // Total violations detected
  currentBehavior: string;           // Active behavior
  memoryState: Record<string, any>; // 4-level memory hierarchy
  explorationRate: number;           // [0, 1] - Exploration vs exploitation
  timestamp: string;                 // ISO 8601 timestamp
  version: number;                   // Optimistic locking version
}

/**
 * Agent runtime status
 */
export interface AgentStatus {
  agentId: string;
  reputation: number;
  totalCitations: number;
  detectedViolations: number;
  violationRate: number;             // detectedViolations / totalCitations
  currentBehavior: string;
  explorationRate: number;
  memorySize: {
    immediate: number;               // Working memory size
    shortterm: number;               // Recent patterns size
    longtermStats: number;           // Learned behaviors count
    behaviorReputations: number;     // Tracked behaviors count
  };
  isHealthy: boolean;
  timestamp: string;
}

/**
 * Platform configuration
 */
export interface PlatformConfig {
  // Agent configuration
  numAgents: number;                 // Number of agents to spawn
  agentScriptPath: string;           // Path to Python agent script
  agentTimeout: number;              // Agent request timeout (ms)
  maxRestarts: number;               // Max restarts before failure

  // Database configuration (PostgreSQL)
  database: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    poolSize: number;
  };

  // Redis configuration
  redis: {
    host: string;
    port: number;
    db: number;
    ttl: number;                     // Cache TTL (seconds)
    password?: string;
  };

  // Performance tuning
  performance: {
    maxConcurrentRequests: number;
    requestTimeout: number;          // API request timeout (ms)
    cacheTTL: number;                // Cache TTL (seconds)
  };

  // Monitoring
  monitoring: {
    metricsPort: number;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    healthCheckInterval: number;     // Health check interval (ms)
  };
}
```

### Agent Management Classes

```typescript
/**
 * Manages a single Python agent process
 */
export class PythonAgentWrapper {
  constructor(
    agentId: string,
    scriptPath: string,
    maxRestarts: number,
    timeout: number
  );

  async start(): Promise<void>;
  async stop(): Promise<void>;
  async analyzeCitation(document: CitationDocument): Promise<CitationAnalysisResult>;
  async getStatus(): Promise<AgentStatus>;
  getHealthStatus(): boolean;
}

/**
 * Manages agent state persistence
 */
export class AgentStateManager {
  constructor(
    dbConfig: PlatformConfig['database'],
    redisConfig: PlatformConfig['redis']
  );

  async saveState(state: AgentState): Promise<void>;
  async loadState(agentId: string): Promise<AgentState | null>;
  async getCurrentVersion(agentId: string): Promise<number>;
  async saveAnalysis(analysis: AggregatedAnalysis): Promise<void>;
  async cleanup(): Promise<void>;
}

/**
 * Orchestrates multiple agents for consensus
 */
export class CitationAgentOrchestrator {
  constructor(
    config: PlatformConfig,
    stateManager: AgentStateManager,
    metricsCollector: MetricsCollector
  );

  async initialize(): Promise<void>;
  async analyzeDocument(document: CitationDocument): Promise<AggregatedAnalysis>;
  async getAgentCount(): Promise<number>;
  async getHealthyAgentCount(): Promise<number>;
  async getAgentStatuses(): Promise<AgentStatus[]>;
  async shutdown(): Promise<void>;
}

/**
 * Collects Prometheus metrics
 */
export class MetricsCollector {
  recordLatency(ms: number): void;
  recordAccuracy(accuracy: number): void;
  recordThroughput(cps: number): void;
  recordConsensus(consensus: number): void;
  recordAgentFailure(agentId: string): void;
  getMetrics(): string;
}
```

---

## Python Agent Protocol

### IPC Message Protocol

Communication via stdin/stdout using newline-delimited JSON.

### Request Message

```json
{
  "type": "request",
  "requestId": "agent_001_1732000000_0.123",
  "method": "analyze_citation" | "get_status",
  "params": { ... }
}
```

### Response Message

```json
{
  "type": "response",
  "requestId": "agent_001_1732000000_0.123",
  "data": { ... }          // on success
  // OR
  "error": "Error message" // on failure
}
```

### Health Message

```json
{
  "type": "health",
  "data": {
    "healthy": true
  }
}
```

### Agent Methods

#### 1. analyze_citation

Analyze a citation document.

**Request:**
```json
{
  "type": "request",
  "requestId": "req_001",
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

**Response:**
```json
{
  "type": "response",
  "requestId": "req_001",
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

#### 2. get_status

Get agent runtime status.

**Request:**
```json
{
  "type": "request",
  "requestId": "req_002",
  "method": "get_status",
  "params": {}
}
```

**Response:**
```json
{
  "type": "response",
  "requestId": "req_002",
  "data": {
    "agentId": "agent_001",
    "reputation": 0.78,
    "totalCitations": 1523,
    "detectedViolations": 184,
    "violationRate": 0.12,
    "currentBehavior": "combined_heuristic",
    "explorationRate": 0.15,
    "memorySize": {
      "immediate": 10,
      "shortterm": 100,
      "longtermStats": 5,
      "behaviorReputations": 9
    },
    "isHealthy": true,
    "timestamp": "2025-11-20T10:00:00.000Z"
  }
}
```

### Python Agent Class

```python
class CitationIntegrityAgent:
    """
    Main agent class with nested learning
    """

    def __init__(
        self,
        agent_id: str,
        initial_reputation: float = 0.5,
        exploration_rate: float = 0.2,
        learning_rate: float = 0.01,
        meta_learning_rate: float = 0.001,
        db_config: Optional[Dict[str, Any]] = None,
        redis_config: Optional[Dict[str, Any]] = None
    ):
        """Initialize agent"""

    def process_citation(
        self,
        document: CitationDocument
    ) -> Tuple[CitationAnalysisResult, Dict[str, Any]]:
        """
        Analyze citation and return result + statistics
        """

    def get_status(self) -> Dict[str, Any]:
        """
        Get agent runtime status
        """

    def cleanup(self) -> None:
        """
        Clean up resources (database, Redis connections)
        """
```

---

## Database Schema

### agent_states

Persistent agent learning state.

```sql
CREATE TABLE agent_states (
    agent_id VARCHAR(50) PRIMARY KEY,
    reputation FLOAT NOT NULL DEFAULT 0.5
        CHECK (reputation >= 0 AND reputation <= 1),
    total_citations INTEGER NOT NULL DEFAULT 0,
    detected_violations INTEGER NOT NULL DEFAULT 0,
    current_behavior VARCHAR(50),
    memory_state JSONB NOT NULL DEFAULT '{}'::jsonb,
    exploration_rate FLOAT NOT NULL DEFAULT 0.2
        CHECK (exploration_rate >= 0 AND exploration_rate <= 1),
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_agent_states_reputation ON agent_states(reputation DESC);
CREATE INDEX idx_agent_states_timestamp ON agent_states(timestamp DESC);
CREATE INDEX idx_agent_states_memory_gin ON agent_states USING gin(memory_state);
```

### citation_analyses

Analysis results for tracking and analytics.

```sql
CREATE TABLE citation_analyses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,

    -- Citation content
    document_text TEXT NOT NULL,
    claimed_source VARCHAR(500),
    actual_source VARCHAR(500),

    -- Analysis results
    source VARCHAR(255) DEFAULT 'platform',
    mean_integrity FLOAT CHECK (mean_integrity >= 0 AND mean_integrity <= 1),
    consensus FLOAT CHECK (consensus >= 0 AND consensus <= 1),
    behavior_distribution JSONB DEFAULT '{}'::jsonb,
    recommendations JSONB DEFAULT '[]'::jsonb,
    num_agents INTEGER,
    latency_ms INTEGER,

    -- Individual results
    agent_results JSONB,
    metadata JSONB,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    analysis_duration_ms INTEGER,

    -- Status
    status VARCHAR(50) DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

CREATE INDEX idx_citation_analyses_mean_integrity ON citation_analyses(mean_integrity);
CREATE INDEX idx_citation_analyses_consensus ON citation_analyses(consensus);
CREATE INDEX idx_citation_analyses_source ON citation_analyses(source);
```

---

## Error Codes

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Analysis successful |
| 400 | Bad Request | Missing required field |
| 401 | Unauthorized | Invalid JWT token |
| 403 | Forbidden | Insufficient permissions |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Agent orchestrator failure |
| 503 | Service Unavailable | Database/Redis connection failed |

### Agent Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `Agent script not found` | Script path invalid | Check `agentScriptPath` config |
| `Agent process exited (code: 1)` | Python error | Check agent logs for traceback |
| `Agent request timeout` | Agent unresponsive | Increase `agentTimeout` |
| `Version conflict` | Concurrent state update | Retry with latest state |
| `No agents available` | All agents failed | Check agent health, restart |

---

## Rate Limits

| Endpoint | Limit | Scope |
|----------|-------|-------|
| `/api/citations/analyze` | 60/hour | Per user |
| `/api/admin/agents` | 120/hour | Per user |
| `/api/metrics` | 1000/hour | Per IP |
| `/health` | Unlimited | - |

---

## Authentication

All protected endpoints require JWT authentication.

**Header:**
```
Authorization: Bearer <token>
```

**Token Structure:**
```json
{
  "userId": 123,
  "email": "user@example.com",
  "role": "operator",
  "iat": 1732000000,
  "exp": 1732003600
}
```

**Permissions:**

| Role | Permissions |
|------|-------------|
| `viewer` | `metrics:read` |
| `operator` | `viewer` + `citations:analyze` |
| `admin` | `operator` + `users:manage`, `agents:manage` |

---

**Author:** Marcus (Platform Engineer)
**Date:** 2025-11-20
**Version:** MARCUS 3.0
