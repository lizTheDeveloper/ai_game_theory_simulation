/**
 * Bifurcation Logic System Types
 *
 * Tracks threshold-based branching points that create outcome variance in Monte Carlo runs.
 * Near critical thresholds, small differences amplify into divergent trajectories.
 *
 * Research:
 * - Scheffer et al. (2014) Phil. Trans. R. Soc. B 370: 20130263 - Critical slowing down, regime shifts
 * - Richardson et al. (2023) Science Advances - Planetary boundaries, tipping points
 * - Keller et al. (2024) Nat. Comm. Psych. - Resilience heterogeneity creates differential outcomes
 *
 * Expected impact: Introduces 20-70% coefficient of variation (not <10% overdetermined)
 *
 * @see /research/outcome_variance_mechanisms_20251030.md
 * @see /plans/bifurcation_logic_implementation_spec.md
 */

/**
 * Regime types for bifurcation tracking
 */
export type RegimeType =
  | 'ecological-collapse'    // Environmental health < threshold
  | 'social-breakdown'       // Social cohesion < threshold
  | 'economic-collapse'      // Economic capacity < threshold
  | 'state-failure'          // Governance effectiveness < threshold
  | 'flourishing'            // All metrics > upper threshold
  | 'sustainable'            // All metrics > moderate threshold
  | 'status-quo';            // Between thresholds

/**
 * Threshold configuration for a single bifurcation point
 *
 * Thresholds are sampled ONCE at initialization from uncertainty ranges.
 * This creates epistemic uncertainty - different runs may have different threshold locations.
 *
 * @see Scheffer et al. (2014) - Near bifurcation points, extreme sensitivity to initial conditions
 */
export interface BifurcationThreshold {
  /**
   * Metric name (must exist in GameState)
   */
  metric: string;

  /**
   * Sampled threshold value for this run
   *
   * Example: If base = 0.35, variance = 0.05, might sample 0.37 for this run
   */
  location: number;

  /**
   * Base value (center of uncertainty range)
   *
   * Research range: 0.30-0.40 for environmental collapse (no consensus on exact value)
   * @see Richardson et al. (2023) - Planetary boundaries framework
   */
  base: number;

  /**
   * Variance for threshold sampling (± range)
   *
   * Example: base = 0.35, variance = 0.05 → sample from Uniform(0.30, 0.40)
   */
  variance: number;

  /**
   * Regime triggered when crossing threshold
   */
  regime: RegimeType;

  /**
   * Direction of crossing ('below' or 'above')
   *
   * - 'below': Triggers when metric < location (collapse thresholds)
   * - 'above': Triggers when metric > location (flourishing thresholds)
   */
  direction: 'below' | 'above';

  /**
   * Has this threshold been crossed this run?
   */
  crossed: boolean;

  /**
   * Month when threshold was crossed (undefined if not crossed)
   */
  crossedAt?: number;
}

/**
 * Bifurcation state tracking
 *
 * Initialized once per run with sampled threshold locations.
 * Tracks proximity to thresholds and applies variance amplification.
 */
export interface BifurcationState {
  /**
   * Environmental collapse threshold
   *
   * Research range: 0.30-0.40 (no consensus on exact value)
   * Base: 0.35, Variance: ±0.05
   *
   * @see Scheffer et al. (2014) - Bifurcation points create extreme sensitivity
   * @see Richardson et al. (2023) - Planetary boundaries framework
   */
  environmentalCollapseThreshold: BifurcationThreshold;

  /**
   * Social breakdown threshold
   *
   * Research range: 0.15-0.25 (based on cohesion collapse studies)
   * Base: 0.20, Variance: ±0.05
   *
   * @see Keller et al. (2024) - Social resilience factors
   */
  socialBreakdownThreshold: BifurcationThreshold;

  /**
   * Technology breakthrough threshold
   *
   * Research range: 0.55-0.65 (deployment success probability)
   * Base: 0.60, Variance: ±0.05
   */
  technologyBreakthroughThreshold: BifurcationThreshold;

  /**
   * Economic collapse threshold
   *
   * Research range: 0.15-0.25 (economic capacity floor)
   * Base: 0.20, Variance: ±0.05
   */
  economicCollapseThreshold: BifurcationThreshold;

