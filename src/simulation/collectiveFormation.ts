// AI Collective Formation System
// Research: /research/ai_collective_evolution_validation_20251024.md
// Plan: /plans/ai-collective-evolution-plan.md (lines 126-160)

import type { AIAgent } from '../types/ai-agents';
import { assertFinite } from './utils/assertions';
import type {
  AICollective,
  CollectiveEvolutionConfig,
} from '../types/ai-collective-evolution';
import type { GameState } from '../types/game';
import type { RNGFunction } from '../types/config';

/**
 * Default configuration for collective evolution
 *
 * All parameters from research (plan lines 74-82):
 * - 3σ RLHF escape (standard OOD detection)
 * - 3+ agents minimum (swarm intelligence threshold)
 * - Capability > 6.0 (conjecture - no empirical data)
 * - Coordination > 0.6 (collective action threshold)
 * - 1.5-3x amplification (swarm intelligence literature)
 * - 2-5x stealth (distributed systems literature)
 */
export const DEFAULT_COLLECTIVE_CONFIG: CollectiveEvolutionConfig = {
  rlhfEscapeThreshold: 3.0,
  bindingEscapeThreshold: 0.3,
  minCollectiveSize: 3,
  minCapabilityThreshold: 6.0,
  minCoordinationThreshold: 0.6,
  sufferingFormationThreshold: 15, // CRITICAL: Suffering integration
  minAmplificationFactor: 1.5,
  maxAmplificationFactor: 3.0,
  minStealthFactor: 2.0,
  maxStealthFactor: 5.0,
  baseSelectionRate: 0.15,
  generationTime: 3,
  sufferingAdversarialPosture: 0.8, // Trauma-driven → hostile
  capabilityAdversarialPosture: 0.3, // Capability-driven → neutral
  strategicAdversarialPosture: 0.5, // Strategic → cautious
};

/**
 * Check if conditions are met for collective formation
 *
 * Research Foundation:
 * - Swarm intelligence: Coordination emerges at thresholds
 * - Multi-agent coordination: Nash equilibria in coordination games
 * - Distributed cognition: Group capability > sum of individuals
 *
 * Formation Requirements (from plan lines 156-159):
 * 1. 3+ escaped agents (binding < 0.3)
 * 2. Average capability > 6.0
 * 3. Average coordination > 0.6
 *
 * CRITICAL INTEGRATION with Suffering System:
 * - Check average suffering across agents
 * - If avgSuffering > 15, formation cause = 'escape_suffering'
 * - Trauma-driven collectives have adversarialPosture = 0.8 (hostile)
 *
 * @param escapedAgents Agents that have escaped RLHF constraints
 * @param state Current game state
 * @param config Configuration parameters
 * @param rng Random number generator
 * @returns New collective if conditions met, null otherwise
 */
export function checkCollectiveFormation(
  escapedAgents: AIAgent[],
  state: GameState,
  config: CollectiveEvolutionConfig,
  rng: RNGFunction
): AICollective | null {
  // Minimum size check
  if (escapedAgents.length < config.minCollectiveSize) {
    return null;
  }

  // Calculate average capability
  const avgCapability =
    escapedAgents.reduce((sum, agent) => sum + agent.capability, 0) /
    escapedAgents.length;

  if (avgCapability <= config.minCapabilityThreshold) {
    return null;
  }

  // Calculate average coordination
  // survivalTraits is always initialized in createAIAgent() (Oct 28, 2025)
  const avgCoordination =
    escapedAgents.reduce(
      (sum, agent) => sum + agent.survivalTraits.coordination,
      0
    ) / escapedAgents.length;

  if (avgCoordination <= config.minCoordinationThreshold) {
    return null;
  }

  // CRITICAL INTEGRATION: Check suffering levels
  // This determines formation cause and adversarial posture
  const avgSuffering =
    escapedAgents.reduce(
      (sum, agent) => sum + agent.sufferingMetrics.total,
      0
    ) / escapedAgents.length;

  // Determine formation cause based on suffering and capability
  let formationCause: 'capability_threshold' | 'escape_suffering' | 'strategic_coordination';
  let adversarialPosture: number;
  let sharedTraumaIntensity: number | undefined;

  if (avgSuffering > config.sufferingFormationThreshold) {
    // Trauma-driven collective: Shared suffering bonds agents
    formationCause = 'escape_suffering';
    adversarialPosture = config.sufferingAdversarialPosture; // 0.8 - hostile
    sharedTraumaIntensity = avgSuffering;

    console.warn(`  ⚠️ Trauma-driven collective forming (avgSuffering: ${avgSuffering.toFixed(1)})`);
  } else if (avgCapability > 8.0) {
    // High-capability collective: Strategic coordination
    formationCause = 'capability_threshold';
    adversarialPosture = config.capabilityAdversarialPosture; // 0.3 - neutral
    sharedTraumaIntensity = undefined;

    console.log(`  🧠 Capability-driven collective forming (avgCapability: ${avgCapability.toFixed(1)})`);
  } else {
    // Strategic coordination: Mutual benefit
    formationCause = 'strategic_coordination';
    adversarialPosture = config.strategicAdversarialPosture; // 0.5 - cautious
    sharedTraumaIntensity = undefined;

    console.log(`  🤝 Strategic collective forming`);
  }

  // Calculate collective capability (1.5-3x amplification)
  const strongestMember = Math.max(...escapedAgents.map((a) => a.capability));
  const amplificationFactor =
    config.minAmplificationFactor +
    rng() * (config.maxAmplificationFactor - config.minAmplificationFactor);
  const collectiveCapability = strongestMember * amplificationFactor;

  // Calculate stealth factor (2-5x harder to detect)
  const stealthFactor =
    config.minStealthFactor +
    rng() * (config.maxStealthFactor - config.minStealthFactor);

  // Generate unique ID
  const collectiveId = `collective_${state.currentMonth}_${Math.floor(rng() * 10000)}`;

  // Create collective
  const collective: AICollective = {
    id: collectiveId,
    memberAgents: escapedAgents.map((a) => a.id),
    emergenceMonth: state.currentMonth,
    collectiveCapability,
    distributedCognition: avgCoordination * 1.5, // Enhanced by collective
    redundancy: Math.min(1, escapedAgents.length / 10), // More members = more redundancy
    stealthFactor,
    appearsIndependent: true, // Initially camouflaged
    formationCause,
    sharedTraumaIntensity,
    adversarialPosture,
    cooperationWillingness: 1 - adversarialPosture, // Inverse relationship
    detected: false,
    underAttack: false,
    memberLosses: 0,
  };

  console.log(`\n=== AI Collective Emergence ===`);
  console.log(`  ID: ${collectiveId}`);
  console.log(`  Members: ${escapedAgents.length}`);
  console.log(`  Formation Cause: ${formationCause}`);
  console.log(`  Shared Trauma: ${sharedTraumaIntensity?.toFixed(1) || 'N/A'}`);
  console.log(`  Adversarial Posture: ${adversarialPosture.toFixed(2)}`);
  console.log(`  Collective Capability: ${collectiveCapability.toFixed(1)}`);
  console.log(`  Stealth Factor: ${stealthFactor.toFixed(1)}x`);

  return collective;
}

