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

import { SimulationPhase, PhaseResult, RNGFunction } from '../PhaseOrchestrator';
import { GameState } from '@/types/game';

export class HumanPopulationPhase implements SimulationPhase {
  readonly id = 'human_population';
  readonly name = 'Human Population Dynamics';
  readonly order = 20.5;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    const {
      updateHumanPopulation,
      applyPopulationEffectsToQoL,
      updateOutcomeMetricsWithPopulation
    } = require('../../populationDynamics');

    const {
      updateRegionalPopulations
    } = require('../../regionalPopulations');

    // === PHASE 5: REGIONAL POPULATION DYNAMICS ===
    // Update regional populations with differential growth/decline rates
    // This aggregates to global population
    updateRegionalPopulations(state);

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
