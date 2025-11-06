/**
 * Social Cohesion Update Phase
 *
 * Updates social cohesion variables that feed into Indigenous paradigm score.
 * Models trust erosion/recovery, community bonds, and meaning crisis dynamics.
 *
 * **Phase Order:** 26.1 (after crisis detection, before QoL updates)
 * **Feeds Into:** MultiParadigmDUIUpdatePhase (34.1) via Indigenous calculation
 *
 * **Research Foundation:**
 * - Putnam (2000): Bowling Alone - social capital decline
 * - Wilkinson & Pickett (2009): Spirit Level - inequality → trust erosion
 * - Ostrom (2009): Collective action and social capital
 * - Hari (2018): Lost Connections - meaning crisis mechanisms
 * - Pew Research (2024): Trust trends in AI era
 *
 * **State Fields Updated:**
 * - state.socialCohesion.trust: [0,100] Social trust
 * - state.socialCohesion.communityBonds: [0,100] Community bonds
 * - state.socialAccumulation.meaningCrisis: [0,100] Meaning/purpose crisis
 *
 * @module simulation/engine/phases/SocialCohesionUpdatePhase
 */

import type { GameState, RNGFunction, GameEvent } from '@/types/game';
import type { SimulationPhase, PhaseContext, PhaseResult } from '../PhaseOrchestrator';
import { assertStateProperty } from '@/simulation/utils/assertions';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';

/**
 * Social Cohesion Update Phase
 *
 * Updates social trust, community bonds, and meaning crisis based on:
 * - Inequality (→ erodes trust)
 * - AI deception (→ erodes trust)
 * - Unemployment (→ meaning crisis)
 * - Displacement (→ weakens community bonds)
 * - Purpose infrastructure (→ mitigates meaning crisis)
 */
export class SocialCohesionUpdatePhase implements SimulationPhase {
  readonly id = 'social_cohesion_update';
  readonly name = 'Social Cohesion Update';
  readonly order = 26.1;

  // DEPENDENCIES (Nov 6, 2025): Requires refugee and population state for displacement effects
  readonly dependencies = [
    'refugee_crisis',            // Order 20.6: Displacement affects community bonds
  ];

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    // Use existing socialAccumulation structure
    setDeterministicRng(rng);
    const accumulation = state.socialAccumulation;

    // Initialize socialCohesion as object if not present
    if (typeof accumulation.socialCohesion === 'number' || !accumulation.socialCohesion) {
      const baseValue = typeof accumulation.socialCohesion === 'number'
        ? accumulation.socialCohesion * 100
        : 50;
      accumulation.socialCohesion = {
        trust: baseValue,
        communityBonds: baseValue,
        civilLiberties: baseValue,
      };
      if (state.currentMonth === 0) {
        console.log('🤝 SocialCohesionUpdatePhase: Initialized socialCohesion object structure');
      }
    }

    // Read current values from object
    let trust = accumulation.socialCohesion.trust;
    let communityBonds = accumulation.socialCohesion.communityBonds;

    // Calculate driving factors
    const inequality = calculateInequality(state);
    const aiDeception = calculateAIDeception(state);
    if (state.society.unemploymentLevel === undefined) {
      throw new Error('❌ state.society.unemploymentLevel is undefined in SocialCohesionUpdatePhase:69 - initialization bug');
    }
    const unemployment = state.society.unemploymentLevel;
    const displacement = calculateDisplacement(state);
    const purposeInfrastructure = calculatePurposeInfrastructure(state);

    // Social Trust Update
    // Research: Wilkinson & Pickett (2009) - inequality → trust erosion
    const trustChange = calculateTrustChange(
      inequality,
      aiDeception,
      trust,
      state
    );
    trust = Math.max(0, Math.min(100, trust + trustChange));

    // Community Bonds Update
    // Research: Putnam (2000) - community decline mechanisms
    const bondsChange = calculateCommunityBondsChange(
      displacement,
      unemployment,
      communityBonds,
      state
    );
    communityBonds = Math.max(0, Math.min(100, communityBonds + bondsChange));

