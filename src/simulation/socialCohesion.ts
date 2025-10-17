/**
 * Social Cohesion & Meaning Crisis System (Phase 3: Golden Age & Accumulation Systems)
 * 
 * Tracks psychological and social costs from rapid automation and economic transition.
 * These accumulate slowly, then manifest as mental health collapse or social unrest.
 * 
 * Key mechanisms:
 * - Meaning Crisis: Automation → work-identity collapse → existential despair
 * - Institutional Erosion: Tech pace > government adaptation → legitimacy declines
 * - Social Fragmentation: Inequality + isolation → community bonds break
 * - Cultural Adaptation: Slow development of new meaning frameworks
 * 
 * Critical insight: UBI solves material poverty but NOT meaning crisis or institutional lag.
 * High QoL can mask eroding social fabric until sudden collapse.
 */

import { GameState, SocialAccumulation } from '@/types/game';
import { levyFlight, ALPHA_PRESETS } from './utils/levyDistributions';

/**
 * Initialize social accumulation state
 * 
 * Starting values represent 2025 REALISTIC baseline (research-backed):
 * - Meaning crisis: WHO 2025 data on loneliness epidemic
 * - Institutional legitimacy: Pew Research 2024
 * - Social cohesion: AAMCH 2024
 * - Cultural adaptation: Minimal post-work frameworks
 */
export function initializeSocialAccumulation(): SocialAccumulation {
  return {
    meaningCrisisLevel: 0.22,           // Was 0.15 - Research: WHO 2025 (17-21% youth lonely, 30-40% adults)
    institutionalLegitimacy: 0.65,      // KEEP - Validated (Pew Research 2024)
    socialCohesion: 0.60,                // KEEP - Validated (AAMCH 2024)
    culturalAdaptation: 0.10,            // KEEP - Correct for 2025 (minimal post-work culture)
    meaningCollapseActive: false,
    institutionalFailureActive: false,
    socialUnrestActive: false
  };
}

/**
 * Update social accumulation based on economic transitions
 * 
 * Called each month to track psychological and social debt accumulation.
 */
