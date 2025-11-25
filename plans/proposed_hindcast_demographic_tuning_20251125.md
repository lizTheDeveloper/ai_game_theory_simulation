# Hindcast Demographic Transition Tuning

**Created:** Nov 25, 2025
**Status:** PROPOSED (MEDIUM Priority)
**Issue:** 2010-2020 population overshoot of 6-10%

## Problem Statement

The hindcast validation shows population tracking within 5% through 2005, but 6-10% overshoot in 2010-2020:
- 1990: -0.57% (nearly perfect)
- 1995: -5.62% (slight undershoot)
- 2000: +1.72% (excellent)
- 2005: +3.96% (good)
- 2010: +6.86% (was 14%)
- 2020: +10.30% (was 15%)

The model produces ~500M too many people by 2020.

## Root Cause Analysis

### Investigated (Already Fixed)
1. **Regional birth rates** - FIXED (Nov 25): Region-specific CBR curves now applied
   - Implementation: `getRegionalHistoricalBirthRate()` in BaselineMortalityPhase.ts
   - Data: UN WPP 2024 TFR → CBR with ratio 7.5

### Suspected (Needs Investigation)
1. **Regional death rates NOT scaled for historical mode**
   - Birth rates have region-specific historical curves
   - Death rates use global HISTORICAL_CDR only
   - Death rates varied significantly by region:
     - Sub-Saharan Africa 1990: ~15/1000 → 2020: ~8/1000
     - Europe 1990: ~11/1000 → 2020: ~12/1000 (aging population)
   - Missing regional CDR scaling likely accounts for overshoot

2. **CO2 concentration 25-32% too high** (separate issue)
   - Emissions model needs calibration
   - Not directly related to population but indicates model drift

## Proposed Solution

### Phase 1: Research (Cynthia)
1. Collect UN WPP 2024 regional CDR data for:
   - East Asia, South Asia, Sub-Saharan Africa
   - Europe, North America, Latin America
   - MENA, Southeast Asia, Central Asia, Oceania
2. Document CDR trends 1990-2025 per region
3. Calculate expected impact on population

### Phase 2: Implementation (Roy)
1. Create `getRegionalHistoricalDeathRate(regionName, year)` function
   - Parallel to existing birth rate function
   - Same interpolation approach
2. Integrate into `regionalPopulations.ts`
   - Apply scaling in historical mode
   - Add diagnostic logging

### Phase 3: Validation (Priya)
1. Run hindcast validation (1990-2020)
2. Compare population trajectories by year
3. Target: <5% deviation through 2020

## Success Criteria
- Population deviation <5% for all checkpoint years (1990, 1995, 2000, 2005, 2010, 2015, 2020)
- No regression in early years (maintain current accuracy through 2005)
- All parameters backed by UN WPP 2024 data

## Complexity
- 2 systems affected (BaselineMortalityPhase, regionalPopulations)
- ~100 lines of code
- Research requirement: Regional CDR data from UN WPP 2024

## References
- UN World Population Prospects 2024: https://population.un.org/wpp/
- Existing implementation: `src/simulation/engine/phases/BaselineMortalityPhase.ts`
- Regional population system: `src/simulation/regionalPopulations.ts`
