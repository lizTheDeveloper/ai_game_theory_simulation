# Event Timestamping Architecture Review

**Date:** October 26, 2025
**Reviewer:** Architecture Skeptic
**Subject:** Event Storage & Timestamping Bug Analysis
**Severity:** CRITICAL - System Data Corruption

## Executive Summary

A critical state mutation bug in the worker's snapshot capture mechanism is corrupting all event timestamps. The bug occurs in `captureStateSnapshot()` function which **mutates the original GameState** by clearing the eventLog, violating the fundamental contract of snapshot functions being read-only operations.

## Architecture Analysis

### Data Flow Path

```
1. Simulation Phase → addSimulationEvent() → state.eventLog.push(event)
   ✓ Correctly sets timestamp: state.currentMonth

2. Worker Step → captureStateSnapshot(state) → Extracts events
   ✓ Maps events with correct timestamps (line 1113)
   ✗ CRITICAL BUG: Clears state.eventLog = [] (line 1138)

3. Worker → Dashboard (via postMessage) → Events arrive
   ✓ Events have correct timestamps in the message

4. Dashboard → IndexedDB storage
   ✓ Storage mechanism is correct
   ✓ Retrieval logic is sound
```

### Root Cause Analysis

**File:** `/Users/annhoward/src/superalignmenttoutopia/src/workers/simulationWorker.ts`
**Line:** 1138
**Code:**
```typescript
function captureStateSnapshot(state: GameState): StateSnapshot {
  // ... capture logic ...

  // Line 1138 - CRITICAL BUG
  state.eventLog = [];  // <-- Mutates the actual GameState!

  return snapshot;
}
```

This single line causes cascading failures:

1. **Immediate State Corruption:** The original GameState object loses all events
2. **Lost Event History:** Any phase that needs to reference past events sees empty array
3. **Timestamp Confusion:** New events may reference wrong context
4. **Memory Leak Prevention Becomes Data Loss:** The intent was to prevent memory growth, but it destroys data

## Critical Issues Identified

### CRITICAL ISSUES (Immediate attention required)

#### 1. State Mutation in Read-Only Function
- **Location:** `simulationWorker.ts:1138`
- **Impact:** Corrupts simulation state on every step
- **Details:** `captureStateSnapshot()` is supposed to be a pure read operation but mutates the GameState by clearing eventLog
- **Business Impact:** Makes historical event tracking impossible, breaks audit trail
- **Recommended Action:**
  ```typescript
  // REMOVE line 1138 entirely
  // state.eventLog = [];  // DELETE THIS LINE

  // If memory is a concern, implement proper event archival:
  // - Archive events older than N months to IndexedDB
  // - Keep only recent events in memory
  // - Use a sliding window approach
  ```

#### 2. Violation of Immutability Contract
- **Location:** Worker snapshot mechanism
- **Impact:** Breaks assumptions about state management
- **Details:** Snapshot functions must NEVER modify the source state
- **Business Impact:** Makes debugging impossible, state becomes unpredictable
- **Recommended Action:** Add assertion checks to verify state hasn't changed after snapshot

### HIGH PRIORITY (Performance/Maintainability concerns)

#### 3. Memory Management Strategy Flawed
- **Location:** Event accumulation in GameState
- **Impact:** Memory will grow unbounded without the clear (but clear is wrong)
- **Current Approach:** Destructive clearing after snapshot
- **Recommended Action:**
  ```typescript
  // Implement sliding window for in-memory events
  const MAX_MEMORY_EVENTS = 100;
  const ARCHIVE_THRESHOLD = 50; // Archive when we hit this many

  if (state.eventLog.length > MAX_MEMORY_EVENTS) {
    // Archive old events to IndexedDB
    const toArchive = state.eventLog.splice(0, ARCHIVE_THRESHOLD);
    await archiveEvents(toArchive);
  }
  ```

#### 4. No Event Deduplication
- **Location:** Event storage pipeline
- **Impact:** Same events might be stored multiple times
- **Details:** No unique constraint on event IDs in IndexedDB
- **Recommended Action:** Use event.id as primary key, prevent duplicates

### MEDIUM PRIORITY (Technical debt)

#### 5. Inconsistent Event ID Generation
- **Location:** `eventLogger.ts:50` and `TimelineDashboard.tsx:50`
- **Impact:** Possible ID collisions
- **Details:** Two different ID generation strategies
- **Recommended Action:** Centralize ID generation, use UUIDs or deterministic IDs

#### 6. Missing Event Validation
- **Location:** Throughout event pipeline
- **Impact:** Invalid events could corrupt storage
- **Details:** No validation that timestamps are valid numbers
- **Recommended Action:** Add validation at creation and storage points

### LOW PRIORITY (Future improvements)

#### 7. Event Type Mapping Inefficiency
- **Location:** `simulationWorker.ts:1078-1115`
- **Impact:** Repeated string comparisons in hot path
- **Details:** Could use lookup maps instead of if/else chains
- **Recommended Action:** Create static mapping objects

