# HANDOFF: Phase 10 Hindcast Calibration Fixes (HIGH-6, HIGH-7, HIGH-8, HIGH-9)

**To:** Roy (simulation-maintainer)
**From:** Orchestrator
**Date:** 2025-11-27
**Priority:** HIGH - Blocking god mode validation

---

## Executive Summary

Phase 10 hindcast validation (Nov 27, 2025) revealed 4 HIGH priority calibration issues. Research validation PASSED (Grade A-/A). You are cleared to implement fixes sequentially.

**Issues:**
- HIGH-6: Temperature overestimation (+64% error, +0.82°C vs observed)
- HIGH-7: Population mortality (-76% error, -6.1B vs observed)
- HIGH-8: Biodiversity collapse (-95% error, near-extinction vs -34.7% observed)
- HIGH-9: Non-determinism (CV=6.7%, target <0.1%)

**Research Status:** ✅ All validated - `reviews/hindcast_calibration_research_critique_20251127.md`

**Implementation Order:** Sequential (temp → pop → bio → determinism) with hindcast N=10 after each

---

## HIGH-6: Temperature Overestimation - Add Aerosol Forcing

**Priority:** 1 (implement first)
**Effort:** 4-6 hours
**Risk:** LOW (isolated to climate system)

### Problem

- **Observed 2024:** 1.28°C above 1990 baseline (NASA GISS)
- **Simulated 2024:** 2.10°C above 1990 baseline (ALL 10 RUNS IDENTICAL)
- **Error:** +0.82°C (+64.1%)
- **Root cause:** Missing aerosol cooling (-0.7 to -1.1 W/m²)

### Research Files

- **Research:** `research/temperature_overestimation_HIGH6_research_20251127.md`
- **Validation:** `reviews/hindcast_calibration_research_critique_20251127.md` (lines 25-171)
- **Grade:** A- (APPROVED)

### Implementation Steps

1. **Create new phase: `AerosolForcingPhase.ts`**
   - Location: `src/simulation/climate/`
   - Order: 16.6 (after EmissionsPhase 16.0, before VolcanicForcingPhase 16.5)

2. **Add aerosol ERF lookup table:**
   ```typescript
   const AEROSOL_ERF_HISTORICAL = {
     1990: -1.1, // W/m² (peak cooling, pre-regulation)
     2000: -1.0,
     2010: -0.9,
     2020: -0.85,
     2024: -0.8, // W/m² (declining trend, air quality regulations)
   };

   // Linear interpolation for monthly resolution
   function getAerosolERF(year: number): number {
     // If historical mode, use lookup table
     // If projection mode, use SSP2-4.5 trajectory (declining to -0.3 by 2050)
   }
   ```

3. **Apply temperature response:**
   ```typescript
   const CLIMATE_FEEDBACK_PARAMETER = 0.8; // K/(W/m²), IPCC AR6
   const aerosolERF = getAerosolERF(state.currentYear);
   const aerosolCooling = aerosolERF * CLIMATE_FEEDBACK_PARAMETER;

   // Apply to temperature anomaly
   state.climateSystem.temperatureAnomaly += aerosolCooling;
   ```

4. **Register phase in `PhaseOrchestrator.ts`:**
   ```typescript
   new AerosolForcingPhase(16.6),
   ```

### Expected Outcome

- **Before:** 2024 temperature 2.10°C
- **After:** 2024 temperature ~1.46°C (within 14% of observed 1.28°C)
- **Success criteria:** 1.28°C ± 0.13°C (±10% tolerance)

### Validation

Run hindcast N=10:
```bash
cd /home/lizthedeveloper_gmail_com/ai_game_theory_simulation
npx tsx scripts/hindcastingValidation.ts --startYear 1990 --endYear 2024 --numRuns 10 > logs/hindcast/high6_aerosol_fix_$(date +%Y%m%d_%H%M%S).log 2>&1 &
```

