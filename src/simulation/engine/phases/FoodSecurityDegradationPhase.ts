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
import { updateNitrogenFoodCoupling } from '@/simulation/nitrogenFoodCoupling';

export class FoodSecurityDegradationPhase implements SimulationPhase {
  readonly id = 'food-security-degradation';
  readonly name = 'Food Security Degradation';
  readonly order = 19.7;  // AFTER QualityOfLifePhase (19.5), BEFORE population (20.5)

  // DEPENDENCIES (Nov 6, 2025): Requires quality of life baseline calculation
  readonly dependencies = [
    'quality-of-life',          // Order 19.5: Food baseline calculated
    'extreme-weather-events',   // Order 15.2: Weather disrupts food production
  ];

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

    // TIER 2 HIGH (Nov 15, 2025): Apply nitrogen-food coupling BEFORE crisis degradation
    // Research: research/nitrogen_food_coupling_20251115.md
    // Nitrogen reduction from tech affects crop yields BEFORE crisis degradation compounds the problem
    const nitrogenReductionFromTech = state.globalMetrics?.nitrogenReductionTotal ?? 0;

    if (nitrogenReductionFromTech > 0.01 && state.planetaryBoundariesSystem?.regionalNitrogenManagement) {
      // Import nitrogen-food coupling module// Calculate food production multiplier from nitrogen reduction
      // This applies regional yield penalties based on overuse zones
      const deployedTechEffectiveness = [nitrogenReductionFromTech]; // Single aggregated effectiveness
      const globalFoodMultiplier = updateNitrogenFoodCoupling(state, deployedTechEffectiveness);

      // FIX (HIGH-10, Nov 16, 2025): Build O(1) lookup map for nitrogen regions
      // Previously: O(n²) nested loop with .find() for each region
      // Now: O(n) map construction + O(1) lookups
      const nitrogenRegionMap = new Map<string, typeof state.planetaryBoundariesSystem.regionalNitrogenManagement[0]>();
      for (const nitrogenRegion of state.planetaryBoundariesSystem.regionalNitrogenManagement) {
        nitrogenRegionMap.set(nitrogenRegion.region, nitrogenRegion);
      }

      // Apply food production multiplier to regional food security
      // This happens BEFORE crisis degradation, so crises compound on already-reduced food
      for (const region of pop.regionalPopulations) {
        // O(1) lookup instead of O(n) .find()
        const regionKey = region.name.toLowerCase().replace(/\s+/g, '');
        const nitrogenRegion = nitrogenRegionMap.get(regionKey);

        if (nitrogenRegion) {
          // Apply regional food production index (from nitrogen-food coupling)
          const regionalMultiplier = nitrogenRegion.foodProductionIndex;
          region.foodSecurity = assertProbability(
            Math.max(0, region.foodSecurity * regionalMultiplier),
            {
              location: 'FoodSecurityDegradationPhase.execute',
              valueName: `${region.name}.foodSecurity (nitrogen penalty)`,
              month: state.currentMonth
            }
          );

          // Log annually
          if (state.currentMonth % 12 === 0 && regionalMultiplier < 0.99) {
            console.log(`  [${region.name}] Nitrogen-food penalty: ${(regionalMultiplier * 100).toFixed(1)}% production (${(nitrogenReductionFromTech * 100).toFixed(1)}% N reduction)`);
          }
        }
      }
    }

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
      const currentFood = assertProbability(region.foodSecurity, {
        location: 'FoodSecurityDegradationPhase.execute',
        valueName: `${region.name}.foodSecurity (before)`,
        month: state.currentMonth
      });

      const newFood = assertProbability(Math.max(0, currentFood * (1 - degradationRateCapped)), {
        location: 'FoodSecurityDegradationPhase.execute',
        valueName: `${region.name}.foodSecurity (after)`,
        month: state.currentMonth
      });

      region.foodSecurity = newFood;

      // DEBUG: Log for each region annually
      if (state.currentMonth % 12 === 0 && activeCrises > 0.5) {
        console.log(`  [${region.name}] Food: ${(currentFood * 100).toFixed(1)}% → ${(newFood * 100).toFixed(1)}% | Crises: ${activeCrises.toFixed(2)}, Rate: ${(degradationRate * 100).toFixed(2)}%/mo`);
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
