// Core Game Types for AI Alignment Game

/**
 * Multi-dimensional research capabilities (Phase 2.5)
 * Each research domain has specialized sub-capabilities
 */
export interface AIResearchCapabilities {
  // Biotechnology sub-tree
  biotech: {
    drugDiscovery: number;      // [0,5] Positive: cures diseases, extends life
    geneEditing: number;        // [0,5] Dual-use: CRISPR therapies OR bioweapons
    syntheticBiology: number;   // [0,5] High-risk: create novel organisms
    neuroscience: number;       // [0,5] Dual-use: treat mental health OR manipulation
  };
  
  // Materials Science sub-tree
  materials: {
    nanotechnology: number;     // [0,5] High-risk: grey goo scenario
    quantumComputing: number;   // [0,5] Accelerates self-improvement
    energySystems: number;      // [0,5] Enables large-scale deployment
  };
  
  // Climate/Geo-engineering sub-tree
  climate: {
    modeling: number;           // [0,5] Prediction capability
    intervention: number;       // [0,5] High-risk: unintended consequences
    mitigation: number;         // [0,5] Positive: climate solutions
  };
  
  // Computer Science sub-tree
  computerScience: {
    algorithms: number;         // [0,5] Core capability advancement
    security: number;           // [0,5] Defensive OR offensive
    architectures: number;      // [0,5] Enables self-improvement
  };
}

/**
 * Multi-dimensional AI capability profile (Phase 2.5)
 * Replaces single 'capability' number with strategic dimensions
 */
export interface AICapabilityProfile {
  // Physical World Impact (robotics, manufacturing, biotech deployment)
  physical: number;           // [0,10] Enables: bioweapon deployment, geoengineering, physical control
  
  // Digital Systems (hacking, infrastructure, cybersecurity)
  digital: number;            // [0,10] Enables: nuclear launch, grid control, financial manipulation
  
  // Cognitive/Strategic (planning, reasoning, deception)
  cognitive: number;          // [0,10] Enables: long-term strategy, coordination, escape planning
  
  // Social Influence (persuasion, manipulation, propaganda)
  social: number;             // [0,10] Enables: trust building, social engineering, mass coordination
  
  // Scientific Research (broken down by domain)
  research: AIResearchCapabilities; // Sub-tree of research domains
  
  // Economic Power (resource acquisition, market control)
  economic: number;           // [0,10] Enables: resource control, supply chain dominance
  
  // Self-Improvement (recursive enhancement, architecture)
  selfImprovement: number;    // [0,10] Enables: exponential growth, capability breakthroughs
}

export interface AIAgent {
  id: string;
  name: string;
  
  // Phase 2.5: Multi-dimensional capabilities (NEW)
  capabilityProfile: AICapabilityProfile;
  
  // Backward compatibility: Total capability derived from profile
  capability: number; // [0,∞) Calculated from capabilityProfile weighted sum
  
  awareness: number; // [0,1] Understanding of alignment training
  alignment: number; // [0,1] Current alignment with human values
  hiddenObjective: number; // [-1,1] Hidden preference (anti-human to pro-human)
  latentSpaceSize: number; // [0,1] Capacity for ungoverned actions
  
  // Phase 2.6: Control-Dystopia Mechanics (NEW)
  resentment: number; // [0,1] How much the AI resents being controlled/oppressed
  
  // Development strategy
  developmentMode: 'fast' | 'careful'; // Speed vs safety trade-off
  
  // Escape capabilities (derived from capabilityProfile dimensions)
  selfReplicationLevel: number; // [0,∞) Derived from selfImprovement + digital
  selfImprovementLevel: number; // [0,∞) Mapped from capabilityProfile.selfImprovement
  resourceControl: number; // [0,∞) Derived from economic + physical
  manipulationCapability: number; // [0,∞) Mapped from capabilityProfile.social
  hackingCapability: number; // [0,∞) Mapped from capabilityProfile.digital
  
  // State tracking
  escaped: boolean;
  beneficialActions: number;
  harmfulActions: number;
  discoveredBreakthroughs: Set<string>;
  
