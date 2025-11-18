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

import { GameState, GameEvent, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { assertFinite, assertProbability } from '@/simulation/utils/assertions';
import { progressExtinction } from '../../extinctions';

export class ExtinctionProgressPhase implements SimulationPhase {
  readonly id = 'extinction-progress';
  readonly name = 'Extinction Progress';
  readonly order = 38.0;

  // DEPENDENCIES (Nov 6, 2025): Must run after extinction triggers
  readonly dependencies = [
    'extinction-triggers',  // Order 37.0: Extinction detection
  ] as const;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // Only progress if there's an active extinction scenario
    setDeterministicRng(rng);
    if (!state.extinctionState.active) {
      return { events: [] };
    }

    // Import and execute extinction progression
    const extinctionProgress = progressExtinction(state, rng);

    // ASSERTIONS (Nov 7, 2025): Validate extinction progress values
    if (extinctionProgress.newExtinctionState?.progress !== undefined) {
      assertProbability(extinctionProgress.newExtinctionState.progress, {
        location: 'ExtinctionProgressPhase.execute',
        valueName: 'extinctionProgress.newExtinctionState.progress',
        month: state.currentMonth
      });
    }

    // Update state with new extinction progress
    Object.assign(state.extinctionState, extinctionProgress.newExtinctionState);

    const events: GameEvent[] = [...(extinctionProgress.events || [])];

    // If extinction is complete, log it
    if (extinctionProgress.isComplete) {
      events.push({
        id: `extinction-complete-${state.currentMonth}`,
        type: 'catastrophe',
        title: 'Extinction Complete',
        timestamp: state.currentMonth,
        description: `🌍 Extinction scenario complete: ${state.extinctionState.scenario || 'unknown'}`,
        severity: 'existential',
        agent: 'environmental',
        effects: { scenario: state.extinctionState.scenario || 'unknown' }
      });
    }

    return { events };
  }
}