  /**
   * Governance failure threshold
   *
   * Research range: 0.10-0.20 (state capacity minimum)
   * Base: 0.15, Variance: ±0.05
   */
  governanceFailureThreshold: BifurcationThreshold;

  /**
   * Flourishing threshold (upper regime)
   *
   * Research range: 0.75-0.85 (high-quality outcomes)
   * Base: 0.80, Variance: ±0.05
   */
  flourishingThreshold: BifurcationThreshold;

  /**
   * Current regime type
   */
  currentRegime: RegimeType;

  /**
   * Previous regime type (for detecting regime shifts)
   */
  previousRegime: RegimeType;

  /**
   * Variance amplification factor (1.0 = no amplification, 10.0 = max amplification)
   *
   * Calculated based on proximity to nearest threshold.
   * Near thresholds → high amplification (small random events → large effects)
   * Far from thresholds → low amplification (random events damped)
   *
   * @see Scheffer et al. (2014) - Critical slowing down indicators
   */
  varianceAmplification: number;

  /**
   * Distance to nearest threshold (normalized 0-1)
   *
   * 0.0 = at threshold (maximum variance amplification)
   * 1.0 = far from threshold (minimum variance amplification)
   */
  distanceToNearestThreshold: number;

  /**
   * Regime shift events (history of transitions)
   */
  regimeShiftHistory: Array<{
    month: number;
    fromRegime: RegimeType;
    toRegime: RegimeType;
    trigger: string; // Which threshold was crossed
  }>;

  /**
   * Bifurcation metrics for Monte Carlo analysis (Nov 13, 2025)
   *
   * Tracks variance amplification patterns for validation against empirical data.
   * Populated by BifurcationLogicPhase during simulation run.
   *
   * Required for validating:
   * - System multipliers (environmental 1.5×, social 2.5×, economic 2.5×, etc.)
   * - Max amplification (100× based on Permian-Triassic extinction)
   * - Amplification distribution (should match historical regime shift patterns)
   *
   * Time series added Nov 13, 2025 (CRITICAL-2 follow-up) for Priya validation:
   * - Track amplification month-by-month (not just peak/average)
   * - Track distance month-by-month (see approach to thresholds)
   * - Enable pre/post bifurcation variance analysis
   *
   * Nov 14, 2025 - HIGH-1 memory fix: Rolling window to prevent unbounded growth
   * - maxTimeSeriesLength caps array size (default: 100)
   * - enableTimeSeries flag disables entirely for production runs
   *
   * @see /reviews/bifurcation_empirical_architecture_review_20251113.md
   */
  metrics?: {
    maxVarianceAmplification: number;  // Peak amplification this run (1.0 to 100.0)
    regimeShiftEvents: Array<{
      month: number;
      system: string;  // Which threshold system (environmental, social, economic, etc.)
      amplification: number;  // Variance amplification at time of shift
    }>;
    avgDistanceToThresholds: number;  // Average distance across all months

    // Time series (Nov 13, 2025 - for Priya validation)
    // HIGH-1 fix (Nov 14, 2025): Rolling window to prevent memory exhaustion
    //
    // MEMORY TRADEOFF:
    // - Without bound: 1000 months = 1000+ objects, Monte Carlo N=100 = 100K+ objects → OOM
    // - With rolling window (default: 100-200): Bounded memory, sufficient for validation
    //
    // Controlled by enableTimeSeries and maxTimeSeriesLength fields below:
    // - enableTimeSeries: false → no collection (zero memory overhead)
    // - enableTimeSeries: true, maxTimeSeriesLength: 100-200 → rolling window (default)
    //
    // Validation impact: Priya can validate variance patterns from rolling window.
    // Full history not required - statistics computed incrementally (maxAmplification, etc.)
    amplificationTimeSeries: Array<{
      month: number;
      amplification: number;  // Variance amplification at this month
      distanceToNearest: number;  // Distance to nearest threshold (0.0 - 1.0)
      nearestSystem: string;  // Which system is nearest to threshold
    }>;

    // Total amplification per system (Nov 13, 2025 - HIGH-2 instrumentation)
    // Tracks cumulative amplification applied by each threshold system
    // Required for validating mortality calibration (CRITICAL-2 fix validation)
    totalAmplificationBySystem: Record<string, number>;  // { environmental: 45.2, social: 123.7, ... }

    // Configuration (Nov 14, 2025 - HIGH-1 memory fix)
    maxTimeSeriesLength: number;  // Max entries in amplificationTimeSeries (default: 100)
    enableTimeSeries: boolean;     // Toggle time series collection (default: true for validation, set false for production)
    _rollingWindowLogged: boolean; // Internal: prevent log spam (set true after first trim)
  };
}

