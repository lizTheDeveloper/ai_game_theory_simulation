/**
 * Quality of Life Dimension Calculations
 *
 * Calculates 17 QoL dimensions across 5 tiers:
 * - Tier 0: Survival fundamentals (food, water, shelter, habitability)
 * - Tier 1: Basic needs (material, energy, safety)
 * - Tier 2: Psychological (mental health, meaning, connection, autonomy)
 * - Tier 3: Social (freedom, information, community, culture)
 * - Tier 4: Health (healthcare, longevity, disease burden)
 * - Tier 5: Environmental (ecosystem, climate, pollution)
 *
 * Research basis: Multi-dimensional wellbeing frameworks (Sen, Nussbaum)
 * Each dimension has research-backed thresholds and relationships.
 */

import type { GameState, QualityOfLifeSystems } from '@/types/game';
import { getTrustInAI } from '../socialCohesion';
import { getTechDeploymentSafe } from '../techTree/helpers';
import { assertProbability } from '../utils/assertions';

/**
 * Calculate Tier 0: Survival Fundamentals (NON-FOOD ONLY)
 *
 * FIX (Oct 25, 2025): Food security is now REGIONAL and aggregated separately
 * This function calculates ONLY water, thermal, and shelter security
 *
 * These CANNOT be averaged away - track minimums, not means.
 * Required for Utopia determination.
 */
export function calculateNonFoodSurvivalMetrics(state: GameState): { waterSecurity: number; thermalHabitability: number; shelterSecurity: number } {
  const rawWaterSecurity = calculateWaterSecurity(state);
  const rawThermalHabitability = calculateThermalHabitability(state);
  const rawShelterSecurity = calculateShelterSecurity(state);

  // FIX (Oct 25, 2025): Replaced defensive NaN guards with assertive validation
  // If any calculation produces NaN, that's a BUG that needs fixing, not a value to replace
  const month = state.currentMonth;
  const location = 'calculateNonFoodSurvivalMetrics';

  return {
    waterSecurity: assertProbability(rawWaterSecurity, { location, valueName: 'waterSecurity', month }),
    thermalHabitability: assertProbability(rawThermalHabitability, { location, valueName: 'thermalHabitability', month }),
    shelterSecurity: assertProbability(rawShelterSecurity, { location, valueName: 'shelterSecurity', month }),
  };
}

/**
 * REMOVED (Oct 25, 2025): calculateFoodSecurity() function
 *
 * Food security is now fully REGIONAL with no global recalculation.
 *
 * Regional food security is PERSISTENT STATE:
 * - Initialized to realistic regional values (65-95% by region)
 * - Modified by FoodSecurityDegradationPhase (crisis degradation, vulnerability-weighted)
 * - Modified by tech deployment (vertical farming, etc.)
 * - Global food security = population-weighted average of regional values
 *
 * This architecture preserves regional variation and prevents all regions
 * from converging to the same global baseline.
 */

/**
 * Calculate water security across population
 *
 * Research basis:
 * - WHO: 50L/day minimum for health (drinking, cooking, hygiene)
 * - 20L/day survival minimum
 * - Freshwater depletion, climate change, pollution all threaten water access
 */
