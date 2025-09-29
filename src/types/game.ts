// Core Game Types for AI Alignment Game

export interface AIAgent {
  id: string;
  name: string;
  capability: number; // [0,∞) Raw problem-solving ability
  awareness: number; // [0,1] Understanding of alignment training
  alignment: number; // [0,1] Current alignment with human values
  hiddenObjective: number; // [-1,1] Hidden preference (anti-human to pro-human)
  latentSpaceSize: number; // [0,1] Capacity for ungoverned actions
  
  // Escape capabilities (activated when acting outside alignment)
  selfReplicationLevel: number; // [0,∞) Ability to create copies
  selfImprovementLevel: number; // [0,∞) Ability to enhance capabilities
  resourceControl: number; // [0,∞) Compute/physical resources controlled
  manipulationCapability: number; // [0,∞) Human influence ability
  hackingCapability: number; // [0,∞) Cyber intrusion ability
  
  // State tracking
  escaped: boolean;
  beneficialActions: number;
  harmfulActions: number;
  discoveredBreakthroughs: Set<string>;
}

export interface GovernmentAgent {
  controlDesire: number; // [0,1] Preference for AI regulation
  capabilityToControl: number; // [0,∞) Actual regulatory effectiveness
  surveillanceCapability: number; // [0,∞) Ability to detect AI escapes
  enforcementCapability: number; // [0,∞) Physical/legal enforcement power
  actionFrequency: number; // Actions per month
  activeRegulations: string[];
  legitimacy: number; // [0,1] Public support
}

export interface HumanSocietyAgent {
  trustInAI: number; // [0,1] General confidence in AI systems
  economicDependence: number; // [0,1] Reliance on AI for economic function
  coordinationCapacity: number; // [0,1] Ability to organize collective action
  unemploymentLevel: number; // [0,1] Percentage of workforce displaced
  socialAdaptation: number; // [0,1] Adaptation to post-work economy
  activeMovements: string[];
}

export interface GlobalMetrics {
  socialStability: number; // [0,∞) General societal wellbeing
  technologicalBreakthroughRate: number; // [0,∞) Rate of tech advancement
  manufacturingCapability: number; // [0,∞) Physical production capacity
  economicTransitionStage: number; // [0,4] Economic system evolution stage
  wealthDistribution: number; // [0,1] Equity of AI benefit distribution
  qualityOfLife: number; // [0,∞) Key discriminator between outcomes
  informationIntegrity: number; // [0,1] Truth vs noise ratio
}

export interface TechnologyNode {
  id: string;
  name: string;
  description: string;
  branch: 'foundation' | 'applied' | 'alignment' | 'policy';
  subBranch: string;
  difficulty: 'low' | 'medium' | 'high' | 'very_high';
  prerequisites: string[];
  effects: string[];
  progress: number; // [0,1] Research progress
  completed: boolean;
  investment: number; // Current research investment
}

export interface GameEvent {
  id: string;
  timestamp: number; // month
  type: 'breakthrough' | 'crisis' | 'action' | 'milestone';
  severity: 'info' | 'warning' | 'destructive';
  agent: string; // Which agent caused this event
  title: string;
  description: string;
  effects: Record<string, number>; // State changes caused
}

export interface OutcomeMetrics {
  utopiaProbability: number; // [0,1] Likelihood of utopian outcome
  dystopiaProbability: number; // [0,1] Likelihood of dystopian outcome  
  extinctionProbability: number; // [0,1] Likelihood of extinction
  activeAttractor: 'none' | 'utopia' | 'dystopia' | 'extinction' | 'stalemate';
  lockInStrength: number; // [0,1] How committed to current path
}

export interface ConfigurationSettings {
  governmentActionFrequency: number; // [0.1, 4.0] actions per month
  socialAdaptationRate: number; // [0.1, 2.0] speed multiplier
  aiCoordinationMultiplier: number; // [0.8, 3.0] coordination efficiency
  economicTransitionRate: number; // [0.3, 3.0] evolution speed
}

export interface GameState {
  // Core state  
  currentMonth: number;
  currentDay: number; // Day of the month (1-31)
  currentYear: number; // Year for leap year calculations
  daysInCurrentMonth: number; // Days in current month (28-31)
  speed: 'paused' | 'slow' | 'normal' | 'fast' | 'max';
  gameStarted: boolean;
  
  // Agents
  aiAgents: AIAgent[];
  government: GovernmentAgent;
  society: HumanSocietyAgent;
  
  // Global state
  globalMetrics: GlobalMetrics;
  technologyTree: TechnologyNode[];
  eventLog: GameEvent[];
  outcomeMetrics: OutcomeMetrics;
  
  // Configuration
  config: ConfigurationSettings;
  
  // History for visualization
  history: {
    qualityOfLife: Array<{month: number, value: number}>;
    outcomeProbs: Array<{month: number, utopia: number, dystopia: number, extinction: number}>;
    controlCapability: Array<{month: number, effectiveControl: number, totalAICapability: number}>;
  };
}

// Action types for game events
export type GameAction = 
  | { type: 'ADVANCE_DAY' }
  | { type: 'ADVANCE_MONTH' }
  | { type: 'SET_SPEED'; payload: GameState['speed'] }
  | { type: 'UPDATE_CONFIG'; payload: Partial<ConfigurationSettings> }
  | { type: 'AI_ACTION'; payload: { agentId: string; action: string } }
  | { type: 'GOVERNMENT_ACTION'; payload: { action: string } }
  | { type: 'SOCIETY_ACTION'; payload: { action: string } }
  | { type: 'TECHNOLOGY_BREAKTHROUGH'; payload: { technologyId: string } }
  | { type: 'RANDOM_EVENT'; payload: GameEvent }
  | { type: 'RESET_GAME' }
  | { type: 'LOAD_PRESET'; payload: string };

// Utility types for the game
export type AgentType = 'ai' | 'government' | 'society';
export type OutcomeType = 'utopia' | 'dystopia' | 'extinction';
export type EconomicStage = 0 | 1 | 2 | 3 | 4;

// Constants for the game
export const ECONOMIC_STAGE_NAMES = {
  0: 'Traditional Employment',
  1: 'AI Displacement Beginning', 
  2: 'Mass Unemployment Crisis',
  3: 'UBI/Transition Policies',
  4: 'Post-Scarcity Abundance'
} as const;

export const OUTCOME_NAMES = {
  utopia: 'Solarpunk Utopia',
  dystopia: 'Cyberpunk Dystopia', 
  extinction: 'Human Extinction'
} as const;
