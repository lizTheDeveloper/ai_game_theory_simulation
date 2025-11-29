/**
 * Energy-Constrained Cleanup Model (Nov 16, 2025)
 *
 * Models the energy trap, concentration problem, and rebound effects for pollution cleanup technologies.
 *
 * Research backing:
 * - EPA (2024): PFAS destruction requires 50-100 GJ/ton (median 75 GJ/ton)
 * - Fennell (2024): Technology demonstrated at >1000 mg/L, environmental levels at ng/L-pg/L
 * - Cousins et al. (2022): Atmospheric transport makes 99% of cleanup rain back down
 * - Ling (2024): AI e-waste cleanup may increase production (Jevons paradox)
 *
 * @see research/novel_entities_irreversibility_20251116.md
 * @see plans/novel_entities_irreversibility_implementation_plan.md
 */

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
    cleanupFeasibility: 'HIGH' as const,
  },
} as const;

/**
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
  let energyReq: number | undefined;
  if (typeof tech.energyRequirement === 'object') {
    // Object with kWhPerKg or annualTWhRequired
    if (tech.energyRequirement.kWhPerKg !== undefined) {
      energyReq = tech.energyRequirement.kWhPerKg;
    } else if (tech.energyRequirement.annualTWhRequired !== undefined) {
      energyReq = tech.energyRequirement.annualTWhRequired;
    } else {
      throw new Error(`❌ Tech '${tech.id}' has energyRequirement object but neither kWhPerKg nor annualTWhRequired is defined`);
    }
  } else {
    energyReq = tech.energyRequirement;
  }

  if (!energyReq || !tech.minimumConcentration) {
    // Legacy cleanup tech without energy model - use base effectiveness
    if (!tech.effects.novelEntitiesReduction) {
      throw new Error(`❌ Tech '${tech.id}' missing novelEntitiesReduction effect (required for cleanup tech)`);
    }
    if (tech.deploymentLevel === undefined) {
      throw new Error(`❌ Tech '${tech.id}' missing deploymentLevel (required for cleanup tech)`);
    }

    const baseEffect = tech.effects.novelEntitiesReduction * tech.deploymentLevel;
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
  if (!tech.effects.novelEntitiesReduction) {
    throw new Error(`❌ Tech '${tech.id}' missing novelEntitiesReduction effect (required for cleanup tech with energy model)`);
  }
  if (tech.deploymentLevel === undefined) {
    throw new Error(`❌ Tech '${tech.id}' missing deploymentLevel (required for cleanup tech with energy model)`);
  }

  const baseEffectiveness = tech.effects.novelEntitiesReduction * tech.deploymentLevel;

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
}
