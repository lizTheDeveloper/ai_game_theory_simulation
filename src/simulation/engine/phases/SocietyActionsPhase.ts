/**
 * SocietyActionsPhase (0.7)
 *
 * Executes society agent actions:
 * - Public sentiment changes
 * - Social movements
 * - Protests and activism
 * - Cultural adaptation
 *
 * **EXECUTION ORDER:** 0.7 (After government actions)
 * **DEPENDENCIES:** Requires society state
 * **SIDE EFFECTS:**
 * - Modifies society state
 * - Returns new state and events
 */

import { SimulationPhase, PhaseResult } from '../PhaseOrchestrator';
import { GameState } from '@/types/game';
import { RNGFunction } from '@/types/rng';

export class SocietyActionsPhase implements SimulationPhase {
  readonly id = 'society-actions';
  readonly name = 'Society Agent Actions';
  readonly order = 10.0;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // Import and execute society actions
    const { executeSocietyActions } = require('../../agents/societyAgent');

    const societyResult = executeSocietyActions(state, rng);

    // Update state
    Object.assign(state, societyResult.newState);

    return { events: societyResult.events || [] };
  }
}