export function updateSocialAccumulation(
  state: GameState
): void {
  const social = state.socialAccumulation;
  const economicStage = state.globalMetrics.economicTransitionStage;
  const unemployment = state.society.unemploymentLevel;
  const wealthDistribution = state.globalMetrics.wealthDistribution;
  const trustInAI = getTrustInAI(state.society); // Phase 2C: Use paranoia-derived trust
  const governmentLegitimacy = state.government.legitimacy;
  
  // Check for mitigating technologies/policies
  const hasUBI = economicStage >= 3.0 || state.government.structuralChoices.ubiVariant !== 'none';
  // Use overall research investment as proxy for education programs
  const totalResearchInvestment = state.government.researchInvestments.physical + 
    state.government.researchInvestments.digital + 
    state.government.researchInvestments.cognitive + 
    state.government.researchInvestments.social;
  const hasEducationPrograms = totalResearchInvestment > 20.0;
  const hasCommunityPrograms = state.globalMetrics.socialStability > 0.7;
  
  // === MEANING CRISIS ACCUMULATION ===
  // Automation destroys work-based identity
  // FIX (Oct 16, 2025): Slowed from 1-4%/month to 0.3-1.2%/month
  // Research justification: Meaning crises develop over 2-5 YEARS, not months
  // WHO loneliness epidemic (17-21%) is chronic baseline, not acute spike
  let meaningCrisisRate = unemployment * 0.003; // Was 0.010 (3x slower)
  
  // Rapid job loss spikes meaning crisis
  const previousUnemployment = Math.max(0.1, unemployment - 0.05); // Approximate
  const jobLossRate = unemployment - previousUnemployment;
  meaningCrisisRate += Math.max(0, jobLossRate) * 0.05; // Was 0.15 (3x slower)
  
  // Stage 2 (Mass Unemployment) is peak meaning crisis
  if (economicStage >= 2.0 && economicStage < 3.5) {
    meaningCrisisRate += 0.004; // Was 0.012 (3x slower)
  }
  
  // AI replacing cognitive work hits harder (identity threat)
  const avgAICapability = state.aiAgents.length > 0
    ? state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / state.aiAgents.length
    : 0;
  meaningCrisisRate += avgAICapability * 0.0013; // Was 0.004 (3x slower)
  
  // Mitigation from policies
  if (hasUBI) {
    meaningCrisisRate *= 0.7; // 30% reduction (provides security, not meaning)
  }
  if (hasEducationPrograms) {
    meaningCrisisRate *= 0.8; // 20% reduction (retraining helps somewhat)
  }
  if (social.culturalAdaptation > 0.5) {
    meaningCrisisRate *= 0.5; // 50% reduction (new frameworks emerging)
  }
  
  // Apply meaning crisis accumulation
  const currentMeaningCrisis = isNaN(social.meaningCrisisLevel) ? 0.0 : social.meaningCrisisLevel;
  social.meaningCrisisLevel = Math.max(0, Math.min(1, currentMeaningCrisis + meaningCrisisRate));
  
  // === INSTITUTIONAL LEGITIMACY EROSION ===
  // Governments lag behind technological change
  const techPace = avgAICapability + economicStage * 0.2;
  let legitimacyErosionRate = techPace * 0.006; // Faster tech = more lag
  
  // Failed policies damage legitimacy
  if (governmentLegitimacy < 0.5) {
    legitimacyErosionRate += 0.008; // Legitimacy crisis accelerates
  }
  
  // Low trust compounds erosion
  if (trustInAI < 0.4) {
    legitimacyErosionRate += 0.006; // People lose faith in institutions
  }
  
  // High surveillance damages legitimacy (authoritarian perception)
  const surveillanceLevel = state.government.structuralChoices.surveillanceLevel;
  legitimacyErosionRate += surveillanceLevel * 0.008;
  
  // Mitigation from effective governance
  const effectiveGovernance = governmentLegitimacy * (1 - surveillanceLevel);
  if (effectiveGovernance > 0.6) {
    legitimacyErosionRate *= 0.5; // 50% reduction (good governance maintains trust)
  }
  
  // Successful policy adaptation improves legitimacy
  let legitimacyRecoveryRate = 0;
  if (hasUBI && unemployment > 0.3) {
    legitimacyRecoveryRate += 0.005; // UBI helps in crisis
  }
  if (state.government.activeRegulations.length > 0 && state.government.activeRegulations.length < 8) {
    legitimacyRecoveryRate += 0.003; // Balanced regulation works
  }
  
  // Apply legitimacy change
  const currentLegitimacy = isNaN(social.institutionalLegitimacy) ? 0.7 : social.institutionalLegitimacy;
  social.institutionalLegitimacy = Math.max(0, Math.min(1, 
    currentLegitimacy - legitimacyErosionRate + legitimacyRecoveryRate
  ));
  
  // === SOCIAL COHESION DEPLETION ===
  // Inequality erodes solidarity
  let cohesionLossRate = (1 - wealthDistribution) * 0.008; // High inequality = rapid loss
  
  // Unemployment creates resentment
  cohesionLossRate += unemployment * 0.006;
  
  // Isolation from automation (remote work, AI services)
  if (avgAICapability > 0.5) {
    cohesionLossRate += 0.005; // AI mediation reduces human connection
  }
  
  // Meaning crisis spreads atomization
  cohesionLossRate += social.meaningCrisisLevel * 0.006;
  
  // Institutional failure erodes trust in collective action
  if (social.institutionalLegitimacy < 0.4) {
    cohesionLossRate += 0.008; // "Why bother?" mindset
  }
  
  // Mitigation from community programs
  let cohesionRecoveryRate = 0;
  if (hasCommunityPrograms) {
    cohesionRecoveryRate += 0.008; // Active community building
  }
  if (hasUBI) {
    cohesionRecoveryRate += 0.004; // Reduced competition, more cooperation
  }
  if (state.globalMetrics.qualityOfLife > 0.75) {
    cohesionRecoveryRate += 0.005; // Abundance reduces zero-sum mindset
  }
  
  // Apply cohesion change
  const currentCohesion = isNaN(social.socialCohesion) ? 0.7 : social.socialCohesion;
  social.socialCohesion = Math.max(0, Math.min(1,
    currentCohesion - cohesionLossRate + cohesionRecoveryRate
  ));
  
  // === CULTURAL ADAPTATION (SLOW IMPROVEMENT) ===
  // Base adaptation rate (very slow - generational change)
  let adaptationRate = 0.002; // 0.2% per month (years to shift culture)
  
  // Stage 3+ accelerates adaptation (necessity)
  if (economicStage >= 3.0) {
    adaptationRate += 0.008; // UBI era forces cultural shift
  }
  
  // High unemployment pushes adaptation
  if (unemployment > 0.4) {
    adaptationRate += 0.006; // Crisis forces change
  }
  
  // Education and community programs help
  if (hasEducationPrograms) {
    adaptationRate += 0.005;
  }
  if (hasCommunityPrograms) {
    adaptationRate += 0.004;
  }
  
  // Already-adapted people accelerate others (exponential)
  if (social.culturalAdaptation > 0.3) {
    adaptationRate *= (1 + social.culturalAdaptation); // Positive feedback
  }
  
  // Institutional failure slows adaptation (no coordination)
  if (social.institutionalLegitimacy < 0.3) {
    adaptationRate *= 0.5; // Hard to coordinate without institutions
  }
  
  // Apply cultural adaptation
  const currentAdaptation = isNaN(social.culturalAdaptation) ? 0.2 : social.culturalAdaptation;
  social.culturalAdaptation = Math.max(0, Math.min(1,
    currentAdaptation + adaptationRate
  ));
  
  // === PHASE 1: LÉVY FLIGHT CASCADE CHECKS (Preference Falsification Cascades) ===
  // Research: Kuran (1991) - "Now out of Never" - preference falsification hides dissent
  // Most of the time: gradual change. Rarely: Leipzig 1989 / Arab Spring cascades
  // When latent opposition + info suppression high → cascade potential

  const qualityOfLife = state.globalMetrics.qualityOfLife;
  const latentOpposition = Math.max(0, 0.6 - qualityOfLife); // High QoL = low opposition
  const informationIntegrity = state.qualityOfLifeSystems.informationIntegrity;
  const pluralisticIgnorance = 1 - informationIntegrity; // Low integrity = people don't know others share their views

  // Critical juncture detection (high grievance + low info integrity)
  if (latentOpposition > 0.3 && pluralisticIgnorance > 0.5) {
    // Alpha = 1.8: Fat tails (rare cascades like Arab Spring, Leipzig 1989)
    const cascadePotential = levyFlight(ALPHA_PRESETS.SOCIAL_MOVEMENT, Math.random);

    if (cascadePotential > 15.0) {
      // Information cascade triggered (one defector reveals hidden opposition)
      const cascadeSize = Math.min(cascadePotential / 100, 0.4); // Max 40% mobilization

      // Rapid social cohesion increase (people discover they're not alone)
      social.socialCohesion = Math.min(1.0, social.socialCohesion + cascadeSize);

      // Institutional legitimacy shifts based on government response
      const governmentResponse = state.government.governmentType === 'authoritarian' ? -cascadeSize * 0.5 : cascadeSize * 0.3;
      social.institutionalLegitimacy = Math.max(0, Math.min(1.0, social.institutionalLegitimacy + governmentResponse));

      console.log(`\n  📢 PREFERENCE FALSIFICATION CASCADE: Kuran mechanism triggered`);
      console.log(`     Latent opposition: ${(latentOpposition * 100).toFixed(1)}%, Pluralistic ignorance: ${(pluralisticIgnorance * 100).toFixed(1)}%`);
      console.log(`     Magnitude: ${cascadePotential.toFixed(2)} → +${(cascadeSize * 100).toFixed(1)}% mobilization`);
      console.log(`     Cascade type: Leipzig 1989 / Arab Spring mechanism (hidden dissent revealed)`);
    }
  }

  // === CRISIS TRIGGERS ===
  checkSocialCrises(state);
}

