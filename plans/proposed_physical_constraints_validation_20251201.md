# Physical Constraints Validation Tooling

**Priority:** LOW
**Complexity:** 2 systems
**Estimated Effort:** 3-4 hours
**Created:** Dec 1, 2025
**Status:** PROPOSED
**Roadmap Reference:** Section 4.1 Issue #13

## Problem Statement

**Current state:** The simulation models physical systems (climate, carbon cycle, population, energy) but lacks runtime validation that values stay within physically plausible bounds.

**Example violations that should be caught:**
- CO2 concentration <280 ppm or >1000 ppm (pre-industrial minimum, extinction maximum)
- Temperature anomaly <-2°C or >8°C (ice age, runaway greenhouse)
- Population <0 or >20 billion (physical impossibility, Earth carrying capacity)
- Energy deployment >100% of theoretical maximum (violates conservation of energy)
- Food production >200% of current levels (land/water constraints)

**Risk:** Physically impossible values indicate bugs but currently go undetected until they cascade into NaN crashes or unrealistic outcomes.

## Proposed Solution

Create assertion utilities for physical constraints and integrate into Monte Carlo validation pipeline.

### Phase 1: Physical Constraint Assertion Utilities (90 min)

**File:** `src/simulation/utils/physicalConstraints.ts`

```typescript
import { assertInRange } from './assertions';

/**
 * Validates climate state stays within physically plausible bounds.
 * Based on paleoclimate records (IPCC AR6) and runaway greenhouse thresholds.
 */
export function assertPhysicalClimate(state: GameState, context: AssertionContext): void {
  // CO2: Pre-industrial minimum to extinction threshold
  assertInRange(state.climate.co2Concentration, 280, 1000, {
    ...context,
    valueName: 'CO2 concentration',
    unit: 'ppm',
    bounds: 'Paleoclimate minimum (280 ppm) to runaway greenhouse (1000 ppm)'
  });

  // Temperature: Last ice age to Venus scenario
  assertInRange(state.climate.temperatureAnomaly, -2.0, 8.0, {
    ...context,
    valueName: 'Temperature anomaly',
    unit: '°C',
    bounds: 'Ice age (-2°C) to Venus scenario (+8°C)'
  });

  // Methane: Pre-industrial to catastrophic clathrate gun
  assertInRange(state.climate.methaneConcentration, 700, 5000, {
    ...context,
    valueName: 'Methane concentration',
    unit: 'ppb',
    bounds: 'Pre-industrial (700 ppb) to clathrate gun (5000 ppb)'
  });

  // Ocean pH: Acidification limit to alkalinity limit
  if (state.oceanHealth?.pH !== undefined) {
    assertInRange(state.oceanHealth.pH, 7.0, 8.5, {
      ...context,
      valueName: 'Ocean pH',
      bounds: 'Extreme acidification (7.0) to pre-industrial (8.2)'
    });
  }
}

/**
 * Validates population dynamics stay within biological/physical bounds.
 */
export function assertPhysicalPopulation(state: GameState, context: AssertionContext): void {
  const pop = state.humanPopulationSystem.population;

  // Population: Non-negative to Earth carrying capacity
  assertInRange(pop, 0, 20, {
    ...context,
    valueName: 'Human population',
    unit: 'billion',
    bounds: 'Extinction (0) to maximum carrying capacity (20B)'
  });

  // Birth/death rates: Biological minimum to crisis maximum
  assertInRange(state.humanPopulationSystem.birthRate, 0, 60, {
    ...context,
    valueName: 'Birth rate',
    unit: 'per 1000',
    bounds: 'Collapse (0) to historical maximum (60)'
  });

  assertInRange(state.humanPopulationSystem.deathRate, 0, 100, {
    ...context,
    valueName: 'Death rate',
    unit: 'per 1000',
    bounds: 'Utopia (0) to total mortality (100)'
  });
}

/**
 * Validates energy system physics (conservation laws, deployment limits).
 */
export function assertPhysicalEnergy(state: GameState, context: AssertionContext): void {
  // Global energy: Non-negative to theoretical maximum
  // Current: ~180,000 TWh/year, theoretical solar maximum: ~3 million TWh/year
  assertInRange(state.energy.totalProduction, 0, 3_000_000, {
    ...context,
    valueName: 'Global energy production',
    unit: 'TWh/year',
    bounds: 'Collapse (0) to theoretical solar maximum (3M TWh)'
  });

  // Deployment rates: Cannot exceed 100% of capacity
  for (const [source, deployment] of Object.entries(state.energy.deploymentBySource)) {
    if (deployment.percentage !== undefined) {
      assertInRange(deployment.percentage, 0, 100, {
        ...context,
        valueName: `${source} deployment percentage`,
        unit: '%',
        bounds: 'Physical constraint (0-100%)'
      });
    }
  }
}

/**
 * Validates food production within agricultural constraints.
 */
export function assertPhysicalFood(state: GameState, context: AssertionContext): void {
  // Food production index: Cannot exceed land/water limits
  // 100 = current, 200 = double (requires vertical farming + lab meat)
  assertInRange(state.globalFoodProductionIndex, 0, 200, {
    ...context,
    valueName: 'Global food production index',
    unit: '%',
    bounds: 'Famine (0) to maximum vertical farming (200)'
  });

  // Food security: Probability bounds
  for (const region of state.regions || []) {
    if (region.foodSecurity !== undefined) {
      assertInRange(region.foodSecurity, 0, 1, {
        ...context,
        valueName: `${region.name} food security`,
        bounds: 'Probability (0-1)'
      });
    }
  }
}

/**
 * Master validation function - checks all physical constraints.
 * Call at end of each simulation step or in Monte Carlo validation.
 */
export function validatePhysicalConstraints(state: GameState, month: number): void {
  const context: AssertionContext = {
    location: 'validatePhysicalConstraints',
    month
  };

  assertPhysicalClimate(state, context);
  assertPhysicalPopulation(state, context);
  assertPhysicalEnergy(state, context);
  assertPhysicalFood(state, context);
}
```

