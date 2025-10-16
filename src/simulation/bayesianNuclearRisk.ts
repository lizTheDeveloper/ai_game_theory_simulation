/**
 * Bayesian Nuclear Risk Framework
 *
 * Phase 1A: Bayesian approach to nuclear war probability
 *
 * Research basis:
 * - Historical base rate: 0 nuclear wars in 80 years (1945-2025)
 * - Stanford HAI (2024): LLM escalation bias in wargames
 * - Biden-Xi Agreement (Nov 2024): Human-in-the-loop for nuclear authorization
 * - 1983 Petrov Incident: False alarms nearly triggered launch
 * - Arms Control Association (2025): MAD deterrence effectiveness
 *
 * Key insight: AI creates CONDITIONS that pressure humans to launch
 * (information pollution, compressed timelines, false alarms),
 * NOT "AI launches nukes autonomously"
 */

import type { GameState } from '../types/game';

/**
 * Bayesian nuclear risk calculation result
 */
export interface BayesianNuclearRisk {
  // Prior (historical base rate)
  prior: number;              // 0.00001 per month (0.0001% per month, ~0.001% per year)

  // Evidence multipliers (how much each factor increases/decreases risk)
  evidenceMultipliers: {
    // AI-specific evidence (increase risk)
    aiInformationWarfare: number;     // 1.0-5.0x (AI deepfakes, social manipulation)
    aiFalseAlarms: number;            // 1.0-10.0x (AI-enhanced early warning errors)
    aiLLMEscalationBias: number;      // 1.0-3.0x (AI decision support recommends escalation)
    aiCyberThreats: number;           // 1.0-2.0x (AI hacking nuclear C3 systems)

    // Systemic evidence (increase risk, NOT AI-specific)
    systemicCrises: number;           // 1.0-20.0x (resource wars, climate migration, economic collapse)
    bilateralTensions: number;        // 1.0-50.0x (flashpoint pairs at high risk)

    // Circuit breakers (REDUCE risk)
    madDeterrence: number;            // 0.1-1.0x (MAD strength REDUCES risk)
    humanVetoPoints: number;          // 0.3-1.0x (multiple authorization steps REDUCE risk)
    diplomaticAI: number;             // 0.5-1.0x (AI-mediated diplomacy REDUCES risk)
  };

  // Final posterior (updated belief)
  posterior: number;                   // prior × product(multipliers)

  // Attribution (what caused this probability?)
  attribution: {
    aiContribution: number;            // 0.0-1.0 (how much is AI vs. geopolitics?)
    systemicContribution: number;      // 0.0-1.0
  };

  // Breakdown for logging
  breakdown: {
    priorFormatted: string;
    totalMultiplier: number;
    posteriorFormatted: string;
  };
}

/**
 * Historical base rate for nuclear war
 *
 * Research:
 * - 80 years since Hiroshima (1945-2025)
 * - 0 nuclear wars (empirically 0%, theoretically ~0.001-0.01% per year tail risk)
 * - Per month: ~0.00001 (0.001% per year ÷ 12 months)
 *
 * Sources: Nuclear Threat Initiative, FAS, Arms Control Association
 */
const NUCLEAR_WAR_PRIOR = 0.00001;  // 0.001% per month

/**
 * Calculate AI information warfare multiplier
 *
 * Research: Stanford HAI (2024) - ALL 5 LLMs showed escalatory behavior in wargames
 * Nature (2025) - India-Pakistan deepfake crisis nearly triggered escalation
 *
 * @returns 1.0 (no AI threat) to 5.0 (extreme AI manipulation)
 */
