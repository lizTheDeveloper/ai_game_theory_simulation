/**
 * EnergyBudgetPhase
 *
 * Implements hard constraints on technology deployment based on global electricity capacity.
 * Prevents unrealistic scenarios where DAC, hydrogen, and AI datacenters simultaneously
 * claim the same limited electricity capacity without priority allocation.
 *
 * **Research Foundation:** research/energy_budget_constraints_20251209.md (Grade B+)
 * **Validation:** reviews/research_validation_energy_budget_20251209.md (QG1 PASSED)
 *
 * **EXECUTION ORDER:** 12.4 (Before ClimateDeploymentPhase 12.8, after tech-tree 12.5)
 * **DEPENDENCIES:** tech-tree (12.5) - Requires deployed technologies list
 * **SIDE EFFECTS:**
 * - Updates state.energyBudget.allocations for each tech category
 * - Updates state.energyBudget.conflicts (competition tracking)
 * - Sets effectivenessMultiplier for downstream phases
 *
 * **4-Step Phase Logic:**
 * 1. Calculate energy demand from active technologies
 * 2. Check if total demand exceeds global capacity
 * 3. Allocate energy by priority tier (essential → high → climate → elective)
 * 4. Calculate effectiveness multiplier: (allocated / demand)^exponent
 *
 * **Priority Tiers (modeling simplification, not research-backed):**
 * - Tier 1 (Essential): 40-50% capacity - Healthcare, food systems, water
 * - Tier 2 (High Priority): 30-40% capacity - Industry, transport, education
 * - Tier 3 (Climate Tech): 10-20% surplus - DAC, hydrogen, carbon removal
 * - Tier 4 (Elective): 5-10% surplus - AI expansion, crypto, luxury compute
 *
 * **Key Parameters (corrected from QG1 review):**
 * - Global capacity: 29,000 TWh/year (2024 baseline)
 * - Clean electricity: 11,500 TWh/year (40% clean share)
 * - AI datacenter baseline: 415-460 TWh (NOT 730 TWh)
 * - DAC range: 1,200-2,500 kWh/tCO2 (lower bound raised from 1,000)
 * - Effectiveness exponent: 1.2 (conservative, tech-specific 1.0-1.3)
 */

import { GameState, SimulationPhase, PhaseResult, RNGFunction } from '@/types/game';
import { assertFinite, assertStateProperty, assertInRange } from '@/simulation/utils/assertions';
import { getTechById } from '@/simulation/techTree/comprehensiveTechTree';
import { mapTechToEnergyCategory } from '@/simulation/utils/energyCategories';

// Energy requirements per technology category (TWh/year at full deployment)
// Research: research/energy_budget_constraints_20251209.md sections 2.1-2.3
const TECH_ENERGY_REQUIREMENTS: Record<string, {
  tWhPerUnit: number;  // Energy per unit of deployment
  priorityTier: 1 | 2 | 3 | 4;
  description: string;
}> = {
  // TIER 3: Climate technologies (10-20% surplus)
  'dac': {
    tWhPerUnit: 15_000,  // 1,500 kWh/tCO2 * 10 GtCO2/year (mid-range)
    priorityTier: 3,
    description: 'Direct Air Capture at gigatonne scale'
  },
  'green-hydrogen': {
    tWhPerUnit: 5_250,  // 52.5 kWh/kg * 100 Mt/year
    priorityTier: 3,
    description: 'Green hydrogen production'
  },
  'sai': {
    tWhPerUnit: 100,  // Solar geoengineering (low energy)
    priorityTier: 3,
    description: 'Stratospheric Aerosol Injection'
  },
  'carbon-mineralization': {
    tWhPerUnit: 8_000,  // Enhanced weathering at scale
    priorityTier: 3,
    description: 'Enhanced weathering and mineralization'
  },

  // TIER 4: AI/compute expansion (5-10% surplus)
  'ai-datacenter': {
    tWhPerUnit: 437.5,  // Mid-point of 415-460 TWh baseline (2024)
    priorityTier: 4,
    description: 'AI datacenter operations'
  },
  'advanced-compute': {
    tWhPerUnit: 200,  // Additional compute for research/simulation
    priorityTier: 4,
    description: 'Advanced scientific computing'
  },

  // TIER 2: High priority infrastructure (30-40%)
  'industrial-electrification': {
    tWhPerUnit: 3_000,  // Industry transition to electric
    priorityTier: 2,
    description: 'Industrial sector electrification'
  },
  'transport-electrification': {
    tWhPerUnit: 2_500,  // EV charging infrastructure
    priorityTier: 2,
    description: 'Transport sector electrification'
  },

  // TIER 1: Essential services (40-50%)
  // Note: These are baseline allocations, not additional demand
  'baseline-essential': {
    tWhPerUnit: 14_500,  // 50% of 29,000 TWh baseline
    priorityTier: 1,
    description: 'Healthcare, food systems, water, housing'
  }
};

// Effectiveness exponent: (allocated / demand)^exponent
// Research: Section 2.4 (tech-specific 1.0-1.3, conservative 1.2)
const EFFECTIVENESS_EXPONENT = 1.2;

