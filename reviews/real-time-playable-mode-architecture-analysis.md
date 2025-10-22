# Real-Time Playable Mode Architecture Analysis

**Date:** October 22, 2025
**Analyst:** Architecture Skeptic
**Request:** Transform simulation from headless batch to real-time interactive gameplay (1 sec = 1 day)

## Executive Summary

**CAN WE DO IT?** YES, but with significant caveats and a critical console.log performance bug that must be fixed first.

**CONFIDENCE LEVEL:** 75% - The average step execution time of 829ms is technically below the 1000ms target, BUT:
- P95 execution time is 1408ms (exceeds target)
- A console.log bug causes 600-900ms delays (artificial bottleneck)
- Memory growth is concerning (0.29 MB per step, 1GB+ for long runs)
- No existing player input mechanism or UI state sync infrastructure

**BIGGEST BLOCKER:** Console.log statements in Early Warning System phase taking 600-900ms per step. This is NOT a computation issue but an I/O blocking problem that artificially inflates execution times.

## Performance Benchmark Results

### Execution Speed Analysis
```
Average Step Time: 829.42ms ✅ (target: <1000ms)
Min Step Time: 26.74ms
Max Step Time: 1502.77ms
P95 Step Time: 1408.64ms ❌ (exceeds target)

Real-time feasibility: MARGINAL
- 83% of steps complete under 1000ms
- 17% exceed target (creates stuttering)
```

### Top Performance Bottlenecks
1. **EARLY WARNING SYSTEM console.log: 600-900ms** (60-90% of total time!) ❌ CRITICAL
2. **Government Elections: 880ms** (only occurs every 12-60 months)
3. **Minimal Suffering Phase: 9ms**
4. **Ensemble Meta-Learning: 9ms**
5. **Government Response: 7ms**

**CRITICAL FINDING:** The simulation is actually FAST (~100-200ms per step) but console.log is blocking execution!

### Memory Consumption Profile
```
Initial Heap: 23.49 MB
Final Heap (100 steps): 52.76 MB
Growth Per Step: 0.29 MB
Projected Memory (3600 steps/120 months): 1,077 MB

State Size: 1.78 MB (manageable for serialization)
```

## Critical Issues (BLOCKING)

### 1. Console.log Performance Bug [SEVERITY: CRITICAL]
**Problem:** Console.log statements in Early Warning System phase block for 600-900ms
**Root Cause:** Synchronous I/O to console during phase execution
**Impact:** Artificially inflates execution time by 5-10x
**Solution:**
- Remove or buffer console.log statements
- Use async logging queue
- Only log critical events, not every warning

**Code Location:** `/src/simulation/earlyWarningSystems.ts:163-174`
```typescript
// THIS IS THE PROBLEM - BLOCKING I/O IN HOT PATH
console.log(`\n⚠️  === EARLY WARNING SYSTEM - ${newCriticalWarnings.length} CRITICAL ALERTS ===`);
// ... 10+ more console.log statements ...
```

### 2. No Player Input Mechanism [SEVERITY: CRITICAL]
**Problem:** Simulation has no concept of human player or decision injection
**Current State:** All decisions made by AI agents and government agent
**Required Changes:**
- Add `PlayerController` interface for human decisions
- Create `PlayerDecisionPhase` (order 8.5, before government actions)
- Implement decision queue mechanism
- Add pause/resume capability to PhaseOrchestrator

### 3. Sequential Phase Execution [SEVERITY: HIGH]
**Problem:** 91 phases execute sequentially, no parallelization
**Impact:** Cannot utilize multi-core for independent phases
**Opportunity:** Many phases are independent and could run in parallel:
- Different AI agents (20 agents)
- Different planetary boundaries (9 systems)
- Different countries (30 governments)

## High Priority Issues

### 1. State Propagation to UI [SEVERITY: HIGH]
**Current:** Static JSON file reads after simulation complete
**Required:** Real-time state streaming during execution
**Challenges:**
- 1.78 MB state size (too large for 30Hz updates)
- Deep object nesting makes diffing expensive
- No incremental update mechanism

**Recommended Approach:**
```typescript
interface StateUpdate {
  timestamp: number;
  delta: Partial<GameState>;  // Only changed fields
  events: GameEvent[];         // Phase events
  metrics: SimulationMetrics;  // Pre-calculated for UI
}
```

