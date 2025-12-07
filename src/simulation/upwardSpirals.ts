/**
 * Upward Spiral System - Phase 2D
 * 
 * The missing piece for Utopia detection!
 * 
 * Key insight: Utopia isn't just "no crises + high QoL"
 * It's about multiple self-reinforcing positive feedback loops (spirals)
 * 
 * The 6 Upward Spirals:
 * 1. Abundance - Material + Energy + Time liberation
 * 2. Cognitive - Mental health + Purpose + Education
 * 3. Democratic - Governance quality + Participation + Transparency
 * 4. Scientific - Breakthrough acceleration + Discovery rate
 * 5. Meaning - Purpose diversity + Self-actualization
 * 6. Ecological - Ecosystem health + Climate + Biodiversity
 * 
 * Utopia condition: 3+ spirals sustained for 12+ months
 * Virtuous cascade: 4+ spirals amplify each other (like our vicious cascades!)
 */

import type { GameState } from '../types/game';
import { getTrustInAI, calculateComprehensiveTrustInAI } from './socialCohesion';
import { TRUST_THRESHOLD_ACCEPTANCE, TRUST_THRESHOLD_EMBRACE } from './trustThresholds';
import { getUnlockedTechCount, getDeployedTechCount } from './techTree/helpers';
import { assertStateProperty, assertFinite, assertNonEmpty } from './utils/assertions';

export interface UpwardSpiral {
  active: boolean;           // Is this spiral currently active?
  strength: number;          // 0-1, how strong is it
  monthsActive: number;      // How long has it been active consecutively
  lastActivatedMonth: number; // When did it last turn on
  lastDeactivatedMonth: number; // When did it last turn off
}

export interface UpwardSpiralState {
  // The 6 spirals
  abundance: UpwardSpiral;
  cognitive: UpwardSpiral;
  democratic: UpwardSpiral;
  scientific: UpwardSpiral;
  meaning: UpwardSpiral;
  ecological: UpwardSpiral;
  
  // Cascade mechanics
  cascadeActive: boolean;     // 4+ spirals → virtuous cascade
  cascadeStrength: number;    // Cross-amplification factor (1.0-2.0+)
  cascadeMonths: number;      // How long has cascade been active
}

export function initializeUpwardSpirals(): UpwardSpiralState {
  const emptySpiral = (): UpwardSpiral => ({
    active: false,
    strength: 0,
    monthsActive: 0,
    lastActivatedMonth: -1,
    lastDeactivatedMonth: -1
  });
  
  return {
    abundance: emptySpiral(),
    cognitive: emptySpiral(),
    democratic: emptySpiral(),
    scientific: emptySpiral(),
    meaning: emptySpiral(),
    ecological: emptySpiral(),
    cascadeActive: false,
    cascadeStrength: 1.0,
    cascadeMonths: 0
  };
}

/**
 * Update all upward spirals each month
 * This is the main entry point called from the engine
 */
export function updateUpwardSpirals(state: GameState, currentMonth: number): void {
  const spirals = state.upwardSpirals;
  
  // Check each spiral condition
  updateAbundanceSpiral(spirals.abundance, state, currentMonth);
  updateCognitiveSpiral(spirals.cognitive, state, currentMonth);
  updateDemocraticSpiral(spirals.democratic, state, currentMonth);
  updateScientificSpiral(spirals.scientific, state, currentMonth);
  updateMeaningSpiral(spirals.meaning, state, currentMonth);
  updateEcologicalSpiral(spirals.ecological, state, currentMonth);
  
  // Update cascade state
  updateVirtuousCascade(spirals, currentMonth);
  
  // Apply cascade effects if active
  if (spirals.cascadeActive) {
    applyVirtuousCascadeEffects(state, spirals.cascadeStrength);
  }
  
  // 🔍 DIAGNOSTIC: Log spiral status every 12 months
  if (currentMonth % 12 === 0 && currentMonth > 0) {
    logSpiralDiagnostics(state, currentMonth);
  }
}

/**
 * SPIRAL 1: Abundance
 * Material + Energy + Time liberation
 * "Post-scarcity is achieved when nobody needs to work for survival"
 */
function updateAbundanceSpiral(spiral: UpwardSpiral, state: GameState, month: number): void {
  const qol = state.qualityOfLifeSystems;
  
  // Material abundance: Basic needs met + extra
  const materialAbundant = qol.materialAbundance > 1.5;
  
  // Energy abundance: Clean, unlimited energy
  const energyAbundant = qol.energyAvailability > 1.5;
  
  // Time liberation: People don't need to work for survival
  const timeLiberated = state.society.unemploymentLevel > 0.6 && // Most people not working
                       state.globalMetrics.economicTransitionStage >= 3; // UBI/post-work stage
  
  // All three required for abundance spiral
  const wasActive = spiral.active;
  spiral.active = materialAbundant && energyAbundant && timeLiberated;
  
  // Calculate strength (how abundant are we?)
  if (spiral.active) {
    spiral.strength = (
      Math.min(2.0, qol.materialAbundance) / 2.0 * 0.4 +
      Math.min(2.0, qol.energyAvailability) / 2.0 * 0.3 +
      Math.min(1.0, state.society.unemploymentLevel) * 0.3
    );
  } else {
    spiral.strength = 0;
  }
  
  updateSpiralTracking(spiral, wasActive, month);
}

/**
 * SPIRAL 2: Cognitive Enhancement
 * Mental health + Purpose + Education/AI augmentation
 * "Humans become smarter, healthier, more capable"
 *
 * FIX #2 (Oct 18, 2025): Updated to use comprehensive trust calculation
 * Research: Trust depends on benefits + alignment + safety, NOT absolute capability
 */
