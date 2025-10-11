/**
 * ExtinctionTriggersPhase (37.0)
 *
 * Checks for extinction scenario triggers (if not already in one).
 * Monitors various extinction pathways:
 * - Nuclear war
 * - Bioweapon release
 * - Grey goo (nanotech runaway)
 * - AI takeover
 * - Environmental collapse
 *
 * **EXECUTION ORDER:** 37.0 (After all calculations, before time advance)
 * **DEPENDENCIES:** Requires full state analysis
 * **SIDE EFFECTS:**
 * - Updates extinctionState if trigger detected
 * - Generates extinction trigger events
 */

import { SimulationPhase, PhaseResult } from '../PhaseOrchestrator';
import { GameState, GameEvent } from '@/types/game';
import { RNGFunction } from '@/types/rng';

export class ExtinctionTriggersPhase implements SimulationPhase {
  readonly id = 'extinction-triggers';
  readonly name = 'Extinction Triggers Check';
  readonly order = 37.0;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // Only check if not already in an extinction scenario
    if (state.extinctionState.active) {
      return { events: [] };
    }

    // Import and execute extinction trigger detection
    const { checkExtinctionTriggers } = require('../../extinctions');

    const extinctionCheck = checkExtinctionTriggers(state, rng);

    // Update state with new extinction state
    Object.assign(state.extinctionState, extinctionCheck.newExtinctionState);

    return { events: extinctionCheck.events || [] };
  }
}
