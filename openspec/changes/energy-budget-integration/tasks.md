# H-1 Energy Budget Integration - Task Breakdown

## Phase 1: Core Energy Consumers (2 days)

### T1.1: AI Infrastructure Resources Integration (4-6 hours)

**File:** `src/simulation/aiInfrastructureResources.ts`

**Current State:**
```typescript
// Lines 70-75: Independent energy calculation
const ENERGY_BASE_CONSUMPTION = 500; // MW
const ENERGY_PER_CAPABILITY_POINT = 200; // MW

// No integration with EnergyBudgetPhase
```

**Required Changes:**

1. **Add energy budget import and assertions**
   ```typescript
   import { assertStateProperty } from './utils/assertions';
   ```

2. **Modify `updateAIInfrastructureResources()`**
   - Read `state.energyBudget.allocations['elective']`
   - Calculate nominal energy demand (existing logic)
   - Apply `effectivenessMultiplier` to actual consumption
   - Log constraint impact if multiplier < 0.9

3. **Add energy constraint logging**
   ```typescript
   if (effectivenessMultiplier < 0.9) {
     console.log(`📊⚡ AI datacenter growth constrained by electricity: ${(effectivenessMultiplier * 100).toFixed(1)}% effective`);
   }
   ```

4. **Update GameState interface** (if needed)
   - Check if `aiInfrastructureResources` needs `constrainedEnergyMW` field
   - Add for debugging/monitoring

**Test Cases:**
- Unconstrained scenario: multiplier = 1.0 → no change
- Moderate constraint: multiplier = 0.7 → 30% growth reduction
- Severe constraint: multiplier = 0.3 → 70% growth reduction
- God mode: All TIER 4 depleted → AI growth near-zero

**Acceptance:**
- ✅ Type check passes
- ✅ Unit tests cover constraint scenarios
- ✅ Logging appears in god mode test
- ✅ No NaN/Infinity (assertions used)

---

### T1.2: Power Generation System Integration (6-8 hours)

**File:** `src/simulation/powerGeneration.ts`

**Current State:**
```typescript
// Lines 23-74: Independent AI power calculations
// - updateAIEfficiency()
// - updateQueryVolume()
// - updateAIInferencePower()
// - updateCryptoPower()
// - updateAITrainingPower()
```

**Required Changes:**

1. **Add energy budget integration to `updatePowerGeneration()`**
   - Read `state.energyBudget.allocations['elective']`
   - Extract `effectivenessMultiplier`

2. **Constrain AI inference power** (line 46)
   ```typescript
   function updateAIInferencePower(power: PowerGenerationSystem, effectivenessMultiplier: number) {
     const nominalPower = calculateNominalInferencePower(power);
     power.aiInferencePower = nominalPower * effectivenessMultiplier;
   }
   ```

3. **Constrain training spikes** (line 55)
   - Training events respect available capacity
   - If capacity exhausted, delay training or reduce scale

4. **Crypto mining competition** (line 49)
   - Crypto competes for same TIER 4 pool
   - Apply same multiplier or create sub-allocation

5. **Add constraint logging**
   ```typescript
   if (effectivenessMultiplier < 0.9) {
     console.log(`📊⚡ AI+crypto power constrained by grid capacity: ${(effectivenessMultiplier * 100).toFixed(1)}%`);
     console.log(`  AI inference: ${power.aiInferencePower.toFixed(0)} MW (nominal ${nominalInference.toFixed(0)} MW)`);
     console.log(`  Crypto: ${power.cryptoPower.toFixed(0)} MW (nominal ${nominalCrypto.toFixed(0)} MW)`);
   }
   ```

**Design Decision:**
- **Should training spikes be separately allocated?**
  - Option A: Training competes with inference for TIER 4
  - Option B: Training gets separate allocation (TIER 2 research priority)
  - **Recommendation:** Option A (simpler, training is elective)

**Test Cases:**
- Normal growth: multiplier = 1.0 → existing behavior
- Grid constraint: multiplier = 0.5 → AI+crypto both halved
- Training spike during constraint: Event delayed or scaled down
- Crypto policy shutdown: More capacity for AI

**Acceptance:**
- ✅ Type check passes
- ✅ Integration tests with EnergyBudgetPhase
- ✅ Training spikes don't violate constraints
- ✅ Crypto + AI total ≤ allocated capacity

---

### T1.3: EnergyBudgetPhase Enhancements (2-3 hours)

**File:** `src/simulation/engine/phases/EnergyBudgetPhase.ts`

