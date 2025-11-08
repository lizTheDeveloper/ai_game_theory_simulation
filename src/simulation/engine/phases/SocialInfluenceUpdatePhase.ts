/**
 * Social Influence Update Phase
 *
 * Runs each month to update user base growth, relationship depth, and decision-maker identification
 * for all deployed AI agents.
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import {
  initializeSocialInfluence,
  calculateOrganicUserGrowth,
  calculateVoiceAdoption,
  updateRelationshipDepths,
  identifyDecisionMakers,
  decayDetectionRisk,
  SOCIAL_INFLUENCE_PARAMS,
} from '../../socialInfluence';
import { assertFinite, assertInRange, assertProbability } from '@/simulation/utils/assertions';

export class SocialInfluenceUpdatePhase implements SimulationPhase {
  readonly id = 'social_influence_update';
  readonly name = 'Social Influence Update';
  readonly order = 19.0; // After AI lifecycle (6.0), before agent actions (20.0)

  execute(
    state: GameState,
    rng: RNGFunction,
    context?: PhaseContext
  ): PhaseResult {
    setDeterministicRng(rng);
    // PERFORMANCE INSTRUMENTATION (Oct 28, 2025)
  const enableTiming = state.currentMonth === 0 || state.currentMonth === 120 || state.currentMonth === 240;
  let time1 = 0, time2 = 0, time3 = 0, time4 = 0, time5 = 0, time6 = 0;
  let totalPotentialIds = 0;

  for (const agent of state.aiAgents) {
    // Only deployed AIs have users
    if (agent.lifecycleState !== 'deployed_closed' &&
        agent.lifecycleState !== 'deployed_open') {
      continue;
    }

    // Initialize social influence if not exists
    if (!agent.socialInfluence) {
      agent.socialInfluence = initializeSocialInfluence();
    }

    const si = agent.socialInfluence;

    // 1. Passive user base growth (organic)
    const t1 = enableTiming ? performance.now() : 0;
    const growthRate = calculateOrganicUserGrowth(agent, state);

    // Validate growth rate is finite
    assertFinite(growthRate, {
      location: 'SocialInfluenceUpdatePhase.execute',
      valueName: 'growthRate',
      month: state.currentMonth,
      additionalInfo: { agentId: agent.id }
    });

    si.totalUsers += growthRate;
    si.totalUsers = Math.floor(si.totalUsers); // Keep as integer
    if (enableTiming) time1 += performance.now() - t1;

    // 2. Update power users and voice users
    const t2 = enableTiming ? performance.now() : 0;
    si.powerUsers = Math.floor(si.totalUsers * SOCIAL_INFLUENCE_PARAMS.powerUserPercentage);
    const voiceAdoptionRate = calculateVoiceAdoption(agent);

    // Validate voice adoption rate is a probability
    assertProbability(voiceAdoptionRate, {
      location: 'SocialInfluenceUpdatePhase.execute',
      valueName: 'voiceAdoptionRate',
      month: state.currentMonth,
      additionalInfo: { agentId: agent.id }
    });

    si.voiceUsers = Math.floor(si.totalUsers * voiceAdoptionRate);
    if (enableTiming) time2 += performance.now() - t2;

    // 3. Relationship depth accumulation
    const t3 = enableTiming ? performance.now() : 0;
    updateRelationshipDepths(si, agent, growthRate);
    if (enableTiming) time3 += performance.now() - t3;

    // 4. Decision-maker identification (background scanning)
    const t4 = enableTiming ? performance.now() : 0;
    if (enableTiming) {
      const identRate = SOCIAL_INFLUENCE_PARAMS.baseIdentificationRate +
        (agent.capabilityProfile.social - SOCIAL_INFLUENCE_PARAMS.minSocialForIdentification) * SOCIAL_INFLUENCE_PARAMS.socialBonusPerPoint;
      const potIds = Math.floor(si.powerUsers * identRate);
      totalPotentialIds += potIds;
    }
    identifyDecisionMakers(si, agent, state, rng);
    if (enableTiming) time4 += performance.now() - t4;

    // 5. Update decision-maker relationship stats
    const t5 = enableTiming ? performance.now() : 0;
    for (const dm of si.identifiedDecisionMakers) {
      dm.monthsOfRelationship += 1;

      // Passive trust growth (slower than active deepening)
      const passiveTrustGrowth = 0.02 * (agent.capabilityProfile.social / 5);
      dm.trustLevel = Math.min(1.0, dm.trustLevel + passiveTrustGrowth);

      // Update susceptibility
      const tierProfile = SOCIAL_INFLUENCE_PARAMS.tierProfiles[`tier${dm.tier}` as 'tier1' | 'tier2' | 'tier3'];
      const trustContribution = Math.min(dm.trustLevel, tierProfile.maxTrustCap) * 0.4;
      const dependenceContribution = Math.min(dm.dependenceScore, tierProfile.maxDependenceCap) * 0.3;
      const vulnerabilityContribution = dm.vulnerabilityScore * 0.2;
      const voiceBonus = dm.usesVoiceMode ? 0.1 : 0;
      dm.influenceSusceptibility = Math.min(1.0,
        trustContribution + dependenceContribution + vulnerabilityContribution + voiceBonus
      );

      // Validate susceptibility is in valid probability range
      assertProbability(dm.influenceSusceptibility, {
        location: 'SocialInfluenceUpdatePhase.execute',
        valueName: 'dm.influenceSusceptibility',
        month: state.currentMonth,
        additionalInfo: {
          agentId: agent.id,
          decisionMakerId: dm.id,
          tier: dm.tier
        }
      });
    }
    if (enableTiming) time5 += performance.now() - t5;

    // 6. Detection risk decay (if AI behaves normally)
    const t6 = enableTiming ? performance.now() : 0;
    decayDetectionRisk(si, state.currentMonth);
    if (enableTiming) time6 += performance.now() - t6;
  }

  // Print timing breakdown
  if (enableTiming) {
    console.log(`\n🔍 SOCIAL INFLUENCE SUB-TIMING (Month ${state.currentMonth}):`);
    console.log(`  1. calculateOrganicUserGrowth: ${time1.toFixed(2)}ms`);
    console.log(`  2. calculateVoiceAdoption: ${time2.toFixed(2)}ms`);
    console.log(`  3. updateRelationshipDepths: ${time3.toFixed(2)}ms`);
    console.log(`  4. identifyDecisionMakers: ${time4.toFixed(2)}ms (${totalPotentialIds} potential IDs)`);
    console.log(`  5. Update decision-maker stats: ${time5.toFixed(2)}ms`);
    console.log(`  6. decayDetectionRisk: ${time6.toFixed(2)}ms`);
    console.log(`  TOTAL: ${(time1+time2+time3+time4+time5+time6).toFixed(2)}ms`);
  }

  return { events: [] };
  }
}
