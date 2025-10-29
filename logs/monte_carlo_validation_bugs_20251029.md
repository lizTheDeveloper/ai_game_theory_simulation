# Monte Carlo Validation Bugs - Oct 29, 2025

**Reporter:** Roy (simulation-maintainer)
**Date:** Oct 29, 2025
**Context:** User provided 5 bugs from Monte Carlo validation sweep

## Executive Summary

5 bugs identified in Monte Carlo validation output. Root causes traced:
1. **Slow Takeover:** Hardcoded step 6 never completes (design or bug?)
2. **Capability Floor/Frontier:** Function exists but NEVER CALLED (orphaned code)
3. **Death Attribution:** Units mismatch or aggregation error (730× discrepancy)
4. **NaN Metrics:** Properties exist but become NaN during simulation (calculation bug)
5. **Zero AI Deaths:** Possibly intentional (strategic AIs) or attribution system gap

---

## BUG #1: Slow Takeover Always 85.7% (6/7 Steps)

### Symptoms
- Slow Displacement scenario progress stuck at 85.7% (6 out of 7 steps) in ALL runs
- Never reaches 100% even in 240-month simulations

### Root Cause
**File:** `src/simulation/catastrophicScenarios.ts:1064`

```typescript
case 6: // Gradual Decline
  return { met: false, progress: 0 }; // Will be set by progression logic (takes decades)
```

Step 6 is **hardcoded to never complete**. Comment says "takes decades" but provides no actual check logic.

### Analysis
**Design Question:** Is this intentional or a bug?

**Option A (Intentional):** 20-30 year simulations are too short for step 6 (multi-decade process)
- Fix: Add clear documentation explaining why 6/7 is expected
- Update comment: "Step 6 requires 50+ years of gradual societal decline (not completable in typical simulation timeframes)"

**Option B (Bug):** Step 6 should have actual prerequisite check
- Fix: Implement check logic for whatever "Gradual Decline" means
- Requires design spec for step 6 completion criteria

**Option C (Obsolete):** Step 6 is placeholder and should be removed
- Fix: Reduce scenario from 7 steps to 6 steps
- Update prerequisite count in scenario definition

### Recommended Fix
**Option A** - Add documentation. This is a slow-takeover scenario by design. Multi-decade decline processes are realistic.

```typescript
case 6: // Gradual Decline (50+ years, not completable in typical sims)
  // This step represents multi-generational societal adaptation to AI dominance
  // Requires 50-100 year timeframes to observe full effects
  // Expected: 6/7 completion in 20-30 year simulations
  return { met: false, progress: 0 };
```

### Test Strategy
- Run 240-month sim, verify still shows 6/7
- Check if any catastrophic scenario completes all steps (validate expectation)

---

## BUG #2: Capability Floor/Frontier Always 0.000

### Symptoms
- `capabilityFloor` always 0.000 across all runs
- `frontierCapability` always 0.000 across all runs
- Tech diffusion system appears broken

### Root Cause
**File:** `src/simulation/technologyDiffusion.ts:102-176`

Function `updateFrontierCapabilities()` exists and is fully implemented BUT **NEVER CALLED ANYWHERE**.

```typescript
export function updateFrontierCapabilities(
  state: GameState,
  newCapability: number,
  dimension?: string
): void {
  // 74 lines of perfectly good code that's never executed
  // ...
}
```

Confirmed via grep: Only references are:
- Function definition
- API docs (auto-generated)
- Old implementation plans

**No actual calls** in:
- AI training phases
- Breakthrough technology phases
- Capability update logic

### Impact
1. Frontier never updates → stays at initialization value (0.000)
2. Floor has nothing to ratchet toward → stays 0.000
3. New AIs don't benefit from capability floor → all start from scratch
4. Tech diffusion completely non-functional

### Fix
Wire `updateFrontierCapabilities()` into capability increase locations:

**Where to add calls:**
1. After AI training completes (new model deployment)
2. After breakthrough technology applications
3. After capability upgrades from research

**Implementation locations:**
- `src/simulation/engine/phases/AILifecyclePhase.ts` - After training project completion
- `src/simulation/breakthroughTechnologies.ts` - After tech deployment to AI
- `src/simulation/agents/aiAgent.ts` - After capability increases

**Code pattern:**
```typescript
// After AI capability increase
if (newCapability > state.aiEcosystem.frontierCapability) {
  updateFrontierCapabilities(state, newCapability);
}
```

### Test Strategy
1. Run single sim with logging: `console.log('Frontier:', state.aiEcosystem.frontierCapability)` each month
2. Verify frontier increases when AIs get breakthroughs
3. Verify floor ratchets upward (lags frontier by ~6-12 months)
4. Monte Carlo: Verify frontier/floor > 0.0 and varies by run

---

## BUG #3: Death Attribution Mismatch (1.7B vs 2.3M = 730× Error)

### Symptoms
- Proximate cause deaths: 1.7 billion
- Root attribution deaths: 2.3 million
- 730× discrepancy between two counts of SAME deaths