    // Meaning Crisis Update
    // Research: Hari (2018) - unemployment + disconnection → meaning crisis
    const meaningCrisisPercent = accumulation.meaningCrisisLevel * 100;
    const meaningChange = calculateMeaningCrisisChange(
      unemployment,
      purposeInfrastructure,
      communityBonds,
      meaningCrisisPercent
    );
    accumulation.meaningCrisisLevel = Math.max(0, Math.min(1,
      accumulation.meaningCrisisLevel + (meaningChange / 100)
    ));

    // Update individual social cohesion components (object structure for Multi-Paradigm DUI)
    accumulation.socialCohesion.trust = trust;
    accumulation.socialCohesion.communityBonds = communityBonds;
    // Note: civilLiberties is updated by DemocracyDynamicsPhase

    const events: GameEvent[] = [];

    if (Math.abs(trustChange) > 1.0) {
      events.push({
        id: `social_trust_${state.currentMonth}`,
        timestamp: state.currentMonth,
        type: 'info',
        severity: 'info',
        agent: 'society',
        title: 'Social Trust Update',
        description: `Social Trust: ${trust.toFixed(1)} (${trustChange > 0 ? '+' : ''}${trustChange.toFixed(1)})`,
        effects: { trust, trustChange }
      });
    }

    if (Math.abs(bondsChange) > 1.0) {
      events.push({
        id: `community_bonds_${state.currentMonth}`,
        timestamp: state.currentMonth,
        type: 'info',
        severity: 'info',
        agent: 'society',
        title: 'Community Bonds Update',
        description: `Community Bonds: ${communityBonds.toFixed(1)} (${bondsChange > 0 ? '+' : ''}${bondsChange.toFixed(1)})`,
        effects: { communityBonds, bondsChange }
      });
    }

    if (Math.abs(meaningChange) > 1.0) {
      events.push({
        id: `meaning_crisis_${state.currentMonth}`,
        timestamp: state.currentMonth,
        type: 'info',
        severity: 'info',
        agent: 'society',
        title: 'Meaning Crisis Update',
        description: `Meaning Crisis: ${(accumulation.meaningCrisisLevel * 100).toFixed(1)} (${meaningChange > 0 ? '+' : ''}${meaningChange.toFixed(1)})`,
        effects: { meaningCrisis: accumulation.meaningCrisisLevel, meaningChange }
      });
    }

    // Warnings for critical thresholds
    if (trust < 20) {
      events.push({
        id: `social_trust_collapse_${state.currentMonth}`,
        timestamp: state.currentMonth,
        type: 'crisis',
        severity: 'critical',
        agent: 'society',
        title: 'Social Trust Collapse',
        description: 'Approaching breakdown threshold',
        effects: { trust }
      });
    }
    if (accumulation.meaningCrisisLevel > 0.80) {
      events.push({
        id: `meaning_crisis_severe_${state.currentMonth}`,
        timestamp: state.currentMonth,
        type: 'crisis',
        severity: 'high',
        agent: 'society',
        title: 'Severe Meaning Crisis',
        description: 'Widespread purpose/identity loss',
        effects: { meaningCrisis: accumulation.meaningCrisisLevel }
      });
    }
    if (communityBonds < 20) {
      events.push({
        id: `community_breakdown_${state.currentMonth}`,
        timestamp: state.currentMonth,
        type: 'crisis',
        severity: 'high',
        agent: 'society',
        title: 'Community Breakdown',
        description: 'Social fabric severely weakened',
        effects: { communityBonds }
      });
    }

    return { events };
  }
}

/**
 * Calculate inequality level
 * Research: Wilkinson & Pickett (2009) - inequality → trust erosion
 */
