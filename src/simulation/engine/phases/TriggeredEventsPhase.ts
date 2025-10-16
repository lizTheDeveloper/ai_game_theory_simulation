/**
 * Triggered Events Phase (P2.5)
 *
 * External event triggers for validation testing
 * TODO: Implement full triggered events system if needed
 */

import type { SimulationPhase, PhaseContext, PhaseResult } from './types';
import type { GameState } from '../../../types/game';
import type { RNGFunction } from '../../rng';

export class TriggeredEventsPhase implements SimulationPhase {
  id = 'triggered-events';
  name = 'Triggered Events';
  order = 2.5;

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    // Stub implementation - no triggered events yet
    return {
      status: 'success',
      message: 'No triggered events this month',
      changes: []
    };
  }
}
