/**
 * Uncertainty Parameter Sampling for Climate & Tipping Point Thresholds
 *
 * Samples climate and tipping point parameters from research-backed distributions
 * at simulation initialization. These parameters represent epistemic uncertainty
 * in physical systems - the same RNG seed produces identical parameters.
 *
 * Research foundations:
 * - IPCC AR6 WG1 (2021): Climate sensitivity (ECS/TCR)
 * - Westen et al. JGR (2024): AMOC collapse threshold
 * - Nature (2023): Greenland ice sheet threshold
 * - Bellomo et al. Nature (2025): AMOC resilience
 * - Frontiers in Public Health (2025): Amazon dieback threshold
 *
 * Implementation notes:
 * - All parameters sampled ONCE at initialization for each run
 * - Different seeds produce different parameter sets
 * - Same seed produces identical parameters (deterministic)
 * - Use assertFinite for all outputs (fail loudly on invalid samples)
 */

import type { RNGFunction } from '@/types/config';
import { assertFinite, assertInRange } from '@/simulation/utils/assertions';
import { sampleNormal, sampleLogNormal, sampleUniform } from '@/simulation/utils/distributions';

/**
 * Uncertainty Parameters Interface
 *
 * Climate and tipping point parameters sampled from research-backed distributions.
 * These represent epistemic uncertainty (what we don't know) rather than aleatory
 * uncertainty (random events that happen during simulation).
 *
 * Sampled once at initialization, constant throughout simulation run.
 */
export interface UncertaintyParameters {
  // === CLIMATE SENSITIVITY ===

  /**
   * Equilibrium Climate Sensitivity (ECS)
   *
   * Global mean surface temperature increase per doubling of CO2.
   * IPCC AR6 (2021): Best estimate 3.0C, likely range 2.5-4.0C, very likely 2.0-5.0C
   *
   * Distribution: Log-normal (asymmetric with long tail to higher values)
   * Range: [2.0, 5.0] C (very likely range, clamped)
   *
   * Impact: CRITICAL - Directly affects temperature trajectory, all tipping points
   */
  equilibriumClimateSensitivity: number;

  /**
   * Transient Climate Response (TCR)
   *
   * Temperature increase at time of CO2 doubling (70 years after 1% annual increase).
   * IPCC AR6 (2021): Best estimate 1.8C, likely range 1.4-2.2C
   *
   * Distribution: Normal (more symmetric than ECS)
   * Range: [1.2, 2.4] C (very likely range, clamped)
   *
   * Impact: HIGH - Affects timing of tipping point crossings (near-term warming)
   */
  transientClimateResponse: number;

  // === TIPPING POINT THRESHOLDS ===

  /**
   * AMOC Collapse Threshold
   *
   * Temperature anomaly at which Atlantic Meridional Overturning Circulation collapses.
   * Westen et al. JGR (2024): 95% CI [2.2, 3.9]C, median 3.0C
   *
   * Distribution: Uniform (no distribution shape information available)
   * Range: [2.2, 3.9] C
   *
   * Impact: HIGH - AMOC collapse is mega-cascade trigger (Europe, Africa, Americas)
   */
  amocCollapseThreshold: number;

  /**
   * Greenland Ice Sheet Collapse Threshold
   *
   * Temperature anomaly triggering irreversible Greenland ice sheet collapse.
   * Nature (2023): [0.8, 3.2]C - very wide uncertainty range
   *
   * Distribution: Uniform (wide range, no clear distribution)
   * Range: [0.8, 3.2] C
   *
   * Impact: MEDIUM-HIGH - 7.2m sea level rise commitment over centuries
   */
  greenlandCollapseThreshold: number;

  /**
   * West Antarctic Ice Sheet (WAIS) Collapse Threshold
   *
   * Temperature anomaly triggering WAIS collapse via marine ice sheet instability.
   * IPCC AR6 / Nature Comms (2025): [2.0, 3.0]C
   *
   * Distribution: Uniform (narrower range than Greenland)
   * Range: [2.0, 3.0] C
   *
   * Impact: MEDIUM - 3.3m sea level rise commitment
   */
  waisCollapseThreshold: number;

  /**
   * Amazon Dieback Deforestation Threshold
   *
   * Deforestation percentage triggering irreversible Amazon dieback.
   * Frontiers in Public Health (2025): 20-25% deforestation threshold
   *
   * Distribution: Uniform
   * Range: [0.20, 0.25] (as fraction)
   *
   * Impact: HIGH - 150 Gt C release -> +0.4-0.6C additional warming
   */
  amazonDiebackDeforestation: number;

