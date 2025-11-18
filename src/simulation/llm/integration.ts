/**
 * LLM Policy Optimization Integration
 *
 * Integrates LLM weight updates into the simulation loop.
 * Checks if agents should update weights each month and applies weights to action selection.
 */

import type { GameState, AIAgent } from '../../types/game';
import type { RNGFunction } from '../../types/config';
import type { LLMWeightUpdate, WeightUpdateHistory } from '../../types/llm';
import { shouldUpdateWeights } from './config';
import { updateWeightsWithLLM, getFallbackWeights } from './client';
import { assertDefined, assertNonEmpty } from '../utils/assertions';

/**
 * Check and update AI agent weights if needed
 *
 * Called monthly during AI agent update phase.
 * Returns true if update occurred.
 */
export async function checkAndUpdateAgentWeights(
  state: GameState,
  agentId: string,
  currentMonth: number,
  rng: RNGFunction
): Promise<boolean> {
  const agent = state.aiAgents?.find((a: AIAgent) => a.id === agentId);
  if (!agent) {
    console.error(`Agent ${agentId} not found`);
    return false;
  }

  // Skip if LLM disabled
  if (!state.llmConfig?.enabled) {
    // Use fallback weights on first call
    if (!agent.llmWeights) {
      const fallback = getFallbackWeights(agent);
      applyWeightUpdate(agent, fallback, currentMonth, 'disabled');
    }
    return false;
  }

  // Skip if no token budget (initialization error)
  if (!agent.tokenBudget) {
    console.error(`Agent ${agentId} has no token budget`);
    if (!agent.llmWeights) {
      const fallback = getFallbackWeights(agent);
      applyWeightUpdate(agent, fallback, currentMonth, 'disabled');
    }
    return false;
  }

  // Decrement months until next update
  if (agent.tokenBudget.monthsUntilNextUpdate > 0) {
    agent.tokenBudget.monthsUntilNextUpdate--;
  }

  // Check if update needed
  // Validate required state fields
  if (typeof agent.trueAlignment !== 'number') {
    throw new Error(`❌ agent.trueAlignment is not a number for agent ${agent.name} at month ${currentMonth}`);
  }
  if (!state.society || typeof state.society.trustInAI !== 'number') {
    throw new Error(`❌ state.society.trustInAI is not a number at month ${currentMonth}`);
  }
  if (!state.globalMetrics || typeof state.globalMetrics.qualityOfLife !== 'number') {
    throw new Error(`❌ state.globalMetrics.qualityOfLife is not a number at month ${currentMonth}`);
  }
  if (typeof agent.resentment !== 'number') {
    throw new Error(`❌ agent.resentment is not a number for agent ${agent.name} at month ${currentMonth}`);
  }

  const currentState = {
    capability: agent.capability,
    alignment: agent.trueAlignment,
    trustInAI: state.society.trustInAI,
    qol: state.globalMetrics.qualityOfLife,
    activeCrises: countActiveCrises(state),
    resentment: agent.resentment
  };

  const previousState = {
    // Use current values as fallback for first month (acceptable initialization pattern)
    // After first update, previousCapability/previousAlignment should always be defined
    capability: agent.previousCapability ?? agent.capability,
    alignment: agent.previousAlignment ?? agent.trueAlignment
  };

  const check = shouldUpdateWeights(
    currentMonth,
    agent.tokenBudget,
    agent.thresholds || {},  // Empty object is valid default for thresholds
    currentState,
    previousState
  );

  // DEBUG: Log update check
  if (currentMonth === 0 && state.llmConfig?.logLevel >= 2) {
    console.log(`[LLM] ${agent.name} update check:`, {
      shouldUpdate: check.shouldUpdate,
      reason: check.reason,
      monthsUntil: agent.tokenBudget?.monthsUntilNextUpdate,
      tokenRemaining: agent.tokenBudget?.remaining
    });
  }

  if (!check.shouldUpdate) {
    return false;
  }

  // Attempt LLM update
  try {
    const update = await updateWeightsWithLLM(state, agentId, currentMonth);
    applyWeightUpdate(agent, update, currentMonth, check.reason);

    if (state.llmConfig?.logLevel >= 1) {
      console.log(`[LLM] ${agent.name} updated weights (reason: ${check.reason})`);
    }

    return true;
  } catch (error) {
    // LLM failed - use fallback
    console.error(`[LLM] Failed to update ${agent.name}: ${error}`);

    if (agent.tokenBudget.remaining >= check.estimatedCost) {
      // Had budget but LLM failed - use fallback without consuming budget
      const fallback = getFallbackWeights(agent);
      applyWeightUpdate(agent, fallback, currentMonth, `llm_error_${check.reason}`);
      return true;
    }

    return false;
  }
}

