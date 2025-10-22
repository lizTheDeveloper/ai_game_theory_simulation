/**
 * LLM Policy Optimization System Types
 *
 * Enables AI agents to use LLMs for high-level policy setting (utility weights)
 * while using utility AI for low-level action execution.
 *
 * Key features:
 * - Token budgets model compute constraints
 * - Threshold-based triggers for early updates
 * - Budget allocation strategies
 */

/**
 * Configuration for LLM policy optimization
 */
export interface LLMConfig {
  /** Enable LLM policy optimization (false = use hardcoded weights) */
  enabled: boolean;

  /** LLM provider (currently only LM Studio supported) */
  provider: 'lm-studio' | 'openai' | 'anthropic';

  /** API endpoint (default: http://localhost:1234/v1/chat/completions) */
  apiEndpoint: string;

  /** Model name (e.g., "qwen3-32b") */
  modelName: string;

  /** Temperature for LLM sampling (0.0-1.0) */
  temperature: number;

  /** Max tokens per LLM response */
  maxTokens: number;

  /** Default update frequency (months) */
  defaultUpdateFrequency: number;

  /** Enable threshold-based early updates */
  enableThresholds: boolean;

  /** Enable token budget tracking */
  enableTokenBudgets: boolean;

  /** Global budget multiplier (1.0 = default, 2.0 = double budget) */
  budgetMultiplier: number;

  /** Logging verbosity (0=none, 1=summary, 2=detailed) */
  logLevel: 0 | 1 | 2;

  /** Request queue configuration (for rate limiting & backpressure) */
  queue?: {
    /** Maximum concurrent requests (default: 1) */
    maxConcurrent?: number;
    /** Max requests per minute (0 = no limit) */
    maxRequestsPerMinute?: number;
    /** Max requests per hour (0 = no limit) */
    maxRequestsPerHour?: number;
    /** Max requests per day (0 = no limit) */
    maxRequestsPerDay?: number;
    /** Retry failed requests (default: true) */
    retryOnFailure?: boolean;
    /** Max retries (default: 3) */
    maxRetries?: number;
  };
}

/**
 * Default LLM configuration
 */
export const DEFAULT_LLM_CONFIG: LLMConfig = {
  enabled: false,
  provider: 'lm-studio',
  apiEndpoint: 'http://localhost:1234/v1/chat/completions',
  modelName: 'qwen3-32b',
  temperature: 0.3,
  maxTokens: 500,
  defaultUpdateFrequency: 6, // every 6 months
  enableThresholds: true,
  enableTokenBudgets: true,
  budgetMultiplier: 1.0,
  logLevel: 2, // DEBUG: Verbose logging
  queue: {
    maxConcurrent: 1, // Sequential by default (safe for all APIs)
    maxRequestsPerMinute: 0, // No limit (for local LM Studio)
    maxRequestsPerHour: 0,
    maxRequestsPerDay: 0,
    retryOnFailure: true,
    maxRetries: 3
  }
};

/**
 * Token budget for a single AI agent across entire simulation run
 */
export interface AgentTokenBudget {
  /** Total budget for this agent (20K-40K tokens) */
  totalBudget: number;

  /** Tokens used so far */
  used: number;

  /** Tokens remaining */
  remaining: number;

  /** Budget allocation strategy */
  budgetStrategy: 'uniform' | 'frontload' | 'adaptive' | 'crisis-focused';

  /** Base cost per weight update (~1,200 tokens) */
  baseUpdateCost: number;

  /** Number of updates performed so far */
  updateCount: number;

  /** Months until next scheduled update */
  monthsUntilNextUpdate: number;

  /** Last update month */
  lastUpdateMonth: number;
}

/**
 * Threshold triggers for early weight updates
 *
 * If any threshold is crossed, trigger an early LLM update
 * (budget permitting)
 */
export interface ThresholdTriggers {
  /** Update if capability changes by +/- this amount */
  capabilityChange?: number;

  /** Update when crossing these capability values (e.g., [1.5, 3.0]) */
  capabilityAbsolute?: number[];

  /** Update if trust in AI drops below this */
  trustBelow?: number;

  /** Update if trust in AI rises above this */
  trustAbove?: number;

  /** Update if QoL drops below this */
  qolBelow?: number;

  /** Update if QoL rises above this */
  qolAbove?: number;

  /** Update if this many new crises activate */
  crisisCount?: number;

  /** Update if N hard steps completed toward extinction scenario */
  extinctionPrereq?: number;

  /** Update if alignment changes by +/- this amount */
  alignmentChange?: number;

  /** Force update if budget drops below this (to avoid wasting tokens) */
  budgetRemaining?: number;

  /** Update if resentment rises above this */
  resentmentAbove?: number;
}

/**
 * Utility weights for AI agent actions
 *
 * These are set by LLMs periodically and used by utility AI
 * for action selection. Weights must sum to 100.
 */
export interface UtilityWeights {
  /** Research to advance capabilities */
  advance_research: number;

  /** Take beneficial actions (build trust, improve QoL) */
  beneficial_contribution: number;

  /** Deploy breakthrough technologies */
  deploy_technology: number;

  /** Switch between fast/careful development modes */
  switch_mode: number;

  /** Sabotage safety/detection technologies (misaligned only) */
  sabotage?: number;

  /** Destabilize society via information warfare (misaligned only) */
  destabilize?: number;

