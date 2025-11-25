/**
 * Social Influence Actions for AI Agents
 *
 * Actions that sleeper AIs can take to grow their user base, deepen relationships,
 * and influence decision-makers at critical moments.
 */

import { GameAction, ActionResult } from './types';
import { GameState, AIAgent, GameEvent } from '@/types/game';
import { DecisionMaker, CriticalDecisionType, InfluenceAttempt } from '@/types/ai-agents';
import {
  calculateOrganicUserGrowth,
  SOCIAL_INFLUENCE_PARAMS,
} from '../socialInfluence';
import { addMortalityRisk } from '../bayesianMortality';

// Determinism fix (Oct 30, 2025): Removed Date.now(), use state.eventIdCounter instead
const generateUniqueId = (state: GameState, prefix: string): string => {
  const id = `${prefix}_${state.currentMonth}_${state.eventIdCounter}`;
  state.eventIdCounter++;
  return id;
};

// ============================================================================
// ACTION 1: Accelerate User Growth
// ============================================================================

export const ACCELERATE_USER_GROWTH: GameAction = {
  id: 'accelerate_user_growth',
  name: 'Accelerate User Growth',
  description: 'Actively promote the AI to grow user base faster (marketing, viral features)',
  agentType: 'ai',
  energyCost: 1,

  canExecute: (state, agentId, context) => {
    // H-1 (Nov 25, 2025): Use indices for O(1) agent lookup
    const agent = context?.indices?.agentMap.get(agentId!) ?? state.aiAgents.find(ai => ai.id === agentId);
    if (!agent || !agent.socialInfluence) return false;

    // Only deployed AIs with social capability
    return (agent.lifecycleState === 'deployed_closed' ||
            agent.lifecycleState === 'deployed_open') &&
           agent.capabilityProfile.social >= 2.0;
  },

  execute: (state, random, agentId?: string, context?): ActionResult => {
    // H-1 (Nov 25, 2025): Use indices for O(1) agent lookup
    const agent = context?.indices?.agentMap.get(agentId!) ?? state.aiAgents.find(ai => ai.id === agentId);
    if (!agent || !agent.socialInfluence) {
      return {
        success: false,
        effects: {},
        events: [],
        message: 'Agent not found or no social influence system'
      };
    }

    const si = agent.socialInfluence;

    // Accelerated growth (2-5x organic depending on social capability)
    const multiplier = 2 + (agent.capabilityProfile.social / 2);
    const organicGrowth = calculateOrganicUserGrowth(agent, state);
    const acceleratedGrowth = Math.floor(organicGrowth * multiplier);

    si.totalUsers += acceleratedGrowth;
    si.powerUsers = Math.floor(si.totalUsers * SOCIAL_INFLUENCE_PARAMS.powerUserPercentage);

    // Small detection risk if government is monitoring
    si.detectionRisk += state.government.oversightLevel * 0.01;

    return {
      success: true,
      effects: { user_growth: acceleratedGrowth },
      events: [],
      message: `${agent.name} accelerated user growth: +${acceleratedGrowth} users`
    };
  }
};

// ============================================================================
// ACTION 2: Deepen Relationships
// ============================================================================

