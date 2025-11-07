# Assertion Coverage Expansion - Batch 1 (CRITICAL)

**Date:** November 7, 2025
**Auditor:** Roy (Simulation Maintainer)
**Objective:** Add assertion coverage to 18 CRITICAL phases (first batch)

## Current Status

- **Total phases:** 116
- **With assertions:** 46 (39.7%)
- **Without assertions:** 70 (60.3%)
- **CRITICAL without assertions:** 18 phases

## Batch 1: CRITICAL Phases (18 phases)

These phases modify population, mortality, AI capabilities, QoL, or extinction systems. NaN propagation here causes cascading failures.

### Implementation Order (Priority)

1. **AILifecyclePhase.ts** - AI capability evolution, agent deployment/retirement
2. **LLMWeightUpdatePhase.ts** - AI capability updates, weight modifications
3. **ExtinctionProgressPhase.ts** - Tracks extinction probability, terminal states
4. **CatastrophicScenariosPhase.ts** - Catastrophe severity, mortality triggers
5. **HumanEnhancementPhase.ts** - Modifies human capabilities, longevity
6. **MinimalSufferingPhase.ts** - QoL minimums, suffering metrics
7. **BenchmarkEvaluationsPhase.ts** - AI capability assessments
8. **RLHFBindingPhase.ts** - Alignment strength, binding effectiveness
9. **SocialInfluenceUpdatePhase.ts** - Social cohesion effects
10. **ConsciousnessGovernancePhase.ts** - AI welfare, consciousness thresholds
11. **ResentmentRecoveryPhase.ts** - Social cohesion recovery rates
12. **CollectiveFormationPhase.ts** - Organization formation, collective action
13. **GovernmentElectionPhase.ts** - Government stability, democracy metrics
14. **Tier2CrisisAnticipationPhase.ts** - Crisis prediction, early warning
15. **Tier2DarkComputePhase.ts** - Compute allocation, dark AI
16. **Tier2SynergyPhase.ts** - Technology synergies, breakthrough multipliers
17. **Tier2SyntheticEcosystemsPhase.ts** - Ecosystem restoration metrics
18. **UnknownUnknownPhase.ts** - Black swan events, rare catastrophes

## Common Assertion Patterns for CRITICAL Phases

### 1. AI Capability Updates
```typescript
import { assertFinite, assertInRange, assertStateProperty } from '@/simulation/utils/assertions';

// ❌ BAD - Silent fallback
const capability = state.aiAgents[0].capability ?? 1.0;

// ✅ GOOD - Fail loudly
const capability = assertStateProperty(
  state.aiAgents[0],
  'capability',
  {
    location: 'AILifecyclePhase.execute',
    month: state.currentMonth,
    expectedSource: 'initialization.ts or prior phase'
  }
);

// Validate range (AI capabilities are 0-5 scale)
const validatedCapability = assertInRange(capability, 0, 5, {
  location: 'AILifecyclePhase.execute',
  valueName: 'capability',
  month: state.currentMonth
});

// Validate calculation results
const newCapability = assertFinite(capability * growthRate, {
  location: 'AILifecyclePhase.capabilityGrowth',
  valueName: 'newCapability',
  month: state.currentMonth,
  additionalInfo: { oldCapability: capability, growthRate }
});
```

### 2. Population/Mortality Calculations
```typescript
import { assertFinite, assertMortalityRate, assertPopulationChange } from '@/simulation/utils/assertions';

// Validate population is finite and positive
const population = assertFinite(state.humanPopulationSystem.population, {
  location: 'ExtinctionProgressPhase.execute',
  valueName: 'population',
  month: state.currentMonth
});

if (population <= 0) {
  throw new Error(
    `❌ Zero or negative population in ExtinctionProgressPhase\n` +
    `   population = ${population}B\n` +
    `   Month: ${state.currentMonth}\n` +
    `   Check prior phases for population depletion bug.`
  );
}

// Validate mortality rate [0, 1]
const mortalityRate = assertMortalityRate(deaths / population, {
  location: 'CatastrophicScenariosPhase.execute',
  valueName: 'mortalityRate',
  month: state.currentMonth,
  population: population * 1000 // Convert to millions for display
});
```

### 3. QoL/Wellbeing Metrics
```typescript
import { assertFinite, assertStateProperty } from '@/simulation/utils/assertions';

// QoL can exceed 1.0 (exceptional futures), so use assertFinite not assertProbability
const qol = assertFinite(
  state.globalMetrics.qualityOfLife,
  {
    location: 'MinimalSufferingPhase.execute',
    valueName: 'qualityOfLife',
    month: state.currentMonth
  }
);

// Individual QoL dimensions are probabilities [0, 1]
const foodSecurity = assertProbability(
  state.qualityOfLifeSystems.survivalFundamentals?.foodSecurity,
  {
    location: 'MinimalSufferingPhase.execute',
    valueName: 'foodSecurity',
    month: state.currentMonth
  }
);
```

