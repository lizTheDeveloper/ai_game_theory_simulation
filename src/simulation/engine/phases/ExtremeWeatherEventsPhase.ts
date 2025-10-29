/**
 * Extreme Weather Events Phase
 *
 * Models tropical cyclones (hurricanes, typhoons, cyclones) with climate-driven
 * intensity-frequency relationship.
 *
 * Research: Knutson et al. (2020, 2023), Emanuel (2021), NOAA GFDL (2024)
 * Key finding: FEWER storms overall, but HIGHER proportion of Cat 4-5
 *
 * Execution order: 15.5 (after WetBulbTemperaturePhase)
 *
 * @see research/climate-mortality-biosphere-multiparadigm-framework_20251028.md (Section 1.2)
 */

import { SimulationPhase, PhaseResult, RNGFunction, PhaseContext } from '../PhaseOrchestrator';
import { GameState } from '@/types/game';
import { updateExtremeWeatherEvents } from '@/simulation/extremeWeatherEvents';

export class ExtremeWeatherEventsPhase implements SimulationPhase {
  readonly id = 'extreme-weather-events';
  readonly name = 'Extreme Weather Events';
  readonly order = 15.2; // After WetBulbTemperaturePhase (order 15.0), before UBI (15.3)

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    // Update extreme weather system (storms)
    updateExtremeWeatherEvents(state, rng);

    // Events are logged internally via addSimulationEvent() and addMortalityRisk()
    return { events: [] };
  }
}
