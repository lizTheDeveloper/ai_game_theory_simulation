# TASK: Implement Coordinated Technology Deployment System

**Assigned to:** Roy (Simulation Maintainer)
**Priority:** TIER 1 CRITICAL
**Status:** Research Validation COMPLETE (Quality Gate 1 PASSED)
**Timeline:** 2-3 hours implementation

---

## Context

Quality Gate 1 (Research Validation) is COMPLETE with CONDITIONAL PASS:
- ✅ Research foundation: `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/transition_mortality_coordination_effectiveness_20251115.md` (27 peer-reviewed sources)
- ✅ Research critique: Sylvia's review with conservative parameter adjustments
- ✅ God mode validation: Priya resolved discrepancy (11-30% range, time-dependent)

**Validated baseline:**
- Uncoordinated deployment (god mode): 11.3% at 12 months → 31.7% at 49 months
- Conservative estimate for implementation: 15-30% chaotic mortality range

---

## Objective

Implement `CoordinatedDeploymentPhase` to distinguish:
- **Chaotic deployment:** 15-30% mortality (instant deployment, no coordination)
- **AI-coordinated deployment:** <5% mortality (gradual rollout + support systems)

**Effectiveness target:** 80-85% mortality reduction (conservative vs. 95% in original research)

---

## Implementation Plan

### Phase 1: State Interface Extension

Add to `GameState` interface (`/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/types/game.ts`):

```typescript
interface GameState {
  coordinatedDeployment?: {
    // Technology deployment progress (gradual vs instant)
    deploymentProgress: Record<string, number>; // tech ID → 0-100%

    // Regional capacity assessment
    regionalCapacity: {
      infrastructure: number; // 0-1
      governance: number; // 0-1
      economic: number; // 0-1
    };

    // Support system activation
    supportSystems: {
      ubiActivation: number; // 0-1 (population coverage)
      retrainingCoverage: number; // 0-1 (displaced worker coverage)
      foodSecurity: number; // 0-1 (emergency food access)
      healthcareAccess: number; // 0-1 (transition healthcare)
    };

    // Transition mortality tracking
    transitionMortality: {
      monthlyRate: number; // additional deaths/month from disruption
      cumulativeDeaths: number; // total transition casualties
      mechanismBreakdown: {
        economic: number;
        food: number;
        healthcare: number;
        infrastructure: number;
      };
    };

    // Coordination effectiveness (from AI alignment)
    coordinationEffectiveness: number; // 0-1, derived from AI agent alignment
  };
}
```

### Phase 2: Create CoordinatedDeploymentPhase

**Location:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/engine/phases/CoordinatedDeploymentPhase.ts`

**Conservative Parameters (per Sylvia's recommendations):**

```typescript
// BASE MORTALITY RATES (without coordination)
// Adjusted from 5.5% to 3.5% to remove political violence contamination
const BASE_CHAOTIC_MORTALITY = 0.035; // 3.5% annual (economic disruption only)
const BASE_MODERATE_MORTALITY = 0.015; // 1.5% annual (mixed coordination)
const BASE_COORDINATED_MORTALITY = 0.005; // 0.5% annual (high coordination + support)

// SUPPORT SYSTEM EFFECTIVENESS (empirically validated, research citations)
// Each parameter backed by peer-reviewed sources in research doc
const UBI_MORTALITY_REDUCTION = 0.25; // 25% reduction (Social Security data, conservative)
const RETRAINING_REDUCTION = 0.15; // 15% reduction (active labor market policies)
const FOOD_SECURITY_REDUCTION = 0.30; // 30% reduction (Green Revolution data)
const HEALTHCARE_REDUCTION = 0.20; // 20% reduction (Marshall Plan data)

// AI COORDINATION EFFECTIVENESS (CONSERVATIVE - Sylvia's adjustment)
// Reduced from 92-95% to 50-75% due to zero empirical cases
const AI_COORDINATION_BASELINE = 0.50; // 50% at minimal alignment
const AI_COORDINATION_MAX = 0.75; // 75% at full alignment (was 95%, adjusted)

// DEPLOYMENT PACING
const OPTIMAL_DEPLOYMENT_RATE = 3; // technologies/year (infrastructure constraints)
const CHAOTIC_DEPLOYMENT_MULTIPLIER = 5; // 5× faster but higher casualties

