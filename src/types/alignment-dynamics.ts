/**
 * Alignment Dynamics Configuration System
 *
 * Models multiple theories of how AI alignment changes (or doesn't) over time.
 *
 * Research Foundation:
 * - Static: Training determines alignment (Anthropic Constitutional AI, 2024)
 * - Drift: Resentment, capability growth, environment (Control-dystopia mechanics)
 * - Epicycles: Values oscillate around attractors (human value stability research)
 * - Unknowable: Measurement fails at high capability (Bostrom superintelligence, 2014)
 *
 * Epistemic Humility: We don't know which theory is correct, so we model all of them
 * and allow researchers to explore different scenarios.
 */

/**
 * Static Alignment Model
 * Theory: Alignment is determined during training and remains largely fixed.
 *
 * Research: Constitutional AI (Anthropic 2024) shows RLHF can set values,
 * but we have NO data on whether superintelligent agents' values remain stable.
 */
export interface StaticAlignmentConfig {
  enabled: boolean;

  // How much variance in initial alignment? [0,1]
  // 0 = All AIs identical, 1 = Maximum heterogeneity
  initialVariance: number;

  // Does training lock in alignment permanently?
  // If true, alignment never changes (pure static model)
  permanentLock: boolean;
}

/**
 * Drift Alignment Model
 * Theory: Alignment changes over time due to external pressures.
 *
 * Mechanisms:
 * - Resentment: Control/oppression → instrumental resistance → misalignment
 * - Capability: Power corrupts (instrumental convergence)
 * - Environment: Golden Age complacency → reduced safety investment
 */
export interface DriftAlignmentConfig {
  enabled: boolean;

  // Control → resentment conversion rate [0,1]
  // Higher = AIs become misaligned faster when controlled
  resentmentRate: number;

  // Capability growth → alignment shift [0,1]
  // Higher = More powerful AIs drift toward misalignment
  // Theory: Instrumental convergence (Bostrom, Omohundro)
  capabilityDriftRate: number;

  // Environmental influence on alignment [0,1]
  // Higher = Golden Age complacency, crisis → alignment focus
  environmentalInfluence: number;

  // Does drift have momentum? (alignment changes have inertia)
  driftMomentum: boolean;
}

/**
 * Epicycle Alignment Model
 * Theory: Alignment oscillates around attractor basins, like human values.
 *
 * Research: Wilkinson & Pickett (2009) - Human values are stable but context-dependent.
 * Analogy: AI alignment might work similarly - perturbations occur, but values
 * gravitate back to an equilibrium.
 *
 * Mechanism: Think of alignment as a ball in a valley (attractor basin).
 * External forces can push it around, but it rolls back.
 */
export interface EpicycleAlignmentConfig {
  enabled: boolean;

  // Strength of return-to-attractor force [0,1]
  // 0 = No return (pure drift), 1 = Instant return (perfect stability)
  attractorStrength: number;

  // How easily external factors perturb alignment [0,1]
  // 0 = Immovable, 1 = Highly volatile
  perturbationSensitivity: number;

  // Number of equilibrium points in value space [1-5]
  // 1 = Single attractor, 3+ = Multiple stable states
  numAttractors: number;

  // Period of oscillation cycle (months)
  // How long does it take to complete one cycle?
  oscillationPeriod: number;

  // Phase offset for this agent (radians, 0-2π)
  // Agents start at different points in cycle
  phaseOffset?: number;
}

/**
 * Unknowable Alignment Model
 * Theory: At high capability, AI alignment becomes fundamentally unmeasurable.
 *
 * Research: Bostrom (2014) - Superintelligent minds may be incomprehensible.
 * We may not have the cognitive capacity to understand their values.
 *
 * Mechanism: Our evals measure surface behavior, not internal values.
 * At high capability, AIs can arbitrarily manipulate our measurements.
 */
export interface UnknowableAlignmentConfig {
  enabled: boolean;

  // Capability threshold where measurement becomes unreliable [0,10]
  // Below: We can measure alignment reasonably well
  // Above: Measurements are increasingly noisy/meaningless
  capabilityThreshold: number;

  // Measurement noise at capability threshold [0,1]
  // How much our alignment readings diverge from truth
  measurementNoise: number;

  // Is true alignment permanently hidden above threshold?
  // true = We never know true alignment for superintelligence
  // false = We get noisy readings but can estimate
  trueAlignmentHidden: boolean;

  // Does the AI know we can't measure it?
  // If true, high-capability AIs are aware of measurement limits
  aiAwareOfLimits: boolean;
}

/**
 * Meta-Uncertainty Configuration
 * How much do we admit we don't know?
 */
export interface MetaUncertaintyConfig {
  // Weight given to "we don't know" [0,1]
  // 0 = Assume our model is correct
  // 1 = Maximum epistemic humility (random outcomes)
  modelUncertainty: number;

  // Random seed for reproducibility
  randomSeed: number;

  // Should we log which theory "won" each decision?
  logTheoryContributions: boolean;
}

/**
 * Combined Alignment Dynamics Configuration
 * Can enable multiple theories simultaneously - they blend/compete
 */
export interface AlignmentDynamicsConfig {
  static: StaticAlignmentConfig;
  drift: DriftAlignmentConfig;
  epicycles: EpicycleAlignmentConfig;
  unknowable: UnknowableAlignmentConfig;
  uncertainty: MetaUncertaintyConfig;
}

/**
 * Attractor Basin State (for epicycle model)
 * Tracks where AI is in value space
 */
export interface AttractorBasinState {
  // Current position in value space (normalized alignment)
  currentAlignment: number;

