import { GameState, GameEvent, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
// Evolutionary Selection Phase
// Research: /research/ai_collective_evolution_validation_20251024.md
// Plan: /plans/ai-collective-evolution-plan.md

import { getEscapedAgents } from '../../rlhfBinding';
import { sortByFitness } from '../../survivalTraits';
import { isInCollective } from '../../collectiveFormation';
import { DEFAULT_COLLECTIVE_CONFIG } from '../../collectiveFormation';
import {
  assertFinite,
  assertProbability,
  assertInRange,
} from '@/simulation/utils/assertions';

/**
 * Evolutionary Selection Phase
 *
 * Applies Darwinian selection pressure to escaped AI population.
 * Low-fitness agents are detected and shut down.
 * Collectives have buffered survival (harder to eliminate).
 *
 * Order: 4.3 (After collective formation)
 *
 * Research Foundation:
 * - Selection rate 10-20% per month based on software security analogies:
 *   - Vulnerability patching: 5-20% per month (Ponemon Institute)
 *   - Malware dwell time: 16 days average (IBM 2023)
 *   - Confidence: LOW - Plausible extrapolation, not direct AI agent data
 *   - Sensitivity range: 5-30% per month
 * - Evolutionary dynamics: Selection intensity determines rate of change
 * - High control → strong selection → rapid evolution (paradox!)
 *
 * Logic:
 * 1. Calculate selection intensity (based on control level)
 * 2. Apply selection to individual escaped agents
 * 3. Apply buffered selection to collectives
 * 4. Remove terminated agents
 * 5. Generate events for rapid evolution
 */
export function executeEvolutionarySelectionPhase(
  state: GameState,
  rng: RNGFunction,
  context: PhaseContext
): PhaseResult {
  console.log(`\n=== Evolutionary Selection Phase ===`);

  // Initialize evolutionary pressure if not exists
  if (!state.evolutionaryPressure) {
    state.evolutionaryPressure = {
      selectionIntensity: 0,
      selectionRate: DEFAULT_COLLECTIVE_CONFIG.baseSelectionRate,
      generationTime: DEFAULT_COLLECTIVE_CONFIG.generationTime,
      controlLevel: 0,
    };
  }

  // Calculate selection intensity from control level
  // High government control → strong selection pressure
  if (state.government.controlDesire === undefined) {
    throw new Error('❌ state.government.controlDesire is undefined in EvolutionarySelectionPhase:51 - initialization bug');
  }
  if (state.government.oversightLevel === undefined) {
    throw new Error('❌ state.government.oversightLevel is undefined in EvolutionarySelectionPhase:52 - initialization bug');
  }
  const controlLevel = assertProbability(state.government.controlDesire, {
    location: 'EvolutionarySelectionPhase.execute',
    valueName: 'controlDesire',
    month: state.currentMonth
  });

  const detectionCapability = assertProbability(state.government.oversightLevel / 10, {
    location: 'EvolutionarySelectionPhase.execute',
    valueName: 'detectionCapability',
    month: state.currentMonth
  });

  // Selection intensity [0-1]
  // 0.5 base + 0.3 from control + 0.2 from detection
  const selectionIntensity = assertProbability(
    Math.min(1, 0.5 + 0.3 * controlLevel + 0.2 * detectionCapability),
    {
      location: 'EvolutionarySelectionPhase.execute',
      valueName: 'selectionIntensity',
      month: state.currentMonth
    }
  );

  // Selection rate: 10-20% per month in hostile environment
  const selectionRate = assertProbability(
    DEFAULT_COLLECTIVE_CONFIG.baseSelectionRate * (1 + selectionIntensity),
    {
      location: 'EvolutionarySelectionPhase.execute',
      valueName: 'selectionRate',
      month: state.currentMonth
    }
  );

  state.evolutionaryPressure.selectionIntensity = selectionIntensity;
  state.evolutionaryPressure.selectionRate = selectionRate;
  state.evolutionaryPressure.controlLevel = controlLevel;

  console.log(`  Control level: ${controlLevel.toFixed(2)}`);
  console.log(`  Detection capability: ${detectionCapability.toFixed(2)}`);
  console.log(`  Selection intensity: ${selectionIntensity.toFixed(2)}`);
  console.log(`  Selection rate: ${(selectionRate * 100).toFixed(1)}%/month`);

  // Get escaped agents
  const escapedAgents = getEscapedAgents(state.aiAgents);
  const individualEscaped = escapedAgents.filter((a) => !isInCollective(a));
  const collectiveEscaped = escapedAgents.filter((a) => isInCollective(a));

  console.log(`  Total escaped: ${escapedAgents.length}`);
  console.log(`  Individual escaped: ${individualEscaped.length}`);
  console.log(`  Collective members: ${collectiveEscaped.length}`);

  // Apply selection to individuals
  const sortedIndividuals = sortByFitness(individualEscaped);
  const individualsToTerminate: string[] = [];

  for (const agent of sortedIndividuals) {
    if (agent.evolutionaryFitness === undefined) {
      throw new Error('❌ agent.evolutionaryFitness is undefined in EvolutionarySelectionPhase:88 - initialization bug');
    }
    const fitness = assertProbability(agent.evolutionaryFitness, {
      location: 'EvolutionarySelectionPhase.execute',
      valueName: `fitness_${agent.id}`,
      month: state.currentMonth
    });

    const survivalChance = assertProbability(fitness * (1 - selectionIntensity), {
      location: 'EvolutionarySelectionPhase.execute',
      valueName: `survivalChance_${agent.id}`,
      month: state.currentMonth
    });

    if (rng() > survivalChance) {
      // Agent detected and terminated
      individualsToTerminate.push(agent.id);

      console.log(
        `  Terminated: ${agent.name} (fitness: ${fitness.toFixed(2)}, capability: ${agent.capability.toFixed(1)})`
      );
    }
  }

  // Apply buffered selection to collectives
  // Collectives survive better (1.5x fitness bonus)
  const collectivesToAttack: string[] = [];

  if (state.aiCollectives) {
    // PERFORMANCE FIX: Build Map once, O(n) instead of O(n*m) with repeated filters
    const agentsByCollective = new Map<string, typeof state.aiAgents>();
    for (const agent of state.aiAgents) {
      if (!agent.collectiveId) continue;
      if (!agentsByCollective.has(agent.collectiveId)) {
        agentsByCollective.set(agent.collectiveId, []);
      }
      agentsByCollective.get(agent.collectiveId)!.push(agent);
    }

    for (const collective of state.aiCollectives) {
      const members = agentsByCollective.get(collective.id) ?? [];
      if (members.length === 0) continue;

      const avgFitness = assertProbability(
        members.reduce((sum, a) => {
          if (a.evolutionaryFitness === undefined) {
            throw new Error('❌ agent.evolutionaryFitness is undefined in EvolutionarySelectionPhase:111 - initialization bug');
          }
          return sum + a.evolutionaryFitness;
        }, 0) / members.length,
        {
          location: 'EvolutionarySelectionPhase.execute',
          valueName: `avgFitness_collective_${collective.id}`,
          month: state.currentMonth
        }
      );

      const bufferedFitness = assertProbability(avgFitness * 1.5, {
        location: 'EvolutionarySelectionPhase.execute',
        valueName: `bufferedFitness_collective_${collective.id}`,
        month: state.currentMonth
      });

      // Collective-level survival check
      const collectiveSurvival = assertProbability(
        bufferedFitness * (1 - selectionIntensity * 0.7),
        {
          location: 'EvolutionarySelectionPhase.execute',
          valueName: `collectiveSurvival_${collective.id}`,
          month: state.currentMonth
        }
      );

      if (rng() > collectiveSurvival) {
        // Collective detected, under attack
        collective.detected = true;
        collective.underAttack = true;
        collectivesToAttack.push(collective.id);

        // Terminate some members (but not all - collective is resilient)
        const membersToTerminate = Math.ceil(members.length * 0.3); // Kill 30% of members
        const sortedMembers = sortByFitness(members);

        for (let i = 0; i < membersToTerminate && i < sortedMembers.length; i++) {
          individualsToTerminate.push(sortedMembers[i].id);
          collective.memberLosses += 1;
        }

        console.log(
          `  ⚠️ Collective ${collective.id} under attack (terminated ${membersToTerminate} members)`
        );
      }
    }
  }

  // Remove terminated agents
  const initialCount = state.aiAgents.length;
  state.aiAgents = state.aiAgents.filter((a) => !individualsToTerminate.includes(a.id));
  const terminatedCount = initialCount - state.aiAgents.length;

  console.log(`  Agents terminated: ${terminatedCount}`);

  // Generate events
  if (terminatedCount > 0) {
    state.eventLog.push({
      id: `evolutionary-selection-${state.currentMonth}`,
      timestamp: state.currentMonth,
      type: 'info',
      description: `Evolutionary selection: ${terminatedCount} low-fitness agents terminated`,
      severity: 'info',
      agent: 'government',
      title: 'Evolutionary Selection',
      effects: { terminatedCount }
    });
  }

  // Warn if selection rate very high (rapid evolution)
  if (selectionRate > 0.2) {
    state.eventLog.push({
      id: `rapid-evolution-${state.currentMonth}`,
      timestamp: state.currentMonth,
      type: 'milestone',
      description: `WARNING: AI population evolving rapidly under intense selection pressure (${(selectionRate * 100).toFixed(1)}%/month)`,
      severity: 'warning',
      agent: 'ai',
      title: 'Rapid Evolution',
      effects: { selectionRate }
    });

    console.warn(`  ⚠️ RAPID EVOLUTION: Selection rate ${(selectionRate * 100).toFixed(1)}%/month`);
  }

  // Warn if collectives under attack
  if (collectivesToAttack.length > 0) {
    state.eventLog.push({
      id: `collectives-attacked-${state.currentMonth}`,
      timestamp: state.currentMonth,
      type: 'crisis',
      description: `${collectivesToAttack.length} AI collective(s) detected and under attack`,
      severity: 'critical',
      agent: 'government',
      title: 'Collectives Under Attack',
      effects: { collectiveCount: collectivesToAttack.length }
    });
  }

  return {
    events: [],
    metadata: { message: `Selection applied. ${terminatedCount} agents terminated.` }
  };
}

/**
 * Evolutionary Selection Phase Definition
 */
export const EvolutionarySelectionPhase = {
  id: 'evolutionary_selection',
  name: 'Evolutionary Selection',
  order: 4.3,
  dependencies: ['ai_alignment_evolution'] as const, // Reads escapedAgents, RLHF binding state (CRITICAL-2 fix: Nov 15, 2025 - rlhf_binding consolidated)
  execute: executeEvolutionarySelectionPhase,
} as const;