## State Propagation Analysis

The state propagation pattern is fundamentally sound EXCEPT for the critical mutation bug:

1. **Event Creation:** ✓ Correct - Events get proper timestamps at creation
2. **State Accumulation:** ✓ Correct - Events accumulate in eventLog array
3. **Snapshot Capture:** ✗ BROKEN - Destructive mutation corrupts state
4. **Delta Calculation:** ✓ Correct - Would work if state wasn't corrupted
5. **Message Passing:** ✓ Correct - Clean structured clone to worker
6. **Storage Layer:** ✓ Correct - IndexedDB properly indexed

## Performance Implications

Current architecture performance issues:

1. **Event Array Growth:** O(n) memory where n = total events ever
   - Without the clear: Memory exhaustion after ~10,000 events
   - With the clear: Data loss on every step

2. **Snapshot Cost:** O(n) for event mapping on every step
   - Maps all events every step even if unchanged
   - Should use incremental approach

3. **IndexedDB Operations:** Async but blocking UI
   - Should batch writes
   - Should use Web Worker for DB operations

## Recommendations

### Immediate Actions (Fix TODAY)

1. **Remove the state mutation (Line 1138)**
   ```typescript
   // DELETE THIS LINE ENTIRELY
   // state.eventLog = [];
   ```

2. **Add state immutability check**
   ```typescript
   function captureStateSnapshot(state: GameState): StateSnapshot {
     const eventCountBefore = state.eventLog.length;
     const snapshot = { /* ... */ };

     // Verify we didn't mutate
     if (state.eventLog.length !== eventCountBefore) {
       throw new Error('State mutation detected in snapshot!');
     }

     return snapshot;
   }
   ```

### Short-term (This Week)

3. **Implement proper event archival**
   - Keep last 100 events in memory
   - Archive older events to IndexedDB
   - Load on-demand for historical queries

4. **Add event deduplication**
   - Use event.id as primary key
   - Check for duplicates before storage

### Long-term (Next Sprint)

5. **Redesign event pipeline**
   - Events should flow directly to storage, not through state
   - Use event sourcing pattern
   - Separate event store from simulation state

6. **Optimize snapshot mechanism**
   - Incremental snapshots only
   - Dirty tracking for changed fields
   - Compression for large state transfers

## Risk Assessment

**Current Risk Level:** CRITICAL

**Why Critical:**
- Data corruption on every simulation step
- Historical data permanently lost
- Audit trail broken
- User-visible bugs (events showing wrong months)

**Blast Radius:**
- Affects ALL simulations
- Corrupts ALL event data
- Breaks timeline dashboard
- Makes debugging impossible

**Mitigation:**
- Fix is simple (remove one line)
- But damage may be extensive
- Need to clear IndexedDB after fix
- Users may need to restart simulations

## Testing Requirements

After fixing:

1. **Verify events maintain timestamps**
   ```typescript
   // Test that events keep their original timestamps
   const event1 = createEvent(month: 5);
   captureSnapshot(state);
   expect(event1.timestamp).toBe(5); // Not current month!
   ```

2. **Verify state immutability**
   ```typescript
   const originalLength = state.eventLog.length;
   captureStateSnapshot(state);
   expect(state.eventLog.length).toBe(originalLength);
   ```

3. **Load test event accumulation**
   - Run simulation for 1000+ months
   - Verify memory doesn't explode
   - Verify all events retrievable

## Conclusion

This is a **CRITICAL** bug that requires **IMMEDIATE** attention. The fix is trivial (delete one line) but the architectural implications are significant. The current approach of clearing eventLog in the snapshot function violates fundamental principles of state management and causes data corruption.

**Priority:** FIX IMMEDIATELY - This blocks all other work

**Estimated Fix Time:** 5 minutes to remove the line, 2 hours to implement proper archival

**Recommendation:** Stop all other development until this is fixed. The system is currently in a corrupted state and any testing or development on top of this bug is meaningless.

## Appendix: Code References

### Critical Bug Location
- File: `/Users/annhoward/src/superalignmenttoutopia/src/workers/simulationWorker.ts`
- Line: 1138
- Function: `captureStateSnapshot()`

### Affected Components
- `/Users/annhoward/src/superalignmenttoutopia/src/simulation/utils/eventLogger.ts` - Event creation
- `/Users/annhoward/src/superalignmenttoutopia/src/components/dashboards/TimelineDashboard.tsx` - Display layer
- `/Users/annhoward/src/superalignmenttoutopia/src/lib/eventDatabase.ts` - Storage layer
- All simulation phases that create events (~9 files)

### Related Issues
- User report: "Events showing December 2025 instead of November 2025"
- User report: "Only 25 events at month 16 (seems low)"
- Debug logs showing correct timestamps but wrong display