# Climate Validation Next Steps (Post Mini-Hindcast)

**Based On:** Mini-Hindcast Validation Report (2025-11-27)
**Status:** CONDITIONAL PASS (1/3 metrics passed)
**Priority:** Stack item #6 complete, blocked items now unblocked

---

## Validation Results Summary

| Metric | Result | Next Action |
|--------|--------|-------------|
| CO2 | ✅ PASS (100% within ±5%, RMSE 10.8 ppm) | MEDIUM: Tune airborne fraction |
| Temperature | ❌ FAIL (50% pass rate, RMSE 0.108°C) | HIGH: Add volcanic forcing |
| Emissions | ❌ FAIL (NaN - field missing) | CRITICAL: Fix state tracking |

**Overall:** Climate subsystem adequate for research, not publication-grade.

---

## CRITICAL Priority (Must Fix Before Further Work)

### 1. Fix Emissions NaN Bug
**Issue:** `state.resourceEconomy.co2.annualEmissionsGtCO2` is undefined/NaN
**Impact:** Cannot validate carbon cycle closure
**Effort:** 1-2 hours
**Steps:**
1. Trace field in `src/types/game.ts` (does it exist?)
2. Check `createHistoricalInitialState()` initialization
3. Check climate phases - which one writes emissions?
4. Add assertion: `assertFinite(state.resourceEconomy.co2.annualEmissionsGtCO2, {...})`
5. Re-run validation script

**Success Metric:** Emissions data populated, cumulative error within ±10%

---

## HIGH Priority (Improves Temperature Validation)

### 2. Add Volcanic Forcing (Pinatubo 1991)
**Issue:** Temperature validation fails 1991-1993 (missing -0.3°C cooling)
**Impact:** 50% → 70% pass rate (expected)
**Effort:** 4-6 hours
**Steps:**
1. Research: Pinatubo stratospheric aerosol optical depth (AOD) time series
2. Implement: `volcanicForcingWattsPerM2 = -25 * AOD` (IPCC AR6 formula)
3. Add decay: `AOD(t) = AOD_peak * exp(-t / τ)` where τ = 1.5 years
4. Inject into `radiativeForcingWattsPerM2` calculation
5. Validate: 1991-1993 temperature should drop 0.2-0.3°C

**Success Metric:** 1991-1993 temperature within ±0.10°C of observations

### 3. Tune Climate Sensitivity (+15%)
**Issue:** Transient climate response (TCR) ~1.2°C, should be ~1.4°C
**Impact:** Reduces warm bias from +0.053°C to ~+0.01°C
**Effort:** 2-3 hours
**Steps:**
1. Locate TCR parameter (likely in `ClimateSystemPhase` or CO2 config)
2. Increase by factor 1.17× (1.2 → 1.4°C)
3. Re-run hindcast validation
4. Check if RMSE improves from 0.108°C to <0.10°C

**Success Metric:** Temperature RMSE < 0.10°C, pass rate > 80%

---

## MEDIUM Priority (Improves CO2 Validation)

### 4. Reduce Airborne Fraction (19% → 14%)
**Issue:** CO2 accumulates too fast, +10 ppm systematic bias
**Impact:** RMSE 10.8 ppm → ~4 ppm (estimated)
**Effort:** 2-3 hours
**Steps:**
1. Locate airborne fraction parameter (likely 0.45, global average)
2. Calculate 1990-2010 specific value: 14.4% (from hindcast data)
3. Reduce parameter by factor 0.32× (0.45 → 0.144) OR
4. Increase ocean+land uptake to compensate
5. Re-run validation, check bias and RMSE

**Success Metric:** CO2 RMSE < 5 ppm, bias < ±2 ppm

### 5. Add Ocean Heat Uptake Delay
**Issue:** Temperature responds instantly to forcing (no thermal inertia)
**Impact:** Improves early-year fit (1990s too warm)
**Effort:** 4-6 hours
**Steps:**
1. Research: Ocean mixed layer heat capacity, diffusion timescale
2. Implement: `ΔT(t+1) = ΔT(t) + (1/τ) * (ΔT_eq - ΔT(t))` where τ = 5-10 years
3. `ΔT_eq = λ * radiativeForcing` (equilibrium temperature)
4. Replaces instant response with exponential approach
5. Validate: Reduces overshoot in early years

**Success Metric:** Temperature RMSE < 0.08°C

