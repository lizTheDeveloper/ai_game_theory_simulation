/**
 * Conflict Resolution & Peace Systems - Phase 2F
 * 
 * Complements nuclear war fix with defensive/peaceful mechanics
 * 
 * The 3 Peace Pillars:
 * 1. AI-Mediated Diplomacy - High-capability aligned AI can defuse geopolitical crises
 * 2. Post-Scarcity Peace Dividend - Material abundance eliminates resource conflicts
 * 3. Cyber Defense Improvements - Make defense > offense, prevent military system hacking
 * 
 * Key Insight: Extinction via conflict should become HARDER as society improves, not just "random chance"
 */

import type { GameState } from '../types/game';
import { clamp } from './utils';

export interface ConflictResolutionState {
  // AI-Mediated Diplomacy
  diplomaticAICapability: number;     // [0,5] AI capability for negotiation & conflict resolution
  diplomaticSuccessRate: number;      // [0,1] Historical success at preventing conflicts
  activeDiplomaticInterventions: number; // Count of ongoing AI-mediated negotiations
  
  // Post-Scarcity Peace
  resourceConflictRisk: number;       // [0,1] Risk of war over resources (inverse of abundance)
  foodSecurityPeace: number;          // [0,1] Food abundance reduces conflict
  energySecurityPeace: number;        // [0,1] Energy abundance reduces conflict
  materialSecurityPeace: number;      // [0,1] Material abundance reduces conflict
  
  // Cyber Defense
  cyberDefenseStrength: number;       // [0,5] Capability to defend against AI attacks
  offenseDefenseBalance: number;      // [-1,1] -1=offense dominates, +1=defense dominates
  militarySystemSecurity: number;     // [0,1] Protection of nuclear/weapons systems
  criticalInfraSecurity: number;      // [0,1] Protection of power/water/communication
  
  // Overall Peace Level
  globalPeaceLevel: number;           // [0,1] Combined metric of all peace factors
  conflictPreventionBonus: number;    // [0,0.5] Reduction in conflict probability
}

export function initializeConflictResolution(): ConflictResolutionState {
  return {
    // AI Diplomacy (weak initially)
    diplomaticAICapability: 0.5,
    diplomaticSuccessRate: 0.3,
    activeDiplomaticInterventions: 0,
    
    // Post-Scarcity Peace (resource competition high)
    resourceConflictRisk: 0.6,
    foodSecurityPeace: 0.4,
    energySecurityPeace: 0.4,
    materialSecurityPeace: 0.5,
    
    // Cyber Defense (offense dominates initially)
    cyberDefenseStrength: 1.0,
    offenseDefenseBalance: -0.3, // Offense easier than defense
    militarySystemSecurity: 0.5,
    criticalInfraSecurity: 0.6,
    
    // Overall
    globalPeaceLevel: 0.4,
    conflictPreventionBonus: 0.0
  };
}

/**
 * Update conflict resolution systems each month
 */
export function updateConflictResolution(state: GameState): void {
  const peace = state.conflictResolution;
  
  // Update AI-mediated diplomacy capabilities
  updateDiplomaticAI(peace, state);
  
  // Update post-scarcity peace dividend
  updatePostScarcityPeace(peace, state);
  
  // Update cyber defense posture
  updateCyberDefense(peace, state);
  
  // Calculate overall peace level and conflict prevention
  calculateGlobalPeace(peace, state);
}

/**
 * AI-Mediated Diplomacy: High-capability aligned AI can defuse crises
 */