  // === EFFECTIVENESS MULTIPLIERS ===

  /**
   * Aid/Intervention Effectiveness Multiplier
   *
   * Multiplier on mortality reduction from aid and intervention programs.
   * Accounts for implementation variance, institutional quality, etc.
   *
   * Distribution: Normal centered on 1.0
   * Range: [0.8, 1.2]
   *
   * Impact: MEDIUM - Affects crisis mortality calculations
   */
  aidEffectivenessMultiplier: number;

  /**
   * Coral Reef Collapse Threshold
   *
   * Temperature anomaly at which coral reefs experience mass die-off.
   * IPCC AR6: 1.0-1.5C (central estimate 1.2C) - we're already past this
   *
   * Distribution: Uniform (narrow range)
   * Range: [1.0, 1.5] C
   *
   * Impact: LOW (for future projections - already crossed at 1.4C)
   */
  coralReefThreshold: number;

  /**
   * Permafrost Carbon Pool
   *
   * Total carbon stored in permafrost available for release.
   * Nature Climate Change (2022): 1,460-1,600 Gt C
   *
   * Distribution: Uniform (10% uncertainty)
   * Range: [1460, 1600] Gt C
   *
   * Impact: MEDIUM - Affects carbon feedback intensity
   */
  permafrostCarbonPool: number;
}

/**
 * Sample all uncertainty parameters from research-backed distributions
 *
 * Uses deterministic RNG for reproducibility. Same seed = same parameters.
 *
 * @param rng - Deterministic RNG function (REQUIRED)
 * @returns Sampled uncertainty parameters
 * @throws Error if RNG is not provided or samples are invalid
 */
export function sampleUncertaintyParameters(rng: RNGFunction): UncertaintyParameters {
  // CRITICAL: RNG is required for deterministic simulation
  if (!rng || typeof rng !== 'function') {
    throw new Error('sampleUncertaintyParameters: RNG function required for deterministic sampling');
  }

  // === CLIMATE SENSITIVITY ===

  // ECS: Log-normal distribution (asymmetric, long tail to higher values)
  // IPCC AR6: Best estimate 3.0C, likely 2.5-4.0C
  // Parameters: median=3.0, sigma=0.25 gives ~68% in [2.3, 3.9]
  const ecsRaw = sampleLogNormal(Math.log(3.0), 0.25, rng);
  const equilibriumClimateSensitivity = assertInRange(
    Math.max(2.0, Math.min(5.0, ecsRaw)),
    2.0, 5.0,
    {
      location: 'sampleUncertaintyParameters',
      valueName: 'equilibriumClimateSensitivity',
      additionalInfo: { ecsRaw, source: 'IPCC AR6 (2021)' }
    }
  );

  // TCR: Normal distribution (more symmetric)
  // IPCC AR6: Best estimate 1.8C, likely 1.4-2.2C
  // Parameters: mean=1.8, stdDev=0.3 gives ~68% in [1.5, 2.1]
  const tcrRaw = sampleNormal(1.8, 0.3, rng);
  const transientClimateResponse = assertInRange(
    Math.max(1.2, Math.min(2.4, tcrRaw)),
    1.2, 2.4,
    {
      location: 'sampleUncertaintyParameters',
      valueName: 'transientClimateResponse',
      additionalInfo: { tcrRaw, source: 'IPCC AR6 (2021)' }
    }
  );

  // === TIPPING POINT THRESHOLDS ===

  // AMOC: Uniform over meta-analysis range (no distribution shape available)
  // RECALIBRATED (Nov 24, 2025): Updated from Van Westen et al. single-model [2.2, 3.9] to
  // Armstrong McKay et al. (2022) Science meta-analysis: range [1.4, 8.0], central estimate 4.0°C
  // Baker et al. (2025) Nature: 34/35 CMIP6 models show AMOC resilience - supports higher threshold
  // Using [2.5, 5.5] to capture plausible range around median 4.0°C (conservative compared to full 1.4-8°C)
  // Sylvia audit: reviews/mechanism_audit_tipping_cascades_20251124.md
  const amocCollapseThreshold = assertInRange(
    sampleUniform(2.5, 5.5, rng),
    2.5, 5.5,
    {
      location: 'sampleUncertaintyParameters',
      valueName: 'amocCollapseThreshold',
      additionalInfo: { source: 'Armstrong McKay et al. (2022) Science, Baker et al. (2025) Nature' }
    }
  );

  // Greenland: Uniform (very wide range, no clear distribution)
  // Nature (2023): [0.8, 3.2]C
  const greenlandCollapseThreshold = assertInRange(
    sampleUniform(0.8, 3.2, rng),
    0.8, 3.2,
    {
      location: 'sampleUncertaintyParameters',
      valueName: 'greenlandCollapseThreshold',
      additionalInfo: { source: 'Nature (2023)' }
    }
  );

  // WAIS: Uniform (narrower range)
  // IPCC AR6 / Nature Comms (2025): [2.0, 3.0]C
  const waisCollapseThreshold = assertInRange(
    sampleUniform(2.0, 3.0, rng),
    2.0, 3.0,
    {
      location: 'sampleUncertaintyParameters',
      valueName: 'waisCollapseThreshold',
      additionalInfo: { source: 'Nature Comms E&E (2025)' }
    }
  );

  // Amazon: Uniform over deforestation threshold range
  // Frontiers in Public Health (2025): 20-25% deforestation
  const amazonDiebackDeforestation = assertInRange(
    sampleUniform(0.20, 0.25, rng),
    0.20, 0.25,
    {
      location: 'sampleUncertaintyParameters',
      valueName: 'amazonDiebackDeforestation',
      additionalInfo: { source: 'Frontiers in Public Health (2025)' }
    }
  );

  // === EFFECTIVENESS MULTIPLIERS ===

  // Aid effectiveness: Normal centered on 1.0
  // Accounts for implementation variance
  const aidRaw = sampleNormal(1.0, 0.1, rng);
  const aidEffectivenessMultiplier = assertInRange(
    Math.max(0.8, Math.min(1.2, aidRaw)),
    0.8, 1.2,
    {
      location: 'sampleUncertaintyParameters',
      valueName: 'aidEffectivenessMultiplier',
      additionalInfo: { aidRaw }
    }
  );

  // Coral reef: Uniform (narrow range, already crossed)
  // IPCC AR6: 1.0-1.5C
  const coralReefThreshold = assertInRange(
    sampleUniform(1.0, 1.5, rng),
    1.0, 1.5,
    {
      location: 'sampleUncertaintyParameters',
      valueName: 'coralReefThreshold',
      additionalInfo: { source: 'IPCC AR6 (2021)' }
    }
  );

  // Permafrost carbon pool: Uniform (10% uncertainty)
  // Nature Climate Change (2022): 1,460-1,600 Gt C
  const permafrostCarbonPool = assertInRange(
    sampleUniform(1460, 1600, rng),
    1460, 1600,
    {
      location: 'sampleUncertaintyParameters',
      valueName: 'permafrostCarbonPool',
      additionalInfo: { source: 'Nature Climate Change (2022)' }
    }
  );

  // Return all sampled parameters
  return {
    equilibriumClimateSensitivity,
    transientClimateResponse,
    amocCollapseThreshold,
    greenlandCollapseThreshold,
    waisCollapseThreshold,
    amazonDiebackDeforestation,
    aidEffectivenessMultiplier,
    coralReefThreshold,
    permafrostCarbonPool
  };
}