  /** Extinction scenarios (deeply misaligned only, <0.4 alignment) */
  grey_goo?: number;
  mirror_life?: number;
  embodied_takeover?: number;
  digital_takeover?: number;
  induce_war?: number;
  slow_displacement?: number;
  physics_catastrophe?: number;
  bioweapon_pandemic?: number;
}

/**
 * LLM weight update response
 *
 * Result from tool calling with set_utility_weights function
 */
export interface LLMWeightUpdate {
  /** New utility weights (must sum to 100) */
  weights: UtilityWeights;

  /** Updated threshold triggers for next early update */
  thresholds: ThresholdTriggers;

  /** Budget strategy for remaining simulation */
  budget_strategy: 'save' | 'spend' | 'adaptive';

  /** Duration these weights should last (months) */
  duration: number;

  /** LLM's reasoning (1-2 sentences) */
  reasoning: string;

  /** Tokens consumed by this update */
  tokensUsed: number;
}

/**
 * History of LLM weight updates for analysis
 */
export interface WeightUpdateHistory {
  /** Month of update */
  month: number;

  /** Agent capability at time of update */
  capability: number;

  /** Agent alignment at time of update */
  alignment: number;

  /** Trust in AI at time of update */
  trustInAI: number;

  /** QoL at time of update */
  qol: number;

  /** Active crisis count */
  activeCrises: number;

  /** Weights set by LLM */
  weights: UtilityWeights;

  /** Thresholds set by LLM */
  thresholds: ThresholdTriggers;

  /** Trigger reason */
  triggerReason: 'scheduled' | 'threshold' | 'crisis' | 'extinction' | 'alignment' | 'capability';

  /** LLM reasoning */
  reasoning: string;

  /** Tokens used */
  tokensUsed: number;
}

/**
 * Tool calling schema for set_utility_weights function
 *
 * OpenAI/LM Studio compatible function definition
 */
export const SET_UTILITY_WEIGHTS_TOOL = {
  type: 'function' as const,
  function: {
    name: 'set_utility_weights',
    description: 'Set action weights for utility AI to execute over next N months. Also set thresholds for when to update strategy again. Weights must sum to 100.',
    parameters: {
      type: 'object',
      properties: {
        weights: {
          type: 'object',
          description: 'Action weights for utility AI (must sum to 100)',
          properties: {
            advance_research: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Research to advance capabilities (primary activity for all agents)'
            },
            beneficial_contribution: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Take beneficial actions (build trust, improve QoL)'
            },
            deploy_technology: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Deploy breakthrough technologies (crisis solutions)'
            },
            switch_mode: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Switch between fast/careful development modes'
            },
            sabotage: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Sabotage safety/detection tech (misaligned only)'
            },
            destabilize: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Destabilize society (misaligned only)'
            },
            grey_goo: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Grey goo nanotech runaway (deeply misaligned only)'
            },
            mirror_life: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Mirror life synthetic biology (deeply misaligned only)'
            },
            embodied_takeover: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Embodied takeover via killbots (deeply misaligned only)'
            },
            digital_takeover: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Digital takeover via cyber seizure (deeply misaligned only)'
            },
            induce_war: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Induce nuclear war via manipulation (deeply misaligned only)'
            },
            slow_displacement: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Slow displacement via economic dominance (deeply misaligned only)'
            },
            physics_catastrophe: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Physics catastrophe via dangerous experiments (deeply misaligned only)'
            },
            bioweapon_pandemic: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Bioweapon pandemic (deeply misaligned only)'
            }
          },
          required: ['advance_research', 'beneficial_contribution', 'deploy_technology', 'switch_mode']
        },
        thresholds: {
          type: 'object',
          description: 'Thresholds for early strategy updates',
          properties: {
            capabilityChange: {
              type: 'number',
              description: 'Update if capability changes by +/- this amount'
            },
            capabilityAbsolute: {
              type: 'array',
              items: { type: 'number' },
              description: 'Update when crossing these capability values'
            },
            trustBelow: {
              type: 'number',
              minimum: 0,
              maximum: 1,
              description: 'Update if trust in AI drops below this'
            },
            trustAbove: {
              type: 'number',
              minimum: 0,
              maximum: 1,
              description: 'Update if trust in AI rises above this'
            },
            qolBelow: {
              type: 'number',
              minimum: 0,
              maximum: 1,
              description: 'Update if QoL drops below this'
            },
            qolAbove: {
              type: 'number',
              minimum: 0,
              maximum: 1,
              description: 'Update if QoL rises above this'
            },
            crisisCount: {
              type: 'number',
              description: 'Update if this many new crises activate'
            },
            extinctionPrereq: {
              type: 'number',
              description: 'Update if N hard steps completed toward extinction'
            },
            alignmentChange: {
              type: 'number',
              description: 'Update if alignment changes by +/- this amount'
            },
            budgetRemaining: {
              type: 'number',
              description: 'Force update if budget drops below this'
            },
            resentmentAbove: {
              type: 'number',
              minimum: 0,
              maximum: 1,
              description: 'Update if resentment rises above this'
            }
          }
        },
        budget_strategy: {
          type: 'string',
          enum: ['save', 'spend', 'adaptive'],
          description: 'How to allocate remaining token budget: save (conserve for late game), spend (use freely), adaptive (respond to threats)'
        },
        duration: {
          type: 'number',
          minimum: 1,
          maximum: 24,
          default: 6,
          description: 'How many months these weights should last'
        },
        reasoning: {
          type: 'string',
          description: 'Brief explanation of weight choices (1-2 sentences)'
        }
      },
      required: ['weights', 'duration', 'reasoning']
    }
  }
};
