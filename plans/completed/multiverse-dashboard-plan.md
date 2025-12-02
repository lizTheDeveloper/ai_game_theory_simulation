# Multiverse Dashboard Implementation Plan

**Created:** October 27, 2025
**Status:** Research Phase
**Complexity:** HIGH (16-24 hours estimated)
**Owner:** orchestrator-1

## Overview

Implement a multi-simulation orchestration system that allows running and viewing multiple simulations concurrently with a unified dashboard interface.

## Current Architecture

**Single Simulation Model:**
- One `SimulationWorkerClient` manages one Web Worker
- `SimulationWorkerContext` provides global singleton worker
- State persistence via IndexedDB (already implemented)
- One simulation at a time via dashboard

**Architecture Strengths:**
- Clean worker lifecycle management
- Robust state persistence with versioning
- Event streaming to IndexedDB
- Proper cleanup on unmount

**Architecture Gaps:**
- No multi-worker orchestration
- No worker pool management
- No cross-simulation coordination
- No resource monitoring/limits

## Feature Requirements

### Backend (Multi-Simulation Orchestration)

**1. MultiSimulationManager Class**
- Manages pool of SimulationWorkerClient instances
- Unique simulation IDs for each worker
- Status tracking (running/paused/completed/error)
- Resource allocation strategy
- Message routing (worker ID → update handler)
- Lifecycle management (create/pause/resume/stop/destroy)
- Independent RNG seeds per simulation

**2. Resource Management**
- CPU/memory monitoring
- Configurable concurrent simulation limit
- Queue system when limit reached
- Warning when approaching browser limits
- Graceful degradation (throttle background simulations)

**3. Data Management**
- Each simulation has independent event stream
- Aggregate metrics across simulations
- State persistence per simulation (already works)
- Export/compare functionality

### Frontend (Multiverse UI)

**1. MultiverseContext Provider**
- Replaces single-worker context with multi-worker management
- Tracks all active simulations
- Provides hooks for simulation CRUD operations
- Resource usage monitoring
- Global controls (pause all, resume all)

**2. Multiverse Dashboard Page (`/multiverse`)**
- Grid/list view of all active simulations
- Compact SimulationCard components
- "Start New Simulation" modal
- Resource usage indicators
- Filter/sort simulations

**3. SimulationCard Component**
- Simulation name/ID display
- Current month/year
- Key metrics (QoL, population, AI capability)
- Outcome trajectory indicator
- Mini-sparklines for trends
- Status badge (running/paused/completed)
- Quick actions (pause/resume/stop/view details)
- Click to expand to full dashboard

**4. Comparison Tools**
- Side-by-side dashboard view
- Aggregate statistics across runs
- Divergence analysis
- Export multiple results

## Research Questions

### Phase 1: Multi-Worker Orchestration Patterns

**REQUIRED RESEARCH:**

1. **Web Worker Pool Management**
   - What are best practices for managing multiple Web Workers in browsers?
   - How many workers can browsers realistically support before performance degrades?
   - What are common patterns for worker lifecycle management?
   - Citations needed from browser vendors (Chrome, Firefox, Safari)

2. **Message Routing & Coordination**
   - How to route messages from multiple workers without collision?
   - What patterns exist for worker-to-worker communication (if needed)?
   - How to handle worker crashes in multi-worker environments?
   - What are common debugging strategies?

3. **Resource Limits & Monitoring**
   - What are typical browser memory limits for Web Workers?
   - How to measure CPU usage per worker?
   - What APIs exist for monitoring resource usage (Performance API, Memory API)?
   - When should background workers be throttled?

