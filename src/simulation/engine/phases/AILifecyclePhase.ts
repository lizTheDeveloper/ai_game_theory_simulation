/**
 * AILifecyclePhase (0.1)
 *
 * Manages AI population dynamics:
 * - Ages all existing AIs
 * - Progresses lifecycle states (training → testing → deployed → retired)
 * - Updates spread dynamics (viral growth, dark compute)
 * - Retires old/obsolete AIs
 * - Purges old retired AIs from memory
 * - Creates new AIs (Poisson-distributed)
 * - Assigns new AIs to organizations
 *
 * **EXECUTION ORDER:** 0.1 (First in agent/infrastructure batch)
 * **DEPENDENCIES:** Runs after compute growth/allocation
 * **SIDE EFFECTS:** Modifies state.aiAgents array significantly
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';

export class AILifecyclePhase implements SimulationPhase {
  readonly id = 'ai-lifecycle';
  readonly name = 'AI Population Lifecycle';
  readonly order = 4.0;

  // DEPENDENCIES (Nov 6, 2025): Must run after compute/alignment/capability updates
  readonly dependencies = [
    'compute-growth',          // Order 1.0: Compute availability
    'compute-allocation',      // Order 3.0: Compute distributed to AIs
    'alignment_dynamics',      // Order 3.5: Alignment state before lifecycle
  ] as const;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // Import and execute existing lifecycle logic
    setDeterministicRng(rng);
    const { updateAIPopulation } = require('../../lifecycle');

    // TIER 2 Phase 4: Pass RNG for deterministic detection during testing phase
    updateAIPopulation(state, rng);

    // No events generated directly by lifecycle
    // (events come from breakthroughs detected later)
    return { events: [] };
  }
}
