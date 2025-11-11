# Architecture Review: Scenario System & Recent Bug Fix
**Date:** November 11, 2025
**Reviewer:** Architecture Skeptic Agent
**Review Type:** Post-Fix Architecture Assessment
**Commit Under Review:** 5931a7f49 (Fix scenario attachment)

## Executive Summary

**Grade:** B-
**Risk Level:** MEDIUM
**Decision:** APPROVE WITH CONDITIONS

The recent fix successfully resolves the immediate bug (scenario object not being attached to state), enabling government priority overrides to function. However, the solution reveals deeper architectural issues around type safety violations and state management patterns that should be addressed.

## Architecture Assessment

### 1. Type Safety Violations

**Severity:** HIGH
**Impact:** Code maintainability, bug prevention
**Location:** `scripts/scenarioRunner.ts:34`

The fix uses `(state as any).scenario = scenario` to bypass TypeScript's type checking. This is problematic because:

1. **The field IS properly typed** - `GameState` interface already includes `scenario?: ScenarioDefinition` (line 187 in game.ts)
2. **Unnecessary type casting** - We're using `as any` when the field exists with proper typing
3. **Sets bad precedent** - Encourages bypassing type system instead of using it

**Root Cause Analysis:**
The actual problem appears to be that `scenarioRunner.ts` creates state via `createDefaultInitialState()` which returns a `GameState`, then tries to add the scenario field. The compiler may not recognize that optional fields can be added after creation.

**Recommendation:**
```typescript
// Instead of: (state as any).scenario = scenario
// Use: state.scenario = scenario
// If TypeScript complains, the issue is elsewhere (import types, etc.)
```

### 2. State Propagation Integrity

**Severity:** MEDIUM
**Impact:** Potential data loss during history tracking
**Location:** `src/simulation/engine.ts:681` (structuredClone usage)

The engine uses `structuredClone()` for history snapshots. This correctly preserves the scenario field, BUT:

1. **Fallback path risk** - Manual snapshot fallback (line 692) may not preserve scenario field
2. **No validation** - No checks that scenario persists across cloning operations
3. **Phase execution order** - ApplyScenarioPrioritiesPhase runs at order 1.5, after time advance but before other phases

**Testing Gap:** No test verifies scenario field persistence across simulation steps.

### 3. Architectural Pattern Issues

**Severity:** MEDIUM
**Impact:** Long-term maintainability, consistency

**Pattern Violation:** Dynamic field attachment to state
- Adding fields at runtime (`state.scenario = ...`) violates the "single source of truth" principle
- GameState interface defines the field, but it's attached outside initialization flow
- Creates two initialization paths: with scenarios (scenarioRunner) and without (normal engine)

**Alternative Approaches:**
1. **Context pattern** - Pass scenario through PhaseContext instead of state attachment
2. **Initialization parameter** - Make scenario a parameter to `createDefaultInitialState()`
3. **Engine configuration** - Pass scenario to SimulationEngine constructor

### 4. Performance Considerations

**Severity:** LOW
**Impact:** Memory usage, cloning performance

The scenario object is relatively small (~1KB) and attached once, so performance impact is minimal. However:

1. **Repeated cloning** - Scenario cloned every history snapshot (monthly)
2. **Unused data** - Only `governmentPriorities` used, but entire scenario attached
3. **Memory overhead** - 360 months × 1KB = 360KB additional memory for history

**Optimization opportunity:** Only attach `governmentPriorities` field instead of entire scenario.

### 5. Error Handling

**Severity:** LOW
**Impact:** Debugging difficulty

The fix works but provides no error handling or validation:

1. **Silent failure mode** - If scenario attachment fails, phase silently skips
2. **No logging** - No confirmation that scenario was successfully attached
3. **Type confusion** - Using `any` hides potential type mismatches

## Critical Issues Found

### CRITICAL ISSUES
None - The fix prevents system instability.

### HIGH PRIORITY ISSUES

1. **Type Safety Bypass** (HIGH)
   - **Problem:** Using `(state as any)` when field is properly typed
   - **Impact:** Sets precedent for bypassing type system
   - **Fix effort:** SMALL (remove type cast, fix actual type issue)
   - **Recommendation:** Remove `as any` cast, use proper typing

### MEDIUM PRIORITY ISSUES

2. **State Initialization Pattern** (MEDIUM)
   - **Problem:** Scenario attached outside normal initialization flow
   - **Impact:** Creates inconsistent initialization paths
   - **Fix effort:** MEDIUM (refactor initialization)
   - **Recommendation:** Pass scenario to `createDefaultInitialState()`

3. **Missing Test Coverage** (MEDIUM)
   - **Problem:** No test verifies scenario persistence
   - **Impact:** Could break silently in future
   - **Fix effort:** SMALL (add test)
   - **Recommendation:** Add test for scenario field persistence

### LOW PRIORITY ISSUES

4. **Memory Optimization** (LOW)
   - **Problem:** Entire scenario cloned in history when only priorities needed
   - **Impact:** 360KB additional memory over 360 months
   - **Fix effort:** SMALL (attach only needed fields)
   - **Recommendation:** Consider for future optimization

5. **Logging Improvements** (LOW)
   - **Problem:** No confirmation of scenario attachment
   - **Impact:** Harder to debug scenario issues
   - **Fix effort:** SMALL (add log statement)
   - **Recommendation:** Add debug log when scenario attached

## Recommendations

### Immediate Actions (Before Merge)

1. **Remove type cast** - Change `(state as any).scenario` to `state.scenario`
2. **Add verification** - Log successful scenario attachment
3. **Add test** - Verify scenario persists across simulation steps

### Short-term Improvements (Next Sprint)

1. **Refactor initialization** - Make scenario a parameter to state creation
2. **Add validation** - Check scenario structure before attachment
3. **Document pattern** - Add comment explaining why scenario attached this way

### Long-term Considerations

1. **Consider context pattern** - Pass scenario through PhaseContext instead
2. **Standardize state extensions** - Create pattern for optional state fields
3. **Type system improvements** - Use branded types for scenario-enabled states

## Positive Aspects

The fix correctly identifies and resolves the root cause. The solution is minimal and doesn't break existing functionality. The commit message clearly documents the problem and solution.

## Risk Assessment

**Current Risk:** MEDIUM
- Fix works but violates type safety
- No test coverage for regression
- Pattern could be copied elsewhere

**Post-improvement Risk:** LOW (if recommendations implemented)

## Final Recommendation

**APPROVE WITH CONDITIONS**

The fix successfully enables scenario testing, which is critical for Phase 3 work. However:

1. Must remove `as any` cast before considering this production-ready
2. Should add test coverage within next sprint
3. Consider refactoring initialization pattern for consistency

The architectural debt introduced is manageable but should not be allowed to accumulate. The type safety violation sets a concerning precedent that must be addressed.

## Next Steps

Engaging project manager to prioritize:
1. Immediate type safety fix (5 minutes)
2. Test coverage addition (30 minutes)
3. Initialization refactor decision (needs discussion)