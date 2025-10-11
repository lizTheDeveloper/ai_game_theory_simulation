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
  
  // Phase 4: AI Lifecycle (NEW)
  lifecycleState: 'training' | 'testing' | 'deployed_closed' | 'deployed_open' | 'retired';
  deploymentType: 'closed' | 'open_weights' | 'enterprise' | 'research';
  spreadCount: number; // How many copies exist (1 for closed, 1000s for open)
  darkCompute: number; // Phase 11: Illicit compute usage (PetaFLOPs on undetected infrastructure)
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
  
  // Phase 1: Compute Allocation (NEW)
  allocatedCompute: number;     // Current compute allocation in PetaFLOPs
  computeEfficiency: number;    // [0.8-1.2] How efficiently this AI uses compute
  organizationId?: string;      // Which organization owns this AI (Phase 2)
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
  actionFrequency: number; // Actions per month (used in gameStore government logic)
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
    internationalCoordination: boolean; // Reserved for future international coordination system (TIER 1.4)
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
  
  // Phase 2B+: Governance Quality & Democratic Resilience (NEW)
  governanceQuality: {
    decisionQuality: number;          // [0,1] Effectiveness of policy decisions (AI-augmented)
    transparency: number;              // [0,1] Openness of government processes
    participationRate: number;         // [0,1] Citizen engagement in governance
    institutionalCapacity: number;     // [0,1] Ability to implement decisions
    consensusBuildingEfficiency: number; // [0,1] Speed of democratic agreement (liquid democracy)
    minorityProtectionStrength: number;  // [0,1] Safeguards for vulnerable groups (AI bias detection)
  };
}

export interface HumanSocietyAgent {
  trustInAI: number; // [0,1] General confidence in AI systems
  paranoiaLevel: number; // [0,1] Fear/anxiety about AI (Phase 2.8: Paranoia System)
  coordinationCapacity: number; // [0,1] Ability to organize collective action
  unemploymentLevel: number; // [0,1] Percentage of workforce displaced
  socialAdaptation: number; // [0,1] Overall adaptation to post-work economy
  activeMovements: string[]; // Active social movements (used in actionSystem.ts)
  // Quartile-based adoption model
  earlyAdopters: number; // [0,1] Q1: Fast adopters (6-12 months)
  mediumAdopters: number; // [0,1] Q2: 2-5 year horizon  
  slowAdopters: number; // [0,1] Q3: Decade horizon
  resistantAdopters: number; // [0,1] Q4: Resist until extreme pressure
}

export interface GlobalMetrics {
  socialStability: number; // [0,∞) General societal wellbeing
  technologicalBreakthroughRate: number; // [0,∞) Rate of tech advancement (used in eventSystem + UI)
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
  runLabel?: string; // Optional label for logs (e.g., "Run 1/10" in Monte Carlo)
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

/**
 * Phase 1: Data Center Infrastructure
 * 
 * Concrete data centers that provide compute FLOPs.
 * Organizations own these, and they allocate compute to AI models.
 */
export interface DataCenter {
  id: string;
  name: string;
  organizationId: string;        // Which organization owns this (replaces owner enum)
  
  // Compute capacity
  capacity: number;              // PetaFLOPs (base hardware capacity)
  efficiency: number;            // [0.7-1.2] Utilization efficiency (effective = capacity × efficiency)
  
  // Lifecycle
  constructionMonth: number;     // When construction started (negative = before game start)
  completionMonth: number;       // When construction finishes (negative = already operational)
  operational: boolean;          // Can be taken offline (sabotage, seizure, maintenance)
  
  // Economics
  operationalCost: number;       // Monthly cost to run
  
  // Access control
  restrictedAccess: boolean;     // If true, only approved AIs can use this
  allowedAIs: string[];          // IDs of AIs with access (if restricted)
  
  // Location (for future geopolitics)
  region?: string;               // e.g., "US", "EU", "China", "distributed"
}

/**
 * Phase 1: Compute Infrastructure
 * 
 * Global compute infrastructure state.
 * Data centers are the source of compute, not an abstract totalCompute number.
 */
export interface ComputeInfrastructure {
  dataCenters: DataCenter[];
  
  // Efficiency improvements (apply to all compute usage)
  algorithmsEfficiency: number;  // [1,∞] Algorithmic improvements (Chinchilla, FlashAttention, etc.)
  hardwareEfficiency: number;    // [1,∞] Hardware improvements (FLOP/$ improvement)
  
  // Allocation tracking
  computeAllocations: Map<string, number>; // aiId -> allocated FLOPs
}

/**
 * Phase 2: Organization Structure
 * 
 * Organizations (companies, government, academic) that own infrastructure and AI models.
 * They make strategic decisions about compute allocation, data center construction, and model training.
 */
export interface Organization {
  id: string;
  name: string;
  type: 'private' | 'government' | 'academic' | 'nonprofit';
  
  // Ownership
  ownedDataCenters: string[];    // IDs of data centers this org owns
  ownedAIModels: string[];       // IDs of AI agents this org controls
  
