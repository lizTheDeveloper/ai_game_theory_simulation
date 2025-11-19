/**
 * OrganizationTurnsPhase (6.0)
 *
 * Processes organization turns:
 * - Project execution
 * - Revenue and expenses
 * - Strategic decisions
 * - Datacenter construction
 *
 * Must run BEFORE compute allocation so new datacenters are available.
 *
 * **EXECUTION ORDER:** 6.0 (Early infrastructure)
 * **DEPENDENCIES:** Requires organizations
 * **SIDE EFFECTS:**
 * - Modifies organization state
 * - Adds/removes datacenters
 * - Updates capital
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { processAllOrganizations } from '../../organizationManagement';

export class OrganizationTurnsPhase implements SimulationPhase {
  readonly id = 'organization-turns';
  readonly name = 'Organization Turns';
  readonly order = 2.0;

  // DEPENDENCIES (Nov 15, 2025): Requires compute infrastructure for datacenter construction
  readonly dependencies = [
    'compute-growth',         // Order 1.0: Compute infrastructure must exist before organizations build datacenters
  ] as const;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // HIGH-6 (Nov 8, 2025): Validate RNG for deterministic simulation
    if (!rng || typeof rng !== 'function') {
      throw new Error(
        `❌ CRITICAL: RNG required for deterministic simulation in ${this.id} ` +
        `(Month ${state.currentMonth})`
      );
    }

    // Import and execute organization turns
    setDeterministicRng(rng);processAllOrganizations(state, rng);

    // No events generated directly
    // (events come from milestone completions)
    return { events: [] };
  }
}
