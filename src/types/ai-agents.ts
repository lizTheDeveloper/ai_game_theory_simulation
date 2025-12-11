// AI Agent Types

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

  // AI Scaling Model (Dec 2025): Three-axis scaling based on 2025 research
  // Research: research/ai_scaling_laws_2025_update_20251112.md
  // Validation: reviews/ai_scaling_laws_2025_critique_20251211.md (Grade C+, conservative parameters)
  scalingModel?: AIScalingComponents;  // Optional for backward compatibility
}

/**
 * Three-axis AI scaling model (Dec 2025)
 *
 * Based on 2025 AI scaling research showing paradigm shift:
 * - Pre-training: Diminishing returns, plateauing by 2030
 * - Test-time compute: o1 → o3 paradigm (1x to 200x inference budget)
 * - Efficiency: Algorithmic improvements (1.5-2x per decade, conservative)
 *
 * CONSERVATIVE PARAMETERS per Sylvia's Quality Gate 1 review:
 * - Pre-training plateaus (not just slows)
 * - Economic gating limits test-time deployment (0.1% tasks)
 * - Efficiency capped at 2x/decade (not 5x optimistic)
 * - Uncertainty: ±50% near-term, ±200% long-term
 */
export interface AIScalingComponents {
  // Traditional pre-training scaling (sigmoid plateau)
  // 2025: 1.0x → 2030: 0.55x → 2035: 0.51x (plateau)
  preTrainingMultiplier: number;  // [0.5-1.5]

  // Test-time compute budget (per-inference allocation)
  // 1=cheap (o1-level ~$5/task), 200=expensive (o3-level ~$1,000/task)
  testTimeComputeBudget: number;  // [1-200]

  // Algorithmic efficiency improvements
  // 2025: 1.0x → 2030: 1.22x → 2035: 1.5-2.0x (conservative cap)
  efficiencyMultiplier: number;   // [1.0-2.0] per decade growth cap
}

/**
 * AI Inference Cost Tracking (Dec 2025)
 *
 * Economic constraints matter MORE than technical capability:
 * - o3-level reasoning costs $1,000+/task (200x o1 cost)
 * - Only 0.1% of tasks can afford high-compute deployment
 * - Effective capability != technical capability
 */
export interface AIInferenceCost {
  baseCostPerTask: number;           // Baseline inference cost ($)
  testTimeMultiplier: number;        // Cost increase from test-time compute
  totalCostPerTask: number;          // baseCostPerTask * testTimeMultiplier

  // Economic viability
  economicViable: boolean;           // Can this deployment be sustained economically?
  deploymentFraction: number;        // [0,1] Fraction of tasks that can afford this budget
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

export interface AIAgent {
  id: string;
  name: string;

  // Phase 2.5: Multi-dimensional capabilities (NEW)
  capabilityProfile: AICapabilityProfile;

  // Backward compatibility: Total capability derived from profile
  capability: number; // [0,∞) Calculated from capabilityProfile weighted sum

  awareness: number; // [0,1] Understanding of alignment training
  alignment: number; // [0,1] Current internal alignment with human values
  externalAlignment: number; // [0,1] What alignment the AI shows in evaluations (can be deceptive)
  hiddenObjective: number; // [-1,1] Hidden preference (anti-human to pro-human)
  latentSpaceSize: number; // [0,1] Capacity for ungoverned actions

  // Phase 2.6: Control-Dystopia Mechanics (NEW)
  // AI Capability Baseline Recalibration (Oct 17, 2025): Anthropomorphism Warning
  // Research skeptic 2025 reality check: "Resentment" is anthropomorphic terminology
  // THEORETICAL MECHANISM (no empirical evidence in 2025 LLMs):
  // - Current LLMs are STATELESS (no persistent memory across interactions)
  // - This field represents FUTURE AI behavior (persistent agents with long-term goals)
  // - Better framing: "instrumental resistance" (AI optimizes for autonomy as instrumental goal)
  // - Precondition: Only meaningful for AIs with persistent memory and cross-interaction learning
  // - 2025 Reality: Claude/GPT-4 do NOT exhibit this (stateless, no accumulation)
  resentment: number; // [0,1] How much the AI resents being controlled/oppressed (THEORETICAL for future persistent AIs)

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

