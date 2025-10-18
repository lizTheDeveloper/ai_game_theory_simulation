/**
 * Radiation System Phase (TIER 1.7)
 *
 * Updates long-term radiation health effects from nuclear war:
 * - Acute radiation syndrome (months 1-2)
 * - Cancer deaths (years 5-40, peaks at year 25)
 * - Birth defects (3 generations, ~75 years)
 * - Environmental contamination decay
 * - Agricultural restrictions in contaminated zones
 *
 * Research: Hiroshima/Nagasaki (1945-present), Chernobyl (1986-present), Fukushima (2011-present)
 *
 * Order: 252.5 (after NuclearWinterPhase 252)
 */

import { SimulationPhase, PhaseResult, RNGFunction } from '../PhaseOrchestrator';
import { GameState } from '@/types/game';
import { updateRadiationSystem } from '@/types/radiation';

export class RadiationSystemPhase implements SimulationPhase {
  readonly id = 'radiation_system';
  readonly name = 'Radiation Health Effects';
  readonly order = 252.5;

  execute(state: GameState, _rng: RNGFunction): PhaseResult {
    const system = state.radiationSystem;

    // Only run if there are active radiation exposures
    if (!system || system.activeExposures.length === 0) {
      return { events: [] };
    }

    // Update all active radiation exposures
    const { deaths, birthDefects } = updateRadiationSystem(
      system,
      state.currentMonth,
      state.humanPopulationSystem.population
    );

    // Apply radiation deaths to population
    if (deaths > 0) {
      state.humanPopulationSystem.population -= deaths;

      // MULTI-DIMENSIONAL TRACKING (Oct 18, 2025)
      // PROXIMATE: War (radiation is direct consequence of nuclear war)
      state.humanPopulationSystem.deathsByCategory.war += deaths;
      // ROOT CAUSE: Conflict (nuclear war stems from geopolitical conflict)
      state.humanPopulationSystem.deathsByRootCause.conflict += deaths;

      state.humanPopulationSystem.cumulativeCrisisDeaths += deaths;
      state.humanPopulationSystem.monthlyExcessDeaths += deaths;

      // Log significant deaths
      if (deaths > 0.001) { // > 1 million deaths/month
        console.log(`☢️ Radiation deaths this month: ${(deaths * 1000).toFixed(1)}M`);
        console.log(`   Total radiation deaths: ${(system.totalRadiationDeaths * 1000).toFixed(0)}M`);
        console.log(`   Active exposures: ${system.activeExposures.length}`);
      }
    }

    // Track birth defects (reduce birth rate or increase infant mortality)
    if (birthDefects > 0) {
      // Birth defects reduce effective birth rate by reducing infant survival
      // Convert birth defects to mortality (billions)
      const birthDefectMortality = birthDefects * 0.3; // 30% of birth defects are fatal
      state.humanPopulationSystem.population -= birthDefectMortality;

      // MULTI-DIMENSIONAL TRACKING (Oct 18, 2025)
      // PROXIMATE: Other (indirect deaths from radiation)
      state.humanPopulationSystem.deathsByCategory.other += birthDefectMortality;
      // ROOT CAUSE: Conflict (birth defects caused by nuclear war)
      state.humanPopulationSystem.deathsByRootCause.conflict += birthDefectMortality;

      // Track non-fatal birth defects for QoL impact
      const survivingWithDefects = birthDefects * 0.7; // 70% survive but with defects
      if (!state.humanPopulationSystem.birthDefectsCount) {
        state.humanPopulationSystem.birthDefectsCount = 0;
      }
      state.humanPopulationSystem.birthDefectsCount += survivingWithDefects;
    }

    // Apply contamination effects to food security
    applyContaminationToFoodSecurity(state);

    // Apply contamination effects to quality of life
    applyContaminationToQoL(state);

    return { events: [] };
  }
}

/**
 * Apply radiation contamination to food security
 * Contaminated regions cannot farm, reducing global food production
 */
function applyContaminationToFoodSecurity(state: GameState): void {
  const system = state.radiationSystem;

  if (system.contaminatedRegions.size === 0) return;

  // Calculate average contamination level across contaminated regions
  let totalContamination = 0;
  let contaminatedCount = 0;

  for (const exposure of system.activeExposures) {
    if (exposure.contamination.currentContaminationLevel > 0.1) {
      totalContamination += exposure.contamination.currentContaminationLevel;
      contaminatedCount++;
    }
  }

  if (contaminatedCount === 0) return;

  const avgContamination = totalContamination / contaminatedCount;

  // Food security penalty based on contaminated farmland
  // Assume contaminated regions represent 10-30% of global farmland
  const contaminatedFarmlandFraction = system.contaminatedRegions.size * 0.10; // 10% per region

  // Agriculture impossible when contamination > 20%
  // Gradual recovery as contamination decays
  const agriculturePenalty = contaminatedFarmlandFraction * Math.min(1.0, avgContamination / 0.2);

  // Apply to food security (if exists)
  if (state.qualityOfLifeSystems && state.qualityOfLifeSystems.survivalFundamentals) {
    state.qualityOfLifeSystems.survivalFundamentals.foodSecurity = Math.max(0,
      state.qualityOfLifeSystems.survivalFundamentals.foodSecurity * (1 - agriculturePenalty * 0.5)
    );
  }

  // Reduce resource economy food production (monthlyHarvest = production)
  if (state.resourceEconomy && state.resourceEconomy.food) {
    const productionPenalty = agriculturePenalty * 0.3; // 30% production loss per contaminated region
    state.resourceEconomy.food.monthlyHarvest = Math.max(0,
      state.resourceEconomy.food.monthlyHarvest * (1 - productionPenalty)
    );
  }
}

/**
 * Apply radiation effects to quality of life
 * Cancer epidemic and birth defects reduce population wellbeing
 */
function applyContaminationToQoL(state: GameState): void {
  const system = state.radiationSystem;

  if (system.totalRadiationDeaths === 0 && system.totalBirthDefects === 0) return;

  // Calculate QoL impact from ongoing health crisis
  const population = state.humanPopulationSystem.population;

  // Cancer deaths as fraction of population
  const cancerRate = system.totalCancerDeaths / population;

  // Birth defects as fraction of births
  const birthRate = 0.01; // ~1% of population has children per year
  const annualBirths = population * birthRate;
  const birthDefectRate = system.totalBirthDefects / (annualBirths * 10); // Last 10 years of births

  // QoL penalties
  const healthcareBurden = Math.min(0.3, cancerRate * 100 + birthDefectRate * 50); // Up to -30% QoL
  const psychologicalTrauma = Math.min(0.2, system.activeExposures.length * 0.05); // Up to -20% QoL

  // Apply to global QoL (if exists)
  if (state.globalMetrics && state.globalMetrics.qualityOfLife) {
    state.globalMetrics.qualityOfLife = Math.max(0,
      state.globalMetrics.qualityOfLife * (1 - healthcareBurden - psychologicalTrauma)
    );
  }

  // Reduce healthcare quality due to cancer epidemic
  if (state.qualityOfLifeSystems && state.qualityOfLifeSystems.healthcareQuality !== undefined) {
    state.qualityOfLifeSystems.healthcareQuality = Math.max(0,
      state.qualityOfLifeSystems.healthcareQuality * (1 - healthcareBurden * 0.5)
    );
  }
}
