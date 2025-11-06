# Handoff to Simulation-Maintainer: WEEK 3 Task 7

**From:** Orchestrator
**To:** Simulation-Maintainer (Roy)
**Date:** November 6, 2025
**Task:** State Validation Framework Implementation

## Context

WEEK 3 of 4-week consensus plan. WEEK 2 completed at 200% target metrics (Architecture health: 8.0/10, Research quality: A/A+).

**Quality Gate 1:** PASSED
- Research document: `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/state_validation_and_dependencies_20251106.md`
- Critique: `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/reviews/state_validation_research_critique_20251106.md`

## Your Mission (Task 7: State Validation Framework - 3 days)

### Current State
- 590 total state mutations identified
- 410 assertions currently in place (69% coverage)
- 180 unvalidated mutations (30% gap)
- Risk: Silent bugs, NaN propagation, data corruption

### Target State
- 590/590 assertions in critical paths (100% coverage)
- Domain-specific validators operational
- Top 20 critical phases fully validated
- Integration tests prevent regressions

## Step-by-Step Instructions

### Step 1: Audit State Mutations (Day 1)

**Command:**
```bash
# Find all state mutations in phases
grep -rn "state\." --include="*.ts" src/simulation/engine/phases/ | grep " = " | grep -v "const " | grep -v "let " > /home/lizthedeveloper_gmail_com/ai_game_theory_simulation/reports/state_mutations_raw.txt

# Count mutations by phase
for file in src/simulation/engine/phases/*.ts; do
  count=$(grep "state\." "$file" | grep " = " | grep -v "const " | grep -v "let " | wc -l)
  echo "$count: $(basename $file)"
done | sort -rn > /home/lizthedeveloper_gmail_com/ai_game_theory_simulation/reports/mutations_by_phase.txt
```

**Create Audit Report:**
File: `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/reports/state_mutation_audit_20251106.md`

Include:
1. Total mutations found (should be ~590)
2. Mutations by domain:
   - Mortality/population phases
   - Climate/environmental phases
   - AI capability phases
   - Economic phases
   - Planetary boundary phases
3. Mutations with/without assertions
4. Priority ranking (CRITICAL → HIGH → MEDIUM → LOW)

### Step 2: Expand Assertion Utilities (Day 2)

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/utils/assertions.ts`

**Already Exist (from current codebase):**
- `assertFinite()`
- `assertDefined()`
- `assertInRange()`
- `assertProbability()`
- `assertStateProperty()`
- `assertMortalityRate()`
- `assertTemperatureDelta()`
- `assertPopulationChange()`
- `assertAICapability()`
- `assertEconomicMetric()`
- `assertPlanetaryBoundary()`

**Add If Needed:**
Check if any domain-specific validators are missing. Research document suggests these are sufficient.

**Test:** Create unit tests in `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/tests/utils/assertions.test.ts`

### Step 3: Add Assertions to Top 20 Critical Phases (Day 2-3)

**Priority Phases (from research document):**
1. BayesianMortalityResolutionPhase
2. ClimateImpactCascadePhase
3. ExtremeWeatherEventsPhase
4. AIAgentActionsPhase
5. AlignmentDynamicsPhase
6. OceanAcidificationPhase
7. NovelEntitiesPhase (nitrogen/phosphorus)
8. FamineSystemPhase
9. WetBulbTemperaturePhase
10. HumanPopulationPhase
11. RefugeeCrisisPhase
12. EconomicTransitionPhase
13. QualityOfLifePhase
14. NuclearWinterPhase
15. FoodSecurityDegradationPhase
16. SocialStabilityPhase
17. GovernmentActionsPhase
18. TechTreePhase
19. ResourceEconomyPhase
20. MultiParadigmDUIUpdatePhase

**Pattern:**
For EVERY state mutation:
```typescript
// ❌ BAD (before)
state.humanPopulationSystem.population = newPopulation;

// ✅ GOOD (after)
const validatedPopulation = assertPopulationChange(newPopulation, state.humanPopulationSystem.population, {
  location: 'BayesianMortalityResolutionPhase',
  valueName: 'population',
  month: state.currentMonth
});
state.humanPopulationSystem.population = validatedPopulation;
```

**Commit Strategy:**
- One commit per phase (or small batches)
- Descriptive messages: "feat: Add state validation assertions to BayesianMortalityResolutionPhase"
- Test after each phase (run Monte Carlo to verify no false positives)

### Step 4: Create Integration Tests (Day 3)

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/tests/integration/state-validation.test.ts`

**Test Cases:**
1. **Test: Assertions catch NaN propagation**
   - Inject NaN value into mortality calculation
   - Verify assertion throws with full context

2. **Test: Assertions catch physically implausible values**
   - Inject 100% monthly mortality rate
   - Verify assertion throws

3. **Test: Monte Carlo runs don't trigger false positives**
   - Run N=10 Monte Carlo with assertions enabled
   - Verify all complete successfully

4. **Test: Error messages include full context**
   - Trigger assertion failure
   - Verify error includes location, month, values

## Success Criteria

**Task 7 Complete When:**
- [x] Audit report identifies all 180 unvalidated mutations
- [x] Assertion utilities cover all needed domains
- [x] Top 20 phases have 100% assertion coverage
- [x] Integration tests pass
- [x] Monte Carlo runs (N=10) complete without false positives

## Deliverables

1. **Audit Report:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/reports/state_mutation_audit_20251106.md`
2. **Updated Assertion Utilities:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/utils/assertions.ts` (if needed)
3. **Updated Phases:** 20 phases with full assertion coverage
4. **Integration Tests:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/tests/integration/state-validation.test.ts`
5. **Validation Report:** Document in audit report that 100% coverage achieved

## Resources

- **Research:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/state_validation_and_dependencies_20251106.md`
- **Critique:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/reviews/state_validation_research_critique_20251106.md`
- **Current Assertions:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/utils/assertions.ts`
- **Example Phase:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/engine/phases/BayesianMortalityResolutionPhase.ts` (already has good patterns)

## Important Notes

1. **Fail-Fast Philosophy:** Assertions should crash immediately on invalid values (don't continue with corrupted state)
2. **Context is Critical:** Every assertion MUST include location, valueName, month
3. **No False Positives:** If assertions trigger on valid simulation runs, bounds are too strict (adjust)
4. **Domain-Specific Bounds:** Use research-backed values from research document (mortality caps, temperature deltas, etc.)
5. **Git Workflow:** Commit to current branch `auto/worker-20251106_140001`

## Timeline

- **Day 1:** Audit (identify 180 unvalidated mutations)
- **Day 2:** Expand utilities (if needed) + Start adding assertions to phases
- **Day 3:** Finish assertion coverage + Integration tests

## After Task 7 Complete

Hand back to orchestrator for Task 8 (Phase Dependency System) coordination.

**Next Agent:** Orchestrator will coordinate Task 8 implementation

---

**Orchestrator Status:** Waiting for Task 7 completion
**Branch:** auto/worker-20251106_140001
**Expected Completion:** Day 3 of WEEK 3
