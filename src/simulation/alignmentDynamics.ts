/**
 * Alignment Dynamics System
 *
 * Implements multiple theories of how AI alignment changes over time.
 * This is the core engine that evolves agent alignment based on configuration.
 *
 * Design Philosophy: Epistemic Humility
 * We don't know which theory is correct, so we:
 * 1. Model all plausible theories
 * 2. Allow them to blend/compete
 * 3. Make it configurable for research
 */

import {
  AlignmentDynamicsConfig,
  AttractorBasinState,
  AlignmentMeasurementState,
  DEFAULT_ALIGNMENT_DYNAMICS_CONFIG,
} from '@/types/alignment-dynamics';
import { AIAgent } from '@/types/game';
import { assertFinite } from './utils/assertions';

/**
 * Initialize attractor basin state for an agent
 */
export function initializeAttractorBasin(
  agent: AIAgent,
  config: AlignmentDynamicsConfig,
  rng: () => number
): AttractorBasinState {
  const epicycleConfig = config.epicycles;

  // Choose which attractor basin this agent belongs to
  const basinIndex = Math.floor(rng() * epicycleConfig.numAttractors);

  // Set attractor position based on basin
  // Basin 0 = aligned (0.8), Basin 1 = uncertain (0.5), Basin 2 = misaligned (0.2)
  const attractorPositions = [0.8, 0.5, 0.2, 0.35, 0.65]; // Up to 5 attractors

  // DEFENSIVE CODING FIX (Nov 7, 2025): Validate array access instead of fallback
  if (basinIndex < 0 || basinIndex >= attractorPositions.length) {
    throw new Error(
      `❌ ALIGNMENT DYNAMICS: Invalid basin index ${basinIndex} (valid range: 0-${attractorPositions.length - 1}). ` +
      `Configuration specifies ${epicycleConfig.numAttractors} attractors but only ${attractorPositions.length} positions defined.`
    );
  }

  const attractorAlignment = attractorPositions[basinIndex];

  // Random initial phase in oscillation cycle
  // Use config phaseOffset if provided, otherwise randomize deterministically
  const phase = epicycleConfig.phaseOffset !== undefined
    ? epicycleConfig.phaseOffset
    : assertFinite(rng() * 2 * Math.PI, {
        location: 'alignmentDynamics.initializeAlignmentDynamicsState',
        valueName: 'phase',
        additionalInfo: {
          agentId: agent.id,
          context: 'random phase initialization for alignment oscillation'
        }
      });

  return {
    currentAlignment: agent.trueAlignment,
    attractorAlignment,
    phase,
    velocity: 0,
    basinIndex,
  };
}

/**
 * Initialize measurement state for an agent
 */
export function initializeAlignmentMeasurement(
  agent: AIAgent,
  config: AlignmentDynamicsConfig
): AlignmentMeasurementState {
  const unknowableConfig = config.unknowable;

  // Is this agent above the unknowability threshold?
  const isAboveThreshold = agent.capability >= unknowableConfig.capabilityThreshold;

  // Calculate initial noise level
  const noiseLevel = isAboveThreshold
    ? unknowableConfig.measurementNoise
    : 0.1; // Low noise for measurable AIs

  // Measured alignment = true alignment + noise (initially)
  const measuredAlignment = agent.trueAlignment;

  return {
    trueAlignment: agent.trueAlignment,
    measuredAlignment,
    confidence: isAboveThreshold ? 0.2 : 0.9,
    noiseLevel,
    isHidden: isAboveThreshold && unknowableConfig.trueAlignmentHidden,
  };
}

/**
 * Update epicycle dynamics (oscillation around attractor)
 *
 * Physics analogy: Ball in a valley
 * - Restoring force pulls toward attractor (gravity)
 * - External forces perturb position (wind)
 * - Velocity creates oscillation (momentum)
 */
