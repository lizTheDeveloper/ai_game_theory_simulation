# Phase 3: Novel Entities Paradigm Shift Implementation Specification

**Date:** 2025-11-18
**Priority:** TIER 2 HIGH (Implementation-ready with conditions)
**Owner:** simulation-maintainer (Roy - core mechanics) + feature-implementer (Moss - 6 new techs)
**Research:** `research/novel_entities_zero_effectiveness_20251113.md` (Grade B+, conditional approval)
**Design:** `plans/novel_entities_model_redesign_20251113.md` (276 lines)
**Estimated Time:** 10-14 hours (4 subsystems + 6 techs + sensitivity analysis)

---

## Executive Summary

Current model shows 0% effectiveness for Novel Entities despite 7 pollution technologies deployed. Research identifies root cause: **thermodynamic energy trap** + **irreversibility** + **rebound effects**. Cleanup at environmental concentrations requires 4-40% of global energy (physically infeasible).

**Paradigm shift:** Prevention >> Cleanup (10-100× effectiveness). Montreal Protocol succeeded via production bans, not cleanup.

**Expected Impact:** Novel Entities shows improvement (0% → 5-15%), prevention technologies dominate, energy constraints gate cleanup feasibility.

**CONDITIONS:** Sensitivity analysis REQUIRED. HIGH UNCERTAINTY flagged for reboundFactor (0.5-0.9 range).

---

## 1. Research Findings Summary

### Root Causes of Zero Effectiveness

1. **Thermodynamic Energy Trap:**
   - PFAS thermal destruction: $1,000-2,000/tonne at 850-1200°C
   - Electrochemical oxidation: 5-132 kWh/m³ (newer methods), 1,560-2,370 kWh/m³ (older)
   - Global remediation cost: 0.2-66× global GDP annually (economically impossible)

2. **Concentration Problem:**
   - Technologies work at mg/L (wastewater) but environment is ng/L (1,000,000× dilution)
   - Cleanup effectiveness inversely proportional to concentration: f(C) = k / (C + C₀)

3. **Rebound Effects (Jevons Paradox):**
   - Cleanup enables continued production
   - Net effectiveness = cleanup - induced_production
   - Empirical reboundFactor: 0.5-0.9 (HIGH UNCERTAINTY)

4. **Irreversibility:**
   - PFAS in rainwater everywhere including Antarctica (permanent distribution)
   - 80-95% of contamination irreversible with current technology
   - Asymptotic approach: never reaches zero, like extinction

5. **Prevention > Cleanup:**
   - Montreal Protocol: Production ban 10-100× more effective than bank destruction
   - PFAS: Banning sources >> attempting cleanup

### Model Redesign (4 Subsystems)

1. **Energy-Constrained Cleanup:** Gate cleanup by renewable energy surplus
2. **Irreversibility Flags:** 80-95% contamination persists indefinitely
3. **Rebound Effects:** Cleanup induces production, net effectiveness reduced
4. **6 New Prevention Technologies:** Prevention 10-100× more effective than cleanup

---

## 2. Implementation Tasks

### 2.1 Energy-Constrained Cleanup

**Location:** `src/simulation/phases/planetary/NovelEntitiesPhase.ts`

**GameState Extensions:**

```typescript
// Add to NovelEntitiesSystem or extend existing
interface NovelEntitiesSystem {
  // ... existing fields

  // Energy-gated cleanup
  energyAvailableForCleanup: number;      // GW of renewable surplus available
  energyRequirementPerTech: {
    [techName: string]: number;            // GW required for gigatonne-scale cleanup
  };

  // Concentration-dependent effectiveness
  contaminationConcentration: number;     // ng/L (nanograms per liter)
  concentrationThreshold: number;         // mg/L (technology works well above this)

  // Irreversibility tracking
  irreversibleFraction: number;           // 0.80-0.95 (fraction that cannot be cleaned)
  reversibleContamination: number;        // Amount that can theoretically be cleaned
  irreversibleContamination: number;      // Amount that persists indefinitely

  // Rebound effects
  reboundFactor: number;                  // 0.5-0.9 (HIGH UNCERTAINTY)
  cleanupInducedProduction: number;       // Additional pollution from enabled production
}
```

**Energy Requirement Parameters (Research-Based):**

