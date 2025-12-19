# MARCUS 3.2 Auto-Scaling Agent Pool Architecture

## Overview

The MARCUS platform uses a **true auto-scaling agent pool** that spawns Python citation agents on-demand rather than pre-spawning all agents at initialization. This architecture was designed to solve connection exhaustion issues in resource-constrained CI environments while maintaining multi-agent consensus capabilities.

## Problem Statement

### Original Architecture (Pre-spawn - BROKEN in CI)

```
┌─────────────────────────────────────────────────────────────┐
│                    WHAT WE HAD BEFORE                       │
│                                                             │
│   ┌─────────────┐                                           │
│   │    Queue    │ <── Tasks get queued here                 │
│   └──────┬──────┘                                           │
│          │                                                  │
│          v                                                  │
│   ┌─────────────────────────────────────────┐              │
│   │         Agent Pool (pre-spawned)         │              │
│   │  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐│              │
│   │  │Agent 1│ │Agent 2│ │Agent 3│ │Agent 4││ <── All spawn│
│   │  │  DB   │ │  DB   │ │  DB   │ │  DB   ││    at init   │
│   │  │ conn  │ │ conn  │ │ conn  │ │ conn  ││              │
│   │  └───────┘ └───────┘ └───────┘ └───────┘│              │
│   └─────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

**Problems:**
1. All 5 agents spawned simultaneously at `initialize()`
2. Each agent opens a PostgreSQL connection immediately
3. CI Docker PostgreSQL service couldn't handle connection storm
4. Agents crashed on startup → stdin destroyed → health check failed

**Error seen in CI:**
```
❌ Health check failed for agent agent_004: Error: Failed to write to agent stdin
after 3 retries: Cannot call write after a stream was destroyed
```

### Why It Worked Locally But Failed in CI

| Environment | PostgreSQL | Resources | Result |
|------------|------------|-----------|--------|
| Local VM | Dedicated instance | Relaxed limits | Works |
| CI Docker | Service container | Constrained | Connection exhaustion |

## Solution: True Auto-Scaling Architecture

### Design Goals

```
Queue receives task ──► Spawn agent (if below max) ──► Agent connects to DB
                                                           │
                                                           v
                                                     Process task
                                                           │
                                                           v
                                              Return to pool or terminate
```

### Implementation

```typescript
// Pseudo-code for auto-scaling
class Orchestrator {
  private agentPool: Agent[] = [];
  private maxAgents = 5;

  async analyzeDocument(document: Document) {
    // AUTO-SCALE: Spawn ONE more agent if below capacity
    if (this.agentPool.length < this.maxAgents) {
      await this.spawnAgent();  // Spawn one at a time
    }

    // Use ALL healthy agents for consensus
    const healthyAgents = this.agentPool.filter(a => a.isHealthy);
    return this.runConsensus(healthyAgents, document);
  }
}
```

### Scale-Up Pattern

```
                    analyzeDocument() calls
                           │
    ┌──────────────────────┼──────────────────────┐
    │                      │                      │
    v                      v                      v
 Call 1                 Call 2                 Call 5+
    │                      │                      │
    v                      v                      v
┌─────────┐          ┌─────────┐          ┌─────────┐
│ Spawn 1 │          │ Spawn 1 │          │ No spawn│
│ agent   │          │ more    │          │ (full)  │
└────┬────┘          └────┬────┘          └────┬────┘
     │                    │                    │
     v                    v                    v
┌─────────┐          ┌─────────┐          ┌─────────┐
│ Pool: 1 │          │ Pool: 2 │          │ Pool: 5 │
│ agent   │          │ agents  │          │ agents  │
└────┬────┘          └────┬────┘          └────┬────┘
     │                    │                    │
     v                    v                    v
  Use all              Use all              Use all
  (1 agent)           (2 agents)           (5 agents)
```

### Detailed Flow

```
Call 1: spawn agent_000 → use [agent_000]                    (1 agent consensus)
Call 2: spawn agent_001 → use [agent_000, agent_001]         (2 agent consensus)
Call 3: spawn agent_002 → use [agent_000, agent_001, agent_002] (3 agent consensus)
Call 4: spawn agent_003 → use [agent_000..agent_003]         (4 agent consensus)
Call 5: spawn agent_004 → use [agent_000..agent_004]         (5 agent consensus)
Call 6: no spawn       → use [agent_000..agent_004]          (5 agent consensus)
...
Call N: no spawn       → use all agents (pool full)          (full consensus)
```

## Architecture Components

### CitationAgentOrchestrator

```typescript
export class CitationAgentOrchestrator {
  private agents: Map<string, PythonAgentWrapper> = new Map();
  private busyAgents: Set<string> = new Set();
  private agentCounter: number = 0;
  private spawnLock: Promise<void> = Promise.resolve();

  async initialize(): Promise<void> {
    // Lazy initialization - don't pre-spawn agents
    // Agents will be spawned on-demand when tasks arrive
    this.isRunning = true;
    console.log(`✅ Orchestrator initialized (agents will spawn on-demand)`);
  }

  async analyzeDocument(document: CitationDocument): Promise<AggregatedAnalysis> {
    // AUTO-SCALE: Spawn ONE more agent if below capacity
    if (this.agents.size < this.config.numAgents) {
      try {
        await this.spawnAgent();
      } catch (err) {
        console.error(`Failed to spawn agent: ${err}`);
        // Continue with existing agents if spawn fails
      }
    }

    // Get all healthy agents for analysis
    const healthyAgents = Array.from(this.agents.values()).filter(a => a.isHealthy);

    // Distribute to all healthy agents for consensus
    // ...
  }
}
```

### PythonAgentWrapper

Each agent wrapper manages:
- Python process lifecycle (spawn, health check, restart)
- stdin/stdout IPC communication
- Connection to PostgreSQL and Redis
- Graceful shutdown

```typescript
export class PythonAgentWrapper extends EventEmitter {
  private process?: ChildProcess;
  private isHealthy: boolean = false;

