/**
 * Ocean Acidification Phase (TIER 1.3)
 *
 * Updates ocean acidification, coral/shellfish collapse, marine food web, and tech breakthroughs
 * Order: 20.3 (after Freshwater, during environmental updates)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { assertProbability } from '@/simulation/utils/assertions';

export class OceanAcidificationPhase implements SimulationPhase {
  readonly id = 'ocean-acidification';
  readonly name = 'Ocean Acidification Update';
  readonly order = 20.3;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    const { updateOceanAcidificationSystem, checkOceanAcidificationTechUnlocks } = require('../../oceanAcidification');
    setDeterministicRng(rng);

    // Validate ocean acidification system state before/after update
    // NOTE: pHLevel is stored as [0,1] normalized (1.0 = pre-industrial 8.2 pH)
    // updateOceanAcidificationSystem handles all internal validation
    if (state.oceanAcidificationSystem) {
      assertProbability(state.oceanAcidificationSystem.pHLevel, {
        location: 'OceanAcidificationPhase.execute',
        valueName: 'pHLevel',
        month: state.currentMonth
      });
      assertProbability(state.oceanAcidificationSystem.aragoniteSaturation, {
        location: 'OceanAcidificationPhase.execute',
        valueName: 'aragoniteSaturation',
        month: state.currentMonth
      });
    }

    updateOceanAcidificationSystem(state);
    checkOceanAcidificationTechUnlocks(state);

    if (state.oceanAcidificationSystem) {
      assertProbability(state.oceanAcidificationSystem.pHLevel, {
        location: 'OceanAcidificationPhase.execute (post-update)',
        valueName: 'pHLevel',
        month: state.currentMonth
      });
      assertProbability(state.oceanAcidificationSystem.aragoniteSaturation, {
        location: 'OceanAcidificationPhase.execute (post-update)',
        valueName: 'aragoniteSaturation',
        month: state.currentMonth
      });
    }

    return { events: [] };
  }
}