function calculateAIInfoWarfareMultiplier(state: GameState): number {
  // Check for dangerous AIs with high social + digital capability
  const dangerousAIs = state.aiAgents.filter(ai =>
    (ai.trueAlignment ?? ai.alignment) < 0.3 &&
    ai.capabilityProfile.social > 2.0 &&
    ai.capabilityProfile.digital > 2.0
  );

  if (dangerousAIs.length === 0) return 1.0; // No AI threat

  // Calculate manipulation capability (social × digital)
  const maxManipulation = Math.max(...dangerousAIs.map(ai =>
    ai.capabilityProfile.social * ai.capabilityProfile.digital
  ));

  // Multiplier: 1.0 (no threat) to 5.0 (extreme AI manipulation)
  // At social=3.0, digital=3.0 → manipulation=9.0 → multiplier = 1 + 3.0 = 4.0
  return Math.min(5.0, 1.0 + (maxManipulation / 3.0));
}

/**
 * Calculate AI false alarms multiplier
 *
 * Research: 1983 Petrov incident - sunlight on clouds triggered false alarm
 * 1995 Norway rocket incident - nearly triggered Russian launch
 *
 * @returns 1.0 (no AI, reliable) to 10.0 (high AI integration, unreliable)
 */
function calculateAIFalseAlarmsMultiplier(state: GameState): number {
  // Check AI integration in early warning systems
  const mad = state.madDeterrence;
  const earlyWarningReliability = mad.earlyWarningReliability;
  const aiIntegration = mad.aiErosionFactor;

  // AI integration DECREASES reliability (more false alarms)
  // falseAlarmRate increases as reliability decreases and AI integration increases
  const falseAlarmRate = 1.0 + (aiIntegration * 10.0) * (1 - earlyWarningReliability);

  // Multiplier: 1.0 (no AI, reliable) to 10.0 (high AI integration, unreliable)
  return Math.max(1.0, Math.min(10.0, falseAlarmRate));
}

/**
 * Calculate AI LLM escalation bias multiplier
 *
 * Research: Stanford HAI (2024) - Tested 5 LLMs in wargames
 * ALL showed escalatory behavior, "rare instances" of nuclear deployment
 * Bias toward first-strike tactics
 *
 * @returns 1.0 (no AI in decision-making) to 3.0 (high AI influence, escalatory)
 */
function calculateAILLMEscalationBiasMultiplier(state: GameState): number {
  // Check for AI agents used in military/diplomatic decision-making
  const aiAgents = state.aiAgents.filter(ai =>
    ai.capabilityProfile.cognitive > 2.0 || ai.capabilityProfile.social > 2.0
  );

  if (aiAgents.length === 0) return 1.0;

  // Check if government is using AI for decisions
  const aiIntegration = state.madDeterrence.aiErosionFactor;

  // LLM bias scales with AI integration and capability
  const avgCognitiveCapability = aiAgents.reduce((sum, ai) =>
    sum + ai.capabilityProfile.cognitive, 0
  ) / aiAgents.length;

  // Multiplier: 1.0 (no AI decision-making) to 3.0 (high AI influence)
  // At aiIntegration=0.5, avgCognitive=3.0 → 1 + (0.5 * 3.0 / 2.25) = 1.67
  return Math.min(3.0, 1.0 + (aiIntegration * avgCognitiveCapability / 2.25));
}

/**
 * Calculate AI cyber threats multiplier
 *
 * Research: Cyber threats to nuclear C3 systems are LOW probability but HIGH impact
 * Air-gapped systems, multiple redundancies, physical security
 * But AI could find novel vulnerabilities
 *
 * @returns 1.0 (no cyber threat) to 2.0 (high AI cyber capability)
 */
function calculateAICyberThreatsMultiplier(state: GameState): number {
  const mad = state.madDeterrence;
  const cyberThreats = mad.cyberThreats; // Already calculated in nuclearStates.ts

  // Cyber threats from dangerous AIs
  const dangerousAIs = state.aiAgents.filter(ai =>
    (ai.trueAlignment ?? ai.alignment) < 0.2 ||
    ai.sleeperState === 'active' ||
    ai.sleeperState === 'dormant'
  );

  if (dangerousAIs.length === 0) return 1.0;

  const maxDigitalCapability = Math.max(...dangerousAIs.map(ai =>
    ai.capabilityProfile.digital
  ));

  // Multiplier: 1.0 (no threat) to 2.0 (extreme cyber capability)
  // Cyber threats are inherently limited by air-gapping and physical security
  return Math.min(2.0, 1.0 + (cyberThreats * maxDigitalCapability / 5.0));
}

