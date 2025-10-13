/**
 * EventCollectionPhase (98.0)
 *
 * Collects events from state.eventLog that were logged during this month.
 * Various systems log events to state.eventLog (crisis cascades, etc.).
 * This phase extracts those events before time advances.
 *
 * **EXECUTION ORDER:** 98.0 (After all calculations, before time advancement)
 * **DEPENDENCIES:** Reads state.eventLog
 * **SIDE EFFECTS:**
 * - Returns events from eventLog (does not mutate state)
 */

import { SimulationPhase, PhaseResult } from '../PhaseOrchestrator';
import { GameState, GameEvent } from '@/types/game';
import { RNGFunction } from '@/types/rng';

export class EventCollectionPhase implements SimulationPhase {
  readonly id = 'event-collection';
  readonly name = 'Event Collection';
  readonly order = 98.0;

  execute(state: GameState, _rng: RNGFunction): PhaseResult {
    const events: GameEvent[] = [];

    // Collect events from state.eventLog BEFORE advancing time
    // (crisis events, cascading failures, etc. are logged with current month)
    if (state.eventLog && state.eventLog.length > 0) {
      // Only collect NEW events from this step (avoid duplicates across steps)
      const newEventsThisStep = state.eventLog.filter(
        (e: GameEvent) => e.month === state.currentMonth
      );
      events.push(...newEventsThisStep);
      
      // MEMORY LEAK FIX (Oct 13, 2025): Clear old events to prevent OOM
      // Keep only last 24 months for potential lookback (debugging)
      // In 600-month runs, this prevents 44K+ events from accumulating
      if (state.eventLog.length > 5000) { // ~24 months of events
        const cutoffMonth = state.currentMonth - 24;
        state.eventLog = state.eventLog.filter(
          (e: GameEvent) => e.month > cutoffMonth
        );
      }
    }

    return { events };
  }
}