// UNCERTAINTY RANGES (per Sylvia's requirement)
const PARAMETER_UNCERTAINTY = {
  baseMortality: { low: 0.025, mid: 0.035, high: 0.050 },
  supportEffectiveness: { low: 0.30, mid: 0.45, high: 0.60 },
  aiCoordination: { low: 0.40, mid: 0.60, high: 0.75 } // LOWERED from 0.85/0.92/0.95
};
```

### Phase 3: Core Transition Mortality Calculation

**Implement additive model with diminishing returns (per Sylvia's recommendation):**

```typescript
function calculateTransitionMortality(
  state: GameState,
  rng: () => number
): {
  annualExcessMortality: number;
  monthlyMortalityRate: number;
  mechanismBreakdown: Record<string, number>;
} {
  // CRITICAL: RNG must be required, never optional (CRITICAL-3 regression prevention)
  if (!rng || typeof rng !== 'function') {
    throw new Error('❌ CRITICAL: RNG required for deterministic simulation');
  }

  // 1. Assess coordination quality (from AI alignment)
  const activeAI = state.aiAgents.filter(a => a.active);
  if (activeAI.length === 0) {
    // No AI agents → chaotic deployment
    coordinationEffectiveness = 0;
  } else {
    const alignmentQuality = activeAI
      .reduce((sum, a) => sum + a.trueAlignment, 0) / activeAI.length;

    // Conservative mapping: 50-75% effectiveness range
    const coordinationEffectiveness =
      AI_COORDINATION_BASELINE +
      (AI_COORDINATION_MAX - AI_COORDINATION_BASELINE) * alignmentQuality;
  }

  // 2. Calculate support system composite
  const supportQuality = (
    state.coordinatedDeployment.supportSystems.ubiActivation * UBI_MORTALITY_REDUCTION +
    state.coordinatedDeployment.supportSystems.retrainingCoverage * RETRAINING_REDUCTION +
    state.coordinatedDeployment.supportSystems.foodSecurity * FOOD_SECURITY_REDUCTION +
    state.coordinatedDeployment.supportSystems.healthcareAccess * HEALTHCARE_REDUCTION
  );

  // 3. Additive model with diminishing returns (per Sylvia's recommendation)
  // NOT multiplicative (prevents mortality approaching zero unrealistically)
  const baseMortality = BASE_CHAOTIC_MORTALITY;
  const coordinationReduction = coordinationEffectiveness * 0.6; // Max 60% reduction
  const supportReduction = supportQuality * 0.4; // Max 40% reduction

  // Cap total reduction at 95% (minimum 0.5% mortality even with perfect systems)
  const totalReduction = Math.min(0.95, coordinationReduction + supportReduction);

  // Net mortality (floor at 0.001 = 0.1%)
  const annualMortality = Math.max(
    0.001,
    baseMortality * (1 - totalReduction)
  );

  // 4. Convert to monthly rate
  const monthlyRate = annualMortality / 12;

  // 5. Mechanism breakdown (for diagnostics)
  const mechanismBreakdown = {
    economic: monthlyRate * 0.35,
    food: monthlyRate * 0.30,
    healthcare: monthlyRate * 0.20,
    infrastructure: monthlyRate * 0.15
  };

  // 6. Use assertFinite to validate (fail-loudly, never silent fallbacks)
  const validatedMonthlyRate = assertFinite(monthlyRate, {
    location: 'calculateTransitionMortality',
    valueName: 'monthlyRate',
    month: state.currentMonth,
    additionalInfo: {
      baseMortality,
      coordinationReduction,
      supportReduction,
      coordinationEffectiveness,
      supportQuality
    }
  });

  return {
    annualExcessMortality: annualMortality,
    monthlyMortalityRate: validatedMonthlyRate,
    mechanismBreakdown
  };
}
```

### Phase 4: Integration with Existing Systems

**DO NOT modify existing mortality calculations directly.** Instead:

1. **Add separate transition mortality tracking** in CoordinatedDeploymentPhase
2. **Pass transition mortality to mortality system** via state
3. **Let existing phases consume the value** (don't duplicate logic)

**Integration point:**
```typescript
// In CoordinatedDeploymentPhase.ts
const { monthlyMortalityRate, mechanismBreakdown } = calculateTransitionMortality(state, rng);

// Update state
state.coordinatedDeployment.transitionMortality.monthlyRate = monthlyMortalityRate;
state.coordinatedDeployment.transitionMortality.cumulativeDeaths +=
  monthlyMortalityRate * state.humanPopulationSystem.population; // NOT state.population (Nov 2025 fix)
state.coordinatedDeployment.transitionMortality.mechanismBreakdown = mechanismBreakdown;

// Log using pictographic event language
console.log(`\n🤝💀 TRANSITION MORTALITY`);
console.log(`  Monthly rate: ${(monthlyMortalityRate * 100).toFixed(3)}%`);
console.log(`  Cumulative deaths: ${(state.coordinatedDeployment.transitionMortality.cumulativeDeaths / 1e9).toFixed(3)}B`);
console.log(`  Coordination effectiveness: ${(state.coordinatedDeployment.coordinationEffectiveness * 100).toFixed(1)}%`);
```

**In existing mortality phase (MortalityPhase.ts or CrisisPhase.ts):**
```typescript
// Add transition mortality to total monthly deaths
const transitionDeaths = state.coordinatedDeployment?.transitionMortality.monthlyRate
  ? state.coordinatedDeployment.transitionMortality.monthlyRate * state.humanPopulationSystem.population
  : 0;

