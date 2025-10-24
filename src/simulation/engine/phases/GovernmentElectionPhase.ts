/**
 * Government Election Phase
 *
 * Handle election cycles, coalition formation, and public opinion dynamics.
 * Models democratic accountability and government stability.
 *
 * Research Foundation:
 * - V-Dem v14 (2024): Democratic accountability mechanisms
 * - Manifesto Project: Party policy positions and coalition formation
 * - Election cycle data: Average 48 months for parliamentary systems
 *
 * Phase order: 8.5 (after government actions, before society actions)
 *
 * @module simulation/engine/phases/GovernmentElectionPhase
 */

import { SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '../PhaseOrchestrator';
import type { GameState } from '../../../types/game';

export class GovernmentElectionPhase implements SimulationPhase {
  readonly id = 'government-elections';
  readonly name = 'Government Elections & Opinion';
  readonly order = 8.5;

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    return executeGovernmentElectionPhase(state, rng, context || { timestamp: state.currentMonth, data: new Map() });
  }
}

/**
 * Execute Government Election Phase
 *
 * Manages:
 * - Election scheduling and execution
 * - Public opinion updates
 * - Coalition stability checks
 * - Government turnover effects
 */
function executeGovernmentElectionPhase(
  state: GameState,
  rng: RNGFunction,
  context: PhaseContext
): PhaseResult {
  if (!state.governmentSystem) {
    return { events: [], warnings: [] };
  }

  const events: string[] = [];

  // 1. Check for scheduled elections
  let electionsHeld = 0;
  for (const [countryCode, electionMonth] of state.governmentSystem.nextElections) {
    if (state.currentMonth >= electionMonth) {
      const gov = state.governmentSystem.governments.get(countryCode);
      if (!gov) continue;

      // Hold election
      const result = simulateElection(state, countryCode, rng);
      if (result.changed) {
        events.push(`${(gov as any).countryName}: ${result.message}`);
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

  return { events, warnings: [] };
}

/**
 * Simulate election
 *
 * Simplified election model based on public opinion
 * Real implementation would use coalition formation algorithms
 */
function simulateElection(
  state: GameState,
  countryCode: string,
  rng: RNGFunction
): { changed: boolean; message: string } {
  const opinion = state.governmentSystem!.publicOpinion.get(countryCode) || 0.5;

  // High opinion = government likely to be reelected
  // Low opinion = government likely to change
  const reelectionProbability = opinion * 0.8 + 0.1;

  if (rng() < reelectionProbability) {
    return {
      changed: false,
      message: 'Government reelected',
    };
  } else {
    // Government changes - reset opinion to moderate
    state.governmentSystem!.publicOpinion.set(countryCode, 0.5 + (rng() - 0.5) * 0.2);

    return {
      changed: true,
      message: 'New government elected',
    };
  }
}

/**
 * Update public opinion based on economic and social conditions
 */
function updatePublicOpinion(state: GameState, rng: RNGFunction): void {
  for (const [countryCode, gov] of state.governmentSystem!.governments) {
    let opinion = state.governmentSystem!.publicOpinion.get(countryCode) || 0.5;

    // 1. Economic performance affects opinion
    const economicOutput = state.globalMetrics.economicOutput || 100;
    if (economicOutput > 110) {
      opinion += 0.02; // Strong economy boosts opinion
    } else if (economicOutput < 90) {
      opinion -= 0.03; // Weak economy hurts opinion
    }

    // 2. Quality of life affects opinion
    const qol = state.globalMetrics.qualityOfLife;
    if (qol > 0.75) {
      opinion += 0.015;
    } else if (qol < 0.5) {
      opinion -= 0.025;
    }

    // 3. Crisis penalty - count active crises from accumulation systems
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
      tech.corporateDystopiaActive,
    ].filter(Boolean).length;

    if (crisisCount > 2) {
      opinion -= 0.04 * crisisCount;
    }

    // 4. AI trust affects opinion
    const aiTrust = state.society?.trustInAI || 0.6;
    if (aiTrust < 0.3) {
      opinion -= 0.02; // Low AI trust hurts government
    }

    // 5. Random drift (events, scandals, etc.)
    opinion += (rng() - 0.5) * 0.02;

    // 6. Clamp to [0.1, 0.9] range
    opinion = Math.max(0.1, Math.min(0.9, opinion));

    state.governmentSystem!.publicOpinion.set(countryCode, opinion);
  }
}

/**
 * Check coalition stability
 *
 * Coalitions can collapse if opinion drops too low
 */
function checkCoalitionStability(
  state: GameState,
  rng: RNGFunction,
  events: string[]
): void {
  for (const [countryCode, coalition] of state.governmentSystem!.coalitions) {
    const opinion = state.governmentSystem!.publicOpinion.get(countryCode) || 0.5;

    // Coalition stability decreases with low opinion
    coalition.stability = coalition.stability * 0.95 + opinion * 0.05;

    // Coalition collapses if stability drops below threshold
    if (coalition.stability < 0.3 && rng() > 0.7) {
      const gov = state.governmentSystem!.governments.get(countryCode);
      events.push(`${(gov as any)?.countryName || countryCode}: Coalition collapsed - snap election called`);

      // Schedule snap election
      state.governmentSystem!.nextElections.set(countryCode, state.currentMonth + 2);

      // Remove coalition
      state.governmentSystem!.coalitions.delete(countryCode);
    }
  }
}
