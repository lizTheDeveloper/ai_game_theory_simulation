/**
 * Human Population Dynamics Phase (TIER 1.5)
 *
 * Updates human population with concrete tracking (not abstract severity)
 * - Birth/death rates based on QoL, resources, crises
 * - Carrying capacity from environment/tech
 * - Population crash vs extinction distinction
 * - Recovery mechanics after bottleneck events
 *
 * Order: 20.5 (after other resource systems, before refugee crises)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { assertFinite, assertRegionalConsistency } from '@/simulation/utils/assertions';
import {
  updateHumanPopulation,
  applyPopulationEffectsToQoL,
  updateOutcomeMetricsWithPopulation,
  aggregateGlobalPopulation,
  aggregateGlobalDemographics,
  aggregateGlobalCarryingCapacity,
  aggregateGlobalDeaths
} from '../../populationDynamics';
import { updateRegionalPopulations } from '../../regionalPopulations';

export class HumanPopulationPhase implements SimulationPhase {
  readonly id = 'human_population';
  readonly name = 'Human Population Dynamics';
  readonly order = 20.52;

  // DEPENDENCIES (Nov 6, 2025): Requires quality of life for birth rate calculation
  readonly dependencies = [
    'quality-of-life',           // Order 19.5: QoL affects demographic decisions
  ];

  // DEPENDENCY NOTE (Nov 6, 2025): This phase runs BEFORE BayesianMortalityResolutionPhase
  // HumanPopulation order: 20.52, BayesianMortality order: 35.0
  // No dependency needed - phases that run AFTER Bayesian should not overwrite population
  // See Oct 28, 2025 bug fix: CountryPopulation phase was DELETED to prevent overwrites

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // Population updates run once per simulation step (once per month)
    setDeterministicRng(rng);
    // Each engine.step() represents one month advancing
    // Population calculations use monthly rates - no need to gate on day
    const {
      updateHumanPopulation,
      applyPopulationEffectsToQoL,
      updateOutcomeMetricsWithPopulation
    } = require('../../populationDynamics');

    const {
      updateRegionalPopulations
    } = require('../../regionalPopulations');

    const {
      aggregateAllRegionalData
    } = require('../../populationDynamics');

    const {
      assertRegionalConsistency
    } = require('../../utils/assertions');

    // === DEFENSIVE CHECK (Nov 21, 2025): Detect population race conditions ===
    // BEFORE updating regional populations, verify global/regional sync.
    // If a previous phase (e.g., CoordinatedDeploymentPhase) modified global
    // population WITHOUT updating regions, we'll detect the desync here.
    const regions = state.humanPopulationSystem.regionalPopulations;
    if (regions && regions.length > 0) {
      // NOTE: Regional populations are in MILLIONS, global is in BILLIONS
      const regionalSumMillions = regions.reduce((sum, r) => sum + r.population, 0);
      const regionalSumBillions = regionalSumMillions / 1000;
      const globalValue = state.humanPopulationSystem.population;
      const discrepancy = Math.abs(regionalSumBillions - globalValue);

      // Allow tiny floating-point errors but catch real desyncs
      if (discrepancy > 0.001) {
        console.error(
          `⚠️ WARNING: Regional/global population desync detected BEFORE HumanPopulationPhase\n` +
          `  Month: ${state.currentMonth}\n` +
          `  Global value: ${globalValue.toFixed(6)}B\n` +
          `  Regional sum: ${regionalSumBillions.toFixed(6)}B (${regionalSumMillions.toFixed(2)}M)\n` +
          `  Discrepancy: ${discrepancy.toFixed(6)}B\n` +
          `  A previous phase likely modified global population without updating regions.\n` +
          `  This will cause silent data loss when aggregation overwrites the global value.`
        );

        // Log which phase might be responsible (if context available)
        console.error(`  Previous phases this step: coordination, deployment, etc.`);
        console.error(`  Aggregation will now OVERWRITE global value with regional sum.`);
      }
    }

    // === PHASE 5: REGIONAL POPULATION DYNAMICS ===
    // Update regional populations with differential growth/decline rates
    updateRegionalPopulations(state);

    // === 🚀 PERFORMANCE: MERGED AGGREGATION (Nov 10, 2025) ===
    // Single-pass aggregation: 4 loops → 1 loop (15.6ms → 4ms)
    // Aggregates: population, demographics, carrying capacity, deaths
    aggregateAllRegionalData(state);

    // ASSERTION (Nov 10, 2025): Validate all aggregation outputs
    assertFinite(state.humanPopulationSystem.population, {
      location: 'HumanPopulationPhase.execute',
      valueName: 'population after aggregateAllRegionalData',
      month: state.currentMonth
    });

    // === PHASE 5: CONSISTENCY ASSERTION (Oct 26, 2025) ===
    // Verify no drift between regional and global values
    // DEBUG (Oct 28, 2025): Log values before assertion
    if (state.currentMonth === 0 && state.humanPopulationSystem.regionalPopulations) {
      const regionalSum = state.humanPopulationSystem.regionalPopulations.reduce((sum, r) => sum + r.carryingCapacity, 0);
      console.log(`\n🔍 Before assertRegionalConsistency (Month ${state.currentMonth}):`);
      console.log(`   Regional sum: ${regionalSum.toFixed(1)}M`);
      console.log(`   Global value: ${state.humanPopulationSystem.carryingCapacity.toFixed(3)}B`);
    }
    assertRegionalConsistency(state);

    // === LEGACY: GLOBAL POPULATION UPDATE ===
    // Still run global update for systems that don't use regional data yet
    updateHumanPopulation(state, rng);

    // Apply population feedback to QoL
    applyPopulationEffectsToQoL(state);

    // Update outcome metrics based on population status
    updateOutcomeMetricsWithPopulation(state);

    return { events: [] };
  }
}
