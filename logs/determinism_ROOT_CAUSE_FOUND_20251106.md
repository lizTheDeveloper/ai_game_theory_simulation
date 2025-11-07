# ✅ DETERMINISM BUG - ROOT CAUSE FOUND & FIXED

**Date:** November 6, 2025
**Investigator:** Roy (Simulation Maintainer)
**Status:** ✅ **RESOLVED**

---

## Summary

The simulation's non-determinism was NOT in AI training code, but in **initialization code using `Math.random()` fallback**.

**Root cause:** `createDefaultInitialState()` accepts an optional `seed` parameter, but when not provided, it falls back to `Math.random()` for stochastic initialization (line 484 of `initialization.ts`).

**Impact:** Even with identical engine seeds, each run's initialization produced different starting states, causing immediate divergence in Month 1.

---

## The Bug

### Location
`src/simulation/initialization.ts:484`

```typescript
const rng: () => number = seed !== undefined
  ? (() => {
      let state = seed;
      return () => {
        state = (state * 1664525 + 1013904223) % 4294967296;
        return state / 4294967296;
      };
    })()
  : Math.random;  // ❌ BUG: Non-deterministic fallback
```

### Why It Happened

1. `SimulationEngine` constructor accepts a `seed` and creates seeded RNG: ✅ Deterministic
2. BUT: `createDefaultInitialState()` is called BEFORE the engine runs
3. Initialization uses stochastic values for:
   - AI agent sleeper probability (line 282)
   - Compute efficiency (line 364)
   - RLHF intensity (line 377)
   - Adversarial testing count (line 378)
   - Alignment adjustments (line 379)
   - Replacement anxiety (line 381)
   - Communication restrictions (line 383)
4. When `seed` parameter is NOT passed, initialization falls back to `Math.random()`
5. This creates DIFFERENT starting states for each run, even with identical engine seeds

---

## How It Was Found

### Step 1: RNG Call Logging (Nuclear Option Debugging)

Added logging to `deterministicRng.ts` to track every RNG call:

```typescript
let rngCallCount = 0;
const enableRngLogging = process.env.LOG_RNG_CALLS === 'true';

export function deterministicRandom(): number {
  const value = currentRng();
  if (enableRngLogging) {
    console.log(`[RNG-${rngCallCount++}] ${value.toFixed(10)}`);
  }
  return value;
}
```

### Step 2: Run 2 Identical Simulations

```typescript
for (let runNum = 1; runNum <= 2; runNum++) {
  const engine = new SimulationEngine({ seed: 42000 });
  const initialState = createDefaultInitialState('unprecedented'); // ❌ No seed!
  const result = engine.run(initialState);
}
```

### Step 3: Compare RNG Sequences

**Expected:** Both runs produce identical RNG values
**Actual:** Completely different sequences from the FIRST call

```
Run 1 RNG calls: 426
Run 2 RNG calls: 429

First 20 RNG calls comparison:
Run 1                    Run 2                    Match?
------------------------------------------------------------------------
0.7730846020             0.4887104068             ❌ DIVERGED
0.7422788638             0.9466100749             ❌ DIVERGED
0.5486161670             0.1431995239             ❌ DIVERGED
... (ALL DIVERGED)
```

### Step 4: Hypothesis & Verification

**Hypothesis:** Initialization is using `Math.random()` instead of seeded RNG

**Verification:** Check `createDefaultInitialState()` signature:
```typescript
export function createDefaultInitialState(
  scenarioMode: ScenarioMode = 'historical',
  alignmentDynamicsConfig?: any,
  climatePriorityConfig?: any,
  thresholdSliders?: ...,
  speculativeScenario?: ...,
  seed?: number  // ✅ OPTIONAL - defaults to undefined!
): GameState
```

**Confirmed:** When `seed` is `undefined`, fallback to `Math.random()` on line 484.

---

## The Fix

### Change #1: Test Script

Pass seed to `createDefaultInitialState()`:

```typescript
// BEFORE (non-deterministic)
const initialState = createDefaultInitialState('unprecedented');

// AFTER (deterministic)
const initialState = createDefaultInitialState(
  'unprecedented',
  undefined, undefined, undefined, undefined,
  SEED  // ✅ Pass seed for deterministic initialization
);
```

### Change #2: Verification

Re-run determinism test with seed parameter:

