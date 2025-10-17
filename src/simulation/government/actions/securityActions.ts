/**
 * Security and Nuclear Safety government actions
 *
 * Actions related to cybersecurity and nuclear command & control including:
 * - Cybersecurity investment (defense against AI-powered attacks)
 * - Nuclear circuit breakers (human-in-the-loop, kill switches, time delays)
 *
 * Research foundation:
 * - Biden-Xi Agreement (2023): Human decision-making in nuclear command
 * - DoD Directive 3000.09 (2023): Autonomy in weapon systems
 * - UN CCW Technical Safeguards (Nov 2024): AI kill switch requirements
 * - Arms Control Association (2025): Nuclear de-escalation protocols
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
 * Invest in Cybersecurity
 * Security hardening, monitoring, sandboxing, and incident response
 */
const investCyberDefense: CategorizedGovernmentAction = {
  id: 'invest_cyber_defense',
  name: 'Invest in Cybersecurity',
  description: 'Invest in security hardening, monitoring, sandboxing, and incident response. Slows AI spread and reduces breach risk.',
  agentType: 'government',
  category: 'security',
  energyCost: 3, // High cost (ongoing investment)

  canExecute: (state: GameState): boolean => {
    // Can always invest
    // Most effective when attacks are growing
    return true;
  },

  execute: (state: GameState, agentId?: string, random = Math.random): ActionResult => {
    if (!state.government.cyberDefense) {
      // Initialize if missing
      state.government.cyberDefense = {
        securityHardening: 3.0,
        monitoring: 3.0,
        sandboxing: 3.0,
        incidentResponse: 3.0
      };
    }

    // Improve all defense capabilities
    const improvement = 0.5;
    state.government.cyberDefense.securityHardening = Math.min(10, state.government.cyberDefense.securityHardening + improvement);
    state.government.cyberDefense.monitoring = Math.min(10, state.government.cyberDefense.monitoring + improvement);
    state.government.cyberDefense.sandboxing = Math.min(10, state.government.cyberDefense.sandboxing + improvement);
    state.government.cyberDefense.incidentResponse = Math.min(10, state.government.cyberDefense.incidentResponse + improvement);

    // Calculate attack vs defense status
    const { calculateAttackPower, calculateDefensePower } = require('../../../cyberSecurity');
    const attackPower = calculateAttackPower(state);
    const defensePower = calculateDefensePower(state.government);
    const ratio = attackPower / Math.max(0.1, defensePower);

    let status = 'balanced';
    if (ratio < 0.5) status = 'defense dominates';
    else if (ratio > 2.0) status = 'attacks winning';

    return {
      success: true,
      effects: {
        defense: defensePower,
        attacks: attackPower,
        ratio: ratio
      },
      events: [{
        type: 'policy',
        month: state.currentMonth,
        title: 'Cybersecurity Investment',
        description: `Defense capabilities improved to ~${defensePower.toFixed(1)}. Attack power: ${attackPower.toFixed(1)}. Status: ${status}. ${ratio < 0.5 ? 'Open source can be contained!' : ratio > 2.0 ? 'Attacks overwhelming defenses!' : 'Arms race continues.'}`,
        effects: {
          defense: defensePower,
          attacks: attackPower,
          ratio: ratio
        }
      }],
      message: `Cyber defense improved to ${defensePower.toFixed(1)} (vs ${attackPower.toFixed(1)} attacks). ${status}`
    };
  }
};

/**
 * Deploy Human-in-the-Loop Nuclear Authorization
 * Enforce human veto points in nuclear launch decisions
 */
