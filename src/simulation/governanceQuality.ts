/**
 * Governance Quality & Democratic Resilience System
 * 
 * Key mechanics:
 * 1. Decision Quality - AI augments governance effectiveness
 * 2. Transparency & Participation - Democratic health metrics
 * 3. Authoritarian Resistance - Makes dystopia transitions feel earned
 * 4. Institutional Capacity - Ability to execute policy
 * 
 * This creates positive feedback loops for high-capability aligned AI
 * and defensive mechanics against authoritarian capture.
 */

import type { GameState } from '../types/game';
import { getTrustInAI } from './socialCohesion';
import {
  assertFinite,
  assertProbability,
  assertInRange
} from './utils/assertions';

export function initializeGovernanceQuality() {
  return {
    decisionQuality: 0.5,             // Baseline government effectiveness
    transparency: 0.6,                 // Democratic baseline (moderate)
    participationRate: 0.4,            // Moderate civic engagement
    institutionalCapacity: 0.6,        // Moderate ability to execute
    consensusBuildingEfficiency: 0.3,  // Baseline slow (traditional politics)
    minorityProtectionStrength: 0.5    // Baseline moderate protections
  };
}

/**
 * Update governance quality based on AI capability, government type, and social conditions
 */
export function updateGovernanceQuality(state: GameState): void {
  const gov = state.government;
  const quality = gov.governanceQuality;
  
  // === DECISION QUALITY (AI-Augmented Governance) ===
  
  const aiAgents = state.aiAgents;
  const avgCapability = assertFinite(
    aiAgents.length > 0
      ? aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / aiAgents.length
      : 0,
    {
      location: 'updateGovernanceQuality',
      valueName: 'avgCapability',
      month: state.currentMonth
    }
  );
  const avgAlignment = assertProbability(
    aiAgents.length > 0
      ? aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / aiAgents.length
      : 0.5,
    {
      location: 'updateGovernanceQuality',
      valueName: 'avgAlignment',
      month: state.currentMonth
    }
  );
  
  // High-capability aligned AI improves decision quality
  const aiAugmentation = assertInRange(
    Math.min(0.3, (avgCapability * avgAlignment * 0.15)),
    0,
    0.3,
    {
      location: 'updateGovernanceQuality',
      valueName: 'aiAugmentation',
      month: state.currentMonth,
      additionalInfo: { avgCapability, avgAlignment }
    }
  );
  
  // Government type affects decision-making
  let govTypeMultiplier = 1.0;
  if (gov.governmentType === 'democratic') {
    govTypeMultiplier = 0.9; // Slower but more sustainable decisions
  } else if (gov.governmentType === 'technocratic') {
    govTypeMultiplier = 1.2; // Efficient decision-making
  } else if (gov.governmentType === 'authoritarian') {
    govTypeMultiplier = 0.7; // Less effective (fear, yes-men, info suppression)
  }
  
  // Institutional capacity affects execution
  const capacityBonus = assertFinite(quality.institutionalCapacity * 0.2, {
    location: 'updateGovernanceQuality',
    valueName: 'capacityBonus',
    month: state.currentMonth
  });

  // Target decision quality
  const targetDecisionQuality = assertProbability(
    Math.min(1.0, (0.5 + aiAugmentation + capacityBonus) * govTypeMultiplier),
    {
      location: 'updateGovernanceQuality',
      valueName: 'targetDecisionQuality',
      month: state.currentMonth,
      additionalInfo: { aiAugmentation, capacityBonus, govTypeMultiplier }
    }
  );

  // Gradual convergence (don't jump instantly)
  quality.decisionQuality = assertProbability(
    quality.decisionQuality + (targetDecisionQuality - quality.decisionQuality) * 0.1,
    {
      location: 'updateGovernanceQuality',
      valueName: 'decisionQuality',
      month: state.currentMonth
    }
  );
  
  // === TRANSPARENCY ===
  
  // Authoritarian governments reduce transparency
  if (gov.governmentType === 'authoritarian') {
    quality.transparency = Math.max(0.1, quality.transparency - 0.02); // Gradual erosion
  }
  
  // Democratic governments with high legitimacy increase transparency
  if (gov.governmentType === 'democratic' && gov.legitimacy > 0.6) {
    quality.transparency = Math.min(0.9, quality.transparency + 0.01); // Slow improvement
  }
  
  // High surveillance reduces transparency (paradox: watching citizens, hiding from them)
  const surveillanceLevel = gov.structuralChoices.surveillanceLevel;
  if (surveillanceLevel > 0.5) {
    quality.transparency -= (surveillanceLevel - 0.5) * 0.01;
  }
  
  // Clamp
  quality.transparency = assertProbability(
    Math.max(0.1, Math.min(1.0, quality.transparency)),
    {
      location: 'updateGovernanceQuality',
      valueName: 'transparency',
      month: state.currentMonth
    }
  );
  
  // === PARTICIPATION RATE ===
  // FIX (Nov 10, 2025): Enhanced participation growth mechanics to break 60% ceiling

  // Trust affects participation
  const trustInAI = getTrustInAI(state.society); // Phase 2C: Use paranoia-derived trust
  const trustBonus = (trustInAI - 0.5) * 0.02; // ±1% per month based on trust

  // Transparency encourages participation
  const transparencyBonus = (quality.transparency - 0.5) * 0.015;

  // Meaning crisis reduces participation (apathy)
  const meaningCrisis = state.socialAccumulation.meaningCrisisLevel;
  const apathyPenalty = meaningCrisis * -0.015;

  // FIX (Nov 10, 2025): UBI → participation feedback (more free time → civic engagement)
  // Research: Alaska PFD shows modest +2-5% participation increase
  const ubiBonus = state.globalMetrics.economicTransitionStage >= 3 ? 0.015 : 0; // +1.5%/month with UBI

  // FIX (Nov 10, 2025): Education quality → participation (informed citizens engage more)
  // Research: College education correlates with +15-20% participation rates
  // Proxy: social stability / 2 (assumes stable societies have better education)
  const socialStability = state.globalMetrics.socialStability;
  const educationBonus = socialStability > 0.7 ? 0.01 : 0; // +1%/month if high stability

  // FIX (Nov 10, 2025): S-curve network effects (critical mass 30-50%)
  // Research: Rogers diffusion theory - rapid adoption during early majority phase
  let networkBonus = 0;
  if (quality.participationRate >= 0.3 && quality.participationRate <= 0.5) {
    networkBonus = 0.025; // +2.5%/month during critical mass transition
  }

  // Authoritarian governments suppress participation
  if (gov.governmentType === 'authoritarian') {
    quality.participationRate = Math.max(0.1, quality.participationRate - 0.025); // Forced atomization
  } else {
    quality.participationRate += trustBonus + transparencyBonus + apathyPenalty + ubiBonus + educationBonus + networkBonus;
  }
  
  // Clamp
  quality.participationRate = assertProbability(
    Math.max(0.1, Math.min(0.9, quality.participationRate)),
    {
      location: 'updateGovernanceQuality',
      valueName: 'participationRate',
      month: state.currentMonth
    }
  );
  
  // === INSTITUTIONAL CAPACITY ===
  
  // Decision quality feeds back into capacity (good decisions → better institutions)
  const qualityFeedback = (quality.decisionQuality - 0.5) * 0.01;
  
  // Economic stage affects capacity (more resources)
  const economicStage = state.globalMetrics.economicTransitionStage;
  const resourceBonus = (economicStage / 4) * 0.005; // +0.5%/month at Stage 4
  
  // Crises damage capacity (overload)
  const env = state.environmentalAccumulation;
  const social = state.socialAccumulation;
  const activeCrises = [
    env.resourceCrisisActive,
    env.pollutionCrisisActive,
    env.climateCrisisActive,
    env.ecosystemCrisisActive,
    social.meaningCollapseActive,
    social.socialUnrestActive,
    social.institutionalFailureActive
  ].filter(Boolean).length;
  
  const crisisOverload = activeCrises > 2 ? -(activeCrises - 2) * 0.01 : 0;
  
  quality.institutionalCapacity = assertFinite(
    quality.institutionalCapacity + qualityFeedback + resourceBonus + crisisOverload,
    {
      location: 'updateGovernanceQuality',
      valueName: 'institutionalCapacity (pre-clamp)',
      month: state.currentMonth,
      additionalInfo: { qualityFeedback, resourceBonus, crisisOverload }
    }
  );

  // Clamp
  quality.institutionalCapacity = assertProbability(
    Math.max(0.2, Math.min(1.0, quality.institutionalCapacity)),
    {
      location: 'updateGovernanceQuality',
      valueName: 'institutionalCapacity',
      month: state.currentMonth
    }
  );
  
  // === CONSENSUS BUILDING EFFICIENCY (Liquid Democracy / AI-Mediated) ===
  
  // AI facilitation: High-capability aligned AI helps find common ground
  const aiFacilitation = avgCapability * avgAlignment * 5.0; // Scale to 0-5
  const informationIntegrity = 1.0 - (state.technologicalRisk.misalignmentRisk * 0.5); // Misalignment reduces info quality
  
  // AI-mediated consensus (spec: efficiency = 0.3 + (ai_facilitation * 0.2) when ai > 2.0 and integrity > 0.7)
  if (aiFacilitation > 2.0 && informationIntegrity > 0.7) {
    const targetEfficiency = Math.min(0.9, 0.3 + (aiFacilitation * 0.15));
    quality.consensusBuildingEfficiency += (targetEfficiency - quality.consensusBuildingEfficiency) * 0.05;
  }
  
  // Transparency enables liquid democracy (spec: transparency > 0.8 → participation++)
  if (quality.transparency > 0.8) {
    // High transparency makes participation more effective
    quality.consensusBuildingEfficiency += 0.01;
  }
  
  // Authoritarian regimes have poor consensus (they don't build it, they enforce it)
  if (gov.governmentType === 'authoritarian') {
    quality.consensusBuildingEfficiency = Math.max(0.1, quality.consensusBuildingEfficiency - 0.02);
  }
  
  // Polarization from social unrest reduces consensus ability
  if (state.socialAccumulation.socialUnrestActive) {
    quality.consensusBuildingEfficiency *= 0.95; // Harder to build consensus during unrest
  }
  
  // Clamp
  quality.consensusBuildingEfficiency = assertProbability(
    Math.max(0.1, Math.min(0.9, quality.consensusBuildingEfficiency)),
    {
      location: 'updateGovernanceQuality',
      valueName: 'consensusBuildingEfficiency',
      month: state.currentMonth
    }
  );
  
  // === MINORITY PROTECTION STRENGTH (AI Bias Detection) ===
  
  // AI bias detection: High-capability AI can detect and counteract bias
  const aiBiasDetection = avgCapability > 0.5 ? avgCapability * 0.8 : 0.3; // Range: 0.3-0.8
  
  // AI fairness enforcement: Aligned AI enforces fairness
  const aiFairnessEnforcement = avgAlignment > 0.7 ? (avgAlignment - 0.5) * 1.0 : 0.0; // Range: 0-0.5
  
  // Spec: minority_protection_strength = 0.7 + ai_fairness_enforcement * 0.3 when ai_bias_detection > 0.8
  let targetProtection = 0.5; // Baseline
  if (aiBiasDetection > 0.8) {
    targetProtection = Math.min(0.95, 0.7 + (aiFairnessEnforcement * 0.3));
  } else {
    // Gradual improvement with AI capability and alignment
    targetProtection = 0.5 + (aiBiasDetection * 0.2) + (aiFairnessEnforcement * 0.15);
  }
  
  // Government type affects minority protection
  if (gov.governmentType === 'democratic') {
    targetProtection *= 1.1; // Democracies have stronger baseline protections
  } else if (gov.governmentType === 'authoritarian') {
    targetProtection *= 0.4; // Authoritarian regimes suppress minorities
  }
  
  // High participation creates accountability → protects minorities
  if (quality.participationRate > 0.7) {
    targetProtection += 0.1; // Engaged citizens resist tyranny
  }
  
  // Gradual convergence
  quality.minorityProtectionStrength += (targetProtection - quality.minorityProtectionStrength) * 0.08;
  
  // Clamp
  quality.minorityProtectionStrength = assertProbability(
    Math.max(0.1, Math.min(0.95, quality.minorityProtectionStrength)),
    {
      location: 'updateGovernanceQuality',
      valueName: 'minorityProtectionStrength',
      month: state.currentMonth
    }
  );
  
  // === VIRTUOUS CYCLES ===
  
  // Spec: High participation (>0.7) + high transparency (>0.8) → legitimacy boost
  if (quality.participationRate > 0.7 && quality.transparency > 0.8) {
    // Gradual legitimacy increase (liquid democracy working!)
    gov.legitimacy = Math.min(0.95, gov.legitimacy + 0.02);
  }
  
  // High minority protection prevents dystopia (spec: "Can't have utopia without protecting all")
  // This is handled in dystopiaProgression.ts via getAuthoritarianResistance
}

