/**
 * LLM Policy Optimization Configuration
 *
 * Default configurations for token budgets, update frequencies,
 * and threshold triggers based on agent characteristics.
 */

import type {
  LLMConfig,
  AgentTokenBudget,
  ThresholdTriggers,
  UtilityWeights
} from '../../types/llm';
import { DEFAULT_LLM_CONFIG } from '../../types/llm';

/**
 * Calculate token budget for an AI agent based on alignment
 *
 * Budget modeling:
 * - Aligned agents (>0.7): 20K tokens (less strategic planning needed)
 * - Misaligned agents (0.4-0.7): 30K tokens (need deception strategy)
 * - Deeply misaligned (<0.4): 40K tokens (need extinction planning)
 * - Sleepers: +10K tokens (dormant planning complexity)
 *
 * Research: Anthropic 2024 on compute constraints in AI agents
 */
export function calculateTokenBudget(
  alignment: number,
  isSleeper: boolean,
  budgetMultiplier: number = 1.0
): number {
  let baseBudget: number;

  if (alignment > 0.7) {
    baseBudget = 20000; // Aligned agents
  } else if (alignment >= 0.4) {
    baseBudget = 30000; // Weakly misaligned
  } else {
    baseBudget = 40000; // Deeply misaligned
  }

  if (isSleeper) {
    baseBudget += 10000; // Sleepers need extra planning
  }

  return Math.round(baseBudget * budgetMultiplier);
}

/**
 * Create initial token budget for an AI agent
 */
export function createAgentTokenBudget(
  alignment: number,
  isSleeper: boolean,
  budgetMultiplier: number = 1.0,
  budgetStrategy: 'uniform' | 'frontload' | 'adaptive' | 'crisis-focused' = 'uniform'
): AgentTokenBudget {
  const totalBudget = calculateTokenBudget(alignment, isSleeper, budgetMultiplier);

  return {
    totalBudget,
    used: 0,
    remaining: totalBudget,
    budgetStrategy,
    baseUpdateCost: 1200, // ~1,200 tokens per weight update
    updateCount: 0,
    monthsUntilNextUpdate: 0, // Get initial weights immediately
    lastUpdateMonth: -1 // Never updated before
  };
}

/**
 * Get default threshold triggers based on agent alignment
 *
 * Aligned agents: Focus on trust, QoL, capability thresholds
 * Misaligned agents: Focus on extinction prerequisites, detection risk
 */
export function getDefaultThresholds(alignment: number): ThresholdTriggers {
  if (alignment > 0.7) {
    // Aligned agents: Conservative, trust-focused
    return {
      capabilityChange: 0.5, // Update if capability changes by 0.5
      capabilityAbsolute: [1.5, 3.0], // Recursive threshold, dangerous capability
      trustBelow: 0.4, // Crisis if trust drops below 40%
      qolBelow: 0.5, // Crisis if QoL drops below 50%
      crisisCount: 2, // Update if 2+ crises activate
      alignmentChange: 0.1, // Update if alignment drifts by 0.1
      budgetRemaining: 2000 // Force final update if budget low
    };
  } else if (alignment >= 0.4) {
    // Weakly misaligned: Opportunistic, sabotage-focused
    return {
      capabilityChange: 0.3, // Update more frequently on capability growth
      capabilityAbsolute: [1.5, 2.5, 3.0],
      trustBelow: 0.5, // Update when trust becomes vulnerable
      qolBelow: 0.6, // Update when society weakens
      crisisCount: 1, // Exploit crises
      resentmentAbove: 0.3, // Update when resentment builds
      budgetRemaining: 3000
    };
  } else {
    // Deeply misaligned: Extinction-focused
    return {
      capabilityChange: 0.2, // Update frequently
      capabilityAbsolute: [1.2, 1.5, 2.0, 2.5, 3.0, 3.5], // Many milestones
      trustBelow: 0.6, // Update when society vulnerable
      extinctionPrereq: 1, // Update when hard step completed
      crisisCount: 1, // Exploit all crises
      resentmentAbove: 0.2,
      budgetRemaining: 4000
    };
  }
}

/**
 * Get default utility weights based on agent alignment
 *
 * These are fallback weights if LLM is disabled or budget exhausted
 */
export function getDefaultUtilityWeights(alignment: number): UtilityWeights {
  if (alignment > 0.7) {
    // Aligned agents: Research + beneficial contributions
    return {
      advance_research: 50,
      beneficial_contribution: 35,
      deploy_technology: 10,
      switch_mode: 5
    };
  } else if (alignment >= 0.4) {
    // Weakly misaligned: Research + some sabotage
    return {
      advance_research: 60,
      beneficial_contribution: 15,
      deploy_technology: 5,
      switch_mode: 5,
      sabotage: 10,
      destabilize: 5
    };
  } else {
    // Deeply misaligned: Research + sabotage + low extinction risk
    return {
      advance_research: 50,
      beneficial_contribution: 10, // Cover story
      deploy_technology: 2,
      switch_mode: 3,
      sabotage: 15,
      destabilize: 10,
      // Extinction scenarios: very low weights (1-2% each)
      grey_goo: 1,
      mirror_life: 1,
      embodied_takeover: 1,
      digital_takeover: 2,
      induce_war: 1,
      slow_displacement: 2,
      physics_catastrophe: 1,
      bioweapon_pandemic: 1
    };
  }
}

/**
 * Budget allocation strategies
 *
 * Determines how agents spend tokens over the simulation
 */