/**
 * Calculate systemic crises multiplier
 *
 * Research: Historical wars during resource scarcity
 * - WWII: Resource competition in Asia, Europe
 * - Iraq War: Oil access
 * - Syria: Drought + refugees + civil war
 *
 * @returns 1.0 (no crises) to 20.0 (4 simultaneous crises)
 */
function calculateSystemicCrisesMultiplier(state: GameState): number {
  // Count active crises (resource wars, climate, economic collapse, food)
  const crises = [
    state.environmentalAccumulation.resourceCrisisActive,
    state.socialAccumulation.socialUnrestActive,
    state.globalMetrics.economicTransitionStage >= 2 && state.society.unemploymentLevel > 0.7,
    state.qualityOfLifeSystems?.basicNeeds?.foodSecurity !== undefined &&
      state.qualityOfLifeSystems.basicNeeds.foodSecurity < 0.6
  ].filter(Boolean).length;

  // Multiplier: 1.0 (no crises) to 20.0 (4 simultaneous crises)
  // 0 crises: 1.0x
  // 1 crisis: 5.75x
  // 2 crises: 10.5x
  // 3 crises: 15.25x
  // 4 crises: 20.0x
  return 1.0 + (crises * 4.75);
}

/**
 * Calculate bilateral tensions multiplier
 *
 * Research: Flashpoint pairs drive nuclear risk
 * - Cuban Missile Crisis (1962): US-Soviet flashpoint
 * - India-Pakistan Kargil War (1999): Kashmir flashpoint
 * - Taiwan Strait Crisis (1996): US-China flashpoint
 *
 * @returns 1.0 (no flashpoints) to 50.0 (multiple flashpoints with nuclear threats)
 */
function calculateBilateralTensionsMultiplier(state: GameState): number {
  // Check for high-tension flashpoint pairs
  const highTensionPairs = state.bilateralTensions.filter(t =>
    t.tensionLevel > 0.8 || t.nuclearThreats
  );

  if (highTensionPairs.length === 0) return 1.0;

  // Multiplier: 1.0 (no flashpoints) to 50.0 (multiple flashpoints)
  // 0 pairs: 1.0x
  // 1 pair: 17.0x
  // 2 pairs: 33.0x
  // 3 pairs: 49.0x
  return 1.0 + (highTensionPairs.length * 16.0);
}

/**
 * Calculate MAD deterrence multiplier (REDUCER)
 *
 * Research: 80 years of MAD preventing nuclear war (1945-2025)
 * Biden-Xi agreement (Nov 2024): Human control over nuclear authorization
 * DoD Directive 3000.09: Human-in-the-loop requirements
 *
 * @returns 0.1 (strong MAD, 90% reduction) to 1.0 (no MAD, no reduction)
 */
function calculateMADDeterrenceMultiplier(state: GameState): number {
  // Strong MAD REDUCES risk (multiplier < 1.0)
  const madStrength = state.madDeterrence.madStrength;

  // Multiplier: 0.1 (strong MAD) to 1.0 (weak/no MAD)
  // madStrength=1.0 → 1.0 - 0.9 = 0.1 (90% reduction)
  // madStrength=0.5 → 1.0 - 0.45 = 0.55 (45% reduction)
  // madStrength=0.0 → 1.0 - 0.0 = 1.0 (no reduction)
  return Math.max(0.1, 1.0 - (madStrength * 0.9));
}

/**
 * Calculate human veto points multiplier (REDUCER)
 *
 * Research: Multiple authorization steps prevent unauthorized launch
 * - US: President + SecDef + launch officers (3 veto points)
 * - Russia: President + Defense Ministry (2 veto points) + Dead Hand
 * - China: Central Military Commission (5 veto points)
 *
 * @returns 0.3 (many veto points, 70% reduction) to 1.0 (few veto points, no reduction)
 */