**Pass criteria:**
- Temperature deviation < 20% (currently 64%, target <20%)
- No regressions in population, biodiversity, QoL
- CV remains ~0% for temperature (already perfect)

### CRITICAL Clarifications (From Research Validation)

1. **Post-2024 trajectory:**
   - Use SSP2-4.5 aerosol pathway: -0.8 W/m² (2024) → -0.3 W/m² (2050) → -0.1 W/m² (2100)
   - Linear interpolation adequate for first pass
   - Source: IPCC AR6 WG1 Chapter 6

2. **Projection mode (isHistoricalBaseline=false):**
   - Continue using aerosol ERF (not just historical)
   - Crisis scenarios (nuclear war) can OVERRIDE with stratospheric soot (+5 W/m² warming from black carbon)

3. **Parameter uncertainty:**
   - Aerosol ERF: -1.1 W/m² ± 0.4 W/m² (IPCC AR6)
   - Climate feedback: 0.8 K/(W/m²) ± 0.2 K/(W/m²)
   - Combined uncertainty: ±0.3°C (acceptable)

---

## HIGH-7: Population Mortality Calibration

**Priority:** 2 (implement after HIGH-6 passes)
**Effort:** 6-8 hours
**Risk:** MEDIUM (affects food security, health systems)

### Problem

- **Observed 2024:** 8.12 billion (UN DESA)
- **Simulated 2024:** 1.22B to 3.44B (mean ~2.0B)
- **Error:** -6.1B (-76.2%)
- **Root cause:** Mortality calibrated for CRISIS scenarios, not 1990-2024 baseline growth

### Research Files

- **Research:** `research/population_underestimation_HIGH7_research_20251127.md`
- **Validation:** `reviews/hindcast_calibration_research_critique_20251127.md` (lines 173-353)
- **Grade:** A- (APPROVED with CRITICAL architecture question)

### Implementation Steps

1. **Correct baseline CDR values (Phase 6 fix from Nov 24):**
   ```typescript
   const HISTORICAL_CDR = {
     1990: 9.3,  // Was 9.8 (reduce -5%)
     2000: 8.5,  // Was 9.0 (reduce -5.5%)
     2010: 7.8,  // Was 8.3 (reduce -6%)
     2019: 7.5,  // Verified ✅
     2024: 7.76, // NEW (Our World in Data 2024)
   };
   ```

2. **Add declining fertility trajectory:**
   ```typescript
   const HISTORICAL_TFR = {
     1990: 3.31, // UN WPP 2024
     2000: 2.72,
     2010: 2.52,
     2020: 2.30,
     2024: 2.25, // UN WPP 2024
   };

   // In DemographicPhase or FertilityPhase
   const fertilityRate = interpolateLinear(state.currentYear, HISTORICAL_TFR);
   ```

3. **Add "historical mode" flag (CRITICAL):**
   ```typescript
   // In BaselineMortalityPhase or equivalent
   if (config.isHistoricalBaseline) {
     // Use UN WPP 2024 empirical mortality (no crisis multipliers)
     const baseCDR = getHistoricalCDR(state.currentYear);
     return baseCDR; // No Bayesian resolution, no famine cascades
   } else {
     // PROJECTION MODE: Use HYBRID model
     const baseCDR = 7.76; // 2024 baseline, declining slowly
     const crisisMultiplier = bayesianMortalityResolution(state, rng); // 1.0 (normal) to 5.0 (catastrophe)
     return baseCDR * crisisMultiplier; // ADDITIVE, not either/or
   }
   ```

4. **Audit food security cascades:**
   - Check if `FaminePhase` or similar triggers false famines during 1990-2024
   - Food security index should NOT fall below threshold during baseline period
   - If it does, recalibrate food security initialization or thresholds

### Expected Outcome

- **Before:** 2024 population 1.22B to 3.44B
- **After:** 2024 population 7.7B to 8.5B (within 5% of 8.12B)
- **Success criteria:** 8.12B ± 0.4B (±5% tolerance)

