# Ocean Acidification Monte Carlo Validation - BLOCKED

**Validator:** Priya (Quantitative Validator)
**Date:** November 28, 2025
**Status:** ❌ **BLOCKED - Critical Assertion Bug**

---

## Executive Summary

**VALIDATION BLOCKED:** Cannot complete Monte Carlo validation due to assertion failure on month 0.

**Root Cause:** Incorrect assertion type used in `ResourceWaterPhase.ts` line 85.

**Impact:** All Monte Carlo runs crash immediately, preventing calibration validation.

**Severity:** **CRITICAL** - Blocks all testing and deployment.

---

## Bug Report

### CRITICAL: Assertion Type Mismatch

**Location:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/engine/phases/ResourceWaterPhase.ts:85-89`

**Error Message:**
```
❌ Out-of-range value in ResourceWaterPhase.execute (pre-ocean)
   aragoniteSaturation (probability) = 2.8
   Valid range: [0, 1]
   Month: 0
```

**Incorrect Code:**
```typescript
assertProbability(state.oceanAcidificationSystem.aragoniteSaturation, {
  location: 'ResourceWaterPhase.execute (pre-ocean)',
  valueName: 'aragoniteSaturation',
  month: state.currentMonth
});
```

**Problem:** `aragoniteSaturation` is NOT a probability. It's a chemical ratio (Ωar) that represents the saturation state of aragonite in seawater.

**Valid Range:** 1.0 to 5.0 (approximately)
- Pre-industrial: Ωar = 4.6
- Current (2025): Ωar = 2.8-3.3
- Collapse threshold: Ωar < 2.0
- Dissolution: Ωar < 1.0

**Correct Fix:**
```typescript
assertInRange(state.oceanAcidificationSystem.aragoniteSaturation, 1.0, 5.0, {
  location: 'ResourceWaterPhase.execute (pre-ocean)',
  valueName: 'aragoniteSaturation',
  month: state.currentMonth
});
```

**Why This Happened:** Defensive coding sprint added assertions without domain knowledge. `aragoniteSaturation` sounds like it might be a percentage/probability, but it's actually a dimensionless chemical ratio.

---

## Validation Tasks Blocked

Cannot proceed with validation until bug is fixed:

- ❌ **Timeline Validation** - No runs complete
- ❌ **Coral Loss at Month 300** - No data
- ❌ **Coral Loss at Month 900** - No data
- ❌ **pH Trajectory** - No data
- ❌ **Fisheries Power Law** - No data
- ❌ **Population Stability** - No data
- ❌ **Determinism Check (CV)** - No data

---

## Research Benchmarks (Ready to Validate)

Once bug is fixed, will validate against:

### 1. Coral Loss Timeline
- **2050 (month 300):** 70-90% loss under SSP5-8.5 (IPCC AR6)
- **2100 (month 900):** >99% loss under SSP5-8.5 (very high confidence)
- **Expected in simulation:** 10-30% health at month 300, <1% at month 900

### 2. pH Trajectory
- **2025 (month 0):** pH = 7.95
- **2100 (month 900):** pH = 7.68-7.71 under SSP5-8.5
- **Expected decline:** Δ = -0.24 to -0.27 over 900 months

### 3. Fisheries Power Law
- **Function:** `yield = (coralHealth / 100)^1.2` (calibrated from 1.5)
- **Expected R²:** > 0.90 (fisheries track coral health closely)
- **Validation:** Scatter plot + correlation analysis

### 4. Population Stability
- **Floor:** 10M people (calibrated from 1M)
- **Expected:** No extinction before month 900
- **No assertion failures** in population aggregation

### 5. Determinism
- **Expected CV:** < 0.01% across runs with same seed
- **Method:** Run N=10 with seeds 42000-42009, measure coefficient of variation

---

## Immediate Action Required

**Owner:** Roy (Simulation Maintainer)

**Fix Required:**
1. Change line 85 in `ResourceWaterPhase.ts`:
   ```typescript
   // BEFORE (WRONG):
   assertProbability(state.oceanAcidificationSystem.aragoniteSaturation, {...});

   // AFTER (CORRECT):
   assertInRange(state.oceanAcidificationSystem.aragoniteSaturation, 1.0, 5.0, {...});
   ```

2. Verify no other ocean acidification fields are using wrong assertion types:
   - `pH` → should be `assertInRange(7.5, 8.3)` ✅ (if validated)
   - `pHLevel` → should be `assertProbability()` ✅ (legacy 0-1 scale)
   - `aragoniteSaturation` → should be `assertInRange(1.0, 5.0)` ❌ **FIX THIS**
   - `coralReefHealth` → should be `assertInRange(0, 100)` ✅ (percentage)
   - `shellfishPopulation` → should be `assertProbability()` ✅ (0-1 scale)

3. Run quick smoke test:
   ```bash
   npx tsx scripts/monteCarloSimulation.ts --runs=1 --max-months=12
   ```

4. If smoke test passes, notify Priya for full validation run.

---

## Expected Validation Timeline

**After bug fix:**
- Roy fixes assertion: 5-10 minutes
- Smoke test (1 run × 12 months): 2 minutes
- Full Monte Carlo (10 runs × 900 months): 2-4 hours
- Priya analysis: 30-60 minutes
- **Total:** ~3-5 hours from fix to validation report

---

## Lessons Learned

**Defensive Coding Insight:**

Assertion utilities are type-safe guards, but they require **domain knowledge** to use correctly:

- ✅ `assertProbability()` → Use for 0-1 scales (probabilities, percentages as decimals)
- ✅ `assertInRange(min, max)` → Use for domain-specific ranges (pH, Ωar, temperatures)
- ✅ `assertFinite()` → Use when any finite number is valid (delta values, rates)

**Anti-pattern:** Copy-paste assertions without understanding the domain variable.

**Fix:** Add comments documenting expected ranges for ambiguous fields:
```typescript
aragoniteSaturation: 2.8,  // Ωar ratio: 1.0 (dissolution) to 5.0 (pre-industrial 4.6)
```

---

## Status

**BLOCKED** until assertion bug is fixed.

Priya standing by for full validation run once Roy deploys fix.

---

**Next Steps:**
1. Roy fixes assertion type mismatch
2. Roy runs smoke test (1 run × 12 months)
3. Roy notifies Priya when ready
4. Priya runs full Monte Carlo (10 runs × 900 months)
5. Priya delivers validation report with PASS/FAIL/CONDITIONAL verdict
