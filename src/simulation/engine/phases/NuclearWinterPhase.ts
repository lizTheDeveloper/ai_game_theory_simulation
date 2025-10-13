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

import { GameState } from '../../../types/game';
import { updateNuclearWinter } from '../../nuclearWinter';

export class NuclearWinterPhase {
  name = 'NuclearWinter';
  order = 252; // After organization viability (251)

  async execute(state: GameState): Promise<void> {
    // TIER 1.7.4: Update nuclear winter effects (if active)
    updateNuclearWinter(state);
  }
}

