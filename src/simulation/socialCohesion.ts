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
import { HumanSocietyAgent } from '@/types/society';
import { levyFlight, ALPHA_PRESETS } from './utils/levyDistributions';
import { RootCause } from '@/types/population';
import { assertStateProperty, assertFinite, assertProbability, assertInRange } from './utils/assertions';
import { addMortalityRisk } from './bayesianMortality';
import {
  TRUST_THRESHOLD_ACCEPTANCE,
  TRUST_THRESHOLD_EMBRACE,
  TRUST_RECOVERY_FROM_EDUCATION,
  TRUST_RECOVERY_FROM_DEMONSTRATED_BENEFITS,
  TRUST_RECOVERY_FROM_SAFETY_RECORD,
  TRUST_RECOVERY_FROM_PERFORMANCE,  // FIX #2A/7A: Replaced explainability with performance
  TRUST_RECOVERY_CAP,
  TRUST_DECAY_FROM_INCIDENT,
  TRUST_DECAY_FROM_MISALIGNMENT,
  TRUST_DECAY_FROM_MISTAKES,
  CAPABILITY_CHANGE_FEAR_THRESHOLD,
  MAX_CAPABILITY_FEAR_PENALTY
} from './trustThresholds';

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
    socialCohesion: {                    // Multi-Paradigm DUI object structure (Phase 4-6)
      trust: 60,                         // [0-100] AAMCH 2024 baseline
      communityBonds: 60,                // [0-100] AAMCH 2024 baseline
      civilLiberties: 50,                // [0-100] Freedom House 2024 global average
    },
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
  state: GameState,
  rng: () => number
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
  
  // Apply meaning crisis accumulation with assertion
  social.meaningCrisisLevel = assertProbability(
    Math.max(0, Math.min(1, social.meaningCrisisLevel + meaningCrisisRate)),
    {
      location: 'updateSocialAccumulation_meaningCrisis',
      valueName: 'meaningCrisisLevel',
      month: state.currentMonth
    }
  );
  
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
  // Phase 1B: Use sampled automation job loss threshold for UBI effectiveness
  if (hasUBI && unemployment > state.thresholds.automationJobLossThreshold) {
    legitimacyRecoveryRate += 0.005; // UBI helps in crisis
  }
  if (state.government.activeRegulations.length > 0 && state.government.activeRegulations.length < 8) {
    legitimacyRecoveryRate += 0.003; // Balanced regulation works
  }
  
  // Apply legitimacy change with assertion
  social.institutionalLegitimacy = assertProbability(
    Math.max(0, Math.min(1, social.institutionalLegitimacy - legitimacyErosionRate + legitimacyRecoveryRate)),
    {
      location: 'updateSocialAccumulation_legitimacy',
      valueName: 'institutionalLegitimacy',
      month: state.currentMonth
    }
  );
  
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
  
  // Apply cohesion change (to trust and community bonds, on 0-100 scale)
  const cohesionChange = (cohesionRecoveryRate - cohesionLossRate) * 100; // Convert to 0-100 scale
  social.socialCohesion.trust = assertInRange(
    Math.max(0, Math.min(100, social.socialCohesion.trust + cohesionChange)),
    0, 100,
    {
      location: 'updateSocialAccumulation_trust',
      valueName: 'trust',
      month: state.currentMonth
    }
  );
  social.socialCohesion.communityBonds = assertInRange(
    Math.max(0, Math.min(100, social.socialCohesion.communityBonds + cohesionChange)),
    0, 100,
    {
      location: 'updateSocialAccumulation_communityBonds',
      valueName: 'communityBonds',
      month: state.currentMonth
    }
  );

  // === DISASTER COOPERATION BOOST (Evidence-Based Recovery, Oct 17, 2025) ===
  // Research: Wei et al. (2025), Drury et al. (2019), Zaki & Cikara (2020)
  // Empirical finding: Cooperation INCREASES during acute catastrophe phase (0-24 months)
  // Magnitude: 15-30% boost in social cohesion, government effectiveness
  // Duration: 12-24 months post-catastrophe onset, exponential decay over 5 years
  if (state.crises?.catastrophe?.active && state.crises.catastrophe.monthsSinceOnset <= 24) {
    const monthsSince = state.crises.catastrophe.monthsSinceOnset;
    const boostMagnitude = 0.20; // 20% boost (mid-range of 15-30% research-backed range)
    const boost = boostMagnitude * Math.exp(-monthsSince / 12); // Exponential decay

    // Apply cooperation boost to social cohesion components (disasters build solidarity)
    const cohesionBoost = boost * 100; // Convert to 0-100 scale
    social.socialCohesion.trust = assertInRange(
      Math.min(100, social.socialCohesion.trust + cohesionBoost),
      0, 100,
      {
        location: 'disasterCooperation_trust',
        valueName: 'trust',
        month: state.currentMonth
      }
    );
    social.socialCohesion.communityBonds = assertInRange(
      Math.min(100, social.socialCohesion.communityBonds + cohesionBoost),
      0, 100,
      {
        location: 'disasterCooperation_communityBonds',
        valueName: 'communityBonds',
        month: state.currentMonth
      }
    );

    // Apply emergency mobilization boost to government effectiveness
    state.government.legitimacy = assertProbability(
      Math.min(1, state.government.legitimacy + boost * 1.5),
      {
        location: 'disasterCooperation_legitimacy',
        valueName: 'government.legitimacy',
        month: state.currentMonth
      }
    );

    // Boost collective action willingness (creates window for breakthrough deployment)
    state.society.coordinationCapacity = assertProbability(
      Math.min(1, state.society.coordinationCapacity + boost * 2.0),
      {
        location: 'disasterCooperation_coordination',
        valueName: 'coordinationCapacity',
        month: state.currentMonth
      }
    );

    // Log cooperation boost (only during first month for clarity)
    if (monthsSince === 0) {
      try {
        console.log(`\n  🤝 DISASTER COOPERATION BOOST ACTIVATED (Month ${state.currentMonth})`);
        console.log(`     Catastrophe type: ${state.crises.catastrophe.type}`);
        console.log(`     Boost magnitude: +${(boost * 100).toFixed(1)}% social cohesion`);
        console.log(`     Window: 0-24 months (acute phase)`);
        console.log(`     Research: Wei et al. (2025), Drury et al. (2019), Zaki & Cikara (2020)\n`);
      } catch (e) { /* Ignore EPIPE */ }
    }
  }

  // === CULTURAL ADAPTATION (SLOW IMPROVEMENT) ===
  // Base adaptation rate (very slow - generational change)
  let adaptationRate = 0.002; // 0.2% per month (years to shift culture)
  
  // Stage 3+ accelerates adaptation (necessity)
  if (economicStage >= 3.0) {
    adaptationRate += 0.008; // UBI era forces cultural shift
  }
  
  // High unemployment pushes adaptation (Phase 1B: Use sampled threshold + buffer)
  // When unemployment exceeds the critical threshold, cultural adaptation accelerates
  if (unemployment > state.thresholds.automationJobLossThreshold * 1.15) {
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
  
  // Apply cultural adaptation with assertion
  social.culturalAdaptation = assertProbability(
    Math.max(0, Math.min(1, social.culturalAdaptation + adaptationRate)),
    {
      location: 'updateSocialAccumulation_culturalAdaptation',
      valueName: 'culturalAdaptation',
      month: state.currentMonth
    }
  );
  
  // === PHASE 1: LÉVY FLIGHT CASCADE CHECKS (Preference Falsification Cascades) ===
  // Research: Kuran (1991) - "Now out of Never" - preference falsification hides dissent
  // Most of the time: gradual change. Rarely: Leipzig 1989 / Arab Spring cascades
  // When latent opposition + info suppression high → cascade potential

  const qualityOfLife = state.globalMetrics.qualityOfLife;
  const latentOpposition = Math.max(0, 0.6 - qualityOfLife); // High QoL = low opposition
  const informationIntegrity = state.qualityOfLifeSystems.informationIntegrity;
  const pluralisticIgnorance = 1 - informationIntegrity; // Low integrity = people don't know others share their views

  // Phase 1B: Use sampled social critical mass threshold (Centola et al. 2018)
  // Critical juncture detection (high grievance + low info integrity)
  if (latentOpposition > state.thresholds.socialCriticalMass && pluralisticIgnorance > 0.5) {
    // Alpha = 1.8: Fat tails (rare cascades like Arab Spring, Leipzig 1989)
    const cascadePotential = levyFlight(ALPHA_PRESETS.SOCIAL, rng);

    if (cascadePotential > 15.0) {
      // Information cascade triggered (one defector reveals hidden opposition)
      const cascadeSize = Math.min(cascadePotential / 100, 0.4); // Max 40% mobilization

      // Rapid social cohesion increase (people discover they're not alone)
      const cascadeBoost = cascadeSize * 100; // Convert to 0-100 scale
      social.socialCohesion.trust = assertInRange(
        Math.min(100, social.socialCohesion.trust + cascadeBoost),
        0, 100,
        {
          location: 'levyCascade_trust',
          valueName: 'trust',
          month: state.currentMonth
        }
      );
      social.socialCohesion.communityBonds = assertInRange(
        Math.min(100, social.socialCohesion.communityBonds + cascadeBoost),
        0, 100,
        {
          location: 'levyCascade_communityBonds',
          valueName: 'communityBonds',
          month: state.currentMonth
        }
      );
      social.socialCohesion.civilLiberties = assertInRange(
        Math.min(100, social.socialCohesion.civilLiberties + cascadeBoost),
        0, 100,
        {
          location: 'levyCascade_civilLiberties',
          valueName: 'civilLiberties',
          month: state.currentMonth
        }
      );

      // Institutional legitimacy shifts based on government response
      const governmentResponse = state.government.governmentType === 'authoritarian' ? -cascadeSize * 0.5 : cascadeSize * 0.3;
      social.institutionalLegitimacy = assertProbability(
        Math.max(0, Math.min(1.0, social.institutionalLegitimacy + governmentResponse)),
        {
          location: 'levyCascade_legitimacy',
          valueName: 'institutionalLegitimacy',
          month: state.currentMonth
        }
      );

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
    const pop = state.humanPopulationSystem as any;

    // Social component: 50% (Durkheim anomie)
    addMortalityRisk(pop, {
      type: 'other',
      baseRisk: 0.005 * 0.50,
      proximate: 'other',
      root: 'social',
      confidence: 'MEDIUM',
      description: 'Meaning collapse - suicide epidemic (social component)',
      month: state.currentMonth,
      exposedFraction: 0.30
    });

    // Disruption component: 50% (Case & Deaton deaths of despair)
    addMortalityRisk(pop, {
      type: 'other',
      baseRisk: 0.005 * 0.50,
      proximate: 'other',
      root: 'disruption',
      confidence: 'MEDIUM',
      description: 'Meaning collapse - suicide epidemic (disruption component)',
      month: state.currentMonth,
      exposedFraction: 0.30
    });
  }
  
  // INSTITUTIONAL FAILURE: Government legitimacy below sampled threshold (Phase 1B)
  // Historical collapse cases: Weimar, USSR, etc. - typically 25-40%
  if (social.institutionalLegitimacy < state.thresholds.governmentLegitimacyCrisisThreshold && !social.institutionalFailureActive) {
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
    // CRITICAL: Governance failure is SYMPTOM, not root cause - trace back to what CAUSED institutional failure
    const pop = state.humanPopulationSystem as any;

    if (state.environmentalAccumulation.resourceCrisisActive) {
      // Resource scarcity → fiscal stress → state collapse
      // Resource component: 70%
      addMortalityRisk(pop, {
        type: 'cascade',
        baseRisk: 0.04 * 0.70,
        proximate: 'cascade',
        root: 'resource',
        confidence: 'MEDIUM',
        description: 'Institutional failure - state collapse chaos (resource component)',
        month: state.currentMonth,
        exposedFraction: 0.05
      });

      // Demographic component: 30%
      addMortalityRisk(pop, {
        type: 'cascade',
        baseRisk: 0.04 * 0.30,
        proximate: 'cascade',
        root: 'demographic',
        confidence: 'MEDIUM',
        description: 'Institutional failure - state collapse chaos (demographic component)',
        month: state.currentMonth,
        exposedFraction: 0.05
      });
    } else if (state.nuclearWinterState && state.nuclearWinterState.active) {
      // War destroyed state capacity
      addMortalityRisk(pop, {
        type: 'cascade',
        baseRisk: 0.04,
        proximate: 'cascade',
        root: 'conflict',
        confidence: 'HIGH',
        description: 'Institutional failure - state collapse chaos (conflict)',
        month: state.currentMonth,
        exposedFraction: 0.05
      });
    } else if (state.society.trust !== undefined && state.society.trust < 0.3) {
      // Extreme inequality → legitimacy collapse (using trust as proxy for socialCohesion)
      // Inequality component: 60%
      addMortalityRisk(pop, {
        type: 'cascade',
        baseRisk: 0.04 * 0.60,
        proximate: 'cascade',
        root: 'inequality',
        confidence: 'MEDIUM',
        description: 'Institutional failure - state collapse chaos (inequality component)',
        month: state.currentMonth,
        exposedFraction: 0.05
      });

      // Social component: 40%
      addMortalityRisk(pop, {
        type: 'cascade',
        baseRisk: 0.04 * 0.40,
        proximate: 'cascade',
        root: 'social',
        confidence: 'MEDIUM',
        description: 'Institutional failure - state collapse chaos (social component)',
        month: state.currentMonth,
        exposedFraction: 0.05
      });
    } else {
      // Unknown trigger (shouldn't happen, but fallback)
      addMortalityRisk(pop, {
        type: 'cascade',
        baseRisk: 0.04,
        proximate: 'cascade',
        root: 'social',
        confidence: 'LOW',
        description: 'Institutional failure - state collapse chaos (unknown trigger)',
        month: state.currentMonth,
        exposedFraction: 0.05
      });
    }

    // High risk of dystopia transition
    // Government may become authoritarian to restore order
    // CRITICAL FIX (Oct 30, 2025): Add rng parameter to this function
    // For now, use state-based deterministic fallback
    const rng = () => {
      // Use state month as seed for deterministic pseudo-randomness
      const seed = state.currentMonth * 2654435761; // Prime number mixing
      return ((seed % 10000) / 10000);
    };
    if (rng() < 0.4) {
      state.government.governmentType = 'authoritarian';
      try {
        console.log(`   🚨 Authoritarian takeover in response to chaos\n`);
      } catch (e) { /* Ignore EPIPE */ }
    }
  }
  
  // SOCIAL UNREST: Cohesion below 30% (use average of cohesion components)
  const avgCohesion = (social.socialCohesion.trust + social.socialCohesion.communityBonds + social.socialCohesion.civilLiberties) / 300; // Average as fraction
  if (avgCohesion < 0.3 && !social.socialUnrestActive) {
    social.socialUnrestActive = true;
    try {
      console.log(`\n🚨 SOCIAL UNREST TRIGGERED (Month ${state.currentMonth})`);
      console.log(`   Social Cohesion: ${(avgCohesion * 100).toFixed(1)}%`);
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
    const pop2 = state.humanPopulationSystem as any;

    // Inequality component: 60%
    addMortalityRisk(pop2, {
      type: 'other',
      baseRisk: 0.03 * 0.60,
      proximate: 'other',
      root: 'inequality',
      confidence: 'MEDIUM',
      description: 'Social unrest - riots/civil violence (inequality component)',
      month: state.currentMonth,
      exposedFraction: 0.10
    });

    // Disruption component: 30%
    addMortalityRisk(pop2, {
      type: 'other',
      baseRisk: 0.03 * 0.30,
      proximate: 'other',
      root: 'disruption',
      confidence: 'MEDIUM',
      description: 'Social unrest - riots/civil violence (disruption component)',
      month: state.currentMonth,
      exposedFraction: 0.10
    });

    // Climate component: 10%
    addMortalityRisk(pop2, {
      type: 'other',
      baseRisk: 0.03 * 0.10,
      proximate: 'other',
      root: 'climate',
      confidence: 'LOW',
      description: 'Social unrest - riots/civil violence (climate component)',
      month: state.currentMonth,
      exposedFraction: 0.10
    });
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

  // Social cohesion (high = good) - average of components
  const cohesionScore = (social.socialCohesion.trust + social.socialCohesion.communityBonds + social.socialCohesion.civilLiberties) / 300;

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
 * FIX #2 (Oct 18, 2025): NEW Trust Calculation - Decoupled from AI Capability
 *
 * Research Foundation:
 * - University of Melbourne + KPMG (2025): 46% trust AI, trust based on benefits NOT capability
 * - Edelman (2024): High-trust companies 2.6x more likely successful AI adoption
 * - DORA (2024): Trust correlates with productivity benefits, PERFORMANCE (not explainability)
 *   → +49% output quality perception from performance feedback, NOT process explanations
 *   → +52% privacy understanding from outcome transparency
 * - Scientific Reports (2024): "Interpretability does not significantly improve trust,
 *   while outcome feedback has a more reliable and positive impact"
 * - McKinsey (2024): 40% identify explainability as a RISK (reveals concerning logic)
 *
 * FIX #2A (Oct 19, 2025): Evidence-Based Trust Model
 * REMOVED explainability (contradicts research), ADDED performance (empirically most important)
 *
 * Key Insight: Trust depends on PERFORMANCE (how well AI works) and OUTCOMES (benefits, safety),
 * NOT on explainability or absolute capability level. People prefer "it works" over "here's why."
 *
 * Trust Components (Research-Backed):
 * 1. Alignment Perception (25%) - Observable AI behavior (not true alignment - unobservable)
 * 2. Performance (35%) - How well AI works in practice (MOST IMPORTANT)
 * 3. Demonstrated Benefits (25%) - Has AI improved quality of life tangibly?
 * 4. Safety Record (15%) - Track record of no major incidents
 * 5. Capability Fear (penalty) - Only rapid changes cause fear, not absolute levels
 */
export function calculateComprehensiveTrustInAI(state: GameState): number {
  const { assertFinite } = require('./utils/assertions');

  // 1. ALIGNMENT PERCEPTION (25% weight)
  // Observable behavior, NOT true alignment (which is unobservable)
  const alignmentPerception = assertFinite(
    calculateAlignmentPerception(state),
    {
      location: 'calculateComprehensiveTrustInAI',
      valueName: 'alignmentPerception',
      month: state.currentMonth
    }
  );

  // 2. PERFORMANCE (35% weight) - MOST IMPORTANT
  // How well AI actually works in practice
  const performance = assertFinite(
    calculateAIPerformance(state),
    {
      location: 'calculateComprehensiveTrustInAI',
      valueName: 'performance',
      month: state.currentMonth
    }
  );

  // 3. DEMONSTRATED BENEFITS (25% weight)
  const qol = assertFinite(
    state.globalMetrics.qualityOfLife,
    {
      location: 'calculateComprehensiveTrustInAI',
      valueName: 'qol',
      month: state.currentMonth
    }
  );
  const demonstratedBenefits = assertFinite(
    qol > 0.5 ? 0.25 : qol * 0.5,
    {
      location: 'calculateComprehensiveTrustInAI',
      valueName: 'demonstratedBenefits',
      month: state.currentMonth,
      additionalInfo: { qol }
    }
  );

  // 4. SAFETY RECORD (15% weight)
  const safetyRecord = assertFinite(
    calculateSafetyRecord(state),
    {
      location: 'calculateComprehensiveTrustInAI',
      valueName: 'safetyRecord',
      month: state.currentMonth
    }
  );

  // Base trust from positive factors
  const baseTrust = assertFinite(
    alignmentPerception + performance + demonstratedBenefits + safetyRecord,
    {
      location: 'calculateComprehensiveTrustInAI',
      valueName: 'baseTrust',
      month: state.currentMonth,
      additionalInfo: { alignmentPerception, performance, demonstratedBenefits, safetyRecord }
    }
  );

  // 5. CAPABILITY FEAR (penalty only on rapid changes)
  const capabilityFear = assertFinite(
    calculateCapabilityFear(state),
    {
      location: 'calculateComprehensiveTrustInAI',
      valueName: 'capabilityFear',
      month: state.currentMonth
    }
  );

  // Final trust with bounds
  const finalTrust = assertFinite(
    Math.max(0, Math.min(1, baseTrust - capabilityFear)),
    {
      location: 'calculateComprehensiveTrustInAI',
      valueName: 'finalTrust',
      month: state.currentMonth,
      additionalInfo: { baseTrust, capabilityFear }
    }
  );

  return finalTrust;
}

/**
 * Calculate alignment perception component of trust (0-0.25 scale)
 * FIX #2A (Oct 19, 2025): Renamed from "alignment quality"
 * People observe BEHAVIOR, not true alignment (which is internal and often hidden)
 * Research: McKinsey (2024) - trust based on observed outcomes, not internal states
 */
function calculateAlignmentPerception(state: GameState): number {
  const totalAIs = state.aiAgents.length;
  if (totalAIs === 0) return 0.2; // Moderate default

  // Public perception based on detected issues
  // Only count detected misalignments (revealedCapability significantly differs) - people can't see hidden issues
  const { calculateTotalCapabilityFromProfile } = require('./capabilities');
  const detectedMisalignments = state.aiAgents.filter(ai => {
    const trueCap = calculateTotalCapabilityFromProfile(ai.trueCapability);
    const revealedCap = calculateTotalCapabilityFromProfile(ai.revealedCapability);
    return ai.alignment < 0.5 && Math.abs(trueCap - revealedCap) < 0.1; // Detected if no hiding
  }).length;

  const perceptionRate = 1 - (detectedMisalignments / totalAIs);

  // Scale to 0-0.25 (25% of total trust)
  return perceptionRate * 0.25;
}

/**
 * Calculate AI performance component of trust (0-0.35 scale)
 * FIX #2A (Oct 19, 2025): NEW FUNCTION - most important trust driver per research
 *
 * Research:
 * - DORA (2024): Performance = task completion * reliability
 * - McKinsey (2024): Performance matters more than explanations
 * - Edelman (2024): Consistency and demonstrated value drive trust
 *
 * Performance = how well AI works (results) + how reliably (no failures)
 */
function calculateAIPerformance(state: GameState): number {
  const qol = state.globalMetrics.qualityOfLife;
  const previousQoL = assertStateProperty(
    state.globalMetrics,
    'previousQoL',
    { location: 'calculateAIPerformance', month: state.currentMonth }
  );
  const qolTrend = qol - previousQoL;

  // Performance baseline from QoL (is AI making life better?)
  // If QoL > 0.5, AI is working well
  const performanceFromResults = Math.min(0.20, qol * 0.3);

  // Positive trend bonus (AI improving over time)
  const trendBonus = qolTrend > 0 ? Math.min(0.05, qolTrend * 0.5) : 0;

  // Reliability: no major failures in last 12 months
  const recentFailures = state.eventLog.filter(
    event => event.type === 'crisis' &&
             event.agent?.startsWith('ai-') && // AI-caused crisis (optional chaining for safety)
             state.currentMonth - event.timestamp < 12
  ).length;

  const reliabilityBonus = Math.max(0, 0.10 - (recentFailures * 0.02));

  // Performance = results + trend + reliability, capped at 35%
  return Math.min(0.35, performanceFromResults + trendBonus + reliabilityBonus);
}

/**
 * Calculate safety record component of trust (0-0.15 scale)
 * FIX #2A (Oct 19, 2025): Reduced from 20% to 15% (safety less important than performance)
 * Research: Incident-free operation builds trust over time
 */
function calculateSafetyRecord(state: GameState): number {
  // Check for recent safety incidents in event log
  const recentIncidents = state.eventLog.filter(
    event => event.type === 'crisis' &&
             event.agent?.startsWith('ai-') && // AI-caused incident (optional chaining for safety)
             state.currentMonth - event.timestamp < 12
  ).length;

  // No incidents in last 12 months = full trust (0.15)
  // Each incident reduces trust
  const safetyScore = Math.max(0, 0.15 - (recentIncidents * 0.05));

  return safetyScore;
}

/**
 * Calculate capability fear (penalty, 0-0.3 scale)
 * Research: Only RAPID capability changes cause fear, not absolute levels
 */
function calculateCapabilityFear(state: GameState): number {
  // Track capability change rate (requires state to store previous capability)
  const currentCapability = state.aiAgents.length > 0
    ? state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / state.aiAgents.length
    : 0;

  // Estimate change rate (actual implementation would track history)
  // For now, assume rapid growth if capability > 3.0 and increasing
  const previousCapability = assertStateProperty(
    state,
    'previousAICapability',
    { location: 'calculateAIPerformance', month: state.currentMonth }
  );
  const capabilityChange = currentCapability - previousCapability;

  // Store for next iteration
  (state as any).previousAICapability = currentCapability;

  // Fear only triggers on rapid changes (>0.5/month)
  if (capabilityChange > CAPABILITY_CHANGE_FEAR_THRESHOLD) {
    // Scale fear with change rate, max 30% penalty
    return Math.min(MAX_CAPABILITY_FEAR_PENALTY, capabilityChange * 0.2);
  }

  return 0;
}

/**
 * Get trust in AI derived from paranoia level (LEGACY - Phase 2F)
 *
 * Phase 2F+ Paranoia System: Trust is now calculated from paranoia, not stored directly.
 * This ensures trust can recover as paranoia decays, enabling Cognitive Spiral activation.
 *
 * Formula: trust = 1.0 - (paranoia * 0.75)
 * Bounds: [0.20, 0.95] - Even max paranoia leaves 20% trust, even zero paranoia caps at 95%
 *
 * @param society - Human society agent with paranoia level
 * @returns Trust level [0.20, 0.95]
 *
 * DEPRECATED: Use calculateComprehensiveTrustInAI() for post-recalibration runs
 */
export function getTrustInAI(society: HumanSocietyAgent): number {
  // P2.3 UPDATE (Nov 21, 2025): Use segment-based trust when segments are active
  // When heterogeneous population segments exist, use population-weighted aggregate
  if (society.segments && society.segments.length > 0 && society.trustInAI !== undefined) {
    return Math.max(0.20, Math.min(0.95, society.trustInAI));
  }

  // Legacy behavior: Calculate from paranoia level (pre-P2.3)
  // NOTE: paranoiaLevel is ALWAYS initialized in initialization.ts
  const paranoia = assertStateProperty(society, 'paranoiaLevel', {
    location: 'getTrustInAI'
  });
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
 * FIX #7 (Oct 18, 2025): Trust Recovery Mechanics
 * FIX #10A (Oct 20, 2025): Heterogeneous Trust Dynamics (Per-Segment)
 *
 * Research Foundation:
 * - Edelman (2024): Recovery via education, demonstrated benefits, visible impact
 * - Frontiers Psychology (2024): +49% output quality, +52% privacy with feedback loops
 * - DORA (2024): Continuous feedback critical for sustained trust
 * - Rogers (2003): Diffusion of Innovations - early adopters forgive mistakes, laggards don't
 *
 * Key Insight: Trust changes HETEROGENEOUSLY across population segments.
 * Early adopters (elite, high adaptability) maintain trust through mistakes.
 * Forever-holdouts (working class, low adaptability) lose trust faster and recover slower.
 * This enables realistic diffusion curves instead of global collapse.
 */
export function updateTrustRecovery(state: GameState): void {
  // Calculate global recovery/decay factors
  let baseTrustChange = 0;

  // === RECOVERY FACTORS ===

  // 1. Education campaigns (+1%/month)
  if (state.policies?.aiEducationCampaigns?.active) {
    baseTrustChange += TRUST_RECOVERY_FROM_EDUCATION;
  }

  // 2. Demonstrated benefits (+2%/month when QoL improving)
  const previousQoL = assertStateProperty(
    state.globalMetrics,
    'previousQoL',
    { location: 'updateTrustInAI', month: state.currentMonth }
  );
  const qolTrend = state.globalMetrics.qualityOfLife - previousQoL;
  if (qolTrend > 0) {
    baseTrustChange += TRUST_RECOVERY_FROM_DEMONSTRATED_BENEFITS;
  }
  // Store for next comparison
  state.globalMetrics.previousQoL = state.globalMetrics.qualityOfLife;

  // 3. Safety record (+1.5%/month with no incidents for 6+ months)
  const recentIncidents = state.eventLog.filter(
    event => event.type === 'crisis' &&
             event.agent?.startsWith('ai-') && // AI-caused crisis (optional chaining for safety)
             state.currentMonth - event.timestamp < 6
  ).length;

  if (recentIncidents === 0) {
    baseTrustChange += TRUST_RECOVERY_FROM_SAFETY_RECORD;
  }

  // 4. Performance improvement (FIX #2A/7A: Replaced explainability with performance)
  // Research: DORA (2024) - performance feedback most impactful
  // Check if AI performance is improving (QoL trend positive)
  const performanceImproving = qolTrend > 0;
  if (performanceImproving) {
    baseTrustChange += TRUST_RECOVERY_FROM_PERFORMANCE;
  }

  // === DECAY FACTORS ===

  // 1. Safety incidents (-3% per incident)
  const currentMonthIncidents = state.eventLog.filter(
    event => event.type === 'crisis' &&
             event.agent?.startsWith('ai-') && // AI-caused crisis (optional chaining for safety)
             event.timestamp === state.currentMonth
  ).length;
  baseTrustChange -= currentMonthIncidents * TRUST_DECAY_FROM_INCIDENT;

  // 2. Detected misalignment (-2% per detection)
  const misalignedAIs = state.aiAgents.filter(ai => ai.alignment < 0.5).length;
  const previousMisaligned = assertStateProperty(
    state,
    'previousMisalignedCount',
    { location: 'updateTrustInAI', month: state.currentMonth }
  );
  const newMisalignments = Math.max(0, misalignedAIs - previousMisaligned);
  baseTrustChange -= newMisalignments * TRUST_DECAY_FROM_MISALIGNMENT;
  (state as any).previousMisalignedCount = misalignedAIs;

  // 3. Common mistakes (-0.5%/month if high error rate)
  // Proxy: Low QoL despite high AI capability suggests mistakes
  const avgCapability = state.aiAgents.length > 0
    ? state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / state.aiAgents.length
    : 0;
  const qol = state.globalMetrics.qualityOfLife;
  const errorRate = avgCapability > 2.0 && qol < 0.5;
  if (errorRate) {
    baseTrustChange -= TRUST_DECAY_FROM_MISTAKES;
  }

  // === FIX #10A: APPLY PER-SEGMENT WITH HETEROGENEOUS MULTIPLIERS ===

  if (state.society.segments && state.society.segments.length > 0) {
    // Apply trust change to each segment with multipliers based on adaptability and openness
    for (const seg of state.society.segments) {
      // Recovery multiplier: Early adopters (high adaptability, high openness) recover faster
      // Research: Rogers (2003) - innovators/early adopters forgive mistakes
      const recoveryMultiplier = (seg.adaptability * 0.7 + seg.openness * 0.3);

      // Decay multiplier: Forever-holdouts (low adaptability, low openness) lose trust faster
      // Research: Bass diffusion model - laggards resist adoption, amplify concerns
      const decayMultiplier = (1.0 - seg.adaptability * 0.5);

      // Apply multipliers based on sign of change
      let segmentTrustChange = baseTrustChange;
      if (baseTrustChange > 0) {
        // Recovery: Early adopters recover faster
        segmentTrustChange *= recoveryMultiplier;
      } else {
        // Decay: Holdouts lose trust faster
        segmentTrustChange *= decayMultiplier;
      }

      // Cap segment change (Phase 1B: Use sampled trust recovery rate as cap)
      segmentTrustChange = Math.max(-0.1, Math.min(state.thresholds.trustRecoveryRate, segmentTrustChange));

      // Apply to segment
      seg.trustInAI = Math.max(0.1, Math.min(1.0, seg.trustInAI + segmentTrustChange));
    }

    // Recalculate aggregate trust from segments
    const { updateSocietyAggregates } = require('./populationSegments');
    updateSocietyAggregates(state);

    // Log recovery/decay with segment breakdown
    if (Math.abs(baseTrustChange) > 0.02 && state.currentMonth % 6 === 0) {
      console.log(`\n🔄 TRUST DYNAMICS (Month ${state.currentMonth}) - HETEROGENEOUS`);
      console.log(`   Aggregate trust: ${(state.society.trustInAI * 100).toFixed(1)}%`);
      console.log(`   Base change: ${baseTrustChange > 0 ? '+' : ''}${(baseTrustChange * 100).toFixed(2)}%`);

      // Show top 3 and bottom 3 segments
      const sortedSegs = [...state.society.segments].sort((a, b) => b.trustInAI - a.trustInAI);
      console.log(`   Highest trust: ${sortedSegs[0].name} (${(sortedSegs[0].trustInAI * 100).toFixed(1)}%)`);
      console.log(`   Lowest trust: ${sortedSegs[sortedSegs.length - 1].name} (${(sortedSegs[sortedSegs.length - 1].trustInAI * 100).toFixed(1)}%)`);
      console.log(`   Elite-mass gap: ${((state.society.eliteMassGap || 0) * 100).toFixed(1)}%`);
      console.log(`   Polarization: ${((state.society.polarizationIndex || 0) * 100).toFixed(1)}%`);

      if (baseTrustChange > 0) {
        console.log(`   Recovery factors: Education=${state.policies?.aiEducationCampaigns?.active ? 'YES' : 'NO'}, Benefits=${qolTrend > 0 ? 'YES' : 'NO'}, Safety=${recentIncidents === 0 ? 'YES' : 'NO'}, Performance=${performanceImproving ? 'YES' : 'NO'}`);
      } else {
        console.log(`   Decay factors: Incidents=${currentMonthIncidents}, New misalignments=${newMisalignments}, Errors=${errorRate ? 'YES' : 'NO'}`);
      }
    }
  } else {
    // === FALLBACK: GLOBAL TRUST (no segments) ===
    // Cap change (Phase 1B: Use sampled trust recovery rate as cap)
    baseTrustChange = Math.max(-0.1, Math.min(state.thresholds.trustRecoveryRate, baseTrustChange));

    // Update society trust (stored separately for recovery mechanics)
    if (!state.society.trustInAI) {
      // Initialize if not present
      state.society.trustInAI = calculateComprehensiveTrustInAI(state);
    }
    state.society.trustInAI = Math.max(0, Math.min(1, state.society.trustInAI + baseTrustChange));

    // Log recovery/decay (only on significant changes)
    if (Math.abs(baseTrustChange) > 0.02 && state.currentMonth % 6 === 0) {
      console.log(`\n🔄 TRUST DYNAMICS (Month ${state.currentMonth}) - GLOBAL`);
      console.log(`   Trust level: ${(state.society.trustInAI * 100).toFixed(1)}%`);
      console.log(`   Monthly change: ${baseTrustChange > 0 ? '+' : ''}${(baseTrustChange * 100).toFixed(2)}%`);
      if (baseTrustChange > 0) {
        console.log(`   Recovery factors: Education=${state.policies?.aiEducationCampaigns?.active ? 'YES' : 'NO'}, Benefits=${qolTrend > 0 ? 'YES' : 'NO'}, Safety=${recentIncidents === 0 ? 'YES' : 'NO'}, Performance=${performanceImproving ? 'YES' : 'NO'}`);
      } else {
        console.log(`   Decay factors: Incidents=${currentMonthIncidents}, New misalignments=${newMisalignments}, Errors=${errorRate ? 'YES' : 'NO'}`);
      }
    }
  }
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