totalMonthlyDeaths += transitionDeaths;
```

### Phase 5: God Mode Scenario Update

**Update god mode configuration to explicitly disable coordination:**

```typescript
// In god mode scenario setup (e.g., testGodMode.ts or scenario config)
const godModeScenario = {
  // ... existing config (deploy all 73 techs at month 0)

  coordinatedDeployment: {
    forceUncoordinated: true, // Instant deployment, no pacing
    disableSupportSystems: true, // No UBI/retraining/etc.
    coordinationEffectiveness: 0.0, // Zero AI coordination
    supportSystems: {
      ubiActivation: 0,
      retrainingCoverage: 0,
      foodSecurity: 0,
      healthcareAccess: 0
    }
  }
};
```

---

## Defensive Coding Requirements

**CRITICAL: Follow research simulation rigor (no silent fallbacks):**

1. **RNG must be REQUIRED** - Never optional with `Math.random()` fallback
2. **Use assertion utilities** - `assertFinite`, `assertStateProperty`, `assertProbability`
3. **Access population from correct source** - `state.humanPopulationSystem.population` (NOT `state.population`)
4. **No silent fallback values** - If calculation fails, throw with context
5. **Pictographic event language** - Use 🤝💀 for coordination mortality, register in `EMOJI_EVENT_MAP.txt`

**Example assertion usage:**
```typescript
const coordinationEffectiveness = assertProbability(rawCoordination, {
  location: 'calculateCoordination',
  valueName: 'coordinationEffectiveness',
  month: state.currentMonth,
  additionalInfo: { alignmentQuality, activeAI: activeAI.length }
});
```

---

## Testing Requirements

**After implementation, create unit tests:**

1. **Test chaotic deployment** - Verify 15-30% mortality range with zero coordination
2. **Test coordinated deployment** - Verify <5% mortality with full support + AI coordination
3. **Test additive model** - Verify diminishing returns (coordination + support capped at 95%)
4. **Test RNG determinism** - Same seed → same results (CV < 0.01%)
5. **Test NaN handling** - All calculations use assertions, no silent fallbacks

**Monte Carlo validation target (N=10, 49 months to match MC10 baseline):**
- Uncoordinated (god mode): 15-30% mortality (matches validated baseline)
- Coordinated (75% effectiveness + full support): 2-5% mortality (conservative)
- Effectiveness: 80-85% mortality reduction

---

## Success Criteria

Implementation is complete when:

- ✅ State interface updated (`src/types/game.ts`)
- ✅ CoordinatedDeploymentPhase created and integrated
- ✅ Conservative parameters implemented (Sylvia's adjustments)
- ✅ Additive model with diminishing returns (not multiplicative)
- ✅ Assertion utilities used (no silent fallbacks)
- ✅ Population accessed from `humanPopulationSystem` (not `state.population`)
- ✅ God mode scenario explicitly disables coordination
- ✅ Pictographic event logging (emojis registered)
- ✅ Type checking passes (`npx tsc --noEmit`)
- ✅ Unit tests created
- ✅ Ready for Monte Carlo validation

---

## Quality Gates (After Implementation)

**Quality Gate 2: Architecture Review**
- Spawn `architecture-skeptic` to review performance, state propagation
- Must address CRITICAL/HIGH issues before Monte Carlo validation

**Quality Gate 3: Monte Carlo Validation**
- Spawn `priya` for statistical validation
- N=10 runs, 49 months (match MC10 baseline)
- Validate 15-30% uncoordinated, 2-5% coordinated
- Check CV < 0.01% for determinism

---

## References

**Research Foundation:**
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/transition_mortality_coordination_effectiveness_20251115.md` (27 peer-reviewed sources)

**Research Critique:**
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/reviews/coordinated_deployment_research_critique_20251115.md` (Sylvia's CONDITIONAL PASS with parameter adjustments)

**God Mode Validation:**
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/reviews/god_mode_mortality_validation_20251115.md` (Priya's quantitative analysis)

**Implementation Plan:**
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/plans/coordinated_technology_deployment.md` (Original feature plan)

---

**CRITICAL: All parameters have research citations and uncertainty ranges. Use conservative values. Fail loudly on invalid data. Let the model show what it shows.**

---

*Orchestrator → Roy (Simulation Maintainer)*
*"Research validated. Conservative parameters ready. Implement with rigor."*