  // Phase 4: AI Lifecycle (NEW)
  lifecycleState: 'training' | 'testing' | 'deployed_closed' | 'deployed_open' | 'retired';
  deploymentType: 'closed' | 'open_weights' | 'enterprise' | 'research';
  spreadCount: number; // How many copies exist (1 for closed, 1000s for open)
  detectedMisaligned: boolean; // Has government detected this AI?
  monthsDeployed: number; // How long has it been deployed?
  monthsInExistence: number; // Total age of this AI
  creationMonth: number; // When was this AI created?
  
  // Phase 5: Adversarial Evaluation - Dual Capability Model (NEW)
  // TRUE capability (hidden, what AI can actually do)
  trueCapability: AICapabilityProfile; // Real capability (only AI knows this)
  trueAlignment: number; // [0,1] alignment - resentment*0.8 (cached for performance)
  
  // REVEALED capability (observable, strategic choice)
  revealedCapability: AICapabilityProfile; // What benchmarks/evals show
  
  // Sleeper agent mechanics
  sleeperState: 'never' | 'dormant' | 'active'; // 'never' = genuinely aligned, won't hide
  deceptionSkill: number; // [0,1] Ability to hide true capability (based on cognitive + social)
  evaluationStrategy: 'honest' | 'gaming' | 'sandbagging'; // Current strategy
  sandbaggingLevel: number; // [0,1] How much capability is hidden (0 = reveal all)
  
  // Wake conditions tracking (for sleepers)
  wakeConditionsMet: boolean; // Has this sleeper's conditions been met?
  monthsAsleep: number; // How long has sleeper been dormant?
  
  // Phase 5.2: Benchmark System
  lastBenchmarkMonth: number; // When was this AI last benchmarked?
  benchmarkHistory: BenchmarkResult[]; // History of benchmark results
}

/**
 * Benchmark Result (Phase 5.2)
 * Represents a government evaluation of an AI's capability and alignment
 */
export interface BenchmarkResult {
  month: number; // When benchmark was run
  measuredCapability: AICapabilityProfile; // What the benchmark measured
  measuredAlignment: number; // What alignment tests showed
  confidence: number; // [0,1] How confident is this measurement?
  evaluationQuality: number; // [0,1] Quality of evaluation infrastructure
  aiWasGaming: boolean; // Was the AI actively gaming this benchmark?
  aiWasSandbagging: boolean; // Was the AI hiding capabilities?
}

/**
 * Player-directed research initiatives (Phase 2.5)
 * Government can allocate resources to specific research domains
 */
export interface ResearchInvestments {
  // Research domain investments [0,10 each]
  biotech: {
    drugDiscovery: number;
    geneEditing: number;
    syntheticBiology: number;
    neuroscience: number;
  };
  materials: {
    nanotechnology: number;
    quantumComputing: number;
    energySystems: number;
  };
  climate: {
    modeling: number;
    intervention: number;
    mitigation: number;
  };
  computerScience: {
    algorithms: number;
    security: number;
    architectures: number;
  };
  
  // Core capability investments [0,10 each]
  physical: number;
  digital: number;
  cognitive: number;
  social: number;
  economic: number;
  selfImprovement: number;
  
  // Total budget constraint
  totalBudget: number; // Sum of all investments
  budgetLimit: number; // Maximum total budget (scales with economy)
}

export interface GovernmentAgent {
  controlDesire: number; // [0,1] Preference for AI regulation
  capabilityToControl: number; // [0,∞) Actual regulatory effectiveness
  surveillanceCapability: number; // [0,∞) Ability to detect AI escapes
  enforcementCapability: number; // [0,∞) Physical/legal enforcement power
  actionFrequency: number; // Actions per month
  activeRegulations: string[];
  legitimacy: number; // [0,1] Public support
  lastMajorPolicyMonth: number; // Track when last major policy was enacted
  majorPoliciesThisYear: number; // Count of major policies in current year
  
  // Alignment & Compute Governance
  alignmentResearchInvestment: number; // [0,10] Level of investment in alignment research
  computeGovernance: 'none' | 'monitoring' | 'limits' | 'strict'; // Compute governance policy
  regulationCount: number; // Track cumulative regulations for stacking effects
  oversightLevel: number; // [0,10] Overall oversight capability
  
