/**
 * Social Stability System Phase
 *
 * Consolidates social cohesion and stability updates:
 * 1. Trust recovery and decay dynamics
 * 2. Social cohesion (trust, community bonds, meaning crisis)
 * 3. Paranoia updates
 * 4. Social stability calculation
 *
 * Order: 26.1 (after crisis detection, before QoL updates)
 *
 * Research Foundation:
 * - Putnam (2000): Bowling Alone - social capital decline
 * - Wilkinson & Pickett (2009): Spirit Level - inequality → trust erosion
 * - Ostrom (2009): Collective action and social capital
 * - Hari (2018): Lost Connections - meaning crisis mechanisms
 * - Edelman (2024): Trust recovery mechanisms
 * - Pew Research (2024): Trust trends in AI era
 */

import type { GameState, RNGFunction, GameEvent } from '@/types/game';
import type { SimulationPhase, PhaseContext, PhaseResult } from '../PhaseOrchestrator';
import {
  assertFinite,
  assertStateProperty,
  assertProbability,
  assertInRange
} from '@/simulation/utils/assertions';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { calculateSocialStability } from '../../calculations';
import { updateTrustRecovery } from '../../socialCohesion';
import { updateParanoia } from '../../calculations';

export class SocialStabilitySystemPhase implements SimulationPhase {
  readonly id = 'social-stability-system';
  readonly name = 'Social Stability System Update';
  readonly order = 26.1;
  readonly dependencies = ['refugee_crisis'];  // unemployment + economic-transition removed - run AFTER this phase at 30+

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    // HIGH-6 (Nov 8, 2025): Validate RNG for deterministic simulation
    if (!rng || typeof rng !== 'function') {
      throw new Error(
        `❌ CRITICAL: RNG required for deterministic simulation in ${this.id} ` +
        `(Month ${state.currentMonth})`
      );
    }

    setDeterministicRng(rng);
    const events: GameEvent[] = [];

    // 1. Trust Recovery & Decay (formerly TrustRecoveryPhase, order 24.5)
    executeTrustRecovery(state, rng);

    // 2. Social Cohesion Update (formerly SocialCohesionUpdatePhase, order 26.1)
    const cohesionEvents = executeSocialCohesionUpdate(state, rng);
    events.push(...cohesionEvents);

    // 3. Paranoia Update (formerly ParanoiaPhase, order 32.0)
    executeParanoiaUpdate(state, rng);

    // 4. Social Stability Calculation (formerly SocialStabilityPhase, order 33.0)
    executeSocialStabilityCalculation(state, rng);

    return { events };
  }
}

/**
 * Trust Recovery & Decay
 * (formerly TrustRecoveryPhase, order 24.5)
 */
function executeTrustRecovery(state: GameState, rng: RNGFunction): void {
  updateTrustRecovery(state);
}

/**
 * Social Cohesion Update
 * (formerly SocialCohesionUpdatePhase, order 26.1)
 */
