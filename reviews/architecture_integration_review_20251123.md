# Architecture Integration Review - Uncertainty Propagation Framework
**Date:** November 23, 2025
**Reviewer:** Architecture Skeptic
**Commits Reviewed:** 79aea883d (feat: implement Uncertainty Propagation Framework)
**Grade:** B+ (Good integration, minor concerns)

## Executive Summary

The Uncertainty Propagation Framework introduces a new `uncertaintyParameters` field to `GameState` and samples climate/tipping point parameters from research-backed distributions at initialization. The implementation is architecturally sound with proper assertion utilities and deterministic RNG usage. However, there's a significant integration gap where the sampled climate sensitivity parameters (ECS/TCR) are not actually used in temperature calculations.

## Architecture Changes Reviewed

### 1. New Module Structure
- **Added:** `src/simulation/uncertainty/` module with clean exports
- **Interface:** `UncertaintyParameters` with 9 climate/tipping parameters
- **Integration:** Added to `GameState` as optional field (line 817)
- **Sampling:** Called once in `createDefaultInitialState` (line 1120)

### 2. State Propagation Pattern
- Parameters sampled ONCE at initialization using deterministic RNG
- Stored in `state.uncertaintyParameters` for entire simulation run
- IrreversibilityTrackingPhase correctly accesses 4 of 9 parameters
- No state mutation after initialization (good immutability for these values)

### 3. Test Coverage
- 19 unit tests validating determinism, ranges, and variance
- Tests pass with proper CV validation (<0.01% for determinism)
- Good coverage of edge cases and distribution shapes

## Findings by Severity

### CRITICAL ISSUES
**None identified** - No system stability risks or critical failures detected.

### HIGH PRIORITY

#### H1: Climate Sensitivity Parameters Not Integrated
**Location:** Temperature calculation logic (missing integration)
**Issue:** The framework samples `equilibriumClimateSensitivity` and `transientClimateResponse` but these critical parameters are never used in actual temperature calculations. The temperature anomaly appears to be calculated elsewhere without using these sampled values.
**Impact:** The two most important uncertainty parameters (affecting ALL climate projections) are effectively ignored, defeating the primary purpose of the framework.
**Recommendation:** Identify where `state.resourceEconomy.co2.temperatureAnomaly` is calculated and integrate the sampled ECS/TCR values. This likely requires modifying CO2-to-temperature conversion logic.
**Effort:** Medium (requires finding and modifying core climate calculation)

#### H2: Incomplete Parameter Integration
**Location:** Various phases that could use uncertainty parameters
**Issue:** Only IrreversibilityTrackingPhase uses the sampled parameters (4 of 9). Other phases that handle climate impacts don't access these values:
- ClimateSystemPhase doesn't use any parameters
- WetBulbTemperaturePhase could use climate sensitivity
- ExtremeWeatherEventsPhase could use thresholds
**Impact:** Reduced variance in Monte Carlo runs, inconsistent threshold application
**Recommendation:** Audit all climate-related phases and integrate relevant uncertainty parameters
**Effort:** Medium (requires phase-by-phase integration)

### MEDIUM PRIORITY

#### M1: Optional Field Pattern Creates Defensive Code
**Location:** Throughout IrreversibilityTrackingPhase (lines 126, 284, 385, 513)
**Issue:** Using optional chaining with fallback values (`state.uncertaintyParameters?.greenlandCollapseThreshold ?? 2.0`) contradicts the "no defensive fallbacks" philosophy. If uncertainty parameters are required for simulation, they shouldn't be optional.
**Impact:** Silent fallbacks to default values when parameters missing (violates fail-loudly principle)
**Recommendation:** Either make `uncertaintyParameters` required in GameState or use assertion utilities to fail loudly if missing
**Effort:** Small (type system change + assertion additions)

