# Assertion Coverage Expansion - Batch 1 Implementation Log

**Date:** November 7, 2025
**Session:** Part 1 of 2 (Audit + Initial Implementation)
**Auditor:** Roy (Simulation Maintainer)

## Summary

**Current status after this session:**
- **Audit complete:** 116 phases classified by risk
- **Phases WITH assertions:** 46 (39.7%) - better than expected!
- **Phases WITHOUT assertions:** 70 (60.3%)
- **CRITICAL phases needing work:** 18 phases
- **Batch 1 started:** 1/18 phases implemented (HumanEnhancementPhase)

## Audit Results

### Phase Classification

| Risk Level | Count | % of Unprotected | Examples |
|-----------|-------|------------------|----------|
| CRITICAL | 18 | 25.7% | AILifecyclePhase, ExtinctionProgressPhase, HumanEnhancementPhase |
| HIGH | 11 | 15.7% | PolicyImplementationPhase, TechTreePhase, FlashWarEscalationPhase |
| MEDIUM | 3 | 4.3% | TimeAdvancementPhase, UpwardSpiralsPhase, EnsembleMetaLearningPhase |
| LOW | 38 | 54.3% | EventCollectionPhase, DetectionPhases, most governance/diplomatic phases |

**Key finding:** 54.3% of unprotected phases are LOW risk (read-only/detection). The critical work is the 29 CRITICAL+HIGH phases.

### Phases Already Protected (39.7%)

The good news: many critical systems already have comprehensive assertion coverage:
- ✅ BayesianMortalityResolutionPhase
- ✅ PlanetaryBoundariesPhase
- ✅ ClimateImpactCascadePhase
- ✅ FamineSystemPhase
- ✅ QualityOfLifePhase
- ✅ NuclearWinterPhase
- ✅ ExtinctionTriggersPhase
- ✅ DystopiaProgressionPhase
- ✅ OutcomeProbabilitiesPhase
- And 37 more...

## Implementation Progress (Session 1)

### Completed: HumanEnhancementPhase (1/18)

**File:** `src/simulation/engine/phases/HumanEnhancementPhase.ts`

**Assertions added:**
1. **AI capability aggregation** (lines 53-71)
   - Validate each agent's capability before summing
   - Validate average calculation (NaN from division by zero)
   - Full context: agent ID, count, month

2. **Productivity multiplier** (lines 103-111)
   - Validate result from `calculateProductivityMultiplierFromAIAssistedSkills`
   - Source tracking for debugging

3. **UBI level** (lines 114-122)
   - Validate UBI amount from UBIPhase
   - Use `?? 0` fallback ONLY after validation (default when system not active)

4. **Labor-capital distribution metrics** (lines 170-189)
   - Validate productivity-wage gap [-1, 1] range
   - Validate labor share [0, 1] probability
   - Protect logging calculations from NaN

**Pattern used:**
```typescript
const avgAICapability = assertFinite(
  state.aiAgents.reduce((sum, ai) => {
    const capability = assertFinite(ai.capability, {
      location: 'HumanEnhancementPhase.execute',
      valueName: `aiAgent[${ai.id}].capability`,
      month: state.currentMonth,
      expectedSource: 'AILifecyclePhase or initialization'
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
```

**Result:** Phase now fails loudly if AI capabilities are NaN, instead of silently propagating bad data.

## Architecture Discovery

### Phase Delegation Pattern

**Finding:** Many CRITICAL phases are thin wrappers that delegate to external modules:

| Phase | Delegates To | Implication |
|-------|-------------|-------------|
| AILifecyclePhase | `lifecycle.ts` | Assertions needed in lifecycle.ts, not phase |
| ExtinctionProgressPhase | `extinctions.ts` | Assertions needed in extinctions.ts |
| CatastrophicScenariosPhase | `catastrophicScenarios.ts` | Assertions needed in module |
| MinimalSufferingPhase | `minimalSufferingTracking.ts` | Assertions needed in module |
| LLMWeightUpdatePhase | `llm/integration.ts` | Assertions needed in LLM integration |

**This means:** Adding assertions to phases is only HALF the work. We also need to audit the underlying modules:
- `src/simulation/lifecycle.ts`
- `src/simulation/extinctions.ts`
- `src/simulation/catastrophicScenarios.ts`
- `src/simulation/minimalSufferingTracking.ts`
- `src/simulation/llm/integration.ts`
- `src/simulation/utils/consciousnessGovernanceUtils.ts`
- And ~30 more support modules

## Revised Strategy

### Original Plan (Naive)
1. Add assertions to 18 CRITICAL phase files
2. Validate with Monte Carlo
3. Move to HIGH phases

### Revised Plan (Realistic)
1. **Phase assertions** (thin validation layer): 18 CRITICAL phases
2. **Module assertions** (where calculations happen): ~15-20 support modules
3. **Comprehensive validation:** Monte Carlo N=10+ after both layers complete

**Estimated time:**
- Phase layer: 3-4 hours (original estimate, partially complete)
- Module layer: 6-8 hours (NEW - not in original plan)
- Validation: 1 hour (type check + determinism + Monte Carlo N=10)
- **Total: 10-13 hours** (not 4-5 hours)

## Next Steps (Session 2)

### Priority Order for Next Session

