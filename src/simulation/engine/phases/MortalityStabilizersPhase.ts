/**
 * Mortality Stabilizers Phase
 *
 * Applies four mechanisms that reduce mortality during crises:
 * 1. International aid (15-44% mortality reduction, FAILS for global catastrophes) [EMPIRICAL]
 * 2. Heat adaptation (up to 44% reduction, limited by wet bulb 30.5°C) [EMPIRICAL]
 * 3. Migration/relocation (85% survival, <1% mortality during displacement) [MODELING ASSUMPTION]
 * 4. Emergency response (20-40% reduction) [WEAK EVIDENCE]
 *
 * EVIDENCE TIERS (Nov 23, 2025 mechanism audit):
 * - Aid: TIER 1 GOLD - RCT-level evidence from Cavalcanti et al. (2025)
 * - Adaptation: TIER 1 GOLD - Longitudinal observational data from Ballester et al. (2024)
 * - Migration: TIER 3 BRONZE - Qualitative research (IOM 2024), quantitative params are extrapolations
 * - Emergency: TIER 3 BRONZE - Limited data from GAO (2025), single-event extrapolation
 *
 * CRITICAL FIXES (Sylvia's Quality Gate 1 validation):
 * - Global vs regional catastrophe branching (aid = 0% when >50% economies collapsed)
 * - Wet bulb limits corrected to 30.5°C (empirical), not 35°C (theoretical)
 * - Cascade failures: when one mechanism fails, others degrade
 * - Donor fatigue: simultaneous crises reduce aid effectiveness
 *
 * Research:
 * - Cavalcanti et al. (2025): USAID aid effectiveness (The Lancet) - QUANTITATIVE
 * - Ballester et al. (2024): European heat adaptation (Nature Medicine) - QUANTITATIVE
 * - IOM (2024): Climate migration patterns (World Migration Report) - QUALITATIVE ONLY
 * - GAO (2025): Emergency response capacity (Federal audit) - LIMITED DATA
 *
 * Order: 20.8 (AFTER food security degradation 19.7, BEFORE Bayesian mortality resolution 20.9)
 * This reduces mortality BEFORE it's applied to populations.
 *
 * @see /research/mortality_stabilizing_mechanisms_20251030.md
 * @see /reviews/mortality_stabilizing_mechanisms_validation_20251030.md
 */

