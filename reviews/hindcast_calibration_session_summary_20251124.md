# Hindcast Model Calibration Session Summary

**Date:** November 24, 2025
**Orchestrator:** orchestrator-1
**Priority:** CRITICAL

## Work Completed

### Phase 1: Diagnostic (COMPLETE)

1. Created `/scripts/hindcastDiagnostic.ts` - Per-month mortality tracking tool
2. Ran diagnostic runs to identify root causes
3. Identified that climate mortality is 98% of all deaths

### Phase 2: Root Cause Fixes (PARTIAL)

#### Fix 1: CO2/Climate Initialization (COMPLETE)
- **File:** `/src/simulation/historicalInitialization.ts`
- **Problem:** CO2 defaulted to 420 ppm (2023) for all simulations
- **Fix:** Set CO2, temperature, and tipping points to historical values
- **Result:** CO2 now 354 ppm for 1990, temperature 0.85C

#### Fix 2: Wet Bulb Era Scaling (COMPLETE)
- **File:** `/src/simulation/wetBulbEvents.ts`
- **Problem:** Event frequency calibrated for 2025 conditions
- **Fix:** Added quadratic scaling `(year/2025)^2` for historical years
- **Result:** 1990 events now ~61% of 2025 frequency

#### Fix 3: Mortality Attribution (COMPLETE)
- **File:** `/scripts/hindcastDiagnostic.ts`
- **Problem:** Script read wrong field (`rootCause` vs `root`)
- **Fix:** Corrected to use `risk.root`
- **Result:** Now shows climate:98%, conflict:2%

### Unresolved Issue: Dual Death System

**Critical Finding:**
- Bayesian mortality risk at Month 3: 0.04% (expected deaths: ~2M)
- Actual deaths at Month 3: 53M (27x higher than expected)

**Hypothesis:**
Deaths come from multiple calculation paths:
1. Bayesian Mortality System (via `addMortalityRisk()`)
2. Baseline Death Rate System (via `adjustedDeathRate`)
3. Regional Population Updates (potential double-counting)

**Next Step:**
Add logging in `updateHumanPopulation()` at line ~1377 to trace:
- `previousPopulation`, `newPopulation`
- `monthlyGrowthRate`, `baselineDeaths`
- `pop.adjustedDeathRate`

## Commits

1. `fce42a2` - fix(hindcast): Initialize CO2 system to historical values
2. `a7cf513` - fix(hindcast): Add era scaling to wet bulb events
3. `d810566` - docs: Update hindcast diagnostic findings
4. `dc141a7` - fix(hindcast): Re-apply era scaling to wet bulb events

## Quality Gates

| Gate | Status | Notes |
|------|--------|-------|
| QG1: Research Validation | PASSED | Historical data sources documented |
| QG2: Architecture Review | PENDING | Awaiting fix completion |
| QG3: Monte Carlo Validation | BLOCKED | Hindcast still fails (pop ~10M vs target 8.12B) |

## Handoff to simulation-maintainer

**Task:** Investigate and fix the dual death system issue

**Key Files:**
- `/src/simulation/populationDynamics.ts` - Death rate calculations (lines 1260-1420)
- `/src/simulation/engine/phases/BayesianMortalityResolutionPhase.ts` - Bayesian system
- `/reviews/hindcast_diagnostic_findings_20251124.md` - Full analysis

**Investigation Points:**
1. Why do deaths (53M) exceed Bayesian risk calculation (2M)?
2. Is there double-counting between regional and global death paths?
3. Is `calculateExtinctionDeathRate()` triggering despite no active extinctions?
4. Are regional populations applying deaths independently of global calculation?

**Acceptance Criteria:**
- Hindcast reaches 2024 with population 6-10B (±20% of 8.12B)
- CO2 within 2-3 ppm of historical trajectory
- No mass extinction events in historical baseline