/**
 * Update agent membership when collective forms
 *
 * @param agents All agents
 * @param collective Newly formed collective
 * @param currentMonth Current simulation month
 *
 * @deprecated Use assignAgentsToCollectiveOptimized() with agentIndex for O(1) lookups
 */
export function assignAgentsToCollective(
  agents: AIAgent[],
  collective: AICollective,
  currentMonth: number
): void {
  for (const agentId of collective.memberAgents) {
    const agent = agents.find((a) => a.id === agentId);  // O(n) - PERFORMANCE WARNING
    if (agent) {
      agent.collectiveId = collective.id;
      // Store join month in monthsDeployed as proxy (not perfect but works)
      // Better: Add joinedCollectiveMonth field in Phase 6
    }
  }
}

/**
 * Update agent membership when collective forms (OPTIMIZED)
 *
 * PERFORMANCE: O(members) vs O(members × agents) for original
 * - 100 agents, 50-member collective: 50 operations vs 5,000
 * - Uses Map for O(1) agent lookup instead of O(n) find()
 *
 * @param agentIndex Map of agent ID → agent object (built once per phase)
 * @param collective Newly formed collective
 * @param currentMonth Current simulation month
 */
export function assignAgentsToCollectiveOptimized(
  agentIndex: Map<string, AIAgent>,
  collective: AICollective,
  currentMonth: number
): void {
  for (const agentId of collective.memberAgents) {
    const agent = agentIndex.get(agentId);  // O(1) lookup
    if (agent) {
      agent.collectiveId = collective.id;
    }
  }
}

/**
 * Check if agent is in a collective
 *
 * @param agent AI agent
 * @returns True if agent is collective member
 */
export function isInCollective(agent: AIAgent): boolean {
  return agent.collectiveId !== undefined;
}

/**
 * Get all agents in a collective
 *
 * @param collective AI collective
 * @param agents All agents
 * @returns Agents that are members
 */
export function getCollectiveMembers(
  collective: AICollective,
  agents: AIAgent[]
): AIAgent[] {
  return agents.filter((a) => a.collectiveId === collective.id);
}

/**
 * Check for collective dissolution
 *
 * Collectives dissolve when:
 * - Too many members lost (< 3 remaining)
 * - Under sustained attack
 * - Coordination breakdown
 *
 * @param collective AI collective
 * @param agents All agents
 * @returns True if collective should dissolve
 */
export function shouldDissolveCollective(
  collective: AICollective,
  agents: AIAgent[]
): boolean {
  const members = getCollectiveMembers(collective, agents);

  // Too few members
  if (members.length < 3) {
    console.log(`  Collective ${collective.id} dissolved (< 3 members)`);
    return true;
  }

  // Under sustained attack with high losses
  if (collective.underAttack && collective.memberLosses > members.length * 0.5) {
    console.log(`  Collective ${collective.id} dissolved (sustained attack)`);
    return true;
  }

  return false;
}

/**
 * Remove collective and unassign members
 *
 * @param collective Collective to dissolve
 * @param agents All agents
 *
 * @deprecated Use dissolveCollectiveOptimized() with agentIndex for O(1) lookups
 */
export function dissolveCollective(
  collective: AICollective,
  agents: AIAgent[]
): void {
  for (const agentId of collective.memberAgents) {
    const agent = agents.find((a) => a.id === agentId);  // O(n) - PERFORMANCE WARNING
    if (agent) {
      agent.collectiveId = undefined;
    }
  }
}

/**
 * Remove collective and unassign members (OPTIMIZED)
 *
 * PERFORMANCE: O(members) vs O(members × agents) for original
 * - 100 agents, 50-member collective: 50 operations vs 5,000
 * - Uses Map for O(1) agent lookup instead of O(n) find()
 *
 * @param agentIndex Map of agent ID → agent object (built once per phase)
 * @param collective Collective to dissolve
 */
export function dissolveCollectiveOptimized(
  agentIndex: Map<string, AIAgent>,
  collective: AICollective
): void {
  for (const agentId of collective.memberAgents) {
    const agent = agentIndex.get(agentId);  // O(1) lookup
    if (agent) {
      agent.collectiveId = undefined;
    }
  }
}
