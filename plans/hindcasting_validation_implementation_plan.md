# Hindcasting Validation Implementation Plan

**Date:** November 23, 2025
**Priority:** CRITICAL
**Source:** Nov 23 Coffee Chat (Cynthia + Sylvia consensus)
**Estimated Effort:** 2-3 weeks (phased implementation)

## Executive Summary

**Objective:** Run simulation starting 1990, validate against actual 2024 data to establish model validity.

**Core Question:** If the model cannot hindcast known history, forecasts are suspect.

## Current State Assessment

### What Exists
- **V-Dem Loader:** 30+ countries, 2024 snapshot only (timeseries available from source)
- **UNDP Loader:** HDI/MPI 2024 snapshot only (HDI timeseries back to 1990)
- **Scenario Infrastructure:** Supports `techDeploymentStartMonth` (precedent for non-2025 starts)
- **Deterministic RNG:** Required parameter, Monte Carlo ready
- **State Migration System:** Prepared for multi-version states

### Critical Gaps
1. **Historical Timeseries Loaders** - No 1990-2024 data loading
2. **Climate Historical Data** - No CO2, temperature, emissions curves
3. **Economic Historical Data** - No GDP, Gini, employment curves
4. **`simulationStartYear` Parameter** - Hardcoded to 2025
5. **Validation Scripts** - No hindcast comparison tooling

## Architecture Design

### Phase 1: Data Infrastructure (3-5 days)

**1.1 Extend V-Dem Loader**
```typescript
// src/data/loaders/vdemLoader.ts
async function loadTimeseries(startYear: number, endYear: number): Promise<VDemTimeseries>
```
- V-Dem CSP has annual data 1789-2024
- Key indicators: electoral democracy, liberal component, egalitarian
- Cache in `src/data/cache/historical/vdem_timeseries.json`

**1.2 Extend UNDP Loader**
```typescript
// src/data/loaders/undpLoader.ts
async function loadHDITimeseries(startYear: number, endYear: number): Promise<HDITimeseries>
```
- UNDP HDI available 1990-2024
- Key indicators: HDI, life expectancy, education, GNI per capita

**1.3 Create Climate Historical Loader**
```typescript
// src/data/loaders/historicalClimateLoader.ts
interface HistoricalClimateData {
  co2Ppm: number[];           // 1990-2024 annual Mauna Loa
  tempAnomaly: number[];      // NASA GISS
  emissionsMtCO2: number[];   // Global Carbon Budget
  seaLevelMm: number[];       // AVISO
}
```
- Data sources: NOAA, NASA GISS, Global Carbon Project

**1.4 Create Economic Historical Loader**
```typescript
// src/data/loaders/historicalEconomicLoader.ts
interface HistoricalEconomicData {
  globalGdpTrillion: number[];  // World Bank
  giniIndex: number[];          // World Bank
  unemploymentRate: number[];   // ILO
  sectoralEmployment: Record<string, number[]>;  // Agriculture, Industry, Services
}
```

### Phase 2: State Initialization (2-3 days)

**2.1 Add Year Parameter**
```typescript
// src/simulation/initialization.ts
function createDefaultInitialState(
  rng: () => number,
  simulationStartYear: number = 2025,  // NEW
  scenarios?: ScenarioDefinition[]
): GameState
```

**2.2 Create Historical State Factory**
```typescript
// src/simulation/historicalInitialization.ts
async function createHistoricalInitialState(
  year: number,
  rng: () => number
): Promise<GameState> {
  const vdemData = await loadVDemTimeseries(year, year);
  const undpData = await loadHDITimeseries(year, year);
  const climateData = await loadHistoricalClimate(year);
  const economicData = await loadHistoricalEconomic(year);

  return {
    currentYear: year,
    currentMonth: 0,
    globalMetrics: {
      population: getHistoricalPopulation(year),  // 5.3B in 1990
      qualityOfLife: undpData.hdi,
      wealthDistribution: economicData.giniInverted,
      ...
    },
    planetaryBoundariesSystem: {
      co2Concentration: climateData.co2Ppm,
      ...
    },
    aiAgents: year < 2018 ? [] : createHistoricalAIAgents(year),  // No AI before 2018
    ...
  };
}
```

**2.3 AI Bootstrap Logic**
- 1990-2017: No AI agents (empty array)
- 2018: GPT emergence (1 basic agent)
- 2020-2025: Scale up to current agent distribution
- Need research on actual AI capability timelines

