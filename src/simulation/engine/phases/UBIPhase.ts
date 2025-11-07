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

  // DEPENDENCIES (Nov 6, 2025): Requires tech tree and governance for UBI deployment
  readonly dependencies = [
    'tech-tree',                 // Order 12.5: Tech breakthroughs enable UBI programs
    'governance-quality',        // Order 10.0: Government capability to implement UBI
  ];

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    updateUBISystem(state);
    setDeterministicRng(rng);
    return { events: [] };
  }
}

