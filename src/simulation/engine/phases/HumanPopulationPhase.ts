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

export class HumanPopulationPhase implements SimulationPhase {
  readonly id = 'human_population';
  readonly name = 'Human Population Dynamics';
  readonly order = 20.5;

  execute(state: GameState, _rng: RNGFunction): PhaseResult {
    // Population updates run once per simulation step (once per month)
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
      aggregateGlobalPopulation,
      aggregateGlobalDemographics,
      aggregateGlobalCarryingCapacity,
      aggregateGlobalDeaths
    } = require('../../populationDynamics');

    const {
      assertRegionalConsistency
    } = require('../../utils/assertions');

    // === PHASE 5: REGIONAL POPULATION DYNAMICS ===
    // Update regional populations with differential growth/decline rates
    updateRegionalPopulations(state);

    // === PHASE 2: POPULATION AGGREGATION (Oct 26, 2025) ===
    // Bottom-up aggregation: Global population = sum of regional populations
    aggregateGlobalPopulation(state);

    // === PHASE 2: DEMOGRAPHICS AGGREGATION (Oct 26, 2025) ===
    // Bottom-up aggregation: Global demographics = population-weighted average of regional
    aggregateGlobalDemographics(state);

    // === PHASE 3: CARRYING CAPACITY AGGREGATION (Oct 26, 2025) ===
    // Bottom-up aggregation: Global capacity = sum of regional capacities
    aggregateGlobalCarryingCapacity(state);

    // === PHASE 4: DEATH TRACKING AGGREGATION (Oct 26, 2025) ===
    // Bottom-up aggregation: Global deaths = sum of regional deaths
    aggregateGlobalDeaths(state);

    // === PHASE 5: CONSISTENCY ASSERTION (Oct 26, 2025) ===
    // Verify no drift between regional and global values
    // DEBUG (Oct 28, 2025): Log values before assertion
    if (state.currentMonth === 0) {
      const regionalSum = state.humanPopulationSystem.regionalPopulations.reduce((sum, r) => sum + r.carryingCapacity, 0);
      console.log(`\n🔍 Before assertRegionalConsistency (Month ${state.currentMonth}):`);
      console.log(`   Regional sum: ${regionalSum.toFixed(1)}M`);
      console.log(`   Global value: ${state.humanPopulationSystem.carryingCapacity.toFixed(3)}B`);
    }
    assertRegionalConsistency(state);

    // === LEGACY: GLOBAL POPULATION UPDATE ===
    // Still run global update for systems that don't use regional data yet
    updateHumanPopulation(state);

    // Apply population feedback to QoL
    applyPopulationEffectsToQoL(state);

    // Update outcome metrics based on population status
    updateOutcomeMetricsWithPopulation(state);

    return { events: [] };
  }
}
