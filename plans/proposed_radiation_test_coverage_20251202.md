# Radiation System Test Coverage

**Priority:** LOW
**Effort:** 2-3 hours
**Agent:** unit-test-writer

## Problem
`src/types/radiation.ts` has 59.60% test coverage with 0 test files. Gaps: lines 42-65, 68-69, 75-138, 141-156, 162-183, 186-188, 192-199, 202-205.

## Exported Surface
- `RadiationExposureEvent` interface (17 properties)
- `RadiationSystem` interface (12 properties)
- 9 functions: initialize, create, progress, isActive, update, trigger, getStats

## Test Requirements
1. **Initialization:** Verify default state
2. **Exposure creation:** Test dose calculations, spatial distribution, source types
3. **Progression:** Verify decay (half-life), population impacts, health effects
4. **System updates:** Multi-exposure tracking, active/inactive transitions
5. **Edge cases:** Zero dose, extreme values, concurrent exposures

## Research Context
- Half-life calculations (Cs-137: 30.17y, I-131: 8.02d)
- Linear no-threshold (LNT) dose-response
- Spatial falloff modeling

## Success Criteria
- Coverage >90% (target lines 42-205)
- 15+ tests covering all exports
- Research-backed dose calculations validated
