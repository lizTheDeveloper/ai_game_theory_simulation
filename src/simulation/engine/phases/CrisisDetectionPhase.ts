/**
 * Crisis Detection Phase
 *
 * Detects if the simulation is in a crisis state
 * Order: 36.0 (after outcome probabilities)
 */

import { SimulationPhase, PhaseResult, RNGFunction, PhaseContext } from '../PhaseOrchestrator';
import { GameState } from '@/types/game';
import { detectCrisis } from '../../calculations';

export class CrisisDetectionPhase implements SimulationPhase {
  readonly id = 'crisis-detection';
  readonly name = 'Crisis Detection';
  readonly order = 36.0;

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    const crisis = detectCrisis(state);

    // Store crisis info in context for other phases to use
    if (context) {
      context.data.set('crisis', crisis);
    }

    return {
      events: [],
      metadata: { crisisDetected: crisis.inCrisis }
    };
  }
}
