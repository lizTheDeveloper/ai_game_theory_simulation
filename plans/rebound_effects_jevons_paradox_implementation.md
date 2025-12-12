# Rebound Effects (Jevons Paradox) Implementation Plan

**Date:** December 12, 2025
**Priority:** HIGH (3 weeks overdue, 1 day effort, high ROI)
**Status:** READY FOR IMPLEMENTATION
**Assigned:** simulation-maintainer (Roy)

---

## Executive Summary

**Research Status:** ✅ VALIDATED (Grade B+)
- Research file: `research/energy_budget_constraints_20251209.md`
- Critique: `reviews/energy_budget_constraints_critique_20251210.md`
- Quality Gate 1: PASSED

**Implementation Gap:**
Rebound effects are PARTIALLY implemented (novel entities cleanup, AI demand elasticity) but the FULL energy efficiency rebound from research is MISSING. Research specifies 60% rebound coefficient for AI infrastructure (netGain = efficiency × 0.40) but current implementation uses demand elasticity multipliers instead.

**Impact:** Climate mitigation +15-30% longer, AI compute 2-3× faster growth

**Effort:** 4-6 hours (research done, parameters extracted)

---

## Research Foundation

From `research/energy_budget_constraints_20251209.md`:

### Key Finding: Rebound Effects Offset Efficiency Gains

**Lines 475-488:**
```
Historical Efficiency Gains (2023-2025):
- 120× improvement in energy efficiency (Joules per token) for LLM inference

BUT: Rebound Effects Offset Gains
- Google example: 33× efficiency gain since 2019, but emissions rose 50%
- Mechanism: Efficiency enables more usage, total consumption grows
- Implication: Cannot assume efficiency gains reduce absolute energy consumption

Net Effect for Simulation:
- Efficiency: +20-30%/year improvement
- Rebound: -60-80% of efficiency gains consumed by increased usage
- Net energy growth: 10-15%/year despite efficiency
```

### Parameter Specification (Lines 828-834)

```typescript
aiDatacenters: {
  baseline2024: 460,         // Global total
  growthRate: 0.20,          // 20%/year CAGR
  trainingMultiplier: 7.5,   // Training vs. inference energy
  efficiencyGain: 0.25,      // 25%/year efficiency improvement
  reboundEffect: 0.60,       // 60% of efficiency gains offset by usage growth
},
```

### Real-World Examples
- **Google (2019-2024):** 33× ML efficiency improvement → 50% emission INCREASE
- **AI compute (2015-2020):** 10× efficiency → 100× usage = 10× MORE resources
- **Sorrell et al. (2024):** 30-60% of efficiency gains rebounded across sectors

---

## Current State Analysis

### What Exists (Partial Implementation)

1. **Novel Entities Cleanup Rebound:**
   - File: `src/simulation/techTree/comprehensiveTechTree.ts`
   - Implementation: `reboundCoefficient: 0.15` (lines 1135, 1174, 1335)
   - Range: `reboundUncertaintyRange: [0.05, 0.50]`
   - Status: ✅ Complete for novel entities

2. **AI Infrastructure Demand Elasticity:**
   - File: `src/simulation/aiInfrastructureResources.ts`
   - Implementation: `demandElasticity = 1.3 (early) / 1.1 (mature)` (line 138)
   - Comment: "Oct 29, 2025: Demand elasticity (Jevons Paradox)"
   - Status: ⚠️ Related concept but NOT the explicit 60% coefficient

### What's Missing (Implementation Required)

1. **AI Infrastructure Energy Rebound:** 60% coefficient NOT implemented
   - Current: Annual demand growth multipliers
   - Required: `netEfficiency = efficiency × (1 - 0.60)`

2. **Climate Tech Efficiency Rebound:** No rebound on DAC/solar efficiency improvements
   - Required: 30% rebound for climate tech (policy-constrained, lower than AI)

3. **Economic AI Productivity Rebound:** Productivity gains partially offset by usage
   - Required: 60% rebound on AI capability improvements

---

## Implementation Requirements

### 1. AI Infrastructure Energy Rebound (HIGHEST PRIORITY)

**Goal:** Implement explicit 60% rebound coefficient for energy efficiency improvements

**Target Files:**
- Primary: `src/simulation/engine/phases/EnergyBudgetPhase.ts`
- Secondary: `src/simulation/aiInfrastructureResources.ts`

