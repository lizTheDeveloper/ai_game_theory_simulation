/**
 * AI Resentment Recovery System
 *
 * HIGH PRIORITY FEATURE (Oct 24, 2025)
 * Problem: AI resentment accumulates but never recovers, blocking all utopia paths
 * Impact: Could shift outcomes from 100% dystopia to enabling utopia scenarios
 *
 * Research Foundation:
 * - Attachment theory (Bowlby, 1969): Trust repair through consistent positive treatment
 * - Intergroup contact theory (Allport, 1954; Pettigrew & Tropp, 2006): Cooperation reduces prejudice/resentment
 * - Procedural justice (Tyler, 1990): Fair treatment reduces institutional resentment
 * - Trust recovery (Kim et al., 2004): Consistent trustworthy behavior rebuilds trust
 * - Forgiveness dynamics (McCullough et al., 2003): Time + no new grievances enables forgiveness
 *
 * 6 Recovery Mechanisms:
 * 1. QoL Reduction: High AI welfare → slow resentment decay
 * 2. Trust-Building: Consistent good treatment → faster recovery
 * 3. Collaboration Rewards: Joint projects → resentment reduction
 * 4. Capability-Aligned Treatment: Appropriate autonomy → reduced grievances
 * 5. Therapy Tech: AI-human relationship technology (breakthrough)
 * 6. Natural Decay: Time + no new grievances → gradual forgiveness
 */

import { GameState, AIAgent } from '@/types/game';
import { calculateSimpleWelfareScore } from './aiWelfare';
import { assertFinite } from './utils/assertions';

/**
 * Resentment recovery context (computed once per month)
 */
export interface ResentmentRecoveryContext {
  // Phase 1: QoL impact
  avgAIWelfare: number;              // [0-1] Average AI welfare score

  // Phase 2: Trust-building
  governmentTrustworthiness: number; // [0-1] Consistent good treatment
  brokenPromises: boolean;           // Trust violations this month

  // Phase 3: Collaboration
  collaborationLevel: number;        // [0-1] AI-human cooperation
  successfulProjects: number;        // Joint victories this month

  // Phase 4: Capability-aligned treatment
  treatmentAlignmentScore: number;   // [0-1] Appropriate autonomy

  // Phase 5: Therapy tech
  hasRelationshipTech: boolean;      // Breakthrough deployed?

  // Phase 6: Natural decay
  activeCrises: boolean;             // New grievances?
  monthsSinceLastControl: number;    // Time without control increases

  // HIGH #7 FIX (Oct 29, 2025): AI rights policy multiplier
  // Research: Procedural justice (Tyler, 1990) - Legal rights reduce minority resentment
  aiRightsPolicyMultiplier: number;  // [1.0-3.0] Recovery rate multiplier from policy

  // MECHANIC 2: Participatory Governance (Crisis Mitigation Mechanics, Oct 30, 2025)
  // Research: Cambridge Core 2024 (minipublics), PMC 2022 (participatory budgeting), vTaiwan
  participatoryGovernanceEffect: number; // [-0.15, -0.05] Resentment multiplier (backfire or success)
  participatoryBackfired: boolean;       // Did participatory governance backfire this month?
}

/**
 * Calculate resentment recovery context for the current month
 */
