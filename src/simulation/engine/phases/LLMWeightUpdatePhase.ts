import { GameState, GameEvent, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
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

import { checkAndUpdateAgentWeights } from '../../llm/integration';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { assertAICapability } from '@/simulation/utils/assertions';

export const LLMWeightUpdatePhase: SimulationPhase = {
  id: 'llm_weight_update',
  name: 'LLM Weight Update',
  order: 2.5, // After time advancement (0-1), before agent actions (3+)

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    // Note: This phase is synchronous but checkAndUpdateAgentWeights internally handles async LLM calls
    setDeterministicRng(rng);
    // by queuing them and processing them in the background. The phase doesn't wait for responses.
    const changes: string[] = [];

    // DEBUG: Log phase execution
    if (state.currentMonth === 0 || state.currentMonth % 6 === 0) {
      console.log(`\n[LLM PHASE] Month ${state.currentMonth}: Checking weights (enabled: ${state.llmConfig?.enabled})`);
    }

    // Skip if LLM disabled
    if (!state.llmConfig?.enabled) {
      return { events: [], metadata: { changes: [] } };
    }

    const updatedAgents: string[] = [];

    // DEBUG: Log agent count
    if (state.aiAgents === undefined) {
      throw new Error('❌ state.aiAgents is undefined in LLMWeightUpdatePhase:46 - initialization bug');
    }
    console.log(`[LLM PHASE] Checking ${state.aiAgents.length} agents for updates`);

    // Check each AI agent for weight updates
    // Note: checkAndUpdateAgentWeights is now synchronous - async LLM calls are queued internally
    for (const agent of state.aiAgents) {
      try {
        // Synchronous call - LLM updates happen in background
        const updated = checkAndUpdateAgentWeights(
          state,
          agent.id,
          state.currentMonth,
          rng
        ) as any; // Type assertion to handle potential async/sync mismatch

        if (updated) {
          updatedAgents.push(agent.name);

          // Validate AI capability after weight update
          assertAICapability(agent.capability, { allowContinuous: true,
            location: 'LLMWeightUpdatePhase.execute',
            valueName: `agent[${agent.id}].capability`,
            month: state.currentMonth,
            additionalInfo: { agentId: agent.id, agentName: agent.name }
          });

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
      events: [],
      metadata: { changes }
    };
  }
};