/**
 * Check if social accumulation has crossed crisis thresholds
 * 
 * Crises trigger QoL impacts, social unrest, and potential dystopia transitions.
 */
function checkSocialCrises(state: GameState): void {
  const social = state.socialAccumulation;
  const qol = state.qualityOfLifeSystems;
  
  // MEANING COLLAPSE: Existential despair exceeds 60%
  if (social.meaningCrisisLevel > 0.6 && !social.meaningCollapseActive) {
    social.meaningCollapseActive = true;
    try {
      console.log(`\n😔 MEANING COLLAPSE TRIGGERED (Month ${state.currentMonth})`);
      console.log(`   Meaning Crisis Level: ${(social.meaningCrisisLevel * 100).toFixed(1)}%`);
      console.log(`   Impact: Mental health crisis, suicide epidemic, despair\n`);
    } catch (e) { /* Ignore EPIPE */ }

    // Severe QoL impacts
    qol.mentalHealth *= 0.65; // 35% drop
    qol.meaningAndPurpose *= 0.4; // 60% drop
    qol.socialConnection *= 0.7; // 30% drop (isolation spirals)
    state.society.trustInAI = Math.max(0, state.society.trustInAI - 0.35); // Blame AI
    state.globalMetrics.qualityOfLife = Math.max(0, state.globalMetrics.qualityOfLife - 0.35);

    // Population impact: Suicide epidemic (0.1-0.2% casualties initially)
    // SEMI-GLOBAL: Wealthy automated nations (US, EU, Japan, SK, etc.) = ~30% of world
    // 0.5% mortality rate in affected regions (severe suicide spike)
    const { addAcuteCrisisDeaths } = require('./populationDynamics');
    addAcuteCrisisDeaths(state, 0.005, 'Meaning collapse - suicide epidemic (wealthy nations)', 0.30, 'other');
  }
  
  // INSTITUTIONAL FAILURE: Government legitimacy below 30%
  if (social.institutionalLegitimacy < 0.3 && !social.institutionalFailureActive) {
    social.institutionalFailureActive = true;
    try {
      console.log(`\n🏛️  INSTITUTIONAL FAILURE TRIGGERED (Month ${state.currentMonth})`);
      console.log(`   Institutional Legitimacy: ${(social.institutionalLegitimacy * 100).toFixed(1)}%`);
      console.log(`   Impact: Governance collapse, potential authoritarian takeover\n`);
    } catch (e) { /* Ignore EPIPE */ }

    // Critical QoL impacts
    qol.politicalFreedom *= 0.6; // 40% drop (power vacuum)
    qol.autonomy *= 0.7; // 30% drop
    state.globalMetrics.socialStability = Math.max(0, state.globalMetrics.socialStability - 0.6);
    state.government.legitimacy = Math.min(0.25, state.government.legitimacy); // Floor legitimacy

    // Population impact: State collapse causes chaos, riots, food distribution failures (0.1-0.3% casualties)
    // REGIONAL: Specific failing state (Somalia, Venezuela, etc.) = ~5% of world
    // 4% mortality rate in collapsed state (severe chaos, riots, starvation)
    const { addAcuteCrisisDeaths } = require('./populationDynamics');
    addAcuteCrisisDeaths(state, 0.04, 'Institutional failure - state collapse chaos (failing state)', 0.05, 'other');

    // High risk of dystopia transition
    // Government may become authoritarian to restore order
    if (Math.random() < 0.4) {
      state.government.governmentType = 'authoritarian';
      try {
        console.log(`   🚨 Authoritarian takeover in response to chaos\n`);
      } catch (e) { /* Ignore EPIPE */ }
    }
  }
  
  // SOCIAL UNREST: Cohesion below 30%
  if (social.socialCohesion < 0.3 && !social.socialUnrestActive) {
    social.socialUnrestActive = true;
    try {
      console.log(`\n🔥 SOCIAL UNREST TRIGGERED (Month ${state.currentMonth})`);
      console.log(`   Social Cohesion: ${(social.socialCohesion * 100).toFixed(1)}%`);
      console.log(`   Impact: Riots, community breakdown, potential civil conflict\n`);
    } catch (e) { /* Ignore EPIPE */ }

    // Severe QoL impacts
    qol.physicalSafety *= 0.5; // 50% drop (violence)
    qol.communityStrength *= 0.4; // 60% drop
    qol.politicalFreedom *= 0.7; // 30% drop (crackdowns)
    state.globalMetrics.socialStability = Math.max(0, state.globalMetrics.socialStability - 0.5);

    // Government responds with control
    state.government.controlDesire = Math.min(1, state.government.controlDesire + 0.3);
    state.government.structuralChoices.surveillanceLevel = Math.min(1,
      state.government.structuralChoices.surveillanceLevel + 0.2
    );

    // Population impact: Riots and civil violence (0.2-0.5% casualties)
    // REGIONAL: Unstable regions (MENA, parts of Africa/Latin America) = ~10% of world
    // 3% mortality rate in unrest regions (riots, clashes are deadly)
    const { addAcuteCrisisDeaths } = require('./populationDynamics');
    addAcuteCrisisDeaths(state, 0.03, 'Social unrest - riots/civil violence (unstable regions)', 0.10, 'other');
  }
  
  // === ONGOING CRISIS IMPACTS ===
  // Once triggered, crises continue to degrade society
  
  // Calculate cascading failure multiplier (counts crises across ALL systems)
  const cascadeMultiplier = calculateCascadingFailureMultiplier(state);
  
  if (social.meaningCollapseActive) {
    // Ongoing despair
    qol.mentalHealth = Math.max(0, qol.mentalHealth - 0.012 * cascadeMultiplier);
    qol.meaningAndPurpose = Math.max(0, qol.meaningAndPurpose - 0.015 * cascadeMultiplier);
  }
  
  if (social.institutionalFailureActive) {
    // Ongoing governance failure
    qol.politicalFreedom = Math.max(0, qol.politicalFreedom - 0.010 * cascadeMultiplier);
    state.globalMetrics.socialStability = Math.max(0, state.globalMetrics.socialStability - 0.012 * cascadeMultiplier);
  }
  
  if (social.socialUnrestActive) {
    // Ongoing violence and breakdown
    qol.physicalSafety = Math.max(0, qol.physicalSafety - 0.015 * cascadeMultiplier);
    qol.communityStrength = Math.max(0, qol.communityStrength - 0.010 * cascadeMultiplier);
  }
}