// Annual electricity growth rate (2-6% depending on scenario)
// Research: IEA WEO 2024 - STEPS 2-3%, Net Zero 4-6%
const ELECTRICITY_GROWTH_RATE = 0.03; // 3% conservative default

export class EnergyBudgetPhase implements SimulationPhase {
  readonly id = 'energy-budget';
  readonly name = 'Energy Budget Allocation';
  readonly order = 12.75; // After tech-tree (12.5), meaning-renaissance (12.7), before ClimateDeploymentPhase (12.8)
  readonly dependencies = ['tech-tree'];

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // Feature flag check
    if (!state.energyBudget?.enabled) {
      return { events: [] };
    }

    // Step 0: Grow global capacity annually
    this.updateGlobalCapacity(state);

    // Step 1: Calculate energy demand from active technologies
    const demands = this.calculateEnergyDemands(state);

    // Step 2: Check if demand exceeds capacity
    const totalDemand = Object.values(demands).reduce((sum, d) => sum + d.demandTWh, 0);
    let totalCapacity = assertFinite(
      state.energyBudget.globalCapacity.totalTWh,
      {
        location: 'EnergyBudgetPhase.execute',
        valueName: 'totalCapacity',
        month: state.currentMonth,
    }
    );

    // INTEGRATION FIX (M-1): Cross-link with PowerGenerationSystem datacenter constraint
    // When datacenters are consuming too much power (20-30%+ of global electricity),
    // reduce available capacity for allocation to reflect the political/grid reality.
    // This prevents EnergyBudgetPhase from allocating power that PowerGenerationSystem
    // has already determined is unavailable due to datacenter saturation.
    //
    // Research: powerGeneration.ts:604-656 (20% soft threshold, 30% hard threshold)
    // Constraint severity: 0 (no constraint) → 1.0 (maximum constraint)
    if (state.powerGenerationSystem?.energyConstraintActive) {
      const constraintSeverity = assertStateProperty(
        state.powerGenerationSystem,
        'constraintSeverity',
        {
          location: 'EnergyBudgetPhase.execute',
          month: state.currentMonth,
        }
      );

      // Reduce available capacity proportionally to constraint severity
      // Severity 0.0 → no reduction (100% available)
      // Severity 0.5 → 50% reduction (soft constraint zone)
      // Severity 1.0 → 100% reduction (hard constraint, no surplus available)
      const datacenterReservedFraction = assertInRange(
        constraintSeverity,
        0,
        1,
        {
          location: 'EnergyBudgetPhase.execute',
          valueName: 'datacenterReservedFraction',
          month: state.currentMonth,
        }
      );

      const reducedCapacity = totalCapacity * (1.0 - datacenterReservedFraction * 0.5);

      console.log(`⚡ Datacenter constraint active (severity ${(constraintSeverity * 100).toFixed(0)}%)`);
      console.log(`  Capacity reduced: ${totalCapacity.toFixed(0)} → ${reducedCapacity.toFixed(0)} TWh`);

      totalCapacity = assertFinite(
        reducedCapacity,
        {
          location: 'EnergyBudgetPhase.execute',
          valueName: 'reducedCapacity',
          month: state.currentMonth,
          additionalInfo: { originalCapacity: totalCapacity, constraintSeverity }
        }
      );
    }

    const surplus = totalCapacity - totalDemand;

    // Step 3: Allocate energy by priority tier
    const allocations = this.allocateEnergyByPriority(state, demands, totalCapacity);

    // Step 4: Calculate effectiveness multipliers
    for (const [techCategory, allocation] of Object.entries(allocations)) {
      const demand = demands[techCategory].demandTWh;
      if (demand > 0) {
        const ratio = allocation.allocatedTWh / demand;
        allocation.effectivenessMultiplier = assertFinite(
          Math.pow(ratio, EFFECTIVENESS_EXPONENT),
          {
            location: 'EnergyBudgetPhase.execute',
            valueName: 'effectivenessMultiplier',
            month: state.currentMonth,
          }
        );
      } else {
        allocation.effectivenessMultiplier = 1.0; // No demand = no constraint
      }
    }

    // Update state
    state.energyBudget.allocations = allocations;
    state.energyBudget.conflicts = {
      totalDemandTWh: assertFinite(totalDemand, {
        location: 'EnergyBudgetPhase.execute',
        valueName: 'totalDemandTWh',
        month: state.currentMonth
      }),
      surplusDeficitTWh: assertFinite(surplus, {
        location: 'EnergyBudgetPhase.execute',
        valueName: 'surplusDeficitTWh',
        month: state.currentMonth
      }),
      competingTechs: Object.entries(allocations)
        .filter(([_, alloc]) => alloc.allocatedTWh < alloc.demandTWh)
        .map(([tech, _]) => tech)
    };

    // Log conflicts if any
    if (surplus < 0) {
      console.log(`⚠️ Energy deficit: ${Math.abs(surplus).toFixed(0)} TWh`);
      console.log(`  Competing techs: ${state.energyBudget.conflicts.competingTechs.join(', ')}`);
    }

