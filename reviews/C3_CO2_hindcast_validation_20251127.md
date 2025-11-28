# C-3 CO2 Hindcast Validation Report

**Validation Date:** 2025-11-27
**Validator:** Priya (Quantitative Validator - priya-quant-001)
**Simulation:** Monte Carlo N=10, hindcast 1990-2010 (240 months)
**Target:** CO2 = 390 ppm at 2010 (Keeling Curve baseline)
**Threshold:** < 5% deviation

---

## Executive Summary

**VERDICT: ❌ C-3 VALIDATION FAILED**

Phase 10 carbon sink strengthening (+15% ocean/land absorption) **did NOT improve** hindcast accuracy. CO2 error remains at **14.8%**, exceeding the 5% threshold by a factor of 3×.

**Critical Findings:**
1. **CO2 Accuracy:** 14.8% error (should be < 5%) - **CRITICAL FAILURE**
2. **Determinism:** CV = 0.146% (should be < 0.01%) - **MARGINAL FAILURE**
3. **Phase 10 Effectiveness:** -2.6% (made problem WORSE, not better)
4. **Population Bug:** Display shows 0.00B but logs confirm 6.4B final (extraction bug, not simulation bug)

---

## Statistical Summary

### CO2 at Year 2010 (Month 240)

| Metric | Value | Status |
|--------|-------|--------|
| **Target** | 390.0 ppm | (Keeling Curve 2010) |
| **Mean** | 447.6 ppm | ❌ +57.6 ppm over |
| **Std Dev** | 0.65 ppm | (tight distribution) |
| **Range** | 446.2 - 448.3 ppm | (2.1 ppm spread) |
| **Error** | +57.6 ppm (+14.8%) | ❌ **3× over threshold** |

**Interpretation:** Simulation systematically overestimates CO2 by ~58 ppm. Error is **consistent** across all runs (tight distribution), indicating a **systematic bias** rather than stochastic noise.

### Determinism Analysis

| Metric | Value | Status |
|--------|-------|--------|
| **Coefficient of Variation** | 0.1455% | ❌ Exceeds 0.1% threshold |
| **Expected** | < 0.01% | (for deterministic simulation) |
| **Actual Spread** | 0.65 ppm std | (acceptable for research) |

**Interpretation:** CV = 0.146% is **14× higher** than strict determinism threshold (0.01%), but **acceptable for Monte Carlo research** given absolute spread is only 0.65 ppm (0.15% of mean). The slight non-determinism may come from:
- Floating-point accumulation errors over 240 months
- Object.entries() iteration order in weighted selection
- Date/time-based pseudo-randomness leaking in

**Recommendation:** Non-determinism is minor compared to the 14.8% CO2 error. Fix CO2 bias first, then address determinism.

---

## Effectiveness Analysis: Phase 10 Failed

### Before vs. After

| Phase | CO2 Error | Effectiveness |
|-------|-----------|---------------|
| **Phase 9 Baseline** | 14.4% (446 ppm) | - |
| **Phase 10 (+15% sinks)** | 14.8% (447.6 ppm) | **-2.6%** ❌ |

**Change:** -0.4 percentage points (ERROR INCREASED)

### What Went Wrong?

Phase 10 strengthened carbon sinks by +15% (ocean uptake, land absorption), but CO2 error **increased** from 14.4% to 14.8%. This indicates:

1. **Wrong mechanism targeted:** Sink strength may not be the limiting factor
2. **Emissions too high:** If emissions overwhelm sinks, strengthening sinks won't help
3. **Calibration error:** The 15% adjustment may have interacted negatively with other parameters
4. **Initialization bug:** 1990 starting CO2 or emissions trajectory may be wrong

**Quantitative Gap:** To reach 390 ppm from 447.6 ppm requires **-12.9% reduction**, not the +15% sink increase attempted.

---

## Detailed Run Breakdown

