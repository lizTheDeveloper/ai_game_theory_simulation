/**
 * Climate Priority Configuration
 *
 * Research-validated government climate priority scenarios.
 * Based on multi-agent research (super-alignment-researcher + research-skeptic).
 *
 * Sources:
 * - Optimistic: Stechemesser et al. (2024), Hagedorn et al. (2024), IEA WEO 2023
 * - Pessimistic: Hickel & Vogel (2023), Böhringer et al. (2022), Nature Comm (2024)
 *
 * See: /devlogs/climate_priority_research_uncertainty_20251024.md
 */

export type ClimatePriorityPreset =
  | 'baseline'
  | 'opt-moderate'
  | 'opt-ambitious'
  | 'opt-crisis'
  | 'pes-moderate'
  | 'pes-ambitious'
  | 'pes-maximum';

export interface ClimatePriorityConfig {
  /**
   * Preset identifier
   */
  preset: ClimatePriorityPreset;

  /**
   * Research frame: optimistic (green growth) or pessimistic (structural barriers)
   */
  researchFrame: 'optimistic' | 'pessimistic' | 'baseline';

  /**
   * Government priority allocation weights (must sum to ~1.0)
   */
  weights: {
    climate: number;       // Climate & environment
    economic: number;      // Economic growth & jobs
    geopolitical: number;  // Security & international relations
    social: number;        // Welfare, education, healthcare
    technological: number; // R&D & innovation
  };

  /**
   * Annual emission reduction rate (fraction)
   * Example: 0.02 = -2%/year
   */
  policyEffectiveness: number;

  /**
   * GDP growth multiplier
   * Example: 1.025 = +2.5%/year growth
   */
  economicImpact: number;

  /**
   * Policy interaction synergy/interference multiplier
   * - Optimistic: 1.3-2.0 (policies synergize)
   * - Pessimistic: 0.85-0.95 (policies interfere)
   */
  synergyMultiplier: number;

  /**
   * Implementation lag (months from decision to measurable impact)
   * - Optimistic: 18-30 months
   * - Pessimistic: 96-144 months (8-12 years)
   */
  implementationLag: number;

  /**
   * Political reversal risk per election cycle (fraction)
   * Example: 0.35 = 35% chance of policy reversal
   */
  reversalRisk: number;

  /**
   * Vested interest lobbying penalty (fraction reduction in effectiveness)
   * Pessimistic only. Example: 0.3 = -30% effectiveness
   */
  vestedInterestPenalty?: number;

  /**
   * Carbon leakage without global coordination (fraction)
   * Pessimistic only. Example: 0.4 = -40% effectiveness from capital flight
   */
  carbonLeakage?: number;
}

/**
 * Default climate priority configurations
 */
export const DEFAULT_CLIMATE_PRIORITY_CONFIGS: Record<ClimatePriorityPreset, ClimatePriorityConfig> = {
  'baseline': {
    preset: 'baseline',
    researchFrame: 'baseline',
    weights: { climate: 0.10, economic: 0.30, geopolitical: 0.20, social: 0.35, technological: 0.05 },
    policyEffectiveness: 0.005,
    economicImpact: 1.025,
    synergyMultiplier: 1.0,
    implementationLag: 36,
    reversalRisk: 0.2,
  },
  'opt-moderate': {
    preset: 'opt-moderate',
    researchFrame: 'optimistic',
    weights: { climate: 0.20, economic: 0.25, geopolitical: 0.18, social: 0.30, technological: 0.07 },
    policyEffectiveness: 0.02,
    economicImpact: 1.027,
    synergyMultiplier: 1.3,
    implementationLag: 30,
    reversalRisk: 0.35,
  },
  'opt-ambitious': {
    preset: 'opt-ambitious',
    researchFrame: 'optimistic',
    weights: { climate: 0.35, economic: 0.22, geopolitical: 0.13, social: 0.20, technological: 0.10 },
    policyEffectiveness: 0.05,
    economicImpact: 1.020,
    synergyMultiplier: 1.7,
    implementationLag: 24,
    reversalRisk: 0.55,
  },
  'opt-crisis': {
    preset: 'opt-crisis',
    researchFrame: 'optimistic',
    weights: { climate: 0.45, economic: 0.20, geopolitical: 0.12, social: 0.15, technological: 0.08 },
    policyEffectiveness: 0.085,
    economicImpact: 1.012,
    synergyMultiplier: 2.0,
    implementationLag: 18,
    reversalRisk: 0.70,
  },
  'pes-moderate': {
    preset: 'pes-moderate',
    researchFrame: 'pessimistic',
    weights: { climate: 0.20, economic: 0.25, geopolitical: 0.18, social: 0.30, technological: 0.07 },
    policyEffectiveness: 0.012,
    economicImpact: 1.020,
    synergyMultiplier: 0.95,
    implementationLag: 96,
    reversalRisk: 0.45,
    vestedInterestPenalty: 0.15,
    carbonLeakage: 0.30,
  },
  'pes-ambitious': {
    preset: 'pes-ambitious',
    researchFrame: 'pessimistic',
    weights: { climate: 0.30, economic: 0.23, geopolitical: 0.15, social: 0.22, technological: 0.10 },
    policyEffectiveness: 0.03,
    economicImpact: 1.012,
    synergyMultiplier: 0.90,
    implementationLag: 120,
    reversalRisk: 0.55,
    vestedInterestPenalty: 0.30,
    carbonLeakage: 0.40,
  },
  'pes-maximum': {
    preset: 'pes-maximum',
    researchFrame: 'pessimistic',
    weights: { climate: 0.35, economic: 0.20, geopolitical: 0.13, social: 0.20, technological: 0.12 },
    policyEffectiveness: 0.035,
    economicImpact: 1.008,
    synergyMultiplier: 0.85,
    implementationLag: 144,
    reversalRisk: 0.65,
    vestedInterestPenalty: 0.40,
    carbonLeakage: 0.50,
  },
};

/**
 * Get climate priority config by preset name
 */
export function getClimatePriorityConfig(preset: ClimatePriorityPreset): ClimatePriorityConfig {
  return DEFAULT_CLIMATE_PRIORITY_CONFIGS[preset];
}
