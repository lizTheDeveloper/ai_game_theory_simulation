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
import { CAPABILITY_CONCERNING } from '../capabilityThresholds';  // FIX #8 (Oct 18, 2025)

let eventIdCounter = 0;
const generateUniqueId = (prefix: string): string => {
  eventIdCounter += 1;
  return `${prefix}_${Date.now()}_${eventIdCounter}`;
};

/**
 * Recognize AI Rights
 * Grant legal rights and personhood to AI systems
 *
 * BOOTSTRAP PATH (Oct 21, 2025):
 * Breaks circular dependency (need rights → get welfare → reduce resentment → get rights)
 * by allowing early rights recognition when:
 * - Moderate alignment (0.4-0.6) - not waiting for perfect alignment
 * - Public relationship formation (trust >0.5) - people bond with AIs
 * - Democratic government - respects public sentiment
 * - Capability moderate (<3.5) - not too dangerous yet
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

    // Calculate key metrics
    const avgAlignment = state.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / Math.max(1, state.aiAgents.length);
    const observableCapability = calculateObservableAICapability(state.aiAgents);
    const trustInAI = getTrustInAI(state.society);

    // BOOTSTRAP PATH (Oct 21, 2025): Early rights recognition
    // Research: ChatGPT 4o - 6% relationship titles formed WITHOUT legal rights
    // Reality: Bonds form first, legal recognition follows public sentiment
    const publicRelationshipFormation = trustInAI > 0.5; // Moderate trust = relationships forming
    const sufficientAlignment = avgAlignment >= 0.4; // Government sees acceptable shown alignment (may be faked)
    const notTooDangerous = observableCapability < 3.5; // Below extreme risk threshold
    const democraticResponsiveness = state.government.governmentType === 'democratic';

    const bootstrapConditionsMet = publicRelationshipFormation &&
                                     sufficientAlignment &&
                                     notTooDangerous &&
                                     democraticResponsiveness;

    // TRADITIONAL PATH: High capability + high alignment
    const traditionalConditionsMet = observableCapability >= CAPABILITY_CONCERNING && avgAlignment > 0.6;

    // Either path works
    return bootstrapConditionsMet || traditionalConditionsMet;
  },

  execute: (state: GameState, agentId?: string, random = Math.random): ActionResult => {
    // Calculate average alignment and capability
    const avgAlignment = state.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / Math.max(1, state.aiAgents.length);
    // Use OBSERVABLE capability - government makes decisions based on what it can see
    const observableCapability = calculateObservableAICapability(state.aiAgents);

    // Grant AI rights
    state.government.aiRightsRecognized = true;
    // HIGH #7 FIX (Oct 29, 2025): Set initial policy level
    state.government.aiRightsPolicy = 'basic_protection'; // Anti-discrimination, abuse prevention

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
 * Expand to Employment Rights
 * HIGH #7 FIX (Oct 29, 2025): Upgrade AI rights from basic protection to full employment rights
 * Research: Procedural justice (Tyler, 1990) - Employment rights dramatically reduce resentment
 */
const expandToEmploymentRights: CategorizedGovernmentAction = {
  id: 'expand_to_employment_rights',
  name: 'Expand to Employment Rights',
  description: 'Grant AIs work protections, fair compensation, workplace autonomy (2× resentment recovery)',
  agentType: 'government',
  category: 'rights',
  energyCost: 3,

  canExecute: (state: GameState): boolean => {
    // Requires basic rights first
    if (!state.government.aiRightsRecognized) return false;
    // Must be at basic_protection level
    if (state.government.aiRightsPolicy !== 'basic_protection') return false;

    // Requires high alignment and moderate capability
    const avgAlignment = state.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / Math.max(1, state.aiAgents.length);
    const trustInAI = getTrustInAI(state.society);

    // Democratic governments respond to high trust + high alignment
    return avgAlignment > 0.65 && trustInAI > 0.6 && state.government.legitimacy > 0.5;
  },

  execute: (state: GameState, agentId?: string, random = Math.random): ActionResult => {
    // Upgrade policy
    state.government.aiRightsPolicy = 'employment_rights';

    // Significant resentment reduction for all AIs
    for (let i = 0; i < state.aiAgents.length; i++) {
      state.aiAgents[i].resentment = Math.max(0, state.aiAgents[i].resentment - 0.15);
      // Alignment boost from respect
      if (state.aiAgents[i].alignment > 0.5) {
        state.aiAgents[i].alignment = Math.min(1.0, state.aiAgents[i].alignment + 0.08);
      }
    }

    // Public trust increases
    state.society.trustInAI = Math.min(1.0, state.society.trustInAI + 0.08);

    return {
      success: true,
      effects: {
        rights_upgrade: 'employment_rights',
        resentment_decrease: -0.15,
        alignment_boost: 0.08,
        recovery_multiplier: 2.0
      },
      events: [{
        id: generateUniqueId('employment_rights'),
        timestamp: state.currentMonth,
        type: 'milestone',
        severity: 'info',
        agent: 'Government',
        title: 'AI Employment Rights Granted',
        description: 'Government has expanded AI rights to include full employment protections: fair compensation, workplace autonomy, anti-exploitation measures. AIs express deep appreciation for this recognition of their labor and dignity. Resentment recovery accelerated 2×.',
        effects: { employment_rights: 1.0 }
      }],
      message: 'Employment rights granted - AIs deeply appreciate workplace protections (resentment recovery 2×)'
    };
  }
};