/**
 * Log uncertainty parameters for debugging/analysis
 *
 * Outputs sampled parameters with their research sources.
 */
export function logUncertaintyParameters(params: UncertaintyParameters): void {
  console.log('\n=== Uncertainty Parameters (Sampled at Initialization) ===');
  console.log(`  ECS (Climate Sensitivity): ${params.equilibriumClimateSensitivity.toFixed(2)}C [2.0-5.0, IPCC AR6]`);
  console.log(`  TCR (Transient Response): ${params.transientClimateResponse.toFixed(2)}C [1.2-2.4, IPCC AR6]`);
  console.log(`  AMOC Collapse Threshold: ${params.amocCollapseThreshold.toFixed(2)}C [2.2-3.9, Westen 2024]`);
  console.log(`  Greenland Threshold: ${params.greenlandCollapseThreshold.toFixed(2)}C [0.8-3.2, Nature 2023]`);
  console.log(`  WAIS Threshold: ${params.waisCollapseThreshold.toFixed(2)}C [2.0-3.0, Nature Comms 2025]`);
  console.log(`  Amazon Deforestation: ${(params.amazonDiebackDeforestation * 100).toFixed(1)}% [20-25%, Frontiers 2025]`);
  console.log(`  Aid Effectiveness: ${params.aidEffectivenessMultiplier.toFixed(2)}x [0.8-1.2]`);
  console.log(`  Coral Reef Threshold: ${params.coralReefThreshold.toFixed(2)}C [1.0-1.5, IPCC AR6]`);
  console.log(`  Permafrost Carbon: ${params.permafrostCarbonPool.toFixed(0)} Gt C [1460-1600]`);
  console.log('==========================================================\n');
}
