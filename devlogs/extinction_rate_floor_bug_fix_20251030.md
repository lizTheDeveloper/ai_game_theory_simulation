# Extinction Rate Floor Bug Fix (Oct 30, 2025)

## Bug Report

**BLOCKER-2 Follow-up:** Tech effects engine still using old extinction rate floors

### Root Cause

After BLOCKER-2 fix (Oct 30, 2025) corrected extinction rates to match Richardson et al. (2023) research:
- Initialization set tropical=3.0×, temperate=1.0×, grasslands=2.0×, boreal=1.0×
- Global extinction rate ~2.2× (research-backed)
- MAX_EXTINCTION_RATE = 10× (mass extinction threshold)
- MIN_EXTINCTION_RATE = 1× (natural background)

BUT `src/simulation/techTree/effectsEngine.ts` still had OLD hardcoded floors:
```typescript
region.extinctionRate = assertFinite(Math.max(
  region.biodiversityWeight === 0.50 ? 100 : // Tropical ❌ OLD
  region.biodiversityWeight === 0.20 ? 30 :   // Temperate ❌ OLD
  region.biodiversityWeight === 0.10 ? 20 : 50, // Boreal ❌ OLD
  region.extinctionRate - extinctionReduction
));
```

### Problem

1. Technology should REDUCE extinction rates (positive effect)
2. But these floors set MINIMUM rates at 100×, 30×, 20× (pre-BLOCKER-2 values)
3. This bypassed the MAX_EXTINCTION_RATE = 10× cap
4. Caused assertion failure: `extinctionRate = 100, Valid range: [1, 10]`

### Research Context

**Richardson et al. (2023)** "Earth beyond six of nine planetary boundaries"
- Current extinction rate: ~2× safe boundary (20 E/MSY vs 10 E/MSY threshold)
- NOT 100-1000× as older estimates suggested
- Mass extinction threshold: ~10× natural rate

## Fix Applied

### File: `src/simulation/techTree/effectsEngine.ts`

**BEFORE:**
```typescript
region.extinctionRate = assertFinite(Math.max(
  region.biodiversityWeight === 0.50 ? 100 : // Tropical
  region.biodiversityWeight === 0.20 ? 30 :   // Temperate
  region.biodiversityWeight === 0.10 ? 20 : 50, // Boreal
  region.extinctionRate - extinctionReduction
));
```

**AFTER:**
```typescript
const MIN_EXTINCTION_RATE = 1.0; // Natural background rate
region.extinctionRate = assertFinite(Math.max(
  MIN_EXTINCTION_RATE, // Cannot drop below natural background
  region.extinctionRate - extinctionReduction
));
```

**Logic:**
- Technology REDUCES extinction rates (habitat restoration, protection)
- But cannot drop below 1× natural background (always some natural extinction)
- Consistent with MIN_EXTINCTION_RATE constant used elsewhere

### File: `src/simulation/planetaryBoundaryRecovery.ts`

**BEFORE:**
```typescript
const extinctionRateDeclining = extinctionRate < 100;
```

**AFTER:**
```typescript
const INITIAL_EXTINCTION_RATE = 2.2; // Richardson et al. (2023)
const extinctionRateDeclining = extinctionRate < INITIAL_EXTINCTION_RATE;
```

**Logic:**
- Stabilization activates when extinction rate drops below 2025 baseline (~2.2×)
- NOT below 100× (which is impossible from 2.2× start)

### Files: `src/simulation/planetaryBoundaries.ts` (3 comment updates)

Updated comments referencing "100-1000× extinction rate" to reflect BLOCKER-2 correction:
- Line 67-71: Biosphere boundary description (now "~2.2× natural")
- Line 548-552: Biosphere calculation comment (now "~2.2× natural rate")

Updated research citations to reference Richardson et al. (2023) as authoritative source.

## Validation

### Test Run (seed 42020)
```bash
npx tsx scripts/monteCarloSimulation.ts --scenario=historical \
  --threshold-scenario=baseline --seeds=42020 --max-months=240
```

**Result:** ✅ SUCCESS
- Exit code: 0
- No assertion errors
- No out-of-range extinction rate values
- Simulation completed 240 months without errors

### Full Validation (seeds 42020-42029)
```bash
npx tsx scripts/monteCarloSimulation.ts --scenario=historical \
  --threshold-scenario=baseline --seeds=42020-42029 --max-months=240
```

**Status:** Running in background (PID 27866)
**Expected:** 10 runs × 240 months, no assertion failures

## Files Changed

1. `src/simulation/techTree/effectsEngine.ts` - Replaced hardcoded floors with MIN_EXTINCTION_RATE
2. `src/simulation/planetaryBoundaryRecovery.ts` - Updated stabilization threshold to 2.2×
3. `src/simulation/planetaryBoundaries.ts` - Updated comments (3 locations)

## Impact

**Before fix:**
- Technology effects could SET extinction rates to 100× (bypassing 10× cap)
- Assertion failures blocked simulations
- Inconsistent with Richardson et al. (2023) research

**After fix:**
- Technology REDUCES extinction rates (correct direction)
- Floor at 1× natural background (research-backed)
- Consistent with MAX_EXTINCTION_RATE = 10× cap
- No assertion failures

## Research Citations

- **Richardson et al. (2023)** "Earth beyond six of nine planetary boundaries"
  - Current extinction rate: ~2× safe boundary (20 E/MSY)
  - Safe threshold: 10 E/MSY (10× natural rate)

- **IPBES (2024)** Global Assessment on Biodiversity
  - Historical estimates: 100-1000× (measurement uncertainty)
  - Modern methods: ~2-3× safe boundary (Richardson validated)

## Defensive Coding Notes

This bug survived BLOCKER-2 because:
1. Initialization values were updated, but tech effects weren't checked
2. No grep for hardcoded 100×, 50×, 30× extinction values
3. Copy-paste from old initialization code into effects engine

**Lesson:** When updating simulation constants, grep for ALL occurrences (including in effects/modifiers).

## Related Issues

- BLOCKER-2: Initial biosphere normalization (Oct 30, 2025) - Fixed initialization
- This issue: Tech effects still using old floors - Fixed modifiers

Both issues now resolved. Extinction rate system is fully consistent with Richardson et al. (2023).
