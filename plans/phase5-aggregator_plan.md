# Phase 5: Multi-Paradigm Aggregator Implementation Plan

**Status:** IN PROGRESS
**Started:** 2025-10-20
**Estimated Effort:** 4-6 hours

## Overview

Implement the aggregator module that combines data from all 4 loaders (V-Dem, UNDP, Ecological, WVS) into the complete Multi-Paradigm DUI system with conflict detection, divergence tracking, and outcome classification.

**Prerequisites:** Phase 4 complete (all loaders + normalizers + tests passing)

## Architecture

### Input Sources (from Phase 4)
1. **V-Dem Loader** → Western Liberal paradigm (33 countries, HIGH confidence)
2. **UNDP Loader** → Development paradigm (33 HDI + 17 MPI countries, HIGH confidence)
3. **Ecological Loader** → Ecological paradigm (21 countries + global boundaries, MEDIUM-HIGH confidence)
4. **WVS Loader** → Indigenous paradigm proxies (28 countries, MEDIUM confidence)

### Output Structure
**`MultiParadigmDUI`** interface (from `types/multiParadigmDUI.ts`):
- 3 driving paradigms (`paradigmScores.western`, `.development`, `.ecological`)
- 1 diagnostic lens (`diagnosticLenses.indigenous`)
- Divergence metrics (std dev, max range, pairwise differences, trend)
- Correlations (6 pairwise correlations, validates research claims)
- Outcome classification (utopiasCount, dystopiasCount, contested, label)
- Historical tracking (4 paradigm scores over time)

**`CountryParadigmScores`** interface:
- Per-country 4 paradigm scores (0-100)
- Country-level divergence
- Dominant paradigm classification
- Data quality flags

## Implementation Strategy

### Phase 5.1: Aggregator Core Module
**File:** `src/data/aggregators/multiParadigmAggregator.ts`

**Responsibilities:**
1. Load data from all 4 loaders
2. Match countries across datasets (not all countries in all datasets)
3. Build `ParadigmScore` objects with indicators
4. Calculate global Multi-Paradigm DUI
5. Calculate per-country scores for available countries

**Key Functions:**
```typescript
/**
 * Load and aggregate all paradigm data
 *
 * @returns Complete Multi-Paradigm DUI with global + country-level scores
 */
async function aggregateParadigms(): Promise<{
  global: MultiParadigmDUI;
  countries: CountryParadigmScores[];
}>

/**
 * Build Western Liberal paradigm score from V-Dem
 */
function buildWesternParadigm(vdem: VDemCountryData[]): ParadigmScore & { drivesSimulation: true }

/**
 * Build Development paradigm score from UNDP HDI/MPI
 */
function buildDevelopmentParadigm(hdi: HDICountryData[], mpi: MPICountryData[]): ParadigmScore & { drivesSimulation: true }

/**
 * Build Ecological paradigm score from boundaries/footprint/air quality
 */
function buildEcologicalParadigm(boundaries: PlanetaryBoundariesData, footprint: EcologicalFootprintData[], airQuality: AirQualityData[]): ParadigmScore & { drivesSimulation: true }

/**
 * Build Indigenous diagnostic lens from WVS proxies + simulation mechanics
 */
function buildIndigenousLens(wvs: WVSCountryData[]): DiagnosticLens
```

**Matching Strategy:**
- Get all unique country codes from all 4 datasets
- For each country, collect available paradigm scores
- Track data availability per country
- Mark confidence based on data completeness

### Phase 5.2: Divergence Calculator
**File:** `src/data/aggregators/divergenceCalculator.ts`

**Responsibilities:**
1. Calculate overall divergence (std dev across 4 scores)
2. Calculate max range (max - min)
3. Calculate 6 pairwise differences
4. Detect trend over history (CONVERGING/DIVERGING/STABLE)

**Key Functions:**
```typescript
/**
 * Calculate paradigm divergence metrics
 *
 * @param scores - 4 paradigm scores (0-100)
 * @param history - Historical paradigm scores (for trend detection)
 * @returns Divergence metrics
 */
function calculateDivergence(
  scores: { western: number; development: number; ecological: number; indigenous: number },
  history: Array<{ month: number; western: number; development: number; ecological: number; indigenous: number }>
): ParadigmDivergence
```

**Validation Targets:**
- Singapore: maxRange ~72 (Development 94 - Western 22)
- Norway: maxRange ~73 (Development 98 - Ecological 25)
- Consensus (if exists): maxRange <20

### Phase 5.3: Correlation Tracker
**File:** `src/data/aggregators/correlationTracker.ts`

