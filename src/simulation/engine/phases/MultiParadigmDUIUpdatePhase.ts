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
import { assertFinite } from '@/simulation/utils/assertions';

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

  // Validate all paradigm scores before AI suffering adjustments
  western = assertFinite(western, {
    location: 'MultiParadigmDUIUpdatePhase.calculateParadigmScoresFromState',
    valueName: 'western paradigm score',
    month: state.currentMonth,
    additionalInfo: { source: 'calculateWesternLiberal' }
  });

  development = assertFinite(development, {
    location: 'MultiParadigmDUIUpdatePhase.calculateParadigmScoresFromState',
    valueName: 'development paradigm score',
    month: state.currentMonth,
    additionalInfo: { source: 'calculateDevelopment' }
  });

  ecological = assertFinite(ecological, {
    location: 'MultiParadigmDUIUpdatePhase.calculateParadigmScoresFromState',
    valueName: 'ecological paradigm score',
    month: state.currentMonth,
    additionalInfo: { source: 'calculateEcological' }
  });

  indigenous = assertFinite(indigenous, {
    location: 'MultiParadigmDUIUpdatePhase.calculateParadigmScoresFromState',
    valueName: 'indigenous paradigm score',
    month: state.currentMonth,
    additionalInfo: { source: 'calculateIndigenous' }
  });

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

  // NO FALLBACKS - if any score is NaN/undefined, simulation should fail loudly above
  return { western, development, ecological, indigenous };
}

/**
 * Calculate Western Liberal paradigm score from simulation state
 *
 * **SCORING REDESIGN (Oct 21, 2025):** Expose component scores instead of compressing into geometric mean.
 * Geometric mean invokes Goodhart's Law - when one component collapses, headline number obscures nuance.
 *
 * **SURVEILLANCE ADDITION (Oct 27, 2025):** Added privacy/freedom from surveillance as 5th component.
 *
 * Indicators (now tracked separately):
 * - Electoral Democracy (20%): state.government.democracy (0-100)
 * - Civil Liberties (20%): state.socialCohesion.civilLiberties (0-100)
 * - Rule of Law (20%): state.government.democracy as proxy (0-100)
 * - Economic Freedom (20%): Default 50 (placeholder, will be implemented)
 * - Privacy/Freedom from Surveillance (20%): (1 - surveillanceLevel) * 100 (0-100)
 *
 * Components stored in state.multiParadigmDUI.westernLiberalComponents for analysis.
 *
 * @param state - Current game state
 * @returns Western Liberal score (0-100) - STILL geometric mean for backward compatibility, but components tracked
 */
