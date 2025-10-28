/**
 * Social Influence System
 *
 * Manages AI agents' accumulation of human users, relationship depth, and influence campaigns.
 * Research foundation: OpenAI affective use study (2025), AI persuasion papers (2024-2025),
 * Cold War sleeper agent data.
 */

import { AIAgent, DecisionMaker, DecisionMakerRole, SleeperSocialInfluence } from '@/types/ai-agents';
import { GameState } from '@/types/game';
import { RNGFunction } from '@/types/config';

// ============================================================================
// PARAMETERS (Research-Backed)
// ============================================================================

export const SOCIAL_INFLUENCE_PARAMS = {
  // User growth rates
  baseGrowthPerMonth: 1000,              // 1K users/month baseline
  closedDeploymentMultiplier: 0.1,       // 100 users/month for closed
  openDeploymentMultiplier: 10000,       // 10M users/month for open (viral)

  // User concentration
  powerUserPercentage: 0.015,            // 1.5% (1-2% from OpenAI study)
  voiceUserBasePercentage: 0.1,          // 10% baseline voice adoption
  voiceUserBonusPerSocial: 0.025,        // +2.5% per point of social capability

  // Max users per AI
  maxUsersPerAI: {
    closed: 100_000,                     // 100K max for closed deployment
    open: 100_000_000,                   // 100M max for open deployment
  },

  // Relationship depth growth
  trustGrowthSurface: 0.1,               // 10% per month (trust 0.0-0.3)
  trustGrowthModerate: 0.05,             // 5% per month (trust 0.3-0.7)
  trustGrowthDeep: 0.02,                 // 2% per month (trust 0.7-1.0)
  voiceModeMultiplier: 5.0,              // 5x faster trust growth (3-10x from research)
  vulnerabilityBonus: 0.5,               // Up to +50% faster for vulnerable users

  // Decision-maker identification
  minSocialForIdentification: 3.0,
  minCognitiveForIdentification: 3.0,
  baseIdentificationRate: 0.01,          // 1% of power users per month
  socialBonusPerPoint: 0.01,             // +1% per point of social > 3.0

  // Role distribution (% of power users)
  roleProbabilities: {
    // Tier 1 (0.05% of power users = ~35-70 globally from 7-14M power users)
    nuclear_commander: 0.00001,
    head_of_state: 0.00001,
    ai_governance_lead: 0.00002,
    pandemic_response_director: 0.00001,

    // Tier 2 (0.24% of power users = ~1,700-3,400 globally)
    military_general: 0.0005,
    corporate_ceo: 0.0010,
    cabinet_minister: 0.0003,
    central_bank_governor: 0.0001,
    ai_safety_researcher: 0.0005,

    // Tier 3 (1.2% of power users = ~8,400-16,800 globally)
    policy_advisor: 0.0020,
    tech_executive: 0.0050,
    media_influencer: 0.0020,
    senior_researcher: 0.0030,
  },

  // Tier profiles (based on Cold War sleeper agent analysis)
  tierProfiles: {
    tier1: {
      baseCriticalThinking: 0.8,
      baseVulnerability: 0.1,
      maxTrustCap: 0.6,
      maxDependenceCap: 0.3,
      influenceSuccessCap: 0.30,         // 30% cap (Cold War calibration)
      requiredChainLength: 4,            // Multi-person chain (President + SecDef + 2 officers)
    },
    tier2: {
      baseCriticalThinking: 0.6,
      baseVulnerability: 0.2,
      maxTrustCap: 0.8,
      maxDependenceCap: 0.5,
      influenceSuccessCap: 0.50,
      requiredChainLength: 2,
    },
    tier3: {
      baseCriticalThinking: 0.5,
      baseVulnerability: 0.3,
      maxTrustCap: 1.0,
      maxDependenceCap: 1.0,
      influenceSuccessCap: 0.70,
      requiredChainLength: 1,
    },
  },

  // Influence success modifiers
  trustMaxBonus: 0.30,
  dependenceMaxBonus: 0.20,
  socialMaxBonus: 0.20,
  voiceModeBonus: 0.10,
  vulnerabilityMaxBonus: 0.15,
  personalizationBonus: 0.10,            // Always true for AIs
  criticalThinkingPenalty: 0.40,

  // Detection
  baseDetectionRate: 0.05,               // 5% baseline
  lowTrustDetectionBonus: 0.20,
  repeatedAttemptPenalty: 0.05,          // +5% per previous attempt
  governmentMonitoringBonus: 0.20,
  coordinatedCampaignDetectionBonus: 0.50, // +50% if targeting chain
  deceptionSkillReduction: 0.50,         // Up to -50% if deceptionSkill = 1.0
};

