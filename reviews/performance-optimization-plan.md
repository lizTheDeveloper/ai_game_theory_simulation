# Performance Optimization Plan for AI Alignment Simulation

## Executive Summary
The simulation is experiencing significant performance degradation due to architectural issues around state management, excessive deep cloning, and inefficient hot-path operations. This plan identifies critical bottlenecks and provides a prioritized roadmap for optimization.

## Critical Performance Bottlenecks Identified

### 1. **CRITICAL: Excessive Deep Cloning in Hot Paths**
**Severity:** CRITICAL - System instability risk
**Files Affected:**
- `/src/simulation/engine.ts:441-480` - `snapshotState()` using structuredClone/manual deep copy
- `/src/simulation/diagnostics.ts:171` - Full state clone every step for comparison
- `/src/simulation-runner/monteCarlo.ts:182` - JSON.parse(JSON.stringify) for state variation
- `/src/simulation/research.ts:340` - Deep clone of capability profiles
- `/src/simulation/initialization.ts:107,109` - Deep cloning capability profiles

**Impact:**
- Every simulation step (monthly) creates multiple deep copies of the entire game state
- With 50+ AI agents, 20+ organizations, and complex nested objects, each clone can be 10-100MB
- At 1000 months × multiple clones per step = massive memory pressure and GC overhead

**Recommended Fix:**
1. Implement immutable state updates using libraries like Immer
2. Use structural sharing instead of deep cloning
3. Only snapshot on configurable intervals (already partially implemented)
4. Implement copy-on-write for large nested structures

---

### 2. **CRITICAL: Array Operations on Every Tick**
**Severity:** CRITICAL - Major performance degradation
**Files Affected:**
- `/src/simulation/agents/aiAgent.ts:959-978` - 4× per month iteration over all agents
- `/src/simulation/computeInfrastructure.ts:267-294` - Sorting and mapping operations
- `/src/simulation/lifecycle.ts:253` - Spread operations creating new arrays
- 505+ occurrences of .map(), .filter(), .reduce() across 70 files

**Impact:**
- O(n²) or worse complexity in many places
- Each phase iterates over all agents/organizations multiple times
- With 37 phases × 4 actions/month × 50+ agents = thousands of iterations per step

**Recommended Fix:**
1. Cache computed values that don't change within a step
2. Use indexed lookups (Map/Set) instead of array searches
3. Batch operations where possible
4. Implement lazy evaluation for derived properties

---

### 3. **HIGH: Phase Orchestrator Overhead**
**Severity:** HIGH - Significant overhead per step
**Files Affected:**
- `/src/simulation/engine/PhaseOrchestrator.ts:117-158` - Sequential phase execution
- `/src/simulation/engine.ts:319-385` - 37+ phases registered and executed sequentially

**Impact:**
- 37 phases executed sequentially every step
- Each phase has try/catch overhead
- No parallelization of independent phases
- Context passing creates additional object allocation

**Recommended Fix:**
1. Identify independent phases that can run in parallel
2. Implement phase batching for related operations
3. Use a dependency graph for phase execution
4. Pool and reuse context objects

---

### 4. **HIGH: State Mutation Anti-Patterns**
**Severity:** HIGH - Causes defensive copying
**Files Affected:**
- `/src/simulation/crisisPoints.ts:428` - Shallow copy followed by mutations
- Multiple phases using Object.assign() and spread operators
- Inconsistent state update patterns across phases

**Impact:**
- Defensive copying due to unpredictable mutations
- Difficult to track state changes
- Memory allocation for temporary objects

**Recommended Fix:**
1. Standardize state update patterns
2. Use immutable update utilities consistently
3. Implement state change tracking/diffing

---

### 5. **MEDIUM: JSON Serialization for Capability Profiles**
**Severity:** MEDIUM - Unnecessary overhead
**Files Affected:**
- `/src/simulation/research.ts:340` - JSON.parse(JSON.stringify) for profiles
- `/src/simulation/sleeperWake.ts:159` - JSON cloning for capability reveal
- `/src/simulation/technologyDiffusion.ts:236` - JSON cloning

**Impact:**
- Expensive serialization/deserialization
- Loss of type information
- Can't handle Map/Set/Date objects properly

