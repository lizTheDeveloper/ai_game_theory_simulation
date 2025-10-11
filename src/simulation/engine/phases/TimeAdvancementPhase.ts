/**
 * TimeAdvancementPhase (99.0)
 *
 * Advances simulation time forward by one month.
 * This MUST be the last phase to execute - all other phases use currentMonth
 * for calculations and event logging.
 *
 * **EXECUTION ORDER:** 99.0 (LAST - after all other phases complete)
 * **DEPENDENCIES:** None (reads currentMonth)
 * **SIDE EFFECTS:**
 * - Increments currentMonth by 1
 * - Updates currentYear based on months elapsed
 */

import { SimulationPhase, PhaseResult } from '../PhaseOrchestrator';
import { GameState } from '@/types/game';
import { RNGFunction } from '@/types/rng';

export class TimeAdvancementPhase implements SimulationPhase {
  readonly id = 'time-advancement';
  readonly name = 'Time Advancement';
  readonly order = 99.0;

  execute(state: GameState, _rng: RNGFunction): PhaseResult {
    // Advance time by one month
    state.currentMonth += 1;
    state.currentYear = Math.floor(state.currentMonth / 12);

    return { events: [] };
  }
}
