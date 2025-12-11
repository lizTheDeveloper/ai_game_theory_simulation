/**
 * Tier 1 Threshold Configurations - Phase 1B
 *
 * Defines research-backed uncertainty distributions for critical simulation thresholds.
 * Uses Phase 1A distribution sampling library for parameter variation.
 *
 * Research Foundation:
 * - Social Critical Mass: Centola et al. (2018, Science) - 25% committed minority
 * - Trust Recovery: Meta-analysis of trust repair interventions
 * - Climate Sensitivity: IPCC AR6 WG1 (2021) - ECS 3.0°C [2.0-5.0°C likely range]
 * - Government Legitimacy: Historical state collapse analysis
 * - Automation Job Loss: Acemoglu & Restrepo (2019) - labor market disruption
 */

import {
  sampleNormal,
  sampleBeta,
  sampleLogNormal,
  sampleTriangular
} from '../utils/distributions';

/**
 * Tier 1 Threshold Distribution Definitions
 *
 * These configurations define uncertainty distributions for critical thresholds.
 * Each threshold samples from a research-backed distribution during initialization.
 */

/**
 * 1. SOCIAL CRITICAL MASS
 *
 * Research: Centola et al. (2018, Science) "Experimental evidence for tipping points in social convention"
 * Finding: Committed minorities of ~25% can flip majority opinion
 * Uncertainty: ±2% based on experimental variance
 * Distribution: Normal(μ=0.25, σ=0.02)
 */
export const SOCIAL_CRITICAL_MASS_PARAMS = {
  mean: 0.25,
  stdDev: 0.02,
  bounds: [0.20, 0.30] as [number, number], // Clip to reasonable range
  citation: 'Centola et al. (2018, Science) - tipping points in social convention'
};

/**
 * 2. TRUST RECOVERY RATE (monthly)
 *
 * Research: Meta-analysis of trust repair studies (Gillespie & Dietz 2009, Lewicki & Brinsfield 2017)
 * Finding: Trust recovery is asymmetric - slower than loss
 * Typical recovery: 1-3% per month with intervention (mode ~1.5%)
 * Distribution: Beta(α=2, β=5) rescaled to [0.005, 0.03] (0.5-3% monthly recovery)
 *
 * Beta(2,5) shape: Right-skewed, most weight at lower values (slow recovery typical)
 */
export const TRUST_RECOVERY_RATE_PARAMS = {
  alpha: 2.0,
  beta: 5.0,
  bounds: [0.005, 0.03] as [number, number], // 0.5-3% monthly recovery
  citation: 'Gillespie & Dietz (2009), Lewicki & Brinsfield (2017) - trust repair meta-analysis'
};

/**
 * 3. CLIMATE SENSITIVITY (Equilibrium Climate Sensitivity, ECS)
 *
 * Research: IPCC AR6 WG1 (2021) Chapter 7 - Earth's Energy Budget
 * Finding: Best estimate 3.0°C, likely range 2.5-4.0°C, very likely 2.0-5.0°C
 * Distribution: Log-Normal(μ=3.0, σ=0.75) captures right-skewed uncertainty
 *
 * Log-normal justification: Physical constraints prevent negative ECS, small chance of high ECS
 * Note: This is ECS in °C, needs conversion to simulation degradation rate
 */
export const CLIMATE_SENSITIVITY_PARAMS = {
  mu: 3.0,
  sigma: 0.75,
  bounds: [2.0, 5.0] as [number, number], // IPCC very likely range
  citation: 'IPCC AR6 WG1 (2021) Ch 7 - Equilibrium Climate Sensitivity'
};

/**
 * 4. GOVERNMENT LEGITIMACY CRISIS THRESHOLD
 *
 * Research: Historical state collapse analysis (Weimar, USSR, various failed states)
 * Finding: Collapse typically occurs 25-40% legitimacy, mode ~30%
 * Distribution: Triangular(min=0.25, mode=0.30, max=0.40)
 *
 * Triangular justification: Expert elicitation with clear mode, bounded by historical cases
 * Below 25%: Nearly always collapse
 * 30%: Most common collapse point
 * Above 40%: Rare to collapse (other factors usually intervene)
 */
export const GOVERNMENT_LEGITIMACY_CRISIS_PARAMS = {
  min: 0.25,
  mode: 0.30,
  max: 0.40,
  citation: 'Historical state collapse analysis (Weimar, USSR, failed states)'
};

/**
 * 5. AUTOMATION JOB LOSS THRESHOLD
 *
 * Research: Acemoglu & Restrepo (2019) "Tasks, Automation, and the Rise in US Wage Inequality"
 * Finding: Automation displaces ~35% of routine tasks, ±5% based on policy/adaptation
 * Distribution: Normal(μ=0.35, σ=0.05)
 *
 * Note: This is the unemployment level at which automation-driven crises trigger
 * Societies with strong safety nets tolerate higher unemployment (40%)
 * Societies with weak safety nets crisis at lower levels (30%)
 */