function updateDiplomaticAI(peace: ConflictResolutionState, state: GameState): void {
  // AI capability for social/cognitive tasks (not just brute force)
  const aiAgents = state.aiAgents;
  if (aiAgents.length === 0) return;
  
  // Look for high-capability, well-aligned AI with strong social capability
  let bestDiplomaticAI = 0;
  let avgAlignment = 0;
  
  for (const ai of aiAgents) {
    const alignment = ai.trueAlignment ?? ai.alignment;
    const socialCap = ai.capabilityProfile?.social || ai.capability * 0.3;
    const cognitiveCap = ai.capabilityProfile?.cognitive || ai.capability * 0.3;
    
    // Diplomatic AI needs: social skill, cognitive ability, good alignment
    const diplomaticScore = (socialCap * 0.5 + cognitiveCap * 0.3) * (0.5 + alignment * 0.5);
    bestDiplomaticAI = Math.max(bestDiplomaticAI, diplomaticScore);
    avgAlignment += alignment;
  }
  
  avgAlignment /= aiAgents.length;
  
  // Update diplomatic capability (smoothed)
  const targetCapability = Math.min(5, bestDiplomaticAI);
  peace.diplomaticAICapability += (targetCapability - peace.diplomaticAICapability) * 0.1;
  
  // Success rate improves with capability AND alignment
  const alignmentBonus = avgAlignment > 0.7 ? 0.2 : 0;
  const capabilityBonus = Math.min(0.5, peace.diplomaticAICapability / 10);
  peace.diplomaticSuccessRate = Math.min(0.9, 0.3 + capabilityBonus + alignmentBonus);
  
  // Governance quality affects diplomatic deployment
  const govQuality = state.government.governanceQuality.decisionQuality;
  const deploymentReadiness = govQuality > 0.6 && peace.diplomaticAICapability > 2.0;
  
  if (deploymentReadiness) {
    // Track active interventions (increases with crisis severity)
    const activeCrises = countActiveCrises(state);
    peace.activeDiplomaticInterventions = Math.min(5, activeCrises);
  } else {
    peace.activeDiplomaticInterventions = Math.max(0, peace.activeDiplomaticInterventions - 1);
  }
}

/**
 * Post-Scarcity Peace Dividend: Material abundance eliminates resource wars
 */
function updatePostScarcityPeace(peace: ConflictResolutionState, state: GameState): void {
  const qol = state.qualityOfLifeSystems;
  const economicStage = state.globalMetrics.economicTransitionStage;
  
  // Food security: High food abundance prevents "bread riots" and famine wars
  const foodSecurity = qol.basicNeeds?.foodSecurity !== undefined ? 
    qol.basicNeeds.foodSecurity : 0.7;
  peace.foodSecurityPeace = foodSecurity;
  
  // Energy security: Abundant clean energy eliminates "oil wars"
  const energyAbundance = qol.energyAvailability;
  const cleanEnergyDeployed = state.breakthroughTech.cleanEnergy?.deployed || 0;
  peace.energySecurityPeace = Math.min(1, (energyAbundance / 2.0) * 0.7 + cleanEnergyDeployed * 0.3);
  
  // Material security: Post-scarcity stage means no resource competition
  const materialAbundance = qol.materialAbundance;
  const isPostScarcity = economicStage >= 4.0;
  peace.materialSecurityPeace = Math.min(1, (materialAbundance / 2.0) * 0.8 + (isPostScarcity ? 0.2 : 0));
  
  // Overall resource conflict risk (inverse of peace)
  peace.resourceConflictRisk = 1 - (
    peace.foodSecurityPeace * 0.4 +
    peace.energySecurityPeace * 0.3 +
    peace.materialSecurityPeace * 0.3
  );
}

/**
 * Cyber Defense: Make defense > offense, protect critical systems
 */
