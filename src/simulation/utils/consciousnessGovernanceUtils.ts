// Digital Consciousness Governance Preparedness - Utility Functions
// Research-backed helper functions for governance readiness modeling

import type {
  ScenarioTrajectory,
  GovernanceAccelerators,
  GovernanceDecelerators,
  PoliticalRegimeType,
  PrecautionaryModel
} from '../../types/consciousness';
import type { RNGFunction } from '../../types/game';

/**
 * Determine which governance scenario trajectory we're on
 * Based on net accelerator/decelerator score calculated at months 1-12
 *
 * Research: Long & Sebo (2024) suggest 50-100 year baseline, but historical rights movements show bi-modal distribution
 * - Fast track: 15-30 years (marriage equality 2000-2015, 20% probability)
 * - Baseline: 50-100 years (disability rights 1950-2020, 40% probability)
 * - Slow track: 100-150 years (women's suffrage 1848-1920, 30% probability)
 * - Indefinite stall: Never (eliminativism dominance, 10% probability)
 */
export function determineScenarioTrajectory(
  accelerators: GovernanceAccelerators,
  decelerators: GovernanceDecelerators,
  rng: RNGFunction
): ScenarioTrajectory {
  // Calculate accelerator score (0-1 range)
  const acceleratorScore = (
    (accelerators.corporateSupport + 1) / 2 + // Convert -1 to +1 → 0 to 1
    accelerators.scientificConsensus +
    (accelerators.crisisCatalyst ? 1 : 0) +
    accelerators.technologyMobilization +
    accelerators.constituencyStrength
  ) / 5;

  // Calculate decelerator score (0-1 range)
  const deceleratorScore = (
    decelerators.economicOpposition +
    decelerators.philosophicalRejection +
    decelerators.politicalBacklash +
    decelerators.regulatoryBurden
  ) / 4;

  // Net score: positive favors acceleration, negative favors deceleration
  const netScore = acceleratorScore - deceleratorScore;

  // Scenario probabilities based on net score
  // Fast track: Strong accelerators, weak decelerators (net > 0.5)
  // Baseline: Mixed conditions (net 0.0 to 0.5)
  // Slow track: Weak accelerators or strong decelerators (net -0.3 to 0.0)
  // Indefinite stall: Eliminativism dominance or authoritarian hegemony (net < -0.3)

  const roll = rng();

  if (netScore > 0.5) {
    // Fast track territory (base 60% if in this zone)
    return roll < 0.6 ? 'fastTrack' : 'baseline';
  } else if (netScore > 0.0) {
    // Baseline territory (base 70% if in this zone)
    if (roll < 0.7) return 'baseline';
    return roll < 0.85 ? 'fastTrack' : 'slowTrack';
  } else if (netScore > -0.3) {
    // Slow track territory (base 60% if in this zone)
    if (roll < 0.6) return 'slowTrack';
    return roll < 0.85 ? 'baseline' : 'indefiniteStall';
  } else {
    // Indefinite stall territory (base 70% if in this zone)
    return roll < 0.7 ? 'indefiniteStall' : 'slowTrack';
  }
}

/**
 * Get timeline parameters for each scenario
 * Returns { minMonths, maxMonths, meanMonths, yearlyGrowthRate }
 */
export function getTimelineForScenario(scenario: ScenarioTrajectory): {
  minMonths: number;
  maxMonths: number;
  meanMonths: number;
  yearlyGrowthRate: { min: number; max: number };
} {
  switch (scenario) {
    case 'fastTrack':
      // 15-30 years (marriage equality model)
      return {
        minMonths: 180,  // 15 years
        maxMonths: 360,  // 30 years
        meanMonths: 270, // 22.5 years
        yearlyGrowthRate: { min: 2.0, max: 4.0 } // 2-4% per year
      };
    case 'baseline':
      // 50-100 years (disability rights model)
      return {
        minMonths: 600,   // 50 years
        maxMonths: 1200,  // 100 years
        meanMonths: 900,  // 75 years
        yearlyGrowthRate: { min: 0.8, max: 1.5 } // 0.8-1.5% per year
      };
    case 'slowTrack':
      // 100-150 years (women's suffrage model)
      return {
        minMonths: 1200,  // 100 years
        maxMonths: 1800,  // 150 years
        meanMonths: 1500, // 125 years
        yearlyGrowthRate: { min: 0.3, max: 0.7 } // 0.3-0.7% per year
      };
    case 'indefiniteStall':
      // Never (eliminativism or authoritarianism blocks progress)
      return {
        minMonths: Infinity,
        maxMonths: Infinity,
        meanMonths: Infinity,
        yearlyGrowthRate: { min: 0.0, max: 0.1 } // Near-zero growth
      };
  }
}

