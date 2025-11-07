/**
 * MAD Deterrence Phase
 *
 * Updates nuclear deterrence & mutual destruction dynamics
 * Order: 16.0 (after national AI - needs race intensity)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { assertFinite, assertProbability } from '@/simulation/utils/assertions';

export class MADDeterrencePhase implements SimulationPhase {
  readonly id = 'mad-deterrence';
  readonly name = 'MAD Deterrence Update';
  readonly order = 16.0;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    const { updateMADDeterrence, updateBilateralTensions } = require('../../nuclearStates');
    setDeterministicRng(rng);
    updateMADDeterrence(state);
    updateBilateralTensions(state);

    // ASSERTIONS (Nov 7, 2025): Validate MAD deterrence calculations
    assertProbability(state.madDeterrence.madStrength, {
      location: 'MADDeterrencePhase.execute',
      valueName: 'madDeterrence.madStrength',
      month: state.currentMonth
    });
    assertProbability(state.madDeterrence.crisisStability, {
      location: 'MADDeterrencePhase.execute',
      valueName: 'madDeterrence.crisisStability',
      month: state.currentMonth
    });
    assertProbability(state.madDeterrence.earlyWarningReliability, {
      location: 'MADDeterrencePhase.execute',
      valueName: 'madDeterrence.earlyWarningReliability',
      month: state.currentMonth
    });

    return { events: [] };
  }
}
