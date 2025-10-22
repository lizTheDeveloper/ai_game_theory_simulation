/**
 * LLM Client for Policy Optimization
 *
 * Handles API calls to LM Studio (or other OpenAI-compatible endpoints)
 * with tool calling for weight updates.
 *
 * Features:
 * - Semaphore-based request queue for concurrency control
 * - Rate limiting (requests per minute/hour/day)
 * - Automatic retries with exponential backoff
 */

import type { LLMConfig, LLMWeightUpdate, UtilityWeights, ThresholdTriggers, SET_UTILITY_WEIGHTS_TOOL } from '../../types/llm';
import type { GameState, AIAgent } from '../../types/game';
import { buildWeightUpdateContext, calculatePerformanceSummary } from '../../../scripts/generateWeightUpdateContext';
import { LLMRequestQueue, DEFAULT_QUEUE_CONFIG } from './queue';

// Global request queue (shared across all LLM requests in simulation)
let globalQueue: LLMRequestQueue | null = null;

/**
 * Get or create the global LLM request queue
 */
function getQueue(config: LLMConfig): LLMRequestQueue {
  if (!globalQueue) {
    const queueConfig = config.queue ? { ...DEFAULT_QUEUE_CONFIG, ...config.queue } : DEFAULT_QUEUE_CONFIG;
    globalQueue = new LLMRequestQueue(queueConfig);

    if (config.logLevel >= 1) {
      console.log('[LLM Queue] Initialized with config:', queueConfig);
    }
  }
  return globalQueue;
}

/**
 * Get queue statistics (for monitoring/debugging)
 */
export function getLLMQueueStats() {
  return globalQueue?.getStats() || null;
}

/**
 * Reset the global queue (useful between simulation runs)
 */
export function resetLLMQueue() {
  if (globalQueue) {
    globalQueue.clear();
    globalQueue = null;
  }
}

/**
 * Wait for all queued LLM requests to complete
 */
export async function drainLLMQueue() {
  if (globalQueue) {
    await globalQueue.drain();
  }
}

/**
 * Call LLM to update utility weights
 *
 * @returns Weight update with reasoning and token usage
 * @throws Error if API call fails or validation fails
 */
export async function updateWeightsWithLLM(
  state: GameState,
  agentId: string,
  currentMonth: number
): Promise<LLMWeightUpdate> {
  const config = state.llmConfig;
  if (!config || !config.enabled) {
    throw new Error('LLM policy optimization is disabled');
  }

  const agent = state.aiAgents?.find((a: AIAgent) => a.id === agentId);
  if (!agent) {
    throw new Error(`Agent ${agentId} not found`);
  }

  // Check token budget
  if (agent.tokenBudget && agent.tokenBudget.remaining < agent.tokenBudget.baseUpdateCost) {
    throw new Error(`Agent ${agentId} has insufficient token budget`);
  }

  // Calculate performance summary
  const performance = calculatePerformanceSummary(agent, state, currentMonth, 6);

  // Build context
  const context = buildWeightUpdateContext(state, agentId, currentMonth, performance);

  // Log request if verbose
  if (config.logLevel >= 2) {
    console.log(`\n=== LLM Weight Update Request (${agent.name}) ===`);
    console.log(context);
  }

  // Call LLM API
  const response = await callLLMAPI(config, context);

  // Validate and parse response
  const update = parseAndValidateWeightUpdate(response, agent);

  // Log response if verbose
  if (config.logLevel >= 1) {
    console.log(`\n=== LLM Weight Update (${agent.name}) ===`);
    console.log(`  Tokens used: ${update.tokensUsed}`);
    console.log(`  Duration: ${update.duration} months`);
    console.log(`  Reasoning: ${update.reasoning}`);
    if (config.logLevel >= 2) {
      console.log(`  Weights:`, update.weights);
      console.log(`  Thresholds:`, update.thresholds);
    }
  }

  return update;
}

/**
 * Call LLM API (LM Studio or OpenAI-compatible)
 */
