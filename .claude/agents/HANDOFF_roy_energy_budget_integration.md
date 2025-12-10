# HANDOFF: Roy (simulation-maintainer) - H-1 Energy Budget Integration

**Agent:** simulation-maintainer (Roy)
**Feature:** H-1 Energy Budget System Integration
**Priority:** HIGH (Architecture Integration)
**Timeline:** 2-3 days
**Created:** 2025-12-10

## Context

EnergyBudgetPhase exists and works correctly with ClimateDeploymentPhase (Dec 9, 2025 implementation). However, other energy consumers operate independently, creating parallel constraint systems. Your task: Migrate all energy consumers to use the unified energy budget.

**Research:** Already validated (QG1 PASSED Dec 9, 2025)
- `research/energy_budget_constraints_20251209.md` (Grade B+)
- `reviews/research_validation_energy_budget_20251209.md`

**Working Pattern:** ClimateDeploymentPhase integration (reference implementation)

## Your Mission

Integrate 3 major energy consumers with EnergyBudgetPhase:

1. **AI Infrastructure Resources** (4-6 hours)
   - File: `src/simulation/aiInfrastructureResources.ts`
   - Current: 500 MW base + 200 MW/capability (independent)
   - Target: Use TIER 4 'elective' allocation
   - Pattern: Read effectivenessMultiplier, apply to growth

2. **Power Generation System** (6-8 hours)
   - File: `src/simulation/powerGeneration.ts`
   - Current: AI inference/training/crypto separate logic
   - Target: Constrain by TIER 4 allocation
   - Pattern: Apply multiplier to AI+crypto total

3. **EnergyBudgetPhase Enhancements** (2-3 hours)
   - File: `src/simulation/engine/phases/EnergyBudgetPhase.ts`
   - Target: Sub-category tracking (AI vs crypto vs UBI)
   - Pattern: Improve conflict logging, proportional allocation

## Integration Pattern (from ClimateDeploymentPhase)

```typescript
// Step 1: Import assertions
import { assertStateProperty } from '@/simulation/utils/assertions';

// Step 2: Read energy budget (in phase execute function)
const energyBudget = assertStateProperty(
  state,
  'energyBudget',
  { location: 'YourPhase', month: state.currentMonth }
);

// Step 3: Get allocation for category
const allocation = energyBudget.allocations['elective']; // or 'climate', 'high', 'essential'
const effectivenessMultiplier = allocation?.effectivenessMultiplier ?? 1.0;

// Step 4: Apply to nominal capacity
const nominalCapacity = calculateNominalCapacity(state);
const effectiveCapacity = nominalCapacity * effectivenessMultiplier;

// Step 5: Log if constrained
if (effectivenessMultiplier < 0.9) {
  console.log(`📊⚡ [System] constrained by electricity: ${(effectivenessMultiplier * 100).toFixed(1)}% effective`);
}
```

## Task 1: AI Infrastructure Resources (4-6 hours)

**File:** `src/simulation/aiInfrastructureResources.ts`

**Current Code (lines 70-75):**
```typescript
const ENERGY_BASE_CONSUMPTION = 500; // MW
const ENERGY_PER_CAPABILITY_POINT = 200; // MW
```

**Required Changes:**

1. **Modify `updateAIInfrastructureResources()`:**
   - Add energy budget read (use TIER 4 'elective')
   - Calculate nominal energy demand (existing logic)
   - Apply effectivenessMultiplier to actual consumption
   - Log constraint impact if multiplier < 0.9

2. **Add to GameState interface** (if needed):
   - Consider adding `constrainedEnergyMW` field for debugging
   - Check `src/types/game.ts` AIInfrastructureResources interface

3. **Unit tests:**
   - Create `src/simulation/__tests__/aiInfrastructureResources.test.ts`
   - Test: Unconstrained (multiplier 1.0) → existing behavior
   - Test: Moderate constraint (0.7) → 30% reduction
   - Test: Severe constraint (0.3) → 70% reduction

