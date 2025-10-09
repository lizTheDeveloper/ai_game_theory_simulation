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
  const cognitiveEnhanced = avgAICapability > 1.5 && state.society.trustInAI > 0.6;
  
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
    .filter((t: any) => t?.deployed && t.deployed > 0.5).length;
  
  // Research investment (as % of economy)
  const researchInvestments = state.government.researchInvestments;
  const totalResearch = Object.values(researchInvestments).reduce((sum, val) => sum + val, 0);
  const researchIntensive = totalResearch > 50; // $50B+/month
  
  // AI-accelerated research
  const avgAICapability = state.aiAgents.length > 0 ?
    state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / state.aiAgents.length : 0;
  const aiAccelerated = avgAICapability > 2.0;
  
  const wasActive = spiral.active;
  // Need multiple breakthroughs AND ongoing investment AND AI acceleration
  spiral.active = unlockedCount >= 4 && researchIntensive && aiAccelerated;
  
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
      console.log(`\n🌟✨ VIRTUOUS CASCADE BEGINS (Month ${month})`);
      console.log(`   ${activeCount} upward spirals active → ${spirals.cascadeStrength.toFixed(1)}x amplification`);
      console.log(`   Active spirals: ${getActiveSpiralNames(spirals).join(', ')}\n`);
    } else {
      spirals.cascadeMonths++;
    }
  } else {
    if (wasInCascade) {
      console.log(`\n⚠️  VIRTUOUS CASCADE ENDED (Month ${month})`);
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

