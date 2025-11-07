# Phase 1 Implementation: Safe Defensive Coding Fixes
**Date:** November 7, 2025
**Scope:** CRITICAL-4 roadmap item - Phase 1 only (safe fixes, no type changes)
**Status:** ✅ IMPLEMENTATION COMPLETE, AWAITING VALIDATION

## Changes Summary

### Files Modified: 4
1. `src/simulation/wetBulbEvents.ts` - CRITICAL anti-pattern fix
2. `src/simulation/catastrophicScenarios.ts` - Prerequisites array access
3. `src/simulation/alignmentDynamics.ts` - Attractor positions validation
4. `src/simulation/techTree/effectsEngine.ts` - PFAS initialization pattern improvement

### Patterns Fixed: 5

#### 1. **CRITICAL: Assertion Wrapping Defensive Fallback** (wetBulbEvents.ts:383)

**Before:**
```typescript
const temperatureAnomaly = assertFinite(resources?.co2?.temperatureAnomaly ?? 0, {
```

**Problem:** The `?? 0` fallback masks missing data, then `assertFinite` validates the wrong value (0 instead of undefined). This defeats the entire purpose of assertions.

**After:**
```typescript
const co2System = assertDefined(resources?.co2, {
  location: 'updateWetBulbTemperatureSystem',
  valueName: 'resources.co2',
  month: state.currentMonth,
  additionalInfo: {
    message: 'CO2 system should be initialized during game start',
    resourcesExists: !!resources
  }
});

const temperatureAnomaly = assertFinite(co2System.temperatureAnomaly, {
  location: 'updateWetBulbTemperatureSystem',
  valueName: 'co2System.temperatureAnomaly',
  month: state.currentMonth,
});
```

**Impact:** Now properly detects missing CO2 system instead of silently using 0°C.

---

#### 2. **Prerequisites Array Access** (catastrophicScenarios.ts:1102, 1114, 1127)

**Before:**
```typescript
const step5Met = scenario.prerequisites[5]?.met ?? false;
const step5CompletionMonth = scenario.prerequisites[5]?.metDate ?? currentMonth;
const requiredMonths = scenario.step7RequiredMonths ?? 600; // Fallback (shouldn't happen)
```

**Problem:** Prerequisites array should have 6+ elements. If `prerequisites[5]` is undefined, scenario initialization is broken. Fallbacks mask this bug.

**After:**
```typescript
const step5 = assertDefined(scenario.prerequisites[5], {
  location: 'checkSlowTakeoverStep7',
  valueName: 'prerequisites[5]',
  month: currentMonth,
  additionalInfo: {
    scenarioType: scenario.type,
    prerequisitesLength: scenario.prerequisites.length,
    expected: '6+ elements'
  }
});

const step5Met = step5.met;
// metDate may legitimately be undefined if step was never met - keep ?? currentMonth
const step5CompletionMonth = step5.metDate ?? currentMonth;

const requiredMonths = assertDefined(scenario.step7RequiredMonths, {
  location: 'checkSlowTakeoverStep7',
  valueName: 'step7RequiredMonths',
  month: currentMonth,
  additionalInfo: {
    step6CompletionMonth: scenario.step6CompletionMonth,
    message: 'Should be set when step 6 begins'
  }
});
```

**Impact:** Now detects incomplete scenario initialization instead of silently using fallback values.

**Note:** Kept `step5.metDate ?? currentMonth` because `metDate` is legitimately optional (step may never have been met).

---

#### 3. **Attractor Positions Array Access** (alignmentDynamics.ts:39)

**Before:**
```typescript
const attractorPositions = [0.8, 0.5, 0.2, 0.35, 0.65];
const attractorAlignment = attractorPositions[basinIndex] ?? 0.5;
```

**Problem:** If `basinIndex >= attractorPositions.length`, configuration is wrong (e.g., `numAttractors=5` but only 5 positions defined, so max index is 4).

**After:**
```typescript
const attractorPositions = [0.8, 0.5, 0.2, 0.35, 0.65];

if (basinIndex < 0 || basinIndex >= attractorPositions.length) {
  throw new Error(
    `❌ ALIGNMENT DYNAMICS: Invalid basin index ${basinIndex} (valid range: 0-${attractorPositions.length - 1}). ` +
    `Configuration specifies ${epicycleConfig.numAttractors} attractors but only ${attractorPositions.length} positions defined.`
  );
}

const attractorAlignment = attractorPositions[basinIndex];
```

**Impact:** Now catches configuration mismatches between `numAttractors` and `attractorPositions` array length.

---

#### 4. **PFAS Initialization Pattern** (techTree/effectsEngine.ts:1031)

**Before:**
```typescript
const current = (gameState.planetaryBoundariesSystem as any).pfasContamination ?? 0.5;
```

**Problem:** Using `as any` to bypass types AND using fallback. Defensive pattern combined with type system bypass.

