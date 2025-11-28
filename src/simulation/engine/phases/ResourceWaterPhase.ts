/**
 * Resource Water Phase (TIER 1.2 + 1.3)
 *
 * Consolidated water resource and ocean health management:
 * - Freshwater depletion (TIER 1.2): Day Zero droughts, regional water stress, groundwater
 * - Ocean acidification (TIER 1.3): pH levels, coral/shellfish collapse, marine food web
 *
 * Research:
 * - IPCC AR6 WG1 (2021): Freshwater cycle changes
 * - Steffen et al. (2015): Ocean acidification planetary boundary
 * - Gattuso et al. (2015): Coral reef collapse thresholds
 *
 * Order: 20.2 (during environmental resource updates, after soil resources)
 *
 * Batch 3 Consolidation (Nov 9, 2025): Merged FreshwaterPhase + OceanAcidificationPhase
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { assertFinite, assertProbability, assertInRange } from '@/simulation/utils/assertions';
import { updateFreshwaterSystem, checkFreshwaterTechUnlocks } from '../../freshwaterDepletion';
import { updateOceanAcidificationSystem, checkOceanAcidificationTechUnlocks } from '../../oceanAcidification';

export class ResourceWaterPhase implements SimulationPhase {
  readonly id = 'resource-water';
  readonly name = 'Resource Water Update';
  readonly order = 20.2;
  readonly dependencies = ['resource-soil']; // Run after soil resources

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    // HIGH-6 (Nov 8, 2025): Validate RNG for deterministic simulation
    if (!rng || typeof rng !== 'function') {
      throw new Error(
        `❌ CRITICAL: RNG required for deterministic simulation in ${this.id} ` +
        `(Month ${state.currentMonth})`
      );
    }

    setDeterministicRng(rng);

    // === FRESHWATER SYSTEM (TIER 1.2) ===
    // Updates freshwater reserves, Day Zero droughts, regional water stress, tech breakthroughs

    // Validate freshwater system state before update
    if (state.freshwaterSystem) {
      assertFinite(state.freshwaterSystem.waterStress, {
        location: 'ResourceWaterPhase.execute (pre-freshwater)',
        valueName: 'waterStress',
        month: state.currentMonth
      });
      assertFinite(state.freshwaterSystem.blueWater.groundwater, {
        location: 'ResourceWaterPhase.execute (pre-freshwater)',
        valueName: 'groundwater',
        month: state.currentMonth
      });
    }

    updateFreshwaterSystem(state, rng);
    checkFreshwaterTechUnlocks(state);

    // Validate freshwater system state after update
    if (state.freshwaterSystem) {
      assertFinite(state.freshwaterSystem.waterStress, {
        location: 'ResourceWaterPhase.execute (post-freshwater)',
        valueName: 'waterStress',
        month: state.currentMonth
      });
      assertFinite(state.freshwaterSystem.blueWater.groundwater, {
        location: 'ResourceWaterPhase.execute (post-freshwater)',
        valueName: 'groundwater',
        month: state.currentMonth
      });
    }

    // === OCEAN ACIDIFICATION SYSTEM (TIER 1.3) ===
    // Updates ocean acidification, coral/shellfish collapse, marine food web, tech breakthroughs

    // Validate ocean acidification system state before update
    if (state.oceanAcidificationSystem) {
      assertProbability(state.oceanAcidificationSystem.pHLevel, {
        location: 'ResourceWaterPhase.execute (pre-ocean)',
        valueName: 'pHLevel',
        month: state.currentMonth
      });
      // RD-2 FIX (Nov 28, 2025): aragoniteSaturation now in real units (0-5), not probability
      assertInRange(state.oceanAcidificationSystem.aragoniteSaturation, 0, 5, {
        location: 'ResourceWaterPhase.execute (pre-ocean)',
        valueName: 'aragoniteSaturation',
        month: state.currentMonth
      });
    }

    // RD-2 FIX (Nov 28, 2025): Pass RNG to ocean acidification system (now REQUIRED)
    updateOceanAcidificationSystem(state, rng);
    checkOceanAcidificationTechUnlocks(state);

    // Validate ocean acidification system state after update
    if (state.oceanAcidificationSystem) {
      assertProbability(state.oceanAcidificationSystem.pHLevel, {
        location: 'ResourceWaterPhase.execute (post-ocean)',
        valueName: 'pHLevel',
        month: state.currentMonth
      });
      // RD-2 FIX (Nov 28, 2025): aragoniteSaturation now in real units (0-5), not probability
      assertInRange(state.oceanAcidificationSystem.aragoniteSaturation, 0, 5, {
        location: 'ResourceWaterPhase.execute (post-ocean)',
        valueName: 'aragoniteSaturation',
        month: state.currentMonth
      });
    }

    return { events: [] };
  }
}
