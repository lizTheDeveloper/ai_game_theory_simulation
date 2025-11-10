# NaN Population Bug Investigation

**Date:** November 9, 2025
**Test:** God mode test (all 73 technologies deployed at month 0)
**Symptom:** `state.humanPopulationSystem.population` becomes NaN around month 48-49

---

## Investigation Timeline

### Issue 1: Units Mismatch in regionalPopulations.ts (FIXED)

**Location:** `src/simulation/regionalPopulations.ts:583`
**Bug:** Function was assigning millions to `pop.population` (which should be billions)

```typescript
// ❌ WRONG
pop.population = totalPopulation; // Already in millions

// ✅ FIXED
pop.population = assertFinite(totalPopulation / 1000, {
  location: 'updateRegionalPopulations',
  valueName: 'pop.population (global)',
  month: state.currentMonth,
  additionalInfo: {
    totalPopulationMillions: totalPopulation,
    totalPopulationBillions: totalPopulation / 1000,
    regionCount: pop.regionalPopulations.length
  }
});
```

**Impact:** Global population was 1000x too small (8000M instead of 8B)

### Issue 2: Silent Fallback Anti-Patterns (FIXED)

**Location:** `src/simulation/populationDynamics.ts:1845-1847`
**Bug:** NaN was being masked with a 0.1B fallback

```typescript
// ❌ WRONG - Masks the bug
if (isNaN(pop.population)) {
  console.warn(`⚠️  Population is NaN before crisis deaths (${reason}), resetting to 0.1B`);
  pop.population = 0.1; // Small survival population as fallback
}

// ✅ FIXED - Fails loudly with context
pop.population = assertFinite(pop.population, {
  location: 'addAcuteCrisisDeaths',
  valueName: 'pop.population (before applying deaths)',
  month: state.currentMonth,
  additionalInfo: {
    reason,
    mortalityRate,
    exposedFraction,
    category
  }
});
```

### Issue 3: Missing Assertions on Population Mutations

**Added assertions to:**
- `applyDeathsWithCap` (line 1590)
- `applyDeathsWithCapMonthly` (line 1714)

These now fail loudly with full context if NaN is introduced.

### Issue 4: Silent Fallback in regionalPopulations.ts (FIXED)

**Location:** `src/simulation/regionalPopulations.ts:478-483`

```typescript
// ❌ WRONG - Silent fallback
if (isNaN(newPopulation) || newPopulation < 0) {
  console.warn(`⚠️  Regional population calculation produced ${newPopulation} for ${region.name}, using previous value`);
  region.population = Math.max(0, previousPopulation * 0.99); // Small decline as fallback
} else {
  region.population = Math.max(0, newPopulation);
}

// ✅ FIXED - Fail loudly
const newPopulation = assertFinite(region.population * (1 + monthlyGrowthRate), {
  location: 'updateRegionalPopulations',
  valueName: 'newPopulation',
  month: state.currentMonth,
  additionalInfo: {
    region: region.name,
    population: region.population,
    monthlyGrowthRate,
    previousPopulation
  }
});
```

---

## Remaining Mystery

**After all fixes, population STILL becomes NaN around month 48-49.**

**Evidence:**
- Aggregation logs show correct values up to month 48: `5410.8M → 5.41B`
- NO assertion errors fired during simulation
- NaN only appears in final result after simulation completes
- PhaseOrchestrator NaN check (engine.ts:647) did NOT trigger

**Hypothesis:** Population becomes NaN AFTER the simulation loop completes, possibly in:
1. The `run()` method's final outcome classification
2. The god mode test script's result processing
3. A phase that runs AFTER aggregation but doesn't log

**Next steps:**
1. Add logging to track population value AFTER each phase at month 48-49
2. Check if `classifyPopulationOutcome` produces NaN when dividing by initialPop
3. Review all phases with order > 20.5 that might modify population

---

## NaN Audit Checklist Progress

- [x] Remove `??` fallbacks in population calculations
- [x] Remove `isNaN` silent fallbacks
- [x] Add `assertFinite` to all population calculations
- [x] Add assertions to aggregation functions
- [x] Fix units mismatch (millions vs billions)
- [ ] Find where NaN is introduced at month 48-49
- [ ] Verify Monte Carlo runs pass without NaN

---

## Related Files

- `src/simulation/regionalPopulations.ts` - Regional population updates
- `src/simulation/populationDynamics.ts` - Global population aggregation
- `src/simulation/engine/phases/HumanPopulationPhase.ts` - Phase orchestration
- `src/simulation/utils/assertions.ts` - Assertion utilities
- `scripts/godModeTest.ts` - Test script (has unrelated capabilities bug)

---

**Status:** Investigation ongoing - root cause not yet found despite fixing multiple anti-patterns.