function updateCognitiveSpiral(spiral: UpwardSpiral, state: GameState, month: number): void {
  const qol = state.qualityOfLifeSystems;
  const social = state.socialAccumulation;

  // Mental health: Low disease burden, high healthcare quality
  const mentalHealthy = qol.diseasesBurden < 0.3 && qol.healthcareQuality > 0.8;

  // Purpose: Low meaning crisis (people have direction)
  const purposeful = social.meaningCrisisLevel < 0.3;

  // Cognitive enhancement: NEW - Depends on demonstrated benefits + trust + performance
  // OLD: avgAICapability > 1.5 && trustInAI > 0.6
  // FIX #2A (Oct 19, 2025): Removed explainability (contradicts research)
  // NEW: Benefits demonstrated + acceptance-level trust (trust includes performance now)
  const comprehensiveTrust = calculateComprehensiveTrustInAI(state);
  const demonstratedBenefits = state.globalMetrics.qualityOfLife > 0.5;  // AI has improved life

  const cognitiveEnhanced = demonstratedBenefits &&
                           comprehensiveTrust > TRUST_THRESHOLD_ACCEPTANCE;

  const wasActive = spiral.active;
  spiral.active = mentalHealthy && purposeful && cognitiveEnhanced;

  if (spiral.active) {
    spiral.strength = (
      (1 - qol.diseasesBurden) * 0.3 +
      (1 - social.meaningCrisisLevel) * 0.4 +
      comprehensiveTrust * 0.3  // Use trust instead of capability
    );
  } else {
    spiral.strength = 0;
  }

  updateSpiralTracking(spiral, wasActive, month);
}

/**
 * SPIRAL 3: Democratic Flourishing
 * Governance quality + Participation + Transparency
 * "Liquid democracy working, people engaged, decisions good"
 *
 * M-6 INTEGRATION (Dec 2025): Cross-amplification with social trust cascades
 * Research: UN World Social Report 2024 - trust + governance = positive feedback
 */
function updateDemocraticSpiral(spiral: UpwardSpiral, state: GameState, month: number): void {
  const gov = state.government.governanceQuality;

  // High-quality governance
  const qualityGovernance = gov.decisionQuality > 0.7 && gov.institutionalCapacity > 0.7;

  // Democratic engagement
  const democraticEngagement = gov.participationRate > 0.6 && gov.transparency > 0.7;

  // Not authoritarian
  const notAuthoritarian = state.government.governmentType !== 'authoritarian';

  const wasActive = spiral.active;
  spiral.active = qualityGovernance && democraticEngagement && notAuthoritarian;

  if (spiral.active) {
    let baseStrength = (
      gov.decisionQuality * 0.25 +
      gov.institutionalCapacity * 0.2 +
      gov.participationRate * 0.25 +
      gov.transparency * 0.2 +
      gov.consensusBuildingEfficiency * 0.1
    );

    // M-6: Amplify with policy climate action cascade (if active)
    // Research: Social cascades strengthen democratic institutions
    const policyAction = state.positiveTippingPoints.socialCascades.policyClimateAction;
    if (policyAction.cascadeActive) {
      const cascadeBoost = policyAction.cascadeStrength * 0.15; // Up to 15% boost
      baseStrength = assertFinite(baseStrength * (1 + cascadeBoost), {
        location: 'updateDemocraticSpiral',
        valueName: 'strengthWithCascadeBoost',
        month,
        additionalInfo: {
          baseStrength,
          cascadeStrength: policyAction.cascadeStrength,
          cascadeBoost,
        }
      });
    }

    spiral.strength = Math.min(1.0, baseStrength);
  } else {
    spiral.strength = 0;
  }

  updateSpiralTracking(spiral, wasActive, month);
}

/**
 * SPIRAL 4: Scientific Acceleration
 * Breakthrough rate + Research investment + Discovery speed
 * "Science is accelerating exponentially"
 *
 * POST-RECALIBRATION FIX #4 (Oct 18, 2025):
 * Scale deployment requirements with AI capability
 * Research: McKinsey + IBM (2024) - 78% adoption in 1 year with high-capability AI
 *           MDPI (2024) - Only 21% redesigned workflows, strong correlation with benefits
 */
function updateScientificSpiral(spiral: UpwardSpiral, state: GameState, month: number): void {
  // Count unlocked breakthroughs (uses compatibility layer for old/new tech systems)
  const unlockedCount = getUnlockedTechCount(state);

  // Count deployed breakthroughs (>50%)
  const deployedCount = getDeployedTechCount(state, 0.5);

  // Research investment (as % of economy)
  const researchInvestments = state.government.researchInvestments;
  // FIX (Nov 8, 2025): Use totalBudget instead of broken reduce over mixed object/number fields
  // Previous code: Object.keys().reduce() tried to Number() nested objects (biotech, materials, climate)
  // This produced NaN, which || 0 silently converted to 0, hiding the bug
  const totalResearch = researchInvestments.totalBudget;
  const researchIntensive = totalResearch > 50; // $50B+/month

  // AI-accelerated research
  const avgAICapability = state.aiAgents.length > 0 ? (() => {
    const capabilitySum = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
    return assertFinite(capabilitySum / state.aiAgents.length, {
      location: 'checkScientificSpiral',
      valueName: 'avgAICapability',
      month: state.currentMonth,
      additionalInfo: { capabilitySum, agentCount: state.aiAgents.length }
    });
  })() : 0;
  const aiAccelerated = avgAICapability > 1.2; // Lowered from 2.0 - AI is already 3x-ing papers at GPT-4 level

  // FIX #4: Scale deployment threshold with AI capability
  // High-capability AI (>4.0) accelerates deployment → requires fewer deployed breakthroughs
  // Research: GenAI adoption 33% → 71% in one year with GPT-4-level AI
  const deploymentThreshold = avgAICapability > 4.0 ? 3 : 4;  // Lower threshold if high capability

  // FIX #4 / #4A: Workflow adaptation requirement
  // Benefits require organizational change, not just AI deployment
  // Research: MDPI (2024) - Only 21% redesigned workflows, those who did saw tangible benefits
  // FIX #4A (Oct 19): Updated to 25% threshold (critical mass from Rogers diffusion theory)
  const workflowAdaptation = assertStateProperty(
    state.society,
    'workflowAdaptation',
    {
      location: 'updateResearchProductivitySpiral',
      month,
      expectedSource: 'initialization.ts:society'
    }
  );
  const workflowAdapted = workflowAdaptation >= 0.25;  // 25% critical mass threshold (NOT arbitrary 40%)

  const wasActive = spiral.active;
  // Need multiple breakthroughs DEPLOYED (scaled threshold) AND ongoing investment AND AI acceleration AND workflow adaptation
  const deployedCheck = deployedCount >= deploymentThreshold;
  spiral.active = deployedCheck && researchIntensive && aiAccelerated && workflowAdapted;

  // Aggregate spiral diagnostics (removed verbose debug logs)

  if (spiral.active) {
    spiral.strength = (
      Math.min(1.0, unlockedCount / 8) * 0.25 +
      Math.min(1.0, deployedCount / 6) * 0.25 +
      Math.min(1.0, totalResearch / 100) * 0.2 +  // FIX (Nov 8): Remove || 0 fallback (totalBudget is always finite)
      Math.min(1.0, avgAICapability / 4.0) * 0.15 +
      Math.min(1.0, workflowAdaptation / 0.7) * 0.15  // Workflow adaptation contributes to strength
    );
  } else {
    spiral.strength = 0;
  }

  updateSpiralTracking(spiral, wasActive, month);
}

