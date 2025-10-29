# Mortality Reporting Bug Fix - October 28, 2025

## Bug Report

**Symptom:** User reported "Total Crisis Deaths: 45009M" (45 BILLION deaths) from 8B starting population over 60 months.

**Initial Hypothesis:** Double-counting - mortality being applied multiple times per month or deaths counted in multiple systems.

## Root Cause Analysis

### Investigation Process

1. **Checked Bayesian Mortality System** (`src/simulation/bayesianMortality.ts`):
   - ✅ `resolveMortality()` called exactly once per month
   - ✅ `mortalityRisks` array cleared after each resolution
   - ✅ No double-counting between `cumulativeCrisisDeaths` and `deathsByCategory`
   - ✅ Population changes match reported deaths exactly

2. **Checked Phase Execution** (`src/simulation/engine/PhaseOrchestrator.ts`):
   - ✅ `BayesianMortalityResolutionPhase` registered only once (order: 35.0)
   - ✅ Executes once per simulation step

3. **Found the Bug** in `logDeathSummary()` (`src/simulation/populationDynamics.ts:1779`):

```typescript
// ❌ BUG (line 1779)
console.log(`Total crisis deaths: ${(pop.cumulativeCrisisDeaths * 1000).toFixed(1)}M`);
```

### The Bug: Unit Conversion Error

**The problem:**
- `cumulativeCrisisDeaths` is stored in **MILLIONS** (see `bayesianMortality.ts:359-360`)
- `logDeathSummary()` multiplied by 1000 and still labeled it "M" (millions)
- This effectively converted MILLIONS → BILLIONS but displayed as "M"

**Example:**
- Actual deaths: 45M (45 million)
- Bug displayed: `45 * 1000 = 45000M` → "45000M" looks like 45 BILLION
- User interpreted this as "45B" deaths from 8B population (impossible!)

### Related Issues

The same function had a second unit inconsistency:
- `deathsByRootCause` stored in BILLIONS (line 373)
- Percentage calculations compared BILLIONS to MILLIONS (line 1766)
- This caused incorrect percentage attributions

## The Fix

### File: `src/simulation/populationDynamics.ts`

**Fix 1: Line 1779-1782 - Remove incorrect multiplication**

```typescript
// BEFORE (BUG)
console.log(`Total crisis deaths: ${(pop.cumulativeCrisisDeaths * 1000).toFixed(1)}M`);
console.log(`Population decline: ${(pop.peakPopulation - pop.population).toFixed(1)}M ...`);

// AFTER (FIXED)
// FIX (Oct 28, 2025): cumulativeCrisisDeaths is ALREADY in millions, don't multiply by 1000
console.log(`Total crisis deaths: ${pop.cumulativeCrisisDeaths.toFixed(1)}M`);
// FIX (Oct 28, 2025): Population is in billions, convert to millions for display
console.log(`Population decline: ${((pop.peakPopulation - pop.population) * 1000).toFixed(1)}M ...`);
```

**Fix 2: Line 1766-1770 - Fix percentage calculation unit consistency**

```typescript
// BEFORE (BUG)
const totalDeaths = Math.max(pop.cumulativeCrisisDeaths, totalProximateDeaths, totalRootCauseDeaths);
// Compared MILLIONS (cumulative) with BILLIONS (rootCause)!

// AFTER (FIXED)
// FIX (Oct 28, 2025): Ensure unit consistency - proximate is in millions, rootCause is in billions
const totalProximateDeaths = ...; // in MILLIONS
const totalRootCauseDeaths = ...; // in BILLIONS
const totalRootCauseDeathsMillions = totalRootCauseDeaths * 1000;
const totalDeaths = Math.max(pop.cumulativeCrisisDeaths, totalProximateDeaths, totalRootCauseDeathsMillions);
// All in MILLIONS now
```

**Fix 3: Line 1803-1823 - Fix rootCause percentage calculations**

```typescript
// BEFORE (BUG)
console.log(`Climate: ${(rootCause.climate * 1000).toFixed(1)}M (${formatPercent(rootCause.climate, totalDeaths)}%)`);
// formatPercent got BILLIONS for value, MILLIONS for total

// AFTER (FIXED)
console.log(`Climate: ${(rootCause.climate * 1000).toFixed(1)}M (${formatPercent(rootCause.climate * 1000, totalDeaths)}%)`);
// formatPercent now gets MILLIONS for both value and total
```

## Validation

### Test 1: Unit Test (`scripts/testBayesianDoubleCounting.ts`)
- ✅ No double-counting: `cumulativeCrisisDeaths` == sum of `deathsByCategory`
- ✅ Population change matches reported deaths exactly

### Test 2: Multi-Month Test (`scripts/testMultiMonthMortality.ts`)
- ✅ Risks cleared after each month (0 risks after resolution)
- ✅ Only 1 risk accumulates per month
- ✅ Deaths accumulate correctly over 5 months

### Test 3: Reporting Fix Test (`scripts/testDeathSummaryFix.ts`)
- ✅ "Total crisis deaths: 601.5M" (correct, not 601500M)
- ✅ All percentages sum to ~100%

### Test 4: Full Validation (`scripts/validateMortalityReporting.ts`)
- ✅ Deaths < starting population (457.8M < 8136M)
- ✅ Reported deaths match actual population loss
- ✅ Death percentage reasonable (5.6% over 10 months at 0.5%/month)
- ✅ `logDeathSummary()` reports correct millions

## Impact

**Before fix:**
- 45M actual deaths displayed as "45000M" (45B)
- Made simulation appear broken (impossible death rates)
- Percentage attributions incorrect due to unit mixing

**After fix:**
- 45M actual deaths displayed as "45.0M"
- Realistic mortality rates (< 10% over 60 months typical)
- Correct percentage attributions

## Files Changed

- `/Users/annhoward/src/superalignmenttoutopia/src/simulation/populationDynamics.ts`
  - Line 1779-1782: Fixed `logDeathSummary()` total deaths display
  - Line 1766-1770: Fixed unit consistency in percentage calculation
  - Line 1803-1823: Fixed rootCause percentage calculations

## Test Files Created

- `scripts/testBayesianDoubleCounting.ts` - Unit test for Bayesian mortality system
- `scripts/testMultiMonthMortality.ts` - Multi-month accumulation test
- `scripts/testDeathSummaryFix.ts` - Reporting function validation
- `scripts/validateMortalityReporting.ts` - Comprehensive validation

## Lessons Learned

1. **Unit consistency is critical** - Mixing BILLIONS and MILLIONS in calculations causes subtle bugs
2. **Label what you display** - If multiplying by 1000, make sure the label is correct
3. **Fail-loudly philosophy works** - Bayesian mortality system's proper error handling made it easy to rule out as the source
4. **Test at multiple levels** - Unit tests (single month), integration tests (multi-month), reporting tests (display)

## Related Issues

None found. This was an isolated reporting bug, not a systemic calculation error.

## References

- Bayesian Mortality System: `src/simulation/bayesianMortality.ts` (Oct 27, 2025)
- Phase Orchestrator: `src/simulation/engine/PhaseOrchestrator.ts`
- Population Dynamics: `src/simulation/populationDynamics.ts`
- Research: `/research/mortality_caps_historical_data_20251027.md` (21 sources)
