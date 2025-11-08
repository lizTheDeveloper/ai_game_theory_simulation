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
import { assertAICapability, assertDefined, assertInRange } from '@/simulation/utils/assertions';

export class AIAgentActionsPhase implements SimulationPhase {
  readonly id = 'ai-agent-actions';
  readonly name = 'AI Agent Actions';
  readonly order = 7.0;

  // DEPENDENCIES (Nov 6, 2025): Requires alignment state for action constraints
  readonly dependencies = [
    'alignment_dynamics',        // Order 3.5: Alignment state affects action selection
  ];

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // PERFORMANCE INSTRUMENTATION (Oct 28, 2025)
    setDeterministicRng(rng);
    const enableTiming = state.currentMonth === 0 || state.currentMonth === 120 || state.currentMonth === 240;
    const t1 = enableTiming ? performance.now() : 0;

    // Import and execute existing AI agent actions
    const { executeAIAgentActions } = require('../../agents/aiAgent');

    const aiResult = executeAIAgentActions(state, rng);
    const t2 = enableTiming ? performance.now() : 0;

    // Update state (aiResult returns { newState, events })
    Object.assign(state, aiResult.newState);

    // Validate AI agent capabilities after actions (CRITICAL: prevent NaN propagation)
    for (const agent of state.aiAgents || []) {
      // Validate aggregate capability (continuous 0-5, NOT discrete levels)
      // Individual dimension capabilities are discrete, but aggregate is continuous
      // NOTE: Don't hide undefined with fallback - if capability missing, that's a bug
      const cap = agent.capability;
      if (cap === undefined || !isFinite(cap) || cap < 0 || cap > 5) {
        throw new Error(
          `❌ Invalid AI agent capability\n` +
          `   Location: AIAgentActionsPhase.execute\n` +
          `   Agent: ${agent.id}\n` +
          `   Capability: ${cap}\n` +
          `   Expected: finite number in [0, 5]\n` +
          `   Month: ${state.currentMonth}`
        );
      }
    }

    // TIER 2 Phase 2A: Counter-Detection Learning (arms race dynamics)
    const { updateCounterDetectionLearning } = require('../../counterDetectionLearning');
    updateCounterDetectionLearning(state, rng);
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
