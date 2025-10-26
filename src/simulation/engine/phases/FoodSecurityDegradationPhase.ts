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

export class FoodSecurityDegradationPhase implements SimulationPhase {
  readonly id = 'food-security-degradation';
  readonly name = 'Food Security Degradation';
  readonly order = 19.7;  // AFTER QualityOfLifePhase (19.5), BEFORE population (20.5)

  execute(state: GameState, _rng: RNGFunction): PhaseResult {
    // FIX (Oct 25, 2025 REGIONALIZATION): Food security is now REGIONAL
    // Apply crisis degradation to EACH REGION, not global
    // Vulnerable regions degrade faster than resilient ones

    // Check if regional populations exist
    const pop = state.humanPopulationSystem;
    if (!pop.regionalPopulations || pop.regionalPopulations.length === 0) {
      return { events: [] };
    }

    // Validate required systems
    if (state.phosphorusSystem === undefined || state.phosphorusSystem.reserves === undefined) {
      throw new Error('❌ state.phosphorusSystem or state.phosphorusSystem.reserves is undefined in FoodSecurityDegradationPhase:45 - initialization bug');
    }
    if (state.freshwaterSystem === undefined || state.freshwaterSystem.blueWater === undefined || state.freshwaterSystem.blueWater.groundwater === undefined) {
      throw new Error('❌ state.freshwaterSystem or state.freshwaterSystem.blueWater.groundwater is undefined in FoodSecurityDegradationPhase:46 - initialization bug');
    }
    if (state.biodiversitySystem === undefined || state.biodiversitySystem.globalBiodiversityIndex === undefined) {
      throw new Error('❌ state.biodiversitySystem or state.biodiversitySystem.globalBiodiversityIndex is undefined in FoodSecurityDegradationPhase:47 - initialization bug');
    }

    // Apply degradation to each region
    for (const region of pop.regionalPopulations) {
      // Count active crises, weighted by regional vulnerability
      const climateWeight = region.climateVulnerability;
      const resourceWeight = region.resourceVulnerability;

      const activeCrises = [
        state.phosphorusSystem.reserves < 0.3 ? resourceWeight : 0,  // Resource-dependent regions hit harder
        state.freshwaterSystem.blueWater.groundwater < 0.3 ? climateWeight : 0,  // Climate-vulnerable regions hit harder
        state.biodiversitySystem.globalBiodiversityIndex < 0.3 ? climateWeight : 0,  // Ecosystem-dependent regions hit harder
        (state.environmentalAccumulation?.climateCrisisActive || state.environmentalAccumulation?.ecosystemCrisisActive) ? climateWeight : 0,
        state.planetaryBoundariesSystem?.cascadeActive ? 1.0 : 0,  // Cascades affect all regions
      ].reduce((sum, c) => sum + c, 0);

      // Regional degradation rate (baseline 1% per month)
      let degradationRate = 0.01;

      // Each crisis level increases degradation by 50% (compound effect)
      if (activeCrises > 0) {
        degradationRate *= Math.pow(1.5, activeCrises);
      }

      // Cap at 15% per month
      degradationRate = Math.min(0.15, degradationRate);

      // Apply degradation to regional food security
      const currentFood = region.foodSecurity;
      const newFood = Math.max(0, currentFood * (1 - degradationRate));
      region.foodSecurity = newFood;

      // DEBUG: Log for each region annually
      if (state.currentMonth % 12 === 0 && activeCrises > 0.5) {
        console.log(`  [${region.name}] Food: ${(currentFood * 100).toFixed(1)}% → ${(newFood * 100).toFixed(1)}% | Crises: ${activeCrises.toFixed(2)}, Rate: ${(degradationRate * 100).toFixed(2)}%/mo`);
      }
    }

    // Recalculate global food security from regional (population-weighted average)
    const totalPop = pop.regionalPopulations.reduce((sum, r) => sum + r.population, 0);
    if (totalPop > 0 && state.qualityOfLifeSystems?.survivalFundamentals) {
      const globalFoodSec = pop.regionalPopulations.reduce((sum, r) => sum + (r.foodSecurity * r.population), 0) / totalPop;
      state.qualityOfLifeSystems.survivalFundamentals.foodSecurity = globalFoodSec;

      // DEBUG: Log global aggregate annually
      if (state.currentMonth % 12 === 0) {
        console.log(`[Phase ${this.order}] ${this.name}: Global food security = ${(globalFoodSec * 100).toFixed(1)}% (pop-weighted avg of regional)`);
      }
    }

    return { events: [] };
  }
}
