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

  // DEPENDENCIES (Nov 15, 2025): Depends on all phases completing - this runs LAST
  // Special case: empty array means "no explicit dependencies" but order 99.0 ensures it runs after everything
  readonly dependencies = [] as const;

  execute(state: GameState, _rng: RNGFunction): PhaseResult {
    // Track previous control level for next step (used by resentmentRecovery.ts)
    // This must happen BEFORE advancing time, so next step can compare
    const currentControl = state.government.capabilityToControl;

    // CRITICAL FIX (Nov 12, 2025): Remove silent fallback - fail loudly if field missing
    // At Month 0, previousControlLevel was initialized in initialization.ts to match current control
    // If it's undefined here, that's a real initialization bug that must be fixed
    if (state.government.previousControlLevel === undefined) {
      // DEFENSIVE: Only allow undefined at Month 0 (initialization race condition)
      // After Month 0, this field MUST exist
      if (state.currentMonth === 0) {
        console.warn(`⚠️ TimeAdvancementPhase: previousControlLevel undefined at Month 0, initializing to ${currentControl}`);
        state.government.previousControlLevel = currentControl;
      } else {
        throw new Error(
          `❌ CRITICAL: government.previousControlLevel is undefined at Month ${state.currentMonth}\n` +
          `   This indicates an initialization bug or corrupted state.\n` +
          `   This field MUST be initialized in initialization.ts and updated by TimeAdvancementPhase.\n` +
          `   Current control: ${currentControl}`
        );
      }
    }

    const previousControl = state.government.previousControlLevel;

    // Track when control last INCREASED (for resentment recovery natural decay)
    if (currentControl > previousControl) {
      state.government.lastControlIncreaseMonth = state.currentMonth;
    }

    state.government.previousControlLevel = currentControl;

    // Advance time by one month
    setDeterministicRng(_rng);
    state.currentMonth += 1;

    // CRITICAL FIX (Nov 24, 2025): Respect simulation start year for historical hindcasts
    // Historical mode starts at year 1990 (or other historical year), not year 0
    // currentYear should be startYear + years elapsed, not just years elapsed
    // BUG FIX (Nov 24, 2025): Read from config.startYear, not non-existent simulationStartYear
    const simulationStartYear = state.config?.startYear ?? 2025;
    state.currentYear = simulationStartYear + Math.floor(state.currentMonth / 12);

    return { events: [] };
  }
}
