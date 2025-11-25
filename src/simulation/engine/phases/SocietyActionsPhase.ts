/**
 * SocietyActionsPhase (0.7)
 *
 * Executes society agent actions:
 * - Public sentiment changes
 * - Social movements
 * - Protests and activism
 * - Cultural adaptation
 *
 * **EXECUTION ORDER:** 10.6 (After coordinated-deployment 10.5, government-actions 9.0)
 * **DEPENDENCIES:** government-actions (9.0)
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
  readonly order = 10.6; // After coordinated-deployment (10.5)

  // DEPENDENCIES (Nov 15, 2025): Requires government state for social movements
  // NOTE: governance-system dependency REMOVED - order violation (10.6 cannot depend on 28.0)
  readonly dependencies = [
    'government-actions',     // Order 9.0: Government policies affect society
  ] as const;

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    // HIGH-6 (Nov 8, 2025): Validate RNG for deterministic simulation
    if (!rng || typeof rng !== 'function') {
      throw new Error(
        `❌ CRITICAL: RNG required for deterministic simulation in ${this.id} ` +
        `(Month ${state.currentMonth})`
      );
    }

    // Import and execute society actions
    // H-1 (Nov 25, 2025): Pass context for O(1) indices access
    setDeterministicRng(rng);const societyResult = executeSocietyActions(state, rng, context);

    // Update state
    Object.assign(state, societyResult.newState);

    return { events: societyResult.events || [] };
  }
}
