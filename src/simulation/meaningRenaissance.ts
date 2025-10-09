/**
 * Meaning Renaissance System - Phase 2E
 * 
 * Expands meaning crisis mechanics with positive feedback loops
 * 
 * Problem: Meaning collapse (60%+) is major crisis, but only ONE tech counters it
 * Solution: Add multiple pathways to meaning fulfillment
 * 
 * The 4 Dimensions of Meaning:
 * 1. Purpose Diversity - Multiple valid life paths (not just work)
 * 2. Self-Actualization - People achieving their potential
 * 3. Artistic Renaissance - Creative explosion (AI-assisted)
 * 4. Philosophical Maturity - Collective wisdom growth
 * 
 * Key Insight: Post-scarcity society needs NEW meaning sources, not just "work replacement"
 */

import type { GameState } from '../types/game';

export interface MeaningRenaissanceState {
  // Purpose Diversity: Multiple valid paths to fulfillment
  purposeDiversity: number;           // [0,1] Variety of socially-valued life paths
  communityPathways: number;          // [0,1] Community service & care work valued
  creativePathways: number;           // [0,1] Art, music, writing accessible & valued
  knowledgePathways: number;          // [0,1] Learning, teaching, research accessible
  explorationPathways: number;        // [0,1] Adventure, discovery, experimentation
  
  // Self-Actualization: Population achieving potential
  selfActualizationRate: number;      // [0,1] % achieving personal growth goals
  educationalAccess: number;          // [0,1] Can learn anything, anytime
  timeForGrowth: number;              // [0,1] Free time + resources for development
  mentoringAvailability: number;      // [0,1] Guidance & support networks
  
  // Artistic Renaissance: Creative explosion
  artisticRenaissanceLevel: number;   // [0,1] Cultural production & participation
  aiAssistedCreativity: number;       // [0,1] AI tools amplifying human creativity
  culturalParticipation: number;      // [0,1] % engaging in creative activities
  artisticRecognition: number;        // [0,1] Society values creative contributions
  
  // Philosophical Maturity: Collective wisdom
  philosophicalMaturity: number;      // [0,1] Society's wisdom & perspective
  existentialUnderstanding: number;   // [0,1] Acceptance of post-work reality
  collectiveNarrative: number;        // [0,1] Shared story about AI/human future
  wisdomSharing: number;              // [0,1] Elders & thinkers amplified by AI
}

export function initializeMeaningRenaissance(): MeaningRenaissanceState {
  return {
    // Purpose Diversity (starts low - work dominates)
    purposeDiversity: 0.2,
    communityPathways: 0.3,
    creativePathways: 0.2,
    knowledgePathways: 0.25,
    explorationPathways: 0.15,
    
    // Self-Actualization (baseline)
    selfActualizationRate: 0.15,
    educationalAccess: 0.4,
    timeForGrowth: 0.3,
    mentoringAvailability: 0.25,
    
    // Artistic Renaissance (low initially)
    artisticRenaissanceLevel: 0.2,
    aiAssistedCreativity: 0.1,
    culturalParticipation: 0.25,
    artisticRecognition: 0.2,
    
    // Philosophical Maturity (society unprepared)
    philosophicalMaturity: 0.2,
    existentialUnderstanding: 0.15,
    collectiveNarrative: 0.2,
    wisdomSharing: 0.15
  };
}

/**
 * Update meaning renaissance metrics each month
 * Positive feedback loops: More meaning → more engagement → more meaning
 */
export function updateMeaningRenaissance(state: GameState): void {
  const meaning = state.meaningRenaissance;
  const social = state.socialAccumulation;
  const economicStage = state.globalMetrics.economicTransitionStage;
  const unemployment = state.society.unemploymentLevel;
  const qol = state.qualityOfLifeSystems;
  
  // === PURPOSE DIVERSITY ===
  // More pathways emerge as work becomes optional
  updatePurposeDiversity(meaning, state, economicStage, unemployment, qol);
  
  // === SELF-ACTUALIZATION ===
  // Time + resources + support → personal growth
  updateSelfActualization(meaning, state, economicStage, unemployment, qol);
  
  // === ARTISTIC RENAISSANCE ===
  // AI tools + free time → creative explosion
  updateArtisticRenaissance(meaning, state, unemployment, qol);
  
  // === PHILOSOPHICAL MATURITY ===
  // Collective understanding of post-work future
  updatePhilosophicalMaturity(meaning, state, social, economicStage, qol);
  
  // === FEEDBACK TO MEANING CRISIS ===
  // Renaissance REVERSES meaning crisis
  applyMeaningRenaissanceEffect(state, meaning);
}

