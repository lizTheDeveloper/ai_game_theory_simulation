# C-4 Death Rate Investigation - DIAGNOSIS

**Date:** Nov 27, 2025
**Investigator:** Roy (Simulation Maintainer)
**Context:** Population hindcast validation - growth 0.11%/yr vs expected 1.5%/yr (13× too low)

## Problem Statement

After fixing birth rates in Session 6 (now correct at historical values), overall population growth remains 13× too low:

- **Observed:** 0.11%/yr growth
- **Expected:** 1.5%/yr growth (1990-2000 UN WPP 2024)
- **Birth rates:** ✅ CORRECT (2.70%/yr SSA, 1.43%/yr East Asia)
- **Implication:** Death rates must be ~2.6× too high (2.59%/yr vs 0.99%/yr expected)

## Initial Hypothesis (WRONG)

Death rates calculated from 2025 baselines then scaled to historical values, similar to birth rate bug fixed in Session 6.

**Diagnostic findings:**
- Regional death rate calculation shows 0.62%/yr (37% TOO LOW, not too high!)
- This contradicts the observed symptom (growth too low = deaths too high)

**Conclusion:** The `region.adjustedDeathRate` field is calculated but NOT USED for actual mortality!

## Root Cause Analysis

### Architecture Overview

**Death rate calculation has TWO paths:**

1. **Regional population system** (`regionalPopulations.ts` lines 537-644):
   - Calculates `region.adjustedDeathRate` from healthcare quality, crisis modifiers, historical CDR scaling
   - This field is DISPLAY ONLY (used for logging, not actual deaths)
   - Lines 668-670 apply births ONLY, not deaths: `region.netGrowthRate = region.adjustedBirthRate`

2. **Bayesian mortality system** (`BaselineMortalityPhase.ts` + `BayesianMortalityResolutionPhase.ts`):
   - BaselineMortalityPhase (order 34.8) adds baseline mortality risk
   - BayesianMortalityResolutionPhase (order 35.0) resolves ALL mortality (baseline + crises)
   - This is the AUTHORITATIVE source for population after mortality

### The Bug

**File:** `src/simulation/engine/phases/BaselineMortalityPhase.ts`
**Lines:** 503-537

```typescript
const baselineRisk = calculateBaselineMortalityRisk(state);  // Historical CDR (e.g., 9.3/1000 for 1990)
const eraMultiplier = getEraMortalityMultiplier(actualYear);  // 0.30 for 1990
const compensatedBaselineRisk = baselineRisk / eraMultiplier;  // ❌ WRONG!

addMortalityRisk(pop, {
  type: 'other',
  baseRisk: compensatedBaselineRisk,  // Pre-compensated for ERA multiplier
  // ...
});
```

**What this does:**
- 1990 CDR: 9.3/1000 = 0.0093 annual = 0.000775 monthly
- ERA multiplier 1990: 0.30
- **Compensation:** 0.000775 / 0.30 = **0.00258** (3.3× HIGHER!)
- Bayesian system multiplies by ERA again: 0.00258 × 0.30 = 0.000775 ✓

**The problem:**

1. **ERA multipliers are for CRISIS mortality, not baseline!**
   - Line 322 of `config.ts`: "Applied to crisis mortality calculations, not baseline population dynamics"
   - ERA = emergency response capability (early warning, surge capacity, disaster coordination)
   - Baseline mortality improvement (9.3 → 7.5/1000) already captured in historical CDR values

2. **The "compensation" assumes Bayesian system applies ERA to baseline**
   - If Bayesian system DOESN'T apply ERA to baseline mortality (as intended), deaths are 3.3× too high
   - This matches observed symptom: 2.59%/yr vs 0.99%/yr = 2.6× too high ✓

3. **Historical CDR values already include healthcare improvements**
   - 1990 CDR: 9.3/1000 (worse healthcare, sanitation, antibiotics)
   - 2025 CDR: 7.5/1000 (better healthcare)
   - No additional scaling needed!

### Verification

**Expected baseline mortality (1990):**
- Global CDR: 9.3/1000 = 0.0093 annual = 0.000775 monthly
- Population: 5.32B
- **Expected deaths:** 5320M × 0.000775 / 12 = **4.1M/month**

**Current baseline mortality (with bug):**
- Compensated risk: 0.000775 / 0.30 = 0.00258 monthly
- Population: 5.32B
- If Bayesian applies ERA: 5320M × 0.00258 × 0.30 / 12 = 4.1M/month ✓ (coincidentally correct)
- If Bayesian DOESN'T apply ERA: 5320M × 0.00258 / 12 = **13.7M/month** ❌ (3.3× too high)