### Root Cause (Hypothesis)
**File:** `scripts/monteCarloSimulation.ts`

**Conflicting comments about units:**
- Line 1466: "deathsByCategory is in BILLIONS"
- Line 4093: "Both... are now in MILLIONS"

**Possible causes:**
1. **Units mismatch:** Proximate in billions, root in millions (missing × 1000 conversion)
2. **Aggregation bug:** Summing wrong fields or wrong array
3. **Double-counting fix gone wrong:** Oct 16 fix removed cascade deaths, broke total?

### Investigation Required
Need to trace actual values through aggregation:

```typescript
// Add diagnostic logging
console.log('[DEBUG] deathsByCategory (billions):', deathsByCategory);
console.log('[DEBUG] deathsByRootCause (???):', deathsByRootCause);
console.log('[DEBUG] Proximate total:', totalProximateDeaths);
console.log('[DEBUG] Root total:', totalRootDeaths);
```

Check:
1. What units does `bayesianMortality.ts` use when writing deaths?
2. What units does aggregation code expect?
3. Are both using billions OR millions consistently?

### Fix Approach
1. **Find source of truth:** Trace one run's death attribution from origin
2. **Add assertions:** Validate units at aggregation boundaries
3. **Sanity check:** Proximate ≈ Root (within 10%, not 730×)

```typescript
const proximateDeaths = assertFinite(deathsByCategory.total, {
  location: 'aggregateDeaths',
  valueName: 'proximateDeaths',
  additionalInfo: { expectedUnits: 'billions' }
});

const rootDeaths = assertFinite(rootAttributionTotal, {
  location: 'aggregateDeaths',
  valueName: 'rootDeaths',
  additionalInfo: { expectedUnits: 'billions' }
});

// Sanity check: Should be within 10%
if (Math.abs(proximateDeaths - rootDeaths) / proximateDeaths > 0.10) {
  console.warn(`⚠️ Death attribution mismatch: ${proximateDeaths}B proximate vs ${rootDeaths}B root`);
  // Don't fallback - trace why they differ
}
```

**NO `|| 0` FALLBACKS** - If deaths are NaN, simulation should crash with full context.

### Test Strategy
1. Single run with death logging enabled
2. Check output JSON: What are actual values?
3. Verify billions vs millions in storage
4. Monte Carlo: Deaths should match within 10%

---

## BUG #4: NaN Metrics (15+ Fields in Economic/Government)

### Symptoms
All these fields show as NaN in Monte Carlo summary:
```
Economic Stage, Unemployment, Trust in AI, Social Stability,
Wealth Distribution, Government Legitimacy, Control Capability,
Training Data Quality, Sleeper Agents, Benchmarks,
Technology Breakthroughs, Total Revenue, Compute Growth
```

### Root Cause (Partial)
**Properties exist and are initialized** - not a missing field issue.

**Problem:** Values become NaN during simulation due to calculation errors.

**Evidence from code inspection:**

1. **Economic Transition Phase** (`EconomicTransitionPhase.ts:55-56`):
```typescript
economicTransitionStage: Math.max(0, Math.min(4,
  state.globalMetrics.economicTransitionStage + economicProgress.stageChange
))
```

NO `assertFinite` on `economicProgress.stageChange`!

If `calculateEconomicTransitionProgress()` returns NaN:
- `0 + NaN = NaN`
- `Math.min(4, NaN) = NaN`
- `Math.max(0, NaN) = NaN`
- `economicTransitionStage = NaN` → cascades to everything

2. **Unemployment** (`society.unemploymentLevel`):
Property exists, initialized properly, but some phase is setting it to NaN.

3. **Trust/Stability/Wealth** (`globalMetrics.*`):
All accessed without assertions, so NaN propagates silently.

### Fix Strategy

**Phase 1:** Add assertions to EconomicTransitionPhase
```typescript
// In EconomicTransitionPhase.execute()
const stageChange = assertFinite(economicProgress.stageChange, {
  location: 'EconomicTransitionPhase',
  valueName: 'stageChange',
  month: state.currentMonth,
  additionalInfo: { economicProgress }
});

state.globalMetrics.economicTransitionStage = assertFinite(
  Math.max(0, Math.min(4, state.globalMetrics.economicTransitionStage + stageChange)),
  {
    location: 'EconomicTransitionPhase',
    valueName: 'newEconomicStage',
    month: state.currentMonth
  }
);
```

**Phase 2:** Find where `unemploymentLevel` becomes NaN
- Add assertion in phase that updates unemployment
- Trace calculation source

**Phase 3:** Audit all `globalMetrics` writes
- Every phase that writes to `globalMetrics` must use assertions
- No silent NaN propagation

