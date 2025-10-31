/**
 * Mortality Stabilizing Mechanisms Types
 *
 * Research-backed mechanisms that prevent societies from exceeding 60% mortality during crises.
 * Based on:
 * - Cavalcanti et al. (2025): USAID aid effectiveness (15-44% mortality reduction)
 * - Ballester et al. (2024): European heat adaptation (40-80% mortality reduction)
 * - IOM (2024): Climate migration (85% return rate, <1% mortality)
 * - GAO (2025): Emergency response (20-40% reduction, weak evidence)
 *
 * CRITICAL: These mechanisms work for REGIONAL crises but FAIL for GLOBAL catastrophes.
 * See: /research/mortality_stabilizing_mechanisms_20251030.md
 *      /reviews/mortality_stabilizing_mechanisms_validation_20251030.md (Sylvia's critical fixes)
 *
 * @see /research/mortality_stabilizing_mechanisms_20251030.md
 * @see /reviews/mortality_stabilizing_mechanisms_validation_20251030.md
 */

/**
 * International Aid Effectiveness
 *
 * CRITICAL FIX (Sylvia): Aid assumes external donors exist.
 * Works for regional crises (Haiti, Pakistan), FAILS for global catastrophes.
 *
 * Research: Cavalcanti et al. (2025), The Lancet
 * - 91.8M deaths prevented (2001-2021)
 * - 15-44% mortality reduction depending on funding level
 * - Effectiveness drops with donor fatigue (Pakistan 2010: 50% of Haiti's aid)
 */
export interface InternationalAidSystem {
  // Aid effectiveness level (determined by global crisis state)
  effectivenessLevel: 'none' | 'low' | 'medium' | 'high';

  // Mortality reduction multiplier (0-0.295 range, midpoint of 15-44%)
  mortalityReduction: number;

  // Donor availability (0 = no donors exist, 1 = full donor capacity)
  donorAvailability: number;

  // Donor fatigue (reduces effectiveness with simultaneous crises)
  // Pakistan 2010: 50% aid of Haiti earthquake 7 months earlier
  donorFatigue: number; // 0-1 (0 = fresh, 1 = exhausted)

  // Major economies collapsed (>50% → no donors)
  majorEconomiesCollapsed: number;
  totalMajorEconomies: number;
}

/**
 * Adaptation Mechanisms
 *
 * CRITICAL FIX (Sylvia): Wet bulb limits are 30.5°C (empirical), NOT 35°C (theoretical)
 *
 * Research: Ballester et al. (2024), Nature Medicine
 * - European heat 2023: 47,690 deaths, would be 80% higher without adaptation
 * - 40-80% mortality reduction (empirical upper bound)
 * - Four adaptation types: physiological, behavioral, infrastructural, social
 */
export interface AdaptationMechanisms {
  // Four adaptation types (0-1 range, develop over time)
  physiological: number;    // 0-0.2 (develops over weeks)
  behavioral: number;        // 0-0.3 (immediate to months)
  infrastructural: number;   // 0-0.5 (years to decades, income-dependent)
  social: number;            // 0-0.4 (months to years, governance-dependent)

  // Total combined effectiveness (empirical max 0.8 = 80% reduction)
  totalReduction: number;

  // Exposure tracking
  monthsExposed: number;     // Time exposed to crisis (for adaptation development)

  // Wet bulb temperature thresholds (CORRECTED per Sylvia)
  wetBulbLimit: number;      // 30.5°C for young adults (NOT 35°C)
  adaptationCeases: boolean; // True if above physiological limits
}

/**
 * Migration and Relocation
 *
 * Research: IOM (2024) World Migration Report
 * - 26.4M climate displacements (2023)
 * - 85% return rate within 1 year (U.S. 2022-23 data)
 * - <1% mortality during displacement (Cyclone Freddy: 0.1%)
 */
export interface MigrationSystem {
  // Migration outcomes
  successfulRelocation: number;  // 0-1 (% who successfully move)
  mortalityDuringMigration: number; // 0-0.02 (baseline 0.001, up to 2% in extreme crises)
  returnRate: number;               // 0-1 (85% baseline)

  // Destination capacity
  destinationCapacity: number;      // 0-1 (space available in safe regions)

  // Distance penalty
  averageDistance: number;          // km to safe zone
  distancePenalty: number;          // 0-0.4 (max 40% penalty at 2000km+)
}

/**
 * Emergency Response Capacity
 *
 * WEAK EVIDENCE (acknowledged by Cynthia, flagged by Sylvia)
 * - 20-40% mortality reduction is ESTIMATE from case studies, not large-scale quantitative data
 * - Use conservative parameters
 *
 * Research: GAO (2025), FEMA data
 * - Nov 2024: Only 4% FEMA workforce available post-hurricanes
 * - Disasters "becoming costlier and deadlier"
 */
export interface EmergencyResponseCapacity {
  // Four capacity factors (0-1 range)
  workforceAvailable: number;     // % of required responders available
  preparednessLevel: number;       // Pre-disaster planning quality
  resourceStockpiles: number;      // Medical supplies, food, shelter
  communicationSystems: number;    // Warning/coordination functional

  // Effectiveness (0-0.4 max, conservative estimate)
  effectiveness: number;

  // Overwhelm penalty (large-scale crises reduce effectiveness)
  crisisScale: number;             // 0-1 (0.1 = local, 1.0 = global)
  overwhelmPenalty: number;        // Multiplier based on scale
}

/**
 * Mechanism Cascade Failures
 *
 * CRITICAL FIX (Sylvia): Mechanisms are interdependent.
 * When one fails, others degrade.
 *
 * Example: Aid fails → Emergency response can't coordinate → Migration becomes chaotic
 */
export interface MechanismCascadeState {
  // Which mechanisms are functioning (0-1 range)
  aidFunctioning: number;
  adaptationFunctioning: number;
  migrationFunctioning: number;
  emergencyResponseFunctioning: number;

  // Cascade multipliers (how failure of one affects others)
  cascadeMultipliers: {
    aidToEmergencyResponse: number;  // Aid failure → emergency response degraded by 50%
    aidToMigration: number;           // Aid failure → migration degraded by 30%
    emergencyToMigration: number;     // Emergency failure → migration degraded by 50%
  };
}

/**
 * Regional Mortality Stabilizers
 *
 * Combined state for all four mechanisms plus cascade tracking.
 * Added to RegionalPopulation interface.
 */
export interface RegionalMortalityStabilizers {
  // Four mechanisms
  aid: InternationalAidSystem;
  adaptation: AdaptationMechanisms;
  migration: MigrationSystem;
  emergencyResponse: EmergencyResponseCapacity;

  // Cascade state
  cascades: MechanismCascadeState;

  // Combined mortality reduction (multiplicative)
  // Total = baseMortality × (1 - aid) × (1 - adaptation) × (1 - migration) × (1 - emergency)
  combinedReduction: number;
}