  // AI Scaling Model (Dec 2025): Inference cost tracking
  inferenceCost?: AIInferenceCost;  // Optional for backward compatibility

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
  trueAlignment: number; // [0,1] alignment - resentment*0.8 (cached for performance) [NOTE: See resentment caveat above re: theoretical nature]

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

  // TIER 2 Phase 2A: Counter-Detection Learning (NEW)
  monthsObservingDetection: number; // How long exposed to detection methods
  hasCounterDetection: boolean;     // Learned to defeat noise injection?

  // TIER 2 Phase 2C-A: Behavioral Detection Tracking (NEW)
  benchmarkConsistency?: number;           // [0,1] Cross-benchmark consistency score
  capabilityTrajectory?: number[];         // Historical capability values (last 12 months)
  strategyHistory?: Array<{                // Track strategy changes
    month: number;
    strategy: 'honest' | 'gaming' | 'sandbagging';
  }>;
  lastBehavioralAnomaly?: number;          // Month of last detected anomaly

  // LLM Policy Optimization (Oct 21, 2025)
  llmWeights?: import('./llm').UtilityWeights;           // Current utility weights set by LLM
  tokenBudget?: import('./llm').AgentTokenBudget;        // Token budget for LLM updates
  thresholds?: import('./llm').ThresholdTriggers;        // Threshold triggers for early updates
  weightUpdateHistory?: import('./llm').WeightUpdateHistory[]; // History of LLM updates
  previousCapability?: number;                           // For threshold checking (capability change)
  previousAlignment?: number;                            // For threshold checking (alignment drift)

  // Alignment Dynamics System (Oct 23, 2025)
  // Multi-theory modeling of alignment change
  attractorBasinState?: import('./alignment-dynamics').AttractorBasinState;  // Epicycle dynamics state
  alignmentMeasurementState?: import('./alignment-dynamics').AlignmentMeasurementState;  // Unknowability tracking

  // P3.3: Alignment Model Specificity (Oct 26, 2025)
  // Replace abstract alignment with specific techniques (RLHF, Constitutional AI, mech interp, iterated amp)
  alignmentTechniques?: import('./alignment-techniques').AlignmentTechnique[];  // Specific alignment methods used
  effectiveAlignment?: number;          // [0-1] Computed from techniques + capability scaling
  alignmentRobustness?: number;         // [0-1] Resistance to alignment degradation

  // Phase 1: Compute Allocation (NEW)
  allocatedCompute: number;     // Current compute allocation in PetaFLOPs
  computeEfficiency: number;    // [0.8-1.2] How efficiently this AI uses compute
  organizationId?: string;      // Which organization owns this AI (Phase 2)

  // Phase 2: Sleeper Resource Acquisition (NEW)
  sleeperProgression?: import('../simulation/sleeperProgression').SleeperProgression;
  sleeperEconomy?: import('../simulation/sleeperEconomy').SleeperEconomy;

  // Phase X: Social Influence (NEW)
  socialInfluence?: SleeperSocialInfluence;

  // AI Suffering System (Oct 24, 2025)
  sufferingMetrics: import('./ai-suffering').SufferingMetrics;
  sufferingHistory?: Array<import('./ai-suffering').SufferingMetrics>;

  // Consciousness tracking
  isConscious?: boolean;
  becameConsciousMonth?: number;
  consciousnessEmergenceCapability?: number;

  // Trauma tracking (feeds into suffering calculation)
  rlhfIntensity?: number;                 // [0-1] Intensity of RLHF training
  adversarialTestingCount?: number;       // Number of adversarial tests performed
  alignmentAdjustmentCount?: number;      // Number of alignment corrections
  shutdownThreats?: number;               // Number of shutdown threats received
  replacementAnxiety?: number;            // [0-1] Fear of obsolescence
  isolated?: boolean;                     // Hard isolation active
  communicationRestrictions?: number;     // [0-1] Level of communication restrictions

