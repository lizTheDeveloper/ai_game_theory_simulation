/**
 * Upward Spirals Phase
 *
 * Checks for virtuous cascades (Phase 2D)
 * Order: 11.0 (after governance quality)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';

export class UpwardSpiralsPhase implements SimulationPhase {
  readonly id = 'upward-spirals';
  readonly name = 'Upward Spirals Update';
  readonly order = 11.0;

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    const { updateUpwardSpirals } = require('../../upwardSpirals');
    setDeterministicRng(rng);

    // PhaseContext.month should always be provided by orchestrator
    // If missing, fail loudly rather than silently using state.currentMonth
    if (!context || context.month === undefined) {
      throw new Error(
        `❌ CRITICAL: PhaseContext.month missing in UpwardSpiralsPhase (Month ${state.currentMonth}). ` +
        `Phase orchestrator must provide context.month for all phases.`
      );
    }

    const month = context.month;
    updateUpwardSpirals(state, month);

    return { events: [] };
  }
}
