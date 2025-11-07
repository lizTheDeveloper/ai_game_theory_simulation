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

    // Validate freshwater system state before update
    // NOTE: freshwaterSystem is the actual state object, not planetaryBoundaries
    // The planetary boundary for freshwater is in planetaryBoundariesSystem.boundaries.freshwater_change
    if (state.freshwaterSystem) {
      assertFinite(state.freshwaterSystem.waterStress, {
        location: 'FreshwaterPhase.execute (pre-update)',
        valueName: 'waterStress',
        month: state.currentMonth
      });
      assertFinite(state.freshwaterSystem.blueWater.groundwater, {
        location: 'FreshwaterPhase.execute (pre-update)',
        valueName: 'groundwater',
        month: state.currentMonth
      });
    }

    updateFreshwaterSystem(state, rng);
    checkFreshwaterTechUnlocks(state);

    // Validate freshwater system state after update
    if (state.freshwaterSystem) {
      assertFinite(state.freshwaterSystem.waterStress, {
        location: 'FreshwaterPhase.execute (post-update)',
        valueName: 'waterStress',
        month: state.currentMonth
      });
      assertFinite(state.freshwaterSystem.blueWater.groundwater, {
        location: 'FreshwaterPhase.execute (post-update)',
        valueName: 'groundwater',
        month: state.currentMonth
      });
    }

    return { events: [] };
  }
}

