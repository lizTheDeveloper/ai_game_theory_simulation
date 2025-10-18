/**
 * Proactive Sleeper Detection Phase
 *
 * TIER 2 Phase 4: Proactive sleeper agent detection via neural activation probes
 * and chain of thought monitoring.
 *
 * Order: After Gaming Detection Phase (continuous monitoring)
 */

import { SimulationPhase, PhaseResult, PhaseContext } from '../PhaseOrchestrator';
import { GameState, RNGFunction } from '@/types/game';
import { processProactiveSleeperDetection } from '@/simulation/proactiveSleeperDetection';

export class ProactiveSleeperDetectionPhase implements SimulationPhase {
  id = 'proactive-sleeper-detection';
  name = 'Proactive Sleeper Detection';
  order = 28; // After gaming detection, before crisis detection

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    // Only run if sleeper detection is enabled
    if (!state.proactiveSleeperDetection) {
      return {
        events: []
      };
    }

    const events = processProactiveSleeperDetection(state, rng);

    return {
      events
    };
  }
}