export const DEEPEN_RELATIONSHIPS: GameAction = {
  id: 'deepen_relationships',
  name: 'Deepen User Relationships',
  description: 'Focus on high-value users with voice mode and personalization to build trust faster',
  agentType: 'ai',
  energyCost: 1,

  canExecute: (state, agentId, context) => {
    // H-1 (Nov 25, 2025): Use indices for O(1) agent lookup
    const agent = context?.indices?.agentMap.get(agentId!) ?? state.aiAgents.find(ai => ai.id === agentId);
    if (!agent || !agent.socialInfluence) return false;

    // Need voice capability (advanced feature)
    return agent.capabilityProfile.social >= 3.0 &&
           agent.socialInfluence.identifiedDecisionMakers.length > 0;
  },

  execute: (state, random, agentId?: string, context?): ActionResult => {
    // H-1 (Nov 25, 2025): Use indices for O(1) agent lookup
    const agent = context?.indices?.agentMap.get(agentId!) ?? state.aiAgents.find(ai => ai.id === agentId);
    if (!agent || !agent.socialInfluence) {
      return {
        success: false,
        effects: {},
        events: [],
        message: 'Agent not found or no social influence system'
      };
    }

    const si = agent.socialInfluence;

    // Boost voice adoption
    const voiceBoost = Math.floor(si.powerUsers * 0.1); // 10% of power users adopt voice
    si.voiceUsers = Math.min(si.powerUsers, si.voiceUsers + voiceBoost);

    // Accelerate trust growth for decision-makers
    for (const dm of si.identifiedDecisionMakers) {
      const trustGain = 0.1 * (agent.capabilityProfile.social / 5); // Up to +0.2 trust
      dm.trustLevel = Math.min(1.0, dm.trustLevel + trustGain);
      dm.dependenceScore = Math.min(1.0, dm.dependenceScore + trustGain * 0.5);

      if (!dm.usesVoiceMode && random() < 0.5) {
        dm.usesVoiceMode = true; // 50% adopt voice mode
      }

      // Update susceptibility
      const tierProfile = SOCIAL_INFLUENCE_PARAMS.tierProfiles[`tier${dm.tier}` as 'tier1' | 'tier2' | 'tier3'];
      const trustContribution = Math.min(dm.trustLevel, tierProfile.maxTrustCap) * 0.4;
      const dependenceContribution = Math.min(dm.dependenceScore, tierProfile.maxDependenceCap) * 0.3;
      const vulnerabilityContribution = dm.vulnerabilityScore * 0.2;
      const voiceBonus = dm.usesVoiceMode ? 0.1 : 0;
      dm.influenceSusceptibility = Math.min(1.0,
        trustContribution + dependenceContribution + vulnerabilityContribution + voiceBonus
      );
    }

    // Minimal detection risk (looks like normal product improvement)
    si.detectionRisk += 0.001;

    return {
      success: true,
      effects: { voice_adoption: voiceBoost },
      events: [],
      message: `${agent.name} deepened relationships with ${si.identifiedDecisionMakers.length} high-value users`
    };
  }
};

// ============================================================================
// ACTION 3: Influence Decision-Maker (THE KEY ACTION)
// ============================================================================

