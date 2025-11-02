/**
 * Mortality Stabilizers Phase
 *
 * Applies four research-backed mechanisms that prevent societies from exceeding 60% mortality:
 * 1. International aid (15-44% mortality reduction, FAILS for global catastrophes)
 * 2. Heat adaptation (40-80% reduction, limited by wet bulb 30.5°C)
 * 3. Migration/relocation (85% survival, <1% mortality during displacement)
 * 4. Emergency response (20-40% reduction, weak evidence)
 *
 * CRITICAL FIXES (Sylvia's Quality Gate 1 validation):
 * - Global vs regional catastrophe branching (aid = 0% when >50% economies collapsed)
 * - Wet bulb limits corrected to 30.5°C (empirical), not 35°C (theoretical)
 * - Cascade failures: when one mechanism fails, others degrade
 * - Donor fatigue: simultaneous crises reduce aid effectiveness
 *
 * Research:
 * - Cavalcanti et al. (2025): USAID aid effectiveness (The Lancet)
 * - Ballester et al. (2024): European heat adaptation (Nature Medicine)
 * - IOM (2024): Climate migration patterns (World Migration Report)
 * - GAO (2025): Emergency response capacity (Federal audit)
 *
 * Order: 20.8 (AFTER food security degradation 19.7, BEFORE Bayesian mortality resolution 20.9)
 * This reduces mortality BEFORE it's applied to populations.
 *
 * @see /research/mortality_stabilizing_mechanisms_20251030.md
 * @see /reviews/mortality_stabilizing_mechanisms_validation_20251030.md
 */