/**
 * Get social sustainability score (0-1)
 * 
 * Used by Golden Age → Utopia transition logic.
 * Returns how socially stable and adapted the society is.
 */
export function getSocialSustainability(social: SocialAccumulation): number {
  // Inverse meaning crisis (low crisis = good)
  const meaningScore = 1 - social.meaningCrisisLevel;
  
  // Institutional legitimacy (high = good)
  const institutionScore = social.institutionalLegitimacy;
  
  // Social cohesion (high = good)
  const cohesionScore = social.socialCohesion;
  
  // Cultural adaptation (high = good)
  const adaptationScore = social.culturalAdaptation;
  
  // Weighted average (meaning and cohesion most critical)
  return (meaningScore * 0.3 + institutionScore * 0.25 + cohesionScore * 0.3 + adaptationScore * 0.15);
}

/**
 * Check if any social crisis would block Utopia
 * 
 * Utopia requires social stability and cultural adaptation, not just material prosperity.
 */
export function hasSocialCrisis(social: SocialAccumulation): boolean {
  return social.meaningCollapseActive || 
         social.institutionalFailureActive || 
         social.socialUnrestActive;
}

/**
 * Get trust in AI derived from paranoia level
 * 
 * Phase 2F+ Paranoia System: Trust is now calculated from paranoia, not stored directly.
 * This ensures trust can recover as paranoia decays, enabling Cognitive Spiral activation.
 * 
 * Formula: trust = 1.0 - (paranoia * 0.75)
 * Bounds: [0.20, 0.95] - Even max paranoia leaves 20% trust, even zero paranoia caps at 95%
 * 
 * @param society - Human society agent with paranoia level
 * @returns Trust level [0.20, 0.95]
 */