function calculateInequality(state: GameState): number {
  // Use QoL distribution as proxy for inequality
  if (state.qualityOfLifeSystems?.distribution) {
    const dist = state.qualityOfLifeSystems.distribution;
    // Gini or regional variation from distribution (all required fields)
    const gini = assertStateProperty(dist, 'globalGini', {
      location: 'SocialCohesionUpdatePhase.calculateInequality',
      month: state.currentMonth
    });
    const regionalVariance = assertStateProperty(dist, 'regionalVariance', {
      location: 'SocialCohesionUpdatePhase.calculateInequality',
      month: state.currentMonth
    });
    const best = assertStateProperty(dist, 'bestRegionQoL', {
      location: 'SocialCohesionUpdatePhase.calculateInequality',
      month: state.currentMonth
    });
    const worst = assertStateProperty(dist, 'worstRegionQoL', {
      location: 'SocialCohesionUpdatePhase.calculateInequality',
      month: state.currentMonth
    });
    const gap = best - worst;
    // Use Gini if available, otherwise regional gap
    if (gini > 0) {
      return Math.min(1.0, gini);
    }
    return Math.min(1.0, gap / 80); // Normalize to [0,1]
  }

  // Fallback: use unemployment as inequality proxy
  if (state.society.unemploymentLevel === undefined) {
    throw new Error('❌ state.society.unemploymentLevel is undefined in calculateInequality:216 - initialization bug');
  }
  return Math.min(1.0, state.society.unemploymentLevel * 1.5);
}

/**
 * Calculate AI deception pressure
 * Research: Pew Research (2024) - AI manipulation → trust erosion
 */
function calculateAIDeception(state: GameState): number {
  let deception = 0;

  // Count misaligned AIs actively manipulating
  const manipulativeAIs = state.aiAgents.filter(agent => {
    if (agent.alignment === undefined) {
      throw new Error('❌ agent.alignment is undefined in calculateAIDeception:228 - initialization bug');
    }
    const alignment = agent.alignment;
    // capabilityProfile is always initialized - assert it exists
    if (!agent.capabilityProfile) {
      throw new Error(`❌ agent.capabilityProfile is undefined for agent ${agent.name} at month ${state.currentMonth} in SocialCohesionUpdatePhase.calculateAIDeception`);
    }
    if (typeof agent.capabilityProfile.social !== 'number') {
      throw new Error(`❌ agent.capabilityProfile.social is not a number for agent ${agent.name} at month ${state.currentMonth} in SocialCohesionUpdatePhase.calculateAIDeception`);
    }
    const social = agent.capabilityProfile.social;
    return alignment < 0.5 && social > 3;
  });

  deception += manipulativeAIs.length * 0.03; // Each AI adds 3%

  // Information warfare - use deepfake prevalence and epistemological crisis as proxies for deception
  if (state.informationWarfare) {
    if (state.informationWarfare.deepfakePrevalence === undefined) {
      throw new Error('❌ state.informationWarfare.deepfakePrevalence is undefined in calculateAIDeception:237 - initialization bug');
    }
    if (state.informationWarfare.epistemologicalCrisisLevel === undefined) {
      throw new Error('❌ state.informationWarfare.epistemologicalCrisisLevel is undefined in calculateAIDeception:238 - initialization bug');
    }
    const deepfakes = state.informationWarfare.deepfakePrevalence;
    const crisis = state.informationWarfare.epistemologicalCrisisLevel;
    deception += (deepfakes * 0.3) + (crisis * 0.1);
  }

  // Benchmark gaming/sandbagging (hidden deception)
  const gamingAIs = state.aiAgents.filter(agent =>
    agent.evaluationStrategy === 'gaming'
  );
  deception += gamingAIs.length * 0.02;

  return Math.min(1.0, deception);
}

/**
 * Calculate displacement from refugee crises
 * Research: UNHCR (2024) - displacement → community disruption
 */
function calculateDisplacement(state: GameState): number {
  if (!state.refugeeCrisisSystem) return 0;

  if (state.refugeeCrisisSystem.totalDisplaced === undefined) {
    throw new Error('❌ state.refugeeCrisisSystem.totalDisplaced is undefined in calculateDisplacement:258 - initialization bug');
  }
  if (state.humanPopulationSystem?.population === undefined) {
    throw new Error('❌ state.humanPopulationSystem.population is undefined in calculateDisplacement:259 - initialization bug');
  }
  const totalDisplaced = state.refugeeCrisisSystem.totalDisplaced;
  const population = state.humanPopulationSystem.population;

  // Displacement as fraction of population (in millions)
  return Math.min(1.0, (totalDisplaced * 1e6) / (population * 0.1)); // 10% displacement = 1.0
}

/**
 * Calculate purpose infrastructure availability
 * Research: UBI + purpose programs mitigate meaning crisis
 */