```typescript
const ENERGY_REQUIREMENTS: Record<string, number> = {
  // Cleanup technologies (very high energy)
  'PFAS Electrochemical Destruction': 66,  // 66× GDP energy equivalent (infeasible at scale)
  'Microplastic Filtration': 12,           // High but more feasible
  'Heavy Metal Remediation': 8,
  'Chemical Substitution': 2,              // Process change, moderate energy

  // Prevention technologies (low energy - regulatory)
  'PFAS Production Ban': 0.1,              // Negligible (policy enforcement)
  'Plastic Phase-Out': 0.5,
  'Chemical Substitution Standards': 0.2,
  'Green Chemistry Mandate': 0.3,
  'Circular Economy Infrastructure': 4,
  'Closed-Loop Manufacturing': 6
};
```

**Phase Logic:**

```typescript
export function novelEntitiesPhase(state: GameState, rng: () => number): void {
  const system = state.novelEntitiesSystem;
  if (!system) return;

  // 1. Calculate available energy for cleanup
  const renewableSurplus = calculateRenewableEnergySurplus(state);
  system.energyAvailableForCleanup = renewableSurplus;

  // 2. Calculate concentration-dependent effectiveness
  const concentrationPenalty = calculateConcentrationPenalty(system);

  // 3. For each deployed cleanup technology
  let totalCleanupEffectiveness = 0;
  for (const tech of getDeployedCleanupTechs(state)) {
    const energyRequired = system.energyRequirementPerTech[tech.name];

    // Energy gate: can only use tech if sufficient energy available
    if (renewableSurplus >= energyRequired) {
      const baseEffectiveness = tech.effectiveness;
      const energyAdjusted = baseEffectiveness * (renewableSurplus / energyRequired);
      const concentrationAdjusted = energyAdjusted * concentrationPenalty;

      totalCleanupEffectiveness += concentrationAdjusted;
    } else {
      // Insufficient energy - partial effectiveness
      const partialEffectiveness = tech.effectiveness * (renewableSurplus / energyRequired);
      totalCleanupEffectiveness += partialEffectiveness * concentrationPenalty;
    }
  }

  // 4. Apply rebound effects (Jevons paradox)
  const cleanupInducedProduction = totalCleanupEffectiveness * system.reboundFactor;
  system.cleanupInducedProduction = cleanupInducedProduction;

  const netCleanupEffectiveness = totalCleanupEffectiveness - cleanupInducedProduction;

  // 5. Calculate prevention technology effectiveness (much higher)
  let totalPreventionEffectiveness = 0;
  for (const tech of getDeployedPreventionTechs(state)) {
    // Prevention is 10-100× more effective than cleanup (Montreal Protocol evidence)
    totalPreventionEffectiveness += tech.effectiveness * 50; // 50× multiplier (midpoint)
  }

  // 6. Update contamination levels
  const totalReduction = netCleanupEffectiveness + totalPreventionEffectiveness;

  // Asymptotic approach: never reaches zero due to irreversibility
  const currentContamination = system.reversibleContamination + system.irreversibleContamination;
  const cleanupAmount = totalReduction * (system.reversibleContamination / currentContamination);

  system.reversibleContamination = Math.max(0, system.reversibleContamination - cleanupAmount);

  // Irreversible fraction remains (like extinction debt)
  // system.irreversibleContamination stays constant (cannot be cleaned)

  // 7. Update planetary boundary status
  const totalContamination = system.reversibleContamination + system.irreversibleContamination;
  const boundaryStatus = totalContamination / system.initialContamination; // 0 = clean, 1 = original

  state.planetaryBoundaries.novelEntities = boundaryStatus;

  // 8. Log status
  if (state.currentMonth % 12 === 0) {
    logNovelEntitiesStatus(state, netCleanupEffectiveness, totalPreventionEffectiveness);
  }
}

function calculateConcentrationPenalty(system: NovelEntitiesSystem): number {
  // Effectiveness inversely proportional to dilution
  // Works well at mg/L (wastewater treatment), poorly at ng/L (environmental)
  const C = system.contaminationConcentration; // ng/L
  const C_threshold = system.concentrationThreshold * 1e6; // mg/L → ng/L

  // Hyperbolic decay: f(C) = k / (C + C₀)
  const penalty = C / (C + C_threshold);

  return assertProbability(penalty, {
    location: 'calculateConcentrationPenalty',
    valueName: 'concentrationPenalty',
    month: state.currentMonth
  });
}

function calculateRenewableEnergySurplus(state: GameState): number {
  // Placeholder - needs integration with energy system
  // For now, use rough approximation
  const renewableCapacity = state.energySystem?.renewableCapacity ?? 0;
  const totalDemand = state.energySystem?.totalDemand ?? 1;
  const surplus = Math.max(0, renewableCapacity - totalDemand);

  return assertFinite(surplus, {
    location: 'calculateRenewableEnergySurplus',
    valueName: 'renewableSurplus',
    month: state.currentMonth
  });
}
```

