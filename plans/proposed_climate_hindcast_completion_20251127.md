# Climate Hindcast Validation Completion Plan

**Date:** November 27, 2025
**Status:** PROPOSED
**Priority:** HIGH (Research Validation Infrastructure)
**Effort:** 6-8 hours
**Owner:** simulation-maintainer (Roy) + priya (validation)

---

## Problem Statement

**Gap Identified:** Research validation audit (Nov 27, 2025) identified climate hindcast implementation as high-priority (6-8 hours).

**Current Status:**
- ✅ Phase 1-11: COMPLETE (Data collection, initial validation, carbon cycle calibration)
- ✅ CRITICAL-1: environmentalHealth NaN crashes FIXED
- ✅ HIGH-2: Carbon cycle over-calibration FIXED (+12.1% → +0.77% error)
- ✅ Research data: 1990-2010 Keeling curve, HadCRUT5 temperature, GCP emissions
- ✅ Historical emissions mode: IMPLEMENTED (GCP forcing 1990-2010)
- ⚠️ **Validation incomplete:** Need comprehensive 1990-2020 validation run

**Why This Matters:**
- Hindcast validation is **gold standard** for model credibility
- Shows climate subsystem matches historical observations
- Enables forward projections with confidence
- Critical for research publication / external scrutiny

---

## Proposed Solution

### Phase 12: Comprehensive Historical Validation (2-3 hours)

**Objective:** Validate climate subsystem against 1990-2020 historical data (30 years)

**Validation Targets:**

| Metric | 1990 Baseline | 2000 Target | 2010 Target | 2020 Target | Threshold |
|--------|---------------|-------------|-------------|-------------|-----------|
| CO2 (ppm) | 354.19 | 369.71 | 389.90 | 414.24 | ±5% |
| Temp (°C anomaly) | 0.45 | 0.63 | 0.98 | 1.27 | ±0.1°C |
| Population (B) | 5.32 | 6.14 | 6.96 | 7.79 | ±10% |

**Data Sources:**
- CO2: NOAA Mauna Loa Keeling curve (annual averages)
- Temperature: HadCRUT5.0.2.0 global mean anomaly (UKMO)
- Population: UN World Population Prospects 2024
- Emissions: Global Carbon Project 2024 dataset

**Tasks:**

1. **Extend Historical Emissions Data (0.5 hour)**
   - Add 2011-2020 GCP emissions to `HISTORICAL_EMISSIONS_GCP` table
   - Source: Global Carbon Project 2024
   - File: `src/simulation/resourceDepletion.ts`

2. **Run 30-Year Hindcast Simulation (0.5 hour)**
   - Initialize: 1990 state
   - Duration: 360 months (1990-2020)
   - Mode: `historicalEmissionsMode = true`
   - RNG seed: 42 (reproducibility)
   - Log: Save to `logs/climate_hindcast_1990_2020_validation_YYYYMMDD.log`

3. **Extract Validation Metrics (0.5 hour)**
   - Sample every 120 months (10-year intervals): 1990, 2000, 2010, 2020
   - Metrics: CO2, temperature anomaly, population
   - Compare to observed values
   - Calculate deviation %

4. **Analysis and Report (1-1.5 hours)**
   - Time series plots (simulated vs observed)
   - Deviation analysis by decade
   - Root cause investigation for any >5% deviations
   - Assessment: PASS/FAIL for each metric
   - Deliverable: `reviews/climate_hindcast_validation_1990_2020_COMPLETE_20251127.md`

**Expected Results:**
- CO2: Within ±5% all decades (based on Phase 11 success)
- Temperature: Within ±0.1°C (volcanic forcing now working)
- Population: Within ±10% (demographics calibrated Nov 24-25)

---

### Phase 13: Demographic Validation Deep Dive (1-2 hours)

**Objective:** Verify population growth matches UN historical data regionally

**Concern:** Nov 24 hindcast had +39% population overshoot initially. Nov 25 fixes improved but need verification.

**Tasks:**

1. **Regional Population Validation (0.5 hour)**
   - Extract 10-year population by region: 1990, 2000, 2010, 2020
   - Compare to UN DESA regional estimates
   - Calculate per-region deviation %
   - Identify any regions with >15% deviation

2. **Mortality Rate Audit (0.5 hour)**
   - Verify ERA_MORTALITY_MULTIPLIERS applied correctly
   - Check baseline death rates vs IHME GBD data
   - Confirm no phantom wars (ExogenousShockPhase bug fixed Nov 24)

