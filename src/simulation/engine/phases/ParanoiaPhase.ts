/**
 * Paranoia & Trust Phase
 *
 * Updates paranoia decay and trust recovery
 * Order: 32.0 (after economic updates)
 */

import { SimulationPhase, PhaseResult, RNGFunction } from '../PhaseOrchestrator';
import { GameState } from '@/types/game';
import { updateParanoia } from '../../calculations';

export class ParanoiaPhase implements SimulationPhase {
  readonly id = 'paranoia';
  readonly name = 'Paranoia & Trust Update';
  readonly order = 32.0;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // Paranoia decays, trust recovers, harmful events refresh paranoia
    // Trust is now calculated inside updateParanoia as inverse of paranoia
    updateParanoia(state);

    return { events: [] };
  }
}
