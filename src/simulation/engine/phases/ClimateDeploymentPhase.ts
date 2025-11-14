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
 * **EXECUTION ORDER:** 8.5 (After TechnologyDeploymentPhase, before climate effects)
 * **DEPENDENCIES:** Requires energySystem, breakthrough technologies
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

import { GameState, SimulationPhase, PhaseResult, RNGFunction } from '@/types/game';
import { assertFinite, assertDefined, assertInRange } from '@/simulation/utils/assertions';
import type { TechnologyNode } from '@/types/technologies';

export class ClimateDeploymentPhase implements SimulationPhase {
  readonly id = 'climate-deployment';
  readonly name = 'Climate Technology Deployment';
  readonly order = 8.5;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    const events: string[] = [];

    // Step 1: Calculate renewable surplus
    const renewableSurplus = this.calculateRenewableSurplus(state);

    // Step 2: Partition energy
    this.partitionEnergy(state, renewableSurplus);

    // Step 3-7: Update each climate technology
    const climateTechs = this.getClimateTechnologies(state);

    for (const tech of climateTechs) {
      if (!tech.deploymentPhase || !tech.unlocked) {
        continue; // Skip if no deployment tracking or not unlocked
      }

      // Step 3: Check energy availability
      const energyAllocated = this.allocateEnergy(state, tech);

      // Advance phase if energy available
      if (energyAllocated > 0 && tech.deploymentTimeline) {
        const phaseAdvanced = this.advancePhase(state, tech, energyAllocated, events);

        if (phaseAdvanced) {
          // Step 6: Log phase transition
          events.push(`🌍⚡ ${tech.name}: ${tech.deploymentPhase} phase (${tech.phaseProgress?.toFixed(1)}% progress)`);
        }
      }

      // Step 4: Calculate deployment-adjusted effectiveness
      const phaseMultiplier = this.getPhaseMultiplier(tech);
      const energyMultiplier = this.getEnergyMultiplier(tech, energyAllocated);

      // Apply multipliers to base deployment level
      // (Base deploymentLevel is set by technology unlock/research)
      // Phase multiplier scales effectiveness based on deployment stage
      const adjustedEffectiveness = assertInRange(
        tech.deploymentLevel * phaseMultiplier * energyMultiplier,
        0,
        1,
        {
          location: 'ClimateDeploymentPhase.execute',
          valueName: 'adjustedEffectiveness',
          month: state.currentMonth,
          additionalInfo: {
            techId: tech.id,
            baseDeployment: tech.deploymentLevel,
            phaseMultiplier,
            energyMultiplier,
          },
        }
      );

      // Step 5: Apply to climate boundary (effects engine handles this)
      // Note: We update the tech's effective deployment level, effects engine applies it
      // Store original deploymentLevel if not already stored
      if (!(tech as any).baseDeploymentLevel) {
        (tech as any).baseDeploymentLevel = tech.deploymentLevel;
      }

      // Temporarily update deployment level for effects calculation
      tech.deploymentLevel = adjustedEffectiveness;
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
   * @param tech Technology node
   * @returns TWh allocated to this tech
   */
  private allocateEnergy(state: GameState, tech: TechnologyNode): number {
    const { energy } = state.resourceEconomy;

    if (!energy.partitioning || !tech.energyRequirement) {
      return 0;
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
   * @param tech Technology node
   * @param energyAllocated TWh allocated this month
   * @param events Event log
   * @returns True if phase advanced
   */
  private advancePhase(
    state: GameState,
    tech: TechnologyNode,
    energyAllocated: number,
    events: string[]
  ): boolean {
    if (!tech.deploymentPhase || !tech.deploymentTimeline || !tech.energyRequirement) {
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

      events.push(`🌍💡 ${tech.name}: Phase transition ${oldPhase} → ${tech.deploymentPhase}`);
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
   * @param tech Technology node
   * @returns Multiplier [0, 1]
   */
  private getPhaseMultiplier(tech: TechnologyNode): number {
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
   * Linear scaling: energy_allocated / energy_required
   * (Simplified model - future enhancement: threshold effects)
   *
   * @param tech Technology node
   * @param energyAllocated TWh allocated
   * @returns Multiplier [0, 1]
   */
  private getEnergyMultiplier(tech: TechnologyNode, energyAllocated: number): number {
    if (!tech.energyRequirement || tech.energyRequirement === 0) {
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
      },
    });
  }

  /**
   * Get all climate-related technologies
   *
   * @param state Game state
   * @returns Array of climate technology nodes
   */
  private getClimateTechnologies(state: GameState): TechnologyNode[] {
    const techs: TechnologyNode[] = [];
    const { breakthroughTechnologies } = state;

    // Add environmental technologies
    if (breakthroughTechnologies.carbonCapture) {
      techs.push(breakthroughTechnologies.carbonCapture);
    }
    if (breakthroughTechnologies.cleanEnergy) {
      techs.push(breakthroughTechnologies.cleanEnergy);
    }
    if (breakthroughTechnologies.ecosystemManagement) {
      techs.push(breakthroughTechnologies.ecosystemManagement);
    }
    if (breakthroughTechnologies.sustainableAgriculture) {
      techs.push(breakthroughTechnologies.sustainableAgriculture);
    }
    if (breakthroughTechnologies.fusionPower) {
      techs.push(breakthroughTechnologies.fusionPower);
    }

    // Add optional climate technologies (TIER 1+)
    if (breakthroughTechnologies.advancedDirectAirCapture) {
      // This is a simple boolean flag, skip for now
      // Future: convert to TechnologyNode
    }

    return techs;
  }
}
