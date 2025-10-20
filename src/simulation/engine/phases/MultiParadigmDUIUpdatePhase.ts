/**
 * Multi-Paradigm DUI Update Phase
 *
 * Updates 4 paradigm scores based on simulation state each month.
 * Maps democracy, QoL, environment, and social cohesion to paradigm scores.
 *
 * **Phase Order:** 34 (after QoL updates, before outcome detection)
 *
 * @module simulation/engine/phases/MultiParadigmDUIUpdatePhase
 */

import type { GameState, RNGFunction } from '@/types/game';
import type { PhaseResult, PhaseContext } from '../PhaseOrchestrator';
import { calculateDivergence } from '@/data/aggregators/divergenceCalculator';
import { calculateCorrelations } from '@/data/aggregators/correlationTracker';
import { classifyOutcome } from '@/data/aggregators/outcomeClassifier';

/**
 * Multi-Paradigm DUI Update Phase
 *
 * Updates paradigm scores based on simulation state.
 */
export const MultiParadigmDUIUpdatePhase = {
  id: 'multi_paradigm_dui_update',
  name: 'Multi-Paradigm DUI Update',
  order: 34,

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    // Calculate new paradigm scores from simulation state
    const scores = calculateParadigmScoresFromState(state);

    // Update paradigm scores
    state.multiParadigmDUI.paradigmScores.western.value = scores.western;
    state.multiParadigmDUI.paradigmScores.development.value = scores.development;
    state.multiParadigmDUI.paradigmScores.ecological.value = scores.ecological;
    state.multiParadigmDUI.diagnosticLenses.indigenous.value = scores.indigenous;

    // Add to history
    state.multiParadigmDUI.history.push({
      month: state.currentMonth,
      western: scores.western,
      development: scores.development,
      ecological: scores.ecological,
      indigenous: scores.indigenous,
    });

    // Calculate divergence (with trend detection if enough history)
    state.multiParadigmDUI.divergence = calculateDivergence(scores, state.multiParadigmDUI.history);

    // Calculate outcome classification
    state.multiParadigmDUI.outcome = classifyOutcome(scores);

    // Update legacy DUI (derive from Development paradigm)
    state.globalMetrics.dystopiaUtopiaIndex = scores.development;

    return {
      success: true,
      effects: [`Multi-Paradigm DUI updated: W=${scores.western.toFixed(1)} D=${scores.development.toFixed(1)} E=${scores.ecological.toFixed(1)} I=${scores.indigenous.toFixed(1)}`],
    };
  },
};

/**
 * Calculate paradigm scores from simulation state
 *
 * Maps simulation state (democracy, QoL, environment, social) to 4 paradigm scores.
 *
 * @param state - Current game state
 * @returns 4 paradigm scores (0-100)
 */
function calculateParadigmScoresFromState(state: GameState): {
  western: number;
  development: number;
  ecological: number;
  indigenous: number;
} {
  const western = calculateWesternLiberal(state);
  const development = calculateDevelopment(state);
  const ecological = calculateEcological(state);
  const indigenous = calculateIndigenous(state);

  return { western, development, ecological, indigenous };
}

/**
 * Calculate Western Liberal paradigm score from simulation state
 *
 * Indicators:
 * - Electoral Democracy (40%): state.government.democracy.electoralDemocracyIndex
 * - Civil Liberties (30%): state.socialCohesion.civilLiberties
 * - Rule of Law (20%): state.government.democracy.ruleOfLaw
 * - Economic Freedom (10%): 100 - state.government.economicPolicy.marketRegulation
 *
 * @param state - Current game state
 * @returns Western Liberal score (0-100)
 */
function calculateWesternLiberal(state: GameState): number {
  const MIN_FLOOR = 0.1;

  // Electoral Democracy (0-1 → 0-100)
  const electoralDemocracy = (state.government.democracy?.electoralDemocracyIndex ?? 0.5) * 100;

  // Civil Liberties (0-100)
  const civilLiberties = state.socialCohesion?.civilLiberties ?? 50;

  // Rule of Law (0-100)
  const ruleOfLaw = state.government.democracy?.ruleOfLaw ?? 50;

  // Economic Freedom (inverted market regulation)
  const economicFreedom = 100 - (state.government.economicPolicy?.marketRegulation ?? 50);

  // Geometric mean (non-compensatory)
  const indicators = [electoralDemocracy, civilLiberties, ruleOfLaw, economicFreedom];
  const product = indicators.reduce((acc, val) => {
    const floored = Math.max(val, MIN_FLOOR);
    return acc * (floored / 100);
  }, 1);

  return Math.pow(product, 1 / indicators.length) * 100;
}

/**
 * Calculate Development paradigm score from simulation state
 *
 * Indicators:
 * - Quality of Life (50%): state.globalMetrics.qualityOfLife
 * - Survival Tier (30%): (survivalTier / 5) * 100
 * - Life Expectancy (20%): ((lifeExpectancy - 20) / (85 - 20)) * 100
 *
 * @param state - Current game state
 * @returns Development score (0-100)
 */
