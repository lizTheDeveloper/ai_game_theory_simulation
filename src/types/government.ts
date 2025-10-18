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
    noiseInjection: number;      // [0,10] TIER 2 Phase 2A: Noise injection sandbagging detection ($B invested)
  };
  detectionTrust: number;        // [0,1] TIER 2 Phase 2A: Public trust in detection methods (erodes with false positives)
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

  // Cooperative Spirals: Institutional resilience (Oct 17, 2025)
  // Research: Acemoglu & Robinson (2001) - reforms can lock in during critical junctures
  institutionalResilience?: number;  // [0,1] Ability to maintain reforms during crises
  policyEffectivenessMultiplier?: number;  // [1.0-2.0] Multiplier from cooperative spirals
}