### Test Strategy
1. Add assertions to suspect phases
2. Run single sim - should crash with detailed error if NaN occurs
3. Fix calculation that produces NaN (don't mask with fallback)
4. Monte Carlo: All metrics should be finite numbers

---

## BUG #5: Zero AI-Caused Deaths (Investigation Needed)

### Symptoms
- True alignment average: -0.04 (misaligned!)
- AI-caused deaths: 0 across ALL runs
- No AI catastrophe events logged

### Possible Explanations

**Option A (Not a Bug):** Strategically misaligned AIs waiting
- AIs have negative alignment but haven't acted on it yet
- Sandbagging, waiting for right moment
- 240 months not long enough for catastrophic action
- **Check:** Look at worst-alignment run - any AI takeover attempts?

**Option B (Attribution System Gap):** Deaths happening but not attributed
- Attribution system doesn't have "ai" category wired up
- AI-caused deaths attributed to proximate causes instead
- **Check:** Does `deathsByCategory` have `ai` field? Is it ever written to?

**Option C (Phase Not Running):** AI catastrophe detection broken
- Phase exists but not executing
- Or prerequisite checks too strict (never triggers)
- **Check:** Is `AIControlLossPhase` registered and running?

### Investigation Steps

1. **Check attribution categories:**
```bash
grep -r "deathsByCategory\.ai" src/simulation/
```

2. **Check AI catastrophe events:**
```bash
# In one worst-alignment run, search for:
grep "AI TAKEOVER\|CONTROL LOSS\|AI CATASTROPHE" monteCarloOutputs/run_*_events.json
```

3. **Check if AIs ever attempt harmful actions:**
- Review agent decision logs
- Check if misaligned AIs are sandbagging vs inactive

### Fix (If Bug)
If attribution gap:
```typescript
// In AI catastrophe detection phase
if (aiCausedDeaths > 0) {
  state.humanPopulationSystem.deathsByCategory.ai += aiCausedDeaths;
  state.humanPopulationSystem.deathsByRootCause.alignment += aiCausedDeaths;
}
```

If phase not running:
- Check phase registration in `PhaseOrchestrator.ts`
- Verify prerequisites not too restrictive

### Test Strategy
1. Check worst-alignment run for AI events
2. If truly zero: Document as "strategic waiting behavior" (valid)
3. If attribution bug: Fix and validate deaths appear

---

## IMPLEMENTATION PRIORITY

**Critical (Breaks Monte Carlo validity):**
1. Bug #2 - Capability Floor/Frontier (1-2 hours)
2. Bug #3 - Death Attribution (2-3 hours)
3. Bug #4 - NaN Metrics (2-3 hours)

**Important (Affects interpretation):**
4. Bug #5 - Zero AI Deaths (30 min investigation)

**Documentation:**
5. Bug #1 - Slow Takeover (15 min doc update)

**Total Estimated Time:** 6-9 hours

---

## VALIDATION CHECKLIST

After all fixes:
```bash
npx tsx scripts/monteCarloSimulation.ts --runs=10 --max-months=240 > logs/mc_bug_fixes_validation_$(date +%Y%m%d_%H%M%S).log 2>&1 &
```

**Success Criteria:**
- [ ] Slow Takeover: Shows 6/7 with clear documentation OR completes 7/7
- [ ] Capability Floor: > 0.0 and varies by run (typical range: 0.5-2.5)
- [ ] Frontier Capability: > 0.0 and matches max AI capability in run
- [ ] Death Attribution: Proximate ≈ Root (within 10%, not 730×)
- [ ] Economic Stage: Finite number (0-4 range)
- [ ] Unemployment: Finite number (0-1 range)
- [ ] All metrics: No NaN values in summary
- [ ] AI Deaths: Either > 0 in misaligned runs OR documented as strategic behavior
- [ ] **Zero defensive fallbacks added** (all NaN traced to source and fixed)

---

## NOTES

### Defensive Coding Philosophy

**User requirement:** NO defensive fallbacks (`?? 0`, `|| defaultValue`).

Research simulation principle: Invalid values are bugs to fix, not hide.

**Good:**
```typescript
const value = assertFinite(calculation, { location, valueName, month });
```

**Bad:**
```typescript
const value = calculation ?? 0;  // HIDES THE BUG
```

### Related Issues

- Oct 24, 2025: Ecology NaN bug (hidden for months by `?? 50` fallback)
- Oct 26, 2025: Death reporting 1000× error (units mismatch)
- Oct 28, 2025: Assertion utilities added to prevent NaN propagation

### Files to Modify

**Bug #2 (Frontier/Floor):**
- `src/simulation/engine/phases/AILifecyclePhase.ts`
- `src/simulation/breakthroughTechnologies.ts`
- `src/simulation/agents/aiAgent.ts`

**Bug #3 (Death Attribution):**
- `scripts/monteCarloSimulation.ts` (lines 1438-1474, 4090-4120)
- `src/simulation/bayesianMortality.ts` (verify units)

**Bug #4 (NaN Metrics):**
- `src/simulation/engine/phases/EconomicTransitionPhase.ts` (add assertions)
- `src/simulation/economics.ts` (add assertions to calculations)
- Find and fix unemployment calculation

**Bug #5 (AI Deaths):**
- Investigation only (no code changes until root cause found)

**Bug #1 (Slow Takeover):**
- `src/simulation/catastrophicScenarios.ts` (line 1064 comment update)