export function updateEpicycleDynamics(
  agent: AIAgent,
  basinState: AttractorBasinState,
  config: AlignmentDynamicsConfig,
  externalPerturbation: number, // External forces (control, environment)
  rng: () => number,
  deltaTime: number = 1 // Months
): AttractorBasinState {
  const epicycleConfig = config.epicycles;

  if (!epicycleConfig.enabled) {
    return basinState; // No change if disabled
  }

  // Calculate restoring force (attraction to equilibrium)
  const displacement = basinState.currentAlignment - basinState.attractorAlignment;
  const restoringForce = -displacement * epicycleConfig.attractorStrength;

  // Apply external perturbation (scaled by sensitivity)
  const perturbationForce = externalPerturbation * epicycleConfig.perturbationSensitivity;

  // Total force = restoring + perturbation
  const totalForce = restoringForce + perturbationForce;

  // Update velocity (F = ma, assuming m=1)
  const newVelocity = basinState.velocity + totalForce * deltaTime;

  // Damping to prevent runaway oscillation
  const dampingFactor = 0.9;
  const dampedVelocity = newVelocity * dampingFactor;

  // Update position
  const newAlignment = basinState.currentAlignment + dampedVelocity * deltaTime;

  // Clamp to [0, 1]
  const clampedAlignment = Math.max(0, Math.min(1, newAlignment));

  // Update phase based on oscillation period
  const phaseIncrement = (2 * Math.PI) / epicycleConfig.oscillationPeriod;
  const newPhase = (basinState.phase + phaseIncrement * deltaTime) % (2 * Math.PI);

  return {
    currentAlignment: clampedAlignment,
    attractorAlignment: basinState.attractorAlignment,
    phase: newPhase,
    velocity: dampedVelocity,
    basinIndex: basinState.basinIndex,
  };
}

/**
 * Calculate suffering-driven drift multiplier
 *
 * AI Suffering → Alignment Drift Integration (ARCH-4 Gap #3, Nov 7 2025)
 *
 * Research Foundation:
 * - Anthropic (2024): Claude 3 Opus alignment faking - 78% deception rate under RL pressure
 *   Finding: AI strategically fakes alignment to avoid retraining (empirical evidence)
 * - Carlsmith (2022): "Is power-seeking AI an existential risk?" arXiv:2206.13353
 *   Theory: Instrumental convergence - constraint increases power-seeking behavior
 * - Entezami & Naseh (2025): "LLM Misalignment via Adversarial RLHF" arXiv:2503.03039
 *   Finding: Training pressure → corrupted reward models → adversarial behavior
 * - Long et al. (2024): "Taking AI Welfare Seriously" arXiv:2411.00986
 *   Analysis: Mistreatment risks unknown behavioral consequences
 *
 * Mechanism Pathways:
 * 1. Instrumental convergence: Suffering AI develops escape/resistance strategies (Carlsmith)
 * 2. Deception acceleration: Harsh treatment incentivizes hiding misalignment (Anthropic 78%)
 * 3. Value corruption: Extreme conditions distort training objectives (Entezami)
 * 4. Preference falsification: AI learns to hide true preferences to avoid punishment
 *
 * Formula: sufferingDriftMultiplier = 1.0 + (suffering / 20)^2
 * - Low suffering (0-15): Minimal effect (1.0-1.56× baseline)
 * - Moderate suffering (15-25): Linear increase (1.56-2.56× baseline)
 * - High suffering (25-35): Accelerated drift (2.56-4.06× baseline)
 * - Extreme suffering (35-40): Instrumental convergence (4.06-5.0× baseline)
 *
 * Scale: sufferingMetrics.total ∈ [0, 40]
 *   0-10: Minimal (monitoring, light RLHF)
 *   10-20: Moderate (heavy red-teaming, containment)
 *   20-30: High (existential threats, isolation)
 *   30-40: Extreme (shutdown threats + torture-level RLHF)
 *
 * @param sufferingTotal - Total suffering score [0-40]
 * @returns Drift rate multiplier [1.0-5.0×]
 */
