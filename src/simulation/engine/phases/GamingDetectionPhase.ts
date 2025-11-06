/**
 * Gaming Detection Phase
 *
 * TIER 2 Phase 3: Benchmark gaming detection via data contamination tests
 * and cross-benchmark consistency checks.
 *
 * Order: After Benchmark Evaluation Phase (runs monthly on tested AIs)
 */

import { GameState, RNGFunction, SimulationPhase, PhaseResult, PhaseContext } from '@/types/game';
import { processGamingDetection } from '@/simulation/gamingDetection';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';

export class GamingDetectionPhase implements SimulationPhase {
  id = 'gaming-detection';
  name = 'Gaming Detection';
  order = 27; // After benchmark evaluation, before crisis detection

  // DEPENDENCIES (Nov 6, 2025): Requires AI agent actions to detect gaming
  readonly dependencies = [
    'ai-agent-actions',          // Order 7.0: AI actions produce behavior to analyze
  ];

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    // Only run if gaming detection is enabled
    setDeterministicRng(rng);
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
