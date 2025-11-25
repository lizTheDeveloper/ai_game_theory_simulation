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

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { executeGovernmentActions } from '@/simulation/government';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { assertFinite } from '@/simulation/utils/assertions';

export class GovernmentActionsPhase implements SimulationPhase {
  readonly id = 'government-actions';
  readonly name = 'Government Agent Actions';
  readonly order = 9.0;

  // DEPENDENCIES (Nov 15, 2025): Requires AI agents for policy decisions
  // NOTE: Government actions READ economic state but don't DEPEND on economic-system phase
  // (economic-system runs at order 31.0, AFTER government-actions at 9.0)
  // Government uses state.economicModel (initialized once) not phase output
  readonly dependencies = [
    'ai-lifecycle',           // Order 3.0: AI capabilities affect government policy
  ] as const;

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    // Execute government actions using new modular structure
    setDeterministicRng(rng);
    // H-1 (Nov 25, 2025): Pass context for O(1) indices access
    const govResult = executeGovernmentActions(state, rng, context);

    // Update state
    Object.assign(state, govResult.newState);

    // ASSERTIONS (Nov 7, 2025): Validate government actions didn't corrupt critical state
    assertFinite(state.humanPopulationSystem.population, {
      location: 'GovernmentActionsPhase.execute',
      valueName: 'population after government actions',
      month: state.currentMonth
    });

    return { events: govResult.events || [] };
  }
}
