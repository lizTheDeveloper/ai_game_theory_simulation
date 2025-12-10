# H-1 Energy Budget Integration - Task List

**Assigned to:** simulation-maintainer (Roy)
**Coordinator:** orchestrator-1
**Start Date:** December 10, 2025
**Estimate:** 2-3 days

---

## Phase 1: Core Integration (Priority 1 - CRITICAL)

### Task 1.1: AI Infrastructure Energy Integration

**File:** `src/simulation/aiInfrastructureResources.ts`
**Complexity:** MEDIUM
**Estimate:** 4-6 hours

**Current Behavior:**
- Direct energy calculation: `ENERGY_BASE_CONSUMPTION + ENERGY_PER_CAPABILITY_POINT * capability`
- No priority constraints or energy budget awareness
- Operates independently of global capacity

**Required Changes:**

1. **Add energy budget query:**
   ```typescript
   // In calculateAIInfrastructureConsumption():

   // Step 1: Calculate unconstrained demand (what we'd use with unlimited energy)
   const baseDemandMW = ENERGY_BASE_CONSUMPTION +
                        ENERGY_PER_CAPABILITY_POINT * aggregateCapability;

   // Step 2: Query energy budget allocation
   const energyMultiplier = getEnergyMultiplier(state, 'ai-datacenter');

   // Step 3: Apply constraint
   const constrainedEnergyMW = baseDemandMW * energyMultiplier;

   // Step 4: Scale water consumption accordingly
   const waterConsumption = calculateWater(constrainedEnergyMW);
   ```

2. **Add helper function:**
   ```typescript
   function getEnergyMultiplier(state: GameState, category: string): number {
     if (!state.energyBudget?.enabled) {
       return 1.0; // Feature flag off = no constraints
     }

     const allocation = state.energyBudget.allocations[category];
     if (!allocation) {
       return 1.0; // Category not tracked = no constraint
     }

     return assertFinite(
       allocation.effectivenessMultiplier,
       {
         location: 'getEnergyMultiplier',
         valueName: 'effectivenessMultiplier',
         month: state.currentMonth,
         additionalInfo: { category }
       }
     );
   }
   ```

3. **Update return values:**
   - Keep `demand` field for tracking what was requested
   - Add `allocated` field for what was actually provided
   - Add `constrainedByEnergy` boolean flag

**Testing:**
- Unit test: Energy multiplier 0.5 → consumption halved
- Unit test: Feature flag off → no constraint (multiplier 1.0)
- Integration: Monte Carlo N=10, verify determinism

**Success Criteria:**
- [ ] AI datacenter energy reads from `energyBudget.allocations['ai-datacenter']`
- [ ] Water consumption scales with allocated energy (not demand)
- [ ] Feature flag works correctly
- [ ] No NaN/Infinity in calculations
- [ ] Deterministic (same seed = same results)

---

### Task 1.2: Power Generation System Unification

**File:** `src/simulation/powerGeneration.ts`
**Complexity:** HIGH
**Estimate:** 6-8 hours

**Current Behavior:**
- Separate datacenter power tracking (`dataCenterPower`, `aiInferencePower`, `aiTrainingPower`)
- Independent of energy budget system
- Parallel energy modeling

**Required Changes:**

1. **Refactor to read from energy budget:**
   ```typescript
   // In updatePowerGeneration():

   // BEFORE (separate tracking):
   // power.dataCenterPower = aiInference + aiTraining + crypto + traditional;

   // AFTER (unified budget):
   if (state.energyBudget?.enabled) {
     // Read allocated energy from budget
     const aiDatacenterAlloc = state.energyBudget.allocations['ai-datacenter'];
     const advancedComputeAlloc = state.energyBudget.allocations['advanced-compute'];

     // Convert TWh/year to MW (for compatibility)
     // 1 TWh/year = 1,000,000 MWh/year = 1,000,000 / 8,760 MW ≈ 114.16 MW
     const twhToMW = 114.16;

     power.aiInferencePower = aiDatacenterAlloc.allocatedTWh * twhToMW;
     power.dataCenterPower = power.aiInferencePower +
                             power.aiTrainingPower +
                             power.cryptoPower +
                             power.traditionalCloudPower;
   } else {
     // Legacy calculation (pre-energy-budget)
     // Keep existing logic for backwards compatibility
   }
   ```