function updateCyberDefense(peace: ConflictResolutionState, state: GameState): void {
  const gov = state.government;
  const aiAgents = state.aiAgents;
  
  // AI can improve both offense AND defense, but defense can be prioritized
  const avgAICapability = aiAgents.length > 0 ?
    aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / aiAgents.length : 0;
  
  // Government investment in cyber defense
  const physicalResearch = gov.researchInvestments.physical || 0;
  const digitalResearch = gov.researchInvestments.digital || 0;
  const cyberInvestment = physicalResearch * 0.3 + digitalResearch * 0.5;
  
  // Defense strength grows with AI capability + investment
  const targetDefense = Math.min(5, avgAICapability * 0.6 + cyberInvestment / 50);
  peace.cyberDefenseStrength += (targetDefense - peace.cyberDefenseStrength) * 0.08;
  
  // Offense-Defense Balance
  // High-alignment AI → defense advantage (cooperative)
  // Low-alignment AI → offense advantage (adversarial)
  const avgAlignment = aiAgents.length > 0 ?
    aiAgents.reduce((sum, ai) => sum + (ai.trueAlignment ?? ai.alignment), 0) / aiAgents.length : 0.5;
  
  const alignmentEffect = (avgAlignment - 0.5) * 0.8; // -0.4 to +0.4
  const investmentEffect = cyberInvestment > 30 ? 0.3 : 0; // Explicit defense prioritization
  
  peace.offenseDefenseBalance = clamp(alignmentEffect + investmentEffect, -1, 1);
  
  // Military system security (nuclear weapons, autonomous weapons)
  // Improved by: cyber defense strength, alignment, governance
  const defenseAdvantage = peace.offenseDefenseBalance > 0 ? peace.offenseDefenseBalance * 0.3 : 0;
  const govControl = gov.capabilityToControl / 10; // 0-1
  peace.militarySystemSecurity = clamp(
    0.5 + peace.cyberDefenseStrength / 10 + defenseAdvantage + govControl * 0.2,
    0, 1
  );
  
  // Critical infrastructure security (power grid, water, communication)
  const infrastructureResilience = state.society.coordinationCapacity || 0.5;
  peace.criticalInfraSecurity = clamp(
    0.6 + peace.cyberDefenseStrength / 10 + infrastructureResilience * 0.2,
    0, 1
  );
}

/**
 * Calculate overall global peace level and conflict prevention bonus
 */
function calculateGlobalPeace(peace: ConflictResolutionState, state: GameState): void {
  // Diplomatic capability component (0-0.3)
  const diplomaticContribution = Math.min(0.3, peace.diplomaticSuccessRate * 0.3);
  
  // Post-scarcity component (0-0.4)
  const abundanceContribution = (1 - peace.resourceConflictRisk) * 0.4;
  
  // Cyber defense component (0-0.3)
  const defenseContribution = (peace.militarySystemSecurity * 0.5 + peace.criticalInfraSecurity * 0.5) * 0.3;
  
  // Overall peace level (0-1)
  peace.globalPeaceLevel = diplomaticContribution + abundanceContribution + defenseContribution;
  
  // Conflict prevention bonus (applied to catastrophic scenarios)
  // Max 50% reduction in conflict probability
  peace.conflictPreventionBonus = Math.min(0.5, peace.globalPeaceLevel * 0.5);
  
  // Log major peace milestones
  if (peace.globalPeaceLevel > 0.8 && state.currentMonth % 12 === 0) {
    try {
      console.log(`\n🕊️  GLOBAL PEACE ACHIEVED (Month ${state.currentMonth})`);
      console.log(`   Peace Level: ${(peace.globalPeaceLevel * 100).toFixed(0)}%`);
      console.log(`   Diplomatic AI: ${peace.diplomaticAICapability.toFixed(1)} (${(peace.diplomaticSuccessRate * 100).toFixed(0)}% success)`);
      console.log(`   Resource Conflict Risk: ${(peace.resourceConflictRisk * 100).toFixed(0)}%`);
      console.log(`   Military Security: ${(peace.militarySystemSecurity * 100).toFixed(0)}%\n`);
    } catch (e) { /* Ignore EPIPE */ }
  }
}

/**
 * Attempt AI-mediated diplomatic intervention to prevent geopolitical crisis
 * Called from catastrophicScenarios.ts when checking "Geopolitical Crisis" prerequisite
 * 
 * Returns: true if intervention succeeds (crisis prevented), false otherwise
 */
