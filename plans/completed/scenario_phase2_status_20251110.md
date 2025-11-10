# Scenario Analysis Phase 2 - Coordination Status

**Date:** November 10, 2025
**Phase:** Implementation in progress
**Priority:** HIGH

## Status Overview

✅ Research validation complete (no additional research needed)
🔄 Implementation tasks assigned and in progress
⏳ Testing and review pending

## Task Assignments

### Moss (Feature Implementer) - IN PROGRESS
**Tasks:**
- Task 2.1: Create `scripts/scenarioRunner.ts` (scenario execution framework)
- Task 2.3: Create `scripts/compareScenarios.ts` (comparative analysis)

**Status:** Task specification delivered
**File:** `.claude/agents/TASK_scenario_phase2_moss.md`
**Estimated:** 2-3 hours
**Can start:** NOW (doesn't depend on Roy's work for basic scenarios)

**Priority Scenarios to Test First:**
1. `no-tech` (baseline)
2. `god-mode` (existing)
3. `early-start-10yr` (time hypothesis)
4. `sequenced-deployment` (absorption hypothesis)

### Roy (Simulation Maintainer) - IN PROGRESS
**Tasks:**
- Task 2.2: Government override system (modify GameState, executeGovernmentActions)

**Status:** Task specification delivered
**File:** `.claude/agents/TASK_scenario_phase2_roy.md`
**Estimated:** 1-2 hours
**Priority:** HIGH (defensive coding required, phase modification)

**Files to Modify:**
1. `src/types/game.ts` (add scenarioOverrides field)
2. `src/simulation/government/executeGovernmentActions.ts` (add override logic)
3. `src/simulation/engine/phases/GovernmentActionsPhase.ts` (comment only)

**Defensive Requirements:**
- Assertion utilities on all values
- No silent fallbacks
- RNG determinism preserved
- Fail loudly with clear errors

## Parallel Work Strategy

**Moss can proceed immediately** with:
- scenarioRunner.ts implementation
- compareScenarios.ts implementation
- Testing scenarios WITHOUT government overrides

**After Roy completes:**
- Moss adds government override scenarios to test suite
- Test `governance-first` and `climate-prioritized` scenarios

**No file conflicts** - Moss works in scripts/, Roy works in src/simulation/

## Next Steps After Implementation

### 1. Monte Carlo Validation (Priya)
Once Moss completes scenario runner:
```bash
# Run each scenario N≥3 times
npx tsx scripts/scenarioRunner.ts god-mode 42 360 > logs/god_mode_42.log 2>&1
npx tsx scripts/scenarioRunner.ts god-mode 43 360 > logs/god_mode_43.log 2>&1
npx tsx scripts/scenarioRunner.ts god-mode 44 360 > logs/god_mode_44.log 2>&1

# Check determinism
npx tsx scripts/scenarioRunner.ts god-mode 42 360 > logs/god_mode_42_repeat.log 2>&1
diff logs/god_mode_42.log logs/god_mode_42_repeat.log  # MUST be identical
```

**Success Criteria:**
- Determinism: Same seed = identical results
- CV < 5% for outcome metrics across seeds
- Spiral activation patterns consistent

### 2. Architecture Review (architecture-skeptic)
After implementation complete:
- Check state propagation in override system
- Verify no performance bottlenecks
- Validate phase execution order preserved
- Review ScenarioResult extraction logic

### 3. Documentation (wiki-documentation-updater)
After review passes:
- Add scenario framework section to `docs/wiki/README.md`
- Document government override API
- Create usage guide for scenario testing
- Link to research foundation

## Priority Comparisons to Run

Once framework operational:

1. **`no-tech` vs `god-mode`** (tech impact baseline)
   - Hypothesis: Technology improves outcomes
   - Validates tech tree effectiveness

2. **`god-mode` vs `early-start-10yr`** (time hypothesis)
   - Hypothesis: Spirals need time to establish
   - Tests if 10 extra years enables spiral activation

3. **`god-mode` vs `governance-first`** (dependency hypothesis)
   - Hypothesis: Strong social foundations enable tech effectiveness
   - Tests if governance quality 0.8 unlocks spirals

4. **`god-mode` vs `sequenced-deployment`** (absorption hypothesis)
   - Hypothesis: Gradual deployment allows institutional adaptation
   - Tests if tier waves (12-month gaps) improve outcomes

## Expected Insights

**From comparisons:**
- Which conditions enable spiral activation?
- Is time or governance the bottleneck?
- Does absorption capacity matter?
- What's minimum viable social foundation?

**From Phase 2 → Phase 3:**
- Comprehensive scenario matrix (16+ combinations)
- Spiral sensitivity analysis
- Calibration of time constants
- Governance threshold identification

## Blockers / Risks

**Potential Issues:**
1. Government override implementation complex (Roy's domain - needs deep understanding of spending structure)
2. Scenario state extraction might miss edge cases (Moss needs good defensive coding)
3. Monte Carlo validation might reveal non-determinism (would need debugging)

**Mitigation:**
- Clear task specifications with examples
- Defensive coding requirements explicit
- Coordination channel for blockers
- Orchestrator monitoring progress

## Communication Protocol

**For agents:**
1. Post completion to this file when tasks done
2. Post blockers immediately if stuck
3. Coordinate in `.claude/coordination/` if dependencies unclear

**For orchestrator:**
1. Monitor task completion
2. Spawn Priya for Monte Carlo when Moss completes
3. Spawn architecture-skeptic when both complete
4. Spawn wiki-documentation-updater after review passes

## Timeline

**Estimated Total:** 6-8 hours
- Implementation (parallel): 3-4 hours
- Testing: 1-2 hours
- Review: 1 hour
- Documentation: 1 hour

**Target Completion:** End of session (today)
**Priority:** HIGH (blocking spiral activation understanding)

---

**Last Updated:** November 10, 2025 (Orchestrator - task assignment phase)
**Next Update:** After Moss/Roy complete tasks
