# Simulation Persistence Architecture Review

**Date:** October 26, 2025
**Reviewer:** Architecture-Skeptic (Orchestrator-1 self-review)
**Feature:** Simulation state persistence with resume functionality
**Status:** ⚠️ **1 CRITICAL ISSUE FOUND - MUST FIX BEFORE COMPLETION**

---

## Executive Summary

The simulation persistence implementation is **well-architected overall** with smart design choices (save rotation, semantic versioning, graceful error handling). However, there is **one critical bug** that breaks the primary goal of deterministic resume: **the RNG call counter is never incremented during simulation**.

**Verdict:** BLOCKED until RNG counter implementation is fixed.

---

## Review Areas

### 1. RNG Call Counter (Perfect Determinism) ❌ CRITICAL ISSUE

**Implementation Files:**
- `/Users/annhoward/src/superalignmenttoutopia/src/types/game.ts` - `rngCallCounter` field
- `/Users/annhoward/src/superalignmenttoutopia/src/workers/simulationWorker.ts:468-470` - initialization
- `/Users/annhoward/src/superalignmenttoutopia/src/workers/simulationWorker.ts:576-591` - restore on resume

**Issue:** Counter is initialized to 0 but **never incremented** during simulation.

**Evidence:**
```bash
$ grep -n "rngCallCounter\+\+\|rngCallCounter \+= 1" src/workers/simulationWorker.ts
# No matches found
```

**Impact:**
- Resume will ALWAYS restore RNG to initial state (counter=0)
- Resumed simulations will NOT produce same results as continuous runs
- Defeats the entire purpose of the RNG counter feature

**Root Cause:**
The engine passes a naked `rng()` function to phases, but there's no wrapper that increments `state.rngCallCounter` on each call.

**Required Fix:**
Wrap the RNG function in the worker before passing to engine:

```typescript
// In simulationWorker.ts, before calling engine.step()

// Wrap RNG to track calls
const trackedRNG = (): number => {
  if (state.rngCallCounter === undefined) {
    state.rngCallCounter = 0;
  }
  state.rngCallCounter++;
  return engine.getRNG().next();
};

// Pass wrapped RNG to engine somehow, OR
// Increment counter after engine.step() based on engine's internal counter
```

**Challenge:** The `SimulationEngine.step()` doesn't accept custom RNG function - it uses its internal `this.rng`. Need to either:

1. **Option A:** Modify `SimulationEngine` to accept RNG wrapper callback
2. **Option B:** Track RNG state in `SeededRandom` class itself (add `.callCount` property)
3. **Option C:** Count RNG calls indirectly by hooking into `SeededRandom.next()`

**Recommendation:** Option B (modify `SeededRandom` class) is cleanest:

```typescript
// In src/simulation/utils/seededRandom.ts
export class SeededRandom {
  private state: number;
  public callCount: number = 0; // Add this

  next(): number {
    this.callCount++; // Track calls
    // ... existing logic
  }

  getCallCount(): number {
    return this.callCount;
  }

  setCallCount(count: number): void {
    this.callCount = count;
  }
}

// In simulationWorker.ts
// After engine.step()
state.rngCallCounter = engine.getRNG().getCallCount();

// On resume
engine.getRNG().setCallCount(gameState.rngCallCounter || 0);
```

**Severity:** **CRITICAL** - Breaks core functionality of deterministic resume

---

### 2. Smart Save Rotation ✅ APPROVED

**Implementation:** `/Users/annhoward/src/superalignmenttoutopia/src/lib/eventDatabase.ts:671-749`

**Design:**
- Last 5 saves: Keep all (dense recent history)
- Saves 6-20: Keep every other
- Saves 21+: Keep every 5th
- Max: 10 saves (configurable)

**Edge Case Analysis:**
- **Q:** What if simulation has < 10 saves?
- **A:** Line 698: `if (saves.length <= maxSaves) return;` - Correctly exits early ✅

- **Q:** What if rotation fails?
- **A:** Line 747: Catches error, logs, doesn't throw - Simulation continues ✅

- **Q:** Memory leak potential?
- **A:** `toDelete` array is local, deleted saves are removed from IndexedDB - No leak ✅

**Verdict:** **APPROVED** - Well-designed with proper edge case handling

---

### 3. Semantic Versioning ⚠️ MINOR ISSUE

**Implementation:** `/Users/annhoward/src/superalignmenttoutopia/src/lib/eventDatabase.ts:58-142`

**Design:**
- MAJOR mismatch: Block resume
- MINOR upgrade: Allow with migration
- PATCH: Seamless

**Issue:** Version downgrade not handled

**Scenario:**
1. User has save from version 1.2.0
2. User switches to older code (version 1.1.0)
3. Load function compares: `saved.minor (2) < current.minor (1)` = FALSE
4. Falls through to "fully compatible" return