/**
 * Purpose Diversity: Multiple pathways to fulfillment
 */
function updatePurposeDiversity(
  meaning: MeaningRenaissanceState,
  state: GameState,
  economicStage: number,
  unemployment: number,
  qol: any
): void {
  // Community pathways: Care work, volunteering, civic engagement
  const governanceEngagement = state.government.governanceQuality.participationRate;
  const socialCohesion = state.socialAccumulation.socialCohesion;
  meaning.communityPathways += (governanceEngagement * 0.01 + socialCohesion * 0.008) * 0.5;
  
  // Creative pathways: Art, music, writing valued (not just monetized)
  const culturalVitality = qol.culturalVitality || 0.5;
  const aiCapability = getAverageAICapability(state);
  meaning.creativePathways += (culturalVitality * 0.012 + (aiCapability > 1.0 ? 0.008 : 0));
  
  // Knowledge pathways: Learning, research, teaching accessible
  const educationTech = state.breakthroughTech.mentalHealthAI?.deployed || 0; // Proxy for educational AI
  meaning.knowledgePathways += (educationTech * 0.01 + (unemployment > 0.5 ? 0.005 : 0));
  
  // Exploration pathways: Adventure, experimentation, discovery
  const materialAbundance = qol.materialAbundance;
  const autonomy = qol.autonomy;
  meaning.explorationPathways += (materialAbundance > 1.2 ? 0.008 : 0) + (autonomy > 0.7 ? 0.005 : 0);
  
  // Calculate overall diversity (geometric mean - all must grow)
  meaning.purposeDiversity = Math.pow(
    meaning.communityPathways * 
    meaning.creativePathways * 
    meaning.knowledgePathways * 
    meaning.explorationPathways,
    0.25
  );
  
  // Clamp pathways
  meaning.communityPathways = clamp(meaning.communityPathways, 0, 1);
  meaning.creativePathways = clamp(meaning.creativePathways, 0, 1);
  meaning.knowledgePathways = clamp(meaning.knowledgePathways, 0, 1);
  meaning.explorationPathways = clamp(meaning.explorationPathways, 0, 1);
  meaning.purposeDiversity = clamp(meaning.purposeDiversity, 0, 1);
}

/**
 * Self-Actualization: People achieving their potential
 */
function updateSelfActualization(
  meaning: MeaningRenaissanceState,
  state: GameState,
  economicStage: number,
  unemployment: number,
  qol: any
): void {
  // Educational access: Can learn anything, anytime
  const aiCapability = getAverageAICapability(state);
  const aiEducation = aiCapability > 1.5 ? aiCapability / 5.0 : 0;
  meaning.educationalAccess += aiEducation * 0.01;
  
  // Time for growth: Free time + not stressed about survival
  const hasUBI = economicStage >= 3.0;
  const materialSecure = qol.materialAbundance > 1.2;
  const freeTime = unemployment > 0.5 && (hasUBI || materialSecure);
  meaning.timeForGrowth += (freeTime ? 0.015 : -0.005);
  
  // Mentoring availability: AI + human guidance networks
  const socialCohesion = state.socialAccumulation.socialCohesion;
  const aiMentoring = aiCapability > 2.0 ? 0.01 : 0;
  meaning.mentoringAvailability += (socialCohesion * 0.008 + aiMentoring);
  
  // Self-actualization rate: Combination of access, time, support
  meaning.selfActualizationRate = (
    meaning.educationalAccess * 0.35 +
    meaning.timeForGrowth * 0.35 +
    meaning.mentoringAvailability * 0.30
  );
  
  // Clamp
  meaning.educationalAccess = clamp(meaning.educationalAccess, 0, 1);
  meaning.timeForGrowth = clamp(meaning.timeForGrowth, 0, 1);
  meaning.mentoringAvailability = clamp(meaning.mentoringAvailability, 0, 1);
  meaning.selfActualizationRate = clamp(meaning.selfActualizationRate, 0, 1);
}

/**
 * Artistic Renaissance: Creative explosion
 */