### 2.2 Initialize Novel Entities System

**Location:** `src/simulation/initialization/initializeGameState.ts`

```typescript
state.novelEntitiesSystem = {
  // ... existing initialization

  // Energy constraints
  energyAvailableForCleanup: 0,
  energyRequirementPerTech: ENERGY_REQUIREMENTS,

  // Concentration (environmental levels)
  contaminationConcentration: 10, // ng/L (typical PFAS in rainwater globally)
  concentrationThreshold: 1.0,    // mg/L (1,000,000× higher - tech works well here)

  // Irreversibility (research: 80-95%)
  irreversibleFraction: 0.875,    // 87.5% (midpoint of 80-95% range)
  reversibleContamination: initialContamination * 0.125,
  irreversibleContamination: initialContamination * 0.875,

  // Rebound effects (HIGH UNCERTAINTY)
  reboundFactor: 0.7,             // 70% (midpoint of 0.5-0.9 range) - SENSITIVITY TEST THIS
  cleanupInducedProduction: 0
};
```

### 2.3 Add 6 New Prevention Technologies

**Location:** `src/data/breakthroughs/novelEntitiesBreakthroughs.ts` (or wherever tech definitions are)

**New Technologies:**

```typescript
// TIER 0-1: Regulatory Prevention (Low energy, high effectiveness)
{
  id: 'pfas-production-ban',
  name: 'PFAS Production Ban',
  tier: 0, // CRITICAL (immediate deployment)
  category: 'novel-entities-prevention',
  effectiveness: 0.20, // 20% reduction (prevents new contamination)
  energyRequirement: 0.1, // Negligible (policy enforcement)
  cost: 10, // Billion USD (regulatory implementation)
  description: 'Global ban on PFAS manufacturing (Montreal Protocol model)',
  researchBasis: [
    'Stockholm Convention on Persistent Organic Pollutants (2001-2024)',
    'EPA PFAS Strategic Roadmap (2024)'
  ]
},

{
  id: 'plastic-phase-out',
  name: 'Single-Use Plastic Phase-Out',
  tier: 1,
  category: 'novel-entities-prevention',
  effectiveness: 0.15, // 15% reduction
  energyRequirement: 0.5,
  cost: 50,
  description: 'Phased elimination of single-use plastics, extended producer responsibility',
  researchBasis: [
    'UNEP Plastics Treaty negotiations (2024-2025)',
    'EU Single-Use Plastics Directive implementation data'
  ]
},

{
  id: 'chemical-substitution-standards',
  name: 'Chemical Substitution Standards',
  tier: 1,
  category: 'novel-entities-prevention',
  effectiveness: 0.12, // 12% reduction
  energyRequirement: 0.2,
  cost: 30,
  description: 'Mandatory safer alternatives for hazardous chemicals (REACH 2.0)',
  researchBasis: [
    'EU REACH regulation outcomes (2007-2024)',
    'California Safer Consumer Products program data'
  ]
},

// TIER 2-3: Technological Prevention (Higher energy, transformative)
{
  id: 'green-chemistry-mandate',
  name: 'Green Chemistry Mandate',
  tier: 2,
  category: 'novel-entities-prevention',
  effectiveness: 0.18, // 18% reduction
  energyRequirement: 0.3,
  cost: 80,
  description: '12 principles of green chemistry enforced in industrial processes',
  researchBasis: [
    'Green Chemistry & Engineering (journal) 2024 review',
    'Yale 12 Principles of Green Chemistry (validated case studies)'
  ]
},

{
  id: 'circular-economy-infrastructure',
  name: 'Circular Economy Infrastructure',
  tier: 2,
  category: 'novel-entities-prevention',
  effectiveness: 0.25, // 25% reduction (largest single prevention tech)
  energyRequirement: 4,
  cost: 200,
  description: 'Closed-loop material flows, zero-waste manufacturing systems',
  researchBasis: [
    'Ellen MacArthur Foundation Circular Economy reports (2013-2024)',
    'Industrial Ecology journal case studies'
  ]
},

{
  id: 'closed-loop-manufacturing',
  name: 'Closed-Loop Manufacturing Systems',
  tier: 3,
  category: 'novel-entities-prevention',
  effectiveness: 0.30, // 30% reduction (most effective single tech)
  energyRequirement: 6,
  cost: 300,
  description: 'Industrial symbiosis, cradle-to-cradle design, zero chemical emissions',
  researchBasis: [
    'Journal of Cleaner Production (2024) closed-loop case studies',
    'Cradle to Cradle Design Protocol v4.0 (2023)'
  ]
}
```

