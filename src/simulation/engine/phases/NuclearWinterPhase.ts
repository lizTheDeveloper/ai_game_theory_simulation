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
import { SimulationPhase, PhaseResult, RNGFunction } from '../PhaseOrchestrator';

export class NuclearWinterPhase implements SimulationPhase {
  readonly id = 'nuclear_winter';
  readonly name = 'NuclearWinter';
  readonly order = 252; // After organization viability (251)

  execute(state: GameState, _rng: RNGFunction): PhaseResult {
    // CRITICAL FIX: Only update at end of month (day 30)
    // This phase calculates MONTHLY rates (5% soot decay per month, 5% mortality per month)
    // but was executing DAILY (30x per month), causing exponential effects:
    // - 5% soot decay per month applied 30 times = (1-0.05)^30 ≈ 0.21 = 79% decay per month!
    // - 5% starvation mortality per month applied 30 times = (1-0.05)^30 ≈ 0.21 = 79% death rate per month!
    if (state.currentDay !== 30) {
      return { events: [] }; // Skip nuclear winter updates on non-month-end days
    }

    // TIER 1.7.4: Update nuclear winter effects (if active)
    updateNuclearWinter(state);
    return { events: [] };
  }
}

