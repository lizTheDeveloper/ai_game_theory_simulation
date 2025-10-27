# Bayesian Mortality System Migration Inventory

**Status**: Planning
**Date**: October 27, 2025
**Purpose**: Systematic migration of all death tracking to Bayesian mortality system

## Summary

- **19 direct population modifications** (`.population -=` or `.population =`)
- **Multiple death tracking sites** (`deathsByCategory`, `deathsByRootCause`)
- **Several phases** that apply deaths directly

## Files Requiring Migration

### HIGH PRIORITY: Phase Files (Direct Death Application)
These directly modify population and need immediate migration:

1. **`src/simulation/engine/phases/FamineSystemPhase.ts:45`**
   - Direct: `state.humanPopulationSystem.population -= famineDeaths`
   - MIGRATE TO: `addMortalityRisk()` with famine type

2. **`src/simulation/engine/phases/RadiationSystemPhase.ts:41,65`**
   - Direct: `state.humanPopulationSystem.population -= deaths`
   - Direct: `state.humanPopulationSystem.population -= birthDefectMortality`
   - MIGRATE TO: `addMortalityRisk()` with disaster type

3. **`src/simulation/militarySystem.ts:647-648`**
   - Direct: `target.population -= intervention.effects.civilianCasualties`
   - Direct: `target.monthlyExcessDeaths += intervention.effects.civilianCasualties`
   - MIGRATE TO: `addMortalityRisk()` with war type

4. **`src/simulation/wetBulbEvents.ts:570,581,583`**
   - Direct: `population.population = Math.max(0, population.population - deathsInBillions)`
   - Direct: `population.deathsByCategory.disasters += deathsInBillions`
   - Direct: `population.deathsByRootCause.climate += deathsInBillions`
   - MIGRATE TO: `addMortalityRisk()` with disaster/climate type

5. **`src/simulation/antimicrobialResistance.ts:353`**
   - Direct: `state.humanPopulationSystem.deathsByCategory.disease += monthlyDeaths / 1e9`
   - MIGRATE TO: `addMortalityRisk()` with disease type

### MEDIUM PRIORITY: Population Dynamics Functions
These are helper functions that should be replaced by Bayesian system:

6. **`src/simulation/populationDynamics.ts:1417,1525`**
   - Function: `applyDeathsWithCap()` (line ~1380)
   - Function: `applyImmediateDeaths()` (line ~1490)
   - ACTION: Mark as DEPRECATED, replace all calls with `addMortalityRisk()`

### LOW PRIORITY: Regional/Country Aggregation
These aggregate from regions and should work automatically once regional systems use Bayesian:

7. **`src/simulation/regionalPopulations.ts:459,461,531,532,541`**
   - Regional death tracking
   - ACTION: Update after phase migrations complete

8. **`src/simulation/countryPopulations.ts:529,530,595`**
   - Country-level death tracking
   - ACTION: Update after phase migrations complete

9. **`src/simulation/populationDynamics.ts:457,731,1006,1008`**
   - Population aggregation from regions
   - ACTION: Update after regional migrations complete

### DO NOT MODIFY: Bayesian System Itself
These are part of the NEW system:

10. **`src/simulation/bayesianMortality.ts:287,297,300`**
    - This IS the new system
    - NO ACTION NEEDED

### DO NOT MODIFY: Demographic Calculations
These are legitimate population updates (births, not deaths):

11. **`src/simulation/populationDynamics.ts:1641`**
    - Fallback for invalid state
    - NO ACTION NEEDED (error handling)

## Migration Strategy

### Phase 1: Document in Wiki (1 hour)
- [ ] Add Bayesian Mortality System section to wiki
- [ ] Document API: `addMortalityRisk()`, `resolveMortality()`
- [ ] Document research backing
- [ ] Add migration guide

