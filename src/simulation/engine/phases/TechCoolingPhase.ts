/**
 * TechCoolingPhase (17.5)
 *
 * Applies accumulated geoengineering cooling effects AFTER ResourceEconomyPhase.
 *
 * **ARCHITECTURE FIX (Nov 27, 2025):**
 * Prevents phase order bug where geoengineering effects were overwritten:
 * - TechTreePhase (12.5): Accumulates cooling in state.technologyEffects.coolingFromGeoengineering
 * - ResourceEconomyPhase (17.0): Recalculates temperatureAnomaly from CO2 (overwrites direct changes)
 * - TechCoolingPhase (17.5): Applies accumulated cooling AFTER recalculation
 *
 * **EXECUTION ORDER:** 17.5 (immediately after ResourceEconomyPhase)
 * **DEPENDENCIES:**
 * - Reads technologyEffects.coolingFromGeoengineering (from TechTreePhase 12.5)
 * - Writes resourceEconomy.co2.temperatureAnomaly (after ResourceEconomyPhase 17.0)
 */

import type { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { assertFinite } from '@/simulation/utils/assertions';

export class TechCoolingPhase implements SimulationPhase {
  readonly id = 'tech-cooling';
  readonly name = 'Technology Cooling Effects';
  readonly order = 17.5;
  readonly dependencies = ['resource-economy'] as const; // Must run AFTER ResourceEconomyPhase

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    // Read accumulated cooling from TechTreePhase
    const cooling = state.technologyEffects.coolingFromGeoengineering;

    // Only apply if non-zero (skip if no geoengineering deployed)
    if (cooling > 0) {
      const oldTemp = state.resourceEconomy.co2.temperatureAnomaly;

      // Apply cooling (temperature cannot go negative)
      state.resourceEconomy.co2.temperatureAnomaly = assertFinite(
        Math.max(0, oldTemp - cooling),
        {
          location: 'TechCoolingPhase.execute',
          valueName: 'temperatureAnomaly',
          month: state.currentMonth,
          additionalInfo: {
            oldTemp,
            cooling,
            newTemp: Math.max(0, oldTemp - cooling),
          },
        }
      );

      // Log significant cooling (every 6 months)
      if (state.currentMonth % 6 === 0) {
        const newTemp = state.resourceEconomy.co2.temperatureAnomaly;
        console.log(
          `\n🌍❄️ GEOENGINEERING COOLING (Month ${state.currentMonth})\n` +
          `   Baseline temp (from CO2): ${oldTemp.toFixed(2)}°C\n` +
          `   Cooling effect: -${cooling.toFixed(2)}°C\n` +
          `   Effective temp: ${newTemp.toFixed(2)}°C`
        );
      }
    }

    // Clear accumulator for next step
    state.technologyEffects.coolingFromGeoengineering = 0;

    return {
      events: [],
      metadata: {
        coolingApplied: cooling,
        message: cooling > 0 ? `Applied ${cooling.toFixed(2)}°C geoengineering cooling` : undefined,
      },
    };
  }
}
