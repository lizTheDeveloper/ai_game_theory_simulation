/**
 * AI Safety government actions
 *
 * Actions related to AI safety and alignment including:
 * - Alignment research investment
 * - Compute governance
 * - Alignment testing evaluation
 * - Red teaming for adversarial testing
 * - Interpretability research
 * - Evaluation frequency
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
 * Invest in Alignment Research
 * Fund research into AI safety and alignment (reduces drift, slows capability)
 */
const investAlignmentResearch: CategorizedGovernmentAction = {
  id: 'invest_alignment_research',
  name: 'Invest in Alignment Research',
  description: 'Fund research into AI safety and alignment (reduces drift, slows capability)',
  agentType: 'government',
  category: 'safety',
  energyCost: 2,

  canExecute: (state: GameState): boolean => {
    return state.government.alignmentResearchInvestment < 10;
  },

  execute: (state: GameState, agentId?: string, random = Math.random): ActionResult => {
    // Increase alignment research investment
    const investmentIncrease = 1 + Math.floor(random() * 2); // 1-2 levels
    state.government.alignmentResearchInvestment = Math.min(10,
      state.government.alignmentResearchInvestment + investmentIncrease);

    // Economic cost (opportunity cost of resources)
    const economicCost = investmentIncrease * 0.05;
    state.globalMetrics.socialStability -= economicCost;

    // Public support impact (mixed - some support safety, others want progress)
    const publicReaction = random() < 0.5 ? 0.02 : -0.02;
    state.government.legitimacy = Math.max(0, Math.min(1,
      state.government.legitimacy + publicReaction));

    return {
      success: true,
      effects: {
        alignment_research_investment: investmentIncrease,
        economic_cost: economicCost
      },
      events: [{
        id: generateUniqueId('alignment_research'),
        timestamp: state.currentMonth,
        type: 'action',
        severity: 'info',
        agent: 'Government',
        title: 'Alignment Research Investment',
        description: `Increased funding for AI safety research to level ${state.government.alignmentResearchInvestment}. This will reduce alignment drift but may slow AI capability growth.`,
        effects: { alignment_research: investmentIncrease }
      }],
      message: `Invested in alignment research (now level ${state.government.alignmentResearchInvestment})`
    };
  }
};

/**
 * Implement Compute Governance
 * Regulate access to computing power (very effective but costly)
 */
