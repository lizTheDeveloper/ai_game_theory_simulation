import { GameState, GameEvent, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
/**
 * TIER 1.7.3: Organization Viability Phase
 *
 * Checks if organizations can survive based on their host country's population health.
 * Links organization survival to country population - more realistic than 100% survival!
 *
 * Organizations collapse when:
 * 1. Host country is depopulated (<100K people)
 * 2. Host country population drops below organization's survival threshold
 *
 * Research: Google is ~1% of US economy, can't function if US loses 70% of population
 *
 * P2.4 FIX: Now uses deterministic RNG for bankruptcy checks
 */

import { updateOrganizationViability } from '../../organizations';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { assertFinite } from '@/simulation/utils/assertions'; // Module uses assertions

export class OrganizationViabilityPhase implements SimulationPhase {
  readonly id = 'organization-viability';
  readonly name = 'Organization Viability';
  readonly order = 251; // After country population (250)
  readonly dependencies = ['organization-turns'];

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    // HIGH-6 (Nov 8, 2025): Validate RNG for deterministic simulation
    if (!rng || typeof rng !== 'function') {
      throw new Error(
        `❌ CRITICAL: RNG required for deterministic simulation in ${this.id} ` +
        `(Month ${state.currentMonth})`
      );
    }

    // TIER 1.7.3: Check if organizations can survive based on country health
    setDeterministicRng(rng);
    // P2.4 FIX: Pass RNG for deterministic bankruptcy checks
    updateOrganizationViability(state, rng);

    return { events: [], metadata: {} };
  }
}

