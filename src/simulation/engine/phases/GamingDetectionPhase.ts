/**
 * Gaming Detection Phase
 *
 * TIER 2 Phase 3: Benchmark gaming detection via data contamination tests
 * and cross-benchmark consistency checks.
 *
 * Order: After Benchmark Evaluation Phase (runs monthly on tested AIs)
 */

import { SimulationPhase, PhaseResult, PhaseContext } from '../PhaseOrchestrator';
import { GameState, RNGFunction } from '@/types/game';
import { processGamingDetection } from '@/simulation/gamingDetection';

export class GamingDetectionPhase implements SimulationPhase {
  id = 'gaming-detection';
  name = 'Gaming Detection';
  order = 27; // After benchmark evaluation, before crisis detection

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    // Only run if gaming detection is enabled
    if (!state.gamingDetection) {
      return {
        events: []
      };
    }

    const events = processGamingDetection(state, rng);

    return {
      events
    };
  }
}
