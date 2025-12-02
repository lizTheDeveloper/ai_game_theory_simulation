# Phase 6: Multi-Paradigm DUI Simulation Integration Plan

**Status:** IN PROGRESS
**Started:** 2025-10-20
**Estimated Effort:** 4-6 hours

## Overview

Integrate the complete Multi-Paradigm DUI system (Phases 4-5) with the simulation engine, enabling paradigm tracking over time and paradigm-aware outcome reporting.

**Prerequisites:**
- Phase 4 complete (all loaders + normalizers)
- Phase 5 complete (aggregator + divergence + correlations + outcome classifier)

## Goals

1. **Add Multi-Paradigm DUI to GameState** - Track 4 paradigm scores throughout simulation
2. **Initialize paradigms at start** - Load baseline from Phase 5 aggregator
3. **Update paradigms during simulation** - Reflect simulation state changes in paradigm scores
4. **Track paradigm history** - Enable divergence trend detection and paradigm shift analysis
5. **Report paradigm outcomes** - Replace single DUI with Multi-Paradigm DUI in outputs

## Architecture

### Current Simulation State
- **Single DUI**: `state.globalMetrics.dystopiaUtopiaIndex` (0-100)
- **Quality of Life**: 17 dimensions tracked separately
- **Outcome Classification**: Extinction/Dystopia/Crisis/Status Quo/Utopia (single label)

### Target Multi-Paradigm State
- **4 Paradigm Scores**: Western, Development, Ecological, Indigenous (0-100 each)
- **Divergence Metrics**: Track paradigm conflicts over time
- **Outcome Classification**: Multi-paradigm outcome labels (e.g., "Development Utopia, Ecological Dystopia")
- **Historical Tracking**: 4 paradigm scores + divergence each month

## Implementation Strategy

### Phase 6.1: Add to GameState

**File:** `src/types/game.ts` (add to existing interface)

**Changes:**
```typescript
export interface GameState {
  // ... existing fields ...

  /**
   * Multi-Paradigm Dystopia-Utopia Index
   *
   * Tracks 4 paradigm perspectives simultaneously, preserving value conflicts.
   */
  multiParadigmDUI: MultiParadigmDUI;

  /**
   * Legacy single DUI (deprecated, kept for backward compatibility)
   *
   * Prefer multiParadigmDUI.outcome for richer outcome classification.
   */
  globalMetrics: {
    dystopiaUtopiaIndex: number; // Keep for now, derive from Development paradigm
    // ... other metrics ...
  };
}
```

**Migration Strategy:**
- Keep existing `dystopiaUtopiaIndex` for backward compatibility
- Derive it from Development paradigm score (closest analog)
- All new code should use `multiParadigmDUI`

### Phase 6.2: Initialization Module

**File:** `src/simulation/multiParadigmDUIInit.ts` (~200 lines)

**Responsibilities:**
1. Load baseline paradigm scores from Phase 5 aggregator
2. Initialize `state.multiParadigmDUI` with baseline data
3. Set up historical tracking (empty initially)
4. Handle cache failures gracefully (use neutral scores 50/50/50/50)

**Key Functions:**
```typescript
/**
 * Initialize Multi-Paradigm DUI from data loaders
 *
 * Loads baseline paradigm scores from V-Dem, UNDP, Ecological, WVS data.
 * Falls back to neutral scores (50/50/50/50) if data unavailable.
 *
 * @param rng - Random number generator (for uncertainty sampling)
 * @returns Initialized Multi-Paradigm DUI
 */
export async function initializeMultiParadigmDUI(
  rng: RNGFunction
): Promise<MultiParadigmDUI>

/**
 * Get baseline paradigm scores for a country
 *
 * @param countryCode - ISO 3166-1 alpha-3 country code
 * @param aggregated - Aggregated paradigm data
 * @returns Country paradigm scores, or neutral defaults
 */
function getCountryBaseline(
  countryCode: string,
  aggregated: AggregatedParadigmData
): { western: number; development: number; ecological: number; indigenous: number }
```