3. **Birth Rate Validation (0.5 hour)**
   - Extract crude birth rate (CBR) by decade
   - Compare to UN demographic data
   - Verify regional scaling working correctly
   - Check fertility transition timing (1990: high, 2020: medium)

4. **Report and Fixes (0.5-1 hour)**
   - Document any remaining calibration gaps
   - If deviations >15%: identify root cause
   - Propose parameter adjustments if needed
   - Deliverable: Add section to Phase 12 report or separate file

**Success Criteria:**
- Global population: Within ±5% all decades
- Regional populations: Within ±15% all decades
- No unexplained mortality spikes
- Birth rates match UN demographic transition

---

### Phase 14: Volcanic Forcing Verification (1-2 hours)

**Objective:** Verify volcanic events correctly reproduce observed cooling

**Context:** VolcanicForcingPhase added Nov 27 (commit 0e1c65d36) but needs validation

**Key Events to Reproduce:**

| Event | Date | Peak AOD | Expected Cooling | Duration |
|-------|------|----------|------------------|----------|
| Mount Pinatubo | Jun 1991 | ~0.15 | -0.3°C to -0.5°C | 18-24 months |
| Nevado del Ruiz | Nov 1985 | ~0.001 | Minimal (<0.01°C) | Not in 1990-2020 window |

**Tasks:**

1. **Pinatubo Cooling Verification (0.5 hour)**
   - Extract temperature time series: Jun 1991 - Dec 1993 (30 months)
   - Calculate cooling peak (1992 expected)
   - Compare to HadCRUT5 observed cooling (~0.4°C)
   - Verify exponential decay (τ≈18 months)

2. **AOD Physics Check (0.5 hour)**
   - Verify AOD initialization (0.15 for Pinatubo)
   - Check radiative forcing calculation (-25 W/m² per unit AOD)
   - Confirm decay formula: `AOD(t) = AOD_peak * exp(-t/τ)`
   - Validate τ=18 months decay constant

3. **Integration with Climate Model (0.5 hour)**
   - Verify VolcanicForcingPhase runs at order 16.5 (before ClimateSystemPhase)
   - Check volcanic forcing propagates to temperature calculation
   - Confirm no double-counting (volcanic + baseline forcing)

4. **Report (0.5 hour)**
   - Document Pinatubo cooling reproduction
   - Compare simulated vs observed cooling curves
   - Assess physics accuracy
   - Deliverable: Add section to Phase 12 report

**Success Criteria:**
- Pinatubo cooling: -0.3°C to -0.5°C peak (1992)
- Decay timescale: ~18 months to baseline
- Temperature returns to trend by 1994

---

### Phase 15: Forward Projection Validation (1-2 hours)

**Objective:** Test forward projections (2020-2050) for plausibility

**Why This Matters:** Once hindcast validates (1990-2020), forward projections become credible. Need to ensure no discontinuities at 2020 transition.

**Tasks:**

1. **Transition Smoothness Check (0.5 hour)**
   - Run simulation: 1990-2050 (720 months)
   - Plot CO2, temperature, population across full timeline
   - Check for discontinuities at 2020 (historicalEmissionsMode → endogenous)
   - Verify smooth transition from GCP data to economic model

2. **Scenario Validation (0.5 hour)**
   - Run 3 scenarios: status-quo, aggressive-mitigation, collapse
   - Start from 2020 validated state
   - Check 2030/2040/2050 outcomes for plausibility
   - Compare to IPCC SSP scenarios (sanity check)

3. **Uncertainty Quantification (0.5 hour)**
   - Monte Carlo N=10 for 2020-2050 projection
   - Measure coefficient of variation (CV) for key metrics
   - Verify determinism (CV < 0.01% for same seed)
   - Check outcome distribution spread

4. **Report (0.5 hour)**
   - Document transition behavior
   - Assess scenario plausibility
   - Compare to IPCC SSP pathways
   - Deliverable: Add section to Phase 12 report or separate file

**Success Criteria:**
- No discontinuities at 2020 transition
- 2050 projections within IPCC SSP range
- Determinism maintained (CV < 0.01%)

---

## Success Criteria

**Validation Completion:**
- ✅ 30-year hindcast (1990-2020): All metrics within thresholds
- ✅ Regional demographics: Deviations <15%
- ✅ Volcanic forcing: Pinatubo cooling reproduced
- ✅ Forward projection: Smooth transition, plausible outcomes

**Research Quality:**
- Climate subsystem: Grade A (empirically validated)
- Documentation: Comprehensive validation report
- Reproducibility: All scripts/logs archived