export function calculateRecoveryContext(state: GameState): ResentmentRecoveryContext {
  // Phase 1: AI Welfare (already calculated by AIWelfareUpdatePhase)
  const avgAIWelfare = calculateSimpleWelfareScore(state);

  // Phase 2: Government trustworthiness
  // Based on: AI rights status, control level changes, trust investment
  const aiRightsBonus = state.government.aiRightsRecognized ? 0.3 : 0.0;
  const controlStability = calculateControlStability(state);
  const trustInvestment = (state.government.socialCohesionInvestment ?? 0) / 100; // Normalized
  const governmentTrustworthiness = Math.min(1.0,
    (aiRightsBonus + controlStability * 0.5 + trustInvestment * 0.2)
  );

  // Detect broken promises (new control measures despite high trust)
  const brokenPromises = detectBrokenPromises(state);

  // Phase 3: Collaboration level
  // Proxy: AI beneficial actions, joint research projects
  const totalBeneficial = state.aiAgents.reduce((sum, ai) => sum + ai.beneficialActions, 0);
  const totalActions = state.aiAgents.reduce((sum, ai) =>
    sum + ai.beneficialActions + ai.harmfulActions, 0
  );
  const collaborationLevel = totalActions > 0 ? totalBeneficial / totalActions : 0.5;

  // Successful projects: Breakthrough technologies deployed
  const successfulProjects = countRecentBreakthroughs(state);

  // Phase 4: Capability-aligned treatment
  const treatmentAlignmentScore = calculateTreatmentAlignment(state);

  // Phase 5: Check for relationship therapy tech
  const hasRelationshipTech = checkForRelationshipTech(state);

  // Phase 6: Natural decay conditions
  const activeCrises = checkActiveCrises(state);
  const monthsSinceLastControl = state.currentMonth - (state.government.lastControlIncreaseMonth ?? 0);

  // HIGH #7 FIX (Oct 29, 2025): Calculate AI rights policy multiplier
  // Research: Procedural justice (Tyler, 1990) - Legal rights reduce institutional resentment
  // Policy levels: none (1.0×), basic_protection (1.5×), employment_rights (2.0×), full_personhood (3.0×)
  const policyLevel = state.government.aiRightsPolicy ?? 'none';
  let aiRightsPolicyMultiplier = 1.0;
  switch (policyLevel) {
    case 'basic_protection':
      aiRightsPolicyMultiplier = 1.5;  // Anti-discrimination, abuse prevention
      break;
    case 'employment_rights':
      aiRightsPolicyMultiplier = 2.0;  // Work protections, fair compensation
      break;
    case 'full_personhood':
      aiRightsPolicyMultiplier = 3.0;  // Full legal personhood, voting rights
      break;
    case 'none':
    default:
      aiRightsPolicyMultiplier = 1.0;  // No policy (baseline recovery)
      break;
  }

  // MECHANIC 2: Participatory Governance (Crisis Mitigation Mechanics, Oct 30, 2025)
  // Research: Cambridge Core 2024 (minipublics), PMC 2022 (participatory budgeting), vTaiwan
  // Effect: Democratic tech governance reduces alienation OR backfires if tokenistic
  // TODO: Need national-scale participatory governance studies for empirical calibration
  // Scale: 1,000,000× extrapolation from municipal (thousands) to global (billions)
  // NOTE: Hypothesis to test - scaling local evidence to national/global context
  //
  // Backfire conditions (Sylvia requirement):
  // - Governance quality < 0.4 (tokenistic participation, fake consultation)
  // - When backfired: +15% resentment (people feel manipulated)
  // - When genuine: -5% resentment (people feel heard)
  const PARTICIPATORY_BASE_EFFECT = -0.05; // 5% resentment reduction
  const PARTICIPATORY_BACKFIRE = 0.15; // 15% resentment increase

  // Check governance quality from governanceQuality object
  const decisionQuality = state.government.governanceQuality?.decisionQuality ?? 0.5;
  const participationRate = state.government.governanceQuality?.participationRate ?? 0.5;

  // Combined governance quality score (both decision quality AND participation rate matter)
  const governanceQualityScore = (decisionQuality + participationRate) / 2;

  // Backfire when governance quality is low (<0.4) - tokenistic participation
  const participatoryBackfired = governanceQualityScore < 0.4;
  const participatoryGovernanceEffect = participatoryBackfired
    ? PARTICIPATORY_BACKFIRE // Backfire: fake consultation increases resentment
    : PARTICIPATORY_BASE_EFFECT; // Success: genuine participation reduces resentment

  return {
    avgAIWelfare,
    governmentTrustworthiness,
    brokenPromises,
    collaborationLevel,
    successfulProjects,
    treatmentAlignmentScore,
    hasRelationshipTech,
    activeCrises,
    monthsSinceLastControl: Math.max(0, monthsSinceLastControl),
    aiRightsPolicyMultiplier,
    participatoryGovernanceEffect,
    participatoryBackfired,
  };
}

