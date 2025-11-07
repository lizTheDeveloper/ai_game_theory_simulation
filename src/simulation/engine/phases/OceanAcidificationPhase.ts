/**
 * Ocean Acidification Phase (TIER 1.3)
 *
 * Updates ocean acidification, coral/shellfish collapse, marine food web, and tech breakthroughs
 * Order: 20.3 (after Freshwater, during environmental updates)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { assertPlanetaryBoundary } from '@/simulation/utils/assertions';

export class OceanAcidificationPhase implements SimulationPhase {
  readonly id = 'ocean-acidification';
  readonly name = 'Ocean Acidification Update';
  readonly order = 20.3;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    const { updateOceanAcidificationSystem, checkOceanAcidificationTechUnlocks } = require('../../oceanAcidification');
    setDeterministicRng(rng);

    // Validate ocean pH before/after update
    assertPlanetaryBoundary(state.oceanHealth.pH, 'oceanPH', {
      location: 'OceanAcidificationPhase.execute',
      valueName: 'ocean pH',
      month: state.currentMonth
    });

    updateOceanAcidificationSystem(state);
    checkOceanAcidificationTechUnlocks(state);

    assertPlanetaryBoundary(state.oceanHealth.pH, 'oceanPH', {
      location: 'OceanAcidificationPhase.execute (post-update)',
      valueName: 'ocean pH',
      month: state.currentMonth
    });

    return { events: [] };
  }
}

