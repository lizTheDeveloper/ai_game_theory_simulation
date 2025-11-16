/**
 * Resource Soil Phase (TIER 1.1 + 1.5)
 *
 * Consolidated soil and chemical pollution resource management:
 * - Phosphorus depletion (TIER 1.1): reserves, geopolitical tensions, supply shocks
 * - Novel entities (TIER 1.5): synthetic chemicals, PFAS, microplastics
 *
 * Research:
 * - Cordell & White (2014): Peak phosphorus supply
 * - UNEP (2024): Novel entities pollution tracking
 * - Persson et al. (2022): Planetary boundaries for novel entities
 *
 * Order: 20.1 (during environmental resource updates, after defensive AI)
 *
 * Batch 3 Consolidation (Nov 9, 2025): Merged PhosphorusPhase + NovelEntitiesPhase
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { updatePhosphorusSystem, checkPhosphorusTechUnlocks } from '../../phosphorusDepletion';
import { updateNovelEntitiesSystem, checkNovelEntitiesTechUnlocks } from '../../novelEntities';

export class ResourceSoilPhase implements SimulationPhase {
  readonly id = 'resource-soil';
  readonly name = 'Resource Soil Update';
  readonly order = 20.11;
  readonly dependencies = ['defensive-ai']; // Both original phases ran after AI actions

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    // HIGH-6 (Nov 8, 2025): Validate RNG for deterministic simulation
    if (!rng || typeof rng !== 'function') {
      throw new Error(
        `❌ CRITICAL: RNG required for deterministic simulation in ${this.id} ` +
        `(Month ${state.currentMonth})`
      );
    }

    setDeterministicRng(rng);

    // === PHOSPHORUS SYSTEM (TIER 1.1) ===
    // Updates phosphorus reserves, geopolitical tensions, supply shocks, tech breakthroughs
    updatePhosphorusSystem(state);
    checkPhosphorusTechUnlocks(state);

    // === NOVEL ENTITIES SYSTEM (TIER 1.5) ===
    // Updates synthetic chemical pollution, reproductive health, chronic disease, tech breakthroughs
    updateNovelEntitiesSystem(state);
    checkNovelEntitiesTechUnlocks(state);

    return { events: [] };
  }
}