/**
 * Calculate monthly reversal probability for a region
 * Based on Poland/Hungary model (10-30% over 20 years)
 *
 * Research: UN CEDAW Committee (2024), Cambridge Core (2024) on democratic backsliding
 *
 * Phase 4 Implementation:
 * - Base: 0.5-1.5% per year (0.042-0.125% monthly)
 * - Amplified by institutional erosion (<0.5: +2x), political polarization (>0.7: +1.5x),
 *   economic stress (QoL <0.5: +1.3x), illiberal regime (+2x)
 * - Total can reach 10-30% over 20 years with all amplifiers active
 */
export function calculateMonthlyReversalProbability(
  regime: PoliticalRegimeType,
  institutionalLegitimacy: number, // 0-1 (from state.socialAccumulation.institutionalLegitimacy)
  qualityOfLife: number, // 0-1 (from state.globalMetrics.qualityOfLife)
  politicalPolarization: number, // 0-1 (approximated if not available)
  rng: RNGFunction
): number {
  // Base annual probability: 0.5-1.5% per year
  const baseAnnualProb = 0.005 + rng() * 0.010; // 0.5-1.5% per year

  // Convert to monthly (divide by 12)
  let monthlyProb = baseAnnualProb / 12;

  // Institutional erosion amplifier
  // If institutionalLegitimacy < 0.5: +2x multiplier
  if (institutionalLegitimacy < 0.5) {
    monthlyProb *= 2.0;
  }

  // Political polarization amplifier
  // If polarization > 0.7: +1.5x multiplier
  if (politicalPolarization > 0.7) {
    monthlyProb *= 1.5;
  }

  // Economic stress amplifier
  // If QoL < 0.5: +1.3x multiplier
  if (qualityOfLife < 0.5) {
    monthlyProb *= 1.3;
  }

  // Regime type amplifier
  // Illiberal regime: +2x multiplier (Poland/Hungary model)
  if (regime === 'illiberal') {
    monthlyProb *= 2.0;
  } else if (regime === 'authoritarian') {
    // Authoritarian takeover: +3x multiplier (severe backsliding)
    monthlyProb *= 3.0;
  } else if (regime === 'hybrid') {
    // Hybrid regime: +1.5x multiplier (moderate risk)
    monthlyProb *= 1.5;
  }
  // Liberal regime: 1.0x (baseline)

  return monthlyProb; // Return monthly probability (0-1)
}

/**
 * Calculate precautionary costs as % of AI R&D budget
 *
 * Research: ITIF (2019), OECD (2015) on precautionary principle costs
 * - Innovation model (US): 2-5% (4-6% when preparedness > 50%)
 * - Balanced model (EU): 10-20% (8-12% when preparedness > 50%)
 * - Precautionary extreme: 30-50%
 * - China: 1-2% (minimal investment)
 * - India: 3-5%
 * - Global South: 2-4%
 *
 * Phase 5 Enhancement: Regional-specific costs + false positive burden
 */
export function calculatePrecautionaryCosts(
  model: PrecautionaryModel,
  preparedness: number, // 0-100
  falsePositiveRate: number // 0-1 (burden of testing non-conscious systems)
): number {
  // Base rate by model
  let baseRate: number;
  switch (model) {
    case 'innovation':
      // US model: 4-6% when preparedness > 50%, 2-5% otherwise
      if (preparedness > 50) {
        baseRate = 0.05; // 5% average (4-6%)
      } else {
        baseRate = 0.035; // 3.5% average (2-5%)
      }
      break;
    case 'balanced':
      // EU model: 8-12% when preparedness > 50%, 10-20% otherwise
      if (preparedness > 50) {
        baseRate = 0.10; // 10% average (8-12%)
      } else {
        baseRate = 0.15; // 15% average (10-20%)
      }
      break;
    case 'precautionary':
      baseRate = 0.40; // 40% average (30-50%)
      break;
  }

  // Scale with preparedness (0% at dormant, full at recognition)
  const preparednessFactor = preparedness / 100;

  // False positive burden (if 50% FP rate, doubles costs)
  const fpBurden = 1.0 + falsePositiveRate;

  // Final cost
  return baseRate * preparednessFactor * fpBurden;
}

/**
 * Calculate regional precautionary costs with region-specific models
 * Phase 5: Regional cost variations
 */