```
📊 AI Agent Comparison (Month 1):
   Run 1: 20 agents
   Run 2: 20 agents

Agent 0:
  ✅ Capability: 0.0519415924 vs 0.0519415924 (Δ=0.000e+0)
  ✅ Alignment:  0.8263170711 vs 0.8263170711 (Δ=0.000e+0)
Agent 1:
  ✅ Capability: 0.0906226562 vs 0.0906226562 (Δ=0.000e+0)
  ✅ Alignment:  0.7591321148 vs 0.7591321148 (Δ=0.000e+0)
... (ALL MATCH)

✅ SUCCESS: All agents match - simulation is DETERMINISTIC
```

---

## Priya's Nuclear Option Was CORRECT

Priya's fixes (making all rng parameters REQUIRED, fixing Object.entries() sorting) were **correct and necessary**. They forced TypeScript to reveal all RNG call sites and fixed weighted selection bugs.

However, they missed ONE critical call site: **initialization happens BEFORE the engine runs**, and it wasn't obvious that `createDefaultInitialState()` had an optional seed parameter.

The nuclear option revealed:
1. ✅ All `advanceAICapability()` calls properly pass `rng`
2. ✅ All weighted selections properly sort `Object.entries()`
3. ✅ All Math.random fallbacks removed
4. ❌ BUT: Initialization still used `Math.random()` when seed not passed

---

## Remaining Work

### 1. Fix All Scripts That Call `createDefaultInitialState()`

Search for all call sites and ensure they pass seed:

```bash
grep -rn "createDefaultInitialState" scripts/
```

**Files to fix:**
- All Monte Carlo scripts
- All test scripts
- Any scenario generation scripts

### 2. Make Seed Parameter REQUIRED (Nuclear Option Part 2)

Prevent future bugs by making seed **required** instead of optional:

```typescript
// BEFORE
seed?: number  // Optional - falls back to Math.random

// AFTER
seed: number  // REQUIRED - no silent fallbacks!
```

This follows the defensive coding philosophy: **Research simulations should fail loudly, not hide bugs with fallbacks.**

### 3. Add Assertion Utility

Create a wrapper that validates determinism:

```typescript
export function createDeterministicInitialState(
  scenarioMode: ScenarioMode,
  seed: number  // REQUIRED
): GameState {
  if (seed === undefined || seed === null) {
    throw new Error(
      '❌ createDeterministicInitialState() requires seed! ' +
      'Non-deterministic initialization is not allowed in research simulations.'
    );
  }
  return createDefaultInitialState(scenarioMode, undefined, undefined, undefined, undefined, seed);
}
```

---

## Lessons Learned

### 1. Silent Fallbacks Hide Bugs

```typescript
// ❌ BAD: Silent fallback
const rng = seed ? createSeededRng(seed) : Math.random;

// ✅ GOOD: Fail loudly
const rng = assertDefined(seed, {
  location: 'createDefaultInitialState',
  valueName: 'seed',
  additionalInfo: 'Deterministic simulation requires seed parameter'
});
```

### 2. Optional Parameters Are Dangerous in Research Code

In production apps: Optional parameters are convenient
In research simulations: Optional parameters hide non-determinism

**Solution:** Make ALL RNG-related parameters **REQUIRED**.

### 3. Nuclear Option Was Right, But Not Complete

Forcing TypeScript compilation errors revealed 99% of RNG call sites, but missed initialization because:
- Initialization happens outside the engine
- The call site (test scripts) didn't trigger compilation errors

**Solution:** Extend nuclear option to initialization parameters.

### 4. RNG Call Logging Is Powerful

Adding simple logging to `deterministicRandom()` revealed the bug immediately:
- Different sequences → bug is in RNG initialization
- Identical sequences but different outcomes → bug is in selection logic

**Recommendation:** Keep RNG logging as a debug tool (enabled via env var).

---

## Status

✅ **Root cause identified:** `createDefaultInitialState()` Math.random fallback
✅ **Fix verified:** Test script now passes with seed parameter
⚠️ **Remaining work:** Fix all other scripts that call initialization
⚠️ **Prevention:** Make seed parameter REQUIRED

---

## Next Steps

1. ✅ Document root cause (this file)
2. ⚠️ Fix all scripts that use `createDefaultInitialState()` (grep search)
3. ⚠️ Make seed parameter REQUIRED (nuclear option part 2)
4. ⚠️ Run Monte Carlo N=10 to validate full determinism across extended runs
5. ⚠️ Update devlog with findings
6. ⚠️ Celebrate fixing an impossible bug 🎉

---

**Roy's Note:** "Priya did 95% of the work with the nuclear option. I just found the last 5% hiding in initialization. This is why we have multiple people looking at the same problem."

**Priya's Nuclear Option + Roy's RNG Logging = Determinism Achieved**

*"In God we trust. All others must bring data."* - And Roy brought RNG call logs.
