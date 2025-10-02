/**
 * AI Agent actions and decision-making logic
 * 
 * All functions are pure - they take state and return new state without mutation.
 * Random number generation uses the provided RNG function for reproducibility.
 */

import { GameState, AIAgent, GameEvent } from '@/types/game';
import { GameAction, ActionResult } from './types';
import { 
  calculateAICapabilityGrowthRate,
  calculateAlignmentDrift,
  calculateComputeGovernanceEffect 
} from '../calculations';

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
      const oldCapability = agent.capability;
      
      // Use new recursive self-improvement calculation
      const growthCalc = calculateAICapabilityGrowthRate(
        agent.capability,
        agent.alignment,
        state.government.regulationCount,
        agent.developmentMode
      );
      
      // Apply compute governance effect
      const computeGovEffect = calculateComputeGovernanceEffect(
        state.government.computeGovernance,
        state.globalMetrics.economicTransitionStage
      );
      
      // Add randomness (±20%)
      const randomFactor = 0.8 + (random() * 0.4);
      const improvement = growthCalc.netGrowth * computeGovEffect.capabilitySlowdown * randomFactor;
      
      // Create new state with updated agent
      const newState = JSON.parse(JSON.stringify(state)); // Deep clone
      newState.aiAgents[agentIndex].capability += improvement;
      
      // Calculate alignment drift
      const alignmentDriftCalc = calculateAlignmentDrift(
        agent.alignment,
        agent.capability,
        agent.developmentMode,
        state.government.oversightLevel,
        state.government.alignmentResearchInvestment
      );
      
      newState.aiAgents[agentIndex].alignment = Math.max(0, agent.alignment + alignmentDriftCalc);
      
      // Generate warning event if crossing recursive improvement threshold
      const events: GameEvent[] = [];
      if (oldCapability < 1.5 && newState.aiAgents[agentIndex].capability >= 1.5) {
        events.push({
          id: generateUniqueId('recursive_threshold'),
          timestamp: state.currentMonth,
          type: 'milestone',
          severity: 'warning',
          agent: agent.name,
          title: 'Recursive Self-Improvement Threshold',
          description: `${agent.name} has reached capability level 1.5 - entering the zone of strong recursive self-improvement. Growth will now accelerate significantly.`,
          effects: { capability: improvement }
        });
      }
      
      return {
        success: true,
        newState,
        effects: { 
          capability_increase: improvement,
          recursive_multiplier: growthCalc.recursiveMultiplier,
          alignment_drift: alignmentDriftCalc
        },
        events,
        message: `${agent.name} improved capability from ${oldCapability.toFixed(2)} to ${newState.aiAgents[agentIndex].capability.toFixed(2)} (${growthCalc.recursiveMultiplier.toFixed(1)}x multiplier)`
      };
    }
  },
  
  {
    id: 'switch_development_mode',
    name: 'Switch Development Mode',
    description: 'Toggle between fast (risky) and careful (slow but safer) development',
    agentType: 'ai',
    energyCost: 0, // Free action, strategic choice
    
    canExecute: (state, agentId) => {
      return true; // Always available
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
      const oldMode = agent.developmentMode;
      const newMode = oldMode === 'fast' ? 'careful' : 'fast';
      newState.aiAgents[agentIndex].developmentMode = newMode;
      
      return {
        success: true,
        newState,
        effects: { mode_change: 1 },
        events: [{
          id: generateUniqueId('mode_switch'),
          timestamp: state.currentMonth,
          type: 'action',
          severity: 'info',
          agent: agent.name,
          title: 'Development Mode Changed',
          description: `${agent.name} switched from ${oldMode} to ${newMode} development`,
          effects: {}
        }],
        message: `${agent.name} switched to ${newMode} development mode`
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

