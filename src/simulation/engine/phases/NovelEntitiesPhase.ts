/**
 * Novel Entities Phase (TIER 1.5)
 *
 * Updates synthetic chemical pollution, reproductive health, chronic disease, and tech breakthroughs
 * Order: 20.4 (after Ocean Acidification, during environmental updates)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';

export class NovelEntitiesPhase implements SimulationPhase {
  readonly id = 'novel-entities';
  readonly name = 'Novel Entities Update';
  readonly order = 20.4;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // HIGH-6 (Nov 8, 2025): Validate RNG for deterministic simulation
    if (!rng || typeof rng !== 'function') {
      throw new Error(
        `❌ CRITICAL: RNG required for deterministic simulation in ${this.id} ` +
        `(Month ${state.currentMonth})`
      );
    }

    const { updateNovelEntitiesSystem, checkNovelEntitiesTechUnlocks } = require('../../novelEntities');
    setDeterministicRng(rng);

    updateNovelEntitiesSystem(state);
    checkNovelEntitiesTechUnlocks(state);

    return { events: [] };
  }
}