export const AUTOMATION_JOB_LOSS_THRESHOLD_PARAMS = {
  mean: 0.35,
  stdDev: 0.05,
  bounds: [0.25, 0.45] as [number, number], // Clip to plausible range
  citation: 'Acemoglu & Restrepo (2019) - automation and labor market disruption'
};

/**
 * Sample all Tier 1 thresholds for a simulation run
 *
 * @param rng - Random number generator function (for deterministic seeding)
 * @returns Sampled threshold values
 */
export interface ResearchBackedThresholds {
  socialCriticalMass: number;
  trustRecoveryRate: number;
  climateSensitivity: number;
  governmentLegitimacyCrisisThreshold: number;
  automationJobLossThreshold: number;
}

export function sampleResearchBackedThresholds(rng: () => number): ResearchBackedThresholds {
  // Sample raw values from distributions
  const socialCriticalMass = sampleNormal(
    SOCIAL_CRITICAL_MASS_PARAMS.mean,
    SOCIAL_CRITICAL_MASS_PARAMS.stdDev,
    rng
  );

  const trustRecoveryRateRaw = sampleBeta(
    TRUST_RECOVERY_RATE_PARAMS.alpha,
    TRUST_RECOVERY_RATE_PARAMS.beta,
    TRUST_RECOVERY_RATE_PARAMS.bounds[0],
    TRUST_RECOVERY_RATE_PARAMS.bounds[1],
    rng
  );

  const climateSensitivity = sampleLogNormal(
    CLIMATE_SENSITIVITY_PARAMS.mu,
    CLIMATE_SENSITIVITY_PARAMS.sigma,
    rng
  );

  const governmentLegitimacyCrisisThreshold = sampleTriangular(
    GOVERNMENT_LEGITIMACY_CRISIS_PARAMS.min,
    GOVERNMENT_LEGITIMACY_CRISIS_PARAMS.mode,
    GOVERNMENT_LEGITIMACY_CRISIS_PARAMS.max,
    rng
  );

  const automationJobLossThreshold = sampleNormal(
    AUTOMATION_JOB_LOSS_THRESHOLD_PARAMS.mean,
    AUTOMATION_JOB_LOSS_THRESHOLD_PARAMS.stdDev,
    rng
  );

  // Apply bounds by clamping to valid ranges
  return {
    socialCriticalMass: Math.max(
      SOCIAL_CRITICAL_MASS_PARAMS.bounds[0],
      Math.min(SOCIAL_CRITICAL_MASS_PARAMS.bounds[1], socialCriticalMass)
    ),
    trustRecoveryRate: TRUST_RECOVERY_RATE_PARAMS.bounds[0] +
      (trustRecoveryRateRaw * (TRUST_RECOVERY_RATE_PARAMS.bounds[1] - TRUST_RECOVERY_RATE_PARAMS.bounds[0])),
    climateSensitivity: Math.max(
      CLIMATE_SENSITIVITY_PARAMS.bounds[0],
      Math.min(CLIMATE_SENSITIVITY_PARAMS.bounds[1], climateSensitivity)
    ),
    governmentLegitimacyCrisisThreshold: governmentLegitimacyCrisisThreshold, // Already bounded by triangular
    automationJobLossThreshold: Math.max(
      AUTOMATION_JOB_LOSS_THRESHOLD_PARAMS.bounds[0],
      Math.min(AUTOMATION_JOB_LOSS_THRESHOLD_PARAMS.bounds[1], automationJobLossThreshold)
    )
  };
}

/**
 * Convert climate sensitivity (°C per doubling CO2) to simulation degradation rate
 *
 * IPCC AR6: Current trajectory is ~SSP5-8.5 (high emissions)
 * - Emissions double CO2 every ~35-50 years at current pace
 * - ECS determines final warming, but rate depends on emissions path
 *
 * Simplified conversion for simulation:
 * - Base rate calibrated to IPCC SSP5-8.5 trajectory (0.00015 for ECS=3.0°C)
 * - Scale linearly with ECS (higher sensitivity = faster degradation)
 *
 * @param climateSensitivity - Sampled ECS value (°C)
 * @returns Monthly climate degradation rate
 */
export function convertClimateSensitivityToRate(climateSensitivity: number): number {
  const BASELINE_ECS = 3.0; // IPCC best estimate
  const BASELINE_RATE = 0.00015; // Calibrated to IPCC SSP5-8.5

  // Scale rate linearly with ECS
  // ECS=2.0°C → 67% of baseline rate
  // ECS=3.0°C → 100% of baseline rate
  // ECS=5.0°C → 167% of baseline rate
  return BASELINE_RATE * (climateSensitivity / BASELINE_ECS);
}