### Validation

Run hindcast N=10 (same command as HIGH-6)

**Pass criteria:**
- Population deviation < 10% (currently 76%, target <10%)
- Direction: Population GROWS (+52.8% ±10%)
- Determinism: CV < 1% (currently ~50-60%)

### CRITICAL Clarifications (From Research Validation)

1. **Projection mode architecture (MANDATORY):**
   - Do NOT use `if (historical) { empirical } else { crisis }` (bifurcated model)
   - Use HYBRID: `effectiveCDR = baseline_CDR * crisis_multiplier`
   - Crisis mechanics are ADDITIVE to baseline, not replacements
   - This ensures nuclear war in 2030 still increases mortality

2. **Post-2024 fertility trajectory:**
   - Continue demographic transition: TFR 2.25 (2024) → 2.1 (2040s) → 1.9 (2100)
   - Use UN WPP 2024 medium variant projections
   - SSP2 scenario: gradual decline

3. **Regional variation:**
   - Research uses global mean CDR, but simulation has regional death rates
   - Validate that `getRegionalHistoricalDeathRate()` (Nov 24 fix) is correct
   - Check if 3× population variance is due to regional mortality stochasticity

---

## HIGH-8: Biodiversity Decline Rate Calibration

**Priority:** 3 (implement after HIGH-7 passes)
**Effort:** 4-6 hours
**Risk:** MEDIUM (affects ecology, extinction cascades)

### Problem

- **Observed 2024:** 0.49 (WWF LPI - 51% of 1970 baseline, -34.7% decline 1990-2024)
- **Simulated 2024:** 0.004 to 0.065 (mean ~0.03, -97% decline)
- **Error:** -0.46 (-94.7%)
- **Root cause:** Extinction rate tuned for 6th mass extinction, not WWF LPI empirical

### Research Files

- **Research:** `research/biodiversity_collapse_HIGH8_research_20251127.md`
- **Validation:** `reviews/hindcast_calibration_research_critique_20251127.md` (lines 355-544)
- **Grade:** A (APPROVED with minor adjustment)

### Implementation Steps

1. **Reduce baseline decline rate:**
   ```typescript
   // CURRENT (WRONG): Crisis extinction rate
   const EXTINCTION_RATE = 0.10; // 10% per year (6th mass extinction)

   // CORRECTED: Empirical 1990-2024 rate
   const BASELINE_DECLINE_RATE = 0.0124; // 1.24% per year (WWF LPI)

   // In EcologyPhase or BiodiversityPhase
   if (config.isHistoricalBaseline) {
     state.biodiversity.index *= (1 - BASELINE_DECLINE_RATE / 12); // Monthly timestep
   } else {
     // PROJECTION MODE: Use mechanistic extinction model
     // But ensure baseline decline rate remains ~1-2%/year in non-crisis scenarios
   }
   ```

2. **Add conservation effect:**
   ```typescript
   // Protected area coverage (% of land)
   const PROTECTED_AREA_COVERAGE = {
     1990: 0.089, // 8.9%
     2010: 0.127, // 12.7%
     2020: 0.166, // 16.6%
     2024: 0.175, // ~17.5%
   };

   // Conservation effectiveness (REVISED per critique: 0.3 not 0.4)
   const conservationEffect = 1 - (protectedAreaCoverage * 0.3);
   // 0.3 = conservative estimate (Geldmann 2019: 30% effectiveness)

   // Apply to decline rate
   const effectiveDeclineRate = BASELINE_DECLINE_RATE * conservationEffect;
   ```

3. **Optional: Add agricultural land sparing:**
   ```typescript
   // Agricultural land share (% of total land)
   const AG_LAND_1990 = 0.375; // 37.5%
   const AG_LAND_2024 = 0.380; // 38.0% (grew slower than food production)

   // Borlaug Hypothesis: Intensification spared land
   const landSparingEffect = 1 - ((agLand_2024 - agLand_1990) / agLand_1990);
   // (0.380 - 0.375) / 0.375 = +1.3% (minimal land expansion)

   // Biodiversity benefits
   const biodiversityBenefit = landSparingEffect * 0.2; // 20% of spared land converts to habitat
   ```

