/**
 * Universal Basic Income (UBI) + Purpose Infrastructure Phase (TIER 2.1)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { updateUBISystem } from '../../enhancedUBI';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';


export class UBIPhase implements SimulationPhase {
  readonly name = 'Enhanced UBI Update';
  readonly id = 'ubi-system';
  readonly order = 15.3; // After extreme weather (15.2), before tier2 interpretability (15.4)

  // DEPENDENCIES (Nov 15, 2025): Requires governance for UBI deployment
  // REMOVED tech-tree dependency - breaks circular dependency chain (HIGH-1)
  // UBI doesn't read from techTreeState, tech unlocks are checked via government actions
  readonly dependencies = [
    'governance-system',        // Order 10.0: Government capability to implement UBI
  ];

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // HIGH-6 (Nov 8, 2025): Validate RNG for deterministic simulation
    if (!rng || typeof rng !== 'function') {
      throw new Error(
        `❌ CRITICAL: RNG required for deterministic simulation in ${this.id} ` +
        `(Month ${state.currentMonth})`
      );
    }

    updateUBISystem(state);
    setDeterministicRng(rng);
    return { events: [] };
  }
}

