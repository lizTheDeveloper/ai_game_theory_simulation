# Climate → Famine → Mortality Cascade Integration Plan

**Date:** October 29, 2025
**Priority:** HIGH (Integration Architecture Review Issue #1)
**Estimated Time:** 12-16 hours
**Status:** IN PROGRESS

---

## Executive Summary

The simulation has three independent systems that should form a unified cascade:
1. **Climate System** (temperature, extreme weather, planetary boundaries)
2. **Famine System** (agricultural collapse, food shortages)
3. **Mortality System** (Bayesian demographic model)

**Problem:** These systems operate independently across 4 phases with no centralized coordination. If any phase is disabled or skipped, the cascade breaks silently.

**Solution:** Create `ClimateImpactCascadePhase` coordinator at order 34.0 to ensure proper timing, lag effects, and fail-loudly validation.

---

## Current Architecture (Fragmented)

### Existing Phase Order

```
19.7  FoodSecurityDegradationPhase  → Updates foodSecurity based on environmental factors
21.5  FamineSystemPhase             → Checks biodiversity, updates active famines, adds mortality risks
33.5  EnvironmentalFeedbackPhase    → Updates climateStability
34.1  MultiParadigmDUIUpdatePhase   → Updates paradigm scores
35.0  BayesianMortalityResolutionPhase → Resolves all mortality risks
```

### Issues

1. **Phase ordering fragility:** Food security (19.7) runs BEFORE environmental feedback (33.5), but should respond to climate changes
2. **No cascade coordination:** Each phase independently queries state, no shared context
3. **Missing lag effects:** Climate events should affect agriculture with research-backed delays (1-6 months)
4. **Silent failures:** If any phase disabled, cascade breaks without error

---

## Research Foundation

### Climate → Agriculture Lag Times

From `research/climate-mortality-biosphere-multiparadigm-framework_20251028.md`:

- **Heat waves:** Immediate impact on crop yields (within weeks)
- **Drought:** 1-3 month lag for soil moisture depletion → crop failure
- **Extreme weather:** Immediate for direct damage, 1-6 months for secondary effects
- **Ecosystem collapse:** 6-12 month lag for biodiversity loss → agricultural system failure
- **Infrastructure mismatch multiplier:** 1-3× based on adaptation capacity gap

### Famine → Mortality Lag Times

From `research/seasonal_famine_mortality_20251026.md`:

- **Lean season duration:** 3-4 months (range: 2-6 months)
- **Seasonal mortality multiplier:** 1.5-2× during lean season vs baseline
- **Demographic targeting:** Elite (0.2× vulnerability) → Professional (0.6×) → Working (1.0×) → Precariat (2.0×) → Informal (3.0×)

### Research Critique

From `reviews/famine_mortality_overestimation_critique_20251026.md`:

- ⚠️ **CRITICAL:** Current model overestimates by 200-400%
- **Issue:** Treats seasonal hunger as continuous year-round mortality
- **Recommendation:** Separate chronic vs acute food insecurity, implement seasonal patterns

---

## Proposed Solution: ClimateImpactCascadePhase

### Phase Specification

```typescript
/**
 * Climate Impact Cascade Coordinator Phase
 *
 * Coordinates climate → food security → famine → mortality cascade with:
 * - Research-backed lag times between events
 * - Seasonal lean season concentration
 * - Infrastructure mismatch multipliers
 * - Fail-loudly assertions for data integrity
 *
 * Research:
 * - /research/climate-mortality-biosphere-multiparadigm-framework_20251028.md
 * - /research/seasonal_famine_mortality_20251026.md
 * - /reviews/famine_mortality_overestimation_critique_20251026.md
 *
 * Order: 34.0 (AFTER environmental feedback 33.5, BEFORE mortality resolution 35.0)
 */
export class ClimateImpactCascadePhase implements SimulationPhase {
  readonly id = 'climate_impact_cascade';
  readonly name = 'Climate Impact Cascade';
  readonly order = 34.0;

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    // 1. Calculate climate impacts with lag effects
    const climateImpacts = this.calculateClimateImpacts(state, context);

    // 2. Apply to food security with seasonal patterns
    const foodSecurityChange = this.applyFoodSecurityImpacts(state, climateImpacts, context);

    // 3. Trigger famine risks during lean seasons
    const famineRisks = this.calculateFamineRisks(state, foodSecurityChange, context);

    // 4. Add mortality risks with demographic targeting
    this.addMortalityRisks(state, famineRisks, context);

    return { events: this.generateCascadeEvents(state, climateImpacts, famineRisks) };
  }
}
```

### Integration with Existing Phases

**Phases to REFACTOR:**

1. **FoodSecurityDegradationPhase (19.7):**
   - KEEP for non-climate food security degradation (economic, war, etc.)
   - REMOVE climate-driven food security logic → Move to ClimateImpactCascadePhase

2. **FamineSystemPhase (21.5):**
   - KEEP for famine state management (active famines, death curves)
   - REMOVE climate-triggered famine logic → Move to ClimateImpactCascadePhase
   - ADD seasonal lean season logic (3-4 month concentration)

3. **EnvironmentalFeedbackPhase (33.5):**
   - KEEP as-is (updates climateStability, tracks environmental metrics)
   - NO CHANGES (just provides data for cascade phase)

**New Dependencies:**

```
EnvironmentalFeedbackPhase (33.5)
  ↓ (reads climateStability, planetaryBoundaries)
ClimateImpactCascadePhase (34.0)
  ↓ (adds mortality risks)
BayesianMortalityResolutionPhase (35.0)
```

---

## Implementation Steps

### Phase 1: Research Validation (COMPLETE)

- ✅ Climate → agriculture lag times researched
- ✅ Famine → mortality lag times researched
- ✅ Research critique completed (identified 200-400% overestimation)
- ✅ Quality Gate 1 PASSED

### Phase 2: Create ClimateImpactCascadePhase (IN PROGRESS)

**2.1 Create phase file structure:**

```
src/simulation/engine/phases/ClimateImpactCascadePhase.ts
```

**2.2 Implement core logic:**

```typescript
import { assertFinite, assertInRange, assertStateProperty } from '@/simulation/utils/assertions';
import { addMortalityRisk } from '@/simulation/bayesianMortality';

interface ClimateImpact {
  type: 'heat_wave' | 'drought' | 'extreme_weather' | 'ecosystem_collapse';
  intensity: number;  // 0-1 scale
  lagMonths: number;  // Delay before agricultural impact
  affectedRegions: string[];
}

interface FamineRisk {
  region: string;
  foodSecurityLevel: number;  // 0-1 scale
  isLeanSeason: boolean;
  demographicMultipliers: Map<string, number>;  // Elite: 0.2×, Precariat: 2.0×, etc.
}

class ClimateImpactCascadePhase implements SimulationPhase {
  // 1. Calculate climate impacts with research-backed lag times
  private calculateClimateImpacts(state: GameState, context: PhaseContext): ClimateImpact[] {
    const impacts: ClimateImpact[] = [];

    // Heat wave impacts (immediate)
    const avgTemp = assertStateProperty(state.environmentalAccumulation, 'avgTemp', {
      location: 'ClimateImpactCascade.calculateClimateImpacts',
      month: state.currentMonth
    });

    if (avgTemp > 1.5) {  // > 1.5°C warming
      impacts.push({
        type: 'heat_wave',
        intensity: Math.min(1.0, (avgTemp - 1.5) / 2.0),  // Linear 1.5-3.5°C
        lagMonths: 0,  // Immediate crop impact
        affectedRegions: this.getHeatVulnerableRegions(state)
      });
    }

    // Drought impacts (1-3 month lag)
    const climateStability = assertInRange(
      state.environmentalAccumulation.climateStability,
      0, 1,
      { location: 'ClimateImpactCascade', valueName: 'climateStability', month: state.currentMonth }
    );

    if (climateStability < 0.6) {
      impacts.push({
        type: 'drought',
        intensity: 1.0 - climateStability,
        lagMonths: Math.floor(rng() * 2) + 1,  // 1-3 month lag
        affectedRegions: this.getDroughtVulnerableRegions(state)
      });
    }

    // Ecosystem collapse (6-12 month lag)
    const biosphereIntegrity = assertInRange(
      state.planetaryBoundaries.biosphereIntegrity,
      0, 1,
      { location: 'ClimateImpactCascade', valueName: 'biosphereIntegrity', month: state.currentMonth }
    );

    if (biosphereIntegrity < 0.5) {  // Below safe boundary
      impacts.push({
        type: 'ecosystem_collapse',
        intensity: 0.5 - biosphereIntegrity,
        lagMonths: Math.floor(rng() * 6) + 6,  // 6-12 month lag
        affectedRegions: ['GLOBAL']
      });
    }

    return impacts;
  }

  // 2. Apply to food security with seasonal patterns
  private applyFoodSecurityImpacts(
    state: GameState,
    impacts: ClimateImpact[],
    context: PhaseContext
  ): Map<string, number> {
    const changes = new Map<string, number>();

    for (const impact of impacts) {
      // Check if lag period has elapsed (store impact events in context for future application)
      if (impact.lagMonths === 0) {
        // Immediate impact
        for (const region of impact.affectedRegions) {
          const currentChange = changes.get(region) || 0;
          changes.set(region, currentChange - (impact.intensity * 0.2));  // Up to -20% food security
        }
      } else {
        // Store for future application (delayed impact)
        this.storeDelayedImpact(context, impact);
      }
    }

    // Apply previously stored delayed impacts
    const delayedImpacts = this.retrieveDelayedImpacts(context, state.currentMonth);
    for (const impact of delayedImpacts) {
      for (const region of impact.affectedRegions) {
        const currentChange = changes.get(region) || 0;
        changes.set(region, currentChange - (impact.intensity * 0.3));  // Stronger delayed effect
      }
    }

    return changes;
  }

  // 3. Calculate famine risks during lean seasons
  private calculateFamineRisks(
    state: GameState,
    foodSecurityChanges: Map<string, number>,
    context: PhaseContext
  ): FamineRisk[] {
    const risks: FamineRisk[] = [];

    // Determine if current month is lean season (varies by region)
    const leanSeasonMap = this.getLeanSeasonStatus(state.currentMonth);

    for (const [region, change] of foodSecurityChanges) {
      const currentFoodSecurity = this.getRegionalFoodSecurity(state, region);
      const newFoodSecurity = assertInRange(
        currentFoodSecurity + change,
        0, 1,
        { location: 'ClimateImpactCascade.calculateFamineRisks', valueName: 'foodSecurity', month: state.currentMonth }
      );

      // Separate chronic vs acute food insecurity (per research critique)
      if (newFoodSecurity < 0.6) {
        const isLeanSeason = leanSeasonMap.get(region) || false;

        risks.push({
          region,
          foodSecurityLevel: newFoodSecurity,
          isLeanSeason,
          demographicMultipliers: this.getDemographicMultipliers(state, region)
        });
      }
    }

    return risks;
  }

  // 4. Add mortality risks with demographic targeting
  private addMortalityRisks(state: GameState, risks: FamineRisk[], context: PhaseContext): void {
    for (const risk of risks) {
      // Calculate base mortality rate
      let baseRate = 0;

      if (risk.foodSecurityLevel < 0.2) {
        // True famine (< 0.2): Use existing death curve (high mortality)
        baseRate = 0.15;  // 15% monthly peak
      } else if (risk.foodSecurityLevel < 0.4) {
        // Acute food crisis (0.2-0.4): Seasonal spike
        if (risk.isLeanSeason) {
          baseRate = 0.05;  // 5% during 3-month lean season
        } else {
          baseRate = 0.005;  // 0.5% baseline (recovery months)
        }
      } else {
        // Chronic food insecurity (0.4-0.6): Low continuous
        baseRate = 0.002;  // 0.2% monthly
      }

      // Apply seasonal multiplier (1.5-2× during lean season)
      if (risk.isLeanSeason && risk.foodSecurityLevel < 0.4) {
        baseRate *= 1.75;  // Midpoint of 1.5-2× range
      }

      // Add mortality risk to Bayesian system
      addMortalityRisk(state.humanPopulationSystem, {
        type: 'famine',
        baseRisk: baseRate,
        proximate: 'famine',
        root: 'climate',
        confidence: 'HIGH',
        scope: 'REGIONAL',
        region: risk.region,
        month: state.currentMonth,
        description: `Climate-driven food insecurity in ${risk.region} (level: ${risk.foodSecurityLevel.toFixed(2)}, lean season: ${risk.isLeanSeason})`,
        demographicMultipliers: risk.demographicMultipliers
      });

      // Log cascade event
      console.log(`🌍💀 Climate cascade: ${risk.region} food security ${risk.foodSecurityLevel.toFixed(2)}, base mortality ${(baseRate * 100).toFixed(2)}%`);
    }
  }

  // Helper: Determine lean season status by region and month
  private getLeanSeasonStatus(currentMonth: number): Map<string, boolean> {
    const leanSeasons = new Map<string, boolean>();

    // Sahel: June-August (months 6-8)
    const isSahelLean = currentMonth >= 6 && currentMonth <= 8;
    leanSeasons.set('West Africa', isSahelLean);

    // South Asia: September-November (months 9-11)
    const isSouthAsiaLean = currentMonth >= 9 && currentMonth <= 11;
    leanSeasons.set('South Asia', isSouthAsiaLean);

    // East Africa: December-May (months 12, 1-5)
    const isEastAfricaLean = currentMonth >= 1 && currentMonth <= 5 || currentMonth === 12;
    leanSeasons.set('East Africa', isEastAfricaLean);

    return leanSeasons;
  }

  // Helper: Get demographic vulnerability multipliers from Bayesian mortality system
  private getDemographicMultipliers(state: GameState, region: string): Map<string, number> {
    // Use default demographics from bayesianMortality.ts
    return new Map([
      ['Elite', 0.2],       // 5× less vulnerable
      ['Professional', 0.6],
      ['Working', 1.0],     // Baseline
      ['Precariat', 2.0],   // 2× more vulnerable
      ['Informal', 3.0]     // 3× more vulnerable
    ]);
  }

  // Context storage for delayed impacts (lag effects)
  private storeDelayedImpact(context: PhaseContext, impact: ClimateImpact): void {
    if (!context.data.has('delayedClimateImpacts')) {
      context.data.set('delayedClimateImpacts', []);
    }
    const impacts = context.data.get('delayedClimateImpacts') as Array<ClimateImpact & { applyAtMonth: number }>;
    impacts.push({
      ...impact,
      applyAtMonth: context.currentMonth + impact.lagMonths
    });
  }

  private retrieveDelayedImpacts(context: PhaseContext, currentMonth: number): ClimateImpact[] {
    if (!context.data.has('delayedClimateImpacts')) {
      return [];
    }

    const allImpacts = context.data.get('delayedClimateImpacts') as Array<ClimateImpact & { applyAtMonth: number }>;
    const applicable = allImpacts.filter(i => i.applyAtMonth === currentMonth);

    // Remove applied impacts
    const remaining = allImpacts.filter(i => i.applyAtMonth > currentMonth);
    context.data.set('delayedClimateImpacts', remaining);

    return applicable;
  }
}
```

**2.3 Add assertion utilities:**

All calculations use `assertFinite`, `assertInRange`, `assertStateProperty` for fail-loudly validation (no defensive fallbacks).

**2.4 Integrate with phase orchestrator:**

Add to `src/simulation/engine/phases/index.ts`:

```typescript
export { ClimateImpactCascadePhase } from './ClimateImpactCascadePhase';
```

### Phase 3: Refactor Existing Phases

**3.1 FoodSecurityDegradationPhase (19.7):**

- REMOVE climate-driven logic (temperature, drought, extreme weather effects)
- KEEP non-climate degradation (war, economic collapse, resource extraction)

**3.2 FamineSystemPhase (21.5):**

- ADD seasonal lean season logic (3-4 month concentration)
- REMOVE climate-triggered famine creation (now handled by cascade phase)
- KEEP famine state management (active famines, death curves, totals)

### Phase 4: Testing

**4.1 Unit Tests:**

```typescript
// tests/phases/ClimateImpactCascadePhase.test.ts

describe('ClimateImpactCascadePhase', () => {
  it('should calculate heat wave impacts with immediate lag', () => {
    // Test heat wave → immediate food security impact
  });

  it('should apply drought impacts with 1-3 month lag', () => {
    // Test drought → delayed food security impact
  });

  it('should apply ecosystem collapse with 6-12 month lag', () => {
    // Test ecosystem collapse → long-delayed food security impact
  });

  it('should apply seasonal lean season multipliers', () => {
    // Test 1.5-2× mortality during lean season vs baseline
  });

  it('should separate chronic vs acute food insecurity', () => {
    // Test <0.2 (true famine), 0.2-0.4 (acute seasonal), 0.4-0.6 (chronic)
  });

  it('should apply demographic vulnerability multipliers', () => {
    // Test elite (0.2×) vs precariat (2.0×) vs informal (3.0×)
  });

  it('should store and retrieve delayed impacts correctly', () => {
    // Test lag effect storage in PhaseContext
  });
});
```

**4.2 Integration Tests:**

```typescript
// tests/integration/climate-famine-mortality-cascade.test.ts

describe('Climate → Famine → Mortality Cascade', () => {
  it('should propagate climate impacts to mortality over time', () => {
    // Run 12-month simulation with climate shock
    // Verify lag effects apply at correct months
    // Verify mortality spikes during lean seasons
  });

  it('should apply seasonal concentration correctly', () => {
    // Verify 3-4 month lean season concentration
    // Verify recovery during post-harvest months
  });

  it('should fail loudly on invalid state', () => {
    // Test assertion utilities catch NaN/undefined
    // Verify fail-loudly behavior (no silent fallbacks)
  });
});
```

**4.3 Monte Carlo Validation:**

```bash
# Run 10+ simulations with climate shocks
npx tsx scripts/monteCarloSimulation.ts --runs 10 --climate-shock > logs/cascade_validation_$(date +%Y%m%d_%H%M%S).log 2>&1 &

# Verify outcome distributions:
# - No false extinctions (unified outcome classification)
# - Realistic mortality ranges (not 200-400% overestimation)
# - Seasonal patterns visible in event logs
```

### Phase 5: Architecture Review (Quality Gate 2)

**Spawn architecture-skeptic agent:**

```typescript
Task({
  subagent_type: "architecture-skeptic",
  description: "Review ClimateImpactCascade phase implementation",
  prompt: `Review implementation of ClimateImpactCascadePhase for:
1. Performance bottlenecks (O(n²) operations, deep cloning)
2. State propagation issues (race conditions, circular dependencies)
3. Complexity creep (unnecessary abstractions)
4. Phase ordering correctness (order 34.0 placement)
5. Integration with existing phases (FamineSystemPhase, FoodSecurityDegradationPhase)

Files: src/simulation/engine/phases/ClimateImpactCascadePhase.ts`
})
```

**Address CRITICAL/HIGH issues before proceeding.**

### Phase 6: Code Quality Review

**Spawn senior-dev-reviewer agent:**

```typescript
Task({
  subagent_type: "senior-dev-reviewer",
  description: "Code quality review for ClimateImpactCascade",
  prompt: `Review code quality for ClimateImpactCascadePhase:
1. Assertion utilities usage (no defensive fallbacks)
2. Type safety (strict TypeScript compliance)
3. Code clarity (readable, maintainable)
4. Documentation (JSDoc, inline comments)
5. Edge case handling (empty arrays, boundary conditions)

Files: src/simulation/engine/phases/ClimateImpactCascadePhase.ts`
})
```

**MUST fix CRITICAL issues, strongly recommended to fix HIGH issues.**

### Phase 7: Documentation

**7.1 Update wiki:**

Add to `docs/wiki/README.md`:

```markdown
### Climate → Famine → Mortality Cascade

**Phase:** ClimateImpactCascadePhase (Order 34.0)

**Research:**
- Climate → agriculture lag times: /research/climate-mortality-biosphere-multiparadigm-framework_20251028.md
- Famine → mortality seasonality: /research/seasonal_famine_mortality_20251026.md
- Research critique: /reviews/famine_mortality_overestimation_critique_20251026.md

**Mechanism:**
1. Climate events trigger food security degradation with research-backed lag times:
   - Heat waves: Immediate impact
   - Drought: 1-3 month lag
   - Ecosystem collapse: 6-12 month lag
2. Food insecurity triggers famine risks during 3-4 month lean seasons
3. Famine adds mortality risks to Bayesian system with demographic targeting
4. Seasonal concentration: 1.5-2× mortality during lean season vs baseline

**Key Parameters:**
- Lean season duration: 3-4 months per year (varies by region)
- Seasonal multiplier: 1.75× (midpoint of 1.5-2× range)
- Demographic multipliers: Elite (0.2×) → Informal (3.0×)
- Food security thresholds: <0.2 (true famine), 0.2-0.4 (acute seasonal), 0.4-0.6 (chronic)
```

**7.2 Update research files:**

Add implementation notes to research files referencing the phase.

### Phase 8: Plan Archival

**Spawn project-plan-manager:**

```typescript
Task({
  subagent_type: "project-plan-manager",
  description: "Archive climate-famine-mortality cascade plan",
  prompt: "Archive /plans/climate-famine-mortality-cascade-integration.md to /plans/completed/ and update roadmap Progress Summary."
})
```

---

## Success Criteria

- ✅ Climate events trigger agricultural impacts with research-backed lag times
- ✅ Food shortages trigger mortality with proper demographic targeting
- ✅ All assertions in place, zero defensive fallbacks
- ✅ Monte Carlo shows proper variance in cascade outcomes (not 200-400% overestimation)
- ✅ Architecture review passes (no CRITICAL/HIGH issues)
- ✅ Code quality review passes (no CRITICAL issues, HIGH issues addressed)
- ✅ Wiki updated with cascade mechanics and sources
- ✅ Plan archived to /plans/completed/

---

## Risk Mitigation

**Risk 1: Phase ordering breaks existing systems**
- **Mitigation:** Add assertions in BayesianMortalityResolutionPhase to detect if cascade phase ran
- **Test:** Integration tests verify phase order correctness

**Risk 2: Delayed impacts never apply (context storage fails)**
- **Mitigation:** Add logging for stored/retrieved impacts, verify in tests
- **Test:** Unit test specifically for lag effect storage/retrieval

**Risk 3: Seasonal patterns create unrealistic mortality spikes**
- **Mitigation:** Monte Carlo validation (N=10+) to verify outcome distributions
- **Test:** Compare to historical famine mortality data (Bengal 1943, Sahel 1973)

**Risk 4: Refactoring existing phases introduces regressions**
- **Mitigation:** Run existing test suite before/after refactoring
- **Test:** Integration tests for full climate → famine → mortality flow

---

## Timeline

**Total: 12-16 hours**

- Phase 1: Research Validation (COMPLETE) - 0h
- Phase 2: Create ClimateImpactCascadePhase - 6-8h
- Phase 3: Refactor Existing Phases - 2-3h
- Phase 4: Testing - 2-3h
- Phase 5: Architecture Review - 1-2h
- Phase 6: Code Quality Review - 1-2h
- Phase 7: Documentation - 1h
- Phase 8: Plan Archival - 0.5h

---

## References

**Research:**
- `/research/climate-mortality-biosphere-multiparadigm-framework_20251028.md` (15,000+ words, 40+ sources)
- `/research/seasonal_famine_mortality_20251026.md` (382 lines)

**Reviews:**
- `/reviews/famine_mortality_overestimation_critique_20251026.md` (147 lines)
- `/reviews/integration-architecture-review_20251028.md` (HIGH #1, lines 171-200)

**Standards:**
- `/docs/COMMANDS.md` - Monte Carlo validation commands
- `/docs/DEVELOPMENT_WORKFLOW.md` - Phase creation workflow
- `CLAUDE.md` - Defensive coding patterns, assertion utilities

---

**Status:** IN PROGRESS (Phase 2 starting)
**Next:** Spawn simulation-maintainer to implement ClimateImpactCascadePhase
