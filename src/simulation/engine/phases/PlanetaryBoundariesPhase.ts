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
    // HIGH-2 FIX (Nov 28, 2025): Add assertFinite to nutrient input calculations
    const currentNitrogenInput = assertFinite(
      BASELINE_N_INPUT_PER_MONTH * phosphorusReserves,
      {
        location: 'PlanetaryBoundariesPhase.execute',
        valueName: 'currentNitrogenInput',
        month: state.currentMonth,
        additionalInfo: { baseline: BASELINE_N_INPUT_PER_MONTH, phosphorusReserves }
      }
    );
    const currentPhosphorusInput = assertFinite(
      BASELINE_P_INPUT_PER_MONTH * phosphorusReserves,
      {
        location: 'PlanetaryBoundariesPhase.execute',
        valueName: 'currentPhosphorusInput',
        month: state.currentMonth,
        additionalInfo: { baseline: BASELINE_P_INPUT_PER_MONTH, phosphorusReserves }
      }
    );

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
      // Convert to pre-industrial (1750) baseline: add 0.7°C
      // Research: 1750-1850 warming ~0.7°C (IPCC AR6, historical temperature reconstruction)
      state.planetaryBoundariesSystem.boundaries.climate_change.currentValue =
        assertFinite(
          tempAnomalyVs1850 + 0.7,
          {
            location: 'PlanetaryBoundariesPhase.execute',
            valueName: 'climate_change.currentValue (synced)',
            month: state.currentMonth
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

    // === BIODIVERSITY DECLINE OWNERSHIP (Nov 28, 2025 - DUPLICATE FIX) ===
    // ROOT CAUSE: HIGH-8 incorrectly added biodiversity decline here, but it's ALREADY applied
    // by environmental.ts updateEnvironmentalAccumulation() (called from engine.ts:975 EVERY step)
    //
    // ARCHITECTURAL DECISION (Option A):
    // - environmental.ts OWNS biodiversityIndex decline mechanics (accumulation system)
    // - PlanetaryBoundariesPhase READS biodiversityIndex, WRITES biosphere_integrity boundary (sync only)
    // - This maintains separation of concerns: mechanics vs boundary tracking
    //
    // RATIONALE:
    // 1. Biodiversity loss is environmental debt (fits accumulation paradigm)
    // 2. environmental.ts has research-validated GEOMETRIC formula (HIGH-11 fix)
    // 3. This phase had duplicate LINEAR formula (mathematically wrong)
    // 4. Prevents double-decrement bug (2x acceleration)
    //
    // REMOVED: Lines 144-183 (duplicate biodiversity decline code)
    // KEPT: Line 96 updatePlanetaryBoundaries() syncs biodiversityIndex → biosphere_integrity
    //
    // See: /src/simulation/environmental.ts lines 308-397 (canonical biodiversity decline owner)

    return { events: [] };
  }
}