**Current Code (aiInfrastructureResources.ts line 133-138):**
```typescript
// Oct 29, 2025: Demand elasticity (Jevons Paradox) - efficiency gains → increased usage
// Historical precedent: 2015-2020 AI saw 10× efficiency gains but 100× usage growth = 10× MORE resources
// Research: Patterson et al. (2022), Lei et al. (2025)
// Early stage (<5.0 capability): 30% annual demand increase (rapid adoption)
// Mature stage (≥5.0 capability): 10% annual demand increase (saturation)
const demandElasticity = totalCapability < 5.0 ? 1.3 : 1.1;
```

**Required Change:**
```typescript
// REBOUND EFFECTS (Jevons Paradox) - Research: energy_budget_constraints_20251209.md
// Google 2019-2024: 33× efficiency gain → 50% emission increase (not 33× reduction)
// Sorrell et al. (2024): 30-60% of efficiency gains rebounded
const EFFICIENCY_GAIN_PER_YEAR = 0.25;  // 25%/year technical improvement
const REBOUND_COEFFICIENT = 0.60;       // 60% offset (research line 833)
const netEfficiencyGain = EFFICIENCY_GAIN_PER_YEAR * (1 - REBOUND_COEFFICIENT);
// Result: 25% × 0.40 = 10% net energy reduction despite 25% technical improvement

// Apply to energy calculation:
const baselineEnergy = ENERGY_BASE_CONSUMPTION + (totalCapability * ENERGY_PER_CAPABILITY_POINT);
const yearsSinceBaseline = state.currentMonth / 12;
const technicalEfficiency = Math.pow(1 + EFFICIENCY_GAIN_PER_YEAR, yearsSinceBaseline);
const reboundMultiplier = Math.pow(1 + netEfficiencyGain, yearsSinceBaseline);
const actualEnergy = baselineEnergy / reboundMultiplier;  // NOT / technicalEfficiency
```

**Assertion Requirements:**
```typescript
import { assertFinite, assertInRange } from '@/simulation/utils/assertions';

const netEfficiencyGain = assertFinite(
  EFFICIENCY_GAIN_PER_YEAR * (1 - REBOUND_COEFFICIENT),
  { location: 'calculateAIEnergy', valueName: 'netEfficiencyGain', month: state.currentMonth }
);

assertInRange(REBOUND_COEFFICIENT, 0, 1, {
  location: 'calculateAIEnergy',
  valueName: 'REBOUND_COEFFICIENT',
  month: state.currentMonth
});
```

**Testing:**
```typescript
// Expected behavior:
// Year 0: 100 units energy
// Year 1 (technical): 100 / 1.25 = 80 units (25% efficiency improvement)
// Year 1 (with rebound): 100 / 1.10 = 90.9 units (10% net improvement)
// Year 5 (technical): 100 / 3.05 = 32.8 units (67% reduction)
// Year 5 (with rebound): 100 / 1.61 = 62.1 units (38% reduction)
```

### 2. Climate Tech Efficiency Rebound (MEDIUM PRIORITY)

**Goal:** Apply 30% rebound to DAC and solar efficiency improvements

**Target Files:**
- Primary: `src/simulation/engine/phases/ClimateDeploymentPhase.ts`
- Secondary: `src/simulation/engine/phases/EnergyBudgetPhase.ts`

**Rationale:** Climate tech has LOWER rebound (30% vs 60%) because:
- Deployment is policy-constrained, not market-driven
- Carbon pricing internalizes costs (unlike AI which has no carbon price)
- Explicit climate goals limit usage expansion

**Implementation:**
```typescript
// In ClimateDeploymentPhase or EnergyBudgetPhase
const calculateDACEnergy = (dacDeployment: number, state: GameState): number => {
  const BASE_ENERGY_PER_GT = 700;  // TWh (mid-range 400-1200 from research)
  const baseEnergy = dacDeployment * BASE_ENERGY_PER_GT;

  // Efficiency improvements (e.g., Gen 3 DAC technology)
  const efficiencyLevel = state.technologies?.dacEfficiencyLevel || 1.0;

  // Climate tech rebound: 30% (lower than AI's 60%)
  const CLIMATE_TECH_REBOUND = 0.30;
  const netEfficiency = efficiencyLevel * (1 - CLIMATE_TECH_REBOUND);

  const actualEnergy = baseEnergy / netEfficiency;

  return assertFinite(actualEnergy, {
    location: 'calculateDACEnergy',
    valueName: 'actualEnergy',
    month: state.currentMonth,
    additionalInfo: { dacDeployment, efficiencyLevel, netEfficiency }
  });
};
```