**Deliverables:**
- `reviews/climate_hindcast_validation_1990_2020_COMPLETE_20251127.md` (comprehensive report)
- `logs/climate_hindcast_1990_2020_validation_YYYYMMDD.log` (full simulation log)
- Updated `research/` files with 2020 extension data
- Wiki documentation update (validation status)

---

## Dependencies

**Required:**
- ✅ Historical emissions data (1990-2020): PARTIAL (1990-2010 exists, need 2011-2020)
- ✅ Validation targets: COMPLETE (Keeling curve, HadCRUT5, UN population)
- ✅ VolcanicForcingPhase: IMPLEMENTED (Nov 27)
- ✅ environmentalHealth NaN fix: RESOLVED (Nov 27)

**Blockers:** None (all prerequisites resolved)

---

## Risk Assessment

**Medium Risk:**
- Population validation may reveal additional calibration gaps (Nov 24-25 fixes need verification)
- Volcanic forcing is new (Nov 27) - integration issues possible
- 2020 transition discontinuities could appear

**Mitigation:**
- Phase 13 specifically targets demographic validation
- Phase 14 specifically validates volcanic physics
- Phase 15 checks transition smoothness

**Low Risk:**
- CO2 validation (Phase 11 showed +0.77% error - excellent)
- Temperature validation (volcanic forcing added, should improve)

---

## Timeline

**Total Effort:** 6-8 hours

- Phase 12: Comprehensive validation (2-3 hours)
- Phase 13: Demographics deep dive (1-2 hours)
- Phase 14: Volcanic forcing verification (1-2 hours)
- Phase 15: Forward projection validation (1-2 hours)

**Can be executed sequentially** over 1-2 work sessions.

**Checkpoints:**
- After Phase 12: Assess if Phase 13-15 needed based on results
- If validation fails: Pause, investigate root cause, fix, re-run
- If validation passes: Document success, update wiki

---

## Next Steps

**To Execute This Plan:**

1. **Assign to simulation-maintainer (Roy):**
   - Execute Phase 12 (comprehensive validation)
   - Execute Phase 13 (demographics) if deviations found
   - Execute Phase 14 (volcanic forcing verification)
   - Execute Phase 15 (forward projection)

2. **Validation by Priya:**
   - Review validation methodology
   - Verify statistical analysis
   - Confirm thresholds met
   - Sign off on completion

3. **Documentation:**
   - Comprehensive validation report
   - Wiki update (validation status)
   - Research grade update (B+ → A)

**Priority:** HIGH - Research validation infrastructure, enables forward projection credibility

---

## Related Work

**Builds On:**
- ✅ Phase 1-11: COMPLETE (data, initial validation, carbon calibration)
- ✅ CRITICAL-1: environmentalHealth NaN fix (Nov 27)
- ✅ HIGH-2: Carbon cycle over-calibration fix (Nov 27)
- ✅ H-7: VolcanicForcingPhase implementation (Nov 27)

**Enables:**
- Forward projection credibility (2020-2050)
- Research publication / external review
- Climate subsystem Grade A certification

**Complements:**
- Technology adoption validation plan (parallel high-priority work)

---

## Notes

**Why 6-8 Hours vs 2-3 Days?**

Original estimate was overly conservative. With CRITICAL-1, HIGH-2, H-7 all resolved:
- Data collection: ✅ DONE
- Initial validation: ✅ DONE (Phase 4-11)
- Carbon cycle: ✅ CALIBRATED (+0.77% error)
- Volcanic forcing: ✅ IMPLEMENTED

**Remaining work is primarily:**
- Extending 1990-2010 validation to 1990-2020 (add decade)
- Verifying demographic fixes (Nov 24-25 work)
- Testing volcanic forcing integration (Nov 27 addition)
- Forward projection plausibility check

**Not starting from scratch** - building on 11 completed phases.

**Historical Context:**

Nov 24-26 hindcast work resolved major blockers:
- Phase 1-2: Historical data + initialization (DONE)
- Phase 3-4: Temperature + mortality fixes (DONE)
- Phase 5: Population growth calibration (DONE)
- Phase 6-7: Food security + validation (DONE)
- Phase 8-9: Carbon sink temporal evolution (DONE)
- Phase 10: NaN crash investigation (found CRITICAL-1)
- Phase 11: Carbon cycle recalibration (HIGH-2 fix)

**Phase 12-15 are refinement and completion**, not foundational work.

---

**Status:** PROPOSED - Ready for execution when Roy + Priya available
