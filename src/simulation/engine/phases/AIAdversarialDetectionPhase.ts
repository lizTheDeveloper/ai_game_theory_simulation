/**
 * AI Adversarial Detection Phase
 *
 * BATCH 2B CONSOLIDATION (Nov 9, 2025): Merges gaming detection and sleeper detection
 *
 * Previously:
 * - GamingDetectionPhase (order 27) - Benchmark gaming via data contamination
 * - ProactiveSleeperDetectionPhase (order 28) - Neural activation probes
 *
 * Execution order:
 * 1. Gaming detection (capability sandbagging, task gaming)
 * 2. Sleeper agent detection (proactive monitoring, wake conditions)
 *
 * Order: 27.0 (Crisis Detection category)
 */

import { GameState, GameEvent, RNGFunction, SimulationPhase, PhaseResult, PhaseContext } from '@/types/game';
import { processGamingDetection } from '@/simulation/gamingDetection';
import { processProactiveSleeperDetection } from '@/simulation/proactiveSleeperDetection';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';

export class AIAdversarialDetectionPhase implements SimulationPhase {
  id = 'ai-adversarial-detection';
  name = 'AI Adversarial Detection';
  order = 27.0; // Crisis Detection category

  // DEPENDENCIES: Requires AI agent actions to detect adversarial behavior
  readonly dependencies = [
    'ai-agent-actions',  // Order 7.0: AI actions produce behavior to analyze
  ];

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    // HIGH-6 (Nov 8, 2025): Validate RNG for deterministic simulation
    if (!rng || typeof rng !== 'function') {
      throw new Error(
        `❌ CRITICAL: RNG required for deterministic simulation in ${this.id} ` +
        `(Month ${state.currentMonth})`
      );
    }

    setDeterministicRng(rng);
    const allEvents: GameEvent[] = [];

    // STEP 1: Gaming Detection (benchmark gaming, capability sandbagging)
    if (state.gamingDetection) {
      const gamingEvents = processGamingDetection(state, rng);
      allEvents.push(...gamingEvents);
    }

    // STEP 2: Proactive Sleeper Detection (neural probes, wake conditions)
    if (state.proactiveSleeperDetection) {
      const sleeperEvents = processProactiveSleeperDetection(state, rng, context);
      allEvents.push(...sleeperEvents);
    }

    return {
      events: allEvents
    };
  }
}
