/**
 * Planetary Boundaries Phase (TIER 3.1)
 *
 * Updates all 9 planetary boundaries and checks for tipping point cascades
 * - Climate change, biosphere integrity, land use, freshwater, etc.
 * - Non-linear tipping point risk calculation
 * - Cascade trigger when risk > 70%
 * - Irreversible collapse pathway (48 months)
 *
 * Order: 21.0 (after environmental/resource systems, before extinctions)
 *
 * @reads state.resourceEconomy.co2, state.environmentalAccumulation, state.phosphorusSystem,
 *        state.novelEntitiesSystem, state.oceanAcidificationSystem, state.freshwaterSystem,
 *        state.planetaryBoundariesSystem.novelEntitiesIncrementalImpact (from IrreversibilityTracking, UnknownUnknown)
 * @writes state.planetaryBoundariesSystem.boundaries.*.currentValue (SINGLE OWNER for all boundaries)
 *         state.planetaryBoundariesSystem.novelEntitiesIncrementalImpact (resets to 0)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { debugLog } from '@/simulation/utils/debugFlags';
import { assertPlanetaryBoundary, assertFinite, assertDefined } from '@/simulation/utils/assertions';
import { updatePlanetaryBoundaries, updateBiosphereIntegrityIndex } from '../../planetaryBoundaries';
import { updateBoundaryRecovery } from '../../planetaryBoundaryRecovery';
import { updateNovelEntitiesBoundary } from '../../updateNovelEntitiesBoundary';
import { isHistoricalModeActive } from '@/simulation/utils/historicalMode';
import { updateEnvironmentalAccumulation } from '../../environmental';

export class PlanetaryBoundariesPhase implements SimulationPhase {
  readonly id = 'planetary_boundaries';
  readonly name = 'Planetary Boundaries System';
  readonly order = 21.00; // Planetary boundary tracking - first

  // DEPENDENCIES (Nov 6, 2025): Requires environmental state from earlier phases
  readonly dependencies = [
    'resource-water',           // Order 20.2: Ocean acidification + Freshwater (Batch 3: consolidated)
    'resource-soil',            // Order 20.1: Novel entities + Phosphorus (Batch 3: consolidated)
    'wet_bulb_temperature',     // Order 20.45: Heat stress events
    'nitrogen-food-coupling',   // Order 19.6: CRITICAL - provides globalFoodProductionIndex (Nov 20, 2025 race condition fix)
  ];

  execute(state: GameState, rng: RNGFunction): PhaseResult {setDeterministicRng(rng);// Validate key planetary boundaries before update
    // FIX: state.planetaryBoundaries doesn't exist, use planetaryBoundariesSystem.boundaries
    // Validate temperature anomaly (climate change boundary)
    if (state.resourceEconomy?.co2) {
      assertPlanetaryBoundary(
        state.resourceEconomy.co2.temperatureAnomaly,
        'temperature',
        {
          location: 'PlanetaryBoundariesPhase.execute',
          valueName: 'temperatureAnomaly',
          month: state.currentMonth
        }
      );
    }

    // TIER 2 HIGH (Nov 15, 2025): Update legacy nutrient stocks BEFORE boundary calculations
    // This creates decades-long inertia in biogeochemical flows recovery
    // Research: Lake Erie sediment loading, nitrogen half-life studies
    const { updateLegacyNutrientStocks } = require('../../legacyNutrientStocks');

    // Calculate current monthly nutrient inputs
    // Baseline (2025): ~120 Mt N/year = 10 Mt N/month, ~18.2 Mt P/year = 1.52 Mt P/month
    // Source: Stockholm Resilience Centre (Steffen et al. 2015), research/nitrogen_food_coupling_20251115.md
    // TODO (Phase 2): Connect to technology deployment + food system for dynamic calculation
    const BASELINE_N_INPUT_PER_MONTH = 120 / 12;  // 10 Mt N/month (current 2025 inputs, upper range)
    const BASELINE_P_INPUT_PER_MONTH = 18.2 / 12; // 1.52 Mt P/month (Stockholm Resilience Centre)

    // Scale by phosphorus reserves depletion (simplified proxy for agricultural activity)
    const phosphorusReserves = assertFinite(
      assertDefined(state.phosphorusSystem?.reserves, {
        location: 'PlanetaryBoundariesPhase.execute',
        valueName: 'state.phosphorusSystem.reserves',
        month: state.currentMonth,
        additionalInfo: { context: 'Required for agricultural nutrient input calculation' }
      }),
      {
        location: 'PlanetaryBoundariesPhase.execute',
        valueName: 'phosphorusReserves',
        month: state.currentMonth,
      }
    );
    const currentNitrogenInput = BASELINE_N_INPUT_PER_MONTH * phosphorusReserves;
    const currentPhosphorusInput = BASELINE_P_INPUT_PER_MONTH * phosphorusReserves;

    updateLegacyNutrientStocks(state, currentNitrogenInput, currentPhosphorusInput);

    // Update Biosphere Integrity Index (BII) - Climate Mortality Phase 2 (Nov 6, 2025)
    // Species tracking with climate velocity modeling
    updateBiosphereIntegrityIndex(state, rng);

    // NOTE: Legacy nutrient stocks already updated above (line 64)
    // Duplicate declaration removed to fix esbuild error

    // Update all planetary boundaries (degradation mechanics)
    // This now reads legacy nutrient stock releases (via getLegacyContributionPercentage)
    updatePlanetaryBoundaries(state);

    // HIGH-6 FIX (Nov 27, 2025): Sync climate_change boundary to actual CO2-driven temperature
    // Root cause: planetaryBoundaries.ts line 1685 was incrementing boundary with deforestation feedback,
    // causing drift (1.14°C → 2.10°C over 408 months) while actual temperature stayed at 0.72°C.
    // Validation script reads this boundary, creating false "64% error" report.
    // Solution: Overwrite boundary with authoritative temperature from resourceEconomy.co2
    if (state.planetaryBoundariesSystem?.boundaries?.climate_change && state.resourceEconomy?.co2) {
      const tempAnomalyVs1850 = assertFinite(
        state.resourceEconomy.co2.temperatureAnomaly,
        {
          location: 'PlanetaryBoundariesPhase.execute',
          valueName: 'temperatureAnomaly',
          month: state.currentMonth
        }
      );
      // Convert to pre-industrial (1750) baseline: add 0.1°C
      // Research: IPCC AR6 Cross-Chapter Box 1.2 - Global surface temperature increased by ~0.1°C
      // (likely range -0.1°C to +0.3°C, medium confidence) between 1750 and 1850-1900
      // Anthropogenic contribution: 0.0-0.2°C, with natural variability ±0.1 W/m² from solar/volcanic
      const PREINDUSTRIAL_OFFSET = 0.1; // °C, IPCC AR6 best estimate

      state.planetaryBoundariesSystem.boundaries.climate_change.currentValue =
        assertFinite(
          tempAnomalyVs1850 + PREINDUSTRIAL_OFFSET,
          {
            location: 'PlanetaryBoundariesPhase.execute',
            valueName: 'climate_change.currentValue (synced)',
            month: state.currentMonth,
            additionalInfo: {
              tempAnomalyVs1850,
              PREINDUSTRIAL_OFFSET,
              source: 'IPCC AR6 Cross-Chapter Box 1.2'
            }
          }
        );
    }

    // Update Novel Entities boundary with energy-constrained cleanup model (Nov 16, 2025)
    updateNovelEntitiesBoundary(state, rng);

    // Update boundary recovery mechanics (Oct 21, 2025 - Ecological Recovery System)
    updateBoundaryRecovery(state, rng);

    // Validate key planetary boundaries after update
    if (state.resourceEconomy?.co2) {
      assertPlanetaryBoundary(
        state.resourceEconomy.co2.temperatureAnomaly,
        'temperature',
        {
          location: 'PlanetaryBoundariesPhase.execute (post-update)',
          valueName: 'temperatureAnomaly',
          month: state.currentMonth
        }
      );
    }

    // === HIGH-11 FIX (Nov 28, 2025): CALL ENVIRONMENTAL.TS ===
    // ARCHITECTURAL DECISION: environmental.ts OWNS biodiversityIndex decline mechanics
    // This phase only READS biodiversityIndex and WRITES biosphere_integrity boundary
    //
    // Research: WWF Living Planet Index 2024 (1990: 76.79% → 2024: 49%)
    // Geometric decline formula implemented in environmental.ts lines 342-392
    //
    // environmental.ts has BOTH modes:
    // - Historical mode (1990-2024): WWF LPI empirical rates (geometric: 0.998978 multiplier/month)
    // - Projection mode (2025+): Mechanistic model (economic/manufacturing pressure)
    //
    // No need to duplicate logic here - just call the function
    updateEnvironmentalAccumulation(state, rng);

    return { events: [] };
  }
}

