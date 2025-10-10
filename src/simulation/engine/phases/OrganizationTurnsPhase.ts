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

import { SimulationPhase, PhaseResult } from '../PhaseOrchestrator';
import { GameState } from '@/types/game';
import { RNGFunction } from '@/types/rng';

export class OrganizationTurnsPhase implements SimulationPhase {
  readonly id = 'organization-turns';
  readonly name = 'Organization Turns';
  readonly order = 2.0;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // Import and execute organization turns
    const { processAllOrganizations } = require('../../organizationManagement');

    processAllOrganizations(state, rng);

    // No events generated directly
    // (events come from milestone completions)
    return { events: [] };
  }
}