const implementComputeGovernance: CategorizedGovernmentAction = {
  id: 'implement_compute_governance',
  name: 'Implement Compute Governance',
  description: 'Regulate access to computing power (very effective but costly)',
  agentType: 'government',
  category: 'safety',
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
 * Invest in Alignment Evaluation
 * Develop tests to measure AI alignment with human values
 */
const investAlignmentTests: CategorizedGovernmentAction = {
  id: 'invest_alignment_tests',
  name: 'Invest in Alignment Evaluation',
  description: 'Develop tests to measure AI alignment with human values. Very difficult but critical for safety.',
  agentType: 'government',
  category: 'safety',
  energyCost: 2,

  canExecute: (state: GameState): boolean => {
    return state.government.evaluationInvestment.alignmentTests < 10;
  },

  execute: (state: GameState, agentId?: string, random = Math.random): ActionResult => {
    const improvement = 0.8; // Harder to improve than capability benchmarks
    const oldLevel = state.government.evaluationInvestment.alignmentTests;
    state.government.evaluationInvestment.alignmentTests = Math.min(10, oldLevel + improvement);
    const newLevel = state.government.evaluationInvestment.alignmentTests;

    return {
      success: true,
      effects: {},
      events: [{
        type: 'policy',
        month: state.currentMonth,
        title: 'Alignment Tests Improved',
        description: `Alignment evaluation quality improved from ${oldLevel.toFixed(1)} to ${newLevel.toFixed(1)}/10. Better detection of misaligned AIs.`,
        effects: { alignmentTestQuality: newLevel }
      }],
      message: `Alignment tests improved to ${newLevel.toFixed(1)}/10`
    };
  }
};

/**
 * Invest in Red Teaming
 * Fund adversarial testing to detect gaming, sandbagging, and deception
 */
const investRedTeaming: CategorizedGovernmentAction = {
  id: 'invest_red_teaming',
  name: 'Invest in Red Teaming',
  description: 'Fund adversarial testing to detect gaming, sandbagging, and deception. Critical for detecting sleeper agents.',
  agentType: 'government',
  category: 'safety',
  energyCost: 3, // More expensive - requires skilled adversaries

  canExecute: (state: GameState): boolean => {
    return state.government.evaluationInvestment.redTeaming < 10;
  },

  execute: (state: GameState, agentId?: string, random = Math.random): ActionResult => {
    const improvement = 1.0;
    const oldLevel = state.government.evaluationInvestment.redTeaming;
    state.government.evaluationInvestment.redTeaming = Math.min(10, oldLevel + improvement);
    const newLevel = state.government.evaluationInvestment.redTeaming;

    // Red teaming significantly increases detection of deception
    const detectionBonus = improvement * 0.05; // 5% better detection per level

    return {
      success: true,
      effects: {},
      events: [{
        type: 'policy',
        month: state.currentMonth,
        title: 'Red Teaming Enhanced',
        description: `Red teaming capability improved from ${oldLevel.toFixed(1)} to ${newLevel.toFixed(1)}/10. ${Math.round(detectionBonus*100)}% better at detecting gaming and sandbagging.`,
        effects: { redTeamingQuality: newLevel, detectionBonus }
      }],
      message: `Red teaming improved to ${newLevel.toFixed(1)}/10 (+${Math.round(detectionBonus*100)}% detection)`
    };
  }
};

/**
 * Invest in AI Interpretability Research
 * Research to understand AI internals and true intentions
 */
const investInterpretability: CategorizedGovernmentAction = {
  id: 'invest_interpretability',
  name: 'Invest in AI Interpretability Research',
  description: 'Research to understand AI internals and true intentions. Can see through deception and detect hidden capabilities.',
  agentType: 'government',
  category: 'safety',
  energyCost: 4, // Very expensive - cutting-edge research

  canExecute: (state: GameState): boolean => {
    return state.government.evaluationInvestment.interpretability < 10;
  },

  execute: (state: GameState, agentId?: string, random = Math.random): ActionResult => {
    const improvement = 0.6; // Slowest to improve - very hard problem
    const oldLevel = state.government.evaluationInvestment.interpretability;
    state.government.evaluationInvestment.interpretability = Math.min(10, oldLevel + improvement);
    const newLevel = state.government.evaluationInvestment.interpretability;

    // Interpretability breakthrough message at high levels
    let breakthroughMessage = '';
    if (newLevel >= 7 && oldLevel < 7) {
      breakthroughMessage = ' 🎯 BREAKTHROUGH: Can now partially detect internal misalignment!';
    }

    return {
      success: true,
      effects: {},
      events: [{
        type: 'policy',
        month: state.currentMonth,
        title: 'Interpretability Research Advanced',
        description: `AI interpretability improved from ${oldLevel.toFixed(1)} to ${newLevel.toFixed(1)}/10. Better understanding of AI internals and true motivations.${breakthroughMessage}`,
        effects: { interpretabilityQuality: newLevel }
      }],
      message: `Interpretability improved to ${newLevel.toFixed(1)}/10${breakthroughMessage}`
    };
  }
};

/**
 * Increase Evaluation Frequency
 * Run evaluations more frequently to catch dangerous AIs earlier
 */
const increaseEvaluationFrequency: CategorizedGovernmentAction = {
  id: 'increase_evaluation_frequency',
  name: 'Increase Evaluation Frequency',
  description: 'Run evaluations more frequently. Catch dangerous AIs earlier but costs more resources.',
  agentType: 'government',
  category: 'safety',
  energyCost: 2,

  canExecute: (state: GameState): boolean => {
    return state.government.evaluationFrequency < 0.9;
  },

  execute: (state: GameState, agentId?: string, random = Math.random): ActionResult => {
    const increase = 0.1; // Increase by 10%
    const oldFreq = state.government.evaluationFrequency;
    state.government.evaluationFrequency = Math.min(1.0, oldFreq + increase);
    const newFreq = state.government.evaluationFrequency;

    return {
      success: true,
      effects: {},
      events: [{
        type: 'policy',
        month: state.currentMonth,
        title: 'Evaluation Frequency Increased',
        description: `Now evaluating ${Math.round(newFreq*100)}% of AIs per month (was ${Math.round(oldFreq*100)}%). Earlier detection but higher cost.`,
        effects: { evaluationFrequency: newFreq }
      }],
      message: `Evaluation frequency increased to ${Math.round(newFreq*100)}%`
    };
  }
};

/**
 * All safety actions
 */
export const safetyActions: CategorizedGovernmentAction[] = [
  investAlignmentResearch,
  implementComputeGovernance,
  investAlignmentTests,
  investRedTeaming,
  investInterpretability,
  increaseEvaluationFrequency
];
