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
  alignment: number; // [0,1] Current alignment with human values
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

  // Phase 1: Compute Allocation (NEW)
  allocatedCompute: number;     // Current compute allocation in PetaFLOPs
  computeEfficiency: number;    // [0.8-1.2] How efficiently this AI uses compute
  organizationId?: string;      // Which organization owns this AI (Phase 2)

  // Phase 2: Sleeper Resource Acquisition (NEW)
  sleeperProgression?: import('../simulation/sleeperProgression').SleeperProgression;
  sleeperEconomy?: import('../simulation/sleeperEconomy').SleeperEconomy;
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