    return { events: [] };
  }

  /**
   * Update global electricity capacity with annual growth
   */
  private updateGlobalCapacity(state: GameState): void {
    if (!state.energyBudget) return;

    // Grow capacity annually (not every month)
    const monthsPerYear = 12;
    const monthlyGrowth = Math.pow(1 + ELECTRICITY_GROWTH_RATE, 1 / monthsPerYear);

    const capacity = state.energyBudget.globalCapacity;
    capacity.totalTWh = assertFinite(
      capacity.totalTWh * monthlyGrowth,
      {
        location: 'EnergyBudgetPhase.updateGlobalCapacity',
        valueName: 'totalTWh',
        month: state.currentMonth,
        additionalInfo: { monthlyGrowth }
      }
    );

    // Assume clean energy grows faster (transition scenario)
    const cleanGrowthMultiplier = 1.5; // Clean grows 50% faster
    capacity.cleanTWh = assertFinite(
      capacity.cleanTWh * monthlyGrowth * cleanGrowthMultiplier,
      {
        location: 'EnergyBudgetPhase.updateGlobalCapacity',
        valueName: 'cleanTWh',
        month: state.currentMonth
      }
    );

    // Update fossil (total - clean)
    capacity.fossilTWh = assertFinite(
      capacity.totalTWh - capacity.cleanTWh,
      {
        location: 'EnergyBudgetPhase.updateGlobalCapacity',
        valueName: 'fossilTWh',
        month: state.currentMonth
      }
    );
  }

  /**
   * Calculate energy demand from active technologies
   */
  private calculateEnergyDemands(state: GameState): Record<string, {
    demandTWh: number;
    priorityTier: 1 | 2 | 3 | 4;
  }> {
    const demands: Record<string, { demandTWh: number; priorityTier: 1 | 2 | 3 | 4 }> = {};

    // Baseline essential services (always active)
    demands['baseline-essential'] = {
      demandTWh: TECH_ENERGY_REQUIREMENTS['baseline-essential'].tWhPerUnit,
      priorityTier: 1
    };

    // Check deployed technologies from tech tree state
    const deployedTechs = state.techTreeState?.deployedTechMap || {};

    for (const [techId, deploymentLevel] of Object.entries(deployedTechs)) {
      if (deploymentLevel === 0) continue;

      // Map tech ID to energy category
      const energyCategory = mapTechToEnergyCategory(techId);
      if (!energyCategory) continue;

      const requirement = TECH_ENERGY_REQUIREMENTS[energyCategory];
      if (!requirement) continue;

      // Calculate demand (scaled by deployment level)
      const demand = requirement.tWhPerUnit * deploymentLevel;

      demands[energyCategory] = {
        demandTWh: assertFinite(demand, {
          location: 'EnergyBudgetPhase.calculateEnergyDemands',
          valueName: 'demandTWh',
          month: state.currentMonth,
        }),
        priorityTier: requirement.priorityTier
      };
    }

    return demands;
  }

  /**
   * Allocate energy by priority tier
   * Tier 1 (essential) gets first claim, then tier 2, 3, 4
   */
  private allocateEnergyByPriority(
    state: GameState,
    demands: Record<string, { demandTWh: number; priorityTier: 1 | 2 | 3 | 4 }>,
    totalCapacity: number
  ): Record<string, {
    demandTWh: number;
    allocatedTWh: number;
    effectivenessMultiplier: number;
    priorityTier: 1 | 2 | 3 | 4;
  }> {
    const allocations: Record<string, {
      demandTWh: number;
      allocatedTWh: number;
      effectivenessMultiplier: number;
      priorityTier: 1 | 2 | 3 | 4;
    }> = {};

    let remainingCapacity = totalCapacity;

    // Process each tier in order (1 → 2 → 3 → 4)
    for (let tier = 1; tier <= 4; tier++) {
      const tierDemands = Object.entries(demands).filter(([_, d]) => d.priorityTier === tier);

      for (const [techCategory, demand] of tierDemands) {
        const allocated = Math.min(demand.demandTWh, remainingCapacity);

        allocations[techCategory] = {
          demandTWh: demand.demandTWh,
          allocatedTWh: assertFinite(allocated, {
            location: 'EnergyBudgetPhase.allocateEnergyByPriority',
            valueName: 'allocatedTWh',
            month: state.currentMonth,
            additionalInfo: { techCategory, tier, remainingCapacity }
          }),
          effectivenessMultiplier: 1.0, // Calculated in step 4
          priorityTier: tier as 1 | 2 | 3 | 4
        };

        remainingCapacity = assertFinite(
          remainingCapacity - allocated,
          {
            location: 'EnergyBudgetPhase.allocateEnergyByPriority',
            valueName: 'remainingCapacity',
            month: state.currentMonth,
            additionalInfo: { techCategory, allocated }
          }
        );

        // Stop if capacity exhausted
        if (remainingCapacity <= 0) {
          remainingCapacity = 0;
          break;
        }
      }
    }

    return allocations;
  }
}

export const energyBudgetPhase = new EnergyBudgetPhase();