### Expected Outcome

- **Before:** 2024 biodiversity 0.004 to 0.065
- **After:** 2024 biodiversity 0.44 to 0.54 (within 10% of 0.49)
- **Success criteria:** 0.49 ± 0.05 (±10% tolerance)

### Validation

Run hindcast N=10 (same command)

**Pass criteria:**
- Biodiversity deviation < 20% (currently 95%, target <20%)
- Decline trajectory matches WWF LPI curve (gradual, not collapse)
- Recovery possible in some scenarios (not universal extinction)

### CRITICAL Clarifications (From Research Validation)

1. **Conservation effectiveness parameter:**
   - Research originally recommended 0.4 (40-60% effectiveness)
   - Critique revised to 0.3 (30% conservative estimate)
   - Source: Geldmann et al. 2019 found ~30% population decline reduction

2. **Post-2024 trajectory:**
   - Protected areas: 17.5% (2024) → 30% (2030 target) → 50% (2050 aspirational)
   - Decline rate: 1.24%/year (2024) → 0.5%/year (2050, if 30×30 target met)
   - Climate impacts: +0.3%/year per degree warming (threshold effects)

3. **LPI vs BII interpretation:**
   - WWF LPI measures POPULATION SIZE decline (vertebrates only)
   - BII measures SPECIES COMPOSITION intactness (broader)
   - Simulation "biodiversity index" can map to either - document which

---

## HIGH-9: Non-Determinism Investigation

**Priority:** 4 (can parallelize with HIGH-6/7/8)
**Effort:** 3-5 hours
**Risk:** HIGH PRIORITY - foundational for research simulation

### Problem

- **Target:** CV < 0.1% (near-perfect reproducibility)
- **Observed:** CV = 6.7% (67x higher than target)
- **Evidence:** Population varies 3× across identical seeds (1.22B to 3.44B)
- **Root cause:** Optional RNG with `Math.random()` fallback OR Object.entries() ordering

### Implementation Steps

1. **Audit RNG parameters (CRITICAL-3 regression pattern):**
   ```bash
   # Find all optional RNG parameters
   grep -r "rng\?" src/simulation/ | grep -v "test"

   # Find Math.random() usage (should be ZERO)
   grep -r "Math.random" src/simulation/
   ```

2. **Make ALL RNG parameters REQUIRED:**
   ```typescript
   // ❌ WRONG - Optional with fallback
   function simulate(rng?: () => number) {
     const random = rng || Math.random;
   }

   // ✅ CORRECT - Required with assertion
   function simulate(rng: () => number) {
     if (!rng || typeof rng !== 'function') {
       throw new Error('❌ CRITICAL: RNG required for deterministic simulation');
     }
   }
   ```

3. **Check Object.entries() in phase loops:**
   ```bash
   # Find Object.entries usage
   grep -r "Object.entries" src/simulation/phases/

   # Replace with deterministic iteration (sorted keys)
   const keys = Object.keys(obj).sort();
   for (const key of keys) { ... }
   ```

4. **Run determinism stress test:**
   ```bash
   # N=100 runs, SAME seed
   npx tsx scripts/determinismStressTest.ts --seed 19900102 --numRuns 100 > logs/determinism/high9_stress_test_$(date +%Y%m%d_%H%M%S).log 2>&1 &
   ```

### Expected Outcome

- **Before:** CV = 6.7% (population varies 3×)
- **After:** CV < 0.1% (all metrics identical across runs)
- **Success criteria:** CV < 0.01% (industry standard for Monte Carlo)

### Validation

