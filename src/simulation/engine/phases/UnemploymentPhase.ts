/**
 * Unemployment Calculation Phase
 *
 * Updates unemployment based on AI capability
 * Order: 30.0 (after all AI/economic updates)
 * 
 * UPDATED (Oct 16, 2025): Now includes bionic skills update
 * - Updates segment skills based on AI capability
 * - Calculates unemployment including bionic displacement effect
 * - Updates society aggregates (power-weighted trust, polarization)
 */

import { SimulationPhase, PhaseResult, RNGFunction } from '../PhaseOrchestrator';
import { GameState } from '@/types/game';
import { calculateUnemployment } from '../../calculations';
import { updateBionicSkills } from '../../bionicSkills';
import { updateSocietyAggregates } from '../../populationSegments';

export class UnemploymentPhase implements SimulationPhase {
  readonly id = 'unemployment';
  readonly name = 'Unemployment & Skills';
  readonly order = 30.0;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // P2.3: Update bionic skills for all segments (if heterogeneous population is active)
    if (state.society.segments && state.society.segments.length > 0) {
      updateBionicSkills(state);
      // P2.3.5: Update society aggregates (power-weighted trust, polarization)
      updateSocietyAggregates(state);
    }
    
    // Calculate unemployment (now includes bionic displacement effect)
    const newUnemployment = calculateUnemployment(state);

    state.society = {
      ...state.society,
      unemploymentLevel: newUnemployment
    };

    return { events: [] };
  }
}
