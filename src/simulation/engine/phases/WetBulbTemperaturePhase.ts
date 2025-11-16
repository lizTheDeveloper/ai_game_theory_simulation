/**
 * Wet Bulb Temperature Events Phase (Oct 17, 2025)
 *
 * Updates wet bulb temperature system: calculates regional heat events,
 * applies mortality from extreme wet bulb temperatures.
 *
 * Order: 20.45 (after ocean acidification, before human population update)
 *
 * Research: Raymond et al. (2020), Vecellio et al. (2022), Mora et al. (2017) (TRL 8-9)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { assertFinite, assertTemperatureDelta } from '@/simulation/utils/assertions';
import { updateWetBulbTemperatureSystem } from '../../wetBulbEvents';

export class WetBulbTemperaturePhase implements SimulationPhase {
  readonly id = 'wet_bulb_temperature';
  readonly name = 'Wet Bulb Temperature Events';
  readonly order = 20.45;
  readonly dependencies: readonly string[] = []; // Reads temperatureAnomaly (set during initialization, no phase dependency needed)

  execute(state: GameState, rng: RNGFunction): PhaseResult {setDeterministicRng(rng);

    // Validate temperature state before update
    // FIX: Temperature is tracked in resourceEconomy.co2.temperatureAnomaly
    if (state.resourceEconomy?.co2) {
      assertFinite(state.resourceEconomy.co2.temperatureAnomaly, {
        location: 'WetBulbTemperaturePhase.execute (pre-update)',
        valueName: 'temperatureAnomaly',
        month: state.currentMonth
      });
    }

    updateWetBulbTemperatureSystem(state, rng);

    // Validate temperature state after update
    if (state.resourceEconomy?.co2) {
      assertFinite(state.resourceEconomy.co2.temperatureAnomaly, {
        location: 'WetBulbTemperaturePhase.execute (post-update)',
        valueName: 'temperatureAnomaly',
        month: state.currentMonth
      });
    }

    return { events: [] };
  }
}
