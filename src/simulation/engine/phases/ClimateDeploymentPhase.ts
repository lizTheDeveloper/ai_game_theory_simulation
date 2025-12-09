/**
 * ClimateDeploymentPhase
 *
 * Implements phased deployment timescales, energy budget constraints, and
 * deployment-adjusted effectiveness for climate technologies.
 *
 * Addresses TIER 1 CRITICAL issue: 5.5% climate tech effectiveness gap
 *
 * **Research Foundation:** research/climate_deployment_timescales_20251113.md
 * **Implementation Plan:** plans/climate_phased_deployment_model_20251113.md
 *
 * **EXECUTION ORDER:** 12.8 (After tech-tree 12.5, before environmental effects)
 * **DEPENDENCIES:** tech-tree (12.5) - Requires energySystem, breakthrough technologies
 * **SIDE EFFECTS:**
 * - Updates technology deployment phases
 * - Partitions renewable energy budget
 * - Adjusts technology effectiveness by deployment progress
 *
 * **7-Step Phase Logic:**
 * 1. Calculate renewable surplus (renewable_capacity - baseline_consumption)
 * 2. Partition energy: baseline (60%) → deployment (30%) → operation (10%)
 * 3. For each climate tech: advance phase if energy available
 * 4. Calculate deployment-adjusted effectiveness (phase multiplier)
 * 5. Apply effectiveness to climate boundary
 * 6. Log phase transitions (planning → pilot → scaling → mature)
 * 7. Update energy partitioning for next month
 */

import { GameState, SimulationPhase, PhaseResult, RNGFunction, GameEvent } from '@/types/game';
import { assertFinite, assertDefined, assertInRange } from '@/simulation/utils/assertions';
import { getTechById, type TechDefinition } from '@/simulation/techTree/comprehensiveTechTree';
import { addSimulationEvent } from '@/simulation/utils/eventLogger';

export class ClimateDeploymentPhase implements SimulationPhase {
  readonly id = 'climate-deployment';
  readonly name = 'Climate Technology Deployment';
  readonly order = 12.8; // After tech-tree (12.5), stochastic-innovation (12.6), meaning-renaissance (12.7)
  readonly dependencies = ['tech-tree']; // Reads tech tree, energy system, updates deployment levels (fixed: technology-deployment → tech-tree)

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    const events: GameEvent[] = [];

    // Step 1: Calculate renewable surplus
    const renewableSurplus = this.calculateRenewableSurplus(state);

    // Step 2: Partition energy
    this.partitionEnergy(state, renewableSurplus);

    // Step 3-7: Update each climate technology
    const climateTechs = this.getClimateTechnologies(state);

    for (const tech of climateTechs) {
      if (!tech.deploymentPhase) {
        continue; // Skip if no deployment tracking
      }

      // Step 3: Check energy availability
      const energyAllocated = this.allocateEnergy(state, tech);

      // Advance phase if energy available
      if (energyAllocated > 0 && tech.deploymentTimeline) {
        const phaseAdvanced = this.advancePhase(state, tech, energyAllocated);

        if (phaseAdvanced) {
          // Step 6: Log phase transition
          addSimulationEvent(state, {
            type: 'deployment',
            severity: 'info',
            agent: 'climate-deployment',
            title: `🌍⚡ ${tech.name}: ${tech.deploymentPhase} phase`,
            description: `Phase progress: ${tech.phaseProgress?.toFixed(1)}%, energy allocated: ${energyAllocated.toFixed(1)} TWh`,
            effects: {
              techId: tech.id,
              phase: tech.deploymentPhase || 'unknown',
              progress: tech.phaseProgress || 0,
              energyAllocated,
            },
          });
          // Event is automatically added to state.eventLog, get the last one
          const event = state.eventLog[state.eventLog.length - 1];
          events.push(event);
        }
      }

      // Step 4: Calculate deployment-adjusted effectiveness
      const phaseMultiplier = this.getPhaseMultiplier(tech);
      const energyMultiplier = this.getEnergyMultiplier(state, tech, energyAllocated);

      // Apply multipliers to base deployment level
      const baseDeployment = this.getTechDeploymentLevel(state, tech.id);
      const adjustedEffectiveness = assertInRange(
        baseDeployment * phaseMultiplier * energyMultiplier,
        0,
        1,
        {
          location: 'ClimateDeploymentPhase.execute',
          valueName: 'adjustedEffectiveness',
          month: state.currentMonth,
          additionalInfo: {
            techId: tech.id,
            baseDeployment,
            phaseMultiplier,
            energyMultiplier,
          },
        }
      );

      // Step 5: Update deployment level in tech tree state
      this.updateTechDeploymentLevel(state, tech.id, adjustedEffectiveness);
    }

