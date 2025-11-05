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
  
  execute(state: GameState, rng: RNGFunction): PhaseResult {
    updateUBISystem(state);
    setDeterministicRng(rng);
    return { events: [] };
  }
}

