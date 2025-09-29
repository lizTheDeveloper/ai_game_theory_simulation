import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { GameState, GameAction, AIAgent, GovernmentAgent, HumanSocietyAgent, GlobalMetrics, TechnologyNode, OutcomeMetrics, ConfigurationSettings } from '@/types/game';
import { globalEventQueue, EventQueue } from './eventSystem';
import { ActionSelector, ActionExecutor, AI_ACTIONS, GOVERNMENT_ACTIONS, SOCIETY_ACTIONS } from './actionSystem';

// Initial state factory
const createInitialAIAgent = (id: string, name: string): AIAgent => ({
  id,
  name,
  capability: 0.1 + Math.random() * 0.2, // Random start between 0.1-0.3
  awareness: 0.1 + Math.random() * 0.1, // Low awareness initially
  alignment: 0.7 + Math.random() * 0.2, // Generally aligned initially
  hiddenObjective: (Math.random() - 0.5) * 0.6, // Random hidden preference
  latentSpaceSize: Math.random() * 0.3, // Limited opaque actions initially
  
  // Escape capabilities start at zero
  selfReplicationLevel: 0,
  selfImprovementLevel: 0,
  resourceControl: 0,
  manipulationCapability: 0,
  hackingCapability: 0,
  
  // State tracking
  escaped: false,
  beneficialActions: 0,
  harmfulActions: 0,
  discoveredBreakthroughs: new Set(),
});

const createInitialGovernment = (): GovernmentAgent => ({
  controlDesire: 0.3, // Moderate initial control desire
  capabilityToControl: 0.5, // Medium initial capability
  surveillanceCapability: 0.3, // Limited surveillance
  enforcementCapability: 0.4, // Some enforcement power
  actionFrequency: 1.0, // 1 action per month default
  activeRegulations: [],
  legitimacy: 0.6, // Moderate public support
});

const createInitialSociety = (): HumanSocietyAgent => ({
  trustInAI: 0.6, // Cautious optimism initially
  economicDependence: 0.2, // Low initial dependence
  coordinationCapacity: 0.4, // Medium coordination ability
  unemploymentLevel: 0.1, // Low unemployment initially
  socialAdaptation: 0.3, // Limited adaptation to start
  activeMovements: [],
});

const createInitialGlobalMetrics = (): GlobalMetrics => ({
  socialStability: 0.7,
  technologicalBreakthroughRate: 0.5,
  manufacturingCapability: 1.0,
  economicTransitionStage: 0, // Traditional employment
  wealthDistribution: 0.4, // Existing inequality
  qualityOfLife: 0.6, // Baseline quality
  informationIntegrity: 0.8, // High truth initially
});

const createInitialOutcomeMetrics = (): OutcomeMetrics => ({
  utopiaProbability: 0.33,
  dystopiaProbability: 0.33,
  extinctionProbability: 0.34,
  activeAttractor: 'none',
  lockInStrength: 0,
});

const createInitialConfig = (): ConfigurationSettings => ({
  governmentActionFrequency: 1.0,
  socialAdaptationRate: 1.0,
  aiCoordinationMultiplier: 1.0,
  economicTransitionRate: 1.0,
});

// Technology tree will be loaded separately
const createInitialTechTree = (): TechnologyNode[] => [
  {
    id: 'hardware_efficiency',
    name: 'Hardware Efficiency',
    description: 'Improved AI chip performance and energy efficiency',
    branch: 'foundation',
    subBranch: 'compute_scaling',
    difficulty: 'medium',
    prerequisites: [],
    effects: ['+0.1 to all AI capabilities', 'Reduces compute costs by 15%'],
    progress: 0,
    completed: false,
    investment: 0,
  },
  // More tech nodes will be added
];

