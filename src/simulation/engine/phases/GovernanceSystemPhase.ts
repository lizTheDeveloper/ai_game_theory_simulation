/**
 * Governance System Phase
 *
 * Consolidates governance-related updates:
 * 1. Government elections and opinion dynamics
 * 2. Governance quality (democratic health, participation)
 * 3. Policy implementation lifecycle
 *
 * Order: 10.0 (after agent actions, before spirals)
 *
 * Research Foundation:
 * - V-Dem v14 (2024): Democratic accountability mechanisms
 * - Pressman & Wildavsky (1973): Implementation delays
 * - Sabatier (1988): Political will decay
 * - Stigler (1971): Regulatory capture
 */

import {
  GameState,
  GameEvent,
  SimulationPhase,
  PhaseResult,
  PhaseContext,
  RNGFunction
} from '@/types/game';
import { assertEconomicStage } from '../../utils/assertions';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { updatePolicyImplementation } from '@/simulation/government/policyLifecycle';
import { updateGovernanceQuality } from '../../governanceQuality';

export class GovernanceSystemPhase implements SimulationPhase {
  readonly id = 'governance-system';
  readonly name = 'Governance System Update';
  readonly order = 10.0;

  // DEPENDENCIES (Nov 15, 2025): Requires AI agents and government state
  readonly dependencies = [
    'ai-agent-actions',       // Order 7.0
    'government-actions',     // Order 9.0
  ] as const;

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    // HIGH-6 (Nov 8, 2025): Validate RNG for deterministic simulation
    if (!rng || typeof rng !== 'function') {
      throw new Error(
        `❌ CRITICAL: RNG required for deterministic simulation in ${this.id} ` +
        `(Month ${state.currentMonth})`
      );
    }

    setDeterministicRng(rng);
    const defaultContext: PhaseContext = {
      month: state.currentMonth,
      data: new Map(),
      executedPhases: new Set()
    };
    const phaseContext = context || defaultContext;

    const events: GameEvent[] = [];

    // 1. Government Elections & Public Opinion
    const electionEvents = executeGovernmentElections(state, rng, phaseContext);
    events.push(...electionEvents);

    // 2. Governance Quality Update
    executeGovernanceQualityUpdate(state, rng);

    // 3. Policy Implementation (moved from order 25.5)
    // NOTE: This runs earlier now - validate in Monte Carlo
    const policyEvents = executePolicyImplementation(state, rng, phaseContext);
    events.push(...policyEvents);

    return { events };
  }
}

/**
 * Government Elections & Public Opinion
 * (formerly GovernmentElectionPhase, order 8.5)
 */
