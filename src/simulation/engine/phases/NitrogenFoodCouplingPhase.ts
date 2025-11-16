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
  initializeRegionalNitrogenManagement,
  calculateTechnologyNitrogenReduction
} from '@/simulation/nitrogenFoodCoupling';
import { assertFinite, assertProbability } from '@/simulation/utils/assertions';

export class NitrogenFoodCouplingPhase implements SimulationPhase {
  readonly id = 'nitrogen-food-coupling';
  readonly name = 'Nitrogen-Food Coupling';
  readonly order = 22.0;

  readonly dependencies = [
    'legacy-nutrient-stocks',  // Order 7.5: Needs effective nitrogen pollution
    'planetary_boundaries',    // Order 7.0: Needs boundary status
  ];

  execute(state: GameState, _rng: RNGFunction): PhaseResult {
    // Defensive: Initialize if missing (should be created in initialization.ts)
    if (!state.planetaryBoundariesSystem.regionalNitrogenManagement) {
      console.log('⚠️ WARNING: regionalNitrogenManagement not initialized, creating default (FIX initialization.ts!)');
      state.planetaryBoundariesSystem.regionalNitrogenManagement = initializeRegionalNitrogenManagement();
    }

    // Collect deployed technology effectiveness values
    // TODO: Wire this to actual deployed technologies (precision ag, vertical farming, etc.)
    // For now, use baseline (no tech deployed = no reduction)
    const deployedTechEffectiveness: number[] = [];

    // If technologies are deployed, add their effectiveness
    // Example: Precision agriculture (30%), Vertical farming (60%), Food waste reduction (25%)
    // This is just a placeholder - real implementation will check state.technologies

    // Calculate global food production impact from nitrogen constraints
    const globalFoodProductionMultiplier = updateNitrogenFoodCoupling(
      state,
      deployedTechEffectiveness
    );

    // Validate result
    const validatedMultiplier = assertFinite(globalFoodProductionMultiplier, {
      location: 'NitrogenFoodCouplingPhase.execute',
      valueName: 'globalFoodProductionMultiplier',
      month: state.currentMonth
    });

    // Store multiplier somewhere food security can read it
    // TODO: Add field to GameState for nitrogen food production multiplier
    // For now, just log it

    // Log annually for visibility
    if (state.currentMonth % 12 === 0) {
      const nitrogenReduction = calculateTechnologyNitrogenReduction(deployedTechEffectiveness);
      console.log(`🌾 [Nitrogen-Food] N reduction: ${(nitrogenReduction * 100).toFixed(1)}%, Food production: ${(validatedMultiplier * 100).toFixed(1)}%`);

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