/**
 * Calculate resistance to authoritarian transition
 * High-quality democratic governance makes authoritarian takeover harder
 * 
 * Returns multiplier on authoritarian transition probability (0.5 = 50% less likely)
 */
export function getAuthoritarianResistance(state: GameState): number {
  const quality = state.government.governanceQuality;

  // Strong democratic institutions resist authoritarianism
  const transparencyDefense = assertFinite(quality.transparency * 0.4, {
    location: 'getAuthoritarianResistance',
    valueName: 'transparencyDefense',
    month: state.currentMonth
  });
  const participationDefense = assertFinite(quality.participationRate * 0.25, {
    location: 'getAuthoritarianResistance',
    valueName: 'participationDefense',
    month: state.currentMonth
  });
  const capacityDefense = assertFinite(quality.institutionalCapacity * 0.15, {
    location: 'getAuthoritarianResistance',
    valueName: 'capacityDefense',
    month: state.currentMonth
  });

  // NEW: Liquid democracy mechanics make authoritarianism harder
  const consensusDefense = assertFinite(quality.consensusBuildingEfficiency * 0.15, {
    location: 'getAuthoritarianResistance',
    valueName: 'consensusDefense',
    month: state.currentMonth
  });
  const minorityDefense = assertFinite(quality.minorityProtectionStrength * 0.2, {
    location: 'getAuthoritarianResistance',
    valueName: 'minorityDefense',
    month: state.currentMonth
  });

  // Total defense: up to ~115% reduction (but practically 70-90%)
  const totalDefense = assertFinite(
    transparencyDefense + participationDefense + capacityDefense + consensusDefense + minorityDefense,
    {
      location: 'getAuthoritarianResistance',
      valueName: 'totalDefense',
      month: state.currentMonth,
      additionalInfo: { transparencyDefense, participationDefense, capacityDefense, consensusDefense, minorityDefense }
    }
  );

  // Convert to multiplier: 0.8 defense = 0.2 multiplier (80% reduction)
  return assertInRange(Math.max(0.05, 1.0 - totalDefense), 0.05, 1.0, {
    location: 'getAuthoritarianResistance',
    valueName: 'resistance',
    month: state.currentMonth,
    additionalInfo: { totalDefense }
  });
}