    // Step 7: Energy partitioning already updated for next month

    return { events };
  }

  /**
   * Step 1: Calculate renewable energy surplus
   *
   * Surplus = renewable_generation - baseline_demand
   *
   * @param state Game state
   * @returns TWh available for climate tech deployment
   */
  private calculateRenewableSurplus(state: GameState): number {
    const { energy } = state.resourceEconomy;

    // Calculate renewable generation (TWh/month)
    const renewableGeneration = assertFinite(
      energy.totalProduction * (energy.renewablePercentage / 100),
      {
        location: 'ClimateDeploymentPhase.calculateRenewableSurplus',
        valueName: 'renewableGeneration',
        month: state.currentMonth,
        additionalInfo: {
          totalProduction: energy.totalProduction,
          renewablePercentage: energy.renewablePercentage,
        },
      }
    );

    // Baseline demand (existing civilization needs)
    const baselineDemand = assertFinite(
      energy.totalDemand,
      {
        location: 'ClimateDeploymentPhase.calculateRenewableSurplus',
        valueName: 'baselineDemand',
        month: state.currentMonth,
      }
    );

    // Surplus is what's left for new applications
    const surplus = Math.max(0, renewableGeneration - baselineDemand);

    return assertFinite(surplus, {
      location: 'ClimateDeploymentPhase.calculateRenewableSurplus',
      valueName: 'surplus',
      month: state.currentMonth,
      additionalInfo: {
        renewableGeneration,
        baselineDemand,
      },
    });
  }

  /**
   * Step 2: Partition renewable surplus
   *
   * Priority allocation:
   * - Baseline: 60% (existing civilization needs - already accounted for)
   * - Deployment: 30% (building new climate tech infrastructure)
   * - Operation: 10% (running deployed climate tech)
   *
   * @param state Game state
   * @param surplus TWh available
   */
  private partitionEnergy(state: GameState, surplus: number): void {
    const { energy } = state.resourceEconomy;

    // Initialize partitioning if not present
    if (!energy.partitioning) {
      energy.partitioning = {
        baseline: energy.totalDemand,
        deployment: 0,
        operation: 0,
      };
    }

    // Allocate surplus to deployment and operation
    // Model assumption: 75% to deployment, 25% to operation
    // (Deployment needs more energy during scale-up phase)
    energy.partitioning.deployment = assertFinite(surplus * 0.75, {
      location: 'ClimateDeploymentPhase.partitionEnergy',
      valueName: 'deployment',
      month: state.currentMonth,
    });

    energy.partitioning.operation = assertFinite(surplus * 0.25, {
      location: 'ClimateDeploymentPhase.partitionEnergy',
      valueName: 'operation',
      month: state.currentMonth,
    });

    energy.renewableSurplus = surplus;
  }

  /**
   * Step 3: Allocate energy to specific technology
   *
   * Proportional allocation from deployment/operation budgets
   *
   * @param state Game state
   * @param tech Technology definition
   * @returns TWh allocated to this tech
   */
  private allocateEnergy(state: GameState, tech: TechDefinition): number {
    const { energy } = state.resourceEconomy;

    if (!energy.partitioning || !tech.energyRequirement) {
      return 0;
    }

    // Energy requirement must be a number (TWh/month), not an object
    if (typeof tech.energyRequirement !== 'number') {
      return 0; // Cleanup techs use different energy model
    }

    // Determine if tech is in deployment phase (building) or operational phase (running)
    const isDeployment = tech.deploymentPhase === 'planning' ||
                         tech.deploymentPhase === 'pilot' ||
                         tech.deploymentPhase === 'early_deploy' ||
                         tech.deploymentPhase === 'scaling';

    const budget = isDeployment ? energy.partitioning.deployment : energy.partitioning.operation;
    const requirement = tech.energyRequirement;

    // For now, simple proportional allocation
    // Future enhancement: priority-based allocation
    return Math.min(budget, requirement);
  }

  /**
   * Advance technology through deployment phases
   *
   * Phase progression: planning → pilot → early_deploy → scaling → mature → saturated
   *
   * @param state Game state
   * @param tech Technology definition
   * @param energyAllocated TWh allocated this month
   * @returns True if phase advanced
   */
  private advancePhase(
    state: GameState,
    tech: TechDefinition,
    energyAllocated: number
  ): boolean {
    if (!tech.deploymentPhase || !tech.deploymentTimeline || !tech.energyRequirement) {
      return false;
    }

    // Energy requirement must be a number for this calculation
    if (typeof tech.energyRequirement !== 'number') {
      return false;
    }

    // Initialize phaseProgress if not set
    if (tech.phaseProgress === undefined) {
      tech.phaseProgress = 0;
    }

    // Calculate progress increment
    // Progress = (energy_allocated / energy_required) / phase_duration
    const phaseDuration = tech.deploymentTimeline[tech.deploymentPhase] || 1;
    const energyRatio = energyAllocated / tech.energyRequirement;
    const progressIncrement = (energyRatio / phaseDuration) * 100; // Convert to percentage

    tech.phaseProgress = assertInRange(
      tech.phaseProgress + progressIncrement,
      0,
      200, // Allow >100% (will transition to next phase)
      {
        location: 'ClimateDeploymentPhase.advancePhase',
        valueName: 'phaseProgress',
        month: state.currentMonth,
        additionalInfo: {
          techId: tech.id,
          phase: tech.deploymentPhase,
          increment: progressIncrement,
        },
      }
    );

    // Check for phase transition
    if (tech.phaseProgress >= 100) {
      const oldPhase = tech.deploymentPhase;
      tech.phaseProgress = 0; // Reset progress

      // Advance to next phase
      switch (tech.deploymentPhase) {
        case 'planning':
          tech.deploymentPhase = 'pilot';
          break;
        case 'pilot':
          tech.deploymentPhase = 'early_deploy';
          break;
        case 'early_deploy':
          tech.deploymentPhase = 'scaling';
          break;
        case 'scaling':
          tech.deploymentPhase = 'mature';
          break;
        case 'mature':
          tech.deploymentPhase = 'saturated';
          tech.phaseProgress = 100; // Stay at 100%
          break;
        case 'saturated':
          // Already at max
          tech.phaseProgress = 100;
          break;
      }

      console.log(`🌍💡 ${tech.name}: Phase transition ${oldPhase} → ${tech.deploymentPhase}`);
      return true;
    }

    return false;
  }

  /**
   * Step 4: Calculate deployment phase effectiveness multiplier
   *
   * Deployment multipliers (research-backed, IPCC AR6):
   * - Planning: 0% (research only, no deployment)
   * - Pilot: 5% (proof of concept, 1 Mt/yr scale)
   * - Early Deploy: 15% (first GW/Gt scale, 10 Mt/yr)
   * - Scaling: 40% (10GW/10Gt scale, 1 Gt/yr)
   * - Mature: 80% (100GW/100Gt scale, 10 Gt/yr)
   * - Saturated: 100% (planetary scale, maximum effectiveness)
   *
   * @param tech Technology definition
   * @returns Multiplier [0, 1]
   */
  private getPhaseMultiplier(tech: TechDefinition): number {
    if (!tech.deploymentPhase) {
      return 0; // No deployment tracking = no effectiveness
    }

    const progress = (tech.phaseProgress || 0) / 100; // Convert to [0, 1]

    switch (tech.deploymentPhase) {
      case 'planning':
        return 0; // Research phase, no deployment

      case 'pilot':
        // Linear 0% → 5% over pilot phase
        return assertInRange(0.05 * progress, 0, 0.05, {
          location: 'ClimateDeploymentPhase.getPhaseMultiplier',
          valueName: 'pilot_multiplier',
          month: 0,
        });

      case 'early_deploy':
        // Linear 5% → 15% over early deployment
        return assertInRange(0.05 + (0.10 * progress), 0, 0.15, {
          location: 'ClimateDeploymentPhase.getPhaseMultiplier',
          valueName: 'early_deploy_multiplier',
          month: 0,
        });

      case 'scaling':
        // Linear 15% → 40% over scaling phase
        return assertInRange(0.15 + (0.25 * progress), 0, 0.40, {
          location: 'ClimateDeploymentPhase.getPhaseMultiplier',
          valueName: 'scaling_multiplier',
          month: 0,
        });

      case 'mature':
        // Linear 40% → 80% over maturity phase
        return assertInRange(0.40 + (0.40 * progress), 0, 0.80, {
          location: 'ClimateDeploymentPhase.getPhaseMultiplier',
          valueName: 'mature_multiplier',
          month: 0,
        });

      case 'saturated':
        // Linear 80% → 100% in saturated phase
        return assertInRange(0.80 + (0.20 * progress), 0, 1.0, {
          location: 'ClimateDeploymentPhase.getPhaseMultiplier',
          valueName: 'saturated_multiplier',
          month: 0,
        });

      default:
        return 0;
    }
  }

  /**
   * Calculate energy constraint multiplier
   *
   * UPDATED (Dec 9, 2025): Check EnergyBudgetPhase allocations first
   *
   * Linear scaling: energy_allocated / energy_required
   * (Simplified model - future enhancement: threshold effects)
   *
   * @param state Game state
   * @param tech Technology definition
   * @param energyAllocated TWh allocated (legacy, from old energy system)
   * @returns Multiplier [0, 1]
   */
  private getEnergyMultiplier(state: GameState, tech: TechDefinition, energyAllocated: number): number {
    // Check if energy budget system is enabled (Dec 9, 2025)
    if (state.energyBudget?.enabled) {
      // Map tech ID to energy category
      const category = this.mapTechToEnergyCategory(tech.id);
      if (category && state.energyBudget.allocations[category]) {
        const allocation = state.energyBudget.allocations[category];
        return assertInRange(allocation.effectivenessMultiplier, 0, 1, {
          location: 'ClimateDeploymentPhase.getEnergyMultiplier',
          valueName: 'energyMultiplier',
          month: state.currentMonth,
          additionalInfo: {
            techId: tech.id,
            category,
            effectivenessMultiplier: allocation.effectivenessMultiplier,
            source: 'EnergyBudgetPhase'
          },
        });
      }
    }

    // Fallback to legacy energy system (pre-Dec 9, 2025)
    if (!tech.energyRequirement || typeof tech.energyRequirement !== 'number' || tech.energyRequirement === 0) {
      return 1.0; // No energy constraint
    }

    const multiplier = Math.min(1.0, energyAllocated / tech.energyRequirement);

    return assertInRange(multiplier, 0, 1, {
      location: 'ClimateDeploymentPhase.getEnergyMultiplier',
      valueName: 'energyMultiplier',
      month: 0,
      additionalInfo: {
        techId: tech.id,
        energyAllocated,
        energyRequired: tech.energyRequirement,
        source: 'legacy'
      },
    });
  }

  /**
   * Map technology ID to energy category (matches EnergyBudgetPhase mapping)
   */
  private mapTechToEnergyCategory(techId: string): string | null {
    // Climate technologies
    if (techId.includes('dac') || techId.includes('air-capture') || techId.includes('direct_air_capture')) return 'dac';
    if (techId.includes('hydrogen')) return 'green-hydrogen';
    if (techId.includes('sai') || techId.includes('geoengineering')) return 'sai';
    if (techId.includes('mineralization') || techId.includes('weathering')) return 'carbon-mineralization';

    // AI/compute
    if (techId.includes('ai-') || techId.includes('datacenter')) return 'ai-datacenter';
    if (techId.includes('compute') || techId.includes('simulation')) return 'advanced-compute';

    // Infrastructure
    if (techId.includes('industrial') || techId.includes('manufacturing')) return 'industrial-electrification';
    if (techId.includes('transport') || techId.includes('ev') || techId.includes('clean_energy_package')) return 'transport-electrification';

    return null; // Technology doesn't have energy requirements
  }

  /**
   * Get all climate-related technologies
   *
   * Climate tech IDs from comprehensiveTechTree.ts:
   * - direct_air_capture (deployed_2025)
   * - clean_energy_package (TIER 1)
   * - fusion_power (TIER 1)
   * - carbon_mineralization (TIER 2)
   * - ocean_alkalinity (TIER 2)
   * - gigatonne_direct_air_capture (TIER 3)
   * - space_based_solar (TIER 3)
   * - advanced_carbon_sequestration (TIER 3)
   * - planetary_carbon_management (TIER 4)
   * - climate_system_control (TIER 4)
   *
   * @param state Game state
   * @returns Array of climate technology definitions
   */
  private getClimateTechnologies(state: GameState): TechDefinition[] {
    const techs: TechDefinition[] = [];

    // Climate tech IDs (only get unlocked ones)
    const climateTechIds = [
      'direct_air_capture',
      'clean_energy_package',
      'fusion_power',
      'carbon_mineralization',
      'ocean_alkalinity',
      'gigatonne_direct_air_capture',
      'space_based_solar',
      'advanced_carbon_sequestration',
      'planetary_carbon_management',
      'climate_system_control',
    ];

    for (const techId of climateTechIds) {
      // Check if unlocked
      if (state.techTreeState.unlockedTech.includes(techId)) {
        const techDef = getTechById(techId);
        if (techDef) {
          techs.push(techDef);
        }
      }
    }

    return techs;
  }

  /**
   * Get global deployment level for a technology
   *
   * @param state Game state
   * @param techId Technology ID
   * @returns Deployment level [0, 1]
   */
  private getTechDeploymentLevel(state: GameState, techId: string): number {
    // HIGH PERFORMANCE FIX (Nov 20, 2025): Use O(1) lookup instead of O(n) find()
    const { getTechDeployment } = require('../../techTree/engine');
    return getTechDeployment(state.techTreeState, techId);
  }

  /**
   * Update global deployment level for a technology
   *
   * @param state Game state
   * @param techId Technology ID
   * @param level New deployment level [0, 1]
   */
  private updateTechDeploymentLevel(state: GameState, techId: string, level: number): void {
    // Ensure global deployment array exists
    if (!state.techTreeState.regionalDeployment['global']) {
      state.techTreeState.regionalDeployment['global'] = [];
    }

    const globalDeployments = state.techTreeState.regionalDeployment['global'];
    // No index - domain-specific search (regional deployment records)
    const deployment = globalDeployments.find(d => d.techId === techId);

    if (deployment) {
      // Update existing deployment
      deployment.deploymentLevel = level;
    } else {
      // Create new deployment entry
      globalDeployments.push({
        techId,
        region: 'global',
        deploymentLevel: level,
        monthlyInvestment: 0,
        totalInvested: 0,
        deployedBy: ['climate-deployment-phase'],
        effects: {},
      });
    }

    // HIGH PERFORMANCE FIX (Nov 20, 2025): Update O(1) deployment index
    // Update index immediately so getTechDeploymentLevel returns correct value
    const currentMax = state.techTreeState.deployedTechMap[techId] ?? 0;
    state.techTreeState.deployedTechMap[techId] = Math.max(currentMax, level);
  }
}