/**
 * SPIRAL 5: Meaning & Purpose
 * Purpose diversity + Community + Cultural renaissance
 * "People have meaningful lives, not just material comfort"
 *
 * **POLICY SYNERGY: Teaching Investment Creates Meaningful Work**
 * AI productivity windfall + teaching support investment → fulfilling teaching jobs
 * → addresses meaning crisis + improves education quality (virtuous cycle)
 */
function updateMeaningSpiral(spiral: UpwardSpiral, state: GameState, month: number): void {
  const social = state.socialAccumulation;
  const qol = state.qualityOfLifeSystems;

  // Low meaning crisis
  const meaningFulfilled = social.meaningCrisisLevel < 0.2;

  // High social cohesion (community bonds) - use average of components
  const avgCohesion = (social.socialCohesion.trust + social.socialCohesion.communityBonds + social.socialCohesion.civilLiberties) / 300;
  const strongCommunity = avgCohesion > 0.7;

  // Cultural adaptation (people adapted to post-work life)
  const culturallyAdapted = social.culturalAdaptation > 0.7;

  // Autonomy & creativity (freedom to pursue purpose)
  const autonomous = qol.autonomy > 0.7 && qol.culturalVitality > 0.7;

  // POLICY SYNERGY: AI Windfall → Education Investment → Meaningful Work
  // If AI is creating productivity surplus AND we're investing in teaching support,
  // this creates fulfilling teaching jobs that address the meaning crisis
  let teachingMeaningSynergy = 0;
  if (state.policyInterventions?.teachingSupportLevel && state.laborCapitalDistribution) {
    const teachingInvestment = state.policyInterventions.teachingSupportLevel;
    const productivitySurplus = state.laborCapitalDistribution.productivityGrowth; // AI-driven gains

    // Synergy: High AI productivity + education investment → meaningful teaching jobs
    // Research: Teachers cite meaningful work when conditions are decent (OECD 2023)
    // Small classes, decent pay, support → teaching becomes desirable career
    if (teachingInvestment > 0.5 && productivitySurplus > 0.3) {
      // Synergy bonus: Using AI windfall for education creates purpose-driven employment
      // 1.0 teaching investment + 0.5 productivity surplus = 0.5 synergy boost
      teachingMeaningSynergy = Math.min(0.5, teachingInvestment * productivitySurplus);

      // This synergy reduces meaning crisis by creating fulfilling work
      // Effect: -5% to -25% meaning crisis reduction from teaching employment
      const meaningReduction = teachingMeaningSynergy * 0.5; // Up to 25% reduction
      social.meaningCrisisLevel = Math.max(0, social.meaningCrisisLevel - meaningReduction);
    }
  }

  const wasActive = spiral.active;
  // Synergy can help activate spiral by reducing meaning crisis
  const meaningThreshold = social.meaningCrisisLevel < 0.2;
  spiral.active = meaningThreshold && strongCommunity && culturallyAdapted && autonomous;

  if (spiral.active) {
    spiral.strength = (
      (1 - social.meaningCrisisLevel) * 0.3 +
      avgCohesion * 0.25 +
      social.culturalAdaptation * 0.25 +
      (qol.autonomy + qol.culturalVitality) / 2 * 0.2
    );

    // Add synergy bonus to strength
    spiral.strength = Math.min(1.0, spiral.strength + teachingMeaningSynergy * 0.3);
  } else {
    spiral.strength = 0;
  }

  updateSpiralTracking(spiral, wasActive, month);
}

/**
 * SPIRAL 6: Ecological Restoration
 * Ecosystem health + Climate stability + Biodiversity
 * "The planet is healing, not dying"
 */
function updateEcologicalSpiral(spiral: UpwardSpiral, state: GameState, month: number): void {
  const env = state.environmentalAccumulation;
  const qol = state.qualityOfLifeSystems;
  
  // High ecosystem health
  const ecosystemHealthy = qol.ecosystemHealth > 0.7;
  
  // Stable climate
  const climateStable = env.climateStability > 0.7;
  
  // Biodiversity recovering/high
  const biodiverseHealthy = env.biodiversityIndex > 0.7;
  
  // Low pollution
  const clean = env.pollutionLevel < 0.3;
  
  // Resources sustainable (not depleting)
  const sustainable = env.resourceReserves > 0.7;
  
  const wasActive = spiral.active;
  // Need strong environmental health across ALL dimensions
  spiral.active = ecosystemHealthy && climateStable && biodiverseHealthy && clean && sustainable;
  
  if (spiral.active) {
    spiral.strength = (
      qol.ecosystemHealth * 0.25 +
      env.climateStability * 0.2 +
      env.biodiversityIndex * 0.2 +
      (1 - env.pollutionLevel) * 0.15 +
      env.resourceReserves * 0.2
    );
  } else {
    spiral.strength = 0;
  }
  
  updateSpiralTracking(spiral, wasActive, month);
}

/**
 * Update tracking fields for a spiral
 */
function updateSpiralTracking(spiral: UpwardSpiral, wasActive: boolean, month: number): void {
  if (spiral.active) {
    if (!wasActive) {
      // Just turned on
      spiral.lastActivatedMonth = month;
      spiral.monthsActive = 1;
    } else {
      // Still on, increment counter
      spiral.monthsActive++;
    }
  } else {
    if (wasActive) {
      // Just turned off
      spiral.lastDeactivatedMonth = month;
    }
    spiral.monthsActive = 0;
  }
}

/**
 * Update virtuous cascade state
 * 4+ active spirals → exponential positive feedback
 */
