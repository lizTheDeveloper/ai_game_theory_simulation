/**
 * Freshwater Depletion Phase (TIER 1.2)
 *
 * Updates freshwater reserves, Day Zero droughts, regional water stress, and tech breakthroughs
 * Order: 20.2 (after Phosphorus, during resource updates)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { assertFinite } from '@/simulation/utils/assertions';

export class FreshwaterPhase implements SimulationPhase {
  readonly id = 'freshwater';
  readonly name = 'Freshwater System Update';
  readonly order = 20.2;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    const { updateFreshwaterSystem, checkFreshwaterTechUnlocks } = require('../../freshwaterDepletion');
    setDeterministicRng(rng);

    // Validate freshwater boundary before update
    assertFinite(state.planetaryBoundaries.freshwaterUse, {
      location: 'FreshwaterPhase.execute (pre-update)',
      valueName: 'freshwaterUse',
      month: state.currentMonth
    });

    updateFreshwaterSystem(state, rng);
    checkFreshwaterTechUnlocks(state);

    // Validate freshwater boundary after update
    assertFinite(state.planetaryBoundaries.freshwaterUse, {
      location: 'FreshwaterPhase.execute (post-update)',
      valueName: 'freshwaterUse',
      month: state.currentMonth
    });

    return { events: [] };
  }
}

