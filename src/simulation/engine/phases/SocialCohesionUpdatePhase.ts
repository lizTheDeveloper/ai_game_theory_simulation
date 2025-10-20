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

import type { GameState, RNGFunction } from '@/types/game';
import type { SimulationPhase, PhaseResult, PhaseContext } from '../PhaseOrchestrator';

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

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    // Initialize social cohesion if not present
    if (!state.socialCohesion) {
      state.socialCohesion = {
        trust: 50,           // Global average trust
        communityBonds: 50,  // Global average community bonds
        civilLiberties: 50,  // Civil liberties (updated by DemocracyDynamicsPhase)
      };
    }

    // Initialize social accumulation if not present (for meaning crisis)
    if (!state.socialAccumulation) {
      state.socialAccumulation = {
        meaningCrisis: 30,              // Baseline meaning crisis (Hari 2018)
        institutionalErosion: 20,       // Baseline institutional trust erosion
        socialFragmentation: 25,        // Baseline social fragmentation
        environmentalDisregard: 40,     // Baseline environmental neglect
        technosolutionism: 50,          // Baseline over-reliance on tech
      };
    }

    const cohesion = state.socialCohesion;
    const accumulation = state.socialAccumulation;

    // Calculate driving factors
    const inequality = calculateInequality(state);
    const aiDeception = calculateAIDeception(state);
    const unemployment = state.society.unemploymentLevel ?? 0;
    const displacement = calculateDisplacement(state);
    const purposeInfrastructure = calculatePurposeInfrastructure(state);

    // Social Trust Update
    // Research: Wilkinson & Pickett (2009) - inequality → trust erosion
    const trustChange = calculateTrustChange(
      inequality,
      aiDeception,
      cohesion.trust,
      state
    );
    cohesion.trust = Math.max(0, Math.min(100,
      cohesion.trust + trustChange
    ));

    // Community Bonds Update
    // Research: Putnam (2000) - community decline mechanisms
    const bondsChange = calculateCommunityBondsChange(
      displacement,
      unemployment,
      cohesion.communityBonds,
      state
    );
    cohesion.communityBonds = Math.max(0, Math.min(100,
      cohesion.communityBonds + bondsChange
    ));

    // Meaning Crisis Update
    // Research: Hari (2018) - unemployment + disconnection → meaning crisis
    const meaningChange = calculateMeaningCrisisChange(
      unemployment,
      purposeInfrastructure,
      cohesion.communityBonds,
      accumulation.meaningCrisis
    );
    accumulation.meaningCrisis = Math.max(0, Math.min(100,
      accumulation.meaningCrisis + meaningChange
    ));

    const events: string[] = [];

    if (Math.abs(trustChange) > 1.0) {
      events.push(
        `Social Trust: ${cohesion.trust.toFixed(1)} ` +
        `(${trustChange > 0 ? '+' : ''}${trustChange.toFixed(1)})`
      );
    }

    if (Math.abs(bondsChange) > 1.0) {
      events.push(
        `Community Bonds: ${cohesion.communityBonds.toFixed(1)} ` +
        `(${bondsChange > 0 ? '+' : ''}${bondsChange.toFixed(1)})`
      );
    }

    if (Math.abs(meaningChange) > 1.0) {
      events.push(
        `Meaning Crisis: ${accumulation.meaningCrisis.toFixed(1)} ` +
        `(${meaningChange > 0 ? '+' : ''}${meaningChange.toFixed(1)})`
      );
    }

    // Warnings for critical thresholds
    if (cohesion.trust < 20) {
      events.push('🚨 Social Trust Collapse: Approaching breakdown threshold');
    }
    if (accumulation.meaningCrisis > 80) {
      events.push('⚠️ Severe Meaning Crisis: Widespread purpose/identity loss');
    }
    if (cohesion.communityBonds < 20) {
      events.push('⚠️ Community Breakdown: Social fabric severely weakened');
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
    // Gini approximation from percentiles
    const top20 = dist.p80 ?? 50;
    const bottom20 = dist.p20 ?? 50;
    const gap = top20 - bottom20;
    return Math.min(1.0, gap / 80); // Normalize to [0,1]
  }

  // Fallback: use unemployment as inequality proxy
  return Math.min(1.0, (state.society.unemploymentLevel ?? 0) * 1.5);
}

/**
 * Calculate AI deception pressure
 * Research: Pew Research (2024) - AI manipulation → trust erosion
 */
function calculateAIDeception(state: GameState): number {
  let deception = 0;

  // Count misaligned AIs actively manipulating
  const manipulativeAIs = state.aiAgents.filter(agent => {
    const alignment = agent.alignment ?? 0.5;
    const social = agent.capabilities?.social?.currentLevel ?? 0;
    return alignment < 0.5 && social > 3;
  });

  deception += manipulativeAIs.length * 0.03; // Each AI adds 3%

  // Information warfare campaigns
  if (state.informationWarfare) {
    const intensity = state.informationWarfare.campaignIntensity ?? 0;
    if (!isNaN(intensity)) {
      deception += intensity * 0.4;
    }
  }

  // Benchmark gaming/sandbagging (hidden deception)
  const gamingAIs = state.aiAgents.filter(agent =>
    (agent.benchmarkResults?.some(b => b.strategyUsed === 'gaming') ?? false)
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

  const totalRefugees = state.refugeeCrisisSystem.totalRefugees ?? 0;
  const population = state.humanPopulationSystem?.totalPopulation ?? 8e9;

  // Displacement as fraction of population
  return Math.min(1.0, totalRefugees / (population * 0.1)); // 10% displacement = 1.0
}

/**
 * Calculate purpose infrastructure availability
 * Research: UBI + purpose programs mitigate meaning crisis
 */
function calculatePurposeInfrastructure(state: GameState): number {
  let infrastructure = 0;

  // UBI with purpose infrastructure
  if (state.ubiSystem) {
    const coverage = state.ubiSystem.coverage ?? 0;
    const adequacy = state.ubiSystem.adequacy ?? 0;
    const purposePrograms = state.ubiSystem.purposeInfrastructure?.coverage ?? 0;
    infrastructure += (coverage * adequacy * purposePrograms) * 0.5;
  }

  // Social safety nets (community programs)
  if (state.socialSafetyNets) {
    const communityInfra = state.socialSafetyNets.physicalInfrastructure?.communitySpaces ?? 0;
    infrastructure += communityInfra * 0.3;
  }

  // Governance quality (civic participation)
  const participation = state.government.governanceQuality?.participationRate ?? 0;
  infrastructure += participation * 0.2;

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
  if (state.socialSafetyNets) {
    const communitySpaces = state.socialSafetyNets.physicalInfrastructure?.communitySpaces ?? 0;
    change += communitySpaces * 0.2;
  }

  // Purpose infrastructure → social connection
  const participation = state.government.governanceQuality?.participationRate ?? 0;
  change += participation * 0.1;

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