| Seed | CO2 (ppm) | Error (ppm) | Error (%) | Population* |
|------|-----------|-------------|-----------|-------------|
| 42100 | 447.3 | +57.3 | 14.7% | 6.4B |
| 42101 | 448.2 | +58.2 | 14.9% | 6.4B |
| 42102 | 448.1 | +58.1 | 14.9% | 6.4B |
| 42103 | 446.9 | +56.9 | 14.6% | 6.4B |
| 42104 | 448.2 | +58.2 | 14.9% | 6.4B |
| 42105 | 447.1 | +57.1 | 14.6% | 6.4B |
| 42106 | 446.2 | +56.2 | 14.4% | 6.4B |
| 42107 | 447.8 | +57.8 | 14.8% | 6.4B |
| 42108 | 447.9 | +57.9 | 14.8% | 6.4B |
| 42109 | 448.3 | +58.3 | 14.9% | 6.4B |
| **Mean** | **447.6** | **+57.6** | **14.8%** | **6.4B** |
| **Std** | **0.65** | **0.65** | **0.15%** | - |

*Note: Population displayed as 0.00B in validation script output due to extraction bug, but simulation logs confirm final population ~6.4B (correct). Population dynamics are working; display formatting is broken.*

---

## Root Cause Analysis

### Hypothesis 1: Emissions Trajectory Too High (MOST LIKELY)

**Evidence:**
- 1990-2010 historical emissions: 22.7 → 33.5 GtCO2/yr (+47.6% growth)
- Simulation may be using wrong emissions profile or economic model is too carbon-intensive

**Test:** Compare simulated emissions trajectory to Global Carbon Project data
**Next Step:** Log monthly emissions and compare to GCP baseline

### Hypothesis 2: Carbon Cycle Airborne Fraction Too High

**Evidence:**
- Keeling Curve shows 36.03 ppm increase (1990-2010) = ~280 GtCO2 atmospheric accumulation
- If emissions totaled ~558 GtCO2 over period, airborne fraction = 50%
- Literature: airborne fraction typically 44% (ocean + land sinks absorb 56%)

**Test:** Calculate simulated airborne fraction
**Next Step:** Reduce ocean/land sink removal rate if > 44%

### Hypothesis 3: 1990 Initialization CO2 Wrong

**Evidence:**
- Target: 354.19 ppm (NOAA Keeling Curve 1990 annual mean)
- Need to verify simulation actually starts at this value

**Test:** Log month 0 CO2 from hindcast runs
**Next Step:** Audit historicalInitialization.ts for 1990 CO2 setting

### Hypothesis 4: Phase 10 Introduced Regression

**Evidence:**
- Phase 9: 14.4% error (446 ppm)
- Phase 10: 14.8% error (447.6 ppm)
- Error **increased** after "fix"

**Test:** Revert Phase 10 changes and re-run validation
**Next Step:** Git diff de04ce78d to identify what changed

---

## Distribution Validation

### Expected: Linear CO2 Growth (1990-2010)

Historical CO2 growth 1990-2010:
- Average: +1.8 ppm/year
- Accelerating: 1990s = +1.5 ppm/yr, 2000s = +2.0 ppm/yr
- Pattern: Roughly linear with slight acceleration (China industrialization)

**Simulation should show:**
- S-curve NOT appropriate (long timescale feedback)
- Linear accumulation from fossil emissions
- Slight acceleration mid-2000s

**Next Step:** Plot monthly CO2 trajectory from simulation logs, compare to Keeling Curve monthly data

---

## Recommended Next Steps (Priority Order)

### CRITICAL Priority

1. **Audit Emissions Trajectory**
   - Log monthly fossil emissions from hindcast
   - Compare to Global Carbon Project 1990-2010 data
   - **Hypothesis:** Emissions 10-15% too high

2. **Audit 1990 Initialization**
   - Verify initial CO2 = 354.19 ppm (not 354.2 or 355)
   - Check if any phases modify CO2 before simulation starts
   - **Hypothesis:** Starting point may be offset

3. **Calculate Airborne Fraction**
   - Total emissions 1990-2010: Should be ~558 GtCO2
   - Atmospheric accumulation: Should be ~280 GtCO2 (50%)
   - Ocean/land uptake: Should be ~278 GtCO2 (50%)
   - **Hypothesis:** Sinks absorbing < 44% (literature baseline)

### HIGH Priority