### 2. Memory Growth [SEVERITY: HIGH]
**Problem:** 0.29 MB heap growth per step
**Projection:** 1GB+ for 120-month runs
**Root Causes:**
- History arrays grow unbounded
- Event accumulation without cleanup
- No garbage collection triggers

**Solutions:**
- Implement sliding window for history (keep last 100 steps)
- Compress or externalize old events
- Periodic state snapshots with delta compression

### 3. UI Update Frequency [SEVERITY: MEDIUM]
**Challenge:** How often to send updates to UI?
- Every step (30Hz): Too much data (1.78 MB × 30 = 53 MB/sec)
- Every second (1Hz): Smooth enough for 1 day/sec
- On-demand: Player might miss important events

**Recommended:** Hybrid approach
- Metrics every 200ms (5Hz) - small payload
- Full state sync every 1000ms (1Hz) - or on pause
- Events streamed immediately (push model)

## Recommended Architecture

### 1. Execution Model: Web Worker + Main Thread

```typescript
// Web Worker (simulation thread)
class SimulationWorker {
  private engine: SimulationEngine;
  private isPaused: boolean = false;

  async runRealTime() {
    while (!this.isPaused) {
      const start = performance.now();

      // Execute one day
      const result = this.engine.step(this.state);

      // Send delta update to main thread
      postMessage({
        type: 'state-update',
        delta: calculateDelta(oldState, result.state),
        events: result.events,
        metrics: result.metrics
      });

      // Maintain 1 day/sec pace
      const elapsed = performance.now() - start;
      if (elapsed < 1000) {
        await sleep(1000 - elapsed);
      }
    }
  }
}

// Main Thread (UI)
class SimulationController {
  private worker: Worker;
  private stateCache: GameState;

  handleWorkerMessage(event: MessageEvent) {
    switch(event.data.type) {
      case 'state-update':
        this.applyDelta(event.data.delta);
        this.updateUI(event.data.metrics);
        this.showEvents(event.data.events);
        break;
    }
  }
}
```

### 2. State Sync Strategy: Delta Updates + Compression

```typescript
// Instead of sending full state, send deltas
class DeltaEncoder {
  encode(oldState: GameState, newState: GameState): StateDelta {
    // Use fast-json-patch or similar
    return jsonpatch.compare(oldState, newState);
  }

  // Compress if > 10KB
  compress(delta: StateDelta): Uint8Array {
    if (JSON.stringify(delta).length > 10240) {
      return pako.deflate(JSON.stringify(delta));
    }
    return delta;
  }
}
```

### 3. Player Decision Injection

```typescript
// New phase for player decisions (order 8.5)
class PlayerDecisionPhase implements SimulationPhase {
  readonly order = 8.5; // Before government actions

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // Check for pending player decisions
    const decisions = PlayerDecisionQueue.flush();

    for (const decision of decisions) {
      switch(decision.type) {
        case 'policy':
          state.government.policies[decision.policy] = decision.value;
          break;
        case 'investment':
          state.government.researchInvestments[decision.area] = decision.amount;
          break;
        case 'emergency':
          this.handleEmergencyResponse(state, decision);
          break;
      }
    }

    return { events: decisions.map(d => d.toEvent()) };
  }
}
```

### 4. Communication: WebSocket for Bidirectional Flow

```typescript
// Server-side (Next.js API route)
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const ws = new WebSocketServer({ noServer: true });

    ws.on('connection', (socket) => {
      const simulation = new SimulationRunner();

      socket.on('message', (data) => {
        const msg = JSON.parse(data);
        switch(msg.type) {
          case 'start': simulation.start(); break;
          case 'pause': simulation.pause(); break;
          case 'decision': simulation.injectDecision(msg.decision); break;
        }
      });

      simulation.on('update', (delta) => {
        socket.send(JSON.stringify({ type: 'delta', data: delta }));
      });
    });
  }
}
```

## Implementation Roadmap

### Phase 1: Fix Critical Performance Bug [2-4 hours]
**PRIORITY: CRITICAL - Must fix before anything else**
1. Remove/buffer console.log statements in Early Warning System
2. Implement async logging queue for important messages
3. Verify performance improvement (target: <200ms average)
4. Fix similar issues in Government Elections phase

