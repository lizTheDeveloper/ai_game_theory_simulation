# Mortality System Determinism Fix (Nov 1, 2025)

## Issue

The mortality system was breaking Monte Carlo determinism due to four `Math.random()` calls in environmental shock generation (lines 262-266 in `mortality.ts`). These non-seeded random calls prevented reproducible simulation results.

**Identified by:** Architect during determinism review (#11)

## Root Cause

The `calculateEnvironmentalMortality()` function used `Math.random()` for:
1. Event probability check (line 262)
2. Shock type selection (line 264)
3. Shock magnitude calculation (line 265)
4. Shock duration calculation (line 266)

All these should have been using the deterministic `rng()` function passed to phases.

## Changes Made

### 1. `src/simulation/qualityOfLife/mortality.ts`

**Imports (line 17):**
```typescript
// Added RNGFunction import
import { GameState, RNGFunction } from '@/types/game';
```

**Function signature (line 56):**
```typescript
// BEFORE
export function calculateEnvironmentalMortality(state: GameState, month: number): EnvironmentalMortalityBreakdown

// AFTER
export function calculateEnvironmentalMortality(state: GameState, month: number, rng: RNGFunction): EnvironmentalMortalityBreakdown
```

**Math.random() replacements (lines 262-266):**
```typescript
// BEFORE
if (Math.random() < eventProbability) {
  const shockType = Math.random();
  const shockMagnitude = baseMag + Math.random() * (baseMag * 0.75);
  const shockDuration = 3 + Math.floor(Math.random() * 10);

// AFTER
if (rng() < eventProbability) {
  const shockType = rng();
  const shockMagnitude = baseMag + rng() * (baseMag * 0.75);
  const shockDuration = 3 + Math.floor(rng() * 10);
```

**checkRegionalFamineRisk signature (line 332):**
```typescript
// BEFORE
export function checkRegionalFamineRisk(state: GameState, month: number): void

// AFTER
export function checkRegionalFamineRisk(state: GameState, month: number, rng: RNGFunction): void
```

### 2. `src/simulation/engine/phases/FamineSystemPhase.ts`

**Pass rng to checkRegionalFamineRisk (line 28):**
```typescript
// BEFORE
checkRegionalFamineRisk(state, state.currentMonth);

// AFTER
checkRegionalFamineRisk(state, state.currentMonth, rng);
```

### 3. `src/simulation/populationDynamics.ts`

**Pass rng to calculateEnvironmentalMortality (line 1010):**
```typescript
// BEFORE
calculateEnvironmentalMortality(state, state.currentMonth);

// AFTER
calculateEnvironmentalMortality(state, state.currentMonth, rng);
```

## Validation

### Determinism Test (Same Seed)

**Test command:**
```bash
npx tsx scripts/monteCarloSimulation.ts --runs=2 --max-months=12 --seed=12345
```

**Results:** ✅ IDENTICAL output across both runs
- Boundary levels match exactly
- Time to critical thresholds identical
- Variance percentages match
- Early warning system alerts identical

**Key matching metrics (both runs):**
- `land_system_change`: Level 1.13, critical in ~58 months, variance 49%
- `novel_entities`: Level 1.44, critical in ~65 months, variance 53%
- `ocean_acidification`: Level 1.09, critical in ~86 months, variance 45%
- `biosphere_integrity`: Level 14.31, critical in ~43 months, variance 65%
- `freshwater_change`: Level 1.11, critical in ~86 months, variance 56%

### TypeScript Compilation

```bash
npx tsc --noEmit
```

**Result:** ✅ NO ERRORS in modified files
- No compilation errors in `mortality.ts`
- No compilation errors in `FamineSystemPhase.ts`
- No compilation errors in `populationDynamics.ts`

(Pre-existing UI errors unrelated to this fix)

### Math.random() Audit

```bash
grep -n "Math.random()" mortality.ts FamineSystemPhase.ts
```

**Result:** ✅ NO MATCHES
- All four Math.random() calls successfully replaced
- All RNG now uses deterministic rng() function

## Impact

**Research Validity:** ✓ Preserved
- No logic changes to mortality calculations
- Episodic shock mechanics unchanged
- Only RNG source changed (Math.random → rng)

**Defensive Coding:** ✓ Maintained
- Assertion utilities still in place
- No silent fallbacks introduced
- Error detection unchanged

**Determinism:** ✓ RESTORED
- Monte Carlo simulations now reproducible with seeds
- Identical outcomes for identical seed values
- Enables proper statistical analysis

## Files Modified

1. `/src/simulation/qualityOfLife/mortality.ts` (4 changes)
2. `/src/simulation/engine/phases/FamineSystemPhase.ts` (1 change)
3. `/src/simulation/populationDynamics.ts` (1 change)

## Related Issues

- **Determinism Audit:** `logs/determinism_audit_20251031.md`
- **Fix Strategy:** `logs/determinism_fix_strategy_20251031.md`
- **Mortality Research:** Research basis unchanged (Cavalcanti 2025, Ballester 2024, IOM 2024, GAO 2025)

## Next Steps

- ✅ Determinism restored in mortality system
- ✅ Monte Carlo validation passes
- ⏭️ No further action needed for this subsystem

**Status:** COMPLETE - Mortality system now fully deterministic with proper RNG chaining.