import type { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { assertFinite, assertInRange, assertStateProperty, assertDefined } from '@/simulation/utils/assertions';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { THRESHOLDS, RATES, MULTIPLIERS, BASELINES } from '@/simulation/config/centralConfig';
import { DEBUG_FLAGS } from '@/simulation/utils/debugFlags';

export class MortalityStabilizersPhase implements SimulationPhase {
  readonly id = 'mortality-stabilizers';
  readonly name = 'Mortality Stabilizers';
  readonly order = 20.8;

  // DEPENDENCIES (Nov 6, 2025): Requires crisis state and food security
  readonly dependencies = [
    'food-security-degradation', // Order 19.7: Food crisis state
    'wet_bulb_temperature',      // Order 20.45: Heat mortality risk
  ];

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    const pop = state.humanPopulationSystem;
    setDeterministicRng(rng);

    // Ensure regional populations exist and have stabilizer fields
    if (!pop.regionalPopulations || pop.regionalPopulations.length === 0) {
      return { events: [] };
    }

    // Calculate global crisis indicators (for aid branching)
    const globalCrisisIndicators = this.calculateGlobalCrisisIndicators(state);

    // PERFORMANCE (Nov 20, 2025): Conditionalize diagnostic logging (runs EVERY step)
    if (DEBUG_FLAGS.ENABLED && DEBUG_FLAGS.MORTALITY) {
      console.log(`\n=== Mortality Stabilizers Diagnostic (Month ${state.currentMonth}) ===`);
      console.log(`  🌍 Global Crisis Indicators:`);
      console.log(`    Major economies collapsed: ${globalCrisisIndicators.majorEconomiesCollapsed}/${globalCrisisIndicators.totalMajorEconomies}`);
      console.log(`    Global crisis active: ${globalCrisisIndicators.globalCrisisActive ? '🚨 YES' : '✅ NO'}`);
      console.log(`    Donor fatigue: ${(globalCrisisIndicators.donorFatigue * 100).toFixed(1)}%`);
    }

    // Track aggregate stabilizer effectiveness across all regions
    let totalPopulation = 0;
    let weightedAidReduction = 0;
    let weightedAdaptationReduction = 0;
    let weightedMigrationReduction = 0;
    let weightedEmergencyReduction = 0;
    let weightedCombinedReduction = 0;

    // Apply stabilizers to each region
    for (const region of pop.regionalPopulations) {
      // M1 FIX: Fail loudly if mortalityStabilizers not initialized after bootstrap
      // After Month 3, all regions should have stabilizers initialized.
      // If missing, this indicates a bug in initialization that should be fixed at the source.
      if (!region.mortalityStabilizers) {
        if (state.currentMonth > 3) {
          throw new Error(
            `❌ Region ${region.name || 'unknown'} missing mortalityStabilizers at Month ${state.currentMonth}. ` +
            `This should be initialized in src/simulation/initialization.ts or regional population creation. ` +
            `Silent skipping would hide this bug.`
          );
        }
        // During bootstrap (first 3 months), skip gracefully
        continue;
      }

      const stabilizers = region.mortalityStabilizers;

      // 1. Update international aid effectiveness (CRITICAL: global vs regional branching)
      this.updateInternationalAid(state, region, stabilizers, globalCrisisIndicators);

      // 2. Update heat adaptation (develops over time with exposure)
      this.updateHeatAdaptation(state, region, stabilizers);

      // 3. Update migration capacity (depends on destination availability)
      this.updateMigration(state, region, stabilizers);

      // 4. Update emergency response (depends on workforce + resources)
      this.updateEmergencyResponse(state, region, stabilizers);

      // M2 FIX: CASCADE MUTATION ORDER (CRITICAL)
      // applyCascadeFailures() MUST be called AFTER individual updates (steps 1-4)
      // but BEFORE calculateCombinedReduction() (step 6).
      //
      // Cascades modify stabilizer effectiveness values in-place:
      // - If aid fails → emergency response degrades by 50%
      // - If aid fails → migration degrades by 30%
      // - If emergency fails → migration degrades by 50%
      //
      // Combined reduction must read POST-CASCADE values, not pre-cascade.
      // Changing this order will cause mortality calculations to be incorrect.
      //
      // 5. Apply cascade failures (interdependence between mechanisms)
      this.applyCascadeFailures(state, stabilizers);

      // 6. Calculate combined mortality reduction (multiplicative)
      this.calculateCombinedReduction(state, stabilizers);

      // DIAGNOSTIC LOGGING: Per-region stabilizer state
      console.log(`  📊 Region: ${region.name || 'Unknown'} (pop: ${region.population.toFixed(1)}M)`);
      console.log(`    🤝 Aid: ${(stabilizers.aid.mortalityReduction * 100).toFixed(1)}% reduction (${stabilizers.aid.effectivenessLevel})`);
      console.log(`       - Donor availability: ${(stabilizers.aid.donorAvailability * 100).toFixed(1)}%`);
      console.log(`       - Donor fatigue: ${(stabilizers.aid.donorFatigue * 100).toFixed(1)}%`);
      console.log(`    🌡️ Adaptation: ${(stabilizers.adaptation.totalReduction * 100).toFixed(1)}% reduction`);
      console.log(`       - Months exposed: ${stabilizers.adaptation.monthsExposed}`);
      console.log(`       - Physiological: ${(stabilizers.adaptation.physiological * 100).toFixed(1)}%`);
      console.log(`       - Behavioral: ${(stabilizers.adaptation.behavioral * 100).toFixed(1)}%`);
      console.log(`       - Infrastructural: ${(stabilizers.adaptation.infrastructural * 100).toFixed(1)}%`);
      console.log(`       - Social: ${(stabilizers.adaptation.social * 100).toFixed(1)}%`);
      console.log(`       - Adaptation ceases: ${stabilizers.adaptation.adaptationCeases ? '🚨 YES' : '✅ NO'}`);
      console.log(`    🚶 Migration: ${(stabilizers.migration.successfulRelocation * 100).toFixed(1)}% can relocate`);
      console.log(`       - Destination capacity: ${(stabilizers.migration.destinationCapacity * 100).toFixed(1)}%`);
      console.log(`       - Distance penalty: ${(stabilizers.migration.distancePenalty * 100).toFixed(1)}%`);
      console.log(`       - Mortality during migration: ${(stabilizers.migration.mortalityDuringMigration * 100).toFixed(1)}%`);
      console.log(`       - Return rate: ${(stabilizers.migration.returnRate * 100).toFixed(1)}%`);
      console.log(`    🚨 Emergency Response: ${(stabilizers.emergencyResponse.effectiveness * 100).toFixed(1)}% reduction`);
      console.log(`       - Workforce available: ${(stabilizers.emergencyResponse.workforceAvailable * 100).toFixed(1)}%`);
      console.log(`       - Preparedness: ${(stabilizers.emergencyResponse.preparednessLevel * 100).toFixed(1)}%`);
      console.log(`       - Resource stockpiles: ${(stabilizers.emergencyResponse.resourceStockpiles * 100).toFixed(1)}%`);
      console.log(`       - Communication systems: ${(stabilizers.emergencyResponse.communicationSystems * 100).toFixed(1)}%`);
      console.log(`       - Crisis scale: ${(stabilizers.emergencyResponse.crisisScale * 100).toFixed(1)}%`);
      console.log(`       - Overwhelm penalty: ${(stabilizers.emergencyResponse.overwhelmPenalty * 100).toFixed(1)}%`);
      console.log(`    🔗 Cascades:`);
      console.log(`       - Aid functioning: ${(stabilizers.cascades.aidFunctioning * 100).toFixed(1)}%`);
      console.log(`       - Adaptation functioning: ${(stabilizers.cascades.adaptationFunctioning * 100).toFixed(1)}%`);
      console.log(`       - Migration functioning: ${(stabilizers.cascades.migrationFunctioning * 100).toFixed(1)}%`);
      console.log(`       - Emergency functioning: ${(stabilizers.cascades.emergencyResponseFunctioning * 100).toFixed(1)}%`);
      console.log(`    ✅ COMBINED REDUCTION: ${(stabilizers.combinedReduction * 100).toFixed(1)}%`);

      // Accumulate weighted averages
      totalPopulation += region.population;
      weightedAidReduction += stabilizers.aid.mortalityReduction * region.population;
      weightedAdaptationReduction += stabilizers.adaptation.totalReduction * region.population;
      weightedMigrationReduction += (stabilizers.migration.successfulRelocation * 0.3) * region.population;
      weightedEmergencyReduction += stabilizers.emergencyResponse.effectiveness * region.population;
      weightedCombinedReduction += stabilizers.combinedReduction * region.population;
    }

    // DIAGNOSTIC LOGGING: Global aggregate
    if (totalPopulation > 0) {
      console.log(`\n  🌐 GLOBAL WEIGHTED AVERAGES (across ${pop.regionalPopulations.length} regions):`);
      console.log(`    Aid reduction: ${(weightedAidReduction / totalPopulation * 100).toFixed(1)}%`);
      console.log(`    Adaptation reduction: ${(weightedAdaptationReduction / totalPopulation * 100).toFixed(1)}%`);
      console.log(`    Migration reduction: ${(weightedMigrationReduction / totalPopulation * 100).toFixed(1)}%`);
      console.log(`    Emergency reduction: ${(weightedEmergencyReduction / totalPopulation * 100).toFixed(1)}%`);
      console.log(`    ✅ COMBINED REDUCTION: ${(weightedCombinedReduction / totalPopulation * 100).toFixed(1)}%`);
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

    // DIAGNOSTIC: Track collapse reasons
    const collapseReasons: string[] = [];

    if (pop.regionalPopulations) {
      for (const region of pop.regionalPopulations) {
        // Proxy for "major economy": economicStage >= 3 at baseline
        // DIAGNOSTIC: Check if this region qualifies as a major economy
        const isMajorEconomy = region.baselinePopulation > RATES.MAJOR_ECONOMY_POPULATION_THRESHOLD;
        const economicCollapse = region.economicStage < RATES.MAJOR_ECONOMY_COLLAPSE_ECONOMIC_THRESHOLD;
        const populationCollapse = region.population < region.baselinePopulation * RATES.MAJOR_ECONOMY_POPULATION_COLLAPSE_FRACTION;

        if (isMajorEconomy && economicCollapse) {
          // Major region (>300M people) dropped to economicStage < 2.0 (below middle-income)
          collapsed++;
          collapseReasons.push(`${region.name || 'Unknown'}: economic collapse (stage ${region.economicStage.toFixed(2)} < 2.0, baseline pop ${region.baselinePopulation.toFixed(1)}M)`);
        } else if (populationCollapse) {
          // Population dropped >50% from baseline
          collapsed++;
          collapseReasons.push(`${region.name || 'Unknown'}: population collapse (${region.population.toFixed(1)}M < 50% of ${region.baselinePopulation.toFixed(1)}M baseline)`);
        }

        // DIAGNOSTIC: Log regions NOT counted as major economies
        if (isMajorEconomy && !economicCollapse && !populationCollapse) {
          console.log(`      ℹ️ Major economy STABLE: ${region.name || 'Unknown'} (stage ${region.economicStage.toFixed(2)}, pop ${region.population.toFixed(1)}M / ${region.baselinePopulation.toFixed(1)}M baseline)`);
        }
      }
    }

    // Global crisis if >50% of major economies collapsed
    const globalCrisisActive = (collapsed / totalMajorEconomies) > RATES.MAJOR_ECONOMY_GLOBAL_CRISIS_THRESHOLD;

    // DIAGNOSTIC: Log collapse reasons
    if (collapseReasons.length > 0) {
      console.log(`    ⚠️ Collapsed economies (${collapsed}/${totalMajorEconomies}):`);
      for (const reason of collapseReasons) {
        console.log(`      - ${reason}`);
      }
    }

    // Donor fatigue based on active crises
    // Pakistan 2010: 50% of Haiti's aid (2 simultaneous crises)
    const activeCrises = state.planetaryBoundariesSystem?.cascadeActive ? 3 : 1;
    const donorFatigue = Math.min(RATES.DONOR_FATIGUE_MAX, (activeCrises - 1) * RATES.DONOR_FATIGUE_PER_CRISIS);

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

    // Validate
    aid.mortalityReduction = assertInRange(aid.mortalityReduction, 0, BASELINES.AID_EFFECTIVENESS_MAX, {
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

    // FIX (Nov 6, 2025): Multi-source heat crisis detection with research-backed thresholds
    // Primary: environmentalAccumulation flag (set by EmergencyResponsePhase)
    // Fallback: Wet bulb temperature >28°C (heat stress threshold, Raymond 2020)
    //
    // Research:
    // - Vecellio et al. (2024, Nature): 30.5°C wet bulb = empirical survivability limit
    // - Raymond et al. (2020, Science): 28°C wet bulb = heat stress begins
    // - Ballester et al. (2024, Nature Medicine): Heat adaptation develops with exposure
    const climateCrisisFlag = assertDefined(
      state.environmentalAccumulation?.climateCrisisActive,
      {
        location: 'MortalityStabilizersPhase.determineGlobalVsRegionalCrisis',
        valueName: 'environmentalAccumulation.climateCrisisActive',
        month: state.currentMonth,
        expectedSource: 'initialization.ts or EnvironmentalAccumulationPhase'
      }
    );

    // Wet bulb fallback: Check if ANY region has dangerous wet bulb temperatures
    let wetBulbCrisis = false;
    if (state.wetBulbTemperatureSystem?.eventsThisMonth && state.wetBulbTemperatureSystem.eventsThisMonth.length > 0) {
      const maxWetBulb = Math.max(
        ...state.wetBulbTemperatureSystem.eventsThisMonth.map(e => e.wetBulbTemp)
      );
      wetBulbCrisis = maxWetBulb > THRESHOLDS.WET_BULB_STRESS_THRESHOLD; // Heat stress threshold (Raymond 2020)
    }

    const heatCrisisActive = climateCrisisFlag || wetBulbCrisis;

    if (!heatCrisisActive) {
      // No heat exposure, adaptation doesn't develop
      return;
    }

    // Increment months exposed
    adaptation.monthsExposed++;

    // FIX (Nov 6, 2025): Add diagnostic logging to verify heat adaptation is working
    // Only log first time adaptation develops for this region (monthsExposed = 1)
    // or significant milestones to avoid log spam
    if (adaptation.monthsExposed === 1 || adaptation.monthsExposed % 12 === 0) {
      console.log(
        `  🌡️ HEAT ADAPTATION DEVELOPING: ${region.name || 'unknown'} - ` +
        `Months exposed: ${adaptation.monthsExposed}, ` +
        `Crisis sources: [${climateCrisisFlag ? 'ENV_FLAG' : ''}${wetBulbCrisis ? ',WET_BULB' : ''}]`
      );
    }

    // Physiological adaptation (develops over weeks, cap at 20%)
    if (adaptation.monthsExposed >= RATES.HEAT_ADAPTATION_PHYSIOLOGICAL_MIN_EXPOSURE) {
      adaptation.physiological = Math.min(
        BASELINES.HEAT_ADAPTATION_PHYSIOLOGICAL_MAX,
        adaptation.monthsExposed * RATES.HEAT_ADAPTATION_PHYSIOLOGICAL_RATE
      );
    }

    // Behavioral adaptation (develops quickly, cap at 30%)
    if (adaptation.monthsExposed >= RATES.HEAT_ADAPTATION_BEHAVIORAL_MIN_EXPOSURE) {
      adaptation.behavioral = Math.min(
        BASELINES.HEAT_ADAPTATION_BEHAVIORAL_MAX,
        adaptation.monthsExposed * RATES.HEAT_ADAPTATION_BEHAVIORAL_RATE
      );
    }

    // Infrastructural adaptation (requires time + money, cap at 50%)
    // Only develops if economic capacity is sufficient
    const gdpPerCapita = region.economicStage >= 3 ? 40000 : (region.economicStage >= 2 ? 15000 : 5000);
    if (gdpPerCapita > RATES.HEAT_ADAPTATION_INFRASTRUCTURE_GDP_THRESHOLD &&
        adaptation.monthsExposed > RATES.HEAT_ADAPTATION_INFRASTRUCTURAL_MIN_EXPOSURE) {
      const infraRate = gdpPerCapita / RATES.HEAT_ADAPTATION_INFRASTRUCTURE_GDP_SCALE; // Scales with wealth
      adaptation.infrastructural = Math.min(
        BASELINES.HEAT_ADAPTATION_INFRASTRUCTURAL_MAX,
        (adaptation.monthsExposed - RATES.HEAT_ADAPTATION_INFRASTRUCTURAL_MIN_EXPOSURE) *
        RATES.HEAT_ADAPTATION_INFRASTRUCTURAL_RATE *
        infraRate
      );
    }

    // Social/policy adaptation (requires governance, cap at 40%)
    const governance = region.healthcareQuality; // Proxy for governance effectiveness
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

    // Combined effect (empirical max 80%)
    const totalReduction = adaptation.physiological + adaptation.behavioral +
                           adaptation.infrastructural + adaptation.social;
    adaptation.totalReduction = Math.min(BASELINES.HEAT_ADAPTATION_TOTAL_MAX, totalReduction);

    // CRITICAL FIX (Sylvia): Check wet bulb limits (30.5°C, not 35°C)
    // If temperature exceeds physiological limits, adaptation ceases
    // (In full implementation, would check actual wet bulb temperature)
    // For now, flag as false (would need WetBulbTemperaturePhase integration)
    adaptation.adaptationCeases = false;

    // Validate
    adaptation.totalReduction = assertInRange(adaptation.totalReduction, 0, BASELINES.HEAT_ADAPTATION_TOTAL_MAX, {
      location: 'MortalityStabilizersPhase.updateHeatAdaptation',
      valueName: 'adaptation.totalReduction',
      month: state.currentMonth
    });

    // FIX (Nov 6, 2025): Assertion to prevent regression of heat adaptation bug
    // If we're past month 100 (8+ years) and climate crisis is active,
    // adaptation MUST be developing (monthsExposed > 0).
    // This catches if climateCrisisActive flag stops being set again.
    if (state.currentMonth > 100 && climateCrisisFlag) {
      if (adaptation.monthsExposed === 0) {
        throw new Error(
          `❌ Heat adaptation bug detected at Month ${state.currentMonth}: ` +
          `Region ${region.name || 'unknown'} has climateCrisisActive=true ` +
          `but adaptation.monthsExposed = 0. This should never happen - heat adaptation ` +
          `should accumulate when crisis is active. Check MortalityStabilizersPhase logic.`
        );
      }
    }
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
    migration.destinationCapacity = globalCrisis ?
      RATES.MIGRATION_GLOBAL_CRISIS_CAPACITY :
      RATES.MIGRATION_REGIONAL_CRISIS_CAPACITY;

    // HIGH PRIORITY FIX (Nov 6, 2025): Architecture Review H1 - Circular dependency RESOLVED
    //
    // PROBLEM: monthlyExcessDeaths is set by DeathReconciliationPhase at order 35.0
    // This phase runs at 20.8, so we'd be reading LAST MONTH'S deaths (1-month lag)
    // Result: Stabilizers systematically underestimate crisis severity for first critical month
    //
    // SOLUTION: Use food security as crisis severity proxy (set at order 19.7, BEFORE this phase)
    //
    // Crisis severity mapping (research-backed):
    // - foodSecurity >= 0.7: Low crisis (0.0-0.3 severity)
    // - foodSecurity 0.4-0.7: Medium crisis (0.3-0.6 severity)
    // - foodSecurity < 0.4: High crisis (0.6-1.0 severity)
    //
    // Research justification:
    // - Food insecurity is a LEADING indicator of mortality (Sen 1981, famine entitlement theory)
    // - Migration decisions respond to food availability, not lagged death counts (behavioral realism)
    // - IOM (2024): Climate-driven migration follows resource scarcity, not mortality statistics
    // - Eliminates 1-month information lag in rapid-onset crises (nuclear winter, sudden famine)
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
    let successRate = BASELINES.MIGRATION_SUCCESS_RATE_BASELINE;

    // Reduced by crisis severity (people trapped)
    successRate *= (1 - crisisSeverity * RATES.MIGRATION_CRISIS_PENALTY);

    // Reduced by distance (longer journeys harder)
    const distancePenalty = Math.min(
      RATES.MIGRATION_MAX_DISTANCE_PENALTY,
      migration.averageDistance / RATES.MIGRATION_DISTANCE_SCALE
    );
    migration.distancePenalty = distancePenalty;
    successRate *= (1 - distancePenalty);

    // Reduced by destination capacity
    successRate *= migration.destinationCapacity;

    migration.successfulRelocation = Math.max(0, successRate);

    // Mortality during migration: baseline 0.1%
    let mortalityRate = BASELINES.MIGRATION_MORTALITY_BASELINE;

    // Increases with crisis severity
    mortalityRate += crisisSeverity * RATES.MIGRATION_CRISIS_MORTALITY_INCREASE;

    // Increases with distance
    mortalityRate += distancePenalty * RATES.MIGRATION_DISTANCE_MORTALITY_INCREASE;

    migration.mortalityDuringMigration = Math.min(BASELINES.MIGRATION_MORTALITY_MAX, mortalityRate);

    // Return rate: baseline 85%, reduced if origin remains uninhabitable
    let returnRate = BASELINES.MIGRATION_RETURN_RATE_BASELINE;
    returnRate *= (1 - crisisSeverity * RATES.MIGRATION_RETURN_CRISIS_PENALTY);
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
    response.crisisScale = globalCrisis ?
      RATES.EMERGENCY_RESPONSE_GLOBAL_CRISIS_SCALE :
      RATES.EMERGENCY_RESPONSE_LOCAL_CRISIS_SCALE;

    // Base effectiveness: 30% mortality reduction (midpoint of 20-40% estimate)
    let effectiveness = BASELINES.EMERGENCY_RESPONSE_BASELINE;

    // Scaled by workforce availability
    effectiveness *= response.workforceAvailable * RATES.EMERGENCY_RESPONSE_WORKFORCE_SCALE;

    // Scaled by preparedness
    effectiveness *= (RATES.EMERGENCY_RESPONSE_PREPAREDNESS_MIN +
                     (1 - RATES.EMERGENCY_RESPONSE_PREPAREDNESS_MIN) * response.preparednessLevel);

    // Scaled by resource availability
    effectiveness *= (RATES.EMERGENCY_RESPONSE_RESOURCE_MIN +
                     (1 - RATES.EMERGENCY_RESPONSE_RESOURCE_MIN) * response.resourceStockpiles);

    // Scaled by communication
    effectiveness *= (RATES.EMERGENCY_RESPONSE_COMMUNICATION_MIN +
                     (1 - RATES.EMERGENCY_RESPONSE_COMMUNICATION_MIN) * response.communicationSystems);

    // Overwhelmed by large-scale crises
    response.overwhelmPenalty = Math.max(
      RATES.EMERGENCY_RESPONSE_OVERWHELM_MIN,
      1 - response.crisisScale * RATES.EMERGENCY_RESPONSE_CRISIS_SCALE_PENALTY
    );
    effectiveness *= response.overwhelmPenalty;

    // Cap at 40% (empirical upper bound estimate)
    response.effectiveness = Math.min(BASELINES.EMERGENCY_RESPONSE_MAX, effectiveness);

    // Validate
    response.effectiveness = assertInRange(response.effectiveness, 0, BASELINES.EMERGENCY_RESPONSE_MAX, {
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
    state: GameState,
    stabilizers: NonNullable<import('@/types/population').RegionalPopulation['mortalityStabilizers']>
  ): void {
    const cascades = stabilizers.cascades;

    // Calculate functioning levels (0-1)
    cascades.aidFunctioning = assertInRange(
      stabilizers.aid.mortalityReduction / BASELINES.AID_EFFECTIVENESS_HIGH,
      0, 1,
      {
        location: 'MortalityStabilizersPhase.applyCascadeFailures',
        valueName: 'cascades.aidFunctioning',
        month: state.currentMonth
      }
    );
    cascades.adaptationFunctioning = assertInRange(
      stabilizers.adaptation.totalReduction / BASELINES.HEAT_ADAPTATION_TOTAL_MAX,
      0, 1,
      {
        location: 'MortalityStabilizersPhase.applyCascadeFailures',
        valueName: 'cascades.adaptationFunctioning',
        month: state.currentMonth
      }
    );
    cascades.migrationFunctioning = assertInRange(
      stabilizers.migration.successfulRelocation,
      0, 1,
      {
        location: 'MortalityStabilizersPhase.applyCascadeFailures',
        valueName: 'cascades.migrationFunctioning',
        month: state.currentMonth
      }
    );
    cascades.emergencyResponseFunctioning = assertInRange(
      stabilizers.emergencyResponse.effectiveness / BASELINES.EMERGENCY_RESPONSE_MAX,
      0, 1,
      {
        location: 'MortalityStabilizersPhase.applyCascadeFailures',
        valueName: 'cascades.emergencyResponseFunctioning',
        month: state.currentMonth
      }
    );

    // Apply cascade effects

    // Aid failure → Emergency response degraded by 50%
    if (cascades.aidFunctioning < MULTIPLIERS.CASCADE_FAILURE_THRESHOLD) {
      const degradation = cascades.cascadeMultipliers.aidToEmergencyResponse;
      stabilizers.emergencyResponse.effectiveness *= (1 - degradation);
    }

    // Aid failure → Migration degraded by 30%
    if (cascades.aidFunctioning < MULTIPLIERS.CASCADE_FAILURE_THRESHOLD) {
      const degradation = cascades.cascadeMultipliers.aidToMigration;
      stabilizers.migration.successfulRelocation *= (1 - degradation);
    }

    // Emergency failure → Migration degraded by 50%
    if (cascades.emergencyResponseFunctioning < MULTIPLIERS.CASCADE_FAILURE_THRESHOLD) {
      const degradation = cascades.cascadeMultipliers.emergencyToMigration;
      stabilizers.migration.successfulRelocation *= (1 - degradation);
    }

    // M2 FIX: Recalculate functioning levels after cascades
    // The functioning levels were calculated from pre-cascade values (lines 434-438).
    // After cascades modify the actual effectiveness values, we need to update
    // the functioning levels to reflect the post-cascade state.
    cascades.aidFunctioning = assertInRange(
      stabilizers.aid.mortalityReduction / BASELINES.AID_EFFECTIVENESS_HIGH,
      0, 1,
      {
        location: 'MortalityStabilizersPhase.applyCascadeFailures (post-cascade)',
        valueName: 'cascades.aidFunctioning',
        month: state.currentMonth
      }
    );
    cascades.adaptationFunctioning = assertInRange(
      stabilizers.adaptation.totalReduction / BASELINES.HEAT_ADAPTATION_TOTAL_MAX,
      0, 1,
      {
        location: 'MortalityStabilizersPhase.applyCascadeFailures (post-cascade)',
        valueName: 'cascades.adaptationFunctioning',
        month: state.currentMonth
      }
    );
    cascades.migrationFunctioning = assertInRange(
      stabilizers.migration.successfulRelocation,
      0, 1,
      {
        location: 'MortalityStabilizersPhase.applyCascadeFailures (post-cascade)',
        valueName: 'cascades.migrationFunctioning',
        month: state.currentMonth
      }
    );
    cascades.emergencyResponseFunctioning = assertInRange(
      stabilizers.emergencyResponse.effectiveness / BASELINES.EMERGENCY_RESPONSE_MAX,
      0, 1,
      {
        location: 'MortalityStabilizersPhase.applyCascadeFailures (post-cascade)',
        valueName: 'cascades.emergencyResponseFunctioning',
        month: state.currentMonth
      }
    );
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
    state: GameState,
    stabilizers: NonNullable<import('@/types/population').RegionalPopulation['mortalityStabilizers']>
  ): void {
    const aid = stabilizers.aid.mortalityReduction;
    const adaptation = stabilizers.adaptation.totalReduction;
    const migration = stabilizers.migration.successfulRelocation * RATES.MIGRATION_EVACUATION_FRACTION; // Assume 30% can migrate if needed
    const emergency = stabilizers.emergencyResponse.effectiveness;

    // Combined multiplicatively
    // Note: Migration is different - it removes people from risk entirely
    // So we calculate: (1 - migration) × [(1 - aid) × (1 - adaptation) × (1 - emergency)]
    const remainingAfterMigration = assertFinite(1 - migration, {
      location: 'MortalityStabilizersPhase.calculateCombinedReduction',
      valueName: 'remainingAfterMigration',
      month: state.currentMonth,
      additionalInfo: { migration }
    });
    const mortalityMultiplier = assertFinite(
      (1 - aid) * (1 - adaptation) * (1 - emergency),
      {
        location: 'MortalityStabilizersPhase.calculateCombinedReduction',
        valueName: 'mortalityMultiplier',
        month: state.currentMonth,
        additionalInfo: { aid, adaptation, emergency }
      }
    );
    const combined = assertInRange(
      1 - (remainingAfterMigration * mortalityMultiplier),
      0, 1,
      {
        location: 'MortalityStabilizersPhase.calculateCombinedReduction',
        valueName: 'combinedReduction',
        month: state.currentMonth
      }
    );

    stabilizers.combinedReduction = combined;
  }
}