function executeGovernmentElections(
  state: GameState,
  rng: RNGFunction,
  context: PhaseContext
): GameEvent[] {
  if (!state.governmentSystem) {
    return [];
  }

  const events: GameEvent[] = [];

  // 1. Check for scheduled elections
  let electionsHeld = 0;
  for (const [countryCode, electionMonth] of state.governmentSystem.nextElections) {
    if (state.currentMonth >= electionMonth) {
      const gov = state.governmentSystem.governments.get(countryCode);
      if (!gov) continue;

      // Hold election
      const result = simulateElection(state, countryCode, rng);
      if (result.changed) {
        events.push({
          id: `election_${countryCode}_${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'government',
          severity: 'info',
          agent: 'government',
          title: 'Election Held',
          description: `${(gov as any).countryName}: ${result.message}`,
          effects: { country: countryCode, changed: result.changed }
        });
        electionsHeld++;
      }

      // Schedule next election
      const electionCycle = (gov as any).characteristics?.electionCycleMonths || 48;
      state.governmentSystem.nextElections.set(
        countryCode,
        state.currentMonth + electionCycle
      );
    }
  }

  if (electionsHeld > 0) {
    console.log(`\n=== Government Elections ===`);
    console.log(`  Elections held: ${electionsHeld}`);
  }

  // 2. Update public opinion based on performance
  updatePublicOpinion(state, rng);

  // 3. Check coalition stability (for parliamentary systems)
  checkCoalitionStability(state, rng, events);

  return events;
}

/**
 * Simulate election
 */
function simulateElection(
  state: GameState,
  countryCode: string,
  rng: RNGFunction
): { changed: boolean; message: string } {
  const opinion = state.governmentSystem!.publicOpinion.get(countryCode);
  if (opinion === undefined) {
    throw new Error(
      '❌ state.governmentSystem.publicOpinion.get(countryCode) is undefined in GovernanceSystemPhase:simulateElection - initialization bug'
    );
  }

  // High opinion = government likely to be reelected
  const reelectionProbability = opinion * 0.8 + 0.1;

  if (rng() < reelectionProbability) {
    return {
      changed: false,
      message: 'Government reelected'
    };
  } else {
    // Government changes - reset opinion to moderate
    state.governmentSystem!.publicOpinion.set(countryCode, 0.5 + (rng() - 0.5) * 0.2);
    return {
      changed: true,
      message: 'New government elected'
    };
  }
}

/**
 * Update public opinion based on economic and social conditions
 */
function updatePublicOpinion(state: GameState, rng: RNGFunction): void {
  for (const [countryCode, gov] of state.governmentSystem!.governments) {
    const opinionValue = state.governmentSystem!.publicOpinion.get(countryCode);
    if (opinionValue === undefined) {
      throw new Error(
        '❌ state.governmentSystem.publicOpinion.get(countryCode) is undefined in GovernanceSystemPhase:updatePublicOpinion - initialization bug'
      );
    }
    let opinion = opinionValue;

    // 1. Economic performance affects opinion
    const economicStage = assertEconomicStage(state, 'GovernanceSystemPhase.updatePublicOpinion');
    if (economicStage > 2) {
      opinion += 0.02; // Advanced economy boosts opinion
    } else if (economicStage < 1) {
      opinion -= 0.03; // Struggling economy hurts opinion
    }

    // 2. Quality of life affects opinion
    const qol = state.globalMetrics.qualityOfLife;
    if (qol > 0.75) {
      opinion += 0.015;
    } else if (qol < 0.5) {
      opinion -= 0.025;
    }

    // 3. Crisis penalty
    const env = state.environmentalAccumulation;
    const social = state.socialAccumulation;
    const tech = state.technologicalRisk;
    const crisisCount = [
      env.resourceCrisisActive,
      env.pollutionCrisisActive,
      env.climateCrisisActive,
      env.ecosystemCrisisActive,
      social.meaningCollapseActive,
      social.socialUnrestActive,
      social.institutionalFailureActive,
      tech.controlLossActive,
      tech.corporateDystopiaActive
    ].filter(Boolean).length;

    if (crisisCount > 2) {
      opinion -= 0.04 * crisisCount;
    }

    // 4. AI trust affects opinion
    if (state.society === undefined || state.society.trustInAI === undefined) {
      throw new Error(
        '❌ state.society or state.society.trustInAI is undefined in GovernanceSystemPhase:updatePublicOpinion - initialization bug'
      );
    }
    const aiTrust = state.society.trustInAI;
    if (aiTrust < 0.3) {
      opinion -= 0.02; // Low AI trust hurts government
    }

    // 5. Random drift
    opinion += (rng() - 0.5) * 0.02;

    // 6. Clamp to [0.1, 0.9] range
    opinion = Math.max(0.1, Math.min(0.9, opinion));

    state.governmentSystem!.publicOpinion.set(countryCode, opinion);
  }
}

/**
 * Check coalition stability
 */
function checkCoalitionStability(
  state: GameState,
  rng: RNGFunction,
  events: GameEvent[]
): void {
  for (const [countryCode, coalition] of state.governmentSystem!.coalitions) {
    const opinion = state.governmentSystem!.publicOpinion.get(countryCode);
    if (opinion === undefined) {
      throw new Error(
        '❌ state.governmentSystem.publicOpinion.get(countryCode) is undefined in GovernanceSystemPhase:checkCoalitionStability - initialization bug'
      );
    }

    // Coalition stability decreases with low opinion
    coalition.stability = coalition.stability * 0.95 + opinion * 0.05;

    // Coalition collapses if stability drops below threshold
    if (coalition.stability < 0.3 && rng() > 0.7) {
      const gov = state.governmentSystem!.governments.get(countryCode);
      events.push({
        id: `coalition_collapse_${countryCode}_${state.currentMonth}`,
        timestamp: state.currentMonth,
        type: 'government',
        severity: 'warning',
        agent: 'government',
        title: 'Coalition Collapse',
        description: `${(gov as any)?.countryName || countryCode}: Coalition collapsed - snap election called`,
        effects: { country: countryCode, coalitionStability: coalition.stability }
      });

      // Schedule snap election
      state.governmentSystem!.nextElections.set(countryCode, state.currentMonth + 2);

      // Remove coalition
      state.governmentSystem!.coalitions.delete(countryCode);
    }
  }
}

/**
 * Governance Quality Update
 * (formerly GovernanceQualityPhase, order 10.0)
 */
function executeGovernanceQualityUpdate(state: GameState, rng: RNGFunction): void {updateGovernanceQuality(state);
}

/**
 * Policy Implementation
 * (formerly PolicyImplementationPhase, order 25.5)
 */
function executePolicyImplementation(
  state: GameState,
  rng: RNGFunction,
  context: PhaseContext
): GameEvent[] {
  if (!state.governmentSystem || state.governmentSystem.activePolicies.length === 0) {
    return [];
  }

  const events: GameEvent[] = [];
  console.log('\n=== Policy Implementation ===');

  let updatedCount = 0;
  let abandonedCount = 0;

  // Update each active policy
  for (const policy of state.governmentSystem.activePolicies) {
    const oldEffectiveness = policy.currentEffectiveness;

    // Update implementation progress
    updatePolicyImplementation(policy, state, rng);

    // Check if effectiveness changed significantly (>5% absolute)
    if (Math.abs(policy.currentEffectiveness - oldEffectiveness) > 0.05) {
      updatedCount++;

      // Log significant milestones (25%, 50%, 75%, 90%)
      const milestones = [0.25, 0.5, 0.75, 0.9];
      for (const milestone of milestones) {
        if (oldEffectiveness < milestone && policy.currentEffectiveness >= milestone) {
          console.log(
            `  🏛️ ${policy.country} ${policy.domain}: ${(milestone * 100).toFixed(0)}% effective`
          );
          events.push({
            id: `policy_milestone_${policy.country}_${policy.domain}_${milestone}_${state.currentMonth}`,
            timestamp: state.currentMonth,
            type: 'policy',
            severity: 'info',
            agent: 'government',
            title: 'Policy Implementation Milestone',
            description: `${policy.country}: ${policy.domain} policy reached ${(milestone * 100).toFixed(0)}% effectiveness`,
            effects: {
              country: policy.country,
              domain: policy.domain,
              effectiveness: policy.currentEffectiveness
            }
          });
        }
      }
    }

    // Check if policy was abandoned
    if (policy.currentEffectiveness === 0 && oldEffectiveness > 0) {
      abandonedCount++;
      events.push({
        id: `policy_abandoned_${policy.country}_${policy.domain}_${state.currentMonth}`,
        timestamp: state.currentMonth,
        type: 'crisis',
        severity: 'warning',
        agent: 'government',
        title: 'Policy Abandoned',
        description: `${policy.country}: ${policy.domain} policy abandoned due to insufficient political will`,
        effects: { country: policy.country, domain: policy.domain }
      });
    }
  }

  // Remove abandoned policies
  const beforeCount = state.governmentSystem.activePolicies.length;
  state.governmentSystem.activePolicies = state.governmentSystem.activePolicies.filter(
    (policy) => policy.currentEffectiveness > 0
  );
  const afterCount = state.governmentSystem.activePolicies.length;

  if (updatedCount > 0) {
    console.log(`  Updated ${updatedCount} policies`);
  }
  if (abandonedCount > 0) {
    console.log(`  Abandoned ${abandonedCount} policies`);
  }
  console.log(`  Active policies: ${afterCount}`);

  return events;
}
