import { GameState, GameEvent, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
/**
 * Information Warfare & Epistemology Phase
 * TIER 4.3: Truth decay, deepfakes, narrative control
 */

import { updateInformationWarfare } from '../../informationWarfare';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';

export class InformationWarfarePhase implements SimulationPhase {
  readonly name = 'Information Warfare Update';
  readonly id = 'information-warfare';
  readonly order = 22; // After social systems, before crisis detection
  dependencies = ['ai-agent-actions'];

  /**
   * Execute information warfare dynamics
   * - Truth decay (AI accelerates deepfakes)
   * - Detection vs generation arms race
   * - Narrative competition
   * - Impacts on trust, coordination, dystopia
   */
  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    const events = updateInformationWarfare(state);
    setDeterministicRng(rng);

    return { events };
  }
}

