/**
 * State Capacity Modeling
 *
 * Based on Worldwide Governance Indicators (WGI) 2024
 * Research: Hanson & Sigman (2021), Thomann et al. (2023)
 *
 * @module core/StateCapacity
 */

/**
 * State capacity metrics from WGI
 * All values on -2.5 to +2.5 scale (WGI standard)
 */
export interface StateCapacityMetrics {
  /**
   * Government Effectiveness (WGI)
   * Quality of public services, civil service, policy formulation
   *
   * Examples:
   * - Singapore: +2.36 (highest)
   * - Switzerland: +2.0
   * - USA: +1.5
   * - China: +0.3
   * - Venezuela: -1.68 (lowest in dataset)
   */
  governmentEffectiveness: number;

  /**
   * Control of Corruption (WGI)
   * Extent to which public power is exercised for private gain
   *
   * Examples:
   * - Denmark: +2.2 (highest)
   * - Singapore: +2.2
   * - USA: +1.3
   * - Russia: -0.9
   * - Venezuela: -1.6 (highest corruption)
   */
  controlOfCorruption: number;

  /**
   * Regulatory Quality (WGI)
   * Ability to formulate and implement sound policies
   *
   * Examples:
   * - Singapore: +2.1
   * - New Zealand: +1.9
   * - USA: +1.6
   * - Brazil: -0.1
   * - Venezuela: -2.2
   */
  regulatoryQuality: number;
}

/**
 * Derived capacity metrics for simulation
 */
export interface DerivedCapacity {
  /**
   * Policy success rate multiplier
   * Formula: 1.0 + (0.3 × governmentEffectiveness)
   *
   * Research: Thomann et al. (2023) - bureaucratic performance
   *
   * Examples:
   * - Singapore (GE=2.36): 1.71 (71% boost)
   * - USA (GE=1.5): 1.45 (45% boost)
   * - Venezuela (GE=-1.68): 0.50 (50% penalty)
   */
  policySuccessMultiplier: number;

  /**
   * Implementation noise (0.0 to 0.5 scale)
   * Formula: (2.5 - controlOfCorruption) / 10
   *
   * Represents gap between policy intent and actual outcome
   *
   * Examples:
   * - Singapore (CoC=2.2): 0.03 (3% noise)
   * - USA (CoC=1.3): 0.12 (12% noise)
   * - Russia (CoC=-0.9): 0.34 (34% noise)
   * - Venezuela (CoC=-1.6): 0.41 (41% noise)
   */
  implementationNoise: number;

  /**
   * AI comprehension lag (months)
   * How long to understand new AI capabilities
   *
   * Formula based on government effectiveness:
   * - High capacity (GE > 1.5): 12-30 months
   * - Medium capacity (GE 0-1.5): 36-60 months
   * - Low capacity (GE < 0): 60-96 months
   */
  aiComprehensionLagMonths: number;

  /**
   * Overall capacity score (0-1 scale)
   * Simple average of normalized WGI metrics
   */
  overallCapacity: number;
}

/**
 * Complete state capacity assessment
 */
export interface StateCapacity {
  /** Raw WGI metrics */
  metrics: StateCapacityMetrics;

  /** Derived simulation metrics */
  derived: DerivedCapacity;

  /** Data confidence (0-1, based on WGI confidence intervals) */
  dataConfidence: number;

  /** Year of data */
  dataYear: number;
}

/**
 * Calculate derived capacity metrics from WGI data
 */
export function calculateDerivedCapacity(metrics: StateCapacityMetrics): DerivedCapacity {
  const { governmentEffectiveness, controlOfCorruption, regulatoryQuality } = metrics;

  // Policy success multiplier (Thomann et al. 2023)
  const policySuccessMultiplier = Math.max(0.2, 1.0 + (0.3 * governmentEffectiveness));

  // Implementation noise (corruption effect)
  const implementationNoise = Math.max(0, Math.min(0.5, (2.5 - controlOfCorruption) / 10));

  // AI comprehension lag (months)
  let aiComprehensionLagMonths: number;
  if (governmentEffectiveness > 1.5) {
    aiComprehensionLagMonths = 12 + (Math.random() * 18); // 12-30 months
  } else if (governmentEffectiveness > 0) {
    aiComprehensionLagMonths = 36 + (Math.random() * 24); // 36-60 months
  } else {
    aiComprehensionLagMonths = 60 + (Math.random() * 36); // 60-96 months
  }

  // Overall capacity (normalized to 0-1)
  const overallCapacity = (
    (governmentEffectiveness + 2.5) / 5.0 * 0.4 +
    (controlOfCorruption + 2.5) / 5.0 * 0.3 +
    (regulatoryQuality + 2.5) / 5.0 * 0.3
  );

  return {
    policySuccessMultiplier,
    implementationNoise,
    aiComprehensionLagMonths,
    overallCapacity: Math.max(0, Math.min(1, overallCapacity)),
  };
}

/**
 * Create state capacity from WGI metrics
 */
export function createStateCapacity(
  metrics: StateCapacityMetrics,
  dataYear: number = 2024,
  dataConfidence: number = 0.9
): StateCapacity {
  return {
    metrics,
    derived: calculateDerivedCapacity(metrics),
    dataConfidence,
    dataYear,
  };
}

/**
 * WGI data confidence by country type
 *
 * Research: V-Dem confidence intervals analysis
 * - Democracies: ±0.05-0.10 (high confidence)
 * - Hybrid regimes: ±0.10-0.15 (medium confidence)
 * - Autocracies: ±0.15-0.25 (low confidence, data opacity)
 */
export function estimateDataConfidence(
  governmentType: string,
  controlOfCorruption: number
): number {
  // Authoritarian regimes have lower data confidence
  if (governmentType.includes('authoritarian') || governmentType.includes('monarchy')) {
    return 0.7;
  }

  // Hybrid regimes moderate confidence
  if (governmentType.includes('hybrid')) {
    return 0.8;
  }

  // High corruption = lower data reliability
  if (controlOfCorruption < -1.0) {
    return 0.75;
  }

  // Democracies with low corruption: highest confidence
  return 0.9;
}
