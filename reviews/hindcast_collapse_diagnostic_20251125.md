# Hindcast Population Collapse Diagnostic (Nov 25, 2025)

**Problem:** Hindcast validation (1990-2024) shows catastrophic population decline instead of expected 6-10% overshoot.

## Evidence

**Expected (historical reality):**
- 1990: 5.32B → 2024: 8.12B (+53% growth)

**Simulated (10 runs, Nov 25 2025):**
- 2024 population range: 0.84B to 3.92B
- Average deviation: **74.6%** (most runs 76-90% below actual)
- Outcome distribution: 5 decline, 3 stalemate, 2 utopia
- Temperature overshoot: 2.1-3.6C (actual: 1.28C)
- Biodiversity collapse: 0.006-0.10 (actual: 0.49)

## Root Cause Analysis

### 1. ExogenousShockPhase: WORKING CORRECTLY ✅
- **Location:** `src/simulation/engine/phases/ExogenousShockPhase.ts:1235`
- **Check:** `if (state.config.scenarioMode === 'historical')` → skips random shocks
- **Status:** Historical mode protection is active and working

### 2. HumanSurvivalSystemPhase: WORKING CORRECTLY ✅
- **Location:** `src/simulation/engine/phases/HumanSurvivalSystemPhase.ts:85`
- **Check:** `if (state.config?.scenarioMode === 'historical' && state.currentYear < 2020)` → skips
- **Status:** Skipping properly before 2020

### 3. Temperature System: LIKELY CAUSE ⚠️
- **Problem:** Temperature spiking to 2.1-3.6C when historical value is 1.28C
- **Impact:** Extreme temperature → environmental collapse → population mortality
- **Next step:** Check if temperature lock is working properly in historical mode

### 4. Mortality System: CONTRIBUTING FACTOR ⚠️
- **Short-term check (Month 0):** Shows 2.4M deaths (0.05%), reasonable for 1990
- **Long-term problem:** Something is causing cumulative death spiral over 408 months
- **Hypothesis:** Environmental crises (triggered by temperature overshoot) → excess mortality

### 5. Regional Population System: UNKNOWN ❓
- **Architecture:** Births handled entirely by `updateRegionalPopulations()`
- **Question:** Is historical birth rate scaling (CBR) being applied correctly?
- **Need to check:** `getHistoricalCrudeBirthRate()` and `getRegionalHistoricalBirthRate()`

## Diagnostic Observations

**From 12-month diagnostic run (1990-1991):**
- Population: 5.32B → 5.20B (small decline, ~2%)
- Baseline mortality: 9.3/1000 CDR (correct for 1990)
- Deaths month 0: 2.4M (reasonable)
- **Conclusion:** Early months are NOT the problem

**Inference:** The collapse happens later in the hindcast (likely 2000-2020 period) when environmental systems start breaking down.

## Likely Failure Cascade

**Hypothesis:**
1. Temperature NOT locked properly → spikes to 2-3C
2. High temperature → planetary boundaries crossed
3. Planetary boundaries → environmental crises detected
4. Environmental crises → excess mortality via Bayesian system
5. Population decline → economic contraction → positive feedback loop

## Next Steps (Priority Order)

### CRITICAL-1: Temperature Lock Verification
**File:** `src/simulation/engine/phases/EnvironmentalSystemPhase.ts` (or wherever CO2/temp is updated)
**Check:** Is temperature being locked to historical equilibrium in hindcast mode?
**Expected:** `if (state.config.scenarioMode === 'historical') { lockTemperature(historicalValue); }`

### CRITICAL-2: Crisis Detection in Historical Mode
**File:** `src/simulation/engine/phases/CrisisDetectionPhase.ts`
**Check:** Should crises be detected in historical mode, or only actual historical crises?
**Question:** If temperature is 3C (wrong), should simulation detect environmental crises, or use actual historical crisis data?

### HIGH-1: Birth Rate Application
**File:** `src/simulation/regionalPopulations.ts`
**Check:** Verify `getHistoricalCrudeBirthRate()` is being applied correctly
**Expected:** 1990 CBR = 24.3/1000 → births should roughly balance deaths

