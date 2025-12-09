/**
 * ClimateDeploymentPhase
 *
 * Implements phased deployment timescales and deployment-adjusted effectiveness
 * for climate technologies. Energy allocation handled by EnergyBudgetPhase.
 *
 * Addresses TIER 1 CRITICAL issue: 5.5% climate tech effectiveness gap
 *
 * **Research Foundation:** research/climate_deployment_timescales_20251113.md
 * **Implementation Plan:** plans/climate_phased_deployment_model_20251113.md
 *
 * **EXECUTION ORDER:** 12.8 (After EnergyBudgetPhase 12.75, tech-tree 12.5)
 * **DEPENDENCIES:**
 * - tech-tree (12.5) - Requires breakthrough technologies
 * - EnergyBudgetPhase (12.75) - Reads state.energyBudget.allocations for energy constraints
 * **SIDE EFFECTS:**
 * - Updates technology deployment phases (planning → pilot → scaling → mature)
 * - Adjusts technology effectiveness by deployment progress
 *
 * **INTEGRATION (Dec 9, 2025):**
 * Legacy calculateRenewableSurplus() and partitionEnergy() removed (duplicate calculation).
 * Energy allocation now handled by EnergyBudgetPhase (12.75) which runs BEFORE this phase (12.8).
 * getEnergyMultiplier() reads state.energyBudget.allocations[category].effectivenessMultiplier.
 *
 * **5-Step Phase Logic:**
 * 1. For each climate tech: check energy availability (from EnergyBudgetPhase)
 * 2. Advance phase if energy available
 * 3. Calculate deployment-adjusted effectiveness (phase multiplier)
 * 4. Calculate energy constraint multiplier (from EnergyBudgetPhase allocations)
 * 5. Update deployment level = base * phaseMultiplier * energyMultiplier
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

    // INTEGRATION NOTE (Dec 9, 2025):
    // Energy allocation now handled by EnergyBudgetPhase (order 12.4, runs BEFORE this phase).
    // EnergyBudgetPhase calculates state.energyBudget.allocations[category].effectivenessMultiplier
    // which is consumed by getEnergyMultiplier() below.
    // Legacy calculateRenewableSurplus() and partitionEnergy() removed (duplicate calculation).

    // Step 3-7: Update each climate technology
    const climateTechs = this.getClimateTechnologies(state);

    for (const tech of climateTechs) {
      if (!tech.deploymentPhase) {
        continue; // Skip if no deployment tracking
      }

      // Step 3: Check energy availability
      // INTEGRATION NOTE: When energy budget is enabled, this returns 0 and
      // getEnergyMultiplier() reads from state.energyBudget.allocations instead.
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

  // REMOVED (Dec 9, 2025): calculateRenewableSurplus() - Now handled by EnergyBudgetPhase
  // EnergyBudgetPhase (order 12.4) calculates global capacity and allocations before this phase runs.

  // REMOVED (Dec 9, 2025): partitionEnergy() - Now handled by EnergyBudgetPhase
  // Priority-based allocation (essential → high → climate → elective) is in EnergyBudgetPhase.

  /**
   * Step 3: Allocate energy to specific technology
   *
   * INTEGRATION NOTE (Dec 9, 2025):
   * When state.energyBudget is enabled, this returns 0 because energy allocation
   * is handled by EnergyBudgetPhase (order 12.4). The effectivenessMultiplier from
   * EnergyBudgetPhase is consumed by getEnergyMultiplier() instead.
   *
   * When energy budget is NOT enabled, falls back to legacy tech.energyRequirement
   * (for backwards compatibility during transition).
   *
   * @param state Game state
   * @param tech Technology definition
   * @returns TWh allocated to this tech (0 if energy budget enabled)
   */
  private allocateEnergy(state: GameState, tech: TechDefinition): number {
    // NEW INTEGRATION: If energy budget system is active, energy allocation
    // is already handled by EnergyBudgetPhase. Return 0 here, getEnergyMultiplier()
    // will read from state.energyBudget.allocations[category].effectivenessMultiplier.
    if (state.energyBudget?.enabled) {
      return 0;
    }

    // LEGACY FALLBACK (pre-Dec 9, 2025): Use tech.energyRequirement
    // This code path preserved for backwards compatibility during transition.
    if (!tech.energyRequirement || typeof tech.energyRequirement !== 'number') {
      return 0;
    }

    // Return the tech's energy requirement as a simple allocation
    // (No partitioning system - that was removed)
    return tech.energyRequirement;
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