function updateVirtuousCascade(spirals: UpwardSpiralState, month: number): void {
  // Count active spirals
  const activeSpirals = [
    spirals.abundance,
    spirals.cognitive,
    spirals.democratic,
    spirals.scientific,
    spirals.meaning,
    spirals.ecological
  ].filter(s => s.active);
  
  const activeCount = activeSpirals.length;
  const wasInCascade = spirals.cascadeActive;
  
  // Cascade requires 4+ spirals
  spirals.cascadeActive = activeCount >= 4;
  
  if (spirals.cascadeActive) {
    // Calculate cascade strength (more spirals = stronger cascade)
    // 4 spirals: 1.2x, 5 spirals: 1.4x, 6 spirals: 1.6x
    spirals.cascadeStrength = 1.0 + (activeCount - 3) * 0.2;
    
    if (!wasInCascade) {
      spirals.cascadeMonths = 1;
      const years = Math.floor(month / 12);
      const months = month % 12;
      const timeDisplay = years > 0 ? `Year ${years}, Month ${months + 1}` : `Month ${months + 1}`;
      // KEEP this log - virtuous cascades are major milestones!
      console.log(`\n✅ VIRTUOUS CASCADE BEGINS (${timeDisplay})`);
      console.log(`   ${activeCount} upward spirals active → ${spirals.cascadeStrength.toFixed(1)}x amplification`);
      console.log(`   Active spirals: ${getActiveSpiralNames(spirals).join(', ')}\n`);
    } else {
      spirals.cascadeMonths++;
    }
  } else {
    if (wasInCascade) {
      const years = Math.floor(month / 12);
      const months = month % 12;
      const timeDisplay = years > 0 ? `Year ${years}, Month ${months + 1}` : `Month ${months + 1}`;
      // KEEP this log - cascade ending is important
      console.warn(`\n⚠️  VIRTUOUS CASCADE ENDED (${timeDisplay})`);
      console.log(`   Duration: ${spirals.cascadeMonths} months`);
      console.log(`   Only ${activeCount} spirals active (need 4+)\n`);
    }
    spirals.cascadeStrength = 1.0;
    spirals.cascadeMonths = 0;
  }
}

/**
 * Apply virtuous cascade effects to the game state
 * Each spiral boosts others when cascade is active
 */
function applyVirtuousCascadeEffects(state: GameState, strength: number): void {
  // Cascade multiplier applies to positive changes
  // This is the OPPOSITE of cascading failures (which amplify degradation)
  // Here we amplify IMPROVEMENTS
  
  const boost = (strength - 1.0); // 0.2, 0.4, 0.6 for 4, 5, 6 spirals
  
  // Boost research effectiveness
  const researchBoost = 1.0 + boost;
  // (This would be applied in breakthroughTechnologies.ts)
  
  // Boost crisis resolution
  // (Applied in crisis resolution checks)
  
  // Boost QoL improvements
  const qol = state.qualityOfLifeSystems;
  if (qol.materialAbundance < 2.0) {
    qol.materialAbundance = Math.min(2.0, qol.materialAbundance * (1 + boost * 0.1));
  }
  
  // Boost social cohesion recovery (all components)
  const social = state.socialAccumulation;
  const cohesionBoost = boost * 1; // Convert to 0-100 scale (boost * 0.01 * 100)
  social.socialCohesion.trust = Math.min(100, social.socialCohesion.trust + cohesionBoost);
  social.socialCohesion.communityBonds = Math.min(100, social.socialCohesion.communityBonds + cohesionBoost);
  social.socialCohesion.civilLiberties = Math.min(100, social.socialCohesion.civilLiberties + cohesionBoost);
  
  // Note: Main effects should be "spirals make each other easier to maintain"
  // rather than direct QoL boosts (that's already modeled in the spirals themselves)
}

/**
 * Check if Utopia conditions are met
 * Utopia requires: 3+ spirals sustained for 12+ months + no active crises
 */
export function canDeclareUtopia(state: GameState): { can: boolean; reason: string; spiralCount: number } {
  const spirals = state.upwardSpirals;
  const qolSystems = state.qualityOfLifeSystems;
  
  // Count sustained spirals (active for 12+ months)
  const sustainedSpirals = [
    spirals.abundance,
    spirals.cognitive,
    spirals.democratic,
    spirals.scientific,
    spirals.meaning,
    spirals.ecological
  ].filter(s => s.active && s.monthsActive >= 12);
  
  const sustainedCount = sustainedSpirals.length;
  
  // Need 3+ sustained spirals
  if (sustainedCount < 3) {
    return {
      can: false,
      reason: `Only ${sustainedCount} sustained spirals (need 3+). Active spirals: ${getActiveSpiralNames(spirals).join(', ')}`,
      spiralCount: sustainedCount
    };
  }
  
  // NEW (Oct 12, 2025): Check survival fundamentals
  // Utopia requires ALL survival needs met globally
  // Research: Can't have utopia if people are starving/dying regardless of other metrics
  const survival = qolSystems.survivalFundamentals;
  if (survival) {
    if (survival.foodSecurity < 0.7) {
      return {
        can: false,
        reason: `Food insecurity (${(survival.foodSecurity * 100).toFixed(0)}% < 70% threshold)`,
        spiralCount: sustainedCount
      };
    }
    if (survival.waterSecurity < 0.7) {
      return {
        can: false,
        reason: `Water insecurity (${(survival.waterSecurity * 100).toFixed(0)}% < 70% threshold)`,
        spiralCount: sustainedCount
      };
    }
    if (survival.thermalHabitability < 0.7) {
      return {
        can: false,
        reason: `Thermal uninhabitability (${(survival.thermalHabitability * 100).toFixed(0)}% habitable < 70% threshold)`,
        spiralCount: sustainedCount
      };
    }
    if (survival.shelterSecurity < 0.7) {
      return {
        can: false,
        reason: `Shelter insecurity (${(survival.shelterSecurity * 100).toFixed(0)}% < 70% threshold)`,
        spiralCount: sustainedCount
      };
    }
  }
  
  // NEW (Oct 12, 2025): Check distribution metrics
  // Utopia requires reasonable equality - can't have "Elysium" scenario
  // Research: Gini >0.40 = problematic inequality (Wilkinson & Pickett)
  const distribution = qolSystems.distribution;
  if (distribution) {
    if (distribution.globalGini > 0.40) {
      return {
        can: false,
        reason: `High inequality (Gini ${(distribution.globalGini).toFixed(2)} > 0.40 threshold)`,
        spiralCount: sustainedCount
      };
    }
    if (distribution.worstRegionQoL < 0.50) {
      return {
        can: false,
        reason: `Worst region suffering (QoL ${(distribution.worstRegionQoL).toFixed(2)} < 0.50 Rawlsian minimum)`,
        spiralCount: sustainedCount
      };
    }
    if (distribution.isDystopicInequality) {
      return {
        can: false,
        reason: `Dystopic inequality detected (some regions thriving while others suffer)`,
        spiralCount: sustainedCount
      };
    }
    if (distribution.isRegionalDystopia) {
      return {
        can: false,
        reason: `Regional dystopia (>30% in crisis while others prosper)`,
        spiralCount: sustainedCount
      };
    }
  }
  
  // Check for active crises (can't have utopia with crises)
  const env = state.environmentalAccumulation;
  const social = state.socialAccumulation;
  const tech = state.technologicalRisk;
  
  const activeCrises = [
    env.resourceCrisisActive && 'Resource',
    env.pollutionCrisisActive && 'Pollution',
    env.climateCrisisActive && 'Climate',
    env.ecosystemCrisisActive && 'Ecosystem',
    social.meaningCollapseActive && 'Meaning',
    social.socialUnrestActive && 'Social Unrest',
    social.institutionalFailureActive && 'Institutional',
    tech.controlLossActive && 'Control Loss',
    tech.corporateDystopiaActive && 'Corporate Dystopia',
    tech.complacencyCrisisActive && 'Complacency'
  ].filter(Boolean) as string[];
  
  if (activeCrises.length > 0) {
    return {
      can: false,
      reason: `Active crises present: ${activeCrises.join(', ')}`,
      spiralCount: sustainedCount
    };
  }
  
  // Success! All conditions met
  return {
    can: true,
    reason: `${sustainedCount} upward spirals sustained for 12+ months: ${getSustainedSpiralNames(spirals).join(', ')}`,
    spiralCount: sustainedCount
  };
}