**Effectiveness Comparison:**
- **Cleanup technologies:** 1-5% each (energy-gated, concentration-limited)
- **Prevention technologies:** 12-30% each (regulatory, 10-100× more effective)
- **Total potential (6 prevention techs):** ~100% new contamination prevented
- **Total potential (7 cleanup techs):** ~5-15% existing contamination reduced

### 2.4 Sensitivity Analysis (REQUIRED)

**Purpose:** Validate parameter robustness given HIGH UNCERTAINTY in rebound effects

**Parameters to Test:**

```typescript
const SENSITIVITY_ANALYSIS_PARAMS = {
  irreversibleFraction: [0.80, 0.875, 0.95],  // Low, mid, high
  reboundFactor: [0.5, 0.7, 0.9],             // Low, mid, high (HIGH UNCERTAINTY)
  timelagYears: [10, 20, 30],                  // Prevention policy → effect delay
  energyMultiplier: [0.5, 1.0, 2.0]           // Energy cost uncertainty
};
```

**Test Matrix:** 3 × 3 × 3 × 3 = 81 combinations (use Monte Carlo N=10 per combination = 810 runs)

**Validation Criteria:**
- **All scenarios:** Novel Entities improvement > 0% (no longer stuck at zero)
- **Best case:** (irreversible=0.80, rebound=0.5) → 15-25% improvement
- **Worst case:** (irreversible=0.95, rebound=0.9) → 2-5% improvement
- **Base case:** (irreversible=0.875, rebound=0.7) → 8-12% improvement

**Script:**

```bash
npx tsx scripts/monteCarloSensitivity.ts \
  --feature novel_entities \
  --params irreversibleFraction,reboundFactor,timelagYears,energyMultiplier \
  --runs 10 \
  > logs/mc_novel_entities_sensitivity_$(date +%Y%m%d_%H%M%S).log 2>&1 &
```

---

## 3. Validation Requirements

### 3.1 God Mode Regression Test

**Expected behavior:**
- Deploy all 7 cleanup techs + 6 prevention techs at month 0
- Run to month 120 (10 years)
- **Expected improvement: 5-15%** (not 0%, not 100%)
- **Prevention techs >> cleanup techs** (10-100× effectiveness ratio)

### 3.2 Energy Constraint Validation

**Test:**
- Deploy cleanup tech WITHOUT sufficient renewable energy
- **Expected:** Effectiveness gated at ~0-2% (energy-limited)
- Deploy prevention tech (low energy requirement)
- **Expected:** Effectiveness ~10-20% (not energy-limited)

### 3.3 Sensitivity Analysis (REQUIRED)

**See section 2.4 above**

**Success criteria:**
- All 81 parameter combinations produce improvement > 0%
- Best case 15-25%, worst case 2-5%, base case 8-12%
- No NaN, no crashes, deterministic with RNG seed

### 3.4 Monte Carlo Validation

**Standard requirements:**
- N ≥ 10 runs (base case parameters)
- CV < 0.01% (determinism check)
- No NaN values
- No assertion failures

---

## 4. Success Criteria

✅ **Implementation Complete When:**
1. Energy-constrained cleanup logic functional
2. Concentration penalty applied (effectiveness inversely proportional to dilution)
3. Irreversibility flags implemented (80-95% contamination persists)
4. Rebound effects modeled (cleanup induces production)
5. 6 new prevention technologies added with parameters
6. Prevention >> cleanup effectiveness validated (10-100× ratio)
7. God mode test passes (5-15% improvement, not 0%)
8. Energy constraint test passes (cleanup gated by renewable surplus)
9. Sensitivity analysis complete (81 combinations tested)
10. Monte Carlo N=10: base case deterministic, improvement visible

✅ **Research Validation Complete When:**
1. research-skeptic (Sylvia) verifies conditional approval holds ✓ (already B+ grade)
2. Sensitivity analysis shows parameter robustness
3. Energy requirements match research (PFAS 66× GDP infeasible at scale)

✅ **Architecture Review Complete When:**
1. architecture-skeptic grades B or higher
2. Energy system integration validated
3. No CRITICAL or HIGH performance issues

---

## 5. Implementation Notes

### HIGH UNCERTAINTY Flags

**Critical warning:**
```typescript
// Rebound factor has HIGH UNCERTAINTY (0.5-0.9 range)
// MUST run sensitivity analysis to validate robustness
const reboundFactor = 0.7; // ⚠️ HIGH UNCERTAINTY - test [0.5, 0.7, 0.9]
```