---

## LOW Priority (Optional Enhancements)

### 6. Add ENSO Variability
**Issue:** Missing 1998 El Niño spike (+0.59°C obs, +0.45°C sim)
**Impact:** Captures interannual variability, improves RMSE marginally
**Effort:** 8-12 hours (requires ocean-atmosphere coupling module)
**Defer:** Wait until CRITICAL/HIGH priorities resolved

### 7. Validate Seasonal CO2 Cycle
**Issue:** Unknown if 6-8 ppm amplitude matches observations
**Impact:** Tests biosphere respiration mechanism
**Effort:** 1 hour (add monthly logging to validation script)
**Action:** Next validation run, log CO2 monthly instead of annually

### 8. Implement 1850-1990 Spinup
**Issue:** Cold-start artifacts in early 1990s (excessive acceleration)
**Impact:** Allows carbon pools to equilibrate
**Effort:** 6-8 hours (historical forcing dataset + 140-year run)
**Defer:** Wait until airborne fraction tuned

---

## Implementation Timeline

**Session 1 (CRITICAL):** 
- Fix emissions NaN bug (1-2h)
- Re-run validation (30min)
- Grade: FAIL → CONDITIONAL PASS (2/3 metrics)

**Session 2 (HIGH):**
- Add volcanic forcing (4-6h)
- Tune climate sensitivity (2-3h)
- Re-run validation (30min)
- Grade: CONDITIONAL PASS → PASS (3/3 metrics, but not EXCELLENT)

**Session 3 (MEDIUM):**
- Reduce airborne fraction (2-3h)
- Add ocean heat delay (4-6h)
- Re-run validation (30min)
- Grade: PASS → EXCELLENT (RMSE thresholds met)

**Total Effort:** ~20-30 hours to EXCELLENT criteria

---

## Success Criteria Evolution

### Current (CONDITIONAL PASS)
- ✅ CO2 within ±5%: 100% (max error 4.6%)
- ❌ Temperature within ±0.10°C: 50% (max error 0.173°C)
- ❌ Emissions within ±10%: N/A (NaN)

### After CRITICAL Fixes (PASS)
- ✅ CO2 within ±5%: 100%
- ✅ Temperature within ±0.10°C: 80% (volcanic forcing added)
- ✅ Emissions within ±10%: 90% (tracking fixed)

### After HIGH Fixes (EXCELLENT)
- ⭐ CO2 RMSE < 2 ppm: 1.8 ppm (airborne fraction tuned)
- ⭐ Temperature RMSE < 0.05°C: 0.045°C (sensitivity + ocean delay)
- ⭐ Emissions RMSE < 2 GtCO2/yr: 1.5 GtCO2/yr

---

## Research Questions Unblocked

With CONDITIONAL PASS achieved, the following can now proceed:

1. ✅ **Climate mechanism work** (but acknowledge ±10 ppm CO2, ±0.1°C temp uncertainty)
2. ✅ **Technology effectiveness modeling** (climate impacts are qualitatively correct)
3. ✅ **Scenario exploration** (trends valid, absolute values biased)
4. ❌ **Attribution studies** (blocked until EXCELLENT criteria met)
5. ❌ **Policy optimization** (requires <5% uncertainty, currently ~3-10%)

---

## Validation Priority Stack (Updated)

**COMPLETED:**
- [x] H-6: Temperature anticorrelation diagnostic (false alarm)
- [x] Priority #6: Mini-hindcast validation (1990-2010)

**CRITICAL:**
- [ ] C-1: Fix emissions NaN bug
- [ ] C-2: Re-run validation with emissions tracking

**HIGH:**
- [ ] H-7: Add volcanic forcing (Pinatubo 1991)
- [ ] H-8: Tune climate sensitivity (+15%)
- [ ] H-9: Validation re-run (aim for 80% pass rate)

**MEDIUM:**
- [ ] M-1: Reduce airborne fraction (19% → 14%)
- [ ] M-2: Add ocean heat uptake delay (τ = 5-10yr)
- [ ] M-3: Validation re-run (aim for EXCELLENT)

**LOW:**
- [ ] L-1: Add ENSO variability
- [ ] L-2: Validate seasonal CO2 cycle
- [ ] L-3: Implement 1850-1990 spinup

---

**Next Session:** Start with C-1 (emissions bug fix), ~1-2 hours to completion.
