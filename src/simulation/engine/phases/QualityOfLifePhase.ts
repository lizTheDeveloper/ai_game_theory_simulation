/**
 * Quality of Life Phase
 *
 * Updates multi-dimensional quality of life systems and calculates aggregate QoL
 * Order: 19.5 (BEFORE population mortality so it uses current values)
 * FIX (Oct 25, 2025): Moved from 34.0 to 19.5 - population was using stale data
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { updateQualityOfLifeSystems, calculateQualityOfLife } from '../../calculations';

export class QualityOfLifePhase implements SimulationPhase {
  readonly id = 'quality-of-life';
  readonly name = 'Quality of Life Systems';
  readonly order = 19.5;  // BEFORE population (20.5)

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

    // DEBUG: Log phase execution every 12 months
    if (state.currentMonth % 12 === 0) {
      const foodSec = state.qualityOfLifeSystems.survivalFundamentals?.foodSecurity || 0;
      console.log(`[Phase ${this.order}] ${this.name}: Food sec AFTER calc = ${(foodSec * 100).toFixed(1)}%, QoL = ${(qualityOfLife * 100).toFixed(1)}%`);
    }

    return { events: [] };
  }
}
