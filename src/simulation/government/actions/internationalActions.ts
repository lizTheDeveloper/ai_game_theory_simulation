/**
 * International and Diffusion Control government actions
 *
 * Actions related to controlling AI capability diffusion including:
 * - Research publishing restrictions
 * - Employee mobility limits (non-compete agreements)
 * - Reverse engineering bans
 *
 * Research foundation:
 * - OECD AI Principles (2024): International cooperation
 * - EU AI Act (2024): Export controls and diffusion management
 * - US CHIPS Act (2022): Technology transfer restrictions
 */

import { GameState } from '@/types/game';
import { ActionResult } from '@/simulation/agents/types';
import { CategorizedGovernmentAction } from '../core/types';

let eventIdCounter = 0;
const generateUniqueId = (prefix: string, month: number): string => {
  eventIdCounter += 1;
  return `${prefix}_${month}_${eventIdCounter}`;
};

/**
 * Restrict Research Publishing
 * Limit AI research publication to slow capability diffusion
 */
const restrictResearchPublishing: CategorizedGovernmentAction = {
  id: 'restrict_research_publishing',
  name: 'Restrict Research Publishing',
  description: 'Limit AI research publication to slow capability diffusion. Trade-off: slows spread but harms open science.',
  agentType: 'government',
  category: 'international',
  energyCost: 2,

  canExecute: (state: GameState): boolean => {
    return state.ecosystem.openResearch > 0.2 && state.government.legitimacy > 0.3;
  },

  execute: (state: GameState, random: () => number, agentId?: string): ActionResult => {
    const reduction = 0.15; // Reduce by 15%
    const oldRate = state.ecosystem.openResearch;
    state.ecosystem.openResearch = Math.max(0.1, oldRate - reduction);
    const newRate = state.ecosystem.openResearch;

    // Legitimacy cost (scientists hate this)
    state.government.legitimacy = Math.max(0.2, state.government.legitimacy - 0.05);

    // Trust in AI drops (looks like hiding things)
    state.society.trustInAI = Math.max(0.2, state.society.trustInAI - 0.03);

    return {
      success: true,
      effects: {},
      events: [{
        id: generateUniqueId('restrict_research', state.currentMonth),
        type: 'policy',
        timestamp: state.currentMonth,
        severity: 'warning',
        agent: agentId ?? 'government',
        title: 'Research Publishing Restricted',
        description: `Open research reduced from ${Math.round(oldRate*100)}% to ${Math.round(newRate*100)}%. Slows capability diffusion but harms scientific progress.`,
        effects: { openResearch: newRate, legitimacy: -0.05 }
      }],
      message: `Research publishing restricted to ${Math.round(newRate*100)}%`
    };
  }
};

/**
 * Limit Employee Mobility
 * Enforce non-compete agreements to limit researcher movement
 */
const limitEmployeeMobility: CategorizedGovernmentAction = {
  id: 'limit_employee_mobility',
  name: 'Limit Employee Mobility',
  description: 'Enforce non-compete agreements, limit researcher movement between AI labs. Slows knowledge transfer.',
  agentType: 'government',
  category: 'international',
  energyCost: 2,

  canExecute: (state: GameState): boolean => {
    return state.ecosystem.employeeMobility > 0.1 && state.government.legitimacy > 0.3;
  },

  execute: (state: GameState, random: () => number, agentId?: string): ActionResult => {
    const reduction = 0.10; // Reduce by 10%
    const oldRate = state.ecosystem.employeeMobility;
    state.ecosystem.employeeMobility = Math.max(0.05, oldRate - reduction);
    const newRate = state.ecosystem.employeeMobility;

    // Legitimacy cost (workers hate this)
    state.government.legitimacy = Math.max(0.2, state.government.legitimacy - 0.08);

    // Quality of life drops (less job freedom)
    if (state.qualityOfLifeSystems) {
      state.qualityOfLifeSystems.autonomy = Math.max(0,
        state.qualityOfLifeSystems.autonomy - 0.05
      );
    }

    return {
      success: true,
      effects: {},
      events: [{
        id: generateUniqueId('limit_mobility', state.currentMonth),
        type: 'policy',
        timestamp: state.currentMonth,
        severity: 'warning',
        agent: agentId ?? 'government',
        title: 'Employee Mobility Restricted',
        description: `Non-compete agreements enforced. Mobility reduced from ${Math.round(oldRate*100)}% to ${Math.round(newRate*100)}%. Slows diffusion but harms worker freedom.`,
        effects: { employeeMobility: newRate, legitimacy: -0.08 }
      }],
      message: `Employee mobility limited to ${Math.round(newRate*100)}%`
    };
  }
};

/**
 * Ban Reverse Engineering
 * Make it illegal to reverse-engineer AI systems
 */
const banReverseEngineering: CategorizedGovernmentAction = {
  id: 'ban_reverse_engineering',
  name: 'Ban Reverse Engineering',
  description: 'Make it illegal to reverse-engineer AI systems. Slows capability copying but hard to enforce.',
  agentType: 'government',
  category: 'international',
  energyCost: 2,

  canExecute: (state: GameState): boolean => {
    return state.ecosystem.reverseEngineering > 0.05 && state.government.legitimacy > 0.3;
  },

  execute: (state: GameState, random: () => number, agentId?: string): ActionResult => {
    const reduction = 0.08; // Reduce by 8%
    const oldRate = state.ecosystem.reverseEngineering;
    state.ecosystem.reverseEngineering = Math.max(0.02, oldRate - reduction);
    const newRate = state.ecosystem.reverseEngineering;

    // Small legitimacy cost (people understand this)
    state.government.legitimacy = Math.max(0.2, state.government.legitimacy - 0.03);

    return {
      success: true,
      effects: {},
      events: [{
        id: generateUniqueId('ban_reverse_eng', state.currentMonth),
        type: 'policy',
        timestamp: state.currentMonth,
        severity: 'warning',
        agent: agentId ?? 'government',
        title: 'Reverse Engineering Banned',
        description: `Illegal to reverse-engineer AI systems. Copying reduced from ${Math.round(oldRate*100)}% to ${Math.round(newRate*100)}%. Hard to enforce but slows diffusion.`,
        effects: { reverseEngineering: newRate }
      }],
      message: `Reverse engineering reduced to ${Math.round(newRate*100)}%`
    };
  }
};

