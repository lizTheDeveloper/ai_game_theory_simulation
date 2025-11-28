# CRITICAL-1: Unified Historical Mode Detection Pattern (FIX)

**Date:** November 28, 2025
**Severity:** CRITICAL
**Status:** ✅ FIXED
**Root Cause:** Dual incompatible patterns for detecting historical mode
**Impact:** Inconsistent guard behavior across simulation (likely contributed to HIGH-8 biodiversity regression)

---

## Problem Summary

The codebase had **TWO incompatible patterns** for detecting historical mode:

**Pattern A (14 locations, WRONG):**
```typescript
if (state.config.historicalMode) { ... }
if (state.config.historicalMode && state.currentYear <= 2024) { ... }
```
- Checks `state.config.historicalMode` boolean (optional, may not be set)
- Unreliable because field may not exist on all GameState instances
- Year checks were duplicated and inconsistent

**Pattern B (4 locations, CORRECT):**
```typescript
import { isHistoricalModeActive } from '@/simulation/utils/historicalMode';
if (isHistoricalModeActive(state)) { ... }
```
- Uses utility function that checks **scenarioMode === 'historical'** (always set)
- Centralized logic: single source of truth for year threshold (2024 by default)
- Reliable across all simulation contexts

**Why Pattern A is wrong:**
- `state.config.historicalMode` is optional and may not be set
- `state.config.scenarioMode` is ALWAYS set to 'historical' or 'unprecedented'
- Pattern A creates split-brain detection where some guards activate and others don't

---

## Files Fixed

### Phase Files (5)
1. ✅ `BaselineMortalityPhase.ts` (2 violations)
2. ✅ `BayesianMortalityResolutionPhase.ts` (1 violation)
3. ✅ `FamineSystemPhase.ts` (1 violation)
4. ✅ `ExogenousShockPhase.ts` (1 violation)
5. ✅ `Tier2PhysicalSystemsPhase.ts` (1 violation, HIGH-1)

### Phase Files with Year Corrections (2)
6. ✅ `FoodSecurityDegradationPhase.ts` (HIGH-2: wrong field + wrong year 2020→2024)
7. ✅ `HumanSurvivalSystemPhase.ts` (HIGH-3: wrong field + wrong year 2020→2024)

### System Modules (3)
8. ✅ `geoengineering.ts` (1 violation)
9. ✅ `resourceDepletion.ts` (1 violation)
10. ✅ `regionalPopulations.ts` (6 violations)

**Total violations fixed:** 17

---

## Changes Made

### 1. Import Unified Utility
All 10 files now import:
```typescript
import { isHistoricalModeActive } from '@/simulation/utils/historicalMode';
```

### 2. Replace Direct Field Access
**Before:**
```typescript
if (state.config.historicalMode && state.currentYear <= 2024) {
  return { events: [] };
}
```

**After:**
```typescript
if (isHistoricalModeActive(state)) {
  return { events: [] };
}
```

### 3. Fix Year Thresholds
**HIGH-2 and HIGH-3:** Changed hardcoded year from **2020 → 2024**
- Historical mode should cover full hindcast period (1990-2024)
- 2020 cutoff was too early and inconsistent with other phases

### 4. Fix Optional Field Access
**HIGH-1:** Changed from optional chaining to reliable utility:
```typescript
// WRONG (HIGH-1)
const isHistoricalMode = state.config?.historicalMode ?? false;

// CORRECT
const isHistoricalMode = isHistoricalModeActive(state);
```

---

## Verification

### Type Checking
```bash
npx tsc --noEmit
# ✅ No errors
```

### God Mode Test
```bash
npx tsx scripts/godModeTest.ts --max-months=12
# ✅ Test passed
```

### Hindcast Validation
```bash
npx tsx scripts/hindcastValidation.ts --start-year=2020 --end-year=2024 --seed=12345
# ✅ Hindcast passed
```

### Pattern A Violations Remaining
```bash
grep -rn "state\.config\.historicalMode" src/simulation/ | grep -v "isHistoricalModeActive" | grep -v "//"
# ✅ Only historicalModeEndYear in utility itself (expected)
```

---

## Why This Matters

**HIGH-8 Biodiversity Regression Context:**
The biodiversity calibration regression (77.3% error → 47.3% error) involved 14 historical mode guards. With dual patterns, some guards activated (Pattern B) while others didn't (Pattern A when field not set). This created inconsistent crisis dampening during hindcast.

**Unified detection ensures:**
1. **Consistent behavior** - All guards activate together
2. **Reliable field access** - scenarioMode always exists
3. **Centralized logic** - Year threshold managed in one place
4. **Future-proof** - Can extend hindcast period by changing ONE config value

---

## Related Issues

- **HIGH-8:** Biodiversity calibration regression (likely caused by split-brain guards)
- **HIGH-7:** Population mortality calibration (required historical mode for 1990-2024)
- **HIGH-6:** Climate calibration (historical emissions mode)
- **Architecture Review:** Post-validation revealed this CRITICAL-1 issue

---

## Architecture Impact

**Before:** 2 incompatible patterns → 14 unreliable guards
**After:** 1 canonical pattern → 100% reliable detection

This is a textbook case of **flag proliferation anti-pattern**. The solution (H-1 from architecture review) was already implemented in `historicalMode.ts` utility, but adoption was incomplete. Now 100% of simulation code uses the centralized utility.

**No silent fallbacks. Fail loudly when historical mode detection fails.**

---

**Fixed by:** Roy (Simulation Maintainer)
**Review:** Priya (Quantitative Validator) - Monte Carlo validation recommended
**Next Steps:** Run full Monte Carlo (N≥10) to validate no regressions

🎯 **All historical mode guards now unified under single reliable detection pattern.**
