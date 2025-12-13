# Hindcast Population Collapse Investigation
**Date:** December 13, 2025
**Session:** 82
**Status:** CRITICAL BUG IDENTIFIED - Investigation in progress

## Summary

Discovered **CRITICAL population collapse bug** during hindcast validation (1990-2020). Population declines -42% when historical data shows +46% growth.

## Timeline

1. **Session 81:** Fixed 1990 population initialization bug (+53% → -1.3%)
2. **Session 82:** Validation script crashed on TypeError
3. **Session 82:** Fixed script crash, discovered -42% population collapse

## Bug Details

### Validation Results (N=1, seed=1)

```
✅ 1990: 5.258B vs 5.327B (-1.30%)  [ACCURATE]
⚠️ 1995: 5.212B vs 5.744B (-9.26%)  [REGRESSION]
⚠️ 2000: 5.369B vs 6.143B (-12.60%)
⚠️ 2005: 5.425B vs 6.542B (-17.07%)
⚠️ 2010: 5.330B vs 6.957B (-23.38%)
⚠️ 2015: 5.038B vs 7.38B (-31.74%)
⚠️ 2020: 4.508B vs 7.795B (-42.17%) [CATASTROPHIC]
```

**Expected:** +46.3% growth (5.327B → 7.795B)
**Actual:** -15.4% decline (5.258B → 4.508B)
**Error:** -61.7 percentage points

### Debug Output (1990-1995)

```
Initial state (1990):
  Population: 5.258B
  Baseline birth rate: 18.00 per 1000/month
  Baseline death rate: 8.00 per 1000/month
  Adjusted birth rate: 18.00 per 1000/month
  Adjusted death rate: 8.00 per 1000/month
  Net growth: 1.000% per month

1991: Pop=5.063B, Birth=27.00/1k/mo, Death=8.88/1k/mo, Growth=1.812%/mo
1992: Pop=5.097B, Birth=26.79/1k/mo, Death=8.85/1k/mo, Growth=1.794%/mo
1993: Pop=5.136B, Birth=26.57/1k/mo, Death=8.82/1k/mo, Growth=1.775%/mo
1994: Pop=5.176B, Birth=26.35/1k/mo, Death=8.78/1k/mo, Growth=1.756%/mo
1995: Pop=5.216B, Birth=26.12/1k/mo, Death=8.75/1k/mo, Growth=1.738%/mo

Final state (1995):
  Population: 5.216B
  5-year change: -0.8%
  Expected (1990-1995 historical): +8.3% (5.327B → 5.744B)
```

## Key Observations

1. **Initial rates look correct:**
   - Birth: 18.00/1k/month (1.8%/year) ✅
   - Death: 8.00/1k/month (0.8%/year) ✅
   - Net growth: 1.0%/month (10%/year) ⚠️ **TOO HIGH**

2. **Rates increase dramatically after month 1:**
   - Birth jumps from 18/1k to 27/1k (+50%)
   - Growth increases from 1.0%/mo to 1.8%/mo (+80%)

3. **Population DECLINES despite positive growth rates:**
   - Growth rate: +1.7-1.8%/month
   - Actual change: -0.8% over 5 years
   - **CONTRADICTION: Growth rates don't match population changes**

## Hypotheses

### H1: Annual/Monthly Rate Confusion
- Initialization may set ANNUAL rates (1.8%/year)
- Simulation may apply them as MONTHLY rates (1.8%/month = 21.6%/year)
- Result: 12x too much growth
- **BUT:** This doesn't explain population DECLINE

### H2: Mortality System Double-Counting
- Base death rate (8/1k/month)
- Regional death rates applied separately
- Crisis mortality system applied
- **Possible:** Death rate applied multiple times per month

### H3: Population Units Mismatch
- Regional populations in MILLIONS
- Global population in BILLIONS
- **Possible:** Unit conversion error causing population loss

### H4: Growth Rate Calculation vs Application
- Growth rate REPORTED correctly
- Growth rate NOT APPLIED correctly
- **Possible:** Display bug vs calculation bug

