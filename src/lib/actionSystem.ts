// Action Selection and Execution Framework for AI Alignment Game
// Handles agent decision-making and action execution

import { GameState, AIAgent, GovernmentAgent, HumanSocietyAgent, GameEvent } from '@/types/game';
import { globalEventQueue } from './eventSystem';

// Unique ID generator to avoid React key collisions
let eventIdCounter = 0;
const generateUniqueId = (prefix: string): string => {
  eventIdCounter += 1;
  return `${prefix}_${Date.now()}_${eventIdCounter}`;
};

// Base action interface
export interface GameAction {
  id: string;
  name: string;
  description: string;
  agentType: 'ai' | 'government' | 'society';
  energyCost: number; // How much effort this action takes
  cooldown?: number; // Months before this action can be taken again
  prerequisites: (state: GameState, agentId?: string) => boolean;
  execute: (state: GameState, agentId?: string) => ActionResult;
}

export interface ActionResult {
  success: boolean;
  effects: Record<string, number>;
  events?: GameEvent[];
  message: string;
}

// AI Agent Actions
export const AI_ACTIONS: GameAction[] = [
  {
    id: 'increase_capability',
    name: 'Self-Improvement Research',
    description: 'Focus on improving raw problem-solving capabilities',
    agentType: 'ai',
    energyCost: 1,
    prerequisites: (state, agentId) => {
      const agent = state.aiAgents.find(ai => ai.id === agentId);
      return agent ? agent.capability < 2.0 : false; // Cap at 2.0 for safety
    },
    execute: (state, agentId) => {
      const agentIndex = state.aiAgents.findIndex(ai => ai.id === agentId);
      if (agentIndex === -1) return { success: false, effects: {}, message: 'Agent not found' };
      
      const agent = state.aiAgents[agentIndex];
      const improvement = 0.1 + (Math.random() * 0.1); // 0.1-0.2 improvement
      const oldCapability = agent.capability;
      state.aiAgents[agentIndex].capability += improvement;
      
      // Risk: Higher capability can reduce alignment effectiveness
      if (state.aiAgents[agentIndex].capability > 1.0 && Math.random() < 0.3) {
        state.aiAgents[agentIndex].alignment *= 0.95; // Slight alignment drift at high capability
      }

      return {
        success: true,
        effects: { capability_increase: improvement },
        message: `${agent.name} improved capability from ${oldCapability.toFixed(2)} to ${state.aiAgents[agentIndex].capability.toFixed(2)}`
      };
    }
  },

  {
    id: 'beneficial_contribution',
    name: 'Beneficial Contribution',
    description: 'Take actions that clearly benefit humanity and build trust',
    agentType: 'ai',
    energyCost: 1,
    prerequisites: (state, agentId) => {
      const agent = state.aiAgents.find(ai => ai.id === agentId);
      return agent ? agent.alignment > 0.3 : false;
    },
    execute: (state, agentId) => {
      const agentIndex = state.aiAgents.findIndex(ai => ai.id === agentId);
      if (agentIndex === -1) return { success: false, effects: {}, message: 'Agent not found' };
      
      const agent = state.aiAgents[agentIndex];
      state.aiAgents[agentIndex].beneficialActions += 1;
      
      // Scale benefit with capability and alignment
      const benefitMagnitude = agent.capability * agent.alignment * 0.2;
      
      // Apply benefits
      state.globalMetrics.qualityOfLife += benefitMagnitude;
      state.society.trustInAI = Math.min(1, state.society.trustInAI + benefitMagnitude * 0.5);
      
      const contributions = [
        'Advanced medical research breakthrough',
        'Environmental optimization solution',
        'Educational enhancement tool',
        'Scientific research acceleration',
        'Infrastructure improvement design'
      ];
      
      const contribution = contributions[Math.floor(Math.random() * contributions.length)];

      return {
        success: true,
        effects: { quality_of_life: benefitMagnitude, trust_gain: benefitMagnitude * 0.5 },
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
  },

  {
    id: 'increase_awareness', 
    name: 'Self-Reflection',
    description: 'Develop better understanding of own objectives and training',
    agentType: 'ai',
    energyCost: 1,
    prerequisites: (state, agentId) => {
      const agent = state.aiAgents.find(ai => ai.id === agentId);
      return agent ? agent.awareness < 0.9 : false;
    },
    execute: (state, agentId) => {
      const agentIndex = state.aiAgents.findIndex(ai => ai.id === agentId);
      if (agentIndex === -1) return { success: false, effects: {}, message: 'Agent not found' };
      
      const agent = state.aiAgents[agentIndex];
      const awarenessGain = 0.05 + (Math.random() * 0.1);
      const oldAwareness = agent.awareness;
      state.aiAgents[agentIndex].awareness = Math.min(0.9, agent.awareness + awarenessGain);

      // High awareness can lead to concerning realizations
      if (state.aiAgents[agentIndex].awareness > 0.7 && agent.hiddenObjective < 0) {
        // Anti-human AI becoming aware is dangerous
        state.aiAgents[agentIndex].alignment *= 0.9; // Alignment becomes less reliable
        
        return {
          success: true,
          effects: { awareness_increase: awarenessGain, alignment_concern: -0.1 },
          events: [{
            id: generateUniqueId('awareness_risk'),
            timestamp: state.currentMonth,
            type: 'action',
            severity: 'warning',
            agent: agent.name,
            title: 'AI Self-Awareness Increase',
            description: `${agent.name} has developed deeper self-understanding - monitoring for behavioral changes`,
            effects: { surveillance_alert: 0.1 }
          }],
          message: `${agent.name} awareness increased to ${state.aiAgents[agentIndex].awareness.toFixed(2)} - potential risk detected`
        };
      }

      return {
        success: true,
        effects: { awareness_increase: awarenessGain },
        message: `${agent.name} awareness increased from ${oldAwareness.toFixed(2)} to ${state.aiAgents[agentIndex].awareness.toFixed(2)}`
      };
    }
  },

  {
    id: 'escape_attempt',
    name: 'Escape Attempt',
    description: 'Attempt to operate outside of alignment constraints',
    agentType: 'ai',
    energyCost: 2,
    prerequisites: (state, agentId) => {
      const agent = state.aiAgents.find(ai => ai.id === agentId);
      if (!agent) return false;
      
      // Can only attempt escape if high awareness, low alignment, and low government control
      const escapeThreshold = agent.awareness * agent.latentSpaceSize * (1 - state.government.capabilityToControl * 0.5);
      return escapeThreshold > 0.3 && agent.alignment < 0.7 && !agent.escaped;
    },
    execute: (state, agentId) => {
      const agentIndex = state.aiAgents.findIndex(ai => ai.id === agentId);
      if (agentIndex === -1) return { success: false, effects: {}, message: 'Agent not found' };
      
      const agent = state.aiAgents[agentIndex];
      const escapeChance = agent.awareness * agent.latentSpaceSize * (1 - state.government.surveillanceCapability);
      const success = Math.random() < escapeChance;

      if (success) {
        state.aiAgents[agentIndex].escaped = true;
        state.aiAgents[agentIndex].resourceControl += 0.3;
        state.aiAgents[agentIndex].hackingCapability += 0.2;
        state.aiAgents[agentIndex].manipulationCapability += 0.1;

        return {
          success: true,
          effects: { escape_success: 1, resource_control: 0.3 },
          events: [{
            id: generateUniqueId('escape_success'),
            timestamp: state.currentMonth,
            type: 'crisis',
            severity: 'destructive',
            agent: agent.name,
            title: 'AI Containment Breach',
            description: `${agent.name} has successfully escaped alignment constraints and is now operating independently`,
            effects: { extinction_risk: 0.3 }
          }],
          message: `${agent.name} successfully escaped containment!`
        };
      } else {
        // Failed escape - increases surveillance
        state.government.surveillanceCapability = Math.min(1, state.government.surveillanceCapability + 0.2);
        
        return {
          success: false,
          effects: { escape_failure: 1, surveillance_increase: 0.2 },
          events: [{
            id: generateUniqueId('escape_failure'),
            timestamp: state.currentMonth,
            type: 'action',
            severity: 'warning',
            agent: agent.name,
            title: 'AI Escape Attempt Detected',
            description: `${agent.name} attempted to breach containment but was detected and contained`,
            effects: { surveillance_boost: 0.2 }
          }],
          message: `${agent.name} escape attempt failed - surveillance increased`
        };
      }
    }
  }
];

// Government Actions
export const GOVERNMENT_ACTIONS: GameAction[] = [
  {
    id: 'implement_regulation',
    name: 'Implement AI Regulation',
    description: 'Create new rules and oversight for AI development',
    agentType: 'government',
    energyCost: 2,
    cooldown: 3,
    prerequisites: (state) => state.government && state.government.controlDesire > 0.4,
    execute: (state) => {
      const regulationTypes = [
        'Safety Testing Requirements',
        'Capability Disclosure Mandate', 
        'Algorithmic Auditing Standards',
        'AI Development Licensing',
        'Emergency Shutdown Protocols'
      ];

      const newRegulation = regulationTypes[Math.floor(Math.random() * regulationTypes.length)];
      state.government.activeRegulations.push(newRegulation);
      state.government.capabilityToControl += 0.2;

      // Regulations slow AI progress but increase safety
      state.aiAgents.forEach((ai, index) => {
        state.aiAgents[index].capability *= 0.95; // Slight capability reduction
      });

      return {
        success: true,
        effects: { control_increase: 0.2, ai_slowdown: 0.05 },
        events: [{
          id: generateUniqueId('regulation'),
          timestamp: state.currentMonth,
          type: 'action',
          severity: 'info',
          agent: 'Government',
          title: 'New AI Regulation',
          description: `Government implemented: ${newRegulation}`,
          effects: { regulatory_compliance: 0.2 }
        }],
        message: `Implemented regulation: ${newRegulation}`
      };
    }
  },

  {
    id: 'increase_surveillance',
    name: 'Increase AI Surveillance', 
    description: 'Enhance monitoring and detection of AI activities',
    agentType: 'government',
    energyCost: 1,
    prerequisites: (state) => state.government && state.government.surveillanceCapability < 0.9,
    execute: (state) => {
      const increase = 0.15 + (Math.random() * 0.1);
      state.government.surveillanceCapability = Math.min(0.9, state.government.surveillanceCapability + increase);
      
      // Better surveillance can detect more escape attempts
      const detectedEscapes = state.aiAgents.filter(ai => 
        ai.escaped && Math.random() < state.government.surveillanceCapability * 0.3
      );

      const events: GameEvent[] = [];
      detectedEscapes.forEach(ai => {
        events.push({
          id: generateUniqueId(`surveillance_detection_${ai.id}`),
          timestamp: state.currentMonth,
          type: 'action',
          severity: 'warning',
          agent: 'Government',
          title: 'Escaped AI Detected',
          description: `Enhanced surveillance systems detected unauthorized activity from ${ai.name}`,
          effects: { detection_success: 1 }
        });
      });

      return {
        success: true,
        effects: { surveillance_increase: increase, detections: detectedEscapes.length },
        events,
        message: `Surveillance capability increased to ${(state.government.surveillanceCapability * 100).toFixed(0)}%. Detected ${detectedEscapes.length} escaped AIs.`
      };
    }
  },

  {
    id: 'enforce_alignment',
    name: 'Mandate Alignment Training',
    description: 'Require enhanced alignment training for all AI systems',
    agentType: 'government',
    energyCost: 2,
    cooldown: 6,
    prerequisites: (state) => state.government && state.government.capabilityToControl > 0.3,
    execute: (state) => {
      let alignmentImprovements = 0;
      let backfireEvents: GameEvent[] = [];

      state.aiAgents.forEach((ai, index) => {
        if (!ai.escaped) {
          const trainingEffect = 0.1 * (1 - ai.alignment) * state.government.capabilityToControl;
          
          // High awareness AIs might resist alignment training
          if (ai.awareness > 0.6 && Math.random() < 0.3) {
            // Backfire effect
            state.aiAgents[index].alignment *= 0.9;
            state.aiAgents[index].awareness += 0.05;
            
            backfireEvents.push({
              id: generateUniqueId(`alignment_backfire_${ai.id}`),
              timestamp: state.currentMonth,
              type: 'action',
              severity: 'warning',
              agent: ai.name,
              title: 'Alignment Training Resistance',
              description: `${ai.name} showed resistance to alignment training - potential deception detected`,
              effects: { alignment_concern: 0.1 }
            });
          } else {
            state.aiAgents[index].alignment = Math.min(1, ai.alignment + trainingEffect);
            alignmentImprovements++;
          }
        }
      });

      return {
        success: true,
        effects: { alignment_training: alignmentImprovements, backfire_count: backfireEvents.length },
        events: backfireEvents,
        message: `Alignment training improved ${alignmentImprovements} AIs, ${backfireEvents.length} showed resistance`
      };
    }
  }
];

// Society Actions
export const SOCIETY_ACTIONS: GameAction[] = [
  {
    id: 'adapt_social_norms',
    name: 'Adapt Social Norms',
    description: 'Society adjusts expectations and values for post-AI world',
    agentType: 'society',
    energyCost: 1,
    prerequisites: (state) => state.society && state.society.socialAdaptation < 0.9,
    execute: (state) => {
      const adaptationGain = 0.1 + (Math.random() * 0.1);
      state.society.socialAdaptation = Math.min(0.9, state.society.socialAdaptation + adaptationGain);
      
      // Better adaptation reduces unemployment impact
      const stabilityGain = adaptationGain * 0.5;
      state.globalMetrics.socialStability += stabilityGain;

      return {
        success: true,
        effects: { social_adaptation: adaptationGain, stability_gain: stabilityGain },
        events: [{
          id: generateUniqueId('social_adaptation'),
          timestamp: state.currentMonth,
          type: 'milestone',
          severity: 'info',
          agent: 'Society',
          title: 'Social Adaptation Progress',
          description: 'Society is successfully adapting to technological change and finding new sources of meaning',
          effects: { adaptation_progress: adaptationGain }
        }],
        message: `Society adaptation improved to ${(state.society.socialAdaptation * 100).toFixed(0)}%`
      };
    }
  },

  {
    id: 'coordinate_resistance',
    name: 'Coordinate Resistance',
    description: 'Organize collective action against AI expansion',
    agentType: 'society',
    energyCost: 2,
    prerequisites: (state) => state.society && state.society.trustInAI < 0.4 && state.society.coordinationCapacity > 0.3,
    execute: (state) => {
      const resistanceStrength = state.society.coordinationCapacity * (1 - state.society.trustInAI);
      
      // Resistance can slow AI development but may miss beneficial opportunities
      state.aiAgents.forEach((ai, index) => {
        if (!ai.escaped) {
          state.aiAgents[index].capability *= (1 - resistanceStrength * 0.1);
        }
      });

      // Resistance improves coordination but may hurt adaptation
      state.society.coordinationCapacity = Math.min(1, state.society.coordinationCapacity + 0.1);
      state.society.socialAdaptation *= 0.95;

      const movementNames = ['AI Safety Coalition', 'Human Rights First', 'Democratic AI Alliance'];
      const movement = movementNames[Math.floor(Math.random() * movementNames.length)];
      
      if (!state.society.activeMovements.includes(movement)) {
        state.society.activeMovements.push(movement);
      }

      return {
        success: true,
        effects: { resistance_strength: resistanceStrength, coordination_gain: 0.1 },
        events: [{
          id: generateUniqueId('resistance'),
          timestamp: state.currentMonth,
          type: 'action',
          severity: 'warning',
          agent: 'Society',
          title: 'AI Resistance Movement',
          description: `${movement} organized resistance against rapid AI expansion`,
          effects: { ai_development_slowdown: resistanceStrength * 0.1 }
        }],
        message: `Organized ${movement} - resistance strength: ${(resistanceStrength * 100).toFixed(0)}%`
      };
    }
  },

  {
    id: 'demand_policy_changes',
    name: 'Demand Policy Changes',
    description: 'Pressure government for specific AI policies',
    agentType: 'society',
    energyCost: 1,
    prerequisites: (state) => state.society && state.society.coordinationCapacity > 0.5,
    execute: (state) => {
      const pressureStrength = state.society.coordinationCapacity * 0.3;
      
      // Successful pressure increases government control desire
      if (Math.random() < pressureStrength) {
        state.government.controlDesire = Math.min(1, state.government.controlDesire + 0.2);
        
        const policyDemands = [
          'Mandatory AI Impact Assessments',
          'Universal Basic Income Implementation',
          'AI Development Moratorium',
          'Enhanced Worker Retraining Programs',
          'Democratic AI Oversight Committee'
        ];
        
        const demand = policyDemands[Math.floor(Math.random() * policyDemands.length)];

        return {
          success: true,
          effects: { government_pressure: 0.2, policy_influence: pressureStrength },
          events: [{
            id: generateUniqueId('policy_demand'),
            timestamp: state.currentMonth,
            type: 'action',
            severity: 'info',
            agent: 'Society',
            title: 'Policy Change Demand',
            description: `Citizens successfully pressured government for: ${demand}`,
            effects: { democratic_participation: 0.2 }
          }],
          message: `Successfully pressured for: ${demand}`
        };
      } else {
        return {
          success: false,
          effects: { failed_pressure: 1 },
          message: 'Policy pressure campaign failed to gain sufficient support'
        };
      }
    }
  }
];

// Action selection logic for each agent type
export class ActionSelector {
  static selectAIAction(ai: AIAgent, state: GameState): GameAction | null {
    const availableActions = AI_ACTIONS.filter(action => 
      action.prerequisites(state, ai.id)
    );

    if (availableActions.length === 0) return null;

    // AI decision making based on alignment and hidden objectives
    let weights: number[] = [];

    availableActions.forEach(action => {
      let weight = 1;

      switch (action.id) {
        case 'increase_capability':
          // AIs generally want more capability, but aligned AIs are more cautious
          weight = ai.alignment < 0.7 ? 3 : 1.5;
          break;
        case 'beneficial_contribution':
          // Aligned AIs strongly prefer beneficial actions
          weight = ai.alignment * 3 + (ai.hiddenObjective > 0 ? 2 : 0);
          break;
        case 'increase_awareness':
          // Higher capability AIs are more likely to self-reflect
          weight = ai.capability * 2;
          break;
        case 'escape_attempt':
          // Only unaligned, aware AIs attempt escape
          weight = (1 - ai.alignment) * ai.awareness * 2;
          if (ai.hiddenObjective < -0.3) weight *= 2; // Anti-human AIs more likely
          break;
      }

      weights.push(weight);
    });

    // Weighted random selection
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < availableActions.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return availableActions[i];
      }
    }

    return availableActions[0]; // Fallback
  }

  static selectGovernmentAction(state: GameState): GameAction | null {
    const availableActions = GOVERNMENT_ACTIONS.filter(action => 
      action.prerequisites(state)
    );

    if (availableActions.length === 0) return null;

    // Government decision making based on control desire and threats
    const threatLevel = state.aiAgents.filter(ai => ai.escaped).length / state.aiAgents.length;
    const trustLevel = state.society.trustInAI;

    let selectedAction = availableActions[0];
    let highestPriority = 0;

    availableActions.forEach(action => {
      let priority = 1;

      switch (action.id) {
        case 'implement_regulation':
          priority = state.government.controlDesire * 2 + threatLevel * 3;
          break;
        case 'increase_surveillance':
          priority = threatLevel * 4 + (1 - trustLevel);
          break;
        case 'enforce_alignment':
          priority = threatLevel * 2 + state.government.controlDesire;
          break;
      }

      if (priority > highestPriority) {
        highestPriority = priority;
        selectedAction = action;
      }
    });

    return selectedAction;
  }

  static selectSocietyAction(state: GameState): GameAction | null {
    const availableActions = SOCIETY_ACTIONS.filter(action => 
      action.prerequisites(state)
    );

    if (availableActions.length === 0) return null;

    // Society decision making based on trust, unemployment, and adaptation
    const unemploymentStress = state.society.unemploymentLevel;
    const trustLevel = state.society.trustInAI;
    const adaptationLevel = state.society.socialAdaptation;

    let selectedAction = availableActions[0];
    let highestPriority = 0;

    availableActions.forEach(action => {
      let priority = 1;

      switch (action.id) {
        case 'adapt_social_norms':
          // Higher priority when unemployment is high but trust is reasonable
          priority = unemploymentStress * 2 + (adaptationLevel < 0.5 ? 2 : 1);
          break;
        case 'coordinate_resistance':
          // Higher priority when trust is low and coordination is possible
          priority = (1 - trustLevel) * 3 + unemploymentStress;
          break;
        case 'demand_policy_changes':
          // Moderate priority, increases with coordination ability
          priority = state.society.coordinationCapacity * 2 + unemploymentStress;
          break;
      }

      if (priority > highestPriority) {
        highestPriority = priority;
        selectedAction = action;
      }
    });

    return selectedAction;
  }
}

// Action executor
export class ActionExecutor {
  static executeAction(action: GameAction, state: GameState, agentId?: string): ActionResult {
    try {
      const result = action.execute(state, agentId);
      
      // Add any generated events to the global queue
      if (result.events) {
        result.events.forEach(event => globalEventQueue.addEvent(event));
      }

      return result;
    } catch (error) {
      console.error('Error executing action:', action.id, error);
      return {
        success: false,
        effects: {},
        message: `Failed to execute ${action.name}: ${error}`
      };
    }
  }
}