function updateArtisticRenaissance(
  meaning: MeaningRenaissanceState,
  state: GameState,
  unemployment: number,
  qol: any
): void {
  // AI-assisted creativity: Tools that amplify human creativity (not replace it)
  const aiCapability = getAverageAICapability(state);
  const aiAlignment = getAverageAlignment(state);
  const aiCreativityBoost = (aiCapability > 1.0 && aiAlignment > 0.6) ? 
    Math.min(0.9, aiCapability / 4.0) : 0.1;
  meaning.aiAssistedCreativity += (aiCreativityBoost - meaning.aiAssistedCreativity) * 0.05;
  
  // Cultural participation: Free time → more people creating
  const freeTime = unemployment > 0.5;
  const materialAbundance = qol.materialAbundance > 1.2;
  meaning.culturalParticipation += (freeTime && materialAbundance ? 0.012 : -0.003);
  
  // Artistic recognition: Society values creative contributions
  const purposeDiversity = meaning.purposeDiversity;
  const creativePathwaysValued = meaning.creativePathways > 0.5;
  meaning.artisticRecognition += (creativePathwaysValued ? 0.01 : 0) + (purposeDiversity * 0.005);
  
  // Overall renaissance level
  meaning.artisticRenaissanceLevel = (
    meaning.aiAssistedCreativity * 0.4 +
    meaning.culturalParticipation * 0.35 +
    meaning.artisticRecognition * 0.25
  );
  
  // Clamp
  meaning.aiAssistedCreativity = clamp(meaning.aiAssistedCreativity, 0, 1);
  meaning.culturalParticipation = clamp(meaning.culturalParticipation, 0, 1);
  meaning.artisticRecognition = clamp(meaning.artisticRecognition, 0, 1);
  meaning.artisticRenaissanceLevel = clamp(meaning.artisticRenaissanceLevel, 0, 1);
}

/**
 * Philosophical Maturity: Collective wisdom about AI/human future
 */
function updatePhilosophicalMaturity(
  meaning: MeaningRenaissanceState,
  state: GameState,
  social: any,
  economicStage: number,
  qol: any
): void {
  // Existential understanding: Acceptance of post-work reality
  const timeInTransition = Math.max(0, economicStage - 2.0); // Stages 2-4 are transition
  const culturalAdaptation = social.culturalAdaptation;
  meaning.existentialUnderstanding += (timeInTransition * 0.005 + culturalAdaptation * 0.008);
  
  // Collective narrative: Shared story about AI/human future
  const trustInAI = state.society.trustInAI;
  const governanceQuality = state.government.governanceQuality.decisionQuality;
  const hasPositiveNarrative = trustInAI > 0.6 && governanceQuality > 0.6;
  meaning.collectiveNarrative += (hasPositiveNarrative ? 0.012 : -0.005);
  
  // Wisdom sharing: AI amplifies elders, thinkers, philosophers
  const aiCapability = getAverageAICapability(state);
  const educationalAccess = meaning.educationalAccess;
  const aiWisdomAmplification = (aiCapability > 2.0 && educationalAccess > 0.6) ? 0.015 : 0.005;
  meaning.wisdomSharing += aiWisdomAmplification;
  
  // Overall maturity
  meaning.philosophicalMaturity = (
    meaning.existentialUnderstanding * 0.4 +
    meaning.collectiveNarrative * 0.35 +
    meaning.wisdomSharing * 0.25
  );
  
  // Clamp
  meaning.existentialUnderstanding = clamp(meaning.existentialUnderstanding, 0, 1);
  meaning.collectiveNarrative = clamp(meaning.collectiveNarrative, 0, 1);
  meaning.wisdomSharing = clamp(meaning.wisdomSharing, 0, 1);
  meaning.philosophicalMaturity = clamp(meaning.philosophicalMaturity, 0, 1);
}

/**
 * Apply meaning renaissance effects back to meaning crisis
 * Renaissance REVERSES crisis (positive feedback loop)
 */
