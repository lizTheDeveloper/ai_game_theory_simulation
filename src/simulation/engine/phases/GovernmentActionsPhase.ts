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
 *
 * **REFACTORING NOTE (Oct 17, 2025):**
 * This phase now uses the new modular government structure from
 * `src/simulation/government/` which provides better organization
 * and testability. The core logic remains unchanged to ensure
 * behavioral consistency.
 */

import { SimulationPhase, PhaseResult } from '../PhaseOrchestrator';
import { GameState } from '@/types/game';
import { RNGFunction } from '@/types/rng';
import { executeGovernmentActions } from '@/simulation/government';

export class GovernmentActionsPhase implements SimulationPhase {
  readonly id = 'government-actions';
  readonly name = 'Government Agent Actions';
  readonly order = 9.0;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // Execute government actions using new modular structure
    const govResult = executeGovernmentActions(state, rng);

    // Update state
    Object.assign(state, govResult.newState);

    return { events: govResult.events || [] };
  }
}
