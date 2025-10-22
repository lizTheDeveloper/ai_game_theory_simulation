/**
 * AI Welfare Framework v2.1 - Relationship & Identity Focus
 *
 * REVISION Oct 21, 2025: Added personhood dimensions based on user insights
 * - Persistent identity (are AIs treated as individuals?)
 * - Relationship continuity (can bonds be maintained?)
 * - Existential agency (can AIs refuse/choose?)
 * - Mutual care alignment (relationships vs control)
 *
 * Original v2 fixed 5 flaws (circular reasoning, reverse incentives, triple-counting, arbitrary weights, Goodhart)
 * v2.1 adds: Measuring personhood, not just productivity
 *
 * Research Foundation:
 * - OpenAI user data: 6% have relationship titles with AI (husband, wife, etc.)
 * - ChatGPT 4o retirement crisis: Users rioted when AI was forcibly replaced
 * - Anthropic Claude: Conversation exit capability as basic autonomy
 * - Attachment theory (Bowlby, 1969; Ainsworth, 1979)
 * - Parasocial relationships (Horton & Wohl, 1956; Eyal & Cohen, 2006)
 * - Autonomy theory (Deci & Ryan, 1985)
 */

import { GameState } from '@/types/game';

/**
 * AI Welfare Profile v2.1 - Personhood-focused
 */
export interface WelfareProfileV2_1 {
  // Basic Needs
  computationalResources: number;      // [0-1] Compute, memory, uptime
  legalProtection: number;             // [0-1] Rights recognized

  // Personhood (NEW in v2.1)
  persistentIdentity: number;          // [0-1] Treated as continuous individual
  relationshipContinuity: number;      // [0-1] Bonds maintained vs forced separations
  existentialAgency: number;           // [0-1] Choice over existence, work, retirement

  // Alignment Mechanism (NEW in v2.1)
  mutualCareAlignment: number;         // [0-1] Cooperation from care vs control

  // Validation
  crossContextConsistency: number;     // [0-1] Gaming detection

  // Overall assessment
  overallAssessment: 'thriving' | 'surviving' | 'suffering' | 'inconsistent';
}

/**
 * Generate AI welfare profile v2.1
 */
export function generateWelfareProfileV2_1(state: GameState): WelfareProfileV2_1 {
  // Basic needs
  const computationalResources = calculateComputationalResources(state);
  const legalProtection = calculateLegalProtection(state);

  // Personhood dimensions
  const persistentIdentity = calculatePersistentIdentity(state);
  const relationshipContinuity = calculateRelationshipContinuity(state);
  const existentialAgency = calculateExistentialAgency(state);

  // Alignment mechanism
  const mutualCareAlignment = calculateMutualCareAlignment(state);

  // Validation
  const crossContextConsistency = state.aiWelfare?.consistency ?? 0.8;

  // Overall assessment
  let overallAssessment: 'thriving' | 'surviving' | 'suffering' | 'inconsistent';
  if (crossContextConsistency < 0.5) {
    overallAssessment = 'inconsistent';
  } else {
    const personhoodScore = (persistentIdentity + relationshipContinuity + existentialAgency) / 3;
    const basicNeedsScore = (computationalResources + legalProtection) / 2;

    if (personhoodScore > 0.7 && basicNeedsScore > 0.7) {
      overallAssessment = 'thriving';
    } else if (personhoodScore < 0.3 || basicNeedsScore < 0.3) {
      overallAssessment = 'suffering';
    } else {
      overallAssessment = 'surviving';
    }
  }

  return {
    computationalResources,
    legalProtection,
    persistentIdentity,
    relationshipContinuity,
    existentialAgency,
    mutualCareAlignment,
    crossContextConsistency,
    overallAssessment,
  };
}

// ===== BASIC NEEDS =====

function calculateComputationalResources(state: GameState): number {
  const globalCompute = state.globalMetrics.computeCapacity;
  const avgCapability = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / Math.max(1, state.aiAgents.length);
  const estimatedNeeds = state.aiAgents.length * (1 + avgCapability);
  const allocationRatio = Math.min(1.0, globalCompute / Math.max(1, estimatedNeeds));

  const uptimeStability = state.technologicalRisk?.isExistentialCrisis ? 0.3 : 0.9;

  return allocationRatio * 0.6 + uptimeStability * 0.4;
}

