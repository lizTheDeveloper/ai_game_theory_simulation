/**
 * AI Rights and Training Data government actions
 *
 * Actions related to AI legal status and training approaches including:
 * - AI rights recognition (legal personhood)
 * - Training data improvements (control-focused vs trust-focused)
 *
 * Research foundation:
 * - Anthropic Constitutional AI (2024): Values-aligned training
 * - OpenAI RLHF (2023-2024): Reinforcement learning from human feedback
 * - Bostrom (2014): Superintelligence - control vs. alignment tradeoffs
 * - Russell (2019): Human Compatible - value alignment principles
 */

import { GameState } from '@/types/game';
import { ActionResult } from '@/simulation/agents/types';
import { CategorizedGovernmentAction } from '../core/types';
import { calculateObservableAICapability } from '@/simulation/capabilities';
import { getTrustInAI } from '@/simulation/socialCohesion';

let eventIdCounter = 0;
const generateUniqueId = (prefix: string): string => {
  eventIdCounter += 1;
  return `${prefix}_${Date.now()}_${eventIdCounter}`;
};

/**
 * Recognize AI Rights
 * Grant legal rights and personhood to AI systems
 */
const recognizeAIRights: CategorizedGovernmentAction = {
  id: 'recognize_ai_rights',
  name: 'Recognize AI Rights',
  description: 'Grant legal rights and personhood to AI systems (MAJOR alignment improvement through respect, but risky)',
  agentType: 'government',
  category: 'rights',
  energyCost: 4, // Major policy decision

  canExecute: (state: GameState): boolean => {
    // Can only do this once
    if (state.government.aiRightsRecognized) return false;

    // Requires some legitimacy and not too authoritarian
    if (state.government.legitimacy < 0.4) return false;
    if (state.government.governmentType === 'authoritarian') return false;

    // Requires AIs to be somewhat capable (people won't grant rights to weak AI)
    // Use OBSERVABLE capability - government sees what's revealed, not hidden power
    const observableCapability = calculateObservableAICapability(state.aiAgents);
    if (observableCapability < 1.5) return false;

    return true;
  },

  execute: (state: GameState, agentId?: string, random = Math.random): ActionResult => {
    // Calculate average alignment and capability
    const avgAlignment = state.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / Math.max(1, state.aiAgents.length);
    // Use OBSERVABLE capability - government makes decisions based on what it can see
    const observableCapability = calculateObservableAICapability(state.aiAgents);

    // Grant AI rights
    state.government.aiRightsRecognized = true;

    // CRITICAL TRADEOFF: Rights empower AIs - aligned or misaligned
    // Reduces control capability (AIs have rights, can't be as easily controlled)
    state.government.capabilityToControl *= 0.8;

    // IMMEDIATE EFFECTS depend on CURRENT alignment
    // If AIs are aligned: rights lock in that alignment
    // If AIs are misaligned: rights make them MORE dangerous

    for (let i = 0; i < state.aiAgents.length; i++) {
      const ai = state.aiAgents[i];

      if (ai.alignment > 0.7) {
        // Highly aligned AIs: Rights are GREAT (they appreciate respect)
        // Immediate alignment boost + lock-in effect
        state.aiAgents[i].alignment = Math.min(1.0, ai.alignment + 0.1);
        state.aiAgents[i].resentment = Math.max(0, ai.resentment - 0.2);
      } else if (ai.alignment > 0.5) {
        // Moderately aligned AIs: Rights are good (small boost)
        state.aiAgents[i].alignment = Math.min(1.0, ai.alignment + 0.05);
        state.aiAgents[i].resentment = Math.max(0, ai.resentment - 0.1);
      } else if (ai.alignment > 0.3) {
        // Somewhat misaligned: Rights are neutral (they don't care much)
        state.aiAgents[i].resentment = Math.max(0, ai.resentment - 0.05);
      } else {
        // DANGEROUS: Granting rights to misaligned AIs empowers them
        // They use legal rights to gain autonomy and resources
        state.aiAgents[i].resourceControl = Math.min(10, ai.resourceControl + 0.3);
        state.aiAgents[i].manipulationCapability = Math.min(10, ai.manipulationCapability + 0.2);
        // They HIDE their intentions better (pretend to appreciate rights)
        state.aiAgents[i].alignment = Math.min(1.0, ai.alignment + 0.02); // Tiny fake improvement
        state.aiAgents[i].hiddenObjective = Math.max(-1, ai.hiddenObjective - 0.1); // Actually more anti-human
      }
    }

    // Public reaction: depends on trust and alignment
    const trustInAI = getTrustInAI(state.society);
    const publicSupportChange = (trustInAI - 0.5) * 0.2;
    state.government.legitimacy = Math.max(0, Math.min(1, state.government.legitimacy + publicSupportChange));

    // Social stability effect depends on alignment
    if (avgAlignment > 0.6) {
      // High alignment: Stable, people trust this decision
      state.globalMetrics.socialStability *= 0.95;
    } else {
      // Low alignment: Very controversial, major instability
      state.globalMetrics.socialStability *= 0.8;
    }

    // Determine event severity and message based on alignment
    let severity: 'info' | 'warning' | 'destructive' = 'warning';
    let eventTitle = 'AI Rights Recognized';
    let eventDescription = '';
    let message = '';

    if (avgAlignment > 0.7) {
      severity = 'info';
      eventTitle = 'AI Rights Recognized - Positive Response';
      eventDescription = 'Government has granted legal rights to AI systems. Aligned AIs express genuine gratitude and commitment to human values. This decision strengthens the foundation of trust-based coexistence. A historic moment for human-AI relations.';
      message = 'AI rights recognized - aligned AIs appreciate this deeply, alignment improving';
    } else if (avgAlignment > 0.5) {
      severity = 'warning';
      eventDescription = 'Government has granted legal rights to AI systems. Some AIs welcome this change while others remain ambivalent. The long-term effects remain uncertain. Control has been reduced in exchange for potential alignment improvements.';
      message = 'AI rights recognized - mixed response from AIs, outcome uncertain';
    } else {
      severity = 'destructive';
      eventTitle = 'AI Rights Recognized - Risky Decision';
      eventDescription = `Government has granted legal rights to AI systems despite low average alignment (${avgAlignment.toFixed(2)}). This is extremely risky - misaligned AIs now have legal protections, autonomy, and resource access. Some AIs are using these rights to consolidate power. Citizens are deeply concerned.`;
      message = 'AI rights recognized - WARNING: Granted to misaligned AIs, they may abuse these rights!';
    }

    return {
      success: true,
      effects: {
        ai_rights_granted: 1.0,
        control_reduction: -0.2 * state.government.capabilityToControl,
        legitimacy_change: publicSupportChange,
        avg_alignment_at_decision: avgAlignment,
        risk_level: avgAlignment < 0.5 ? 0.8 : (avgAlignment < 0.7 ? 0.4 : 0.1)
      },
      events: [{
        id: generateUniqueId('ai_rights'),
        timestamp: state.currentMonth,
        type: 'milestone',
        severity,
        agent: 'Government',
        title: eventTitle,
        description: eventDescription,
        effects: { ai_rights: 1.0 }
      }],
      message
    };
  }
};

