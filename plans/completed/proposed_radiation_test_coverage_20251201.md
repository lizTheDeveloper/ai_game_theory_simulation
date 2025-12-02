# Proposed: Radiation Test Coverage Enhancement

**Date:** December 1, 2025
**Priority:** LOW
**Status:** Proposed
**Effort:** 2-3 hours

## Problem Statement

`src/types/radiation.ts` has only 59.60% line coverage - the lowest in the codebase.

**Current state:**
- Lines covered: 59.60%
- Branches covered: 84.62%
- Functions covered: 38.10%
- Uncovered lines: 42-65, 68-69, 75-138, 141-156, 162-183, 186-188, 192-199, 202-205

**Missing coverage areas:**
- Nuclear winter calculations (lines 42-65)
- Cascade effects (lines 75-138)
- Regional fallout patterns (lines 141-156, 162-183)
- Recovery timescales (lines 186-188, 192-205)

## Proposed Solution

Create comprehensive unit tests for radiation mechanics:

### 1. Nuclear Winter Calculations
- Test temperature drop calculations
- Test soot injection volumes
- Test agricultural impact curves
- Test multi-detonation scaling

### 2. Cascade Effects
- Test crop failure thresholds
- Test population mortality from famine
- Test economic collapse triggers
- Test recovery S-curves

### 3. Regional Fallout
- Test wind pattern dispersion
- Test population density weighting
- Test long-term contamination
- Test exclusion zone mechanics

### 4. Recovery Timescales
- Test thermal recovery (months)
- Test agricultural recovery (years)
- Test soil decontamination (decades)
- Test ecosystem restoration (centuries)

## Research Needed

**Existing research (already in codebase):**
- Robock et al. 2007 - Nuclear winter temperature drops
- Toon et al. 2007 - Soot injection calculations
- Xia et al. 2022 - Agricultural impact models

**Additional validation:**
- IPCC radiative forcing constants
- FAO crop failure thresholds
- WHO radiation exposure limits

## Effort Estimate

**Implementation:** 2-3 hours
- Unit test creation: 1.5 hours
- Research validation: 0.5 hours
- Integration testing: 1 hour

**Files affected:**
- `tests/types/radiation.test.ts` (new file, ~400-600 lines)
- No production code changes needed

## Expected Outcome

- Radiation coverage: 59.60% → 90%+ ✅
- Overall coverage: 81.63% → 82%+ (marginal improvement)
- Regression protection for nuclear mechanics
- Documentation of edge cases via tests

## Success Criteria

- [x] All nuclear winter calculations tested
- [x] All cascade effects tested
- [x] All regional fallout patterns tested
- [x] All recovery timescales tested
- [x] Coverage above 90% for radiation.ts
- [x] Type checking passes
- [x] All existing tests still pass

## Notes

**Token efficiency:** This is LOW priority work suitable for when higher priority work is exhausted. Can be executed quickly (<3h) with high value (protection against regressions in nuclear mechanics).

**Alternative approach:** Could combine with regionalBiodiversity.ts test coverage (77.29%) for a "ecosystem mechanics test sprint" that improves both files simultaneously.