### Phase 2: Minimal Viable Real-Time [8-12 hours]
1. Move simulation to Web Worker
2. Implement basic pause/resume
3. Add 1Hz state update to UI (full state for now)
4. Create simple dashboard showing metrics in real-time

### Phase 3: Player Input System [12-16 hours]
1. Design Player Decision interface
2. Create PlayerDecisionPhase
3. Implement decision queue
4. Add UI controls for player actions
5. Test decision injection

### Phase 4: Optimization [8-12 hours]
1. Implement delta-based updates
2. Add compression for large deltas
3. Create metrics pre-calculation
4. Optimize hot paths (remove O(n²) operations)

### Phase 5: Production Hardening [8-12 hours]
1. Add reconnection logic for WebSocket
2. Implement state recovery on disconnect
3. Add performance monitoring
4. Create adaptive quality settings

**Total Estimate: 38-56 hours**

## Risk Assessment

### Technical Risks

1. **Performance Variability [HIGH]**
   - P95 latency exceeds target
   - Elections cause multi-second freezes
   - Mitigation: Implement adaptive time scaling

2. **Memory Leaks [MEDIUM]**
   - Long runs could exhaust memory
   - Worker might crash after hours
   - Mitigation: Periodic worker restart with state handoff

3. **State Desync [HIGH]**
   - Delta application could fail
   - Race conditions with player input
   - Mitigation: Periodic full state sync + checksums

4. **Browser Compatibility [LOW]**
   - Web Workers widely supported
   - WebSocket stable
   - Main risk: Safari's aggressive memory limits

### Architecture Debt

1. **Tight Coupling**: Adding UI updates to phases increases coupling
2. **Testing Complexity**: Real-time mode harder to test than batch
3. **Debugging Difficulty**: Distributed system (worker + main thread + server)
4. **Maintenance Burden**: Two execution modes to maintain

## Alternative Approaches

### Alternative 1: Server-Side Simulation + SSE
**Pros:**
- Consistent performance (server hardware)
- No Web Worker complexity
- Easier state management

**Cons:**
- Higher server costs
- Network latency affects responsiveness
- Scaling challenges with many concurrent games

### Alternative 2: Time-Sliced Execution
**Pros:**
- Simpler architecture (no workers)
- Easier debugging
- Direct state access

**Cons:**
- UI freezes during computation
- Harder to maintain consistent timing
- Poor user experience with long phases

### Alternative 3: Reduce Fidelity for Real-Time
**Pros:**
- Guaranteed performance
- Smoother experience
- Less memory usage

**Cons:**
- Different results than full simulation
- Requires maintaining two simulation models
- May miss important emergent behaviors

## CRITICAL RECOMMENDATIONS

### MUST FIX IMMEDIATELY
1. **Console.log performance bug** - This is artificially inflating times by 5-10x
2. **Government Elections phase** - Consider running async or caching results

### ARCHITECTURE DECISIONS REQUIRED
1. **Player Agency Model**: How much control? Override AI decisions or parallel track?
2. **Time Control**: Allow speed changes (0.5x, 2x, 10x) or fixed 1 day/sec?
3. **State Authority**: Is worker or main thread source of truth?
4. **Persistence**: Save/load games in real-time mode?

### COMPLEXITY WARNING
Real-time mode introduces significant complexity:
- **State Management**: Distributed across worker + main thread + server
- **Timing Coordination**: Balancing simulation, UI updates, and player input
- **Error Recovery**: Handling disconnections, crashes, desync
- **Testing Surface**: 3x more test scenarios (timing-dependent bugs)

## Final Verdict

**FEASIBLE but requires immediate bug fixes and careful implementation.**

The simulation CAN run in real-time once the console.log bug is fixed. However, this is a MAJOR architectural change that will:
- Add 40-60 hours of implementation work
- Increase maintenance burden permanently
- Create new categories of bugs (timing, synchronization)
- Require ongoing performance optimization

**Recommended approach:** Fix the console.log bug FIRST, then implement a minimal prototype with Web Workers to validate the approach before committing to the full implementation.

**Architecture Skeptic's Warning:** The real performance is likely 100-200ms per step once the logging bug is fixed, giving plenty of headroom. But maintaining two execution modes (batch and real-time) will become a long-term burden. Consider whether real-time mode is truly necessary for the research goals of this simulation.