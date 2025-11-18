/**
 * Crisis Points Phase
 *
 * Checks for critical decision moments and crisis triggers
 * Order: 23.0 (after benchmark evaluations)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext} from '@/types/game';
import type { RNGFunction } from '@/types/config';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { assertFinite } from '@/simulation/utils/assertions';
import { processCrisisPoints } from '../../crisisPoints';

export class CrisisPointsPhase implements SimulationPhase {
  readonly id = 'crisis-points';
  readonly name = 'Crisis Points Check';
  readonly order = 23.0;

  // DEPENDENCIES (Nov 15, 2025): Requires benchmark evaluations
  // NOTE: crisis-detection runs at order 36.0 (AFTER this phase), so no dependency
  readonly dependencies = [
    'benchmark-evaluations',  // Order 22.0: Benchmarks detect crisis triggers
  ] as const;

  execute(state: GameState, rng: RNGFunction): PhaseResult {setDeterministicRng(rng);
    const crisisResult = processCrisisPoints(state, rng);

    // If crisis triggered, update state
    if (crisisResult.crisisTriggered) {
      Object.assign(state, crisisResult.newState);

      // ASSERTION (Nov 7, 2025): Validate population wasn't corrupted by crisis
      assertFinite(state.humanPopulationSystem.population, {
        location: 'CrisisPointsPhase.execute',
        valueName: 'population after crisis trigger',
        month: state.currentMonth
      });
    }

    return { events: crisisResult.events || [] };
  }
}
