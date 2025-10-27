# Regional → Global Aggregation Architecture Refactoring

**Date:** October 26, 2025
**Priority:** TIER 1 (Infrastructure Fix)
**Complexity:** 5 systems (population, demographics, QoL, environment, deaths)
**Status:** Planning

---

## Problem

Global metrics hardcoded independently of regional data, violating bottom-up architecture:
- Population: 8.0B hardcoded (✅ FIXED Oct 26), should be 8.136B from regional sum
- QoL: Independent global value, should aggregate from 10 regions
- Demographics: Birth/death rates, fertility not derived from regional averages
- Carrying capacity: Global value ignores regional constraints
- Deaths: Tracking exists but no regional breakdown

**Architecture Violation:**
```typescript
// ❌ BAD - Independent global value
state.population.population = 8.0;  // Can drift from regional sum

// ✅ GOOD - Global derived from regional
const totalPop = state.population.regionalPopulations
  .reduce((sum, r) => sum + r.population, 0);
state.population.population = totalPop;
```

---

## Architecture Pattern

**All global metrics MUST be derived from regional data, never set independently.**

### Aggregation Rules
1. **Population:** Sum of all regional populations
2. **QoL:** Weighted average by population (populous regions dominate)
3. **Demographics:** Weighted average of birth/death rates
4. **Carrying Capacity:** Sum of regional capacities
5. **Deaths:** Sum of regional excess deaths

### Implementation Pattern
```typescript
// Central aggregation function (run after all regional updates)
function aggregateGlobalFromRegional(state: GameState): void {
  const regions = state.population.regionalPopulations || [];

  // Population (simple sum)
  state.population.population = regions.reduce((sum, r) => sum + r.population, 0);

  // QoL (population-weighted average)
  const totalPop = state.population.population;
  state.globalMetrics.qualityOfLife = regions.reduce(
    (sum, r) => sum + (r.population / totalPop) * r.qualityOfLife, 0
  );

  // Demographics (weighted average)
  state.population.adjustedBirthRate = regions.reduce(
    (sum, r) => sum + (r.population / totalPop) * r.adjustedBirthRate, 0
  );

  // Carrying capacity (sum)
  state.population.carryingCapacity = regions.reduce(
    (sum, r) => sum + r.carryingCapacity, 0
  );

  // Deaths (sum)
  state.population.monthlyExcessDeaths = regions.reduce(
    (sum, r) => sum + r.monthlyExcessDeaths, 0
  );
}
```

---

## Phases

### Phase 1: Regional QoL Integration (1-2h)
**Goal:** Quality of Life derived from regional populations

**Files:**
- `src/types/game.ts` - Add `qualityOfLife: number` to `RegionalPopulation`
- `src/simulation/qualityOfLife.ts` - Create `aggregateGlobalQoL()`
- `src/simulation/engine/phases/QualityOfLifePhase.ts` - Call aggregation after regional updates

**Validation:**
- QoL matches population-weighted average
- Populous regions (China, India) dominate global QoL
- Monte Carlo: Global QoL aligns with regional trends

---

### Phase 2: Demographics Aggregation (1-2h)
**Goal:** Birth/death rates derived from regional averages

**Files:**
- `src/simulation/populationDynamics.ts` - Create `aggregateGlobalDemographics()`
- `src/simulation/engine/phases/PopulationGrowthPhase.ts` - Call after regional updates

**Metrics:**
- `adjustedBirthRate` - Weighted average
- `adjustedDeathRate` - Weighted average
- `fertilityRate` - Weighted average
- `medianAge` - Weighted average

**Validation:**
- Global growth rate matches sum of regional changes
- Aging regions (Japan) lower global median age
- Monte Carlo: Population trajectories stable

---

### Phase 3: Carrying Capacity Integration (1h)
**Goal:** Global capacity = sum of regional capacities

**Files:**
- `src/simulation/initialization.ts` - Set regional carrying capacities at start
- `src/simulation/populationDynamics.ts` - Aggregate to global
- `src/simulation/engine/phases/PopulationGrowthPhase.ts` - Use aggregated value

**Validation:**
- Global capacity = regional sum
- Regional tech (vertical farming) increases local + global capacity
- Monte Carlo: Overshoot dynamics realistic

---

### Phase 4: Death Tracking Regionalization (1-2h)
**Goal:** Deaths attributed to specific regions

**Files:**
- `src/types/population.ts` - Add death categories to `RegionalPopulation`
- `src/simulation/populationDynamics.ts` - Track regional deaths
- Crisis phases (famine, disasters, war) - Apply deaths regionally

**Validation:**
- Regional deaths sum to global deaths
- Crisis-affected regions show excess deaths
- Monte Carlo: Regional mortality patterns realistic

---

### Phase 5: Assertion & Error Detection (1h)
**Goal:** Prevent drift between global and regional values

**Files:**
- `src/simulation/utils/assertions.ts` - Add `assertRegionalConsistency()`
- All aggregation functions - Call assertion after updates

**Assertion Pattern:**
```typescript
function assertRegionalConsistency(state: GameState): void {
  const regionalSum = state.population.regionalPopulations
    .reduce((sum, r) => sum + r.population, 0);
  const globalValue = state.population.population;

  const diff = Math.abs(regionalSum - globalValue);
  if (diff > 0.001) {  // 1M tolerance
    throw new Error(
      `Regional-global drift: regional=${regionalSum.toFixed(3)}B, ` +
      `global=${globalValue.toFixed(3)}B, diff=${diff.toFixed(3)}B`
    );
  }
}
```

**Validation:**
- All assertions pass in baseline runs
- Drift detected immediately if introduced
- Monte Carlo: No consistency errors

---

## Implementation Notes

**Run Order:** Phase 1 → 2 → 3 → 4 → 5 (sequential dependencies)

**Testing:** Monte Carlo (N=10) after each phase, compare to baseline

**Backward Compatibility:** Keep `regionalPopulations?: RegionalPopulation[]` optional initially, make required in Phase 5

**Performance:** Single aggregation pass per month (~10 regions × 5 metrics = 50 ops, negligible)

---

## Success Criteria

✅ All global metrics derived from regional data (zero hardcoded values)
✅ Population-weighted averages for QoL, demographics
✅ Regional deaths sum to global deaths
✅ Assertions prevent drift
✅ Monte Carlo outcomes stable (±5% from baseline)
✅ No NaN/Infinity errors

---

## Related

- **Bug Fix:** Organizations linkage (Oct 26, 2025) - Similar bottom-up violation
- **Architecture:** Phase-based design (composable, testable units)
- **Research:** UN World Population Prospects 2024 (regional growth rates)
