/**
 * LLM Weight Update Phase
 *
 * Phase 2.5: Checks if AI agents should update their utility weights via LLM
 *
 * Runs after time advancement, before agent actions.
 *
 * Monthly checks:
 * - Decrement update timer
 * - Check threshold triggers (trust, capability, crises, etc.)
 * - If needed: Call LLM API to get new weights
 * - Track token budget consumption
 * - Fall back to hardcoded weights on error
 */

import type { SimulationPhase, PhaseResult, PhaseContext } from '../../../types/phases';
import type { GameState } from '../../../types/game';
import type { RNGFunction } from '../../../types/config';
import { checkAndUpdateAgentWeights } from '../../llm/integration';

export const LLMWeightUpdatePhase: SimulationPhase = {
  id: 'llm_weight_update',
  name: 'LLM Weight Update',
  order: 2.5, // After time advancement (0-1), before agent actions (3+)

  async execute(state: GameState, rng: RNGFunction, context: PhaseContext): Promise<PhaseResult> {
    const changes: string[] = [];

    // DEBUG: Log phase execution
    if (state.currentMonth === 0 || state.currentMonth % 6 === 0) {
      console.log(`\n[LLM PHASE] Month ${state.currentMonth}: Checking weights (enabled: ${state.llmConfig?.enabled})`);
    }

    // Skip if LLM disabled
    if (!state.llmConfig?.enabled) {
      return { success: true, changes: [] };
    }

    const updatedAgents: string[] = [];

    // DEBUG: Log agent count
    console.log(`[LLM PHASE] Checking ${state.aiAgents?.length || 0} agents for updates`);

    // Check each AI agent for weight updates
    for (const agent of state.aiAgents ?? []) {
      try {
        const updated = await checkAndUpdateAgentWeights(
          state,
          agent.id,
          state.currentMonth,
          rng
        );

        if (updated) {
          updatedAgents.push(agent.name);

          // Track change for logging
          const reason = agent.weightUpdateHistory?.[agent.weightUpdateHistory.length - 1]?.triggerReason || 'unknown';
          changes.push(`${agent.name} updated weights (${reason})`);
        }
      } catch (error) {
        // Log error but don't fail the phase
        if (state.llmConfig?.logLevel >= 1) {
          console.error(`[LLM] Error updating ${agent.name}:`, error);
        }
        changes.push(`${agent.name} update failed (using fallback)`);
      }
    }

    // Summary logging
    if (updatedAgents.length > 0 && state.llmConfig?.logLevel >= 1) {
      console.log(`[LLM] Month ${state.currentMonth}: ${updatedAgents.length} agents updated weights`);
      if (state.llmConfig.logLevel >= 2) {
        console.log(`  Updated: ${updatedAgents.join(', ')}`);
      }
    }

    return {
      success: true,
      changes
    };
  }
};
