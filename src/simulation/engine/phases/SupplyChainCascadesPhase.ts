import { GameState, GameEvent, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
/**
 * Supply Chain Cascade Propagation Phase
 *
 * Models fast-timescale cascade failures (days-to-weeks):
 * - JIT manufacturing buffer exhaustion
 * - Geographic chokepoint disruptions
 * - Infrastructure cascades (power→water→food→healthcare)
 * - Finance-supply chain feedback loops
 *
 * Research: research/supply_chain_cascades_20251212.md
 * Critique: reviews/supply_chain_cascades_critique_20251212.md (QG1: Grade B)
 * Priority: HIGH (Session 70 finding - collapse scenarios 2-5x too slow)
 *
 * Key Parameters:
 * - Infrastructure cascade multiplier: 5× (One Earth 2024)
 * - Cascade spread probability: 74% (Nirandjan et al. 2024)
 * - Texas 2021 validation: 3-day power → 12M water → $195B damages
 * - Suez 2024 validation: 64% transit decline → 158-246% rate increase
 */

import { updateSupplyChainCascades } from '../../supplyChainCascades';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';

export class SupplyChainCascadesPhase implements SimulationPhase {
  readonly id = 'supply_chain_cascades';
  readonly name = 'SupplyChainCascades';
  readonly order = 26.5; // After crisis management (26), before health/safety nets

  // DEPENDENCIES: Supply chain cascades interact with multiple systems
  readonly dependencies = [
    'crisis_management',      // Crisis events trigger cascades
    'energy-budget',          // Power grid status affects infrastructure cascades
    'geopolitical_conflict',  // Conflicts can disrupt chokepoints
  ];

  execute(state: GameState, _rng: RNGFunction): PhaseResult {
    // Set deterministic RNG for phase execution
    setDeterministicRng(_rng);

    // Update supply chain cascades (function handles state initialization)
    updateSupplyChainCascades(state, _rng);

    // Return phase result (no events emitted in minimal version)
    return { events: [] };
  }
}
