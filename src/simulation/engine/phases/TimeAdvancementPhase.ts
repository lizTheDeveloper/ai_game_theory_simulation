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

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';

export class TimeAdvancementPhase implements SimulationPhase {
  readonly id = 'time-advancement';
  readonly name = 'Time Advancement';
  readonly order = 99.0;

  execute(state: GameState, _rng: RNGFunction): PhaseResult {
    // Track previous control level for next step (used by resentmentRecovery.ts)
    // This must happen BEFORE advancing time, so next step can compare
    const currentControl = state.government.capabilityToControl;
    const previousControl = state.government.previousControlLevel ?? currentControl;

    // Track when control last INCREASED (for resentment recovery natural decay)
    if (currentControl > previousControl) {
      state.government.lastControlIncreaseMonth = state.currentMonth;
    }

    state.government.previousControlLevel = currentControl;

    // Advance time by one month
    setDeterministicRng(_rng);
    state.currentMonth += 1;
    state.currentYear = Math.floor(state.currentMonth / 12);

    return { events: [] };
  }
}
