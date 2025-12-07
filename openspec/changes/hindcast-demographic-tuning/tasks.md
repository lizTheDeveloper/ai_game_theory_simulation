# Hindcast Demographic Transition Tuning - Implementation Tasks

## Phase 1: Research (Quality Gate 1)
**Duration:** 1-2 hours

- [ ] Collect UN WPP 2024 regional CDR data for:
  - East Asia, South Asia, Sub-Saharan Africa
  - Europe, North America, Latin America
  - MENA, Southeast Asia, Central Asia, Oceania
- [ ] Document CDR trends 1990-2025 per region
- [ ] Calculate expected impact on population overshoot
- [ ] Add to research verification queue
- [ ] Pass research validation (Grade B+ required)

## Phase 2: Implementation
**Duration:** 2-3 hours

- [ ] Create `getRegionalHistoricalDeathRate(regionName, year)` function
  - Parallel to existing `getRegionalHistoricalBirthRate()`
  - Same interpolation approach
  - Add to `BaselineMortalityPhase.ts`
- [ ] Integrate into `regionalPopulations.ts`
  - Apply regional CDR scaling in historical mode
  - Add diagnostic logging
  - Add assertions to prevent NaN
- [ ] Update inline comments with UN WPP 2024 citations

## Phase 3: Validation (Priya)
**Duration:** 2-3 hours

- [ ] Run hindcast validation (1990-2020)
- [ ] Compare population trajectories by year
- [ ] Check deviation <5% for all checkpoints
- [ ] Verify no regression in early years (1990-2005)
- [ ] Run Monte Carlo N≥10 for determinism
- [ ] Check CV < 0.01%

## Phase 4: Architecture Review (Quality Gate 2)
**Duration:** 1 hour

- [ ] Submit for architecture-skeptic review
- [ ] Address CRITICAL/HIGH issues if any
- [ ] Pass QG2 (Grade B+ required)

## Phase 5: Documentation
**Duration:** 1 hour

- [ ] Update wiki with regional CDR implementation
- [ ] Document UN WPP 2024 sources
- [ ] Add hindcast validation results
- [ ] Add to completed features list
