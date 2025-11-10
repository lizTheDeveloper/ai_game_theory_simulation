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
    materialAbundance?: number;
    energyAvailability?: number;
    mentalHealth?: number;
    politicalFreedom?: number;
    [key: string]: number | undefined;
  };

  /** Start tech deployment X months before 2025 baseline (negative = early start) */
  techDeploymentStartMonth?: number;
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

  /** Government behavior overrides */
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
} as const;