**Integration with `initialization.ts`:**
```typescript
// In createInitialGameState():
const multiParadigmDUI = await initializeMultiParadigmDUI(rng);

const state: GameState = {
  // ... existing initialization ...
  multiParadigmDUI,
  globalMetrics: {
    dystopiaUtopiaIndex: multiParadigmDUI.paradigmScores.development.value, // Derive from Development
    // ... other metrics ...
  },
};
```

### Phase 6.3: Simulation Update Phase

**File:** `src/simulation/engine/phases/MultiParadigmDUIUpdatePhase.ts` (~300 lines)

**Phase Order:** ~34 (after QoL updates, before outcome detection)

**Responsibilities:**
1. Update paradigm scores based on simulation state
2. Track changes in history array
3. Calculate divergence trend (CONVERGING/DIVERGING/STABLE)
4. Update outcome classification

**Mapping Simulation State → Paradigm Scores:**

**Western Liberal Paradigm:**
- Electoral Democracy: `state.government.democracy.electoralDemocracyIndex` (0-1)
- Civil Liberties: `state.socialCohesion.civilLiberties` (0-100)
- Rule of Law: `state.government.democracy.ruleOfLaw` (0-100)
- Economic Freedom: Derive from `state.government.economicPolicy.marketRegulation` (inverted)

**Development Paradigm:**
- Human Development: `state.globalMetrics.qualityOfLife` (0-100) - primary driver
- Poverty: `state.globalMetrics.survivalTier` (invert: low survival = high poverty)
- Life Expectancy: `state.globalMetrics.lifeExpectancy` (years → 0-100 scale)
- Education: Track via QoL education dimension

**Ecological Paradigm:**
- Planetary Boundaries: `state.environmental.planetaryBoundaries` (6/9 transgressed)
- Ecological Footprint: Derive from `state.environmental.resourceDepletion`
- Climate Stability: `state.environmental.climateState.globalTemperatureAnomaly`
- Air Quality: Derive from `state.environmental.pollutionLevel`

**Indigenous Paradigm:**
- Social Trust: `state.socialCohesion.trust` (0-100)
- Community Solidarity: `state.socialCohesion.communityBonds` (0-100)
- Cultural Continuity: Track via `state.socialCohesion.meaningCrisis` (inverted)

**Key Functions:**
```typescript
/**
 * Update Multi-Paradigm DUI based on simulation state
 *
 * @param state - Current game state
 * @param rng - Random number generator
 * @returns Updated paradigm scores
 */
function updateParadigmScores(
  state: GameState,
  rng: RNGFunction
): {
  western: number;
  development: number;
  ecological: number;
  indigenous: number;
}

/**
 * Add current scores to history and detect trends
 *
 * @param state - Current game state
 */
function updateHistoryAndTrends(state: GameState): void
```

### Phase 6.4: Outcome Reporter Integration

**Files to modify:**
- `scripts/monteCarloSimulation.ts` - Report multi-paradigm outcomes
- `src/simulation/engine.ts` - Use multi-paradigm outcome for final classification

**Changes:**
```typescript
// In monteCarloSimulation.ts aggregation:
outcomes: {
  multiParadigm: {
    western: [/* distribution */],
    development: [/* distribution */],
    ecological: [/* distribution */],
    indigenous: [/* distribution */],
  },
  contested: countContestedOutcomes(),
  paradigmShifts: detectParadigmShifts(), // Track changes >20 points
}
```

**New Aggregation Metrics:**
- Distribution of 4 paradigm scores across runs
- % of runs with contested outcomes (utopia in one + dystopia in another)
- Paradigm shift detection (e.g., "China shifted: Development-only → Development+Ecological")

### Phase 6.5: Testing

**Test File:** `tests/simulation/multiParadigmDUIIntegration.test.ts` (~250 lines)

**Test Coverage:**
1. Initialize Multi-Paradigm DUI at start
2. Paradigm scores update correctly during simulation
3. Historical tracking works (6+ months → trend detection)
4. Divergence trends detected (CONVERGING/DIVERGING/STABLE)
5. Outcome classification changes over time
6. Legacy DUI remains synchronized with Development paradigm
7. Cache failure fallback (neutral scores 50/50/50/50)
8. Monte Carlo aggregation works

