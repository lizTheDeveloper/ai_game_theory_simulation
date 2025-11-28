# ROOT CAUSE ANALYSIS: C-4 Population Decline (Hindcast 1990)

**Date:** November 27, 2025
**Investigator:** Roy (simulation-maintainer)
**Issue:** Population growing at 0.11%/yr instead of 1.5%/yr in 1990 hindcast

## Problem Statement

Simple test shows unexpected population dynamics:
- **Overall growth:** 0.11%/yr (expected 1.5%/yr based on CBR-CDR)
- **Sub-Saharan Africa:** +1.5M/month ✅ CORRECT - growing as expected
- **East Asia:** -1M/month ❌ WRONG - should be stable/growing in 1990

Birth rates were fixed in Session 6 (commit 052a8c879):
- Direct CBR lookup from UN WPP data ✅
- Sub-Saharan Africa: 4.73% ✅ (historical 47.3/1000)
- East Asia: 1.43% ✅ (historical 15.2/1000)

But population still not matching hindcast validation (should be 6.9B at 2010, getting 9.2B).

## Investigation Process

### Step 1: Death Rate Diagnosis

Created `scripts/diagnoseDeathRates.ts` to compare historical vs simulated death rates.

**Expected (from UN WPP 2024):**
```
Global CDR (1990): 9.3/1000 = 0.93%/yr
Sub-Saharan Africa: 15.6/1000 = 1.56%/yr
East Asia: 7.0/1000 = 0.70%/yr
```

**Actual (from simulation):**
```
Global CDR: 0.78%/yr (21% TOO LOW!)
Sub-Saharan Africa: 0.90%/yr (42% too low)
East Asia: 0.80%/yr (14% too high)
```

**Population impact:**
- Expected net growth: +0.78%/yr (births 1.77% - deaths 0.99%)
- Actual net growth: +0.99%/yr (births 1.77% - deaths 0.78%)

Wait... deaths are TOO LOW, not too high! So why is population not growing fast enough?

### Step 2: Architecture Review

Checked how deaths are applied:

1. **RegionalPopulationsPhase** (order 19.6): Adds births to regional populations
   - Uses direct historical CBR lookup (4.73% for SSA) ✅
   - Does NOT subtract deaths (line 670: `region.netGrowthRate = region.adjustedBirthRate;`)

2. **BaselineMortalityPhase** (order 34.8): Adds baseline demographic mortality risks
   - Calculates historical CDR (9.3/1000 for 1990) ✅
   - Pre-divides by ERA multiplier (0.30 for 1990) to get 3.1× risk
   - Adds risk to `mortalityRisks` array

3. **BayesianMortalityResolutionPhase** (order 35.0): Resolves all mortality risks
   - Compounds all risks with demographic vulnerabilities
   - **Multiplies ALL risks by ERA multiplier** (line 362)
   - Applies deaths to regional populations

### Step 3: ERA Multiplier Analysis

**The Smoking Gun:**

`src/types/config.ts` line 327:
```typescript
ERA_MORTALITY_MULTIPLIERS: Record<number, number> = {
  1990: 0.30,  // 70% HIGHER crisis vulnerability (worse surge capacity, slower response, no early warning)
  2025: 1.00,  // Current calibration baseline (maximum crisis response capability)
};
```

Comment says "70% HIGHER crisis vulnerability" but multiplier is 0.30 (30% of 2025 capacity).

**How it's supposed to work:**
- ERA multiplier represents crisis response capability
- 1990: 0.30 = 30% as good as 2025 at responding to crises
- Should INCREASE crisis deaths (worse response) in 1990
- Should NOT affect baseline demographic deaths (aging, disease)

**How it actually works:**

`bayesianMortality.ts` line 362:
```typescript
const adjustedRisk = risk.baseRisk * vulnerability * eraMortalityMultiplier;
```

This multiplies **ALL** risks (baseline + crisis) by ERA multiplier!

