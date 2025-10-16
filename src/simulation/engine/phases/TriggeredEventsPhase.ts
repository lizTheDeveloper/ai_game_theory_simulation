/**
 * Triggered Events Phase (P2.5 Empirical Validation)
 *
 * Processes externally-triggered events (pandemics, economic crises)
 * for validation testing against historical data.
 *
 * Order: 27.0 (after environmental accumulation, before crisis detection)
 *
 * This phase handles events that are manually triggered for validation purposes,
 * not random events. It enables tests to reproduce specific historical scenarios
 * (COVID-19, 2008 Financial Crisis, Black Death) to prove the simulation can
 * match known outcomes.
 */

import { SimulationPhase, PhaseResult, RNGFunction, PhaseContext } from '../PhaseOrchestrator';
import { GameState } from '@/types/game';
import { updateTriggeredEvents } from '../../triggeredEvents';

export class TriggeredEventsPhase implements SimulationPhase {
  readonly id = 'triggered-events';
  readonly name = 'Triggered Events';
  readonly order = 27.0;

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    // Skip if no triggered events
    if (!state.triggeredEvents) {
      return { events: [], metadata: {} };
    }

    // Process all active triggered events
    updateTriggeredEvents(state);

    // Return metadata about active events (for logging/debugging)
    const activeCount = state.triggeredEvents.activeEvents.length;
    const completedCount = state.triggeredEvents.completedEvents.length;

    return {
      events: [],
      metadata: {
        activeTriggeredEvents: activeCount,
        completedTriggeredEvents: completedCount
      }
    };
  }
}
