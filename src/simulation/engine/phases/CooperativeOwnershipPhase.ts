/**
 * CooperativeOwnershipPhase (15.5)
 *
 * Updates worker cooperative organizations:
 * - Update member participation rates and governance costs
 * - Calculate and distribute quarterly profits
 * - Track worker equity accumulation
 * - Log annual cooperative statistics
 *
 * ⚠️ EXPERIMENTAL FEATURE - Research Quality: C+
 *
 * Research: Québec cooperatives (2010), Borzaga & Galera (2014), Mannan & Pek (2024)
 * WARNING: Limited peer-reviewed research on AI-specific cooperatives
 * Parameters use CONSERVATIVE estimates (lower bounds) with ±40-50% uncertainty
 *
 * **EXECUTION ORDER:** 15.5 (After economic updates, before bankruptcy detection)
 * **DEPENDENCIES:** Requires organizations with cooperativeMetrics
 * **SIDE EFFECTS:**
 * - Modifies organization capital (profit distribution)
 * - Modifies cooperativeMetrics (participation, equity)
 * - Adds events to history.cooperativeOwnershipEvents
 *
 * NOTE: Survival advantage and crisis resilience are applied in:
 * - BankruptcyDetectionPhase (applies survival multipliers)
 * - CrisisResponsePhase (applies crisis resilience bonus)
 * This phase only handles monthly metric updates and profit distribution.
 */

import { GameState, SimulationPhase, PhaseResult, RNGFunction } from '@/types/game';
import { updateCooperativeOwnership } from '../../cooperativeOwnership';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';

export class CooperativeOwnershipPhase implements SimulationPhase {
  readonly id = 'cooperative-ownership';
  readonly name = 'Cooperative Ownership Update';
  readonly order = 15.5;
  dependencies = ['tech-tree'];

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // Check if there are any cooperatives
    setDeterministicRng(rng);
    const cooperativeCount = state.organizations.filter(
      org => org.governanceModel === 'worker-cooperative' && !org.bankrupt
    ).length;

    if (cooperativeCount === 0) {
      // No cooperatives, skip phase
      return { events: [] };
    }

    // Update all cooperative organizations
    updateCooperativeOwnership(state, rng);

    return { events: [] };
  }
}