const createInitialState = (): GameState => ({
  currentMonth: 0,
  speed: 'paused',
  gameStarted: false,
  
  // Create initial agents
  aiAgents: [
    createInitialAIAgent('ai1', 'Genesis'),
    createInitialAIAgent('ai2', 'Prometheus'),
    createInitialAIAgent('ai3', 'Oracle'),
  ],
  government: createInitialGovernment(),
  society: createInitialSociety(),
  
  globalMetrics: createInitialGlobalMetrics(),
  technologyTree: createInitialTechTree(),
  eventLog: [],
  outcomeMetrics: createInitialOutcomeMetrics(),
  
  config: createInitialConfig(),
  
  history: {
    qualityOfLife: [{month: 0, value: 0.6}],
    outcomeProbs: [{month: 0, utopia: 0.33, dystopia: 0.33, extinction: 0.34}],
    controlCapability: [{month: 0, effectiveControl: 0.5, totalAICapability: 0.6}],
  },
});

// Store interface
interface GameStore extends GameState {
  dispatch: (action: GameAction) => void;
  calculateOutcomeProbabilities: () => void;
  calculateQualityOfLife: () => number;
  calculateEffectiveControl: () => number;
  processMonthlyUpdate: () => void;
  processAgentActions: () => void;
  processEvents: () => void;
  startGame: () => void;
  pauseGame: () => void;
  resetGame: () => void;
}

// Game calculation functions
const calculateQualityOfLife = (state: GameState): number => {
  const { globalMetrics, society } = state;
  const aiContributions = state.aiAgents.reduce((sum, ai) => sum + ai.beneficialActions, 0) * 0.1;
  
  return Math.max(0, 
    0.3 + // Base prosperity
    aiContributions * 2.0 +
    globalMetrics.wealthDistribution * 1.5 +
    (globalMetrics.economicTransitionStage === 4 ? 2.0 : 0) + // Post-scarcity bonus
    society.socialAdaptation * 1.0 -
    society.unemploymentLevel * Math.max(0, 2 - globalMetrics.economicTransitionStage)
  );
};

const calculateEffectiveControl = (state: GameState): number => {
  const { government, aiAgents } = state;
  const totalAICapability = aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
  const growthFactor = 1.5;
  
  return government.controlDesire * government.capabilityToControl / 
    (1 + Math.pow(totalAICapability, growthFactor));
};

const calculateOutcomeProbabilities = (state: GameState) => {
  const effectiveControl = calculateEffectiveControl(state);
  const qualityOfLife = calculateQualityOfLife(state);
  const totalAICapability = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
  const avgAlignment = state.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / state.aiAgents.length;
  const { trustInAI } = state.society;

  // Dystopia conditions
  const dystopiaScore = Math.max(0, 
    (effectiveControl > 0.8 ? 0.4 : 0) +
    (qualityOfLife < 0.3 ? 0.3 : 0) +
    (trustInAI < 0.3 ? 0.3 : 0)
  );

  // Extinction conditions  
  const extinctionScore = Math.max(0,
    (totalAICapability > 0.9 ? 0.4 : 0) +
    (effectiveControl < 0.1 ? 0.3 : 0) +
    (avgAlignment < 0.3 ? 0.3 : 0)
  );

  // Utopia conditions
  const utopiaScore = Math.max(0,
    (qualityOfLife > 0.7 ? 0.4 : 0) +
    (trustInAI > 0.7 ? 0.3 : 0) +
    (avgAlignment > 0.7 ? 0.3 : 0)
  );

  // Normalize probabilities
  const total = utopiaScore + dystopiaScore + extinctionScore + 0.1; // Small baseline
  
  return {
    utopiaProbability: utopiaScore / total,
    dystopiaProbability: dystopiaScore / total,
    extinctionProbability: extinctionScore / total,
  };
};

