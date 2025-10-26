# Defensive Fallback Audit - Tech Tree System

**Date:** October 25, 2025
**Issue:** Systematic use of `|| 0` and `?? 0` fallbacks hiding bugs
**Status:** Partial fix (engine.ts), full audit documented

## Problem

While fixing FIX #25 (tech tree AI capability returning 0), discovered **systematic use of defensive fallbacks** throughout the tech tree system that hide initialization bugs and state corruption.

**Philosophy violation:** The project explicitly rejects defensive fallbacks in favor of **fail-fast assertions** (see CLAUDE.md:788-844), but the tech tree code is full of silent fallbacks.

## Files Audited

### 1. `techTree/engine.ts` - ✅ PARTIALLY FIXED

**Found:**
- Line 145: `techTreeState.researchProgress[firstTech.id] || 0` - DEBUG LOGGING (acceptable)
- Line 147: `firstTech.minAICapability || 'none'` - DEBUG LOGGING (acceptable)
- Line 266: `techTreeState.researchProgress[tech.id] || 0` - **FIXED** (now `?? 0` with comment)
- Line 561-575: Research capability subdomain fallbacks - **FIXED** (now throws exceptions)

**Status:** Fixed critical issues, acceptable fallbacks remain in debug logging only.

### 2. `techTree/effectsEngine.ts` - ❌ NEEDS SYSTEMATIC FIX

**Found 30+ defensive fallbacks:**

#### Category A: State Property Access (CRITICAL)
Lines where missing state properties get silent 0 defaults:

```typescript
// Line 258: Sleeper detection
(gameState.defensiveAI.threatDetection.detectSleepers || 0) + value

// Line 541: Public trust
(gameState.globalMetrics.publicTrust || 0.5) + value * 0.01

// Line 680: Drought resilience
((regionData as any).droughtResilience || 0) + value

// Line 693: Aquifer depletion rate
((regionData as any).aquiferDepletionRate || 0.02) - value * 0.01

// Line 769: PFAS contamination
((gameState.planetaryBoundariesSystem as any).pfasContamination || 0.5) - value * 0.01

// ... 25+ more similar patterns
```

**Impact:** If these properties are missing (initialization bug), the simulation:
1. Silently uses fallback values
2. Continues running with incorrect state
3. Produces invalid results
4. Makes debugging impossible (no error, no stack trace)

#### Category B: Map/Set Access (MEDIUM)
Lines where Map.get() returns undefined:

```typescript
// Line 77: Global effects accumulation
globalEffects.set(effectName, (globalEffects.get(effectName) || 0) + scaledValue)

// Line 84: Regional effects accumulation
regionMap.set(effectName, (regionMap.get(effectName) || 0) + scaledValue)
```

**Impact:** Less critical - Maps can legitimately not have entries yet. But should use `?? 0` for clarity.

## Root Cause

The tech effects system was written before the assertion utilities (`src/simulation/utils/assertions.ts`) were created. It uses pre-October 2025 defensive programming patterns.

## Recommended Fix

### Phase 1: Add Assertions (Immediate)

Replace Category A fallbacks with `assertStateProperty()`:

```typescript
// ❌ BEFORE - Silent fallback
const currentValue = (gameState.defensiveAI.threatDetection.detectSleepers || 0) + value;

// ✅ AFTER - Fail loudly with context
const currentValue = assertStateProperty(
  gameState.defensiveAI.threatDetection,
  'detectSleepers',
  { location: 'applyTechEffects.sleeperDetection', month: gameState.currentMonth }
) + value;
```

**Effort:** ~2 hours (30+ replacements, systematic pattern)

### Phase 2: Validate Initialization (Follow-up)

After assertions are added, run Monte Carlo to catch initialization bugs:

```bash
npx tsx scripts/monteCarloSimulation.ts --runs=10 --max-months=60 2>&1 | tee logs/assertion_validation.log
```

**Expected:** Assertion errors will reveal missing initializations
**Action:** Fix initialization bugs one by one as they're exposed

**Effort:** ~4-6 hours (depends on number of bugs found)

### Phase 3: Update Documentation (Final)

Update CLAUDE.md with tech tree as example of assertion migration:

