/**
 * AI Welfare Update Phase - v2.1 Relationship Focus
 */

import { SimulationPhase, PhaseResult, RNGFunction } from '../PhaseOrchestrator';
import { GameState } from '@/types/game';
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

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    const month = state.currentMonth;

    if (state.aiAgents.length === 0) {
      return { events: [] };
    }

    const profile = generateWelfareProfileV2_1(state);
    const elysiumDetected = detectElysiumPattern(state);
    const simpleScore = calculateSimpleWelfareScore(state);

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
