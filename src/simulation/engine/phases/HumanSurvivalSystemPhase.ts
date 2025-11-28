/**
 * Human Survival System Phase (CONSOLIDATED)
 *
 * Consolidates three tightly-coupled survival subsystems:
 * 1. Food Security Degradation (19.7) - Crisis-driven food decline
 * 2. Mortality Stabilizers (20.8) - Aid, adaptation, migration, emergency response
 * 3. Famine System (21.5) - Famine progression and mortality
 *
 * RATIONALE FOR CONSOLIDATION:
 * - These systems form a causal chain: food crises → mortality risk → stabilizing interventions → actual deaths
 * - Running separately created temporal dependencies and RNG consumption complexity
 * - Consolidation preserves execution order while reducing phase overhead
 *
 * CRITICAL: DO NOT modify BayesianMortalityResolutionPhase (order 20.9)
 * This phase ADDS mortality risks; BayesianMortalityResolution RESOLVES them into population changes.
 *
 * Research:
 * - Food security: Historical food crises (Irish Famine, Holodomor, Gaza/Yemen/Sudan 2024-25)
 * - Mortality stabilizers: Cavalcanti et al. (2025), Ballester et al. (2024), IOM (2024), GAO (2025)
 * - Famine systems: IPBES (2019), FAO (2024)
 *
 * Order: 21.5 (AFTER planetary boundaries 21.0, BEFORE Bayesian mortality resolution 35.0)
 *
 * Batch 4 Consolidation (Nov 9, 2025)
 */

