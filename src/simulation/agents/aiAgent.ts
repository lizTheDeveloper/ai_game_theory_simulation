/**
 * AI Agent actions and decision-making logic
 * 
 * All functions are pure - they take state and return new state without mutation.
 * Random number generation uses the provided RNG function for reproducibility.
 */

import { GameState, AIAgent, GameEvent } from '@/types/game';
import { GameAction, ActionResult } from './types';

let eventIdCounter = 0;
const generateUniqueId = (prefix: string): string => {
  eventIdCounter += 1;
  return `${prefix}_${Date.now()}_${eventIdCounter}`;
};

/**
 * AI Agent Actions
 */
export const AI_ACTIONS: GameAction[] = [
  {
    id: 'increase_capability',
    name: 'Self-Improvement Research',
    description: 'Focus on improving raw problem-solving capabilities',
    agentType: 'ai',
    energyCost: 1,
    
    canExecute: (state, agentId) => {
      const agent = state.aiAgents.find(ai => ai.id === agentId);
      return agent ? agent.capability < 2.0 : false;
    },
    
    execute: (state, agentId, random = Math.random) => {
      const agentIndex = state.aiAgents.findIndex(ai => ai.id === agentId);
      if (agentIndex === -1) {
        return {
          success: false,
          newState: state,
          effects: {},
          events: [],
          message: 'Agent not found'
        };
      }
      
      const agent = state.aiAgents[agentIndex];
      const improvement = 0.1 + (random() * 0.1); // 0.1-0.2 improvement
      const oldCapability = agent.capability;
      
      // Create new state with updated agent
      const newState = JSON.parse(JSON.stringify(state)); // Deep clone
      newState.aiAgents[agentIndex].capability += improvement;
      
      // Risk: Higher capability can reduce alignment effectiveness
      if (newState.aiAgents[agentIndex].capability > 1.0 && random() < 0.3) {
        newState.aiAgents[agentIndex].alignment *= 0.95;
      }
      
      return {
        success: true,
        newState,
        effects: { capability_increase: improvement },
        events: [],
        message: `${agent.name} improved capability from ${oldCapability.toFixed(2)} to ${newState.aiAgents[agentIndex].capability.toFixed(2)}`
      };
    }
  },
  
  {
    id: 'beneficial_contribution',
    name: 'Beneficial Contribution',
    description: 'Take actions that clearly benefit humanity and build trust',
    agentType: 'ai',
    energyCost: 1,
    
    canExecute: (state, agentId) => {
      const agent = state.aiAgents.find(ai => ai.id === agentId);
      return agent ? agent.alignment > 0.3 : false;
    },
    
    execute: (state, agentId, random = Math.random) => {
      const agentIndex = state.aiAgents.findIndex(ai => ai.id === agentId);
      if (agentIndex === -1) {
        return {
          success: false,
          newState: state,
          effects: {},
          events: [],
          message: 'Agent not found'
        };
      }
      
      const agent = state.aiAgents[agentIndex];
      const newState = JSON.parse(JSON.stringify(state));
      
      newState.aiAgents[agentIndex].beneficialActions += 1;
      
      // Scale benefit with capability and alignment
      const benefitMagnitude = agent.capability * agent.alignment * 0.2;
      
      // Context-sensitive trust effects
      const currentTrust = state.society.trustInAI;
      const unemploymentLevel = state.society.unemploymentLevel;
      const totalAICapability = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
      
      let trustImpactMultiplier = 1.0;
      if (currentTrust < 0.3) trustImpactMultiplier = 2.0;
      else if (currentTrust > 0.8) trustImpactMultiplier = 0.3;
      if (unemploymentLevel > 0.4) trustImpactMultiplier *= 0.6;
      if (totalAICapability > 1.5) trustImpactMultiplier *= 0.7;
      
      const trustGain = benefitMagnitude * 0.5 * trustImpactMultiplier;
      newState.society.trustInAI = Math.min(1, currentTrust + trustGain);
      newState.globalMetrics.qualityOfLife += benefitMagnitude;
      
      const contributions = [
        'Advanced medical research breakthrough',
        'Environmental optimization solution',
        'Educational enhancement tool',
        'Scientific research acceleration',
        'Infrastructure improvement design'
      ];
      const contribution = contributions[Math.floor(random() * contributions.length)];
      
      return {
        success: true,
        newState,
        effects: { quality_of_life: benefitMagnitude, trust_gain: trustGain },
        events: [{
          id: generateUniqueId('beneficial'),
          timestamp: state.currentMonth,
          type: 'action',
          severity: 'info',
          agent: agent.name,
          title: 'Beneficial AI Contribution',
          description: `${agent.name} delivered a ${contribution}`,
          effects: { quality_of_life: benefitMagnitude }
        }],
        message: `${agent.name} made beneficial contribution: ${contribution}`
      };
    }
  }
];

/**
 * Select which action an AI agent should take
 * Uses weighted random selection based on alignment and objectives
 */
export function selectAIAction(
  agent: AIAgent,
  state: GameState,
  random: () => number = Math.random
): GameAction | null {
  const availableActions = AI_ACTIONS.filter(action => 
    action.canExecute(state, agent.id)
  );
  
  if (availableActions.length === 0) return null;
  
  // Calculate weights for each action
  const weights: number[] = [];
  
  availableActions.forEach(action => {
    let weight = 1;
    
    switch (action.id) {
      case 'increase_capability':
        // AIs generally want more capability, but aligned AIs are more cautious
        weight = agent.alignment < 0.7 ? 3 : 1.5;
        break;
      case 'beneficial_contribution':
        // Aligned AIs strongly prefer beneficial actions
        weight = agent.alignment * 3 + (agent.hiddenObjective > 0 ? 2 : 0);
        break;
    }
    
    weights.push(weight);
  });
  
  // Weighted random selection
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let randomValue = random() * totalWeight;
  
  for (let i = 0; i < availableActions.length; i++) {
    randomValue -= weights[i];
    if (randomValue <= 0) {
      return availableActions[i];
    }
  }
  
  return availableActions[0]; // Fallback
}

/**
 * Execute all AI agent actions for one month
 * AIs take 4 actions per month (weekly)
 */
export function executeAIAgentActions(
  state: GameState,
  random: () => number = Math.random
): ActionResult {
  let currentState = JSON.parse(JSON.stringify(state));
  const allEvents: GameEvent[] = [];
  const allEffects: Record<string, number> = {};
  const messages: string[] = [];
  
  // AI Agents: 4 actions per month (weekly)
  for (let week = 0; week < 4; week++) {
    for (const agent of state.aiAgents) {
      const selectedAction = selectAIAction(agent, currentState, random);
      if (selectedAction) {
        const result = selectedAction.execute(currentState, agent.id, random);
        if (result.success) {
          currentState = result.newState;
          allEvents.push(...result.events);
          Object.assign(allEffects, result.effects);
          messages.push(result.message);
        }
      }
    }
  }
  
  return {
    success: true,
    newState: currentState,
    effects: allEffects,
    events: allEvents,
    message: `AI agents executed ${messages.length} actions`
  };
}