## State Mapping Details

### Western Liberal Paradigm (from Simulation)

**Target Score Range:** 0-100 (matching V-Dem baseline)

**Indicators:**
1. **Electoral Democracy** (40% weight)
   - Source: `state.government.democracy.electoralDemocracyIndex` (0-1)
   - Transform: `* 100`

2. **Civil Liberties** (30% weight)
   - Source: `state.socialCohesion.civilLiberties` (0-100)
   - Transform: Direct

3. **Rule of Law** (20% weight)
   - Source: `state.government.democracy.ruleOfLaw` (0-100)
   - Transform: Direct

4. **Economic Freedom** (10% weight)
   - Source: `state.government.economicPolicy.marketRegulation` (0-100, higher = more regulation)
   - Transform: `100 - marketRegulation` (inverted)

**Aggregation:** Geometric mean (non-compensatory)

### Development Paradigm (from Simulation)

**Target Score Range:** 0-100 (matching UNDP HDI baseline)

**Indicators:**
1. **Quality of Life** (50% weight)
   - Source: `state.globalMetrics.qualityOfLife` (0-100)
   - Transform: Direct (primary driver)

2. **Survival Fundamentals** (30% weight)
   - Source: `state.globalMetrics.survivalTier` (0-5)
   - Transform: `(survivalTier / 5) * 100`

3. **Life Expectancy** (20% weight)
   - Source: `state.globalMetrics.lifeExpectancy` (years)
   - Transform: `((lifeExpectancy - 20) / (85 - 20)) * 100` (20 years = 0, 85 years = 100)

**Aggregation:** Geometric mean

### Ecological Paradigm (from Simulation)

**Target Score Range:** 0-100 (matching Richardson et al. 2023 baseline)

**Indicators:**
1. **Planetary Boundaries** (50% weight)
   - Source: `state.environmental.planetaryBoundaries` (object with 9 boundaries)
   - Transform: Count boundaries within safe limits → `(safe / 9) * 100`

2. **Resource Depletion** (25% weight)
   - Source: `state.environmental.resourceDepletion` (0-100, higher = worse)
   - Transform: `100 - resourceDepletion` (inverted)

3. **Climate Stability** (15% weight)
   - Source: `state.environmental.climateState.globalTemperatureAnomaly` (degrees C)
   - Transform: `100 - (anomaly / 2.0) * 100` (0°C = 100, 2°C = 0)

4. **Pollution Level** (10% weight)
   - Source: `state.environmental.pollutionLevel` (0-100, higher = worse)
   - Transform: `100 - pollutionLevel` (inverted)

**Aggregation:** Geometric mean

### Indigenous Paradigm (from Simulation)

**Target Score Range:** 0-100 (matching WVS baseline)

**Indicators:**
1. **Social Trust** (40% weight)
   - Source: `state.socialCohesion.trust` (0-100)
   - Transform: Direct

2. **Community Bonds** (40% weight)
   - Source: `state.socialCohesion.communityBonds` (0-100)
   - Transform: Direct

3. **Meaning Crisis** (20% weight)
   - Source: `state.socialCohesion.meaningCrisis` (0-100, higher = worse)
   - Transform: `100 - meaningCrisis` (inverted)

**Aggregation:** Geometric mean

## Calibration Strategy

**Problem:** Simulation paradigm scores may drift from baseline data over time.

**Solution:**
1. **Hybrid Approach:** Blend simulation-derived scores with baseline data
   - First 12 months: 70% baseline + 30% simulation
   - 12-24 months: 50% baseline + 50% simulation
   - 24+ months: 30% baseline + 70% simulation (simulation dominates)

2. **Rationale:**
   - Real-world paradigm shifts are slow (decades)
   - Simulation changes are faster (months)
   - Blending prevents unrealistic rapid shifts while allowing model dynamics

**Implementation:**
```typescript
function blendWithBaseline(
  simulationScore: number,
  baselineScore: number,
  month: number
): number {
  if (month <= 12) {
    return baselineScore * 0.7 + simulationScore * 0.3;
  } else if (month <= 24) {
    return baselineScore * 0.5 + simulationScore * 0.5;
  } else {
    return baselineScore * 0.3 + simulationScore * 0.7;
  }
}
```