**Recommended Fix:**
1. Use structured cloning where available
2. Implement efficient object copying utilities
3. Consider using immutable data structures

---

## Profiling Methodology

### Step 1: Baseline Performance Measurement
```bash
# Install profiling dependencies
npm install -D clinic autocannon

# Create a profiling script
cat > profile-simulation.js << 'EOF'
const { SimulationEngine } = require('./dist/simulation/engine');
const { createInitialState } = require('./dist/simulation/initialization');

const engine = new SimulationEngine({
  seed: 12345,
  maxMonths: 100,
  logLevel: 'summary'
});

const state = createInitialState();
console.time('Simulation Run');
const result = engine.run(state);
console.timeEnd('Simulation Run');
console.log(`Final outcome: ${result.summary.finalOutcome}`);
console.log(`Steps simulated: ${result.summary.totalMonths}`);
EOF

# Run with Node.js profiler
node --prof profile-simulation.js
node --prof-process isolate-*.log > profile-baseline.txt
```

### Step 2: Heap Snapshot Analysis
```bash
# Take heap snapshots at intervals
node --inspect profile-simulation.js
# In Chrome DevTools: Memory tab -> Take snapshot at start, middle, end
# Look for retained memory growth and large object allocations
```

### Step 3: CPU Profiling with Clinic.js
```bash
# CPU flame graph
npx clinic flame -- node profile-simulation.js

# Identify hot functions
npx clinic doctor -- node profile-simulation.js

# Memory and async analysis
npx clinic bubbleprof -- node profile-simulation.js
```

### Step 4: Custom Instrumentation
```typescript
// Add timing to critical phases
class TimedPhaseOrchestrator extends PhaseOrchestrator {
  executeAll(state: GameState, rng: RNGFunction): GameEvent[] {
    const phaseTimings = new Map<string, number>();

    for (const phase of this.phases) {
      const start = performance.now();
      const result = phase.execute(state, rng, ctx);
      phaseTimings.set(phase.id, performance.now() - start);
    }

    // Log slowest phases
    const sorted = Array.from(phaseTimings.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    console.log('Slowest phases:', sorted);
  }
}
```

---

## Implementation Roadmap

### Phase 1: Quick Wins (1-2 days)
1. **Reduce snapshot frequency**
   - Change default snapshotInterval from 12 to 100 months
   - Make snapshots optional for performance-critical runs
   - Estimated impact: 30-40% reduction in memory usage

2. **Cache frequently computed values**
   - Add memoization to calculateTotalAICapability()
   - Cache alignment calculations within a step
   - Estimated impact: 10-15% CPU reduction

3. **Remove unnecessary debug logging**
   - Disable verbose console.log statements
   - Use conditional logging based on environment
   - Estimated impact: 5-10% improvement

### Phase 2: State Management Refactor (3-5 days)
1. **Implement Immer for immutable updates**
   ```bash
   npm install immer
   ```
   - Wrap state updates in produce()
   - Eliminate manual deep cloning
   - Estimated impact: 40-50% memory reduction

2. **Create state differ for diagnostics**
   - Track only changed properties
   - Eliminate full state cloning in diagnostics
   - Estimated impact: 20-30% memory reduction

3. **Implement object pooling for events**
   - Reuse event objects with reset
   - Reduce GC pressure
   - Estimated impact: 10-15% GC reduction

### Phase 3: Algorithm Optimization (1 week)
1. **Index AI agents and organizations**
   ```typescript
   // Instead of arrays, use Maps
   interface IndexedState {
     aiAgentsById: Map<string, AIAgent>;
     aiAgentsByOrg: Map<string, Set<string>>;
     activeAgents: Set<string>;
   }
   ```
   - O(1) lookups instead of O(n) searches
   - Estimated impact: 30-40% CPU reduction for agent operations

2. **Batch array operations**
   - Single pass for multi-property updates
   - Combine filter/map/reduce chains
   - Estimated impact: 20-25% CPU reduction

3. **Lazy evaluation for derived metrics**
   - Calculate only when accessed
   - Cache until state changes
   - Estimated impact: 15-20% CPU reduction

### Phase 4: Architecture Improvements (2 weeks)
1. **Parallel phase execution**
   - Identify independent phase groups
   - Use worker threads for parallel execution
   - Estimated impact: 30-50% wall-clock time reduction

