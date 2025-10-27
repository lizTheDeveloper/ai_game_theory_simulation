# Architectural Review: Simulation State Persistence Plan

**Date:** October 26, 2025
**Reviewer:** Architecture Skeptic
**Subject:** Proposed Simulation State Persistence Architecture

## Executive Summary

After reviewing the proposed persistence plan for simulation state, I've identified **5 CRITICAL issues**, **6 HIGH priority concerns**, and **4 MEDIUM priority items that could significantly impact system stability and performance**.

**Overall Assessment: APPROVE WITH MAJOR CHANGES REQUIRED**

The core concept is sound, but the current implementation approach has serious flaws that will cause performance degradation, memory exhaustion, and data corruption issues. Most critically, the deep cloning strategy and autosave frequency will create a death spiral of memory usage and GC pressure.

---

## CRITICAL ISSUES (Immediate attention required - system stability at risk)

### 1. Deep Clone Memory Exhaustion Death Spiral

**Problem:** Deep cloning 3.2MB GameState every 5 steps at simulation speed will cause catastrophic memory exhaustion.

**Why it matters:**
- At 1x speed: 30 steps/second = 6 deep clones/second = 19.2MB/s of allocations
- At max speed: Could hit 100+ MB/s of allocations
- JavaScript GC cannot keep up, causing:
  - Major GC pauses (100-500ms freezes)
  - Memory exhaustion after 10-20 minutes
  - Browser tab crash

**Evidence:** The codebase already has performance issues documented in `plans/performance-optimization-plan.md` showing deep cloning causes memory exhaustion after 500-1000 months.

**Recommended fix:**
```typescript
// DON'T do this:
const stateToSave = JSON.parse(JSON.stringify(currentState)); // 3.2MB allocation!

// DO this instead - use structured cloning:
const stateToSave = structuredClone(currentState); // More efficient

// OR BETTER - use Immer for immutable updates:
import { produce } from 'immer';
const stateToSave = produce(currentState, draft => {
  // Mark as saved without deep clone
  draft._lastSavedMonth = draft.currentMonth;
});
```

### 2. Worker Thread Blocking During Saves

**Problem:** Saving 3.2MB to IndexedDB from the worker thread will block simulation steps.

**Why it matters:**
- IndexedDB write of 3.2MB takes 50-200ms
- Worker is single-threaded - can't simulate during save
- Simulation will stutter/freeze every 5 steps
- At max speed, could spend 50% of time saving instead of simulating

**Recommended fix:**
```typescript
// Create a dedicated persistence worker
// simulationWorker.ts sends state snapshots to persistenceWorker.ts
// This allows simulation to continue while saves happen async

// In simulationWorker.ts:
if (shouldSave) {
  persistencePort.postMessage({
    type: 'save',
    state: state, // Transfer, don't clone
    simulationId: currentSimulationId
  }, [state.buffer]); // Transfer ownership if using ArrayBuffer
}
```

### 3. RNG State Corruption on Resume

**Problem:** RNG reconstruction by "skipping forward" is fundamentally broken.

**Why it matters:**
- RNG internal state is not just a counter
- Skipping N steps doesn't recreate the exact state
- Simulation becomes non-deterministic after resume
- Research results become unreliable

**Example of the bug:**
```typescript
// BROKEN approach in the plan:
rng = seedRandom(`${state.seed}`);
for (let i = 0; i < state.currentMonth; i++) {
  rng(); // This doesn't recreate the exact RNG state!
}

// Events in month 30 first run != Events in month 30 after resume
```

**Recommended fix:**
```typescript
// Store RNG state explicitly
interface GameState {
  rngState: {
    seed: number;
    counter: number; // How many times rng() was called
    internalState?: any; // Library-specific state if available
  };
}

// On resume:
rng = seedRandom(`${state.seed}`);
// Skip to exact position
for (let i = 0; i < state.rngState.counter; i++) {
  rng();
}
```

### 4. Version Compatibility Check Too Aggressive

**Problem:** Using git commit hash for compatibility check will invalidate ALL saves on every commit.

**Why it matters:**
- Any typo fix = all saved simulations become unloadable
- Documentation change = can't resume simulations
- CSS tweak = simulations marked incompatible
- Users lose hours of simulation progress unnecessarily

**Recommended fix:**
```typescript
// Use semantic versioning for state schema
const STATE_SCHEMA_VERSION = '1.0.0'; // Only bump for breaking changes

// Define what constitutes a breaking change:
interface CompatibilityCheck {
  schemaVersion: string;        // State structure changes
  engineVersion: string;         // Simulation logic changes
  gitCommit: string;            // For reference only
  compatibleEngineVersions: string[]; // List of compatible versions
}

// Most commits don't change simulation logic
// Only mark incompatible if engineVersion changed
```

### 5. Race Condition: Autosave vs Manual Actions

**Problem:** No synchronization between autosave and user actions (pause, parameter changes, delete).

