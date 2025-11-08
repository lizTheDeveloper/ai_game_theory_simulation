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
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';

export class ProactiveSleeperDetectionPhase implements SimulationPhase {
  id = 'proactive-sleeper-detection';
  name = 'Proactive Sleeper Detection';
  order = 28; // After gaming detection, before crisis detection
  dependencies = ['ai-agent-actions'];

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    // HIGH-6 (Nov 8, 2025): Validate RNG for deterministic simulation
    if (!rng || typeof rng !== 'function') {
      throw new Error(
        `❌ CRITICAL: RNG required for deterministic simulation in ${this.id} ` +
        `(Month ${state.currentMonth})`
      );
    }

    // Only run if sleeper detection is enabled
    setDeterministicRng(rng);
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