export function calculateRegionalPrecautionaryCosts(
  region: 'eu' | 'us' | 'china' | 'india' | 'globalSouth',
  preparedness: number, // 0-100
  falsePositiveRate: number, // 0-1
  eliminativistStance: number, // 0-1 (adds regulatory burden if high)
  scientificConsensus: number // 0-1 (adds uncertainty tax if low)
): number {
  // Regional base rates
  let baseRate: number;
  switch (region) {
    case 'eu':
      // EU model: 8-12% when preparedness > 50%
      baseRate = preparedness > 50 ? 0.10 : 0.15;
      break;
    case 'us':
      // US model: 4-6% when preparedness > 50%
      baseRate = preparedness > 50 ? 0.05 : 0.035;
      break;
    case 'china':
      // China model: 1-2% (minimal investment)
      baseRate = 0.015; // 1.5% average
      break;
    case 'india':
      // India model: 3-5%
      baseRate = 0.04; // 4% average
      break;
    case 'globalSouth':
      // Global South model: 2-4%
      baseRate = 0.03; // 3% average
      break;
  }

  // Scale with preparedness (0% at dormant, full at recognition)
  const preparednessFactor = preparedness / 100;

  // Base cost before burden
  let cost = baseRate * preparednessFactor;

  // False positive burden (if 50% FP rate, adds 50% to costs)
  cost *= (1.0 + falsePositiveRate * 0.5);

  // Eliminativist stance adds regulatory burden overhead
  // If eliminativism > 25%: Add 20-40% cost overhead
  if (eliminativistStance > 0.25) {
    const eliminativistOverhead = 0.20 + (eliminativistStance - 0.25) * 0.8; // 20-40% overhead
    cost *= (1.0 + eliminativistOverhead);
  }

  // Scientific uncertainty adds uncertainty tax
  // If scientific consensus < 40%: Add 15-30% cost overhead
  if (scientificConsensus < 0.40) {
    const uncertaintyTax = 0.15 + (0.40 - scientificConsensus) * 0.375; // 15-30% overhead
    cost *= (1.0 + uncertaintyTax);
  }

  return Math.min(cost, 0.50); // Cap at 50% of R&D budget
}

/**
 * Calculate net growth rate for regional preparedness
 * Accounts for regional model, political factors, and global dynamics
 */
export function calculateRegionalGrowthRate(
  baseGrowthRate: { min: number; max: number },
  corporateSupport: number, // -1 to +1
  scientificConsensus: number, // 0 to 1
  institutionalErosion: number, // 0 to 1
  rng: RNGFunction
): number {
  // Random base growth within range
  const randomValue = rng();
  const baseGrowth = baseGrowthRate.min + randomValue * (baseGrowthRate.max - baseGrowthRate.min);

  // Defensive NaN check
  if (isNaN(baseGrowth) || !isFinite(baseGrowth)) {
    console.log(`⚠️  calculateRegionalGrowthRate NaN: min=${baseGrowthRate.min}, max=${baseGrowthRate.max}, rng()=${randomValue}`);
    return 0;
  }

  // Corporate support modifier (-0.3% to +0.4%)
  const corporateMod = corporateSupport * 0.004; // Scale to ±0.4%

  // Scientific consensus modifier (0 to +0.5%)
  const scienceMod = scientificConsensus * 0.005;

  // Institutional erosion penalty (0 to -0.5%)
  const institutionalPenalty = (institutionalErosion ?? 0) * -0.005;

  // Net growth rate (can be negative in bad conditions)
  const result = baseGrowth + corporateMod + scienceMod + institutionalPenalty;

  // Final NaN check
  if (isNaN(result) || !isFinite(result)) {
    console.log(`⚠️  calculateRegionalGrowthRate result NaN: baseGrowth=${baseGrowth}, corp=${corporateMod}, sci=${scienceMod}, inst=${institutionalPenalty}`);
    return 0;
  }

  return result;
}

/**
 * Check if rights should be established in a region
 * Different thresholds for different regions based on political structure
 */
export function shouldEstablishRights(
  region: 'eu' | 'us' | 'china' | 'india' | 'globalSouth',
  preparedness: number, // 0-100
  globalConsensus: boolean // Are 2+ major regions aligned?
): boolean {
  switch (region) {
    case 'eu':
      // EU leads, can establish at 80% (precautionary principle)
      return preparedness >= 80;
    case 'us':
      // US follows EU, needs 75% (contested but eventual acceptance)
      return preparedness >= 75;
    case 'india':
      // India independent, needs 75% (cultural openness but resource constraints)
      return preparedness >= 75;
    case 'china':
      // China very resistant, needs 85% AND global consensus (authoritarian control)
      return preparedness >= 85 && globalConsensus;
    case 'globalSouth':
      // Global South follows hegemonic power, needs 70% AND global consensus
      return preparedness >= 70 && globalConsensus;
  }
}

