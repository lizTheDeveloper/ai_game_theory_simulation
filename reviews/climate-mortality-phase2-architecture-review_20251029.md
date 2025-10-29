# Architecture Review: Climate Mortality Phase 2 Implementation

**Date:** October 29, 2025
**Reviewer:** Architecture Skeptic
**Scope:** Storm Intensity-Frequency Modeling & Biosphere Integrity Index (BII)
**Lines Added:** 707 new + 596 extended = 1,303 total

## Executive Summary

Climate Mortality Phase 2 implementation introduces complex storm modeling and species tracking systems. I've identified **1 CRITICAL issue** (phase ordering conflict), **2 HIGH priority concerns** (defensive fallbacks, state coupling), and **3 MEDIUM priority items** (performance, array growth, duplication).

The CRITICAL issue **must be fixed** before merging as it breaks simulation determinism.

## CRITICAL ISSUES (Immediate attention required - system stability at risk)

### 1. Phase Ordering Conflict - BREAKS DETERMINISM

**File:** `src/simulation/engine/phases/ExtremeWeatherEventsPhase.ts:22`

**Problem:** Multiple phases have identical order value (15.5):
- ExtremeWeatherEventsPhase: order = 15.5
- UBIPhase: order = 15.5
- Tier2InterpretabilityPhase: order = 15.5

**Impact:**
- Non-deterministic phase execution order across runs
- Different simulation outcomes with same seed
- Breaks Monte Carlo validation guarantees
- Makes debugging impossible

**Root Cause:** Copy-paste error when adding new phase

**Recommended Action:**
```typescript
// Fix phase ordering to ensure deterministic execution
ExtremeWeatherEventsPhase: order = 15.2  // After WetBulbTemperature (15.0)
UBIPhase: order = 15.3
Tier2InterpretabilityPhase: order = 15.4
SocialSafetyNetsPhase: order = 15.6      // Already correct
```

**Effort:** Small (5 minutes) - Change 3 numbers

## HIGH PRIORITY (Significant performance/maintainability concerns)

### 1. Silent Fallback Anti-Pattern Violations

**Files:**
- `src/simulation/extremeWeatherEvents.ts:364`
- `src/simulation/planetaryBoundaries.ts:1333`

**Problem:** Using `?? 1.2` fallback for missing climate data
```typescript
const globalTempIncrease = state.planetaryBoundariesSystem?.boundaries?.climate_change?.currentValue ?? 1.2;
```

**Impact:**
- Hides missing planetary boundaries initialization bugs
- All simulations silently use 1.2°C if system not initialized
- Makes climate coupling failures invisible
- Violates project's "fail loudly" philosophy

**Recommended Action:**
```typescript
import { assertStateProperty } from './utils/assertions';

const globalTempIncrease = assertStateProperty(
  state.planetaryBoundariesSystem?.boundaries?.climate_change,
  'currentValue',
  {
    location: 'updateExtremeWeatherEvents',
    month: state.currentMonth,
    valueName: 'globalTempIncrease'
  }
);
```

**Effort:** Small (30 minutes) - Replace 2 fallbacks with assertions

### 2. Tight Cross-System Coupling

**Problem:** Storm and BII systems directly read from planetaryBoundariesSystem internals

**Evidence:**
- Both systems access: `state.planetaryBoundariesSystem?.boundaries?.climate_change?.currentValue`
- Creates hidden dependency chain: climate → storms → mortality
- Changes to planetary boundaries structure break downstream systems

**Impact:**
- Fragile to refactoring
- Hard to test in isolation
- Circular dependency risk

**Recommended Action:**
Create explicit climate data accessor:
```typescript
// In planetaryBoundaries.ts
export function getCurrentGlobalTemperature(state: GameState): number {
  return assertStateProperty(
    state.planetaryBoundariesSystem?.boundaries?.climate_change,
    'currentValue',
    { location: 'getCurrentGlobalTemperature', month: state.currentMonth }
  );
}
```

**Effort:** Medium (2 hours) - Refactor data access pattern

## MEDIUM PRIORITY (Technical debt worth addressing between features)

### 1. Storm Array Growth Pattern

**Current Behavior:**
- Storm events accumulate monthly, reset annually
- Max ~90 storms/year × ~20 years = ~1,800 storm objects in late game
- Each storm object ~200 bytes = ~360KB memory

**Analysis:** Acceptable but could be optimized

**Recommendation:**
Consider keeping only summary statistics after year end:
```typescript
interface AnnualStormSummary {
  year: number;
  totalStorms: number;
  categoryBreakdown: [number, number, number, number, number];
  totalMortality: number;
}
```

**Effort:** Medium (3 hours) - Requires state migration

### 2. Regional Vulnerability Deep Copy

