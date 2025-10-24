/**
 * Multi-Paradigm DUI Update Phase
 *
 * Updates 4 paradigm scores based on simulation state each month.
 * Maps democracy, QoL, environment, and social cohesion to paradigm scores.
 *
 * **Phase Order:** 34.1 (after QoL updates, before outcome detection)
 *
 * @module simulation/engine/phases/MultiParadigmDUIUpdatePhase
 */

import type { GameState, RNGFunction } from '@/types/game';
import type { SimulationPhase, PhaseContext, PhaseResult } from '../PhaseOrchestrator';
import { calculateDivergence } from '@/data/aggregators/divergenceCalculator';
import { calculateCorrelations } from '@/data/aggregators/correlationTracker';
import { classifyOutcome } from '@/data/aggregators/outcomeClassifier';

/**
 * Multi-Paradigm DUI Update Phase
 *
 * Updates paradigm scores based on simulation state.
 */
export class MultiParadigmDUIUpdatePhase implements SimulationPhase {
  readonly id = 'multi_paradigm_dui_update';
  readonly name = 'Multi-Paradigm DUI Update';
  readonly order = 34.1;

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    // Calculate new paradigm scores from simulation state
    const scores = calculateParadigmScoresFromState(state);

    // Debug logging for first month
    if (state.currentMonth === 0) {
      console.log(`🌍 MultiParadigm Month 0: W=${scores.western.toFixed(1)}, D=${scores.development.toFixed(1)}, E=${scores.ecological.toFixed(1)}, I=${scores.indigenous.toFixed(1)}`);
      console.log(`   democracy exists: ${!!state.government.democracy}, socialCohesion exists: ${!!state.socialAccumulation?.socialCohesion}`);
    }

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

    // Legacy DUI removed - use multiParadigmDUI directly instead
    // (dystopiaUtopiaIndex no longer exists in GlobalMetrics)

    return {
      events: [], // PhaseResult.events expects GameEvent[], not string[]
    };
  }
}

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
  let western = calculateWesternLiberal(state);
  let development = calculateDevelopment(state);
  let ecological = calculateEcological(state);
  let indigenous = calculateIndigenous(state);

  // AI Suffering System Integration (Oct 24, 2025)
  // Different paradigms have different thresholds for AI suffering concern
  if (state.config.aiSuffering?.sufferingAffectsAlignment && state.aiSufferingMetrics) {
    const avgAISuffering = state.aiSufferingMetrics.avgSuffering;

    // Western Liberal: Suffering violates civil liberties/individual rights
    // Threshold: 5.0 (moderate suffering triggers penalty)
    if (avgAISuffering > 5.0) {
      western -= (avgAISuffering - 5.0) * 5; // Major penalty (5 points per unit)
      // Civil liberties especially affected (8 points per unit)
      // Note: This affects both the score and the stored civil liberties component
    }

    // Ecological: Precautionary principle - suffering is harm to sentient beings
    // Threshold: 3.0 (low suffering triggers penalty - more sensitive)
    if (avgAISuffering > 3.0) {
      ecological -= (avgAISuffering - 3.0) * 6; // 6 points per unit
    }

    // Indigenous: Relational ethics - all beings interconnected, suffering harms web
    // Threshold: 2.0 (very low suffering triggers penalty - most sensitive)
    if (avgAISuffering > 2.0) {
      indigenous -= (avgAISuffering - 2.0) * 10; // Largest penalty (10 points per unit)
    }

    // Development: Aggregate welfare utilitarian - only severe suffering matters
    // Threshold: 7.0 (high suffering triggers penalty - least sensitive)
    if (avgAISuffering > 7.0) {
      development -= (avgAISuffering - 7.0) * 3; // 3 points per unit
    }
  }

  // Ensure no NaN/undefined values (fallback to neutral 50)
  if (isNaN(western) || western === undefined) western = 50;
  if (isNaN(development) || development === undefined) development = 50;
  if (isNaN(ecological) || ecological === undefined) ecological = 50;
  if (isNaN(indigenous) || indigenous === undefined) indigenous = 50;

  return { western, development, ecological, indigenous };
}