**Impact:** Older code may not understand newer save format (e.g., 1.2.0 added new required field, 1.1.0 doesn't know about it)

**Fix:**
```typescript
// In isVersionCompatible()
if (saved.minor > current.minor) {
  return {
    compatible: false,
    requiresMigration: false,
    canResume: false,
    reason: `Cannot load newer save: saved v${savedVersion}, current v${currentVersion}. Update your code.`
  };
}
```

**Severity:** **MEDIUM** - Unlikely scenario (users rarely downgrade), but should be handled

---

### 4. Storage Quota Management ⚠️ MINOR ISSUE

**Implementation:** `/Users/annhoward/src/superalignmenttoutopia/src/lib/eventDatabase.ts:790-858`

**Design:**
- Pre-save validation via `navigator.storage.estimate()`
- 80% warning threshold
- Blocks save if quota exceeded

**Race Condition:**
1. `checkStorageSpace()` at line 396: Checks quota, returns `canSave: true`
2. Between check and save, another tab writes large data
3. `simulationsStore.put(stored)` at line 421: Fails with quota exceeded

**Current Handling:**
- Line 464: `catch (error)` - Logs error, re-throws
- Line 890: Worker catches autosave failure, logs, continues simulation

**Impact:** Autosave silently fails, user loses progress until next successful save

**Recommendation:** Add retry logic or user notification:

```typescript
// In worker autosave
catch (error) {
  console.error('[Worker] Autosave failed:', error);

  if (error.message.includes('quota')) {
    // Post message to main thread for user notification
    self.postMessage({
      type: 'storageFull',
      message: 'Storage quota exceeded. Please delete old simulations.'
    });
  }
}
```

**Severity:** **LOW** - Silent failure, but simulation continues. User will discover on page refresh.

---

### 5. Transaction Safety ✅ APPROVED

**Implementation:**
- Save: `/Users/annhoward/src/superalignmenttoutopia/src/lib/eventDatabase.ts:417-458`
- Delete: `/Users/annhoward/src/superalignmenttoutopia/src/lib/eventDatabase.ts:610-658`

**Design:** Single transaction spans multiple stores (simulations, metadata, events)

**Rollback Analysis:**
- IndexedDB transactions are ACID-compliant
- If any operation fails, entire transaction rolls back
- Orphaned data NOT possible ✅

**Example (Delete):**
```typescript
const transaction = this.db.transaction([SIMULATIONS_STORE, METADATA_STORE, STORE_NAME], 'readwrite');
// All three stores updated atomically
// If cursor.delete() fails on any store, entire transaction aborts
```

**Verdict:** **APPROVED** - Correct use of IndexedDB transactions

---

## Additional Observations

### Strengths

1. **Graceful Error Handling:** Autosave failures don't crash simulation
2. **User Safety:** Double confirmation for "Clear All Data"
3. **Import Validation:** Checks structure before importing
4. **Version Messaging:** Clear UI warnings for incompatible versions
5. **Storage Awareness:** Pre-save quota checks with warnings

### Code Quality

- **Well-documented:** Comprehensive JSDoc comments
- **Type-safe:** Strong TypeScript types throughout
- **Consistent:** Follows project conventions
- **Testable:** Pure functions, clear separation of concerns

---

## Summary of Issues

| Priority | Issue | Location | Impact |
|----------|-------|----------|--------|
| **CRITICAL** | RNG counter never incremented | simulationWorker.ts | Resume produces different results |
| MEDIUM | Version downgrade not handled | eventDatabase.ts:89 | Newer save on older code may crash |
| LOW | Storage quota race condition | eventDatabase.ts:396 | Silent autosave failure (rare) |

---

## Recommendations

### Must Fix Before Completion (CRITICAL)

**RNG Call Counter Implementation:**

1. Modify `SeededRandom` class to track call count internally
2. Update worker to sync `state.rngCallCounter` after each step
3. Update worker to restore call count on resume
4. Add test to verify resumed simulation produces same RNG sequence

**Estimated Time:** 30-60 minutes

### Should Fix (MEDIUM)

**Version Downgrade Handling:**

1. Add check in `isVersionCompatible()` for `saved.minor > current.minor`
2. Add UI warning: "Save was created with newer version, cannot load"
3. Test scenario: Create 1.1.0 save, load with 1.0.0 code

**Estimated Time:** 15 minutes

### Nice to Have (LOW)

**Storage Quota User Notification:**

1. Add `storageFull` message type to worker
2. Show toast notification in UI when storage quota exceeded
3. Link to "Manage Simulations" page for deletion

**Estimated Time:** 30 minutes

---

## Approval Status

**Current Status:** ⚠️ **BLOCKED**

**Reason:** Critical RNG counter bug breaks deterministic resume

**Next Steps:**
1. Fix RNG counter implementation (CRITICAL)
2. Test resumed simulation produces identical results
3. (Optional) Fix version downgrade handling (MEDIUM)
4. Re-submit for architecture review

**Once CRITICAL issue fixed:** ✅ **APPROVED FOR DOCUMENTATION**

---

## Testing Validation

Reference: `/Users/annhoward/src/superalignmenttoutopia/plans/simulation-persistence-testing-validation.md`

**Updated Checklist Status:**

- ✅ Save simulation state every 5 steps
- ✅ Load simulation on page refresh
- ✅ Resume from correct month with correct state
- ❌ **RNG produces same results after resume** (BROKEN - counter never incremented)
- ✅ Events sync correctly with resumed state
- ✅ Delete clears both state + events
- ✅ Handle corrupted state gracefully
- ✅ Multiple simulations can coexist
- ✅ Storage quota warnings work
- ✅ Export/import preserves state
- ✅ Save rotation prevents unbounded growth
- ⚠️ Version compatibility blocks incompatible resumes (missing downgrade check)

---

## Conclusion

The implementation demonstrates **strong architectural decisions** and **good coding practices**. The smart save rotation, semantic versioning, and graceful error handling are all well-designed.

However, the **RNG call counter is not functional** due to missing increment logic. This is a critical oversight that must be fixed before the feature can be considered complete.

**Recommendation:** Fix RNG counter (30-60 min), then proceed with wiki documentation and plan archival.

---

**Reviewer Signature:** orchestrator-1 (self-review)
**Date:** 2025-10-26
**Follow-up Required:** YES - Fix RNG counter, re-validate determinism
