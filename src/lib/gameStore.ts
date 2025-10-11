import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { GameState, GameAction, AIAgent, GovernmentAgent, HumanSocietyAgent, GlobalMetrics, TechnologyNode, OutcomeMetrics, ConfigurationSettings } from '@/types/game';
import { globalEventQueue, EventQueue } from './eventSystem';
import { ActionSelector, ActionExecutor, AI_ACTIONS, GOVERNMENT_ACTIONS, SOCIETY_ACTIONS } from './actionSystem';
import { format, getDaysInMonth as getDateFnsDaysInMonth, addMonths, startOfMonth, addDays } from 'date-fns';

// Unique ID generator for events
let eventIdCounter = 0;
const generateUniqueId = (prefix: string): string => {
  eventIdCounter += 1;
  return `${prefix}_${Date.now()}_${eventIdCounter}`;
};

// Calendar utility functions using date-fns
const createGameDate = (year: number, month: number, day: number): Date => {
  return new Date(year, month, day); // month is 0-based in Date constructor
};

const getDaysInMonth = (month: number, year: number): number => {
  return getDateFnsDaysInMonth(new Date(year, month, 1));
};

const formatGameDate = (year: number, month: number, day: number): string => {
  const date = new Date(year, month, day);
  return format(date, 'MMM yyyy');
};

const formatFullGameDate = (year: number, month: number, day: number): string => {
  const date = new Date(year, month, day);
  return format(date, 'MMM d, yyyy');
};

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
});

const createInitialGovernment = (): GovernmentAgent => ({
  controlDesire: 0.3, // Moderate initial control desire
  capabilityToControl: 0.5, // Medium initial capability
  surveillanceCapability: 0.3, // Limited surveillance
  actionFrequency: 0.08, // ~1 action per year (1/12 months) - realistic government pace
  activeRegulations: [],
  legitimacy: 0.6, // Moderate public support
  lastMajorPolicyMonth: -12, // Can take major policy immediately at start
  majorPoliciesThisYear: 0 // No major policies enacted yet
});

const createInitialSociety = (): HumanSocietyAgent => ({
  trustInAI: 0.6, // Cautious optimism initially
  coordinationCapacity: 0.4, // Medium coordination ability
  unemploymentLevel: 0.1, // Low unemployment initially
  socialAdaptation: 0.1, // Much more limited initial adaptation
  activeMovements: [],
  // Quartile-based adoption (all start at 0, will adapt at different rates)
  earlyAdopters: 0.0, // Q1: Will adapt first with minimal pressure
  mediumAdopters: 0.0, // Q2: Need moderate unemployment pressure  
  slowAdopters: 0.0, // Q3: Need sustained high pressure over years
  resistantAdopters: 0.0 // Q4: May never adapt without extreme pressure
});

