# Architectural Review: Wet Bulb Mortality & Performance Fixes
**Date:** November 12, 2025
**Reviewer:** Architecture Skeptic
**Review Type:** Critical Analysis - Recent Fixes Impact Assessment

## Executive Summary

**Overall Risk Assessment: HIGH PRIORITY**

The recent wet bulb mortality fixes address critical calculation errors but introduce new architectural concerns around state propagation and defensive bounds relaxation. Performance instrumentation is well-implemented but needs usage discipline to avoid overhead.

## CRITICAL ISSUES
*None identified - Previous critical bugs appear properly fixed*

## HIGH PRIORITY ISSUES

### 1. Population Fraction Bounds Relaxation (Risk: State Corruption)
**File:** `src/simulation/wetBulbEvents.ts:495-508`
**Severity:** HIGH
**Impact:** Potential for invalid state propagation in edge cases

The fix relaxes population fraction bounds to allow near-extinction scenarios:
```typescript
const globalPopFraction = assertInRange(
  state.humanPopulationSystem.population / 8.0,
  0.0001,  // Minimum 800K global population (near-extinction)
  2.0,     // Maximum 16B (population doubling)
  ...
);
```

**Problem:** While this fixes the immediate mortality calculation, it creates downstream risks:
- Population doubling (2.0x) seems unrealistic for this simulation's timeframe
- The 0.0001 minimum (800K people) may cause numerical instability in other systems expecting higher minimums
- No validation that other systems can handle these extreme values

**Recommendation:**
1. Add system-wide population bounds constants
2. Validate all population-dependent systems can handle extreme values
3. Consider using logarithmic scaling for extreme scenarios

**Effort:** Medium (2-3 days)
**Risk if unaddressed:** Cascading calculation failures in extreme scenarios

### 2. Regional vs Global Population Inconsistency
**File:** `src/simulation/wetBulbEvents.ts:759-786`
**Severity:** HIGH
**Impact:** State propagation confusion

The fix correctly calculates regional mortality but the architecture is confusing:
- Regional populations are stored as 2025 baselines (static)
- Actual regional populations must be calculated on-the-fly
- The `addMortalityRisk` function gets regional mortality rate but applies globally

**Problem:** This creates a mismatch between:
- Static regional baselines that never update
- Dynamic global population that changes
- Regional mortality events that affect global population

**Recommendation:**
1. Track actual regional populations in state (not just baselines)
2. Update regional populations when global population changes
3. Make the regional → global mortality application explicit

**Effort:** Large (4-5 days)
**Risk if unaddressed:** Incorrect mortality application, especially in multi-region events

### 3. Performance Instrumentation Always Allocating Arrays
**File:** `src/simulation/engine/PhaseOrchestrator.ts:226`
**Severity:** HIGH (Performance)
**Impact:** Memory pressure in long simulations

```typescript
samples: [...existing.samples, elapsed]  // Unbounded array growth!
```

**Problem:** The samples array grows without bound:
- After 1000 months × 37 phases = 37,000 array entries per phase
- No mechanism to trim old samples or use circular buffer
- Will cause GC pressure and eventual OOM in long runs

**Recommendation:**
1. Use a circular buffer (keep last 100 samples)
2. Or calculate p95 incrementally without storing all samples
3. Add memory usage monitoring

**Effort:** Small (1 day)
**Risk if unaddressed:** Memory exhaustion in long simulations

## MEDIUM PRIORITY ISSUES

### 4. Government Investment Normalization Inconsistency
**Files:** Multiple phase files
**Severity:** MEDIUM
**Impact:** Confusing parameter scaling

Different phases normalize government investment differently:
- `/100` in Tier2AIGovernancePhase and Tier2SocialSystemsPhase
- `/10` in Tier2PhysicalSystemsPhase (NOT FIXED!)

**Problem:** Inconsistent normalization makes it hard to reason about effects
**Recommendation:** Standardize on one normalization approach
**Effort:** Small (few hours)

### 5. Assertion Context Objects Creating Memory Pressure
**File:** `src/simulation/wetBulbEvents.ts` (throughout)
**Severity:** MEDIUM (Performance)
**Impact:** Excessive object allocation in hot paths

Every assertion creates a new context object:
```typescript
assertFinite(value, {
  location: 'updateWetBulbTemperatureSystem',
  valueName: 'monthlyDeaths',
  month: state.currentMonth,
  additionalInfo: { eventCount: system.eventsThisMonth.length }
});
```

**Problem:** In the wet bulb update alone, ~15 assertion objects created per region per month
**Recommendation:** Consider assertion level controls or context object pooling
**Effort:** Medium (2 days)

## LOW PRIORITY ISSUES

### 6. Wet Bulb Event History Unbounded Growth
**File:** `src/simulation/wetBulbEvents.ts:657-665`
**Severity:** LOW
**Impact:** Memory growth over time

The `eventHistory` array grows without bound. While slower than the performance samples issue, it still accumulates.

**Recommendation:** Keep rolling window of last 12-24 months
**Effort:** Small (few hours)

### 7. Console Logging in Production Paths
**File:** `src/simulation/wetBulbEvents.ts:575-605`
**Severity:** LOW
**Impact:** Performance overhead

Extensive console logging even for non-critical events. Consider log levels or conditional logging.

## POSITIVE OBSERVATIONS

1. **Assertion Usage:** Excellent use of assertion utilities for validation
2. **Error Context:** Rich error messages with debugging information
3. **Research Backing:** Well-documented research sources and rationale
4. **Performance Tracking:** PhaseOrchestrator instrumentation is well-designed (aside from memory issue)

## ARCHITECTURAL RECOMMENDATIONS

### Immediate Actions Required:
1. **Fix PhysicalSystemsPhase government investment** (still using /10 instead of /100)
2. **Add bounded collection for performance samples** (prevent memory leak)
3. **Document population bounds assumptions** across all systems

### Next Sprint Considerations:
1. **Refactor regional population tracking** - Move from baselines to actual tracked values
2. **Standardize parameter normalization** - Create a central scaling configuration
3. **Add memory monitoring** - Track heap usage in long runs

### Long-term Improvements:
1. **Create population state management module** - Centralize all population-related calculations
2. **Implement hierarchical logging** - Replace console.log with proper log levels
3. **Add integration tests for extreme scenarios** - Verify systems handle near-extinction cases

## RECOMMENDATION TO PROJECT MANAGER

This review identifies 2 HIGH priority performance/stability issues that should be addressed before the next major feature work:

1. **Performance sample memory leak** (1 day fix) - Will cause OOM in long simulations
2. **Population bounds validation** (2-3 days) - Needed for extreme scenario stability

The wet bulb mortality calculation fixes appear sound, but the relaxed bounds need system-wide validation. The regional vs global population architecture is confusing but functional - recommend documenting current approach clearly before attempting refactor.

The PhysicalSystemsPhase still has incorrect government investment normalization that should be fixed immediately (quick fix, high impact).

I recommend scheduling the HIGH priority items between features, and considering the MEDIUM priority items for a dedicated technical debt sprint.