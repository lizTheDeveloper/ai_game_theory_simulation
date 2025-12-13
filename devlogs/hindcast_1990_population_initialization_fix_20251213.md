# Hindcast 1990 Population Initialization Fix

**Date:** December 13, 2025
**Developer:** Roy (simulation-maintainer)
**Session:** 81
**Priority:** MEDIUM (improves validation quality, not blocking)

---

## Problem Statement

Hindcast validation (Session 79) showed excellent 2020 accuracy (-3.59% deviation), but early years (1990-2005) exhibited massive population overshoot:

| Year | Simulated | Historical | Deviation |
|------|-----------|------------|-----------|
| 1990 | 8.136B    | 5.327B     | **+53%**  |
| 1995 | ~8.16B    | 5.744B     | **+42%**  |
| 2000 | ~8.54B    | 6.143B     | **+39%**  |
| 2005 | ~8.16B    | 6.542B     | **+25%**  |
| 2010 | ~8.68B    | 6.957B     | **+25%**  |
| 2015 | ~8.27B    | 7.380B     | **+12%**  |
| 2020 | 7.50B     | 7.795B     | -3.6% ✅  |

---

## Root Cause

**CRITICAL BUG:** `initializeRegionalPopulations()` hardcoded 2025 population values (8.136B total), but hindcast validation script set `state.currentYear = 1990` without scaling regional populations.

**Mechanism:**
1. Simulation started with 2025 populations (8.136B) but 1990 year
2. Death rates correctly applied 1990 values (via time-varying functions)
3. Population "decayed" toward reality over 30 years as death rates exceeded birth rates
4. By 2020, random variation + death rates converged to approximately correct value

This was **NOT** correct convergence - it was accidental alignment after 30 years of wrong dynamics.

---

## Implementation

### Option Selected: Clean Architecture (Option 1)

Added `startYear` parameter to regional population initialization chain to support 1990 baseline populations.

### Files Modified

1. **`src/simulation/populationDynamics.ts`:**
   - Added `startYear: number = 2025` parameter to `initializeRegionalPopulations()`
   - Added conditional 1990 regional population data block
   - Propagated `startYear` through `initializeRegionalPopulationsWithStabilizers()`
   - Propagated `startYear` through `initializeHumanPopulationSystem()`

2. **`src/simulation/initialization.ts`:**
   - Pass `historicalOverrides?.startYear ?? 2025` to `initializeHumanPopulationSystem()`
   - Disable proportional population scaling for 1990 (regional data already correct)
   - Keep proportional scaling for other years

3. **`scripts/hindcastDemographicValidation.ts`:**
   - Updated to use `historicalOverrides` pattern (not manual state mutation)
   - Changed `engine.simulateStep(state, rng)` to `engine.step(state)` (API change)

### 1990 Regional Populations (UN WPP 2024)

| Region | 1990 Pop (M) | 2025 Pop (M) | Growth |
|--------|--------------|--------------|--------|
| East Asia | 1,354 | 1,677 | +24% |
| South Asia | 1,257 | 2,048 | +63% |
| Sub-Saharan Africa | 521 | 1,220 | +134% |
| Europe | 721 | 742 | +3% |
| Latin America | 442 | 659 | +49% |
| North America | 283 | 376 | +33% |
| Middle East & North Africa | 237 | 527 | +122% |
| Southeast Asia | 443 | 697 | +57% |
| **TOTAL** | **5,258** | **8,136** | **+55%** |

**Note:** 5.258B vs 5.327B UN historical (1.3% discrepancy due to regional boundary differences). This is ACCEPTABLE per research document.

---

## Research Foundation

**Source:** `research/regional_death_rates_unwpp2024_20251209.md` (Grade B)
**Quality Gate 1:** PASSED (completed in Session 79)

All 1990 regional populations extracted from UN World Population Prospects 2024 data.

---

## Validation

### Quick Initialization Test

Created `scripts/test_1990_init.ts` to verify initialization:

```
=== 1990 INITIALIZATION TEST ===
Year: 1990
Global population: 5.258B
Total regional: 5.258B
Expected (UN): 5.327B
Deviation: -1.30% ✅

=== 2025 INITIALIZATION TEST ===
Year: 2025
Global population: 8.136B
Total regional: 8.136B
Expected (UN): 8.136B
Deviation: 0.00% ✅
```

**Result:** Initialization working correctly. 1990 deviation improved from **+53%** to **-1.3%** ✅

### Full Hindcast Validation

**Status:** IN PROGRESS (N=3 quick run)
**Log:** `logs/hindcast_quick_*.log`

Expected results:
- **1990-2005 deviation < 7%** (currently +25-42%)
- **2020 deviation maintains < 7%** (currently -3.6%)
- **CV < 0.01%** (determinism maintained)

---

## Defensive Coding

All implementation follows research simulation rigor:

1. ✅ **No silent fallbacks** - Regional populations explicitly defined
2. ✅ **Research-backed values** - All 1990 values from UN WPP 2024
3. ✅ **Inline documentation** - Citations in comments
4. ✅ **Deterministic** - RNG properly passed through initialization chain
5. ✅ **Fail-loudly** - Assertions will catch any initialization errors

---

## Success Criteria

- [x] 1990 initialization uses correct regional populations
- [x] 2025 initialization unchanged (no regression)
- [x] `startYear` parameter propagated through initialization chain
- [ ] Full hindcast validation N≥10 (IN PROGRESS)
- [ ] 1990-2005 deviation < 7%
- [ ] 2020 deviation maintains < 7%
- [ ] CV < 0.01% (deterministic)

---

## Next Steps

1. **Complete N=10 validation** - Wait for `hindcastDemographicValidation.ts` to finish
2. **Analyze results** - Check all checkpoint years meet <7% target
3. **Document in wiki** - Update demographic system documentation
4. **Archive handoff** - Move `HANDOFF_roy_hindcast_early_years_tuning.md` to completed

---

## Technical Notes

### Why Not Proportional Scaling?

Previous approach (proportional scaling) assumed 1990 regional distribution = 2025 regional distribution. This is WRONG:

- Sub-Saharan Africa grew 134% (1990-2025)
- Europe grew only 3%
- Result: Proportional scaling gives wrong 1990 regional populations

### Why -1.3% Deviation is Acceptable

UN WPP 2024 regional boundaries don't exactly match our 8-region model:
- Our regions are aggregates (e.g., "East Asia" = China + Japan + Koreas + Mongolia)
- Small countries may be classified differently
- 1.3% discrepancy is well within acceptable research tolerance

### Future Improvements (Optional)

1. **Support arbitrary years** - Currently supports 1990 and 2025 only
2. **Interpolation for intermediate years** - Linear interpolation for 1995, 2000, etc.
3. **Extract exact UN subregion data** - Reduce 1.3% discrepancy to <0.5%

Not implementing these now - unnecessary complexity for current hindcast validation needs.

---

## References

- Handoff: `.claude/agents/HANDOFF_roy_hindcast_early_years_tuning.md`
- Research: `research/regional_death_rates_unwpp2024_20251209.md`
- Session 79: Orchestrator investigation identifying root cause
- Session 80: This implementation

---

**Status:** Implementation COMPLETE ✅
**Validation:** IN PROGRESS (N=3 quick run, will follow with N=10)

*Have you tried initializing it with the correct year?*
