/**
 * TIER 1.7.4: Nuclear Winter Phase
 * 
 * Updates nuclear winter effects each month after nuclear war:
 * - Soot decay (5% per month)
 * - Temperature recovery
 * - Crop yield improvement
 * - Starvation mortality (5% monthly at peak)
 * - Radiation zone decay
 * 
 * Research: Robock & Toon (2012), Coupe et al. (2019)
 */

import { GameState } from '@/types/game';
import { SimulationPhase } from '../simulationPhase';
import { updateNuclearWinter } from '../../nuclearWinter';

export class NuclearWinterPhase implements SimulationPhase {
  public getPhaseName(): string {
    return 'NuclearWinterPhase';
  }

  public execute(state: GameState): GameState {
    // TIER 1.7.4: Update nuclear winter effects (if active)
    updateNuclearWinter(state);
    return state;
  }
}