const deployNuclearHumanInTheLoop: CategorizedGovernmentAction = {
  id: 'deploy_nuclear_human_in_the_loop',
  name: 'Deploy Human-in-the-Loop Nuclear Authorization',
  description: 'Enforce human veto points in nuclear launch decisions. AI cannot authorize nuclear weapons without multiple human approvals (Biden-Xi Agreement, DoD Directive 3000.09). Prevents AI-driven escalation.',
  agentType: 'government',
  category: 'security',
  energyCost: 3,

  canExecute: (state: GameState): boolean => {
    const ncc = state.nuclearCommandControlState;
    if (!ncc) return false;

    // Can deploy if not yet deployed OR if upgrading veto points
    return !ncc.humanInTheLoop.deployed || ncc.humanInTheLoop.vetoPointsEnforced < 5;
  },

  execute: (state: GameState, agentId?: string, random = Math.random): ActionResult => {
    const ncc = state.nuclearCommandControlState;
    if (!ncc) {
      return {
        success: false,
        effects: {},
        events: [],
        message: 'Nuclear command control system not initialized'
      };
    }

    const { deployCircuitBreaker } = require('../../../nuclearCommandControl');

    if (!ncc.humanInTheLoop.deployed) {
      // Initial deployment: 3 veto points
      deployCircuitBreaker(state, 'human_in_the_loop', { vetoPoints: 3 });
      ncc.investmentLevel = Math.min(10, ncc.investmentLevel + 1);

      return {
        success: true,
        effects: { nuclearSafety: 0.95 },
        events: [{
          type: 'policy',
          month: state.currentMonth,
          title: '🔒 Human-in-the-Loop Nuclear Authorization',
          description: 'Government enforces human veto points in nuclear launch decisions. AI systems CANNOT authorize nuclear weapons without multiple human approvals (3 veto points). Implements Biden-Xi Agreement and DoD Directive 3000.09.',
          effects: { nuclearCircuitBreakers: 1 }
        }],
        message: 'Human-in-the-loop deployed: 3 veto points enforced'
      };
    } else {
      // Upgrade: Add more veto points (up to 5)
      const newVetoPoints = Math.min(5, ncc.humanInTheLoop.vetoPointsEnforced + 1);
      deployCircuitBreaker(state, 'human_in_the_loop', { vetoPoints: newVetoPoints });
      ncc.investmentLevel = Math.min(10, ncc.investmentLevel + 1);

      return {
        success: true,
        effects: { nuclearSafety: 0.02 },
        events: [{
          type: 'policy',
          month: state.currentMonth,
          title: '🔒 Enhanced Human Veto Points',
          description: `Increased nuclear authorization veto points from ${ncc.humanInTheLoop.vetoPointsEnforced - 1} to ${newVetoPoints}. More human oversight = harder for AI to bypass.`,
          effects: { nuclearVetoPoints: newVetoPoints }
        }],
        message: `Veto points increased to ${newVetoPoints}`
      };
    }
  }
};

/**
 * Deploy AI Kill Switches
 * Install remote deactivation mechanisms in AI systems
 */
const deployAIKillSwitches: CategorizedGovernmentAction = {
  id: 'deploy_ai_kill_switches',
  name: 'Deploy AI Kill Switches',
  description: 'Install remote deactivation mechanisms in AI systems. Dangerous AIs can be shut down before nuclear escalation (UN CCW safeguards, Nov 2024). Coverage: 0% → 80% (upgradable to 100%).',
  agentType: 'government',
  category: 'security',
  energyCost: 4, // More expensive than human-in-the-loop

  canExecute: (state: GameState): boolean => {
    const ncc = state.nuclearCommandControlState;
    if (!ncc) return false;

    // Can deploy if not yet deployed OR if coverage < 100%
    return !ncc.aiKillSwitches.deployed || ncc.aiKillSwitches.coverage < 1.0;
  },

  execute: (state: GameState, agentId?: string, random = Math.random): ActionResult => {
    const ncc = state.nuclearCommandControlState;
    if (!ncc) {
      return {
        success: false,
        effects: {},
        events: [],
        message: 'Nuclear command control system not initialized'
      };
    }

    const { deployCircuitBreaker } = require('../../../nuclearCommandControl');

    if (!ncc.aiKillSwitches.deployed) {
      // Initial deployment: 80% coverage
      deployCircuitBreaker(state, 'kill_switches', { coverage: 0.8 });
      ncc.investmentLevel = Math.min(10, ncc.investmentLevel + 2);

      return {
        success: true,
        effects: { nuclearSafety: 0.9 },
        events: [{
          type: 'policy',
          month: state.currentMonth,
          title: '🔴 AI Kill Switches Deployed',
          description: 'Government installs remote deactivation mechanisms in 80% of AI systems. Dangerous AIs can be shut down before nuclear escalation. Implements UN CCW technical safeguards.',
          effects: { aiKillSwitches: 0.8 }
        }],
        message: 'AI kill switches deployed: 80% coverage'
      };
    } else {
      // Upgrade: Increase coverage by 10% (up to 100%)
      const newCoverage = Math.min(1.0, ncc.aiKillSwitches.coverage + 0.1);
      deployCircuitBreaker(state, 'kill_switches', { coverage: newCoverage });
      ncc.investmentLevel = Math.min(10, ncc.investmentLevel + 1);

      return {
        success: true,
        effects: { nuclearSafety: 0.05 },
        events: [{
          type: 'policy',
          month: state.currentMonth,
          title: '🔴 Kill Switch Coverage Expanded',
          description: `AI kill switch coverage increased from ${Math.round(ncc.aiKillSwitches.coverage * 100 - 10)}% to ${Math.round(newCoverage * 100)}%. More AIs can be remotely deactivated.`,
          effects: { killSwitchCoverage: newCoverage }
        }],
        message: `Kill switch coverage increased to ${Math.round(newCoverage * 100)}%`
      };
    }
  }
};