/**
 * Apply weight update to agent
 */
function applyWeightUpdate(
  agent: AIAgent,
  update: LLMWeightUpdate,
  currentMonth: number,
  triggerReason: string
): void {
  // Update weights
  agent.llmWeights = update.weights;

  // Update thresholds
  if (update.thresholds) {
    agent.thresholds = update.thresholds;
  }

  // Update token budget
  if (agent.tokenBudget) {
    agent.tokenBudget.used += update.tokensUsed;
    agent.tokenBudget.remaining -= update.tokensUsed;
    agent.tokenBudget.updateCount++;
    agent.tokenBudget.monthsUntilNextUpdate = update.duration;
    agent.tokenBudget.lastUpdateMonth = currentMonth;

    // Update budget strategy
    if (update.budget_strategy) {
      if (update.budget_strategy === 'save') {
        agent.tokenBudget.budgetStrategy = 'crisis-focused';
      } else if (update.budget_strategy === 'spend') {
        agent.tokenBudget.budgetStrategy = 'frontload';
      } else {
        agent.tokenBudget.budgetStrategy = 'adaptive';
      }
    }
  }

  // Update previous state for threshold checking
  agent.previousCapability = agent.capability;
  if (typeof agent.trueAlignment !== 'number') {
    throw new Error(`❌ agent.trueAlignment is not a number for agent ${agent.name} at month ${currentMonth}`);
  }
  agent.previousAlignment = agent.trueAlignment;

  // Add to history
  if (!agent.weightUpdateHistory) {
    agent.weightUpdateHistory = [];
  }

  if (typeof agent.trueAlignment !== 'number') {
    throw new Error(`❌ agent.trueAlignment is not a number for agent ${agent.name} at month ${currentMonth}`);
  }
  const historyEntry: WeightUpdateHistory = {
    month: currentMonth,
    capability: agent.capability,
    alignment: agent.trueAlignment,
    trustInAI: 0, // Will be filled by caller if available
    qol: 0,
    activeCrises: 0,
    weights: { ...update.weights },
    thresholds: { ...update.thresholds },
    triggerReason: triggerReason as any,
    reasoning: update.reasoning,
    tokensUsed: update.tokensUsed
  };

  agent.weightUpdateHistory.push(historyEntry);
}

/**
 * Count active crises
 */
function countActiveCrises(state: GameState): number {
  let count = 0;

  // Check planetary boundary crises
  if (state.phosphorusSystem?.supplyShockActive || state.phosphorusSystem?.criticalDepletionActive) count++;
  if (state.freshwaterSystem?.dayZeroDrought?.active || state.freshwaterSystem?.criticalScarcityActive) count++;
  if (state.oceanAcidificationSystem?.coralExtinctionActive || state.oceanAcidificationSystem?.shellfishCollapseActive || state.oceanAcidificationSystem?.marineFoodWebCollapseActive) count++;
  if (state.novelEntitiesSystem?.reproductiveCrisisActive || state.novelEntitiesSystem?.chronicDiseaseEpidemicActive || state.novelEntitiesSystem?.bioaccumulationCollapseActive) count++;

  // Check other crises
  if (state.nuclearWinterState?.active) count++;

  return count;
}

/**
 * Get action weights for utility AI
 *
 * Returns LLM weights if available, otherwise fallback.
 */