/**
 * Get trust in AI for general social dynamics (population-weighted)
 * Used for: social cohesion, protests, public sentiment
 */
export function getTrustInAI(society: HumanSocietyAgent): number {
  const paranoia = society.paranoiaLevel ?? 0.15; // Default to 15% baseline paranoia
  const trustFromParanoia = 1.0 - paranoia * 0.75;
  
  // Floor: Even 100% paranoia leaves 20% trust (some people always believe)
  // Ceiling: Even 0% paranoia caps at 95% trust (healthy skepticism remains)
  return Math.max(0.20, Math.min(0.95, trustFromParanoia));
}

/**
 * Get trust in AI for policy decisions (power-weighted)
 * P2.3 UPDATE (Oct 16, 2025): Uses power-weighted trust when segments active
 * 
 * Used for: Government policy decisions, regulatory actions
 * Reflects reality: Elites have disproportionate influence over policy
 * 
 * Research:
 * - Gilens & Page (2014, Perspectives on Politics): Economic elites dominate US policy
 * - Bartels (2008, Unequal Democracy): Income disparity in political influence 3:1 ratio
 * - Winters & Page (2009): Oligarchic political influence in democracies
 * 
 * @param society Society agent with trust data
 * @param usePowerWeighted If true, use power-weighted trust (for policy). Default: true
 */