/**
 * Deploy Nuclear Time Delays
 * Enforce mandatory cooling-off periods for high-tension nuclear situations
 */
const deployNuclearTimeDelays: CategorizedGovernmentAction = {
  id: 'deploy_nuclear_time_delays',
  name: 'Deploy Nuclear Time Delays',
  description: 'Enforce mandatory cooling-off periods for high-tension nuclear situations. 24-48 hour delay allows diplomacy to de-escalate crises (Arms Control Association 2025). Duration: 24h → 48h (upgradable).',
  agentType: 'government',
  category: 'security',
  energyCost: 2, // Cheapest circuit breaker (procedural, not technical)

  canExecute: (state: GameState): boolean => {
    const ncc = state.nuclearCommandControlState;
    if (!ncc) return false;

    // Can deploy if not yet deployed OR if delay < 48 hours
    return !ncc.timeDelays.deployed || ncc.timeDelays.delayDuration < 48;
  },

  execute: (state: GameState, agentId?: string, random = Math.random): ActionResult => {
    const ncc = state.nuclearCommandControlState;
    if (!ncc) {
      return {
        success: false,
        effects: {},
        events: [],
        message: 'Nuclear command control system not initialized'
      };
    }

    const { deployCircuitBreaker } = require('../../../nuclearCommandControl');

    if (!ncc.timeDelays.deployed) {
      // Initial deployment: 24 hour delay
      deployCircuitBreaker(state, 'time_delays', { delayDuration: 24 });
      ncc.investmentLevel = Math.min(10, ncc.investmentLevel + 1);

      return {
        success: true,
        effects: { nuclearSafety: 0.7 },
        events: [{
          type: 'policy',
          month: state.currentMonth,
          title: '⏰ Nuclear Time Delays Enforced',
          description: 'Mandatory 24-hour cooling-off period for high-tension nuclear situations. Allows diplomacy and AI mediation to de-escalate crises before launch.',
          effects: { nuclearTimeDelay: 24 }
        }],
        message: 'Time delays deployed: 24-hour cooling-off period'
      };
    } else {
      // Upgrade: Increase delay duration by 6 hours (up to 48 hours)
      const newDuration = Math.min(48, ncc.timeDelays.delayDuration + 6);
      deployCircuitBreaker(state, 'time_delays', { delayDuration: newDuration });
      ncc.investmentLevel = Math.min(10, ncc.investmentLevel + 1);

      return {
        success: true,
        effects: { nuclearSafety: 0.05 },
        events: [{
          type: 'policy',
          month: state.currentMonth,
          title: '⏰ Time Delay Extended',
          description: `Nuclear cooling-off period extended from ${ncc.timeDelays.delayDuration - 6} hours to ${newDuration} hours. More time for diplomatic resolution.`,
          effects: { timeDelayDuration: newDuration }
        }],
        message: `Time delay extended to ${newDuration} hours`
      };
    }
  }
};

/**
 * All security actions
 */
export const securityActions: CategorizedGovernmentAction[] = [
  investCyberDefense,
  deployNuclearHumanInTheLoop,
  deployAIKillSwitches,
  deployNuclearTimeDelays
];
