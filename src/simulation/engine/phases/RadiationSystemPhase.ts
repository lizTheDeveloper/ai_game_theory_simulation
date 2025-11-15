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

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { updateRadiationSystem } from '@/types/radiation';
import { addMortalityRisk } from '@/simulation/bayesianMortality';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import {
  assertFinite,
  assertInRange,
  assertProbability,
} from '@/simulation/utils/assertions';

export class RadiationSystemPhase implements SimulationPhase {
  readonly id = 'radiation_system';
  readonly name = 'Radiation Health Effects';
  readonly order = 252.5;
  readonly dependencies = ['nuclear_winter'];

  execute(state: GameState, _rng: RNGFunction): PhaseResult {
    const system = state.radiationSystem;
    setDeterministicRng(_rng);

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

    // Apply radiation deaths via centralized mortality system
    if (deaths > 0) {
      // Calculate monthly mortality rate (deaths is already in millions)
      const mortalityRate = assertFinite(
        assertFinite(deaths, {
          location: 'RadiationSystemPhase:radiationDeaths',
          valueName: 'deaths',
          month: state.currentMonth,
          additionalInfo: { activeExposures: system.activeExposures.length }
        }) / assertFinite(state.humanPopulationSystem.population, {
          location: 'RadiationSystemPhase:radiationDeaths',
          valueName: 'population',
          month: state.currentMonth,
        }),
        {
          location: 'RadiationSystemPhase:radiationDeaths',
          valueName: 'mortalityRate',
          month: state.currentMonth,
          additionalInfo: { deaths, population: state.humanPopulationSystem.population }
        }
      );

      addMortalityRisk(state.humanPopulationSystem, {
        type: 'disease', // Radiation sickness & cancer classified as disease
        baseRisk: mortalityRate,
        proximate: 'war', // Radiation is consequence of nuclear war
        root: 'conflict', // Nuclear war = geopolitical conflict
        confidence: 'HIGH', // Well-documented from Hiroshima, Chernobyl
        scope: 'SEMI-GLOBAL', // Radiation zones are regional but widespread
        month: state.currentMonth,
        description: 'Radiation exposure deaths',
      });

      // Log significant deaths
      if (deaths > 0.001) { // > 1K deaths/month
        console.log(`☢️ Radiation deaths this month: ${deaths.toFixed(1)}M`);
        console.log(`   Total radiation deaths: ${system.totalRadiationDeaths.toFixed(0)}M`);
        console.log(`   Active exposures: ${system.activeExposures.length}`);
      }
    }

    // Track birth defects (reduce birth rate or increase infant mortality)
    if (birthDefects > 0) {
      // Birth defects reduce effective birth rate by reducing infant survival
      const birthDefectMortality = assertFinite(
        assertFinite(birthDefects, {
          location: 'RadiationSystemPhase:birthDefects',
          valueName: 'birthDefects',
          month: state.currentMonth,
          additionalInfo: { activeExposures: system.activeExposures.length }
        }) * 0.3,
        {
          location: 'RadiationSystemPhase:birthDefects',
          valueName: 'birthDefectMortality',
          month: state.currentMonth,
          additionalInfo: { birthDefects }
        }
      ); // 30% of birth defects are fatal

      // Apply birth defect mortality via centralized system
      if (birthDefectMortality > 0) {
        const mortalityRate = assertFinite(
          birthDefectMortality / assertFinite(state.humanPopulationSystem.population, {
            location: 'RadiationSystemPhase:birthDefects',
            valueName: 'population',
            month: state.currentMonth,
          }),
          {
            location: 'RadiationSystemPhase:birthDefects',
            valueName: 'mortalityRate',
            month: state.currentMonth,
            additionalInfo: { birthDefectMortality, population: state.humanPopulationSystem.population }
          }
        );

        addMortalityRisk(state.humanPopulationSystem, {
          type: 'disease', // Genetic defects classified as disease
          baseRisk: mortalityRate,
          proximate: 'disease', // Infant mortality from birth defects
          root: 'conflict', // Caused by nuclear war = geopolitical conflict
          confidence: 'MEDIUM', // Multi-generational effects have more uncertainty
          scope: 'REGIONAL', // Birth defects localized to contaminated zones
          month: state.currentMonth,
          description: 'Radiation-induced birth defects',
        });
      }

      // Track non-fatal birth defects for QoL impact
      const survivingWithDefects = assertFinite(
        birthDefects * 0.7,
        {
          location: 'RadiationSystemPhase:birthDefects',
          valueName: 'survivingWithDefects',
          month: state.currentMonth,
          additionalInfo: { birthDefects }
        }
      ); // 70% survive but with defects
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

  const avgContamination = assertFinite(
    assertFinite(totalContamination, {
      location: 'applyContaminationToFoodSecurity',
      valueName: 'totalContamination',
      month: state.currentMonth,
      additionalInfo: { contaminatedCount }
    }) / contaminatedCount,
    {
      location: 'applyContaminationToFoodSecurity',
      valueName: 'avgContamination',
      month: state.currentMonth,
      additionalInfo: { totalContamination, contaminatedCount }
    }
  );

  // Food security penalty based on contaminated farmland
  // Assume contaminated regions represent 10-30% of global farmland
  const contaminatedFarmlandFraction = assertFinite(
    system.contaminatedRegions.size * 0.10,
    {
      location: 'applyContaminationToFoodSecurity',
      valueName: 'contaminatedFarmlandFraction',
      month: state.currentMonth,
      additionalInfo: { contaminatedRegionsSize: system.contaminatedRegions.size }
    }
  ); // 10% per region

  // Agriculture impossible when contamination > 20%
  // Gradual recovery as contamination decays
  const agriculturePenalty = assertFinite(
    contaminatedFarmlandFraction * Math.min(1.0, avgContamination / 0.2),
    {
      location: 'applyContaminationToFoodSecurity',
      valueName: 'agriculturePenalty',
      month: state.currentMonth,
      additionalInfo: { contaminatedFarmlandFraction, avgContamination }
    }
  );

  // Apply to food security (if exists)
  if (state.qualityOfLifeSystems && state.qualityOfLifeSystems.survivalFundamentals) {
    state.qualityOfLifeSystems.survivalFundamentals.foodSecurity = Math.max(0,
      state.qualityOfLifeSystems.survivalFundamentals.foodSecurity * (1 - agriculturePenalty * 0.5)
    );
  }

  // Reduce resource economy food production (monthlyHarvest = production)
  if (state.resourceEconomy && state.resourceEconomy.food) {
    const productionPenalty = assertFinite(
      agriculturePenalty * 0.3,
      {
        location: 'applyContaminationToFoodSecurity',
        valueName: 'productionPenalty',
        month: state.currentMonth,
        additionalInfo: { agriculturePenalty }
      }
    ); // 30% production loss per contaminated region
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
  const population = assertFinite(state.humanPopulationSystem.population, {
    location: 'applyContaminationToQoL',
    valueName: 'population',
    month: state.currentMonth,
  });

  // Cancer deaths as fraction of population
  const cancerRate = assertFinite(
    assertFinite(system.totalCancerDeaths, {
      location: 'applyContaminationToQoL',
      valueName: 'totalCancerDeaths',
      month: state.currentMonth,
    }) / population,
    {
      location: 'applyContaminationToQoL',
      valueName: 'cancerRate',
      month: state.currentMonth,
      additionalInfo: { totalCancerDeaths: system.totalCancerDeaths, population }
    }
  );

  // Birth defects as fraction of births
  const birthRate = 0.01; // ~1% of population has children per year
  const annualBirths = assertFinite(
    population * birthRate,
    {
      location: 'applyContaminationToQoL',
      valueName: 'annualBirths',
      month: state.currentMonth,
      additionalInfo: { population, birthRate }
    }
  );
  const birthDefectRate = assertFinite(
    assertFinite(system.totalBirthDefects, {
      location: 'applyContaminationToQoL',
      valueName: 'totalBirthDefects',
      month: state.currentMonth,
    }) / (annualBirths * 10),
    {
      location: 'applyContaminationToQoL',
      valueName: 'birthDefectRate',
      month: state.currentMonth,
      additionalInfo: { totalBirthDefects: system.totalBirthDefects, annualBirths }
    }
  ); // Last 10 years of births

  // QoL penalties
  const healthcareBurden = assertFinite(
    Math.min(0.3, cancerRate * 100 + birthDefectRate * 50),
    {
      location: 'applyContaminationToQoL',
      valueName: 'healthcareBurden',
      month: state.currentMonth,
      additionalInfo: { cancerRate, birthDefectRate }
    }
  ); // Up to -30% QoL
  const psychologicalTrauma = assertFinite(
    Math.min(0.2, system.activeExposures.length * 0.05),
    {
      location: 'applyContaminationToQoL',
      valueName: 'psychologicalTrauma',
      month: state.currentMonth,
      additionalInfo: { activeExposuresCount: system.activeExposures.length }
    }
  ); // Up to -20% QoL

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
