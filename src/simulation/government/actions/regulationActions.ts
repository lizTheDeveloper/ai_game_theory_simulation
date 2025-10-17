/**
 * Regulation government actions
 *
 * Actions related to AI regulation including:
 * - Large company regulation
 * - Compute threshold regulation
 * - Capability ceiling regulation
 * - Compute governance
 * - Research publishing restrictions
 * - Employee mobility limits
 * - Reverse engineering bans
 */

import { GameState } from '@/types/game';
import { ActionResult } from '@/simulation/agents/types';
import { CategorizedGovernmentAction } from '../core/types';
import { calculateRegulationStructuralEffects } from '@/simulation/calculations';

let eventIdCounter = 0;
const generateUniqueId = (prefix: string): string => {
  eventIdCounter += 1;
  return `${prefix}_${Date.now()}_${eventIdCounter}`;
};

/**
 * Regulate Large AI Companies
 * Popular but small labs escape
 */
const regulateLargeCompanies: CategorizedGovernmentAction = {
  id: 'regulate_large_companies',
  name: 'Regulate Large AI Companies',
  description: 'Mandate safety standards for companies with significant revenue (popular, but small labs escape)',
  agentType: 'government',
  category: 'regulation',
  energyCost: 2,

  canExecute: (state: GameState): boolean => {
    return state.government.controlDesire > 0.4 &&
           state.government.structuralChoices.regulationType === 'none';
  },

  execute: (state: GameState, agentId?: string, random = Math.random): ActionResult => {
    // Set regulation type
    state.government.structuralChoices.regulationType = 'large_companies';

    const effects = calculateRegulationStructuralEffects('large_companies', state);

    state.government.activeRegulations.push('Large Company AI Safety Standards');
    state.government.capabilityToControl += 0.2 * effects.effectivenessMultiplier;
    state.government.regulationCount += 1;
    state.government.oversightLevel = Math.min(10, state.government.oversightLevel + 0.5);

    // Legitimacy boost - popular to regulate big tech
    state.government.legitimacy = Math.min(1.0, state.government.legitimacy + 0.1);

    // Economic cost (low)
    state.globalMetrics.socialStability -= effects.enforcementCost;

    return {
      success: true,
      effects: {
        control_increase: 0.2 * effects.effectivenessMultiplier,
        legitimacy_boost: 0.1,
        racing_dynamics: effects.racingDynamicsMultiplier
      },
      events: [{
        id: generateUniqueId('regulation_large_companies'),
        timestamp: state.currentMonth,
        type: 'action',
        severity: 'info',
        agent: 'Government',
        title: 'Large Company Regulation Enacted',
        description: `Government mandates safety standards for major AI companies. Popular with public, but small labs and open source continue unchecked. Racing dynamics may intensify.`,
        effects: { regulatory_compliance: 0.2 }
      }],
      message: `Implemented large company regulation (effective but small labs escape)`
    };
  }
};

/**
 * Regulate Compute Threshold
 * Very effective but costly with surveillance risk
 */
const regulateComputeThreshold: CategorizedGovernmentAction = {
  id: 'regulate_compute_threshold',
  name: 'Regulate Compute Threshold',
  description: 'Restrict training runs above compute threshold (very effective, high cost, surveillance risk)',
  agentType: 'government',
  category: 'regulation',
  energyCost: 3,

  canExecute: (state: GameState): boolean => {
    return state.government.controlDesire > 0.5 &&
           state.government.legitimacy > 0.4 && // Need legitimacy for unpopular measure
           state.government.structuralChoices.regulationType === 'none';
  },

  execute: (state: GameState, agentId?: string, random = Math.random): ActionResult => {
    // Set regulation type
    state.government.structuralChoices.regulationType = 'compute_threshold';

    const effects = calculateRegulationStructuralEffects('compute_threshold', state);

    state.government.activeRegulations.push('Compute Threshold Monitoring');
    state.government.capabilityToControl += 0.2 * effects.effectivenessMultiplier;
    state.government.regulationCount += 1;
    state.government.oversightLevel = Math.min(10, state.government.oversightLevel + 1.0);

    // Legitimacy cost - technical and unpopular
    state.government.legitimacy = Math.max(0, state.government.legitimacy - 0.15);

    // High economic cost
    state.globalMetrics.socialStability -= effects.enforcementCost;

    // Surveillance increase from monitoring infrastructure
    state.government.structuralChoices.surveillanceLevel =
      Math.min(1.0, state.government.structuralChoices.surveillanceLevel + 0.15);

    return {
      success: true,
      effects: {
        control_increase: 0.2 * effects.effectivenessMultiplier,
        legitimacy_cost: -0.15,
        economic_cost: effects.enforcementCost,
        surveillance_increase: 0.15
      },
      events: [{
        id: generateUniqueId('regulation_compute'),
        timestamp: state.currentMonth,
        type: 'action',
        severity: 'warning',
        agent: 'Government',
        title: 'Compute Threshold Regulation Enacted',
        description: `Government restricts access to large-scale compute. Very effective at controlling AI development, but high economic costs and surveillance infrastructure concerns.`,
        effects: { regulatory_compliance: 0.28 }
      }],
      message: `Implemented compute threshold regulation (effective but costly and enables surveillance)`
    };
  }
};