/**
 * Helper: Get names of active spirals
 */
function getActiveSpiralNames(spirals: UpwardSpiralState): string[] {
  const names: string[] = [];
  if (spirals.abundance.active) names.push('Abundance');
  if (spirals.cognitive.active) names.push('Cognitive');
  if (spirals.democratic.active) names.push('Democratic');
  if (spirals.scientific.active) names.push('Scientific');
  if (spirals.meaning.active) names.push('Meaning');
  if (spirals.ecological.active) names.push('Ecological');
  return names;
}

/**
 * Helper: Get names of sustained spirals (12+ months)
 */
function getSustainedSpiralNames(spirals: UpwardSpiralState): string[] {
  const names: string[] = [];
  if (spirals.abundance.active && spirals.abundance.monthsActive >= 12) names.push('Abundance');
  if (spirals.cognitive.active && spirals.cognitive.monthsActive >= 12) names.push('Cognitive');
  if (spirals.democratic.active && spirals.democratic.monthsActive >= 12) names.push('Democratic');
  if (spirals.scientific.active && spirals.scientific.monthsActive >= 12) names.push('Scientific');
  if (spirals.meaning.active && spirals.meaning.monthsActive >= 12) names.push('Meaning');
  if (spirals.ecological.active && spirals.ecological.monthsActive >= 12) names.push('Ecological');
  return names;
}

/**
 * Get virtuous cascade multiplier for external use
 * (e.g., breakthroughTechnologies.ts can use this to accelerate research)
 */
export function getVirtuousCascadeMultiplier(state: GameState): number {
  return state.upwardSpirals.cascadeStrength;
}

/**
 * 🔍 DIAGNOSTIC: Log detailed spiral status
 * Shows what's working and what's blocking each spiral
 */