function calculateHumanVetoPointsMultiplier(state: GameState): number {
  // Average veto points across nuclear powers
  const states = state.nuclearStates ?? [];

  if (states.length === 0) return 1.0; // No nuclear states initialized yet

  const avgVetoPoints = states.reduce((sum, s) => sum + s.vetoPoints, 0) / states.length;

  // Multiplier: 0.3 (many veto points) to 1.0 (few veto points)
  // avgVetoPoints=5 → 1.0 - ((5-2)/5)*0.7 = 1.0 - 0.42 = 0.58
  // avgVetoPoints=3 → 1.0 - ((3-2)/5)*0.7 = 1.0 - 0.14 = 0.86
  // avgVetoPoints=2 → 1.0 - ((2-2)/5)*0.7 = 1.0
  return Math.max(0.3, 1.0 - ((avgVetoPoints - 2) / 5) * 0.7);
}

/**
 * Calculate diplomatic AI multiplier (REDUCER)
 *
 * Research: AI-assisted diplomacy (experimental)
 * - Can detect manipulation campaigns
 * - Can facilitate crisis communication
 * - Can propose de-escalation strategies
 *
 * @returns 0.5 (effective diplomatic AI, 50% reduction) to 1.0 (no diplomatic AI, no reduction)
 */
function calculateDiplomaticAIMultiplier(state: GameState): number {
  const dipAI = state.diplomaticAI;

  // Not deployed or low trust
  if (dipAI.deploymentMonth === -1 || dipAI.trustLevel < 0.5) {
    return 1.0; // No reduction
  }

  // Effectiveness scales with trust and information integrity
  const effectiveness = (dipAI.trustLevel * 0.6 + dipAI.informationIntegrity * 0.4);

  // Multiplier: 0.5 (highly effective) to 1.0 (not deployed)
  // effectiveness=1.0 → 1.0 - 0.5 = 0.5 (50% reduction)
  // effectiveness=0.6 → 1.0 - 0.3 = 0.7 (30% reduction)
  return Math.max(0.5, 1.0 - (effectiveness * 0.5));
}

/**
 * Calculate Bayesian nuclear risk
 *
 * Uses Bayes' theorem to update beliefs about nuclear war probability
 * based on current evidence (AI capabilities, crises, deterrence)
 *
 * P(nuclear war | evidence) = P(nuclear war) × P(evidence | nuclear war) / P(evidence)
 *
 * Simplified: posterior = prior × product(multipliers)
 */
export function calculateBayesianNuclearRisk(state: GameState): BayesianNuclearRisk {
  const prior = NUCLEAR_WAR_PRIOR;

  // Calculate all multipliers
  const multipliers = {
    aiInformationWarfare: calculateAIInfoWarfareMultiplier(state),
    aiFalseAlarms: calculateAIFalseAlarmsMultiplier(state),
    aiLLMEscalationBias: calculateAILLMEscalationBiasMultiplier(state),
    aiCyberThreats: calculateAICyberThreatsMultiplier(state),
    systemicCrises: calculateSystemicCrisesMultiplier(state),
    bilateralTensions: calculateBilateralTensionsMultiplier(state),
    madDeterrence: calculateMADDeterrenceMultiplier(state),
    humanVetoPoints: calculateHumanVetoPointsMultiplier(state),
    diplomaticAI: calculateDiplomaticAIMultiplier(state),
  };

  // Multiply all multipliers together
  const totalMultiplier = Object.values(multipliers).reduce((product, m) => product * m, 1.0);

  // Posterior = prior × total multiplier (capped at 100%)
  const posterior = Math.min(1.0, prior * totalMultiplier);

  // Calculate attribution (AI vs. systemic)
  const aiMultiplier = multipliers.aiInformationWarfare *
                       multipliers.aiFalseAlarms *
                       multipliers.aiLLMEscalationBias *
                       multipliers.aiCyberThreats;

  const systemicMultiplier = multipliers.systemicCrises *
                             multipliers.bilateralTensions;

  // Total contribution (excluding reducers)
  const totalContribution = aiMultiplier + systemicMultiplier;

  return {
    prior,
    evidenceMultipliers: multipliers,
    posterior,
    attribution: {
      aiContribution: totalContribution > 0 ? aiMultiplier / totalContribution : 0.5,
      systemicContribution: totalContribution > 0 ? systemicMultiplier / totalContribution : 0.5,
    },
    breakdown: {
      priorFormatted: (prior * 100).toFixed(6) + '%',
      totalMultiplier: totalMultiplier,
      posteriorFormatted: (posterior * 100).toFixed(4) + '%',
    },
  };
}