**Current State:**
- TIER 4 'elective' exists but not explicitly tracked
- Conflict logging generic (doesn't break down AI vs crypto vs UBI)

**Required Changes:**

1. **Add sub-category tracking for TIER 4**
   ```typescript
   interface EnergyAllocation {
     category: string;
     tWhAllocated: number;
     effectivenessMultiplier: number;
     subCategories?: {  // NEW
       aiDatacenter?: number;
       crypto?: number;
       ubiCompute?: number;
       other?: number;
     };
   }
   ```

2. **Calculate sub-allocations**
   - If TIER 4 over-subscribed, split proportionally
   - AI datacenter: based on aiInfrastructureResources demand
   - Crypto: based on powerGeneration crypto demand
   - UBI: based on UBI system demand (if exists)

3. **Improve conflict logging**
   ```typescript
   if (tier4Conflict) {
     console.log(`⚡🚨 TIER 4 (Elective) electricity over-subscribed by ${overagePercent.toFixed(0)}%`);
     console.log(`  AI datacenters: ${aiDemand.toFixed(0)} TWh (allocated ${aiAllocated.toFixed(0)} TWh)`);
     console.log(`  Crypto mining: ${cryptoDemand.toFixed(0)} TWh (allocated ${cryptoAllocated.toFixed(0)} TWh)`);
     console.log(`  UBI compute: ${ubiDemand.toFixed(0)} TWh (allocated ${ubiAllocated.toFixed(0)} TWh)`);
   }
   ```

4. **Add effectiveness multiplier per sub-category**
   - AI might get 0.6× (higher priority within TIER 4)
   - Crypto might get 0.4× (lower priority)
   - UBI compute might get 0.7× (citizen welfare)

**Design Decision:**
- **Should sub-priorities exist within TIER 4?**
  - Current: All TIER 4 treated equally
  - Proposed: AI > UBI compute > crypto (within TIER 4)
  - **Recommendation:** Start equal, add sub-priority if needed later

**Test Cases:**
- TIER 4 unconstrained: All get 1.0× multiplier
- TIER 4 over-subscribed: Multipliers < 1.0, proportional reduction
- Sub-category logging: Clear breakdown of AI vs crypto vs UBI

**Acceptance:**
- ✅ Sub-category tracking working
- ✅ Conflict logging shows breakdown
- ✅ Proportional allocation correct (sum ≤ TIER 4 capacity)

---

## Phase 2: Technology Effects (1 day)

### T2.1: Effects Engine Integration (4-6 hours)

**File:** `src/simulation/techTree/effectsEngine.ts`

**Current State:**
- Tech effects apply directly to game state
- Some techs energy-intensive (hydrogen, industrial electrification)
- No energy constraint checks

**Discovery Needed:**
1. Which tech effects consume energy?
2. How to map techs to energy budget categories?
3. Should effectiveness degrade or deployment fail under constraint?

**Required Changes:**

1. **Add energy budget checks to `applyTechEffects()`**
   - For energy-consuming techs, read relevant allocation
   - Apply effectiveness multiplier to tech effects

2. **Energy-consuming tech mapping**
   ```typescript
   const ENERGY_CONSUMING_TECHS: Record<string, {
     category: 'essential' | 'high' | 'climate' | 'elective';
     energyTWhPerYear: number;
   }> = {
     'green-hydrogen': { category: 'climate', energyTWhPerYear: 5250 },
     'industrial-electrification': { category: 'high', energyTWhPerYear: 3000 },
     'transport-electrification': { category: 'high', energyTWhPerYear: 2500 },
     // ... etc
   };
   ```

3. **Effectiveness degradation pattern**
   ```typescript
   if (ENERGY_CONSUMING_TECHS[tech.id]) {
     const allocation = state.energyBudget.allocations[category];
     const multiplier = allocation?.effectivenessMultiplier ?? 1.0;
     effectiveImpact = nominalImpact * multiplier;
   }
   ```

**Test Cases:**
- Unconstrained: Tech effects at full strength
- TIER 3 constrained: Climate techs degraded proportionally
- TIER 2 constrained: Industrial/transport electrification slowed

**Acceptance:**
- ✅ Energy-consuming techs identified
- ✅ Effectiveness scales with energy availability
- ✅ Non-energy techs unaffected

---

### T2.2: UBI Compute Discovery & Integration (2-3 hours)

**Search Strategy:**
1. Grep for "UBI", "universal basic", "compute allocation"
2. Check if UBI system implemented yet
3. If exists: Determine energy consumption model
4. If missing: Document integration pattern for future

**If UBI Compute Exists:**

1. **Integration pattern**
   - UBI compute uses TIER 4 'elective' allocation
   - Competes with AI datacenter and crypto
   - Calculate demand based on population × compute per capita

2. **Add to EnergyBudgetPhase**
   ```typescript
   const ubiDemand = calculateUBIComputeDemand(state);
   tier4Demand += ubiDemand;
   ```

3. **Constrain UBI compute effectiveness**
   - If energy limited, reduce compute per capita
   - Log impact on UBI program effectiveness

**If UBI Compute Missing:**
- Document integration pattern in proposal
- Add TODO for future UBI implementation
- No code changes needed

**Acceptance:**
- ✅ UBI compute search complete (exists or confirmed absent)
- ✅ If exists: Integrated with TIER 4 allocation
- ✅ If missing: Pattern documented for future

---

## Phase 3: Validation & Review (0.5 day)

### T3.1: God Mode Testing (2-3 hours)

**Test Scenario:**
1. Deploy all energy-intensive techs simultaneously:
   - DAC at gigatonne scale (15,000 TWh/year)
   - Green hydrogen (5,250 TWh/year)
   - AI datacenter max growth
   - Crypto mining enabled
   - Industrial + transport electrification
   - **Total:** 30,000+ TWh/year (exceeds global capacity 29,000 TWh)

2. Expected behavior:
   - ❌ OLD: Simulation collapses (impossible energy consumption)
   - ✅ NEW: Energy budget constrains, effectiveness multipliers < 1.0
   - Essential services get priority (40-50% reserved)
   - Climate tech gets TIER 3 (10-20%)
   - AI/crypto get TIER 4 (5-10%)
   - Conflict logging shows competition

**Validation:**
- Run god mode script
- Check logs for energy constraint warnings
- Verify simulation doesn't collapse
- Confirm effectiveness multipliers applied

**Monte Carlo (N≥10):**
- Seed: "h1-god-mode-validation"
- Scenario: All techs deployed by month 60
- Check: CV < 0.01% (determinism)
- Check: Outcome distribution shifts (constrained scenarios → different outcomes)

**Acceptance:**
- ✅ God mode runs without collapse
- ✅ Energy constraints logged clearly
- ✅ Monte Carlo deterministic (CV < 0.01%)
- ✅ Effectiveness multipliers correct (checked manually for 1-2 runs)

---

### T3.2: Architecture Review (Quality Gate 2) (1-2 hours)

**Spawn:** architecture-skeptic

**Review Focus:**
1. **Performance:**
   - Energy budget checks per step: < 5ms overhead?
   - Redundant calculations eliminated?
   - Allocations cached, not recalculated every phase?

2. **State Propagation:**
   - Energy constraints visible across all consumers?
   - No missing integrations (discovered new energy consumer)?
   - State fields correctly typed?

3. **Complexity:**
   - Integration pattern simple and consistent?
   - ClimateDeploymentPhase pattern followed?
   - Documentation clear for future integrations?

**Action Items:**
- Address CRITICAL issues immediately
- Address HIGH issues before merge
- Document MEDIUM issues for future cleanup

**Acceptance:**
- ✅ Architecture review complete (Grade B+ or better)
- ✅ No CRITICAL issues
- ✅ HIGH issues resolved or waived with justification

---

### T3.3: Documentation & Archival (1 hour)

**Wiki Update:**
1. Add energy budget integration pattern to `docs/wiki/README.md`
2. Document which systems use which tier
3. Add debugging guide for energy constraint issues

**OpenSpec:**
1. Mark H-1 COMPLETE in `openspec/specs/project/spec.md`
2. Merge delta into `openspec/specs/simulation/spec.md`
3. Update verification queue (no new research needed)

**Implementation History:**
1. Archive to `docs/implementation-history/h1_energy_budget_integration_20251210.md`
2. Include: Proposal, tasks, test results, architecture review, lessons learned
3. Add to session summary

**Acceptance:**
- ✅ Wiki updated (energy budget section)
- ✅ OpenSpec deltas merged
- ✅ Implementation history archived
- ✅ All commits pushed

---

## Summary

**Total Effort:** 2-3 days (16-24 hours)
- Phase 1: 12-17 hours (AI infrastructure + power generation + budget enhancements)
- Phase 2: 6-9 hours (effects engine + UBI discovery)
- Phase 3: 4-6 hours (god mode testing + architecture review + docs)

**Quality Gates:**
- Gate 1: Research Validation ✅ COMPLETE (Dec 9, 2025)
- Gate 2: Architecture Review (MANDATORY)
- Gate 3: Code Quality (OPTIONAL, only if Gate 2 finds concerns)

**Success Criteria:**
- God mode doesn't collapse
- AI datacenter growth constrained by TIER 4 allocation
- Monte Carlo deterministic (CV < 0.01%)
- Clear energy constraint logging
