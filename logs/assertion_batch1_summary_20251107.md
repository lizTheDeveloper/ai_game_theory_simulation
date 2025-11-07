# Assertion Coverage Expansion - Session 1 Summary

**Date:** November 7, 2025
**Agent:** Roy (Simulation Maintainer)
**Duration:** ~1.5 hours
**Status:** Audit complete, foundation laid, 1/18 CRITICAL phases done

## Executive Summary

Completed comprehensive audit of assertion coverage across 116 simulation phases. Current coverage is **39.7%** (better than expected!), with 70 phases needing assertions.

**Key finding:** Only **29 phases** are CRITICAL or HIGH priority (the rest are LOW risk read-only/detection phases). This makes the expansion more achievable than initial estimate suggested.

**Implementation started:** Added comprehensive assertion coverage to HumanEnhancementPhase (1/18 CRITICAL phases). Type checking passes.

## Audit Results

### Coverage Statistics
- **Total phases:** 116
- **With assertions:** 46 (39.7%)
- **Without assertions:** 70 (60.3%)

### Risk Distribution (Unprotected Phases)
- **CRITICAL:** 18 phases (25.7%) - Population, mortality, AI capabilities, QoL
- **HIGH:** 11 phases (15.7%) - Climate, economy, planetary boundaries
- **MEDIUM:** 3 phases (4.3%) - Social systems, technology
- **LOW:** 38 phases (54.3%) - Read-only analysis, detection, logging

### Key Insight: Delegation Pattern

**Critical discovery:** Many CRITICAL phases are thin wrappers that delegate to external modules:

| Phase | Implementation Module |
|-------|----------------------|
| AILifecyclePhase | `lifecycle.ts` |
| ExtinctionProgressPhase | `extinctions.ts` |
| CatastrophicScenariosPhase | `catastrophicScenarios.ts` |
| MinimalSufferingPhase | `minimalSufferingTracking.ts` |
| LLMWeightUpdatePhase | `llm/integration.ts` |
| ConsciousnessGovernancePhase | `consciousnessGovernanceUtils.ts` |

**Implication:** Assertion coverage requires TWO layers:
1. **Phase layer** (validation at entry/exit points)
2. **Module layer** (validation of actual calculations)

## Revised Timeline

### Original Estimate (Naive)
- Batch 1 (18 phases): 4-5 hours
- Coverage target: 95%+

### Revised Estimate (Realistic)
- **Phase layer:** 3-4 hours (18 CRITICAL phase wrappers)
- **Module layer:** 6-8 hours (15-20 underlying implementation modules)
- **Validation:** 1 hour (type check + determinism + Monte Carlo N=10)
- **Total for Batch 1:** 10-13 hours

### Progress
- ✅ Audit: 30 minutes (complete)
- ✅ HumanEnhancementPhase: 30 minutes (complete, type-safe)
- ⏸️ Remaining CRITICAL phases: 17 phases (~8-11 hours)

## Implementation Details

### Completed: HumanEnhancementPhase

**File:** `src/simulation/engine/phases/HumanEnhancementPhase.ts`

**Assertions added:**
1. AI capability aggregation with per-agent validation
2. Productivity multiplier from aiAssistedSkills calculation
3. UBI level with source tracking
4. Labor-capital distribution metrics (productivity-wage gap, labor share)

**Pattern template:**
```typescript
import {
  assertFinite,
  assertInRange,
  assertNonEmpty,
  assertDefined
} from '@/simulation/utils/assertions';

// Aggregation with input validation
const avgAICapability = assertFinite(
  state.aiAgents.reduce((sum, ai) => {
    const capability = assertFinite(ai.capability, {
      location: 'HumanEnhancementPhase.execute',
      valueName: `aiAgent[${ai.id}].capability`,
      month: state.currentMonth,
      additionalInfo: { agentId: ai.id, expectedSource: 'AILifecyclePhase or initialization' }
    });
    return sum + capability;
  }, 0) / state.aiAgents.length,
  {
    location: 'HumanEnhancementPhase.execute',
    valueName: 'avgAICapability',
    month: state.currentMonth,
    additionalInfo: { agentCount: state.aiAgents.length }
  }
);

// Range validation for metrics
const laborShare = assertInRange(
  state.laborCapitalDistribution.laborShare,
  0, 1,
  {
    location: 'HumanEnhancementPhase.execute',
    valueName: 'laborShare',
    month: state.currentMonth
  }
);
```

**Validation:** Type checking passes (`npx tsc --noEmit`).

## Next Steps (Priority Order)

### Immediate (Next Session)

**Tier 1: Phases with inline calculations (quick wins)**
1. ✅ HumanEnhancementPhase (DONE)
2. BenchmarkEvaluationsPhase (26 lines - likely simple)
3. RLHFBindingPhase (125 lines)
4. SocialInfluenceUpdatePhase (121 lines)
5. ResentmentRecoveryPhase
6. CollectiveFormationPhase
7. GovernmentElectionPhase

**Tier 2: Complex phases requiring utility module work**
8. ConsciousnessGovernancePhase (370 lines - requires consciousnessGovernanceUtils.ts)
9. Tier2CrisisAnticipationPhase
10. Tier2DarkComputePhase
11. Tier2SynergyPhase
12. Tier2SyntheticEcosystemsPhase
13. UnknownUnknownPhase

