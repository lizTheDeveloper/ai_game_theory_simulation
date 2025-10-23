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

  execute(state: GameState, _rng: RNGFunction): PhaseResult {
    // CRITICAL FIX: Only update population at end of month (day 30)
    // Population calculations use MONTHLY rates (netGrowthRate / 12, overshoot * 0.05 per month)
    // but were executing DAILY (30x per month), causing exponential population loss:
    // - Monthly death rate 0.5% applied 30 times = (1-0.005)^30 ≈ 0.86 = 14% loss per month
    // - Result: 8.0B → 6.88B in one month (640M-1.1B people lost)
    if (state.currentDay !== 30) {
      return { events: [] }; // Skip population updates on non-month-end days
    }

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