**Why it matters:**
- User deletes simulation while autosave is writing = corrupted state
- User pauses but autosave continues = saves wrong state
- Parameter change during save = partial state corruption

**Scenario:**
```
T+0ms: User clicks delete
T+1ms: Autosave starts (50ms operation)
T+5ms: Delete removes IndexedDB record
T+50ms: Autosave completes, recreates deleted record
Result: "Deleted" simulation reappears
```

**Recommended fix:**
```typescript
class SaveQueue {
  private saveInProgress = false;
  private pendingSave: GameState | null = null;
  private deleted = false;

  async requestSave(state: GameState) {
    if (this.deleted) return;

    if (this.saveInProgress) {
      this.pendingSave = state; // Queue it
      return;
    }

    this.saveInProgress = true;
    await this.performSave(state);
    this.saveInProgress = false;

    // Process queued save if any
    if (this.pendingSave) {
      const pending = this.pendingSave;
      this.pendingSave = null;
      await this.requestSave(pending);
    }
  }

  markDeleted() {
    this.deleted = true;
    this.pendingSave = null;
  }
}
```

---

## HIGH PRIORITY ISSUES (Significant performance/maintainability concerns)

### 1. Storage Quota Exhaustion Handling

**Problem:** Plan mentions quota warnings but no strategy for when quota is exceeded.

**Impact:**
- 50-100MB fills up fast with 10+ simulations
- Save silently fails when quota exceeded
- User loses progress with no warning

**Recommendation:**
- Implement LRU cache - auto-delete oldest simulations
- Prompt user before auto-deletion
- Offer "export old simulations" before deletion

### 2. Debounce Strategy Creates Data Loss Window

**Problem:** Saving every 5 steps means potential loss of 4 steps on crash.

**Impact:**
- At 30 steps/second, that's 133ms of lost simulation
- But some phases take multiple seconds to compute
- Could lose expensive computation results

**Recommendation:**
- Save after expensive operations complete
- Save on pause/speed change
- Use write-ahead log pattern for critical events

### 3. No Compression Strategy

**Problem:** Storing raw 3.2MB JSON without compression.

**Impact:**
- 10 simulations = 32MB (large but manageable)
- 100 simulations = 320MB (quota exceeded)
- Network transfer for export/import is slow

**Recommendation:**
```typescript
import LZString from 'lz-string';

async function saveCompressed(state: GameState) {
  const json = JSON.stringify(state);
  const compressed = LZString.compressToUTF16(json); // ~60% reduction
  await db.put({ compressed, isCompressed: true });
}
```

### 4. State Migration Complexity Underestimated

**Problem:** Plan has 20 lines for migrations but GameState has 100+ nested fields.

**Impact:**
- Every state structure change needs migration code
- Nested objects make migrations complex
- No rollback strategy if migration fails