### HIGH-2: Mortality Sources
**Run:** 34-month (1990-1993) hindcast with VERBOSE logging of mortality sources
**Goal:** Identify which mortality risks are accumulating (war? famine? disease? environmental?)

### MEDIUM-1: GDP/Economic System
**Check:** Is GDP initialized correctly for 1990 (22.6T actual)?
**Impact:** GDP affects carrying capacity, which affects famine risk

## Code Locations

**Key files to investigate:**
- `src/simulation/engine/phases/EnvironmentalSystemPhase.ts` - Temperature evolution
- `src/simulation/engine/phases/CrisisDetectionPhase.ts` - Crisis triggers
- `src/simulation/regionalPopulations.ts` - Birth rate application
- `src/simulation/bayesianMortality.ts` - Mortality aggregation
- `src/simulation/historicalInitialization.ts` - 1990 state setup

## Temporary Workaround

**NOT RECOMMENDED** but if needed for urgent testing:
- Could add a hard population floor in historical mode
- Would mask the root cause, not fix it

## ROOT CAUSE IDENTIFIED ✅

**Location:** `src/simulation/resourceDepletion.ts` lines 1111-1158

**The Bug:**
```typescript
// Line 1186 in historicalInitialization.ts
baseState.resourceEconomy.co2.hindcastTransitionMonths = 120; // 10 years lock

// Lines 1114-1157 in resourceDepletion.ts
if (state.currentMonth < co2.hindcastTransitionMonths) {
  // LOCKED: Temperature = 0.45C (1990 baseline)
} else {
  // UNLOCKED: Temperature = equilibriumTemp * 0.75 + historicalTarget * 0.25
  // This allows temperature to spike to 2-3C!
}
```

**Timeline of Failure:**
1. **Months 0-119 (1990-1999):** Temperature locked to 0.45C ✅ Working correctly
2. **Month 120 (2000):** Lock expires, switches to "lagged equilibrium" formula
3. **Months 120-407 (2000-2024):** Temperature follows CO2 equilibrium (2-3.6C) instead of historical values (1.28C)
4. **Result:** High temperature → tipping points triggered → environmental collapse → excess mortality → population crash

**Why 120 months?**
Comment says: "For 1990-2010 hindcast (20 years), lock for first 120 months (10 years)"

But the actual hindcast runs 1990-2024 (408 months), not 1990-2010!

**The Fix:**
Temperature should be locked to HISTORICAL VALUES for the ENTIRE hindcast period, OR should interpolate between actual historical checkpoints (1990: 0.45C, 2000: 0.60C, 2010: 0.85C, 2024: 1.28C).

---

## Recommended Fix

**Option 1 (Simple):** Extend lock to full hindcast duration
```typescript
// In historicalInitialization.ts line 186
const hindcastDuration = (endYear - startYear) * 12; // Full period
baseState.resourceEconomy.co2.hindcastTransitionMonths = hindcastDuration;
```

**Option 2 (Accurate):** Interpolate between historical checkpoints
```typescript
// In resourceDepletion.ts, replace lines 1111-1158
if (state.config.scenarioMode === 'historical') {
  co2.temperatureAnomaly = getHistoricalTemperature(state.currentYear);
}
```

Where `getHistoricalTemperature()` interpolates between known values:
- 1990: 0.45C
- 2000: 0.60C
- 2010: 0.85C
- 2024: 1.28C

**Option 3 (Research-backed):** Model ocean thermal inertia explicitly
- Use observed warming rate: (1.28 - 0.45) / 34 years = 0.024C/year
- Cap temperature rise at historical rates regardless of CO2
- This preserves realism while allowing model validation

---

## Status

**Diagnostic run:** Complete ✅
**Root cause:** IDENTIFIED ✅ (Temperature lock expires after 120 months)
**Regression:** Yes (hindcast was designed for 240 months, now running 408 months)
**Fix complexity:** Low (one-line change for Option 1, ~20 lines for Option 2)

---

**Next action:** Choose fix option and implement temperature correction.
