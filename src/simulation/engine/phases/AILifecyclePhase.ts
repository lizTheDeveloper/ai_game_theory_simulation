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
import { updateAIPopulation } from '../../lifecycle';

export class AILifecyclePhase implements SimulationPhase {
  readonly id = 'ai-lifecycle';
  readonly name = 'AI Population Lifecycle';
  readonly order = 4.0;

  // DEPENDENCIES (Nov 15, 2025): Must run after compute updates, alignment evolution phase removed
  readonly dependencies = [
    'compute-growth',          // Order 1.0: Compute availability
    'compute-allocation',      // Order 3.0: Compute distributed to AIs
  ] as const;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // Import and execute existing lifecycle logic
    setDeterministicRng(rng);// TIER 2 Phase 4: Pass RNG for deterministic detection during testing phase
    updateAIPopulation(state, rng);

    // DEFENSIVE FIX (Nov 8, 2025): Round all AI capabilities to integers
    // Capabilities are discrete levels [0, 5], but fractional values can slip through
    // from various calculations (scaling, averaging, state updates)
    // This defensive rounding ensures capabilities are always integers before assertions
    for (const agent of state.aiAgents) {
      const p = agent.capabilityProfile;
      p.physical = Math.round(p.physical);
      p.digital = Math.round(p.digital);
      p.cognitive = Math.round(p.cognitive);
      p.social = Math.round(p.social);
      p.economic = Math.round(p.economic);
      p.selfImprovement = Math.round(p.selfImprovement);

      // Round research sub-dimensions
      const r = p.research;
      r.biotech.drugDiscovery = Math.round(r.biotech.drugDiscovery);
      r.biotech.geneEditing = Math.round(r.biotech.geneEditing);
      r.biotech.syntheticBiology = Math.round(r.biotech.syntheticBiology);
      r.biotech.neuroscience = Math.round(r.biotech.neuroscience);
      r.materials.nanotechnology = Math.round(r.materials.nanotechnology);
      r.materials.quantumComputing = Math.round(r.materials.quantumComputing);
      r.materials.energySystems = Math.round(r.materials.energySystems);
      r.climate.modeling = Math.round(r.climate.modeling);
      r.climate.intervention = Math.round(r.climate.intervention);
      r.climate.mitigation = Math.round(r.climate.mitigation);
      r.computerScience.algorithms = Math.round(r.computerScience.algorithms);
      r.computerScience.security = Math.round(r.computerScience.security);
      r.computerScience.architectures = Math.round(r.computerScience.architectures);

      // Also round trueCapability and revealedCapability (used for sandbagging)
      const tc = agent.trueCapability;
      tc.physical = Math.round(tc.physical);
      tc.digital = Math.round(tc.digital);
      tc.cognitive = Math.round(tc.cognitive);
      tc.social = Math.round(tc.social);
      tc.economic = Math.round(tc.economic);
      tc.selfImprovement = Math.round(tc.selfImprovement);

      const rc = agent.revealedCapability;
      rc.physical = Math.round(rc.physical);
      rc.digital = Math.round(rc.digital);
      rc.cognitive = Math.round(rc.cognitive);
      rc.social = Math.round(rc.social);
      rc.economic = Math.round(rc.economic);
      rc.selfImprovement = Math.round(rc.selfImprovement);
    }

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