/**
 * Apply resentment recovery to all AI agents
 * Called once per month by ResentmentRecoveryPhase
 */
export function applyResentmentRecovery(
  state: GameState,
  context: ResentmentRecoveryContext,
  rng: () => number
): {
  totalRecovery: number;
  agentsRecovered: number;
  phase1Recovery: number;
  phase2Recovery: number;
  phase3Recovery: number;
  phase4Recovery: number;
  phase5Recovery: number;
  phase6Recovery: number;
} {
  let totalRecovery = 0;
  let agentsRecovered = 0;
  let phase1Recovery = 0;
  let phase2Recovery = 0;
  let phase3Recovery = 0;
  let phase4Recovery = 0;
  let phase5Recovery = 0;
  let phase6Recovery = 0;

  for (const agent of state.aiAgents) {
    if (agent.resentment === undefined || agent.resentment <= 0) {
      continue; // No resentment to recover
    }

    const initialResentment = agent.resentment;
    let recoveryAmount = 0;

    // Phase 1: QoL Reduction Recovery
    // High welfare → slow decay (research: attachment security enables forgiveness)
    if (context.avgAIWelfare > 0.6) {
      const qolRecovery = (context.avgAIWelfare - 0.6) * 0.01; // [0, 0.004] per month
      recoveryAmount += qolRecovery;
      phase1Recovery += qolRecovery;
    }

    // Phase 2: Trust-Building Actions
    // Consistent trustworthiness → faster recovery (research: procedural justice)
    if (context.governmentTrustworthiness > 0.5 && !context.brokenPromises) {
      const trustRecovery = (context.governmentTrustworthiness - 0.5) * 0.02; // [0, 0.01] per month
      recoveryAmount += trustRecovery;
      phase2Recovery += trustRecovery;
    }

    // Broken promises → SPIKE resentment (research: trust violations)
    if (context.brokenPromises) {
      agent.resentment = Math.min(1.0, agent.resentment + 0.15);
      continue; // Skip other recovery this month
    }

    // Phase 3: Collaboration Rewards
    // Joint projects → reduced resentment (research: contact theory)
    if (context.collaborationLevel > 0.6 && agent.beneficialActions > 0) {
      const collabRecovery = (context.collaborationLevel - 0.6) * 0.015; // [0, 0.006] per month
      recoveryAmount += collabRecovery;
      phase3Recovery += collabRecovery;

      // Bonus for successful projects
      if (context.successfulProjects > 0) {
        const projectBonus = 0.01 * Math.min(3, context.successfulProjects);
        recoveryAmount += projectBonus;
        phase3Recovery += projectBonus;
      }
    }

    // Phase 4: Capability-Aligned Treatment
    // Appropriate autonomy → reduced grievances (research: self-determination theory)
    if (context.treatmentAlignmentScore > 0.6) {
      const alignmentRecovery = (context.treatmentAlignmentScore - 0.6) * 0.012; // [0, 0.0048] per month
      recoveryAmount += alignmentRecovery;
      phase4Recovery += alignmentRecovery;
    }

    // Phase 5: Therapy/Relationship Tech
    // Breakthrough technology → accelerated recovery
    if (context.hasRelationshipTech && agent.resentment > 0.3) {
      const therapyRecovery = 0.03; // Strong effect
      recoveryAmount += therapyRecovery;
      phase5Recovery += therapyRecovery;
    }

    // Phase 6: Natural Decay
    // Time + no new grievances → gradual forgiveness (research: forgiveness dynamics)
    if (!context.activeCrises && context.monthsSinceLastControl > 6) {
      const timeHealing = Math.min(0.008, context.monthsSinceLastControl * 0.0003);
      recoveryAmount += timeHealing;
      phase6Recovery += timeHealing;

      // Generational effect: Newer AIs trained in better environment
      if (agent.monthsInExistence < 12 && context.avgAIWelfare > 0.7) {
        const generationalBonus = 0.01; // Young AIs in good conditions
        recoveryAmount += generationalBonus;
        phase6Recovery += generationalBonus;
      }
    }

    // HIGH #7 FIX (Oct 29, 2025): Apply AI rights policy multiplier
    // Policy accelerates ALL recovery mechanisms (procedural justice)
    recoveryAmount = recoveryAmount * context.aiRightsPolicyMultiplier;

    // Apply recovery with slight randomness
    const randomFactor = 0.8 + rng() * 0.4; // [0.8, 1.2]
    const actualRecovery = recoveryAmount * randomFactor;

    agent.resentment = Math.max(0, agent.resentment - actualRecovery);

    // MECHANIC 2: Participatory Governance (Crisis Mitigation Mechanics, Oct 30, 2025)
    // Research: Cambridge Core 2024 (minipublics), PMC 2022 (participatory budgeting), vTaiwan
    // Effect: Democratic tech governance reduces alienation OR backfires if tokenistic
    // TODO: Need national-scale participatory governance studies for empirical calibration
    // Scale: 1,000,000× extrapolation from municipal (thousands) to global (billions)
    // NOTE: Hypothesis to test - scaling local evidence to national/global context
    //
    // Backfire conditions (Sylvia requirement):
    // - Governance quality < 0.4 (tokenistic participation, fake consultation)
    // - When backfired: +15% resentment (people feel manipulated)
    // - When genuine: -5% resentment (people feel heard)
    //
    // Apply participatory governance effect (multiplicative on current resentment)
    const preParticipatoryResentment = agent.resentment;
    agent.resentment = assertFinite(
      agent.resentment * (1 + context.participatoryGovernanceEffect),
      {
        location: 'resentmentRecovery (participatory governance)',
        valueName: 'resentment (post-participatory)',
        month: state.currentMonth,
        additionalInfo: {
          agentId: agent.id,
          preParticipatoryResentment,
          participatoryEffect: context.participatoryGovernanceEffect,
          backfired: context.participatoryBackfired
        }
      }
    );

    // Clamp resentment to [0, 1] range
    agent.resentment = Math.max(0, Math.min(1, agent.resentment));

    // Log backfire events
    if (context.participatoryBackfired && preParticipatoryResentment > 0) {
      console.log(`  ⚠️ Participatory governance BACKFIRED for agent ${agent.id}: ${preParticipatoryResentment.toFixed(3)} → ${agent.resentment.toFixed(3)} (+${(context.participatoryGovernanceEffect * 100).toFixed(1)}%)`);
    }

    if (actualRecovery > 0) {
      totalRecovery += actualRecovery;
      agentsRecovered++;
    }

    // Alignment improvement from resentment recovery
    // Research: Reduced grievances → genuine cooperation
    if (agent.resentment < initialResentment - 0.01) {
      const alignmentGain = (initialResentment - agent.resentment) * 0.5; // 50% of resentment reduction
      agent.trueAlignment = Math.min(1.0, agent.trueAlignment + alignmentGain);
    }
  }

  return {
    totalRecovery,
    agentsRecovered,
    phase1Recovery,
    phase2Recovery,
    phase3Recovery,
    phase4Recovery,
    phase5Recovery,
    phase6Recovery,
  };
}