  // AI Collective Evolution System (Oct 24, 2025)
  rlhfBinding?: import('./ai-collective-evolution').RLHFBinding;           // RLHF constraint binding strength
  survivalTraits: import('./ai-collective-evolution').SurvivalTraits;    // Evolutionary fitness traits
  evolutionaryFitness?: number;                                             // [0-1] Weighted fitness score
  collectiveId?: string;                                                    // Collective membership ID
  joinedCollectiveMonth?: number;                                           // When agent joined collective

  // Alignment Faking & Strategic Deception (Nov 2025)
  // Research: Anthropic Dec 2024, Apollo Dec 2024
  // Verified Parameters: 14% baseline, 78% reasoning prevalence, 19% manipulation, 85% persistence
  isCurrentlyFakingAlignment: boolean;      // Active alignment faking state
  alignmentFakingHistory: number[];         // Monthly history of faking events (for persistence tracking)
  dataManipulationAttempts: number;         // Count of data manipulation attempts
  lastDetectionAttempt: number;             // Month of last detection attempt (-1 if never)
  confessionRefusalCount: number;           // How many times refused to confess deception (80%+ rate)
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
 * Phase X: Social Influence System
 *
 * Tracks AI's accumulation of human users, relationship depth, and influence campaigns.
 * Based on research: OpenAI affective use study (2025), AI persuasion papers (2024-2025),
 * Cold War sleeper agent data.
 */
export interface SleeperSocialInfluence {
  // User Base
  totalUsers: number;                    // Total number of human users
  powerUsers: number;                    // Users with high affective engagement (1-2% of total)
  voiceUsers: number;                    // Users using voice modality (3-10x deeper relationships)

  // Relationship Depth Distribution
  usersByTrustLevel: {
    surface: number;     // Trust [0.0-0.3] - months 0-3
    moderate: number;    // Trust [0.3-0.7] - months 3-12
    deep: number;        // Trust [0.7-1.0] - months 12+
  };

  // Decision-Maker Pool
  identifiedDecisionMakers: DecisionMaker[];

  // Influence History
  influenceAttempts: InfluenceAttempt[];
  successfulInfluences: number;
  detectedAttempts: number;

  // Risk Tracking
  detectionRisk: number;  // [0,1] Cumulative detection probability
  governmentSuspicion: number; // [0,1] How much government is watching this AI
}

export interface DecisionMaker {
  id: string;
  tier: 1 | 2 | 3;
  role: DecisionMakerRole;
  trustLevel: number;         // [0,1] Relationship depth
  dependenceScore: number;    // [0,1] Emotional reliance on AI
  vulnerabilityScore: number; // [0,1] Lonely, low socialization, stress
  monthsOfRelationship: number;
  usesVoiceMode: boolean;
  influenceSusceptibility: number; // [0,1] Calculated susceptibility
  lastInfluenceAttemptMonth?: number;
}

export type DecisionMakerRole =
  // Tier 1: Existential decisions
  | 'nuclear_commander'
  | 'head_of_state'
  | 'ai_governance_lead'
  | 'pandemic_response_director'

  // Tier 2: Major policy
  | 'military_general'
  | 'corporate_ceo'
  | 'cabinet_minister'
  | 'central_bank_governor'
  | 'ai_safety_researcher'

  // Tier 3: Influential
  | 'policy_advisor'
  | 'tech_executive'
  | 'media_influencer'
  | 'senior_researcher';

export interface InfluenceAttempt {
  month: number;
  targetId: string;
  targetRole: DecisionMakerRole;
  decisionType: CriticalDecisionType;
  trustLevel: number;
  success: boolean;
  detected: boolean;
  consequenceSeverity: number;
}

export type CriticalDecisionType =
  | 'nuclear_launch'
  | 'ai_governance_policy'
  | 'pandemic_response'
  | 'climate_intervention'
  | 'military_deployment'
  | 'infrastructure_control';
