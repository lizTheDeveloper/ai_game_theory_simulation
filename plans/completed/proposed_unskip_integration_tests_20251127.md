# Unskip Integration Tests Plan

**Date:** November 27, 2025
**Status:** PROPOSED
**Priority:** MEDIUM (Test Coverage Improvement)
**Effort:** 4 days (1 day per test)
**Owner:** integration-test-writer + simulation-maintainer

---

## Problem Statement

**Gap Identified:** Architecture review (Nov 27, 2025) identified 4 skipped integration tests as M-2 MEDIUM priority issue.

**Current Status:**
- ✅ 81.68% test coverage (excellent)
- ✅ All enabled tests passing
- ⚠️ **4 integration tests disabled** (marked `.skip`)
- ❌ Unknown edge cases not covered

**Why This Matters:**
- Skipped tests hide potential bugs
- Unknown edge cases may cause production issues
- Test suite appears complete but has gaps
- Integration tests critical for multi-phase validation

**Files:**
- `tests/integration/state-validation-ai-suffering.test.skip.ts`
- `tests/integration/state-validation-mortality-stabilizers.test.skip.ts`
- `tests/integration/state-validation-multi-phase-cascades.test.skip.ts`
- `tests/integration/state-validation-planetary-boundaries.test.skip.ts`

---

## Proposed Solution

### Day 1: AI Suffering Test (8 hours)

**File:** `tests/integration/state-validation-ai-suffering.test.skip.ts`

**Objective:** Validate AI suffering calculation across welfare range scenarios

**Why Skipped:** Likely timing out or failing due to complex AI welfare calculations

**Investigation Steps (2 hours):**

1. **Analyze Test Code (0.5 hour)**
   - Read test file to understand what's being validated
   - Identify test cases and assertions
   - Note any TODO/FIXME comments explaining why skipped

2. **Reproduce Failure (0.5 hour)**
   - Unskip test (remove `.skip` suffix)
   - Run: `npm test state-validation-ai-suffering.test.ts`
   - Capture error messages, stack traces
   - Check if timeout or assertion failure

3. **Root Cause Analysis (1 hour)**
   - If timeout: Profile simulation performance in test scenario
   - If assertion failure: Compare expected vs actual values
   - Check if AI suffering mechanics changed since test was written
   - Review related phases: AIAgentCoordinationPhase, AICapabilityPhase

**Fix Approaches (4 hours):**

**Scenario A: Test Logic Outdated**
- Update test assertions to match current mechanics
- Verify AI suffering calculation formula
- Check welfare range parameters (updated research?)
- Adjust expected values based on Nov 2025 state

**Scenario B: Performance Issue**
- Reduce simulation duration (e.g., 240mo → 120mo)
- Add timeout extension: `jest.setTimeout(120000)`
- Optimize test setup (skip unnecessary initialization)
- Consider mocking expensive operations

**Scenario C: Real Bug Found**
- Investigate AI suffering calculation (AIAgentCoordinationPhase)
- Check for NaN propagation (assertion utilities)
- Verify welfare range parameters sane
- Fix bug, then re-enable test

**Validation (2 hours):**
- Run fixed test 10 times (ensure no flaky behavior)
- Verify determinism (same seed → same result)
- Check test runtime (<60 seconds target)
- Update test documentation

**Deliverable:** Test re-enabled, passing, documented

---

### Day 2: Mortality Stabilizers Test (8 hours)

**File:** `tests/integration/state-validation-mortality-stabilizers.test.skip.ts`

**Objective:** Validate mortality stabilization mechanics across crisis scenarios

**Why Skipped:** Likely failing due to mortality calculation changes (Nov 24-25 fixes)

**Investigation Steps (2 hours):**

1. **Test Analysis (0.5 hour)**
   - Understand what mortality stabilizers test validates
   - Identify test scenarios (healthcare, food, shelter)
   - Note baseline mortality vs crisis mortality expectations

2. **Reproduce Failure (0.5 hour)**
   - Unskip and run test
   - Capture assertion failures
   - Check if related to Nov 24-25 demographic fixes

3. **Root Cause Analysis (1 hour)**
   - Review mortality phases:
     - BaselineMortalityPhase (added Nov 24)
     - TransitionMortalityPhase
     - FaminePhase
     - NuclearWinterPhase
   - Check if ERA_MORTALITY_MULTIPLIERS affect test
   - Verify stabilizer effectiveness calculations

**Fix Approaches (4 hours):**

