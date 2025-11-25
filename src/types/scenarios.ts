/**
 * Scenario Analysis Framework - Type Definitions
 *
 * Created: November 10, 2025
 * Purpose: Define interfaces for testing governance/social sufficiency scenarios
 * Context: God mode diagnostics revealed tech alone insufficient - need systematic testing
 *
 * Research Foundation:
 * - reviews/god_mode_spiral_diagnostics_20251110.md (Phase 1 findings)
 * - research/GOD_MODE_ANALYSIS_model_mechanisms_20251110.md (mechanism verification)
 */

/**
 * Starting condition modifications for scenario testing
 */
export interface ScenarioStartingConditions {
  /** Boost governance quality (0-1) before tech deployment */
  governanceQuality?: number;

  /** Boost institutional capacity (0-1) */
  institutionalCapacity?: number;

  /** Boost physical safety baseline (0-1) */
  physicalSafety?: number;

  /** Boost information integrity (0-1) */
  informationIntegrity?: number;

  /** Boost trust in AI (0-1) */
  trustInAI?: number;

  /** Boost collective action willingness (0-1) */
  collectiveActionWillingness?: number;

  /** QoL dimension boosts (force specific dimensions to threshold levels) */
  qolBoosts?: {
    // Tier 1: Basic Needs
    materialAbundance?: number;
    energyAvailability?: number;
    physicalSafety?: number;

    // Tier 2: Psychological Needs
    mentalHealth?: number;
    meaningAndPurpose?: number;
    socialConnection?: number;
    autonomy?: number;

    // Tier 3: Social & Civic
    politicalFreedom?: number;
    informationIntegrity?: number;
    communityStrength?: number;
    culturalVitality?: number;

    // Tier 4: Health & Longevity
    healthcareQuality?: number;
    longevityGains?: number;
    diseasesBurden?: number;

    // Tier 5: Environmental Quality
    ecosystemHealth?: number;
    climateStability?: number;
    pollutionLevel?: number;
  };

  /** Start tech deployment X months before 2025 baseline (negative = early start) */
  techDeploymentStartMonth?: number;
}

/**
 * Government priority overrides for scenario testing
 * Used by ApplyScenarioPrioritiesPhase to force specific government behaviors
 *
 * ADAPTIVE SPENDING (Nov 25, 2025):
 * - Fixed dollar amounts (researchInvestment, aiSafetyBudget) cause crashes during GDP collapse
 * - Use GDP-proportional rates (researchInvestmentRate, aiSafetyBudgetRate) instead
 * - Phase calculates: spending = GDP × rate (adapts to economic conditions)
 */
export interface ScenarioGovernmentPriorities {
  /** Research investment (billions/month) - DEPRECATED: Use researchInvestmentRate for GDP-adaptive spending */
  researchInvestment?: number;

  /** Research investment rate (0-1, fraction of annual GDP) - RECOMMENDED: Adapts to GDP changes */
  researchInvestmentRate?: number;

  /** Climate spending (0-1, fraction of GDP) */
  climateSpending?: number;

  /** Redistribution rate (0-1, fraction of GDP) - activates/adjusts UBI */
  redistributionRate?: number;

  /** AI safety budget (billions/month) - DEPRECATED: Use aiSafetyBudgetRate for GDP-adaptive spending */
  aiSafetyBudget?: number;

  /** AI safety budget rate (0-1, fraction of annual GDP) - RECOMMENDED: Adapts to GDP changes */
  aiSafetyBudgetRate?: number;

  /** Democracy level (0-1) - sets transparency, participation, etc. */
  democracyLevel?: number;

  /** Government type */
  governmentType?: 'democratic' | 'authoritarian' | 'mixed' | 'technocratic';
}

/**
 * Technology deployment strategy for scenarios
 */
export interface TechDeploymentStrategy {
  /** Deployment mode */
  mode: 'immediate' | 'sequenced' | 'adaptive' | 'prioritized';

  /** For 'sequenced': Deploy in tier order with gaps */
  sequencedConfig?: {
    /** Months between tier deployments */
    gapMonths: number;
    /** Tier order (default: TIER 0 → 1 → 2 → 3 → 4) */
    tierOrder?: number[];
  };

  /** For 'adaptive': Deploy based on conditions */
  adaptiveConfig?: {
    /** Deploy when governance quality > threshold */
    governanceThreshold?: number;
    /** Deploy when safety > threshold */
    safetyThreshold?: number;
    /** Max techs per month */
    maxTechsPerMonth?: number;
  };