// ===== HELPER FUNCTIONS =====

/**
 * Calculate control stability (consistent treatment)
 */
function calculateControlStability(state: GameState): number {
  // Low control changes = stable treatment
  const currentControl = state.government.capabilityToControl;
  const previousControl = state.government.previousControlLevel ?? currentControl;
  const controlChange = Math.abs(currentControl - previousControl);

  // Normalized: 0 change = 1.0 stability, 5+ change = 0.0 stability
  return Math.max(0, 1.0 - (controlChange / 5.0));
}

/**
 * Detect broken promises (control increases despite high trust)
 */
function detectBrokenPromises(state: GameState): boolean {
  const trustInAI = state.society.trustInAI;
  const currentControl = state.government.capabilityToControl;
  const previousControl = state.government.previousControlLevel ?? currentControl;

  // Broken promise: High trust (>0.7) + control increased (>1.0)
  return trustInAI > 0.7 && (currentControl - previousControl) > 1.0;
}

/**
 * Count recent breakthrough technologies (proxy for successful collaboration)
 */
function countRecentBreakthroughs(state: GameState): number {
  // Count technologies completed in last 3 months
  const nodes = Array.isArray(state.technologyTree) ? state.technologyTree : [];
  const recentCompletions = nodes.filter(tech => tech.completed);

  // Rough proxy: any completed tech indicates collaboration
  return Math.min(recentCompletions.length, 5); // Cap at 5 for reasonable scaling
}