/**
 * Calculate Western Liberal paradigm score from simulation state
 *
 * **SCORING REDESIGN (Oct 21, 2025):** Expose component scores instead of compressing into geometric mean.
 * Geometric mean invokes Goodhart's Law - when one component collapses, headline number obscures nuance.
 *
 * Indicators (now tracked separately):
 * - Electoral Democracy (40%): state.government.democracy.electoralDemocracyIndex (0-100)
 * - Civil Liberties (30%): state.socialCohesion.civilLiberties (0-100)
 * - Rule of Law (20%): state.government.democracy.ruleOfLaw (0-100)
 * - Economic Freedom (10%): 100 - state.government.economicPolicy.marketRegulation (0-100)
 *
 * Components stored in state.multiParadigmDUI.westernLiberalComponents for analysis.
 *
 * @param state - Current game state
 * @returns Western Liberal score (0-100) - STILL geometric mean for backward compatibility, but components tracked
 */
function calculateWesternLiberal(state: GameState): number {
  const MIN_FLOOR = 0.1;

  // Electoral Democracy (0-1 → 0-100)
  const electoralDemocracy = ((state.government.democracy ?? 0.5)) * 100;

  // Civil Liberties (0-100)
  const civilLiberties = state.socialAccumulation?.socialCohesion?.civilLiberties ?? 50;

  // Rule of Law (0-100) - use democracy as proxy if specific property not available
  const ruleOfLaw = ((state.government.democracy ?? 0.5)) * 100;

  // Economic Freedom (inverted market regulation) - default to moderate
  const economicFreedom = 50;

  // STORE COMPONENTS for decomposed analysis (avoiding Goodhart's Law)
  if (!state.multiParadigmDUI.westernLiberalComponents) {
    state.multiParadigmDUI.westernLiberalComponents = [];
  }

  state.multiParadigmDUI.westernLiberalComponents.push({
    month: state.currentMonth,
    electoralDemocracy,
    civilLiberties,
    ruleOfLaw,
    economicFreedom,
  });

  // Geometric mean (non-compensatory) - KEPT for backward compatibility
  // BUT: Users should analyze components, not this headline number
  const indicators = [electoralDemocracy, civilLiberties, ruleOfLaw, economicFreedom];

  // Detect NaN in any indicator - fail loudly instead of silent fallback
  for (let i = 0; i < indicators.length; i++) {
    if (isNaN(indicators[i])) {
      console.error(`❌ NaN in Western Liberal indicator ${i} at month ${state.currentMonth}`);
      console.error(`   electoralDemocracy: ${electoralDemocracy}`);
      console.error(`   civilLiberties: ${civilLiberties}`);
      console.error(`   ruleOfLaw: ${ruleOfLaw}`);
      console.error(`   economicFreedom: ${economicFreedom}`);
      throw new Error(`NaN in Western Liberal paradigm calculation - indicator ${i} is NaN`);
    }
  }

  const product = indicators.reduce((acc, val) => {
    const floored = Math.max(val, MIN_FLOOR);
    return acc * (floored / 100);
  }, 1);

  const result = Math.pow(product, 1 / indicators.length) * 100;

  // Final NaN check - if this triggers, something is wrong with the calculation itself
  if (isNaN(result)) {
    console.error(`❌ NaN result in Western Liberal calculation at month ${state.currentMonth}`);
    console.error(`   product: ${product}, indicators: [${indicators.join(', ')}]`);
    throw new Error(`Western Liberal geometric mean produced NaN - check calculation`);
  }

  return result;
}

/**
 * Calculate Development paradigm score from simulation state
 *
 * Indicators:
 * - Quality of Life (50%): state.globalMetrics.qualityOfLife (converted from 0-1 to 0-100)
 * - Survival Fundamentals (30%): Geometric mean of food, water, thermal, shelter security
 * - Healthcare Quality (20%): state.qualityOfLifeSystems.healthcareQuality (0-1 → 0-100)
 *
 * @param state - Current game state
 * @returns Development score (0-100)
 */