  /** For 'prioritized': Deploy specific tech categories first */
  prioritizedConfig?: {
    /** Priority order: ['climate', 'governance', 'food', 'water', ...] */
    priorities: string[];
    /** Months between priority groups */
    gapMonths: number;
  };

  /** Deployment level (0-1, default: 1.0 for god mode) */
  deploymentLevel?: number;

  /** Specific techs to deploy (if not deploying all) */
  specificTechs?: string[];
}


/**
 * Government decision override for scenario testing
 */
export interface GovernmentPriorityOverride {
  /** Apply this override to all governments or specific countries */
  scope: 'global' | 'country';

  /** If scope='country', list of country names */
  countries?: string[];

  /** Priority overrides (replace default government decision-making) */
  priorities: {
    /** Climate mitigation priority (0-1) */
    climateMitigation?: number;
    /** Inequality reduction priority (0-1) */
    inequalityReduction?: number;
    /** AI safety priority (0-1) */
    aiSafety?: number;
    /** Economic growth priority (0-1) */
    economicGrowth?: number;
    /** Social stability priority (0-1) */
    socialStability?: number;
    /** Environmental protection priority (0-1) */
    environmentalProtection?: number;
  };

  /** Force specific comprehension level (override AI comprehension lag) */
  comprehensionOverride?: number; // 0-1

  /** Force specific trust level (override trust dynamics) */
  trustOverride?: number; // 0-1

  /** Force specific institutional capacity */
  institutionalCapacityOverride?: number; // 0-1
}

/**
 * Complete scenario definition
 */
export interface ScenarioDefinition {
  /** Scenario ID (e.g., 'early-start-10yr', 'governance-first', 'sequenced-deployment') */
  id: string;

  /** Human-readable name */
  name: string;

  /** Description of what this scenario tests */
  description: string;

  /** Research hypothesis being tested */
  hypothesis: string;

  /** Starting condition modifications */
  startingConditions?: ScenarioStartingConditions;

  /** Technology deployment strategy */
  techDeployment: TechDeploymentStrategy;

  /** Government priority overrides (applied every month by ApplyScenarioPrioritiesPhase) */
  governmentPriorities?: ScenarioGovernmentPriorities;

  /** Government behavior overrides (for multi-country scenarios) */
  governmentOverrides?: GovernmentPriorityOverride[];

  /** Comparison baseline scenario (default: 'no-tech' or 'god-mode') */
  baselineScenario?: string;

  /** Expected outcome (for validation) */
  expectedOutcome?: {
    /** Which spirals should activate */
    expectedActiveSpirals?: string[];
    /** Minimum cascade strength */
    minCascadeStrength?: number;
    /** Expected trust cascades */
    expectedTrustCascades?: number;
    /** Expected outcome classification */
    expectedOutcomeClass?: string;
  };
}

/**
 * Scenario execution result
 */
export interface ScenarioResult {
  /** Scenario ID */
  scenarioId: string;

  /** Simulation seed used */
  seed: number;

  /** Final outcome */
  outcome: string;

  /** Months simulated */
  monthsSimulated: number;

  /** Spiral activation summary */
  spiralActivation: {
    /** Active upward spirals at end */
    activeUpwardSpirals: string[];
    /** Cascade achieved */
    cascadeActive: boolean;
    /** Cascade strength (0-2.0) */
    cascadeStrength: number;
    /** Trust cascades triggered */
    trustCascadesTriggered: number;
    /** Positive tipping point cascades */
    tippingPointCascades: number;
  };

  /** QoL metrics at end */
  finalQoL: {
    survivalAvg: number;
    basicNeedsAvg: number;
    psychologicalAvg: number;
    socialAvg: number;
    healthAvg: number;
    environmentalAvg: number;
    overallAvg: number;
  };

  /** Environmental state at end */
  finalEnvironment: {
    globalTempDelta: number;
    co2Concentration: number;
    extinctionRate: number;
  };

  /** Population at end */
  finalPopulation: number;

  /** Planetary boundaries breached */
  boundariesBreached: string[];
}

/**
 * Scenario comparison analysis
 */
export interface ScenarioComparison {
  /** Baseline scenario result */
  baseline: ScenarioResult;

  /** Test scenario result */
  test: ScenarioResult;

