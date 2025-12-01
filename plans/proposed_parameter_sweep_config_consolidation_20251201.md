# Proposed Plan: ParameterSweepConfig Consolidation

**Date:** December 1, 2025
**Priority:** MEDIUM
**Effort:** 1-2 hours
**Type:** Architecture cleanup

## Problem Statement

Dual `ParameterSweepConfig` interface definitions exist in the codebase:
1. `src/simulation/initialization.ts` - operational definition
2. `scripts/parameterSweepPilot.ts` - script definition

This violates DRY principle and creates risk of divergence if parameters are added/modified.

## Proposed Solution

1. **Create canonical type definition:**
   - Add `ParameterSweepConfig` to `src/types/game.ts` or new `src/types/parameterSweep.ts`
   - Include JSDoc documentation with parameter ranges and research sources

2. **Refactor existing code:**
   - Update `src/simulation/initialization.ts` to import canonical type
   - Update `scripts/parameterSweepPilot.ts` to import canonical type
   - Ensure both use exact same interface

3. **Add validation:**
   - Runtime validation that parameters are within research-backed ranges
   - TypeScript ensures compile-time type safety

## Research Needed

None - parameters already validated in M-3 completion.

## Effort Estimate

- Type consolidation: 30 minutes
- Refactoring imports: 30 minutes
- Validation + testing: 30 minutes
- Total: 1-2 hours

## Impact

- Eliminates architectural debt
- Prevents future divergence bugs
- Single source of truth for parameter sweep config

## Files Modified

- `src/types/game.ts` or `src/types/parameterSweep.ts` (new canonical definition)
- `src/simulation/initialization.ts` (import, remove duplicate)
- `scripts/parameterSweepPilot.ts` (import, remove duplicate)

## Dependencies

None - can proceed immediately.

## Success Criteria

- Single `ParameterSweepConfig` definition in codebase
- TypeScript compilation clean
- All tests passing
- No behavioral changes