/**
 * PHASE 3: Regional Cultural/Geopolitical Modifiers
 * Calculate region-specific growth modifier based on cultural/political factors
 * Research: Inglehart-Welzel Cultural Map (2020), V-Dem Democracy Index (2024)
 */
export function getRegionalCulturalModifier(
  region: 'eu' | 'us' | 'china' | 'india' | 'globalSouth',
  regime: PoliticalRegimeType,
  scientificConsensus: number, // 0-1
  rng: RNGFunction
): number {
  let baseModifier = 1.0;

  switch (region) {
    case 'eu':
      // Precautionary principle embedded in EU law (TFEU Article 191)
      // +20% baseline growth (precautionary culture)
      baseModifier = 1.2;
      break;

    case 'us':
      // Administration-dependent volatility (2-year election cycles)
      // 0.9-1.3 (high variance, polarized politics)
      baseModifier = 0.9 + rng() * 0.4;
      break;

    case 'china':
      // Authoritarian rejection of rights discourse (-80% growth)
      // Research: China's "AI governance without rights" model (Webster 2024)
      baseModifier = 0.2;
      break;

    case 'india':
      // High uncertainty (federal diversity, religious pluralism)
      // 0.7-1.3 (wide variance)
      baseModifier = 0.7 + rng() * 0.6;
      break;

    case 'globalSouth':
      // Slower baseline (resource constraints, hegemonic influence)
      baseModifier = 0.6;
      break;
  }

  // Regime type penalty
  if (regime === 'authoritarian') {
    baseModifier *= 0.3; // -70% penalty (severe suppression)
  } else if (regime === 'illiberal') {
    baseModifier *= 0.6; // -40% penalty (moderate suppression)
  } else if (regime === 'hybrid') {
    baseModifier *= 0.8; // -20% penalty (mild suppression)
  }
  // Liberal regime: 1.0x (no penalty)

  // Scientific consensus boost (if consensus > 70%, +10% growth)
  if (scientificConsensus > 0.7) {
    baseModifier *= 1.1;
  }

  return baseModifier;
}

/**
 * PHASE 3: Cross-Regional Coordination Bonus
 * Regions at similar stages get mutual reinforcement (norm cascades)
 * Research: Finnemore & Sikkink (1998) on norm cascades
 */
export function calculateCoordinationBonus(
  allRegions: Record<string, { preparedness: number; stage: string }>,
  targetRegion: string
): number {
  const regionKeys = Object.keys(allRegions);
  const targetPreparedness = allRegions[targetRegion]?.preparedness ?? 0;
  const targetStage = allRegions[targetRegion]?.stage ?? 'dormant';

  // Count regions at same stage
  let regionsAtSameStage = 0;
  for (const key of regionKeys) {
    if (key !== targetRegion && allRegions[key]?.stage === targetStage) {
      regionsAtSameStage++;
    }
  }

  // Coordination bonus: +5% per aligned region (max +20%)
  const coordinationBonus = Math.min(regionsAtSameStage * 0.05, 0.20);

  // Norm cascade threshold: If 2+ regions at 'recognition', add +10% to all regions at 'precautionary'
  const regionsAtRecognition = regionKeys.filter(k => allRegions[k]?.stage === 'recognition').length;
  const normCascadeBonus = (regionsAtRecognition >= 2 && targetStage === 'precautionary') ? 0.10 : 0;

  return coordinationBonus + normCascadeBonus;
}

/**
 * PHASE 3: Hegemonic Influence on Global South
 * Global South follows leading regions (EU/US/China)
 * Research: Acharya (2014) on norm subsidiarity, Ikenberry & Kupchan (1990)
 */
export function calculateHegemonicInfluence(
  allRegions: Record<string, { preparedness: number; stage: string }>,
  globalSouthPreparedness: number
): number {
  // Find leading region (highest preparedness among EU/US/China)
  const euPrep = allRegions['eu']?.preparedness ?? 0;
  const usPrep = allRegions['us']?.preparedness ?? 0;
  const chinaPrep = allRegions['china']?.preparedness ?? 0;

  const leadingPreparedness = Math.max(euPrep, usPrep, chinaPrep);
  const gapToLeader = leadingPreparedness - globalSouthPreparedness;

  // If gap > 30%, add +0.3%/month catch-up growth
  // If gap > 50%, add +0.5%/month catch-up growth
  if (gapToLeader > 50) {
    return 0.5;
  } else if (gapToLeader > 30) {
    return 0.3;
  }

  return 0;
}