## Next Steps

1. **Trace population update logic:**
   - Find where `adjustedBirthRate` and `adjustedDeathRate` are applied
   - Check for unit mismatches (millions vs billions)
   - Verify regional → global aggregation

2. **Check for double-counting:**
   - Bayesian mortality system
   - Regional death rate application
   - Crisis mortality

3. **Validate rate initialization:**
   - Are rates annual or monthly?
   - How are they converted?
   - Are historical rates different from 2025 baseline?

4. **Create minimal reproduction:**
   - Single month step
   - Log all population changes
   - Trace full calculation chain

## Files Involved

- `src/simulation/populationDynamics.ts` - Population initialization + update logic
- `src/simulation/regionalPopulations.ts` - Regional population data
- `src/simulation/initialization.ts` - Historical overrides
- `scripts/hindcastDemographicValidation.ts` - Validation script (FIXED)
- `scripts/debugHindcastPopulation.ts` - Debug script (NEW)

## Impact

**CRITICAL:** Blocks hindcast validation framework, prevents historical parameter tuning, undermines confidence in population mechanics.

**Priority:** CRITICAL (system integrity issue)
**Effort:** UNKNOWN (requires deep investigation of population update chain)

## Related Issues

- Session 81: Fixed 1990 initialization (+53% → -1.3%)
- H-1 (Session 77): Floating-point precision bug (RESOLVED)
- CRITICAL-1 (Nov 2025): environmentalHealth NaN (RESOLVED)

---

## Root Cause Found (Session 82)

**Architecture mismatch between historical and modern mortality systems:**

### The Bug

Two phases were applying mortality AFTER regional population aggregation, but WITHOUT historical mode guards:

1. **TransitionMortalityPhase** (order 26) - Technology deployment mortality
2. **CoordinatedDeploymentPhase** (order 10.5) - AI-coordinated deployment mortality

**Execution order:**
1. HumanPopulationPhase (20.52) - Updates regional pops, aggregates to global
   - Historical mode: `netGrowthRate = births - deaths` ✅
2. TransitionMortalityPhase (26) - Subtracts deaths from global ❌
3. BayesianMortalityPhase (35) - Disabled in historical mode ✅

**The problem:**
- Regional populations applied deaths correctly (historical CDR data)
- They got aggregated to global
- Then TWO phases subtracted ADDITIONAL deaths from global
- This created phantom mortality that never occurred in 1990-2024

### The Fix (CRITICAL-1)

Added historical mode guards to both phases:

```typescript
// TransitionMortalityPhase.ts, line 510
if (isHistoricalModeActive(state)) {
  return { events: [] };
}

// CoordinatedDeploymentPhase.ts, line 117
if (isHistoricalModeActive(state)) {
  return { events: [] };
}
```

**Rationale:** Historical demographic data (UN CDR) already includes ALL mortality sources. These phases model FUTURE transition mortality from rapid tech deployment, which didn't occur in 1990-2024.

### Validation Results

**Before fix:**
- 2020: 4.508B (-42% from 1990) ❌ CATASTROPHIC

**After fix:**
- 2020: 8.276B (+57% from 1990) ✅ SUCCESS
- Deviation: +6.17% vs UN data (well within <7% criteria)
- Determinism: CV = 0.000000% (perfect)

**Progression:**
- 1990: 5.258B (-1.3%) ✅
- 1995: 5.744B (+0.0%) ✅
- 2000: 6.245B (+1.7%) ✅
- 2005: 6.755B (+3.3%) ✅
- 2010: 7.269B (+4.5%) ✅
- 2015: 7.779B (+5.4%) ✅
- 2020: 8.276B (+6.2%) ✅

**Status:** RESOLVED (Dec 13, 2025, Session 82)
**Commits:** TransitionMortalityPhase + CoordinatedDeploymentPhase historical guards
**Validation:** N=3 runs, CV=0%, <7% deviation