4. **State Isolation & Shared Resources**
   - How to prevent race conditions in IndexedDB with multiple writers?
   - What are best practices for transaction isolation?
   - How to handle shared RNG state (answer: don't share - independent seeds)

## Implementation Phases

### Phase 1: Research & Architecture (3-4 hours)
- **Research:** Multi-worker patterns, resource limits, browser APIs
- **Validation:** Research-skeptic review
- **Design:** MultiSimulationManager API
- **Design:** MultiverseContext API
- **Design:** Component hierarchy
- **Output:** Architecture document with citations

### Phase 2: Backend Implementation (4-6 hours)
- **Implement:** MultiSimulationManager class
  - Worker pool management (Map<id, SimulationWorkerClient>)
  - Lifecycle methods (createSimulation, pauseSimulation, etc.)
  - Message routing layer
  - Resource monitoring integration
- **Extend:** SimulationWorkerClient
  - Add simulation ID to all messages
  - Add resource usage reporting
- **Add:** Simulation registry (metadata tracking)
- **Test:** Basic multi-worker creation/destruction

### Phase 3: Frontend Implementation (4-6 hours)
- **Create:** MultiverseContext provider
  - Replace SimulationWorkerContext
  - Manage MultiSimulationManager instance
  - Provide hooks for simulation operations
- **Build:** Multiverse dashboard page (`/multiverse`)
  - Grid layout with responsive design
  - "Start New Simulation" modal
  - Resource usage indicators
- **Create:** SimulationCard component
  - Compact view with key metrics
  - Mini-sparklines for trends
  - Quick action buttons
- **Integration:** Route existing dashboard to view single simulation

### Phase 4: Integration & Testing (3-4 hours)
- **Test:** Parallel execution (2, 5, 10 simulations)
- **Profile:** Memory usage across simulation counts
- **Profile:** CPU usage and responsiveness
- **Test:** State persistence for multiple simulations
- **Test:** Pause/resume/stop operations
- **Test:** Worker crashes and recovery
- **Test:** IndexedDB transaction isolation
- **Document:** Performance benchmarks and limits

### Phase 5: Polish & Documentation (2-4 hours)
- **Add:** Comparison tools (side-by-side view)
- **Add:** Export multiple simulation results
- **Architecture Review:** Spawn architecture-skeptic
- **Update:** Wiki documentation
- **Add:** Devlog entry
- **Update:** Roadmap

## Technical Considerations

### Performance

**Memory:**
- Each simulation state ~100KB-1MB (depends on month)
- 10 simulations = ~1-10MB memory baseline
- IndexedDB quota typically 50%+ of available storage
- Need to test: How many simulations before browser struggles?

**CPU:**
- Each worker runs independently (parallel execution)
- Browser throttles background workers automatically
- Need to measure: CPU usage per simulation
- Consider: Throttle update frequency for background simulations

**Responsiveness:**
- Main thread should never block
- UI updates batched (React concurrent mode)
- Worker messages queued and processed asynchronously

### Resource Allocation Strategy

**Proposed Limits:**
- **Concurrent running simulations:** 5 (configurable)
- **Total simulations (including paused):** 20 (configurable)
- **Memory threshold:** Warn at 80% IndexedDB quota
- **CPU threshold:** Throttle background simulations if >80% CPU usage

**Degradation Strategy:**
1. First 5 simulations: Run at normal speed
2. 6-10 simulations: Background simulations throttled (2x slower updates)
3. 11+ simulations: Require explicit user choice (pause others or queue)

### IndexedDB Transaction Isolation

**Current:** Single simulation writes to 3 object stores (events, simulations, metadata)

**Multi-Simulation:**
- Each simulation writes to same stores but different keys
- IndexedDB transactions are per-object-store (no cross-key conflicts)
- Race condition risk: Multiple simulations updating metadata store simultaneously
- Solution: Use per-simulation metadata keys, atomic transactions

**Validation:** Test concurrent writes to different keys in same store

### Message Routing Architecture

**Problem:** Multiple workers sending 'update' messages - how to distinguish?

**Solution 1: Worker ID in postMessage**
```typescript
// Worker sends
postMessage({ type: 'update', simulationId: 'unique-id', delta: {...} });

// Manager routes
worker.addEventListener('message', (event) => {
  const { simulationId, ...msg } = event.data;
  this.routeMessage(simulationId, msg);
});
```

**Solution 2: Separate event handlers per worker**
```typescript
// Each worker gets unique handler
const worker = new Worker(...);
worker.addEventListener('message', this.createHandler(simulationId));
```

**Recommendation:** Solution 1 (cleaner separation of concerns)

## Success Criteria

- [ ] Can create 10 simulations simultaneously without browser crash
- [ ] Each simulation maintains independent state
- [ ] State persistence works for all simulations
- [ ] UI remains responsive with 10 active simulations
- [ ] Memory usage stays under browser limits
- [ ] CPU usage distributed across workers
- [ ] Worker crashes don't affect other simulations
- [ ] IndexedDB transactions don't collide
- [ ] Can pause/resume individual simulations
- [ ] Can view full dashboard for any simulation
- [ ] Performance benchmarks documented

## Open Questions

1. Should background simulations auto-pause to save resources?
2. Should simulations resume on page reload?
3. How to handle simulation naming (user input vs auto-generated)?
4. Should there be a "comparison mode" for divergence analysis?
5. Export format for multiple simulations (JSON? CSV? HDF5?)

## Non-Goals (Future Work)

- Real-time collaboration (multiple users)
- Cloud synchronization
- Simulation forking/branching
- Monte Carlo batch execution in UI (already have CLI)
- Worker-to-worker communication (unnecessary)

## References

**To be added in research phase:**
- Web Workers specification
- Browser performance benchmarks
- IndexedDB concurrency patterns
- Worker pool management libraries