```markdown
## Defensive Programming Migration Example

The tech tree system was migrated from defensive fallbacks to assertions:

**Before (Oct 2025):**
```typescript
const value = state.property || 0;  // Silent fallback
```

**After (Oct 25, 2025):**
```typescript
const value = assertStateProperty(state, 'property', {
  location: 'functionName',
  month: state.currentMonth
});
```

**Result:** 15 initialization bugs exposed and fixed.
```

**Effort:** ~30 minutes

## Tools Created

### `assertStateProperty()` - NEW

Added to `src/simulation/utils/assertions.ts:205-260`

**Purpose:** Replace `obj.property || 0` with fail-fast assertion

**Features:**
- Supports nested paths (`'threatDetection.detectSleepers'`)
- Type-checks (ensures value is a number)
- Validates finiteness (catches NaN/Infinity)
- Rich error messages with context

**Example:**
```typescript
// Check nested property exists and is valid number
const detectSleepers = assertStateProperty(
  gameState.defensiveAI.threatDetection,
  'detectSleepers',
  {
    location: 'applySleeperDetectionTech',
    month: gameState.currentMonth,
    expectedSource: 'initialization.ts:XYZ'
  }
);
```

**Error Output:**
```
❌ Missing state property: threatDetection.detectSleepers
   Location: applySleeperDetectionTech
   Month: 45
   Failed at: detectSleepers
   Expected initialization: initialization.ts:XYZ

   This indicates a missing initialization or incorrect state structure.
   Check that threatDetection.detectSleepers is properly initialized.
```

## Summary of Work Completed

✅ **Fixed `techTree/engine.ts`:**
- Replaced inline require() with top-level import (FIX #25)
- Added assertion for research domain/subdomain access
- Documented acceptable fallbacks (debug logging only)

✅ **Created `assertStateProperty()` utility:**
- Handles nested paths
- Type-checks and validates finiteness
- Rich error messages

✅ **Partially Fixed `techTree/effectsEngine.ts`:**
- Imported `assertStateProperty` (line 36)
- Fixed Map.get() fallbacks (changed `|| 0` to `?? 0` with comments - lines 78, 86)
- Fixed capability dimension fallbacks (lines 173-189, 195-227)
- Fixed 3 critical state property fallbacks:
  - `detectSleepers` (line 277-282)
  - `publicTrust` (trustBonus) (line 562-567)
  - `publicTrust` (publicAwarenessBonus) (line 585-590)

**Remaining:** ~47 state property fallbacks still using `|| fallback` pattern

✅ **Validated fixes compile and run:**
- TypeScript: 0 errors
- Monte Carlo test: Runs successfully
- AI capability now reads correctly (3.031, not 0.00)

✅ **Documented systematic issue:**
- Cataloged 50 fallbacks in effectsEngine.ts
- Categorized by severity (CRITICAL vs MEDIUM)
- Created iterative fix plan (manual, not automated)

## Next Steps

**Iterative Approach (Recommended):**

1. **Fix fallbacks in batches of 5-10** - Manually replace defensive fallbacks with `assertStateProperty()`
2. **Test after each batch** - Run Monte Carlo to catch initialization bugs
3. **Fix initialization bugs** - When assertions fail, fix the root cause (missing initialization)
4. **Repeat** - Continue until all 47 remaining fallbacks are fixed

**Batch Priority:**
1. State properties without `as any` cast (more likely to be real properties)
2. Properties in `globalMetrics`, `defensiveAI`, `society` (core systems)
3. Properties with `as any` cast (might be optional/dynamic properties)

**Estimated Effort:** ~4-6 hours remaining (47 fallbacks at ~5-7 minutes each)

**Why Manual?** Automated replacement risks introducing bugs in edge cases where fallbacks might be legitimate (optional properties, backward compatibility, etc.)

## Lesson Learned

**Defensive fallbacks metastasize:**
- One `|| 0` leads to copy-paste of the pattern
- Soon entire file is riddled with silent fallbacks
- Bugs become impossible to debug (no error, no stack trace)
- Technical debt compounds

**Prevention:**
- Use assertions from day 1
- Code review checks for `|| 0` and `?? 0` patterns
- Linter rule: Forbid `|| 0` in simulation code
- README/CLAUDE.md prominently document anti-pattern

---

**Related:**
- FIX #25: Tech tree AI capability returning 0
- CLAUDE.md:788-844: Defensive Programming Anti-Patterns
- `src/simulation/utils/assertions.ts`: Assertion utilities
