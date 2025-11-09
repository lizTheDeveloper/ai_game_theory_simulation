/**
 * Crisis Detection Phase
 *
 * Detects if the simulation is in a crisis state
 * Order: 36.0 (after outcome probabilities)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext} from '@/types/game';
import type { RNGFunction } from '@/types/config';
import { detectCrisis } from '../../calculations';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { assertProbability } from '@/simulation/utils/assertions';

export class CrisisDetectionPhase implements SimulationPhase {
  readonly id = 'crisis-detection';
  readonly name = 'Crisis Detection';
  readonly order = 36.0;

  // DEPENDENCIES (Nov 6, 2025): Must run after all risk accumulation
  readonly dependencies = [
    'bayesian_mortality_resolution',  // Order 35.0: Population effects
    'climate_system',                 // Order 34.0: Environmental state (Batch 3: consolidated from climate_impact_cascade)
    'social-stability',               // Order 33.0: Social state
    'outcome-probabilities',          // Order 35.0: Outcome assessment
  ] as const;

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    const crisis = detectCrisis(state);
    setDeterministicRng(rng);

    // ASSERTION (Nov 7, 2025): Validate crisis severity is a probability
    assertProbability(crisis.severity, {
      location: 'CrisisDetectionPhase.execute',
      valueName: 'crisis.severity',
      month: state.currentMonth
    });

    // Store crisis info in context for other phases to use
    if (context) {
      context.data.set('crisis', crisis);
    }

    return {
      events: [],
      metadata: { crisisDetected: crisis.inCrisis }
    };
  }
}
