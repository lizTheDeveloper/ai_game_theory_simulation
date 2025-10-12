/**
 * Information Warfare & Epistemology System
 * Truth decay, deepfakes, narrative control
 * 
 * Research:
 * - RAND Truth Decay (2024): Decline of facts in discourse
 * - MIT (2024): AI detection impossible at high capability
 * - Oxford (2024): Computational propaganda scales with AI
 * - Stanford (2024-2025): Platform manipulation increasing
 */

import { GameState } from '../types/game';
import { InformationWarfareSystem, initializeInformationWarfare } from '../types/informationWarfare';
import { Event } from '../types/events';

export { initializeInformationWarfare };

/**
 * Update information warfare dynamics
 * Core mechanics:
 * 1. Truth decay (AI accelerates deepfakes)
 * 2. Detection vs generation arms race
 * 3. Narrative competition
 * 4. Impacts on trust, coordination, dystopia
 */
export function updateInformationWarfare(state: GameState): Event[] {
  const events: Event[] = [];
  const sys = state.informationWarfare;
  
  // === TRUTH DECAY (Phase 1) ===
  // AI capability drives deepfake generation
  const avgAICapability = calculateAverageAICapability(state);
  
  // Deepfake generation rate scales with AI capability
  // Research: MIT (2024) - Generation always easier than detection
  // At capability 1.0: +0.5%/month
  // At capability 3.0: +2%/month
  // At capability 5.0: +4%/month (saturating)
  const deepfakeGenerationRate = 0.005 * Math.min(8, Math.pow(avgAICapability, 1.5));
  
  sys.deepfakePrevalence = Math.min(1.0,
    sys.deepfakePrevalence + deepfakeGenerationRate
  );
  
  // === DETECTION VS GENERATION ARMS RACE (Phase 2) ===
  // Detection capability tries to keep up but always lags
  // Research: MIT (2024) - Detection accuracy declining as models improve
  
  // Investment in detection helps but diminishing returns
  const detectionInvestmentBonus = Math.log(1 + sys.factCheckingInvestment) * 0.02;
  
  // AI capability HELPS detection (use AI to catch AI)
  // But generation capability grows faster
  const detectionImprovement = detectionInvestmentBonus + (avgAICapability * 0.005);
  const detectionDegradation = deepfakeGenerationRate * 1.5; // Generation wins the arms race
  
  sys.detectionCapability = Math.max(0.05, Math.min(0.95,
    sys.detectionCapability + detectionImprovement - detectionDegradation
  ));
  
  // === INFORMATION INTEGRITY DECAY (Phase 3) ===
  // Truth decays as deepfakes proliferate and detection fails
  // Research: RAND Truth Decay (2024) - Facts lose currency
  
  const integrityDecay = (sys.deepfakePrevalence * 0.01) - (sys.detectionCapability * 0.005);
  
  // Media literacy helps slow decay
  const literacyBonus = sys.mediaLiteracy * 0.003;
  
  // High trust in institutions helps maintain integrity
  const institutionalBonus = state.socialAccumulation.institutionalLegitimacy * 0.002;
  
  sys.informationIntegrity = Math.max(0.0, Math.min(1.0,
    sys.informationIntegrity + integrityDecay + literacyBonus + institutionalBonus
  ));
  
  // === EPISTEMOLOGICAL CRISIS (Phase 4) ===
  // When integrity low + deepfakes high → can't distinguish truth
  // Research: Pew (2024) - 73% see "made-up news", polarization
  
  const crisisAcceleration = (1 - sys.informationIntegrity) * sys.deepfakePrevalence * 0.008;
  
  sys.epistemologicalCrisisLevel = Math.max(0.0, Math.min(1.0,
    sys.epistemologicalCrisisLevel + crisisAcceleration
  ));
  
  // === NARRATIVE CONTROL COMPETITION (Phase 5) ===
  // Different actors compete for narrative dominance
  // AI agents gain power as they create more content
  
  // AI narrative power grows with capability + deployed agents
  const aiNarrativeGrowth = (avgAICapability / 50) * (state.aiAgents.length / 10);
  sys.narrativeControl.aiAgents = Math.min(0.95,
    sys.narrativeControl.aiAgents + aiNarrativeGrowth
  );
  
  // Government narrative control depends on legitimacy
  // Low legitimacy → less narrative power
  const govNarrativeChange = (state.socialAccumulation.institutionalLegitimacy - 0.5) * 0.002;
  sys.narrativeControl.government = Math.max(0.05, Math.min(0.95,
    sys.narrativeControl.government + govNarrativeChange
  ));
  
  // Corporate power stable but erodes with low trust
  const corpNarrativeChange = (state.publicTrustInAI - 0.5) * 0.001;
  sys.narrativeControl.corporations = Math.max(0.05, Math.min(0.95,
    sys.narrativeControl.corporations + corpNarrativeChange
  ));
  
  // Grassroots narrative power inversely related to AI dominance
  // As AIs flood the zone, grassroots voices drowned out
  sys.narrativeControl.grassroots = Math.max(0.05,
    0.40 - (sys.narrativeControl.aiAgents * 0.3)
  );
  
  // === COORDINATION PENALTY (Phase 6) ===
  // Low information integrity makes coordination harder
  // Research: Can't solve problems if can't agree on facts
  
  sys.coordinationPenalty = sys.epistemologicalCrisisLevel * 0.5 + 
                            (1 - sys.informationIntegrity) * 0.3;
  
  // === TRUST EROSION (Phase 7) ===
  // Info warfare erodes trust in everything
  // Research: Knight Foundation (2024) - Trust declining
  
  sys.trustErosionRate = 0.002 + // Baseline
                         (sys.deepfakePrevalence * 0.005) + // Deepfakes accelerate
                         (sys.epistemologicalCrisisLevel * 0.003); // Crisis compounds
  
  // Apply trust erosion to public trust in AI
  state.publicTrustInAI = Math.max(0.0,
    state.publicTrustInAI - sys.trustErosionRate
  );
  
  // === DYSTOPIA ENABLEMENT (Phase 8) ===
  // "Flood the zone with shit" - Authoritarians thrive in confusion
  // Research: Hannah Arendt, Bannon strategy, Russian "firehose of falsehood"
  
  sys.dystopiaEnablement = (1 - sys.informationIntegrity) * 0.6 + 
                           sys.epistemologicalCrisisLevel * 0.4;
  
  // If dystopia enablement high, boost surveillance acceptance
  if (sys.dystopiaEnablement > 0.60 && state.dystopiaProgression) {
    state.dystopiaProgression.surveillanceAcceptance = Math.min(1.0,
      state.dystopiaProgression.surveillanceAcceptance + 0.005
    );
  }
  
  // === CRISIS EVENTS (Phase 9) ===
  
  // Deepfake Saturation Event (50% threshold)
  if (sys.deepfakePrevalence > 0.50 && sys.deepfakePrevalence <= 0.50 + deepfakeGenerationRate) {
    events.push({
      id: `deepfake-saturation-${state.months}`,
      type: 'crisis',
      severity: 'high',
      title: '🎭 DEEPFAKE SATURATION',
      description: `AI-generated content everywhere. Can't trust photos, videos, or audio anymore. Detection failing.`,
      month: state.months,
      impacts: {
        publicTrust: -0.05,
        economicStage: 0,
      }
    });
  }
  
  // Epistemological Crisis Event (60% threshold)
  if (sys.epistemologicalCrisisLevel > 0.60 && 
      sys.epistemologicalCrisisLevel <= 0.60 + crisisAcceleration) {
    events.push({
      id: `epistemological-crisis-${state.months}`,
      type: 'crisis',
      severity: 'critical',
      title: '❓ EPISTEMOLOGICAL CRISIS',
      description: `Society can't agree on basic facts. Coordination breaking down. Shared reality dissolving.`,
      month: state.months,
      impacts: {
        publicTrust: -0.10,
        economicStage: 0,
      }
    });
    
    // Massive QoL hit from coordination failure
    if (state.qualityOfLifeSystems?.social) {
      state.qualityOfLifeSystems.social.freedom = Math.max(0,
        state.qualityOfLifeSystems.social.freedom - 0.10
      );
      state.qualityOfLifeSystems.social.safety = Math.max(0,
        state.qualityOfLifeSystems.social.safety - 0.08
      );
    }
  }
  
  // Information Collapse (integrity < 20%)
  if (sys.informationIntegrity < 0.20) {
    events.push({
      id: `info-collapse-${state.months}`,
      type: 'crisis',
      severity: 'critical',
      title: '📉 INFORMATION COLLAPSE',
      description: `Truth has lost all meaning. Post-truth society. Democracy cannot function.`,
      month: state.months,
      impacts: {
        publicTrust: -0.05,
        economicStage: 0,
      }
    });
    
    // Boost authoritarian probability
    if (state.socialAccumulation) {
      state.socialAccumulation.institutionalLegitimacy = Math.max(0,
        state.socialAccumulation.institutionalLegitimacy - 0.02
      );
    }
  }
  
  // AI Narrative Dominance (AI control > 60%)
  if (sys.narrativeControl.aiAgents > 0.60 && 
      sys.narrativeControl.aiAgents <= 0.60 + aiNarrativeGrowth) {
    events.push({
      id: `ai-narrative-dominance-${state.months}`,
      type: 'warning',
      severity: 'medium',
      title: '🤖 AI NARRATIVE DOMINANCE',
      description: `AI agents now dominate information landscape. Most content AI-generated. Human voices marginalized.`,
      month: state.months,
    });
  }
  
  return events;
}