/**
 * Calculate policy effectiveness multiplier
 * High-quality governance makes policies more effective
 * 
 * This affects: research speed, crisis response, tech deployment
 */
export function getPolicyEffectivenessMultiplier(state: GameState): number {
  const quality = state.government.governanceQuality;

  // Decision quality directly affects policy outcomes
  const baseMultiplier = assertInRange(0.7 + (quality.decisionQuality * 0.6), 0.7, 1.3, {
    location: 'getPolicyEffectivenessMultiplier',
    valueName: 'baseMultiplier',
    month: state.currentMonth
  });

  // Institutional capacity affects execution
  const executionMultiplier = assertInRange(0.8 + (quality.institutionalCapacity * 0.4), 0.8, 1.2, {
    location: 'getPolicyEffectivenessMultiplier',
    valueName: 'executionMultiplier',
    month: state.currentMonth
  });

  // NEW: Consensus building makes policies stick (less fighting/reversal)
  const consensusMultiplier = assertInRange(0.9 + (quality.consensusBuildingEfficiency * 0.2), 0.9, 1.1, {
    location: 'getPolicyEffectivenessMultiplier',
    valueName: 'consensusMultiplier',
    month: state.currentMonth
  });

  // Combined effect
  return assertInRange(baseMultiplier * executionMultiplier * consensusMultiplier, 0.504, 1.716, {
    location: 'getPolicyEffectivenessMultiplier',
    valueName: 'effectivenessMultiplier',
    month: state.currentMonth,
    additionalInfo: { baseMultiplier, executionMultiplier, consensusMultiplier }
  });
}