**Document uncertainty in logs:**
```typescript
console.log(`⚠️ HIGH UNCERTAINTY: Rebound factor ${reboundFactor.toFixed(2)} (range: 0.5-0.9)`);
console.log(`📊 Sensitivity analysis REQUIRED before production deployment`);
```

### Energy System Integration

**Challenge:** Novel entities cleanup requires integration with energy system tracking

**Approach:**
1. **Phase 3a (Core Mechanics):** Implement with placeholder energy calculation
2. **Phase 3b (Energy Integration):** Connect to actual renewable energy tracking
3. **Fallback:** If energy system not detailed enough, use proxy (GDP × renewable %)

### Emoji Conventions

```typescript
console.log(`☢️ Novel Entities Contamination: ${(status * 100).toFixed(1)}%`);
console.log(`♻️ Prevention Effectiveness: ${(prevention * 100).toFixed(1)}%`);
console.log(`🧹 Cleanup Effectiveness: ${(cleanup * 100).toFixed(1)}%`);
console.log(`⚡ Energy Available: ${energy.toFixed(1)} GW`);
console.log(`⚠️ HIGH UNCERTAINTY: Rebound effects`);
console.log(`✅ Improvement detected: ${improvementPercent.toFixed(1)}%`);
```

---

## 6. Implementation Phases

### Phase 3a: Core Mechanics (6-8 hours)

**Owner:** simulation-maintainer (Roy)

1. Implement energy-constrained cleanup logic
2. Implement concentration penalty
3. Implement irreversibility tracking
4. Implement rebound effects
5. Update GameState with new fields
6. Unit tests for each subsystem

### Phase 3b: 6 New Technologies (2-4 hours)

**Owner:** feature-implementer (Moss) or Roy

1. Add 6 prevention tech definitions with parameters
2. Integrate with breakthrough system
3. Validate prevention >> cleanup effectiveness ratio

### Phase 3c: Sensitivity Analysis (2-4 hours)

**Owner:** priya (quantitative validator)

1. Create sensitivity analysis script
2. Run 81 parameter combinations (N=10 each)
3. Analyze results: best/worst/base case ranges
4. Validate robustness (all scenarios show improvement)
5. Document HIGH UNCERTAINTY regions

**Parallelization:**
- 3a and 3b can run in parallel (different files)
- 3c must wait for 3a+3b completion

---

## 7. Handoff to Next Phase

**After implementation:**
1. Commit changes: `feat: Novel entities energy trap + prevention paradigm (conditional approval)`
2. Run Monte Carlo base case (N=10)
3. Run sensitivity analysis (81 combinations)
4. Post results to coordination channel
5. Request research-skeptic (Sylvia) conditional approval verification
6. Request architecture-skeptic review
7. Request priya (quantitative validator) for sensitivity analysis
8. If all pass → Mark Phase 3 complete
9. **Document HIGH UNCERTAINTY in final report**

---

## 8. Research Sources (Summary)

**Primary Sources (16+ peer-reviewed):**
- EPA (2024): PFAS destruction guidance (850-1200°C, $1,000-2,000/ton)
- Li et al. (2024): Electrochemical oxidation energy (0.62-132 kWh/m³)
- Ling et al. (2024): Global remediation costs (0.2-66× GDP annually)
- Stockholm Convention (2001-2024): POPs regulation (prevention model)
- UNEP (2024-2025): Plastics treaty negotiations
- Ellen MacArthur Foundation (2013-2024): Circular economy case studies
- Journal of Cleaner Production (2024): Closed-loop manufacturing

**Research Quality:** B+ (conditional approval, HIGH UNCERTAINTY flagged)

**Conditional Approval Reason:**
- Thermodynamic constraints well-established
- Prevention > cleanup validated (Montreal Protocol)
- Rebound effects documented but poorly quantified (0.5-0.9 range)
- **MUST run sensitivity analysis to validate robustness**

**Full Reports:**
- `research/novel_entities_zero_effectiveness_20251113.md` (742 lines)
- `plans/novel_entities_model_redesign_20251113.md` (276 lines)

---

**Implementation Start Date:** TBD (after Phase 1 or Phase 2, or parallel with Phase 2)
**Expected Completion:** 10-14 hours after start (3a: 6-8hr, 3b: 2-4hr, 3c: 2-4hr)
**Blocking Issues:** None (research complete with conditions, parameters provided)
**CRITICAL:** Sensitivity analysis MANDATORY before considering complete
