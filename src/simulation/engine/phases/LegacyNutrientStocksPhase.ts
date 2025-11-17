/**
 * Legacy Nutrient Stocks Phase (TIER 2 HIGH - Nov 15, 2025)
 *
 * Updates accumulated nutrient stocks in soil and sediment reservoirs,
 * calculates exponential decay-based legacy releases.
 *
 * Research backing:
 * - Lake Erie: Internal sediment loading = 10,000-11,000 MT P/year (equals external inputs)
 * - Soil nitrogen: ~30 year half-life for accumulated reactive nitrogen
 * - Aquatic sediment phosphorus: ~100 year half-life
 *
 * Key mechanic: Creates multi-decade inertia in nutrient pollution even after inputs stop.
 * Expected impact: Explains why god mode biogeochemical effectiveness is low (30-50% not 80%+)
 *
 * Order: 21.5 (AFTER planetary boundaries (21.0), BEFORE food security)
 *
 * @see research/nitrogen_food_coupling_20251115.md
 * @see src/simulation/legacyNutrientStocks.ts
 */

import type { GameState, SimulationPhase, PhaseResult, RNGFunction } from '@/types/game';
import { updateLegacyNutrientStocks, initializeLegacyNutrientStock } from '@/simulation/legacyNutrientStocks';
import { assertFinite, assertStateProperty } from '@/simulation/utils/assertions';

export class LegacyNutrientStocksPhase implements SimulationPhase {
  readonly id = 'legacy-nutrient-stocks';
  readonly name = 'Legacy Nutrient Stocks';
  readonly order = 21.5;

  readonly dependencies = [
    'planetary_boundaries',  // Order 7.0: Needs current pollution inputs
  ];

  execute(state: GameState, _rng: RNGFunction): PhaseResult {
    // Defensive: Initialize if missing (should be created in initialization.ts)
    if (!state.planetaryBoundariesSystem.legacyNutrientStock) {
      console.log('⚠️ WARNING: legacyNutrientStock not initialized, creating default (FIX initialization.ts!)');
      state.planetaryBoundariesSystem.legacyNutrientStock = initializeLegacyNutrientStock();
    }

    // Get current month's nitrogen and phosphorus inputs
    // TODO: Wire this to actual pollution sources once biogeochemical boundary is fully integrated
    // For now, use placeholder baseline (2025 global averages)
    const BASELINE_N_INPUT = 120 / 12;  // Mt N/month (120 Mt/year global baseline)
    const BASELINE_P_INPUT = 25 / 12;   // Mt P/month (25 Mt/year global baseline)

    // Calculate effective pollution (current inputs + legacy releases)
    const { effectiveNitrogen, effectivePhosphorus } = updateLegacyNutrientStocks(
      state,
      BASELINE_N_INPUT,
      BASELINE_P_INPUT
    );

    // Store effective values for downstream phases to use
    // (biogeochemical boundary calculation, nitrogen-food coupling)
    if (!state.planetaryBoundariesSystem.legacyNutrientStock) {
      throw new Error('❌ CRITICAL: legacyNutrientStock disappeared after update');
    }

    // Store in a place where biogeochemical boundary can read it
    // For now, just validate the calculation succeeded
    assertFinite(effectiveNitrogen, {
      location: 'LegacyNutrientStocksPhase.execute',
      valueName: 'effectiveNitrogen',
      month: state.currentMonth
    });

    assertFinite(effectivePhosphorus, {
      location: 'LegacyNutrientStocksPhase.execute',
      valueName: 'effectivePhosphorus',
      month: state.currentMonth
    });

    // Log annually for visibility
    if (state.currentMonth % 12 === 0) {
      const stocks = state.planetaryBoundariesSystem.legacyNutrientStock;
      const totalStock = stocks.soil.nitrogen + stocks.sediment.nitrogen;
      console.log(`💧 [Legacy Nutrients] Stock: ${totalStock.toFixed(0)} Mt N, Effective pollution: ${effectiveNitrogen.toFixed(1)} Mt/month`);
    }

    return { events: [] };
  }
}