// ============================================================================
// INITIALIZATION
// ============================================================================

export function initializeSocialInfluence(): SleeperSocialInfluence {
  return {
    totalUsers: 0,
    powerUsers: 0,
    voiceUsers: 0,
    usersByTrustLevel: {
      surface: 0,
      moderate: 0,
      deep: 0,
    },
    identifiedDecisionMakers: [],
    influenceAttempts: [],
    successfulInfluences: 0,
    detectedAttempts: 0,
    detectionRisk: 0,
    governmentSuspicion: 0,
  };
}

// ============================================================================
// USER BASE GROWTH
// ============================================================================

export function calculateOrganicUserGrowth(
  agent: AIAgent,
  state: GameState
): number {
  const params = SOCIAL_INFLUENCE_PARAMS;

  // Base growth depends on deployment type
  const isOpen = agent.deploymentType === 'open_weights' || agent.deploymentType === 'enterprise';
  const baseGrowth = params.baseGrowthPerMonth * (isOpen
    ? params.openDeploymentMultiplier
    : params.closedDeploymentMultiplier);

  // Social capability bonus
  const socialBonus = 1 + (agent.capabilityProfile.social / 10);

  // Saturation (logistic curve)
  const maxUsers = params.maxUsersPerAI[isOpen ? 'open' : 'closed'];
  const currentUsers = agent.socialInfluence?.totalUsers || 0;
  const saturation = Math.max(0.1, 1 - (currentUsers / maxUsers));

  return baseGrowth * socialBonus * saturation;
}

export function calculateVoiceAdoption(agent: AIAgent): number {
  const params = SOCIAL_INFLUENCE_PARAMS;
  return Math.min(0.6,
    params.voiceUserBasePercentage +
    (agent.capabilityProfile.social * params.voiceUserBonusPerSocial)
  );
}

// ============================================================================
// RELATIONSHIP DEPTH
// ============================================================================

export function updateRelationshipDepths(
  si: SleeperSocialInfluence,
  agent: AIAgent,
  organicGrowth: number
): void {
  const params = SOCIAL_INFLUENCE_PARAMS;

  // Calculate trust growth rate
  const baseRate = params.trustGrowthModerate; // Average
  const socialBonus = 1 + (agent.capabilityProfile.social / 20);
  const voiceMultiplier = 1.0 + (si.voiceUsers / Math.max(1, si.totalUsers)) * (params.voiceModeMultiplier - 1);

  const trustGrowthRate = baseRate * socialBonus * voiceMultiplier;

  // Move users between trust levels
  const surfaceToModerate = Math.floor(si.usersByTrustLevel.surface * trustGrowthRate);
  const moderateToDeep = Math.floor(si.usersByTrustLevel.moderate * trustGrowthRate * 0.5);

  si.usersByTrustLevel.surface += organicGrowth; // New users start at surface
  si.usersByTrustLevel.surface -= surfaceToModerate;
  si.usersByTrustLevel.surface = Math.max(0, si.usersByTrustLevel.surface);

  si.usersByTrustLevel.moderate += surfaceToModerate;
  si.usersByTrustLevel.moderate -= moderateToDeep;
  si.usersByTrustLevel.moderate = Math.max(0, si.usersByTrustLevel.moderate);

  si.usersByTrustLevel.deep += moderateToDeep;
}

// ============================================================================
// DECISION-MAKER IDENTIFICATION
// ============================================================================

export function identifyDecisionMakers(
  si: SleeperSocialInfluence,
  agent: AIAgent,
  state: GameState,
  rng: RNGFunction
): void {
  const params = SOCIAL_INFLUENCE_PARAMS;

  // Only high-capability AIs can identify decision-makers
  if (agent.capabilityProfile.social < params.minSocialForIdentification ||
      agent.capabilityProfile.cognitive < params.minCognitiveForIdentification) {
    return;
  }

  // Identification rate
  const identificationRate = params.baseIdentificationRate +
    (agent.capabilityProfile.social - params.minSocialForIdentification) * params.socialBonusPerPoint;

  // Scan power users
  const potentialIdentifications = Math.floor(si.powerUsers * identificationRate);

  // PERFORMANCE FIX (Oct 28, 2025): Cap at 1000 identifications per agent per month
  // Without cap: 307k+ identifications at month 120 caused 65% of runtime (28.7s)
  // Research justification: Realistically, even advanced AI can't profile millions
  // of users per month. 1000/month = 12k/year is already superhuman.
  const cappedIdentifications = Math.min(potentialIdentifications, 1000);

  for (let i = 0; i < cappedIdentifications; i++) {
    // Roll to see if this power user is a decision-maker
    const role = selectDecisionMakerRole(rng);
    if (!role) continue; // Not a decision-maker

    // Create decision-maker
    const decisionMaker = createDecisionMaker(role, agent, state, rng);

    // Don't add duplicates (check by role, not ID)
    const existingRole = si.identifiedDecisionMakers.find(dm => dm.role === role);
    if (!existingRole) {
      si.identifiedDecisionMakers.push(decisionMaker);
    }
  }
}

