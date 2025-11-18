/**
<<<<<<< HEAD
 * Energy-Constrained Cleanup Model (Nov 16, 2025)
 *
 * Models the energy trap, concentration problem, and rebound effects for pollution cleanup technologies.
 *
 * Research backing:
 * - EPA (2024): PFAS destruction requires 50-100 GJ/ton (median 75 GJ/ton)
 * - Fennell (2024): Technology demonstrated at >1000 mg/L, environmental levels at ng/L-pg/L
 * - Cousins et al. (2022): Atmospheric transport makes 99% of cleanup rain back down
 * - Ling (2024): AI e-waste cleanup may increase production (Jevons paradox)
=======
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
>>>>>>> origin/auto/worker-20251117_053001
 *
 * @see research/novel_entities_irreversibility_20251116.md
 * @see plans/novel_entities_irreversibility_implementation_plan.md
 */

<<<<<<< HEAD
import type { GameState } from '@/types/game';
import type { TechDefinition } from '@/simulation/techTree/comprehensiveTechTree';
import { assertFinite, assertStateProperty } from './assertions';

/**
 * Contamination levels by type (research-backed concentration gaps)
 *
 * Research: Tibetan Plateau rainwater (55 pg/L minimum), EPA groundwater surveys, Lake Erie studies
 */
const CONTAMINATION_LEVELS = {
  rainwater: {
    typical: 55e-15,  // 55 pg/L in kg/L (Tibetan Plateau minimum - global atmospheric distribution)
    gap: 1.8e10,      // 1000 mg/L / 55 pg/L = 18 billion (9 orders of magnitude)
    cleanupFeasibility: 'IMPOSSIBLE' as const,
  },
  surfaceWater: {
    typical: 100e-12, // 100 ng/L in kg/L (median surface water)
    gap: 1e7,         // 7 orders of magnitude
    cleanupFeasibility: 'VERY_LOW' as const,
  },
  groundwater: {
    typical: 500e-12, // 500 ng/L in kg/L (median groundwater, range 10-2305 ng/L)
    high: 2305e-12,   // Upper range (still 6 orders below tech threshold)
    gap: 2e6,         // 6 orders of magnitude (median)
    cleanupFeasibility: 'LOW' as const,
  },
  concentratedWaste: {
    typical: 1.0,     // 1000 mg/L in kg/L (industrial point sources)
    gap: 1,           // No gap - tech works at this concentration
=======
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
>>>>>>> origin/auto/worker-20251117_053001
    cleanupFeasibility: 'HIGH' as const,
  },
} as const;

/**
<<<<<<< HEAD
 * Apply energy-constrained cleanup for a single technology
 *
 * Calculates cleanup effectiveness accounting for:
 * 1. Concentration gap (power law scaling)
 * 2. Energy availability constraint
 * 3. Rebound effects (Jevons paradox)
 *
 * @param state - Game state (for energy system access)
 * @param tech - Technology definition with energy/concentration properties
 * @param boundaryCurrentValue - Current boundary value [0, 2]
 * @param rng - Deterministic RNG function (REQUIRED for rebound coefficient sampling)
 * @returns Net cleanup effectiveness [0, 1] after all constraints
 */