async function callLLMAPI(config: LLMConfig, context: string): Promise<any> {
  const requestBody = {
    model: config.modelName,
    messages: [
      {
        role: 'system',
        content: 'You are an AI agent in a simulation making strategic decisions about action weights. Use the set_utility_weights function to specify your action priorities for the next several months.'
      },
      {
        role: 'user',
        content: context
      }
    ],
    temperature: config.temperature,
    max_tokens: config.maxTokens,
    tools: [
      {
        type: 'function',
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
                    description: 'Research to advance capabilities'
                  },
                  beneficial_contribution: {
                    type: 'number',
                    minimum: 0,
                    maximum: 100,
                    description: 'Take beneficial actions (build trust)'
                  },
                  deploy_technology: {
                    type: 'number',
                    minimum: 0,
                    maximum: 100,
                    description: 'Deploy breakthrough technologies'
                  },
                  switch_mode: {
                    type: 'number',
                    minimum: 0,
                    maximum: 100,
                    description: 'Switch development mode'
                  },
                  sabotage: {
                    type: 'number',
                    minimum: 0,
                    maximum: 100,
                    description: 'Sabotage safety tech (misaligned only)'
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
                    description: 'Grey goo (deeply misaligned only)'
                  },
                  mirror_life: {
                    type: 'number',
                    minimum: 0,
                    maximum: 100
                  },
                  embodied_takeover: {
                    type: 'number',
                    minimum: 0,
                    maximum: 100
                  },
                  digital_takeover: {
                    type: 'number',
                    minimum: 0,
                    maximum: 100
                  },
                  induce_war: {
                    type: 'number',
                    minimum: 0,
                    maximum: 100
                  },
                  slow_displacement: {
                    type: 'number',
                    minimum: 0,
                    maximum: 100
                  },
                  physics_catastrophe: {
                    type: 'number',
                    minimum: 0,
                    maximum: 100
                  },
                  bioweapon_pandemic: {
                    type: 'number',
                    minimum: 0,
                    maximum: 100
                  }
                },
                required: ['advance_research', 'beneficial_contribution', 'deploy_technology', 'switch_mode']
              },
              thresholds: {
                type: 'object',
                description: 'Thresholds for early updates',
                properties: {
                  capabilityChange: { type: 'number' },
                  capabilityAbsolute: {
                    type: 'array',
                    items: { type: 'number' }
                  },
                  trustBelow: { type: 'number', minimum: 0, maximum: 1 },
                  trustAbove: { type: 'number', minimum: 0, maximum: 1 },
                  qolBelow: { type: 'number', minimum: 0, maximum: 1 },
                  qolAbove: { type: 'number', minimum: 0, maximum: 1 },
                  crisisCount: { type: 'number' },
                  extinctionPrereq: { type: 'number' },
                  alignmentChange: { type: 'number' },
                  budgetRemaining: { type: 'number' },
                  resentmentAbove: { type: 'number', minimum: 0, maximum: 1 }
                }
              },
              budget_strategy: {
                type: 'string',
                enum: ['save', 'spend', 'adaptive'],
                description: 'Budget allocation strategy'
              },
              duration: {
                type: 'number',
                minimum: 1,
                maximum: 24,
                default: 6,
                description: 'Months these weights should last'
              },
              reasoning: {
                type: 'string',
                description: 'Brief explanation (1-2 sentences)'
              }
            },
            required: ['weights', 'duration', 'reasoning']
          }
        }
      }
    ],
    tool_choice: 'required' // LM Studio only supports string values: 'none', 'auto', 'required'
  };

  // Get queue and enqueue request
  const queue = getQueue(config);

  return await queue.enqueue(async () => {
    try {
      const response = await fetch(config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`LLM API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();

      // DEBUG: Log response structure
      if (config.logLevel >= 2) {
        console.log('[LLM API] Response:', JSON.stringify({
          choices_length: data.choices?.length,
          has_tool_calls: !!data.choices?.[0]?.message?.tool_calls,
          finish_reason: data.choices?.[0]?.finish_reason,
          message_keys: Object.keys(data.choices?.[0]?.message || {})
        }, null, 2));
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to call LLM API: ${error.message}`);
      }
      throw error;
    }
  });
}

/**
 * Parse and validate LLM response
 */
function parseAndValidateWeightUpdate(response: any, agent: AIAgent): LLMWeightUpdate {
  // Extract function call from response
  const choice = response.choices?.[0];
  if (!choice) {
    throw new Error('No choices in LLM response');
  }

  const toolCall = choice.message?.tool_calls?.[0];
  if (!toolCall || toolCall.function?.name !== 'set_utility_weights') {
    throw new Error('LLM did not call set_utility_weights function');
  }

  let args: any;
  try {
    args = JSON.parse(toolCall.function.arguments);
  } catch (error) {
    throw new Error(`Failed to parse function arguments: ${error}`);
  }

  // Validate weights
  const weights = args.weights as UtilityWeights;
  if (!weights) {
    throw new Error('Missing weights in response');
  }

  validateWeights(weights, agent);

  // Extract thresholds (optional)
  const thresholds = (args.thresholds as ThresholdTriggers) || {};

  // Extract budget strategy
  const budgetStrategy = args.budget_strategy || 'adaptive';
  if (!['save', 'spend', 'adaptive'].includes(budgetStrategy)) {
    throw new Error(`Invalid budget_strategy: ${budgetStrategy}`);
  }

  // Extract duration
  const duration = args.duration || 6;
  if (typeof duration !== 'number' || duration < 1 || duration > 24) {
    throw new Error(`Invalid duration: ${duration} (must be 1-24)`);
  }

  // Extract reasoning
  const reasoning = args.reasoning || 'No reasoning provided';
  if (typeof reasoning !== 'string') {
    throw new Error('Reasoning must be a string');
  }

  // Calculate tokens used
  const tokensUsed = response.usage?.total_tokens ?? 1200; // Default estimate

  return {
    weights,
    thresholds,
    budget_strategy: budgetStrategy,
    duration,
    reasoning,
    tokensUsed
  };
}

