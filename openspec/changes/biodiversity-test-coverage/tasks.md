# Implementation Tasks

## Phase 1: Test File Setup
- [ ] Create `src/types/__tests__/regionalBiodiversity.test.ts`
- [ ] Import necessary types and utilities
- [ ] Set up test fixtures (baseline state, degradation scenarios)

## Phase 2: Initialization Tests
- [ ] Test: Verify regional baseline states are correctly initialized
- [ ] Test: Check all regions have valid initial habitat integrity
- [ ] Test: Validate species count distributions

## Phase 3: Habitat Degradation Tests
- [ ] Test: Land use impacts reduce habitat integrity
- [ ] Test: Pollution impacts compound with land use
- [ ] Test: Climate impacts (temperature, precipitation changes)
- [ ] Test: Combined stressor effects (multiplicative vs additive)

## Phase 4: Species Dynamics Tests
- [ ] Test: Extinction thresholds trigger at research-backed levels
- [ ] Test: Tipping points cause rapid species loss
- [ ] Test: Recovery is slower than degradation
- [ ] Test: Edge case - Total ecosystem collapse

## Phase 5: Recovery Dynamics Tests
- [ ] Test: Restoration tech effectiveness ranges
- [ ] Test: Recovery timescales (decades to centuries)
- [ ] Test: Edge case - Pristine recovery from minimal degradation
- [ ] Test: Edge case - Rapid transitions (shock events)

## Phase 6: Validation
- [ ] Verify coverage >90%
- [ ] Run all tests (must pass)
- [ ] Type check (must pass)
- [ ] Review extinction thresholds against research

## Phase 7: Documentation
- [ ] Add code comments linking to research sources
- [ ] Update test documentation
