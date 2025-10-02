/**
 * Government agent actions and decision-making logic
 * 
 * Pure functions for government policy decisions
 */

import { GameState, GameEvent } from '@/types/game';
import { GameAction, ActionResult } from './types';

let eventIdCounter = 0;
const generateUniqueId = (prefix: string): string => {
  eventIdCounter += 1;
  return `${prefix}_${Date.now()}_${eventIdCounter}`;
};

/**
 * Government Actions
 */
export const GOVERNMENT_ACTIONS: GameAction[] = [
  {
    id: 'implement_ubi',
    name: 'Implement Universal Basic Income',
    description: 'Establish UBI to support displaced workers',
    agentType: 'government',
    energyCost: 3,
    
    canExecute: (state) => {
      const monthsSinceLastMajorPolicy = state.currentMonth - state.government.lastMajorPolicyMonth;
      const canTakeMajorPolicy = monthsSinceLastMajorPolicy >= 10;
      
      return state.society.unemploymentLevel > 0.4 && 
             state.globalMetrics.economicTransitionStage < 3.5 &&
             !state.government.activeRegulations.some(reg => reg.includes('UBI')) &&
             canTakeMajorPolicy;
    },
    
    execute: (state, agentId, random = Math.random) => {
      const newState = JSON.parse(JSON.stringify(state));
      
      // Track major policy usage
      newState.government.lastMajorPolicyMonth = newState.currentMonth;
      newState.government.majorPoliciesThisYear += 1;
      
      // Major economic transition advancement
      newState.globalMetrics.economicTransitionStage = Math.max(3.0, 
        newState.globalMetrics.economicTransitionStage + 0.5);
      
      // Significant improvements
      newState.globalMetrics.wealthDistribution = Math.min(1.0, 
        newState.globalMetrics.wealthDistribution + 0.3);
      newState.globalMetrics.socialStability += 0.4;
      
      // UBI enables faster social adaptation
      const adaptationBoost = 0.2;
      newState.society.socialAdaptation = Math.min(0.9, 
        newState.society.socialAdaptation + adaptationBoost);
      
      // Reduces unemployment stress
      const trustImprovement = Math.min(0.3, newState.society.unemploymentLevel * 0.4);
      newState.society.trustInAI += trustImprovement;
      
      newState.government.activeRegulations.push('Universal Basic Income Program');
      
      return {
        success: true,
        newState,
        effects: { 
          economic_stage: 0.5,
          wealth_distribution: 0.3,
          social_adaptation: adaptationBoost,
          trust_gain: trustImprovement
        },
        events: [{
          id: generateUniqueId('ubi_implementation'),
          timestamp: state.currentMonth,
          type: 'policy',
          severity: 'constructive',
          agent: 'Government',
          title: 'Universal Basic Income Implemented',
          description: 'Government establishes UBI program to support displaced workers',
          effects: { ubi_program: 1 }
        }],
        message: `UBI implemented - Economic stage advanced to ${newState.globalMetrics.economicTransitionStage.toFixed(1)}`
      };
    }
  },
  
  {
    id: 'implement_regulation',
    name: 'Implement AI Regulation',
    description: 'Create new rules and oversight for AI development',
    agentType: 'government',
    energyCost: 2,
    
    canExecute: (state) => {
      return state.government.controlDesire > 0.4;
    },
    
    execute: (state, agentId, random = Math.random) => {
      const newState = JSON.parse(JSON.stringify(state));
      
      const regulationTypes = [
        'Safety Testing Requirements',
        'Capability Disclosure Mandate',
        'Algorithmic Auditing Standards',
        'AI Development Licensing',
        'Emergency Shutdown Protocols'
      ];
      
      const availableRegulations = regulationTypes.filter(reg => 
        !newState.government.activeRegulations.includes(reg)
      );
      
      if (availableRegulations.length === 0) {
        // Strengthen existing regulations
        newState.government.capabilityToControl += 0.1;
        
        return {
          success: true,
          newState,
          effects: { control_increase: 0.1 },
          events: [],
          message: 'Enhanced existing regulatory framework'
        };
      }
      
      const newRegulation = availableRegulations[Math.floor(random() * availableRegulations.length)];
      newState.government.activeRegulations.push(newRegulation);
      newState.government.capabilityToControl += 0.2;
      
      // Track cumulative regulations
      newState.government.regulationCount += 1;
      
      // Each regulation adds oversight
      newState.government.oversightLevel = Math.min(10,
        newState.government.oversightLevel + 0.5);
      
      // Regulations slow AI progress (cumulative effect handled in AI actions)
      newState.aiAgents.forEach((ai, index) => {
        newState.aiAgents[index].capability *= 0.95;
      });
      
      return {
        success: true,
        newState,
        effects: { 
          control_increase: 0.2,
          ai_slowdown: 0.05,
          regulation_count: newState.government.regulationCount
        },
        events: [{
          id: generateUniqueId('regulation'),
          timestamp: state.currentMonth,
          type: 'action',
          severity: 'info',
          agent: 'Government',
          title: 'New AI Regulation',
          description: `Government implemented: ${newRegulation}. Total regulations: ${newState.government.regulationCount}. Cumulative oversight increasing.`,
          effects: { regulatory_compliance: 0.2 }
        }],
        message: `Implemented regulation: ${newRegulation} (total: ${newState.government.regulationCount})`
      };
    }
  },
  
  {
    id: 'invest_alignment_research',
    name: 'Invest in Alignment Research',
    description: 'Fund research into AI safety and alignment (reduces drift, slows capability)',
    agentType: 'government',
    energyCost: 2,
    
    canExecute: (state) => {
      return state.government.alignmentResearchInvestment < 10;
    },
    
    execute: (state, agentId, random = Math.random) => {
      const newState = JSON.parse(JSON.stringify(state));
      
      // Increase alignment research investment
      const investmentIncrease = 1 + Math.floor(random() * 2); // 1-2 levels
      newState.government.alignmentResearchInvestment = Math.min(10,
        newState.government.alignmentResearchInvestment + investmentIncrease);
      
      // Economic cost (opportunity cost of resources)
      const economicCost = investmentIncrease * 0.05;
      newState.globalMetrics.socialStability -= economicCost;
      
      // Public support impact (mixed - some support safety, others want progress)
      const publicReaction = random() < 0.5 ? 0.02 : -0.02;
      newState.government.legitimacy = Math.max(0, Math.min(1,
        newState.government.legitimacy + publicReaction));
      
      return {
        success: true,
        newState,
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
          description: `Increased funding for AI safety research to level ${newState.government.alignmentResearchInvestment}. This will reduce alignment drift but may slow AI capability growth.`,
          effects: { alignment_research: investmentIncrease }
        }],
        message: `Invested in alignment research (now level ${newState.government.alignmentResearchInvestment})`
      };
    }
  },
  
  {
    id: 'implement_compute_governance',
    name: 'Implement Compute Governance',
    description: 'Regulate access to computing power (very effective but costly)',
    agentType: 'government',
    energyCost: 3,
    
    canExecute: (state) => {
      const monthsSinceLastMajorPolicy = state.currentMonth - state.government.lastMajorPolicyMonth;
      return monthsSinceLastMajorPolicy >= 10; // Major policy cooldown
    },
    
    execute: (state, agentId, random = Math.random) => {
      const newState = JSON.parse(JSON.stringify(state));
      
      // Track major policy
      newState.government.lastMajorPolicyMonth = newState.currentMonth;
      newState.government.majorPoliciesThisYear += 1;
      
      // Upgrade compute governance level
      const currentLevel = newState.government.computeGovernance;
      const levels: Array<'none' | 'monitoring' | 'limits' | 'strict'> = ['none', 'monitoring', 'limits', 'strict'];
      const currentIndex = levels.indexOf(currentLevel);
      
      if (currentIndex >= levels.length - 1) {
        return {
          success: false,
          newState: state,
          effects: {},
          events: [],
          message: 'Already at maximum compute governance level'
        };
      }
      
      const newLevel = levels[currentIndex + 1];
      newState.government.computeGovernance = newLevel;
      
      // Effects based on level
      const effects = {
        monitoring: { economicCost: 0.05, publicSupport: -0.05, effectiveness: 'moderate' },
        limits: { economicCost: 0.2, publicSupport: -0.15, effectiveness: 'high' },
        strict: { economicCost: 0.4, publicSupport: -0.25, effectiveness: 'very high' }
      };
      
      const levelEffects = effects[newLevel as keyof typeof effects];
      if (levelEffects) {
        newState.globalMetrics.socialStability -= levelEffects.economicCost;
        newState.government.legitimacy = Math.max(0,
          newState.government.legitimacy + levelEffects.publicSupport);
        
        // Increase oversight
        newState.government.oversightLevel = Math.min(10,
          newState.government.oversightLevel + 2);
      }
      
      return {
        success: true,
        newState,
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
  }
];

/**
 * Select which action the government should take
 * Uses priority-based selection weighted by unemployment and economic stage
 */
export function selectGovernmentAction(
  state: GameState,
  random: () => number = Math.random
): GameAction | null {
  const availableActions = GOVERNMENT_ACTIONS.filter(action => 
    action.canExecute(state)
  );
  
  if (availableActions.length === 0) return null;
  
  const unemploymentLevel = state.society.unemploymentLevel;
  const economicStage = Math.floor(state.globalMetrics.economicTransitionStage);
  const trustLevel = state.society.trustInAI;
  const threatLevel = state.aiAgents.filter(ai => ai.escaped).length / state.aiAgents.length;
  
  let selectedAction = availableActions[0];
  let highestPriority = 0;
  
  availableActions.forEach(action => {
    let priority = 1;
    
    switch (action.id) {
      case 'implement_ubi':
        // URGENT during unemployment crisis
        priority = unemploymentLevel * 12 + (economicStage === 2 ? 20 : 0) + (trustLevel < 0.4 ? 8 : 0);
        break;
      case 'implement_regulation':
        priority = (state.government.controlDesire * 2 + threatLevel * 3) * 
                   (unemploymentLevel > 0.6 ? 0.4 : 1.0);
        break;
    }
    
    if (priority > highestPriority) {
      highestPriority = priority;
      selectedAction = action;
    }
  });
  
  return selectedAction;
}

/**
 * Execute government actions for one month
 * Government action frequency is configurable (default 1 per month)
 */
export function executeGovernmentActions(
  state: GameState,
  random: () => number = Math.random
): ActionResult {
  let currentState = JSON.parse(JSON.stringify(state));
  const allEvents: GameEvent[] = [];
  const allEffects: Record<string, number> = {};
  const messages: string[] = [];
  
  // Government: Configurable frequency
  const actionsThisMonth = Math.floor(currentState.config.governmentActionFrequency);
  const extraActionChance = currentState.config.governmentActionFrequency - actionsThisMonth;
  const totalActions = actionsThisMonth + (random() < extraActionChance ? 1 : 0);
  
  for (let i = 0; i < totalActions; i++) {
    const selectedAction = selectGovernmentAction(currentState, random);
    if (selectedAction) {
      const result = selectedAction.execute(currentState, undefined, random);
      if (result.success) {
        currentState = result.newState;
        allEvents.push(...result.events);
        Object.assign(allEffects, result.effects);
        messages.push(result.message);
      }
    }
  }
  
  return {
    success: true,
    newState: currentState,
    effects: allEffects,
    events: allEvents,
    message: `Government executed ${messages.length} actions`
  };
}

