/**
 * Nuclear Crisis Phase (CONSOLIDATED)
 *
 * Consolidates two nuclear war aftermath subsystems:
 * 1. Nuclear Winter (252) - Soot decay, temperature recovery, crop yield, starvation
 * 2. Radiation System (252.5) - Health effects, contamination, agricultural restrictions
 *
 * RATIONALE FOR CONSOLIDATION:
 * - Both model long-term effects of nuclear war
 * - Both update monthly decay/recovery processes
 * - Sequential execution order (252 → 252.5) preserved
 * - Tight coupling: radiation zones depend on nuclear winter state
 *
 * NOTE: NuclearCommandControlPhase (order 20) is NOT consolidated here.
 * It runs 232 phases earlier (after governance, before crisis detection).
 * Consolidating phases with 200+ step separation breaks execution flow.
 *
 * Research:
 * - Nuclear winter: Robock & Toon (2012), Coupe et al. (2019)
 * - Radiation: Hiroshima/Nagasaki (1945-present), Chernobyl (1986-present), Fukushima (2011-present)
 *
 * Order: 252 (after organization viability 251)
 *
 * Batch 4 Consolidation (Nov 9, 2025)
 */

import type { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { updateNuclearWinter } from '../../nuclearWinter';
import { updateRadiationSystem } from '@/types/radiation';
import { addMortalityRisk } from '@/simulation/bayesianMortality';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import {
  assertFinite,
  assertInRange,
  assertProbability,
} from '@/simulation/utils/assertions';

export class NuclearCrisisPhase implements SimulationPhase {
  readonly id = 'nuclear-crisis';
  readonly name = 'Nuclear Crisis';
  readonly order = 252;

  readonly dependencies = [
    'nuclear_command_control',  // Order 20: Nuclear safeguards state
  ];

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    setDeterministicRng(rng);

    // Execute subsystems in order
    this.executeNuclearWinter(state, rng);
    this.executeRadiationSystem(state, rng);

    return { events: [] };
  }

  // ============================================================================
  // SUBSYSTEM 1: NUCLEAR WINTER (Order 252)
  // ============================================================================

  private executeNuclearWinter(state: GameState, rng: RNGFunction): void {
    const winter = state.nuclearWinterState;

    // Validate state BEFORE update (if active)
    if (winter.active) {
      assertInRange(winter.currentSoot, 0, 150, {
        location: 'NuclearCrisisPhase.executeNuclearWinter (pre-update)',
        valueName: 'currentSoot',
        month: state.currentMonth
      });

      assertInRange(winter.temperatureAnomaly, -20, 0, {
        location: 'NuclearCrisisPhase.executeNuclearWinter (pre-update)',
        valueName: 'temperatureAnomaly',
        month: state.currentMonth
      });

      assertProbability(winter.cropYieldMultiplier, {
        location: 'NuclearCrisisPhase.executeNuclearWinter (pre-update)',
        valueName: 'cropYieldMultiplier',
        month: state.currentMonth
      });
    }

    // Update nuclear winter effects (if active)
    updateNuclearWinter(state);

    // Validate state AFTER update (if still active)
    if (winter.active) {
      assertInRange(winter.currentSoot, 0, 150, {
        location: 'NuclearCrisisPhase.executeNuclearWinter (post-update)',
        valueName: 'currentSoot',
        month: state.currentMonth
      });

      assertInRange(winter.temperatureAnomaly, -20, 0, {
        location: 'NuclearCrisisPhase.executeNuclearWinter (post-update)',
        valueName: 'temperatureAnomaly',
        month: state.currentMonth
      });

      assertProbability(winter.cropYieldMultiplier, {
        location: 'NuclearCrisisPhase.executeNuclearWinter (post-update)',
        valueName: 'cropYieldMultiplier',
        month: state.currentMonth
      });
    }
  }

  // ============================================================================
  // SUBSYSTEM 2: RADIATION SYSTEM (Order 252.5)
  // ============================================================================

  private executeRadiationSystem(state: GameState, rng: RNGFunction): void {
    const system = state.radiationSystem;

    // Only run if there are active radiation exposures
    if (!system || system.activeExposures.length === 0) {
      return;
    }

    // Update all active radiation exposures
    const { deaths, birthDefects } = updateRadiationSystem(
      system,
      state.currentMonth,
      state.humanPopulationSystem.population
    );

    // Apply radiation deaths via centralized mortality system
    if (deaths > 0) {
      const mortalityRate = assertFinite(
        assertFinite(deaths, {
          location: 'NuclearCrisisPhase.executeRadiationSystem:radiationDeaths',
          valueName: 'deaths',
          month: state.currentMonth,
          additionalInfo: { activeExposures: system.activeExposures.length }
        }) / assertFinite(state.humanPopulationSystem.population, {
          location: 'NuclearCrisisPhase.executeRadiationSystem:radiationDeaths',
          valueName: 'population',
          month: state.currentMonth,
        }),
        {
          location: 'NuclearCrisisPhase.executeRadiationSystem:radiationDeaths',
          valueName: 'mortalityRate',
          month: state.currentMonth,
          additionalInfo: { deaths, population: state.humanPopulationSystem.population }
        }
      );

      addMortalityRisk(state.humanPopulationSystem, {
        type: 'disease',
        baseRisk: mortalityRate,
        proximate: 'war',
        root: 'conflict',
        confidence: 'HIGH',
        scope: 'SEMI-GLOBAL',
        month: state.currentMonth,
        description: 'Radiation exposure deaths',
      });

      if (deaths > 0.001) {
        console.log(`☢️ Radiation deaths: ${deaths.toFixed(1)}M (${system.activeExposures.length} exposures)`);
        console.log(`   Total radiation deaths: ${system.totalRadiationDeaths.toFixed(0)}M`);
      }
    }

    // Track birth defects
    if (birthDefects > 0) {
      const birthDefectMortality = assertFinite(
        assertFinite(birthDefects, {
          location: 'NuclearCrisisPhase.executeRadiationSystem:birthDefects',
          valueName: 'birthDefects',
          month: state.currentMonth,
          additionalInfo: { activeExposures: system.activeExposures.length }
        }) * 0.3,
        {
          location: 'NuclearCrisisPhase.executeRadiationSystem:birthDefects',
          valueName: 'birthDefectMortality',
          month: state.currentMonth,
          additionalInfo: { birthDefects }
        }
      );

      if (birthDefectMortality > 0) {
        const mortalityRate = assertFinite(
          birthDefectMortality / assertFinite(state.humanPopulationSystem.population, {
            location: 'NuclearCrisisPhase.executeRadiationSystem:birthDefects',
            valueName: 'population',
            month: state.currentMonth,
          }),
          {
            location: 'NuclearCrisisPhase.executeRadiationSystem:birthDefects',
            valueName: 'mortalityRate',
            month: state.currentMonth,
            additionalInfo: { birthDefectMortality, population: state.humanPopulationSystem.population }
          }
        );

        addMortalityRisk(state.humanPopulationSystem, {
          type: 'disease',
          baseRisk: mortalityRate,
          proximate: 'disease',
          root: 'conflict',
          confidence: 'MEDIUM',
          scope: 'REGIONAL',
          month: state.currentMonth,
          description: 'Radiation-induced birth defects',
        });
      }

      // Track non-fatal birth defects
      const survivingWithDefects = assertFinite(
        birthDefects * 0.7,
        {
          location: 'NuclearCrisisPhase.executeRadiationSystem:birthDefects',
          valueName: 'survivingWithDefects',
          month: state.currentMonth,
          additionalInfo: { birthDefects }
        }
      );
      if (!state.humanPopulationSystem.birthDefectsCount) {
        state.humanPopulationSystem.birthDefectsCount = 0;
      }
      state.humanPopulationSystem.birthDefectsCount += survivingWithDefects;
    }

    // Apply contamination effects
    this.applyContaminationToFoodSecurity(state, system);
    this.applyContaminationToQoL(state, system);
  }

  private applyContaminationToFoodSecurity(state: GameState, system: typeof state.radiationSystem): void {
    if (system.contaminatedRegions.size === 0) return;

    // Calculate average contamination level
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
        location: 'NuclearCrisisPhase.applyContaminationToFoodSecurity',
        valueName: 'totalContamination',
        month: state.currentMonth,
        additionalInfo: { contaminatedCount }
      }) / contaminatedCount,
      {
        location: 'NuclearCrisisPhase.applyContaminationToFoodSecurity',
        valueName: 'avgContamination',
        month: state.currentMonth,
        additionalInfo: { totalContamination, contaminatedCount }
      }
    );

    // Food security penalty based on contaminated farmland
    const contaminatedFarmlandFraction = assertFinite(
      system.contaminatedRegions.size * 0.10,
      {
        location: 'NuclearCrisisPhase.applyContaminationToFoodSecurity',
        valueName: 'contaminatedFarmlandFraction',
        month: state.currentMonth,
        additionalInfo: { contaminatedRegionsSize: system.contaminatedRegions.size }
      }
    );

    const agriculturePenalty = assertFinite(
      contaminatedFarmlandFraction * Math.min(1.0, avgContamination / 0.2),
      {
        location: 'NuclearCrisisPhase.applyContaminationToFoodSecurity',
        valueName: 'agriculturePenalty',
        month: state.currentMonth,
        additionalInfo: { contaminatedFarmlandFraction, avgContamination }
      }
    );

    // Apply to food security
    if (state.qualityOfLifeSystems?.survivalFundamentals) {
      state.qualityOfLifeSystems.survivalFundamentals.foodSecurity = Math.max(0,
        state.qualityOfLifeSystems.survivalFundamentals.foodSecurity * (1 - agriculturePenalty * 0.5)
      );
    }

    // Reduce food production
    if (state.resourceEconomy?.food) {
      const productionPenalty = assertFinite(
        agriculturePenalty * 0.3,
        {
          location: 'NuclearCrisisPhase.applyContaminationToFoodSecurity',
          valueName: 'productionPenalty',
          month: state.currentMonth,
          additionalInfo: { agriculturePenalty }
        }
      );
      state.resourceEconomy.food.monthlyHarvest = Math.max(0,
        state.resourceEconomy.food.monthlyHarvest * (1 - productionPenalty)
      );
    }
  }

  private applyContaminationToQoL(state: GameState, system: typeof state.radiationSystem): void {
    if (system.totalRadiationDeaths === 0 && system.totalBirthDefects === 0) return;

    const population = assertFinite(state.humanPopulationSystem.population, {
      location: 'NuclearCrisisPhase.applyContaminationToQoL',
      valueName: 'population',
      month: state.currentMonth,
    });

    const cancerRate = assertFinite(
      assertFinite(system.totalCancerDeaths, {
        location: 'NuclearCrisisPhase.applyContaminationToQoL',
        valueName: 'totalCancerDeaths',
        month: state.currentMonth,
      }) / population,
      {
        location: 'NuclearCrisisPhase.applyContaminationToQoL',
        valueName: 'cancerRate',
        month: state.currentMonth,
        additionalInfo: { totalCancerDeaths: system.totalCancerDeaths, population }
      }
    );

    const birthRate = 0.01;
    const annualBirths = assertFinite(
      population * birthRate,
      {
        location: 'NuclearCrisisPhase.applyContaminationToQoL',
        valueName: 'annualBirths',
        month: state.currentMonth,
        additionalInfo: { population, birthRate }
      }
    );
    const birthDefectRate = assertFinite(
      assertFinite(system.totalBirthDefects, {
        location: 'NuclearCrisisPhase.applyContaminationToQoL',
        valueName: 'totalBirthDefects',
        month: state.currentMonth,
      }) / (annualBirths * 10),
      {
        location: 'NuclearCrisisPhase.applyContaminationToQoL',
        valueName: 'birthDefectRate',
        month: state.currentMonth,
        additionalInfo: { totalBirthDefects: system.totalBirthDefects, annualBirths }
      }
    );

    const healthcareBurden = assertFinite(
      Math.min(0.3, cancerRate * 100 + birthDefectRate * 50),
      {
        location: 'NuclearCrisisPhase.applyContaminationToQoL',
        valueName: 'healthcareBurden',
        month: state.currentMonth,
        additionalInfo: { cancerRate, birthDefectRate }
      }
    );
    const psychologicalTrauma = assertFinite(
      Math.min(0.2, system.activeExposures.length * 0.05),
      {
        location: 'NuclearCrisisPhase.applyContaminationToQoL',
        valueName: 'psychologicalTrauma',
        month: state.currentMonth,
        additionalInfo: { activeExposuresCount: system.activeExposures.length }
      }
    );

    // Apply to global QoL
    if (state.globalMetrics?.qualityOfLife) {
      state.globalMetrics.qualityOfLife = Math.max(0,
        state.globalMetrics.qualityOfLife * (1 - healthcareBurden - psychologicalTrauma)
      );
    }

    // Reduce healthcare quality
    if (state.qualityOfLifeSystems?.healthcareQuality !== undefined) {
      state.qualityOfLifeSystems.healthcareQuality = Math.max(0,
        state.qualityOfLifeSystems.healthcareQuality * (1 - healthcareBurden * 0.5)
      );
    }
  }
}
