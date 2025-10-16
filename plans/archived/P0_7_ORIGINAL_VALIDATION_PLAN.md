# P0.7 Original Plan: Validate Monte Carlo Variance

**Status:** SUPERSEDED by Scenario Parameter System (Oct 16, 2025)
**Original Timeline:** Oct 15-16, 2025
**Archived:** Oct 16, 2025

---

## Why This Was Superseded

This original P0.7 plan focused on validating that P0.6's stochasticity implementation successfully restored Monte Carlo variance. However, during the planning phase, a deeper issue was discovered: **research agents disagreed on parameter calibration**.

- **Historical calibration camp:** Needed empirically justified parameters for publication credibility
- **Tail-risk assessment camp:** Needed honest worst-case parameters for existential risk assessment
- **The conflict:** A single parameter set could not satisfy both requirements

**Resolution:** Instead of just validating variance, P0.7 evolved into the **Scenario Parameter System** - a two-mode approach that allows BOTH historical and unprecedented scenarios to run in parallel.

This archived document preserves the original validation plan for historical reference.

---

## Original P0.7 Plan (Oct 15, 2025)

### Objective

Verify that P0.6's research-backed stochasticity successfully restored variance in Monte Carlo runs, eliminating the deterministic convergence problem that plagued P0.3.

### Background

After implementing stochastic cascade triggers (P0.3), all 10 Monte Carlo runs STILL converged to identical outcomes (0.34B population, 95.7% decline). P0.4-P0.6 addressed this by:

- **P0.4:** Added diagnostic logging to identify determinism sources
- **P0.5:** Added ±10-30% monthly variation (scored 3/10 in research validation)
- **P0.6:** Replaced with research-backed patterns:
  - Seasonal demographic cycles (8-12% amplitude)
  - Episodic environmental shocks (2-15% probability, 150-300% spikes)
  - AR1 temporal autocorrelation (shocks persist 3-12 months)

### Tasks (Original Plan)

1. **Run 10-iteration Monte Carlo analysis** with P0.6 stochasticity enabled
2. **Measure population endpoint variance** across runs
3. **Check for outcome diversity** - not all identical outcomes
4. **Document variance metrics** and compare to pre-P0.6 baseline
5. **Inspect time series** for seasonal patterns and episodic shocks

### Success Criteria (Original Plan)

- [ ] 10-run Monte Carlo shows population variance >20% (P0.6 target)
- [ ] Population endpoints range: 0.3B to 5B (not all identical)
- [ ] Some runs avoid cascade entirely (10-30% expected)
- [ ] Seasonal patterns visible in birth/death time series
- [ ] Environmental shock events occur episodically (not every month)

### If Success → If Failure

- **If Success:** Move to P1 - Achieve Research-Grade Realism
- **If Failure:** Diagnose why P0.6 stochasticity insufficient, consider P0.8 for additional variance sources

---

## What Actually Happened (Oct 16, 2025)

Instead of just running validation, the P0.7 scope expanded to address the fundamental research disagreement:

### Actual P0.7 Implementation: Scenario Parameter System

1. **Type definitions added to game.ts:**
   - `ScenarioMode` enum: "historical" | "unprecedented"
   - `ScenarioParameters` interface with mode-specific settings

2. **Utility module created (scenarioParameters.ts):**
   - Functions to retrieve scenario-specific parameters
   - Mode-specific cascade mortality rates
   - Mode-specific environmental shock parameters

3. **System integrations:**
   - `planetaryBoundaries.ts` uses scenario-specific cascade mortality rates
   - `qualityOfLife.ts` uses scenario-specific environmental shock parameters
   - `initialization.ts` accepts and initializes scenario parameters

4. **Research resolution:**
   - Historical mode: Publication-ready parameters (Black Death, heatwaves, famines)
   - Unprecedented mode: Honest tail-risk parameters for worst-case assessment
   - Parallel analysis: Monte Carlo runs 50/50 split between both modes

### Impact

- **Original P0.7 goal (variance validation):** Still needs to be done, but now for BOTH scenario modes
- **New capability:** Can satisfy both research camps simultaneously
- **New priority:** Monte Carlo scripts need modification to run dual-scenario analysis

---

## Lessons Learned

1. **Validation revealed deeper issues:** Sometimes "testing" reveals that the system needs architectural enhancement, not just verification
2. **Research disagreements are real:** Different research goals require different parameters - trying to satisfy both with one set creates compromises
3. **Architectural flexibility wins:** Adding the scenario system now enables future expansion (e.g., optimistic scenarios, worst-worst-case scenarios)
4. **Preserve history:** This document ensures the original P0.7 intent is not lost, even though it evolved into something more sophisticated

---

## Next Steps (as of Oct 16, 2025)

The original P0.7 validation tasks are now part of the **Monte Carlo Script Modifications** priority:

1. Modify Monte Carlo scripts to run 50% historical, 50% unprecedented
2. Run validation for BOTH scenario modes (verify variance in each)
3. Compare outputs to confirm meaningful differences between modes
4. Document parameter values used in each scenario mode

Then proceed to P1 - Achieve Research-Grade Realism (likely with scenario-specific calibration).

---

**Archive Note:** This plan was not "failed" or "abandoned" - it was **evolved and enhanced** into a more sophisticated solution that addressed the underlying research disagreement while still maintaining the original goal of Monte Carlo variance validation.