**After:**
```typescript
const pbs = gameState.planetaryBoundariesSystem as any;
if (pbs.pfasContamination === undefined) {
  pbs.pfasContamination = 0.5; // Initialize on first use
  console.log(`  🧪 Initializing PFAS contamination baseline: 50% (2025 baseline)`);
}
const current = pbs.pfasContamination;
```

**Impact:** Explicit initialization with logging instead of silent fallback. Makes it clear this is an initialization context, not a bug.

**Note:** Still using `as any` because `pfasContamination` is not in type definition yet. Added TODO comment to add to type definition.

---

#### 5. **Behavioral Detection Pattern** (behavioralDetection.ts:162)

**Status:** **NO CHANGE - Already correct**

**Pattern:**
```typescript
const trueVal = trueDimensions[i];
const safeVal = trueVal ?? 0; // If dimension is undefined, use 0 (legitimate case: dimension not yet initialized)
```

**Analysis:** Comment explicitly states this is legitimate. Dimension arrays may be partially initialized. This is NOT a defensive fallback masking a bug.

**Decision:** Keep as-is, pattern is correct.

---

## Type Check: ✅ PASS

```bash
npx tsc --noEmit
# 0 errors
```

All type errors resolved. Changes are type-safe.

---

## Test Results: PENDING

**Required validation:**
1. ✅ Type check passes
2. ⏸️ Monte Carlo N=10 validation
3. ⏸️ Existing test suite (npm test)
4. ⏸️ Manual smoke test

---

## Risk Assessment

**Risk Level:** LOW-MEDIUM

**Low risk factors:**
- All changes are in error detection paths (assertions)
- No business logic changes
- No type system changes
- Type check passes

**Medium risk factors:**
- Assertions may fire if current code has hidden bugs (this is DESIRED behavior)
- Prerequisites array validation may expose scenario initialization issues
- CO2 system validation may expose resource economy initialization issues

**Mitigation:**
- Monte Carlo N=10 will catch any initialization issues
- If assertions fire, they will provide detailed error messages for debugging
- Fail-loudly philosophy: better to crash during development than produce wrong results

---

## Next Steps

### Immediate (This PR):
1. ✅ Implementation complete
2. ⏸️ Run Monte Carlo N=10 validation
3. ⏸️ Run existing test suite
4. ⏸️ Architecture review (Quality Gate 2)
5. ⏸️ Merge if validation passes

### Phase 2 (Future PR):
- mortality.ts scenario parameters (requires type verification)
- socialCohesion.ts paranoia level (requires type verification)
- earlyWarningSystems.ts gov.resources (requires type verification)
- techTree/deploymentTimescales.ts state properties (requires type verification)

### Phase 3 (Future PR):
- OutcomeProbabilitiesPhase.ts display-only patterns
- Add JSDoc to 38 LEGITIMATE patterns

---

## Files Changed

```
 src/simulation/alignmentDynamics.ts        | 11 +++++++++--
 src/simulation/catastrophicScenarios.ts    | 34 ++++++++++++++++++------------
 src/simulation/techTree/effectsEngine.ts   | 12 +++++++----
 src/simulation/wetBulbEvents.ts            | 15 ++++++++++---
 4 files changed, 50 insertions(+), 22 deletions(-)
```

---

## Commit Message (Suggested)

```
fix(simulation): Replace defensive fallbacks with fail-loudly assertions (Phase 1)

CRITICAL-4 roadmap item: Eliminate silent data corruption from defensive fallbacks.

Phase 1 focuses on safe fixes with no type system changes:

1. **CRITICAL**: wetBulbEvents.ts - Never wrap defensive fallbacks in assertions
   - Was: assertFinite(resources?.co2?.temperatureAnomaly ?? 0)
   - Now: Properly assert CO2 system exists, then validate temperature

2. catastrophicScenarios.ts - Prerequisites array access
   - Was: scenario.prerequisites[5]?.met ?? false
   - Now: Assert prerequisites[5] exists, fail loudly if array incomplete

3. alignmentDynamics.ts - Attractor positions validation
   - Was: attractorPositions[basinIndex] ?? 0.5
   - Now: Validate basinIndex in range, fail loudly on configuration mismatch

4. techTree/effectsEngine.ts - PFAS initialization
   - Was: pfasContamination ?? 0.5 (silent fallback)
   - Now: Explicit initialization with logging

5. behavioralDetection.ts - Verified LEGITIMATE, no change needed

All changes enforce fail-loudly philosophy: reject invalid states instead of
masking bugs with silent fallbacks. Research simulations require correctness
over defensive tolerance.

Type check: ✅ PASS (0 errors)
Tests: PENDING (Monte Carlo N=10 validation)

Phase 2/3 (future PRs): Type system changes, display-only patterns, documentation

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

**Implementation Complete:** November 7, 2025
**Awaiting:** Monte Carlo validation + Architecture review (Quality Gate 2)