**Apply to solar/wind efficiency:**
```typescript
// When calculating renewable energy effectiveness
const renewableEfficiencyImprovement = 1.05;  // 5%/year improvement
const reboundEffect = 0.30;  // 30% cheaper → increased consumption
const netImprovement = renewableEfficiencyImprovement * (1 - reboundEffect);
```

### 3. Economic AI Productivity Rebound (MEDIUM PRIORITY)

**Goal:** AI productivity gains partially offset by increased scope

**Target Files:**
- Primary: `src/simulation/engine/phases/AIScalingPhase.ts`
- Secondary: AI capability calculations

**Implementation:**
```typescript
// In AIScalingPhase or capability scaling
const applyProductivityRebound = (productivityGain: number): number => {
  const REBOUND_COEFFICIENT = 0.60;  // Same as energy (consistent Jevons paradox)
  const netProductivityGain = productivityGain * (1 - REBOUND_COEFFICIENT);

  // Example: 50% productivity improvement → 20% net gain (30% consumed by scope creep)
  return assertInRange(netProductivityGain, 0, productivityGain, {
    location: 'applyProductivityRebound',
    valueName: 'netProductivityGain',
    month: state.currentMonth
  });
};
```

---

## Quality Gates

### Quality Gate 1: Research Validation ✅ PASSED

- **Research file:** `research/energy_budget_constraints_20251209.md`
- **Grade:** B+ (Corrected post-critique)
- **Critique:** `reviews/energy_budget_constraints_critique_20251210.md`
- **Status:** ✅ APPROVED (Dec 10, 2025)
- **Sources:** 8 peer-reviewed, 5 IEA, 4 grid operators

### Quality Gate 2: Architecture Review ⏳ REQUIRED

**Process:**
1. After implementation complete
2. Spawn `architecture-skeptic` for review
3. Address CRITICAL/HIGH issues (mandatory)
4. Address MEDIUM issues (recommended)
5. Only merge after QG2 passes

**Expected Concerns:**
- Performance impact (efficiency calculations per step)
- State propagation (verify downstream phases consume rebound effects)
- Complexity (three different rebound coefficients - AI 60%, climate 30%, cleanup 15%)

### Monte Carlo Validation ⏳ REQUIRED

**Requirements:**
- N ≥ 10 runs with same seed
- Verify determinism (CV < 0.01%)
- Check outcome impacts:
  - Climate mitigation slower (+15-30% timeline)
  - AI compute scaling faster (2-3× growth rate)
  - Energy competition more intense

**Validation Script:**
```bash
# Run Monte Carlo with rebound effects enabled
npx tsx scripts/monteCarloSimulation.ts > logs/mc_rebound_$(date +%Y%m%d_%H%M%S).log 2>&1 &

# Check outcome distribution
grep "FINAL OUTCOME" logs/mc_rebound_*.log | sort | uniq -c
# Expect: Lower utopia %, higher dystopia % vs baseline
```

---

## Expected Simulation Impacts

### Outcome Distribution Changes

**Before rebound effects:**
- Utopia: 15-25%
- Hopeful: 30-40%
- Survival: 20-30%
- Dystopia: 10-20%
- Collapse: 5-10%

**After rebound effects (predicted):**
- Utopia: 10-20% (harder - climate mitigation slower)
- Hopeful: 25-35%
- Survival: 25-35%
- Dystopia: 15-25% (more likely - energy competition)
- Collapse: 5-15%

### Timeline Changes

**Climate mitigation:**
- DAC to 5 Gt/year: +15-30% longer (efficiency gains offset)
- Grid decarbonization: +10-20% longer (solar efficiency → more usage)

**AI capabilities:**
- Reach 50 aggregate capability: -20-30% faster (efficiency enables more)
- Training compute growth: 2-3× faster than without rebound

**Energy competition:**
- DAC vs AI conflicts: 2-3× more frequent
- Energy constraint events: +30-50% increase

---

## Implementation Checklist

### Phase 1: AI Infrastructure Rebound (4-6 hours)
- [ ] Read research/energy_budget_constraints_20251209.md section 3.2
- [ ] Implement 60% rebound coefficient in energy calculations
- [ ] Add assertion utilities (no silent fallbacks)
- [ ] Update comments with research citations
- [ ] Run type checking: `npx tsc --noEmit`
- [ ] Run tests: `npm test`
- [ ] Verify determinism: Run same seed twice, compare outputs

### Phase 2: Climate Tech Rebound (2-3 hours)
- [ ] Implement 30% rebound for DAC efficiency
- [ ] Implement 30% rebound for renewable efficiency
- [ ] Update EnergyBudgetPhase or ClimateDeploymentPhase
- [ ] Add assertion utilities
- [ ] Test DAC energy calculations

