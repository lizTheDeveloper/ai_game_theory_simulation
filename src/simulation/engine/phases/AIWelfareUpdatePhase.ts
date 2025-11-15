/**
 * AI Welfare Update Phase - v2.1 Relationship Focus
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext} from '@/types/game';
import type { RNGFunction } from '@/types/config';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { assertProbability } from '@/simulation/utils/assertions';
import {
  generateWelfareProfileV2_1,
  detectElysiumPattern,
  calculateSimpleWelfareScore,
  updateAlignmentFromRelationships
} from '../../aiWelfare';

export class AIWelfareUpdatePhase implements SimulationPhase {
  readonly id = 'ai-welfare-update';
  readonly name = 'AI Welfare Update v2.1';
  readonly order = 2.5;

  // DEPENDENCIES (Nov 15, 2025): None - reads AI agents from state
  // REMOVED ai-lifecycle dependency (wrong order: phase 2.5 can't depend on phase 4.0)
  // Uses AI agents from initialization or previous step's state
  readonly dependencies = [] as const;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    const month = state.currentMonth;
    setDeterministicRng(rng);

    if (state.aiAgents.length === 0) {
      return { events: [] };
    }

    const profile = generateWelfareProfileV2_1(state);
    const elysiumDetected = detectElysiumPattern(state);
    const rawSimpleScore = calculateSimpleWelfareScore(state);

    // Validate welfare score is a probability
    const simpleScore = assertProbability(rawSimpleScore, {
      location: 'AIWelfareUpdatePhase',
      valueName: 'simpleScore',
      month: state.currentMonth,
      additionalInfo: { agentCount: state.aiAgents.length }
    });

    updateAlignmentFromRelationships(state);

    state.aiWelfare.profileV2_1 = profile;
    state.aiWelfare.simpleScore = simpleScore;
    state.aiWelfare.elysiumPattern = elysiumDetected;
    state.aiWelfare.lastUpdated = month;

    if (month % 6 === 0) {
      state.aiWelfare.history.push({
        month,
        profile: { ...profile },
        simpleScore,
        elysiumPattern: elysiumDetected,
      });
    }

    return { events: [] };
  }
}