**File:** `src/simulation/extremeWeatherEvents.ts:55`

```typescript
regionalVulnerability: [...REGIONAL_VULNERABILITIES], // Deep copy
```

**Problem:** This is a shallow copy, not deep. Objects inside array are still references.

**Impact:** Minor - regionalVulnerability objects are read-only in practice

**Recommendation:** Either:
1. Use actual deep copy: `structuredClone(REGIONAL_VULNERABILITIES)`
2. Document as intentional shallow copy
3. Make REGIONAL_VULNERABILITIES immutable with Object.freeze()

**Effort:** Small (30 minutes)

### 3. Magic Number in Species Survival Floor

**File:** `src/simulation/planetaryBoundaries.ts:1359`

```typescript
bii.currentSpeciesCount = Math.max(1000, bii.currentSpeciesCount - monthlyExtinctions);
```

**Problem:** Hard-coded 1000 species minimum with no explanation

**Impact:** Prevents total extinction modeling, may hide severe collapse

**Recommendation:**
```typescript
const MIN_VIABLE_SPECIES = 1000; // Below this, ecosystem collapse is total
bii.currentSpeciesCount = Math.max(MIN_VIABLE_SPECIES, ...);
```

**Effort:** Trivial (5 minutes)

## LOW PRIORITY (Future improvements, not urgent)

### 1. Storm Probability Calculation

**File:** `src/simulation/extremeWeatherEvents.ts:382`

```typescript
const stormProbability = Math.min(1.0, avgMonthlyStorms / 10);
```

**Issue:** Arbitrary division by 10, caps at 9 storms/month max

**Impact:** Minimal - current storm counts never exceed this

**Recommendation:** Document the reasoning or make configurable

### 2. Performance Optimization Opportunities

**Finding:** No significant performance issues identified

Storm generation: O(1) per month, O(n) for region selection where n=11 regions
Species tracking: Only aggregate counts, not individual species
No deep cloning in hot paths (shallow copy is intentional)
No O(n²) loops detected

**Current performance profile:** Acceptable for simulation scale

### 3. Missing Integration Tests

**Gap:** No tests for cross-system interactions:
- Climate change → storm intensity
- Storms → Bayesian mortality
- Species loss → ecosystem services

**Recommendation:** Add integration tests in next testing phase

## Performance Analysis

### Memory Usage
- Storm events: ~360KB worst case (1,800 storms × 200 bytes)
- BII: ~1KB (3 species group objects + scalars)
- Regional vulnerabilities: ~2KB (11 regions × 180 bytes)
- **Total:** <500KB additional memory - negligible

### Computational Complexity
- Storm generation: O(1) with O(r) region selection, r=11
- BII updates: O(1) arithmetic operations
- Phase execution: O(1) per month
- **No performance concerns identified**

## State Propagation Validation

### Data Flow
✅ Climate (planetary boundaries) → Storms (weather system) → Mortality (Bayesian)
✅ Climate (planetary boundaries) → BII (species tracking) → Extinctions
✅ Annual reset prevents unbounded growth
⚠️ Tight coupling to planetary boundaries structure

### Phase Dependencies
✅ ExtremeWeatherEventsPhase runs after climate updates
❌ Phase ordering conflict creates non-deterministic execution
✅ Bayesian mortality integration works correctly

## Defensive Coding Audit

### Assertions
✅ Most calculations use assertFinite/assertProbability
❌ Silent fallbacks for missing climate data (2 instances)
✅ Input validation on all public functions
✅ No division by zero risks identified

### NaN Sources
✅ No Math.sqrt of negative numbers
✅ No unguarded division operations
✅ Climate velocity calculation protected
⚠️ Fallback to 1.2°C could hide NaN propagation

## RECOMMENDATION

**Block merge until CRITICAL issue fixed:**

1. **IMMEDIATE (5 minutes):** Fix phase ordering conflict - this breaks core simulation guarantees
2. **BEFORE NEXT FEATURE (1 hour):** Replace silent fallbacks with assertions
3. **TECHNICAL DEBT SPRINT:** Address coupling and minor issues

The implementation is generally well-structured with good research backing. Performance is acceptable, memory usage is negligible. The phase ordering issue is a simple fix but absolutely critical for simulation correctness.

**Overall Assessment:** Good implementation with one critical flaw. Fix phase ordering, then ship it.

## Files Reviewed

- `src/simulation/extremeWeatherEvents.ts` (~476 lines)
- `src/simulation/planetaryBoundaries.ts` (~200 lines added)
- `src/simulation/engine/phases/ExtremeWeatherEventsPhase.ts` (~32 lines)
- `src/types/extremeWeather.ts` (~150 lines)
- `src/types/planetaryBoundaries.ts` (BII types)
- `src/types/game.ts` (GameState extensions)