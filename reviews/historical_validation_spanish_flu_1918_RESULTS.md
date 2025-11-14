# 1918 Spanish Flu Historical Validation - Results

**Date:** November 14, 2025
**Validator:** simulation-maintainer (Roy)
**Issue:** #15 (Week 1 BLOCKING)
**Status:** ❌ **BLOCKED - Missing Mechanism**

## Executive Summary

**Verdict:** ❌ **CANNOT VALIDATE - Simulation lacks gradual pandemic mortality mechanics**

**Mean Deaths:** 1800M (simulation error - 100% mortality applied immediately)
**Historical Bound:** 25M-100M deaths (1-6% of 1.8B population over 18-24 months)
**Within Tolerance:** 0/10 runs

**Critical Finding:** The simulation does NOT support gradual pandemic mortality over time. The Bayesian mortality system applies `baseRisk` as an immediate one-time event, not spread over duration.

## Methodology

**Attempted approach:**
- N=10 Monte Carlo runs (seeds 1918001-1918010)
- Duration: 24 months
- Target population: 1.8B (1918 level)
- Pandemic parameters: 1-6% total mortality over 24 months

**Script created:** `scripts/historicalValidation_spanishFlu1918.ts`

## Results

### Fatal Flaws Discovered

**Flaw 1: Population initialization**
- `createDefaultInitialState()` initializes to 8.136B (2025 UN data)
- Overriding `state.humanPopulationSystem.population = 1.8e9` AFTER initialization doesn't work
- Regional populations, carrying capacities, and all derived metrics remain at 8B scale
- **Impact:** Cannot simulate 1918 conditions without deep refactoring of initialization system

**Flaw 2: Bayesian mortality applies risk immediately, not gradually**
```typescript
// What I did:
addMortalityRisk(state.humanPopulationSystem, {
  baseRisk: 0.03, // 3% total mortality
  ...
});

// What happened:
// Bayesian system applied 3% mortality in FIRST MONTH, not over 24 months
// Result: 100% of population died immediately (1800M deaths)
```

**Observed behavior:**
- Run 1: 1800.0M deaths (100.00% of 1.8B... but simulation used 8B, so math is broken)
- All 10 runs: Identical 100% mortality
- Pandemic duration: Ignored
- Monthly gradual spread: Not implemented

### What Exists vs What's Needed

**Current implementation (`ExogenousShockPhase.applyMegaPandemicShock`):**
```typescript
state.crises.megaPandemic = {
  active: true,
  totalMortality: 0.20 + rng() * 0.20, // 20-40% total
  monthlyMortality: totalMortality / 24, // Calculated but NEVER APPLIED
  ...
};
```

**The `monthlyMortality` field is SET but NEVER USED.**

**Phases that reference megaPandemic:**
1. `ExogenousShockPhase`: Creates crisis state
2. `EmergencyResponsePhase`: Reduces `monthlyMortality` with medical tech
3. **NO PHASE APPLIES `monthlyMortality` TO POPULATION**

### Missing Mechanism

**Need:** A phase that applies `state.crises.megaPandemic.monthlyMortality` to population EACH MONTH

**Proposed implementation:**
```typescript
// In HumanPopulationPhase or new PandemicMortalityPhase
if (state.crises?.megaPandemic?.active) {
  const monthlyRate = assertProbability(state.crises.megaPandemic.monthlyMortality, {...});

  // Apply this month's mortality to population
  addMortalityRisk(state.humanPopulationSystem, {
    type: 'disease',
    baseRisk: monthlyRate, // THIS month's risk, not total
    proximate: 'disease',
    root: 'natural',
    confidence: 'HIGH',
    scope: 'GLOBAL',
    month: state.currentMonth,
    description: `Pandemic month ${state.currentMonth - state.crises.megaPandemic.startMonth}`
  });

  // Check if pandemic should end (after duration or if mortality reduced to near-zero)
  const monthsElapsed = state.currentMonth - state.crises.megaPandemic.startMonth;
  if (monthsElapsed >= 24 || state.crises.megaPandemic.socialDisruption < 0.05) {
    state.crises.megaPandemic.active = false;
    console.log(`🦠 Pandemic resolved after ${monthsElapsed} months`);
  }
}
```