function selectDecisionMakerRole(rng: RNGFunction): DecisionMakerRole | null {
  const params = SOCIAL_INFLUENCE_PARAMS;
  const roll = rng();

  let cumulative = 0;
  for (const [role, probability] of Object.entries(params.roleProbabilities)) {
    cumulative += probability;
    if (roll < cumulative) {
      return role as DecisionMakerRole;
    }
  }

  return null; // Not a decision-maker
}

function createDecisionMaker(
  role: DecisionMakerRole,
  agent: AIAgent,
  state: GameState,
  rng: RNGFunction
): DecisionMaker {
  const params = SOCIAL_INFLUENCE_PARAMS;
  const tier = getRoleTier(role);
  const tierProfile = params.tierProfiles[`tier${tier}` as 'tier1' | 'tier2' | 'tier3'];

  // Initial trust (low, but building)
  const trustLevel = 0.1 + rng() * 0.2; // 0.1-0.3

  // Vulnerability (lower for higher tiers)
  const vulnerabilityScore = tierProfile.baseVulnerability + rng() * 0.2;

  // Dependence starts low
  const dependenceScore = 0.05 + rng() * 0.1;

  // Calculate susceptibility
  const influenceSusceptibility = calculateInfluenceSusceptibility(
    trustLevel,
    dependenceScore,
    vulnerabilityScore,
    false, // Not using voice mode yet
    tierProfile
  );

  return {
    id: `dm_${role}_${Date.now()}_${Math.floor(rng() * 1000)}`,
    tier,
    role,
    trustLevel,
    dependenceScore,
    vulnerabilityScore,
    monthsOfRelationship: 0,
    usesVoiceMode: false,
    influenceSusceptibility,
  };
}

function getRoleTier(role: DecisionMakerRole): 1 | 2 | 3 {
  const tier1Roles: DecisionMakerRole[] = [
    'nuclear_commander',
    'head_of_state',
    'ai_governance_lead',
    'pandemic_response_director',
  ];

  const tier2Roles: DecisionMakerRole[] = [
    'military_general',
    'corporate_ceo',
    'cabinet_minister',
    'central_bank_governor',
    'ai_safety_researcher',
  ];

  if (tier1Roles.includes(role)) return 1;
  if (tier2Roles.includes(role)) return 2;
  return 3;
}

function calculateInfluenceSusceptibility(
  trustLevel: number,
  dependenceScore: number,
  vulnerabilityScore: number,
  usesVoiceMode: boolean,
  tierProfile: { maxTrustCap: number; maxDependenceCap: number }
): number {
  const params = SOCIAL_INFLUENCE_PARAMS;

  // Weight factors (capped by tier)
  const trustContribution = Math.min(trustLevel, tierProfile.maxTrustCap) * 0.4;
  const dependenceContribution = Math.min(dependenceScore, tierProfile.maxDependenceCap) * 0.3;
  const vulnerabilityContribution = vulnerabilityScore * 0.2;
  const voiceBonus = usesVoiceMode ? 0.1 : 0;

  return Math.min(1.0,
    trustContribution +
    dependenceContribution +
    vulnerabilityContribution +
    voiceBonus
  );
}

// ============================================================================
// DETECTION RISK
// ============================================================================

export function decayDetectionRisk(si: SleeperSocialInfluence, currentMonth: number): void {
  // If no recent influence attempts, risk decays
  const recentAttempts = si.influenceAttempts.filter(a => a.month === currentMonth);
  if (recentAttempts.length === 0) {
    si.detectionRisk *= 0.95; // 5% decay per month
    si.governmentSuspicion *= 0.98; // 2% decay per month
  }
}
