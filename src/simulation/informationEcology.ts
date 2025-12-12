/**
 * Information Ecology & Epistemic Degradation System
 *
 * Models the information environment's impact on coordination capacity:
 * - Misinformation spread (SIS epidemiological model with UNCERTAINTY)
 * - Trust erosion (event-driven + baseline decay)
 * - AI influence on polarization (bounded, diminishing returns)
 * - Fact-checking effectiveness (decay over contested time ranges)
 *
 * **Research Foundation:**
 * - Vosoughi et al. (2018): Misinformation spreads faster than truth (R₀ contested)
 * - Pennycook et al. (2024): Fact-checking effectiveness decays rapidly
 * - Lorenz-Spreen et al. (2023): Digital media accelerates opinion polarization
 * - Donovan & Boyd (2021): Information disorders create coordination failures
 *
 * **CRITICAL UNCERTAINTIES (Research Skeptic Grade: B-):**
 * 1. Epidemiological model validity contested (Springer 2025 philosophy of science critique)
 * 2. Coordination threshold (0.2) from single case study (Ukraine EA Forum post, not peer-reviewed)
 * 3. Fact-check decay: Range [5, 30] days (literature mixed, not uniform)
 * 4. Trust erosion assumes linearity (historical data shows stepwise drops)
 *
 * **Implementation approach:**
 * - All parameters as DISTRIBUTIONS sampled with RNG
 * - Coordination threshold as SOFT probability, not hard cutoff
 * - Extensive assertions (no silent fallbacks)
 * - Document uncertainty in comments
 *
 * @see research/information_ecology_epistemic_degradation_20251202.md
 * @see reviews/information_ecology_critique_20251202.md
 */

import type { GameState, RNGFunction } from '@/types/game';
import { assertFinite, assertInRange, assertStateProperty } from './utils/assertions';

/**
 * Information Ecology State
 *
 * Tracks the health of the information environment.
 */
export interface InformationEcologyState {
  /** [0, 1] Quality of information environment (0 = polluted, 1 = healthy) */
  epistemicHealth: number;

  /** [0, 1] Affective polarization level (0 = unified, 1 = fully polarized) */
  polarization: number;

  /** [0, 1] General social trust (0 = zero trust, 1 = full trust) */
  socialTrust: number;

  /** [0, 1] Consensus on basic facts (0 = no shared reality, 1 = full agreement) */
  sharedReality: number;

  /** [0, 1] Current misinformation prevalence (0 = none, 1 = saturated) */
  misinformationLoad: number;

  /**
   * Fact-check effectiveness half-life (days)
   *
   * CONTESTED PARAMETER: Range [5, 30] days based on mixed literature.
   * - Pessimistic: Capewell et al. (2024) shows rapid decay
   * - Optimistic: PNAS 2022 shows "effects still apparent >2 weeks later"
   *
   * Sampled per run for sensitivity analysis.
   */
  factCheckHalfLife: number;

  /**
   * Misinformation R₀ (reproduction number)
   *
   * CONTESTED PARAMETER: Epidemiological model validity questioned.
   * - Vosoughi et al. (2018): R₀ ≈ 1.5 (spreading coefficient)
   * - Springer 2025 critique: Biological analogy fundamentally flawed
   *
   * Range [1.2, 1.8] captures uncertainty. Sampled per run.
   */
  misinformationR0: number;

  /** Days since last major epistemic shock (e.g., nuclear event, major AI deception) */
  daysSinceLastShock: number;
}

/**
 * Initialize information ecology state
 *
 * Samples contested parameters from distributions using RNG.
 */
export function initializeInformationEcology(rng: RNGFunction): InformationEcologyState {
  // Sample contested parameters from distributions
  const factCheckHalfLife = 5 + rng() * 25; // [5, 30] days
  const misinformationR0 = 1.2 + rng() * 0.6; // [1.2, 1.8]

  return {
    epistemicHealth: 0.65, // Starting state: Moderate quality (2025 baseline)
    polarization: 0.45, // Starting state: Moderately polarized
    socialTrust: 0.55, // Starting state: Below-average trust
    sharedReality: 0.60, // Starting state: Some consensus erosion
    misinformationLoad: 0.30, // Starting state: Moderate misinformation
    factCheckHalfLife,
    misinformationR0,
    daysSinceLastShock: 0,
  };
}

