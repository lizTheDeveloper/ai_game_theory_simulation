# Proposed Plan: Regime Multiplier Parameterization

**Date:** December 1, 2025
**Priority:** MEDIUM
**Effort:** 2-4 hours
**Type:** Parameter infrastructure

## Problem Statement

Currently 2 of 4 regime multipliers are not configurable via `ParameterSweepConfig`:
- ✅ Collapse regime multiplier (tech effectiveness): Configurable
- ✅ Breakdown regime multiplier (mortality amplification): Configurable
- ❌ Climate stability degradation multiplier (1.5×): Hardcoded
- ❌ QoL inequality amplification multiplier (1.5×): Hardcoded

This limits parameter sensitivity analysis and makes it harder to calibrate regime feedback loops based on research updates.

## Proposed Solution

1. **Extend ParameterSweepConfig interface:**
   - Add `climateRegimeMultiplier` (default: 1.5, range: 1.0-2.0)
   - Add `qolRegimeMultiplier` (default: 1.5, range: 1.0-2.0)

2. **Refactor hardcoded values:**
   - `ClimateSystemPhase.ts`: Use config parameter
   - `RegionalQoLPhase.ts` (or equivalent): Use config parameter

3. **Research validation:**
   - Verify 1.5× multipliers are research-backed or document as calibration targets
   - Add citations to JSDoc if research exists

4. **Integration:**
   - Ensure multipliers propagate through initialization
   - Add to parameter sweep pilot script
   - Test N=3 runs with varied multipliers

## Research Needed

Verify current 1.5× multiplier values:
- Climate stability degradation: Is there research supporting this magnitude?
- QoL inequality amplification: What's the empirical basis?

If no strong research, document as "phenomenological calibration pending empirical validation."

## Effort Estimate

- Research validation: 1 hour
- Implementation: 1 hour
- Testing + integration: 1 hour
- Parameter sweep update: 1 hour
- Total: 2-4 hours

## Impact

- Enables full parameter sensitivity analysis across all regime multipliers
- Makes system more responsive to research updates
- Completes regime parameterization infrastructure started in M-3

## Files Modified

- `src/types/game.ts` - ParameterSweepConfig interface
- `src/simulation/initialization.ts` - Parameter application
- `src/simulation/engine/phases/ClimateSystemPhase.ts` - Use config value
- Regional QoL phase (TBD based on code search) - Use config value
- `scripts/parameterSweepPilot.ts` - Add new parameters

## Dependencies

Should wait for M-1 (ParameterSweepConfig consolidation) to complete first to avoid merge conflicts.

## Success Criteria

- All 4 regime multipliers configurable
- Research citations added or "calibration pending" documented
- N=3 parameter sweep test passes
- TypeScript clean, all tests passing
- No behavioral changes with default values