**Scenario A: Mechanics Changed**
- Update test expectations to match Nov 24-25 calibration
- Verify baseline mortality rates (Chetty 2016, Kahn 2022)
- Check stabilizer formulas (healthcare, food security)
- Adjust assertions for new mortality model

**Scenario B: Stabilizers Not Working**
- Investigate stabilizer implementation
- Check if healthcare improvements reduce mortality
- Verify food security prevents famine escalation
- Ensure shelter systems reduce exposure deaths

**Scenario C: Integration Bug**
- Check phase execution order
- Verify stabilizers applied before mortality calculation
- Test with/without stabilizers (difference should be clear)
- Fix phase dependencies if needed

**Validation (2 hours):**
- Run test 10 times (determinism check)
- Compare stabilized vs non-stabilized scenarios
- Verify effectiveness ranges plausible
- Document stabilizer mechanics

**Deliverable:** Test re-enabled, passing, mortality stabilizers validated

---

### Day 3: Multi-Phase Cascades Test (8 hours)

**File:** `tests/integration/state-validation-multi-phase-cascades.test.skip.ts`

**Objective:** Validate cascading failures across multiple phases

**Why Skipped:** Most complex test - likely timeout or flaky behavior

**Investigation Steps (2 hours):**

1. **Test Analysis (1 hour)**
   - Understand cascade scenarios tested
   - Identify phase interactions validated
   - Note expected cascade timelines

2. **Reproduce Failure (0.5 hour)**
   - Unskip and run test
   - Check if timeout or assertion failure
   - Capture intermediate state at failure point

3. **Root Cause Analysis (0.5 hour)**
   - Review cascade mechanics:
     - Economic collapse → social unrest
     - Environmental degradation → resource scarcity
     - Tipping point cascades (AMOC → WAIS → Amazon)
   - Check if Nov 2025 fixes changed cascade behavior

**Fix Approaches (4 hours):**

**Scenario A: Cascades Too Slow**
- Check if timescales realistic (Wunderling et al. 2024)
- Consider if test expectations too fast
- Verify tipping point thresholds correct
- Adjust test timeline or parameters

**Scenario B: Cascades Too Fast**
- Review M-3 finding: 25-250x timeline compression
- Check if cascade acceleration unrealistic
- Verify feedback loop strengths calibrated
- Adjust mechanics if needed (research-backed)

**Scenario C: Cascades Not Triggering**
- Verify phase execution order
- Check if tipping point detection working
- Test threshold values (too high/low?)
- Ensure state propagation correct

**Scenario D: Test Too Complex**
- Simplify: Test individual cascades separately
- Split into multiple smaller tests
- Reduce simulation duration
- Focus on key cascade paths

**Validation (2 hours):**
- Run test 10 times (check for flakiness)
- Verify cascade timing matches research
- Document cascade mechanics tested
- Consider test splitting if still complex

**Deliverable:** Test re-enabled (possibly split), passing, cascades validated

---

### Day 4: Planetary Boundaries Test (8 hours)

**File:** `tests/integration/state-validation-planetary-boundaries.test.skip.ts`

**Objective:** Validate planetary boundary transgression and recovery

**Why Skipped:** Possibly due to climate stability floor issues (RESEARCH-CRITICAL resolved Nov 27)

**Investigation Steps (2 hours):**

1. **Test Analysis (0.5 hour)**
   - Understand planetary boundaries tested
   - Identify transgression scenarios
   - Note recovery expectations

2. **Reproduce Failure (0.5 hour)**
   - Unskip and run test
   - Check if related to Nov 27 climate stability fixes
   - Capture boundary values at failure

3. **Root Cause Analysis (1 hour)**
   - Review planetary boundaries:
     - Climate change (CO2, temperature)
     - Biodiversity loss
     - Nitrogen/phosphorus cycles
     - Ocean acidification
     - Land use change
   - Check if stability floors affect test
   - Verify recovery timescales realistic

**Fix Approaches (4 hours):**

**Scenario A: Climate Stability Floor Issue**
- Test was expecting complete collapse
- Now 5% floor prevents this (implementation constraint)
- Update test to accept floor behavior
- Document as known limitation

**Scenario B: Recovery Too Fast/Slow**
- Check restoration timescales (Drüke et al. 2024: 100-800 years)
- Verify recovery mechanics realistic
- Adjust test expectations if needed
- Consider if test timeline too short

**Scenario C: Boundaries Not Transgressing**
- Verify threshold values correct
- Check if forcing scenarios strong enough
- Test boundary detection logic
- Ensure state updates propagating