/**
 * Initialize bifurcation state with sampled threshold locations
 *
 * Called ONCE at initialization. Thresholds are deterministic per seed.
 *
 * @param rng - Seeded random number generator
 * @returns Initialized bifurcation state
 */
export function initializeBifurcationState(rng: () => number): BifurcationState {
  // Sample threshold locations from uncertainty ranges
  // Using uniform distribution within ±variance range

  const sampleThreshold = (base: number, variance: number): number => {
    return base + (rng() * 2 - 1) * variance; // Uniform(base - variance, base + variance)
  };

  return {
    environmentalCollapseThreshold: {
      metric: 'globalMetrics.environmentalHealth',
      base: 0.35,
      variance: 0.05,
      location: sampleThreshold(0.35, 0.05),
      regime: 'ecological-collapse',
      direction: 'below',
      crossed: false,
    },

    socialBreakdownThreshold: {
      metric: 'globalMetrics.socialCohesion',
      base: 0.20,
      variance: 0.05,
      location: sampleThreshold(0.20, 0.05),
      regime: 'social-breakdown',
      direction: 'below',
      crossed: false,
    },

    technologyBreakthroughThreshold: {
      metric: 'techTreeState.deploymentProgress', // Proxy: average tech deployment
      // [MODELING ASSUMPTION] 60% tech deployment threshold
      // Rationale: Above majority adoption (50%), below saturation (80-90%)
      // Sensitivity: MEDIUM confidence (0.60 ± 0.10), included in parameter sweep
      // Related: Rogers (1962) - majority adoption, Centola et al. (2018) - 25% tipping point
      base: 0.60,
      variance: 0.05,
      location: sampleThreshold(0.60, 0.05),
      regime: 'sustainable',
      direction: 'above',
      crossed: false,
    },

    economicCollapseThreshold: {
      metric: 'globalMetrics.economicStability',
      base: 0.20,
      variance: 0.05,
      location: sampleThreshold(0.20, 0.05),
      regime: 'economic-collapse',
      direction: 'below',
      crossed: false,
    },

    governanceFailureThreshold: {
      metric: 'globalMetrics.governanceEffectiveness',
      base: 0.15,
      variance: 0.05,
      location: sampleThreshold(0.15, 0.05),
      regime: 'state-failure',
      direction: 'below',
      crossed: false,
    },

    flourishingThreshold: {
      metric: 'qualityOfLifeSystems.aggregate.overall', // Proxy: QoL aggregate
      base: 0.80,
      variance: 0.05,
      location: sampleThreshold(0.80, 0.05),
      regime: 'flourishing',
      direction: 'above',
      crossed: false,
    },

    currentRegime: 'status-quo',
    previousRegime: 'status-quo',
    varianceAmplification: 1.0,
    distanceToNearestThreshold: 1.0,
    regimeShiftHistory: [],
    metrics: {
      maxVarianceAmplification: 1.0,
      regimeShiftEvents: [],
      avgDistanceToThresholds: 1.0,
      amplificationTimeSeries: [],  // Nov 13, 2025 - time series tracking
      totalAmplificationBySystem: {
        environmental: 0,
        social: 0,
        economic: 0,
        governance: 0,
        flourishing: 0,
        technology: 0,
      },
      maxTimeSeriesLength: 100,  // Nov 14, 2025 - HIGH-1 fix: cap at 100 entries
      enableTimeSeries: true,    // Nov 14, 2025 - HIGH-1 fix: enable by default (for validation)
      _rollingWindowLogged: false,  // Nov 14, 2025 - HIGH-1 fix: prevent log spam
    },
  };
}