/**
 * Update misinformation spread using SIS model (with UNCERTAINTY bounds)
 *
 * SIS model: Susceptible → Infected → Susceptible (no permanent immunity)
 * - Susceptible: Not currently believing misinformation
 * - Infected: Currently believing misinformation
 *
 * **CAVEAT (QG1 Validation, Dec 12, 2025):** Epidemiological model contested (Yee 2025, Synthese).
 * Biological analogies may be fundamentally flawed due to:
 * - Constant transmission rates assume homogeneous spreading (empirically false)
 * - Semantic mutation (misinformation changes meaning)
 * - Agency (people choose to spread)
 * - Network structure (clustered, not complete connectivity)
 *
 * **Effect sizes should be treated as upper bounds.** Real-world spread likely slower than model predicts.
 *
 * @param state Information ecology state
 * @param rng Deterministic RNG
 * @param daysElapsed Days since last update
 * @returns Updated misinformation load
 */
function updateMisinformationSpread(
  state: InformationEcologyState,
  rng: RNGFunction,
  daysElapsed: number
): number {
  const { misinformationLoad, misinformationR0, factCheckHalfLife } = state;

  // SIS dynamics (per day)
  const beta = misinformationR0 / 10; // Transmission rate (R₀ / infectious period)
  const gamma = Math.log(2) / factCheckHalfLife; // Recovery rate (fact-checking)

  // Susceptible fraction
  const susceptible = 1 - misinformationLoad;

  // dI/dt = β*I*S - γ*I
  const infectionRate = beta * misinformationLoad * susceptible;
  const recoveryRate = gamma * misinformationLoad;

  const netChange = (infectionRate - recoveryRate) * daysElapsed;

  const newLoad = assertFinite(
    Math.max(0, Math.min(1, misinformationLoad + netChange)),
    {
      location: 'updateMisinformationSpread',
      valueName: 'newMisinformationLoad',
      additionalInfo: { misinformationLoad, infectionRate, recoveryRate, daysElapsed },
    }
  );

  return newLoad;
}

/**
 * Update trust erosion
 *
 * **MECHANISM:**
 * - Baseline decay: -1% to -3% per year (contested: assumes linearity)
 * - Event shocks: Nuclear events, major AI deceptions cause stepwise drops
 * - Partial recovery: Trust can recover slowly if no new shocks
 *
 * **CAVEAT:** Historical trust data shows stepwise drops after events, not steady erosion.
 * Linear model may overestimate gradual decay, underestimate shock impacts.
 *
 * @param state Information ecology state
 * @param gameState Full game state (for event detection)
 * @param rng Deterministic RNG
 * @param daysElapsed Days since last update
 * @returns Updated social trust
 */
function updateTrustErosion(
  state: InformationEcologyState,
  gameState: GameState,
  rng: RNGFunction,
  daysElapsed: number
): number {
  const { socialTrust, polarization, daysSinceLastShock } = state;

  // Baseline decay rate: Sample from [-1%, -3%] per year
  const baselineDecayPerYear = -0.01 - rng() * 0.02; // [-0.03, -0.01]
  const baselineDecayPerDay = baselineDecayPerYear / 365;

  // Polarization amplifies decay (high polarization → faster trust loss)
  const polarizationMultiplier = 1 + polarization * 2; // [1, 3]

  // Trust recovery coefficient (slow recovery when no recent shocks)
  const recoveryRate = daysSinceLastShock > 180 ? 0.001 : 0; // +0.1% per day after 180 days

  const netChange =
    baselineDecayPerDay * polarizationMultiplier * daysElapsed + recoveryRate * daysElapsed;

  const newTrust = assertFinite(Math.max(0, Math.min(1, socialTrust + netChange)), {
    location: 'updateTrustErosion',
    valueName: 'newSocialTrust',
    additionalInfo: { socialTrust, polarization, netChange, daysElapsed },
  });

  return newTrust;
}

/**
 * Update AI impact on polarization
 *
 * **MECHANISM:**
 * - AI recommendation algorithms can amplify filter bubbles
 * - Effect bounded: [-3, +3] percentage points per 10 days
 * - Diminishing returns: Effect saturates at high/low polarization
 * - Direction uncertain: AI can polarize OR depolarize
 *
 * **Research:**
 * - Lorenz-Spreen et al. (2023): Digital media accelerates polarization
 * - Bail et al. (2018): Exposure to opposing views can INCREASE polarization
 * - Nyhan et al. (2023): Depolarization interventions show mixed results
 *
 * @param state Information ecology state
 * @param gameState Full game state (for AI capability levels)
 * @param rng Deterministic RNG
 * @param daysElapsed Days since last update
 * @returns Updated polarization
 */
