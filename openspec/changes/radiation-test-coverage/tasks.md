# Radiation Test Coverage - Implementation Tasks

## Phase 1: Test File Creation
**Duration:** 0.5 hours

- [ ] Create `src/types/radiation.test.ts`
- [ ] Set up test infrastructure (imports, describe blocks)

## Phase 2: Core Function Tests
**Duration:** 1 hour

- [ ] Test `initializeRadiationSystem()` - verify default state
- [ ] Test `createRadiationExposure()` - dose calculations, spatial distribution
- [ ] Test `progressRadiationExposure()` - half-life decay validation
  - Cs-137: 30.17 years
  - I-131: 8.02 days
- [ ] Test `isRadiationEventActive()` - active/inactive transitions
- [ ] Test `updateRadiationSystem()` - multi-exposure tracking
- [ ] Test `triggerRadiationExposure()` - event triggering
- [ ] Test `getRadiationStats()` - statistics calculation

## Phase 3: Edge Cases
**Duration:** 0.5 hours

- [ ] Test zero dose exposure
- [ ] Test extreme dose values
- [ ] Test concurrent multiple exposures
- [ ] Test spatial falloff edge cases

## Phase 4: Research Validation
**Duration:** 0.5 hours

- [ ] Validate half-life calculations match literature
- [ ] Verify LNT dose-response model implementation
- [ ] Check spatial distribution realism

## Phase 5: Coverage Validation
**Duration:** 0.5 hours

- [ ] Run coverage report
- [ ] Verify >90% coverage for radiation.ts
- [ ] Fill gaps if needed
- [ ] Commit tests
