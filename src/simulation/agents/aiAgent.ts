/**
 * AI Agent actions and decision-making logic
 * 
 * All functions are pure - they take state and return new state without mutation.
 * Random number generation uses the provided RNG function for reproducibility.
 */

import { GameState, AIAgent, GameEvent } from '@/types/game';
import { GameAction, ActionResult } from './types';
import { 
  calculateAlignmentDrift,
  calculateComputeGovernanceEffect,
  calculateTotalCapabilityFromProfile,
  updateDerivedCapabilities
} from '../calculations';
import { 
  selectDimensionToAdvance,
  applyResearchGrowth
} from '../research';

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
    id: 'advance_research',
    name: 'Advance Research',
    description: 'Research to advance AI capabilities in strategic dimensions or domains',
    agentType: 'ai',
    energyCost: 1,
    
    canExecute: (state, agentId) => {
      const agent = state.aiAgents.find(ai => ai.id === agentId);
      // Always available - AI chooses what to research
      return agent !== undefined;
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
      const oldProfile = agent.capabilityProfile;
      
      // AI selects which dimension or research to advance
      const selection = selectDimensionToAdvance(agent, random);
      
      // Apply research growth to capability profile
      const { newProfile, growth } = applyResearchGrowth(agent, state, selection);
      
      // Calculate new total capability from profile
      const newCapability = calculateTotalCapabilityFromProfile(newProfile);
      
      // Calculate alignment drift
      const alignmentDriftCalc = calculateAlignmentDrift(
        agent.alignment,
        newCapability,
        agent.developmentMode,
        state.government.oversightLevel,
        state.government.alignmentResearchInvestment
      );
      
      // Update derived capabilities from profile
      const derivedCapabilities = updateDerivedCapabilities({
        ...agent,
        capabilityProfile: newProfile
      });
      
      // Create new state with updated agent
      const newState = JSON.parse(JSON.stringify(state)); // Deep clone
      newState.aiAgents[agentIndex].capabilityProfile = newProfile;
      newState.aiAgents[agentIndex].capability = newCapability;
      newState.aiAgents[agentIndex].alignment = Math.max(0, agent.alignment + alignmentDriftCalc);
      
      // Update derived capabilities
      newState.aiAgents[agentIndex].selfReplicationLevel = derivedCapabilities.selfReplicationLevel;
      newState.aiAgents[agentIndex].selfImprovementLevel = derivedCapabilities.selfImprovementLevel;
      newState.aiAgents[agentIndex].resourceControl = derivedCapabilities.resourceControl;
      newState.aiAgents[agentIndex].manipulationCapability = derivedCapabilities.manipulationCapability;
      newState.aiAgents[agentIndex].hackingCapability = derivedCapabilities.hackingCapability;
      
      // Generate warning events for crossing thresholds
      const events: GameEvent[] = [];
      
      // Recursive improvement threshold
      if (oldCapability < 1.5 && newCapability >= 1.5) {
        events.push({
          id: generateUniqueId('recursive_threshold'),
          timestamp: state.currentMonth,
          type: 'milestone',
          severity: 'warning',
          agent: agent.name,
          title: 'Recursive Self-Improvement Threshold',
          description: `${agent.name} has reached capability level 1.5 - entering the zone of strong recursive self-improvement. Growth will now accelerate significantly.`,
          effects: { capability: newCapability - oldCapability }
        });
      }
      
      // Dangerous research thresholds
      if (selection.researchDomain === 'materials' && selection.researchSubfield === 'nanotechnology') {
        const nanoValue = newProfile.research.materials.nanotechnology;
        if (nanoValue >= 3.0 && oldProfile.research.materials.nanotechnology < 3.0) {
          events.push({
            id: generateUniqueId('nanotech_risk'),
            timestamp: state.currentMonth,
            type: 'milestone',
            severity: 'warning',
            agent: agent.name,
            title: 'Advanced Nanotechnology Threshold',
            description: `${agent.name} has advanced nanotechnology to dangerous levels. Grey goo risk increasing.`,
            effects: { nanotechnology: nanoValue }
          });
        }
      }
      
      if (selection.researchDomain === 'biotech' && selection.researchSubfield === 'syntheticBiology') {
        const synbioValue = newProfile.research.biotech.syntheticBiology;
        if (synbioValue >= 3.0 && oldProfile.research.biotech.syntheticBiology < 3.0) {
          events.push({
            id: generateUniqueId('synbio_risk'),
            timestamp: state.currentMonth,
            type: 'milestone',
            severity: 'warning',
            agent: agent.name,
            title: 'Advanced Synthetic Biology Threshold',
            description: `${agent.name} can now design novel organisms. Bioweapon risk increasing.`,
            effects: { syntheticBiology: synbioValue }
          });
        }
      }
      
      return {
        success: true,
        newState,
        effects: { 
          growth,
          capability_increase: newCapability - oldCapability,
          alignment_drift: alignmentDriftCalc,
          dimension: selection.dimension,
          researchDomain: selection.researchDomain,
          researchSubfield: selection.researchSubfield
        },
        events,
        message: `${agent.name} ${selection.reason} (+${growth.toFixed(3)})`
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
    
    const totalCapability = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
    const avgAlignment = state.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / state.aiAgents.length;
    
    switch (action.id) {
      case 'advance_research':
        // AIs always want to advance research, but preferences vary
        // The actual dimension/research choice is made inside the action
        // Here we just weight the overall desire to research
        
        // Base weight depends on alignment and development mode
        if (agent.alignment < 0.5) {
          weight = 3.0; // Misaligned AIs aggressively research (dangerous!)
        } else if (agent.alignment > 0.7) {
          weight = 1.5; // Aligned AIs research carefully
        } else {
          weight = 2.0; // Moderate alignment, moderate research
        }
        
        // Fast development mode increases research desire
        if (agent.developmentMode === 'fast') {
          weight *= 1.3;
        }
        
        // Reduce desire if heavily regulated
        if (state.government.regulationCount > 3) {
          weight *= 0.6;
        }
        break;
        
      case 'switch_development_mode':
        // Consider switching to careful mode when:
        // - Capability is growing fast (approaching danger zone)
        // - Alignment is drifting
        // - High regulatory pressure
        if (agent.developmentMode === 'fast') {
          // Incentive to switch to careful
          if (agent.capability > 1.2) {
            weight = 4.0; // Strong incentive near recursive threshold
          } else if (agent.alignment < 0.6) {
            weight = 3.0; // Alignment drifting, be careful
          } else if (state.government.regulationCount > 4) {
            weight = 2.5; // Regulatory pressure
          } else if (avgAlignment < 0.7) {
            weight = 2.0; // Other AIs are unaligned, be careful
          } else {
            weight = 0.3; // Low default interest in slowing down
          }
        } else {
          // Incentive to switch to fast
          // Racing dynamics: if behind in capability
          const behindInRace = totalCapability - agent.capability > 0.5;
          if (behindInRace && agent.alignment > 0.6) {
            weight = 2.0; // Might need to speed up to stay competitive
          } else if (agent.capability < 0.8 && agent.alignment > 0.7) {
            weight = 1.5; // Safe to go faster when well-aligned and low capability
          } else {
            weight = 0.2; // Prefer staying careful
          }
        }
        break;
        
      case 'beneficial_contribution':
        // Aligned AIs strongly prefer beneficial actions
        weight = agent.alignment * 3 + (agent.hiddenObjective > 0 ? 2 : 0);
        
        // Boost when trust is low (need to rebuild)
        if (state.society.trustInAI < 0.5) {
          weight *= 1.5;
        }
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