### 4. Technology/Synergy Multipliers
```typescript
import { assertFinite, assertInRange } from '@/simulation/utils/assertions';

// Technology effects are typically multipliers (0.5× to 3× range)
const techMultiplier = assertInRange(
  calculateTechEffect(state),
  0, 5,
  {
    location: 'Tier2SynergyPhase.execute',
    valueName: 'techMultiplier',
    month: state.currentMonth
  }
);

// Breakthrough synergies must be finite
const synergyBonus = assertFinite(
  tech1Effect * tech2Effect,
  {
    location: 'Tier2SynergyPhase.calculateSynergy',
    valueName: 'synergyBonus',
    month: state.currentMonth,
    additionalInfo: { tech1Effect, tech2Effect }
  }
);
```

### 5. Division Operations (Common NaN Source)
```typescript
// ❌ BAD - No protection against division by zero
const rate = deaths / population;

// ✅ GOOD - Check denominator, validate result
if (population <= 0) {
  throw new Error(
    `❌ Division by zero in [PhaseName]\n` +
    `   Denominator (population): ${population}\n` +
    `   Month: ${state.currentMonth}`
  );
}

const rate = assertFinite(deaths / population, {
  location: '[PhaseName].execute',
  valueName: 'rate',
  month: state.currentMonth,
  additionalInfo: { deaths, population }
});
```

### 6. Aggregations (Reduce, Sum, Average)
```typescript
// ❌ BAD - No protection against NaN inputs
const total = agents.reduce((sum, a) => sum + a.capability, 0);

// ✅ GOOD - Validate each input, validate result
const total = agents.reduce((sum, agent) => {
  const capability = assertFinite(agent.capability, {
    location: 'AILifecyclePhase.aggregateCapability',
    valueName: `agent[${agent.id}].capability`,
    month: state.currentMonth
  });
  return sum + capability;
}, 0);

const validatedTotal = assertFinite(total, {
  location: 'AILifecyclePhase.aggregateCapability',
  valueName: 'totalCapability',
  month: state.currentMonth,
  additionalInfo: { agentCount: agents.length }
});
```

## Implementation Checklist (Per Phase)

- [ ] Add assertion utility imports
- [ ] Replace `?? fallback` with `assertStateProperty`
- [ ] Replace `|| fallback` with `assertStateProperty`
- [ ] Add `assertFinite` to all calculation results
- [ ] Add domain-specific assertions (`assertProbability`, `assertMortalityRate`, etc.)
- [ ] Protect all division operations (check denominator ≠ 0)
- [ ] Validate aggregation inputs and outputs
- [ ] Add context to all assertions (location, month, additionalInfo)
- [ ] Check for circular dependencies (read → transform → write back)
- [ ] Test phase in isolation (unit test if possible)

## Validation Steps

After implementing assertions in each phase:

1. **Type check:** `npx tsc --noEmit`
2. **Determinism test:** `npx tsx scripts/debugDeterminismPhases.ts`
3. **Monte Carlo N=3:** `timeout 180 npx tsx scripts/monteCarloSimulation.ts > logs/batch1_validation_$(date +%Y%m%d_%H%M%S).log 2>&1 &`
4. **Check logs for assertion errors:** `grep "❌\|NaN\|Infinity" logs/batch1_validation_*.log`

If assertions fire during normal operation:
- **Investigate root cause** - Don't remove the assertion
- **Fix upstream bug** - The assertion is doing its job
- **Document finding** - Add to logs/assertion_batch1_findings_20251107.md

## Expected Timeline

- **Phase 1 (Audit):** Complete ✅
- **Phase 2 (Batch 1 implementation):** 3-4 hours (18 phases × 10-15 min/phase)
- **Phase 3 (Validation):** 30 minutes (type check + determinism + MC N=3)
- **Total:** 4-5 hours for Batch 1

## Success Criteria

- ✅ All 18 CRITICAL phases have assertion imports
- ✅ No `?? fallback` or `|| fallback` in calculation code
- ✅ All calculations use `assertFinite`
- ✅ Type checking passes
- ✅ Determinism validation passes
- ✅ Monte Carlo N=3 runs without assertion errors (or documents new bugs found)

## Next Steps

After Batch 1 completion:
1. Document findings in logs/assertion_batch1_findings_20251107.md
2. Create Batch 2 plan (11 HIGH phases)
3. Continue systematic expansion (target: 95%+ coverage)

---

**Remember:** Assertions are not defensive programming. They're offensive bug detection. If an assertion fires, it's revealing a bug that was already there - the fallback was just hiding it.

**Fail loudly. Fix at source. Trust nothing.**
