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
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { assertPlanetaryBoundary, assertStateProperty, assertFinite } from '@/simulation/utils/assertions';
import { updatePlanetaryBoundaries, updateBiosphereIntegrityIndex } from '../../planetaryBoundaries';
import { updateBoundaryRecovery } from '../../planetaryBoundaryRecovery';

export class PlanetaryBoundariesPhase implements SimulationPhase {
  readonly id = 'planetary_boundaries';
  readonly name = 'Planetary Boundaries System';
  readonly order = 21.00; // Planetary boundary tracking - first

  // DEPENDENCIES (Nov 6, 2025): Requires environmental state from earlier phases
  readonly dependencies = [
    'resource-water',           // Order 20.2: Ocean acidification + Freshwater (Batch 3: consolidated)
    'resource-soil',            // Order 20.1: Novel entities + Phosphorus (Batch 3: consolidated)
    'wet_bulb_temperature',     // Order 20.45: Heat stress events
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
    // Baseline (2025): ~120 Mt N/year = 10 Mt N/month, ~25 Mt P/year = 2.08 Mt P/month
    // TODO (Phase 2): Connect to technology deployment + food system for dynamic calculation
    const BASELINE_N_INPUT_PER_MONTH = 120 / 12;  // 10 Mt N/month (2025 baseline)
    const BASELINE_P_INPUT_PER_MONTH = 25 / 12;   // 2.08 Mt P/month (2025 baseline)

    // Scale by phosphorus reserves depletion (simplified proxy for agricultural activity)
    const phosphorusReserves = assertStateProperty(state, 'phosphorusSystem.reserves', {
      location: 'PlanetaryBoundariesPhase.execute',
      month: state.currentMonth,
    });
    const currentNitrogenInput = BASELINE_N_INPUT_PER_MONTH * phosphorusReserves;
    const currentPhosphorusInput = BASELINE_P_INPUT_PER_MONTH * phosphorusReserves;

    updateLegacyNutrientStocks(state, currentNitrogenInput, currentPhosphorusInput);

    // Update Biosphere Integrity Index (BII) - Climate Mortality Phase 2 (Nov 6, 2025)
    // Species tracking with climate velocity modeling
    updateBiosphereIntegrityIndex(state, rng);

    // Update all planetary boundaries (degradation mechanics)
    // This now reads legacy nutrient stock releases (via getLegacyContributionPercentage)
    updatePlanetaryBoundaries(state);

    // Update Novel Entities boundary with energy-constrained cleanup model (Nov 16, 2025)
    // TODO: Re-enable when updateNovelEntitiesBoundary is implemented
    // updateNovelEntitiesBoundary(state, rng);

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

    return { events: [] };
  }
}