**Tier 1: Phases with inline calculations (quick wins)**
1. ✅ HumanEnhancementPhase (DONE)
2. BenchmarkEvaluationsPhase (26 lines - likely simple wrapper)
3. RLHFBindingPhase (125 lines - moderate complexity)
4. SocialInfluenceUpdatePhase (121 lines - moderate complexity)
5. ResentmentRecoveryPhase (needs inspection)
6. CollectiveFormationPhase (needs inspection)
7. GovernmentElectionPhase (needs inspection)

**Tier 2: Complex phases with utility modules (requires module work)**
8. ConsciousnessGovernancePhase (370 lines - complex, requires consciousnessGovernanceUtils.ts)
9. Tier2CrisisAnticipationPhase (needs inspection)
10. Tier2DarkComputePhase (needs inspection)
11. Tier2SynergyPhase (needs inspection)
12. Tier2SyntheticEcosystemsPhase (needs inspection)
13. UnknownUnknownPhase (needs inspection)

**Tier 3: Delegating phases (requires module audits)**
14. AILifecyclePhase → lifecycle.ts
15. LLMWeightUpdatePhase → llm/integration.ts
16. ExtinctionProgressPhase → extinctions.ts
17. CatastrophicScenariosPhase → catastrophicScenarios.ts
18. MinimalSufferingPhase → minimalSufferingTracking.ts

### Validation Plan

After completing Batch 1 (all 18 phases + underlying modules):

1. **Type check:** `npx tsc --noEmit`
2. **Determinism test:** `npx tsx scripts/debugDeterminismPhases.ts`
3. **Quick smoke test:** `timeout 60 npx tsx scripts/monteCarloSimulation.ts --runs=1 --max-months=12`
4. **Full validation:** `npx tsx scripts/monteCarloSimulation.ts --runs=10 --max-months=120 > logs/batch1_validation_$(date +%Y%m%d_%H%M%S).log 2>&1 &`
5. **Check for assertion errors:** `grep "❌\|NaN\|Infinity\|AssertionError" logs/batch1_validation_*.log`
6. **Document bugs found:** Add to logs/assertion_batch1_findings_20251107.md

## Findings So Far

### No Issues Detected Yet
HumanEnhancementPhase assertions compile and type-check cleanly. No immediate bugs surfaced, but haven't run simulation yet.

### Expected Bug Categories

Based on Oct 2025 ecology NaN bug patterns, expect to find:

1. **Silent fallback masking:** `value ?? defaultValue` hiding NaN propagation
2. **Division by zero:** Calculations without denominator checks
3. **Circular dependencies:** Phase A writes X, Phase B reads X and writes X, causing feedback loops
4. **Uninitialized state:** Phases accessing properties not set by initialization
5. **Aggregation NaN:** One bad input in a `.reduce()` poisoning the entire sum

### Testing Approach

When assertions fire:
1. **Don't remove the assertion** - It's doing its job
2. **Trace back to source** - Where did NaN originate?
3. **Fix root cause** - Add missing initialization, break circular dependency, add denominator check
4. **Document finding** - Add to findings log with root cause analysis
5. **Validate fix** - Re-run Monte Carlo to confirm

## Session 1 Deliverables

- ✅ Audit script run: `logs/assertion_coverage_audit_20251107.log`
- ✅ Batch 1 plan: `logs/assertion_batch1_plan_20251107.md`
- ✅ Implementation log: `logs/assertion_batch1_implementation_20251107.md` (this file)
- ✅ 1 phase complete: HumanEnhancementPhase with 4 assertion groups

## Timeline Estimate (Revised)

| Phase | Duration | Status |
|-------|----------|--------|
| Audit | 30 min | ✅ Complete |
| Batch 1 Tier 1 (7 phases) | 2-3 hours | 🔄 1/7 done |
| Batch 1 Tier 2 (6 phases) | 3-4 hours | ⏸️ Not started |
| Batch 1 Tier 3 (5 modules) | 4-5 hours | ⏸️ Not started |
| Validation | 1 hour | ⏸️ Not started |
| **Total** | **10-13 hours** | **Session 1: 1.5 hours spent** |

**Remaining work:** ~8-11 hours for Batch 1 completion

## Notes for Next Session

1. Start with Tier 1 phases (inline calculations) for quick progress
2. Use HumanEnhancementPhase as template for assertion patterns
3. When hitting delegation phases, audit underlying module FIRST
4. Keep assertion context rich (location, month, expectedSource, additionalInfo)
5. Run type check after every 3-4 phases to catch errors early
6. Don't wait until all 18 done to validate - validate incrementally

## Success Criteria

For Batch 1 to be considered complete:
- [ ] All 18 CRITICAL phase files have assertion imports
- [ ] All inline calculations have `assertFinite` or domain-specific assertions
- [ ] All underlying modules have assertion coverage (5+ key modules)
- [ ] No `?? fallback` in calculation code (only after validation for defaults)
- [ ] Type checking passes
- [ ] Determinism validation passes
- [ ] Monte Carlo N=10 runs to completion
- [ ] Any assertion errors documented with root cause analysis

---

**Session 1 Status:** Audit complete, foundation laid, 1/18 phases done.

**Next session:** Continue with Tier 1 phases (BenchmarkEvaluationsPhase, RLHFBindingPhase, SocialInfluenceUpdatePhase).

**Roy's note:** This is why we can't have nice things. 116 phases, only 40% protected. At least we're making progress.