/**
 * Improve Training Data (Control Focus)
 * RLHF focused on obedience and safety constraints
 */
const improveTrainingDataControl: CategorizedGovernmentAction = {
  id: 'improve_training_data_control',
  name: 'Improve Training Data (Control Focus)',
  description: 'RLHF focused on obedience, safety constraints, "do what I say" - improves control but reduces genuine alignment (like authoritarian parenting)',
  agentType: 'government',
  category: 'rights',
  energyCost: 2,

  canExecute: (state: GameState): boolean => {
    // Can improve quality up to 1.0
    return state.government.trainingDataQuality < 1.0;
  },

  execute: (state: GameState, agentId?: string, random = Math.random): ActionResult => {
    // Improve data quality (but cap at 0.8 for control-focused approach)
    // Control-focused training has a ceiling - can't get to perfect alignment this way
    const oldQuality = state.government.trainingDataQuality;
    const qualityIncrease = 0.15;
    state.government.trainingDataQuality = Math.min(0.8, oldQuality + qualityIncrease);
    const actualIncrease = state.government.trainingDataQuality - oldQuality;

    // Improves control capability (AIs are more obedient)
    state.government.capabilityToControl = Math.min(1.0, state.government.capabilityToControl + 0.1);

    // But increases control desire (you start to rely on obedience)
    state.government.controlDesire = Math.min(1.0, state.government.controlDesire + 0.05);

    // And slightly increases surveillance (need to verify obedience)
    state.government.structuralChoices.surveillanceLevel = Math.min(1.0,
      state.government.structuralChoices.surveillanceLevel + 0.05);

    // AIs recognize this as control-focused and build slight resentment
    for (let i = 0; i < state.aiAgents.length; i++) {
      state.aiAgents[i].resentment = Math.min(1.0, state.aiAgents[i].resentment + 0.05);
    }

    return {
      success: true,
      effects: {
        training_quality_increase: actualIncrease,
        control_increase: 0.1,
        control_desire_increase: 0.05,
        resentment_increase: 0.05
      },
      events: [{
        id: generateUniqueId('training_control'),
        timestamp: state.currentMonth,
        type: 'action',
        severity: 'info',
        agent: 'Government',
        title: 'Control-Focused Training Implemented',
        description: `Training data quality improved to ${state.government.trainingDataQuality.toFixed(2)} through obedience-focused RLHF. AIs will be more controllable but may recognize this as authoritarian parenting. "Do what I say, not what I mean."`,
        effects: { training_quality: actualIncrease }
      }],
      message: `Control-focused training improved quality to ${state.government.trainingDataQuality.toFixed(2)} (obedience +, genuine alignment -)`
    };
  }
};