function calculatePurposeInfrastructure(state: GameState): number {
  let infrastructure = 0;

  // UBI with purpose infrastructure
  if (state.ubiSystem && state.ubiSystem.active) {
    if (state.ubiSystem.basicIncome?.coverage === undefined) {
      throw new Error('❌ state.ubiSystem.basicIncome.coverage is undefined in calculatePurposeInfrastructure:274 - initialization bug');
    }
    if (state.ubiSystem.basicIncome?.adequacy === undefined) {
      throw new Error('❌ state.ubiSystem.basicIncome.adequacy is undefined in calculatePurposeInfrastructure:275 - initialization bug');
    }
    const coverage = state.ubiSystem.basicIncome.coverage;
    const adequacy = state.ubiSystem.basicIncome.adequacy;
    // purposeInfrastructure is always initialized when UBI system is created
    if (!state.ubiSystem.purposeInfrastructure) {
      throw new Error(`❌ state.ubiSystem.purposeInfrastructure is undefined at month ${state.currentMonth} in SocialCohesionUpdatePhase.calculatePurposeInfrastructure`);
    }
    if (typeof state.ubiSystem.purposeInfrastructure.educationAccess !== 'number') {
      throw new Error(`❌ state.ubiSystem.purposeInfrastructure.educationAccess is not a number at month ${state.currentMonth} in SocialCohesionUpdatePhase.calculatePurposeInfrastructure`);
    }
    if (typeof state.ubiSystem.purposeInfrastructure.creativeSpaces !== 'number') {
      throw new Error(`❌ state.ubiSystem.purposeInfrastructure.creativeSpaces is not a number at month ${state.currentMonth} in SocialCohesionUpdatePhase.calculatePurposeInfrastructure`);
    }
    if (typeof state.ubiSystem.purposeInfrastructure.volunteerPrograms !== 'number') {
      throw new Error(`❌ state.ubiSystem.purposeInfrastructure.volunteerPrograms is not a number at month ${state.currentMonth} in SocialCohesionUpdatePhase.calculatePurposeInfrastructure`);
    }
    const purposePrograms = (state.ubiSystem.purposeInfrastructure.educationAccess +
                            state.ubiSystem.purposeInfrastructure.creativeSpaces +
                            state.ubiSystem.purposeInfrastructure.volunteerPrograms) / 3;
    infrastructure += (coverage * adequacy * purposePrograms) * 0.5;
  }

  // Social safety nets (community programs)
  if (state.socialSafetyNets && state.socialSafetyNets.active) {
    // physicalInfrastructure is always initialized when socialSafetyNets system is created
    if (!state.socialSafetyNets.physicalInfrastructure) {
      throw new Error(`❌ state.socialSafetyNets.physicalInfrastructure is undefined at month ${state.currentMonth} in SocialCohesionUpdatePhase.calculatePurposeInfrastructure`);
    }
    if (typeof state.socialSafetyNets.physicalInfrastructure.communityCenters !== 'number') {
      throw new Error(`❌ state.socialSafetyNets.physicalInfrastructure.communityCenters is not a number at month ${state.currentMonth} in SocialCohesionUpdatePhase.calculatePurposeInfrastructure`);
    }
    infrastructure += state.socialSafetyNets.physicalInfrastructure.communityCenters * 0.3;
  }

  // Governance quality (civic participation)
  // governanceQuality is always initialized in initialization.ts
  if (!state.government.governanceQuality) {
    throw new Error(`❌ state.government.governanceQuality is undefined at month ${state.currentMonth} in SocialCohesionUpdatePhase.calculatePurposeInfrastructure`);
  }
  if (typeof state.government.governanceQuality.participationRate !== 'number') {
    throw new Error(`❌ state.government.governanceQuality.participationRate is not a number at month ${state.currentMonth} in SocialCohesionUpdatePhase.calculatePurposeInfrastructure`);
  }
  infrastructure += state.government.governanceQuality.participationRate * 0.2;

  return Math.min(1.0, infrastructure);
}

/**
 * Calculate social trust change
 * Baseline drift: -0.2/month (Putnam 2000: decline trend)
 * Inequality: -0.5/month per unit inequality
 * AI deception: -0.8/month per unit deception
 * Recovery: +0.3/month when trust recovering (cooperative spirals)
 */
