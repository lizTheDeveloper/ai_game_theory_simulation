# FIX #14 Workaround Solution (Oct 21, 2025 - 11:50pm PT)

**Status:** WORKAROUND IDENTIFIED - Bypass techTreeState persistence issue
**Timeline:** 30 minutes to implement + test

---

## TL;DR

**Problem:** Deployment levels calculated correctly (17.7%, 25.7%, etc.) but reset to 0% between months.

**Root Cause:** Unknown - something resets `deployment.deploymentLevel` between monthly `updateTechTree()` calls, even though the object pointer stays the same.

**Workaround:** Store deployment levels in **`GameState`** instead of `techTreeState` - guaranteed to persist since it's the primary mutable object.

---

## Why This Works

**GameState is the source of truth:**
- Passed directly to all phases: `orchestrator.executeAll(state, rng)`
- Not cloned: `let newState = state` (comment says shallow copy breaks Set/Map)
- All other state properties persist correctly (AI agents, government, environment, etc.)

**techTreeState is optional:**
- Defined as `techTreeState?: TechTreeState` in game.ts (optional field)
- Stored as `(state as any).techTreeState` (type-casted)
- May have serialization/persistence issues due to being optional

---

## Implementation Plan

### Step 1: Add deployment tracking to GameState

```typescript
// In src/types/game.ts
export interface GameState {
  // ... existing fields ...

  // NEW: Track deployment progress separately from techTreeState
  // Key: `${region}_${techId}`, Value: deployment level (0-1)
  deploymentLevels?: Map<string, number>;
}
```

### Step 2: Initialize in TechTreePhase

```typescript
// In src/simulation/engine/phases/TechTreePhase.ts
execute(state: GameState, ...): PhaseResult {
  // Initialize deployment tracking
  if (!state.deploymentLevels) {
    state.deploymentLevels = new Map();
  }

  const techTreeState: TechTreeState = (state as any).techTreeState;
  // ... rest of phase ...
}
```

### Step 3: Update deploymentTimescales.ts

**Read from GameState:**
```typescript
// BEFORE deployment update
const key = `${region}_${deployment.techId}`;
deployment.deploymentLevel = state.deploymentLevels?.get(key) || 0;
```

**Write to GameState:**
```typescript
// AFTER deployment update
deployment.deploymentLevel = Math.min(1.0, actualDeploymentLevel);
state.deploymentLevels!.set(key, deployment.deploymentLevel);
```

### Step 4: Sync on initialization

```typescript
// In engine.ts initializeTechTreeState()
// For TIER 0 technologies with initial deployment
state.deploymentLevels!.set(`global_${tech.id}`, tech.deploymentLevel);
```

---

## Alternative: Deep Clone Fix

**IF we wanted to fix the root cause instead:**

Find where deployment objects are being reset and fix it. But after 2 hours of debugging:
- Deployment objects are the SAME object (pointer check confirms)
- Values are explicitly set to 0 somewhere between months
- No obvious code path found (old tech system commented out, no explicit resets)

**Time cost:** 2-4 more hours to find exact reset location
**Risk:** May be deep architectural issue (state serialization, hidden cloning, etc.)

---

## Testing Plan

1. Implement workaround (30 min)
2. Run N=1, 72mo test with debug logging (~5 min)
3. Verify deployment levels persist between months
4. Run N=10, 120mo validation (~10 min)
5. Check ecology score improves from 0.4/100 baseline
6. If successful: Run full N=20, 240mo validation

---

## Expected Results (If Workaround Succeeds)

**Technologies deploy correctly:**
- Month 24: Scalable Oversight 17.7% ✅
- Month 48: Scalable Oversight 25.7% ✅ (not 0%!)
- Month 120: DAC 35.4%, TIER 1 64.6%
- Month 240: DAC 85.8%, TIER 1 98%, TIER 2 85-90%

**Ecological recovery:**
- Median ecology: 20-40/100 (stabilized, not dystopia)
- 40-50% of runs achieve stabilized outcome
- Boundaries start recovering after 150-200 months
- Dystopia rate: 30-50% (vs 95% current)

---

## Pros & Cons

### Workaround Approach

**Pros:**
- ✅ Fast (30 min implementation)
- ✅ Low risk (GameState persistence proven)
- ✅ Minimal code changes (~20 lines)
- ✅ Unblocks FIX #14 completion tonight

**Cons:**
- ❌ Doesn't fix root cause
- ❌ Duplicates state (techTreeState.deploymentLevel + GameState.deploymentLevels)
- ❌ Technical debt (two sources of truth)

### Root Cause Fix Approach

**Pros:**
- ✅ Fixes underlying issue
- ✅ Clean architecture
- ✅ No duplicate state

**Cons:**
- ❌ 2-4+ hours debugging
- ❌ May be deep architectural problem
- ❌ Risk of breaking other systems
- ❌ Blocks FIX #14 completion

---

## Recommendation

**IMPLEMENT WORKAROUND NOW:**

1. Get FIX #14 working tonight (30 min fix + 30 min validation)
2. Complete 240-month validation
3. Publish results
4. **Later:** File bug report for proper fix (when we have more time)

**Why:**
- FIX #14 has already taken 10+ hours (planned 17-24)
- Root cause debugging: additional 2-4 hours minimum
- User expectation: "Finish the number 14 full implementation" - delivery matters
- Workaround is safe and reversible

---

## Next Steps (If Approved)

1. **Implement workaround** (~30 min)
   - Add `deploymentLevels` to GameState type
   - Initialize Map in TechTreePhase
   - Update read/write in deploymentTimescales.ts
   - Sync TIER 0 initial levels

2. **Test** (~10 min)
   - Run N=1, 72mo with debug logging
   - Verify persistence

3. **Validate** (~20 min)
   - Run N=10, 120mo
   - Check ecology score improvement

4. **Full validation** (~30 min)
   - Run N=20, 240mo
   - Analyze results vs FIX #14 predictions

**Total time:** ~90 minutes to confirmed working solution

---

**Status:** WAITING FOR USER APPROVAL
**Question:** Implement workaround now, or continue debugging root cause?