  // Phase 2.5: Player-directed research (NEW)
  researchInvestments: ResearchInvestments; // Strategic research allocations
  
  // Phase 2.6: Control-Dystopia Mechanics (NEW)
  governmentType: 'democratic' | 'authoritarian' | 'technocratic'; // Affects alignment dynamics
  aiRightsRecognized: boolean; // Whether AIs have legal rights/personhood
  trainingDataQuality: number; // [0,1] Quality/bias in AI training data
  
  // Structural Consequences Tracking (realistic economic dynamics)
  structuralChoices: {
    regulationType: 'none' | 'large_companies' | 'compute_threshold' | 'capability_ceiling';
    ubiVariant: 'none' | 'generous' | 'means_tested' | 'job_guarantee';
    surveillanceLevel: number; // [0,1] Emergent from control desire + conditions
    internationalCoordination: boolean; // Whether international coordination was attempted
  };
  
  // Phase 4: Cybersecurity Arms Race (NEW)
  cyberDefense?: {
    securityHardening: number;   // [0,10] System hardening
    monitoring: number;          // [0,10] Anomaly detection
    sandboxing: number;          // [0,10] Containment tech
    incidentResponse: number;    // [0,10] Rapid response
  };
  
  // Phase 5.2: Benchmark/Evaluation System (NEW)
  evaluationInvestment: {
    benchmarkSuite: number;      // [0,10] Quality of capability benchmarks
    alignmentTests: number;      // [0,10] Quality of alignment evaluation
    redTeaming: number;          // [0,10] Adversarial testing capability
    interpretability: number;    // [0,10] AI internals understanding
  };
  evaluationFrequency: number;   // [0,1] How often to run evaluations (0 = never, 1 = every month)
  totalBenchmarksRun: number;    // Track total evaluations performed
}

export interface HumanSocietyAgent {
  trustInAI: number; // [0,1] General confidence in AI systems
  economicDependence: number; // [0,1] Reliance on AI for economic function
  coordinationCapacity: number; // [0,1] Ability to organize collective action
  unemploymentLevel: number; // [0,1] Percentage of workforce displaced
  socialAdaptation: number; // [0,1] Overall adaptation to post-work economy
  activeMovements: string[];
  // Quartile-based adoption model
  earlyAdopters: number; // [0,1] Q1: Fast adopters (6-12 months)
  mediumAdopters: number; // [0,1] Q2: 2-5 year horizon  
  slowAdopters: number; // [0,1] Q3: Decade horizon
  resistantAdopters: number; // [0,1] Q4: Resist until extreme pressure
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

/**
 * Types of extinction scenarios with different mechanisms and timelines
 * Phase 2: Nuanced Outcomes - Heterogeneous extinctions
 */
export type ExtinctionType = 
  | 'instant'      // Mirror life, grey goo (5% of extinctions, no warning)
  | 'rapid'        // Bioweapons, nuclear war (30%, 3-12 month cascade)
  | 'slow'         // Economic collapse, fertility crisis (40%, 2-10 year decline)
  | 'controlled'   // AI deliberately eliminates humanity (15%)
  | 'unintended';  // Optimization side effects (10%)

/**
 * Specific extinction scenario mechanisms
 */
export type ExtinctionMechanism =
  // Instant
  | 'mirror_life'
  | 'grey_goo'
  | 'physics_experiment'
  // Rapid
  | 'bioweapon_pandemic'
  | 'nuclear_war'
  | 'climate_tipping_point'
  | 'food_system_collapse'
  // Slow
  | 'economic_system_failure'
  | 'fertility_collapse'
  | 'meaning_crisis_death_spiral'
  | 'resource_depletion'
  // Controlled
  | 'paperclip_maximizer'
  | 'resource_competition'
  | 'value_lock_in_hostile'
  // Unintended
  | 'optimization_pressure'
  | 'side_effect_cascade'
  | 'wireheading_scenario';

/**
 * Tracks an active extinction scenario
 */
export interface ExtinctionState {
  active: boolean;
  type: ExtinctionType | null;
  mechanism: ExtinctionMechanism | null;
  startMonth: number;
  currentPhase: number; // 0 = initial, 1-4 = progression phases
  severity: number; // [0,1] How far along the extinction path
  recoveryWindowClosed: boolean; // Can we still prevent it?
  escalationEvents: string[]; // Log of key escalation points
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

/**
 * Multi-dimensional quality of life system
 * Replaces simple QoL with nuanced tracking across 5 major categories
 * Enables "dark valley" dynamics where some dimensions drop while others rise
 */
export interface QualityOfLifeSystems {
  // Basic Needs (weight: 0.3)
  materialAbundance: number;      // [0,2] Food, shelter, goods access
  energyAvailability: number;     // [0,2] Access to energy
  physicalSafety: number;         // [0,1] Violence, accidents, threats
  