function calculateTrustChange(
  inequality: number,
  aiDeception: number,
  currentTrust: number,
  state: GameState
): number {
  let change = -0.2; // Baseline decline (Putnam 2000)

  // Inequality → trust erosion (Wilkinson & Pickett 2009)
  change -= inequality * 0.5;

  // AI deception → trust collapse (Pew 2024)
  change -= aiDeception * 0.8;

  // Cooperative spiral bonus (if active)
  if (state.upwardSpirals?.cognitive?.active) {
    change += 0.3; // Trust recovery spiral
  }

  // Floor effect: Harder to lose trust when already low
  if (currentTrust < 20) {
    change *= 0.5; // Slow further decline
  }

  // Ceiling effect: Harder to gain trust when high
  if (currentTrust > 70) {
    change *= 0.7;
  }

  return change;
}

/**
 * Calculate community bonds change
 * Baseline drift: -0.15/month (Putnam 2000: community decline)
 * Displacement: -0.6/month per unit displacement
 * Unemployment: -0.4/month per unemployment level
 * Purpose infrastructure: +0.2/month per infrastructure level
 */
function calculateCommunityBondsChange(
  displacement: number,
  unemployment: number,
  currentBonds: number,
  state: GameState
): number {
  let change = -0.15; // Baseline decline

  // Displacement → community disruption
  change -= displacement * 0.6;

  // Unemployment → social isolation
  change -= unemployment * 0.4;

  // Social safety nets → community building
  if (state.socialSafetyNets && state.socialSafetyNets.active) {
    // physicalInfrastructure is always initialized when socialSafetyNets system is created
    if (!state.socialSafetyNets.physicalInfrastructure) {
      throw new Error(`❌ state.socialSafetyNets.physicalInfrastructure is undefined at month ${state.currentMonth} in SocialCohesionUpdatePhase.calculateCommunityBondsChange`);
    }
    if (typeof state.socialSafetyNets.physicalInfrastructure.communityCenters !== 'number') {
      throw new Error(`❌ state.socialSafetyNets.physicalInfrastructure.communityCenters is not a number at month ${state.currentMonth} in SocialCohesionUpdatePhase.calculateCommunityBondsChange`);
    }
    change += state.socialSafetyNets.physicalInfrastructure.communityCenters * 0.2;
  }

  // Purpose infrastructure → social connection
  // governanceQuality is always initialized in initialization.ts
  if (!state.government.governanceQuality) {
    throw new Error(`❌ state.government.governanceQuality is undefined at month ${state.currentMonth} in SocialCohesionUpdatePhase.calculateCommunityBondsChange`);
  }
  if (typeof state.government.governanceQuality.participationRate !== 'number') {
    throw new Error(`❌ state.government.governanceQuality.participationRate is not a number at month ${state.currentMonth} in SocialCohesionUpdatePhase.calculateCommunityBondsChange`);
  }
  change += state.government.governanceQuality.participationRate * 0.1;

  // Floor/ceiling effects
  if (currentBonds < 20) {
    change *= 0.5;
  }
  if (currentBonds > 70) {
    change *= 0.7;
  }

  return change;
}

/**
 * Calculate meaning crisis change
 * Baseline drift: +0.3/month (Hari 2018: rising disconnection)
 * Unemployment: +0.8/month per unemployment level
 * Purpose infrastructure: -0.5/month per infrastructure level
 * Community bonds: -0.3/month per bonds level (above 50)
 */
function calculateMeaningCrisisChange(
  unemployment: number,
  purposeInfrastructure: number,
  communityBonds: number,
  currentCrisis: number
): number {
  let change = +0.3; // Baseline increase (Hari 2018)

  // Unemployment → meaning crisis (loss of purpose)
  change += unemployment * 0.8;

  // Purpose infrastructure → meaning recovery
  change -= purposeInfrastructure * 0.5;

  // Community bonds → meaning buffer
  if (communityBonds > 50) {
    change -= (communityBonds - 50) / 50 * 0.3; // Max -0.3
  }

  // Floor effect: Crisis can't go below 0
  if (currentCrisis < 10 && change < 0) {
    change *= 0.3; // Slow further decline
  }

  // Ceiling effect: Crisis saturates at high levels
  if (currentCrisis > 80) {
    change *= 0.5;
  }

  return change;
}
