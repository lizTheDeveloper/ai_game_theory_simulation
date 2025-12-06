# Delta for Simulation Specification

## ADDED Requirements

### Requirement: Regional Biodiversity Test Coverage
The simulation SHALL maintain >90% test coverage for regional biodiversity modeling.

#### Scenario: Habitat Degradation Testing
- WHEN testing habitat degradation mechanics
- THEN tests MUST verify land use, pollution, and climate impacts
- AND combined stressor effects MUST be validated
- AND degradation rates MUST match research-backed values

#### Scenario: Extinction Dynamics Testing
- WHEN testing species extinction dynamics
- THEN extinction thresholds MUST be research-validated
- AND tipping points MUST trigger rapid species loss
- AND recovery MUST be slower than degradation (hysteresis)

#### Scenario: Edge Case Coverage
- WHEN testing edge cases
- THEN total ecosystem collapse MUST be tested
- AND pristine recovery MUST be tested
- AND rapid transitions (shock events) MUST be tested

---

## Implementation Notes

**Target file:** `src/types/regionalBiodiversity.ts`
**Test file:** `src/types/__tests__/regionalBiodiversity.test.ts`
**Current coverage:** 77.29%
**Target coverage:** >90%
**Gap lines:** 19, 30, 104-112, 116-152, 155-169, 173-176

**Research references:**
- Planetary Boundaries framework (Richardson et al. 2023)
- Species-area relationship (power law)
- Habitat fragmentation effects