### Phase 3: Validation Framework (3-5 days)

**3.1 Hindcast Runner Script**
```typescript
// scripts/hindcastValidation.ts
async function runHindcast(
  startYear: number = 1990,
  endYear: number = 2024,
  seeds: number[] = [42, 43, 44]
): Promise<HindcastResults> {
  const results: SimulationResult[] = [];

  for (const seed of seeds) {
    const rng = createDeterministicRng(seed);
    const initialState = await createHistoricalInitialState(startYear, rng);
    const result = runSimulation(initialState, (endYear - startYear) * 12);
    results.push(result);
  }

  return {
    predictions: extractAnnualPredictions(results),
    actuals: await loadHistoricalActuals(startYear, endYear),
    metrics: calculateFidelityMetrics(predictions, actuals)
  };
}
```

**3.2 Fidelity Metrics**
```typescript
interface FidelityMetrics {
  populationRMSE: number;      // Root mean squared error
  gdpR2: number;               // Coefficient of determination
  climateMAE: number;          // Mean absolute error
  governanceBias: number;      // Systematic over/under prediction
  overallFidelity: number;     // Composite score 0-1
}
```

**3.3 Output Report Generator**
- Annual comparison tables
- Trajectory plots (predicted vs actual)
- Divergence analysis by decade
- Sensitivity to starting parameters

### Phase 4: Research Documentation (1-2 days)

**4.1 Parameter Justification Document**
`research/hindcasting_baseline_parameters_19901123.md`
- Each 1990 parameter with peer-reviewed source
- Uncertainty ranges where available
- Data quality flags

**4.2 Validation Results Report**
`reviews/hindcasting_validation_results_YYYYMMDD.md`
- RMSE/R2/MAE for each tracked variable
- Which systems predict well vs poorly
- Recommendations for model improvement

## Key Technical Constraints

### AI Bootstrap Problem
AI agents didn't exist in 1990. Options:
1. **Zero agents pre-2018** - Run simulation without AI for first 28 years
2. **Birth events** - Dynamically create agents at historical emergence dates
3. **Proxy agents** - Model early AI as capability-limited versions

Recommendation: Option 2 (birth events) - most historically accurate.

### Determinism Requirement
All hindcast runs must be reproducible:
- CV < 0.01% across identical seeds (Priya's standard)
- No `Math.random()` calls in initialization
- Sorted iteration for Object.entries

### Missing Data Interpolation
Where historical data is incomplete:
- Linear interpolation between known points
- Flag interpolated values in output
- Sensitivity analysis on interpolated parameters

## Success Criteria

1. **Technical:** Hindcast runs 1990-2024 without crashes
2. **Determinism:** CV < 0.01% across 10 seeded runs
3. **Fidelity:** R2 > 0.7 for major variables (population, GDP, climate)
4. **Documentation:** All parameters source-cited

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Historical data gaps | HIGH | MEDIUM | Interpolation + uncertainty flags |
| AI bootstrap complexity | MEDIUM | HIGH | Phased agent introduction |
| Non-determinism in new code | LOW | CRITICAL | Priya validation before merge |
| Model structural failure | MEDIUM | CRITICAL | Accept as valid negative result |

## Implementation Priority

### Immediate (This Session)
- [x] Create implementation plan (this document)
- [ ] Identify existing historical data sources
- [ ] Document minimum viable data requirements

### Week 1
- [ ] Extend V-Dem loader for timeseries
- [ ] Extend UNDP loader for timeseries
- [ ] Create climate historical loader

### Week 2
- [ ] Add `simulationStartYear` parameter
- [ ] Create historical state factory
- [ ] Implement AI bootstrap logic

### Week 3
- [ ] Build hindcast validation script
- [ ] Run first 1990-2024 simulation
- [ ] Generate validation report

## Dependencies

- **Requires:** Historical data APIs (V-Dem, UNDP, NOAA, World Bank)
- **Blocked by:** None (greenfield implementation)
- **Blocks:** Model forecasting credibility claims

## Related Work

- `reviews/research_debate_20251122.md` - Research debate highlighting need for validation
- `research/SKEPTICAL_ANALYSIS_doom_predictions_20251110.md` - Sylvia's critique of forecast validity
- Scenario analysis framework (Phase 3 complete) - Infrastructure to reuse

---

**Created:** 2025-11-23 (autonomous-worker)
**Status:** PLAN COMPLETE - Ready for implementation