**Pass criteria:**
- CV < 0.1% for ALL metrics (population, temperature, QoL, biodiversity)
- N=100 runs with SAME seed produce IDENTICAL results
- No floating-point accumulation errors (difference < 1e-10)

---

## Workflow Summary

**Sequential implementation order:**

1. **HIGH-6 (Temperature)** - 4-6h
   - Implement AerosolForcingPhase
   - Run hindcast N=10
   - If pass (temp within ±10%) → proceed to HIGH-7
   - If fail → debug aerosol parameterization

2. **HIGH-7 (Population)** - 6-8h
   - Fix CDR values, add fertility trajectory, implement hybrid mortality model
   - Run hindcast N=10
   - If pass (pop within ±5%) → proceed to HIGH-8
   - If fail → debug fertility or food security

3. **HIGH-8 (Biodiversity)** - 4-6h
   - Reduce decline rate, add conservation effect
   - Run hindcast N=10
   - If pass (biodiversity within ±10%) → proceed to HIGH-9
   - If fail → debug extinction rate or land use

4. **HIGH-9 (Determinism)** - 3-5h (can parallelize)
   - Audit RNG, make all params REQUIRED
   - Run stress test N=100
   - If pass (CV < 0.1%) → COMPLETE
   - If fail → investigate Object.entries() or async operations

**Total estimated effort:** 17-25 hours (3-4 days)

---

## Quality Gates

**After each fix, check:**
1. **No regressions:** Other metrics don't deteriorate
2. **Crash rate remains 0%:** No NaN/Infinity errors
3. **Determinism maintained:** CV doesn't increase
4. **Validation passes:** Metric within tolerance

**Final validation (Phase 11):**
1. **Hindcast N=10:** All 4 metrics pass (temp, pop, bio, determinism)
2. **Crisis scenarios:** Nuclear war, pandemic still produce realistic outcomes
3. **2024→2025 transition:** No discontinuity when `isHistoricalBaseline` flips
4. **Sensitivity analysis:** Parameter uncertainties don't break validation

---

## Communication Protocol

**Post to implementation channel after each fix:**
```markdown
---
**roy** | YYYY-MM-DD HH:MM | [COMPLETED]

HIGH-X: [Description] - Fix implemented
- Files modified: [list]
- Tests: [pass/fail]
- Hindcast validation: [pass/fail]
- Next: [HIGH-X+1 or COMPLETE]
---
```

**Post to coordination channel at milestones:**
- After HIGH-6 passes
- After HIGH-7 passes
- After HIGH-8 passes
- After HIGH-9 passes
- After Phase 11 final validation

---

## Files and Resources

**Research:**
- `research/temperature_overestimation_HIGH6_research_20251127.md`
- `research/population_underestimation_HIGH7_research_20251127.md`
- `research/biodiversity_collapse_HIGH8_research_20251127.md`

**Validation:**
- `reviews/hindcast_calibration_research_critique_20251127.md` (THIS IS YOUR GUIDE)
- `reviews/climate_hindcast_validation_phase10_20251127.md` (Original problem report)

**Scripts:**
- `scripts/hindcastingValidation.ts` (Run hindcast N=10)
- `scripts/determinismStressTest.ts` (Run stress test N=100)

**Logs:**
- `logs/hindcast/` (Hindcast validation output)
- `logs/determinism/` (Stress test output)

---

## Success Criteria (Final)

**Phase 11 Validation MUST pass:**
- Temperature: 1.28°C ± 0.13°C (±10%)
- Population: 8.12B ± 0.4B (±5%)
- Biodiversity: 0.49 ± 0.05 (±10%)
- Determinism: CV < 0.1% (all metrics)
- Crash rate: 0%
- Overall deviation: < 30% (currently 56.9%)

**God mode analysis can proceed when Phase 11 passes.**

---

**Handoff Complete**
**From:** Orchestrator
**To:** Roy (simulation-maintainer)
**Date:** 2025-11-27
**Status:** ✅ Research validated, cleared for implementation