### Phase 3: Economic AI Rebound (1-2 hours)
- [ ] Implement productivity rebound in AIScalingPhase
- [ ] Verify capability calculations incorporate rebound
- [ ] Test edge cases (very high productivity gains)

### Phase 4: Monte Carlo Validation (2-3 hours)
- [ ] Run N≥10 with same seed
- [ ] Verify determinism (CV < 0.01%)
- [ ] Check outcome distribution changes
- [ ] Validate climate mitigation timeline impact
- [ ] Validate AI compute growth rate impact

### Phase 5: Quality Gate 2 (1-2 hours)
- [ ] Handoff to architecture-skeptic
- [ ] Address CRITICAL issues (mandatory)
- [ ] Address HIGH issues (mandatory)
- [ ] Address MEDIUM issues (recommended)
- [ ] Re-test after fixes

### Phase 6: Documentation & Archival (30 min)
- [ ] Update docs/wiki/README.md (energy systems section)
- [ ] Create devlog entry
- [ ] Handoff to architect for plan archival
- [ ] Move this plan to plans/completed/

**Total Effort:** 10-17 hours (vs user estimate of 4-6 hours for implementation only)

---

## Defensive Coding Requirements

### 1. Assertion Utilities (MANDATORY)

**NO silent fallbacks in calculations:**
```typescript
// ❌ WRONG
const reboundCoefficient = state.reboundCoefficient ?? 0.60;

// ✅ CORRECT
const reboundCoefficient = assertStateProperty(state, 'reboundCoefficient', {
  location: 'calculateRebound',
  month: state.currentMonth
});
```

### 2. Required RNG (MANDATORY)

**All stochastic elements use passed RNG:**
```typescript
// ❌ WRONG
const randomVariation = Math.random() * 0.1;

// ✅ CORRECT
const randomVariation = rng() * 0.1;
```

### 3. Emoji Conventions

**Use registered emojis only:**
- Check `docs/EMOJI_EVENT_MAP.txt` before using
- Register new emojis if needed (pre-commit hook validates)
- Format: `🌍💡 BREAKTHROUGH: Efficiency improvement with rebound effects`

### 4. State Propagation

**Verify downstream phases consume your changes:**
- EnergyBudgetPhase → ClimateDeploymentPhase (effectiveness multipliers)
- AIScalingPhase → Resource calculations (productivity impacts)
- Document dependencies in phase `readonly dependencies` array

---

## Success Criteria

### Implementation Complete When:
- ✅ AI infrastructure: 60% rebound coefficient implemented
- ✅ Climate tech: 30% rebound coefficient implemented
- ✅ Economic AI: Productivity rebound implemented
- ✅ All calculations use assertion utilities (no fallbacks)
- ✅ TypeScript compiles cleanly (`npx tsc --noEmit`)
- ✅ Test suite passes (`npm test`)
- ✅ Determinism verified (same seed = same output)

### Quality Gates Passed When:
- ✅ Architecture review: No CRITICAL/HIGH issues
- ✅ Monte Carlo validation: N≥10, CV < 0.01%
- ✅ Outcome impacts match predictions (+15-30% climate timeline, 2-3× AI growth)

### Documentation Complete When:
- ✅ Wiki updated (energy systems section)
- ✅ Devlog created
- ✅ Plan archived to plans/completed/

---

## Handoff to simulation-maintainer (Roy)

**Roy,** this is a HIGH priority feature that's been waiting 3 weeks. Research is done (Grade B+), parameters extracted, you just need to implement the mechanics.

**Why this matters:**
- Google's 33× efficiency improvement → 50% emission INCREASE (not decrease)
- Without rebound effects, simulation shows unrealistic energy savings
- Affects climate timeline (+15-30% longer), AI growth (2-3× faster), outcome distributions

**Start here:**
1. Read `research/energy_budget_constraints_20251209.md` section 3.2 (AI energy)
2. Implement AI rebound FIRST (highest impact)
3. Then climate tech rebound
4. Then economic rebound
5. Run Monte Carlo validation
6. Handoff to architecture-skeptic for QG2

**Key insight:** Efficiency doesn't reduce consumption - it enables MORE usage. Model the paradox.

**Expected time:** 10-17 hours total (4-6 implementation, 2-3 validation, 1-2 QG2, 1-2 docs)

---

**Plan Status:** READY FOR IMPLEMENTATION
**Next Action:** simulation-maintainer picks up and executes
**Orchestrator:** Standing by for QG2 coordination after implementation