  async start(): Promise<void> {
    this.process = spawn('python3', [this.scriptPath, this.agentId], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, PYTHONUNBUFFERED: '1', AGENT_ID: this.agentId }
    });

    this.setupIPC();
    this.setupHealthMonitor();
  }
}
```

## Benefits

### 1. No Connection Storm
- Agents spawn one at a time
- Each has time to establish DB connection before next spawn
- Prevents overwhelming CI PostgreSQL service

### 2. Gradual Resource Allocation
- CI environment gets resources allocated incrementally
- Memory and CPU usage ramps up smoothly
- No sudden spike at startup

### 3. Improving Consensus Over Time
- First few calls use fewer agents (lower consensus confidence)
- After 5 calls, full 5-agent consensus available
- Benchmark accuracy improves as pool grows

### 4. Resilience
- If one agent fails to spawn, others continue working
- Failed agents can be respawned on demand
- Pool self-heals over time

## Configuration

```typescript
const config: PlatformConfig = {
  numAgents: 5,                    // Maximum pool size
  agentScriptPath: './agents/citation_integrity_agent.py',
  agentTimeout: 30000,             // 30s timeout per agent
  maxRestarts: 3,                  // Restart attempts before marking failed
  database: {
    host: 'localhost',
    port: 5432,
    database: 'citations',
    user: 'postgres',
    password: 'password',
    poolSize: 10
  },
  redis: {
    host: 'localhost',
    port: 6379,
    db: 0,
    ttl: 3600
  }
};
```

## Monitoring

### Agent Pool Metrics

```
marcus_agent_pool_size{state="total"}     # Total agents in pool
marcus_agent_pool_size{state="healthy"}   # Healthy agents
marcus_agent_pool_size{state="busy"}      # Currently processing
marcus_agent_pool_size{state="idle"}      # Available for work
```

### Scaling Events

```
🔄 Spawning agent agent_000 on-demand (1/5)...
✅ Agent agent_000 ready
🔄 Spawning agent agent_001 on-demand (2/5)...
✅ Agent agent_001 ready
...
✅ Agent pool ready: 5/5 agents
```

## Error Handling

### Agent Crash Recovery

When an agent crashes:
1. Exit handler captures last stderr output
2. Agent marked as unhealthy
3. Next `analyzeDocument()` call spawns replacement
4. Pool self-heals without manual intervention

```typescript
this.process.on('exit', (code, signal) => {
  const lastError = (this as any)._lastStderr ? (this as any)._lastStderr() : '';
  console.warn(`⚠️ Agent ${this.agentId} exited (code: ${code}, signal: ${signal})`);
  if (code !== 0 && lastError) {
    console.error(`❌ Agent ${this.agentId} last stderr before exit: ${lastError}`);
  }
  this.isHealthy = false;
});
```

### Spawn Lock

Prevents race conditions when multiple concurrent requests try to spawn:

```typescript
private spawnLock: Promise<void> = Promise.resolve();

private async getOrSpawnAgent(): Promise<PythonAgentWrapper | null> {
  // Use lock to prevent multiple spawns at once
  await this.spawnLock;

  let resolveSpawnLock: () => void;
  this.spawnLock = new Promise(resolve => { resolveSpawnLock = resolve; });

  try {
    return await this.spawnAgent();
  } finally {
    resolveSpawnLock!();
  }
}
```

## Testing

### Local Testing

```bash
# Run benchmark locally
npx tsx src/platform/evaluation/citationBenchmarks.ts

# Expected output shows gradual scale-up:
# 🔄 Spawning agent agent_000 on-demand (1/5)...
# ✅ Agent agent_000 ready
# 🔄 Spawning agent agent_001 on-demand (2/5)...
# ...
```

### CI Testing

The GitHub Actions benchmark workflow tests auto-scaling in a Docker environment:

```yaml
services:
  postgres:
    image: postgres:15
    env:
      POSTGRES_USER: benchmark_user
      POSTGRES_PASSWORD: benchmark_pass
      POSTGRES_DB: benchmark_db
    ports:
      - 5432:5432
```

## Migration Notes

### From Pre-spawn to Auto-scaling

If upgrading from a pre-spawn architecture:

1. No code changes needed in callers - `analyzeDocument()` API unchanged
2. First few calls will have lower consensus (1-4 agents instead of 5)
3. After `numAgents` calls, behavior identical to pre-spawn
4. Benchmark results may show slight variance in first few iterations

### Backward Compatibility

The `analyzeDocument()` method signature is unchanged:

```typescript
// Before and after - same API
const result = await platform.analyzeDocument(document);
console.log(result.meanIntegrity);  // Works identically
console.log(result.consensus);       // May be 1.0 for first call (single agent)
```

## Related Files

- `src/platform/integration/citationAgentIntegration.ts` - Main orchestrator
- `src/platform/agents/citation_integrity_agent.py` - Python agent
- `src/platform/evaluation/citationBenchmarks.ts` - Benchmark suite
- `.github/workflows/marcus-benchmark.yml` - CI benchmark workflow

## Changelog

### 2025-11-27: Auto-Scaling Implementation

- Removed pre-spawn from `initialize()`
- Added gradual spawn in `analyzeDocument()`
- Added spawn lock for thread safety
- Added busy/idle agent tracking
- Added better error diagnostics (last stderr capture)

---

*Author: Marcus (Platform Engineer)*
*Date: 2025-11-27*
