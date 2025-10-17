/**
 * Government Core Orchestrator
 *
 * Main decision-making and action execution logic for the government agent.
 * This module coordinates action selection and execution while delegating
 * to specialized action modules.
 *
 * MIGRATION STRATEGY:
 * During refactoring, this file imports from BOTH the new modular structure
 * AND the old monolithic governmentAgent.ts file. Once all actions are migrated,
 * the import from governmentAgent.ts will be removed.
 */

import { GameState, GameEvent } from '@/types/game';
import { ActionResult, GameAction } from '@/simulation/agents/types';
import { getTrustInAIForPolicy, getTrustInAI } from '@/simulation/socialCohesion';
import {
  calculateObservableAICapability,
  calculateTotalCapabilityFromProfile
} from '@/simulation/calculations';

// Import from new modular structure
import { migratedActions } from '../actions';

// Import from old monolithic file (TEMPORARY during migration)
import {
  GOVERNMENT_ACTIONS as LEGACY_ACTIONS,
  selectGovernmentAction as legacySelectGovernmentAction
} from '@/simulation/agents/governmentAgent';

/**
 * Get all available government actions
 * (combines migrated and legacy actions)
 */
export function getAllGovernmentActions(): GameAction[] {
  // Get migrated action IDs
  const migratedIds = new Set(migratedActions.map(a => a.id));

  // Get legacy actions that haven't been migrated yet
  const remainingLegacyActions = LEGACY_ACTIONS.filter(
    a => !migratedIds.has(a.id)
  );

  // Combine all actions
  return [...migratedActions, ...remainingLegacyActions];
}

/**
 * Select which action the government should take
 * Uses priority-based selection weighted by unemployment and economic stage
 *
 * REFACTORING NOTE: This currently delegates to the legacy function.
 * Once all actions are migrated, we'll implement a new selection algorithm here.
 */
export function selectGovernmentAction(
  state: GameState,
  random: () => number = Math.random
): GameAction | null {
  // Temporarily delegate to legacy implementation
  // TODO: Implement new priority-based selection here
  return legacySelectGovernmentAction(state, random);
}

/**
 * Automatic government investment in evaluation
 * Based on elite trust levels (P2.3: Elites control policy)
 */
function autoInvestInEvaluation(state: GameState): void {
  // P2.3: Government funding decisions reflect elite preferences
  const policyTrust = getTrustInAIForPolicy(state.society);

  // Investment rate scales with elite trust
  // High trust (0.7+): 0.2 points/month across all categories
  // Medium trust (0.4-0.7): 0.1 points/month
  // Low trust (<0.4): 0.05 points/month (minimal investment)
  const investmentRate = policyTrust > 0.7 ? 0.2 :
                        policyTrust > 0.4 ? 0.1 :
                        0.05;

  // Spread investment across all 4 categories
  const perCategory = investmentRate / 4;

  state.government.evaluationInvestment.benchmarkSuite = Math.min(
    10,
    state.government.evaluationInvestment.benchmarkSuite + perCategory
  );
  state.government.evaluationInvestment.alignmentTests = Math.min(
    10,
    state.government.evaluationInvestment.alignmentTests + perCategory
  );
  state.government.evaluationInvestment.redTeaming = Math.min(
    10,
    state.government.evaluationInvestment.redTeaming + perCategory
  );
  state.government.evaluationInvestment.interpretability = Math.min(
    10,
    state.government.evaluationInvestment.interpretability + perCategory
  );
}

/**
 * Execute government actions for the current month
 *
 * This is the main entry point called by the GovernmentActionsPhase.
 * It handles automatic investments, crisis response, and action execution.
 */
export function executeGovernmentActions(
  state: GameState,
  random: () => number = Math.random
): ActionResult {
  const allEvents: GameEvent[] = [];
  const allEffects: Record<string, number> = {};
  const messages: string[] = [];

  // AUTOMATIC: Invest in evaluation based on public trust
  autoInvestInEvaluation(state);

  // Government: Configurable frequency + CRISIS BOOST
  // Rationale: Governments act more frequently during crises (emergency sessions, special legislation)
  // Real-world precedent: COVID-19, 2008 financial crisis, etc.
  let baseFrequency = state.config.governmentActionFrequency;

  // CRISIS MULTIPLIERS
  const unemploymentCrisis = state.society.unemploymentLevel > 0.25 ?
    Math.min(3.0, 1.0 + state.society.unemploymentLevel * 2.0) : 1.0; // Up to 3x at 100% unemployment

  const institutionalCrisis = state.socialAccumulation.institutionalCrisis > 0.5 ?
    Math.min(2.0, 1.0 + state.socialAccumulation.institutionalCrisis) : 1.0; // Up to 2x

  const controlLossCrisis = state.socialAccumulation.controlLossCrisis > 0.5 ?
    Math.min(2.0, 1.0 + state.socialAccumulation.controlLossCrisis) : 1.0; // Up to 2x

  // TIER 2.9: Environmental crisis multiplier
  // Ecosystem collapse, tipping points → emergency government sessions
  const environmentalCrisis = (() => {
    let multiplier = 1.0;

    // Ecosystem crisis active
    if (state.environmentalAccumulation?.ecosystemCrisisActive) {
      multiplier *= 2.0; // Double frequency during ecosystem collapse
    }

    // Specific tipping points triggered
    if (state.specificTippingPoints?.amazon?.triggered) {
      multiplier *= 1.5; // Amazon collapse is major crisis
    }
    if (state.specificTippingPoints?.coral?.triggered) {
      multiplier *= 1.3; // Coral collapse affects 3B people
    }
    if (state.specificTippingPoints?.pollinators?.triggered) {
      multiplier *= 1.4; // Pollinator collapse threatens food
    }

    // Cap at 3x
    return Math.min(3.0, multiplier);
  })();

  const maxMultiplier = Math.max(unemploymentCrisis, institutionalCrisis, controlLossCrisis, environmentalCrisis);
  const adjustedFrequency = baseFrequency * maxMultiplier;

  const actionsThisMonth = Math.floor(adjustedFrequency);
  const extraActionChance = adjustedFrequency - actionsThisMonth;
  const totalActions = actionsThisMonth + (random() < extraActionChance ? 1 : 0);

  if (maxMultiplier > 1.5) {
    console.log(`🏛️ CRISIS RESPONSE: Government frequency ${baseFrequency.toFixed(2)} → ${adjustedFrequency.toFixed(2)} (${totalActions} actions this month)`);
  }

  for (let i = 0; i < totalActions; i++) {
    const selectedAction = selectGovernmentAction(state, random);
    if (selectedAction) {
      const result = selectedAction.execute(state, undefined, random);
      if (result.success) {
        // State is now mutated directly by the action
        allEvents.push(...result.events);
        Object.assign(allEffects, result.effects);
        messages.push(result.message);
      }
    }
  }

  return {
    success: true,
    effects: allEffects,
    events: allEvents,
    message: `Government executed ${messages.length} actions`
  };
}
