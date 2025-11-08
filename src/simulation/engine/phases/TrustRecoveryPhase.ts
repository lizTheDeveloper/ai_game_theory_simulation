/**
 * Trust Recovery Phase (FIX #7, Oct 18, 2025)
 *
 * Updates trust based on education campaigns, demonstrated benefits, safety record, and explainability.
 * Enables escape from dystopia traps through path-dependent recovery.
 *
 * Research Foundation:
 * - Edelman (2024): Recovery via education, demonstrated benefits, visible impact
 * - Frontiers Psychology (2024): +49% output quality, +52% privacy with feedback loops
 * - DORA (2024): Continuous feedback critical for sustained trust
 *
 * Order: 24.5 (after social cohesion updates, before upward spirals)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { updateTrustRecovery } from '../../socialCohesion';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';

export class TrustRecoveryPhase implements SimulationPhase {
  readonly id = 'trustRecovery';
  readonly name = 'Trust Recovery & Decay';
  readonly order = 24.5;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // HIGH-6 (Nov 8, 2025): Validate RNG for deterministic simulation
    if (!rng || typeof rng !== 'function') {
      throw new Error(
        `❌ CRITICAL: RNG required for deterministic simulation in ${this.id} ` +
        `(Month ${state.currentMonth})`
      );
    }

    // Update trust based on recovery factors (education, benefits, safety) and decay factors (incidents, misalignment)
    setDeterministicRng(rng);
    updateTrustRecovery(state);

    return { events: [] };
  }
}
