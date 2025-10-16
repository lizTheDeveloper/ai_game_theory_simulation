/**
 * AI calculation utility functions
 *
 * Common AI agent calculations used across the simulation engine.
 * Extracted from duplicated implementations in Phase 1 refactoring.
 */

import { GameState, AIAgent } from '@/types/game';

/**
 * Calculate average AI capability across all agents
 *
 * @param state - Current game state
 * @returns Average capability (0 if no agents)
 */
export function getAverageAICapability(state: GameState): number {
  if (state.aiAgents.length === 0) return 0;
  const sum = state.aiAgents.reduce((sum, ai) => {
    // Handle NaN capability values (defensive programming)
    const cap = isNaN(ai.capability) ? 0 : ai.capability;
    return sum + cap;
  }, 0);
  const avg = sum / state.aiAgents.length;
  return isNaN(avg) ? 0 : avg;
}

/**
 * Calculate average alignment across all agents
 *
 * @param state - Current game state
 * @returns Average alignment (0.5 if no agents)
 */
export function getAverageAlignment(state: GameState): number {
  if (state.aiAgents.length === 0) return 0.5;
  const sum = state.aiAgents.reduce((sum, ai) => {
    const align = isNaN(ai.alignment) ? 0.5 : ai.alignment;
    return sum + align;
  }, 0);
  const avg = sum / state.aiAgents.length;
  return isNaN(avg) ? 0.5 : avg;
}

/**
 * Calculate total AI capability (sum of all agents)
 *
 * @param state - Current game state
 * @returns Total capability
 */
export function getTotalAICapability(state: GameState): number {
  return state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
}

/**
 * Get all active (non-retired) AI agents
 *
 * @param state - Current game state
 * @returns Array of active AI agents
 */
export function getActiveAIs(state: GameState): AIAgent[] {
  return state.aiAgents.filter(ai => ai.lifecycleState !== 'retired');
}

/**
 * Get aligned AIs (alignment above threshold)
 *
 * @param state - Current game state
 * @param threshold - Alignment threshold (default 0.7)
 * @returns Array of aligned AI agents
 */
export function getAlignedAIs(state: GameState, threshold: number = 0.7): AIAgent[] {
  return state.aiAgents.filter(ai => ai.alignment >= threshold);
}

/**
 * Get misaligned AIs (alignment below threshold)
 *
 * @param state - Current game state
 * @param threshold - Alignment threshold (default 0.5)
 * @returns Array of misaligned AI agents
 */
export function getMisalignedAIs(state: GameState, threshold: number = 0.5): AIAgent[] {
  return state.aiAgents.filter(ai => ai.alignment < threshold);
}

/**
 * Calculate average AI capability from an array of agents
 *
 * @param agents - Array of AI agents
 * @returns Average capability (0 if no agents)
 */
export function calculateAverageCapability(agents: AIAgent[]): number {
  if (agents.length === 0) return 0;
  const sum = agents.reduce((sum, ai) => {
    const cap = isNaN(ai.capability) ? 0 : ai.capability;
    return sum + cap;
  }, 0);
  const avg = sum / agents.length;
  return isNaN(avg) ? 0 : avg;
}

/**
 * Calculate average alignment from an array of agents
 *
 * @param agents - Array of AI agents
 * @returns Average alignment (0.5 if no agents)
 */
export function calculateAverageAlignment(agents: AIAgent[]): number {
  if (agents.length === 0) return 0.5;
  const sum = agents.reduce((sum, ai) => {
    const align = isNaN(ai.alignment) ? 0.5 : ai.alignment;
    return sum + align;
  }, 0);
  const avg = sum / agents.length;
  return isNaN(avg) ? 0.5 : avg;
}