### Phase 2: Integration into Simulation Loop (30 min)

**Option A:** Development mode only (fast, no production overhead)
```typescript
// PhaseOrchestrator.ts
if (process.env.NODE_ENV === 'development') {
  validatePhysicalConstraints(state, state.currentMonth);
}
```

**Option B:** Always validate (slower, catches all bugs)
```typescript
// PhaseOrchestrator.ts - after all phases execute
validatePhysicalConstraints(state, state.currentMonth);
```

**Recommendation:** Option A (development mode only) to avoid production performance overhead.

### Phase 3: Monte Carlo Validation Integration (45 min)

**File:** `scripts/monteCarloSimulation.ts`

Add physical constraint validation to summary:
```typescript
interface RunResult {
  // ... existing fields
  physicalConstraintViolations?: Array<{
    month: number;
    constraint: string;
    value: number;
    expectedRange: [number, number];
  }>;
}

// After each run completes
try {
  validatePhysicalConstraints(finalState, finalState.currentMonth);
  result.physicalConstraintViolations = [];
} catch (error) {
  if (error instanceof AssertionError) {
    result.physicalConstraintViolations = [{
      month: finalState.currentMonth,
      constraint: error.valueName,
      value: error.actualValue,
      expectedRange: error.expectedRange
    }];
  }
}
```

**Summary statistics:**
- Count runs with physical violations
- List most common violations
- Flag CRITICAL if >10% runs violate physics

### Phase 4: Testing & Documentation (45 min)

**Tests:** `tests/simulation/utils/physicalConstraints.test.ts`
- Test each constraint individually
- Test boundary values (exactly at limits)
- Test violation detection (values outside limits)
- Test context enrichment (error messages)

**Documentation:**
- Add to `docs/wiki/README.md` under Validation section
- Document all physical bounds and research justification
- Add to `docs/COMMANDS.md` validation section

## Physical Bounds Justification

**Climate:**
- CO2 280-1000 ppm: IPCC AR6, paleoclimate records, Venus runaway threshold
- Temp -2°C to +8°C: Last ice age to catastrophic warming scenarios
- Methane 700-5000 ppb: Pre-industrial to clathrate gun estimates
- Ocean pH 7.0-8.5: Biological viability limits (coral, shellfish)

**Population:**
- 0-20 billion: Extinction to maximum Earth carrying capacity estimates
- Birth rate 0-60/1000: Demographic transition to historical maximum
- Death rate 0-100/1000: Biological limits

**Energy:**
- 0-3M TWh/year: Collapse to theoretical solar collection maximum
- Deployment 0-100%: Conservation of energy constraint

**Food:**
- Production 0-200%: Famine to vertical farming + lab meat limits
- Food security 0-1: Probability bounds

## Expected Outcomes

**Bug detection:**
- Catch physically impossible values before they cascade
- Identify which phase/system produces violations
- Provide clear error messages with context

**Research credibility:**
- Demonstrate simulation respects physical laws
- Quantify how often physics is violated (should be 0%)
- Strengthen peer review responses ("We validate physical bounds")

**Monte Carlo quality:**
- Add physics violations to run summaries
- Flag runs that break conservation laws
- Improve confidence in outcome distributions

## Implementation Notes

**Token efficiency:**
- Reuse existing `assertInRange` utility (no new primitives)
- Development mode only (no production overhead)
- Grep for existing physical bounds in code

**Quality gates:**
- TypeScript compilation MUST pass
- All tests MUST pass (including new physical constraint tests)
- Architecture review NOT required (validation tooling)
- Research validation NOT required (documenting known physics)

**Performance:**
- ~1ms overhead per simulation step (negligible)
- Optional integration (can disable for production if needed)

## Follow-Up Work

After completion:
1. **MEDIUM:** Add chemical constraints (conservation of mass in carbon/nitrogen cycles)
2. **MEDIUM:** Add thermodynamic constraints (energy system efficiency limits)
3. **LOW:** Visualization of constraint violations in dashboard

## Alternative Approaches Considered

**Alternative 1:** Manual code review to find violations
- **Rejected:** Labor-intensive, error-prone, doesn't catch future bugs

**Alternative 2:** Post-hoc analysis of Monte Carlo outputs
- **Rejected:** Violations already happened, harder to debug root cause

**Alternative 3:** Statistical anomaly detection (outlier filtering)
- **Rejected:** Masks bugs instead of exposing them, research anti-pattern

**Chosen approach:** Fail-loudly with physical constraints during development and Monte Carlo validation.

## Notes

- Aligns with NaN handling philosophy (fail loudly, not silently)
- Complements assertion utilities (physical layer on top of numeric layer)
- Supports roadmap Section 4.1 Issue #13
- Research simulation rigor - physics matters