## Expected Outcomes

### Baseline Validation (Month 0)
- Western: ~48 (matches Phase 5 global baseline)
- Development: ~87 (matches Phase 5 global baseline)
- Ecological: ~21 (matches Phase 5 global baseline)
- Indigenous: ~39 (matches Phase 5 global baseline)

### Typical Trajectories (120-month simulation)

**Utopia Path:**
- Western: 48 → 75 (democracy strengthens)
- Development: 87 → 95 (QoL improves)
- Ecological: 21 → 65 (boundaries recover)
- Indigenous: 39 → 60 (trust recovers)
- **Outcome:** "Multi-Paradigm Utopia (rare)"

**Dystopia Path:**
- Western: 48 → 25 (authoritarianism)
- Development: 87 → 40 (collapse)
- Ecological: 21 → 5 (boundary collapse)
- Indigenous: 39 → 15 (social fragmentation)
- **Outcome:** "Multi-Paradigm Dystopia"

**Norway Maintenance (contested equilibrium):**
- Western: 93 → 90 (slight decline)
- Development: 98 → 95 (stable)
- Ecological: 25 → 30 (slight improvement but still dystopian)
- Indigenous: 61 → 65 (stable)
- **Outcome:** "Ecological Dystopia, Liberal/Development/Indigenous Utopia" (persistent conflict)

## Files to Create/Modify

**New Files:**
1. `src/simulation/multiParadigmDUIInit.ts` (~200 lines)
   - Initialize paradigms from Phase 5 aggregator

2. `src/simulation/engine/phases/MultiParadigmDUIUpdatePhase.ts` (~300 lines)
   - Update paradigm scores during simulation

3. `tests/simulation/multiParadigmDUIIntegration.test.ts` (~250 lines)
   - Integration tests

**Modified Files:**
1. `src/types/game.ts` (~5 lines added)
   - Add `multiParadigmDUI: MultiParadigmDUI` to GameState

2. `src/simulation/initialization.ts` (~10 lines added)
   - Call `initializeMultiParadigmDUI()` during state creation

3. `src/simulation/engine/PhaseOrchestrator.ts` (~5 lines added)
   - Register MultiParadigmDUIUpdatePhase in phase list

4. `scripts/monteCarloSimulation.ts` (~50 lines modified)
   - Report multi-paradigm outcomes instead of single DUI

## Success Criteria

- ✅ Multi-Paradigm DUI initializes from Phase 5 aggregator
- ✅ Paradigm scores update correctly during simulation (test with known state changes)
- ✅ Historical tracking works (6+ months → trend detection)
- ✅ Divergence trends detected correctly
- ✅ Outcome classification matches paradigm scores
- ✅ Legacy DUI synchronized with Development paradigm
- ✅ Cache failure fallback works (neutral scores)
- ✅ All tests passing (target: 8-10 tests)
- ✅ Monte Carlo runs produce multi-paradigm outcome distributions

## Next Steps (Phase 7)

After Phase 6 complete:
- **Phase 7:** Frontend visualization (multi-paradigm dashboard, divergence charts)
- **Phase 8:** Monte Carlo analysis of paradigm trajectories (utopia/dystopia patterns)
- **Phase 9:** Policy interventions (can we shift paradigms intentionally?)

## Timeline

- **Phase 6.1:** GameState integration (~30 min)
- **Phase 6.2:** Initialization module (~1.5 hours)
- **Phase 6.3:** Simulation update phase (~2 hours)
- **Phase 6.4:** Outcome reporter integration (~1 hour)
- **Phase 6.5:** Testing (~1.5 hours)

**Total:** 4-6 hours

## Dependencies

- ✅ Phase 4 complete (all loaders)
- ✅ Phase 5 complete (aggregator, divergence, correlations, outcome classifier)
- ✅ `types/multiParadigmDUI.ts` interface defined
- ✅ Simulation state has required fields (democracy, socialCohesion, environmental, etc.)