/**
 * Invest in Governance Capacity
 * Improve institutional quality, decision-making, and democratic processes (repeatable action for scenario testing)
 *
 * Research foundation:
 * - World Bank Governance Indicators (2024): Regulatory quality, rule of law, voice & accountability
 * - Transparency International CPI (2024): Corruption perceptions
 * - IDEA Democracy Indices (2024): Electoral process, participation, civil liberties
 * - Acemoglu & Robinson (2012): Institutional capacity and economic development
 */
const investGovernanceCapacity: CategorizedGovernmentAction = {
  id: 'invest_governance_capacity',
  name: 'Invest in Governance Capacity',
  description: 'Improve institutional quality, transparency, and citizen participation. Requires resources but strengthens democratic resilience. Focus: institutions, transparency, or participation.',
  agentType: 'government',
  category: 'international',
  energyCost: 2,

  canExecute: (state: GameState): boolean => {
    // Require baseline economic resources
    const population = state.humanPopulationSystem?.population || 8.0;
    const qol = state.globalMetrics.qualityOfLife || 1.0;
    const stage = state.globalMetrics.economicTransitionStage || 1.0;
    const gdp = population * qol * (1 + stage * 0.2) * 10; // GDP in $T

    // Require at least $75T GDP (higher than research budget)
    return gdp > 75;
  },

  execute: (state: GameState, random: () => number, agentId?: string): ActionResult => {
    // Determine focus based on scenario priorities or default
    const scenarioPriorities = state.scenarioConfig?.governmentPriorities;
    let focus: 'institutions' | 'transparency' | 'participation' = 'institutions';
    let investmentStrength = 0.02; // Default investment strength

    if (scenarioPriorities?.democraticParticipation !== undefined) {
      const priority = scenarioPriorities.democraticParticipation;
      investmentStrength = 0.01 + priority * 0.04; // Up to 0.05 at max priority

      // Focus on participation at high priority
      if (priority >= 0.7) {
        focus = 'participation';
      } else if (priority >= 0.4) {
        focus = 'transparency';
      } else {
        focus = 'institutions';
      }
    }

    // Update governance quality based on focus
    const oldCapacity = state.government.governanceQuality.institutionalCapacity;
    const oldTransparency = state.government.governanceQuality.transparency;
    const oldParticipation = state.government.governanceQuality.participationRate;

    if (focus === 'institutions') {
      state.government.governanceQuality.institutionalCapacity = Math.min(
        1.0,
        state.government.governanceQuality.institutionalCapacity + investmentStrength
      );
      state.government.governanceQuality.decisionQuality = Math.min(
        1.0,
        state.government.governanceQuality.decisionQuality + investmentStrength * 0.5
      );
    } else if (focus === 'transparency') {
      state.government.governanceQuality.transparency = Math.min(
        1.0,
        state.government.governanceQuality.transparency + investmentStrength * 1.5
      );
      state.government.governanceQuality.decisionQuality = Math.min(
        1.0,
        state.government.governanceQuality.decisionQuality + investmentStrength * 0.3
      );
    } else if (focus === 'participation') {
      state.government.governanceQuality.participationRate = Math.min(
        1.0,
        state.government.governanceQuality.participationRate + investmentStrength * 1.25
      );
      state.government.governanceQuality.consensusBuildingEfficiency = Math.min(
        1.0,
        state.government.governanceQuality.consensusBuildingEfficiency + investmentStrength * 0.8
      );
    }

    // Legitimacy boost (good governance is popular)
    state.government.legitimacy = Math.min(
      1.0,
      state.government.legitimacy + investmentStrength * 0.5
    );

    // Trust improvement (better governance → more trust)
    state.society.trustInAI = Math.min(
      1.0,
      state.society.trustInAI + investmentStrength * 0.3
    );

    return {
      success: true,
      effects: {
        investmentStrength: investmentStrength
      },
      events: [{
        id: `governance_invest_${state.currentMonth}_${Math.floor(random() * 1000000)}`,
        type: 'policy',
        timestamp: state.currentMonth,
        severity: 'constructive',
        agent: 'Government',
        title: 'Governance Capacity Investment',
        description: `Government invested in ${focus}. Capacity: ${oldCapacity.toFixed(2)} → ${state.government.governanceQuality.institutionalCapacity.toFixed(2)}, Transparency: ${oldTransparency.toFixed(2)} → ${state.government.governanceQuality.transparency.toFixed(2)}, Participation: ${oldParticipation.toFixed(2)} → ${state.government.governanceQuality.participationRate.toFixed(2)}`,
        effects: { governanceQuality: investmentStrength }
      }],
      message: `🏛️ Governance investment (${focus}): capacity ${state.government.governanceQuality.institutionalCapacity.toFixed(2)}, transparency ${state.government.governanceQuality.transparency.toFixed(2)}, participation ${state.government.governanceQuality.participationRate.toFixed(2)}`
    };
  }
};

/**
 * All international actions
 */
export const internationalActions: CategorizedGovernmentAction[] = [
  restrictResearchPublishing,
  limitEmployeeMobility,
  banReverseEngineering,
  investGovernanceCapacity
];