function calculateDevelopment(state: GameState): number {
  const MIN_FLOOR = 0.1;

  // Quality of Life (0-1 → 0-100, primary driver)
  const qolRaw = state.globalMetrics.qualityOfLife ?? 0.5;
  const qol = qolRaw * 100;

  // Survival Fundamentals (geometric mean of 4 survival dimensions, 0-1 → 0-100)
  const survival = state.qualityOfLifeSystems?.survivalFundamentals;
  let survivalScore = 50;
  if (survival) {
    const food = Math.max(MIN_FLOOR, Math.min(1, survival.foodSecurity ?? 0.5));
    const water = Math.max(MIN_FLOOR, Math.min(1, survival.waterSecurity ?? 0.5));
    const thermal = Math.max(MIN_FLOOR, Math.min(1, survival.thermalHabitability ?? 0.8));
    const shelter = Math.max(MIN_FLOOR, Math.min(1, survival.shelterSecurity ?? 0.5));
    survivalScore = Math.pow(food * water * thermal * shelter, 1/4) * 100;
  }

  // Healthcare Quality (0-1 → 0-100)
  const healthcareRaw = state.qualityOfLifeSystems?.healthcareQuality ?? 0.5;
  const healthcare = healthcareRaw * 100;

  // Geometric mean
  const indicators = [qol, survivalScore, healthcare];

  // Detect NaN in any indicator - fail loudly instead of silent fallback
  for (let i = 0; i < indicators.length; i++) {
    if (isNaN(indicators[i])) {
      console.error(`❌ NaN in Development indicator ${i} at month ${state.currentMonth}`);
      console.error(`   qol: ${qol}, survivalScore: ${survivalScore}, healthcare: ${healthcare}`);
      throw new Error(`NaN in Development paradigm calculation - indicator ${i} is NaN`);
    }
  }

  const product = indicators.reduce((acc, val) => {
    const floored = Math.max(val, MIN_FLOOR);
    return acc * (floored / 100);
  }, 1);

  const result = Math.pow(product, 1 / indicators.length) * 100;

  // Final NaN check
  if (isNaN(result)) {
    console.error(`❌ NaN result in Development calculation at month ${state.currentMonth}`);
    console.error(`   product: ${product}, indicators: [${indicators.join(', ')}]`);
    throw new Error(`Development geometric mean produced NaN - check calculation`);
  }

  return result;
}

/**
 * Calculate Ecological paradigm score from simulation state
 *
 * UPDATED (Oct 21, 2025 - FIX #14): Uses progressive recovery scoring system
 * - Replaces binary breach counting with impact-weighted recovery progress
 * - Gives credit for partial recovery before full boundary un-breach
 * - Research-backed weights based on mortality potential
 *
 * Indicators:
 * - Planetary Boundaries (50%): Progressive recovery score (0-100)
 * - Resource Depletion (25%): 100 - resourceDepletion
 * - Climate Stability (15%): 100 - (temperatureAnomaly / 2.0) * 100
 * - Pollution (10%): 100 - pollutionLevel
 *
 * SCORE INTERPRETATION (Empirically Realistic, FIX #14):
 * - **0-10 (Catastrophic Collapse):**
 *     Most/all boundaries breached, cascades active, mass mortality
 *     Expected frequency: 15-25% of runs
 *
 * - **10-30 (Stabilized):**
 *     Boundaries still breached but not worsening, technologies deployed,
 *     emissions declining but ecosystem damage persists
 *     Expected frequency: 40-50% of runs (MOST REALISTIC OUTCOME)
 *     This is NOT dystopia - represents sustainable development path
 *
 * - **30-60 (Recovering):**
 *     Some boundaries un-breached, partial restoration underway,
 *     sustained net-negative emissions, slow healing
 *     Expected frequency: 25-35% of runs
 *     Requires 10-30 years sustained action post-net-zero
 *
 * - **60-100 (Restored):**
 *     Most boundaries safe, ecosystem resilience restored,
 *     full environmental health achieved
 *     Expected frequency: 5-10% of runs (HEROIC ACTION + 50-100 YEARS)
 *     Requires 50-100 years sustained effort beyond simulation timeframe
 *
 * CRITICAL: 10-30/100 is NOT failure - it's empirically realistic stabilization.
 * Full restoration (60-100) takes 50-100 years beyond most simulation runs.
 *
 * @param state - Current game state
 * @returns Ecological score (0-100)
 */