function updateAIPolarizationImpact(
  state: InformationEcologyState,
  gameState: GameState,
  rng: RNGFunction,
  daysElapsed: number
): number {
  const { polarization } = state;

  // Get AI social capability (proxy for recommendation algorithm sophistication)
  const aiSocialCapability = gameState.aiAgents.reduce((max, agent) => {
    const socialCap = agent.capabilityProfile?.social ?? 0;
    return Math.max(max, socialCap);
  }, 0);

  // AI impact: [-3, +3] percentage points per 10 days, scaled by capability
  const baseImpact = (rng() * 0.06 - 0.03) * (daysElapsed / 10); // [-0.03, +0.03] per 10 days
  const capabilityScaling = aiSocialCapability / 100; // [0, 1]

  // Diminishing returns: Effect saturates at extremes
  const saturationFactor =
    polarization < 0.2 ? polarization / 0.2 : polarization > 0.8 ? (1 - polarization) / 0.2 : 1;

  const netChange = baseImpact * capabilityScaling * saturationFactor;

  const newPolarization = assertFinite(Math.max(0, Math.min(1, polarization + netChange)), {
    location: 'updateAIPolarizationImpact',
    valueName: 'newPolarization',
    additionalInfo: { polarization, aiSocialCapability, netChange, daysElapsed },
  });

  return newPolarization;
}

/**
 * Update shared reality (consensus on basic facts)
 *
 * **MECHANISM:**
 * - Decays with high misinformation load
 * - Erodes faster when polarization is high (groups construct separate realities)
 * - Can recover with low misinformation + high trust
 *
 * @param state Information ecology state
 * @param rng Deterministic RNG
 * @param daysElapsed Days since last update
 * @returns Updated shared reality
 */
function updateSharedReality(
  state: InformationEcologyState,
  rng: RNGFunction,
  daysElapsed: number
): number {
  const { sharedReality, misinformationLoad, polarization, socialTrust } = state;

  // Erosion rate: Misinformation + polarization drive decay
  const erosionRate = (misinformationLoad * 0.5 + polarization * 0.5) * 0.02; // [0, 2%] per day

  // Recovery rate: Low misinformation + high trust enable recovery
  const recoveryRate = misinformationLoad < 0.3 && socialTrust > 0.5 ? 0.005 : 0; // 0.5% per day

  const netChange = (-erosionRate + recoveryRate) * daysElapsed;

  const newSharedReality = assertFinite(Math.max(0, Math.min(1, sharedReality + netChange)), {
    location: 'updateSharedReality',
    valueName: 'newSharedReality',
    additionalInfo: { sharedReality, misinformationLoad, polarization, netChange, daysElapsed },
  });

  return newSharedReality;
}

/**
 * Update epistemic health (composite metric)
 *
 * Combines multiple factors:
 * - Low misinformation load
 * - High shared reality
 * - High social trust
 * - Low polarization
 *
 * @param state Information ecology state
 * @returns Updated epistemic health
 */
function updateEpistemicHealth(state: InformationEcologyState): number {
  const { misinformationLoad, sharedReality, socialTrust, polarization } = state;

  // Weighted geometric mean (prevents any single factor from being ignored)
  const MIN_FLOOR = 0.01; // Prevent zero geometric mean

  const healthComponents = [
    Math.max(MIN_FLOOR, 1 - misinformationLoad), // Invert misinformation (high is bad)
    Math.max(MIN_FLOOR, sharedReality),
    Math.max(MIN_FLOOR, socialTrust),
    Math.max(MIN_FLOOR, 1 - polarization), // Invert polarization (high is bad)
  ];

  const geometricMean = Math.pow(
    healthComponents.reduce((prod, val) => prod * val, 1),
    1 / healthComponents.length
  );

  const epistemicHealth = assertFinite(geometricMean, {
    location: 'updateEpistemicHealth',
    valueName: 'epistemicHealth',
    additionalInfo: { healthComponents },
  });

  return epistemicHealth;
}

/**
 * Apply epistemic shock (nuclear event, major AI deception, etc.)
 *
 * **MECHANISM:**
 * - Stepwise drops in trust (historical pattern)
 * - Increased misinformation load
 * - Polarization spike
 *
 * @param state Information ecology state
 * @param severity Shock severity [0, 1]
 * @param rng Deterministic RNG
 */
