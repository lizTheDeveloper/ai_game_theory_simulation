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

import { SimulationPhase, PhaseResult, RNGFunction } from '../PhaseOrchestrator';
import { GameState } from '@/types/game';
import { calculateUnemployment } from '../../calculations';
import { updateAIAssistedSkills } from '../../aiAssistedSkills';
import { updateSocietyAggregates } from '../../populationSegments';

export class UnemploymentPhase implements SimulationPhase {
  readonly id = 'unemployment';
  readonly name = 'Unemployment & Skills';
  readonly order = 30.0;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // P2.3: Update AI-assisted skills for all segments (if heterogeneous population is active)
    if (state.society.segments && state.society.segments.length > 0) {
      updateAIAssistedSkills(state);
      // P2.3.5: Update society aggregates (power-weighted trust, polarization)
      updateSocietyAggregates(state);
    }

    // Calculate unemployment (now includes AI displacement effect)
    const newUnemployment = calculateUnemployment(state);

    state.society = {
      ...state.society,
      unemploymentLevel: newUnemployment
    };

    return { events: [] };
  }
}
