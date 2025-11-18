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

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { executeSocietyActions } from '../../agents/societyAgent';

export class SocietyActionsPhase implements SimulationPhase {
  readonly id = 'society-actions';
  readonly name = 'Society Agent Actions';
  readonly order = 10.5;

  // DEPENDENCIES (Nov 15, 2025): Requires governance state and AI capabilities for social movements
  readonly dependencies = [
    'governance-system',      // Order 28.0: Governance affects social movements
    'government-actions',     // Order 9.0: Government policies affect society
  ] as const;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // HIGH-6 (Nov 8, 2025): Validate RNG for deterministic simulation
    if (!rng || typeof rng !== 'function') {
      throw new Error(
        `❌ CRITICAL: RNG required for deterministic simulation in ${this.id} ` +
        `(Month ${state.currentMonth})`
      );
    }

    // Import and execute society actions
    setDeterministicRng(rng);const societyResult = executeSocietyActions(state, rng);

    // Update state
    Object.assign(state, societyResult.newState);

    return { events: societyResult.events || [] };
  }
}
