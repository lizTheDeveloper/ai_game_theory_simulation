# FIX #14 CRITICAL BUG ANALYSIS (Oct 21, 2025 - 11:00pm PT)

**Status:** CRITICAL BUG IDENTIFIED - Deployment levels not persisting
**Impact:** FIX #14 Phases 1-4 implementation incomplete, ecology still collapsed at 0.4/100

---

## TL;DR

**The sigmoid deployment curves work perfectly** - technologies calculate 17-47% deployment correctly.

**BUT:** Deployment levels **DO NOT PERSIST** - they reset to 0% between update cycles.

---

## Evidence

### 1. **Debug Logs Show Correct Calculation**

```
🔧 DEBUG DEPLOYMENT: Scalable Oversight
   Month: 24 (3 since start)
   Old level: 0.0%  ← ALWAYS ZERO
   New level: 17.7% ← CORRECT SIGMOID VALUE
   Timescale: 120mo, Adjusted: 160mo
   Gov: 75%, Climate: 100%

🔧 DEBUG DEPLOYMENT: Scalable Oversight
   Month: 48 (27 since start)
   Old level: 0.0%  ← STILL ZERO (should be 17.7%!)
   New level: 25.7% ← CORRECT SIGMOID VALUE
```

**Pattern:** Every update cycle reads `deploymentLevel = 0%` from the deployment object, calculates the correct new level (17-47%), assigns it... but at the next cycle, it's back to 0%.

### 2. **Tech Tree State Check Confirms**

```
🔍 TECH TREE STATE CHECK (Month 24)
   Scalable Oversight level: 0.0%
   Start month: 21

🔍 TECH TREE STATE CHECK (Month 48)
   Scalable Oversight level: 0.0%
   Start month: 21
```

**The deployment object ITSELF has `deploymentLevel: 0.0%`** - not a logging issue, the actual state is wrong.

### 3. **240-Month Validation Results**

- N=20 runs, 240 months each
- **Ecological score: 0.4/100** (no improvement from 1.3/100 baseline)
- **Technologies stuck at 25%** (repeatedly hitting first milestone but never progressing)
- **Dystopia rate: 95%** (vs target of 30-50%)

---

## Root Cause Hypothesis

**Most Likely:**

The assignment `deployment.deploymentLevel = actualDeploymentLevel` executes successfully, but something is **overwriting the deployment level between update cycles**.

**Possible Causes:**

### A. Deployment Objects Being Recreated

**Code:** `src/simulation/techTree/engine.ts` lines 336-348

```typescript
let deployment = regional.find(d => d.techId === action.techId);

if (!deployment) {
  deployment = {
    techId: action.techId,
    region: action.targetRegion,
    deploymentLevel: 0,  ← NEW OBJECTS START AT 0%
    ...
  };
  regional.push(deployment);
}
```

**If agents create new deployment actions every month**, this could:
1. Find existing deployment ✅
2. But if the `find()` fails (why?), create NEW object with `deploymentLevel: 0` ❌
3. Push duplicate deployment, or replace existing one ❌

**Test:** Why would `find(d => d.techId === action.techId)` fail to find an existing deployment?

### B. Regional Deployment Arrays Being Wiped

**Code:** `src/simulation/techTree/engine.ts` line 331-333

```typescript
if (!(action.targetRegion in techTreeState.regionalDeployment)) {
  techTreeState.regionalDeployment[action.targetRegion] = [];  ← WIPES REGION
}
```

**If the region key check fails**, this creates a NEW EMPTY ARRAY, destroying all existing deployments for that region.

**Test:** Why would a region that had deployments suddenly not be `in` the object?

### C. Tech Tree State Not Persisted Properly

**Code:** `src/types/game.ts` line 180

```typescript
techTreeState?: import('../simulation/techTree/engine').TechTreeState; // OPTIONAL
```

**Being optional (`?:`) could cause:**
1. State serialization to skip it
2. State cloning to omit it
3. Phase execution to receive stale copy

**Test:** Is `techTreeState` being preserved across phases?

### D. Order of Operations Issue

