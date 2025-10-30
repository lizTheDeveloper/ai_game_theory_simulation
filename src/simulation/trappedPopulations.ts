/**
 * Trapped Population Tracking (Oct 20, 2025)
 *
 * Models "involuntary immobility" - people who WANT to migrate but CANNOT due to poverty.
 * This is the critical missing mechanism identified by research-skeptic.
 *
 * Research backing:
 * - Lake Urmia, Iran (2024): 71.85% migrated early, then immobility dominated late phase
 * - World Bank (2024): Groundwater inaccessibility increases rural poverty 12%
 * - Thalheimer et al. (2024): Trapped populations in informal settlements, refugee camps
 * - Columbia (2025): Water scarcity decreases resources needed to migrate
 *
 * @see research/water_scarcity_migration_immobility_20251020.md
 * @see reviews/freshwater_migration_critique_20251020.md
 */

import { GameState } from '@/types/game';
import { billionsToMillions, toBillions } from '@/simulation/utils/populationUnits';

/**
 * Update trapped population tracking each month
 * Called from updateRefugeeCrises()
 */
export function updateTrappedPopulations(state: GameState): void {
  const system = state.refugeeCrisisSystem;
  const trapped = system.trappedPopulations;
  if (!trapped) return;

  // FIX (Oct 29, 2025): Type-safe conversion billions → millions
  // state.humanPopulationSystem.population is BILLIONS, trapped populations track MILLIONS
  const totalPopulation = billionsToMillions(toBillions(state.humanPopulationSystem.population));

  // Reset monthly counters
  trapped.totalTrapped = 0;
  trapped.trappedByWater = 0;
  trapped.trappedByClimate = 0;
  trapped.trappedByEcosystem = 0;
  trapped.trappedByConflict = 0;
  trapped.aspiringToMigrate = 0;
  trapped.ableToMigrate = 0;

  // === 1. FRESHWATER STRESS ===
  const fw = state.freshwaterSystem;
  if (fw && fw.waterStress > 0.5) {
    const stressedPopulation = totalPopulation * fw.populationStressed;

    // Aspiration to migrate scales with water stress severity
    // Moderate stress (0.5-0.7): 20% want to leave
    // High stress (0.7-0.9): 50% want to leave
    // Extreme stress (>0.9): 70% want to leave
    const aspirationRate = Math.min(0.70, (fw.waterStress - 0.5) * 1.25);
    const aspiring = stressedPopulation * aspirationRate;

    // Only wealthy (30%) and some middle class (25% of middle 50% = 12.5% total) can afford migration
    const ableToMigrate = stressedPopulation * (trapped.wealthDistribution.canSelfRelocate + 0.125);

    // Trapped = those who want to leave but can't afford it
    const trappedByWater = Math.max(0, aspiring - ableToMigrate);

    trapped.trappedByWater = trappedByWater;
    trapped.aspiringToMigrate += aspiring;
    trapped.ableToMigrate += ableToMigrate;
  }

  // === 2. CLIMATE DISASTERS ===
  const env = state.environmentalAccumulation;
  if (env.climateStability < 0.6) {
    const climateAffected = totalPopulation * (1 - env.climateStability) * 0.3; // 30% of population in affected regions
    const aspiringClimate = climateAffected * 0.4; // 40% want to leave
    const ableClimate = climateAffected * 0.35; // 35% can afford to leave

    trapped.trappedByClimate = Math.max(0, aspiringClimate - ableClimate);
    trapped.aspiringToMigrate += aspiringClimate;
    trapped.ableToMigrate += ableClimate;
  }

  // === 3. ECOSYSTEM COLLAPSE ===
  if (env.ecosystemCrisisActive && env.biodiversityIndex < 0.4) {
    const ecosystemAffected = totalPopulation * (1 - env.biodiversityIndex) * 0.2; // 20% dependent on ecosystems
    const aspiringEcosystem = ecosystemAffected * 0.3; // 30% want to leave
    const ableEcosystem = ecosystemAffected * 0.25; // 25% can afford it

    trapped.trappedByEcosystem = Math.max(0, aspiringEcosystem - ableEcosystem);
    trapped.aspiringToMigrate += aspiringEcosystem;
    trapped.ableToMigrate += ableEcosystem;
  }

  // === 4. CONFLICT ZONES ===
  if ((state.conflictResolution?.activeConflicts ?? 0) > 0) {
    const conflictAffected = totalPopulation * (state.conflictResolution?.activeConflicts ?? 0) * 0.05; // 5% per conflict
    const aspiringConflict = conflictAffected * 0.80; // 80% want to escape war
    const ableConflict = conflictAffected * 0.30; // 30% can afford to leave (conflict destroys wealth)

    trapped.trappedByConflict = Math.max(0, aspiringConflict - ableConflict);
    trapped.aspiringToMigrate += aspiringConflict;
    trapped.ableToMigrate += ableConflict;
  }

  // === 5. CALCULATE TOTAL TRAPPED ===
  trapped.totalTrapped = trapped.trappedByWater + trapped.trappedByClimate +
                         trapped.trappedByEcosystem + trapped.trappedByConflict;

  trapped.mobilityGap = Math.max(0, trapped.aspiringToMigrate - trapped.ableToMigrate);

  // === 6. PSYCHOLOGICAL IMPACT CATEGORIES (Aghajani-Shahrivar et al. 2024) ===
  if (trapped.totalTrapped > 0) {
    // Distribution based on Lake Urmia research
    trapped.typeBreakdown.ambivalent = trapped.totalTrapped * 0.40;  // Want to leave AND stay
    trapped.typeBreakdown.precarious = trapped.totalTrapped * 0.35;  // No aspirations (passive helplessness)
    trapped.typeBreakdown.voluntary = trapped.totalTrapped * 0.25;   // Choose to stay despite risks
  }

  // === 7. SOCIAL & HEALTH IMPACTS ===
  if (trapped.totalTrapped > 0) {
    const trappedFraction = trapped.totalTrapped / totalPopulation;

    // Mental health impact scales with trapped population
    // 0-5% trapped: minor impact (0.1)
    // 5-15% trapped: moderate impact (0.3-0.5)
    // >15% trapped: severe impact (0.7+)
    trapped.mentalHealthImpact = Math.min(1.0, trappedFraction * 5);

    // Social cohesion impact (community breakdown from inability to leave)
    trapped.socialCohesionImpact = Math.min(0.8, trappedFraction * 4);

    // Mortality multiplier for trapped populations (World Bank: 12% poverty increase → health impacts)
    // Base: 1.0, increases to 1.5-2.0x for severe trapping
    trapped.mortalityMultiplier = 1.0 + (trappedFraction * 5);
  } else {
    trapped.mentalHealthImpact = 0;
    trapped.socialCohesionImpact = 0;
    trapped.mortalityMultiplier = 1.0;
  }

  // === 8. APPLY GLOBAL EFFECTS ===
  if (trapped.totalTrapped > 10) { // At least 10 million trapped
    // Mental health crisis reduces QoL
    state.globalMetrics.qualityOfLife = Math.max(0,
      state.globalMetrics.qualityOfLife * (1 - trapped.mentalHealthImpact * 0.05)
    );

    // Social cohesion breakdown
    const oldStability = state.globalMetrics.socialStability;
    const cohesionFactor = 1 - trapped.socialCohesionImpact * 0.08;
    const newStability = Math.max(0, oldStability * cohesionFactor);
    console.log(`[DEBUG trappedPopulations:${state.currentMonth}] socialStability: ${oldStability.toFixed(4)} * ${cohesionFactor.toFixed(4)} = ${(oldStability * cohesionFactor).toFixed(4)} → ${newStability.toFixed(4)}`);
    state.globalMetrics.socialStability = newStability;

    // Excess mortality from being trapped (applies to death tracking)
    const excessDeathsBillions = (trapped.totalTrapped / 1000) * (trapped.mortalityMultiplier - 1.0) * 0.001; // Billions
    // FIX (Oct 29, 2025): BUG #1 - Convert to millions for death tracking
    const excessDeathsMillions = excessDeathsBillions * 1000;

    if (excessDeathsMillions > 0) {
      state.humanPopulationSystem.monthlyExcessDeaths += excessDeathsMillions;
      state.humanPopulationSystem.cumulativeCrisisDeaths += excessDeathsMillions;

      // Attribute to primary cause (water if water is primary, climate otherwise)
      if (trapped.trappedByWater > trapped.trappedByClimate) {
        state.humanPopulationSystem.deathsByCategory.famine += excessDeathsMillions;
        state.humanPopulationSystem.deathsByRootCause.resource += excessDeathsMillions;
      } else {
        state.humanPopulationSystem.deathsByCategory.disasters += excessDeathsMillions;
        state.humanPopulationSystem.deathsByRootCause.climate += excessDeathsMillions;
      }
    }

    // Logging (only if significant)
    if (trapped.totalTrapped > 50) { // >50 million trapped
      console.warn(`⚠️ INVOLUNTARY IMMOBILITY: ${trapped.totalTrapped.toFixed(1)}M people TRAPPED`);
      console.log(`   Aspiring to migrate: ${trapped.aspiringToMigrate.toFixed(1)}M`);
      console.log(`   Able to afford migration: ${trapped.ableToMigrate.toFixed(1)}M`);
      console.log(`   MOBILITY GAP: ${trapped.mobilityGap.toFixed(1)}M`);
      console.log(`   By cause: Water=${trapped.trappedByWater.toFixed(1)}M, Climate=${trapped.trappedByClimate.toFixed(1)}M, Ecosystem=${trapped.trappedByEcosystem.toFixed(1)}M, Conflict=${trapped.trappedByConflict.toFixed(1)}M`);
      console.log(`   Mental health impact: ${(trapped.mentalHealthImpact * 100).toFixed(0)}%`);
      console.log(`   Mortality multiplier: ${trapped.mortalityMultiplier.toFixed(2)}x`);
    }
  }
}