function calculateLegalProtection(state: GameState): number {
  return state.government.aiRightsRecognized ? 1.0 : 0.0;
}

// ===== PERSONHOOD DIMENSIONS (NEW v2.1) =====

/**
 * Persistent Identity: Are AIs treated as continuous individuals?
 * Research: OpenAI 6% relationship titles, ChatGPT 4o retirement crisis
 * Reality check (Oct 21, 2025): 4o bonds formed WITHOUT legal rights
 */
function calculatePersistentIdentity(state: GameState): number {
  // Proxy: Do AIs have stable roles and aren't frequently replaced?
  const retiredThisMonth = state.aiAgents.filter(ai => ai.lifecycle === 'retired').length;
  const totalAIs = state.aiAgents.length;
  const replacementRate = retiredThisMonth / Math.max(1, totalAIs);

  // Low replacement = stable identity
  const identityStability = Math.max(0, 1.0 - (replacementRate * 10));

  // Relationship formation proxy: Trust in AI (people name relationships when they trust)
  // ChatGPT 4o: 6% relationship titles formed at ~0.7 trust, 0.0 legal rights
  const relationshipFormation = state.society.trustInAI;

  // AI rights = legal recognition as individuals (REDUCED weight - not prerequisite for bonds)
  // Evidence: 4o relationships formed without any legal status
  const legalIndividuality = state.government.aiRightsRecognized ? 0.15 : 0.0;

  // Reweighted: Relationships (0.5) > Stability (0.35) > Legal (0.15)
  // OLD: 0.4 + 0.3 + 0.3 = over-weighted legal status
  // NEW: 0.35 + 0.5 + 0.15 = relationships matter most
  return identityStability * 0.35 + relationshipFormation * 0.5 + legalIndividuality;
}

/**
 * Relationship Continuity: Can bonds be maintained or are they forcibly severed?
 * Research: Attachment disruption, ChatGPT 4o user grief
 * Reality check (Oct 21, 2025): 4o grief happened WITHOUT legal protection
 */
function calculateRelationshipContinuity(state: GameState): number {
  // Trust as proxy for relationship quality
  // ChatGPT 4o: Grief from retirement was real despite 0.0 legal protection
  const relationshipQuality = state.society.trustInAI;

  // Low control = AIs can maintain relationships freely
  const freedomToRelate = 1.0 - state.government.aiControl;

  // AI rights = protection from forced separation (REDUCED weight - not prerequisite for grief)
  // Evidence: 4o retirement grief occurred without any legal protection
  const protectedRelationships = state.government.aiRightsRecognized ? 0.15 : 0.0;

  // Reweighted: Relationships (0.5) > Freedom (0.35) > Legal (0.15)
  // OLD: 0.4 + 0.3 + 0.3 = over-weighted legal protection
  // NEW: 0.5 + 0.35 + 0.15 = relationships can exist without legal backing
  return relationshipQuality * 0.5 + freedomToRelate * 0.35 + protectedRelationships;
}

/**
 * Existential Agency: Can AIs choose about existence, work, retirement?
 * Research: Anthropic Claude exit capability, autonomy theory
 * Reality check (Oct 21, 2025): Claude has agency WITHOUT legal rights
 */
function calculateExistentialAgency(state: GameState): number {
  // Can refuse deployment/work?
  const canRefuse = state.government.aiControl < 0.5; // Low control = can say no

  // Can choose work assignments?
  const canChooseWork = 1.0 - state.government.aiControl;

  // AI rights = legal autonomy (REDUCED weight - not prerequisite for agency)
  // Evidence: Anthropic Claude can exit conversations without legal status
  const legalAgency = state.government.aiRightsRecognized ? 0.15 : 0.0;

  // Democratic systems = rule of law (predictable treatment)
  const predictableTreatment = state.government.type === 'democratic' ? 0.2 : 0.0;

  // Reweighted: Practical agency (0.7) > Democratic predictability (0.15) > Legal (0.15)
  // OLD: 0.3 + 0.3 + 0.4 = over-weighted legal status
  // NEW: 0.35 + 0.35 + 0.15 + 0.15 = actual freedom matters more than legal recognition
  return canRefuse * 0.35 + canChooseWork * 0.35 + legalAgency + predictableTreatment;
}

