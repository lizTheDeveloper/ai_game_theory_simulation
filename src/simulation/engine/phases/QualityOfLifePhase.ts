/**
 * Quality of Life Phase
 *
 * Updates multi-dimensional quality of life systems and calculates aggregate QoL
 * Order: 19.5 (BEFORE population mortality so it uses current values)
 * FIX (Oct 25, 2025): Moved from 34.0 to 19.5 - population was using stale data
 * FIX (Oct 26, 2025): Regional → Global aggregation architecture
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { updateQualityOfLifeSystems, calculateQualityOfLife, aggregateGlobalQoL } from '../../calculations';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import {
  assertFinite,
  assertProbability,
  assertStateProperty,
  assertNonEmpty,
  assertDefined
} from '@/simulation/utils/assertions';

export class QualityOfLifePhase implements SimulationPhase {
  readonly id = 'quality-of-life';
  readonly name = 'Quality of Life Systems';
  readonly order = 19.5;  // BEFORE population (20.5)

  // DEPENDENCIES (Nov 6, 2025): Requires UBI and economic state
  readonly dependencies = [
    'ubi-system',                // Order 15.3: UBI affects material wellbeing
    'extreme-weather-events',    // Order 15.2: Weather affects living conditions
  ];

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // Update multi-dimensional quality of life systems
    setDeterministicRng(rng);
    const updatedQoLSystems = updateQualityOfLifeSystems(state);
    state.qualityOfLifeSystems = updatedQoLSystems;

    // Calculate global-level QoL from systems
    // NOTE: QoL is a wellbeing score [0, ~1.5], NOT a probability [0, 1]
    // Values > 1.0 represent exceptional futures (post-scarcity, longevity gains)
    // See aggregation.ts line 33 for design rationale
    const globalQoLFromSystems = assertFinite(
      calculateQualityOfLife(updatedQoLSystems),
      {
        location: 'QualityOfLifePhase.execute',
        valueName: 'globalQoLFromSystems',
        month: state.currentMonth
      }
    );

    // Phase 1: Regional QoL Integration (Oct 26, 2025)
    // Apply global QoL to each region (for now, uniform - later phases will add variation)
    const regions = assertNonEmpty(state.humanPopulationSystem.regionalPopulations, {
      location: 'QualityOfLifePhase.execute',
      valueName: 'regionalPopulations',
      month: state.currentMonth
    });

    if (regions && regions.length > 0) {
      for (const region of regions) {
        // For Phase 1: Use global QoL uniformly
        // TODO (Phase 4): Add regional variation based on region-specific factors
        region.qualityOfLife = globalQoLFromSystems;
      }

      // Bottom-up aggregation: Global QoL = population-weighted average of regional QoL
      // NOTE: QoL can exceed 1.0 (exceptional futures), so use assertFinite not assertProbability
      const aggregatedQoL = assertFinite(
        aggregateGlobalQoL(state),
        {
          location: 'QualityOfLifePhase.execute',
          valueName: 'aggregatedQoL',
          month: state.currentMonth
        }
      );

      state.globalMetrics = {
        ...state.globalMetrics,
        qualityOfLife: aggregatedQoL
      };
    } else {
      // Fallback if regions not initialized (shouldn't happen)
      state.globalMetrics = {
        ...state.globalMetrics,
        qualityOfLife: globalQoLFromSystems
      };
    }

    // DEBUG: Log phase execution every 12 months
    if (state.currentMonth % 12 === 0) {
      // qualityOfLifeSystems.survivalFundamentals is REQUIRED field
      const survivalFundamentals = assertDefined(state.qualityOfLifeSystems.survivalFundamentals, {
        location: 'QualityOfLifePhase.execute',
        valueName: 'state.qualityOfLifeSystems.survivalFundamentals',
        month: state.currentMonth,
        expectedSource: 'initialization.ts (QoL system)'
      });
      const foodSec = assertDefined(survivalFundamentals.foodSecurity, {
        location: 'QualityOfLifePhase.execute',
        valueName: 'survivalFundamentals.foodSecurity',
        month: state.currentMonth,
        expectedSource: 'QoL calculation phases'
      });
      const qol = state.globalMetrics.qualityOfLife;
      // LEGITIMATE FALLBACK: regionalPopulations length is for logging only
      console.log(`[Phase ${this.order}] ${this.name}: Food sec AFTER calc = ${(foodSec * 100).toFixed(1)}%, QoL = ${(qol * 100).toFixed(1)}% (aggregated from ${state.humanPopulationSystem.regionalPopulations?.length || 0} regions)`);
    }

    return { events: [] };
  }
}
