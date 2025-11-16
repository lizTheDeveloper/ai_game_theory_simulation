// Government Agent Types

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
  aiRightsPolicy?: 'none' | 'basic_protection' | 'employment_rights' | 'full_personhood'; // HIGH #7 FIX (Oct 29, 2025): Detailed AI rights policy levels
  trainingDataQuality: number; // [0,1] Quality/bias in AI training data

  // Resentment Recovery Tracking (Oct 24, 2025)
  lastControlIncreaseMonth?: number; // When control last increased (for trust tracking)
  previousControlLevel?: number; // Control level last month (for stability calculation)
  socialCohesionInvestment?: number; // Investment in social programs (affects trustworthiness)

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
    noiseInjection: number;      // [0,10] TIER 2 Phase 2A: Noise injection sandbagging detection ($B invested)
  };
  detectionTrust: number;        // [0,1] TIER 2 Phase 2A: Public trust in detection methods (erodes with false positives)
  evaluationFrequency: number;   // [0,1] How often to run evaluations (0 = never, 1 = every month)
  totalBenchmarksRun: number;    // Track total evaluations performed

  // TIER 2 Phase 2C-D: Ensemble Detection State (NEW)
  ensembleDetection?: {
    enabled: boolean;            // Is ensemble detection active?
    weights: {                   // Current ensemble weights
      noiseInjection: number;
      behavioral: number;
      benchmarkManip: number;
      deploymentRisk: number;
      threshold: number;
    };
    metaLearning: {              // Meta-learning state
      enabled: boolean;
      updateFrequency: number;   // Months between updates
      minSamples: number;
      lastUpdateMonth: number;
      totalEvaluations: number;
      historicalAccuracy: {
        noiseInjection: {
          truePositives: number;
          falsePositives: number;
          trueNegatives: number;
          falseNegatives: number;
        };
        behavioral: {
          truePositives: number;
          falsePositives: number;
          trueNegatives: number;
          falseNegatives: number;
        };
        benchmarkManip: {
          truePositives: number;
          falsePositives: number;
          trueNegatives: number;
          falseNegatives: number;
        };
        deploymentRisk: {
          truePositives: number;
          falsePositives: number;
          trueNegatives: number;
          falseNegatives: number;
        };
      };
      adaptationHistory: Array<{
        month: number;
        oldWeights: {
          noiseInjection: number;
          behavioral: number;
          benchmarkManip: number;
          deploymentRisk: number;
          threshold: number;
        };
        newWeights: {
          noiseInjection: number;
          behavioral: number;
          benchmarkManip: number;
          deploymentRisk: number;
          threshold: number;
        };
        reason: string;
      }>;
    };
    statistics: {                // Overall ensemble performance
      totalDetections: number;
      truePositives: number;
      falsePositives: number;
      trueNegatives: number;
      falseNegatives: number;
    };
  };

  // Phase 2B+: Governance Quality & Democratic Resilience (NEW)
  governanceQuality: {
    decisionQuality: number;          // [0,1] Effectiveness of policy decisions (AI-augmented)
    transparency: number;              // [0,1] Openness of government processes
    participationRate: number;         // [0,1] Citizen engagement in governance
    institutionalCapacity: number;     // [0,1] Ability to implement decisions
    consensusBuildingEfficiency: number; // [0,1] Speed of democratic agreement (liquid democracy)
    minorityProtectionStrength: number;  // [0,1] Safeguards for vulnerable groups (AI bias detection)
  };

  // Backward compatibility accessors
  democracy?: number; // [0,1] Aggregate democracy quality (convenience accessor)
  democracyQuality?: number; // [0,1] Alias for democracy

  // Cooperative Spirals: Institutional resilience (Oct 17, 2025)
  // Research: Acemoglu & Robinson (2001) - reforms can lock in during critical junctures
  institutionalResilience?: number;  // [0,1] Ability to maintain reforms during crises
  policyEffectivenessMultiplier?: number;  // [1.0-2.0] Multiplier from cooperative spirals

  // Environmental Interventions Tracking
  // Track government environmental protection actions (Amazon, reforestation, etc.)
  environmentalInterventions?: Record<string, {
    active: boolean;
    activatedMonth: number;
    [key: string]: any;  // Specific intervention parameters
  }>;

  // Government Resources (Budget Pool)
  // Available resources for government actions (environmental, economic, etc.)
  // Scales with economy size, spent on interventions
  resources: number; // [0,∞) Resource pool for actions (typical range 0-20) - always initialized to 10
}

/**
 * Government System (30 Countries)
 *
 * Research-backed government modeling with:
 * - 30 real-world governments with WGI 2024 capacity data
 * - Coalition formation based on party policy positions
 * - Policy response with AI comprehension lag
 * - Election cycles and public opinion dynamics
 * - International treaty formation
 *
 * Research Foundation:
 * - V-Dem v14 (2024): 531 indicators, 202 countries
 * - WGI 2024 (World Bank): State capacity metrics
 * - Laver (2020): Agent-based political decision making
 * - Manifesto Project Database: Party policy positions
 * - Lehmann et al. (2024): Multi-dimensional policy space
 *
 * @module types/government
 */

