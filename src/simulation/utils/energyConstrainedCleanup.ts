/**
 * Energy-Constrained Cleanup Model (TIER 1 CRITICAL - Nov 16, 2025)
 *
 * Implements energy gating, concentration gap scaling, and rebound effects
 * for environmental cleanup technologies (Novel Entities, pollution).
 *
 * Research backing:
 * - EPA (2024): PFAS destruction requires 50-100 GJ/ton
 * - Cousins et al. (2022): 6-9 orders of magnitude concentration gap (ng/L → mg/L)
 * - arXiv (2025): Jevons paradox in AI e-waste - efficiency may increase consumption
 * - Sörengård et al. (2024): Energy trap economics ($20-7,000T/year for global PFAS cleanup)
 *
 * Key constraints:
 * 1. Energy trap: Cleanup requires 4-40% of global energy
 * 2. Concentration problem: Tech works at mg/L, environment at ng/L
 * 3. Rebound effects: Cleanup may enable increased production (moral hazard)
 * 4. Irreversibility: Atmospheric transport (99% redeposition)
 *
 * @see research/novel_entities_irreversibility_20251116.md
 * @see plans/novel_entities_irreversibility_implementation_plan.md
 */

import type { GameState, RNGFunction } from '@/types/game';
import type { TechnologyNode } from '@/types/technologies';
import type { PlanetaryBoundary } from '@/types/planetaryBoundaries';
import { assertFinite, assertDefined, assertInRange, assertProbability } from './assertions';

/**
 * Contamination levels by source type (from research)
 *
 * Research: EPA (2024), Cousins et al. (2022)
 * - Rainwater: 55 pg/L (Tibetan Plateau minimum) - 9 orders of magnitude gap
 * - Surface water: 100 ng/L median - 7 orders of magnitude gap
 * - Groundwater: 500 ng/L median (10-2305 ng/L range) - 6 orders of magnitude gap
 * - Concentrated waste: 1000 mg/L (tech demonstration level) - no gap
 */
const CONTAMINATION_LEVELS = {
  rainwater: {
    typical: 55e-12,      // kg/L (55 pg/L, Tibetan Plateau)
    gap: 1.8e10,          // 1000 mg/L / 55 pg/L ≈ 10^9
    cleanupFeasibility: 'IMPOSSIBLE' as const,
  },
  surfaceWater: {
    typical: 100e-9,      // kg/L (100 ng/L median)
    gap: 1e7,             // 1000 mg/L / 100 ng/L = 10^7
    cleanupFeasibility: 'VERY_LOW' as const,
  },
  groundwater: {
    typical: 500e-9,      // kg/L (500 ng/L median)
    high: 2305e-9,        // kg/L (upper range)
    gap: 2e6,             // 1000 mg/L / 500 ng/L = 2×10^6
    cleanupFeasibility: 'LOW' as const,
  },
  concentratedWaste: {
    typical: 1.0,         // kg/L (1000 mg/L, demonstration level)
    gap: 1,               // No gap
    cleanupFeasibility: 'HIGH' as const,
  },
} as const;

/**
 * Apply energy-constrained cleanup effectiveness calculation
 *
 * CRITICAL: This function is deterministic with RNG seed for Monte Carlo validation
 *
 * @param state - Game state (for energy availability)
 * @param tech - Technology node with cleanup properties
 * @param boundary - Planetary boundary being cleaned
 * @param rng - REQUIRED random number generator (deterministic with seed)
 * @returns Net effectiveness after energy/concentration/rebound constraints [0, 1]
 *
 * @throws Error if RNG is not provided (CRITICAL-3 regression fix)
 * @throws Error if calculated values are NaN/Infinity
 */
