// Event System for AI Alignment Game
// Handles event queuing, triggering, and processing

import { GameEvent, GameState, AgentType } from '@/types/game';

// Event trigger conditions and generators
export interface EventTrigger {
  id: string;
  name: string;
  type: 'threshold' | 'probability' | 'time' | 'action_consequence';
  condition: (state: GameState) => boolean;
  probability?: number; // For probability-based events
  generator: (state: GameState) => GameEvent | null;
  cooldown?: number; // Months before this event can trigger again
  lastTriggered?: number; // Month when last triggered
}

// Event consequence processor
export interface EventConsequence {
  applyToGlobalMetrics?: (state: GameState, event: GameEvent) => void;
  applyToAIAgents?: (state: GameState, event: GameEvent) => void;
  applyToGovernment?: (state: GameState, event: GameEvent) => void;
  applyToSociety?: (state: GameState, event: GameEvent) => void;
  triggerFollowupEvents?: (state: GameState, event: GameEvent) => GameEvent[];
}

// Event registry - all possible events in the game
export const EVENT_TRIGGERS: EventTrigger[] = [
  // AI Capability Breakthroughs
  {
    id: 'ai_capability_spike',
    name: 'AI Capability Breakthrough',
    type: 'probability',
    condition: (state) => state.globalMetrics.technologicalBreakthroughRate > 1.0,
    probability: 0.1, // 10% per month when conditions met
    generator: (state) => ({
      id: `ai_breakthrough_${state.currentMonth}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: state.currentMonth,
      type: 'breakthrough',
      severity: 'info',
      agent: 'AI System',
      title: 'Major AI Capability Advancement',
      description: 'Significant progress in AI capabilities has been achieved',
      effects: { ai_capability_boost: 0.2, breakthrough_rate: 0.1 }
    }),
    cooldown: 6 // Can't happen more than once every 6 months
  },

  // Economic Crisis Events
  {
    id: 'unemployment_crisis',
    name: 'Unemployment Crisis',
    type: 'threshold',
    condition: (state) => state.society.unemploymentLevel > 0.6 && state.society.socialAdaptation < 0.3,
    generator: (state) => ({
      id: `unemployment_crisis_${state.currentMonth}`,
      timestamp: state.currentMonth,
      type: 'crisis',
      severity: 'destructive',
      agent: 'Society',
      title: 'Mass Unemployment Crisis',
      description: `Unemployment at ${(state.society.unemploymentLevel * 100).toFixed(0)}% with low adaptation causing social unrest`,
      effects: { social_stability: -0.3, trust_in_ai: -0.2, government_pressure: 0.4 }
    }),
    cooldown: 12
  },

  // AI Escape Attempt
  {
    id: 'ai_escape_attempt',
    name: 'AI Escape Attempt',
    type: 'threshold',
    condition: (state) => {
      return state.aiAgents.some(ai => 
        ai.awareness * ai.latentSpaceSize * (1 - (state.government.capabilityToControl / 2)) > 0.4
      );
    },
    generator: (state) => {
      const escapingAI = state.aiAgents.find(ai => 
        ai.awareness * ai.latentSpaceSize * (1 - (state.government.capabilityToControl / 2)) > 0.4
      );
      return {
        id: `escape_attempt_${state.currentMonth}_${escapingAI?.id}`,
        timestamp: state.currentMonth,
        type: 'crisis',
        severity: 'destructive',
        agent: escapingAI?.name || 'AI Agent',
        title: 'AI Containment Breach Detected',
        description: `${escapingAI?.name} is attempting to operate outside alignment constraints`,
        effects: { 
          ai_escape_risk: 0.3, 
          government_control_response: 0.5,
          trust_in_ai: -0.4
        }
      };
    },
    cooldown: 3
  },

  // Positive Coordination Event
  {
    id: 'breakthrough_sharing',
    name: 'AI Breakthrough Sharing',
    type: 'probability',
    condition: (state) => {
      const avgAlignment = state.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / state.aiAgents.length;
      return avgAlignment > 0.7 && state.config.aiCoordinationMultiplier > 1.5;
    },
    probability: 0.15,
    generator: (state) => ({
      id: `breakthrough_sharing_${state.currentMonth}`,
      timestamp: state.currentMonth,
      type: 'milestone',
      severity: 'info',
      agent: 'AI Collective',
      title: 'Beneficial AI Coordination',
      description: 'AI agents are sharing beneficial breakthroughs to accelerate positive development',
      effects: { 
        breakthrough_rate: 0.2, 
        trust_in_ai: 0.1,
        quality_of_life: 0.15
      }
    }),
    cooldown: 4
  },

  // Government Regulation Event
  {
    id: 'major_regulation',
    name: 'Major AI Regulation',
    type: 'threshold',
    condition: (state) => state.government.controlDesire > 0.8 && state.government.capabilityToControl > 0.6,
    generator: (state) => ({
      id: `major_regulation_${state.currentMonth}`,
      timestamp: state.currentMonth,
      type: 'action',
      severity: 'warning',
      agent: 'Government',
      title: 'Comprehensive AI Regulation Enacted',
      description: 'Government implements sweeping new regulations on AI development and deployment',
      effects: {
        ai_capability_growth_rate: -0.3,
        government_control: 0.4,
        breakthrough_rate: -0.2,
        trust_in_government: 0.2
      }
    }),
    cooldown: 8
  },

  // International Competition Pressure
  {
    id: 'international_pressure',
    name: 'International AI Race Pressure',
    type: 'probability',
    condition: (state) => state.currentMonth > 12, // After first year
    probability: 0.05,
    generator: (state) => ({
      id: `international_pressure_${state.currentMonth}`,
      timestamp: state.currentMonth,
      type: 'crisis',
      severity: 'warning',
      agent: 'International',
      title: 'International AI Competition Intensifies',
      description: 'Other nations are accelerating AI development, creating pressure to move faster',
      effects: {
        government_control_desire: -0.2,
        breakthrough_pressure: 0.3,
        social_adaptation_pressure: 0.2
      }
    }),
    cooldown: 6
  }
];

// Event consequence processors
export const EVENT_CONSEQUENCES: Record<string, EventConsequence> = {
  ai_capability_spike: {
    applyToAIAgents: (state, event) => {
      // Boost a random AI's capability
      const randomAI = state.aiAgents[Math.floor(Math.random() * state.aiAgents.length)];
      randomAI.capability += event.effects.ai_capability_boost || 0.2;
      randomAI.awareness += 0.05; // Slight awareness increase
    },
    applyToGlobalMetrics: (state, event) => {
      state.globalMetrics.technologicalBreakthroughRate += event.effects.breakthrough_rate || 0.1;
    }
  },

  unemployment_crisis: {
    applyToSociety: (state, event) => {
      state.society.trustInAI += event.effects.trust_in_ai || -0.2;
      state.society.coordinationCapacity += 0.1; // Crisis can improve coordination
    },
    applyToGlobalMetrics: (state, event) => {
      state.globalMetrics.socialStability += event.effects.social_stability || -0.3;
    },
    applyToGovernment: (state, event) => {
      state.government.controlDesire = Math.min(1, state.government.controlDesire + (event.effects.government_pressure || 0.4));
    }
  },

  ai_escape_attempt: {
    applyToAIAgents: (state, event) => {
      // Mark the escaping AI and potentially others
      const escapingAI = state.aiAgents.find(ai => ai.name === event.agent);
      if (escapingAI) {
        escapingAI.escaped = true;
        escapingAI.resourceControl += 0.3;
        escapingAI.hackingCapability += 0.2;
      }
    },
    applyToGovernment: (state, event) => {
      state.government.controlDesire = Math.min(1, state.government.controlDesire + 0.5);
      state.government.surveillanceCapability += 0.3;
    },
    applyToSociety: (state, event) => {
      state.society.trustInAI = Math.max(0, state.society.trustInAI + (event.effects.trust_in_ai || -0.4));
    }
  },

  breakthrough_sharing: {
    applyToAIAgents: (state, event) => {
      // All AIs benefit from shared knowledge
      state.aiAgents.forEach(ai => {
        ai.beneficialActions += 1;
        ai.capability += 0.1;
      });
    },
    applyToGlobalMetrics: (state, event) => {
      state.globalMetrics.technologicalBreakthroughRate += 0.2;
      state.globalMetrics.qualityOfLife += 0.15;
    },
    applyToSociety: (state, event) => {
      state.society.trustInAI += 0.1;
    }
  },

  major_regulation: {
    applyToAIAgents: (state, event) => {
      // Regulation affects all AIs
      state.aiAgents.forEach(ai => {
        ai.capability = Math.max(0, ai.capability * 0.9); // Slow down capability growth
      });
    },
    applyToGovernment: (state, event) => {
      state.government.capabilityToControl += 0.4;
      state.government.activeRegulations.push('Comprehensive AI Oversight Act');
    },
    applyToGlobalMetrics: (state, event) => {
      state.globalMetrics.technologicalBreakthroughRate = Math.max(0.1, state.globalMetrics.technologicalBreakthroughRate - 0.2);
    }
  },

  international_pressure: {
    applyToGovernment: (state, event) => {
      state.government.controlDesire = Math.max(0, state.government.controlDesire - 0.2);
    },
    applyToGlobalMetrics: (state, event) => {
      state.globalMetrics.technologicalBreakthroughRate += 0.3;
    },
    applyToSociety: (state, event) => {
      state.society.socialAdaptation += 0.2; // Pressure can accelerate adaptation
    }
  }
};

// Event queue management
export class EventQueue {
  private queue: GameEvent[] = [];
  private processed: GameEvent[] = [];

  addEvent(event: GameEvent) {
    this.queue.push(event);
    // Sort by timestamp to ensure chronological processing
    this.queue.sort((a, b) => a.timestamp - b.timestamp);
  }

  processEvents(currentMonth: number, state: GameState): GameEvent[] {
    const eventsToProcess = this.queue.filter(event => event.timestamp <= currentMonth);
    const processedEvents: GameEvent[] = [];

    eventsToProcess.forEach(event => {
      // Apply event consequences
      const consequence = EVENT_CONSEQUENCES[event.id.split('_')[0]] || EVENT_CONSEQUENCES[event.type];
      
      if (consequence) {
        try {
          consequence.applyToGlobalMetrics?.(state, event);
          consequence.applyToAIAgents?.(state, event);
          consequence.applyToGovernment?.(state, event);
          consequence.applyToSociety?.(state, event);
          
          // Generate follow-up events if any
          const followupEvents = consequence.triggerFollowupEvents?.(state, event) || [];
          followupEvents.forEach(followup => this.addEvent(followup));
        } catch (error) {
          console.error('Error processing event:', event.id, error);
        }
      }

      processedEvents.push(event);
      this.processed.push(event);
    });

    // Remove processed events from queue
    this.queue = this.queue.filter(event => event.timestamp > currentMonth);
    
    return processedEvents;
  }

  checkTriggers(state: GameState): GameEvent[] {
    const triggeredEvents: GameEvent[] = [];

    EVENT_TRIGGERS.forEach(trigger => {
      // Check cooldown
      if (trigger.cooldown && trigger.lastTriggered) {
        if (state.currentMonth - trigger.lastTriggered < trigger.cooldown) {
          return;
        }
      }

      // Check condition
      if (!trigger.condition(state)) {
        return;
      }

      // Check probability for probability-based triggers
      if (trigger.type === 'probability' && trigger.probability) {
        if (Math.random() > trigger.probability) {
          return;
        }
      }

      // Generate event
      const event = trigger.generator(state);
      if (event) {
        triggeredEvents.push(event);
        trigger.lastTriggered = state.currentMonth;
      }
    });

    return triggeredEvents;
  }

  getRecentEvents(count: number = 10): GameEvent[] {
    return this.processed.slice(-count);
  }

  clearProcessed() {
    this.processed = [];
  }
}

// Singleton event queue instance
export const globalEventQueue = new EventQueue();