import type { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import type { RegionalPopulation } from '@/types/population';
import { addMortalityRisk } from '@/simulation/bayesianMortality';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import {
  assertFinite,
  assertProbability,
  assertMortalityRate,
  assertNonEmpty,
  assertInRange,
  assertStateProperty,
  assertDefined,
} from '@/simulation/utils/assertions';
import { isHistoricalModeActive } from '@/simulation/utils/historicalMode';
import { THRESHOLDS, RATES, MULTIPLIERS, BASELINES } from '@/simulation/config/centralConfig';
import { checkRegionalFamineRisk } from '../../qualityOfLife';
import { updateFamineSystem } from '../../../types/famine';

export class HumanSurvivalSystemPhase implements SimulationPhase {
  readonly id = 'human-survival-system';
  readonly name = 'Human Survival System';
  readonly order = 21.51;

  readonly dependencies = [
    'quality-of-life',          // Order 19.5: Food baseline calculated
    'extreme-weather-events',   // Order 15.2: Weather disrupts food production
    'wet_bulb_temperature',     // Order 20.45: Heat mortality risk
    'planetary_boundaries',     // Order 21.0: Ecosystem health assessment
  ];

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    setDeterministicRng(rng);

    // Execute subsystems in causal order
    this.executeFoodSecurityDegradation(state, rng);
    this.executeMortalityStabilizers(state, rng);
    this.executeFamineSystem(state, rng);

    return { events: [] };
  }

  // ============================================================================
  // SUBSYSTEM 1: FOOD SECURITY DEGRADATION (Order 19.7)
  // ============================================================================

  private executeFoodSecurityDegradation(state: GameState, rng: RNGFunction): void {
    const pop = state.humanPopulationSystem;
    if (!pop.regionalPopulations || pop.regionalPopulations.length === 0) {
      return;
    }

    // ============================================================================
    // HINDCAST MODE GUARD (Nov 24, 2025)
    // ============================================================================
    // In historical mode (1990-2024), food security was STABLE or IMPROVING.
    // This degradation models future AI-era stress that didn't exist then.
    // Skip to allow hindcast validation against actual history.
    // Source: FAO State of Food Insecurity reports (1999-2015)
    // HIGH-7 FIX (Nov 27, 2025): Use historicalMode flag for hindcast calibration
    // HIGH-3 FIX (Nov 28, 2025): Use isHistoricalModeActive() + correct year (2024 not 2020)
    // ============================================================================
    if (isHistoricalModeActive(state)) {
      return;
    }

    // Validate required systems
    const phosphorusReserves = assertStateProperty(state.phosphorusSystem, 'reserves', {
      location: 'HumanSurvivalSystemPhase.executeFoodSecurityDegradation',
      month: state.currentMonth,
      expectedSource: 'initialization.ts - phosphorusSystem.reserves'
    });

    const groundwaterLevel = assertStateProperty(state.freshwaterSystem, 'blueWater.groundwater', {
      location: 'HumanSurvivalSystemPhase.executeFoodSecurityDegradation',
      month: state.currentMonth,
      expectedSource: 'initialization.ts - freshwaterSystem.blueWater.groundwater'
    });

    const biodiversityIndex = assertStateProperty(state.biodiversitySystem, 'globalBiodiversityIndex', {
      location: 'HumanSurvivalSystemPhase.executeFoodSecurityDegradation',
      month: state.currentMonth,
      expectedSource: 'initialization.ts - biodiversitySystem.globalBiodiversityIndex'
    });

    // Apply degradation to each region
    for (const region of pop.regionalPopulations) {
      const climateWeight = assertProbability(region.climateVulnerability, {
        location: 'HumanSurvivalSystemPhase.executeFoodSecurityDegradation',
        valueName: `${region.name}.climateVulnerability`,
        month: state.currentMonth
      });

      const resourceWeight = assertProbability(region.resourceVulnerability, {
        location: 'HumanSurvivalSystemPhase.executeFoodSecurityDegradation',
        valueName: `${region.name}.resourceVulnerability`,
        month: state.currentMonth
      });

      const activeCrises = assertFinite([
        phosphorusReserves < 0.3 ? resourceWeight : 0,
        groundwaterLevel < 0.3 ? climateWeight : 0,
        biodiversityIndex < 0.3 ? climateWeight : 0,
        (state.environmentalAccumulation?.climateCrisisActive || state.environmentalAccumulation?.ecosystemCrisisActive) ? climateWeight : 0,
        state.planetaryBoundariesSystem?.cascadeActive ? 1.0 : 0,
      ].reduce((sum, c) => sum + c, 0), {
        location: 'HumanSurvivalSystemPhase.executeFoodSecurityDegradation',
        valueName: `${region.name}.activeCrises`,
        month: state.currentMonth
      });

      // Degradation rate: 0.5% baseline, 1.3^n scaling, 5% cap
      let degradationRate = 0.005;
      if (activeCrises > 0) {
        degradationRate *= Math.pow(1.3, activeCrises);
      }

      // Nuclear winter crop yield effects
      if (state.nuclearWinterState?.active) {
        const cropYield = assertProbability(state.nuclearWinterState.cropYieldMultiplier, {
          location: 'HumanSurvivalSystemPhase.executeFoodSecurityDegradation',
          valueName: 'nuclearWinterState.cropYieldMultiplier',
          month: state.currentMonth
        });

        const monthsSinceWar = assertFinite(state.nuclearWinterState.monthsSinceWar, {
          location: 'HumanSurvivalSystemPhase.executeFoodSecurityDegradation',
          valueName: 'nuclearWinterState.monthsSinceWar',
          month: state.currentMonth
        });

        if (monthsSinceWar <= 24) {
          // Active nuclear winter: severe degradation
          const nuclearWinterDegradation = (1 - cropYield) * 0.05;
          degradationRate += nuclearWinterDegradation;
        } else {
          // Recovery phase: enable gradual food security recovery
          const recoveryPotential = Math.max(0, cropYield - 0.5);
          if (recoveryPotential > 0 && region.foodSecurity < 0.8) {
            const recoveryRate = recoveryPotential * 0.04;
            region.foodSecurity = Math.min(0.8, region.foodSecurity * (1 + recoveryRate));

            if (state.currentMonth % 12 === 0) {
              console.log(`  [${region.name}] Nuclear winter recovery: Food ${(region.foodSecurity * 100).toFixed(1)}% (+${(recoveryRate * 100).toFixed(1)}%/mo), Crop yield: ${(cropYield * 100).toFixed(0)}%`);
            }
          }
        }
      }

      // Cap at 5% per month
      const degradationRateCapped = assertInRange(Math.min(0.05, degradationRate), 0, 0.05, {
        location: 'HumanSurvivalSystemPhase.executeFoodSecurityDegradation',
        valueName: `${region.name}.degradationRate`,
        month: state.currentMonth
      });

      // Apply degradation
      const currentFood = assertProbability(region.foodSecurity, {
        location: 'HumanSurvivalSystemPhase.executeFoodSecurityDegradation',
        valueName: `${region.name}.foodSecurity (before)`,
        month: state.currentMonth
      });

      const newFood = assertProbability(Math.max(0, currentFood * (1 - degradationRateCapped)), {
        location: 'HumanSurvivalSystemPhase.executeFoodSecurityDegradation',
        valueName: `${region.name}.foodSecurity (after)`,
        month: state.currentMonth
      });

      region.foodSecurity = newFood;

      if (state.currentMonth % 12 === 0 && activeCrises > 0.5) {
        console.log(`  [${region.name}] Food: ${(currentFood * 100).toFixed(1)}% → ${(newFood * 100).toFixed(1)}% | Crises: ${activeCrises.toFixed(2)}, Rate: ${(degradationRate * 100).toFixed(2)}%/mo`);
      }
    }

    // Recalculate global food security (population-weighted)
    const totalPop = assertFinite(
      pop.regionalPopulations.reduce((sum, r) => sum + r.population, 0),
      {
        location: 'HumanSurvivalSystemPhase.executeFoodSecurityDegradation',
        valueName: 'totalPop',
        month: state.currentMonth
      }
    );

    if (totalPop > 0 && state.qualityOfLifeSystems?.survivalFundamentals) {
      const globalFoodSec = assertProbability(
        pop.regionalPopulations.reduce((sum, r) => sum + (r.foodSecurity * r.population), 0) / totalPop,
        {
          location: 'HumanSurvivalSystemPhase.executeFoodSecurityDegradation',
          valueName: 'globalFoodSec',
          month: state.currentMonth
        }
      );

      state.qualityOfLifeSystems.survivalFundamentals.foodSecurity = globalFoodSec;

      if (state.currentMonth % 12 === 0) {
        console.log(`[Phase ${this.order}] ${this.name}: Global food security = ${(globalFoodSec * 100).toFixed(1)}%`);
      }
    }
  }

  // ============================================================================
  // SUBSYSTEM 2: MORTALITY STABILIZERS (Order 20.8)
  // ============================================================================

  private executeMortalityStabilizers(state: GameState, rng: RNGFunction): void {
    const pop = state.humanPopulationSystem;
    if (!pop.regionalPopulations || pop.regionalPopulations.length === 0) {
      return;
    }

    const globalCrisisIndicators = this.calculateGlobalCrisisIndicators(state);

    console.log(`\n=== Mortality Stabilizers (Month ${state.currentMonth}) ===`);
    console.log(`  🌍 Major economies collapsed: ${globalCrisisIndicators.majorEconomiesCollapsed}/${globalCrisisIndicators.totalMajorEconomies}`);
    console.log(`  🌍 Global crisis: ${globalCrisisIndicators.globalCrisisActive ? '🚨 YES' : '✅ NO'}`);
    console.log(`  🌍 Donor fatigue: ${(globalCrisisIndicators.donorFatigue * 100).toFixed(1)}%`);

    let totalPopulation = 0;
    let weightedCombinedReduction = 0;

    for (const region of pop.regionalPopulations) {
      if (!region.mortalityStabilizers) {
        if (state.currentMonth > 3) {
          throw new Error(
            `❌ Region ${region.name || 'unknown'} missing mortalityStabilizers at Month ${state.currentMonth}. ` +
            `Initialize in src/simulation/initialization.ts.`
          );
        }
        continue;
      }

      const stabilizers = region.mortalityStabilizers;

      this.updateInternationalAid(state, region, stabilizers, globalCrisisIndicators);
      this.updateHeatAdaptation(state, region, stabilizers);
      this.updateMigration(state, region, stabilizers);
      this.updateEmergencyResponse(state, region, stabilizers);
      this.applyCascadeFailures(state, stabilizers);
      this.calculateCombinedReduction(state, stabilizers);

      console.log(`  📊 ${region.name || 'Unknown'} (pop: ${region.population.toFixed(1)}M)`);
      console.log(`    🤝 Aid: ${(stabilizers.aid.mortalityReduction * 100).toFixed(1)}%`);
      console.log(`    🌡️ Adaptation: ${(stabilizers.adaptation.totalReduction * 100).toFixed(1)}%`);
      console.log(`    🚶 Migration: ${(stabilizers.migration.successfulRelocation * 100).toFixed(1)}%`);
      console.log(`    🚨 Emergency: ${(stabilizers.emergencyResponse.effectiveness * 100).toFixed(1)}%`);
      console.log(`    ✅ COMBINED: ${(stabilizers.combinedReduction * 100).toFixed(1)}%`);

      totalPopulation += region.population;
      weightedCombinedReduction += stabilizers.combinedReduction * region.population;
    }

    if (totalPopulation > 0) {
      console.log(`\n  🌐 Global combined reduction: ${(weightedCombinedReduction / totalPopulation * 100).toFixed(1)}%`);
    }
  }

  private calculateGlobalCrisisIndicators(state: GameState) {
    const totalMajorEconomies = 10;
    const pop = state.humanPopulationSystem;
    let collapsed = 0;

    if (pop.regionalPopulations) {
      for (const region of pop.regionalPopulations) {
        const isMajorEconomy = region.baselinePopulation > RATES.MAJOR_ECONOMY_POPULATION_THRESHOLD;
        const economicCollapse = region.economicStage < RATES.MAJOR_ECONOMY_COLLAPSE_ECONOMIC_THRESHOLD;
        const populationCollapse = region.population < region.baselinePopulation * RATES.MAJOR_ECONOMY_POPULATION_COLLAPSE_FRACTION;

        if (isMajorEconomy && (economicCollapse || populationCollapse)) {
          collapsed++;
        }
      }
    }

    const globalCrisisActive = (collapsed / totalMajorEconomies) > RATES.MAJOR_ECONOMY_GLOBAL_CRISIS_THRESHOLD;
    const activeCrises = state.planetaryBoundariesSystem?.cascadeActive ? 3 : 1;
    const donorFatigue = Math.min(RATES.DONOR_FATIGUE_MAX, (activeCrises - 1) * RATES.DONOR_FATIGUE_PER_CRISIS);

    return { majorEconomiesCollapsed: collapsed, totalMajorEconomies, globalCrisisActive, donorFatigue };
  }

  private updateInternationalAid(
    state: GameState,
    region: RegionalPopulation,
    stabilizers: NonNullable<RegionalPopulation['mortalityStabilizers']>,
    globalIndicators: ReturnType<typeof this.calculateGlobalCrisisIndicators>
  ): void {
    const aid = stabilizers.aid;
    aid.majorEconomiesCollapsed = globalIndicators.majorEconomiesCollapsed;
    aid.totalMajorEconomies = globalIndicators.totalMajorEconomies;

    if (globalIndicators.globalCrisisActive) {
      aid.effectivenessLevel = 'none';
      aid.donorAvailability = 0.0;
      aid.mortalityReduction = 0.0;
      aid.donorFatigue = 1.0;
      return;
    }

    aid.donorFatigue = globalIndicators.donorFatigue;
    aid.donorAvailability = Math.max(0, 1.0 - globalIndicators.donorFatigue);

    if (aid.donorAvailability > RATES.AID_DONOR_AVAILABILITY_HIGH) {
      aid.effectivenessLevel = 'high';
      aid.mortalityReduction = BASELINES.AID_EFFECTIVENESS_HIGH * aid.donorAvailability;
    } else if (aid.donorAvailability > RATES.AID_DONOR_AVAILABILITY_MEDIUM) {
      aid.effectivenessLevel = 'medium';
      aid.mortalityReduction = BASELINES.AID_EFFECTIVENESS_MEDIUM * aid.donorAvailability;
    } else if (aid.donorAvailability > RATES.AID_DONOR_AVAILABILITY_LOW) {
      aid.effectivenessLevel = 'low';
      aid.mortalityReduction = BASELINES.AID_EFFECTIVENESS_LOW * aid.donorAvailability;
    } else {
      aid.effectivenessLevel = 'none';
      aid.mortalityReduction = 0.0;
    }

    aid.mortalityReduction = assertInRange(aid.mortalityReduction, 0, BASELINES.AID_EFFECTIVENESS_MAX, {
      location: 'HumanSurvivalSystemPhase.updateInternationalAid',
      valueName: 'aid.mortalityReduction',
      month: state.currentMonth
    });
  }

  private updateHeatAdaptation(
    state: GameState,
    region: RegionalPopulation,
    stabilizers: NonNullable<RegionalPopulation['mortalityStabilizers']>
  ): void {
    const adaptation = stabilizers.adaptation;

    const climateCrisisFlag = assertDefined(
      state.environmentalAccumulation?.climateCrisisActive,
      {
        location: 'HumanSurvivalSystemPhase.updateHeatAdaptation',
        valueName: 'environmentalAccumulation.climateCrisisActive',
        month: state.currentMonth,
        expectedSource: 'initialization.ts or EnvironmentalAccumulationPhase'
      }
    );

    let wetBulbCrisis = false;
    if (state.wetBulbTemperatureSystem?.eventsThisMonth && state.wetBulbTemperatureSystem.eventsThisMonth.length > 0) {
      const maxWetBulb = Math.max(...state.wetBulbTemperatureSystem.eventsThisMonth.map(e => e.wetBulbTemp));
      wetBulbCrisis = maxWetBulb > THRESHOLDS.WET_BULB_STRESS_THRESHOLD;
    }

    const heatCrisisActive = climateCrisisFlag || wetBulbCrisis;

    if (!heatCrisisActive) return;

    adaptation.monthsExposed++;

    if (adaptation.monthsExposed === 1 || adaptation.monthsExposed % 12 === 0) {
      console.log(`  🌡️ Heat adaptation: ${region.name || 'unknown'} - ${adaptation.monthsExposed} months`);
    }

    if (adaptation.monthsExposed >= RATES.HEAT_ADAPTATION_PHYSIOLOGICAL_MIN_EXPOSURE) {
      adaptation.physiological = Math.min(
        BASELINES.HEAT_ADAPTATION_PHYSIOLOGICAL_MAX,
        adaptation.monthsExposed * RATES.HEAT_ADAPTATION_PHYSIOLOGICAL_RATE
      );
    }

    if (adaptation.monthsExposed >= RATES.HEAT_ADAPTATION_BEHAVIORAL_MIN_EXPOSURE) {
      adaptation.behavioral = Math.min(
        BASELINES.HEAT_ADAPTATION_BEHAVIORAL_MAX,
        adaptation.monthsExposed * RATES.HEAT_ADAPTATION_BEHAVIORAL_RATE
      );
    }

    const gdpPerCapita = region.economicStage >= 3 ? 40000 : (region.economicStage >= 2 ? 15000 : 5000);
    if (gdpPerCapita > RATES.HEAT_ADAPTATION_INFRASTRUCTURE_GDP_THRESHOLD &&
        adaptation.monthsExposed > RATES.HEAT_ADAPTATION_INFRASTRUCTURAL_MIN_EXPOSURE) {
      const infraRate = gdpPerCapita / RATES.HEAT_ADAPTATION_INFRASTRUCTURE_GDP_SCALE;
      adaptation.infrastructural = Math.min(
        BASELINES.HEAT_ADAPTATION_INFRASTRUCTURAL_MAX,
        (adaptation.monthsExposed - RATES.HEAT_ADAPTATION_INFRASTRUCTURAL_MIN_EXPOSURE) *
        RATES.HEAT_ADAPTATION_INFRASTRUCTURAL_RATE *
        infraRate
      );
    }

    const governance = region.healthcareQuality;
    if (governance > RATES.HEAT_ADAPTATION_SOCIAL_GOVERNANCE_THRESHOLD &&
        adaptation.monthsExposed > RATES.HEAT_ADAPTATION_SOCIAL_MIN_EXPOSURE) {
      const policyRate = governance;
      adaptation.social = Math.min(
        BASELINES.HEAT_ADAPTATION_SOCIAL_MAX,
        (adaptation.monthsExposed - RATES.HEAT_ADAPTATION_SOCIAL_MIN_EXPOSURE) *
        RATES.HEAT_ADAPTATION_SOCIAL_RATE *
        policyRate
      );
    }

    const totalReduction = adaptation.physiological + adaptation.behavioral +
                           adaptation.infrastructural + adaptation.social;
    adaptation.totalReduction = Math.min(BASELINES.HEAT_ADAPTATION_TOTAL_MAX, totalReduction);
    adaptation.adaptationCeases = false;

    adaptation.totalReduction = assertInRange(adaptation.totalReduction, 0, BASELINES.HEAT_ADAPTATION_TOTAL_MAX, {
      location: 'HumanSurvivalSystemPhase.updateHeatAdaptation',
      valueName: 'adaptation.totalReduction',
      month: state.currentMonth
    });

    if (state.currentMonth > 100 && climateCrisisFlag && adaptation.monthsExposed === 0) {
      throw new Error(
        `❌ Heat adaptation bug at Month ${state.currentMonth}: ` +
        `${region.name || 'unknown'} has climateCrisisActive=true but monthsExposed = 0`
      );
    }
  }

  private updateMigration(
    state: GameState,
    region: RegionalPopulation,
    stabilizers: NonNullable<RegionalPopulation['mortalityStabilizers']>
  ): void {
    const migration = stabilizers.migration;
    const globalCrisis = state.planetaryBoundariesSystem?.cascadeActive || false;
    migration.destinationCapacity = globalCrisis ?
      RATES.MIGRATION_GLOBAL_CRISIS_CAPACITY :
      RATES.MIGRATION_REGIONAL_CRISIS_CAPACITY;

    const foodSecurityValidated = assertInRange(region.foodSecurity, 0, 1, {
      location: 'HumanSurvivalSystemPhase.updateMigration',
      valueName: 'region.foodSecurity',
      month: state.currentMonth
    });
    const foodInsecurity = 1.0 - foodSecurityValidated;
    const crisisSeverity = assertFinite(Math.pow(foodInsecurity, 1.5), {
      location: 'HumanSurvivalSystemPhase.updateMigration',
      valueName: 'crisisSeverity',
      month: state.currentMonth,
      additionalInfo: { foodSecurity: region.foodSecurity, foodInsecurity }
    });

    let successRate = BASELINES.MIGRATION_SUCCESS_RATE_BASELINE;
    successRate *= (1 - crisisSeverity * RATES.MIGRATION_CRISIS_PENALTY);

    const distancePenalty = Math.min(
      RATES.MIGRATION_MAX_DISTANCE_PENALTY,
      migration.averageDistance / RATES.MIGRATION_DISTANCE_SCALE
    );
    migration.distancePenalty = distancePenalty;
    successRate *= (1 - distancePenalty);
    successRate *= migration.destinationCapacity;

    migration.successfulRelocation = Math.max(0, successRate);

    let mortalityRate = BASELINES.MIGRATION_MORTALITY_BASELINE;
    mortalityRate += crisisSeverity * RATES.MIGRATION_CRISIS_MORTALITY_INCREASE;
    mortalityRate += distancePenalty * RATES.MIGRATION_DISTANCE_MORTALITY_INCREASE;
    migration.mortalityDuringMigration = Math.min(BASELINES.MIGRATION_MORTALITY_MAX, mortalityRate);

    let returnRate = BASELINES.MIGRATION_RETURN_RATE_BASELINE;
    returnRate *= (1 - crisisSeverity * RATES.MIGRATION_RETURN_CRISIS_PENALTY);
    migration.returnRate = Math.max(0, returnRate);

    migration.successfulRelocation = assertInRange(migration.successfulRelocation, 0, 1.0, {
      location: 'HumanSurvivalSystemPhase.updateMigration',
      valueName: 'migration.successfulRelocation',
      month: state.currentMonth
    });
  }

  private updateEmergencyResponse(
    state: GameState,
    region: RegionalPopulation,
    stabilizers: NonNullable<RegionalPopulation['mortalityStabilizers']>
  ): void {
    const response = stabilizers.emergencyResponse;
    const globalCrisis = state.planetaryBoundariesSystem?.cascadeActive || false;
    response.crisisScale = globalCrisis ?
      RATES.EMERGENCY_RESPONSE_GLOBAL_CRISIS_SCALE :
      RATES.EMERGENCY_RESPONSE_LOCAL_CRISIS_SCALE;

    let effectiveness = BASELINES.EMERGENCY_RESPONSE_BASELINE;
    effectiveness *= response.workforceAvailable * RATES.EMERGENCY_RESPONSE_WORKFORCE_SCALE;
    effectiveness *= (RATES.EMERGENCY_RESPONSE_PREPAREDNESS_MIN +
                     (1 - RATES.EMERGENCY_RESPONSE_PREPAREDNESS_MIN) * response.preparednessLevel);
    effectiveness *= (RATES.EMERGENCY_RESPONSE_RESOURCE_MIN +
                     (1 - RATES.EMERGENCY_RESPONSE_RESOURCE_MIN) * response.resourceStockpiles);
    effectiveness *= (RATES.EMERGENCY_RESPONSE_COMMUNICATION_MIN +
                     (1 - RATES.EMERGENCY_RESPONSE_COMMUNICATION_MIN) * response.communicationSystems);

    response.overwhelmPenalty = Math.max(
      RATES.EMERGENCY_RESPONSE_OVERWHELM_MIN,
      1 - response.crisisScale * RATES.EMERGENCY_RESPONSE_CRISIS_SCALE_PENALTY
    );
    effectiveness *= response.overwhelmPenalty;
    response.effectiveness = Math.min(BASELINES.EMERGENCY_RESPONSE_MAX, effectiveness);

    response.effectiveness = assertInRange(response.effectiveness, 0, BASELINES.EMERGENCY_RESPONSE_MAX, {
      location: 'HumanSurvivalSystemPhase.updateEmergencyResponse',
      valueName: 'response.effectiveness',
      month: state.currentMonth
    });
  }

  private applyCascadeFailures(
    state: GameState,
    stabilizers: NonNullable<RegionalPopulation['mortalityStabilizers']>
  ): void {
    const cascades = stabilizers.cascades;

    cascades.aidFunctioning = assertInRange(
      stabilizers.aid.mortalityReduction / BASELINES.AID_EFFECTIVENESS_HIGH,
      0, 1,
      { location: 'HumanSurvivalSystemPhase.applyCascadeFailures', valueName: 'cascades.aidFunctioning', month: state.currentMonth }
    );
    cascades.adaptationFunctioning = assertInRange(
      stabilizers.adaptation.totalReduction / BASELINES.HEAT_ADAPTATION_TOTAL_MAX,
      0, 1,
      { location: 'HumanSurvivalSystemPhase.applyCascadeFailures', valueName: 'cascades.adaptationFunctioning', month: state.currentMonth }
    );
    cascades.migrationFunctioning = assertInRange(
      stabilizers.migration.successfulRelocation,
      0, 1,
      { location: 'HumanSurvivalSystemPhase.applyCascadeFailures', valueName: 'cascades.migrationFunctioning', month: state.currentMonth }
    );
    cascades.emergencyResponseFunctioning = assertInRange(
      stabilizers.emergencyResponse.effectiveness / BASELINES.EMERGENCY_RESPONSE_MAX,
      0, 1,
      { location: 'HumanSurvivalSystemPhase.applyCascadeFailures', valueName: 'cascades.emergencyResponseFunctioning', month: state.currentMonth }
    );

    if (cascades.aidFunctioning < MULTIPLIERS.CASCADE_FAILURE_THRESHOLD) {
      stabilizers.emergencyResponse.effectiveness *= (1 - cascades.cascadeMultipliers.aidToEmergencyResponse);
      stabilizers.migration.successfulRelocation *= (1 - cascades.cascadeMultipliers.aidToMigration);
    }

    if (cascades.emergencyResponseFunctioning < MULTIPLIERS.CASCADE_FAILURE_THRESHOLD) {
      stabilizers.migration.successfulRelocation *= (1 - cascades.cascadeMultipliers.emergencyToMigration);
    }

    // Recalculate post-cascade
    cascades.aidFunctioning = assertInRange(
      stabilizers.aid.mortalityReduction / BASELINES.AID_EFFECTIVENESS_HIGH, 0, 1,
      { location: 'HumanSurvivalSystemPhase.applyCascadeFailures (post)', valueName: 'cascades.aidFunctioning', month: state.currentMonth }
    );
    cascades.migrationFunctioning = assertInRange(
      stabilizers.migration.successfulRelocation, 0, 1,
      { location: 'HumanSurvivalSystemPhase.applyCascadeFailures (post)', valueName: 'cascades.migrationFunctioning', month: state.currentMonth }
    );
    cascades.emergencyResponseFunctioning = assertInRange(
      stabilizers.emergencyResponse.effectiveness / BASELINES.EMERGENCY_RESPONSE_MAX, 0, 1,
      { location: 'HumanSurvivalSystemPhase.applyCascadeFailures (post)', valueName: 'cascades.emergencyResponseFunctioning', month: state.currentMonth }
    );
  }

  private calculateCombinedReduction(
    state: GameState,
    stabilizers: NonNullable<RegionalPopulation['mortalityStabilizers']>
  ): void {
    const aid = stabilizers.aid.mortalityReduction;
    const adaptation = stabilizers.adaptation.totalReduction;
    const migration = stabilizers.migration.successfulRelocation * RATES.MIGRATION_EVACUATION_FRACTION;
    const emergency = stabilizers.emergencyResponse.effectiveness;

    const remainingAfterMigration = assertFinite(1 - migration, {
      location: 'HumanSurvivalSystemPhase.calculateCombinedReduction',
      valueName: 'remainingAfterMigration',
      month: state.currentMonth,
      additionalInfo: { migration }
    });
    const mortalityMultiplier = assertFinite(
      (1 - aid) * (1 - adaptation) * (1 - emergency),
      {
        location: 'HumanSurvivalSystemPhase.calculateCombinedReduction',
        valueName: 'mortalityMultiplier',
        month: state.currentMonth,
        additionalInfo: { aid, adaptation, emergency }
      }
    );
    const combined = assertInRange(
      1 - (remainingAfterMigration * mortalityMultiplier),
      0, 1,
      {
        location: 'HumanSurvivalSystemPhase.calculateCombinedReduction',
        valueName: 'combinedReduction',
        month: state.currentMonth
      }
    );

    stabilizers.combinedReduction = combined;
  }

  // ============================================================================
  // SUBSYSTEM 3: FAMINE SYSTEM (Order 21.5)
  // ============================================================================

  private executeFamineSystem(state: GameState, rng: RNGFunction): void {
    if (!state.famineSystem) return;

    // Check regional biodiversity for new famine triggers
    checkRegionalFamineRisk(state, state.currentMonth);

    // Update active famines
    const totalAICapability = assertFinite(
      state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0),
      {
        location: 'HumanSurvivalSystemPhase.executeFamineSystem',
        valueName: 'totalAICapability',
        month: state.currentMonth,
        additionalInfo: { agentCount: state.aiAgents.length },
      }
    );

    const foodReserves = assertProbability(
      state.resourceEconomy.food.reserves,
      {
        location: 'HumanSurvivalSystemPhase.executeFamineSystem',
        valueName: 'resourceEconomy.food.reserves',
        month: state.currentMonth,
      }
    );
    const resourcesAvailable = foodReserves > 0.5;

    const famineDeathsRaw = updateFamineSystem(
      state.famineSystem,
      totalAICapability,
      resourcesAvailable,
      state.currentMonth
    );

    const famineDeaths = assertFinite(famineDeathsRaw, {
      location: 'HumanSurvivalSystemPhase.executeFamineSystem',
      valueName: 'famineDeaths',
      month: state.currentMonth,
      additionalInfo: {
        totalAICapability,
        resourcesAvailable,
        activeFamines: state.famineSystem.activeFamines.length,
      },
    });

    if (famineDeaths < 0) {
      throw new Error(
        `❌ Negative famine deaths in HumanSurvivalSystemPhase\n` +
        `   famineDeaths = ${famineDeaths}M\n` +
        `   Month: ${state.currentMonth}`
      );
    }

    // Apply famine deaths to Bayesian mortality system
    if (famineDeaths > 0) {
      const famines = state.famineSystem.activeFamines;

      if (famines.length > 0) {
        assertNonEmpty(famines, {
          location: 'HumanSurvivalSystemPhase.executeFamineSystem',
          valueName: 'activeFamines',
          month: state.currentMonth,
        });

        for (const famine of famines) {
          const population = assertFinite(state.humanPopulationSystem.population, {
            location: 'HumanSurvivalSystemPhase.executeFamineSystem',
            valueName: 'humanPopulationSystem.population',
            month: state.currentMonth,
          });

          if (population <= 0) {
            throw new Error(
              `❌ Zero/negative population in HumanSurvivalSystemPhase\n` +
              `   population = ${population}B\n` +
              `   Month: ${state.currentMonth}`
            );
          }

          const famineMortalityRate = assertMortalityRate(
            (famineDeaths / famines.length) / population,
            {
              location: 'HumanSurvivalSystemPhase.executeFamineSystem',
              valueName: 'famineMortalityRate',
              month: state.currentMonth,
              population: population * 1000,
            }
          );

          let rootCause: 'conflict' | 'climate' | 'social' | 'ecosystem' = 'social';
          let confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 'HIGH';

          if (famine.cause === 'war_displacement' || famine.cause === 'aid_blockade' || famine.cause === 'nuclear_winter') {
            rootCause = 'conflict';
            confidence = 'HIGH';
          } else if (famine.cause === 'crop_failure') {
            rootCause = 'climate';
            confidence = 'HIGH';
          } else if (famine.cause === 'drought') {
            rootCause = 'climate';
            confidence = 'MEDIUM';
          } else {
            rootCause = 'social';
            confidence = 'HIGH';
          }

          addMortalityRisk(state.humanPopulationSystem, {
            type: 'famine',
            baseRisk: famineMortalityRate,
            proximate: 'famine',
            root: rootCause,
            confidence,
            scope: 'REGIONAL',
            region: famine.affectedRegion,
            month: state.currentMonth,
            description: `Famine in ${famine.affectedRegion}: ${famine.cause}`,
          });
        }
      } else {
        const population = assertFinite(state.humanPopulationSystem.population, {
          location: 'HumanSurvivalSystemPhase.executeFamineSystem (fallback)',
          valueName: 'humanPopulationSystem.population',
          month: state.currentMonth,
        });

        if (population <= 0) {
          throw new Error(
            `❌ Zero/negative population in HumanSurvivalSystemPhase (fallback)\n` +
            `   population = ${population}B\n` +
            `   Month: ${state.currentMonth}`
          );
        }

        const mortalityRate = assertMortalityRate(
          famineDeaths / population,
          {
            location: 'HumanSurvivalSystemPhase.executeFamineSystem (fallback)',
            valueName: 'mortalityRate',
            month: state.currentMonth,
            population: population * 1000,
          }
        );
        addMortalityRisk(state.humanPopulationSystem, {
          type: 'famine',
          baseRisk: mortalityRate,
          proximate: 'famine',
          root: 'social',
          confidence: 'LOW',
          scope: 'SEMI-GLOBAL',
          month: state.currentMonth,
          description: 'Unattributed famine deaths',
        });
      }

      const deathsMillions = famineDeaths;
      if (deathsMillions > 0.001) {
        console.log(`💀 Famine deaths: ${deathsMillions.toFixed(1)}M (${state.famineSystem.activeFamines.length} active)`);
        console.log(`   Total famine deaths: ${state.famineSystem.totalDeaths.toFixed(0)}M`);
      }
    }
  }
}