**Recommendation:**
- Use migration library (e.g., Dexie's migration system)
- Test migrations with real saved states
- Keep old field names as aliases during deprecation period

### 5. Memory Leak: Retained State References

**Problem:** Plan keeps references to old state during save operations.

**Impact:**
- Multiple 3.2MB states in memory simultaneously
- GC can't collect until save completes
- Memory usage balloons during rapid saves

**Recommendation:**
- Use transferable objects where possible
- Null out references after queuing save
- Monitor memory usage and throttle saves if high

### 6. No Partial State Updates

**Problem:** Saving entire 3.2MB state even when only currentMonth changed.

**Impact:**
- Wasteful I/O for tiny changes
- Unnecessary IndexedDB write amplification
- Slower than necessary

**Recommendation:**
```typescript
// Track what changed since last save
interface StateDiff {
  changedPaths: Set<string>;
  patches: Array<{ path: string; value: any }>;
}

// Save only differences when possible
if (diff.patches.length < 100) {
  await savePatches(simulationId, diff.patches);
} else {
  await saveFullState(simulationId, state);
}
```

---

## MEDIUM PRIORITY ISSUES (Technical debt worth addressing)

### 1. No Concurrent Simulation Handling

**Problem:** Multiple tabs/windows could load same simulation.

**Impact:**
- State divergence between tabs
- Autosave conflicts
- Confused users

**Recommendation:**
- Use BroadcastChannel API to coordinate
- Implement "simulation lock" pattern
- Show "opened in another tab" warning

### 2. Event Log Duplication

**Problem:** Events stored in both GameState and separate IndexedDB store.

**Impact:**
- Doubling storage requirements
- Synchronization complexity
- Potential for inconsistencies

**Recommendation:**
- Store events separately, reference by ID in GameState
- Lazy-load events when needed
- Use single source of truth

### 3. No Recovery from Corrupted State

**Problem:** Plan deletes corrupted state with no recovery attempt.

**Impact:**
- Users lose hours of work
- No debugging ability
- Silent failures

**Recommendation:**
```typescript
async function loadWithRecovery(id: string) {
  try {
    return await loadSimulation(id);
  } catch (error) {
    // Attempt recovery
    const raw = await loadRawData(id);
    const recovered = attemptAutoRepair(raw);
    if (recovered) {
      console.warn('State repaired, some data may be lost');
      return recovered;
    }

    // Offer manual recovery
    await storeCorrupted(id, raw);
    throw new RecoverableError('State corrupted but saved for debugging');
  }
}
```

### 4. IndexedDB Transaction Overhead

**Problem:** Opening new transaction for each save.

**Impact:**
- Transaction overhead (5-10ms per save)
- Can't batch multiple operations
- Slower than necessary

**Recommendation:**
- Batch saves in single transaction when possible
- Keep transaction open during burst saves
- Use cursor-based updates for better performance

---

## LOW PRIORITY ISSUES (Future improvements)

### 1. No Telemetry on Storage Performance

**Problem:** No monitoring of save/load performance.

**Impact:** Can't identify bottlenecks in production.

**Recommendation:** Add performance marks and analytics.

### 2. Missing Differential Sync for Multiplayer

**Problem:** Full state export/import for sharing.

**Impact:** Inefficient for collaborative analysis.

**Recommendation:** Consider CRDT or operational transform approach.

### 3. No Archival Strategy

**Problem:** Old simulations stay forever.

**Impact:** Storage grows unbounded.

**Recommendation:** Auto-archive simulations older than 30 days.

### 4. Browser-Specific Storage Limits

**Problem:** Different browsers have different quotas.

**Impact:** Inconsistent behavior across browsers.

**Recommendation:** Detect and adapt to browser-specific limits.

---

## Performance Analysis

### Current Plan's Performance Profile

**Memory Usage:**
- Per save: 3.2MB (state) + 3.2MB (clone) = 6.4MB spike
- At 6 saves/second: 38.4MB/s allocation rate
- GC pressure: CRITICAL
- Expected outcome: Tab crash within 10-30 minutes

**CPU Usage:**
- JSON.stringify/parse of 3.2MB: 20-50ms
- At 6 saves/second: 120-300ms/s CPU (12-30% overhead)
- Expected outcome: Simulation slowdown, stuttering

**I/O Performance:**
- IndexedDB write: 50-200ms per 3.2MB
- Queue depth at max speed: Could back up 5-10 saves
- Expected outcome: Increasing lag over time

### Recommended Architecture Performance

**With proposed changes:**
- Memory: 3.2MB working set + 500KB compressed saves
- CPU: <5% overhead with compression + batching
- I/O: 10-20ms amortized per save with batching

---

## RECOMMENDATION: APPROVE WITH MAJOR CHANGES

The persistence feature is **essential and well-motivated**, but the current implementation plan has **critical flaws that will cause system instability**.

### Required Changes Before Implementation

1. **MUST FIX:** Replace deep cloning with structured clone or immutable updates
2. **MUST FIX:** Move saves to separate worker to prevent blocking
3. **MUST FIX:** Store RNG state properly for deterministic resume
4. **MUST FIX:** Use schema versioning instead of git commits
5. **MUST FIX:** Implement save queue to prevent race conditions
6. **SHOULD FIX:** Add compression (60% size reduction)
7. **SHOULD FIX:** Implement proper quota management
8. **SHOULD FIX:** Add state recovery mechanisms

### Alternative Architecture Suggestion

Consider a **write-ahead log (WAL) pattern** instead of full snapshots:

```typescript
// Log commands instead of states
interface SimulationLog {
  initialState: GameState;        // One full snapshot
  commands: Array<{
    month: number;
    type: 'step' | 'decision' | 'parameter';
    data: any;
    rngState: number;
  }>;
}

// Replay commands to rebuild state
// Much smaller storage (KB instead of MB)
// Perfect determinism guaranteed
```

### Risk Assessment After Changes

- **Current Plan Risk:** CRITICAL (will crash browser)
- **With Required Changes:** LOW (stable and performant)
- **With WAL Pattern:** VERY LOW (minimal overhead)

### Timeline Impact

- Current estimate: 11-16 hours
- With required changes: 20-25 hours
- Additional testing: 5-8 hours
- Total realistic estimate: 25-33 hours

---

## Conclusion

The state persistence feature is **architecturally sound in concept** but **critically flawed in implementation details**. The deep cloning strategy alone will cause browser crashes, making the feature worse than useless—it will actively harm the user experience.

However, with the recommended changes, this becomes a valuable and stable feature. The core IndexedDB approach is correct; the issues are in the synchronization, serialization, and save frequency strategies.

**DO NOT IMPLEMENT AS CURRENTLY SPECIFIED.** Address the critical issues first, or users will experience data loss, crashes, and corrupted simulations. The feature needs approximately 2x the estimated time to implement correctly with proper error handling and performance optimization.

The good news: these are all solvable problems with well-known solutions. The architecture isn't fundamentally broken, just the implementation approach needs refinement.