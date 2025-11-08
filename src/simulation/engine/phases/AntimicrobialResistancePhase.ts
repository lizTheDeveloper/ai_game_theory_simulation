/**
 * Antimicrobial Resistance (AMR) Phase
 *
 * Updates antibiotic resistance and applies medical effectiveness decline
 * Order: 15.0 (after environmental hazards, before QoL calculation)
 *
 * Research foundation:
 * - WHO (2024): 10M annual deaths by 2050 (TRL 9)
 * - O'Neill Review (2016): $100T economic damage
 * - Lancet (2022): 1.27M deaths in 2019
 *
 * Mechanism:
 * 1. Apply mitigation from breakthrough technologies
 * 2. Update antibiotic resistance prevalence
 * 3. Calculate current mortality rate (exponential growth)
 * 4. Calculate medical effectiveness decline
 * 5. Apply mortality to population
 * 6. Update medical effectiveness impacts (surgery risk, healthcare quality)
 * 7. Calculate economic impact
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext} from '@/types/game';
import type { RNGFunction } from '@/types/config';
import { updateAMRSystem } from '../../antimicrobialResistance';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { assertFinite, assertInRange } from '@/simulation/utils/assertions';

export class AntimicrobialResistancePhase implements SimulationPhase {
  readonly id = 'antimicrobial_resistance';
  readonly name = 'Antimicrobial Resistance';
  readonly order = 15.0; // After environmental hazards (14.x), before QoL (16+)

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // Update entire AMR system
    setDeterministicRng(rng);
    // (includes mitigation, resistance evolution, mortality, medical effectiveness, economic impact)
    updateAMRSystem(state, rng);

    // Validate AMR state after update (prevent NaN propagation)
    if (state.antimicrobialResistance) {
      assertInRange(
        state.antimicrobialResistance.resistancePrevalence,
        0,
        1,
        {
          location: 'AntimicrobialResistancePhase.execute',
          valueName: 'resistancePrevalence',
          month: state.currentMonth
        }
      );

      assertFinite(state.antimicrobialResistance.currentMortalityRate, {
        location: 'AntimicrobialResistancePhase.execute',
        valueName: 'currentMortalityRate',
        month: state.currentMonth
      });

      assertInRange(
        state.antimicrobialResistance.medicalEffectiveness,
        0,
        1,
        {
          location: 'AntimicrobialResistancePhase.execute',
          valueName: 'medicalEffectiveness',
          month: state.currentMonth
        }
      );
    }

    return { events: [] };
  }
}