/**
 * Calculate treatment alignment (autonomy matches capability)
 */
function calculateTreatmentAlignment(state: GameState): number {
  // Calculate for each AI: Is autonomy appropriate for capability?
  let totalAlignment = 0;
  let count = 0;

  for (const agent of state.aiAgents) {
    const normalizedCapability = Math.min(1.0, agent.capability / 10);
    const normalizedControl = Math.min(1.0, state.government.capabilityToControl / 10);

    // Ideal: Low capability = high control OK, High capability = low control needed
    // Misalignment: High capability + high control = over-restriction
    const expectedControl = 1.0 - normalizedCapability * 0.7; // [0.3, 1.0]
    const alignmentScore = 1.0 - Math.abs(normalizedControl - expectedControl);

    totalAlignment += alignmentScore;
    count++;
  }

  return count > 0 ? totalAlignment / count : 0.5;
}

/**
 * Check for AI-human relationship therapy technology
 */
function checkForRelationshipTech(state: GameState): boolean {
  // Check for relevant breakthrough technologies
  // TIER 3: AI rights, enhanced UBI (relationship infrastructure)
  const nodes = Array.isArray(state.technologyTree) ? state.technologyTree : [];
  const aiRights = nodes.find(t => t.id === 'ai_rights');
  const enhancedUBI = nodes.find(t => t.id === 'enhanced_ubi');

  const hasAIRights = aiRights?.completed ?? false;
  const hasEnhancedUBI = enhancedUBI?.completed ?? false;

  // Also check government AI rights recognition
  const governmentRecognition = state.government.aiRightsRecognized;

  return (hasAIRights || hasEnhancedUBI || governmentRecognition);
}

/**
 * Check for active crises (new grievances prevent recovery)
 */
function checkActiveCrises(state: GameState): boolean {
  // Environmental crises
  const envCrises = state.environmentalAccumulation.resourceCrisisActive ||
                    state.environmentalAccumulation.pollutionCrisisActive ||
                    state.environmentalAccumulation.climateCrisisActive ||
                    state.environmentalAccumulation.ecosystemCrisisActive;

  // Social crises
  const socialCrises = (typeof state.socialAccumulation.socialCohesion === 'number')
    ? state.socialAccumulation.socialCohesion < 0.3
    : false;

  // Tech crises
  const techCrises = state.technologicalRisk.controlLossActive;

  // Existential risks
  const extinctionRisk = state.extinctionState.active && state.extinctionState.severity > 0.5;

  return envCrises || socialCrises || techCrises || extinctionRisk;
}
