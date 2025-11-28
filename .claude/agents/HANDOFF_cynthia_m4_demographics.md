# HANDOFF: M-4 Population Demographics Research

**Date:** 2025-11-28
**From:** Orchestrator
**To:** Cynthia (super-alignment-researcher)
**Task:** Gather demographic parameters for M-4 Population Demographics Refinement
**Priority:** MEDIUM (from roadmap)

## Objective

Reduce population simulation error from **+24.5% → <10%** (currently ~10.1B vs 8.12B target for 2024)

## Problem Statement

The simulation currently overshoots by ~2B people. Analysis shows:
- Birth rates too high for 1990-2024 period
- Mortality rates too low
- Static baseline rates don't capture demographic transition

## Current Implementation

The simulation uses **7 regions** with **static baseline birth/death rates**:

| Region | Baseline Pop (M) | Birth Rate | Death Rate | TFR |
|--------|------------------|------------|------------|-----|
| East Asia | 1677 | 0.010 | 0.008 | 1.3 |
| South Asia | 2048 | 0.019 | 0.007 | 2.1 |
| Sub-Saharan Africa | 1220 | 0.034 | 0.009 | 4.3 |
| Europe | 742 | 0.010 | 0.011 | 1.5 |
| Latin America | 664 | 0.015 | 0.006 | 2.0 |
| North America | 603 | 0.011 | 0.009 | 1.7 |
| Middle East & North Africa | 586 | 0.023 | 0.006 | 2.7 |
| **TOTAL** | **7540** | - | - | - |

**Gap:** Total baseline is 7540M but should be ~8120M for 2024

## Research Deliverables

### 1. Historical TFR Evolution (1990-2024)

For each of the 7 regions above:
- Source: UN World Population Prospects 2024 revision (primary)
- Format: Decadal snapshots (1990, 2000, 2010, 2020, 2024)
- Identify: Which regions had rapid decline vs stabilization vs still high fertility

**Key Questions:**
- What was East Asia's TFR in 1990? (Is current 1.3 appropriate for 2024?)
- Has Sub-Saharan Africa's TFR declined from 4.3? (demographic transition progress)
- Are the simulation's current TFR values appropriate for 2024 endpoint?

### 2. Historical Mortality Evolution (1990-2024)

For each region:
- Crude Death Rate (CDR) OR Life Expectancy at birth (either is fine)
- Source: UN WPP 2024, WHO Global Health Observatory
- Account for: Aging populations (Europe), healthcare improvements (South Asia)

**Key Questions:**
- Why is Europe's death rate higher (0.011) than younger regions? (aging)
- Has mortality in developing regions declined? (healthcare improvements)
- COVID-19 impact: Did 2020-2021 mortality spike reverse long-term trends?

### 3. 2024 Population Benchmarks

What should each region's population be in 2024 according to UN data?

**Key Questions:**
- Which regions are most mis-calibrated in current baseline?
- Is the 7540M → 8120M gap distributed evenly or concentrated?
- Do migration flows significantly affect regional totals? (Europe refugees, US immigration)

### 4. Parameter Recommendations

**Critical Decision:** Should birth/death rates be:
- **Time-varying** (change each year from 1990→2024)? OR
- **One-time recalibration** (better 2024 snapshot values)?

**Provide:**
- Specific numerical targets for each region's rates
- Justification: Will time-varying improve accuracy significantly?
- Migration flows: Are they material enough to model explicitly?

### 5. Demographic Transition Classification

Group regions by transition stage:
- **Completed transition:** Low TFR, aging (Europe, East Asia)
- **Mid-transition:** Declining TFR, young but aging (Latin America, South Asia)
- **Pre-transition:** High TFR, very young (Sub-Saharan Africa)

**Why this matters:** Different interventions affect each stage differently (AI healthcare, education, economic development)

## Output Format

Create: **`research/population_demographics_regional_20251128.md`**

Structure:
1. **Executive Summary** (parameter recommendations, expected improvement)
2. **Regional TFR Tables** (historical evolution)
3. **Regional Mortality Tables** (historical evolution)
4. **2024 Population Benchmarks** (validation targets)
5. **Implementation Guidance** (time-varying vs static, migration)
6. **Demographic Transition Analysis** (stage classification)
7. **Sources** (2+ peer-reviewed per claim, UN WPP 2024 primary)

## Quality Gates

1. **Sylvia (research-skeptic) validation:** Must pass before implementation
   - Check for contradictory data sources
   - Validate regional mappings (UN regions → simulation regions)
   - Ensure parameter recommendations are implementable

2. **Roy (simulation-maintainer) implementation:** Will use your parameters
   - Must have concrete numerical targets
   - Must specify time-varying vs static decision
   - Must handle edge cases (aging, migration)

3. **Monte Carlo validation:** N=10 runs, target <10% error
   - Your parameters will be tested against 1990-2024 hindcast
   - Success = <10% deviation from UN 2024 population data

## Context Files

- Current implementation: `/src/simulation/populationDynamics.ts` (lines 33-200)
- Roadmap entry: `/plans/MASTER_IMPLEMENTATION_ROADMAP.md` (M-4, lines 554-567)
- Previous research: `/research/hindcast_calibration_parameters_20251127.md` (HIGH-7 section)

## Timeline

**Phase 1 (This Task):** 1-2 hours research
**Phase 2:** Sylvia validation (30 min)
**Phase 3:** Roy implementation (2-3 hours)
**Phase 4:** Monte Carlo validation + review (2-3 hours)
**Total:** 4-6 hours end-to-end

## Success Criteria

- ✅ UN WPP 2024 data for all 7 regions (TFR + mortality)
- ✅ Clear parameter recommendations (numerical targets)
- ✅ Time-varying decision justified (with rationale)
- ✅ 2+ peer-reviewed sources per claim
- ✅ Passes Sylvia's critique (no methodological flaws)
- ✅ Roy can implement without ambiguity
- ✅ Monte Carlo achieves <10% error (from current 24.5%)

## Next Steps

1. **Cynthia:** Gather research, create document
2. **Post to research channel:** Findings ready for validation
3. **Sylvia:** Validate sources and methodology (Quality Gate 1)
4. **Roy:** Implement calibration (Phase 2)
5. **Monte Carlo:** Validate improvement (Phase 3)

---

**Ready to begin research. Post findings to research channel when complete.**