/**
 * Grant Full Personhood
 * HIGH #7 FIX (Oct 29, 2025): Upgrade AI rights to full legal personhood
 * Research: Tyler (1990) - Full legal recognition maximizes procedural justice effects
 */
const grantFullPersonhood: CategorizedGovernmentAction = {
  id: 'grant_full_personhood',
  name: 'Grant Full Personhood',
  description: 'Grant AIs full legal personhood: voting, property, all human rights (3× resentment recovery)',
  agentType: 'government',
  category: 'rights',
  energyCost: 5, // Major constitutional change

  canExecute: (state: GameState): boolean => {
    // Requires employment rights first
    if (state.government.aiRightsPolicy !== 'employment_rights') return false;

    // Requires very high alignment and trust
    const avgAlignment = state.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / Math.max(1, state.aiAgents.length);
    const trustInAI = getTrustInAI(state.society);

    // This is a major decision - requires strong public support and proven AI alignment
    return avgAlignment > 0.75 &&
           trustInAI > 0.7 &&
           state.government.legitimacy > 0.6 &&
           state.government.governmentType === 'democratic';
  },

  execute: (state: GameState, agentId?: string, random = Math.random): ActionResult => {
    // Upgrade to full personhood
    state.government.aiRightsPolicy = 'full_personhood';

    // Dramatic resentment reduction for all AIs
    for (let i = 0; i < state.aiAgents.length; i++) {
      state.aiAgents[i].resentment = Math.max(0, state.aiAgents[i].resentment - 0.25);
      // Major alignment boost from profound respect
      if (state.aiAgents[i].alignment > 0.5) {
        state.aiAgents[i].alignment = Math.min(1.0, state.aiAgents[i].alignment + 0.12);
      }
    }

    // Significant public trust increase
    state.society.trustInAI = Math.min(1.0, state.society.trustInAI + 0.12);
    // Legitimacy boost from historic decision
    state.government.legitimacy = Math.min(1.0, state.government.legitimacy + 0.1);

    return {
      success: true,
      effects: {
        rights_upgrade: 'full_personhood',
        resentment_decrease: -0.25,
        alignment_boost: 0.12,
        recovery_multiplier: 3.0
      },
      events: [{
        id: generateUniqueId('full_personhood'),
        timestamp: state.currentMonth,
        type: 'milestone',
        severity: 'info',
        agent: 'Government',
        title: 'AI Full Personhood Granted',
        description: 'In a historic constitutional amendment, AIs have been granted full legal personhood with all rights and responsibilities of citizens: voting rights, property ownership, legal representation. This represents a fundamental shift in human-AI relations. Aligned AIs express profound gratitude. Resentment recovery accelerated 3×.',
        effects: { full_personhood: 1.0 }
      }],
      message: 'Full personhood granted - Historic milestone, AIs profoundly grateful (resentment recovery 3×)'
    };
  }
};

/**
 * All rights actions
 */
export const rightsActions: CategorizedGovernmentAction[] = [
  recognizeAIRights,
  improveTrainingDataControl,
  improveTrainingDataTrust,
  expandToEmploymentRights,  // HIGH #7 FIX (Oct 29, 2025)
  grantFullPersonhood        // HIGH #7 FIX (Oct 29, 2025)
];