## Comparison to Historical Data

**Historical Spanish Flu (1918-1920):**
- Deaths: 17M-100M (consensus range)
- Duration: 18-24 months (three waves)
- Mortality: 0.9-5.5% of 1.8B population
- Pattern: Gradual spread with peaks and troughs
- Social impact: Moderate disruption, society continued functioning
- Economic: GDP -1.5% (US) to -6% (typical country)

**Simulation behavior:**
- Deaths: 1800M (100% of attempted population override)
- Duration: 1 month (immediate application)
- Mortality: Applied as instant shock, not gradual
- Pattern: Single catastrophic event
- Social impact: Not modeled correctly
- Economic: Not tested due to early failure

**Divergence: 18,000× higher mortality, 24× faster.**

## Recommendations

### 1. Implement Gradual Pandemic Mortality (CRITICAL)

**Priority:** CRITICAL-1 (blocks historical validation)
**Effort:** 2-3 hours
**Owner:** simulation-maintainer

**Steps:**
1. Create `PandemicMortalityPhase` (order: after HumanPopulationPhase, before outcomes)
2. Apply `monthlyMortality` from `state.crises.megaPandemic` each step
3. Decrement pandemic over time (herd immunity, seasonal effects)
4. End pandemic after 18-24 months or when mortality < threshold

**Test:** Re-run this validation script after implementation

### 2. Support Historical Initial Conditions (HIGH)

**Priority:** HIGH (needed for all historical validations)
**Effort:** 4-6 hours
**Owner:** simulation-maintainer

**Options:**

**Option A: Add `historicalYear` parameter to initialization**
```typescript
createDefaultInitialState(rng, scenarioMode, {
  historicalYear: 1918, // Scale to 1.8B population, pre-antibiotic era
  // OR
  historicalYear: 1945, // Post-WWII 2.3B
  // OR
  historicalYear: 1962, // Cuban Missile Crisis 3.1B
});
```

**Option B: Separate historical initialization function**
```typescript
create1918InitialState(rng) // Returns state with 1.8B pop, 1918 tech level
create1962InitialState(rng) // Cuban Missile Crisis conditions
create2020InitialState(rng) // COVID baseline
```

**Option C: Population scaling utility**
```typescript
scalePopulation(state, targetBillions: number) {
  const scale = targetBillions / state.humanPopulationSystem.population;
  // Scale ALL population-dependent fields proportionally
  // Regional pops, carrying capacities, economic metrics, etc.
}
```

**Recommended:** Option B (explicit historical scenarios)

### 3. Calibrate Pandemic Parameters to 1918 (MEDIUM)

**After fixing mechanics:**
- Adjust `applyMegaPandemicShock` to allow 1-6% mortality (not just 20-40%)
- Model three-wave pattern (optional but increases realism)
- Add herd immunity stabilization (28-33% infected → pandemic ends)
- Regional variation (0.3% Australia to 5.8% Kenya)

## Conclusion

**The 1918 Spanish Flu historical validation CANNOT proceed** until the simulation implements gradual pandemic mortality mechanics. The current implementation sets a `monthlyMortality` value but never applies it to the population over time.

This is a **fundamental gap** in the simulation engine, not just a calibration issue. The Bayesian mortality system is designed for instant shocks (nuclear war, asteroid impact), not gradual pandemics with duration.

**Estimated time to fix:** 6-10 hours total
1. Implement gradual pandemic phase (2-3h)
2. Add historical initialization support (4-6h)
3. Re-run validation (1h)

**Next steps:**
1. Create GitHub issue for gradual pandemic mortality (CRITICAL-1)
2. Implement PandemicMortalityPhase
3. Test with simple pandemic scenario
4. Re-run 1918 validation
5. If PASS → proceed to next historical validation (1962 Cuban Missile Crisis)
6. If FAIL → debug and iterate

---

**Validation Status:** ❌ BLOCKED - Awaiting mechanism implementation
**Follow-up:** Issue #[TBD] - Implement gradual pandemic mortality mechanics
**Estimated completion:** After CRITICAL-1 fix (6-10 hours)