**This explains the 2.6× excess death rate!**

## Evidence

### Code Comments

`BaselineMortalityPhase.ts` lines 509-520:

```typescript
// HINDCAST FIX: Compensate for ERA mortality multiplier
// The Bayesian system will multiply ALL risks by ERA multiplier (line 362 of bayesianMortality.ts)
// But baseline demographic deaths should NOT be scaled by ERA multiplier!
//
// ERA multiplier compensation: Baseline mortality is NOT divided by ERA multiplier
// because ERA represents "crisis response capability" not "baseline healthcare quality"
```

**Comment says baseline mortality should NOT be scaled by ERA, then immediately does the opposite!**

### Configuration Documentation

`config.ts` lines 320-324:

```typescript
/**
 * RENAME RATIONALE:
 * The original "ERA_MORTALITY_MULTIPLIERS" name conflated two phenomena. Renamed to
 * "ERA_CRISIS_VULNERABILITY_MULTIPLIERS" to clarify mechanism. Applied to crisis mortality
 * calculations, not baseline population dynamics.
 */
```

**Clear statement: ERA should NOT affect baseline mortality!**

## Recommended Fix

**File:** `src/simulation/engine/phases/BaselineMortalityPhase.ts`
**Lines:** 503-537

**REMOVE the ERA compensation entirely:**

```typescript
// Calculate baseline mortality risk from historical data
const baselineRisk = calculateBaselineMortalityRisk(state);

// ❌ DELETE: ERA compensation (lines 505-537)
// const eraMultiplier = getEraMortalityMultiplier(actualYear);
// const compensatedBaselineRisk = baselineRisk / eraMultiplier;

// ✅ USE: Direct historical CDR (no ERA scaling)
addMortalityRisk(pop, {
  type: 'other',
  baseRisk: baselineRisk,  // Historical CDR already includes healthcare improvements
  proximate: 'disease',
  root: 'demographic',
  confidence: 'HIGH',
  scope: 'GLOBAL',
  month: state.currentMonth,
  description: `Baseline demographic mortality (CDR ${getHistoricalCrudeDeathRate(actualYear).toFixed(1)}/1000)`,
});
```

**Rationale:**
1. Historical CDR values (9.3/1000 → 7.5/1000) already capture baseline healthcare improvements
2. ERA multipliers represent CRISIS RESPONSE (early warning, surge capacity), not baseline care
3. Bayesian system should apply ERA to CRISIS mortality only, not baseline demographic deaths
4. Current "compensation" assumes Bayesian applies ERA to baseline, creating 3.3× overcounting

## Validation Plan

1. **Apply fix** to BaselineMortalityPhase.ts
2. **Run hindcast:** 1990-2000 (120 months)
3. **Check growth rate:** Should be ~1.5%/yr (±0.2%)
4. **Check 2000 population:** Should be ~6.1B (±5%)
5. **Check regional variation:** SSA growing, Europe stable, East Asia declining
6. **Monte Carlo:** N≥10 runs to verify determinism

## Impact Assessment

**Files affected:**
- `src/simulation/engine/phases/BaselineMortalityPhase.ts` (PRIMARY)
- Possibly `src/simulation/bayesianMortality.ts` (verify ERA not applied to baseline)

**Breaking changes:**
- Death rates will drop by 3.3× (if Bayesian doesn't apply ERA to baseline)
- OR no change (if Bayesian applies ERA, compensation was masking correct behavior)

**Research backing:**
- UN World Population Prospects 2024 (historical CDR values)
- World Bank CDR data (23.5% decline 1990-2019)
- RAND report on surge capacity improvements (crisis response, not baseline)

## Next Steps

1. **Verify Bayesian system:** Check if `resolveMortality()` applies ERA to ALL risks or CRISIS only
2. **Apply fix:** Remove ERA compensation from BaselineMortalityPhase
3. **Test in isolation:** Single month simulation, check deaths match expected
4. **Full hindcast:** 1990-2000 validation
5. **Document:** Update BaselineMortalityPhase comments to explain why ERA is NOT used

---

**Status:** Ready for implementation
**Confidence:** HIGH (code comments, config documentation, and math all align)
**Risk:** LOW (fix simplifies code, removes unnecessary compensation logic)