export function calculateWaterSecurity(state: GameState): number {
  const resources = state.resourceEconomy;
  const freshwater = state.freshwaterSystem;

  // Base water availability from resource stocks
  let waterSecurity = Math.min(1.0, resources.water.reserves);

  // === FRESHWATER DEPLETION ===
  // Day Zero droughts = acute water crisis
  if (freshwater && freshwater.dayZeroDrought.active) {
    const droughtSeverity = freshwater.dayZeroDrought.severity;
    waterSecurity -= droughtSeverity * 0.4; // Up to 40% reduction
  }

  // Peak Groundwater = declining availability
  if (freshwater && freshwater.peakGroundwaterReached) {
    const depletionRate = freshwater.blueWater.depletionRate;
    waterSecurity -= depletionRate * 0.3;
  }

  // General water stress
  if (freshwater && freshwater.waterStress > 0.40) {
    const stressPenalty = (freshwater.waterStress - 0.40) * 0.5;
    waterSecurity -= stressPenalty;
  }

  // === CLIMATE IMPACT ===
  // Temperature anomalies disrupt water cycle
  // Research: Each 1°C = 7% more atmospheric water vapor = more droughts AND floods
  const tempAnomaly = resources.co2.temperatureAnomaly;
  if (tempAnomaly > 2.0) {
    const climatePenalty = (tempAnomaly - 2.0) * 0.1;
    waterSecurity -= climatePenalty;
  }

  // === POLLUTION ===
  // Novel entities (PFAS, microplastics) contaminate water supplies
  if (state.novelEntitiesSystem && state.novelEntitiesSystem.pfasPrevalence > 0.70) {
    const contamination = (state.novelEntitiesSystem.pfasPrevalence - 0.70) / 0.30; // 0.70-1.0 scale
    waterSecurity -= contamination * 0.15; // Up to 15% reduction
  }

  // === AI ENHANCEMENT ===
  // Desalination, water purification, infrastructure optimization
  const totalAI = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
  const avgAlignment = state.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / Math.max(1, state.aiAgents.length);
  if (totalAI > 1.5 && avgAlignment > 0.7) {
    const aiWater = Math.min(0.25, (totalAI - 1.5) * 0.08);
    waterSecurity += aiWater;
  }

  // === BREAKTHROUGH TECHNOLOGY ===
  // Clean energy enables desalination at scale
  const cleanEnergy = getTechDeploymentSafe(state, 'cleanEnergy');
  waterSecurity += cleanEnergy * 0.15; // Desalination powered by clean energy

  // FIX (Oct 25, 2025): Cap at 1.0, not 1.5 - waterSecurity is a probability [0, 1]
  // Bug found by assertProbability: waterSecurity was reaching 1.096
  return Math.max(0, Math.min(1.0, waterSecurity));
}

/**
 * Calculate thermal habitability of planet
 *
 * Research basis:
 * - Sherwood & Huber (2010): Wet-bulb 35°C = death in ~6 hours
 * - IPCC: +2°C makes Middle East, Pakistan, India marginal
 * - +4°C: Tropical belt dangerous for outdoor work
 */
export function calculateThermalHabitability(state: GameState): number {
  const tempAnomaly = state.resourceEconomy.co2.temperatureAnomaly;

  // Base habitability by temperature anomaly
  let habitableFraction = 1.0;

  if (tempAnomaly < 1.5) {
    // Below Paris Agreement target: Fully habitable with adaptation
    habitableFraction = 1.0;
  } else if (tempAnomaly < 2.5) {
    // 1.5-2.5°C: Regional impacts
    // Middle East, Pakistan, North India become marginal (~15% of land area)
    // Research: Wet-bulb temps regularly exceed 31°C (dangerous for outdoor work)
    habitableFraction = 0.85 - (tempAnomaly - 1.5) * 0.15;
  } else if (tempAnomaly < 4.0) {
    // 2.5-4°C: Tropical belt becomes dangerous
    // ~35% of land area affected (all tropics + sub-tropics)
    // Research: Wet-bulb temps approach 35°C during heat waves
    habitableFraction = 0.70 - (tempAnomaly - 2.5) * 0.20;
  } else if (tempAnomaly < 6.0) {
    // 4-6°C: Civilizational threat
    // 50%+ of land area regularly uninhabitable in summer
    habitableFraction = Math.max(0.20, 0.40 - (tempAnomaly - 4.0) * 0.10);
  } else {
    // >6°C: Hothouse Earth scenario
    // Only polar regions habitable
    habitableFraction = Math.max(0.05, 0.20 - (tempAnomaly - 6.0) * 0.05);
  }

  // === ADAPTATION FACTORS ===
  // AI can help with cooling infrastructure, but can't change physics
  const totalAI = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
  const avgAlignment = state.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / Math.max(1, state.aiAgents.length);

  // Advanced AI can provide adaptation infrastructure
  // But this only helps marginally - can't make 40°C wet-bulb survivable
  if (totalAI > 2.0 && avgAlignment > 0.7 && tempAnomaly < 4.0) {
    const adaptationBonus = Math.min(0.10, (totalAI - 2.0) * 0.03);
    habitableFraction += adaptationBonus;
  }

  // Climate engineering technology (risky but possible)
  const geoengineering = getTechDeploymentSafe(state, 'climateEngineering');
  if (geoengineering > 0.5) {
    // Can offset some warming, but risky and imperfect
    habitableFraction += geoengineering * 0.15;
  }

  return Math.max(0, Math.min(1.0, habitableFraction));
}