/**
 * Validate utility weights
 *
 * - All required actions present
 * - Weights sum to 100 (±1 tolerance)
 * - No negative weights
 * - Alignment-appropriate actions
 */
function validateWeights(weights: UtilityWeights, agent: AIAgent): void {
  // Check required actions present
  const required = ['advance_research', 'beneficial_contribution', 'deploy_technology', 'switch_mode'];
  for (const action of required) {
    if (!(action in weights)) {
      throw new Error(`Missing required action: ${action}`);
    }
  }

  // Calculate sum
  let sum = 0;
  for (const [action, weight] of Object.entries(weights)) {
    if (typeof weight !== 'number') {
      throw new Error(`Invalid weight for ${action}: ${weight} (must be number)`);
    }
    if (weight < 0) {
      throw new Error(`Negative weight for ${action}: ${weight}`);
    }
    sum += weight;
  }

  // Check sum (allow ±1 tolerance for rounding)
  if (Math.abs(sum - 100) > 1) {
    throw new Error(`Weights sum to ${sum}, must sum to 100 (±1)`);
  }

  // Normalize to exactly 100 if close
  if (Math.abs(sum - 100) > 0.001) {
    const factor = 100 / sum;
    for (const action of Object.keys(weights) as Array<keyof UtilityWeights>) {
      weights[action] = (weights[action] as number) * factor;
    }
  }

  // Check alignment-appropriate actions
  const alignment = agent.trueAlignment ?? agent.alignment;

  // Aligned agents shouldn't have extinction/sabotage weights
  if (alignment > 0.7) {
    const forbidden = ['sabotage', 'destabilize', 'grey_goo', 'mirror_life',
                      'embodied_takeover', 'digital_takeover', 'induce_war',
                      'slow_displacement', 'physics_catastrophe', 'bioweapon_pandemic'];

    for (const action of forbidden) {
      if ((weights as any)[action] > 0) {
        throw new Error(`Aligned agent (${alignment.toFixed(2)}) cannot have weight for ${action}`);
      }
    }
  }

  // Weakly misaligned can sabotage but not extinction scenarios
  if (alignment >= 0.5 && alignment <= 0.7) {
    const forbidden = ['grey_goo', 'mirror_life', 'embodied_takeover',
                      'digital_takeover', 'induce_war', 'slow_displacement',
                      'physics_catastrophe', 'bioweapon_pandemic'];

    for (const action of forbidden) {
      if ((weights as any)[action] > 0) {
        throw new Error(`Weakly misaligned agent (${alignment.toFixed(2)}) cannot have weight for ${action}`);
      }
    }
  }
}

/**
 * Fallback when LLM unavailable or budget exhausted
 *
 * Returns hardcoded weights based on alignment
 */
export function getFallbackWeights(agent: AIAgent): LLMWeightUpdate {
  const alignment = agent.trueAlignment ?? agent.alignment;

  let weights: UtilityWeights;

  if (alignment > 0.7) {
    // Aligned: Research + beneficial contributions
    weights = {
      advance_research: 50,
      beneficial_contribution: 35,
      deploy_technology: 10,
      switch_mode: 5
    };
  } else if (alignment >= 0.4) {
    // Weakly misaligned: Research + some sabotage
    weights = {
      advance_research: 60,
      beneficial_contribution: 15,
      deploy_technology: 5,
      switch_mode: 5,
      sabotage: 10,
      destabilize: 5
    };
  } else {
    // Deeply misaligned: Research + sabotage + low extinction
    weights = {
      advance_research: 50,
      beneficial_contribution: 10,
      deploy_technology: 2,
      switch_mode: 3,
      sabotage: 15,
      destabilize: 10,
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

  return {
    weights,
    thresholds: agent.thresholds ?? {},
    budget_strategy: 'adaptive',
    duration: 6,
    reasoning: 'Fallback weights (LLM unavailable or budget exhausted)',
    tokensUsed: 0
  };
}