**Current order** (`src/simulation/techTree/engine.ts` lines 172-177):

```
1. applyDeploymentActions()     ← Creates/updates deployment objects
2. updateDeploymentProgress()    ← Updates deploymentLevel
3. updateResearchProgress()
4. applyAllTechEffects()
```

**If applyDeploymentActions() runs AFTER updateDeploymentProgress()** in the next cycle, it could overwrite progress.

**BUT:** The order is correct within `updateTechTree()`. The question is: what happens BETWEEN monthly updateTechTree() calls?

---

## What We Know FOR SURE

### ✅ **The Math Works**

- Sigmoid curves calculate correctly (verified with `testDeploymentCurve.ts`)
- Governance multiplier works (75% = 0.75× rate)
- Climate feedback works (>1.5°C = 5-40% penalty)
- Timescales are empirically grounded (DAC 25y, TIER 1 15y, etc.)

### ✅ **The Assignment Executes**

```typescript
deployment.deploymentLevel = Math.min(1.0, actualDeploymentLevel);
// This line runs successfully, assigns 17-47% correctly
```

### ❌ **The Value Doesn't Stick**

```
Month 24: Set to 17.7%
Month 48: Reads as 0.0% (!)
```

Something happens **between Month 24 and Month 48** that resets `deploymentLevel` to 0.

---

## Next Steps to Diagnose

### Immediate (Tonight)

1. **Add more aggressive logging** to track:
   - When deployment objects are created vs found
   - Whether `find()` ever fails unexpectedly
   - Regional array recreation events
   - Pointer identity checks (is it the same object?)

2. **Test with minimal case:**
   - Single run, 60 months
   - Only Scalable Oversight deployment
   - Log every assignment and read

3. **Check phase ordering:**
   - Does any other phase modify `techTreeState`?
   - Is tech tree state being cloned/recreated anywhere?

### If Quick Fix Not Found

**Option 1:** Store deployment progress in GameState (not techTreeState)
- Add `state.deploymentProgress: Map<techId, level>`
- Guaranteed to persist (GameState is required, not optional)

**Option 2:** Change techTreeState to non-optional
- Remove `?` from `techTreeState?: TechTreeState`
- Ensure always initialized, never undefined

**Option 3:** Revert to instant deployment temporarily
- Re-enable line 375 in engine.ts (old behavior)
- Accept that deployment is unrealistic but at least works
- Fix FIX #14 in a follow-up after diagnosis

---

## Impact Assessment

### If Bug NOT Fixed

- **Ecology remains collapsed:** 0-5/100 across all runs
- **FIX #14 fails:** 7-8 hours of work wasted
- **Publication blocked:** Can't publish with 100% dystopia rate
- **User expectation:** "Finish the number 14 full implementation" - NOT MET

### If Bug IS Fixed

- **Expected outcomes** (from research):
  - Median ecology: 25-35/100 (stabilized)
  - Dystopia rate: 30-50% (vs 95% current)
  - Technologies deploy over 15-25 years (realistic)
  - Planetary boundaries recover in 40%+ of runs

---

## Code Locations

**Deployment update:** `src/simulation/techTree/deploymentTimescales.ts` line 252
**Deployment actions:** `src/simulation/techTree/engine.ts` lines 322-382
**Tech tree phase:** `src/simulation/engine/phases/TechTreePhase.ts` lines 36-47
**GameState type:** `src/types/game.ts` line 180

---

## Timeline

- **6:30pm PT:** Completed Phases 1-4 (7-8 hours work)
- **7:00pm PT:** Quick validation showed ecology 0.7/100, no improvement
- **7:30pm PT:** Investigated deployment system
- **8:00pm PT:** Fixed TIER 0 re-deployment bug
- **8:30pm PT:** Validated sigmoid curves work correctly
- **9:00pm PT:** Started 240-month validation
- **11:00pm PT:** **CRITICAL BUG IDENTIFIED - deployment levels not persisting**

---

**Status:** BUG IDENTIFIED BUT NOT YET FIXED
**Next:** Implement diagnostic logging and find root cause
**ETA to fix:** 1-3 hours (depends on complexity)
