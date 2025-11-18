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

export class CrisisPointsPhase implements SimulationPhase {
  readonly id = 'crisis-points';
  readonly name = 'Crisis Points Check';
  readonly order = 23.0;

  // DEPENDENCIES (Nov 15, 2025): Requires benchmark evaluations
<<<<<<< HEAD
  // NOTE: crisis-detection runs at order 36.0 (AFTER this phase), so no dependency
=======
  // NOTE: crisis-detection dependency REMOVED - backwards ordering (23.0 cannot depend on 36.0)
  // Phase reads crisis state from previous step
>>>>>>> origin/auto/worker-20251115_013002
  readonly dependencies = [
    'benchmark-evaluations',  // Order 22.0: Benchmarks detect crisis triggers
  ] as const;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    const { processCrisisPoints } = require('../../crisisPoints');
    setDeterministicRng(rng);
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
