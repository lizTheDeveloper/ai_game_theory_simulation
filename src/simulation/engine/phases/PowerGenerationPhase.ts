import { GameState, GameEvent, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
/**
 * Power Generation & AI Energy Consumption Phase
 * TIER 4.4: Electricity generation, AI efficiency, crypto mining, climate impact
 */

import { updatePowerGeneration } from '../../powerGeneration';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { assertFinite } from '@/simulation/utils/assertions'; // Module uses assertions

export class PowerGenerationPhase implements SimulationPhase {
  readonly name = 'Power Generation Update';
  readonly id = 'power-generation';
  readonly order = 21; // After resource economy, before social systems
  dependencies = ['tech-tree'];

  /**
   * Execute power generation dynamics
   * - AI inference efficiency (exponential improvement)
   * - Query volume growth (linear with saturation)
   * - Cryptocurrency power consumption
   * - Data center buildout (4-year lag)
   * - Grid mix evolution (renewable transition)
   * - Climate feedbacks (warming → cooling demand)
   * - Emissions calculation
   */
  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    // HIGH-6 (Nov 8, 2025): Validate RNG for deterministic simulation
    if (!rng || typeof rng !== 'function') {
      throw new Error(
        `❌ CRITICAL: RNG required for deterministic simulation in ${this.id} ` +
        `(Month ${state.currentMonth})`
      );
    }

    updatePowerGeneration(state, rng);
    setDeterministicRng(rng);

    return { events: [] };
  }
}