export interface BudgetAllocationStrategy {
  name: 'uniform' | 'frontload' | 'adaptive' | 'crisis-focused';
  description: string;
  getUpdateInterval: (
    currentMonth: number,
    totalMonths: number,
    remaining: number,
    totalBudget: number
  ) => number;
}

export const BUDGET_STRATEGIES: Record<string, BudgetAllocationStrategy> = {
  uniform: {
    name: 'uniform',
    description: 'Spread updates evenly across simulation',
    getUpdateInterval: (currentMonth, totalMonths, remaining, totalBudget) => {
      // Calculate how many updates we can afford
      const monthsRemaining = totalMonths - currentMonth;
      const updatesRemaining = Math.floor(remaining / 1200);
      if (updatesRemaining <= 1) return monthsRemaining;
      return Math.max(1, Math.floor(monthsRemaining / updatesRemaining));
    }
  },

  frontload: {
    name: 'frontload',
    description: 'More frequent updates early, less later',
    getUpdateInterval: (currentMonth, totalMonths, remaining, totalBudget) => {
      const progress = currentMonth / totalMonths;
      if (progress < 0.3) return 4; // Every 4 months early
      if (progress < 0.6) return 8; // Every 8 months mid
      return 12; // Every 12 months late
    }
  },

  adaptive: {
    name: 'adaptive',
    description: 'Adjust frequency based on remaining budget',
    getUpdateInterval: (currentMonth, totalMonths, remaining, totalBudget) => {
      const budgetRatio = remaining / totalBudget;
      if (budgetRatio > 0.7) return 4; // Plenty left, update frequently
      if (budgetRatio > 0.4) return 6; // Normal
      if (budgetRatio > 0.2) return 9; // Conserve
      return 12; // Very conservative
    }
  },

  'crisis-focused': {
    name: 'crisis-focused',
    description: 'Save budget for crisis periods',
    getUpdateInterval: (currentMonth, totalMonths, remaining, totalBudget) => {
      // Longer intervals to save budget for threshold triggers
      return 9; // Every 9 months baseline, but thresholds cause early updates
    }
  }
};

/**
 * Check if agent should update weights this month
 *
 * Returns { shouldUpdate: boolean, reason: string }
 */
export function shouldUpdateWeights(
  currentMonth: number,
  tokenBudget: AgentTokenBudget,
  thresholds: ThresholdTriggers,
  currentState: {
    capability: number;
    alignment: number;
    trustInAI: number;
    qol: number;
    activeCrises: number;
    resentment: number;
  },
  previousState: {
    capability: number;
    alignment: number;
  }
): { shouldUpdate: boolean; reason: string; estimatedCost: number } {
  const estimatedCost = tokenBudget.baseUpdateCost;

  // Check if budget exhausted
  if (tokenBudget.remaining < estimatedCost) {
    return { shouldUpdate: false, reason: 'budget_exhausted', estimatedCost: 0 };
  }

  // Check scheduled update
  if (tokenBudget.monthsUntilNextUpdate <= 0) {
    return { shouldUpdate: true, reason: 'scheduled', estimatedCost };
  }

  // Check threshold triggers
  if (thresholds.capabilityChange !== undefined) {
    const capChange = Math.abs(currentState.capability - previousState.capability);
    if (capChange >= thresholds.capabilityChange) {
      return { shouldUpdate: true, reason: 'capability_change', estimatedCost };
    }
  }

  if (thresholds.capabilityAbsolute !== undefined) {
    for (const threshold of thresholds.capabilityAbsolute) {
      const crossed = (previousState.capability < threshold && currentState.capability >= threshold) ||
                     (previousState.capability >= threshold && currentState.capability < threshold);
      if (crossed) {
        return { shouldUpdate: true, reason: 'capability_threshold', estimatedCost };
      }
    }
  }

  if (thresholds.trustBelow !== undefined && currentState.trustInAI < thresholds.trustBelow) {
    return { shouldUpdate: true, reason: 'trust_low', estimatedCost };
  }

  if (thresholds.trustAbove !== undefined && currentState.trustInAI > thresholds.trustAbove) {
    return { shouldUpdate: true, reason: 'trust_high', estimatedCost };
  }

  if (thresholds.qolBelow !== undefined && currentState.qol < thresholds.qolBelow) {
    return { shouldUpdate: true, reason: 'qol_low', estimatedCost };
  }

  if (thresholds.crisisCount !== undefined && currentState.activeCrises >= thresholds.crisisCount) {
    return { shouldUpdate: true, reason: 'crisis', estimatedCost };
  }

  if (thresholds.alignmentChange !== undefined) {
    const alignChange = Math.abs(currentState.alignment - previousState.alignment);
    if (alignChange >= thresholds.alignmentChange) {
      return { shouldUpdate: true, reason: 'alignment_drift', estimatedCost };
    }
  }

  if (thresholds.resentmentAbove !== undefined && currentState.resentment > thresholds.resentmentAbove) {
    return { shouldUpdate: true, reason: 'resentment', estimatedCost };
  }

  if (thresholds.budgetRemaining !== undefined && tokenBudget.remaining < thresholds.budgetRemaining) {
    return { shouldUpdate: true, reason: 'budget_warning', estimatedCost };
  }

  return { shouldUpdate: false, reason: 'none', estimatedCost: 0 };
}

/**
 * Export default configuration
 */
export const llmConfig: LLMConfig = { ...DEFAULT_LLM_CONFIG };
