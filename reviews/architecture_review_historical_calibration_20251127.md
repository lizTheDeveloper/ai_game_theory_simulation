# Architecture Integration Review: Historical Calibration Fixes
**Date:** November 27, 2025
**Reviewer:** Architecture Skeptic (System Architecture Review)
**Focus:** HIGH-6, HIGH-7, HIGH-8 integration analysis

---

## Executive Summary

I have reviewed the recent HIGH priority calibration fixes (HIGH-6 through HIGH-8) for integration issues, performance concerns, state propagation problems, and code quality. The fixes implement **historical mode** (`scenarioMode === 'historical'`) conditionals across 9+ files to disable crisis systems during hindcast validation (1990-2024).

**Overall Assessment:** The implementation is **architecturally sound** with good defensive programming, but introduces **code complexity debt** that should be monitored. No CRITICAL issues found. One HIGH-priority architectural concern and several MEDIUM-priority maintainability items identified.

---

## CRITICAL ISSUES
**None identified.**

The fixes correctly handle:
- RNG determinism (no Math.random fallbacks)
- NaN prevention via assertion utilities
- State mutation safety

---

## HIGH PRIORITY
**Significant architectural concerns requiring attention between features**

### H-1: Historical Mode Flag Proliferation (Complexity Creep)
**Severity:** HIGH
**Impact:** Long-term maintainability, regression risk
**Files Affected:** 9+ files across simulation engine

**Problem:**
The `historicalMode` flag check pattern is now scattered across multiple phases:
```typescript
// Pattern repeated in 9+ locations:
if (state.config.scenarioMode === 'historical' && state.currentYear <= 2024) {
  return { events: [] }; // or skip logic
}
```

**Locations identified:**
1. `environmental.ts` (lines 314, 399, 464)
2. `BaselineMortalityPhase.ts` (line 505)
3. `BayesianMortalityResolutionPhase.ts` (line 64)
4. `FamineSystemPhase.ts` (line 51)
5. `FoodSecurityDegradationPhase.ts` (line 64)
6. `HumanSurvivalSystemPhase.ts` (line 85)
7. `regionalPopulations.ts` (lines 372, 545, 627, 691)

**Architectural Concern:**
This creates implicit coupling where the year check `<= 2024` is hardcoded across multiple files. If the hindcast validation period changes (e.g., extended to 2030), all files must be updated.

**Recommendation:**
Extract to a utility function in a central location:
```typescript
// src/simulation/utils/historicalMode.ts
export function isHistoricalModeActive(state: GameState): boolean {
  return state.config.scenarioMode === 'historical' &&
         state.currentYear <= state.config.historicalModeEndYear;
}
```

**Effort:** Small (1-2 hours)
**Risk:** Low
**Priority:** Address in next maintenance cycle

---

## MEDIUM PRIORITY
**Technical debt worth addressing between feature work**

### M-1: Duplicate Year Check Logic in regionalPopulations.ts
**Severity:** MEDIUM
**Impact:** Code duplication, potential inconsistency
**File:** `/src/simulation/regionalPopulations.ts`

**Problem:**
The file defines `isHistoricalMode` twice with slightly different conditions:
```typescript
// Line 545:
const isHistoricalMode = state.config.scenarioMode === 'historical' && state.currentYear <= 2024;

// Line 691:
const useDirectDeaths = state.config.scenarioMode === 'historical' && state.currentYear <= 2024;
```

Both are semantically equivalent but introduce redundancy. If one changes, the other should too.

**Recommendation:** Consolidate to a single variable at function start.
**Effort:** Small (15 minutes)

### M-2: Cascade Disabling in environmental.ts Without Full Documentation
**Severity:** MEDIUM
**Impact:** Future confusion about intentional behavior
**File:** `/src/simulation/environmental.ts`

**Problem:**
Line 464 disables biodiversity cascade during historical mode:
```typescript
if (!historicalModeActive && env.biodiversityIndex < criticalThreshold) {
  // Cascade logic
}
```

The comment at line 459-462 explains this is because "Historical period did NOT experience catastrophic biodiversity tipping points," but there's no research citation.

**Recommendation:** Add research citation or link to a research doc.
**Effort:** Small (10 minutes)

### M-3: Potential Performance Impact of Dynamic Import in regionalPopulations.ts
**Severity:** MEDIUM
**Impact:** Performance degradation on each step
**File:** `/src/simulation/regionalPopulations.ts`, lines 462, 505, 628

