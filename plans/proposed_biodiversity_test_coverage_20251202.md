# Regional Biodiversity Test Coverage

**Priority:** LOW
**Effort:** 2-3 hours
**Agent:** unit-test-writer

## Problem
`src/types/regionalBiodiversity.ts` has 77.29% test coverage with 0 test files. Gaps: lines 19, 30, 104-112, 116-152, 155-169, 173-176.

## Exported Surface
- Regional biodiversity tracking system
- Habitat integrity calculations
- Species extinction modeling
- Recovery dynamics

## Test Requirements
1. **Initialization:** Verify regional baseline states
2. **Habitat degradation:** Test land use, pollution, climate impacts
3. **Species dynamics:** Extinction thresholds, tipping points
4. **Recovery:** Restoration tech effectiveness, time scales
5. **Edge cases:** Total collapse, pristine recovery, rapid transitions

## Research Context
- Planetary Boundaries framework (biosphere integrity)
- Species-area relationship (power law)
- Habitat fragmentation effects

## Success Criteria
- Coverage >90% (target lines 19-176)
- 12+ tests covering all core mechanics
- Extinction thresholds research-validated