For 1990:
- Baseline demographic risk: 9.3/1000/12 = 0.000775
- After vulnerability weighting: ~0.000775 (average)
- **Multiplied by ERA 0.30: 0.000233** ← REDUCES baseline deaths by 70%!

This is backwards! Baseline deaths from aging/disease shouldn't change based on crisis response infrastructure.

## Root Cause

**ERA_MORTALITY_MULTIPLIERS is being misapplied to baseline demographic mortality.**

1. BaselineMortalityPhase calculates correct historical CDR (9.3/1000 for 1990)
2. Pre-divides by ERA (0.30) to compensate for Bayesian multiplication
3. BayesianMortality multiplies ALL risks by ERA (0.30)
4. Result: Baseline deaths in 1990 are 0.30× what they should be
5. This REDUCES deaths when ERA should only affect crisis response, not aging

**Numerical proof:**
- Historical 1990 deaths: 9.3/1000 × 5.32B = 49.5M deaths/yr
- Simulated 1990 deaths: 0.78% × 5.32B = 41.5M deaths/yr
- Difference: -8M deaths/yr = -16% undercount

## The Fix

**Option 1: Remove ERA multiplier from baseline mortality** (RECOMMENDED)

Baseline demographic deaths should use historical CDR directly without ERA scaling:

```typescript
// bayesianMortality.ts line 362
const adjustedRisk = risk.type === 'other' && risk.root === 'demographic'
  ? risk.baseRisk * vulnerability  // NO ERA multiplier for baseline
  : risk.baseRisk * vulnerability * eraMortalityMultiplier;  // ERA only for crisis
```

**Option 2: Fix ERA multiplier interpretation**

If ERA 0.30 means "worse crisis response", it should INCREASE crisis deaths, not decrease:

```typescript
// For crisis risks, invert the multiplier logic
const crisisMultiplier = risk.root === 'demographic'
  ? 1.0  // No effect on baseline
  : 1.0 + (1.0 - eraMortalityMultiplier);  // 1990: 1.0 + 0.7 = 1.7× MORE crisis deaths
```

**Option 3: Use separate multipliers**

```typescript
const ERA_BASELINE_MORTALITY = { 1990: 1.0, 2025: 1.0 };  // No change
const ERA_CRISIS_RESPONSE = { 1990: 0.30, 2025: 1.0 };  // Worse in 1990
```

## Impact

Fixing this will:
- **Increase** 1990 deaths from 41.5M/yr to 49.5M/yr (+8M/yr)
- **Reduce** net population growth from 0.99%/yr to ~0.78%/yr
- Still not enough! Expected is 1.5%/yr, so there's ANOTHER issue

**Wait...** the diagnosis script showed deaths are TOO LOW, but population is also growing TOO SLOWLY. That means something else is killing people beyond the Bayesian system!

## Next Steps

1. ✅ Identified ERA multiplier misapplication to baseline mortality
2. ❌ Need to find what else is causing excess deaths (8M/yr gap not explained)
3. Check for:
   - Double-counting deaths in regional vs global aggregation
   - Crisis mortality being applied in hindcast mode when it shouldn't
   - Population flowing out via migration/refugees without being tracked

## Files Affected

- `src/simulation/bayesianMortality.ts` - Line 362 (ERA multiplier application)
- `src/simulation/engine/phases/BaselineMortalityPhase.ts` - Lines 505-537 (ERA compensation logic)
- `src/types/config.ts` - Lines 326-335 (ERA multiplier definition)

## Recommended Fix

**IMMEDIATE (solves 16% of the problem):**

Exempt baseline demographic mortality from ERA scaling:

```typescript
// In bayesianMortality.ts, replace line 362:
const isBaselineDemographic = (risk.type === 'other' && risk.root === 'demographic');
const eraScale = isBaselineDemographic ? 1.0 : eraMortalityMultiplier;
const adjustedRisk = risk.baseRisk * vulnerability * eraScale;
```

**THEN investigate the remaining discrepancy** (population still growing too slowly even after this fix).

---

**Status:** Root cause identified, fix designed, needs implementation + validation.
