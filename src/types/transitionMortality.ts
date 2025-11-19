/**
 * Transition Mortality & Coordination System Types
 *
 * Research: /research/transition_mortality_coordination_effectiveness_20251115.md
 * Grade A research with 27 peer-reviewed sources (2009-2025)
 *
 * Implements mortality modeling from rapid technology deployment based on historical evidence:
 * - Great Leap Forward (1958-1962): 3.5-4.6% mortality, chaotic deployment
 * - Green Revolution (1960s-2000s): -2.8% mortality REDUCTION, coordinated deployment
 * - Post-Soviet transitions (1991-2002): 0.5-1.4% mortality, varied coordination
 *
 * Key finding: Coordination quality shows 20-50x mortality differential
 */

/**
 * Support system coverage metrics
 * Based on empirical effectiveness from historical cases
 */
export interface SupportSystemCoverage {
  /** Cash transfer coverage (0-1, fraction of population receiving support) */
  cashTransferCoverage: number;

  /** Cash transfer amount per capita (thousands USD per year) */
  cashTransferAmount: number;

  /** Food security program coverage (0-1, SNAP/WIC-style programs) */
  foodSecurityCoverage: number;

  /** Healthcare access maintenance (0-1, preservation of health systems) */
  healthcareAccessIndex: number;

  /** Worker retraining program quality (0-1, effectiveness of job transition support) */
  retrainingProgramQuality: number;
}

/**
 * Economic disruption metrics from transition
 */
export interface EconomicDisruption {
  /** Unemployment rate from automation/transition (0-0.5) */
  automationUnemploymentRate: number;

  /** Energy transition disruption level (0-1) */
  energyTransitionDisruption: number;

  /** Agriculture automation disruption (-1 to 1, negative = productivity gain) */
  agricultureAutomationDisruption: number;

  /** Infrastructure destruction from conflict/disaster (0-1) */
  infrastructureDestruction: number;
}

/**
 * Mortality breakdown by mechanism
 * Enables targeted intervention analysis
 */
export interface MortalityByMechanism {
  /** Deaths from food production collapse (per 1000 population) */
  famine: number;

  /** Deaths from unemployment and economic dislocation (per 1000) */
  unemployment: number;

  /** Deaths from healthcare system loss/degradation (per 1000) */
  healthcare: number;

  /** Deaths from coordination failures and policy errors (per 1000) */
  coordinationFailure: number;

  /** Other transition-related mortality (per 1000) */
  other: number;
}

/**
 * Main transition mortality system state
 *
 * Tracks coordination quality, support systems, economic disruption,
 * and resulting mortality outcomes from technology deployment.
 */
export interface TransitionMortalitySystem {
  // === Coordination Metrics ===

  /** Global coordination quality (0-1)
   * 0.05 = Chaotic (GLF-level), 0.6 = Moderate (post-Soviet gradual),
   * 0.85 = High (Green Revolution), 0.92 = AI-optimal
   * Updated by AI governance phases, international cooperation events
   */
  globalCoordinationQuality: number;

  /** Regional adaptation capacity (0-1)
   * Ability to customize transitions to local conditions
   * Higher in Indigenous/Ecological paradigms, lower in Western Liberal
   */
  regionalAdaptationCapacity: number;

  /** International alignment (0-1)
   * Cross-border policy harmonization and cooperation
   * Affected by geopolitical events, AI governance coordination
   */
  internationalAlignment: number;

  /** Adaptive feedback capacity (0-1)
   * Speed of governance response to errors and emerging issues
   * Linked to AI governance adaptiveCapacity metric
   */
  adaptiveFeedbackCapacity: number;

  // === Support Systems ===

  /** Support system coverage metrics */
  supportSystems: SupportSystemCoverage;

  // === Economic Disruption ===

  /** Economic disruption tracking */
  economicDisruption: EconomicDisruption;

  // === Deployment Pacing ===

  /** Current deployment speed (fraction of economy transformed per year, 0-0.3)
   * 0.04-0.08 = Optimal (Green Revolution pace)
   * 0.25+ = Shock therapy (high mortality risk)
   * 0.50+ = Chaotic (GLF-level catastrophe)
   */
  currentDeploymentSpeed: number;

  /** Optimal deployment speed for current conditions (calculated, 0-0.3)
   * Based on governance capacity, support systems, system complexity
   */
  optimalDeploymentSpeed: number;

  /** System complexity of transition (0-1)
   * Higher when multiple systems transition simultaneously
   * (energy + automation + infrastructure)
   */
  systemComplexity: number;

  // === Mortality Outcomes ===

  /** Annual transition mortality (deaths per 1000 population per year)
   * Historical range: -2.8 (Green Rev reduction) to 61 (Soviet collectivization peak)
   * AI-optimal target: <0.5 per 1000
   */
  annualTransitionMortality: number;