export function applyEpistemicShock(
  state: InformationEcologyState,
  severity: number,
  rng: RNGFunction
): void {
  const severityChecked = assertInRange(severity, 0, 1, {
    location: 'applyEpistemicShock',
    valueName: 'severity',
  });

  // Trust drop: [5%, 30%] based on severity
  const trustDrop = 0.05 + severityChecked * 0.25;
  state.socialTrust = assertFinite(Math.max(0, state.socialTrust - trustDrop), {
    location: 'applyEpistemicShock',
    valueName: 'socialTrust after shock',
    additionalInfo: { trustDrop, severity: severityChecked },
  });

  // Misinformation spike: [10%, 40%] based on severity
  const misinformationSpike = 0.1 + severityChecked * 0.3;
  state.misinformationLoad = assertFinite(
    Math.min(1, state.misinformationLoad + misinformationSpike),
    {
      location: 'applyEpistemicShock',
      valueName: 'misinformationLoad after shock',
      additionalInfo: { misinformationSpike, severity: severityChecked },
    }
  );

  // Polarization spike: [5%, 20%] based on severity
  const polarizationSpike = 0.05 + severityChecked * 0.15;
  state.polarization = assertFinite(Math.min(1, state.polarization + polarizationSpike), {
    location: 'applyEpistemicShock',
    valueName: 'polarization after shock',
    additionalInfo: { polarizationSpike, severity: severityChecked },
  });

  // Reset shock timer
  state.daysSinceLastShock = 0;
}

/**
 * Calculate coordination capacity modifier
 *
 * **CRITICAL CAVEAT:** Threshold (trust × shared_reality < 0.2) from SINGLE qualitative case study.
 * - Source: EA Forum post on Ukraine coordination collapse (not peer-reviewed)
 * - Evidence: n=1 country, no quantitative measurement
 * - Implementation: SOFT threshold with probability distribution (not hard cutoff)
 *
 * **HYPOTHESIS:** Below threshold, coordination "literally impossible" (qualitative claim).
 * **REALITY:** Likely sigmoid decay, not cliff.
 *
 * @param state Information ecology state
 * @param rng Deterministic RNG
 * @returns Coordination capacity multiplier [0.5, 1.0]
 */
export function calculateCoordinationModifier(
  state: InformationEcologyState,
  rng: RNGFunction
): number {
  const { socialTrust, sharedReality } = state;

  // Coordination metric: Product of trust and shared reality
  const coordinationMetric = socialTrust * sharedReality;

  // HYPOTHESIS: Critical threshold at 0.2 (contested, single case study)
  // Implementation: Soft sigmoid decay centered at 0.2, range [0.1, 0.3]
  const thresholdCenter = 0.15 + rng() * 0.15; // [0.15, 0.30] - UNCERTAINTY RANGE
  const steepness = 20; // Sigmoid steepness (lower = softer transition)

  // Sigmoid: maps [0, 1] to [minCapacity, 1.0]
  const minCapacity = 0.5; // Coordination doesn't go to zero (some local coordination always possible)
  const sigmoid = 1 / (1 + Math.exp(-steepness * (coordinationMetric - thresholdCenter)));
  const modifier = minCapacity + (1 - minCapacity) * sigmoid;

  const modifierChecked = assertFinite(modifier, {
    location: 'calculateCoordinationModifier',
    valueName: 'coordinationModifier',
    additionalInfo: { socialTrust, sharedReality, coordinationMetric, thresholdCenter },
  });

  return assertInRange(modifierChecked, 0, 1, {
    location: 'calculateCoordinationModifier',
    valueName: 'coordinationModifier (range check)',
  });
}

/**
 * Update information ecology state
 *
 * **Main update function called by phase.**
 *
 * @param state Information ecology state
 * @param gameState Full game state
 * @param rng Deterministic RNG
 * @param daysElapsed Days since last update
 * @returns Updated state (mutates in place, returns for convenience)
 */
export function updateInformationEcology(
  state: InformationEcologyState,
  gameState: GameState,
  rng: RNGFunction,
  daysElapsed: number
): InformationEcologyState {
  // Update component dynamics
  state.misinformationLoad = updateMisinformationSpread(state, rng, daysElapsed);
  state.socialTrust = updateTrustErosion(state, gameState, rng, daysElapsed);
  state.polarization = updateAIPolarizationImpact(state, gameState, rng, daysElapsed);
  state.sharedReality = updateSharedReality(state, rng, daysElapsed);
  state.epistemicHealth = updateEpistemicHealth(state);

  // Increment shock timer
  state.daysSinceLastShock += daysElapsed;

  return state;
}