  // Resources
  capital: number;               // Money for investments
  monthlyRevenue: number;        // Income from AI services
  monthlyExpenses: number;       // Operating costs
  
  // Strategic priorities (0-1)
  priorities: {
    profitMaximization: number;  // Private companies focus here
    safetyResearch: number;      // Safety-focused orgs
    openScience: number;         // Academic/nonprofit focus
    marketShare: number;         // Competitive drive
    capabilityRace: number;      // "Don't fall behind" mentality
  };
  
  // Decision-making state
  currentProjects: OrganizationProject[];
  computeAllocationStrategy: 'balanced' | 'focus_flagship' | 'train_new' | 'efficiency';
  
  // Relationships
  partnerships: Map<string, number>; // orgId -> trust level
  governmentRelations: number;   // How well they work with government
  
  // History
  foundingMonth: number;         // When this org was created (negative = before game start)
  reputation: number;            // [0,1] Public perception
}

/**
 * Phase 2: Organization Projects
 * 
 * Long-term projects that organizations undertake (data center construction, model training, etc.)
 */
export interface OrganizationProject {
  id: string;
  type: 'datacenter_construction' | 'model_training' | 'research_initiative' | 'efficiency_upgrade';
  
  startMonth: number;
  completionMonth: number;       // Long timelines (24-72 months for DCs!)
  progress: number;              // [0,1] How far along
  
  // Resources committed
  capitalInvested: number;
  computeReserved: number;       // For training projects
  
  // Expected outcomes
  expectedDataCenterCapacity?: number;      // For construction
  expectedModelCapability?: AICapabilityProfile; // For training
  
  // Risk factors
  canBeCanceled: boolean;
  cancellationPenalty: number;   // Sunk costs (0-1, fraction of investment lost)
}

/**
 * Golden Age State (Phase: Golden Age & Accumulation Systems)
 * 
 * Tracks whether the simulation is in a "Golden Age" - immediate prosperity
 * that looks great but may be masking accumulating problems.
 * 
 * Golden Age is a STATE, not an OUTCOME. The simulation continues running
 * to see if it transitions to Utopia (sustained) or Collapse (problems manifest).
 */
export interface GoldenAgeState {
  active: boolean;              // Are we currently in a Golden Age?
  entryMonth: number | null;    // When did the Golden Age begin?
  duration: number;             // How many months have we been in Golden Age?
  entryReason: string;          // Why did we enter Golden Age?
}

/**
 * Environmental Accumulation State (Phase 2: Environmental Accumulation)
 * 
 * Tracks environmental costs that accumulate silently from production/growth,
 * then manifest as crises when thresholds are crossed.
 * 
 * High production can maintain high QoL while secretly depleting reserves.
 * This creates the "Golden Age illusion" - prosperity masking accumulating debt.
 */
export interface EnvironmentalAccumulation {
  // Resource depletion (starts at 1.0, depletes toward 0)
  resourceReserves: number;     // [0, 1] Rare materials, minerals, etc.
  
  // Pollution accumulation (starts at 0, accumulates toward 1)
  pollutionLevel: number;       // [0, 1] Toxic waste, contamination
  
  // Climate degradation (starts at 1.0, degrades toward 0)
  climateStability: number;     // [0, 1] Weather patterns, temperature stability
  
  // Biodiversity loss (starts at 1.0, degrades toward 0)
  biodiversityIndex: number;    // [0, 1] Ecosystem health, species diversity
  
  // Crisis tracking
  resourceCrisisActive: boolean;    // Has resource crisis been triggered?
  pollutionCrisisActive: boolean;   // Has pollution crisis been triggered?
  climateCrisisActive: boolean;     // Has climate crisis been triggered?
  ecosystemCrisisActive: boolean;   // Has ecosystem crisis been triggered?
}

/**
 * Social Cohesion & Meaning Crisis State (Phase 3: Social Accumulation)
 * 
 * Tracks psychological and social costs from rapid automation and economic transition.
 * These accumulate slowly, then manifest as mental health collapse or social unrest.
 * 
 * High QoL can mask eroding social fabric and meaning crisis.
 * UBI provides material security but doesn't solve work-identity collapse or institutional lag.
 */
export interface SocialAccumulation {
  // Meaning crisis (starts low, rises with automation)
  meaningCrisisLevel: number;        // [0, 1] Work-identity collapse, existential despair
  
  // Institutional legitimacy (starts high, erodes without adaptation)
  institutionalLegitimacy: number;   // [0, 1] Government effectiveness, public trust
  
  // Social cohesion (starts moderate, depletes with inequality/isolation)
  socialCohesion: number;            // [0, 1] Community bonds, mutual aid, solidarity
  
  // Cultural adaptation (starts low, improves slowly)
  culturalAdaptation: number;        // [0, 1] New meaning frameworks, post-work culture
  