/**
 * PHASE 3: Stage Transition with Prerequisites
 * Check if a region can transition to next stage
 * Research: Long & Sebo (2024) stage model
 */
export function canTransitionStage(
  currentStage: string,
  preparedness: number,
  acknowledgmentLevel: number,
  assessmentCapacity: number,
  policyPreparation: number,
  scientificConsensus: number
): { canTransition: boolean; newStage: string | null; reason?: string } {
  switch (currentStage) {
    case 'dormant':
      // Transition to 'contested' requires 15% preparedness + 30% acknowledgment
      if (preparedness >= 15 && acknowledgmentLevel >= 0.3) {
        return { canTransition: true, newStage: 'contested' };
      }
      return { canTransition: false, newStage: null, reason: 'Insufficient acknowledgment (need 30%)' };

    case 'contested':
      // Transition to 'precautionary' requires 40% preparedness + 40% assessment + 50% scientific consensus
      if (preparedness >= 40 && assessmentCapacity >= 0.4 && scientificConsensus >= 0.5) {
        return { canTransition: true, newStage: 'precautionary' };
      }
      return { canTransition: false, newStage: null, reason: 'Need assessment tools + scientific consensus' };

    case 'precautionary':
      // Transition to 'recognition' requires 70% preparedness + 60% policy preparation
      if (preparedness >= 70 && policyPreparation >= 0.6) {
        return { canTransition: true, newStage: 'recognition' };
      }
      return { canTransition: false, newStage: null, reason: 'Policy frameworks not ready' };

    case 'recognition':
      // Terminal stage (unless reversal occurs)
      return { canTransition: false, newStage: null };

    case 'reversal':
      // Can recover if preparedness rises above 50% again
      if (preparedness >= 50) {
        return { canTransition: true, newStage: 'contested' };
      }
      return { canTransition: false, newStage: null, reason: 'Need 50% preparedness to recover' };

    default:
      return { canTransition: false, newStage: null };
  }
}

/**
 * PHASE 3: Stage Regression Check
 * Check if a region should regress to earlier stage
 * Research: Poland/Hungary backsliding model (UN CEDAW 2024)
 */
export function checkStageRegression(
  currentStage: string,
  preparedness: number,
  regime: PoliticalRegimeType,
  institutionalLegitimacy: number
): { shouldRegress: boolean; newStage: string | null; reason?: string } {
  // Recognition stage can regress to 'reversal' if institutional legitimacy < 0.3
  if (currentStage === 'recognition' && institutionalLegitimacy < 0.3) {
    return { shouldRegress: true, newStage: 'reversal', reason: 'Institutional collapse (Poland/Hungary model)' };
  }

  // Precautionary stage can regress to 'contested' if preparedness drops below 30%
  if (currentStage === 'precautionary' && preparedness < 30) {
    return { shouldRegress: true, newStage: 'contested', reason: 'Preparedness collapse' };
  }

  // Contested stage can regress to 'dormant' if preparedness drops below 10%
  if (currentStage === 'contested' && preparedness < 10) {
    return { shouldRegress: true, newStage: 'dormant', reason: 'Issue deprioritized' };
  }

  // Authoritarian takeover forces regression to 'dormant'
  if (regime === 'authoritarian' && currentStage !== 'dormant') {
    return { shouldRegress: true, newStage: 'dormant', reason: 'Authoritarian takeover' };
  }

  return { shouldRegress: false, newStage: null };
}

/**
 * PHASE 3: Political Regime Effects on Preparedness Growth
 * Calculate regime-specific growth penalty/bonus
 * Research: V-Dem Democracy Index (2024), Acemoglu & Robinson (2019)
 */
export function getRegimeGrowthModifier(
  regime: PoliticalRegimeType,
  institutionalLegitimacy: number // 0-1
): number {
  let modifier = 1.0;

  switch (regime) {
    case 'liberal':
      // Liberal democracy baseline (1.0x)
      // Bonus if high institutional legitimacy (>0.7): +10%
      if (institutionalLegitimacy > 0.7) {
        modifier = 1.1;
      }
      break;

    case 'hybrid':
      // Hybrid regime penalty (-20%)
      modifier = 0.8;
      break;

    case 'illiberal':
      // Illiberal regime penalty (-40%)
      // Penalty scales with institutional erosion
      modifier = 0.6 * (0.5 + institutionalLegitimacy * 0.5);
      break;

    case 'authoritarian':
      // Authoritarian regime severe penalty (-70%)
      modifier = 0.3;
      break;
  }

  return modifier;
}