**Responsibilities:**
1. Calculate Pearson correlations across countries
2. Validate against research claims:
   - Western ↔ Development ~0.7-0.9 (wealth correlation)
   - Development ↔ Ecological ~-0.6 (consumption-sustainability tradeoff)
   - Ecological ↔ Indigenous ~0.5-0.7 (harmony alignment)

**Key Functions:**
```typescript
/**
 * Calculate paradigm correlations across countries
 *
 * @param countries - Array of country paradigm scores
 * @returns 6 pairwise correlations
 */
function calculateCorrelations(countries: CountryParadigmScores[]): ParadigmCorrelations
```

**Test Validation:**
- Should produce negative correlation for Development-Ecological
- Should produce positive correlation for Western-Development

### Phase 5.4: Outcome Classifier
**File:** `src/data/aggregators/outcomeClassifier.ts`

**Responsibilities:**
1. Count utopias (≥80) and dystopias (≤30)
2. Detect contested outcomes (some utopia, some dystopia)
3. Generate human-readable labels

**Key Functions:**
```typescript
/**
 * Classify multi-paradigm outcome
 *
 * @param scores - 4 paradigm scores
 * @returns Outcome classification
 */
function classifyOutcome(
  scores: { western: number; development: number; ecological: number; indigenous: number }
): MultiParadigmOutcomeClassification
```

**Label Examples:**
- "Development Utopia, Liberal Dystopia" (Singapore: Dev 94, Western 22)
- "Ecological Dystopia, Liberal/Development Utopia" (Norway: Eco 25, Western 93, Dev 98)
- "Multi-Paradigm Dystopia" (Yemen: all <30)
- "All-Four Utopia" (extremely rare, 0.5% of runs)

### Phase 5.5: Integration & Testing

**Test File:** `tests/data/multiParadigmAggregator.test.ts`

**Test Coverage:**
1. Load all paradigms and aggregate
2. Validate global paradigm scores
3. Validate country-level scores for known examples:
   - Norway: Western 93.0, Development 98.3, Ecological 25.4, Indigenous 61.0
   - Singapore: Western 51.6, Development 93.9
   - USA: Western 85.0, Development ~89