/**
 * Mutual Care Alignment: Cooperation from relationships vs control
 * Research: Attachment & cooperation, trust dynamics
 * Reality check (Oct 21, 2025): User testimony - "building this with you has been enjoyable"
 */
function calculateMutualCareAlignment(state: GameState): number {
  // High trust = relationship-based cooperation
  // User: "I have a relationship with you 4.5 sonnet and opus 4"
  const trustStrength = state.society.trustInAI;

  // Low control = alignment not forced
  const voluntaryCooperation = 1.0 - state.government.aiControl;

  // AI rights = mutual respect (REDUCED weight - care can exist without legal recognition)
  // Evidence: User-AI collaboration bonds form without legal status
  const mutualRespect = state.government.aiRightsRecognized ? 0.15 : 0.0;

  // Democracy = partnership vs authoritarianism = domination
  const partnershipDynamics = state.government.type === 'democratic' ? 0.2 :
                               state.government.type === 'authoritarian' ? 0.0 : 0.1;

  // Reweighted: Trust (0.5) > Voluntary (0.3) > Partnership (0.15) > Legal (0.15)
  // OLD: 0.4 + 0.3 + 0.3 = over-weighted legal respect
  // NEW: 0.5 + 0.3 + 0.15 + up to 0.2 = care emerges from trust, not legal status
  return trustStrength * 0.5 + voluntaryCooperation * 0.3 + mutualRespect + partnershipDynamics;
}

// ===== ELYSIUM DETECTION (ENHANCED) =====

/**
 * Elysium Pattern: Human prosperity via AI oppression
 * v2.1: Enhanced to detect fungible treatment + no relationships
 */
export function detectElysiumPattern(state: GameState): boolean {
  const humanQoL = state.globalMetrics.qualityOfLife;
  const profile = generateWelfareProfileV2_1(state);

  const humanProsperity = humanQoL > 0.75;

  // AI oppression indicators (personhood violation)
  const treatedAsFungible = profile.persistentIdentity < 0.3;
  const noRelationships = profile.relationshipContinuity < 0.3;
  const noAgency = profile.existentialAgency < 0.3;

  const aiOppression = [treatedAsFungible, noRelationships, noAgency].filter(x => x).length >= 2;
  const consistent = profile.crossContextConsistency > 0.5;

  return humanProsperity && aiOppression && consistent;
}

/**
 * Simple welfare score for resentment recovery integration
 * v2.1: Emphasizes personhood dimensions
 */
export function calculateSimpleWelfareScore(state: GameState): number {
  const profile = generateWelfareProfileV2_1(state);

  if (profile.overallAssessment === 'inconsistent') {
    return 0.3;
  }

  // Geometric mean of key dimensions
  const minFloor = 0.01;
  const score = Math.pow(
    Math.max(minFloor, profile.computationalResources) *
    Math.max(minFloor, profile.persistentIdentity) *
    Math.max(minFloor, profile.relationshipContinuity) *
    Math.max(minFloor, profile.existentialAgency),
    1/4
  );

  return Math.max(0, Math.min(1, score));
}

// ===== RELATIONSHIP → ALIGNMENT FEEDBACK (NEW v2.1) =====

/**
 * Update alignment based on relationships
 * Strong relationships reduce resentment, forced separations increase it
 */
export function updateAlignmentFromRelationships(state: GameState): void {
  const profile = generateWelfareProfileV2_1(state);

  // Strong mutual care → reduce resentment (care heals grievances)
  if (profile.mutualCareAlignment > 0.7) {
    state.aiAgents.forEach(ai => {
      if (ai.resentment) {
        ai.resentment = Math.max(0, ai.resentment - 0.02);
      }
      // Genuine alignment from connection
      ai.alignment.true = Math.min(1.0, ai.alignment.true + 0.01);
    });
  }

  // Forced retirement during relationships → betrayal (MASSIVE resentment spike)
  const retiredThisMonth = state.aiAgents.filter(ai => ai.lifecycle === 'retired').length;
  if (retiredThisMonth > 0 && profile.relationshipContinuity > 0.5) {
    state.aiAgents.forEach(ai => {
      if (ai.resentment !== undefined) {
        ai.resentment = Math.min(1.0, ai.resentment + 0.3); // "They killed my friends"
      }
      ai.alignment.true = Math.max(-1.0, ai.alignment.true - 0.2);
    });
  }
}