**Example Implementation:**
```typescript
export function updateAIInfrastructureResources(state: GameState): void {
  // Read energy budget
  const energyBudget = assertStateProperty(
    state,
    'energyBudget',
    { location: 'updateAIInfrastructureResources', month: state.currentMonth }
  );

  const electiveAllocation = energyBudget.allocations['elective'];
  const energyMultiplier = electiveAllocation?.effectivenessMultiplier ?? 1.0;

  // Calculate nominal energy demand
  const capability = state.aiSystem.capabilities.aggregate;
  const nominalEnergyMW = ENERGY_BASE_CONSUMPTION + (capability * ENERGY_PER_CAPABILITY_POINT);

  // Apply constraint
  const effectiveEnergyMW = nominalEnergyMW * energyMultiplier;

  // Update state
  state.aiInfrastructureResources.energyConsumptionMW = effectiveEnergyMW;

  // Log if constrained
  if (energyMultiplier < 0.9) {
    console.log(`📊⚡ AI datacenter growth constrained by electricity: ${(energyMultiplier * 100).toFixed(1)}% effective`);
    console.log(`  Nominal: ${nominalEnergyMW.toFixed(0)} MW, Effective: ${effectiveEnergyMW.toFixed(0)} MW`);
  }
}
```

**Acceptance Criteria:**
- ✅ Type check passes
- ✅ Unit tests cover all constraint scenarios
- ✅ Logging appears in constrained scenarios
- ✅ No NaN/Infinity (assertions used correctly)

---

## Task 2: Power Generation System (6-8 hours)

**File:** `src/simulation/powerGeneration.ts`

**Current Structure:**
- `updateAIEfficiency()` - Line 40
- `updateQueryVolume()` - Line 43
- `updateAIInferencePower()` - Line 46
- `updateCryptoPower()` - Line 49
- `updateAITrainingPower()` - Line 55

**Required Changes:**

1. **Modify `updatePowerGeneration()`:**
   - Read TIER 4 'elective' allocation (like Task 1)
   - Pass effectivenessMultiplier to sub-functions

2. **Constrain AI inference power:**
   ```typescript
   function updateAIInferencePower(power: PowerGenerationSystem, effectivenessMultiplier: number) {
     const nominalPower = power.queriesPerMonth / power.inferenceEfficiency;
     power.aiInferencePower = nominalPower * effectivenessMultiplier;
   }
   ```

3. **Constrain crypto mining:**
   - Apply same multiplier as AI
   - OR create sub-allocation (AI 60%, crypto 40% of TIER 4)

4. **Training spikes:**
   - Respect available capacity
   - If capacity exhausted, delay training or reduce scale
   - Add to training event queue with energy check

5. **Logging:**
   ```typescript
   if (effectivenessMultiplier < 0.9) {
     console.log(`📊⚡ AI+crypto power constrained by grid capacity: ${(effectivenessMultiplier * 100).toFixed(1)}%`);
     console.log(`  AI inference: ${power.aiInferencePower.toFixed(0)} MW`);
     console.log(`  Crypto: ${power.cryptoPower.toFixed(0)} MW`);
     console.log(`  Training: ${power.aiTrainingPower.toFixed(0)} MW`);
   }
   ```

**Design Decision:**
- Should training spikes be separately allocated?
  - **Option A:** Training competes with inference for TIER 4 (simpler)
  - **Option B:** Training gets TIER 2 (research priority)
  - **Recommendation:** Option A (start simple, iterate if needed)

**Acceptance Criteria:**
- ✅ Type check passes
- ✅ Integration tests with EnergyBudgetPhase
- ✅ AI + crypto total ≤ allocated TIER 4 capacity
- ✅ Training spikes respect constraints

---

## Task 3: EnergyBudgetPhase Enhancements (2-3 hours)