function logSpiralDiagnostics(state: GameState, currentMonth: number): void {
  const spirals = state.upwardSpirals;
  const qol = state.qualityOfLifeSystems;
  const social = state.socialAccumulation;
  const env = state.environmentalAccumulation;
  const gov = state.government.governanceQuality;

  const years = Math.floor(currentMonth / 12);
  const months = currentMonth % 12;
  const timeDisplay = years > 0 ? `Year ${years}, Month ${months + 1}` : `Month ${months + 1}`;

  // DIAGNOSTIC LOGS - Comment out for production, aggregate with eventAggregator instead
  // console.log(`\n🔍 SPIRAL DIAGNOSTICS (${timeDisplay})`);
  // console.log(`================================================================================`);

  // Count active spirals
  const activeSpiralNames = getActiveSpiralNames(spirals);

  // Aggregate spiral status via eventAggregator (method doesn't exist yet)
  // const aggregator = (state as any).eventAggregator;
  // if (aggregator && aggregator.recordSpiralStatus) {
  //   aggregator.recordSpiralStatus('all', activeSpiralNames.length);
  // }

  // KEEP only summary - remove detailed breakdowns
  console.log(`Active Spirals: ${activeSpiralNames.length}/6`);
  if (activeSpiralNames.length > 0) {
    console.log(`  ✅ ${activeSpiralNames.join(', ')}`);
  }

  // ABUNDANCE SPIRAL
  const materialAbundant = qol.materialAbundance > 1.5;
  const energyAbundant = qol.energyAvailability > 1.5;
  const timeLiberated = state.society.unemploymentLevel > 0.6 &&
                       state.globalMetrics.economicTransitionStage >= 3;

  // Spiral details - comment out for production (verbose)
  // console.error(`\n📦 ABUNDANCE SPIRAL: ${spirals.abundance.active ? '✅ ACTIVE' : '❌ INACTIVE'}`);
  // console.error(`   Material: ${qol.materialAbundance.toFixed(2)} ${materialAbundant ? '✅' : '❌'} (need >1.5)`);
  // console.error(`   Energy: ${qol.energyAvailability.toFixed(2)} ${energyAbundant ? '✅' : '❌'} (need >1.5)`);
  // console.error(`   Time Liberation: unemployment ${(state.society.unemploymentLevel * 100).toFixed(0)}%, stage ${state.globalMetrics.economicTransitionStage} ${timeLiberated ? '✅' : '❌'} (need >60% + stage 3+)`);

  // COGNITIVE SPIRAL
  const avgAI = state.aiAgents.length > 0 ? (() => {
    const capabilitySum = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
    return assertFinite(capabilitySum / state.aiAgents.length, {
      location: 'checkCognitiveSpiral',
      valueName: 'avgAI',
      month: state.currentMonth,
      additionalInfo: { capabilitySum, agentCount: state.aiAgents.length }
    });
  })() : 0;
  const mentalHealthy = qol.diseasesBurden < 0.3 && qol.healthcareQuality > 0.8;
  const purposeful = social.meaningCrisisLevel < 0.3;
  const trustInAI = getTrustInAI(state.society); // Phase 2: Use paranoia-derived trust
  const cognitiveEnhanced = avgAI > 1.5 && trustInAI > 0.6;

  // console.error(`\n🧠 COGNITIVE SPIRAL: ${spirals.cognitive.active ? '✅ ACTIVE' : '❌ INACTIVE'}`);
  // console.error(`   Mental Health: disease ${(qol.diseasesBurden * 100).toFixed(0)}%, healthcare ${(qol.healthcareQuality * 100).toFixed(0)}% ${mentalHealthy ? '✅' : '❌'} (need <30% disease, >80% healthcare)`);
  // console.error(`   Purpose: meaning crisis ${(social.meaningCrisisLevel * 100).toFixed(0)}% ${purposeful ? '✅' : '❌'} (need <30%)`);
  // console.error(`   AI Augmentation: avg capability ${avgAI.toFixed(2)}, trust ${(trustInAI * 100).toFixed(0)}% ${cognitiveEnhanced ? '✅' : '❌'} (need >1.5 capability, >60% trust)`);

  // DEMOCRATIC SPIRAL
  const qualityGovernance = gov.decisionQuality > 0.7 && gov.institutionalCapacity > 0.7;
  const democraticEngagement = gov.participationRate > 0.6 && gov.transparency > 0.7;
  const notAuth = state.government.governmentType !== 'authoritarian';

  // console.error(`\n🗳️  DEMOCRATIC SPIRAL: ${spirals.democratic.active ? '✅ ACTIVE' : '❌ INACTIVE'}`);
  // console.error(`   Governance Quality: decision ${(gov.decisionQuality * 100).toFixed(0)}%, capacity ${(gov.institutionalCapacity * 100).toFixed(0)}% ${qualityGovernance ? '✅' : '❌'} (need both >70%)`);
  // console.error(`   Democratic Engagement: participation ${(gov.participationRate * 100).toFixed(0)}%, transparency ${(gov.transparency * 100).toFixed(0)}% ${democraticEngagement ? '✅' : '❌'} (need >60% participation, >70% transparency)`);
  // console.error(`   Government Type: ${state.government.governmentType} ${notAuth ? '✅' : '❌'} (cannot be authoritarian)`);

  // SCIENTIFIC SPIRAL
  const unlockedCount = getUnlockedTechCount(state);
  const deployedCount = getDeployedTechCount(state, 0.5);
  // FIX (Nov 8, 2025): Use totalBudget instead of broken reduce (same bug as line 237)
  const totalResearch = state.government.researchInvestments.totalBudget;
  const researchIntensive = totalResearch > 50;
  const aiAccelerated = avgAI > 1.2; // Lowered from 2.0 - AI already accelerating science at GPT-4 level

  // console.error(`\n🔬 SCIENTIFIC SPIRAL: ${spirals.scientific.active ? '✅ ACTIVE' : '❌ INACTIVE'}`);
  // console.error(`   Breakthroughs: ${unlockedCount} unlocked, ${deployedCount} deployed ${deployedCount >= 4 ? '✅' : '❌'} (need 4+ deployed >50%)`);
  // console.error(`   Research Investment: $${totalResearch.toFixed(1)}B/month ${researchIntensive ? '✅' : '❌'} (need >$50B/month)`);
  // console.error(`   AI Acceleration: avg capability ${avgAI.toFixed(2)} ${aiAccelerated ? '✅' : '❌'} (need >1.2)`);

  // MEANING SPIRAL
  const meaningFulfilled = social.meaningCrisisLevel < 0.2;
  const avgCohesionDebug = (social.socialCohesion.trust + social.socialCohesion.communityBonds + social.socialCohesion.civilLiberties) / 300;
  const strongCommunity = avgCohesionDebug > 0.7;
  const culturallyAdapted = social.culturalAdaptation > 0.7;
  const autonomous = qol.autonomy > 0.7 && qol.culturalVitality > 0.7;

  // console.error(`\n💫 MEANING SPIRAL: ${spirals.meaning.active ? '✅ ACTIVE' : '❌ INACTIVE'}`);
  // console.error(`   Meaning Crisis: ${(social.meaningCrisisLevel * 100).toFixed(0)}% ${meaningFulfilled ? '✅' : '❌'} (need <20%)`);
  // console.error(`   Community: ${(avgCohesionDebug * 100).toFixed(0)}% ${strongCommunity ? '✅' : '❌'} (need >70%)`);
  // console.error(`   Cultural Adaptation: ${(social.culturalAdaptation * 100).toFixed(0)}% ${culturallyAdapted ? '✅' : '❌'} (need >70%)`);
  // console.error(`   Autonomy & Creativity: autonomy ${(qol.autonomy * 100).toFixed(0)}%, cultural ${(qol.culturalVitality * 100).toFixed(0)}% ${autonomous ? '✅' : '❌'} (need both >70%)`);

  // ECOLOGICAL SPIRAL
  const envSustainable = env.resourceReserves > 0.7 && env.pollutionLevel < 0.3;
  const climateSafe = env.climateStability > 0.7;
  const bioHealthy = env.biodiversityIndex > 0.7;

  // console.error(`\n🌍 ECOLOGICAL SPIRAL: ${spirals.ecological.active ? '✅ ACTIVE' : '❌ INACTIVE'}`);
  // console.error(`   Environmental: resources ${(env.resourceReserves * 100).toFixed(0)}%, pollution ${(env.pollutionLevel * 100).toFixed(0)}% ${envSustainable ? '✅' : '❌'} (need >70% resources, <30% pollution)`);
  // console.error(`   Climate: ${(env.climateStability * 100).toFixed(0)}% ${climateSafe ? '✅' : '❌'} (need >70%)`);
  // console.error(`   Biodiversity: ${(env.biodiversityIndex * 100).toFixed(0)}% ${bioHealthy ? '✅' : '❌'} (need >70%)`);

  // VIRTUOUS CASCADE
  // console.error(`\n✨ VIRTUOUS CASCADE: ${spirals.cascadeActive ? '✅ ACTIVE' : '❌ INACTIVE'}`);
  // console.log(`   Active Count: ${activeSpialNames.length}/6 (need 4+ for cascade)`);
  // if (spirals.cascadeActive) {
  //   console.log(`   Cascade Strength: ${spirals.cascadeStrength.toFixed(2)}x`);
  //   console.log(`   Cascade Duration: ${spirals.cascadeMonths} months (need 6+ for Utopia)`);
  // }

  // UTOPIA CHECK
  const utopiaResult = canDeclareUtopia(state);
  // KEEP Utopia eligibility - this is critical
  console.error(`\n✅ UTOPIA ELIGIBILITY: ${utopiaResult.can ? '✅ ELIGIBLE' : '🔄 NOT YET'}`);
  console.log(`   ${utopiaResult.reason}`);
  if (utopiaResult.spiralCount < 3) {
    const sustainedNames = getSustainedSpiralNames(spirals);
    if (sustainedNames.length > 0) {
      console.log(`   Sustained spirals (12+ months): ${sustainedNames.join(', ')}`);
    }
  }
  // console.log(`================================================================================\n`);
}