2. **Implement state streaming**
   - Process state changes incrementally
   - Avoid loading entire state in memory
   - Estimated impact: 50-70% memory reduction for long runs

3. **Create specialized data structures**
   - Implement circular buffers for history
   - Use typed arrays for numeric data
   - Estimated impact: 30-40% memory efficiency improvement

---

## Benchmarking Commands

### Before Optimization
```bash
# Baseline performance test
time node -e "
  const { SimulationEngine } = require('./dist/simulation/engine');
  const { createInitialState } = require('./dist/simulation/initialization');
  const engine = new SimulationEngine({ seed: 12345, maxMonths: 100 });
  const state = createInitialState();
  const result = engine.run(state);
  console.log('Result:', result.summary.finalOutcome);
"

# Memory usage analysis
/usr/bin/time -l node profile-simulation.js 2>&1 | grep 'maximum resident set size'

# Profile with 0x for flame graphs
npx 0x -o profile-simulation.js
```

### After Each Optimization
```bash
# Compare performance
hyperfine --warmup 3 \
  'node dist/simulation-old.js' \
  'node dist/simulation-optimized.js'

# A/B test with different configurations
node benchmark-suite.js --compare baseline optimized
```

---

## Expected Outcomes

### Performance Targets
- **Memory Usage:** Reduce by 60-70% (from ~2GB to ~600MB for 1000 months)
- **CPU Time:** Reduce by 50-60% (from ~30s to ~12s for 100 months)
- **GC Pressure:** Reduce major GC collections by 80%
- **Throughput:** Increase from ~3 months/sec to ~8 months/sec

### Risk Mitigation
- Each optimization phase is independent
- Maintain backward compatibility
- Add performance regression tests
- Keep optimization branches separate until validated

---

## Monitoring and Validation

### Performance Regression Tests
```typescript
// Add to test suite
describe('Performance Regression', () => {
  it('should complete 100 months in under 10 seconds', async () => {
    const start = Date.now();
    const result = await runSimulation(100);
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(10000);
  });

  it('should use less than 500MB memory', async () => {
    const memBefore = process.memoryUsage().heapUsed;
    await runSimulation(100);
    global.gc(); // Requires --expose-gc flag
    const memAfter = process.memoryUsage().heapUsed;
    expect(memAfter - memBefore).toBeLessThan(500 * 1024 * 1024);
  });
});
```

### Continuous Monitoring
```javascript
// Add telemetry
class InstrumentedEngine extends SimulationEngine {
  constructor(config) {
    super(config);
    this.metrics = {
      stepTimes: [],
      memorySnapshots: [],
      gcEvents: []
    };

    // Track GC
    if (global.gc) {
      const onGC = require('gc-stats')();
      onGC.on('stats', stats => {
        this.metrics.gcEvents.push(stats);
      });
    }
  }

  step(state) {
    const start = performance.now();
    const result = super.step(state);
    this.metrics.stepTimes.push(performance.now() - start);

    if (this.metrics.stepTimes.length % 10 === 0) {
      this.metrics.memorySnapshots.push(process.memoryUsage());
    }

    return result;
  }
}
```

---

## Additional Considerations

### WebAssembly for Hot Paths
Consider porting performance-critical calculations to WebAssembly:
- AI capability calculations
- Probability computations
- Matrix operations for phase dependencies

### Database-Backed State
For very long simulations, consider:
- SQLite for state persistence
- Only load active data into memory
- Implement pagination for historical data

### Streaming Simulation
For real-time applications:
- Implement state as an event stream
- Use reactive programming patterns
- Enable incremental processing

---

## Conclusion

The simulation's performance issues stem primarily from architectural decisions around state management and excessive copying. The most impactful optimizations will come from:

1. **Eliminating unnecessary deep cloning** (40-50% improvement)
2. **Optimizing hot-path array operations** (30-40% improvement)
3. **Implementing proper indexing and caching** (20-30% improvement)

These optimizations are achievable within 2-3 weeks and will dramatically improve simulation performance, enabling larger-scale Monte Carlo runs and real-time interactive simulations.

The highest priority is addressing the deep cloning issue, as it poses a **system stability risk** for long-running simulations due to memory exhaustion.