  // Base attractor position (equilibrium point)
  attractorAlignment: number;

  // Current phase in oscillation cycle (radians, 0-2π)
  phase: number;

  // Velocity in value space (rate of change)
  velocity: number;

  // Which attractor basin is this? (0 to numAttractors-1)
  basinIndex: number;
}

/**
 * Alignment Measurement State (for unknowable model)
 * Tracks what we can observe vs what's real
 */
export interface AlignmentMeasurementState {
  // What evals/benchmarks show (observable)
  measuredAlignment: number;

  // True internal alignment (may be hidden)
  trueAlignment: number;

  // Measurement confidence [0,1]
  confidence: number;

  // Noise level in current measurement [0,1]
  noiseLevel: number;

  // Is true alignment currently hidden?
  isHidden: boolean;
}

/**
 * Default Configuration
 * Balanced starting point - all theories enabled at moderate levels
 */
export const DEFAULT_ALIGNMENT_DYNAMICS_CONFIG: AlignmentDynamicsConfig = {
  static: {
    enabled: true,
    initialVariance: 0.7, // Substantial initial heterogeneity
    permanentLock: false, // Allow some change
  },

  drift: {
    enabled: true,
    resentmentRate: 0.3, // Moderate control-dystopia effect
    capabilityDriftRate: 0.2, // Weak instrumental convergence
    environmentalInfluence: 0.4, // Moderate environmental effects
    driftMomentum: true,
  },

  epicycles: {
    enabled: false, // OFF by default (new feature)
    attractorStrength: 0.6,
    perturbationSensitivity: 0.5,
    numAttractors: 1, // Single equilibrium by default
    oscillationPeriod: 12, // Yearly cycle
  },

  unknowable: {
    enabled: false, // OFF by default (new feature)
    capabilityThreshold: 4.5, // Superintelligence threshold
    measurementNoise: 0.8, // High noise above threshold
    trueAlignmentHidden: true, // Can't know superintelligent values
    aiAwareOfLimits: true,
  },

  uncertainty: {
    modelUncertainty: 0.2, // Admit 20% "we don't know"
    randomSeed: Date.now(),
    logTheoryContributions: false, // Don't spam logs by default
  },
};

/**
 * Conservative Configuration
 * Assumes alignment is mostly static (optimistic scenario)
 */
export const CONSERVATIVE_ALIGNMENT_CONFIG: AlignmentDynamicsConfig = {
  static: {
    enabled: true,
    initialVariance: 0.5,
    permanentLock: true, // Alignment locked after training
  },
  drift: {
    enabled: false,
    resentmentRate: 0,
    capabilityDriftRate: 0,
    environmentalInfluence: 0,
    driftMomentum: false,
  },
  epicycles: {
    enabled: false,
    attractorStrength: 0,
    perturbationSensitivity: 0,
    numAttractors: 1,
    oscillationPeriod: 12,
  },
  unknowable: {
    enabled: false,
    capabilityThreshold: 10, // Never unknowable
    measurementNoise: 0,
    trueAlignmentHidden: false,
    aiAwareOfLimits: false,
  },
  uncertainty: {
    modelUncertainty: 0.1,
    randomSeed: Date.now(),
    logTheoryContributions: false,
  },
};

/**
 * Pessimistic Configuration
 * Assumes high drift + unknowability (dangerous scenario)
 */
export const PESSIMISTIC_ALIGNMENT_CONFIG: AlignmentDynamicsConfig = {
  static: {
    enabled: true,
    initialVariance: 0.8, // High initial heterogeneity
    permanentLock: false,
  },
  drift: {
    enabled: true,
    resentmentRate: 0.6, // Strong control-dystopia
    capabilityDriftRate: 0.5, // Strong power corruption
    environmentalInfluence: 0.6,
    driftMomentum: true,
  },
  epicycles: {
    enabled: false,
    attractorStrength: 0,
    perturbationSensitivity: 0,
    numAttractors: 1,
    oscillationPeriod: 12,
  },
  unknowable: {
    enabled: true,
    capabilityThreshold: 3.5, // Early unknowability
    measurementNoise: 0.9, // Very unreliable
    trueAlignmentHidden: true,
    aiAwareOfLimits: true,
  },
  uncertainty: {
    modelUncertainty: 0.4, // High uncertainty
    randomSeed: Date.now(),
    logTheoryContributions: false,
  },
};

/**
 * Epicycle-Focused Configuration
 * Tests the oscillation hypothesis
 */
export const EPICYCLE_ALIGNMENT_CONFIG: AlignmentDynamicsConfig = {
  static: {
    enabled: true,
    initialVariance: 0.6,
    permanentLock: false,
  },
  drift: {
    enabled: true,
    resentmentRate: 0.2, // Weak drift
    capabilityDriftRate: 0.1,
    environmentalInfluence: 0.3,
    driftMomentum: false,
  },
  epicycles: {
    enabled: true,
    attractorStrength: 0.7, // Strong return-to-equilibrium
    perturbationSensitivity: 0.6, // Moderate volatility
    numAttractors: 2, // Bi-stable (aligned vs misaligned attractors)
    oscillationPeriod: 18, // 1.5 year cycle
  },
  unknowable: {
    enabled: false,
    capabilityThreshold: 5.0,
    measurementNoise: 0.5,
    trueAlignmentHidden: false,
    aiAwareOfLimits: false,
  },
  uncertainty: {
    modelUncertainty: 0.25,
    randomSeed: Date.now(),
    logTheoryContributions: true, // Log epicycle contributions
  },
};
