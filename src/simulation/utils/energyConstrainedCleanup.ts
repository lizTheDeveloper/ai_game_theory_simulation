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
import { assertFinite, assertStateProperty, assertInRange } from './assertions';

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
  let energyReqType: 'perKg' | 'annual' = 'perKg';  // Track which type for later calculation

  if (typeof tech.energyRequirement === 'object') {
    // Object with kWhPerKg, kWhPerM3, or annualTWhRequired
    if (tech.energyRequirement.kWhPerKg !== undefined) {
      energyReq = tech.energyRequirement.kWhPerKg;
      energyReqType = 'perKg';
    } else if (tech.energyRequirement.kWhPerM3 !== undefined) {
      // Volume-based energy (kWh/m³ water treated)
      // Convert to annualTWhRequired for compatibility with energy constraint model
      //
      // Rough estimate approach:
      // - Global water treatment capacity: ~1000 km³/year (municipal + industrial)
      // - Cleanup tech at full deployment might treat 1-10% of this
      // - Use 50 km³/year as baseline (5% of global treatment capacity)
      //
      // This is a placeholder until we have proper water volume tracking

      const kWhPerM3 = tech.energyRequirement.kWhPerM3;
      const deploymentLevel = tech.deploymentLevel || 0;

      // Estimate annual water volume treated at full deployment (km³/year)
      const fullDeploymentVolume = 50;  // km³/year (5% of global treatment)
      const currentVolume = fullDeploymentVolume * deploymentLevel;  // km³/year

      // Convert to m³/year: 1 km³ = 1e9 m³
      const volumeM3PerYear = currentVolume * 1e9;

      // Annual energy: volume × energy/volume
      const annualKWh = volumeM3PerYear * kWhPerM3;

      // Convert kWh to TWh: 1 TWh = 1e9 kWh
      energyReq = assertFinite(annualKWh / 1e9, {
        location: 'applyEnergyConstrainedCleanup',
        valueName: 'energyReq (converted from kWhPerM3)',
        month: state.currentMonth,
        additionalInfo: {
          techId: tech.id,
          kWhPerM3,
          deploymentLevel,
          volumeKm3PerYear: currentVolume,
          annualTWh: annualKWh / 1e9,
        },
      });
      energyReqType = 'annual';  // Treat as annual budget, not per-kg
    } else if (tech.energyRequirement.annualTWhRequired !== undefined) {
      energyReq = tech.energyRequirement.annualTWhRequired;
      energyReqType = 'annual';
    } else {
      throw new Error(`❌ Tech '${tech.id}' has energyRequirement object but none of kWhPerKg, kWhPerM3, or annualTWhRequired is defined`);
    }
  } else {
    energyReq = tech.energyRequirement;
    energyReqType = 'perKg';
  }

  if (!energyReq || !tech.minimumConcentration) {
    // Legacy cleanup tech without energy model - use base effectiveness
    // Support multiple effect names for cleanup tech
    const effectValue = tech.effects.novelEntitiesReduction ||
                        (tech.effects as any).pfasReduction ||
                        (tech.effects as any).microplasticReduction ||
                        tech.effects.pollutionReduction;

    if (!effectValue) {
      throw new Error(`❌ Tech '${tech.id}' missing cleanup effect (novelEntitiesReduction/pfasReduction/microplasticReduction/pollutionReduction)`);
    }
    if (tech.deploymentLevel === undefined) {
      throw new Error(`❌ Tech '${tech.id}' missing deploymentLevel (required for cleanup tech)`);
    }

    const baseEffect = effectValue * tech.deploymentLevel;
    return {
      grossEffectiveness: baseEffect,
      concentrationFactor: 1.0,
      energyFactor: 1.0,
      rebound: 0,
      netEffectiveness: baseEffect,
    };
  }

  // 2. Calculate concentration factor (power law scaling)
  //
  // Research foundation (24 peer-reviewed sources, 2024-2025):
  // - Thermodynamic minimum work: W_min ∝ RT ln(1/x) (fundamental)
  // - DAC: 200-3000 kWh/tonne vs 250 kWh/tonne theoretical (8-120× overhead)
  // - Ocean cleanup: 60% effectiveness gain from targeting 1.5× concentration hotspots
  // - PFAS destruction: Demonstrated at 1000+ mg/L, environmental levels at ng-pg/L (6-9 orders lower)
  // - Square root scaling (exponent 0.5): Grade B+ validation, conservative approximation
  //
  // @see research/cleanup_effectiveness_concentration_scaling_20251201.md (24 sources)
  //
  // CRITICAL FIX (Nov 30, 2025): Determine contamination level from tech design concentration
  // - Tech designed for high concentrations (>500 mg/L): assume cleaning concentrated waste streams
  // - Tech designed for medium concentrations (0.1-500 mg/L): assume groundwater remediation
  // - Tech designed for low concentrations (<0.1 mg/L): assume surface water treatment
  //
  // Convert minimum concentration from ng/L to kg/L for comparison
  const minConcentration = (tech.minimumConcentration as any).ngPerL
    ? (tech.minimumConcentration as any).ngPerL * 1e-12  // ng/L to kg/L
    : 1000 * 1e-6; // Default: 1000 mg/L = 1e-3 kg/L

  // Determine realistic environmental concentration based on tech design threshold
  const minConc_mgPerL = minConcentration * 1e6;  // Convert kg/L to mg/L
  let actualConcentration: number;
  let contaminationType: string;

  if (minConc_mgPerL >= 500) {
    // Tech designed for concentrated industrial effluent (>500 mg/L threshold)
    // Realistic: Industrial point sources at ~1000 mg/L (close to design concentration)
    actualConcentration = 1.0 * 1e-3;  // 1000 mg/L in kg/L
    contaminationType = 'concentratedWaste';
  } else if (minConc_mgPerL >= 0.1) {
    // Tech designed for groundwater/wastewater (0.1-500 mg/L threshold)
    // Realistic: Contaminated groundwater at ~0.5 mg/L (500 ng/L)
    actualConcentration = 500e-12;  // 500 ng/L in kg/L
    contaminationType = 'groundwater';
  } else {
    // Tech designed for surface water (<0.1 mg/L threshold)
    // Realistic: Surface water at ~0.0001 mg/L (100 ng/L)
    actualConcentration = 100e-12;  // 100 ng/L in kg/L
    contaminationType = 'surfaceWater';
  }

  const concentrationGap = assertFinite(minConcentration / actualConcentration, {
    location: 'applyEnergyConstrainedCleanup',
    valueName: 'concentrationGap',
    month: state.currentMonth,
    additionalInfo: {
      techId: tech.id,
      minConcentration,
      minConc_mgPerL,
      actualConcentration,
      contaminationType,
    },
  });

  // Power law scaling: effectiveness ∝ 1/√(gap)
  //
  // Calibration (from research):
  // - gap ≤ 1 (waste at/above design concentration): 100% effectiveness (no penalty)
  // - gap > 1 (waste dilute): reduced effectiveness (square root penalty)
  // - At 1 order of magnitude gap (10×): 32% effectiveness
  // - At 2 orders (100×): 10% effectiveness
  // - At 6 orders (1e6×, groundwater PFAS): 0.1% effectiveness
  // - At 9 orders (1e9×, rainwater PFAS): 0.003% effectiveness
  //
  // CRITICAL FIX (Nov 30, 2025): Don't apply power law when gap ≤ 1
  // Bug context: Math.pow(1/0.5, 0.5) = 1.414, producing >100% effectiveness
  // This violated thermodynamics - concentrated waste should be EASIER to clean, not harder
  // Fix: Return 1.0 (100%) for gap ≤ 1, apply penalty only for gap > 1
  const rawConcentrationFactor = concentrationGap <= 1
    ? 1.0  // Already at/above design concentration - full effectiveness
    : Math.pow(1 / concentrationGap, 0.5);  // Diluted - apply square root penalty

  const concentrationFactor = assertInRange(
    rawConcentrationFactor,
    0,
    1,
    {
      location: 'applyEnergyConstrainedCleanup',
      valueName: 'concentrationFactor',
      month: state.currentMonth,
      additionalInfo: {
        techId: tech.id,
        concentrationGap,
        rawValue: rawConcentrationFactor,
      },
    }
  );

  // 3. Calculate energy factor (energy availability constraint)
  // Research: EPA 2024 - 75 GJ/ton median, IEA 2024 - 600 EJ/year global energy
  // Cleanup competes with other energy uses
  //
  // ARCHITECTURE FIX H-1a (Dec 9, 2025): Use EnergyBudgetPhase allocations instead of old renewable surplus

  // Check if energy budget system is enabled
  if (!state.energyBudget?.enabled || !state.energyBudget.allocations) {
    console.warn(`⚠️ EnergyBudgetPhase not enabled in applyEnergyConstrainedCleanup, assuming full energy availability`);
    // Fallback to old system if energy budget not available
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
      'totalDemand',
      {
        location: 'applyEnergyConstrainedCleanup',
        month: state.currentMonth,
      }
    );

    const renewableSurplus = Math.max(0, renewableCapacity - energyDemand);

    // Calculate energy factor using legacy approach
    let requiredEnergy: number;
    if (energyReqType === 'annual') {
      const annualTWh = typeof energyReq === 'number' ? energyReq : 0;
      requiredEnergy = annualTWh / 277.778;
    } else {
      const estimatedStock = boundaryCurrentValue * 1000;
      const energyPerTon = typeof energyReq === 'number' ? energyReq : 75;
      requiredEnergy = (estimatedStock * energyPerTon) / 1000;
    }

    const energyFactor = Math.min(1.0, renewableSurplus / Math.max(0.001, requiredEnergy));

    // Continue to step 4 (skipping new energy budget logic)
    const effectValue = tech.effects.novelEntitiesReduction ||
                        (tech.effects as any).pfasReduction ||
                        (tech.effects as any).microplasticReduction ||
                        tech.effects.pollutionReduction;

    if (!effectValue) {
      throw new Error(`❌ Tech '${tech.id}' missing cleanup effect (novelEntitiesReduction/pfasReduction/microplasticReduction/pollutionReduction)`);
    }
    if (tech.deploymentLevel === undefined) {
      throw new Error(`❌ Tech '${tech.id}' missing deploymentLevel (required for cleanup tech with energy model)`);
    }

    const baseEffectiveness = effectValue * tech.deploymentLevel;
    const grossEffectiveness = baseEffectiveness * concentrationFactor * energyFactor;

    // Apply rebound effect
    let rebound = 0;
    if (tech.reboundCoefficient !== undefined && !tech.avoidsRebound) {
      const coefficient = tech.reboundUncertaintyRange
        ? tech.reboundUncertaintyRange[0] + rng() * (tech.reboundUncertaintyRange[1] - tech.reboundUncertaintyRange[0])
        : tech.reboundCoefficient;

      assertFinite(coefficient, {
        location: 'applyEnergyConstrainedCleanup',
        valueName: 'reboundCoefficient',
        month: state.currentMonth,
        additionalInfo: {
          techId: tech.id,
          uncertaintyRange: tech.reboundUncertaintyRange,
        },
      });

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
      netEffectiveness: Math.max(0, netEffectiveness),
    };
  }

  // NEW APPROACH: Use EnergyBudgetPhase allocations
  // Map tech ID to energy category
  const category = mapTechToEnergyCategory(tech.id);
  let energyFactor: number;

  if (!category) {
    console.warn(`⚠️ Tech '${tech.id}' has no energy category mapping, assuming full energy availability`);
    energyFactor = 1.0;
  } else {
    const allocation = state.energyBudget.allocations[category];
    if (!allocation) {
      console.warn(`⚠️ No energy allocation for category '${category}' (tech: ${tech.id}), using default 50%`);
      energyFactor = 0.5;
    } else {
      energyFactor = allocation.effectivenessMultiplier;
    }
  }


  // 4. Base effectiveness (from tech definition)
  // Support multiple effect names for cleanup tech
  const effectValue = tech.effects.novelEntitiesReduction ||
                      (tech.effects as any).pfasReduction ||
                      (tech.effects as any).microplasticReduction ||
                      tech.effects.pollutionReduction;

  if (!effectValue) {
    throw new Error(`❌ Tech '${tech.id}' missing cleanup effect (novelEntitiesReduction/pfasReduction/microplasticReduction/pollutionReduction)`);
  }
  if (tech.deploymentLevel === undefined) {
    throw new Error(`❌ Tech '${tech.id}' missing deploymentLevel (required for cleanup tech with energy model)`);
  }

  const baseEffectiveness = effectValue * tech.deploymentLevel;

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

/**
 * Map technology ID to energy category (matches EnergyBudgetPhase mapping)
 * ARCHITECTURE FIX H-1a (Dec 9, 2025): Shared mapping logic for energy budget integration
 */
function mapTechToEnergyCategory(techId: string): string | null {
  // Novel entities cleanup technologies
  if (techId.includes('pfas') || techId.includes('PFAS')) return 'pfas-cleanup';
  if (techId.includes('microplastic') || techId.includes('plastic-cleanup')) return 'microplastic-cleanup';
  if (techId.includes('novel-entities') || techId.includes('pollution-cleanup')) return 'pollution-cleanup';

  // Climate technologies (fallback if cleanup tech has climate effects)
  if (techId.includes('dac') || techId.includes('air-capture')) return 'dac';
  if (techId.includes('hydrogen')) return 'green-hydrogen';
  if (techId.includes('mineralization') || techId.includes('weathering')) return 'carbon-mineralization';

  return null; // Technology doesn't have energy requirements
}
