# DEPRECATED: Spawn-Agents Orchestrator Pattern

**Status:** DEPRECATED as of MARCUS 3.1 (November 22, 2025)
**Reason:** Replaced by Worker Service Pattern for better scalability and resilience

---

## What Was This?

The spawn-agents orchestrator pattern was the original MARCUS 3.0 architecture where:
- TypeScript orchestrator spawned Python agent subprocesses internally
- All agents ran within the same container process tree
- IPC happened via stdin/stdout JSON messages
- Orchestrator managed agent lifecycle directly

### Architecture Diagram

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

---

## Why Deprecated?

### Problems with Spawn-Agents Pattern

1. **Tight Coupling**
   - All agents share same container
   - Agent crashes could destabilize orchestrator
   - Single point of failure

2. **Limited Scalability**
   - Can't scale agents independently from orchestrator
   - Vertical scaling only (bigger container)
   - Kubernetes HPA less effective

3. **Complex Process Management**
   - Orchestrator responsible for subprocess lifecycle
   - Zombie process cleanup required
   - IPC protocol adds complexity

4. **Resource Inefficiency**
   - All agents must be co-located
   - Can't distribute across nodes efficiently
   - Memory pressure affects entire container

5. **Operational Complexity**
   - Harder to debug (logs interleaved)
   - Can't restart single agents independently
   - Deployment coordination required

---

## Migration Path

### RECOMMENDED: Worker Service Pattern

Use the **worker service architecture** instead:

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
    └──────────────────────────────────────────┘
```

### Advantages of Worker Service

1. **Horizontal Scalability** - Scale workers independently
2. **Resilience** - Worker failures don't affect orchestrator
3. **Kubernetes-Native** - Works with HPA, pod autoscaling
4. **Loose Coupling** - Queue-based decoupling
5. **Operational Simplicity** - Independent deployments

### Migration Steps

If you're currently using spawn-agents:

1. **Update docker-compose.yml**
   - Comment out `orchestrator-spawn-agents` service (already done)
   - Use `citation-worker-orchestrator` service instead
   - Deploy `citation-agent` workers (scalable with `deploy.replicas`)

2. **Update Kubernetes manifests**
   - Remove spawn-agents deployment (if it exists)
   - Use `orchestrator-deployment.yaml` (worker service pattern)
   - Deploy agent workers with `agent-deployment.yaml`
   - Configure HPA for automatic scaling

3. **Update environment variables**
   - Worker service uses Redis queue configuration
   - See `docs/ORCHESTRATOR_ARCHITECTURES.md` for full configuration

4. **Test migration**
   - Run integration tests: `npm run test:integration`
   - Verify workers pick up tasks from queue
   - Check metrics in Grafana dashboards

---

## Files Archived Here

- `Dockerfile.spawn-agents-orchestrator` - Original Dockerfile for spawn-agents pattern
- `README.md` - This deprecation notice (you are here)

---

## Original Code Location

The spawn-agents orchestrator logic is still in the codebase for backward compatibility:
- `src/platform/integration/citationAgentIntegration.ts` - Contains both patterns

However, the **recommended entry point** is now:
- `src/platform/api/worker-orchestrator-server.ts` - Worker service API server

---

## Support Timeline

- **MARCUS 3.0** (Nov 2025): Both patterns supported, spawn-agents marked LEGACY
- **MARCUS 3.1** (Nov 2025): Spawn-agents deprecated, archived to `legacy/`
- **MARCUS 4.0** (TBD): Spawn-agents code removal planned

If you have questions about migrating from spawn-agents to worker service, see:
- `docs/ORCHESTRATOR_ARCHITECTURES.md` - Architecture comparison
- `docs/MIGRATION_GUIDE.md` - Step-by-step migration instructions (to be created)

---

## Historical Context

The spawn-agents pattern was designed for:
- **Simplicity** - Single container deployment
- **Development** - Easy local testing
- **Proof of concept** - Initial MARCUS 3.0 implementation

It served its purpose well for early development but became a bottleneck as the platform scaled to production workloads (>100 workers, high throughput).

The worker service pattern emerged from production experience and represents the mature architecture for MARCUS 3.0+.

---

**Last Updated:** November 22, 2025
**Deprecated By:** Marcus (Platform Engineer)
**Reason:** Production scalability and operational simplicity