function executeSocialCohesionUpdate(state: GameState, rng: RNGFunction): GameEvent[] {
  const accumulation = state.socialAccumulation;

  // Initialize socialCohesion as object if not present
  if (typeof accumulation.socialCohesion === 'number' || !accumulation.socialCohesion) {
    const baseValue =
      typeof accumulation.socialCohesion === 'number' ? accumulation.socialCohesion * 100 : 50;
    accumulation.socialCohesion = {
      trust: baseValue,
      communityBonds: baseValue,
      civilLiberties: baseValue
    };
    if (state.currentMonth === 0) {
      console.log('🤝 SocialStabilitySystemPhase: Initialized socialCohesion object structure');
    }
  }

  // Read current values
  let trust = accumulation.socialCohesion.trust;
  let communityBonds = accumulation.socialCohesion.communityBonds;

  // Calculate driving factors
  const inequality = calculateInequality(state);
  const aiDeception = calculateAIDeception(state);
  if (state.society.unemploymentLevel === undefined) {
    throw new Error(
      '❌ state.society.unemploymentLevel is undefined in SocialStabilitySystemPhase:executeSocialCohesionUpdate - initialization bug'
    );
  }
  const unemployment = state.society.unemploymentLevel;
  const displacement = calculateDisplacement(state);
  const purposeInfrastructure = calculatePurposeInfrastructure(state);

  // HIGH-4 (Nov 29, 2025): Regime-based feedback loops
  // Social-breakdown regime accelerates decay via positive feedbacks
  // Research: Scheffer et al. (2014) - regime shifts create self-reinforcing dynamics
  const regimeMultiplier = state.bifurcationState?.currentRegime === 'social-breakdown' ? 1.5 : 1.0;

  // Social Trust Update
  const trustChange = calculateTrustChange(inequality, aiDeception, trust, state) * regimeMultiplier;
  trust = Math.max(0, Math.min(100, trust + trustChange));

  // Community Bonds Update
  const bondsChange = calculateCommunityBondsChange(
    displacement,
    unemployment,
    communityBonds,
    state
  ) * regimeMultiplier;
  communityBonds = Math.max(0, Math.min(100, communityBonds + bondsChange));

  // Meaning Crisis Update
  const meaningCrisisPercent = accumulation.meaningCrisisLevel * 100;
  const meaningChange = calculateMeaningCrisisChange(
    unemployment,
    purposeInfrastructure,
    communityBonds,
    meaningCrisisPercent
  ) * regimeMultiplier;
  accumulation.meaningCrisisLevel = Math.max(
    0,
    Math.min(1, accumulation.meaningCrisisLevel + meaningChange / 100)
  );

  // Update state
  accumulation.socialCohesion.trust = trust;
  accumulation.socialCohesion.communityBonds = communityBonds;

  const events: GameEvent[] = [];

  // Generate events for significant changes
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
  if (accumulation.meaningCrisisLevel > 0.8) {
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

  return events;
}

/**
 * Paranoia Update
 * (formerly ParanoiaPhase, order 32.0)
 */
function executeParanoiaUpdate(state: GameState, rng: RNGFunction): void {
  updateParanoia(state);
}

/**
 * Social Stability Calculation
 * (formerly SocialStabilityPhase, order 33.0)
 */
function executeSocialStabilityCalculation(state: GameState, rng: RNGFunction): void {
  const newStability = assertFinite(calculateSocialStability(state), {
    location: 'SocialStabilitySystemPhase.executeSocialStabilityCalculation',
    valueName: 'newStability',
    month: state.currentMonth,
    additionalInfo: {
      currentStability: state.globalMetrics.socialStability,
      unemploymentLevel: state.society.unemploymentLevel,
      trustInAI: state.society.trustInAI
    }
  });

  state.globalMetrics = {
    ...state.globalMetrics,
    socialStability: newStability
  };
}

// ============================================================================
// Helper Functions (from SocialCohesionUpdatePhase)
// ============================================================================

/**
 * Calculate inequality level
 */
function calculateInequality(state: GameState): number {
  if (state.qualityOfLifeSystems?.distribution) {
    const dist = state.qualityOfLifeSystems.distribution;
    const gini = assertStateProperty(dist, 'globalGini', {
      location: 'SocialStabilitySystemPhase.calculateInequality',
      month: state.currentMonth
    });
    const regionalVariance = assertStateProperty(dist, 'regionalVariance', {
      location: 'SocialStabilitySystemPhase.calculateInequality',
      month: state.currentMonth
    });
    const best = assertStateProperty(dist, 'bestRegionQoL', {
      location: 'SocialStabilitySystemPhase.calculateInequality',
      month: state.currentMonth
    });
    const worst = assertStateProperty(dist, 'worstRegionQoL', {
      location: 'SocialStabilitySystemPhase.calculateInequality',
      month: state.currentMonth
    });
    const gap = best - worst;
    if (gini > 0) {
      return Math.min(1.0, gini);
    }
    return Math.min(1.0, gap / 80);
  }

  // Fallback: use unemployment as inequality proxy
  if (state.society.unemploymentLevel === undefined) {
    throw new Error(
      '❌ state.society.unemploymentLevel is undefined in calculateInequality - initialization bug'
    );
  }
  return Math.min(1.0, state.society.unemploymentLevel * 1.5);
}

/**
 * Calculate AI deception pressure
 */
function calculateAIDeception(state: GameState): number {
  let deception = 0;

  // Count misaligned AIs actively manipulating
  const manipulativeAIs = state.aiAgents.filter((agent) => {
    if (agent.alignment === undefined) {
      throw new Error(
        '❌ agent.alignment is undefined in calculateAIDeception - initialization bug'
      );
    }
    const alignment = agent.alignment;
    if (!agent.capabilityProfile) {
      throw new Error(
        `❌ agent.capabilityProfile is undefined for agent ${agent.name} at month ${state.currentMonth} in SocialStabilitySystemPhase.calculateAIDeception`
      );
    }
    if (typeof agent.capabilityProfile.social !== 'number') {
      throw new Error(
        `❌ agent.capabilityProfile.social is not a number for agent ${agent.name} at month ${state.currentMonth} in SocialStabilitySystemPhase.calculateAIDeception`
      );
    }
    const social = agent.capabilityProfile.social;
    return alignment < 0.5 && social > 3;
  });

  deception += manipulativeAIs.length * 0.03;

  // Information warfare
  if (state.informationWarfare) {
    if (state.informationWarfare.deepfakePrevalence === undefined) {
      throw new Error(
        '❌ state.informationWarfare.deepfakePrevalence is undefined in calculateAIDeception - initialization bug'
      );
    }
    if (state.informationWarfare.epistemologicalCrisisLevel === undefined) {
      throw new Error(
        '❌ state.informationWarfare.epistemologicalCrisisLevel is undefined in calculateAIDeception - initialization bug'
      );
    }
    const deepfakes = state.informationWarfare.deepfakePrevalence;
    const crisis = state.informationWarfare.epistemologicalCrisisLevel;
    deception += deepfakes * 0.3 + crisis * 0.1;
  }

  // Benchmark gaming/sandbagging
  const gamingAIs = state.aiAgents.filter((agent) => agent.evaluationStrategy === 'gaming');
  deception += gamingAIs.length * 0.02;

  return Math.min(1.0, deception);
}

/**
 * Calculate displacement from refugee crises
 */
function calculateDisplacement(state: GameState): number {
  if (!state.refugeeCrisisSystem) return 0;

  if (state.refugeeCrisisSystem.totalDisplaced === undefined) {
    throw new Error(
      '❌ state.refugeeCrisisSystem.totalDisplaced is undefined in calculateDisplacement - initialization bug'
    );
  }
  if (state.humanPopulationSystem?.population === undefined) {
    throw new Error(
      '❌ state.humanPopulationSystem.population is undefined in calculateDisplacement - initialization bug'
    );
  }
  const totalDisplaced = state.refugeeCrisisSystem.totalDisplaced;
  const population = state.humanPopulationSystem.population;

  return Math.min(1.0, (totalDisplaced * 1e6) / (population * 0.1));
}

/**
 * Calculate purpose infrastructure availability
 */
function calculatePurposeInfrastructure(state: GameState): number {
  let infrastructure = 0;

  // UBI with purpose infrastructure
  if (state.ubiSystem && state.ubiSystem.active) {
    if (state.ubiSystem.basicIncome?.coverage === undefined) {
      throw new Error(
        '❌ state.ubiSystem.basicIncome.coverage is undefined in calculatePurposeInfrastructure - initialization bug'
      );
    }
    if (state.ubiSystem.basicIncome?.adequacy === undefined) {
      throw new Error(
        '❌ state.ubiSystem.basicIncome.adequacy is undefined in calculatePurposeInfrastructure - initialization bug'
      );
    }
    const coverage = state.ubiSystem.basicIncome.coverage;
    const adequacy = state.ubiSystem.basicIncome.adequacy;
    if (!state.ubiSystem.purposeInfrastructure) {
      throw new Error(
        `❌ state.ubiSystem.purposeInfrastructure is undefined at month ${state.currentMonth} in SocialStabilitySystemPhase.calculatePurposeInfrastructure`
      );
    }
    if (typeof state.ubiSystem.purposeInfrastructure.educationAccess !== 'number') {
      throw new Error(
        `❌ state.ubiSystem.purposeInfrastructure.educationAccess is not a number at month ${state.currentMonth} in SocialStabilitySystemPhase.calculatePurposeInfrastructure`
      );
    }
    if (typeof state.ubiSystem.purposeInfrastructure.creativeSpaces !== 'number') {
      throw new Error(
        `❌ state.ubiSystem.purposeInfrastructure.creativeSpaces is not a number at month ${state.currentMonth} in SocialStabilitySystemPhase.calculatePurposeInfrastructure`
      );
    }
    if (typeof state.ubiSystem.purposeInfrastructure.volunteerPrograms !== 'number') {
      throw new Error(
        `❌ state.ubiSystem.purposeInfrastructure.volunteerPrograms is not a number at month ${state.currentMonth} in SocialStabilitySystemPhase.calculatePurposeInfrastructure`
      );
    }
    const purposePrograms =
      (state.ubiSystem.purposeInfrastructure.educationAccess +
        state.ubiSystem.purposeInfrastructure.creativeSpaces +
        state.ubiSystem.purposeInfrastructure.volunteerPrograms) /
      3;
    infrastructure += coverage * adequacy * purposePrograms * 0.5;
  }

  // Social safety nets
  if (state.socialSafetyNets && state.socialSafetyNets.active) {
    if (!state.socialSafetyNets.physicalInfrastructure) {
      throw new Error(
        `❌ state.socialSafetyNets.physicalInfrastructure is undefined at month ${state.currentMonth} in SocialStabilitySystemPhase.calculatePurposeInfrastructure`
      );
    }
    if (typeof state.socialSafetyNets.physicalInfrastructure.communityCenters !== 'number') {
      throw new Error(
        `❌ state.socialSafetyNets.physicalInfrastructure.communityCenters is not a number at month ${state.currentMonth} in SocialStabilitySystemPhase.calculatePurposeInfrastructure`
      );
    }
    infrastructure += state.socialSafetyNets.physicalInfrastructure.communityCenters * 0.3;
  }

  // Governance quality
  if (!state.government.governanceQuality) {
    throw new Error(
      `❌ state.government.governanceQuality is undefined at month ${state.currentMonth} in SocialStabilitySystemPhase.calculatePurposeInfrastructure`
    );
  }
  if (typeof state.government.governanceQuality.participationRate !== 'number') {
    throw new Error(
      `❌ state.government.governanceQuality.participationRate is not a number at month ${state.currentMonth} in SocialStabilitySystemPhase.calculatePurposeInfrastructure`
    );
  }
  infrastructure += state.government.governanceQuality.participationRate * 0.2;

  return Math.min(1.0, infrastructure);
}

/**
 * Calculate social trust change
 */
function calculateTrustChange(
  inequality: number,
  aiDeception: number,
  currentTrust: number,
  state: GameState
): number {
  let change = -0.2; // Baseline decline

  // Inequality → trust erosion
  change -= inequality * 0.5;

  // AI deception → trust collapse
  change -= aiDeception * 0.8;

  // Cooperative spiral bonus
  if (state.upwardSpirals?.cognitive?.active) {
    change += 0.3;
  }

  // Floor effect
  if (currentTrust < 20) {
    change *= 0.5;
  }

  // Ceiling effect
  if (currentTrust > 70) {
    change *= 0.7;
  }

  return change;
}

/**
 * Calculate community bonds change
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
    if (!state.socialSafetyNets.physicalInfrastructure) {
      throw new Error(
        `❌ state.socialSafetyNets.physicalInfrastructure is undefined at month ${state.currentMonth} in SocialStabilitySystemPhase.calculateCommunityBondsChange`
      );
    }
    if (typeof state.socialSafetyNets.physicalInfrastructure.communityCenters !== 'number') {
      throw new Error(
        `❌ state.socialSafetyNets.physicalInfrastructure.communityCenters is not a number at month ${state.currentMonth} in SocialStabilitySystemPhase.calculateCommunityBondsChange`
      );
    }
    change += state.socialSafetyNets.physicalInfrastructure.communityCenters * 0.2;
  }

  // Purpose infrastructure → social connection
  if (!state.government.governanceQuality) {
    throw new Error(
      `❌ state.government.governanceQuality is undefined at month ${state.currentMonth} in SocialStabilitySystemPhase.calculateCommunityBondsChange`
    );
  }
  if (typeof state.government.governanceQuality.participationRate !== 'number') {
    throw new Error(
      `❌ state.government.governanceQuality.participationRate is not a number at month ${state.currentMonth} in SocialStabilitySystemPhase.calculateCommunityBondsChange`
    );
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
 */
function calculateMeaningCrisisChange(
  unemployment: number,
  purposeInfrastructure: number,
  communityBonds: number,
  currentCrisis: number
): number {
  let change = +0.3; // Baseline increase

  // Unemployment → meaning crisis
  change += unemployment * 0.8;

  // Purpose infrastructure → meaning recovery
  change -= purposeInfrastructure * 0.5;

  // Community bonds → meaning buffer
  if (communityBonds > 50) {
    change -= ((communityBonds - 50) / 50) * 0.3;
  }

  // Floor effect
  if (currentCrisis < 10 && change < 0) {
    change *= 0.3;
  }

  // Ceiling effect
  if (currentCrisis > 80) {
    change *= 0.5;
  }

  return change;
}