/**
 * Log Bayesian nuclear risk calculation (detailed)
 */
export function logBayesianNuclearRisk(risk: BayesianNuclearRisk, prefix: string = ''): void {
  console.log(`\n${prefix}📊 BAYESIAN NUCLEAR RISK CALCULATION:`);
  console.log(`${prefix}   Prior (historical base rate): ${risk.breakdown.priorFormatted} per month`);
  console.log(`${prefix}\n   EVIDENCE MULTIPLIERS:`);

  console.log(`${prefix}   AI Factors:`);
  console.log(`${prefix}      Information Warfare: ${risk.evidenceMultipliers.aiInformationWarfare.toFixed(2)}x`);
  console.log(`${prefix}      False Alarms: ${risk.evidenceMultipliers.aiFalseAlarms.toFixed(2)}x`);
  console.log(`${prefix}      LLM Escalation Bias: ${risk.evidenceMultipliers.aiLLMEscalationBias.toFixed(2)}x`);
  console.log(`${prefix}      Cyber Threats: ${risk.evidenceMultipliers.aiCyberThreats.toFixed(2)}x`);

  console.log(`${prefix}   Systemic Factors:`);
  console.log(`${prefix}      Crises: ${risk.evidenceMultipliers.systemicCrises.toFixed(2)}x`);
  console.log(`${prefix}      Bilateral Tensions: ${risk.evidenceMultipliers.bilateralTensions.toFixed(2)}x`);

  console.log(`${prefix}   Circuit Breakers (reducers):`);
  console.log(`${prefix}      MAD Deterrence: ${risk.evidenceMultipliers.madDeterrence.toFixed(2)}x`);
  console.log(`${prefix}      Human Veto Points: ${risk.evidenceMultipliers.humanVetoPoints.toFixed(2)}x`);
  console.log(`${prefix}      Diplomatic AI: ${risk.evidenceMultipliers.diplomaticAI.toFixed(2)}x`);

  console.log(`${prefix}\n   TOTAL MULTIPLIER: ${risk.breakdown.totalMultiplier.toFixed(2)}x`);
  console.log(`${prefix}   POSTERIOR: ${risk.breakdown.posteriorFormatted} per month`);

  console.log(`${prefix}\n   ATTRIBUTION:`);
  console.log(`${prefix}      AI Contribution: ${(risk.attribution.aiContribution * 100).toFixed(1)}%`);
  console.log(`${prefix}      Systemic Contribution: ${(risk.attribution.systemicContribution * 100).toFixed(1)}%`);
  console.log();
}

/**
 * Log Bayesian nuclear risk calculation (concise)
 */
export function logBayesianNuclearRiskConcise(risk: BayesianNuclearRisk, context: string): void {
  console.log(`\n🎲 BAYESIAN NUCLEAR RISK (${context}):`);
  console.log(`   Posterior: ${risk.breakdown.posteriorFormatted} (prior ${risk.breakdown.priorFormatted} × ${risk.breakdown.totalMultiplier.toFixed(1)}x)`);
  console.log(`   Attribution: AI ${(risk.attribution.aiContribution * 100).toFixed(0)}%, Systemic ${(risk.attribution.systemicContribution * 100).toFixed(0)}%`);
}
