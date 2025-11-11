import { GameState, GameEvent, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
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

import { updateNuclearWinter } from '../../nuclearWinter';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { assertInRange, assertProbability } from '@/simulation/utils/assertions';

export class NuclearWinterPhase implements SimulationPhase {
  readonly id = 'nuclear_winter';
  readonly name = 'NuclearWinter';
  readonly order = 252.01; // After organization viability (251)

  // DEPENDENCIES (Nov 6, 2025): Requires nuclear command control state
  readonly dependencies = [
    'nuclear_command_control',   // Order 20: Nuclear safeguards state
  ];

  execute(state: GameState, _rng: RNGFunction): PhaseResult {
    // Nuclear winter updates run once per simulation step (once per month)
    setDeterministicRng(_rng);
    // Each engine.step() represents one month advancing
    // Rates are monthly (5% soot decay, 5% mortality) - no need to gate on day

    const winter = state.nuclearWinterState;

    // Validate state BEFORE update (if active)
    if (winter.active) {
      assertInRange(winter.currentSoot, 0, 150, {
        location: 'NuclearWinterPhase.execute (pre-update)',
        valueName: 'currentSoot',
        month: state.currentMonth
      });

      assertInRange(winter.temperatureAnomaly, -20, 0, {
        location: 'NuclearWinterPhase.execute (pre-update)',
        valueName: 'temperatureAnomaly',
        month: state.currentMonth
      });

      assertProbability(winter.cropYieldMultiplier, {
        location: 'NuclearWinterPhase.execute (pre-update)',
        valueName: 'cropYieldMultiplier',
        month: state.currentMonth
      });
    }

    // TIER 1.7.4: Update nuclear winter effects (if active)
    updateNuclearWinter(state);

    // Validate state AFTER update (if still active)
    if (winter.active) {
      assertInRange(winter.currentSoot, 0, 150, {
        location: 'NuclearWinterPhase.execute (post-update)',
        valueName: 'currentSoot',
        month: state.currentMonth
      });

      assertInRange(winter.temperatureAnomaly, -20, 0, {
        location: 'NuclearWinterPhase.execute (post-update)',
        valueName: 'temperatureAnomaly',
        month: state.currentMonth
      });

      assertProbability(winter.cropYieldMultiplier, {
        location: 'NuclearWinterPhase.execute (post-update)',
        valueName: 'cropYieldMultiplier',
        month: state.currentMonth
      });
    }

    return { events: [] };
  }
}

