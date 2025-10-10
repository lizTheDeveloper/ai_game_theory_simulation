/**
 * GovernmentActionsPhase (0.6)
 *
 * Executes government agent actions:
 * - Policy decisions
 * - Investments (evaluation, safety, oversight)
 * - Regulatory actions
 * - Crisis responses
 *
 * **EXECUTION ORDER:** 0.6 (After AI actions and breakthroughs)
 * **DEPENDENCIES:** Requires government state
 * **SIDE EFFECTS:**
 * - Modifies government state
 * - Returns new state and events
 */

import { SimulationPhase, PhaseResult } from '../PhaseOrchestrator';
import { GameState } from '@/types/game';
import { RNGFunction } from '@/types/rng';

export class GovernmentActionsPhase implements SimulationPhase {
  readonly id = 'government-actions';
  readonly name = 'Government Agent Actions';
  readonly order = 9.0;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // Import and execute government actions
    const { executeGovernmentActions } = require('../../agents/governmentAgent');

    const govResult = executeGovernmentActions(state, rng);

    // Update state
    Object.assign(state, govResult.newState);

    return { events: govResult.events || [] };
  }
}