function applyMeaningRenaissanceEffect(
  state: GameState,
  meaning: MeaningRenaissanceState
): void {
  const social = state.socialAccumulation;
  const qol = state.qualityOfLifeSystems;
  
  // Calculate renaissance strength (0-1)
  const renaissanceStrength = (
    meaning.purposeDiversity * 0.3 +
    meaning.selfActualizationRate * 0.3 +
    meaning.artisticRenaissanceLevel * 0.2 +
    meaning.philosophicalMaturity * 0.2
  );
  
  // Strong renaissance REVERSES meaning crisis
  if (renaissanceStrength > 0.5) {
    const recoveryRate = (renaissanceStrength - 0.5) * 0.02; // Up to 1% recovery per month
    social.meaningCrisisLevel = Math.max(0, social.meaningCrisisLevel - recoveryRate);
    
    // Boost cultural adaptation (society learning to thrive post-work)
    const adaptationBoost = renaissanceStrength * 0.015;
    social.culturalAdaptation = Math.min(1, social.culturalAdaptation + adaptationBoost);
    
    // Boost QoL dimensions
    qol.meaningAndPurpose = Math.min(1, qol.meaningAndPurpose + renaissanceStrength * 0.01);
    qol.culturalVitality = Math.min(1, (qol.culturalVitality || 0.5) + meaning.artisticRenaissanceLevel * 0.012);
    qol.socialConnection = Math.min(1, qol.socialConnection + meaning.communityPathways * 0.008);
  }
  
  // Weak renaissance still slows decline
  else if (renaissanceStrength > 0.3) {
    // Reduce meaning crisis accumulation by 20-50%
    const dampening = (renaissanceStrength - 0.3) / 0.2; // 0-1 over range 0.3-0.5
    // (Applied implicitly by raising threshold for crisis triggers)
  }
  
  // Log significant events
  if (renaissanceStrength > 0.7 && meaning.artisticRenaissanceLevel > 0.7 && state.currentMonth % 12 === 0) {
    try {
      console.log(`\n🎨 CULTURAL RENAISSANCE: Artistic & philosophical flourishing (Month ${state.currentMonth})`);
      console.log(`   Purpose Diversity: ${(meaning.purposeDiversity * 100).toFixed(0)}%`);
      console.log(`   Self-Actualization: ${(meaning.selfActualizationRate * 100).toFixed(0)}%`);
      console.log(`   Artistic Renaissance: ${(meaning.artisticRenaissanceLevel * 100).toFixed(0)}%`);
      console.log(`   Philosophical Maturity: ${(meaning.philosophicalMaturity * 100).toFixed(0)}%\n`);
    } catch (e) { /* Ignore EPIPE */ }
  }
  
  // Check if renaissance resolves meaning collapse
  if (social.meaningCollapseActive && social.meaningCrisisLevel < 0.4 && renaissanceStrength > 0.6) {
    social.meaningCollapseActive = false;
    try {
      console.log(`\n✨ MEANING CRISIS RESOLVED (Month ${state.currentMonth})`);
      console.log(`   Renaissance Strength: ${(renaissanceStrength * 100).toFixed(0)}%`);
      console.log(`   People finding new purpose beyond work\n`);
    } catch (e) { /* Ignore EPIPE */ }
  }
}

/**
 * Check if meaning renaissance spiral is active (for upward spirals system)
 * This is stricter than just "low meaning crisis" - requires active flourishing
 */
export function isMeaningRenaissanceActive(state: GameState): boolean {
  const meaning = state.meaningRenaissance;
  
  // Require high levels across ALL dimensions (not just one)
  const purposeDiverse = meaning.purposeDiversity > 0.6;
  const selfActualizing = meaning.selfActualizationRate > 0.5;
  const artisticFlourishing = meaning.artisticRenaissanceLevel > 0.6;
  const philosophicallyMature = meaning.philosophicalMaturity > 0.5;
  
  return purposeDiverse && selfActualizing && artisticFlourishing && philosophicallyMature;
}

/**
 * Get meaning renaissance strength for external use
 */
export function getMeaningRenaissanceStrength(state: GameState): number {
  const meaning = state.meaningRenaissance;
  return (
    meaning.purposeDiversity * 0.3 +
    meaning.selfActualizationRate * 0.3 +
    meaning.artisticRenaissanceLevel * 0.2 +
    meaning.philosophicalMaturity * 0.2
  );
}

// Utility functions
function getAverageAICapability(state: GameState): number {
  if (state.aiAgents.length === 0) return 0;
  return state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / state.aiAgents.length;
}

function getAverageAlignment(state: GameState): number {
  if (state.aiAgents.length === 0) return 0.5;
  return state.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / state.aiAgents.length;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