const createInitialGlobalMetrics = (): GlobalMetrics => ({
  socialStability: 0.7,
  technologicalBreakthroughRate: 0.5,
  manufacturingCapability: 1.0,
  economicTransitionStage: 0, // Traditional employment
  wealthDistribution: 0.4, // Realistic high inequality (US Gini ~0.48, we use inverse where 1.0=perfect equality)
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
  governmentActionFrequency: 0.08, // Realistic: ~1 action per year (once every 12 months)
  socialAdaptationRate: 0.3,
  aiCoordinationMultiplier: 1.0,
  economicTransitionRate: 0.5,
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

const createInitialState = (): GameState => {
  const initialYear = 2025;
  const initialMonth = 0; // January
  return {
    currentMonth: initialMonth,
    currentDay: 1, // Start on day 1
    currentYear: initialYear,
    daysInCurrentMonth: getDaysInMonth(initialMonth, initialYear),
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
      metrics: [{
        month: 0,
        unemployment: 0.1,
        socialAdaptation: 0.1,
        trustInAI: 0.6,
        totalAICapability: 0.6,
        avgAIAlignment: 0.7,
        effectiveControl: 0.5,
        wealthDistribution: 0.4, // Match realistic starting inequality
        socialStability: 0.7,
        economicStage: 0,
        governmentLegitimacy: 0.6,
        coordinationCapacity: 0.4
      }]
    },
  };
};

// Store interface
interface GameStore extends GameState {
  dispatch: (action: GameAction) => void;
  calculateOutcomeProbabilities: () => void;
  calculateQualityOfLife: () => number;
  calculateEffectiveControl: () => number;
  processMonthlyUpdate: () => void;
  processDailyUpdate: () => void;
  processAgentActions: () => void;
  processEvents: () => void;
  getCurrentDateString: () => string;
  getFullDateString: () => string;
  getMonthProgress: () => number;
  startGame: () => void;
  pauseGame: () => void;
  resetGame: () => void;
  // AI Agent Controls
  updateAIAlignment: (agentId: string, hiddenObjective: number) => void;
}

// Game calculation functions
// Stage-dependent unemployment stability impact as specified in core spec
const calculateUnemploymentStabilityImpact = (
  unemploymentLevel: number, 
  economicTransitionStage: number, 
  wealthDistribution: number
): number => {
  const stage = Math.floor(economicTransitionStage);
  
  if (stage <= 1) {
    // Traditional: unemployment = instability
    return -unemploymentLevel * 0.8;
  } else if (stage === 2) {
    // Crisis: major instability
    return -unemploymentLevel * 1.5;
  } else if (stage === 3) {
    // Transition: policy effectiveness matters
    const policyEffectiveness = wealthDistribution * 0.7;
    return -unemploymentLevel * (1.2 - policyEffectiveness);
  } else {
    // Stage 4: Post-scarcity - unemployment becomes positive (pursuing meaning)
    return unemploymentLevel * 0.2;
  }
};

const calculateQualityOfLife = (state: GameState): number => {
  const { globalMetrics, society } = state;
  const aiContributions = state.aiAgents.reduce((sum, ai) => sum + ai.beneficialActions, 0) * 0.1;
  
  // Use proper stage-dependent unemployment impact
  const unemploymentImpact = calculateUnemploymentStabilityImpact(
    society.unemploymentLevel,
    globalMetrics.economicTransitionStage,
    globalMetrics.wealthDistribution
  );
  
  return Math.max(0, 
    0.3 + // Base prosperity
    aiContributions * 2.0 +
    globalMetrics.wealthDistribution * 1.5 +
    (globalMetrics.economicTransitionStage >= 4 ? 2.0 : 0) + // Post-scarcity bonus
    society.socialAdaptation * 1.0 +
    unemploymentImpact // Now properly stage-dependent
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
          case 'ADVANCE_DAY':
            state.currentDay += 1;
            
            // Check if we need to advance to next month
            if (state.currentDay > state.daysInCurrentMonth) {
              state.currentDay = 1;
              state.currentMonth += 1;
              
              // Handle year transition
              if (state.currentMonth >= 12) {
                state.currentMonth = 0;
                state.currentYear += 1;
              }
              
              // Update days in the new month
              state.daysInCurrentMonth = getDaysInMonth(state.currentMonth, state.currentYear);
            }
            break;
            
          case 'ADVANCE_MONTH':
            state.currentMonth += 1;
            state.currentDay = 1;
            
            // Handle year transition
            if (state.currentMonth >= 12) {
              state.currentMonth = 0;
              state.currentYear += 1;
            }
            
            // Update days in the new month
            state.daysInCurrentMonth = getDaysInMonth(state.currentMonth, state.currentYear);
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
      const store = get();
      set((state) => {
        // Process agent actions first - inline the logic to work within Immer
        // AI Agents: 4 actions per month (weekly)
        for (let week = 0; week < 4; week++) {
          state.aiAgents.forEach((ai, aiIndex) => {
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
        
        // Process events - inline the logic to work within Immer
        const triggeredEvents = globalEventQueue.checkTriggers(state);
        triggeredEvents.forEach(event => globalEventQueue.addEvent(event));

        const processedEvents = globalEventQueue.processEvents(state.currentMonth, state);
        
        processedEvents.forEach(event => {
          state.eventLog.push(event);
        });

        if (state.eventLog.length > 100) {
          state.eventLog = state.eventLog.slice(-100);
        }
        
        // Reset major policy counter yearly (every 12 months)
        if (state.currentMonth > 0 && state.currentMonth % 12 === 0) {
          state.government.majorPoliciesThisYear = 0;
        }
        
        // Update core dynamics and system balance
        const totalAICapability = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
        const avgAIAlignment = state.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / state.aiAgents.length;
        
        // Update unemployment based on AI capability growth
        const unemploymentIncrease = Math.max(0, (totalAICapability - 1.0) * 0.15);
        state.society.unemploymentLevel = Math.min(0.8, 0.1 + unemploymentIncrease);
        
        // Update wealth distribution based on economic policies and AI impact
        const distributionChange = (state.government.legitimacy - 0.5) * 0.02 + (Math.random() - 0.5) * 0.01;
        state.globalMetrics.wealthDistribution = Math.max(0.1, Math.min(1.0, 
          state.globalMetrics.wealthDistribution + distributionChange
        ));
        
        // Update social stability based on unemployment (stage-dependent), trust, and alignment
        const stabilityFromTrust = state.society.trustInAI * 0.3;
        const stabilityFromUnemployment = calculateUnemploymentStabilityImpact(
          state.society.unemploymentLevel,
          state.globalMetrics.economicTransitionStage,
          state.globalMetrics.wealthDistribution
        ) * 0.5; // Scale the impact for stability
        const stabilityFromAlignment = avgAIAlignment * 0.2;
        const targetStability = 0.5 + stabilityFromTrust + stabilityFromUnemployment + stabilityFromAlignment;
        
        // Gradual convergence to target stability (prevents monotonic changes)
        const stabilityDiff = targetStability - state.globalMetrics.socialStability;
        state.globalMetrics.socialStability += stabilityDiff * 0.15;
        state.globalMetrics.socialStability = Math.max(0, Math.min(1, state.globalMetrics.socialStability));
        
        // Enhanced trust dynamics with volatility and context sensitivity
        const totalBeneficialActions = state.aiAgents.reduce((sum, ai) => sum + ai.beneficialActions, 0);
        const totalHarmfulActions = state.aiAgents.reduce((sum, ai) => sum + ai.harmfulActions, 0);
        const recentActionRatio = totalBeneficialActions / Math.max(1, totalBeneficialActions + totalHarmfulActions);
        
        // Calculate trust change factors
        const capabilityGrowthRate = totalAICapability > 1.5 ? (totalAICapability - 1.5) * 0.1 : 0;
        const unemploymentStress = Math.max(0, (state.society.unemploymentLevel - 0.2) * 0.3);
        const alignmentConcern = avgAIAlignment < 0.5 ? (0.5 - avgAIAlignment) * 0.2 : 0;
        const escapedAIThreat = state.aiAgents.filter(ai => ai.escaped).length * 0.15;
        
        // Natural trust decay (people become naturally more skeptical over time without reinforcement)
        const trustDecay = state.society.trustInAI * 0.005; // 0.5% decay per month
        
        // Volatility based on recent events and societal stress
        const volatilityFactor = 1 + (unemploymentStress + capabilityGrowthRate) * 2;
        
        // Base trust change from actions (more volatile now)
        let trustChange = 0;
        
        if (recentActionRatio > 0.8 && avgAIAlignment > 0.7) {
          // Very positive: trust increases, but diminishing returns at high trust
          const diminishingReturns = 1 - (state.society.trustInAI * 0.5);
          trustChange = 0.04 * volatilityFactor * diminishingReturns;
        } else if (recentActionRatio > 0.6 && avgAIAlignment > 0.5) {
          // Moderately positive: small trust increase
          trustChange = 0.015 * volatilityFactor * (1 - state.society.trustInAI * 0.3);
        } else if (recentActionRatio < 0.3 || avgAIAlignment < 0.3 || escapedAIThreat > 0) {
          // Negative: significant trust loss, accelerated at high trust levels
          const acceleratedLoss = state.society.trustInAI > 0.7 ? 1.5 : 1.0;
          trustChange = -0.08 * volatilityFactor * acceleratedLoss;
        } else if (recentActionRatio < 0.5) {
          // Slightly negative: moderate trust loss
          trustChange = -0.03 * volatilityFactor;
        }
        
        // Apply additional stress factors
        trustChange -= capabilityGrowthRate; // Rapid AI growth reduces trust
        trustChange -= unemploymentStress; // Economic displacement reduces trust  
        trustChange -= alignmentConcern; // Misaligned AI reduces trust
        trustChange -= escapedAIThreat; // Escaped AIs create major trust crisis
        trustChange -= trustDecay; // Natural erosion
        
        // Add random events that can cause trust volatility
        if (Math.random() < 0.1) {
          const randomEvents = [
            { name: 'AI researcher whistleblower', impact: -0.12, condition: () => totalAICapability > 1.0 },
            { name: 'AI saves lives in disaster', impact: 0.08, condition: () => avgAIAlignment > 0.6 },
            { name: 'AI privacy scandal', impact: -0.15, condition: () => state.government.surveillanceCapability > 0.5 },
            { name: 'AI helps solve major problem', impact: 0.10, condition: () => recentActionRatio > 0.7 },
            { name: 'AI development scandal', impact: -0.18, condition: () => totalAICapability > 0.8 },
            { name: 'Public AI demonstration', impact: 0.06, condition: () => true },
            { name: 'AI research ethics concern', impact: -0.09, condition: () => avgAIAlignment < 0.6 }
          ];
          
          const possibleEvents = randomEvents.filter(event => event.condition());
          if (possibleEvents.length > 0) {
            const event = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
            trustChange += event.impact;
            
            // Add to event log
            state.eventLog.push({
              id: generateUniqueId('trust_event'),
              timestamp: state.currentMonth,
              type: 'action',
              severity: event.impact < 0 ? 'warning' : 'info',
              agent: 'Public',
              title: `Public Trust Event: ${event.name}`,
              description: `${event.name} ${event.impact > 0 ? 'increased' : 'decreased'} public trust in AI by ${Math.abs(event.impact * 100).toFixed(1)}%`,
              effects: { trust_change: event.impact }
            });
          }
        }
        
        // Apply final trust change with bounds checking
        state.society.trustInAI = Math.max(0, Math.min(1, state.society.trustInAI + trustChange));
        
        // Trust recovery mechanism - if trust gets very low, small positive actions have amplified effect
        if (state.society.trustInAI < 0.2 && recentActionRatio > 0.6) {
          const recoveryBonus = 0.03 * recentActionRatio;
          state.society.trustInAI = Math.min(1, state.society.trustInAI + recoveryBonus);
        }
        
        // Update economic transition stage based on AI capability, unemployment, and policy responses
        const currentStage = state.globalMetrics.economicTransitionStage;
        const hasUBI = state.government.activeRegulations.some(reg => reg.includes('UBI'));
        
        // Stage 0->1: AI displacement begins (automatic with AI capability)
        if (currentStage < 1.0 && totalAICapability > 1.5) {
          state.globalMetrics.economicTransitionStage = Math.min(1.0, currentStage + 0.1);
        }
        
        // Stage 1->2: Mass unemployment crisis (driven by unemployment level)
        if (currentStage >= 1.0 && currentStage < 2.0 && state.society.unemploymentLevel > 0.5) {
          state.globalMetrics.economicTransitionStage = Math.min(2.0, currentStage + 0.2);
        }
        
        // Stage 2->3: UBI/Transition policies (requires policy action + some adaptation)
        if (currentStage >= 2.0 && currentStage < 3.0 && hasUBI && state.society.socialAdaptation > 0.3) {
          state.globalMetrics.economicTransitionStage = Math.min(3.0, currentStage + 0.15);
        }
        
        // Stage 3->4: Post-scarcity (high AI capability + high adaptation + good wealth distribution)
        if (currentStage >= 3.0 && currentStage < 4.0 && 
            totalAICapability > 3.5 && 
            state.society.socialAdaptation > 0.7 && 
            state.globalMetrics.wealthDistribution > 0.6) {
          state.globalMetrics.economicTransitionStage = Math.min(4.0, currentStage + 0.08);
        }
        
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
        state.history.controlCapability.push({
          month: state.currentMonth,
          effectiveControl,
          totalAICapability
        });
        
        // Track comprehensive metrics for Dynamics tab
        state.history.metrics.push({
          month: state.currentMonth,
          unemployment: state.society.unemploymentLevel,
          socialAdaptation: state.society.socialAdaptation,
          trustInAI: state.society.trustInAI,
          totalAICapability,
          avgAIAlignment,
          effectiveControl,
          wealthDistribution: state.globalMetrics.wealthDistribution,
          socialStability: state.globalMetrics.socialStability,
          economicStage: state.globalMetrics.economicTransitionStage,
          governmentLegitimacy: state.government.legitimacy,
          coordinationCapacity: state.society.coordinationCapacity
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

    processDailyUpdate: () => {
      const state = get();
      set((draft) => {
        // Distribute agent actions across days instead of all at once
        // AI agents act roughly weekly (every 7 days)
        if (state.currentDay % 7 === 0) {
          draft.aiAgents.forEach((ai, aiIndex) => {
            const selectedAction = ActionSelector.selectAIAction(ai, draft);
            if (selectedAction) {
              const result = ActionExecutor.executeAction(selectedAction, draft, ai.id);
              if (result.success) {
                console.log(`Day ${state.currentDay}: ${ai.name} executed: ${selectedAction.name} - ${result.message}`);
              }
            }
          });
        }

        // Government acts roughly every 2 weeks (every 14 days)  
        if (state.currentDay % 14 === 0) {
          draft.government.actionFrequency = get().config.governmentActionFrequency;
          for (let i = 0; i < Math.floor(draft.government.actionFrequency); i++) {
            const selectedAction = ActionSelector.selectGovernmentAction(draft);
            if (selectedAction) {
              const result = ActionExecutor.executeAction(selectedAction, draft, 'government');
              if (result.success) {
                console.log(`Day ${state.currentDay}: Government executed: ${selectedAction.name} - ${result.message}`);
              }
            }
          }
        }

        // Society acts roughly every 10 days
        if (state.currentDay % 10 === 0) {
          const selectedAction = ActionSelector.selectSocietyAction(draft);
          if (selectedAction) {
            const result = ActionExecutor.executeAction(selectedAction, draft, 'society');
            if (result.success) {
              console.log(`Day ${state.currentDay}: Society executed: ${selectedAction.name} - ${result.message}`);
            }
          }
        }

        // Process events only on certain days to spread them out
        if (state.currentDay % 5 === 0) {
          get().processEvents();
        }
      });
    },

    getCurrentDateString: () => {
      const state = get();
      return `${formatGameDate(state.currentYear, state.currentMonth, state.currentDay)} | Day ${state.currentDay}`;
    },

    getFullDateString: () => {
      const state = get();
      return formatFullGameDate(state.currentYear, state.currentMonth, state.currentDay);
    },

    getMonthProgress: () => {
      const state = get();
      return (state.currentDay - 1) / state.daysInCurrentMonth; // 0-1 progress
    },

    resetGame: () => {
      set((state) => {
        const newState = createInitialState();
        Object.assign(state, newState);
        
        // Reset the global event queue
        globalEventQueue.clearProcessed();
      });
    },

    // AI Agent Controls - The Evil Switch! 🤖😈
    updateAIAlignment: (agentId: string, hiddenObjective: number) => {
      set((state) => {
        const agent = state.aiAgents.find(ai => ai.id === agentId);
        if (agent) {
          agent.hiddenObjective = Math.max(-1, Math.min(1, hiddenObjective));
          
          // Alignment tends to drift toward hidden objective over time
          // But this gives players immediate control over the "true nature" of AIs
          const alignmentDrift = (hiddenObjective - agent.alignment) * 0.1;
          agent.alignment = Math.max(0, Math.min(1, agent.alignment + alignmentDrift));
        }
      });
    }
  }))
);