/**
 * Regulate by Capability Ceiling
 * Measurement problems and black markets
 */
const regulateCapabilityCeiling: CategorizedGovernmentAction = {
  id: 'regulate_capability_ceiling',
  name: 'Regulate by Capability Ceiling',
  description: 'Ban systems above capability threshold (measurement problems, black markets)',
  agentType: 'government',
  category: 'regulation',
  energyCost: 2,

  canExecute: (state: GameState): boolean => {
    return state.government.controlDesire > 0.6 &&
           state.government.structuralChoices.regulationType === 'none';
  },

  execute: (state: GameState, agentId?: string, random = Math.random): ActionResult => {
    // Set regulation type
    state.government.structuralChoices.regulationType = 'capability_ceiling';

    const effects = calculateRegulationStructuralEffects('capability_ceiling', state);

    state.government.activeRegulations.push('AI Capability Ceiling');
    state.government.capabilityToControl += 0.2 * effects.effectivenessMultiplier;
    state.government.regulationCount += 1;
    state.government.oversightLevel = Math.min(10, state.government.oversightLevel + 0.8);

    // Legitimacy cost - enforcement challenges create cynicism
    state.government.legitimacy = Math.max(0, state.government.legitimacy - 0.08);

    // Economic cost (medium)
    state.globalMetrics.socialStability -= effects.enforcementCost;

    // High surveillance needed for enforcement
    state.government.structuralChoices.surveillanceLevel =
      Math.min(1.0, state.government.structuralChoices.surveillanceLevel + 0.2);

    return {
      success: true,
      effects: {
        control_increase: 0.2 * effects.effectivenessMultiplier,
        legitimacy_cost: -0.08,
        enforcement_challenges: 0.3,
        surveillance_increase: 0.2
      },
      events: [{
        id: generateUniqueId('regulation_capability'),
        timestamp: state.currentMonth,
        type: 'action',
        severity: 'warning',
        agent: 'Government',
        title: 'Capability Ceiling Regulation Enacted',
        description: `Government bans AI systems above capability threshold. Enforcement challenges ahead: measurement problems, black markets, and high surveillance requirements.`,
        effects: { regulatory_compliance: 0.14 }
      }],
      message: `Implemented capability ceiling regulation (enforcement challenges and surveillance risks)`
    };
  }
};

/**
 * Implement Compute Governance
 * Regulate access to computing power
 */
const implementComputeGovernance: CategorizedGovernmentAction = {
  id: 'implement_compute_governance',
  name: 'Implement Compute Governance',
  description: 'Regulate access to computing power (very effective but costly)',
  agentType: 'government',
  category: 'regulation',
  energyCost: 3,

  canExecute: (state: GameState): boolean => {
    const monthsSinceLastMajorPolicy = state.currentMonth - state.government.lastMajorPolicyMonth;
    return monthsSinceLastMajorPolicy >= 10; // Major policy cooldown
  },

  execute: (state: GameState, agentId?: string, random = Math.random): ActionResult => {
    // Track major policy
    state.government.lastMajorPolicyMonth = state.currentMonth;
    state.government.majorPoliciesThisYear += 1;

    // Upgrade compute governance level
    const currentLevel = state.government.computeGovernance;
    const levels: Array<'none' | 'monitoring' | 'limits' | 'strict'> = ['none', 'monitoring', 'limits', 'strict'];
    const currentIndex = levels.indexOf(currentLevel);

    if (currentIndex >= levels.length - 1) {
      return {
        success: false,
        effects: {},
        events: [],
        message: 'Already at maximum compute governance level'
      };
    }

    const newLevel = levels[currentIndex + 1];
    state.government.computeGovernance = newLevel;

    // Effects based on level
    const effects = {
      monitoring: { economicCost: 0.05, publicSupport: -0.05, effectiveness: 'moderate' },
      limits: { economicCost: 0.2, publicSupport: -0.15, effectiveness: 'high' },
      strict: { economicCost: 0.4, publicSupport: -0.25, effectiveness: 'very high' }
    };

    const levelEffects = effects[newLevel as keyof typeof effects];
    if (levelEffects) {
      state.globalMetrics.socialStability -= levelEffects.economicCost;
      state.government.legitimacy = Math.max(0,
        state.government.legitimacy + levelEffects.publicSupport);

      // Increase oversight
      state.government.oversightLevel = Math.min(10,
        state.government.oversightLevel + 2);
    }

    return {
      success: true,
      effects: {
        compute_governance_level: newLevel,
        economic_cost: levelEffects?.economicCost || 0
      },
      events: [{
        id: generateUniqueId('compute_governance'),
        timestamp: state.currentMonth,
        type: 'action',
        severity: 'warning',
        agent: 'Government',
        title: 'Compute Governance Implemented',
        description: `Established ${newLevel} compute governance. AI capability growth will slow significantly, but economic costs are ${levelEffects?.effectiveness || 'unknown'}. International coordination challenges ahead.`,
        effects: { compute_governance: 1 }
      }],
      message: `Implemented ${newLevel} compute governance`
    };
  }
};

/**
 * All regulation actions
 */
export const regulationActions: CategorizedGovernmentAction[] = [
  regulateLargeCompanies,
  regulateComputeThreshold,
  regulateCapabilityCeiling,
  implementComputeGovernance
];
