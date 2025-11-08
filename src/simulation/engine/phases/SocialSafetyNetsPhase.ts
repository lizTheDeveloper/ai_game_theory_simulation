/**
 * Social Safety Nets & Community Infrastructure Phase (TIER 2.2)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { updateSocialSafetyNets } from '../../socialSafetyNets';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';

export class SocialSafetyNetsPhase implements SimulationPhase {
  readonly name = 'Social Safety Nets Update';
  readonly id = 'social-safety-nets';
  readonly order = 15.6; // After UBI, continues social systems
  dependencies = ['governance-quality'];

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // HIGH-6 (Nov 8, 2025): Validate RNG for deterministic simulation
    if (!rng || typeof rng !== 'function') {
      throw new Error(
        `❌ CRITICAL: RNG required for deterministic simulation in ${this.id} ` +
        `(Month ${state.currentMonth})`
      );
    }

    updateSocialSafetyNets(state);
    setDeterministicRng(rng);
    return { events: [] };
  }
}

