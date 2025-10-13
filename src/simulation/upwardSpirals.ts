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
import { getTrustInAI } from './socialCohesion';

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
 */
function updateCognitiveSpiral(spiral: UpwardSpiral, state: GameState, month: number): void {
  const qol = state.qualityOfLifeSystems;
  const social = state.socialAccumulation;
  
  // Mental health: Low disease burden, high healthcare quality
  const mentalHealthy = qol.diseasesBurden < 0.3 && qol.healthcareQuality > 0.8;
  
  // Purpose: Low meaning crisis (people have direction)
  const purposeful = social.meaningCrisisLevel < 0.3;
  
  // Cognitive enhancement: AI augmentation available
  const avgAICapability = state.aiAgents.length > 0 ?
    state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / state.aiAgents.length : 0;
  const trustInAI = getTrustInAI(state.society); // Phase 2: Use paranoia-derived trust
  const cognitiveEnhanced = avgAICapability > 1.5 && trustInAI > 0.6;
  
  const wasActive = spiral.active;
  spiral.active = mentalHealthy && purposeful && cognitiveEnhanced;
  
  if (spiral.active) {
    spiral.strength = (
      (1 - qol.diseasesBurden) * 0.3 +
      (1 - social.meaningCrisisLevel) * 0.4 +
      Math.min(1.0, avgAICapability / 3.0) * 0.3
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
    spiral.strength = (
      gov.decisionQuality * 0.25 +
      gov.institutionalCapacity * 0.2 +
      gov.participationRate * 0.25 +
      gov.transparency * 0.2 +
      gov.consensusBuildingEfficiency * 0.1
    );
  } else {
    spiral.strength = 0;
  }
  
  updateSpiralTracking(spiral, wasActive, month);
}

/**
 * SPIRAL 4: Scientific Acceleration
 * Breakthrough rate + Research investment + Discovery speed
 * "Science is accelerating exponentially"
 */
function updateScientificSpiral(spiral: UpwardSpiral, state: GameState, month: number): void {
  const breakthrough = state.breakthroughTech;
  
  // Count unlocked breakthroughs
  const unlockedCount = Object.values(breakthrough).filter((t: any) => t?.unlocked).length;
  
  // Count deployed breakthroughs (>50%)
  const deployedCount = Object.values(breakthrough)
    .filter((t: any) => t?.deploymentLevel && t.deploymentLevel > 0.5).length;
  
  // Research investment (as % of economy)
  const researchInvestments = state.government.researchInvestments;
  const totalResearch = Object.values(researchInvestments).reduce((sum, val) => sum + (Number(val) || 0), 0);
  const researchIntensive = totalResearch > 50; // $50B+/month
  
  // AI-accelerated research
  const avgAICapability = state.aiAgents.length > 0 ?
    state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / state.aiAgents.length : 0;
  const aiAccelerated = avgAICapability > 1.2; // Lowered from 2.0 - AI is already 3x-ing papers at GPT-4 level
  
  const wasActive = spiral.active;
  // Need multiple breakthroughs DEPLOYED (>50%) AND ongoing investment AND AI acceleration
  const deployedCheck = deployedCount >= 4;
  spiral.active = deployedCheck && researchIntensive && aiAccelerated;
  
  // Aggregate spiral diagnostics (removed verbose debug logs)
  
  if (spiral.active) {
    spiral.strength = (
      Math.min(1.0, unlockedCount / 8) * 0.3 +
      Math.min(1.0, deployedCount / 6) * 0.3 +
      Math.min(1.0, (totalResearch || 0) / 100) * 0.2 +
      Math.min(1.0, avgAICapability / 4.0) * 0.2
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
 */
function updateMeaningSpiral(spiral: UpwardSpiral, state: GameState, month: number): void {
  const social = state.socialAccumulation;
  const qol = state.qualityOfLifeSystems;
  
  // Low meaning crisis
  const meaningFulfilled = social.meaningCrisisLevel < 0.2;
  
  // High social cohesion (community bonds)
  const strongCommunity = social.socialCohesion > 0.7;
  
  // Cultural adaptation (people adapted to post-work life)
  const culturallyAdapted = social.culturalAdaptation > 0.7;
  
  // Autonomy & creativity (freedom to pursue purpose)
  const autonomous = qol.autonomy > 0.7 && qol.culturalVitality > 0.7;
  
  const wasActive = spiral.active;
  spiral.active = meaningFulfilled && strongCommunity && culturallyAdapted && autonomous;
  
  if (spiral.active) {
    spiral.strength = (
      (1 - social.meaningCrisisLevel) * 0.3 +
      social.socialCohesion * 0.25 +
      social.culturalAdaptation * 0.25 +
      (qol.autonomy + qol.culturalVitality) / 2 * 0.2
    );
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
      console.log(`\n🌟✨ VIRTUOUS CASCADE BEGINS (${timeDisplay})`);
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
      console.log(`\n⚠️  VIRTUOUS CASCADE ENDED (${timeDisplay})`);
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
  
  // Boost social cohesion recovery
  const social = state.socialAccumulation;
  if (social.socialCohesion < 1.0) {
    social.socialCohesion = Math.min(1.0, social.socialCohesion + boost * 0.01);
  }
  
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
  const breakthrough = state.breakthroughTech;
  
  const years = Math.floor(currentMonth / 12);
  const months = currentMonth % 12;
  const timeDisplay = years > 0 ? `Year ${years}, Month ${months + 1}` : `Month ${months + 1}`;
  
  // DIAGNOSTIC LOGS - Comment out for production, aggregate with eventAggregator instead
  // console.log(`\n🔍 SPIRAL DIAGNOSTICS (${timeDisplay})`);
  // console.log(`================================================================================`);
  
  // Count active spirals
  const activeSpiralNames = getActiveSpiralNames(spirals);
  
  // Aggregate spiral status via eventAggregator
  const aggregator = (state as any).eventAggregator;
  if (aggregator && aggregator.recordSpiralStatus) {
    aggregator.recordSpiralStatus('all', activeSpiralNames.length);
  }
  
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
  // console.log(`\n📦 ABUNDANCE SPIRAL: ${spirals.abundance.active ? '✅ ACTIVE' : '❌ INACTIVE'}`);
  // console.log(`   Material: ${qol.materialAbundance.toFixed(2)} ${materialAbundant ? '✅' : '❌'} (need >1.5)`);
  // console.log(`   Energy: ${qol.energyAvailability.toFixed(2)} ${energyAbundant ? '✅' : '❌'} (need >1.5)`);
  // console.log(`   Time Liberation: unemployment ${(state.society.unemploymentLevel * 100).toFixed(0)}%, stage ${state.globalMetrics.economicTransitionStage} ${timeLiberated ? '✅' : '❌'} (need >60% + stage 3+)`);
  
  // COGNITIVE SPIRAL
  const avgAI = state.aiAgents.length > 0 ? state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / state.aiAgents.length : 0;
  const mentalHealthy = qol.diseasesBurden < 0.3 && qol.healthcareQuality > 0.8;
  const purposeful = social.meaningCrisisLevel < 0.3;
  const trustInAI = getTrustInAI(state.society); // Phase 2: Use paranoia-derived trust
  const cognitiveEnhanced = avgAI > 1.5 && trustInAI > 0.6;
  
  // console.log(`\n🧠 COGNITIVE SPIRAL: ${spirals.cognitive.active ? '✅ ACTIVE' : '❌ INACTIVE'}`);
  // console.log(`   Mental Health: disease ${(qol.diseasesBurden * 100).toFixed(0)}%, healthcare ${(qol.healthcareQuality * 100).toFixed(0)}% ${mentalHealthy ? '✅' : '❌'} (need <30% disease, >80% healthcare)`);
  // console.log(`   Purpose: meaning crisis ${(social.meaningCrisisLevel * 100).toFixed(0)}% ${purposeful ? '✅' : '❌'} (need <30%)`);
  // console.log(`   AI Augmentation: avg capability ${avgAI.toFixed(2)}, trust ${(trustInAI * 100).toFixed(0)}% ${cognitiveEnhanced ? '✅' : '❌'} (need >1.5 capability, >60% trust)`);
  
  // DEMOCRATIC SPIRAL
  const qualityGovernance = gov.decisionQuality > 0.7 && gov.institutionalCapacity > 0.7;
  const democraticEngagement = gov.participationRate > 0.6 && gov.transparency > 0.7;
  const notAuth = state.government.governmentType !== 'authoritarian';
  
  // console.log(`\n🗳️  DEMOCRATIC SPIRAL: ${spirals.democratic.active ? '✅ ACTIVE' : '❌ INACTIVE'}`);
  // console.log(`   Governance Quality: decision ${(gov.decisionQuality * 100).toFixed(0)}%, capacity ${(gov.institutionalCapacity * 100).toFixed(0)}% ${qualityGovernance ? '✅' : '❌'} (need both >70%)`);
  // console.log(`   Democratic Engagement: participation ${(gov.participationRate * 100).toFixed(0)}%, transparency ${(gov.transparency * 100).toFixed(0)}% ${democraticEngagement ? '✅' : '❌'} (need >60% participation, >70% transparency)`);
  // console.log(`   Government Type: ${state.government.governmentType} ${notAuth ? '✅' : '❌'} (cannot be authoritarian)`);
  
  // SCIENTIFIC SPIRAL
  const unlockedCount = Object.values(breakthrough).filter((t: any) => t?.unlocked).length;
  const deployedCount = Object.values(breakthrough).filter((t: any) => t?.deploymentLevel && t.deploymentLevel > 0.5).length;
  const totalResearch = Object.values(state.government.researchInvestments).reduce((sum, val) => sum + (Number(val) || 0), 0);
  const researchIntensive = totalResearch > 50;
  const aiAccelerated = avgAI > 1.2; // Lowered from 2.0 - AI already accelerating science at GPT-4 level
  
  // console.log(`\n🔬 SCIENTIFIC SPIRAL: ${spirals.scientific.active ? '✅ ACTIVE' : '❌ INACTIVE'}`);
  // console.log(`   Breakthroughs: ${unlockedCount} unlocked, ${deployedCount} deployed ${deployedCount >= 4 ? '✅' : '❌'} (need 4+ deployed >50%)`);
  // console.log(`   Research Investment: $${Number(totalResearch || 0).toFixed(1)}B/month ${researchIntensive ? '✅' : '❌'} (need >$50B/month)`);
  // console.log(`   AI Acceleration: avg capability ${avgAI.toFixed(2)} ${aiAccelerated ? '✅' : '❌'} (need >1.2)`);
  
  // MEANING SPIRAL
  const meaningFulfilled = social.meaningCrisisLevel < 0.2;
  const strongCommunity = social.socialCohesion > 0.7;
  const culturallyAdapted = social.culturalAdaptation > 0.7;
  const autonomous = qol.autonomy > 0.7 && qol.culturalVitality > 0.7;
  
  // console.log(`\n💫 MEANING SPIRAL: ${spirals.meaning.active ? '✅ ACTIVE' : '❌ INACTIVE'}`);
  // console.log(`   Meaning Crisis: ${(social.meaningCrisisLevel * 100).toFixed(0)}% ${meaningFulfilled ? '✅' : '❌'} (need <20%)`);
  // console.log(`   Community: ${(social.socialCohesion * 100).toFixed(0)}% ${strongCommunity ? '✅' : '❌'} (need >70%)`);
  // console.log(`   Cultural Adaptation: ${(social.culturalAdaptation * 100).toFixed(0)}% ${culturallyAdapted ? '✅' : '❌'} (need >70%)`);
  // console.log(`   Autonomy & Creativity: autonomy ${(qol.autonomy * 100).toFixed(0)}%, cultural ${(qol.culturalVitality * 100).toFixed(0)}% ${autonomous ? '✅' : '❌'} (need both >70%)`);
  
  // ECOLOGICAL SPIRAL
  const envSustainable = env.resourceReserves > 0.7 && env.pollutionLevel < 0.3;
  const climateSafe = env.climateStability > 0.7;
  const bioHealthy = env.biodiversityIndex > 0.7;
  
  // console.log(`\n🌍 ECOLOGICAL SPIRAL: ${spirals.ecological.active ? '✅ ACTIVE' : '❌ INACTIVE'}`);
  // console.log(`   Environmental: resources ${(env.resourceReserves * 100).toFixed(0)}%, pollution ${(env.pollutionLevel * 100).toFixed(0)}% ${envSustainable ? '✅' : '❌'} (need >70% resources, <30% pollution)`);
  // console.log(`   Climate: ${(env.climateStability * 100).toFixed(0)}% ${climateSafe ? '✅' : '❌'} (need >70%)`);
  // console.log(`   Biodiversity: ${(env.biodiversityIndex * 100).toFixed(0)}% ${bioHealthy ? '✅' : '❌'} (need >70%)`);
  
  // VIRTUOUS CASCADE
  // console.log(`\n✨ VIRTUOUS CASCADE: ${spirals.cascadeActive ? '✅ ACTIVE' : '❌ INACTIVE'}`);
  // console.log(`   Active Count: ${activeSpialNames.length}/6 (need 4+ for cascade)`);
  // if (spirals.cascadeActive) {
  //   console.log(`   Cascade Strength: ${spirals.cascadeStrength.toFixed(2)}x`);
  //   console.log(`   Cascade Duration: ${spirals.cascadeMonths} months (need 6+ for Utopia)`);
  // }
  
  // UTOPIA CHECK
  const utopiaResult = canDeclareUtopia(state);
  // KEEP Utopia eligibility - this is critical
  console.log(`\n🌟 UTOPIA ELIGIBILITY: ${utopiaResult.can ? '✅ ELIGIBLE' : '❌ NOT YET'}`);
  console.log(`   ${utopiaResult.reason}`);
  if (utopiaResult.spiralCount < 3) {
    const sustainedNames = getSustainedSpiralNames(spirals);
    if (sustainedNames.length > 0) {
      console.log(`   Sustained spirals (12+ months): ${sustainedNames.join(', ')}`);
    }
  }
  // console.log(`================================================================================\n`);
}

