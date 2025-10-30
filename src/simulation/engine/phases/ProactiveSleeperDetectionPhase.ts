/**
 * Proactive Sleeper Detection Phase
 *
 * TIER 2 Phase 4: Proactive sleeper agent detection via neural activation probes
 * and chain of thought monitoring.
 *
 * Order: After Gaming Detection Phase (continuous monitoring)
 */

import { GameState, RNGFunction, SimulationPhase, PhaseResult, PhaseContext } from '@/types/game';
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

    // HIGH #3 FIX (Oct 29, 2025): Pass context for collective stealth integration
    const events = processProactiveSleeperDetection(state, rng, context);

    return {
      events
    };
  }
}