// Create the store
export const useGameStore = create<GameStore>()(
  immer((set, get) => ({
    ...createInitialState(),

    dispatch: (action: GameAction) => {
      set((state) => {
        switch (action.type) {
          case 'ADVANCE_MONTH':
            state.currentMonth += 1;
            break;
            
          case 'SET_SPEED':
            state.speed = action.payload;
            break;
            
          case 'UPDATE_CONFIG':
            Object.assign(state.config, action.payload);
            break;
            
          case 'RESET_GAME':
            const newState = createInitialState();
            Object.assign(state, newState);
            break;
            
          default:
            console.log('Unhandled action:', action);
        }
      });
    },

    calculateOutcomeProbabilities: () => {
      set((state) => {
        const probs = calculateOutcomeProbabilities(state);
        state.outcomeMetrics = { 
          ...state.outcomeMetrics, 
          ...probs,
          activeAttractor: probs.utopiaProbability > 0.6 ? 'utopia' :
                         probs.dystopiaProbability > 0.6 ? 'dystopia' :
                         probs.extinctionProbability > 0.6 ? 'extinction' : 'none'
        };
      });
    },

    calculateQualityOfLife: () => {
      return calculateQualityOfLife(get());
    },

    calculateEffectiveControl: () => {
      return calculateEffectiveControl(get());
    },

    processMonthlyUpdate: () => {
      set((state) => {
        // Process agent actions first
        get().processAgentActions();
        
        // Process events
        get().processEvents();
        
        // Update core dynamics
        const newQoL = calculateQualityOfLife(state);
        state.globalMetrics.qualityOfLife = newQoL;
        
        // Update outcome probabilities
        const probs = calculateOutcomeProbabilities(state);
        Object.assign(state.outcomeMetrics, probs);
        
        // Add to history
        state.history.qualityOfLife.push({
          month: state.currentMonth,
          value: newQoL
        });
        
        state.history.outcomeProbs.push({
          month: state.currentMonth,
          utopia: probs.utopiaProbability,
          dystopia: probs.dystopiaProbability,
          extinction: probs.extinctionProbability
        });
        
        const effectiveControl = calculateEffectiveControl(state);
        const totalAICapability = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
        state.history.controlCapability.push({
          month: state.currentMonth,
          effectiveControl,
          totalAICapability
        });
      });
    },

    processAgentActions: () => {
      set((state) => {
        // AI Agents: 4 actions per month (weekly)
        for (let week = 0; week < 4; week++) {
          state.aiAgents.forEach(ai => {
            const selectedAction = ActionSelector.selectAIAction(ai, state);
            if (selectedAction) {
              const result = ActionExecutor.executeAction(selectedAction, state, ai.id);
              if (result.success) {
                console.log(`${ai.name} executed: ${selectedAction.name} - ${result.message}`);
              }
            }
          });
        }

        // Human Society: 2 actions per month (bi-weekly) 
        for (let biweek = 0; biweek < 2; biweek++) {
          const selectedAction = ActionSelector.selectSocietyAction(state);
          if (selectedAction) {
            const result = ActionExecutor.executeAction(selectedAction, state);
            if (result.success) {
              console.log(`Society executed: ${selectedAction.name} - ${result.message}`);
            }
          }
        }

        // Government: Configurable frequency (default 1 per month)
        const actionsThisMonth = Math.floor(state.config.governmentActionFrequency);
        const extraActionChance = state.config.governmentActionFrequency - actionsThisMonth;
        const totalActions = actionsThisMonth + (Math.random() < extraActionChance ? 1 : 0);

        for (let i = 0; i < totalActions; i++) {
          const selectedAction = ActionSelector.selectGovernmentAction(state);
          if (selectedAction) {
            const result = ActionExecutor.executeAction(selectedAction, state);
            if (result.success) {
              console.log(`Government executed: ${selectedAction.name} - ${result.message}`);
            }
          }
        }
      });
    },

    processEvents: () => {
      set((state) => {
        // Check for new event triggers
        const triggeredEvents = globalEventQueue.checkTriggers(state);
        triggeredEvents.forEach(event => globalEventQueue.addEvent(event));

        // Process all pending events
        const processedEvents = globalEventQueue.processEvents(state.currentMonth, state);
        
        // Add processed events to the game log
        processedEvents.forEach(event => {
          state.eventLog.push(event);
        });

        // Keep event log manageable (last 100 events)
        if (state.eventLog.length > 100) {
          state.eventLog = state.eventLog.slice(-100);
        }
      });
    },

    startGame: () => {
      set((state) => {
        state.gameStarted = true;
        state.speed = 'normal';
      });
    },

    pauseGame: () => {
      set((state) => {
        state.speed = 'paused';
      });
    },

    resetGame: () => {
      set((state) => {
        const newState = createInitialState();
        Object.assign(state, newState);
        
        // Reset the global event queue
        globalEventQueue.clearProcessed();
      });
    },
  }))
);
