/**
 * ExtinctionProgressPhase (38.0)
 *
 * Progresses any active extinction scenario toward completion.
 * Handles the evolution of extinction events:
 * - Tracks extinction progress
 * - Generates extinction progress events
 * - Detects when extinction is complete
 * - Creates completion event
 *
 * **EXECUTION ORDER:** 38.0 (After extinction triggers, before tech diffusion)
 * **DEPENDENCIES:** Requires extinctionState to be checked
 * **SIDE EFFECTS:**
 * - Updates extinctionState progress
 * - Generates progress and completion events
 */

import { SimulationPhase, PhaseResult } from '../PhaseOrchestrator';
import { GameState, GameEvent } from '@/types/game';
import { RNGFunction } from '@/types/rng';

export class ExtinctionProgressPhase implements SimulationPhase {
  readonly id = 'extinction-progress';
  readonly name = 'Extinction Progress';
  readonly order = 38.0;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // Only progress if there's an active extinction scenario
    if (!state.extinctionState.active) {
      return { events: [] };
    }

    // Import and execute extinction progression
    const { progressExtinction } = require('../../extinctions');

    const extinctionProgress = progressExtinction(state, rng);

    // Update state with new extinction progress
    Object.assign(state.extinctionState, extinctionProgress.newExtinctionState);

    const events: GameEvent[] = [...(extinctionProgress.events || [])];

    // If extinction is complete, log it
    if (extinctionProgress.isComplete) {
      events.push({
        id: `extinction-complete-${state.currentMonth}`,
        type: 'extinction',
        month: state.currentMonth,
        description: `🌍 Extinction scenario complete: ${state.extinctionState.scenario}`,
        severity: 'critical'
      } as GameEvent);
    }

    return { events };
  }
}