/**
 * 🔍 ENHANCED DIAGNOSTIC: Detailed spiral activation diagnostics
 * Called from god mode test to show EXACTLY why spirals aren't activating
 */
export function logSpiralActivationDiagnostics(state: GameState, currentMonth: number): void {
  const spirals = state.upwardSpirals;
  const qol = state.qualityOfLifeSystems;
  const social = state.socialAccumulation;
  const env = state.environmentalAccumulation;
  const gov = state.government.governanceQuality;

  console.log(`\n=== SPIRAL ACTIVATION DIAGNOSTICS (Month ${currentMonth}) ===`);

  // ABUNDANCE SPIRAL
  const materialAbundant = qol.materialAbundance > 1.5;
  const energyAbundant = qol.energyAvailability > 1.5;
  const timeLiberated = state.society.unemploymentLevel > 0.6 &&
                       state.globalMetrics.economicTransitionStage >= 3;

  console.log(`\n  🌟 Abundance Spiral: ${spirals.abundance.active ? '✅ ACTIVE' : '❌ INACTIVE'}`);
  if (spirals.abundance.active) {
    console.log(`     Strength: ${spirals.abundance.strength.toFixed(2)}`);
    console.log(`     Months active: ${spirals.abundance.monthsActive}`);
  } else {
    console.log(`     Material abundant (>1.5): ${materialAbundant ? '✅' : '❌'} (${qol.materialAbundance.toFixed(2)})`);
    console.log(`     Energy abundant (>1.5): ${energyAbundant ? '✅' : '❌'} (${qol.energyAvailability.toFixed(2)})`);
    console.log(`     Time liberated (unemp >0.6 + stage >=3): ${timeLiberated ? '✅' : '❌'} (unemp=${(state.society.unemploymentLevel * 100).toFixed(1)}%, stage=${state.globalMetrics.economicTransitionStage})`);
  }

  // COGNITIVE SPIRAL
  const comprehensiveTrust = calculateComprehensiveTrustInAI(state);
  const demonstratedBenefits = state.globalMetrics.qualityOfLife > 0.5;
  const mentalHealthy = qol.diseasesBurden < 0.3 && qol.healthcareQuality > 0.8;
  const purposeful = social.meaningCrisisLevel < 0.3;
  const cognitiveEnhanced = demonstratedBenefits && comprehensiveTrust > TRUST_THRESHOLD_ACCEPTANCE;

  console.log(`\n  🧠 Cognitive Spiral: ${spirals.cognitive.active ? '✅ ACTIVE' : '❌ INACTIVE'}`);
  if (spirals.cognitive.active) {
    console.log(`     Strength: ${spirals.cognitive.strength.toFixed(2)}`);
    console.log(`     Months active: ${spirals.cognitive.monthsActive}`);
  } else {
    console.log(`     Mental health (disease <0.3 + healthcare >0.8): ${mentalHealthy ? '✅' : '❌'} (disease=${(qol.diseasesBurden * 100).toFixed(1)}%, healthcare=${(qol.healthcareQuality * 100).toFixed(1)}%)`);
    console.log(`     Purposeful (meaning crisis <0.3): ${purposeful ? '✅' : '❌'} (${(social.meaningCrisisLevel * 100).toFixed(1)}%)`);
    console.log(`     Cognitive enhancement: ${cognitiveEnhanced ? '✅' : '❌'}`);
    console.log(`       - Demonstrated benefits (QoL >0.5): ${demonstratedBenefits ? '✅' : '❌'} (${(state.globalMetrics.qualityOfLife * 100).toFixed(1)}%)`);
    console.log(`       - Trust threshold (>${(TRUST_THRESHOLD_ACCEPTANCE * 100).toFixed(0)}%): ${comprehensiveTrust > TRUST_THRESHOLD_ACCEPTANCE ? '✅' : '❌'} (${(comprehensiveTrust * 100).toFixed(1)}%)`);
  }

  // DEMOCRATIC SPIRAL
  const qualityGovernance = gov.decisionQuality > 0.7 && gov.institutionalCapacity > 0.7;
  const democraticEngagement = gov.participationRate > 0.6 && gov.transparency > 0.7;
  const notAuthoritarian = state.government.governmentType !== 'authoritarian';

  console.log(`\n  🗳️  Democratic Spiral: ${spirals.democratic.active ? '✅ ACTIVE' : '❌ INACTIVE'}`);
  if (spirals.democratic.active) {
    console.log(`     Strength: ${spirals.democratic.strength.toFixed(2)}`);
    console.log(`     Months active: ${spirals.democratic.monthsActive}`);
  } else {
    console.log(`     Quality governance (decision >0.7 + capacity >0.7): ${qualityGovernance ? '✅' : '❌'} (decision=${(gov.decisionQuality * 100).toFixed(1)}%, capacity=${(gov.institutionalCapacity * 100).toFixed(1)}%)`);
    console.log(`     Democratic engagement (participation >0.6 + transparency >0.7): ${democraticEngagement ? '✅' : '❌'} (participation=${(gov.participationRate * 100).toFixed(1)}%, transparency=${(gov.transparency * 100).toFixed(1)}%)`);
    console.log(`     Not authoritarian: ${notAuthoritarian ? '✅' : '❌'} (type=${state.government.governmentType})`);
  }

  // SCIENTIFIC SPIRAL
  const unlockedCount = getUnlockedTechCount(state);
  const deployedCount = getDeployedTechCount(state, 0.5);
  const totalResearch = state.government.researchInvestments.totalBudget;
  const researchIntensive = totalResearch > 50;
  const avgAICapability = state.aiAgents.length > 0 ? (() => {
    const capabilitySum = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
    return assertFinite(capabilitySum / state.aiAgents.length, {
      location: 'logSpiralActivationDiagnostics',
      valueName: 'avgAICapability',
      month: state.currentMonth,
      additionalInfo: { capabilitySum, agentCount: state.aiAgents.length }
    });
  })() : 0;
  const aiAccelerated = avgAICapability > 1.2;
  const deploymentThreshold = avgAICapability > 4.0 ? 3 : 4;
  const workflowAdaptation = assertStateProperty(
    state.society,
    'workflowAdaptation',
    {
      location: 'logSpiralActivationDiagnostics',
      month: currentMonth,
      expectedSource: 'initialization.ts:society'
    }
  );
  const workflowAdapted = workflowAdaptation >= 0.25;
  const deployedCheck = deployedCount >= deploymentThreshold;

  console.log(`\n  🔬 Scientific Spiral: ${spirals.scientific.active ? '✅ ACTIVE' : '❌ INACTIVE'}`);
  if (spirals.scientific.active) {
    console.log(`     Strength: ${spirals.scientific.strength.toFixed(2)}`);
    console.log(`     Months active: ${spirals.scientific.monthsActive}`);
  } else {
    console.log(`     Deployed breakthroughs (>=${deploymentThreshold}): ${deployedCheck ? '✅' : '❌'} (${deployedCount}/${unlockedCount} deployed)`);
    console.log(`     Research intensive (>$50B/month): ${researchIntensive ? '✅' : '❌'} ($${totalResearch.toFixed(1)}B/month)`);
    console.log(`     AI accelerated (>1.2 capability): ${aiAccelerated ? '✅' : '❌'} (${avgAICapability.toFixed(2)})`);
    console.log(`     Workflow adapted (>=25%): ${workflowAdapted ? '✅' : '❌'} (${(workflowAdaptation * 100).toFixed(1)}%)`);
  }

  // MEANING SPIRAL
  const meaningFulfilled = social.meaningCrisisLevel < 0.2;
  const avgCohesion = (social.socialCohesion.trust + social.socialCohesion.communityBonds + social.socialCohesion.civilLiberties) / 300;
  const strongCommunity = avgCohesion > 0.7;
  const culturallyAdapted = social.culturalAdaptation > 0.7;
  const autonomous = qol.autonomy > 0.7 && qol.culturalVitality > 0.7;

  console.log(`\n  💫 Meaning Spiral: ${spirals.meaning.active ? '✅ ACTIVE' : '❌ INACTIVE'}`);
  if (spirals.meaning.active) {
    console.log(`     Strength: ${spirals.meaning.strength.toFixed(2)}`);
    console.log(`     Months active: ${spirals.meaning.monthsActive}`);
  } else {
    console.log(`     Meaning fulfilled (<20% crisis): ${meaningFulfilled ? '✅' : '❌'} (${(social.meaningCrisisLevel * 100).toFixed(1)}%)`);
    console.log(`     Strong community (>70%): ${strongCommunity ? '✅' : '❌'} (${(avgCohesion * 100).toFixed(1)}%)`);
    console.log(`     Culturally adapted (>70%): ${culturallyAdapted ? '✅' : '❌'} (${(social.culturalAdaptation * 100).toFixed(1)}%)`);
    console.log(`     Autonomous (autonomy >0.7 + cultural >0.7): ${autonomous ? '✅' : '❌'} (autonomy=${(qol.autonomy * 100).toFixed(1)}%, cultural=${(qol.culturalVitality * 100).toFixed(1)}%)`);
  }

  // ECOLOGICAL SPIRAL
  const ecosystemHealthy = qol.ecosystemHealth > 0.7;
  const climateStable = env.climateStability > 0.7;
  const biodiverseHealthy = env.biodiversityIndex > 0.7;
  const clean = env.pollutionLevel < 0.3;
  const sustainable = env.resourceReserves > 0.7;

  console.log(`\n  🌍 Ecological Spiral: ${spirals.ecological.active ? '✅ ACTIVE' : '❌ INACTIVE'}`);
  if (spirals.ecological.active) {
    console.log(`     Strength: ${spirals.ecological.strength.toFixed(2)}`);
    console.log(`     Months active: ${spirals.ecological.monthsActive}`);
  } else {
    console.log(`     Ecosystem health (>0.7): ${ecosystemHealthy ? '✅' : '❌'} (${(qol.ecosystemHealth * 100).toFixed(1)}%)`);
    console.log(`     Climate stable (>0.7): ${climateStable ? '✅' : '❌'} (${(env.climateStability * 100).toFixed(1)}%)`);
    console.log(`     Biodiversity healthy (>0.7): ${biodiverseHealthy ? '✅' : '❌'} (${(env.biodiversityIndex * 100).toFixed(1)}%)`);
    console.log(`     Clean (<30% pollution): ${clean ? '✅' : '❌'} (${(env.pollutionLevel * 100).toFixed(1)}%)`);
    console.log(`     Sustainable (>70% reserves): ${sustainable ? '✅' : '❌'} (${(env.resourceReserves * 100).toFixed(1)}%)`);
  }

  // VIRTUOUS CASCADE
  const activeCount = [
    spirals.abundance,
    spirals.cognitive,
    spirals.democratic,
    spirals.scientific,
    spirals.meaning,
    spirals.ecological
  ].filter(s => s.active).length;

  console.log(`\n  🌊 Virtuous Cascade: ${spirals.cascadeActive ? '✅ ACTIVE' : '❌ INACTIVE'}`);
  if (spirals.cascadeActive) {
    console.log(`     Cascade strength: ${spirals.cascadeStrength.toFixed(2)}x`);
    console.log(`     Cascade months: ${spirals.cascadeMonths}`);
  } else {
    console.log(`     Active spirals: ${activeCount}/6 (need 4+ for cascade)`);
  }
}