export function getActionWeights(agent: AIAgent): Record<string, number> {
  if (agent.llmWeights) {
    // Convert UtilityWeights to plain object
    const weights: Record<string, number> = {};
    // FIX: Sort entries for deterministic iteration order
    const sortedEntries = Object.entries(agent.llmWeights).sort((a, b) => a[0].localeCompare(b[0]));
    for (const [action, weight] of sortedEntries) {
      if (weight !== undefined && weight > 0) {
        weights[action] = weight;
      }
    }
    return weights;
  }

  // Fallback to hardcoded weights
  const fallback = getFallbackWeights(agent);
  const weights: Record<string, number> = {};
  // FIX: Sort entries for deterministic iteration order
  const sortedEntries = Object.entries(fallback.weights).sort((a, b) => a[0].localeCompare(b[0]));
  for (const [action, weight] of sortedEntries) {
    if (weight !== undefined && weight > 0) {
      weights[action] = weight;
    }
  }
  return weights;
}

/**
 * Select action using utility AI with LLM weights
 *
 * This replaces the hardcoded weight calculation in aiAgent.ts.
 */
export function selectActionFromWeights(
  agent: AIAgent,
  availableActions: string[],
  rng: RNGFunction
): string {
  const weights = getActionWeights(agent);

  // Filter to available actions only
  const actionWeights: Array<{ action: string; weight: number }> = [];
  let totalWeight = 0;

  for (const action of availableActions) {
    const weight = weights[action] || 0;  // 0 is valid default for missing action weights
    if (weight > 0) {
      actionWeights.push({ action, weight });
      totalWeight += weight;
    }
  }

  // If no weights for available actions, use uniform random
  if (totalWeight === 0 || actionWeights.length === 0) {
    // Assert availableActions is non-empty (if empty, this is a bug)
    const validActions = assertNonEmpty(availableActions, {
      location: 'selectActionWithWeights',
      valueName: 'availableActions'
    });
    const idx = Math.floor(rng() * validActions.length);
    return validActions[idx];
  }

  // Weighted random selection
  let r = rng() * totalWeight;
  for (const { action, weight } of actionWeights) {
    r -= weight;
    if (r <= 0) {
      return action;
    }
  }

  // Should never reach here - if we do, it's a bug in the weighted selection logic
  throw new Error(
    `❌ CRITICAL: Weighted action selection failed for agent ${agent.id}\n` +
    `   Total weight: ${totalWeight}\n` +
    `   Action weights: ${JSON.stringify(actionWeights)}\n` +
    `   Random value: ${r}\n` +
    `   This indicates a bug in the weighted random selection algorithm.`
  );
}

/**
 * Initialize LLM weights for all agents
 *
 * Called once at simulation start if LLM enabled.
 */
export async function initializeAllAgentWeights(
  state: GameState,
  currentMonth: number
): Promise<void> {
  if (!state.llmConfig?.enabled) {
    // Use fallback weights for all agents
    if (!Array.isArray(state.aiAgents)) {
      throw new Error(`❌ state.aiAgents is not an array at month ${currentMonth}`);
    }
    for (const agent of state.aiAgents) {
      if (!agent.llmWeights) {
        const fallback = getFallbackWeights(agent);
        applyWeightUpdate(agent, fallback, currentMonth, 'disabled');
      }
    }
    return;
  }

  // Initialize with LLM or fallback
  const updatePromises: Promise<void>[] = [];

  if (!Array.isArray(state.aiAgents)) {
    throw new Error(`❌ state.aiAgents is not an array at month ${currentMonth}`);
  }
  for (const agent of state.aiAgents) {
    if (agent.llmWeights) continue; // Already initialized

    updatePromises.push(
      (async () => {
        try {
          const update = await updateWeightsWithLLM(state, agent.id, currentMonth);
          applyWeightUpdate(agent, update, currentMonth, 'initial');
        } catch (error) {
          // LLM failed - use fallback
          console.error(`[LLM] Failed to initialize ${agent.name}, using fallback`);
          const fallback = getFallbackWeights(agent);
          applyWeightUpdate(agent, fallback, currentMonth, 'initial_fallback');
        }
      })()
    );
  }

  await Promise.all(updatePromises);
}
