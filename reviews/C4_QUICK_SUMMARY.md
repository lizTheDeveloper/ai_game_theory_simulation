# C-4 Death Rate Investigation - QUICK SUMMARY

**Date:** Nov 27, 2025
**Investigator:** Roy (Simulation Maintainer)

## Problem

Population growth 0.11%/yr vs expected 1.5%/yr (13× too low) after fixing birth rates in Session 6.

## Root Cause

**ERA mortality multiplier applied incorrectly to baseline demographic deaths.**

- ERA multipliers represent CRISIS RESPONSE capability (early warning, surge capacity)
- Baseline mortality improvement (9.3→7.5/1000 CDR 1990-2025) already in historical data
- Code was applying ERA to ALL mortality, including baseline
- Then "compensating" by dividing baseline by ERA (3.3× overcounting)

## The Bug (Nov 24, 2025 implementation)

**File:** `src/simulation/bayesianMortality.ts` line 362

```typescript
// ❌ WRONG: Applies ERA to ALL risks (including baseline)
const adjustedRisk = risk.baseRisk * vulnerability * eraMortalityMultiplier;
```

**File:** `src/simulation/engine/phases/BaselineMortalityPhase.ts` lines 505-537

```typescript
// ❌ WRONG: "Compensates" by dividing baseline by ERA (fragile coupling)
const compensatedBaselineRisk = baselineRisk / eraMultiplier;
addMortalityRisk(pop, {
  baseRisk: compensatedBaselineRisk,  // Pre-compensated
});
```

**Net effect if Bayesian doesn't apply ERA:** 3.3× too many deaths (2.59%/yr vs 0.99%/yr)

## The Fix (Nov 27, 2025)

**1. Filter baseline mortality from ERA scaling in Bayesian system:**

```typescript
// ✅ CORRECT: ERA only for crisis mortality
const isBaselineMortality = (risk.root === 'demographic' || risk.type === 'other');
const eraAdjustment = isBaselineMortality ? 1.0 : eraMortalityMultiplier;
const adjustedRisk = risk.baseRisk * vulnerability * eraAdjustment;
```

**2. Remove compensation from BaselineMortalityPhase:**

```typescript
// ✅ CORRECT: Use historical CDR directly (no ERA scaling)
addMortalityRisk(pop, {
  baseRisk: baselineRisk,  // Direct from historical CDR
  root: 'demographic',     // Triggers ERA filter in Bayesian
});
```

## Evidence

- **Config documentation:** `config.ts` line 322 - "Applied to crisis mortality calculations, not baseline population dynamics"
- **Code comments:** BaselineMortalityPhase says baseline SHOULD NOT be scaled by ERA, then does opposite
- **Math:** 1990 CDR 9.3/1000 with ERA 0.30 → 9.3/0.30 = 31/1000 (3.3× overcounting)

## Files Changed

1. `src/simulation/bayesianMortality.ts` (lines 360-368): Filter baseline from ERA
2. `src/simulation/engine/phases/BaselineMortalityPhase.ts` (lines 503-536): Remove compensation

## Validation

- **Test:** 1990-2000 hindcast (120 months)
- **Expected:** 1.5%/yr growth, 6.1B in 2000
- **Running:** `scripts/diagnostics/test_c4_population_growth.ts`

## Impact

- **Breaking:** Death rates drop by ~3.3× in historical scenarios (1990 ERA = 0.30)
- **No change:** In 2025 scenarios (ERA = 1.0, no scaling anyway)
- **Architecture:** Simpler (no fragile cross-phase compensation)

---

**Status:** Fix implemented, validation running
**Confidence:** HIGH (documentation, comments, and math all align)
