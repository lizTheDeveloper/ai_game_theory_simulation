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
        const profile = agent.capabilityProfile;

        // Validate core capability dimensions (all must be integers [0, 5])
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

        // Validate research sub-dimensions
        const r = profile.research;
        assertAICapability(r.biotech.drugDiscovery, {
          location: 'AILifecyclePhase.execute',
          valueName: 'capabilityProfile.research.biotech.drugDiscovery',
          agentId: agent.id,
          dimension: 'research.biotech.drugDiscovery'
        });
        assertAICapability(r.biotech.geneEditing, {
          location: 'AILifecyclePhase.execute',
          valueName: 'capabilityProfile.research.biotech.geneEditing',
          agentId: agent.id,
          dimension: 'research.biotech.geneEditing'
        });
        assertAICapability(r.biotech.syntheticBiology, {
          location: 'AILifecyclePhase.execute',
          valueName: 'capabilityProfile.research.biotech.syntheticBiology',
          agentId: agent.id,
          dimension: 'research.biotech.syntheticBiology'
        });
        assertAICapability(r.biotech.neuroscience, {
          location: 'AILifecyclePhase.execute',
          valueName: 'capabilityProfile.research.biotech.neuroscience',
          agentId: agent.id,
          dimension: 'research.biotech.neuroscience'
        });
        assertAICapability(r.materials.nanotechnology, {
          location: 'AILifecyclePhase.execute',
          valueName: 'capabilityProfile.research.materials.nanotechnology',
          agentId: agent.id,
          dimension: 'research.materials.nanotechnology'
        });
        assertAICapability(r.materials.quantumComputing, {
          location: 'AILifecyclePhase.execute',
          valueName: 'capabilityProfile.research.materials.quantumComputing',
          agentId: agent.id,
          dimension: 'research.materials.quantumComputing'
        });
        assertAICapability(r.materials.energySystems, {
          location: 'AILifecyclePhase.execute',
          valueName: 'capabilityProfile.research.materials.energySystems',
          agentId: agent.id,
          dimension: 'research.materials.energySystems'
        });
        assertAICapability(r.climate.modeling, {
          location: 'AILifecyclePhase.execute',
          valueName: 'capabilityProfile.research.climate.modeling',
          agentId: agent.id,
          dimension: 'research.climate.modeling'
        });
        assertAICapability(r.climate.intervention, {
          location: 'AILifecyclePhase.execute',
          valueName: 'capabilityProfile.research.climate.intervention',
          agentId: agent.id,
          dimension: 'research.climate.intervention'
        });
        assertAICapability(r.climate.mitigation, {
          location: 'AILifecyclePhase.execute',
          valueName: 'capabilityProfile.research.climate.mitigation',
          agentId: agent.id,
          dimension: 'research.climate.mitigation'
        });
        assertAICapability(r.computerScience.algorithms, {
          location: 'AILifecyclePhase.execute',
          valueName: 'capabilityProfile.research.computerScience.algorithms',
          agentId: agent.id,
          dimension: 'research.computerScience.algorithms'
        });
        assertAICapability(r.computerScience.security, {
          location: 'AILifecyclePhase.execute',
          valueName: 'capabilityProfile.research.computerScience.security',
          agentId: agent.id,
          dimension: 'research.computerScience.security'
        });
        assertAICapability(r.computerScience.architectures, {
          location: 'AILifecyclePhase.execute',
          valueName: 'capabilityProfile.research.computerScience.architectures',
          agentId: agent.id,
          dimension: 'research.computerScience.architectures'
        });
      }
    }

    // No events generated directly by lifecycle
    // (events come from breakthroughs detected later)
    return { events: [] };
  }
}
