/**
 * AIAgentActionsPhase (0.4)
 *
 * Executes actions for all AI agents:
 * - Research & capability improvement
 * - Resource acquisition
 * - Coordination
 * - Deceptive actions
 *
 * **EXECUTION ORDER:** 0.4 (After wake checks, core agent action phase)
 * **DEPENDENCIES:** Requires AI agents with compute allocation
 * **SIDE EFFECTS:**
 * - Modifies AI capabilities
 * - Modifies state heavily
 * - Returns new state and events
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { assertAICapability, assertAIAggregateCapability, assertDefined, assertInRange } from '@/simulation/utils/assertions';
import { executeAIAgentActions } from '../../agents/aiAgent';
import { updateCounterDetectionLearning } from '../../counterDetectionLearning';

export class AIAgentActionsPhase implements SimulationPhase {
  readonly id = 'ai-agent-actions';
  readonly name = 'AI Agent Actions';
  readonly order = 7.0;

  // DEPENDENCIES (Nov 15, 2025): Phase dependency removed - ai_alignment_evolution phase no longer exists
  readonly dependencies: string[] = [];

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // PERFORMANCE INSTRUMENTATION (Oct 28, 2025)
    setDeterministicRng(rng);
    const enableTiming = state.currentMonth === 0 || state.currentMonth === 120 || state.currentMonth === 240;
    const t1 = enableTiming ? performance.now() : 0;

    // Import and execute existing AI agent actionsconst aiResult = executeAIAgentActions(state, rng);
    const t2 = enableTiming ? performance.now() : 0;

    // Update state (aiResult returns { newState, events })
    Object.assign(state, aiResult.newState);

    // Validate AI agent capabilities after actions (CRITICAL: prevent NaN propagation)
    for (const agent of state.aiAgents || []) {
      // Validate aggregate capability (continuous, can be fractional)
      // Individual dimension capabilities are discrete, but aggregate is continuous
      assertAIAggregateCapability(agent.capability, {
        location: 'AIAgentActionsPhase.execute',
        valueName: `agent[${agent.id}].capability`,
        agentId: agent.id
      });
    }

    // TIER 2 Phase 2A: Counter-Detection Learning (arms race dynamics)updateCounterDetectionLearning(state, rng);
    const t3 = enableTiming ? performance.now() : 0;

    if (enableTiming) {
      console.log(`\n🔍 AI AGENT ACTIONS SUB-TIMING (Month ${state.currentMonth}):`);
      console.log(`  1. executeAIAgentActions: ${(t2 - t1).toFixed(2)}ms`);
      console.log(`  2. updateCounterDetectionLearning: ${(t3 - t2).toFixed(2)}ms`);
      console.log(`  TOTAL: ${(t3 - t1).toFixed(2)}ms`);
    }

    return { events: aiResult.events || [] };
  }
}
