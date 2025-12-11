/**
 * Extinction Debt Phase (Dec 9, 2025)
 *
 * Models delayed biodiversity loss continuing 50-400 years after habitat degradation.
 * - Processes queue of committed extinctions
 * - Realizes extinctions gradually based on ecosystem-specific lag times
 * - Updates biosphere integrity boundary
 *
 * Research:
 * - Dullinger et al. (2012): Alpine species 300-400 year lag
 * - Krauss et al. (2010): Grassland species 50-200 year lag
 * - Tremblay et al. (2006): Tropical trees 50-400 year lag
 *
 * Order: 38.0 (after PlanetaryBoundariesPhase at 21.0, processes committed extinctions)
 *
 * @see reviews/extinction_debt_validation_20251209.md
 * @see openspec/changes/extinction-debt-modeling/proposal.md
 */

import { GameState, SimulationPhase, PhaseResult, RNGFunction } from '@/types/game';
import { assertFinite, assertStateProperty, assertInRange } from '@/simulation/utils/assertions';

export class ExtinctionDebtPhase implements SimulationPhase {
  readonly id = 'extinction_debt';
  readonly name = 'Extinction Debt Realization';
  readonly order = 38.0; // After planetary boundaries (21.0), processes delayed extinctions

  // DEPENDENCIES: Requires planetary boundaries phase
  readonly dependencies = [
    'planetary_boundaries',  // Order 21.0: Creates biosphere state
  ];

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // NOTE: extinctionDebt is initialized in planetaryBoundaries.ts (queueExtinctionDebt)
    // which runs at order 21.0 (before this phase at 38.0).
    // No need for duplicate initialization here.

    // Skip if extinctionDebt not initialized or no committed extinctions
    if (!state.extinctionDebt || state.extinctionDebt.committedExtinctions.length === 0) {
      return { events: [] };
    }

    // Process extinction queue - realize extinctions whose lag time has elapsed
    const currentMonth = assertStateProperty(state, 'currentMonth', {
      location: 'ExtinctionDebtPhase.execute',
      month: state.currentMonth,
    });

    let totalRealizedThisMonth = 0;
    const remainingExtinctions: Array<{
      ecosystemType: 'grassland' | 'alpine' | 'tropical' | 'marine';
      magnitude: number;
      committedMonth: number;
      realizationLagMonths: number;
    }> = [];

    for (const extinction of state.extinctionDebt.committedExtinctions) {
      const monthsElapsed = currentMonth - extinction.committedMonth;

      // Check if lag time has elapsed
      if (monthsElapsed >= extinction.realizationLagMonths) {
        // Realize this extinction
        totalRealizedThisMonth += extinction.magnitude;

        console.log(
          `🌍💀 EXTINCTION DEBT REALIZED: ${extinction.ecosystemType} ecosystem ` +
          `lost ${(extinction.magnitude * 100).toFixed(1)}% biodiversity ` +
          `after ${Math.floor(monthsElapsed / 12)} year lag (committed month ${extinction.committedMonth})`
        );
      } else {
        // Keep in queue
        remainingExtinctions.push(extinction);
      }
    }

    // Update queue and total debt
    state.extinctionDebt.committedExtinctions = remainingExtinctions;
    state.extinctionDebt.totalDebt = remainingExtinctions.reduce(
      (sum, ext) => sum + ext.magnitude,
      0
    );

    // Validate total debt is in valid range
    state.extinctionDebt.totalDebt = assertInRange(
      state.extinctionDebt.totalDebt,
      0,
      1,
      {
        location: 'ExtinctionDebtPhase.execute',
        valueName: 'totalDebt',
        month: currentMonth,
      }
    );

    // Apply realized extinctions to biosphere integrity
    if (totalRealizedThisMonth > 0 && state.biosphereIntegrityIndex) {
      const currentSpecies = assertStateProperty(
        state.biosphereIntegrityIndex,
        'currentSpeciesCount',
        {
          location: 'ExtinctionDebtPhase.execute',
          month: currentMonth,
        }
      );

      // Calculate species lost
      const speciesLost = Math.floor(currentSpecies * totalRealizedThisMonth);

      // Update species count
      state.biosphereIntegrityIndex.currentSpeciesCount = Math.max(
        0,
        currentSpecies - speciesLost
      );

      // Validate species count is finite
      state.biosphereIntegrityIndex.currentSpeciesCount = assertFinite(
        state.biosphereIntegrityIndex.currentSpeciesCount,
        {
          location: 'ExtinctionDebtPhase.execute',
          valueName: 'currentSpeciesCount',
          month: currentMonth,
          additionalInfo: {
            speciesLost,
            totalRealizedThisMonth,
          },
        }
      );

      // Log species count update
      // NOTE: Planetary boundary value is calculated by PlanetaryBoundariesPhase (order 21.0)
      // based on extinction rate dynamics. We only update species count here.
      const baselineSpecies = state.biosphereIntegrityIndex.totalSpeciesBaseline || 54000;
      const currentRatio = state.biosphereIntegrityIndex.currentSpeciesCount / baselineSpecies;

      console.log(
        `📊 Species count updated: ${state.biosphereIntegrityIndex.currentSpeciesCount} / ${baselineSpecies} species ` +
        `(${(currentRatio * 100).toFixed(1)}% remaining)`
      );

      return {
        events: [
          {
            id: `extinction_debt_${currentMonth}`,
            timestamp: currentMonth,
            type: 'environmental',
            agent: 'system',
            title: 'Extinction Debt Realized',
            description: `Extinction debt realized: ${speciesLost} species lost after multi-generational lag`,
            severity: 'critical',
            effects: {
              speciesLost,
              currentSpeciesCount: state.biosphereIntegrityIndex.currentSpeciesCount,
            },
          },
        ],
      };
    }

    return { events: [] };
  }
}