2. **Update demand tracking:**
   - Keep growth projections as feedback to capacity expansion
   - Track "demand vs allocated" for reporting
   - Feed demand back to EnergyBudgetPhase (Phase 2 work)

3. **Remove duplicate tracking:**
   - Deprecate separate power calculation when feature flag enabled
   - Maintain backwards compatibility for old saves

**Testing:**
- Unit test: Energy budget allocation correctly converted to MW
- Unit test: Feature flag off → legacy calculation
- Integration: Compare energy budget vs power gen calculations
- Monte Carlo N=10: Verify consistency

**Success Criteria:**
- [ ] Power generation reads from energy budget when enabled
- [ ] MW conversion correct (TWh/year → MW)
- [ ] Legacy calculation preserved (backwards compatibility)
- [ ] No duplicate energy tracking
- [ ] Deterministic

---

### Task 1.3: EnergyBudgetPhase Enhancement

**File:** `src/simulation/engine/phases/EnergyBudgetPhase.ts`
**Complexity:** LOW
**Estimate:** 2-3 hours

**Current Behavior:**
- Tracks climate tech categories (DAC, hydrogen, SAI)
- Tracks AI datacenter, advanced compute
- Doesn't validate total demand vs capacity

**Required Changes:**

1. **Improve tech ID → energy category mapping:**
   ```typescript
   private mapTechToEnergyCategory(techId: string): string | null {
     // Existing mappings (climate, AI, infrastructure)
     // ...

     // Add crypto mining (if tech exists)
     if (techId.includes('crypto') || techId.includes('bitcoin')) {
       return 'crypto-mining'; // New category, TIER 4
     }

     // Add energy storage (future work)
     if (techId.includes('battery') || techId.includes('storage')) {
       return null; // Not energy consumer, skip
     }

     return null;
   }
   ```

2. **Add demand validation:**
   ```typescript
   // In execute(), after calculating total demand:

   if (totalDemand > totalCapacity * 1.5) {
     console.log(`⚠️ ENERGY CRISIS: Demand ${totalDemand.toFixed(0)} TWh exceeds capacity ${totalCapacity.toFixed(0)} TWh by ${((totalDemand/totalCapacity - 1) * 100).toFixed(0)}%`);

     // Log top consumers
     const topConsumers = Object.entries(demands)
       .sort((a, b) => b[1].demandTWh - a[1].demandTWh)
       .slice(0, 5)
       .map(([cat, d]) => `${cat}: ${d.demandTWh.toFixed(0)} TWh`)
       .join(', ');

     console.log(`  Top consumers: ${topConsumers}`);
   }
   ```

3. **Add crypto mining category:**
   - TIER 4 (elective, same priority as AI)
   - Energy: 100-200 TWh/year (policy-dependent)
   - Can be heavily constrained by policy

**Testing:**
- Unit test: Demand validation triggers warning at 150% capacity
- Integration: All major consumers appear in allocations
- God mode test: Deploy all 92 techs, check energy crisis detection

**Success Criteria:**
- [ ] All major energy consumers registered in allocations
- [ ] Demand > 150% capacity triggers warning
- [ ] Tech ID mapping covers all energy-intensive techs
- [ ] Crypto mining category added (if relevant techs exist)

---

## Phase 2: Compute & Effects Integration (Priority 2 - HIGH)

**Status:** PENDING (after Phase 1 complete)

### Task 2.1: Compute Allocation Constraints