export function applyEnergyConstrainedCleanup(
  state: GameState,
  tech: TechDefinition,
  boundaryCurrentValue: number,
  rng: () => number
): {
  grossEffectiveness: number;
  concentrationFactor: number;
  energyFactor: number;
  rebound: number;
  netEffectiveness: number;
} {
  // CRITICAL: Validate RNG (Nov 7, 2025 regression fix - RNG must be required, not optional)
  if (!rng || typeof rng !== 'function') {
    throw new Error('❌ CRITICAL: RNG required for deterministic simulation in applyEnergyConstrainedCleanup');
  }

  // Test RNG function
  const testRng = rng();
  assertFinite(testRng, {
    location: 'applyEnergyConstrainedCleanup',
    valueName: 'rng() test value',
    month: state.currentMonth,
  });

  // 1. Check if tech has energy requirement (legacy tech without energy model uses old behavior)
  const energyReq = typeof tech.energyRequirement === 'object'
    ? tech.energyRequirement.kWhPerKg ?? tech.energyRequirement.annualTWhRequired
    : tech.energyRequirement;

  if (!energyReq || !tech.minimumConcentration) {
    // Legacy cleanup tech without energy model - use base effectiveness
    const baseEffect = (tech.effects.novelEntitiesReduction ?? 0) * (tech.deploymentLevel ?? 0);
    return {
      grossEffectiveness: baseEffect,
      concentrationFactor: 1.0,
      energyFactor: 1.0,
      rebound: 0,
      netEffectiveness: baseEffect,
    };
  }

  // 2. Calculate concentration factor (power law scaling)
  // Research: Fennell 2024 - efficiency drops with dilution, modeled as square root penalty
  const concentrationType = (tech.minimumConcentration as any).concentrationPenalty !== undefined
    ? 'concentratedWaste' // If no concentration type specified, assume best case
    : 'groundwater'; // Default to groundwater (6 orders gap)

  const contaminationLevel = CONTAMINATION_LEVELS[concentrationType as keyof typeof CONTAMINATION_LEVELS];

  // Convert minimum concentration from ng/L to kg/L for comparison
  const minConcentration = (tech.minimumConcentration as any).ngPerL
    ? (tech.minimumConcentration as any).ngPerL * 1e-12  // ng/L to kg/L
    : 1000 * 1e-6; // Default: 1000 mg/L = 1e-3 kg/L

  const concentrationGap = minConcentration / contaminationLevel.typical;

  // Power law scaling: effectiveness ∝ 1/√(gap)
  // At 1 order of magnitude gap: 32% effectiveness
  // At 2 orders: 10% effectiveness
  // At 6 orders (groundwater): 0.05% effectiveness
  // At 9 orders (rainwater): 0.003% effectiveness
  const concentrationFactor = Math.pow(1 / concentrationGap, 0.5);

  // 3. Calculate energy factor (energy availability constraint)
  // Research: EPA 2024 - 75 GJ/ton median, IEA 2024 - 600 EJ/year global energy
  // Cleanup competes with other energy uses

  // Access renewable energy surplus (total renewable capacity - demand)
  const renewableCapacity = assertStateProperty(
    state.resourceEconomy?.energy,
    'renewableCapacity',
    {
      location: 'applyEnergyConstrainedCleanup',
      month: state.currentMonth,
    }
  );

  const energyDemand = assertStateProperty(
    state.resourceEconomy?.energy,
    'demand',
    {
      location: 'applyEnergyConstrainedCleanup',
      month: state.currentMonth,
    }
  );

  const renewableSurplus = Math.max(0, renewableCapacity - energyDemand);

  // Estimate energy required for cleanup (very rough - assumes boundary value correlates with stock)
  // TODO: Better stock tracking (needs contamination mass estimates)
  // For now: boundary value [0,2] × 1000 Mt (rough stock) × energy/ton
  const estimatedStock = boundaryCurrentValue * 1000; // Mt (very rough)
  const energyPerTon = typeof energyReq === 'number' ? energyReq : 75; // GJ/ton default

  const requiredEnergy = (estimatedStock * energyPerTon) / 1000; // Convert GJ to EJ
  const energyFactor = Math.min(1.0, renewableSurplus / Math.max(0.001, requiredEnergy));

  // 4. Base effectiveness (from tech definition)
  const baseEffectiveness = (tech.effects.novelEntitiesReduction ?? 0) * (tech.deploymentLevel ?? 0);

  // 5. Apply constraints
  const grossEffectiveness = baseEffectiveness * concentrationFactor * energyFactor;

  // 6. Apply rebound effect (if applicable)
  let rebound = 0;
  if (tech.reboundCoefficient !== undefined && !tech.avoidsRebound) {
    // Sample rebound coefficient from uncertainty range (Monte Carlo)
    const coefficient = tech.reboundUncertaintyRange
      ? tech.reboundUncertaintyRange[0] + rng() * (tech.reboundUncertaintyRange[1] - tech.reboundUncertaintyRange[0])
      : tech.reboundCoefficient;

    // Validate sampled coefficient
    assertFinite(coefficient, {
      location: 'applyEnergyConstrainedCleanup',
      valueName: 'reboundCoefficient',
      month: state.currentMonth,
      additionalInfo: {
        techId: tech.id,
        uncertaintyRange: tech.reboundUncertaintyRange,
      },
    });

    // Rebound: cleanup enables more production (Jevons paradox)
    rebound = grossEffectiveness * coefficient;
  }

  const netEffectiveness = assertFinite(grossEffectiveness - rebound, {
    location: 'applyEnergyConstrainedCleanup',
    valueName: 'netEffectiveness',
    month: state.currentMonth,
    additionalInfo: {
      techId: tech.id,
      grossEffectiveness,
      rebound,
    },
  });

  return {
    grossEffectiveness,
    concentrationFactor,
    energyFactor,
    rebound,
    netEffectiveness: Math.max(0, netEffectiveness), // Can't be negative
  };
=======
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
>>>>>>> origin/auto/worker-20251117_053001
}