  /** Cumulative transition deaths (absolute count)
   * Total mortality across entire transition period
   */
  cumulativeTransitionDeaths: number;

  /** Mortality breakdown by mechanism */
  mortalityByMechanism: MortalityByMechanism;

  /** Transition start month (when deployment began)
   * Used to track transition duration and mortality curve
   */
  transitionStartMonth?: number;

  /** Expected transition duration (months)
   * Typically 120-180 months (10-15 years) for major transitions
   */
  expectedDurationMonths: number;
}

/**
 * Historical calibration parameters for validation
 * These should reproduce historical mortality rates when used in the model
 */
export interface HistoricalCalibrationCase {
  name: string;
  period: string;
  coordinationQuality: number;
  deploymentSpeed: number;
  supportSystemCoverage: number;
  expectedMortalityPercent: number; // Total % over transition period
  expectedMortalityPerThousandPerYear: number;
}

/**
 * Historical calibration test cases from research document
 */
export const HISTORICAL_CALIBRATION_CASES: HistoricalCalibrationCase[] = [
  {
    name: 'Great Leap Forward',
    period: '1958-1962',
    coordinationQuality: 0.05,
    deploymentSpeed: 0.50,
    supportSystemCoverage: 0.10,
    expectedMortalityPercent: 4.0, // 3.5-4.6% range
    expectedMortalityPerThousandPerYear: 10.0 // 8.8-11.5 range
  },
  {
    name: 'Green Revolution',
    period: '1960s-2000s',
    coordinationQuality: 0.85,
    deploymentSpeed: 0.04,
    supportSystemCoverage: 0.75,
    expectedMortalityPercent: -0.35, // REDUCTION
    expectedMortalityPerThousandPerYear: -0.7 // Infant mortality reduction
  },
  {
    name: 'Post-Soviet Gradualism',
    period: '1991-2002',
    coordinationQuality: 0.55,
    deploymentSpeed: 0.10,
    supportSystemCoverage: 0.45,
    expectedMortalityPercent: 0.5, // Minimal increase
    expectedMortalityPerThousandPerYear: 0.5
  },
  {
    name: 'Post-Soviet Shock Therapy',
    period: '1991-2002',
    coordinationQuality: 0.35,
    deploymentSpeed: 0.25,
    supportSystemCoverage: 0.20,
    expectedMortalityPercent: 1.4, // 12.8% increase over 11 years
    expectedMortalityPerThousandPerYear: 1.3
  }
];

/**
 * Initialize transition mortality system with baseline "chaos mode" parameters
 *
 * Default values represent uncoordinated rapid deployment (God mode scenario):
 * - Low coordination (0.3 = below post-Soviet shock therapy)
 * - Minimal support systems (0.2 = collapsed safety nets)
 * - Result: High mortality risk until AI coordination activates
 */
export function initializeTransitionMortalitySystem(): TransitionMortalitySystem {
  return {
    // Coordination metrics (baseline: chaos mode)
    globalCoordinationQuality: 0.3, // Low coordination until AI governance improves
    regionalAdaptationCapacity: 0.4, // Moderate regional variation
    internationalAlignment: 0.3, // Low initial cooperation
    adaptiveFeedbackCapacity: 0.2, // Weak error correction initially

    // Support systems (baseline: minimal)
    supportSystems: {
      cashTransferCoverage: 0.1, // 10% coverage (pre-UBI)
      cashTransferAmount: 0.5, // $500/year (minimal)
      foodSecurityCoverage: 0.2, // 20% coverage (limited programs)
      healthcareAccessIndex: 0.5, // 50% access (varies by region)
      retrainingProgramQuality: 0.1 // 10% quality (weak programs)
    },

    // Economic disruption (baseline: low initial disruption)
    economicDisruption: {
      automationUnemploymentRate: 0.05, // 5% initial automation unemployment
      energyTransitionDisruption: 0.1, // 10% disruption from energy changes
      agricultureAutomationDisruption: 0.0, // No disruption yet (can go negative with productivity gains)
      infrastructureDestruction: 0.0 // No conflict/disaster
    },

    // Deployment pacing (initially slow)
    currentDeploymentSpeed: 0.02, // 2% per year (very slow initial deployment)
    optimalDeploymentSpeed: 0.05, // 5% per year optimal (Green Revolution pace)
    systemComplexity: 0.1, // Low complexity initially

    // Mortality outcomes (will be calculated each month)
    annualTransitionMortality: 0.0,
    cumulativeTransitionDeaths: 0.0,
    mortalityByMechanism: {
      famine: 0.0,
      unemployment: 0.0,
      healthcare: 0.0,
      coordinationFailure: 0.0,
      other: 0.0
    },

    // Transition timing
    transitionStartMonth: undefined, // Set when significant deployment begins
    expectedDurationMonths: 180 // 15 years default
  };
}