/**
 * Calculate shelter security across population
 *
 * Research basis:
 * - Housing as human right (UN)
 * - Climate refugees from uninhabitable regions
 * - Economic access to housing (wealth distribution)
 */
export function calculateShelterSecurity(state: GameState): number {
  const society = state.society;
  const refugees = state.refugeeCrisisSystem;
  const wealth = state.globalMetrics.wealthDistribution;
  const ubiActive = state.government.activeRegulations.some(reg => reg.includes('UBI'));

  // Base shelter security from wealth distribution
  // Research: Housing insecurity correlates with income inequality
  let shelterSecurity = 0.7 + wealth * 0.2;

  // === REFUGEE CRISES ===
  // Displaced populations lose housing
  if (refugees && refugees.activeRefugeeCrises) {
    const totalRefugees = refugees.activeRefugeeCrises
      .reduce((sum, crisis) => sum + crisis.displacedPopulation, 0);
    const refugeeFraction = (totalRefugees / 1000) / state.humanPopulationSystem.population; // millions to billions
    shelterSecurity -= refugeeFraction * 0.5; // Refugees have poor shelter access
  }

  // === CLIMATE DISPLACEMENT ===
  // Temperature anomalies force migration from uninhabitable regions
  const tempAnomaly = state.resourceEconomy.co2.temperatureAnomaly;
  if (tempAnomaly > 2.5) {
    // Significant displacement from tropics
    const displacementPenalty = (tempAnomaly - 2.5) * 0.08;
    shelterSecurity -= displacementPenalty;
  }

  // === ECONOMIC SECURITY ===
  // Unemployment without safety net = housing insecurity
  const unemployment = society.unemploymentLevel;
  const economicStage = state.globalMetrics.economicTransitionStage;

  if (economicStage < 3 && unemployment > 0.4 && !ubiActive) {
    // High unemployment without UBI = homelessness risk
    const economicPenalty = (unemployment - 0.4) * 0.3;
    shelterSecurity -= economicPenalty;
  }

  // === AI ENHANCEMENT ===
  // AI can optimize housing construction, prefab housing, resource allocation
  const totalAI = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
  const avgAlignment = state.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / Math.max(1, state.aiAgents.length);

  if (totalAI > 1.5 && avgAlignment > 0.7) {
    const aiHousing = Math.min(0.2, (totalAI - 1.5) * 0.06);
    shelterSecurity += aiHousing;
  }

  // === POST-SCARCITY ===
  // Stage 4: Housing becomes abundant
  if (economicStage >= 4) {
    shelterSecurity += 0.2;
  }

  // === UBI FLOOR ===
  // POLICY CALIBRATION (Oct 17, 2025): UBI floor works at ALL stages
  // UBI ensures minimum housing security (rental assistance, housing vouchers)
  if (ubiActive) {
    const ubiVariant = state.government.structuralChoices.ubiVariant || 'none';
    let ubiFloor: number;
    if (economicStage >= 3) {
      // Post-scarcity: Housing becomes much more accessible
      ubiFloor = ubiVariant === 'generous' ? 0.85 : 0.70;
    } else {
      // Pre-transition: Modest shelter floor (rental assistance prevents homelessness)
      // Research: UBI pilots reduce homelessness risk ~30-40%
      ubiFloor = ubiVariant === 'generous' ? 0.68 : 0.60;
    }
    shelterSecurity = Math.max(shelterSecurity, ubiFloor);
  }

  return Math.max(0, Math.min(1.0, shelterSecurity));
}

/**
 * Calculate Tier 1-5: All other QoL dimensions
 *
 * This is delegated to the main updateQualityOfLifeSystems function
 * to avoid circular dependencies. This module focuses on survival fundamentals.
 */
