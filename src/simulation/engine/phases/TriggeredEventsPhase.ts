import { GameState, GameEvent, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
/**
 * Triggered Events Phase (P2.5)
 *
 * Placeholder phase for external event injection during testing/validation.
 *
 * PURPOSE: Allows manual event triggers for specific test scenarios (e.g., "trigger
 * pandemic at month 50" for validation testing). Currently unused in production runs.
 *
 * FUTURE USE: Could be extended for scenario testing, historical event replay,
 * or controlled experiments. Not needed for current Monte Carlo simulations.
 */

export class TriggeredEventsPhase implements SimulationPhase {
  id = 'triggered-events';
  name = 'Triggered Events';
  order = 2.52;

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    // Stub implementation - no triggered events yet
    setDeterministicRng(rng);
    return {
      events: [],
      metadata: {
        status: 'success',
        message: 'No triggered events this month',
        changes: []
      }
    };
  }
}
