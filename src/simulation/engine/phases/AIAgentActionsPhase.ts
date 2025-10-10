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

import { SimulationPhase, PhaseResult } from '../PhaseOrchestrator';
import { GameState } from '@/types/game';
import { RNGFunction } from '@/types/rng';

export class AIAgentActionsPhase implements SimulationPhase {
  readonly id = 'ai-agent-actions';
  readonly name = 'AI Agent Actions';
  readonly order = 7.0;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // Import and execute existing AI agent actions
    const { executeAIAgentActions } = require('../../agents/aiAgent');

    const aiResult = executeAIAgentActions(state, rng);

    // Update state (aiResult returns { newState, events })
    Object.assign(state, aiResult.newState);

    return { events: aiResult.events || [] };
  }
}
