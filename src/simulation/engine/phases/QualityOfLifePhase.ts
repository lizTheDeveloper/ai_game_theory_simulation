/**
 * Quality of Life Phase
 *
 * Updates multi-dimensional quality of life systems and calculates aggregate QoL
 * Order: 34.0 (after social stability)
 */

import { SimulationPhase, PhaseResult, RNGFunction } from '../PhaseOrchestrator';
import { GameState } from '@/types/game';
import { updateQualityOfLifeSystems, calculateQualityOfLife } from '../../calculations';

export class QualityOfLifePhase implements SimulationPhase {
  readonly id = 'quality-of-life';
  readonly name = 'Quality of Life Systems';
  readonly order = 34.0;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // Update multi-dimensional quality of life systems
    const updatedQoLSystems = updateQualityOfLifeSystems(state);
    state.qualityOfLifeSystems = updatedQoLSystems;

    // Calculate aggregate quality of life from systems
    const qualityOfLife = calculateQualityOfLife(updatedQoLSystems);
    state.globalMetrics = {
      ...state.globalMetrics,
      qualityOfLife
    };

    return { events: [] };
  }
}