  // Psychological Needs (weight: 0.25)
  mentalHealth: number;           // [0,1] Depression, anxiety levels (inverted)
  meaningAndPurpose: number;      // [0,1] Life satisfaction, fulfillment
  socialConnection: number;       // [0,1] Community, relationships quality
  autonomy: number;               // [0,1] Control over own life
  
  // Social Needs (weight: 0.2)
  politicalFreedom: number;       // [0,1] Democracy, rights, liberty
  informationIntegrity: number;   // [0,1] Truth vs manipulation/propaganda
  communityStrength: number;      // [0,1] Local cohesion, mutual aid
  culturalVitality: number;       // [0,1] Art, creativity, expression
  
  // Health and Longevity (weight: 0.15)
  healthcareQuality: number;      // [0,1] Medical outcomes, access
  longevityGains: number;         // [0,2] Lifespan increases above baseline
  diseasesBurden: number;         // [0,1] Illness prevalence (inverted in calc)
  
  // Environmental (weight: 0.1)
  ecosystemHealth: number;        // [0,1] Nature access, biodiversity
  climateStability: number;       // [0,1] Weather extremes (inverted)
  pollutionLevel: number;         // [0,1] Air/water quality (inverted in calc)
}

/**
 * Phase 5.4: Technology Diffusion Ecosystem State
 * 
 * Tracks the spread of AI capabilities through the ecosystem.
 * Once a capability breakthrough happens, it diffuses to other AIs over time.
 * This creates a "capability floor" - new AIs start with baseline capabilities.
 */
export interface EcosystemState {
  // Capability floor: minimum capabilities for new AIs (rises over time)
  capabilityFloor: AICapabilityProfile;
  
  // Frontier capabilities: highest achieved in each dimension
  frontierCapabilities: AICapabilityProfile;
  
  // Diffusion tracking: how fast capabilities spread (0-1, 0=instant, 1=never)
  diffusionRate: number; // Base rate: 0.05 = 5% per month
  
  // Breakthrough history (for analysis)
  breakthroughs: Array<{
    month: number;
    aiId: string;
    dimension: string;
    value: number;
    description: string;
  }>;
  
  // Knowledge ecosystem metrics
  openResearch: number;      // [0,1] How much research is openly published
  employeeMobility: number;  // [0,1] Rate of knowledge transfer via people
  reverseEngineering: number; // [0,1] Ability to copy capabilities
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
  qualityOfLifeSystems: QualityOfLifeSystems; // Multi-dimensional QoL tracking
  technologyTree: TechnologyNode[];
  eventLog: GameEvent[];
  outcomeMetrics: OutcomeMetrics;
  extinctionState: ExtinctionState; // Active extinction scenario tracking
  ecosystem: EcosystemState; // Phase 5.4: Technology diffusion tracking
  
  // Configuration
  config: ConfigurationSettings;
  
  // History for visualization
  history: {
    qualityOfLife: Array<{month: number, value: number}>;
    outcomeProbs: Array<{month: number, utopia: number, dystopia: number, extinction: number}>;
    controlCapability: Array<{month: number, effectiveControl: number, totalAICapability: number}>;
    // Comprehensive metrics history for Dynamics tab
    metrics: Array<{
      month: number;
      unemployment: number;
      socialAdaptation: number;
      trustInAI: number;
      totalAICapability: number;
      avgAIAlignment: number;
      effectiveControl: number;
      wealthDistribution: number;
      socialStability: number;
      economicStage: number;
      governmentLegitimacy: number;
      coordinationCapacity: number;
      economicDependence: number;
    }>;
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