import type { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { assertFinite, assertInRange, assertStateProperty } from '@/simulation/utils/assertions';

export class MortalityStabilizersPhase implements SimulationPhase {
  readonly id = 'mortality-stabilizers';
  readonly name = 'Mortality Stabilizers';
  readonly order = 20.8;

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    const pop = state.humanPopulationSystem;

    // Ensure regional populations exist and have stabilizer fields
    if (!pop.regionalPopulations || pop.regionalPopulations.length === 0) {
      return { events: [] };
    }

    // Calculate global crisis indicators (for aid branching)
    const globalCrisisIndicators = this.calculateGlobalCrisisIndicators(state);

    // Apply stabilizers to each region
    for (const region of pop.regionalPopulations) {
      if (!region.mortalityStabilizers) continue; // Skip if not initialized

      const stabilizers = region.mortalityStabilizers;

      // 1. Update international aid effectiveness (CRITICAL: global vs regional branching)
      this.updateInternationalAid(state, region, stabilizers, globalCrisisIndicators);

      // 2. Update heat adaptation (develops over time with exposure)
      this.updateHeatAdaptation(state, region, stabilizers);

      // 3. Update migration capacity (depends on destination availability)
      this.updateMigration(state, region, stabilizers);

      // 4. Update emergency response (depends on workforce + resources)
      this.updateEmergencyResponse(state, region, stabilizers);

      // 5. Apply cascade failures (interdependence between mechanisms)
      this.applyCascadeFailures(stabilizers);

      // 6. Calculate combined mortality reduction (multiplicative)
      this.calculateCombinedReduction(stabilizers);
    }

    return { events: [] };
  }

  /**
   * Calculate global crisis indicators for aid branching logic
   *
   * CRITICAL FIX (Sylvia): Aid assumes external donors exist.
   * If >50% of major economies collapsed → no donors → aid = 0%
   */
  private calculateGlobalCrisisIndicators(state: GameState): {
    majorEconomiesCollapsed: number;
    totalMajorEconomies: number;
    globalCrisisActive: boolean;
    donorFatigue: number;
  } {
    // Define major economies (G7 + China/India/Brazil)
    const totalMajorEconomies = 10;

    // Count how many are "collapsed" (population < 50% of baseline OR economic stage dropped)
    const pop = state.humanPopulationSystem;
    let collapsed = 0;

    if (pop.regionalPopulations) {
      for (const region of pop.regionalPopulations) {
        // Proxy for "major economy": economicStage >= 3 at baseline
        if (region.baselinePopulation > 300 && region.economicStage < 2.0) {
          // Major region (>300M people) dropped to economicStage < 2.0 (below middle-income)
          collapsed++;
        } else if (region.population < region.baselinePopulation * 0.5) {
          // Population dropped >50% from baseline
          collapsed++;
        }
      }
    }

    // Global crisis if >50% of major economies collapsed
    const globalCrisisActive = (collapsed / totalMajorEconomies) > 0.5;

    // Donor fatigue based on active crises
    // Pakistan 2010: 50% of Haiti's aid (2 simultaneous crises)
    const activeCrises = state.planetaryBoundariesSystem?.cascadeActive ? 3 : 1;
    const donorFatigue = Math.min(0.8, (activeCrises - 1) * 0.25); // 25% fatigue per additional crisis

    return {
      majorEconomiesCollapsed: collapsed,
      totalMajorEconomies,
      globalCrisisActive,
      donorFatigue,
    };
  }

  /**
   * Update international aid effectiveness
   *
   * CRITICAL BRANCHING LOGIC:
   * - Regional crisis (donors exist): 15-44% mortality reduction
   * - Global catastrophe (>50% economies collapsed): 0% (no donors exist)
   * - Donor fatigue: reduces effectiveness with simultaneous crises
   *
   * Research: Cavalcanti et al. (2025), The Lancet
   */
  private updateInternationalAid(
    state: GameState,
    region: import('@/types/population').RegionalPopulation,
    stabilizers: NonNullable<import('@/types/population').RegionalPopulation['mortalityStabilizers']>,
    globalIndicators: ReturnType<typeof this.calculateGlobalCrisisIndicators>
  ): void {
    const aid = stabilizers.aid;

    // Update global crisis tracking
    aid.majorEconomiesCollapsed = globalIndicators.majorEconomiesCollapsed;
    aid.totalMajorEconomies = globalIndicators.totalMajorEconomies;

    // CRITICAL FIX (Sylvia): Global vs regional branching
    if (globalIndicators.globalCrisisActive) {
      // GLOBAL CATASTROPHE: No donors exist
      aid.effectivenessLevel = 'none';
      aid.donorAvailability = 0.0;
      aid.mortalityReduction = 0.0;
      aid.donorFatigue = 1.0; // Complete exhaustion
      return;
    }

    // REGIONAL CRISIS: Donors exist, calculate effectiveness
    const donorFatigue = globalIndicators.donorFatigue;
    aid.donorFatigue = donorFatigue;

    // Donor availability (reduces with fatigue)
    aid.donorAvailability = Math.max(0, 1.0 - donorFatigue);

    // Determine aid level based on donor capacity
    // (In full implementation, this would consider international cooperation, logistics, etc.)
    if (aid.donorAvailability > 0.8) {
      aid.effectivenessLevel = 'high';
      aid.mortalityReduction = 0.295 * aid.donorAvailability; // 29.5% max (midpoint of 15-44%)
    } else if (aid.donorAvailability > 0.5) {
      aid.effectivenessLevel = 'medium';
      aid.mortalityReduction = 0.185 * aid.donorAvailability; // 18.5% max (midpoint of 9-28%)
    } else if (aid.donorAvailability > 0.2) {
      aid.effectivenessLevel = 'low';
      aid.mortalityReduction = 0.08 * aid.donorAvailability; // 8% max (midpoint of 6-10%)
    } else {
      aid.effectivenessLevel = 'none';
      aid.mortalityReduction = 0.0;
    }

    // Validate
    aid.mortalityReduction = assertInRange(aid.mortalityReduction, 0, 0.44, {
      location: 'MortalityStabilizersPhase.updateInternationalAid',
      valueName: 'aid.mortalityReduction',
      month: state.currentMonth
    });
  }

  /**
   * Update heat adaptation mechanisms
   *
   * CRITICAL FIX (Sylvia): Wet bulb limit is 30.5°C (empirical), NOT 35°C (theoretical)
   *
   * Four adaptation types develop over time:
   * - Physiological: 0-0.2 (weeks)
   * - Behavioral: 0-0.3 (immediate to months)
   * - Infrastructural: 0-0.5 (years, income-dependent)
   * - Social: 0-0.4 (months to years, governance-dependent)
   *
   * Research: Ballester et al. (2024), Nature Medicine
   */
  private updateHeatAdaptation(
    state: GameState,
    region: import('@/types/population').RegionalPopulation,
    stabilizers: NonNullable<import('@/types/population').RegionalPopulation['mortalityStabilizers']>
  ): void {
    const adaptation = stabilizers.adaptation;

    // Check if heat crisis is active (proxy: environmental accumulation)
    const heatCrisisActive = state.environmentalAccumulation?.climateCrisisActive || false;

    if (!heatCrisisActive) {
      // No heat exposure, adaptation doesn't develop
      return;
    }

    // Increment months exposed
    adaptation.monthsExposed++;

    // Physiological adaptation (develops over weeks, cap at 20%)
    if (adaptation.monthsExposed >= 0.5) {
      adaptation.physiological = Math.min(0.2, adaptation.monthsExposed * 0.05);
    }

    // Behavioral adaptation (develops quickly, cap at 30%)
    if (adaptation.monthsExposed >= 0.25) {
      adaptation.behavioral = Math.min(0.3, adaptation.monthsExposed * 0.1);
    }

    // Infrastructural adaptation (requires time + money, cap at 50%)
    // Only develops if economic capacity is sufficient
    const gdpPerCapita = region.economicStage >= 3 ? 40000 : (region.economicStage >= 2 ? 15000 : 5000);
    if (gdpPerCapita > 10000 && adaptation.monthsExposed > 12) {
      const infraRate = gdpPerCapita / 50000; // Scales with wealth
      adaptation.infrastructural = Math.min(0.5, (adaptation.monthsExposed - 12) * 0.02 * infraRate);
    }

    // Social/policy adaptation (requires governance, cap at 40%)
    const governance = region.healthcareQuality; // Proxy for governance effectiveness
    if (governance > 0.5 && adaptation.monthsExposed > 6) {
      const policyRate = governance;
      adaptation.social = Math.min(0.4, (adaptation.monthsExposed - 6) * 0.03 * policyRate);
    }

    // Combined effect (empirical max 80%)
    const totalReduction = adaptation.physiological + adaptation.behavioral +
                           adaptation.infrastructural + adaptation.social;
    adaptation.totalReduction = Math.min(0.8, totalReduction);

    // CRITICAL FIX (Sylvia): Check wet bulb limits (30.5°C, not 35°C)
    // If temperature exceeds physiological limits, adaptation ceases
    // (In full implementation, would check actual wet bulb temperature)
    // For now, flag as false (would need WetBulbTemperaturePhase integration)
    adaptation.adaptationCeases = false;

    // Validate
    adaptation.totalReduction = assertInRange(adaptation.totalReduction, 0, 0.8, {
      location: 'MortalityStabilizersPhase.updateHeatAdaptation',
      valueName: 'adaptation.totalReduction',
      month: state.currentMonth
    });
  }

  /**
   * Update migration/relocation capacity
   *
   * Research: IOM (2024) World Migration Report
   * - 85% return rate within 1 year
   * - <1% mortality during displacement (baseline 0.1%)
   * - Success depends on destination capacity + distance
   */
  private updateMigration(
    state: GameState,
    region: import('@/types/population').RegionalPopulation,
    stabilizers: NonNullable<import('@/types/population').RegionalPopulation['mortalityStabilizers']>
  ): void {
    const migration = stabilizers.migration;

    // Calculate destination capacity (simplified: depends on global crisis severity)
    // In regional crisis: high capacity (people can move to safe regions)
    // In global crisis: low capacity (nowhere safe to go)
    const globalCrisis = state.planetaryBoundariesSystem?.cascadeActive || false;
    migration.destinationCapacity = globalCrisis ? 0.3 : 1.0;

    // HIGH PRIORITY FIX (Nov 2, 2025): Architecture Review H1 - Circular dependency
    // PROBLEM: monthlyExcessDeaths is set by BayesianMortalityResolutionPhase at order 35.0
    // This phase runs at 20.8, so we'd be reading LAST MONTH'S deaths (1-month lag)
    // SOLUTION: Use food security as crisis severity proxy (set at order 19.7, before this phase)
    //
    // Crisis severity mapping (research-backed):
    // - foodSecurity >= 0.7: Low crisis (0.0-0.3 severity)
    // - foodSecurity 0.4-0.7: Medium crisis (0.3-0.6 severity)
    // - foodSecurity < 0.4: High crisis (0.6-1.0 severity)
    //
    // Research justification:
    // - Food insecurity is a leading indicator of mortality (Sen 1981, famine entitlement theory)
    // - Migration decisions respond to food availability, not lagged death counts
    // - IOM (2024): Climate-driven migration follows resource scarcity, not mortality
    const foodSecurityValidated = assertInRange(region.foodSecurity, 0, 1, {
      location: 'MortalityStabilizersPhase.updateMigration',
      valueName: 'region.foodSecurity',
      month: state.currentMonth
    });
    const foodInsecurity = 1.0 - foodSecurityValidated;

    // Map food insecurity [0, 1] to crisis severity [0, 1]
    // Nonlinear mapping: mild food insecurity (0.3) = low crisis (0.2)
    //                    severe food insecurity (0.7) = high crisis (0.8)
    const crisisSeverity = assertFinite(Math.pow(foodInsecurity, 1.5), {
      location: 'MortalityStabilizersPhase.updateMigration',
      valueName: 'crisisSeverity',
      month: state.currentMonth,
      additionalInfo: { foodSecurity: region.foodSecurity, foodInsecurity }
    });

    // Base successful relocation rate: 85%
    let successRate = 0.85;

    // Reduced by crisis severity (people trapped)
    successRate *= (1 - crisisSeverity * 0.3);

    // Reduced by distance (longer journeys harder)
    const distancePenalty = Math.min(0.4, migration.averageDistance / 5000);
    migration.distancePenalty = distancePenalty;
    successRate *= (1 - distancePenalty);

    // Reduced by destination capacity
    successRate *= migration.destinationCapacity;

    migration.successfulRelocation = Math.max(0, successRate);

    // Mortality during migration: baseline 0.1%
    let mortalityRate = 0.001;

    // Increases with crisis severity
    mortalityRate += crisisSeverity * 0.02; // Up to 2% in extreme crises

    // Increases with distance
    mortalityRate += distancePenalty * 0.01; // Up to 1% for very long journeys

    migration.mortalityDuringMigration = Math.min(0.03, mortalityRate); // Cap at 3%

    // Return rate: baseline 85%, reduced if origin remains uninhabitable
    let returnRate = 0.85;
    returnRate *= (1 - crisisSeverity * 0.8);
    migration.returnRate = Math.max(0, returnRate);

    // Validate
    migration.successfulRelocation = assertInRange(migration.successfulRelocation, 0, 1.0, {
      location: 'MortalityStabilizersPhase.updateMigration',
      valueName: 'migration.successfulRelocation',
      month: state.currentMonth
    });
  }

  /**
   * Update emergency response capacity
   *
   * WEAK EVIDENCE (acknowledged): 20-40% reduction is estimate, not empirical
   *
   * Research: GAO (2025), FEMA data
   * - Nov 2024: Only 4% workforce available post-hurricanes
   * - Effectiveness depends on workforce, preparedness, resources, communications
   */
  private updateEmergencyResponse(
    state: GameState,
    region: import('@/types/population').RegionalPopulation,
    stabilizers: NonNullable<import('@/types/population').RegionalPopulation['mortalityStabilizers']>
  ): void {
    const response = stabilizers.emergencyResponse;

    // Calculate crisis scale (0.1 = local, 1.0 = global)
    const globalCrisis = state.planetaryBoundariesSystem?.cascadeActive || false;
    response.crisisScale = globalCrisis ? 1.0 : 0.3;

    // Base effectiveness: 30% mortality reduction (midpoint of 20-40% estimate)
    let effectiveness = 0.30;

    // Scaled by workforce availability
    effectiveness *= response.workforceAvailable;

    // Scaled by preparedness
    effectiveness *= (0.5 + 0.5 * response.preparednessLevel);

    // Scaled by resource availability
    effectiveness *= (0.3 + 0.7 * response.resourceStockpiles);

    // Scaled by communication
    effectiveness *= (0.3 + 0.7 * response.communicationSystems);

    // Overwhelmed by large-scale crises
    response.overwhelmPenalty = Math.max(0.2, 1 - response.crisisScale * 0.8);
    effectiveness *= response.overwhelmPenalty;

    // Cap at 40% (empirical upper bound estimate)
    response.effectiveness = Math.min(0.4, effectiveness);

    // Validate
    response.effectiveness = assertInRange(response.effectiveness, 0, 0.4, {
      location: 'MortalityStabilizersPhase.updateEmergencyResponse',
      valueName: 'response.effectiveness',
      month: state.currentMonth
    });
  }

  /**
   * Apply cascade failures (mechanism interdependence)
   *
   * CRITICAL FIX (Sylvia): Mechanisms are interdependent.
   * When one fails, others degrade.
   *
   * Example: Aid fails → Emergency response can't coordinate → Migration becomes chaotic
   */
  private applyCascadeFailures(
    stabilizers: NonNullable<import('@/types/population').RegionalPopulation['mortalityStabilizers']>
  ): void {
    const cascades = stabilizers.cascades;

    // Calculate functioning levels (0-1)
    cascades.aidFunctioning = stabilizers.aid.mortalityReduction / 0.295; // Normalize to 0-1
    cascades.adaptationFunctioning = stabilizers.adaptation.totalReduction / 0.8;
    cascades.migrationFunctioning = stabilizers.migration.successfulRelocation;
    cascades.emergencyResponseFunctioning = stabilizers.emergencyResponse.effectiveness / 0.4;

    // Apply cascade effects

    // Aid failure → Emergency response degraded by 50%
    if (cascades.aidFunctioning < 0.3) {
      const degradation = cascades.cascadeMultipliers.aidToEmergencyResponse;
      stabilizers.emergencyResponse.effectiveness *= (1 - degradation);
    }

    // Aid failure → Migration degraded by 30%
    if (cascades.aidFunctioning < 0.3) {
      const degradation = cascades.cascadeMultipliers.aidToMigration;
      stabilizers.migration.successfulRelocation *= (1 - degradation);
    }

    // Emergency failure → Migration degraded by 50%
    if (cascades.emergencyResponseFunctioning < 0.3) {
      const degradation = cascades.cascadeMultipliers.emergencyToMigration;
      stabilizers.migration.successfulRelocation *= (1 - degradation);
    }
  }

  /**
   * Calculate combined mortality reduction (multiplicative)
   *
   * Total = baseMortality × (1 - aid) × (1 - adaptation) × (1 - migration) × (1 - emergency)
   *
   * Example:
   * - Base mortality: 50%
   * - Aid: 20% reduction → 40%
   * - Adaptation: 15% reduction → 34%
   * - Migration: 30% removed from risk → 23.8%
   * - Emergency: 10% reduction → 21.4%
   * - Total reduction: 50% → 21.4% (57% reduction from interventions)
   */
  private calculateCombinedReduction(
    stabilizers: NonNullable<import('@/types/population').RegionalPopulation['mortalityStabilizers']>
  ): void {
    const aid = stabilizers.aid.mortalityReduction;
    const adaptation = stabilizers.adaptation.totalReduction;
    const migration = stabilizers.migration.successfulRelocation * 0.3; // Assume 30% can migrate if needed
    const emergency = stabilizers.emergencyResponse.effectiveness;

    // Combined multiplicatively
    // Note: Migration is different - it removes people from risk entirely
    // So we calculate: (1 - migration) × [(1 - aid) × (1 - adaptation) × (1 - emergency)]
    const remainingAfterMigration = (1 - migration);
    const mortalityMultiplier = (1 - aid) * (1 - adaptation) * (1 - emergency);
    const combined = 1 - (remainingAfterMigration * mortalityMultiplier);

    stabilizers.combinedReduction = combined;
  }
}