**Tier 3: Delegation phases requiring module audits**
14. AILifecyclePhase → audit lifecycle.ts
15. LLMWeightUpdatePhase → audit llm/integration.ts
16. ExtinctionProgressPhase → audit extinctions.ts
17. CatastrophicScenariosPhase → audit catastrophicScenarios.ts
18. MinimalSufferingPhase → audit minimalSufferingTracking.ts

### Validation After Batch 1 Complete

1. **Type check:** `npx tsc --noEmit`
2. **Determinism:** `npx tsx scripts/debugDeterminismPhases.ts`
3. **Quick smoke:** `timeout 60 npx tsx scripts/monteCarloSimulation.ts --runs=1 --max-months=12`
4. **Full validation:** `npx tsx scripts/monteCarloSimulation.ts --runs=10 --max-months=120 > logs/batch1_validation_$(date +%Y%m%d_%H%M%S).log 2>&1 &`
5. **Error audit:** `grep "❌\|NaN\|Infinity\|AssertionError" logs/batch1_validation_*.log`
6. **Document bugs:** logs/assertion_batch1_findings_20251107.md

## Expected Bug Categories

Based on Oct 2025 ecology NaN bug (the infamous `?? 50` fallback that hid NaN for months):

1. **Silent fallback masking:** `value ?? defaultValue` hiding NaN propagation
2. **Division by zero:** Unprotected `/` operations
3. **Circular dependencies:** Phase A writes X → Phase B reads X and modifies X → feedback loop
4. **Uninitialized state:** Missing initialization.ts setup
5. **Aggregation poisoning:** One NaN input in `.reduce()` corrupts entire sum

## Assertion Context Best Practices

### Use `additionalInfo` (not `expectedSource`) for assertFinite/assertInRange
```typescript
// ✅ CORRECT
assertFinite(value, {
  location: 'PhaseName.execute',
  valueName: 'metricName',
  month: state.currentMonth,
  additionalInfo: { expectedSource: 'PriorPhase', otherContext: 'value' }
});

// ❌ WRONG - TypeScript error
assertFinite(value, {
  location: 'PhaseName.execute',
  valueName: 'metricName',
  month: state.currentMonth,
  expectedSource: 'PriorPhase'  // Only exists on assertDefined
});
```

### Use `expectedSource` directly for assertDefined
```typescript
// ✅ CORRECT
assertDefined(value, {
  location: 'PhaseName.execute',
  valueName: 'propertyName',
  month: state.currentMonth,
  expectedSource: 'initialization.ts:559'
});
```

## Deliverables (Session 1)

- ✅ `logs/assertion_coverage_audit_20251107.log` - Full audit output
- ✅ `logs/assertion_batch1_plan_20251107.md` - Implementation strategy
- ✅ `logs/assertion_batch1_implementation_20251107.md` - Detailed progress log
- ✅ `logs/assertion_batch1_summary_20251107.md` - Executive summary (this file)
- ✅ `src/simulation/engine/phases/HumanEnhancementPhase.ts` - First implementation (type-safe)

## Success Criteria for Batch 1

- [ ] All 18 CRITICAL phase files have assertion imports
- [ ] All inline calculations have assertFinite or domain-specific assertions
- [ ] Underlying modules have assertion coverage (5+ key modules)
- [ ] No `?? fallback` in calculation code (only after validation for initialization defaults)
- [ ] Type checking passes
- [ ] Determinism validation passes
- [ ] Monte Carlo N=10 runs to completion
- [ ] Any assertion errors documented with root cause analysis

## Coverage Target

**Goal:** 95%+ coverage (111+ phases with assertions)

**Current:** 39.7% coverage (46/116 phases)

**After Batch 1 (CRITICAL only):** ~55% coverage (64/116 phases)

**After Batch 2 (CRITICAL+HIGH):** ~65% coverage (75/116 phases)

**After Batch 3 (CRITICAL+HIGH+MEDIUM):** ~67% coverage (78/116 phases)

**After Batch 4 (all phases):** ~99% coverage (114/116 phases, 2 deliberately excluded)

## Timeline to 95% Coverage

| Batch | Phases | Duration | Cumulative Time | Coverage After |
|-------|--------|----------|-----------------|----------------|
| Audit | - | 30 min | 30 min | 39.7% (baseline) |
| Batch 1 | 18 CRITICAL | 10-13 hours | ~13 hours | 55% |
| Batch 2 | 11 HIGH | 6-8 hours | ~20 hours | 65% |
| Batch 3 | 3 MEDIUM | 2-3 hours | ~22 hours | 67% |
| Batch 4 | 38 LOW | 6-8 hours | ~28 hours | 99% |

**Estimated total:** 25-30 hours for complete coverage expansion (not 16 hours in original estimate).

## Notes for Continuation

1. Use HumanEnhancementPhase as reference template
2. Validate incrementally (type check every 3-4 phases)
3. When assertions fire during testing → investigate, don't remove
4. Document all findings in findings log
5. Rich context is critical for debugging (location, month, additionalInfo)

---

**Roy's assessment:** Audit complete. 1 down, 17 to go for CRITICAL batch. This is exactly the kind of systematic defensive work that should've been done from day 1. But better late than never.

**Next session:** Continue with Tier 1 phases (inline calculations) for quick progress.