4. **Revert Phase 10, Re-validate**
   - Git revert de04ce78d (Phase 10 commit)
   - Re-run monteCarloC3Validation.ts
   - Confirm if Phase 10 made problem worse or inherited it
   - **Hypothesis:** Phase 10 introduced subtle bug

5. **Plot CO2 Trajectory**
   - Extract monthly CO2 values from logs
   - Compare to NOAA Keeling Curve monthly 1990-2010
   - Identify when divergence occurs (early vs late)
   - **Hypothesis:** Divergence accelerates in 2000s

6. **Fix Determinism (CV = 0.146%)**
   - Audit Object.entries() usage (iteration order)
   - Check for any Date.now() or Math.random() leaks
   - Add RNG call logging to trace non-determinism source
   - **Target:** CV < 0.01%

### MEDIUM Priority

7. **Fix Population Display Bug**
   - Update monteCarloC3Validation.ts line 62
   - Confirm population extraction logic
   - Minor issue (simulation works, display broken)

8. **Extend Validation Period**
   - Once 1990-2010 passes, extend to 1990-2024
   - More recent data = stricter test
   - Validate against COVID shock (2020)

---

## Quantitative Gap Summary

| Metric | Current | Target | Gap | Severity |
|--------|---------|--------|-----|----------|
| **CO2 Error** | 14.8% | < 5% | **+9.8%** | **CRITICAL** |
| **Determinism CV** | 0.146% | < 0.01% | +0.136% | MEDIUM |
| **Phase 10 Effectiveness** | -2.6% | > 50% | **-52.6%** | **CRITICAL** |

**Priority Ranking by Impact:**
1. **CRITICAL:** CO2 systematic bias (+57.6 ppm) - blocks all hindcast validation
2. **CRITICAL:** Phase 10 negative effectiveness - wasted development effort
3. **MEDIUM:** Determinism CV 14× over threshold - acceptable for research, but should fix

---

## Statistical Fingerprint

### What This Distribution Tells Us

**Tight distribution (σ = 0.65 ppm) with systematic bias (+57.6 ppm):**
- ✅ **Good news:** Simulation is consistent (reproducible)
- ❌ **Bad news:** Consistently wrong (systematic error, not noise)

**This pattern indicates:**
- NOT a stochastic bug (random fluctuations)
- NOT a parameter tuning issue (distribution would be wider)
- **LIKELY:** Structural error in carbon cycle equations or emissions input

**Analogy:** Like a thermometer that always reads 10°F too high. Precision is good (±0.65°F), but accuracy is broken (systematic +10°F bias).

---

## Validation Files

| File | Path |
|------|------|
| **Monte Carlo Script** | `/scripts/monteCarloC3Validation.ts` |
| **Validation Log** | `/logs/c3_validation_20251127_014635.log` |
| **Historical Data** | `/research/climate_hindcast_data_20251126.md` |
| **Phase 10 Commit** | `de04ce78d` |
| **This Report** | `/reviews/C3_CO2_hindcast_validation_20251127.md` |

---

## Conclusion

Phase 10 **failed to fix** the CO2 hindcast validation. Error remains at 14.8%, **3× over threshold**. The problem is **systematic** (tight distribution, consistent bias), not stochastic.

**Most likely cause:** Emissions trajectory or carbon cycle airborne fraction is miscalibrated. Strengthening sinks (+15%) doesn't help if emissions are already too high or sinks are already saturated.

**Next step:** Audit emissions trajectory first (CRITICAL-1), then airborne fraction (CRITICAL-2), then consider reverting Phase 10 (CRITICAL-3).

**Timeline estimate:** If emissions trajectory is wrong, fix = 2-4 hours. If carbon cycle equations are wrong, fix = 1-2 days. If Phase 10 introduced subtle bug, fix = 4-8 hours.

**Recommendation:** Do NOT proceed to Phase 11 until root cause identified. Building on a broken foundation will compound errors.

---

**Validator:** Priya (priya-quant-001)
**Motto:** "In God we trust. All others must bring data."
**Report Status:** ✅ Complete - awaiting Roy (simulation-maintainer) for root cause debugging
