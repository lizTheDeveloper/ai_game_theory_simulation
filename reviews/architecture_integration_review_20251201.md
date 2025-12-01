# Architecture Integration Review - December 1, 2025

**Reviewer:** Architecture Skeptic
**Grade:** B-
**Period:** Nov 24 - Dec 1, 2025 (46 commits analyzed)

## Summary

TypeScript passes with 0 errors. **3 test failures detected** in population-dynamics.test.ts. The failures stem from a CRITICAL semantic conflict in the `climate_change.currentValue` field - different parts of the codebase interpret this as either **degrees Celsius** (0-6+ range) or **probability/percentage** (0-1 range).

## CRITICAL ISSUES

### CRITICAL-1: Semantic Conflict in climate_change.currentValue

**Location:** Multiple files
**Impact:** Test failures, potential runtime crashes in production simulations

The `planetaryBoundariesSystem.boundaries.climate_change.currentValue` field has conflicting semantics:

**As Degrees Celsius (correct for hindcasting):**
- `src/simulation/historicalInitialization.ts:214` - Sets to `tempVsPreindustrial` (e.g., 1.15C for 1990)
- `src/simulation/planetaryBoundaries.ts:644-662` - `getGlobalTemperatureIncrease()` returns it as degrees
- `src/simulation/extremeWeatherEvents.ts:77` - Validates with `assertInRange(globalTempIncrease, 0, 6, ...)` (6C = 6 degrees max)

**As Probability (0-1 range):**
- `src/simulation/engine/phases/ExogenousShockPhase.ts:168` - Uses `assertProbability()` and caps at 1.0
- `src/simulation/engine/phases/ExogenousShockPhase.ts:457` - Same issue for asteroid impacts
- `src/simulation/initialization.ts:1746` - Checks `>= 1.0` as "breached" threshold

**Root Cause:**
When running a 10-year hindcast from 1990, the climate simulation accelerates warming beyond 6C (error message shows `globalTempIncrease = 6.32702585798502`). This triggers the assertion failure in `calculateCategoryDistribution()`.

**Evidence:**
```
Error: Out-of-range value in calculateCategoryDistribution
   globalTempIncrease = 6.32702585798502
   Valid range: [0, 6]
   Month: 0
```

**Failing Tests:**
1. `should maintain population stability from 1990 to 2000`
2. `should maintain regional-global consistency during simulation`
3. `High pollution scenario shows cumulative mortality impact`

**Resolution Options:**
1. **Normalize** - Convert currentValue to 0-1 scale everywhere (breaking change)
2. **Split fields** - Create separate `tempDegrees` and `tempNormalized` fields
3. **Fix assertion bounds** - Expand `assertInRange` to allow higher values (quick fix, masks problem)
4. **Fix climate acceleration** - Debug why hindcast mode allows 6C+ warming in 10 years (root cause)

**Recommendation:** Option 4 (fix climate acceleration) - The hindcast from 1990 should not reach 6C in 10 years. Historical records show ~0.3C warming 1990-2000.

---

## HIGH PRIORITY

### HIGH-1: ExogenousShockPhase Corrupts Climate Data

**Location:** `src/simulation/engine/phases/ExogenousShockPhase.ts:168-175, 457-464`
**Impact:** Nuclear war and asteroid impacts cap climate change at 1.0 (treating it as probability)

```typescript
// This CORRUPTS climate data by treating degrees as probability
boundaries.climate_change.currentValue = assertProbability(
  Math.min(1.0, boundaries.climate_change.currentValue + climateDelta),
  ...
);
```

If `currentValue` is 1.15C (1990 pre-industrial) and a shock occurs, it gets capped to 1.0, losing climate data.

**Resolution:** Use `assertFinite()` or `assertInRange(value, 0, 10, ...)` instead of `assertProbability()`.

---

## MEDIUM PRIORITY

### MEDIUM-1: Inconsistent Breach Detection Logic

**Location:** `src/simulation/initialization.ts:1746`
```typescript
boundaries.climate_change.currentValue >= 1.0 &&
```

This treats 1.0C warming as "breached" when it should probably be ~2.0C (Paris Agreement target) or use normalized scale.

### MEDIUM-2: Comment Documents Known Bug Without Fix

**Location:** `src/simulation/utils/irreversibility.ts:62`
```typescript
// Bug: climate_change.currentValue can be 2.0+ (degrees Celsius), not a percentage!
```

This comment acknowledges the semantic conflict but no fix was applied.

---

## LOW PRIORITY

None identified.

---

## Commits Analyzed

| Commit | Description | Assessment |
|--------|-------------|------------|
| eb3f50b7 | fix(M-4): carbonSinkMultiplier runtime overwrite | OK |
| 77510ed6 | feat(m3): Parameter injection system complete | OK |
| c855fb60 | HIGH-4: Regime-based feedback multipliers | OK |
| 03aee11f | fix(CRITICAL-1): Add missing recoveryHalfLife | OK |
| f0330078 | fix(CRITICAL-1): Prevent ClimateSystemPhase zeroing | OK |

Most commits show good practices. The issue is **pre-existing** - the semantic conflict in `climate_change.currentValue` has been latent for some time and is now surfacing in hindcast validation.

---

## Recommendation

**CRITICAL-1 must be resolved before next merge.** The semantic conflict causes test failures and could produce incorrect simulation results.

**Immediate action:** Fix the climate acceleration in hindcast mode so 1990-2000 produces realistic ~0.3-0.5C warming instead of 6C+.

**Follow-up:** Audit all uses of `climate_change.currentValue` and establish single semantic (recommend degrees Celsius, 0-10 range).
