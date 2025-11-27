# HANDOFF: Roy (simulation-maintainer) - Phase 10 Hindcast Calibration

**Date:** Nov 27, 2025
**From:** Orchestrator
**To:** Roy (simulation-maintainer)
**Priority:** HIGH (4 items: HIGH-6, HIGH-7, HIGH-8, HIGH-9)

## Context

Phase 10 hindcast validation (1990-2024) revealed simulation is **STABLE but INACCURATE**:
- ✅ 0% crash rate (CRITICAL-1 fix successful)
- ❌ 56.9% overall deviation from historical data
- ❌ CV = 6.7% (67x determinism target)

## Assignment

Fix 4 HIGH-priority calibration issues. **HIGH-9 FIRST** (non-determinism is foundational for research simulation).

### HIGH-9: Non-Determinism Investigation (CV=6.7%) 🔴 PRIORITY 1

**Problem:** Identical seeds produce different results (population varies 3x: 1.22B to 3.44B)

**Target:** CV < 0.1% (research simulation must be reproducible)

**Key Finding:** Temperature is perfectly deterministic (2.10°C all runs) - proves RNG infrastructure works. Only population varies → issue is in demographic/mortality calculations.

**Investigation completed:**
- ✅ No `Math.random()` calls in simulation code (only in comments)
- ✅ No optional RNG parameters with fallbacks found
- ✅ Temperature deterministic (RNG infrastructure correct)
- ❌ Population non-deterministic (mortality/birth rate issue)

**Diagnosis required:**
1. Audit demographic phases for non-deterministic operations:
   - `src/simulation/phases/population/`
   - `src/simulation/phases/mortality/`
   - `src/simulation/phases/health/`
2. Look for:
   - `Object.entries()` iteration (order not guaranteed)
   - Array operations without stable sorting
   - Date/timestamp dependencies
   - Floating point precision issues
3. Run determinism stress test: `scripts/determinismStressTest.ts` (N=100, same seed)

**Validation:** CV must be < 0.01% after fix (stricter than 0.1% for stress test)

**Report location:** `reviews/climate_hindcast_validation_phase10_20251127.md` (lines 41-55, 123-143)

### HIGH-6: Temperature Overestimation (+64% Error) 🔴 PRIORITY 2

**Problem:** Climate system overestimates warming

**Data:**
- Actual 2024: 1.28°C above baseline (NASA GISS)
- Simulated 2024: 2.10°C (ALL 10 runs IDENTICAL - deterministic)
- Error: +0.82°C (+64.1%)

**Hypotheses:**
1. Climate sensitivity too high
2. Missing aerosol cooling offset
3. HIGH-2 carbon cycle fix may have overcorrected

**Investigation:**
1. Extract CO2 concentration from hindcast runs (validate HIGH-2 < 5% error)
2. Check climate sensitivity parameter (TCRE - Transient Climate Response to Emissions)
3. Verify aerosol forcing implementation
4. Compare emissions trajectory to historical data

**Target:** 1.28°C ± 0.064°C (5% tolerance) at 2024

**Report location:** `reviews/climate_hindcast_validation_phase10_20251127.md` (lines 59-186)

### HIGH-7: Population Mortality Calibration (-76% Error) 🔴 PRIORITY 3

**Problem:** Mortality system calibrated for CRISIS scenarios, not BASELINE historical

**Data:**
- Actual 2024: 8.12B (UN DESA)
- Simulated 2024: 1.22B to 3.44B (mean ~2.0B)
- Error: -6.1B (-76.2%)

**Analysis:** Population varies 3x across runs → stochastic mortality (related to HIGH-9)

**Investigation:**
1. Compare simulated mortality rate to historical baseline (0.7-0.9% per year)
2. Check birth rate against UN fertility data (TFR: 2.5 → 2.3)
3. Validate food security doesn't trigger famine cascades during 1990-2024
4. Bayesian mortality resolution may be too aggressive for historical period

**Target:** 8.12B ± 0.41B (5% tolerance) at 2024

**Report location:** `reviews/climate_hindcast_validation_phase10_20251127.md` (lines 70-97, 187-198)

### HIGH-8: Biodiversity Decline Rate Calibration (-95% Error) 🔴 PRIORITY 4

**Problem:** Biodiversity collapses to near-zero in ALL runs

**Data:**
- Actual 2024: 0.49 (WWF LPI - 51% of 1970 baseline)
- Simulated 2024: 0.004 to 0.065 (mean ~0.03)
- Error: -0.46 (-94.7%)

**Hypotheses:**
1. Decline rate tuned for worst-case scenarios (not historical baseline)
2. Land use pressure overestimated
3. Conservation efforts not modeled for 1990-2024

**Investigation:**
1. Compare decline rate to WWF Living Planet Index curve (1970-2024)
2. Check land use/agriculture pressure calibration
3. Validate extinction risk parameters not too aggressive

**Target:** 0.49 ± 0.025 (5% tolerance) at 2024

**Report location:** `reviews/climate_hindcast_validation_phase10_20251127.md` (lines 95-105, 199-212)

## Workflow

1. **HIGH-9 First:** Fix non-determinism in demographic calculations
   - After fix: Handoff to Priya for N=100 stress test validation (CV < 0.01%)
2. **HIGH-6/7/8:** Recalibrate for historical baseline (not crisis scenarios)
   - After fixes: Handoff to Priya for N=10 hindcast validation (accuracy within 5%)

## Success Criteria

- ✅ CV < 0.01% (determinism stress test with N=100)
- ✅ Temperature: 1.28°C ± 0.064°C at 2024
- ✅ Population: 8.12B ± 0.41B at 2024
- ✅ Biodiversity: 0.49 ± 0.025 at 2024

## Resources

**Validation scripts:**
- `scripts/determinismStressTest.ts` - N=100 same seed (HIGH-9)
- `scripts/hindcastingValidation.ts` - N=10 historical accuracy (HIGH-6/7/8)

**Key files:**
- `src/simulation/phases/population/` - Demographic calculations
- `src/simulation/phases/mortality/` - Mortality systems
- `src/simulation/phases/climate/` - Temperature/emissions
- `src/simulation/phases/ecology/` - Biodiversity

**Reports:**
- `reviews/climate_hindcast_validation_phase10_20251127.md` - Full analysis

## Communication

Post progress updates to:
- `coordination` channel (major milestones)
- `implementation` channel (detailed progress)

Use status tags: STARTED → IN-PROGRESS → BLOCKED → COMPLETED

## Notes

**Why HIGH-9 first:** Research simulations MUST be deterministic. Cannot validate accuracy (HIGH-6/7/8) if results vary randomly. Temperature proves RNG works - only demographics are broken.

**Crisis vs Baseline:** Many systems (mortality, biodiversity decline) appear tuned for crisis scenarios (nuclear war, collapse). Need separate calibration for "business as usual" historical period.

**Validation partner:** Priya will run quantitative validation after each fix to ensure statistical rigor.

---

**Next step:** Roy investigates HIGH-9 non-determinism in demographic calculations.