export function attemptDiplomaticIntervention(state: GameState): boolean {
  const peace = state.conflictResolution;
  
  // Must have capable diplomatic AI
  if (peace.diplomaticAICapability < 2.0) return false;
  
  // Must have governance support
  const govQuality = state.government.governanceQuality.decisionQuality;
  if (govQuality < 0.5) return false;
  
  // Roll for success based on diplomatic success rate
  const roll = Math.random();
  const success = roll < peace.diplomaticSuccessRate;
  
  if (success) {
    // Intervention succeeded!
    peace.activeDiplomaticInterventions++;
    
    try {
      console.log(`\n🤝 DIPLOMATIC INTERVENTION SUCCEEDED (Month ${state.currentMonth})`);
      console.log(`   AI diplomatic capability: ${peace.diplomaticAICapability.toFixed(1)}`);
      console.log(`   Success rate: ${(peace.diplomaticSuccessRate * 100).toFixed(0)}%`);
      console.log(`   Geopolitical crisis defused through AI-mediated negotiation\n`);
    } catch (e) { /* Ignore EPIPE */ }
    
    // Increase success rate (learning from experience)
    peace.diplomaticSuccessRate = Math.min(0.95, peace.diplomaticSuccessRate + 0.02);
  }
  
  return success;
}

/**
 * Get conflict prevention modifier for catastrophic scenarios
 * Reduces probability of conflict-based extinction (nuclear war, etc.)
 */
export function getConflictPreventionModifier(state: GameState): number {
  const peace = state.conflictResolution;
  
  // Base prevention bonus
  let modifier = 1.0 - peace.conflictPreventionBonus;
  
  // Post-scarcity especially prevents resource-driven conflicts
  if (peace.resourceConflictRisk < 0.3) {
    modifier *= 0.7; // Additional 30% reduction for very low resource conflict risk
  }
  
  // Strong cyber defense prevents hacking-based conflicts
  if (peace.militarySystemSecurity > 0.8) {
    modifier *= 0.8; // Additional 20% reduction when military systems well-protected
  }
  
  return Math.max(0.2, modifier); // Never reduce below 20% (conflicts can still happen)
}

/**
 * Check if cyber attack on military systems succeeds
 * Called from catastrophicScenarios.ts for attack prerequisites
 * 
 * Returns: true if attack succeeds (bad), false if defense holds
 */
export function canPenetrateMilitarySystems(state: GameState): boolean {
  const peace = state.conflictResolution;
  
  // Attack difficulty scales with security
  const attackSuccessChance = Math.max(0.1, 1 - peace.militarySystemSecurity);
  
  const roll = Math.random();
  const attackSucceeds = roll < attackSuccessChance;
  
  if (!attackSucceeds && peace.militarySystemSecurity > 0.7) {
    try {
      console.log(`\n🛡️  CYBER ATTACK REPELLED (Month ${state.currentMonth})`);
      console.log(`   Military system security: ${(peace.militarySystemSecurity * 100).toFixed(0)}%`);
      console.log(`   Attack success chance was only ${(attackSuccessChance * 100).toFixed(0)}%\n`);
    } catch (e) { /* Ignore EPIPE */ }
  }
  
  return attackSucceeds;
}

// Utility functions
function countActiveCrises(state: GameState): number {
  const env = state.environmentalAccumulation;
  const social = state.socialAccumulation;
  const tech = state.technologicalRisk;
  
  return [
    env.resourceCrisisActive,
    env.pollutionCrisisActive,
    env.climateCrisisActive,
    env.ecosystemCrisisActive,
    social.meaningCollapseActive,
    social.socialUnrestActive,
    social.institutionalFailureActive,
    tech.controlLossActive,
    tech.corporateDystopiaActive,
    tech.complacencyCrisisActive
  ].filter(Boolean).length;
}

