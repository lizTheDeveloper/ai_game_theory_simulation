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
 * **ARCHITECTURE FIX H-2 (Dec 9, 2025):** Removed legacy energy allocation, now uses EnergyBudgetPhase
 *
 * **EXECUTION ORDER:** 12.8 (After EnergyBudgetPhase 12.75, before environmental effects)
 * **DEPENDENCIES:**
 * - tech-tree (12.5) - Requires breakthrough technologies
 * - energy-budget (12.75) - Consumes energy allocations
 *
 * **SIDE EFFECTS:**
 * - Updates technology deployment phases (planning → pilot → scaling → mature → saturated)
 * - Adjusts technology effectiveness by deployment progress and energy availability
 *
 * **Phase Logic:**
 * 1. For each climate tech: get energy multiplier from EnergyBudgetPhase allocations
 * 2. Advance deployment phase based on energy availability (faster with more energy)
 * 3. Calculate deployment-adjusted effectiveness (phase multiplier × energy multiplier)
 * 4. Update deployment level in tech tree state
 * 5. Log phase transitions
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

    // Get climate technologies
    const climateTechs = this.getClimateTechnologies(state);

    for (const tech of climateTechs) {
      if (!tech.deploymentPhase) {
        continue; // Skip if no deployment tracking
      }

      // Get energy multiplier from EnergyBudgetPhase allocations
      const energyMultiplier = this.getEnergyMultiplier(state, tech);

      // Advance phase based on energy availability
      if (energyMultiplier > 0 && tech.deploymentTimeline) {
        const phaseAdvanced = this.advancePhase(state, tech, energyMultiplier);

        if (phaseAdvanced) {
          // Log phase transition
          addSimulationEvent(state, {
            type: 'deployment',
            severity: 'info',
            agent: 'climate-deployment',
            title: `🌍⚡ ${tech.name}: ${tech.deploymentPhase} phase`,
            description: `Phase progress: ${tech.phaseProgress?.toFixed(1)}%, energy effectiveness: ${(energyMultiplier * 100).toFixed(0)}%`,
            effects: {
              techId: tech.id,
              phase: tech.deploymentPhase || 'unknown',
              progress: tech.phaseProgress || 0,
              energyMultiplier,
            },
          });
          // Event is automatically added to state.eventLog, get the last one
          const event = state.eventLog[state.eventLog.length - 1];
          events.push(event);
        }
      }

      // Calculate deployment-adjusted effectiveness
      const phaseMultiplier = this.getPhaseMultiplier(tech);

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

      // Update deployment level in tech tree state
      this.updateTechDeploymentLevel(state, tech.id, adjustedEffectiveness);
    }

    return { events };
  }


  /**
   * Advance technology through deployment phases
   *
   * Phase progression: planning → pilot → early_deploy → scaling → mature → saturated
   *
   * @param state Game state
   * @param tech Technology definition
   * @param energyMultiplier Energy effectiveness multiplier [0, 1] from EnergyBudgetPhase
   * @returns True if phase advanced
   */
  private advancePhase(
    state: GameState,
    tech: TechDefinition,
    energyMultiplier: number
  ): boolean {
    if (!tech.deploymentPhase || !tech.deploymentTimeline) {
      return false;
    }

    // Initialize phaseProgress if not set
    if (tech.phaseProgress === undefined) {
      tech.phaseProgress = 0;
    }

    // Calculate progress increment based on energy effectiveness
    // Progress = energyMultiplier / phase_duration * 100
    const phaseDuration = tech.deploymentTimeline[tech.deploymentPhase] || 1;
    const progressIncrement = (energyMultiplier / phaseDuration) * 100; // Convert to percentage

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
   * Get energy effectiveness multiplier from EnergyBudgetPhase
   *
   * ARCHITECTURE FIX H-2 (Dec 9, 2025): Remove legacy energy system, use EnergyBudgetPhase allocations only
   *
   * @param state Game state
   * @param tech Technology definition
   * @returns Multiplier [0, 1]
   */
  private getEnergyMultiplier(state: GameState, tech: TechDefinition): number {
    // Check if energy budget system is available
    if (!state.energyBudget?.enabled || !state.energyBudget.allocations) {
      console.warn(`⚠️ EnergyBudgetPhase not enabled for tech ${tech.id}, assuming full energy availability`);
      return 1.0;
    }

    // Map tech ID to energy category
    const category = this.mapTechToEnergyCategory(tech.id);
    if (!category) {
      // Tech doesn't have energy requirements
      return 1.0;
    }

    const allocation = state.energyBudget.allocations[category];
    if (!allocation) {
      console.warn(`⚠️ No energy allocation for category '${category}' (tech: ${tech.id})`);
      return 0.5; // Default to 50% effectiveness when category missing
    }

    return assertInRange(allocation.effectivenessMultiplier, 0, 1, {
      location: 'ClimateDeploymentPhase.getEnergyMultiplier',
      valueName: 'energyMultiplier',
      month: state.currentMonth,
      additionalInfo: {
        techId: tech.id,
        category,
        effectivenessMultiplier: allocation.effectivenessMultiplier,
        demandTWh: allocation.demandTWh,
        allocatedTWh: allocation.allocatedTWh,
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