### Phase 2: Create Orchestrator Phase (2 hours)
- [ ] Create `BayesianMortalityResolutionPhase.ts`
- [ ] Add to phase orchestrator (order: after all crisis phases, before outcomes)
- [ ] Phase calls `resolveMortality(state, rng)` each month
- [ ] Clear `mortalityRisks` array at start of month

### Phase 3: Migrate High-Priority Phases (4-6 hours, PARALLEL)
Spawn 5 feature-implementer agents in parallel:

- [ ] **Agent 1**: Migrate FamineSystemPhase
- [ ] **Agent 2**: Migrate RadiationSystemPhase
- [ ] **Agent 3**: Migrate militarySystem
- [ ] **Agent 4**: Migrate wetBulbEvents
- [ ] **Agent 5**: Migrate antimicrobialResistance

Each agent:
1. Replace direct `pop.population -=` with `addMortalityRisk()`
2. Remove direct `deathsByCategory` updates (Bayesian system handles)
3. Add appropriate risk type, proximate/root causes, confidence
4. Test that phase still works

### Phase 4: Deprecate Old Functions (1 hour)
- [ ] Mark `applyDeathsWithCap()` as deprecated
- [ ] Mark `applyImmediateDeaths()` as deprecated
- [ ] Add deprecation warnings
- [ ] Update all remaining calls to use Bayesian system

### Phase 5: Update Regional/Country Systems (2 hours)
- [ ] Verify regional death aggregation works
- [ ] Verify country death tracking works
- [ ] Ensure global aggregation is correct

### Phase 6: Monte Carlo Validation (1 hour)
- [ ] Run N=10 Monte Carlo
- [ ] Verify no regressions in outcome distributions
- [ ] Verify death tracking is correct
- [ ] Verify no 8-trillion population bugs

**Total Estimated Time**: 11-13 hours

## Migration Template

For each phase file, replace:

```typescript
// ❌ OLD WAY (direct modification)
const deaths = calculateDeaths();
state.humanPopulationSystem.population -= deaths;
state.humanPopulationSystem.deathsByCategory.famine += deaths;
state.humanPopulationSystem.deathsByRootCause.resource += deaths;
```

With:

```typescript
// ✅ NEW WAY (Bayesian risk accumulation)
import { addMortalityRisk } from '@/simulation/bayesianMortality';

const baseRisk = calculateMortalityRate(); // As fraction, not absolute deaths
addMortalityRisk(state.humanPopulationSystem, {
  type: 'famine',           // Risk type (affects demographic vulnerability)
  baseRisk: baseRisk,       // 0.01 = 1% base risk
  proximate: 'famine',      // What killed them
  root: 'resource',         // Why it happened
  confidence: 'HIGH',       // Attribution confidence
  month: state.currentMonth,
  description: 'Extreme famine in Sub-Saharan Africa',
  scope: 'REGIONAL',        // Optional: if regional
  region: 'Sub-Saharan Africa',
  exposedFraction: 0.3,     // 30% of population exposed
});
```

At month end, `BayesianMortalityResolutionPhase` will:
1. Compound all risks using Bayesian formula
2. Apply demographic vulnerabilities
3. Enforce mortality caps
4. Update `deathsByCategory` and `deathsByRootCause` automatically
5. Clear `mortalityRisks` array for next month

## Success Criteria

- [x] Bayesian mortality system implemented and tested
- [ ] All 5 high-priority phases migrated
- [ ] Old functions deprecated
- [ ] Monte Carlo validation passes (N=10)
- [ ] No population corruption bugs
- [ ] Death tracking matches expected values
- [ ] Demographic vulnerabilities working correctly

## Research Backing

See `/research/mortality_caps_historical_data_20251027.md` for full citations (21 sources).

Key findings:
- Malnutrition × Disease = 2.63× multiplier (HIGH confidence)
- Monthly caps: 2.8% (Holodomor), 1.7% (nuclear winter)
- Socioeconomic differentials: 2-3× normally, compress to 1.1-1.5× in extreme crises
- Bayesian compounding: P(death) = 1 - ∏(1 - p_i × v_i)