  /** Delta analysis */
  deltas: {
    /** Spiral activation improvement */
    spiralDelta: {
      additionalSpiralsActive: string[];
      cascadeStrengthChange: number;
      trustCascadeChange: number;
    };

    /** QoL improvement */
    qolDelta: {
      survivalChange: number;
      basicNeedsChange: number;
      psychologicalChange: number;
      socialChange: number;
      healthChange: number;
      environmentalChange: number;
      overallChange: number;
    };

    /** Environmental improvement */
    environmentDelta: {
      tempChange: number;
      co2Change: number;
      extinctionChange: number;
    };

    /** Population change */
    populationDelta: number;

    /** Outcome improvement */
    outcomeImproved: boolean;
  };

  /** Hypothesis validation */
  hypothesisValidated: boolean;

  /** Key findings */
  findings: string[];
}

/**
 * Predefined scenarios for testing
 */
export const SCENARIO_CATALOG = {
  /** Baseline: No technology deployed */
  'no-tech': {
    id: 'no-tech',
    name: 'No Technology Baseline',
    description: 'Simulation with zero tech deployed (pure 2025 trajectory)',
    hypothesis: 'Establishes baseline for comparison',
    techDeployment: { mode: 'immediate' as const, specificTechs: [] },
  },

  /** God mode: All tech immediately */
  'god-mode': {
    id: 'god-mode',
    name: 'God Mode (All Tech Immediate)',
    description: 'All 73 technologies deployed at 100% from month 0',
    hypothesis: 'Tests technology sufficiency',
    techDeployment: { mode: 'immediate' as const },
  },

  /** Early start: Deploy 10 years before 2025 */
  'early-start-10yr': {
    id: 'early-start-10yr',
    name: 'Early Start (10 Years)',
    description: 'Deploy all tech 10 years before 2025 (month -120)',
    hypothesis: 'Tests time constant hypothesis - do spirals need more time to establish?',
    startingConditions: { techDeploymentStartMonth: -120 },
    techDeployment: { mode: 'immediate' as const },
  },

  /** Governance first: Boost social foundations before tech */
  'governance-first': {
    id: 'governance-first',
    name: 'Governance First',
    description: 'Boost governance quality, safety, information integrity to 0.8 before deploying tech',
    hypothesis: 'Tests dependency hypothesis - do social foundations enable tech effectiveness?',
    startingConditions: {
      governanceQuality: 0.8,
      institutionalCapacity: 0.8,
      physicalSafety: 0.8,
      informationIntegrity: 0.8,
      collectiveActionWillingness: 0.7,
    },
    techDeployment: { mode: 'immediate' as const },
  },

  /** Sequenced deployment: Deploy in tier waves */
  'sequenced-deployment': {
    id: 'sequenced-deployment',
    name: 'Sequenced Deployment',
    description: 'Deploy tech in tier waves (TIER 0 → 1 → 2 → 3 → 4) with 12-month gaps',
    hypothesis: 'Tests absorption capacity - does gradual deployment allow institutions to adapt?',
    techDeployment: {
      mode: 'sequenced' as const,
      sequencedConfig: { gapMonths: 12, tierOrder: [0, 1, 2, 3, 4] },
    },
  },

  /** Climate prioritized: Deploy climate tech first */
  'climate-prioritized': {
    id: 'climate-prioritized',
    name: 'Climate Prioritized',
    description: 'Deploy climate mitigation tech first, then other categories',
    hypothesis: 'Tests whether focusing on single boundary enables ecosystem cascade',
    techDeployment: {
      mode: 'prioritized' as const,
      prioritizedConfig: {
        priorities: ['climate', 'energy', 'environment', 'governance', 'social'],
        gapMonths: 6,
      },
    },
  },

  /** === GOVERNMENT PRIORITY SCENARIOS (Phase 2) === */

  /** Climate First: Maximize climate tech spending */
  'climate-first': {
    id: 'climate-first',
    name: 'Climate First',
    description: 'Government maximizes climate tech spending (10% GDP/month)',
    hypothesis: 'Tests whether maximal climate investment enables environmental spiral activation',
    techDeployment: { mode: 'sequenced' as const, sequencedConfig: { gapMonths: 6 } },
    governmentPriorities: {
      climateSpending: 0.10, // 10% of GDP per month (extreme but testable)
      researchInvestmentRate: 0.005, // 0.5% of annual GDP (adapts to GDP changes)
    },
  },

  /** Equality First: Maximize redistribution (Gini <0.30 target) */
  'equality-first': {
    id: 'equality-first',
    name: 'Equality First',
    description: 'Government maximizes redistribution targeting Gini <0.30 (Nordic levels)',
    hypothesis: 'Tests whether reducing inequality enables social spiral activation',
    techDeployment: { mode: 'sequenced' as const, sequencedConfig: { gapMonths: 6 } },
    governmentPriorities: {
      redistributionRate: 0.025, // 2.5% of GDP per month (30% annually = Nordic level)
      researchInvestmentRate: 0.005, // 0.5% of annual GDP (adapts to GDP changes)
    },
  },

  /** AI Alignment First: Max alignment research + strict controls */
  'ai-alignment-first': {
    id: 'ai-alignment-first',
    name: 'AI Alignment First',
    description: 'Government maximizes AI alignment research (1% GDP) with strict controls',
    hypothesis: 'Tests whether prioritizing alignment enables trust/safety spirals',
    techDeployment: { mode: 'sequenced' as const, sequencedConfig: { gapMonths: 6 } },
    governmentPriorities: {
      aiSafetyBudgetRate: 0.01, // 1% of annual GDP on alignment research (adapts to GDP)
      researchInvestmentRate: 0.005, // 0.5% of annual GDP general research
    },
  },

  /** Democratic Participation: Max transparency + participation */
  'democratic-participation': {
    id: 'democratic-participation',
    name: 'Democratic Participation',
    description: 'Government maximizes transparency and participation (democracy = 0.9)',
    hypothesis: 'Tests whether high democracy enables governance spiral activation',
    techDeployment: { mode: 'sequenced' as const, sequencedConfig: { gapMonths: 6 } },
    governmentPriorities: {
      democracyLevel: 0.9, // Very high democracy
      researchInvestmentRate: 0.005, // 0.5% of annual GDP (adapts to GDP changes)
    },
  },

  /** Scientific Acceleration: Max research investment */
  'scientific-acceleration': {
    id: 'scientific-acceleration',
    name: 'Scientific Acceleration',
    description: 'Government maximizes research investment (2% GDP)',
    hypothesis: 'Tests whether massive research spending enables breakthrough cascades',
    techDeployment: { mode: 'sequenced' as const, sequencedConfig: { gapMonths: 6 } },
    governmentPriorities: {
      researchInvestmentRate: 0.02, // 2% of annual GDP (4× baseline, adapts to GDP)
    },
  },

  /** Authoritarian Efficiency: Rapid deployment, low democracy */
  'authoritarian-efficiency': {
    id: 'authoritarian-efficiency',
    name: 'Authoritarian Efficiency',
    description: 'Government prioritizes rapid deployment with low democracy (0.3)',
    hypothesis: 'Tests whether authoritarian coordination enables faster tech adoption',
    techDeployment: { mode: 'sequenced' as const, sequencedConfig: { gapMonths: 6 } },
    governmentPriorities: {
      governmentType: 'authoritarian',
      democracyLevel: 0.3, // Low democracy
      researchInvestmentRate: 0.005, // 0.5% of annual GDP (adapts to GDP changes)
    },
  },

  /** === STARTING CONDITION SCENARIOS (Phase 2) === */

  /** High Trust Start: Trust in AI=0.8, institutions=0.7 */
  'high-trust-start': {
    id: 'high-trust-start',
    name: 'High Trust Start',
    description: 'Start with high trust in AI (0.8) and institutions (0.7)',
    hypothesis: 'Tests whether high initial trust enables spiral activation',
    techDeployment: { mode: 'immediate' as const },
    startingConditions: {
      trustInAI: 0.8,
      institutionalCapacity: 0.7,
      governanceQuality: 0.7,
    },
  },

  /** Low Inequality Start: Gini=0.25 (Nordic levels) */
  'low-inequality-start': {
    id: 'low-inequality-start',
    name: 'Low Inequality Start',
    description: 'Start with Gini=0.25 (Nordic levels of equality)',
    hypothesis: 'Tests whether low initial inequality enables social spirals',
    techDeployment: { mode: 'immediate' as const },
    startingConditions: {
      qolBoosts: {
        // Boost dimensions affected by low inequality
        materialAbundance: 0.7,
        politicalFreedom: 0.8,
        mentalHealth: 0.7,
      },
    },
    governmentPriorities: {
      redistributionRate: 0.10, // 10% GDP redistribution to maintain low Gini
    },
  },

  /** Strong Institutions Start: Governance quality=0.8 */
  'strong-institutions-start': {
    id: 'strong-institutions-start',
    name: 'Strong Institutions Start',
    description: 'Start with strong institutions (governance quality=0.8)',
    hypothesis: 'Tests whether strong institutions enable governance spirals',
    techDeployment: { mode: 'immediate' as const },
    startingConditions: {
      governanceQuality: 0.8,
      institutionalCapacity: 0.8,
      physicalSafety: 0.8,
      informationIntegrity: 0.8,
    },
  },

  /** === TECHNOLOGY DEPLOYMENT STRATEGIES (Phase 2) === */

  /** Renewable Energy First: Energy tech deployed month 0, rest sequenced */
  'renewable-first': {
    id: 'renewable-first',
    name: 'Renewable Energy First',
    description: 'Deploy renewable energy tech immediately, then sequence other tech',
    hypothesis: 'Tests whether energy abundance unlocks other tech effectiveness',
    techDeployment: {
      mode: 'prioritized' as const,
      prioritizedConfig: {
        priorities: ['energy', 'climate', 'environment', 'governance', 'social'],
        gapMonths: 6,
      },
    },
  },

  /** Carbon Removal First: DAC/BECCS deployed month 0, rest sequenced */
  'carbon-removal-first': {
    id: 'carbon-removal-first',
    name: 'Carbon Removal First',
    description: 'Deploy carbon removal tech (DAC/BECCS) immediately, then sequence other tech',
    hypothesis: 'Tests whether removing climate threat enables other interventions',
    techDeployment: {
      mode: 'prioritized' as const,
      prioritizedConfig: {
        priorities: ['climate', 'energy', 'environment', 'governance', 'social'],
        gapMonths: 6,
      },
    },
  },

  /** Foundations First: Dependency-ordered deployment */
  'foundations-first': {
    id: 'foundations-first',
    name: 'Foundations First (Dependency-Ordered)',
    description: 'Deploy in dependency order: governance → energy → climate → social → advanced',
    hypothesis: 'Tests whether respecting tech dependencies maximizes effectiveness',
    techDeployment: {
      mode: 'prioritized' as const,
      prioritizedConfig: {
        priorities: ['governance', 'energy', 'climate', 'social', 'environment'],
        gapMonths: 12,
      },
    },
  },

  /** Adaptive Deployment: Real-time effectiveness-based deployment */
  'adaptive-deployment': {
    id: 'adaptive-deployment',
    name: 'Adaptive Deployment',
    description: 'Deploy tech adaptively based on governance quality and safety thresholds',
    hypothesis: 'Tests whether adaptive deployment allows institutions to absorb tech gradually',
    techDeployment: {
      mode: 'adaptive' as const,
      adaptiveConfig: {
        governanceThreshold: 0.6, // Deploy when governance > 0.6
        safetyThreshold: 0.7, // Deploy when safety > 0.7
        maxTechsPerMonth: 3, // Gradual rollout
      },
    },
  },

  /** === POLICY PACKAGE SCENARIOS (Phase 3) === */

  /** Green New Deal: Progressive climate + social policy */
  'green-new-deal': {
    id: 'green-new-deal',
    name: 'Green New Deal',
    description: 'Progressive climate + social policy: 10% GDP climate, 2.5% redistribution, 1% research, democracy=0.8 (US GND 2019, EU Green Deal 2020, IEA Net Zero 2024)',
    hypothesis: 'Tests whether combining climate action + UBI + jobs guarantee enables both environmental AND social spirals',
    techDeployment: {
      mode: 'prioritized' as const,
      prioritizedConfig: {
        priorities: ['climate', 'energy', 'social', 'governance', 'environment'],
        gapMonths: 3,  // Faster deployment than sequenced (3 months vs 12)
      },
    },
    governmentPriorities: {
      climateSpending: 0.10,  // 10% GDP/month (climate action)
      redistributionRate: 0.025,  // 2.5% GDP/month (UBI - Nordic level)
      researchInvestmentRate: 0.01,  // 1% of annual GDP (job guarantee via R&D, adapts to GDP)
      democracyLevel: 0.8,  // High democratic participation
    },
  },

  /** Techno-Optimist Path: Market-driven tech acceleration */
  'techno-optimist': {
    id: 'techno-optimist',
    name: 'Techno-Optimist Path',
    description: 'Market-driven tech acceleration: all tech immediate, minimal government, democracy=0.7, R&D only (Andreessen 2023, Cowen 2018, Acemoglu & Johnson 2023)',
    hypothesis: 'Tests whether technology + markets alone (without redistribution/climate spending) can enable spirals',
    techDeployment: {
      mode: 'immediate' as const,  // Deploy all tech at once
    },
    governmentPriorities: {
      researchInvestmentRate: 0.005,  // 0.5% of annual GDP (baseline R&D, adapts to GDP)
      democracyLevel: 0.7,  // Liberal democracy (not authoritarian)
      // NO climateSpending, NO redistributionRate (market handles)
    },
  },

  /** Degrowth Path: Ecological restoration + reduced consumption */
  'degrowth': {
    id: 'degrowth',
    name: 'Degrowth Path',
    description: 'Ecological restoration + reduced consumption: 10% climate, 2.5% redistribution, 0.1% research, democracy=0.9, limited tech (Hickel 2020, Raworth 2017, Kallis 2020)',
    hypothesis: 'Tests whether ecological focus + low growth enables environmental spirals without advanced tech',
    techDeployment: {
      mode: 'prioritized' as const,
      prioritizedConfig: {
        priorities: ['environment', 'climate', 'governance', 'social'],  // NO energy/advanced
        gapMonths: 12,  // Slow deployment (absorption capacity)
      },
      deploymentLevel: 0.4,  // 40% deployment level (proxy for limited tech)
    },
    governmentPriorities: {
      climateSpending: 0.10,  // 10% GDP/month (ecological restoration)
      redistributionRate: 0.025,  // 2.5% GDP/month (social foundation)
      researchInvestmentRate: 0.001,  // 0.1% of annual GDP (low growth, adapts to GDP)
      democracyLevel: 0.9,  // Very high democracy (participatory)
    },
  },

  /** Authoritarian Climate Action: China-style rapid deployment */
  'authoritarian-climate': {
    id: 'authoritarian-climate',
    name: 'Authoritarian Climate Action',
    description: 'China-style rapid deployment: 10% climate, democracy=0.2, no redistribution, immediate tech (Xi 2020, V-Dem 2024, Kostka & Zhang 2018)',
    hypothesis: 'Tests whether authoritarian efficiency enables faster climate action at cost of social spirals',
    techDeployment: {
      mode: 'immediate' as const,  // Top-down rapid deployment
    },
    governmentPriorities: {
      climateSpending: 0.10,  // 10% GDP/month (authoritarian climate action)
      researchInvestmentRate: 0.005,  // 0.5% of annual GDP (state-directed R&D, adapts to GDP)
      democracyLevel: 0.2,  // Very low (below authoritarian-efficiency 0.3)
      governmentType: 'authoritarian',
      // NO redistributionRate (authoritarian states don't prioritize equality)
    },
  },

  /** Nordic Social Democracy: Scandinavian model */
  'nordic-social-democracy': {
    id: 'nordic-social-democracy',
    name: 'Nordic Social Democracy',
    description: 'Scandinavian model: 3.5% redistribution, 3% climate, 1.5% research, democracy=0.85, sequenced tech (OECD 2024, V-Dem 2024, IEA 2024)',
    hypothesis: 'Tests whether gradual tech + strong institutions + high equality enables sustained spiral activation',
    techDeployment: {
      mode: 'sequenced' as const,
      sequencedConfig: {
        gapMonths: 12,  // Gradual absorption (12-month gaps)
        tierOrder: [0, 1, 2, 3, 4],  // Tier-ordered deployment
      },
    },
    governmentPriorities: {
      redistributionRate: 0.035,  // 3.5% GDP/month = 42% annually (Nordic + UBI)
      climateSpending: 0.03,  // 3% GDP/month (realistic Nordic climate spending)
      researchInvestmentRate: 0.015,  // 1.5% of annual GDP (Nordic R&D intensity, adapts to GDP)
      democracyLevel: 0.85,  // High Nordic democracy
    },
    startingConditions: {
      governanceQuality: 0.75,  // Strong Nordic institutions
      institutionalCapacity: 0.75,
      trustInAI: 0.6,  // Higher trust baseline
    },
  },
} as const;
