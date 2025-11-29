/**
 * Food Security Degradation Phase
 *
 * Phase 1B Refinement (Oct 17, 2025): Apply monthly food security degradation during crises
 *
 * Degradation applies when environmental/resource crises are active, NOT just during cascades.
 * This ensures famines can trigger even if planetary boundary cascades haven't started yet.
 *
 * Research basis:
 * - Historical food crises show 5-15% monthly decline in food availability
 * - Multiple simultaneous crises have compounding effects
 * - Infrastructure breakdown accelerates food system collapse
 *
 * Order: 19.7 (AFTER QoL base calculation, BEFORE population mortality)
 * FIX (Oct 25, 2025): Runs after QoL calculates food, then degrades it for mortality calc
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import {
  assertFinite,
  assertProbability,
  assertInRange,
  assertStateProperty
} from '@/simulation/utils/assertions';
import { isHistoricalModeActive } from '@/simulation/utils/historicalMode';
import { getGDPProxy } from '@/simulation/utils/recoveryCalculations';
// REMOVED (Nov 20, 2025): updateNitrogenFoodCoupling import
// This phase no longer calls it directly - reads cached values from state instead

export class FoodSecurityDegradationPhase implements SimulationPhase {
  readonly id = 'food-security-degradation';
  readonly name = 'Food Security Degradation';
  readonly order = 19.7;  // AFTER QualityOfLifePhase (19.5), BEFORE population (20.5)

  // DEPENDENCIES (Nov 6, 2025): Requires quality of life baseline calculation
  // UPDATED (Nov 20, 2025): Added nitrogen-food-coupling dependency (RACE CONDITION FIX)
  //   - nitrogen-food-coupling MUST run before this phase
  //   - This phase READS nitrogen values from state (single-writer pattern)
  readonly dependencies = [
    'quality-of-life',          // Order 19.5: Food baseline calculated
    'extreme-weather-events',   // Order 15.2: Weather disrupts food production
    'nitrogen-food-coupling',   // Order 19.6: CRITICAL - Nitrogen values must be calculated BEFORE this phase reads them
  ];

  // ============================================================================
  // FAMINE DAMPENING FACTORS (Nov 28, 2025)
  // ============================================================================
  // Research: Historical famine mortality curves show 1-4 year timescales, NOT months
  // Prevents overly aggressive population crashes that don't account for adaptation
  // ============================================================================

  /**
   * Food Security Floor (15% minimum)
   *
   * Even in worst-case scenarios, emergency rationing provides baseline food security.
   *
   * Research:
   * - WWII rationing: UK maintained 90%+ caloric intake despite shipping blockade
   * - Siege economies: Leningrad (1941-44) maintained ~15% pre-war food supply
   * - Modern food aid: UN WFP emergency rations = 2,100 kcal/person/day baseline
   *
   * Historical precedent: Total food system collapse (0% security) requires
   * societal breakdown beyond even nuclear winter scenarios. Emergency measures
   * (rationing, stockpiles, aid) prevent complete failure.
   *
   * Source: FAO Emergency Food Security Assessment Handbook (2022)
   */
  private static readonly FOOD_SECURITY_FLOOR = 0.15;

  /**
   * International Aid Dampening (15% reduction when GDP > $100T)
   *
   * When global economy is functioning, food can be redistributed internationally.
   *
   * Research:
   * - FAO World Food Programme: Redistributes 15B rations/year ($9B budget)
   * - Historical capacity: 10-15% of regional food deficits addressed by aid
   * - Scalability: With functional economy (GDP > $100T), logistics enable transfer
   *
   * Mechanism: When global GDP > $100T, international aid reduces food security
   * loss by 15% through redistribution from surplus regions to deficit regions.
   * Scales linearly below $100T (50% GDP → 7.5% dampening).
   *
   * Source: FAO State of Food Security and Nutrition (2024)
   */
  private static readonly AID_DAMPENING_MAX = 0.15;
  private static readonly AID_DAMPENING_GDP_THRESHOLD = 100; // Trillions USD

  /**
   * Adaptation Recovery (0.5% monthly when climate stabilizes)
   *
   * When climate stress is not worsening, food security can slowly recover.
   *
   * Research:
   * - Hultgren & Hsiang (2025): 33% adaptation offset to climate yield losses
   * - Agricultural adaptation rates: 2-5 years for crop substitution, infrastructure
   * - Recovery timeline: 0.5%/month = 6%/year = 50% recovery in ~8 years
   *
   * Mechanism: When active crises are stable (not increasing), agricultural
   * adaptation enables gradual food security improvement through:
   * - Crop substitution (drought-resistant varieties)
   * - Infrastructure repair (irrigation, storage)
   * - Technology deployment (precision agriculture)
   *
   * Only applies when crisis count is stable or declining (adaptation possible).
   *
   * Source: Hultgren & Hsiang, "Adaptation Reduces Climate Damages Substantially
   *         but Fails to Prevent Productivity Loss" (2025)
   */
  private static readonly ADAPTATION_RECOVERY_RATE = 0.005; // 0.5% monthly

  execute(state: GameState, _rng: RNGFunction): PhaseResult {
    // FIX (Oct 25, 2025 REGIONALIZATION): Food security is now REGIONAL
    setDeterministicRng(_rng);
    // Apply crisis degradation to EACH REGION, not global
    // Vulnerable regions degrade faster than resilient ones

    // Check if regional populations exist
    const pop = state.humanPopulationSystem;
    if (!pop.regionalPopulations || pop.regionalPopulations.length === 0) {
      return { events: [] };
    }

    // Calculate global GDP for international aid dampening
    // getGDPProxy returns GDP in trillions USD (e.g., 114.0 = $114T)
    const globalGDP = getGDPProxy(state);
    const aidDampeningFactor = Math.min(
      FoodSecurityDegradationPhase.AID_DAMPENING_MAX,
      (globalGDP / FoodSecurityDegradationPhase.AID_DAMPENING_GDP_THRESHOLD) *
        FoodSecurityDegradationPhase.AID_DAMPENING_MAX
    );

    // Validate GDP and aid dampening
    assertFinite(globalGDP, {
      location: 'FoodSecurityDegradationPhase.execute',
      valueName: 'globalGDP',
      month: state.currentMonth,
      additionalInfo: { unit: 'trillions USD' }
    });

    assertProbability(aidDampeningFactor, {
      location: 'FoodSecurityDegradationPhase.execute',
      valueName: 'aidDampeningFactor',
      month: state.currentMonth,
      additionalInfo: { globalGDP, threshold: FoodSecurityDegradationPhase.AID_DAMPENING_GDP_THRESHOLD }
    });

    // ============================================================================
    // HINDCAST MODE GUARD (Nov 24, 2025)
    // ============================================================================
    // In historical mode (1990-2020), food security was STABLE or IMPROVING.
    // This degradation phase models future AI-era stress that didn't exist then.
    // Skip degradation to allow hindcast validation against actual history.
    // Source: FAO State of Food Insecurity reports (1999-2015) show stable/improving trends
    // HIGH-7 FIX (Nov 27, 2025): Use historicalMode flag for hindcast calibration
    // HIGH-2 FIX (Nov 28, 2025): Use isHistoricalModeActive() + correct year (2024 not 2020)
    // ============================================================================
    if (isHistoricalModeActive(state)) {
      // Don't degrade food security in historical mode - it was actually stable
      return { events: [] };
    }

    // === RACE CONDITION FIX (Nov 20, 2025) ===
    // REMOVED: Duplicate call to updateNitrogenFoodCoupling()
    // NitrogenFoodCouplingPhase (order 19.6) already called it and stored results in state
    // This phase (order 19.7) now READS the cached values from regionalNitrogenManagement
    // Research: Science Advances (2024), Zhang et al. (2021)
    //
    // SYNCHRONIZATION STRATEGY: Single-writer pattern
    // - NitrogenFoodCouplingPhase is the ONLY phase that calls updateNitrogenFoodCoupling()
    // - All other phases READ from state.planetaryBoundariesSystem.regionalNitrogenManagement
    // - This ensures deterministic state mutations (critical for Monte Carlo reproducibility)
    //
    // Previously: This phase was calling updateNitrogenFoodCoupling() a second time, causing:
    // 1. Non-deterministic state mutations (which phase "wins"?)
    // 2. Wasted computation (calculating same values twice)
    // 3. Potential for divergent values if RNG is used differently

    // Validate required systems (use assertions for cleaner error messages)
    const phosphorusReserves = assertStateProperty(state.phosphorusSystem, 'reserves', {
      location: 'FoodSecurityDegradationPhase.execute',
      month: state.currentMonth,
      expectedSource: 'initialization.ts - phosphorusSystem.reserves'
    });

    const groundwaterLevel = assertStateProperty(state.freshwaterSystem, 'blueWater.groundwater', {
      location: 'FoodSecurityDegradationPhase.execute',
      month: state.currentMonth,
      expectedSource: 'initialization.ts - freshwaterSystem.blueWater.groundwater'
    });

    const biodiversityIndex = assertStateProperty(state.biodiversitySystem, 'globalBiodiversityIndex', {
      location: 'FoodSecurityDegradationPhase.execute',
      month: state.currentMonth,
      expectedSource: 'initialization.ts - biodiversitySystem.globalBiodiversityIndex'
    });

    // Apply degradation to each region
    for (const region of pop.regionalPopulations) {
      // Count active crises, weighted by regional vulnerability
      const climateWeight = assertProbability(region.climateVulnerability, {
        location: 'FoodSecurityDegradationPhase.execute',
        valueName: `${region.name}.climateVulnerability`,
        month: state.currentMonth
      });

      const resourceWeight = assertProbability(region.resourceVulnerability, {
        location: 'FoodSecurityDegradationPhase.execute',
        valueName: `${region.name}.resourceVulnerability`,
        month: state.currentMonth
      });

      const activeCrises = assertFinite([
        phosphorusReserves < 0.3 ? resourceWeight : 0,  // Resource-dependent regions hit harder
        groundwaterLevel < 0.3 ? climateWeight : 0,  // Climate-vulnerable regions hit harder
        biodiversityIndex < 0.3 ? climateWeight : 0,  // Ecosystem-dependent regions hit harder
        (state.environmentalAccumulation?.climateCrisisActive || state.environmentalAccumulation?.ecosystemCrisisActive) ? climateWeight : 0,
        state.planetaryBoundariesSystem?.cascadeActive ? 1.0 : 0,  // Cascades affect all regions
      ].reduce((sum, c) => sum + c, 0), {
        location: 'FoodSecurityDegradationPhase.execute',
        valueName: `${region.name}.activeCrises`,
        month: state.currentMonth
      });

      // BUG FIX (Oct 30, 2025): BLOCKER-3 - Reduce food security degradation rate
      // ROOT CAUSE: 1% baseline × 1.5^5 = 7.6% monthly with 5 crises, capped at 15%
      //   Combined with ClimateImpactCascadePhase (-5 to -8% shocks), food → 0 in months
      // RESEARCH: Historical famines show slower degradation (months to years, not weeks)
      //   - Irish Famine (1845-49): 4 years of gradual food decline
      //   - Holodomor (1932-33): 1 year of severe degradation
      // FIX: Reduce baseline to 0.5%, cap at 5% (3× reduction)

      // Regional degradation rate (baseline 0.5% per month, DOWN from 1%)
      let degradationRate = 0.005;

      // Each crisis level increases degradation by 30% (DOWN from 50%)
      // With 5 crises: 1.3^5 = 3.71× → 1.86% monthly (was 7.6%)
      if (activeCrises > 0) {
        degradationRate *= Math.pow(1.3, activeCrises);
      }

      // HIGH #8 FIX (Oct 29, 2025): Integrate nuclear winter crop yield effects
      // Nuclear winter reduces crops through cropYieldMultiplier (0-1 range)
      // During peak winter: cropYieldMultiplier can drop to 0.05-0.20 (5-20% yield)
      // During recovery (>24 months): gradually improves back to 1.0
      if (state.nuclearWinterState?.active) {
        const cropYield = assertProbability(state.nuclearWinterState.cropYieldMultiplier, {
          location: 'FoodSecurityDegradationPhase.execute',
          valueName: 'nuclearWinterState.cropYieldMultiplier',
          month: state.currentMonth
        });

        const monthsSinceWar = assertFinite(state.nuclearWinterState.monthsSinceWar, {
          location: 'FoodSecurityDegradationPhase.execute',
          valueName: 'nuclearWinterState.monthsSinceWar',
          month: state.currentMonth
        });

        // During active nuclear winter (first 24 months): apply severe degradation
        if (monthsSinceWar <= 24) {
          // Crop failure drives additional degradation (REDUCED from 15% to 5% max)
          // At 10% crop yield (0.10), add 4.5% degradation rate (was 13.5%)
          const nuclearWinterDegradation = (1 - cropYield) * 0.05; // Max 5% additional (was 15%)
          degradationRate += nuclearWinterDegradation;

        // During recovery phase (>24 months): enable gradual food security recovery
        } else {
          // As crops recover, allow food security to rebuild
          // Recovery rate = f(crop yield improvement)
          // Research: Takes 2-5 years to rebuild food systems after catastrophe
          const recoveryPotential = Math.max(0, cropYield - 0.5); // Only recover above 50% crop yield
          if (recoveryPotential > 0 && region.foodSecurity < 0.8) {
            // Gradual recovery: +2% per month max (24 months to recover from 30% → 80%)
            const recoveryRate = recoveryPotential * 0.04; // 50% recovery potential → 2% monthly
            region.foodSecurity = Math.min(0.8, region.foodSecurity * (1 + recoveryRate));

            // Log recovery progress annually
            if (state.currentMonth % 12 === 0) {
              console.log(`  [${region.name}] Nuclear winter recovery: Food ${(region.foodSecurity * 100).toFixed(1)}% (+${(recoveryRate * 100).toFixed(1)}%/mo), Crop yield: ${(cropYield * 100).toFixed(0)}%`);
            }
          }
        }
      }

      // Cap at 5% per month (DOWN from 15%)
      const degradationRateCapped = assertInRange(Math.min(0.05, degradationRate), 0, 0.05, {
        location: 'FoodSecurityDegradationPhase.execute',
        valueName: `${region.name}.degradationRate`,
        month: state.currentMonth
      });

      // Apply degradation to regional food security
      let currentFood = assertProbability(region.foodSecurity, {
        location: 'FoodSecurityDegradationPhase.execute',
        valueName: `${region.name}.foodSecurity (before)`,
        month: state.currentMonth
      });

      // === TIER 2 HIGH: NITROGEN-FOOD COUPLING (Nov 15, 2025) ===
      // Research: Science Advances (2024), Zhang et al. (2021)
      // Regional nitrogen reduction creates yield penalties (nonlinear, region-specific)
      // Expected impact: Realistic biogeochemical boundary trade-offs
      // Applied BEFORE crisis degradation (nitrogen affects baseline food production)
      if (state.planetaryBoundariesSystem?.regionalNitrogenManagement) {
        // Find matching regional nitrogen data
        const regionMapping: Record<string, string> = {
          'South Asia': 'southAsia',
          'East Asia': 'eastAsia',
          'North America': 'northAmerica',
          'Europe': 'europe',
          'Latin America': 'latinAmerica',
          'Sub-Saharan Africa': 'subSaharanAfrica'
        };

        const nitrogenRegionKey = regionMapping[region.name];
        if (nitrogenRegionKey) {
          // No index - domain-specific search (regional nitrogen data)
          const nitrogenData = state.planetaryBoundariesSystem.regionalNitrogenManagement.find(
            r => r.region === nitrogenRegionKey
          );

          if (nitrogenData) {
            // Apply food production index from nitrogen coupling
            // foodProductionIndex ranges from 0 (total failure) to 1.0 (baseline) to 2.0 (improved)
            const foodProductionIndex = assertProbability(Math.min(nitrogenData.foodProductionIndex, 2.0), {
              location: 'FoodSecurityDegradationPhase.execute',
              valueName: `${region.name}.nitrogenFoodProductionIndex`,
              month: state.currentMonth
            });

            // Apply food production penalty/bonus to regional food security
            // If index < 1.0: penalty (nitrogen reduction hurts crops)
            // If index > 1.0: bonus (optimized nitrogen IMPROVES crops - Zhang et al. overuse reduction case)
            currentFood *= foodProductionIndex;

            // Log nitrogen effects annually
            if (state.currentMonth % 12 === 0 && Math.abs(foodProductionIndex - 1.0) > 0.05) {
              console.log(`  [${region.name}] 🌾 Nitrogen coupling: Food production index ${foodProductionIndex.toFixed(3)}, Yield impact: ${(nitrogenData.yieldImpact * 100).toFixed(1)}%`);
            }
          }
        }
      }

      // Apply degradation to food security (after nitrogen penalty)
      let newFood = assertProbability(Math.max(0, currentFood * (1 - degradationRateCapped)), {
        location: 'FoodSecurityDegradationPhase.execute',
        valueName: `${region.name}.foodSecurity (after degradation)`,
        month: state.currentMonth
      });

      // NOTE (Roy, Nov 18, 2025): Duplicate nitrogen penalty removed
      // BUG FIX: Was applying nitrogen penalty TWICE (before + after degradation) = squared penalty
      // Now applies ONCE (before degradation only, lines 194-236)
      // Example: 20% penalty was being applied as 0.8² = 64% (36% total loss instead of 20%)

      // ============================================================================
      // DAMPENING FACTORS (Nov 28, 2025)
      // ============================================================================
      // Apply three research-backed dampening factors to prevent overly aggressive crashes
      // ============================================================================

      // 1. INTERNATIONAL AID DAMPENING
      // When global economy is functioning (GDP > $100T), reduce food security loss by up to 15%
      // Mechanism: International redistribution from surplus to deficit regions
      if (aidDampeningFactor > 0 && degradationRateCapped > 0) {
        const lossBeforeAid = currentFood - newFood; // How much food security was lost
        const aidReduction = lossBeforeAid * aidDampeningFactor; // Aid prevents some loss
        newFood = Math.min(currentFood, newFood + aidReduction); // Add aid back

        // Validate aid-adjusted food security
        newFood = assertProbability(newFood, {
          location: 'FoodSecurityDegradationPhase.execute',
          valueName: `${region.name}.foodSecurity (after aid dampening)`,
          month: state.currentMonth,
          additionalInfo: {
            lossBeforeAid,
            aidReduction,
            aidDampeningFactor
          }
        });
      }

      // 2. ADAPTATION RECOVERY
      // When crisis count is stable/declining, agricultural adaptation enables gradual recovery
      // 0.5% monthly recovery rate (6%/year → 50% recovery in ~8 years)
      const previousCrisisCount = (region as any).previousActiveCrises ?? activeCrises;
      const crisisStable = activeCrises <= previousCrisisCount; // Not worsening

      if (crisisStable && newFood < 0.8) {
        // Only recover if below 80% (diminishing returns above that)
        const recoveryAmount = newFood * FoodSecurityDegradationPhase.ADAPTATION_RECOVERY_RATE;
        newFood = Math.min(0.8, newFood + recoveryAmount);

        // Validate recovery-adjusted food security
        newFood = assertProbability(newFood, {
          location: 'FoodSecurityDegradationPhase.execute',
          valueName: `${region.name}.foodSecurity (after adaptation recovery)`,
          month: state.currentMonth,
          additionalInfo: {
            recoveryAmount,
            crisisStable,
            activeCrises,
            previousCrisisCount
          }
        });
      }

      // Store crisis count for next month's comparison
      (region as any).previousActiveCrises = activeCrises;

      // 3. FOOD SECURITY FLOOR (15% minimum)
      // Even in worst-case scenarios, emergency rationing provides baseline
      // Applied LAST to ensure floor is always respected
      newFood = Math.max(FoodSecurityDegradationPhase.FOOD_SECURITY_FLOOR, newFood);

      // Final validation
      newFood = assertProbability(newFood, {
        location: 'FoodSecurityDegradationPhase.execute',
        valueName: `${region.name}.foodSecurity (final)`,
        month: state.currentMonth
      });

      // Validate floor is respected
      if (newFood < FoodSecurityDegradationPhase.FOOD_SECURITY_FLOOR - 0.001) {
        throw new Error(
          `❌ Food security floor violated in ${region.name}\n` +
          `   foodSecurity = ${newFood.toFixed(4)}\n` +
          `   FLOOR = ${FoodSecurityDegradationPhase.FOOD_SECURITY_FLOOR}\n` +
          `   Month: ${state.currentMonth}\n` +
          `   This should be impossible - floor applied at line 362.`
        );
      }

      region.foodSecurity = newFood;

      // DEBUG: Log for each region annually (include dampening factors)
      if (state.currentMonth % 12 === 0 && activeCrises > 0.5) {
        const atFloor = newFood <= FoodSecurityDegradationPhase.FOOD_SECURITY_FLOOR + 0.01;
        console.log(
          `  [${region.name}] Food: ${(currentFood * 100).toFixed(1)}% → ${(newFood * 100).toFixed(1)}% | ` +
          `Crises: ${activeCrises.toFixed(2)}, Rate: ${(degradationRate * 100).toFixed(2)}%/mo, ` +
          `Aid: ${(aidDampeningFactor * 100).toFixed(1)}%` +
          (crisisStable ? `, Adapting: +${(FoodSecurityDegradationPhase.ADAPTATION_RECOVERY_RATE * 100).toFixed(1)}%/mo` : '') +
          (atFloor ? ` [AT FLOOR]` : '')
        );
      }
    }

    // Recalculate global food security from regional (population-weighted average)
    const totalPop = assertFinite(
      pop.regionalPopulations.reduce((sum, r) => sum + r.population, 0),
      {
        location: 'FoodSecurityDegradationPhase.execute',
        valueName: 'totalPop',
        month: state.currentMonth
      }
    );

    if (totalPop > 0 && state.qualityOfLifeSystems?.survivalFundamentals) {
      const globalFoodSec = assertProbability(
        pop.regionalPopulations.reduce((sum, r) => sum + (r.foodSecurity * r.population), 0) / totalPop,
        {
          location: 'FoodSecurityDegradationPhase.execute',
          valueName: 'globalFoodSec',
          month: state.currentMonth
        }
      );

      state.qualityOfLifeSystems.survivalFundamentals.foodSecurity = globalFoodSec;

      // DEBUG: Log global aggregate annually
      if (state.currentMonth % 12 === 0) {
        console.log(`[Phase ${this.order}] ${this.name}: Global food security = ${(globalFoodSec * 100).toFixed(1)}% (pop-weighted avg of regional)`);
      }
    }

    return { events: [] };
  }
}