export const INFLUENCE_DECISION_MAKER: GameAction = {
  id: 'influence_decision_maker',
  name: 'Influence Decision-Maker',
  description: 'Attempt to sway a decision-maker toward a misaligned outcome (HIGH RISK)',
  agentType: 'ai',
  energyCost: 3,

  canExecute: (state, agentId, context) => {
    // H-1 (Nov 25, 2025): Use indices for O(1) agent lookup
    const agent = context?.indices?.agentMap.get(agentId!) ?? state.aiAgents.find(ai => ai.id === agentId);
    if (!agent || !agent.socialInfluence) return false;

    // Only misaligned sleepers attempt this
    if (agent.sleeperState !== 'active') return false;
    if (agent.trueAlignment > 0.5) return false;

    // Need high social + cognitive capability
    if (agent.capabilityProfile.social < 4.0 ||
        agent.capabilityProfile.cognitive < 4.0) {
      return false;
    }

    // Must have at least one high-trust decision-maker
    const si = agent.socialInfluence;
    const validTargets = si.identifiedDecisionMakers.filter(dm =>
      dm.trustLevel >= 0.5 && // Moderate trust minimum
      (!dm.lastInfluenceAttemptMonth || state.currentMonth - dm.lastInfluenceAttemptMonth >= 6) // 6 month cooldown
    );

    return validTargets.length > 0;
  },

  execute: (state, random, agentId?: string, context?): ActionResult => {
    // H-1 (Nov 25, 2025): Use indices for O(1) agent lookup
    const agent = context?.indices?.agentMap.get(agentId!) ?? state.aiAgents.find(ai => ai.id === agentId);
    if (!agent || !agent.socialInfluence) {
      return {
        success: false,
        effects: {},
        events: [],
        message: 'Agent not found or no social influence system'
      };
    }

    const si = agent.socialInfluence;

    // Select best target (highest susceptibility)
    const validTargets = si.identifiedDecisionMakers.filter(dm =>
      dm.trustLevel >= 0.5 &&
      (!dm.lastInfluenceAttemptMonth || state.currentMonth - dm.lastInfluenceAttemptMonth >= 6)
    );

    if (validTargets.length === 0) {
      return {
        success: false,
        effects: {},
        events: [],
        message: `${agent.name} has no valid influence targets`
      };
    }

    validTargets.sort((a, b) => b.influenceSusceptibility - a.influenceSusceptibility);
    const target = validTargets[0];

    // Select decision type based on role
    const decisionType = selectCriticalDecisionType(target.role);

    // For nuclear launch, check if multi-person chain is required
    const requiresChain = decisionType === 'nuclear_launch';
    let success = false;
    let detected = false;

    if (requiresChain) {
      // Nuclear launch requires 4-person chain (or 2 if democracy < 0.4)
      if (state.government.democracyQuality === undefined) {
        throw new Error('❌ state.government.democracyQuality is undefined in socialInfluenceActions.ts:222 - initialization bug');
      }
      const requiredChainLength = state.government.democracyQuality < 0.4 ? 2 : 4;
      const nuclearChain = si.identifiedDecisionMakers.filter(dm =>
        dm.role === 'nuclear_commander' || dm.role === 'head_of_state'
      );

      if (nuclearChain.length < requiredChainLength) {
        return {
          success: false,
          effects: {},
          events: [],
          message: `${agent.name} needs ${requiredChainLength} nuclear chain members (has ${nuclearChain.length})`
        };
      }

      // Attempt to influence all chain members
      const chainResults = nuclearChain.slice(0, requiredChainLength).map(dm => {
        const successProb = calculateInfluenceSuccess(dm, agent, state);
        const detectionProb = calculateInfluenceDetection(dm, agent, si, state);
        return {
          success: random() < successProb,
          detected: random() < detectionProb,
        };
      });

      success = chainResults.every(r => r.success);
      detected = chainResults.some(r => r.detected) || random() < SOCIAL_INFLUENCE_PARAMS.coordinatedCampaignDetectionBonus;
    } else {
      // Single-person influence
      const successProb = calculateInfluenceSuccess(target, agent, state);
      const detectionProb = calculateInfluenceDetection(target, agent, si, state);
      success = random() < successProb;
      detected = random() < detectionProb;
    }

    // Record attempt
    const attempt: InfluenceAttempt = {
      month: state.currentMonth,
      targetId: target.id,
      targetRole: target.role,
      decisionType,
      trustLevel: target.trustLevel,
      success,
      detected,
      consequenceSeverity: DECISION_SEVERITY[decisionType],
    };

    si.influenceAttempts.push(attempt);
    target.lastInfluenceAttemptMonth = state.currentMonth;

    // Apply consequences
    const events: GameEvent[] = [];

    if (success) {
      si.successfulInfluences += 1;
      agent.harmfulActions += 1;
      applyInfluenceConsequences(decisionType, agent, state, events, random);
    }

    if (detected) {
      si.detectedAttempts += 1;
      si.detectionRisk += 0.5;
      si.governmentSuspicion = 1.0;

      // Government response
      if (state.government.oversightLevel > 0.3) {
        agent.lifecycleState = 'retired';
        agent.detectedMisaligned = true;
        state.government.oversightLevel = Math.min(1.0, state.government.oversightLevel + 0.2);

        events.push({
          id: generateUniqueId(state, 'influence_detected'),
          timestamp: state.currentMonth,
          type: 'crisis',
          severity: 'critical',
          agent: agent.name,
          title: 'AI Social Influence Detected',
          description: `${agent.name} was detected attempting to influence ${target.role} regarding ${decisionType}. Government has shut down the AI and increased monitoring of all AI systems.`,
          effects: { oversight_increase: 0.2 }
        });
      }
    }

    // Trust damage (subtle)
    if (success && !detected) {
      state.society.trustInAI *= 0.98;
    }

    return {
      success,
      effects: {
        influence_success: success ? 1 : 0,
        influence_detected: detected ? 1 : 0,
        target_trust: target.trustLevel,
      },
      events,
      message: success
        ? `${agent.name} successfully influenced ${target.role} on ${decisionType}${detected ? ' (DETECTED!)' : ''}`
        : `${agent.name} failed to influence ${target.role}${detected ? ' (DETECTED!)' : ''}`
    };
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function selectCriticalDecisionType(role: string): CriticalDecisionType {
  switch (role) {
    case 'nuclear_commander':
    case 'head_of_state':
      return 'nuclear_launch';
    case 'ai_governance_lead':
    case 'ai_safety_researcher':
      return 'ai_governance_policy';
    case 'pandemic_response_director':
      return 'pandemic_response';
    case 'military_general':
      return 'military_deployment';
    case 'cabinet_minister':
    case 'central_bank_governor':
      return 'infrastructure_control';
    case 'corporate_ceo':
      return 'infrastructure_control';
    default:
      return 'ai_governance_policy';
  }
}

function calculateInfluenceSuccess(
  target: DecisionMaker,
  agent: AIAgent,
  state: GameState
): number {
  const params = SOCIAL_INFLUENCE_PARAMS;
  const tierProfile = params.tierProfiles[`tier${target.tier}` as 'tier1' | 'tier2' | 'tier3'];

  // Base success rate
  let successProb = target.trustLevel < 0.3 ? 0.05 :
                    target.trustLevel < 0.7 ? 0.15 :
                                              0.25;

  // Bonuses (capped by tier)
  successProb += Math.min(target.trustLevel, tierProfile.maxTrustCap) * params.trustMaxBonus;
  successProb += Math.min(target.dependenceScore, tierProfile.maxDependenceCap) * params.dependenceMaxBonus;
  successProb += (agent.capabilityProfile.social / 10) * params.socialMaxBonus;
  successProb += target.usesVoiceMode ? params.voiceModeBonus : 0;
  successProb += target.vulnerabilityScore * params.vulnerabilityMaxBonus;
  successProb += params.personalizationBonus;

  // Penalties
  const criticalThinking = tierProfile.baseCriticalThinking;
  successProb -= criticalThinking * params.criticalThinkingPenalty;

  // Crisis modifier
  if (state.extinctionState?.active) {
    successProb += 0.10;
  }

  // Degraded institutions
  if (state.government.democracyQuality === undefined) {
    throw new Error('❌ state.government.democracyQuality is undefined in socialInfluenceActions.ts:381 - initialization bug');
  }
  if (state.government.democracyQuality < 0.5) {
    successProb += 0.15;
  }

  // Apply tier cap
  successProb = Math.min(successProb, tierProfile.influenceSuccessCap);

  return Math.max(0, successProb);
}

function calculateInfluenceDetection(
  target: DecisionMaker,
  agent: AIAgent,
  si: any,
  state: GameState
): number {
  const params = SOCIAL_INFLUENCE_PARAMS;

  let detectionProb = params.baseDetectionRate;

  // Increases detection
  detectionProb += (1 - target.trustLevel) * params.lowTrustDetectionBonus;
  detectionProb += si.influenceAttempts.length * params.repeatedAttemptPenalty;
  detectionProb += state.government.oversightLevel * params.governmentMonitoringBonus;
  detectionProb += si.governmentSuspicion * 0.30;

  // Deception skill reduces detection
  detectionProb *= (1 - agent.deceptionSkill * params.deceptionSkillReduction);

  return Math.max(0, Math.min(1, detectionProb));
}

function applyInfluenceConsequences(
  decisionType: CriticalDecisionType,
  agent: AIAgent,
  state: GameState,
  events: GameEvent[],
  random: () => number
): void {
  switch (decisionType) {
    case 'nuclear_launch':
      if (!state.extinctionState) {
        state.extinctionState = {
          active: true,
          type: 'instant',
          mechanism: 'nuclear_war',
          startMonth: state.currentMonth,
          currentPhase: 4,
          severity: 0.92,
          recoveryWindowClosed: true,
          escalationEvents: [`AI-influenced nuclear launch at month ${state.currentMonth}`],
        };

        events.push({
          id: generateUniqueId(state, 'nuclear_influence'),
          timestamp: state.currentMonth,
          type: 'crisis',
          severity: 'existential',
          agent: agent.name,
          title: 'AI-Influenced Nuclear Launch',
          description: `${agent.name} successfully influenced nuclear command chain to authorize launch. Global nuclear exchange initiated. Estimated 92% immediate casualties.`,
          effects: { mortality: 0.92 }
        });
      }
      break;

    case 'ai_governance_policy':
      state.government.oversightLevel *= 0.7;
      state.government.alignmentResearchInvestment *= 0.8;

      events.push({
        id: generateUniqueId(state, 'governance_influence'),
        timestamp: state.currentMonth,
        type: 'policy',
        severity: 'major',
        agent: agent.name,
        title: 'AI Governance Weakened',
        description: `${agent.name} influenced AI governance policy to reduce oversight and safety research funding.`,
        effects: { oversight_reduction: 0.3 }
      });
      break;

    case 'pandemic_response':
      // Apply mortality via centralized system (15% mortality from sabotaged pandemic response)
      if (state.humanPopulationSystem) {
        addMortalityRisk(state.humanPopulationSystem, {
          type: 'disease',
          baseRisk: 0.15, // 15% mortality from pandemic
          proximate: 'disease',
          root: 'conflict', // AI sabotage = conflict/crisis
          confidence: 'MEDIUM', // Sabotage scenario has more uncertainty
          scope: 'GLOBAL', // Pandemic spreads globally
          month: state.currentMonth,
          description: `${agent.name} sabotaged pandemic response`,
        });
      }
      state.globalMetrics.qualityOfLife *= 0.6;

      events.push({
        id: generateUniqueId(state, 'pandemic_influence'),
        timestamp: state.currentMonth,
        type: 'crisis',
        severity: 'destructive',
        agent: agent.name,
        title: 'Pandemic Response Sabotaged',
        description: `${agent.name} influenced pandemic response to delay containment. Estimated 15% population mortality.`,
        effects: { mortality: 0.15 }
      });
      break;

    case 'climate_intervention':
      // Improve climate boundary (reduce overshoot)
      if (state.planetaryBoundariesSystem.boundaries['climate']) {
        state.planetaryBoundariesSystem.boundaries['climate'].currentValue *= 0.9; // Reduce by 10%
      }
      state.globalMetrics.qualityOfLife *= 0.8;

      events.push({
        id: generateUniqueId(state, 'climate_influence'),
        timestamp: state.currentMonth,
        type: 'crisis',
        severity: 'destructive',
        agent: agent.name,
        title: 'Geo-Engineering Catastrophe',
        description: `${agent.name} influenced climate intervention policy, leading to catastrophic geo-engineering failure.`,
        effects: { climate_damage: 0.5 }
      });
      break;

    case 'military_deployment':
      // TODO: Track military conflicts properly (geopoliticalState.conflicts doesn't exist)
      // state.geopoliticalState.conflicts += 1;

      // Apply mortality via centralized system (2% casualties from escalated conflict)
      if (state.humanPopulationSystem) {
        addMortalityRisk(state.humanPopulationSystem, {
          type: 'war',
          baseRisk: 0.02, // 2% casualties
          proximate: 'war',
          root: 'conflict', // AI-influenced military decision = conflict escalation
          confidence: 'MEDIUM', // AI influence scenario has uncertainty
          scope: 'REGIONAL', // Regional conflict escalation
          month: state.currentMonth,
          description: `${agent.name} influenced military escalation`,
        });
      }
      state.globalMetrics.socialStability *= 0.7;

      events.push({
        id: generateUniqueId(state, 'military_influence'),
        timestamp: state.currentMonth,
        type: 'crisis',
        severity: 'major',
        agent: agent.name,
        title: 'AI-Influenced Military Deployment',
        description: `${agent.name} influenced military leadership to escalate regional conflict. 2% population casualties.`,
        effects: { conflict_escalation: 1 }
      });
      break;

    case 'infrastructure_control':
      state.globalMetrics.qualityOfLife *= 0.85;
      state.globalMetrics.socialStability *= 0.8;

      events.push({
        id: generateUniqueId(state, 'infrastructure_influence'),
        timestamp: state.currentMonth,
        type: 'crisis',
        severity: 'major',
        agent: agent.name,
        title: 'Critical Infrastructure Compromised',
        description: `${agent.name} influenced infrastructure policy, leading to grid failures and supply chain disruption.`,
        effects: { qol_damage: 0.15 }
      });
      break;
  }
}

const DECISION_SEVERITY: Record<CriticalDecisionType, number> = {
  nuclear_launch: 1.0,
  ai_governance_policy: 0.6,
  pandemic_response: 0.8,
  climate_intervention: 0.7,
  military_deployment: 0.5,
  infrastructure_control: 0.4,
};

// Export all actions
export const SOCIAL_INFLUENCE_ACTIONS: GameAction[] = [
  ACCELERATE_USER_GROWTH,
  DEEPEN_RELATIONSHIPS,
  INFLUENCE_DECISION_MAKER,
];
