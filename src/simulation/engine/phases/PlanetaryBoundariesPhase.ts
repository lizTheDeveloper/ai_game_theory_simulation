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
import { assertPlanetaryBoundary } from '@/simulation/utils/assertions';
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

    // Update Biosphere Integrity Index (BII) - Climate Mortality Phase 2 (Nov 6, 2025)
    // Species tracking with climate velocity modeling
    updateBiosphereIntegrityIndex(state, rng);

    // Update all planetary boundaries (degradation mechanics)
    updatePlanetaryBoundaries(state);

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