function calculateDevelopment(state: GameState): number {
  const MIN_FLOOR = 0.1;

  // Quality of Life (0-100, primary driver)
  const qol = state.globalMetrics.qualityOfLife ?? 50;

  // Survival Tier (0-5 → 0-100)
  const survivalTier = ((state.globalMetrics.survivalTier ?? 2.5) / 5) * 100;

  // Life Expectancy (20-85 years → 0-100)
  const lifeExpectancy = state.globalMetrics.lifeExpectancy ?? 60;
  const lifeExpectancyScore = Math.max(0, Math.min(100, ((lifeExpectancy - 20) / (85 - 20)) * 100));

  // Geometric mean
  const indicators = [qol, survivalTier, lifeExpectancyScore];
  const product = indicators.reduce((acc, val) => {
    const floored = Math.max(val, MIN_FLOOR);
    return acc * (floored / 100);
  }, 1);

  return Math.pow(product, 1 / indicators.length) * 100;
}

/**
 * Calculate Ecological paradigm score from simulation state
 *
 * Indicators:
 * - Planetary Boundaries (50%): (safe boundaries / 9) * 100
 * - Resource Depletion (25%): 100 - resourceDepletion
 * - Climate Stability (15%): 100 - (temperatureAnomaly / 2.0) * 100
 * - Pollution (10%): 100 - pollutionLevel
 *
 * @param state - Current game state
 * @returns Ecological score (0-100)
 */
function calculateEcological(state: GameState): number {
  const MIN_FLOOR = 0.1;

  // Planetary Boundaries (count safe boundaries)
  const boundaries = state.planetaryBoundariesSystem?.boundaries;
  let safeBoundaries = 0;
  if (boundaries) {
    if (!boundaries.climateChange?.breached) safeBoundaries++;
    if (!boundaries.biosphereIntegrity?.breached) safeBoundaries++;
    if (!boundaries.landSystemChange?.breached) safeBoundaries++;
    if (!boundaries.freshwaterUse?.breached) safeBoundaries++;
    if (!boundaries.biochemicalFlows?.nitrogenBreached) safeBoundaries++;
    if (!boundaries.biochemicalFlows?.phosphorusBreached) safeBoundaries++;
    if (!boundaries.oceanAcidification?.breached) safeBoundaries++;
    if (!boundaries.atmosphericAerosol?.breached) safeBoundaries++;
    if (!boundaries.novelEntities?.breached) safeBoundaries++;
  } else {
    safeBoundaries = 3; // Default: assume 3/9 safe (current global state)
  }
  const boundariesScore = (safeBoundaries / 9) * 100;

  // Resource Depletion (0-100, inverted)
  const resourceDepletion = state.environmentalAccumulation?.resourceDepletion ?? 30;
  const resourceScore = 100 - resourceDepletion;

  // Climate Stability (temperature anomaly, 0-2°C → 100-0)
  const temperatureAnomaly = state.environmental?.climateState?.globalTemperatureAnomaly ?? 1.0;
  const climateScore = Math.max(0, 100 - (temperatureAnomaly / 2.0) * 100);

  // Pollution (0-100, inverted)
  const pollutionLevel = state.environmental?.pollutionLevel ?? 40;
  const pollutionScore = 100 - pollutionLevel;

  // Geometric mean
  const indicators = [boundariesScore, resourceScore, climateScore, pollutionScore];
  const product = indicators.reduce((acc, val) => {
    const floored = Math.max(val, MIN_FLOOR);
    return acc * (floored / 100);
  }, 1);

  return Math.pow(product, 1 / indicators.length) * 100;
}

/**
 * Calculate Indigenous paradigm score from simulation state
 *
 * Indicators:
 * - Social Trust (40%): state.socialCohesion.trust
 * - Community Bonds (40%): state.socialCohesion.communityBonds
 * - Meaning Crisis (20%): 100 - meaningCrisis (inverted)
 *
 * @param state - Current game state
 * @returns Indigenous score (0-100)
 */
function calculateIndigenous(state: GameState): number {
  const MIN_FLOOR = 0.1;

  // Social Trust (0-100)
  const socialTrust = state.socialCohesion?.trust ?? 50;

  // Community Bonds (0-100)
  const communityBonds = state.socialCohesion?.communityBonds ?? 50;

  // Meaning Crisis (0-100, inverted)
  const meaningCrisis = state.socialAccumulation?.meaningCrisis ?? 50;
  const meaningScore = 100 - meaningCrisis;

  // Geometric mean
  const indicators = [socialTrust, communityBonds, meaningScore];
  const product = indicators.reduce((acc, val) => {
    const floored = Math.max(val, MIN_FLOOR);
    return acc * (floored / 100);
  }, 1);

  return Math.pow(product, 1 / indicators.length) * 100;
}