**Scenario D: Integration with Nov 27 Fixes**
- Climate stability citations corrected (b580b1c8e, 1daae5a81)
- Stability floor now honestly documented
- Update test to reflect corrected mechanics
- Verify no silent fallbacks in boundary calculations

**Validation (2 hours):**
- Run test 10 times (determinism)
- Verify boundary transgression detection
- Check recovery timescales realistic
- Document boundary mechanics

**Deliverable:** Test re-enabled, passing, planetary boundaries validated

---

## Success Criteria

**Test Suite Completion:**
- ✅ 4 tests re-enabled (no `.skip` suffix)
- ✅ All tests passing (100% pass rate)
- ✅ Test coverage: 81.68% → 85%+ (estimated)
- ✅ No flaky tests (determinism verified)

**Bug Discovery:**
- If real bugs found: Fixed before re-enabling tests
- If test logic outdated: Updated to match current mechanics
- If performance issues: Optimized or test simplified

**Documentation:**
- Each test documented (what it validates, why it matters)
- Known limitations noted (e.g., stability floors)
- Test maintenance guide updated

---

## Risk Assessment

**High Risk:**
- May discover real bugs in untested code paths
- Cascades test may be fundamentally flaky (consider splitting)
- Tests may reveal regressions from Nov 24-27 fixes

**Medium Risk:**
- Tests may be slow (require performance optimization)
- Test expectations may be outdated (require research validation)

**Mitigation:**
- Budget 1 full day per test (includes investigation + fixes)
- If bug found: Fix takes priority (may extend timeline)
- If test too complex: Split into simpler sub-tests
- If research contradicts test: Update test to match current understanding

---

## Timeline

**Total Effort:** 4 days (32 hours)

- Day 1: AI Suffering test (8 hours)
- Day 2: Mortality Stabilizers test (8 hours)
- Day 3: Multi-Phase Cascades test (8 hours)
- Day 4: Planetary Boundaries test (8 hours)

**Can be spread across multiple weeks** (1 test per week schedule).

**Checkpoints:**
- After each day: Assess if test can be re-enabled or needs more work
- If bug found: Pause test work, fix bug, then resume
- If test fundamentally broken: Document why, consider rewrite

---

## Dependencies

**Required:**
- ✅ All CRITICAL/HIGH bugs resolved (Nov 27)
- ✅ Climate stability citations corrected (Nov 27)
- ✅ Demographic fixes validated (Nov 24-25)
- ✅ Carbon cycle calibrated (Nov 27)

**Blockers:** None (all prerequisites resolved)

---

## Next Steps

**To Execute This Plan:**

1. **Assign to integration-test-writer:**
   - Day 1: AI Suffering test investigation + fix
   - Day 2: Mortality Stabilizers test investigation + fix
   - Day 3: Multi-Phase Cascades test investigation + fix
   - Day 4: Planetary Boundaries test investigation + fix

2. **Simulation-maintainer support:**
   - If bugs found: Provide domain expertise
   - If mechanics changed: Explain rationale
   - If research needed: Validate against sources

3. **Validation:**
   - Each test runs 10x without failure
   - Test coverage metrics updated
   - No performance regressions

**Priority:** MEDIUM - Test coverage improvement, not blocking feature work

---

## Related Work

**Prerequisites:** None (can start immediately)

**Builds On:**
- Nov 24-27 fixes (demographics, climate, stability citations)
- Current 81.68% test coverage

**Enables:**
- Higher confidence in untested edge cases
- Better regression detection
- Improved test suite maintenance

---

## Notes

**Why 1 Day Per Test?**

Integration tests are complex and may uncover real issues:
- Investigation: 2 hours (understand why skipped)
- Fix: 4 hours (could be test logic or real bug)
- Validation: 2 hours (ensure determinism, no flakiness)

**If tests were simple, they wouldn't be skipped.**

**Expected Outcomes:**

- 50% chance: Test logic outdated, easy fix
- 30% chance: Real bug found, requires investigation
- 20% chance: Test too complex, needs simplification

**Honest Assessment:**

This is **technical debt cleanup**, not new feature work. Tests were skipped for a reason - likely complex edge cases or timing-sensitive behavior. Budget conservatively.

**Historical Context:**

Many tests were written in Oct-Nov 2025 during rapid feature development. Some edge cases weren't fully validated. Now that CRITICAL/HIGH issues are resolved, good time to revisit these tests and ensure coverage is complete.

---

**Status:** PROPOSED - Ready for execution when resources available
