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
    // HIGH-3 FIX (Nov 20, 2025): Fail loudly if not initialized (will be moved to initialization.ts)
    if (!state.planetaryBoundariesSystem.legacyNutrientStock) {
      throw new Error('❌ CRITICAL: legacyNutrientStock not initialized. Must be created in initialization.ts.');
    }

    // Get current month's nitrogen and phosphorus inputs from regional nitrogen management
    // HIGH-1 FIX (Nov 20, 2025): Wire to actual regional nitrogen use instead of hardcoded baselines
    let totalNitrogenInput = 0;  // Mt N/month
    const BASELINE_P_INPUT = 25 / 12;   // Mt P/month (25 Mt/year global baseline - P tracking not yet regionalized)

    if (state.planetaryBoundariesSystem?.regionalNitrogenManagement) {
      // Sum current nitrogen inputs across all regions
      for (const region of state.planetaryBoundariesSystem.regionalNitrogenManagement) {
        totalNitrogenInput += region.currentNitrogenInput / 12;  // Convert annual to monthly
      }
    } else {
      // Fallback if regional management not initialized (shouldn't happen after initialization.ts fix)
      totalNitrogenInput = 120 / 12;  // Mt N/month (2025 baseline)
      console.log('⚠️ WARNING: regionalNitrogenManagement not found, using baseline nitrogen input');
    }

    // Calculate effective pollution (current inputs + legacy releases)
    const { effectiveNitrogen, effectivePhosphorus } = updateLegacyNutrientStocks(
      state,
      totalNitrogenInput,
      BASELINE_P_INPUT
    );

    // HIGH-1 FIX (Nov 20, 2025): Store effective values in state for planetaryBoundaries to read
    // This breaks the circular dependency where planetaryBoundaries was calling update functions
    if (!state.planetaryBoundariesSystem.legacyNutrientStock) {
      throw new Error('❌ CRITICAL: legacyNutrientStock disappeared after update');
    }
    state.planetaryBoundariesSystem.legacyNutrientStock.effectiveNitrogen = effectiveNitrogen;
    state.planetaryBoundariesSystem.legacyNutrientStock.effectivePhosphorus = effectivePhosphorus;

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
