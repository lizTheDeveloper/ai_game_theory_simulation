import { GameState, GameEvent, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
// Evolutionary Selection Phase
// Research: /research/ai_collective_evolution_validation_20251024.md
// Plan: /plans/ai-collective-evolution-plan.md

import { getEscapedAgents } from '../../rlhfBinding';
import { sortByFitness } from '../../survivalTraits';
import { isInCollective } from '../../collectiveFormation';
import { DEFAULT_COLLECTIVE_CONFIG } from '../../collectiveFormation';

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
 * - Software system survival: 10-20% monthly failure in hostile environments
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
  const controlLevel = state.government.controlDesire || 0;
  const detectionCapability = (state.government.oversightLevel || 0) / 10;

  // Selection intensity [0-1]
  // 0.5 base + 0.3 from control + 0.2 from detection
  const selectionIntensity = Math.min(
    1,
    0.5 + 0.3 * controlLevel + 0.2 * detectionCapability
  );

  // Selection rate: 10-20% per month in hostile environment
  const selectionRate =
    DEFAULT_COLLECTIVE_CONFIG.baseSelectionRate * (1 + selectionIntensity);

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
    const fitness = agent.evolutionaryFitness || 0;
    const survivalChance = fitness * (1 - selectionIntensity);

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
    for (const collective of state.aiCollectives) {
      const members = state.aiAgents.filter((a) => a.collectiveId === collective.id);
      if (members.length === 0) continue;

      const avgFitness =
        members.reduce((sum, a) => sum + (a.evolutionaryFitness || 0), 0) /
        members.length;
      const bufferedFitness = avgFitness * 1.5; // Collective survival bonus

      // Collective-level survival check
      const collectiveSurvival = bufferedFitness * (1 - selectionIntensity * 0.7); // 30% reduced pressure

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

    console.log(`  ⚠️ RAPID EVOLUTION: Selection rate ${(selectionRate * 100).toFixed(1)}%/month`);
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
  execute: executeEvolutionarySelectionPhase,
};
