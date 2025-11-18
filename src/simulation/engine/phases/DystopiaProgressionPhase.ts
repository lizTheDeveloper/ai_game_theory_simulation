/**
 * Dystopia Progression Phase
 *
 * Updates dystopian trajectory & authoritarian trends
 * Order: 21.0 (after defensive AI)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext} from '@/types/game';
import type { RNGFunction } from '@/types/config';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { assertFinite, assertDefined, assertProbability } from '@/simulation/utils/assertions';
import { updateGovernmentControlResponse } from '../../dystopiaProgression';

export class DystopiaProgressionPhase implements SimulationPhase {
  readonly id = 'dystopia-progression';
  readonly name = 'Dystopia Progression Update';
  readonly order = 21.01; // Dystopia state calculation - second (uses boundaries)

  // DEPENDENCIES (Nov 6, 2025): Must run after defensive AI
  readonly dependencies = [
    'defensive-ai',  // Order 20.0: Surveillance AI capability
  ] as const;

  execute(state: GameState, rng: RNGFunction): PhaseResult {setDeterministicRng(rng);

    // Validate government system exists
    assertDefined(state.government, {
      location: 'DystopiaProgressionPhase.execute',
      valueName: 'government',
      month: state.currentMonth,
    });

    assertDefined(state.government.structuralChoices, {
      location: 'DystopiaProgressionPhase.execute',
      valueName: 'government.structuralChoices',
      month: state.currentMonth,
    });

    // Validate surveillance level is a valid probability (before update)
    assertProbability(state.government.structuralChoices.surveillanceLevel, {
      location: 'DystopiaProgressionPhase.execute (pre-update)',
      valueName: 'government.structuralChoices.surveillanceLevel',
      month: state.currentMonth,
    });

    // Validate control desire is a valid probability (before update)
    assertProbability(state.government.controlDesire, {
      location: 'DystopiaProgressionPhase.execute (pre-update)',
      valueName: 'government.controlDesire',
      month: state.currentMonth,
    });

    updateGovernmentControlResponse(state, rng);

    // Validate post-update state
    assertProbability(state.government.structuralChoices.surveillanceLevel, {
      location: 'DystopiaProgressionPhase.execute (post-update)',
      valueName: 'government.structuralChoices.surveillanceLevel',
      month: state.currentMonth,
    });

    assertProbability(state.government.controlDesire, {
      location: 'DystopiaProgressionPhase.execute (post-update)',
      valueName: 'government.controlDesire',
      month: state.currentMonth,
    });

    return { events: [] };
  }
}