#### M2: Missing Phase Dependencies
**Location:** `src/simulation/uncertainty/index.ts`
**Issue:** No phases declare dependency on uncertainty parameters, yet IrreversibilityTrackingPhase requires them. This could lead to execution order issues if phases are reorganized.
**Impact:** Potential for phases to execute before parameters are available
**Recommendation:** Consider adding 'uncertainty' as a symbolic dependency for phases that require these parameters
**Effort:** Small (update phase dependency declarations)

### LOW PRIORITY

#### L1: Unused Parameters
**Location:** `sampleUncertaintyParameters.ts`
**Issue:** Several sampled parameters are never used:
- `coralReefThreshold` (already passed at 1.4°C)
- `aidEffectivenessMultiplier` (mortality calculations don't reference it)
- `waisCollapseThreshold` (WAIS tracking not implemented)
**Impact:** Unnecessary computation and memory usage (minimal)
**Recommendation:** Either implement usage or comment why they're sampled but unused
**Effort:** Small (documentation or implementation)

#### L2: Type Re-export Pattern
**Location:** `src/simulation/uncertainty/index.ts` line 22
**Issue:** Using `type` keyword in re-export is redundant since TypeScript handles this automatically
**Impact:** None (style issue only)
**Recommendation:** Simplify to `export { UncertaintyParameters }`
**Effort:** Trivial

## Performance Analysis

✅ **No performance concerns identified:**
- Single sampling at initialization (O(1))
- No deep cloning or serialization
- No array operations or loops
- Minimal memory footprint (9 numbers)
- No impact on per-phase execution time

## Architecture Strengths

1. **Clean module boundaries** - Uncertainty module is self-contained with no circular dependencies
2. **Proper assertion usage** - All sampled values validated with `assertInRange`
3. **Research-backed ranges** - Each parameter documents source papers
4. **Deterministic design** - Proper RNG usage without Math.random fallbacks
5. **Good test coverage** - Comprehensive validation of distributions and determinism

## Recommendations

### Immediate Actions (Before Next Release)
1. **MUST FIX:** Integrate ECS/TCR into temperature calculations - these are the primary climate uncertainty parameters
2. **SHOULD FIX:** Make `uncertaintyParameters` required or add assertions to fail loudly when missing

### Near-term Improvements
3. Audit all climate-related phases for parameter integration opportunities
4. Add usage for `aidEffectivenessMultiplier` in mortality calculations
5. Document why `coralReefThreshold` is sampled but not used (historical marker?)

### Long-term Considerations
6. Consider expanding to social/economic uncertainty parameters
7. Add parameter sensitivity analysis tooling
8. Implement WAIS collapse tracking to use that threshold

## Overall Assessment

**Grade: B+**

The Uncertainty Propagation Framework is architecturally sound with clean module design, proper testing, and good documentation. The implementation follows project conventions (assertion utilities, deterministic RNG, research backing). However, it falls short of an A grade due to the critical integration gap where the most important parameters (climate sensitivity) aren't actually used in calculations. This is like building a sophisticated engine but forgetting to connect it to the drivetrain.

The framework adds meaningful value for Monte Carlo variance, but only if the sampled parameters actually affect simulation outcomes. The current partial integration limits its effectiveness to just tipping point thresholds while missing the core climate dynamics.

**Stability Risk:** Low - No architectural issues that threaten system stability
**Technical Debt:** Medium - Integration gaps need addressing but aren't accumulating problems
**Maintainability:** High - Clean, well-documented code that's easy to extend

## Files Reviewed

- `/src/simulation/uncertainty/sampleUncertaintyParameters.ts` (325 lines)
- `/src/simulation/uncertainty/index.ts` (23 lines)
- `/src/simulation/engine/phases/IrreversibilityTrackingPhase.ts` (integration points)
- `/src/simulation/initialization.ts` (line 1120)
- `/src/types/game.ts` (line 817)
- `/tests/unit/uncertainty-propagation.test.ts` (273 lines)

---

*Review complete. The framework is production-ready with noted integration gaps. Priority should be on connecting climate sensitivity parameters to temperature calculations.*