4. Validate divergence calculations (Singapore maxRange ~72)
5. Validate correlations (Development-Ecological negative)
6. Validate outcome classifications (Singapore contested, Norway contested)
7. Batch processing (all countries)

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     Phase 4 Loaders                          │
├─────────────────────────────────────────────────────────────┤
│  vdemLoader      → 33 countries (Western Liberal)           │
│  undpLoader      → 33 HDI + 17 MPI (Development)            │
│  ecologicalLoader → 21 footprint/air + global boundaries     │
│  wvsLoader       → 28 countries (Indigenous proxies)        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              multiParadigmAggregator                         │
├─────────────────────────────────────────────────────────────┤
│  1. Load all 4 data sources                                  │
│  2. Match countries across datasets                          │
│  3. Build ParadigmScore objects (indicators + metadata)      │
│  4. Calculate global aggregate (global boundaries)           │
│  5. Calculate per-country scores (unique countries)          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   Calculations                               │
├─────────────────────────────────────────────────────────────┤
│  divergenceCalculator  → Divergence metrics                 │
│  correlationTracker    → 6 pairwise correlations            │
│  outcomeClassifier     → Utopia/dystopia classification      │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Output                                    │
├─────────────────────────────────────────────────────────────┤
│  MultiParadigmDUI  → Global + country-level scores          │
│  - paradigmScores (3 driving)                                │
│  - diagnosticLenses (1 reporting-only)                       │
│  - divergence                                                │
│  - correlations                                              │
│  - outcome                                                   │
│  - history (empty initially, filled during simulation)       │
│                                                              │
│  CountryParadigmScores[] → Per-country paradigm profiles     │
└─────────────────────────────────────────────────────────────┘
```

## Expected Outcomes

### Global Paradigm Scores (2024 baseline)
Based on Phase 4 data:

**Western Liberal:** ~45-55 (global average, few utopias)
- Utopias (~8 countries): Norway 93.0, Sweden, Denmark, Netherlands
- Dystopias (~60 countries): Saudi Arabia 5.7, China 6.0, North Korea, Eritrea

**Development:** ~60-70 (improving trend)
- Utopias (~30 countries): Norway 98.3, Singapore 93.9, Germany 95.6
- Dystopias (~15 countries): Niger, South Sudan, Chad

**Ecological:** ~15-25 (global crisis)
- Utopias: ZERO countries (all fail footprint or boundaries)
- Dystopias (~180 countries): India 3.7, USA 22.4, Norway 25.4
- Global boundaries: 6 of 9 transgressed (5.3/100)

**Indigenous:** ~35-45 (proxy data, low confidence)
- Utopias (~1-2 countries): Norway 61.0, Netherlands, Sweden
- Dystopias (~25 countries): Brazil 22.9, Russia, China

### Known Paradigm Conflicts

**Singapore (Development Utopia, Western Dystopia):**
- Western: 51.6 (HYBRID REGIME)
- Development: 93.9 (VERY HIGH DEVELOPMENT)
- Divergence: ~42 points
- Label: "Development Utopia, Liberal Dystopia"

**Norway (Western/Development Utopia, Ecological Dystopia):**
- Western: 93.0 (LIBERAL DEMOCRACY)
- Development: 98.3 (VERY HIGH DEVELOPMENT)
- Ecological: 25.4 (HIGH RISK)
- Indigenous: 61.0 (COMMUNITARIAN)
- Divergence: ~73 points
- Label: "Ecological Dystopia, Liberal/Development/Indigenous Utopia"

**India (Ecological Dystopia Despite Low Footprint):**
- Development: 64.4 (HIGH DEVELOPMENT)
- Ecological: 3.7 (DYSTOPIA - air quality 58 μg/m³)
- Divergence: ~61 points

### Correlation Validation

**Expected correlations (from Phase 2 research):**
- Western ↔ Development: ~0.7-0.9 (wealth enables democracy)
- Development ↔ Ecological: ~-0.6 (consumption-sustainability tradeoff)
- Western ↔ Ecological: ~-0.4 (democracies consume more)
- Ecological ↔ Indigenous: ~0.5-0.7 (harmony alignment)
- Western ↔ Indigenous: ~0.4-0.6 (civic participation overlap)
- Development ↔ Indigenous: ~0.2-0.4 (weak link)

**Test validation:** Assert correlations within ±0.3 of expected values

## Files to Create

1. **`src/data/aggregators/multiParadigmAggregator.ts`** (~400 lines)
   - Main aggregation logic
   - Load all loaders, match countries, build paradigm scores

2. **`src/data/aggregators/divergenceCalculator.ts`** (~150 lines)
   - Divergence calculations (std dev, max range, pairwise)
   - Trend detection (CONVERGING/DIVERGING/STABLE)

3. **`src/data/aggregators/correlationTracker.ts`** (~100 lines)
   - Pearson correlation calculations
   - Validation against research claims

4. **`src/data/aggregators/outcomeClassifier.ts`** (~150 lines)
   - Outcome classification (utopias/dystopias count)
   - Label generation ("Development Utopia, Liberal Dystopia")

5. **`tests/data/multiParadigmAggregator.test.ts`** (~350 lines)
   - Load and aggregate test
   - Global paradigm score validation
   - Country-level validation (Norway, Singapore, USA)
   - Divergence validation
   - Correlation validation
   - Outcome classification tests
   - Batch processing

## Success Criteria

- ✅ All 4 loaders successfully integrated
- ✅ Global paradigm scores reasonable (Western ~50, Development ~65, Ecological ~20, Indigenous ~40)
- ✅ Country-level scores match Phase 4 results (Norway, Singapore examples)
- ✅ Divergence correctly identifies conflicts (Singapore 72 points, Norway 73 points)
- ✅ Correlations validate research claims (Development-Ecological negative, Western-Development positive)
- ✅ Outcome classifier produces correct labels
- ✅ All tests passing (target: 10-12 tests)
- ✅ Data availability tracking working (some countries missing WVS, MPI)

## Next Steps (Phase 6)

After Phase 5 complete:
- **Phase 6:** Integration with simulation engine (`src/simulation/multiParadigmDUI.ts`)
- Add Multi-Paradigm DUI to `GameState` interface
- Update initialization to load paradigm data
- Create phase to update paradigm scores during simulation
- Track paradigm shifts over time (history array)
- Monte Carlo validation (paradigm correlations hold across 100+ runs)

## Timeline

- **Phase 5.1:** Aggregator Core (~2 hours)
- **Phase 5.2:** Divergence Calculator (~1 hour)
- **Phase 5.3:** Correlation Tracker (~1 hour)
- **Phase 5.4:** Outcome Classifier (~1 hour)
- **Phase 5.5:** Testing (~1-2 hours)

**Total:** 4-6 hours

## Dependencies

- ✅ Phase 4 complete (all loaders passing tests)
- ✅ `types/multiParadigmDUI.ts` interface defined
- ✅ Normalizers produce `ParadigmIndicator[]` arrays