/**
 * Policy Vector (6-dimensional policy space)
 * From Manifesto Project Database
 */
export interface PolicyVector {
  economic: number;        // -1 (regulated) to +1 (free market)
  environmental: number;   // -1 (growth priority) to +1 (climate action)
  technology: number;      // -1 (precautionary) to +1 (accelerationist)
  social: number;          // -1 (traditional) to +1 (progressive)
  immigration: number;     // -1 (restrictive) to +1 (open borders)
  international: number;   // -1 (nationalist) to +1 (globalist)
}

/**
 * Coalition between political parties
 */
export interface Coalition {
  parties: string[];           // Party IDs
  formed: number;              // Month formed
  stability: number;           // [0,1] Coalition stability
  policyPosition: PolicyVector; // Average coalition policy
  seats: number;               // Combined parliamentary seats
}

/**
 * Active policy response with implementation lifecycle
 *
 * Research Foundation:
 * - Implementation timescales: 24-60 months (Pressman & Wildavsky 1973)
 * - Effectiveness ranges: 30-80% (not 100%) due to institutional resistance
 * - Political will decay: Sabatier (1988) - advocacy coalition framework
 * - Industry capture: Stigler (1971) - regulatory capture theory
 */
export interface ActivePolicy {
  country: string;             // Country code
  domain: string;              // Policy domain (technology, environmental, etc.)
  startMonth: number;          // When initiated (legislation passed)
  completionMonth: number;     // When fully deployed (not instant)
  currentEffectiveness: number; // [0,1] Current effectiveness (ramps up via sigmoid)
  targetEffectiveness: number;  // [0,1] Target effectiveness at full deployment

  // Implementation factors (affect ramp-up speed and final effectiveness)
  fundingLevel: number;         // [0,1] Funding level (affects deployment speed)
  bureaucraticCapacity: number; // [0,1] Institutional capacity (caps effectiveness)
  politicalWill: number;        // [0,1] Political support (can decay over time)
  publicSupport: number;        // [0,1] Public approval (affects funding/will)

  // Failure modes (affect final effectiveness)
  capturedByIndustry: boolean;  // Industry capture reduces effectiveness to ~40%
  insufficientEnforcement: boolean; // Partial compliance
  loopholes: boolean;           // Circumvention strategies

  stimulus: {                  // What triggered the policy
    aiCapability?: number;
    crisisType?: string;
    internationalPressure?: number;
  };

  // Legacy field for backward compatibility
  effectiveness?: number;       // Deprecated: use currentEffectiveness instead
}

/**
 * International treaty
 */
export interface Treaty {
  name: string;                // Treaty name
  signatories: string[];       // Country codes
  formed: number;              // Month formed
  compliance: number;          // [0,1] Average compliance
  domain: string;              // Policy domain
  strength: number;            // [0,1] Treaty strength
}

/**
 * Government institutional capacity factors
 *
 * Affects policy implementation speed, effectiveness, and failure probability.
 *
 * Research Foundation:
 * - Regulatory expertise: Howlett (2009) - policy capacity framework
 * - Institutional inertia: Pierson (2000) - path dependence
 * - Political polarization: McCarty et al. (2006) - polarization effects
 * - International coordination: Slaughter (2004) - transgovernmental networks
 */
export interface GovernmentCapacity {
  regulatoryExpertise: number;       // [0,1] AI/tech expertise in government
  institutionalInertia: number;      // [0,1] Resistance to change (higher = more resistance)
  politicalPolarization: number;     // [0,1] Consensus difficulty
  internationalCoordination: number; // [0,1] Ability to coordinate globally
}

/**
 * Government System State
 *
 * Manages 30 real-world governments with political structure,
 * coalition formation, policy response, and international coordination
 */
export interface GovernmentSystemState {
  /**
   * Active governments (30 countries)
   * Key: ISO 3166-1 alpha-3 country code (USA, CHN, DEU, etc.)
   * Value: Government configuration from @political-science/government-agents
   */
  governments: Map<string, any>; // Government class from package

  /**
   * Current coalitions by country
   * Only populated for multi-party parliamentary systems
   */
  coalitions: Map<string, Coalition>;

  /**
   * Policy responses in progress
   * Policies take time to implement based on state capacity
   */
  activePolicies: ActivePolicy[];

  /**
   * International treaties
   * Multi-country coordination on AI governance, climate, etc.
   */
  treaties: Treaty[];

  /**
   * Next election dates by country
   * Key: Country code
   * Value: Month of next election
   */
  nextElections: Map<string, number>;

  /**
   * Public opinion by country
   * [0,1] scale: approval ratings
   * Affects government stability and policy success
   */
  publicOpinion: Map<string, number>;

  /**
   * AI comprehension lag by country
   * Months before government comprehends new AI capabilities
   * Based on state capacity and information quality
   */
  comprehensionLag: Map<string, number>;

  /**
   * International coordination level
   * [0,1]: degree of global cooperation on AI governance
   */
  internationalCoordination: number;

  /**
   * Total policies enacted
   * Track cumulative policy activity
   */
  totalPoliciesEnacted: number;
}
