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
const generateUniqueId = (prefix: string): string => {
  eventIdCounter += 1;
  return `${prefix}_${Date.now()}_${eventIdCounter}`;
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

  execute: (state: GameState, agentId?: string, random = Math.random): ActionResult => {
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
        type: 'policy',
        month: state.currentMonth,
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

  execute: (state: GameState, agentId?: string, random = Math.random): ActionResult => {
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
        type: 'policy',
        month: state.currentMonth,
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

  execute: (state: GameState, agentId?: string, random = Math.random): ActionResult => {
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
        type: 'policy',
        month: state.currentMonth,
        title: 'Reverse Engineering Banned',
        description: `Illegal to reverse-engineer AI systems. Copying reduced from ${Math.round(oldRate*100)}% to ${Math.round(newRate*100)}%. Hard to enforce but slows diffusion.`,
        effects: { reverseEngineering: newRate }
      }],
      message: `Reverse engineering reduced to ${Math.round(newRate*100)}%`
    };
  }
};

/**
 * All international actions
 */
export const internationalActions: CategorizedGovernmentAction[] = [
  restrictResearchPublishing,
  limitEmployeeMobility,
  banReverseEngineering
];
