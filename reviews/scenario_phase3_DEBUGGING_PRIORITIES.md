# Scenario Phase 3: Debugging Priorities

**Author:** Priya (Quantitative Validator)
**Date:** 2025-11-12
**Context:** Phase 4 comparative analysis BLOCKED due to Phase 3 data quality issues

---

## Summary of Issues

**Phase 3 Monte Carlo (N=10, 13 scenarios) produced invalid data:**
- 100% early termination at ~month 49 (target: 360 months)
- 69% scenarios produce byte-identical results (9/13 scenarios)
- 0% Utopia outcomes (cannot perform comparative analysis)
- Missing governance metrics in output (Gini, Trust, Democracy)
- ai-alignment-first scenario has ZERO runs

---

## CRITICAL Issue #1: Early Termination at Month 49

**Evidence:**
- All 120 runs show `monthsSimulated: 49` in results
- All 120 runs show `outcome: "UNKNOWN"` (outcome evaluator never ran)
- Logs show month 48 as last logged month
- Target was 360 months (30 years)
- Only 13.6% of simulation completed

**Hypothesis:**
- Assertion failure in month 49 processing
- Unhandled state causing crash
- MAX_MONTHS misconfigured in scenario runner
- Resource exhaustion (unlikely - happens consistently at month 49)

**Debug Steps:**
1. Run single scenario (climate-first) with verbose logging
2. Add try-catch around month loop to capture exact failure point
3. Check assertion logs for month 49 failures
4. Verify MAX_MONTHS configuration in `scripts/scenarioPhase3Complete.ts`
5. Test with reduced MAX_MONTHS (e.g., 60) to see if crash moves

**Expected Fix:**
- Identify assertion or error causing early exit
- Either fix root cause OR disable problematic assertion if false positive
- Verify simulation can complete 360 months

---

## CRITICAL Issue #2: 9 Scenarios Produce Identical Results

**Evidence:**
- These scenarios produce byte-identical outcomes:
  - adaptive-deployment
  - carbon-removal-first
  - climate-first
  - equality-first
  - foundations-first
  - renewable-first
  - scientific-acceleration
  - strong-institutions-start
  - (9/13 scenarios = 69%)

- Identical metrics (to 2 decimal places):
  - Temperature: 1.64°C
  - QoL: 0.621
  - CV: 6.0%
  - Population: 5.590±0.259B

**Hypothesis:**
- Scenario parameters (governmentPriorities, technologyDeployment) NOT being applied
- Scenarios use default state, ignoring configuration
- Parameter override logic broken
- Timing issue (parameters applied too late, after month 49 crash)

**Debug Steps:**
1. Add logging to scenario configuration application
2. Verify `governmentPriorities` are set correctly in state
3. Check if technology deployment timing differs between scenarios
4. Compare state snapshots at month 10 for climate-first vs equality-first
5. Audit scenario definition files for correct parameter specification

**Expected Fix:**
- Identify where scenario parameters should be applied
- Verify they're being set in initial state
- Add assertions to fail if scenario params not applied
- Test that climate-first produces different outcomes than equality-first

---

## HIGH Priority Issue #3: Missing Governance Metrics

**Evidence:**
- Results JSON does NOT contain `finalGovernance` field
- Expected fields missing:
  - `giniCoefficient`
  - `globalTrust`
  - `democracyIndex`
- Cannot validate god mode thresholds (Gini <0.30, Trust >0.70)

**Hypothesis:**
- Scenario results collection missing governance data
- Fields exist in state but not serialized to results
- God mode includes these, but scenario runner doesn't

**Debug Steps:**
1. Compare results collection in god mode vs scenario runner
2. Check `scenarioPhase3Complete.ts` results serialization
3. Add governance metrics to results output
4. Verify fields exist in final state before serialization

**Expected Fix:**
- Add `finalGovernance` section to results JSON
- Include Gini, Trust, Democracy, and other governance metrics
- Match god mode output format for consistency

---

## MEDIUM Priority Issue #4: ai-alignment-first Has Zero Runs

**Evidence:**
- Metadata lists 13 scenarios including `ai-alignment-first`
- Results object has `ai-alignment-first` key with empty array `[]`
- 0 runs executed for this scenario

**Hypothesis:**
- Scenario definition file missing or malformed
- Scenario excluded from execution loop
- Crash during scenario initialization (before first run)

**Debug Steps:**
1. Check if `ai-alignment-first` scenario definition exists
2. Verify scenario is included in execution loop
3. Test running ai-alignment-first scenario in isolation
4. Check logs for errors during scenario initialization

**Expected Fix:**
- Add missing scenario definition OR
- Remove from metadata if intentionally excluded OR
- Fix initialization error preventing execution

---

## LOW Priority Issue #5: High Coefficient of Variation

**Evidence:**
- CV ranges from 3.8% to 15.8% across scenarios
- Expected CV <0.01% for deterministic simulation with identical seeds
- Democratic-participation: 15.8% CV (highest)

**Hypothesis:**
- Non-deterministic behavior (Object.entries() iteration order?)
- High sensitivity to initial conditions (acceptable)
- RNG seed not being applied correctly

**Note:** LOW priority because:
- Phase 3 data already invalid due to early termination
- CV analysis only meaningful for complete runs
- Should re-assess after fixing termination bug

**Debug Steps (after P1-P4 fixed):**
1. Run 10 iterations of single scenario with SAME seed
2. Compare outputs - should be byte-identical
3. If not, audit RNG usage and Object.entries() patterns
4. Apply determinism fixes from previous god mode work

---

## Debugging Workflow (Recommended Order)

**Step 1: Fix Early Termination (CRITICAL-1)**
- Run single scenario with verbose logging
- Identify month 49 crash cause
- Fix root issue
- Verify simulation completes 360 months

**Step 2: Fix Scenario Parameter Application (CRITICAL-2)**
- Add logging for scenario configuration
- Verify parameters are applied
- Test that different scenarios produce different outcomes
- Compare climate-first vs equality-first at month 100

**Step 3: Add Governance Metrics (HIGH-3)**
- Add finalGovernance to results serialization
- Include Gini, Trust, Democracy
- Verify against god mode output format

**Step 4: Fix ai-alignment-first (MEDIUM-4)**
- Test scenario in isolation
- Add to execution or remove from metadata

**Step 5: Re-run Phase 3 Monte Carlo**
- Execute all scenarios with N=10
- Verify 360-month completion
- Verify outcome classification
- Verify governance metrics present

**Step 6: THEN Perform Phase 4 Comparative Analysis**
- Only after data quality validated
- Use Priya's analysis script on clean data
- Generate comparative analysis report

---

## Success Criteria (Before Phase 4 Analysis)

**Must achieve ALL of these:**
- ✅ All scenarios complete 360 months (not 49)
- ✅ Outcome classification performed (not 100% UNKNOWN)
- ✅ Scenarios produce different results (not 69% identical)
- ✅ Governance metrics included in output
- ✅ ai-alignment-first executes successfully
- ✅ At least some Utopia outcomes achieved (if scenarios work)

**If achieved, THEN:**
- Phase 4 comparative analysis can proceed
- Effectiveness metrics meaningful
- Trade-off analysis valid
- Critical path determination possible

---

## Contact

**Questions on statistical methodology:** Priya (quantitative validator)
**Implementation fixes:** Roy (simulation maintainer)
**Scenario design validation:** Cynthia (researcher) + Sylvia (skeptic)

---

**Status:** Debugging blocked until Phase 3 re-run scheduled.
**Next:** Assign CRITICAL-1 (early termination) to Roy for investigation.
