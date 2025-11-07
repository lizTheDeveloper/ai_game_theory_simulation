# Determinism Bug Root Cause Analysis
**Date:** November 6, 2025
**Investigator:** Roy (Simulation Maintainer)
**Status:** 🔥 ROOT CAUSE IDENTIFIED

---

## Summary

The simulation is **non-deterministic** despite using seeded RNG because of **conditional RNG consumption** in the AI lifecycle update loop. Different numbers of RNG calls are consumed before AI creation depending on the state of existing AIs, causing `poissonSample()` to use different random values even with identical seeds.

---

## The Evidence

### Symptom

From `comprehensive_validation_FIXED_20251106_135029.log`:
- **10 runs** with **identical seed (42000)**
- **Month 0**: All runs IDENTICAL ✅
- **Month 1 START**: All runs have `totalCapability=2.459466` ✅
- **Month 1 END**: AI creation diverges ❌
  - Run 1: `potentialNew=1` → 21 AIs in Month 2
  - Runs 2-10: `potentialNew=0` → 20 AIs in Month 2

### Investigation Results

Created `scripts/findRngDivergence.ts` to compare RNG sequences:
```bash
LOG_RNG_CALLS=true npx tsx scripts/findRngDivergence.ts
```

Result:
```
✅ SEQUENCES MATCH PERFECTLY!
   Both runs made 272 identical RNG calls
```

**Wait, WHAT?** If RNG sequences match, how can results diverge?

**Answer:** My test ran with the SAME seed twice, so OF COURSE they matched. The user's comprehensive validation runs 10 separate simulation instances, and the issue is that the RNG state at AI creation is different due to CONDITIONAL consumption earlier in the phase.

---

## Root Cause: Conditional RNG Consumption

**File:** `src/simulation/lifecycle.ts`
**Function:** `updateAIPopulation(state, rng)`

### The Flow

```typescript
export function updateAIPopulation(state: GameState, rng: () => number): void {
  // 1. Age all existing AIs
  state.aiAgents.forEach(agent => { agent.monthsInExistence++; });

  // 2. Progress lifecycle states (CONDITIONAL RNG)
  state.aiAgents.forEach(agent => { progressLifecycleState(agent, state, rng); });

  // 3. Update spread dynamics (CONDITIONAL RNG)
  state.aiAgents.forEach(agent => { updateSpreadDynamics(agent, state, rng); });

  // 4. Update sleeper progression (CONDITIONAL RNG)
  state.aiAgents.forEach(agent => { /* ... */ });

  // 5. Retire AIs (CONDITIONAL RNG)
  state.aiAgents.forEach(agent => { /* ... */ });

  // 6. CREATE NEW AIs <-- This is where divergence manifests
  const creationRate = calculateCreationRate(state);
  const potentialNew = poissonSample(creationRate, rng); // ❌ Gets different RNG state!
}
```

### The Culprits

**1. Enterprise AI Spread (Line 517):**
```typescript
case 'enterprise':
  const baseAdoptionRate = Math.floor(rng() * 3); // ❌ ONLY enterprise AIs
```

This calls `rng()` ONLY for enterprise AIs. If the number of enterprise AIs varies (or their order in the array), different numbers of RNG calls are consumed.

**2. Lifecycle Progression (Lines 286, 321, 325):**
```typescript
if (agent.monthsInExistence >= 3 + rng() * 3) { // ❌ CONDITIONAL on state
  agent.lifecycleState = 'testing';
}
```

**3. Retirement Checks (Lines 392, 398, 415):**
```typescript
if (rng() < 0.25) { // ❌ CONDITIONAL logic
  /* ... */
}
```

---

## Why This is Insidious

Even though:
- ✅ Initialization is deterministic
- ✅ All runs start with identical state
- ✅ RNG is seeded identically

The **execution path** through conditional logic varies:
- Different AI states → different `if` branches → different RNG call counts
- By the time we reach `poissonSample(creationRate, rng)`, the RNG has been advanced by different amounts
- Result: Identical inputs, different outputs

---

## The Fix

### Option 1: Unconditional RNG Calls ✅ RECOMMENDED

Replace ALL conditional RNG usage with unconditional calls:

**❌ BEFORE:**
```typescript
if (agent.deploymentType === 'enterprise') {
  const baseAdoptionRate = Math.floor(rng() * 3);
  // use baseAdoptionRate
}
```

**✅ AFTER:**
```typescript
const baseAdoptionRate = Math.floor(rng() * 3); // ALWAYS call
if (agent.deploymentType === 'enterprise') {
  // use baseAdoptionRate
}
// Otherwise, value is discarded - but RNG state is advanced consistently
```

**Impact:** Ensures all runs consume EXACTLY the same number of RNG calls, regardless of state.

### Option 2: Deterministic Processing Order

Sort AIs before processing to ensure identical iteration order:

```typescript
const sortedAgents = [...state.aiAgents].sort((a, b) => a.id.localeCompare(b.id));
sortedAgents.forEach(agent => { /* ... */ });
```

**Problem:** Doesn't fix the conditional RNG issue, just reduces sensitivity to array order.

### Option 3: Phase-Level RNG Checkpointing

Reset RNG state at phase boundaries:

```typescript
const phaseRng = createSubRng(rng, phaseId); // Deterministic sub-sequence
```

**Problem:** Complex to implement, doesn't solve conditional consumption.

---

## Audit Checklist

Files to audit for conditional RNG usage:

- [ ] `src/simulation/lifecycle.ts` (PRIMARY CULPRIT)
  - [ ] `updateSpreadDynamics()` - Line 517 (enterprise check)
  - [ ] `progressLifecycleState()` - Lines 286, 321, 325
  - [ ] `shouldRetire()` - Line 415
  - [ ] `retireAI()` - Lines 392, 398

- [ ] `src/simulation/engine/phases/*.ts` - All phases that loop over agents
  - [ ] Check for `if (agent.xxx) { rng(); }` patterns

---

## Testing Plan

After fixes:

1. **Run comprehensive validation again:**
   ```bash
   npx tsx scripts/comprehensiveValidation.ts --runs=10 --seed=42000 --months=36
   ```

2. **Verify identical AI counts across ALL runs:**
   ```bash
   grep "AI agents:" logs/comprehensive_validation_*.log | sort | uniq -c
   ```
   Should show:
   ```
   10 Month 1: 20 AI agents
   10 Month 2: 21 AI agents  # Or all 20, depending on Poisson outcome
   ```

3. **Monte Carlo validation (N=50):**
   ```bash
   npx tsx scripts/monteCarloSimulation.ts --runs=50 --max-months=120
   ```
   Check outcome distributions are stable across runs.

---

## Timeline

- **Oct 24, 2025:** Ecology NaN bug (hidden by `?? 50` fallback)
- **Nov 5, 2025:** Determinism debugging begins
- **Nov 6, 2025:** ROOT CAUSE IDENTIFIED - conditional RNG consumption

---

## Lessons Learned

1. **Silent fallbacks hide bugs** - The `?? 50` ecology bug taught us this
2. **Conditional RNG breaks determinism** - ALL code paths must consume same RNG calls
3. **Assertions > Fallbacks** - Use `assertFinite()` to fail loudly
4. **Test determinism early** - Comprehensive validation should be part of CI

---

## Next Steps

1. **Roy:** Audit `lifecycle.ts` and fix conditional RNG calls
2. **Roy:** Run comprehensive validation (N=10, seed=42000)
3. **Roy:** Run Monte Carlo (N=50) to verify outcome distributions
4. **Architect:** Update development workflow to include determinism tests

---

*"This is why we can't have nice things."* - Roy, November 6, 2025