export function getTrustInAIForPolicy(society: HumanSocietyAgent, usePowerWeighted: boolean = true): number {
  // P2.3: If segments are active and power-weighted trust exists, use it for policy
  if (usePowerWeighted && society.powerWeightedTrustInAI !== undefined) {
    // Power-weighted trust reflects elite preferences
    // Elite have 25% of political power despite being 5% of population
    return Math.max(0.20, Math.min(0.95, society.powerWeightedTrustInAI));
  }
  
  // Fall back to paranoia-based trust (legacy behavior)
  return getTrustInAI(society);
}

/**
 * Calculate cascading failure multiplier - shared across all systems
 */
function calculateCascadingFailureMultiplier(state: GameState): number {
  const activeCrises = [
    // Environmental (4 possible)
    state.environmentalAccumulation.resourceCrisisActive,
    state.environmentalAccumulation.pollutionCrisisActive,
    state.environmentalAccumulation.climateCrisisActive,
    state.environmentalAccumulation.ecosystemCrisisActive,
    // Social (3 possible)
    state.socialAccumulation.meaningCollapseActive,
    state.socialAccumulation.institutionalFailureActive,
    state.socialAccumulation.socialUnrestActive,
    // Technological (3 possible)
    state.technologicalRisk.controlLossActive,
    state.technologicalRisk.corporateDystopiaActive,
    state.technologicalRisk.complacencyCrisisActive
  ].filter(Boolean).length;
  
  if (activeCrises <= 2) {
    return 1.0; // No amplification for 1-2 crises
  }
  
  // Each crisis beyond 2 adds 50% more degradation
  return 1.0 + (activeCrises - 2) * 0.5;
}