/**
 * Calculate average AI capability across all agents
 */
function calculateAverageAICapability(state: GameState): number {
  if (state.aiAgents.length === 0) return 0;
  return state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / state.aiAgents.length;
}

/**
 * Check if media literacy tech can be unlocked
 * Prerequisite: Epistemological crisis active, research investment high
 */
export function checkMediaLiteracyTechUnlock(
  state: GameState
): { unlocked: boolean; reason?: string } {
  const sys = state.informationWarfare;
  
  // Need crisis to motivate action
  if (sys.epistemologicalCrisisLevel < 0.40) {
    return { unlocked: false, reason: 'Epistemological crisis not severe enough yet' };
  }
  
  // Need research investment (education system)
  const researchInvestment = state.breakthroughTech?.researchPriorities?.social || 0;
  if (researchInvestment < 0.25) {
    return { unlocked: false, reason: 'Insufficient social research investment' };
  }
  
  // Need AI capability to build personalized education
  const avgCapability = calculateAverageAICapability(state);
  if (avgCapability < 2.0) {
    return { unlocked: false, reason: 'AI capability insufficient for personalized learning' };
  }
  
  return { unlocked: true };
}

/**
 * Deploy media literacy tech
 * Effect: Improve population's ability to evaluate information
 */
export function deployMediaLiteracyTech(
  state: GameState,
  budget: number // Monthly budget in billions
): Event[] {
  const events: Event[] = [];
  const sys = state.informationWarfare;
  
  // Cost: $20B for 10% improvement ($200B total to max out)
  // Timeline: Education takes time, 3-5 years to see effects
  const deploymentRate = (budget / 20) * 0.1 * 0.3; // 0.3x slower (education is slow)
  
  sys.mediaLiteracy = Math.min(0.95, // Cap at 95% (some people always fooled)
    sys.mediaLiteracy + deploymentRate
  );
  
  // Improved literacy reduces crisis level
  if (sys.mediaLiteracy > 0.60) {
    sys.epistemologicalCrisisLevel = Math.max(0,
      sys.epistemologicalCrisisLevel - 0.002
    );
  }
  
  return events;
}