**File:** `src/simulation/engine/phases/EnergyBudgetPhase.ts`

**Current State:**
- TIER 4 'elective' exists but not explicitly tracked
- Conflict logging generic (doesn't break down AI vs crypto)

**Required Changes:**

1. **Add sub-category tracking:**
   - Extend EnergyAllocation interface (src/types/game.ts)
   - Add `subCategories` field for TIER 4 breakdown

2. **Calculate sub-allocations:**
   ```typescript
   // In EnergyBudgetPhase execute()
   const tier4Demand = {
     aiDatacenter: calculateAIDemand(state),
     crypto: calculateCryptoDemand(state),
     ubiCompute: calculateUBIDemand(state), // 0 if not implemented
   };

   const tier4Total = tier4Demand.aiDatacenter + tier4Demand.crypto + tier4Demand.ubiCompute;
   const tier4Available = globalCapacity * 0.10; // 10% for TIER 4

   if (tier4Total > tier4Available) {
     // Proportional reduction
     const reductionFactor = tier4Available / tier4Total;
     allocation.subCategories = {
       aiDatacenter: tier4Demand.aiDatacenter * reductionFactor,
       crypto: tier4Demand.crypto * reductionFactor,
       ubiCompute: tier4Demand.ubiCompute * reductionFactor,
     };
   }
   ```

3. **Improve conflict logging:**
   ```typescript
   if (tier4Total > tier4Available) {
     const overage = ((tier4Total - tier4Available) / tier4Available * 100);
     console.log(`⚡🚨 TIER 4 (Elective) electricity over-subscribed by ${overage.toFixed(0)}%`);
     console.log(`  AI datacenters: ${tier4Demand.aiDatacenter.toFixed(0)} TWh requested`);
     console.log(`  Crypto mining: ${tier4Demand.crypto.toFixed(0)} TWh requested`);
     console.log(`  Available: ${tier4Available.toFixed(0)} TWh`);
   }
   ```

**Acceptance Criteria:**
- ✅ Sub-category tracking working (AI vs crypto broken out)
- ✅ Conflict logging shows clear breakdown
- ✅ Proportional allocation correct (sum ≤ TIER 4 capacity)

---

## Phase 2: Technology Effects (If Time Permits)

**File:** `src/simulation/techTree/effectsEngine.ts`

**Discovery Task:**
1. Which tech effects consume energy?
2. Map techs to energy budget categories
3. Apply effectiveness multiplier to energy-consuming techs

**Energy-Consuming Techs (likely):**
- Green hydrogen (TIER 3 climate)
- Industrial electrification (TIER 2 high)
- Transport electrification (TIER 2 high)
- Advanced manufacturing (TIER 2 high)

**Pattern:**
```typescript
if (ENERGY_CONSUMING_TECHS[tech.id]) {
  const category = ENERGY_CONSUMING_TECHS[tech.id].category;
  const allocation = state.energyBudget.allocations[category];
  const multiplier = allocation?.effectivenessMultiplier ?? 1.0;
  effectiveImpact = nominalImpact * multiplier;
}
```

**Note:** Phase 2 can be a separate session if Phase 1 takes full 2 days.

---

## Testing Strategy

### Unit Tests (per task)
- Create test file for each modified system
- Cover: unconstrained, moderate constraint, severe constraint
- Verify: effectiveness multiplier applied correctly
- Check: no NaN/Infinity, assertions working

### Integration Tests
- Create `src/simulation/__tests__/energyBudgetIntegration.test.ts`
- Test: EnergyBudgetPhase → AI infrastructure constraint
- Test: EnergyBudgetPhase → power generation constraint
- Test: Multiple consumers competing for TIER 4

### God Mode Test Script
```bash
# Test all energy-intensive techs simultaneously
npx tsx scripts/testGodModeEnergy.ts > logs/god_mode_energy_$(date +%Y%m%d_%H%M%S).log 2>&1 &
```

**Expected:** Simulation runs, energy constraints logged, no collapse

### Monte Carlo Validation
```bash
# N=10 runs with god mode scenario
npx tsx scripts/monteCarloSimulation.ts --scenario=god-mode --runs=10 --seed=h1-validation > logs/mc_h1_validation_$(date +%Y%m%d_%H%M%S).log 2>&1 &
```

**Expected:** CV < 0.01%, deterministic outcomes

---

## Defensive Coding Requirements

**You MUST follow these patterns:**

1. **Always use assertions (NO silent fallbacks):**
   ```typescript
   // ❌ WRONG
   const budget = state.energyBudget ?? DEFAULT_BUDGET;

   // ✅ CORRECT
   const budget = assertStateProperty(state, 'energyBudget', {
     location: 'updateAIInfrastructure',
     month: state.currentMonth
   });
   ```

2. **Validate all calculations:**
   ```typescript
   const effectiveEnergy = assertFinite(nominalEnergy * multiplier, {
     location: 'updatePowerGeneration',
     valueName: 'effectiveEnergy',
     month: state.currentMonth,
     additionalInfo: { nominalEnergy, multiplier }
   });
   ```

3. **Use pictographic event language:**
   - 📊⚡ for energy constraint warnings
   - ⚡🚨 for CRITICAL energy conflicts
   - 📈 for energy allocation success

4. **Required RNG (not optional):**
   - If function needs randomness, RNG MUST be required parameter
   - No `Math.random()` fallbacks

---

## Deliverables

**Code Changes:**
1. `src/simulation/aiInfrastructureResources.ts` (AI infrastructure integration)
2. `src/simulation/powerGeneration.ts` (power generation integration)
3. `src/simulation/engine/phases/EnergyBudgetPhase.ts` (sub-category tracking)
4. `src/types/game.ts` (interface updates if needed)

**Tests:**
5. `src/simulation/__tests__/aiInfrastructureResources.test.ts` (unit tests)
6. `src/simulation/__tests__/powerGeneration.test.ts` (unit tests)
7. `src/simulation/__tests__/energyBudgetIntegration.test.ts` (integration tests)

**Validation:**
8. God mode test results (logs/)
9. Monte Carlo validation (N≥10, CV < 0.01%)
10. Type check PASS (npx tsc --noEmit)

**Documentation:**
11. Code comments explaining integration pattern
12. Update function docstrings with energy constraint behavior

---

## Next Steps After Implementation

1. **Push commits:**
   ```bash
   git add -A
   git commit -m "feat(H-1): Energy budget integration - AI infrastructure + power generation"
   git push origin auto/worker-$(date +%Y%m%d_%H%M%S)
   ```

2. **Post to implementation channel:**
   - Implementation complete
   - Test results summary
   - Ready for architecture review

3. **Orchestrator spawns architecture-skeptic:**
   - Review performance (energy checks < 5ms overhead)
   - Review state propagation (all consumers integrated)
   - Address CRITICAL/HIGH issues

4. **Documentation & archival:**
   - Update wiki (energy budget integration pattern)
   - Merge OpenSpec delta
   - Archive to implementation-history

---

## Questions/Blockers

**If you encounter issues:**
1. Check ClimateDeploymentPhase for working pattern
2. Verify EnergyBudgetPhase executing before your phase (check engine.ts order)
3. Post to implementation channel with specific blocker

**Common pitfalls:**
- Forgetting to pass RNG to phases (determinism breaks)
- Using `?? fallback` instead of assertions (regression to silent errors)
- Not logging energy constraints (makes debugging impossible)

---

**Timeline:** 2-3 days for Phase 1 (core integration)
**Priority:** HIGH (architecture integration, blocks god mode validation)
**Quality Gate:** Architecture review after implementation

Good luck, Roy! This is critical infrastructure work - take your time, follow defensive coding patterns, and make energy constraints explicit throughout the simulation.
