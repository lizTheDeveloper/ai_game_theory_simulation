/**
 * Minimal Suffering Indicators Phase
 *
 * Updates dystopia baseline measurement using verifiable suffering metrics.
 * Order: 35.5 (late phase - after all crisis/death systems, near outcome calculation)
 *
 * Research foundation:
 * - Fund for Peace (2024): FSI >90 = state failure (TRL 9)
 * - Richardson et al. (2023): 6+ planetary boundaries breached (TRL 9)
 * - FAO (2024): IPC Phase 3+ classification (TRL 9)
 * - V-Dem (2024): Electoral Democracy Index <0.2 = autocracy (TRL 9)
 * - UNHCR (2024): 110M forcibly displaced (TRL 9)
 * - Martinez (2022): Authoritarian GDP overstatement +35% (TRL 8)
 * - Jerven (2013): Conflict zone data fabrication -40% (TRL 8)
 *
 * Design principles:
 * 1. Use existing simulation data (no new inputs)
 * 2. Track only verifiable metrics (deaths, displacement, malnutrition)
 * 3. Country-level with confidence flags (detect fabrication)
 * 4. NO AGGREGATION into single dystopia index (avoid Western bias)
 * 5. Focus on ACUTE SUFFERING, not relative well-being
 *
 * Mechanism:
 * 1. Extract Tier 1 metrics from population/refugee/famine systems
 * 2. Calculate Tier 2 structural indicators from trust/violence/GDP
 * 3. Update data confidence flags (autocracy/conflict adjustments)
 * 4. Detect dystopia conditions (acute/chronic/existential)
 * 5. Update global aggregates (population-weighted)
 * 6. Record monthly snapshot for historical tracking
 * 7. Log suffering metrics (if configured)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { updateMinimalSufferingSystem, logSufferingMetrics } from '../../minimalSufferingTracking';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { assertFinite, assertDefined } from '@/simulation/utils/assertions';

export class MinimalSufferingPhase implements SimulationPhase {
  readonly id = 'minimal_suffering';
  readonly name = 'Minimal Suffering Indicators';
  readonly order = 35.5; // After all crisis/death systems (35.x), before outcome metrics (36.0)

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // Update entire minimal suffering system
    setDeterministicRng(rng);
    // (includes Tier 1 metrics, Tier 2 indicators, dystopia detection, global aggregates)
    updateMinimalSufferingSystem(state);

    // Validate suffering metrics after update (prevent NaN propagation)
    if (state.minimalSufferingIndicators?.globalAggregates) {
      const global = state.minimalSufferingIndicators.globalAggregates;

      assertFinite(global.totalPopulation, {
        location: 'MinimalSufferingPhase.execute',
        valueName: 'globalAggregates.totalPopulation',
        month: state.currentMonth
      });

      assertFinite(global.acuteSufferingCount, {
        location: 'MinimalSufferingPhase.execute',
        valueName: 'globalAggregates.acuteSufferingCount',
        month: state.currentMonth
      });

      assertFinite(global.chronicSufferingCount, {
        location: 'MinimalSufferingPhase.execute',
        valueName: 'globalAggregates.chronicSufferingCount',
        month: state.currentMonth
      });
    }

    // Log metrics every 12 months for validation
    if (state.currentMonth % 12 === 0) {
      logSufferingMetrics(state);
    }

    return { events: [] };
  }
}
