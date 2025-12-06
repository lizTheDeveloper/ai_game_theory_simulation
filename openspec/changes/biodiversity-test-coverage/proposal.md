# Proposal: Biodiversity Test Coverage

**Created:** December 2, 2025
**Domain:** Simulation (Testing)
**Priority:** LOW
**Estimated Effort:** 2-3 hours

---

## Rationale

Current biodiversity modeling (`src/types/regionalBiodiversity.ts`) has 77.29% test coverage with 0 test files. Gap coverage: lines 19, 30, 104-112, 116-152, 155-169, 173-176.

This code implements research-backed planetary boundaries (biosphere integrity). Without comprehensive tests, we risk regressions in:
- Regional baseline state initialization
- Habitat degradation calculations (land use, pollution, climate impacts)
- Species extinction dynamics (thresholds, tipping points)
- Recovery dynamics (restoration tech effectiveness, timescales)

---

## Scope

Create comprehensive unit tests for regional biodiversity tracking system:

**Test areas:**
1. Initialization - Verify regional baseline states
2. Habitat degradation - Test land use, pollution, climate impacts
3. Species dynamics - Extinction thresholds, tipping points
4. Recovery - Restoration tech effectiveness, time scales
5. Edge cases - Total collapse, pristine recovery, rapid transitions

**Research context:**
- Planetary Boundaries framework (Richardson et al. 2023)
- Species-area relationship (power law)
- Habitat fragmentation effects

---

## Success Criteria

- Test coverage >90% (target lines 19-176)
- 12+ tests covering all core mechanics
- Extinction thresholds research-validated
- All tests passing
- Type checking passing

---

## Implementation Agent

`unit-test-writer` agent
