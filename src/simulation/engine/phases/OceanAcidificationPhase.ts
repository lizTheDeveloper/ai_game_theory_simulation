/**
 * Ocean Acidification Phase (TIER 1.3)
 *
 * Updates ocean acidification, coral/shellfish collapse, marine food web, and tech breakthroughs
 * Order: 20.3 (after Freshwater, during environmental updates)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';

export class OceanAcidificationPhase implements SimulationPhase {
  readonly id = 'ocean-acidification';
  readonly name = 'Ocean Acidification Update';
  readonly order = 20.3;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    const { updateOceanAcidificationSystem, checkOceanAcidificationTechUnlocks } = require('../../oceanAcidification');
    setDeterministicRng(rng);
    
    updateOceanAcidificationSystem(state);
    checkOceanAcidificationTechUnlocks(state);

    return { events: [] };
  }
}

