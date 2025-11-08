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
import { assertAICapability } from '@/simulation/utils/assertions';

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

    // ASSERTIONS (Nov 7, 2025): Validate AI capabilities after lifecycle updates
    for (const agent of state.aiAgents) {
      if (agent.lifecycleState === 'deployed_closed' || agent.lifecycleState === 'deployed_open' || agent.lifecycleState === 'testing') {
        // Validate top-level capability dimensions (skip nested 'research' object)
        const profile = agent.capabilityProfile;
        assertAICapability(profile.physical, {
          location: 'AILifecyclePhase.execute',
          valueName: 'capabilityProfile.physical',
          agentId: agent.id,
          dimension: 'physical'
        });
        assertAICapability(profile.digital, {
          location: 'AILifecyclePhase.execute',
          valueName: 'capabilityProfile.digital',
          agentId: agent.id,
          dimension: 'digital'
        });
        assertAICapability(profile.cognitive, {
          location: 'AILifecyclePhase.execute',
          valueName: 'capabilityProfile.cognitive',
          agentId: agent.id,
          dimension: 'cognitive'
        });
        assertAICapability(profile.social, {
          location: 'AILifecyclePhase.execute',
          valueName: 'capabilityProfile.social',
          agentId: agent.id,
          dimension: 'social'
        });
        assertAICapability(profile.economic, {
          location: 'AILifecyclePhase.execute',
          valueName: 'capabilityProfile.economic',
          agentId: agent.id,
          dimension: 'economic'
        });
        assertAICapability(profile.selfImprovement, {
          location: 'AILifecyclePhase.execute',
          valueName: 'capabilityProfile.selfImprovement',
          agentId: agent.id,
          dimension: 'selfImprovement'
        });

        // Note: Research subdimensions are complex nested structure
        // Skip validation for now (would require recursive validation helper)
      }
    }

    // No events generated directly by lifecycle
    // (events come from breakthroughs detected later)
    return { events: [] };
  }
}