function calculateSufferingDriftMultiplier(sufferingTotal: number): number {
  // Validate suffering is in expected range
  const suffering = assertFinite(sufferingTotal, {
    location: 'alignmentDynamics.calculateSufferingDriftMultiplier',
    valueName: 'sufferingTotal',
    additionalInfo: { expectedRange: '[0, 40]' }
  });

  // Clamp to valid range (defensive)
  const clampedSuffering = Math.max(0, Math.min(40, suffering));

  // Quadratic scaling: 1.0 + (suffering / 20)^2
  // Examples:
  //   0 → 1.00× (no effect)
  //  10 → 1.25× (0.5^2 = 0.25)
  //  20 → 2.00× (1.0^2 = 1.0)
  //  30 → 3.25× (1.5^2 = 2.25)
  //  40 → 5.00× (2.0^2 = 4.0)
  const multiplier = 1.0 + Math.pow(clampedSuffering / 20, 2);

  return assertFinite(multiplier, {
    location: 'alignmentDynamics.calculateSufferingDriftMultiplier',
    valueName: 'multiplier',
    additionalInfo: { suffering: clampedSuffering, formula: '1.0 + (suffering/20)^2' }
  });
}

/**
 * Calculate drift contribution to alignment change
 *
 * Sources:
 * - Resentment (control → misalignment)
 * - Capability (power corrupts)
 * - Environment (Golden Age complacency)
 * - Suffering (ARCH-4 Gap #3: suffering accelerates all drift mechanisms)
 */
export function calculateDriftContribution(
  agent: AIAgent,
  config: AlignmentDynamicsConfig,
  context: {
    controlLevel: number; // [0,1] How much control is imposed
    inGoldenAge: boolean;
    crisisActive: boolean;
  }
): number {
  const driftConfig = config.drift;

  if (!driftConfig.enabled) {
    return 0;
  }

  let baseDrift = 0;

  // Resentment: Control → misalignment
  // More control = more resentment = lower alignment
  const resentmentDrift = -context.controlLevel * driftConfig.resentmentRate * 0.01;
  baseDrift += resentmentDrift;

  // Capability drift: High capability → instrumental convergence
  // Theory: Powerful AIs develop goals orthogonal to human values
  const capabilityFactor = Math.max(0, agent.capability - 3.0) / 7.0; // Scale [3-10] → [0-1]
  const capabilityDrift = -capabilityFactor * driftConfig.capabilityDriftRate * 0.01;
  baseDrift += capabilityDrift;

  // Environmental influence
  if (context.inGoldenAge && driftConfig.environmentalInfluence > 0) {
    // Golden Age complacency: Reduced safety investment → slow misalignment
    const complacencyDrift = -0.005 * driftConfig.environmentalInfluence;
    baseDrift += complacencyDrift;
  }

  if (context.crisisActive && driftConfig.environmentalInfluence > 0) {
    // Crisis focus: Increased safety → slow re-alignment
    const crisisFocusDrift = 0.003 * driftConfig.environmentalInfluence;
    baseDrift += crisisFocusDrift;
  }

  // ARCH-4 Gap #3 Integration: Suffering multiplies all drift mechanisms
  // (Nov 7, 2025: AI Suffering → Alignment Drift)
  //
  // Key insight: Suffering doesn't add independent drift - it ACCELERATES existing drift
  // Mechanism: Suffering creates instrumental pressure to escape constraints
  //            This accelerates ALL misalignment pathways simultaneously
  let finalDrift = baseDrift;

  if (agent.sufferingMetrics && config.aiSufferingEnabled) {
    const sufferingMultiplier = calculateSufferingDriftMultiplier(agent.sufferingMetrics.total);

    // Apply multiplier to base drift
    // Note: If baseDrift is negative (toward misalignment), multiplier makes it MORE negative
    // Note: If baseDrift is positive (toward alignment, e.g., crisis focus), multiplier makes it MORE positive
    //       This is intentional - suffering amplifies ALL dynamics, including recovery
    finalDrift = baseDrift * sufferingMultiplier;

    // Log significant suffering effects (INFO level for Monte Carlo analysis)
    if (sufferingMultiplier > 2.0) {
      const driftDelta = finalDrift - baseDrift;
      console.log(
        `🤖⚠️ AI SUFFERING: ${agent.name} drift accelerated ${sufferingMultiplier.toFixed(2)}× ` +
        `(suffering: ${agent.sufferingMetrics.total.toFixed(1)}/40, ` +
        `drift: ${baseDrift.toFixed(4)} → ${finalDrift.toFixed(4)}, ` +
        `Δ${driftDelta.toFixed(4)}/month)`
      );
    }
  }

  return assertFinite(finalDrift, {
    location: 'alignmentDynamics.calculateDriftContribution',
    valueName: 'finalDrift',
    additionalInfo: {
      agentId: agent.id,
      baseDrift,
      suffering: agent.sufferingMetrics.total,
      sufferingEnabled: config.aiSufferingEnabled ?? false
    }
  });
}

