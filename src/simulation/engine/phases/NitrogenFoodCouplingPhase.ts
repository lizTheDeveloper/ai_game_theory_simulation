/**
 * Nitrogen-Food Production Coupling Phase (TIER 2 HIGH - Nov 15, 2025)
 *
 * Models the constraint that reducing nitrogen fertilizer affects crop yields,
 * with critical regional differentiation.
 *
 * Research backing:
 * - Science Advances (2024): 55% of South Asian rice farmers overuse nitrogen (zero penalty zone)
 * - Zhang et al. (2021): 30-70% N reduction possible with yield INCREASES
 * - Sub-Saharan Africa: 10% UNDERUSE (penalties start immediately)
 *
 * Key insight: NOT "physically impossible" but "requires unprecedented coordination"
 *
 * Three-zone penalty function:
 * 1. Overuse zones: Zero penalty until excess removed (55% in South Asia)
 * 2. Optimal use: Nonlinear penalty (3% at 15%, accelerating beyond 30%)
 * 3. Underuse zones: Immediate penalties (need MORE nitrogen, not less)
 *
 * Order: 22.0 (AFTER legacy nutrients (21.5), BEFORE food security calculation)
 *
 * @see research/nitrogen_food_coupling_20251115.md
 * @see src/simulation/nitrogenFoodCoupling.ts
 */

import type { GameState, SimulationPhase, PhaseResult, RNGFunction } from '@/types/game';
import {
  updateNitrogenFoodCoupling,
  initializeRegionalNitrogenManagement
} from '@/simulation/nitrogenFoodCoupling';
import { assertFinite, assertProbability } from '@/simulation/utils/assertions';

export class NitrogenFoodCouplingPhase implements SimulationPhase {
  readonly id = 'nitrogen-food-coupling';
  readonly name = 'Nitrogen-Food Coupling';
  readonly order = 19.6;  // AFTER QoL (19.5), BEFORE food degradation (19.7)

  readonly dependencies = [
    'quality-of-life',         // Order 19.5: QoL calculated first
  ];

  execute(state: GameState, _rng: RNGFunction): PhaseResult {
    // HIGH-3 FIX (Nov 20, 2025): Fail loudly if not initialized (will be moved to initialization.ts)
    if (!state.planetaryBoundariesSystem.regionalNitrogenManagement) {
      throw new Error('❌ CRITICAL: regionalNitrogenManagement not initialized. Must be created in initialization.ts.');
    }

    // HIGH-1 FIX (Nov 20, 2025): Now wired to actual deployed technologies via getNitrogenReductionDeployment
    // This function reads state.techTreeState.regionalDeployment and extracts nitrogen-reducing tech effectiveness
    // Technologies: precision agriculture, vertical farming, nitroplast integration, etc.

    // Calculate global food production impact from nitrogen constraints
    // This internally calls getNitrogenReductionDeployment to get actual tech deployment
    const globalFoodProductionMultiplier = updateNitrogenFoodCoupling(state);

    // Validate result
    const validatedMultiplier = assertFinite(globalFoodProductionMultiplier, {
      location: 'NitrogenFoodCouplingPhase.execute',
      valueName: 'globalFoodProductionMultiplier',
      month: state.currentMonth
    });

    // CRITICAL FIX (Nov 20, 2025): Store in state to prevent race condition
    // PlanetaryBoundariesPhase reads this value instead of calling updateNitrogenFoodCoupling() again
    state.planetaryBoundariesSystem.globalFoodProductionIndex = validatedMultiplier;

    // Log annually for visibility
    if (state.currentMonth % 12 === 0) {
      console.log(`🌾 [Nitrogen-Food] Food production: ${(validatedMultiplier * 100).toFixed(1)}%`);

      // Log regional details
      const regions = state.planetaryBoundariesSystem.regionalNitrogenManagement;
      if (regions && regions.length > 0) {
        for (const region of regions) {
          if (region.yieldImpact !== 0) {
            console.log(`  [${region.region}] Yield impact: ${(region.yieldImpact * 100).toFixed(1)}% (overuse: ${(region.overusePercentage * 100).toFixed(0)}%)`);
          }
        }
      }
    }

    return { events: [] };
  }
}
