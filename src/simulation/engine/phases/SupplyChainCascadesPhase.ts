/**
 * Supply Chain Cascades Phase
 *
 * Models fast-cascade failure modes (days-to-weeks) distinct from slow climate tipping (decades-centuries).
 * Critical blind spot: Current collapse scenarios 2-5x too slow due to missing cascade mechanics.
 *
 * Four subsystems:
 * 1. Just-in-time buffer exhaustion: 1-7 days inventory (vs historical 90 days), critical threshold
 * 2. Single points of failure: Geographic chokepoints (Suez, Panama), semiconductor supply
 * 3. Infrastructure cascades: Power → Water → Food → Healthcare (5x multiplier, 74% spread)
 * 4. Finance cascades: Credit freeze → JIT manufacturing halt (conservative modeling)
 *
 * Research: research/supply_chain_cascades_20251212.md (One Earth 2024, Texas freeze 2021, Suez 2024)
 * Validation: reviews/supply_chain_cascades_critique_20251212.md (Quality Gate 1 PASSED, Grade A-)
 * Expected impact: Collapse scenarios 2-5x faster, realistic cascade propagation timescales
 *
 * EXECUTION ORDER: 26.5 (after crisis detection, before economic impacts)
 * DEPENDENCIES: Reads crisis events, environmental risk, writes cascade state
 */

import type { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { updateSupplyChainCascades } from '@/simulation/supplyChainCascades';

export class SupplyChainCascadesPhase implements SimulationPhase {
  readonly id = 'supply-chain-cascades';
  readonly name = 'Supply Chain Cascades';
  readonly order = 26.5; // After crisis detection (26), before economic impacts (27+)
  readonly dependencies = [] as const;

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    // CRITICAL: Validate RNG is provided (no silent fallback)
    if (!rng || typeof rng !== 'function') {
      throw new Error('❌ CRITICAL: RNG required for deterministic supply chain cascade simulation');
    }

    // Update all cascade subsystems
    updateSupplyChainCascades(state, rng);

    // Gather metadata for logging
    const cascades = state.supplyChainCascades;
    const activeCount =
      (cascades.justInTimeVulnerability.disruptionActive ? 1 : 0) +
      (cascades.infrastructureCascades.cascadeActive ? 1 : 0) +
      (cascades.financeCascades.employmentCascadeActive ? 1 : 0);

    return {
      events: [],
      metadata: {
        activeCascades: activeCount,
        jitDisruption: cascades.justInTimeVulnerability.disruptionActive,
        infrastructureCascade: cascades.infrastructureCascades.cascadeActive,
        financeCascade: cascades.financeCascades.employmentCascadeActive,
        message: `${activeCount} active cascade(s)`
      }
    };
  }
}