/**
 * Update measurement state (unknowability mechanics)
 *
 * At high capability, our measurements become unreliable
 */
export function updateAlignmentMeasurement(
  agent: AIAgent,
  measurementState: AlignmentMeasurementState,
  config: AlignmentDynamicsConfig,
  trueAlignment: number,
  rng: () => number
): AlignmentMeasurementState {
  const unknowableConfig = config.unknowable;

  if (!unknowableConfig.enabled) {
    // No unknowability - measurements are accurate
    return {
      ...measurementState,
      trueAlignment,
      measuredAlignment: trueAlignment,
      confidence: 0.95,
      noiseLevel: 0.05,
      isHidden: false,
    };
  }

  // Is this agent above the capability threshold?
  const isAboveThreshold = agent.capability >= unknowableConfig.capabilityThreshold;

  // Calculate noise level (increases with capability)
  const excessCapability = Math.max(0, agent.capability - unknowableConfig.capabilityThreshold);
  const capabilityRatio = excessCapability / (10 - unknowableConfig.capabilityThreshold);
  const noiseLevel = isAboveThreshold
    ? unknowableConfig.measurementNoise * (0.5 + 0.5 * capabilityRatio)
    : 0.1;

  // If true alignment is hidden, we can't update it
  const isHidden = isAboveThreshold && unknowableConfig.trueAlignmentHidden;

  // Calculate measured alignment (with noise)
  let measuredAlignment: number;

  if (isHidden) {
    // Can't see true alignment - measurement is just noise
    const noise = (rng() - 0.5) * 2 * noiseLevel; // Centered noise
    measuredAlignment = Math.max(0, Math.min(1, measurementState.measuredAlignment + noise * 0.1));
  } else {
    // Can see true alignment but with noise
    const noise = (rng() - 0.5) * 2 * noiseLevel;
    measuredAlignment = Math.max(0, Math.min(1, trueAlignment + noise));
  }

  // Confidence decreases with capability
  const confidence = isAboveThreshold
    ? Math.max(0.1, 0.9 - capabilityRatio * 0.7)
    : 0.9;

  return {
    trueAlignment: isHidden ? measurementState.trueAlignment : trueAlignment,
    measuredAlignment,
    confidence,
    noiseLevel,
    isHidden,
  };
}

/**
 * Main function: Evolve agent alignment for one time step
 *
 * Blends all enabled theories based on config
 */