**File:** `src/simulation/engine/phases/ComputeAllocationPhase.ts`
**Estimate:** 3-4 hours

**Required Changes:**
- Query `energyBudget.allocations['advanced-compute']` before allocation
- Scale allocated compute by energy effectiveness multiplier
- Add "energy-limited" logging when constrained

### Task 2.2: Tech Effects Integration

**File:** `src/simulation/techTree/effectsEngine.ts`
**Estimate:** 4-6 hours

**Required Changes:**
- Identify energy-intensive technologies
- Query appropriate energy budget category for each
- Apply effectiveness multiplier to tech effects

---

## Phase 3: Secondary Integration (Priority 3 - MEDIUM)

**Status:** PENDING (after Phase 2 complete)

### Task 3.1: Stochastic Innovation

**File:** `src/simulation/engine/phases/StochasticInnovationPhase.ts`
**Estimate:** 2-3 hours

**Required Changes:**
- Energy-intensive breakthroughs check feasibility
- Low energy availability delays deployment

### Task 3.2: Government Actions

**Files:**
- `src/simulation/government/actions/crisisActions.ts`
- `src/simulation/government/actions/researchActions.ts`
**Estimate:** 2-3 hours

**Required Changes:**
- Infrastructure-heavy actions query budget
- Provide "insufficient energy" feedback

---

## Testing Strategy

### Unit Tests
- [ ] Energy multiplier calculation (0.0 to 1.0 range)
- [ ] Feature flag behavior (enabled vs disabled)
- [ ] TWh/year to MW conversion
- [ ] Demand validation triggers

### Integration Tests
- [ ] AI infrastructure + energy budget
- [ ] Power generation + energy budget
- [ ] Climate deployment + energy budget (already working)
- [ ] All consumers in single simulation

### Monte Carlo Validation
- [ ] Baseline (before changes): N=10, seed=12345
- [ ] Phase 1 complete: N=10, seed=12345
- [ ] Phase 2 complete: N=10, seed=12345
- [ ] God mode test: Deploy all 92 techs

### Determinism Check
- [ ] Run same seed 3 times, verify identical results
- [ ] Energy allocations identical across runs
- [ ] No module-level state pollution

---

## Acceptance Criteria

**Phase 1 Complete:**
- [ ] AI infrastructure uses energy budget
- [ ] Power generation reads from energy budget
- [ ] EnergyBudgetPhase tracks all consumers
- [ ] Monte Carlo validation passes (CV < 0.01%)
- [ ] No CRITICAL or HIGH architecture issues
- [ ] Code review passes (simulation-maintainer standards)

**Full Implementation Complete:**
- [ ] All Priority 1-3 consumers integrated
- [ ] God mode doesn't cause energy-driven collapse
- [ ] Energy constraints limit AI datacenter growth appropriately
- [ ] Climate tech effectiveness scales with energy allocation
- [ ] Documentation complete (wiki updated)

---

## Notes for Roy

**Defensive coding requirements:**
- Use `assertFinite()` for all energy calculations
- No silent fallbacks (fail loudly if data missing)
- Feature flag must be checked consistently
- Unit conversion clearly documented (TWh/year ↔ MW)

**Emoji conventions:**
- ⚠️ for energy warnings (demand > capacity)
- 🚨 for energy crisis (demand > 150% capacity)
- ⚡ for energy allocation events
- 🏭 for industrial/datacenter energy

**Research validation:**
- All parameters already validated (QG1 PASSED)
- AI datacenter: 415-460 TWh baseline (not 730 TWh)
- Priority tiers: Essential (1) → High (2) → Climate (3) → Elective (4)

**Integration pattern:**
Follow ClimateDeploymentPhase as reference implementation:
1. Query energy budget for category
2. Get effectiveness multiplier
3. Apply to base calculation
4. Update state with constrained values

**Questions/blockers:**
Post to implementation channel with [QUESTION] or [BLOCKED] status tag