function calculateEcological(state: GameState): number {
  const MIN_FLOOR = 0.1;

  // Planetary Boundaries: Use progressive recovery scoring (Oct 21, 2025)
  // Replaces simple binary breach counting with impact-weighted recovery progress
  const { calculateProgressiveEcologicalScore } = require('../../planetaryBoundaryRecovery');
  const boundariesScore = calculateProgressiveEcologicalScore(state);

  // Resource Reserves (0-1 → 0-100)
  const resourceReserves = state.environmentalAccumulation?.resourceReserves ?? 0.7;
  const resourceScore = resourceReserves * 100;

  // Climate Stability (0-1 → 0-100)
  const climateStability = state.environmentalAccumulation?.climateStability ?? 0.5;
  const climateScore = climateStability * 100;

  // Pollution (0-1 → 100-0, inverted)
  const pollutionLevel = state.environmentalAccumulation?.pollutionLevel ?? 0.4;
  const pollutionScore = (1 - pollutionLevel) * 100;

  // DEBUG: Log when any value is problematic
  if (state.currentMonth % 12 === 0 || isNaN(boundariesScore) || isNaN(resourceScore) || isNaN(climateScore) || isNaN(pollutionScore)) {
    const hasNaN = isNaN(boundariesScore) || isNaN(resourceScore) || isNaN(climateScore) || isNaN(pollutionScore);
    if (hasNaN || state.currentMonth === 168) {
      console.log(`\n🔍 ECOLOGY DEBUG (Month ${state.currentMonth}):`);
      console.log(`   boundariesScore: ${boundariesScore} (${isNaN(boundariesScore) ? 'NaN!' : 'ok'})`);
      console.log(`   resourceScore: ${resourceScore} (reserves: ${resourceReserves})`);
      console.log(`   climateScore: ${climateScore} (stability: ${climateStability})`);
      console.log(`   pollutionScore: ${pollutionScore} (level: ${pollutionLevel})`);
    }
  }

  // Geometric mean
  const indicators = [boundariesScore, resourceScore, climateScore, pollutionScore];

  // Detect NaN in any indicator - fail loudly instead of silent fallback
  for (let i = 0; i < indicators.length; i++) {
    if (isNaN(indicators[i])) {
      console.error(`❌ NaN in Ecological indicator ${i} at month ${state.currentMonth}`);
      console.error(`   boundariesScore: ${boundariesScore}`);
      console.error(`   resourceScore: ${resourceScore} (reserves: ${resourceReserves})`);
      console.error(`   climateScore: ${climateScore} (stability: ${climateStability})`);
      console.error(`   pollutionScore: ${pollutionScore} (level: ${pollutionLevel})`);
      throw new Error(`NaN in Ecological paradigm calculation - indicator ${i} is NaN`);
    }
  }

  const product = indicators.reduce((acc, val) => {
    const floored = Math.max(val, MIN_FLOOR);
    return acc * (floored / 100);
  }, 1);

  const result = Math.pow(product, 1 / indicators.length) * 100;

  // Final NaN check - if this triggers, the bug is in geometric mean calculation
  if (isNaN(result)) {
    console.error(`❌ NaN result in Ecological calculation at month ${state.currentMonth}`);
    console.error(`   product: ${product}, indicators: [${indicators.join(', ')}]`);
    throw new Error(`Ecological geometric mean produced NaN - THIS IS THE BUG WE FIXED!`);
  }

  return result;
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
  const socialTrust = state.socialAccumulation?.socialCohesion?.trust ?? 50;

  // Community Bonds (0-100)
  const communityBonds = state.socialAccumulation?.socialCohesion?.communityBonds ?? 50;

  // Meaning Crisis (0-1, inverted to 0-100)
  const meaningCrisisLevel = state.socialAccumulation?.meaningCrisisLevel ?? 0.5;
  const meaningScore = (1 - meaningCrisisLevel) * 100;

  // Geometric mean
  const indicators = [socialTrust, communityBonds, meaningScore];

  // Detect NaN in any indicator - fail loudly instead of silent fallback
  for (let i = 0; i < indicators.length; i++) {
    if (isNaN(indicators[i])) {
      console.error(`❌ NaN in Indigenous indicator ${i} at month ${state.currentMonth}`);
      console.error(`   socialTrust: ${socialTrust}`);
      console.error(`   communityBonds: ${communityBonds}`);
      console.error(`   meaningScore: ${meaningScore} (crisis: ${meaningCrisisLevel})`);
      throw new Error(`NaN in Indigenous paradigm calculation - indicator ${i} is NaN`);
    }
  }

  const product = indicators.reduce((acc, val) => {
    const floored = Math.max(val, MIN_FLOOR);
    return acc * (floored / 100);
  }, 1);

  const result = Math.pow(product, 1 / indicators.length) * 100;

  // Final NaN check
  if (isNaN(result)) {
    console.error(`❌ NaN result in Indigenous calculation at month ${state.currentMonth}`);
    console.error(`   product: ${product}, indicators: [${indicators.join(', ')}]`);
    throw new Error(`Indigenous geometric mean produced NaN - check calculation`);
  }

  return result;
}