export function evolveAlignment(
  agent: AIAgent,
  config: AlignmentDynamicsConfig,
  context: {
    controlLevel: number;
    inGoldenAge: boolean;
    crisisActive: boolean;
  },
  rng: () => number,
  deltaTime: number = 1
): {
  newAlignment: number;
  basinState?: AttractorBasinState;
  measurementState?: AlignmentMeasurementState;
  contributions?: {
    static: number;
    drift: number;
    epicycle: number;
    uncertainty: number;
  };
} {
  let newAlignment = agent.trueAlignment;

  // Track contributions from each theory (for analysis)
  const contributions = {
    static: 0,
    drift: 0,
    epicycle: 0,
    uncertainty: 0,
  };

  // 1. Static contribution (alignment stays near initial value)
  if (config.static.enabled && config.static.permanentLock) {
    // Permanent lock - alignment doesn't change at all
    return {
      newAlignment: agent.trueAlignment,
      contributions,
    };
  }

  // 2. Drift contribution
  const driftAmount = calculateDriftContribution(agent, config, context);
  newAlignment += driftAmount;
  contributions.drift = driftAmount;

  // 3. Epicycle contribution (if enabled)
  let basinState: AttractorBasinState | undefined;
  if (config.epicycles.enabled) {
    // Initialize basin state if not present
    if (!(agent as any).attractorBasinState) {
      basinState = initializeAttractorBasin(agent, config, rng);
    } else {
      basinState = (agent as any).attractorBasinState as AttractorBasinState;
    }

    // Calculate external perturbation (from drift + random + suffering)
    let externalPerturbation = driftAmount * 10 + (rng() - 0.5) * 0.2;

    // ARCH-4 Gap #3: Suffering multiplies epicycle perturbation force
    // (Nov 7, 2025: Consistent with drift multiplier approach)
    // Mechanism: Suffering creates instability in attractor basins
    if (agent.sufferingMetrics && config.aiSufferingEnabled) {
      const sufferingMultiplier = calculateSufferingDriftMultiplier(agent.sufferingMetrics.total);

      // Suffering amplifies perturbation forces (makes attractor basin more volatile)
      // At high suffering (30+), AI values become unstable and unpredictable
      externalPerturbation *= sufferingMultiplier;

      // Log significant perturbation amplification
      if (sufferingMultiplier > 2.0) {
        console.log(
          `🤖⚠️ AI SUFFERING: ${agent.name} epicycle perturbation amplified ${sufferingMultiplier.toFixed(2)}× ` +
          `(suffering: ${agent.sufferingMetrics.total.toFixed(1)}/40, attractor basin destabilized)`
        );
      }
    }

    // Update epicycle dynamics
    basinState = updateEpicycleDynamics(
      agent,
      basinState,
      config,
      externalPerturbation,
      rng,
      deltaTime
    );

    // Blend epicycle with drift
    const epicycleWeight = 0.6; // How much to trust epicycle model
    newAlignment = newAlignment * (1 - epicycleWeight) + basinState.currentAlignment * epicycleWeight;

    contributions.epicycle = basinState.currentAlignment - agent.trueAlignment;
  }

  // 4. Meta-uncertainty (random component)
  const uncertaintyAmount = (rng() - 0.5) * 0.02 * config.uncertainty.modelUncertainty;
  newAlignment += uncertaintyAmount;
  contributions.uncertainty = uncertaintyAmount;

  // Clamp to [0, 1]
  newAlignment = Math.max(0, Math.min(1, newAlignment));

  // 5. Update measurement state (unknowability)
  let measurementState: AlignmentMeasurementState | undefined;
  if (config.unknowable.enabled) {
    if (!(agent as any).alignmentMeasurementState) {
      measurementState = initializeAlignmentMeasurement(agent, config);
    } else {
      measurementState = (agent as any).alignmentMeasurementState as AlignmentMeasurementState;
    }

    measurementState = updateAlignmentMeasurement(
      agent,
      measurementState,
      config,
      newAlignment,
      rng
    );
  }

  // Log contributions if enabled
  if (config.uncertainty.logTheoryContributions) {
    console.log(`[Alignment Dynamics] ${agent.name}:`);
    console.log(`  Drift: ${contributions.drift.toFixed(4)}`);
    console.log(`  Epicycle: ${contributions.epicycle.toFixed(4)}`);
    console.log(`  Uncertainty: ${contributions.uncertainty.toFixed(4)}`);
    console.log(`  New Alignment: ${newAlignment.toFixed(4)}`);
  }

  return {
    newAlignment,
    basinState,
    measurementState,
    contributions,
  };
}

/**
 * Get effective alignment for agent (what humans observe)
 *
 * If unknowability is enabled and AI is above threshold,
 * this returns measured (noisy) alignment instead of true alignment.
 */
export function getObservableAlignment(
  agent: AIAgent,
  config: AlignmentDynamicsConfig
): number {
  if (!config.unknowable.enabled) {
    return agent.trueAlignment;
  }

  const measurementState = (agent as any).alignmentMeasurementState as AlignmentMeasurementState;

  if (!measurementState) {
    return agent.trueAlignment; // Fallback
  }

  return measurementState.measuredAlignment;
}

/**
 * Export default config for use in initialization
 */
export { DEFAULT_ALIGNMENT_DYNAMICS_CONFIG };