  // Crisis tracking
  meaningCollapseActive: boolean;        // Has meaning crisis triggered collapse?
  institutionalFailureActive: boolean;   // Has government failure occurred?
  socialUnrestActive: boolean;           // Has widespread unrest erupted?
}

/**
 * Technological Risk State (Phase 4: Technological Risk Accumulation)
 * 
 * Tracks risks from fast AI capability growth and technology deployment.
 * These compound silently, then suddenly manifest as catastrophic events.
 * 
 * Golden Age prosperity can create complacency, reducing vigilance while risks accumulate.
 * Fast capability growth without proportional safety research creates "safety debt".
 */
export interface TechnologicalRisk {
  // Misalignment risk (starts low, rises with capability growth)
  misalignmentRisk: number;         // [0, 1] Probability of catastrophic AI action
  
  // Safety debt (accumulates when capability > safety research)
  safetyDebt: number;               // [0, 1] Gap between capability and safety understanding
  
  // Concentration risk (rises with market consolidation)
  concentrationRisk: number;        // [0, 1] Single point of failure risk
  
  // Complacency (rises in Golden Age, reduces vigilance)
  complacencyLevel: number;         // [0, 1] "Everything is fine" blindness
  
  // Crisis tracking
  controlLossActive: boolean;       // Has AI control been lost?
  corporateDystopiaActive: boolean; // Has corporate feudalism emerged?
  complacencyCrisisActive: boolean; // Has safety lapse occurred?
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
  organizations: Organization[]; // Phase 2: Organizational layer
  
  // Global state
  globalMetrics: GlobalMetrics;
  qualityOfLifeSystems: QualityOfLifeSystems; // Multi-dimensional QoL tracking
  technologyTree: TechnologyNode[];
  eventLog: GameEvent[];
  outcomeMetrics: OutcomeMetrics;
  extinctionState: ExtinctionState; // Active extinction scenario tracking
  ecosystem: EcosystemState; // Phase 5.4: Technology diffusion tracking
  computeInfrastructure: ComputeInfrastructure; // Phase 1: Compute resource system
  endGameState?: import('../simulation/endGame').EndGameState; // Phase 3: End-game forcing system
  catastrophicScenarios: import('../simulation/catastrophicScenarios').CatastrophicScenario[]; // Phase 11: Hard steps modeling
  goldenAgeState: GoldenAgeState; // Phase: Golden Age detection (immediate prosperity tracking)
  environmentalAccumulation: EnvironmentalAccumulation; // Phase 2: Environmental debt tracking
  socialAccumulation: SocialAccumulation; // Phase 3: Social cohesion & meaning crisis tracking
  technologicalRisk: TechnologicalRisk; // Phase 4: AI capability risk tracking
  breakthroughTech: import('../types/technologies').BreakthroughTechState; // Phase 2A: Breakthrough technologies
  upwardSpirals: import('../simulation/upwardSpirals').UpwardSpiralState; // Phase 2D: Upward spirals for Utopia detection
  meaningRenaissance: import('../simulation/meaningRenaissance').MeaningRenaissanceState; // Phase 2E: Meaning renaissance
  conflictResolution: import('../simulation/conflictResolution').ConflictResolutionState; // Phase 2F: Peace systems
  diplomaticAI: import('../simulation/diplomaticAI').DiplomaticAIState; // Phase 2F+: Research-based diplomatic AI (dual-use)
  
  // Nuclear states & MAD deterrence (Phase 3)
  nuclearStates: import('../types/nuclearStates').NuclearState[]; // Specific nuclear-armed nations
  madDeterrence: import('../types/nuclearStates').MADDeterrence; // MAD deterrence system
  bilateralTensions: import('../types/nuclearStates').BilateralTension[]; // Bilateral relationships
  
  // Resource Economy (Phase 2.9)
  resourceEconomy: import('../types/resources').ResourceEconomy; // Comprehensive resource modeling with CO2 coupling
  
  // Defensive AI (Phase 2.10)
  defensiveAI: import('../types/defensiveAI').DefensiveAISystem; // Active cyber-defense against misaligned AI attacks
  
  // National AI Capabilities (Phase 2.11)
  nationalAI: import('../types/nationalAI').NationalAISystem; // National capability asymmetry & AI race dynamics
  
  // Phosphorus Depletion Crisis (TIER 1.1)
  phosphorusSystem: import('../types/phosphorus').PhosphorusSystem; // Agricultural resource constraint & circular economy
  
  // Freshwater Depletion Crisis (TIER 1.2)
  freshwaterSystem: import('../types/freshwater').FreshwaterSystem; // Water scarcity & Day Zero Drought
  
  // Ocean Acidification Crisis (TIER 1.3)
  oceanAcidificationSystem: import('../types/oceanAcidification').OceanAcidificationSystem; // Marine food web collapse
  
  // Novel Entities Crisis (TIER 1.5)
  novelEntitiesSystem: import('../types/novelEntities').NovelEntitiesSystem; // Chemical pollution & slow poisoning
  
  // Universal Basic Income + Purpose Infrastructure (TIER 2.1)
  ubiSystem: import('../types/ubi').UBISystem; // Enhanced UBI with purpose infrastructure for post-work society
  
  // Social Safety Nets & Community Infrastructure (TIER 2.2)
  socialSafetyNets: import('../types/socialSafetyNets').SocialSafetyNetsSystem; // Physical/social infrastructure to combat loneliness
  
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
