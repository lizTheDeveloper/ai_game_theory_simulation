/**
 * Phosphorus Depletion Phase (TIER 1.1)
 *
 * Updates phosphorus reserves, geopolitical tensions, supply shocks, and tech breakthroughs
 * Order: 20.1 (after Defensive AI, during resource updates)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';

export class PhosphorusPhase implements SimulationPhase {
  readonly id = 'phosphorus';
  readonly name = 'Phosphorus System Update';
  readonly order = 20.1;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // HIGH-6 (Nov 8, 2025): Validate RNG for deterministic simulation
    if (!rng || typeof rng !== 'function') {
      throw new Error(
        `❌ CRITICAL: RNG required for deterministic simulation in ${this.id} ` +
        `(Month ${state.currentMonth})`
      );
    }

    const { updatePhosphorusSystem, checkPhosphorusTechUnlocks } = require('../../phosphorusDepletion');
    setDeterministicRng(rng);

    updatePhosphorusSystem(state);
    checkPhosphorusTechUnlocks(state);

    return { events: [] };
  }
}

