/**
 * Government Relocation Phase (Oct 20, 2025)
 *
 * Models government-assisted relocation programs for climate/water-displaced populations
 * - FEMA-style buyout programs
 * - North Dakota Devils Lake-style managed retreat
 * - China ecological migration programs
 *
 * Research: 55K FEMA buyouts ($4B, 1993-2025), North Dakota $1.5B (600+ homes)
 * Expected impact: Reduces involuntary immobility by 1-5% annually IF funded + political will
 *
 * Order: 20.7 (after RefugeeCrisisPhase at 20.6)
 *
 * @see research/government_relocation_programs_20251020.md
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { assertFinite } from '@/simulation/utils/assertions'; // Module uses assertions
import { updateGovernmentRelocation } from '../../governmentRelocation';

export class GovernmentRelocationPhase implements SimulationPhase {
  readonly id = 'government_relocation';
  readonly name = 'Government Relocation Programs';
  readonly order = 20.7;
  readonly dependencies = ['refugee_crisis']; // Reads displaced populations, provides managed relocation (fixed typo: refugee-crisis → refugee_crisis)

  execute(state: GameState, rng: RNGFunction): PhaseResult {setDeterministicRng(rng);

    // Update government relocation program (if enabled)
    updateGovernmentRelocation(state);

    return { events: [] };
  }
}
