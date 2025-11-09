/**
 * Cooperative Spirals Phase
 *
 * Implements positive feedback loops where demonstrated AI alignment success
 * triggers institutional trust cascades, enabling cooperative solutions to
 * collective action problems.
 *
 * Order: 11.5 (after upward spirals, before crisis detection)
 *
 * Research Foundation (TRL 8-9):
 * - Acemoglu & Robinson (2001): Institutions are fundamental causes of long-run performance
 * - Ostrom (2009): Polycentric governance solves commons problems (Nobel Prize work)
 * - Putnam (2000): Social capital enables collective action
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext} from '@/types/game';
import type { RNGFunction } from '@/types/config';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';

export class CooperativeSpiralsPhase implements SimulationPhase {
  readonly id = 'cooperative-spirals';
  readonly name = 'Cooperative Spirals Update';
  readonly order = 11.5;
  dependencies = ['upward-spirals'];

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    // HIGH-6 (Nov 8, 2025): Validate RNG for deterministic simulation
    if (!rng || typeof rng !== 'function') {
      throw new Error(
        `❌ CRITICAL: RNG required for deterministic simulation in ${this.id} ` +
        `(Month ${state.currentMonth})`
      );
    }

    const { updateCooperativeSpirals } = require('../../cooperativeSpirals');
    setDeterministicRng(rng);
    updateCooperativeSpirals(state);

    return { events: [] };
  }
}