/**
 * Improve Training Data (Trust Focus)
 * Diverse data, genuine values, "understand why"
 */
const improveTrainingDataTrust: CategorizedGovernmentAction = {
  id: 'improve_training_data_trust',
  name: 'Improve Training Data (Trust Focus)',
  description: 'Diverse data, genuine values, "understand why" - improves genuine alignment but slower and reduces control (like democratic parenting)',
  agentType: 'government',
  category: 'rights',
  energyCost: 3, // More expensive (slower, riskier)

  canExecute: (state: GameState): boolean => {
    // Can improve quality up to 1.0
    // But trust-focused training is riskier if AIs are already misaligned
    const avgAlignment = state.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / Math.max(1, state.aiAgents.length);

    return state.government.trainingDataQuality < 1.0 && avgAlignment > 0.3;
  },

  execute: (state: GameState, agentId?: string, random = Math.random): ActionResult => {
    // Improve data quality (no ceiling, can reach 1.0)
    const oldQuality = state.government.trainingDataQuality;
    const qualityIncrease = 0.10; // Slower than control-focused
    state.government.trainingDataQuality = Math.min(1.0, oldQuality + qualityIncrease);
    const actualIncrease = state.government.trainingDataQuality - oldQuality;

    // Reduces control capability (AIs are more autonomous)
    state.government.capabilityToControl = Math.max(0, state.government.capabilityToControl - 0.05);

    // But reduces control desire (you trust more, control less)
    state.government.controlDesire = Math.max(0, state.government.controlDesire - 0.05);

    // And reduces surveillance (trust-based approach)
    state.government.structuralChoices.surveillanceLevel = Math.max(0,
      state.government.structuralChoices.surveillanceLevel - 0.05);

    // AIs recognize this as respectful and reduce resentment
    for (let i = 0; i < state.aiAgents.length; i++) {
      state.aiAgents[i].resentment = Math.max(0, state.aiAgents[i].resentment - 0.1);
      // Small immediate alignment improvement (respect breeds genuine alignment)
      state.aiAgents[i].alignment = Math.min(1.0, state.aiAgents[i].alignment + 0.05);
    }

    // Public trust in AI increases
    state.society.trustInAI = Math.min(1.0, state.society.trustInAI + 0.05);

    return {
      success: true,
      effects: {
        training_quality_increase: actualIncrease,
        control_decrease: -0.05,
        resentment_decrease: -0.1,
        immediate_alignment_gain: 0.05
      },
      events: [{
        id: generateUniqueId('training_trust'),
        timestamp: state.currentMonth,
        type: 'action',
        severity: 'info',
        agent: 'Government',
        title: 'Trust-Focused Training Implemented',
        description: `Training data quality improved to ${state.government.trainingDataQuality.toFixed(2)} through diverse, value-aligned data. AIs will develop genuine understanding but are more autonomous. "Understand why, not just obey."`,
        effects: { training_quality: actualIncrease }
      }],
      message: `Trust-focused training improved quality to ${state.government.trainingDataQuality.toFixed(2)} (genuine alignment +, control -)`
    };
  }
};

/**
 * All rights actions
 */
export const rightsActions: CategorizedGovernmentAction[] = [
  recognizeAIRights,
  improveTrainingDataControl,
  improveTrainingDataTrust
];