**Problem:**
The file uses `require()` dynamically within the update loop:
```typescript
const { getRegionalHistoricalBirthRate } = require('./engine/phases/BaselineMortalityPhase');
```

This is called inside a loop over 10 regions, every month. While Node.js caches requires, the pattern is unusual and could cause issues with tree-shaking or bundler analysis.

**Recommendation:** Move import to top of file.
**Effort:** Small (5 minutes)
**Risk:** Low

### M-4: Two Different Initialization Paths for Historical State
**Severity:** MEDIUM
**Impact:** Potential divergence, maintenance burden
**File:** `/src/simulation/historicalInitialization.ts`

**Problem:**
The file has two initialization functions:
1. `createHistoricalInitialState()` (async, lines 128-499)
2. `initializeHistoricalSimulation()` (sync, lines 623-956)

Both implement the same logic with ~400 lines of near-duplicate code. The sync version exists for "validation scripts where async/await is inconvenient" but creates significant duplication.

**Recommendation:** Refactor sync version to call async version internally, or extract shared logic.
**Effort:** Medium (2-4 hours)
**Risk:** Low (mostly mechanical refactoring)

---

## LOW PRIORITY
**Nice-to-have improvements, not urgent**

### L-1: Console Logging in Hot Path
**Severity:** LOW
**Files:** Multiple (BaselineMortalityPhase, regionalPopulations, etc.)

**Observation:**
Historical mode phases log diagnostics every 12 months:
```typescript
if (state.currentMonth % 12 === 0) {
  console.log(`  Historical birth rate scaling (${actualYear}):`);
  // ...
}
```

This is fine for debugging but adds ~10-20 console.log calls per year per region in production.

**Recommendation:** Gate behind `state.config.enableDiagnostics` or similar.
**Effort:** Small

### L-2: Inconsistent Year Thresholds
**Severity:** LOW
**Impact:** Minor confusion

**Observation:**
Different phases use different year thresholds:
- Most use `<= 2024` (full hindcast period)
- `FoodSecurityDegradationPhase` uses `< 2020` (line 64)
- Some comments reference `< 2000` as the original fix

This inconsistency is intentional (food security was stable through 2020 specifically) but not documented.

**Recommendation:** Add comments explaining why different cutoffs are used.
**Effort:** Small

---

## Integration Analysis

### historicalMode Flag Propagation: PASS
The `config.historicalMode` flag correctly propagates from initialization through all relevant phases. The initialization code in `historicalInitialization.ts` sets both `config.scenarioMode` and `config.historicalMode`, and downstream phases consistently check `state.config.scenarioMode === 'historical'`.

### Cross-System Interactions: PASS
The fixes correctly handle cross-system interactions:
- BaselineMortalityPhase disables to prevent double-counting with regional population system
- BayesianMortalityResolutionPhase clears accumulated risks to prevent memory leaks
- Regional population system handles births AND deaths directly in historical mode
- Famine system completely bypassed (historical famines already in CDR data)

### State Mutation Safety: PASS
All state mutations use `assertFinite()` validation before writing. No silent fallback patterns detected in modified code.

### Performance Analysis: PASS
No O(n^2) patterns introduced. The historical mode checks are O(1) conditionals at phase start, providing early-exit before expensive calculations.

---

## Summary Recommendations

| Priority | Issue | Effort | Action |
|----------|-------|--------|--------|
| HIGH | H-1: Flag proliferation | Small | Create utility function for historical mode check |
| MEDIUM | M-1: Duplicate logic | Small | Consolidate in regionalPopulations.ts |
| MEDIUM | M-4: Duplicate init paths | Medium | Refactor shared logic |
| LOW | L-1: Console logging | Small | Gate behind diagnostic flag |

**Recommended Approach:**
1. H-1 should be addressed in the next maintenance cycle to prevent creep
2. M-1 and M-3 can be fixed quickly in a cleanup commit
3. M-4 is a larger refactor that can wait until the next historical validation work

---

## Conclusion

The HIGH-6, HIGH-7, and HIGH-8 calibration fixes are **well-implemented** with proper defensive coding patterns. The main architectural concern is the proliferation of identical conditional checks across 9+ files, which introduces maintenance burden but does not create instability risk.

**No blocking issues** for continuing feature development. The identified technical debt items can be addressed in future maintenance cycles without impacting current functionality.

---

*Generated by Architecture Skeptic Agent*
*Review completed: November 27, 2025*
