/**
 * Unemployment Calculation Phase
 *
 * Updates unemployment based on AI capability
 * Order: 30.0 (after all AI/economic updates)
 *
 * UPDATED (Oct 16, 2025): Now includes AI-assisted skills update
 * - Updates segment skills based on AI capability (digital augmentation, NOT BCIs)
 * - Calculates unemployment including AI displacement effect
 * - Updates society aggregates (power-weighted trust, polarization)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { calculateUnemployment } from '../../calculations';
import { updateAIAssistedSkills } from '../../aiAssistedSkills';
import { updateSocietyAggregates } from '../../populationSegments';
import { assertFinite } from '../../utils/assertions';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';

export class UnemploymentPhase implements SimulationPhase {
  readonly id = 'unemployment';
  readonly name = 'Unemployment & Skills';
  readonly order = 30.0;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // P2.3: Update AI-assisted skills for all segments (if heterogeneous population is active)
    setDeterministicRng(rng);
    if (state.society.segments && state.society.segments.length > 0) {
      updateAIAssistedSkills(state);
      // P2.3.5: Update society aggregates (power-weighted trust, polarization)
      updateSocietyAggregates(state);
    }

    // Calculate unemployment (now includes AI displacement effect)
    const newUnemployment = assertFinite(
      calculateUnemployment(state),
      {
        location: 'UnemploymentPhase.execute',
        valueName: 'newUnemployment',
        month: state.currentMonth,
        additionalInfo: {
          currentUnemployment: state.society.unemploymentLevel,
          economicStage: state.globalMetrics.economicTransitionStage
        }
      }
    );

    state.society = {
      ...state.society,
      unemploymentLevel: newUnemployment
    };

    // Sync to GlobalMetrics for convenient access by TIER 2 interventions
    // (Architecture Review M4 - Oct 27, 2025)
    state.globalMetrics.unemployment = newUnemployment;

    return { events: [] };
  }
}