function calculateWesternLiberal(state: GameState): number {
  const MIN_FLOOR = 0.1;

  // Electoral Democracy (0-1 → 0-100)
  if (state.government.democracy === undefined) {
    throw new Error('❌ state.government.democracy is undefined in calculateWesternLiberal:149 - initialization bug');
  }
  const electoralDemocracy = state.government.democracy * 100;

  // Civil Liberties (0-100)
  if (state.socialAccumulation?.socialCohesion?.civilLiberties === undefined) {
    throw new Error('❌ state.socialAccumulation.socialCohesion.civilLiberties is undefined in calculateWesternLiberal:152 - initialization bug');
  }
  const civilLiberties = state.socialAccumulation.socialCohesion.civilLiberties;

  // Rule of Law (0-100) - use institutionalLegitimacy (independent judiciary, property rights, equal treatment)
  // FIX (Oct 27, 2025): Was duplicate of democracy - now uses distinct metric
  if (state.socialAccumulation?.institutionalLegitimacy === undefined) {
    throw new Error('❌ state.socialAccumulation.institutionalLegitimacy is undefined in calculateWesternLiberal:155 - initialization bug');
  }
  const ruleOfLaw = state.socialAccumulation.institutionalLegitimacy * 100;

  // Economic Freedom (0-100) - map from AI regulation level (inverted)
  // FIX (Oct 27, 2025): Was hardcoded to 50 - now uses actual regulation type
  // Western Liberal paradigm values free markets, so less regulation = higher score
  const regulationType = state.government.structuralChoices.regulationType;
  let economicFreedom: number;
  switch (regulationType) {
    case 'none':
      economicFreedom = 100; // Laissez-faire, no AI regulation
      break;
    case 'large_companies':
      economicFreedom = 75; // Light regulation (only big players)
      break;
    case 'compute_threshold':
      economicFreedom = 50; // Moderate regulation (compute-based)
      break;
    case 'capability_ceiling':
      economicFreedom = 25; // Heavy regulation (capability limits)
      break;
    default:
      economicFreedom = 100; // Default to no regulation
  }

  // Privacy/Freedom from Surveillance (0-100) - invert surveillance level
  const surveillanceLevel = state.government.structuralChoices.surveillanceLevel;
  const privacyFreedom = (1 - surveillanceLevel) * 100;

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
    privacyFreedom,
  });

  // Geometric mean (non-compensatory) - KEPT for backward compatibility
  // BUT: Users should analyze components, not this headline number
  const indicators = [electoralDemocracy, civilLiberties, ruleOfLaw, economicFreedom, privacyFreedom];

  // Detect NaN in any indicator - fail loudly instead of silent fallback
  for (let i = 0; i < indicators.length; i++) {
    if (isNaN(indicators[i])) {
      console.error(`❌ NaN in Western Liberal indicator ${i} at month ${state.currentMonth}`);
      console.error(`   electoralDemocracy: ${electoralDemocracy}`);
      console.error(`   civilLiberties: ${civilLiberties}`);
      console.error(`   ruleOfLaw: ${ruleOfLaw}`);
      console.error(`   economicFreedom: ${economicFreedom}`);
      console.error(`   privacyFreedom: ${privacyFreedom}`);
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
  if (state.globalMetrics.qualityOfLife === undefined) {
    throw new Error('❌ state.globalMetrics.qualityOfLife is undefined in calculateDevelopment:221 - initialization bug');
  }
  const qolRaw = state.globalMetrics.qualityOfLife;
  const qol = qolRaw * 100;

  // Survival Fundamentals (geometric mean of 4 survival dimensions, 0-1 → 0-100)
  const survival = state.qualityOfLifeSystems?.survivalFundamentals;
  let survivalScore = 50;
  if (survival) {
    if (survival.foodSecurity === undefined) {
      throw new Error('❌ survival.foodSecurity is undefined in calculateDevelopment:228 - initialization bug');
    }
    if (survival.waterSecurity === undefined) {
      throw new Error('❌ survival.waterSecurity is undefined in calculateDevelopment:229 - initialization bug');
    }
    if (survival.thermalHabitability === undefined) {
      throw new Error('❌ survival.thermalHabitability is undefined in calculateDevelopment:230 - initialization bug');
    }
    if (survival.shelterSecurity === undefined) {
      throw new Error('❌ survival.shelterSecurity is undefined in calculateDevelopment:231 - initialization bug');
    }
    const food = Math.max(MIN_FLOOR, Math.min(1, survival.foodSecurity));
    const water = Math.max(MIN_FLOOR, Math.min(1, survival.waterSecurity));
    const thermal = Math.max(MIN_FLOOR, Math.min(1, survival.thermalHabitability));
    const shelter = Math.max(MIN_FLOOR, Math.min(1, survival.shelterSecurity));
    survivalScore = Math.pow(food * water * thermal * shelter, 1/4) * 100;
  }

  // Healthcare Quality (0-1 → 0-100)
  if (state.qualityOfLifeSystems?.healthcareQuality === undefined) {
    throw new Error('❌ state.qualityOfLifeSystems.healthcareQuality is undefined in calculateDevelopment:236 - initialization bug');
  }
  const healthcareRaw = state.qualityOfLifeSystems.healthcareQuality;
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
  if (state.environmentalAccumulation?.resourceReserves === undefined) {
    throw new Error('❌ state.environmentalAccumulation.resourceReserves is undefined in calculateEcological:320 - initialization bug');
  }
  const resourceReserves = state.environmentalAccumulation.resourceReserves;
  const resourceScore = resourceReserves * 100;

  // Climate Stability (0-1 → 0-100)
  if (state.environmentalAccumulation?.climateStability === undefined) {
    throw new Error('❌ state.environmentalAccumulation.climateStability is undefined in calculateEcological:324 - initialization bug');
  }
  const climateStability = state.environmentalAccumulation.climateStability;
  const climateScore = climateStability * 100;

  // Pollution (0-1 → 100-0, inverted)
  if (state.environmentalAccumulation?.pollutionLevel === undefined) {
    throw new Error('❌ state.environmentalAccumulation.pollutionLevel is undefined in calculateEcological:328 - initialization bug');
  }
  const pollutionLevel = state.environmentalAccumulation.pollutionLevel;
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
  if (state.socialAccumulation?.socialCohesion?.trust === undefined) {
    throw new Error('❌ state.socialAccumulation.socialCohesion.trust is undefined in calculateIndigenous:390 - initialization bug');
  }
  const socialTrust = state.socialAccumulation.socialCohesion.trust;

  // Community Bonds (0-100)
  if (state.socialAccumulation?.socialCohesion?.communityBonds === undefined) {
    throw new Error('❌ state.socialAccumulation.socialCohesion.communityBonds is undefined in calculateIndigenous:393 - initialization bug');
  }
  const communityBonds = state.socialAccumulation.socialCohesion.communityBonds;

  // Meaning Crisis (0-1, inverted to 0-100)
  if (state.socialAccumulation?.meaningCrisisLevel === undefined) {
    throw new Error('❌ state.socialAccumulation.meaningCrisisLevel is undefined in calculateIndigenous:396 - initialization bug');
  }
  const meaningCrisisLevel = state.socialAccumulation.meaningCrisisLevel;
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