export function applyEnergyConstrainedCleanup(
  state: GameState,
  tech: any, // Accept any tech object (compatibility with multiple TechnologyNode interfaces)
  boundary: PlanetaryBoundary,
  baseEffectiveness: number, // Pass effectiveness explicitly
  rng: RNGFunction
): number {
  // === CRITICAL-3 FIX: RNG must be REQUIRED, never optional ===
  // Silent fallback to Math.random breaks Monte Carlo reproducibility
  assertDefined(rng, {
    location: 'applyEnergyConstrainedCleanup',
    valueName: 'rng',
    month: state.currentMonth,
    additionalInfo: { techId: tech.id }
  });

  // Validate RNG produces finite values
  const testRandom = rng();
  assertFinite(testRandom, {
    location: 'applyEnergyConstrainedCleanup',
    valueName: 'rng()',
    month: state.currentMonth
  });

  // 1. Validate base effectiveness
  const validatedBaseEffectiveness = assertProbability(baseEffectiveness, {
    location: 'applyEnergyConstrainedCleanup',
    valueName: 'baseEffectiveness',
    month: state.currentMonth
  });

  // 2. Check if tech has energy-constrained cleanup properties
  if (!tech.cleanupEnergyRequirement || !tech.minimumConcentration) {
    // Legacy cleanup tech without energy model - return base effectiveness unchanged
    return validatedBaseEffectiveness;
  }

  // 2. Calculate concentration factor (power law scaling)
  // Research: EPA (2024) - Tech demonstrated at >1000 mg/L, environmental levels at ng/L
  const contaminationType = tech.concentrationType ?? 'groundwater';
  const contaminationLevel = CONTAMINATION_LEVELS[contaminationType];
  const concentrationGap = assertFinite(contaminationLevel.gap, {
    location: 'applyEnergyConstrainedCleanup',
    valueName: 'concentrationGap',
    month: state.currentMonth,
    additionalInfo: { contaminationType }
  });

  // Power law: effectiveness ∝ (1 / gap)^0.5
  // Gap of 10^6 → factor of 0.001 (0.1% effectiveness)
  // Gap of 10^9 → factor of 0.000001 (0.0001% effectiveness)
  const concentrationFactor = assertFinite(Math.pow(1 / concentrationGap, 0.5), {
    location: 'applyEnergyConstrainedCleanup',
    valueName: 'concentrationFactor',
    month: state.currentMonth,
    additionalInfo: { concentrationGap }
  });

  // 3. Calculate energy factor (gated by renewable surplus)
  // ⚠️ RESEARCH GAP: Global PFAS contamination mass estimate needed
  // Assumption: boundary.value represents contamination severity [0, 2]
  // Energy requirement scaled by boundary value (more contamination = more energy)

  // Calculate renewable surplus from power generation system
  const powerSystem = state.powerGenerationSystem;
  const renewableGeneration = powerSystem ? powerSystem.totalElectricityGeneration * powerSystem.renewablePercentage : 0;
  const totalDemand = powerSystem ? powerSystem.dataCenterPower : 0;
  const renewableSurplus = assertFinite(
    Math.max(0, renewableGeneration - totalDemand),
    {
      location: 'applyEnergyConstrainedCleanup',
      valueName: 'renewableSurplus',
      month: state.currentMonth,
      additionalInfo: { renewableGeneration, totalDemand }
    }
  );

  // Required energy: GJ/ton × boundary severity scale
  // Assumption: boundary.value 1.0 ≈ 1M tons contamination (placeholder for empirical data)
  const estimatedContaminationTons = boundary.currentValue * 1e6;
  const requiredEnergyGJ = tech.cleanupEnergyRequirement * estimatedContaminationTons;

  // Convert to EJ for comparison with renewable surplus (1 EJ = 10^9 GJ)
  const requiredEnergyEJ = assertFinite(requiredEnergyGJ / 1e9, {
    location: 'applyEnergyConstrainedCleanup',
    valueName: 'requiredEnergyEJ',
    month: state.currentMonth,
    additionalInfo: {
      requiredEnergyGJ,
      estimatedContaminationTons,
      cleanupEnergyRequirement: tech.cleanupEnergyRequirement
    }
  });

  // Energy factor: fraction of required energy available
  // If renewable surplus < required → partial effectiveness
  // If renewable surplus >= required → full effectiveness (energy factor = 1.0)
  const energyFactor = assertFinite(
    Math.min(1, renewableSurplus / Math.max(0.001, requiredEnergyEJ)),
    {
      location: 'applyEnergyConstrainedCleanup',
      valueName: 'energyFactor',
      month: state.currentMonth,
      additionalInfo: { renewableSurplus, requiredEnergyEJ }
    }
  );

  // 4. Apply constraints (multiplicative)
  const constrainedEffectiveness = assertFinite(
    validatedBaseEffectiveness * concentrationFactor * energyFactor,
    {
      location: 'applyEnergyConstrainedCleanup',
      valueName: 'constrainedEffectiveness',
      month: state.currentMonth,
      additionalInfo: {
        baseEffectiveness: validatedBaseEffectiveness,
        concentrationFactor,
        energyFactor
      }
    }
  );

  // 6. Apply rebound effect (if applicable)
  let rebound = 0;
  if (!tech.avoidsRebound && tech.reboundCoefficient !== undefined) {
    // Sample from uncertainty range if provided (Monte Carlo sensitivity)
    let coefficient: number;
    if (tech.reboundUncertaintyRange) {
      const [min, max] = tech.reboundUncertaintyRange;
      coefficient = min + rng() * (max - min);
    } else {
      coefficient = tech.reboundCoefficient;
    }

    coefficient = assertInRange(coefficient, 0, 1, {
      location: 'applyEnergyConstrainedCleanup',
      valueName: 'reboundCoefficient',
      month: state.currentMonth
    });

    // Rebound: cleanup enables increased production (moral hazard)
    // Research: Jevons paradox - efficiency gains can increase total consumption
    rebound = assertFinite(constrainedEffectiveness * coefficient, {
      location: 'applyEnergyConstrainedCleanup',
      valueName: 'rebound',
      month: state.currentMonth,
      additionalInfo: { coefficient, constrainedEffectiveness }
    });

    // Log rebound warning (annually)
    if (state.currentMonth % 12 === 0 && rebound > 0) {
      console.log(`  ⚠️ Rebound Effect (${tech.name}):`);
      console.log(`     Coefficient: ${(coefficient * 100).toFixed(1)}% (sampled from uncertainty range)`);
      console.log(`     Production increase: ${(rebound * 100).toFixed(2)}%`);
    }
  }

  // 7. Net effectiveness (cleanup minus rebound)
  const netEffectiveness = assertFinite(constrainedEffectiveness - rebound, {
    location: 'applyEnergyConstrainedCleanup',
    valueName: 'netEffectiveness',
    month: state.currentMonth,
    additionalInfo: { constrainedEffectiveness, rebound }
  });

  // 8. Logging (detailed breakdown, annually)
  if (state.currentMonth % 12 === 0 && netEffectiveness > 0) {
    const techName = tech.name || tech.id || 'Unknown Tech';
    console.log(`  🧪 ${techName} (Energy-Constrained Cleanup):`);
    console.log(`     Concentration: ${contaminationType} (gap: ${concentrationGap.toExponential(1)})`);
    console.log(`     Concentration Factor: ${(concentrationFactor * 100).toFixed(4)}%`);
    console.log(`     Energy: ${renewableSurplus.toFixed(1)} / ${requiredEnergyEJ.toFixed(1)} EJ`);
    console.log(`     Energy Factor: ${(energyFactor * 100).toFixed(2)}%`);
    console.log(`     Base → Constrained: ${(validatedBaseEffectiveness * 100).toFixed(1)}% → ${(constrainedEffectiveness * 100).toFixed(4)}%`);
    if (rebound > 0) {
      console.log(`     ⚠️ Rebound: -${(rebound * 100).toFixed(4)}%`);
    }
    console.log(`     Net Effectiveness: ${(netEffectiveness * 100).toFixed(4)}%`);
  }

  // Ensure result is valid probability
  return assertProbability(Math.max(0, netEffectiveness), {
    location: 'applyEnergyConstrainedCleanup',
    valueName: 'netEffectiveness (final)',
    month: state.currentMonth
  });
}
