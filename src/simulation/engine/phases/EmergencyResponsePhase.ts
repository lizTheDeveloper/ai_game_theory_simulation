/**
 * Emergency Response Phase
 * FIX #11 (Oct 20, 2025): Fast Crisis Response Using Existing Capabilities
 *
 * Updates active emergency responses and deploys new responses to detected crises.
 * Applies emergency response effectiveness to reduce crisis severity.
 *
 * Research Foundation:
 * - Every 7.49-day delay DOUBLES mortality (Ashraf 2020, COVID data)
 * - Strategic reserves deploy in 12-48 hours (GAO 2020)
 * - Learning effects: 50% improvement after experiencing similar crisis (Katrina → Sandy)
 *
 * Phase Order: 26 (Crisis Detection)
 * - Runs after crisis detection but before crisis escalation
 * - Enables emergency response to mitigate crises before they compound
 */

import { SimulationPhase, PhaseResult, PhaseContext } from '../PhaseOrchestrator';
import { GameState } from '@/types/game';
import { RNGFunction } from '@/types/config';
import {
  updateEmergencyResponses,
  deployEmergencyResponse,
  getActiveResponse,
  updateCrisisExperience,
} from '../../emergencyManagement';

export class EmergencyResponsePhase implements SimulationPhase {
  id = 'emergency_response';
  name = 'Emergency Response';
  order = 26; // After crisis detection (25), before crisis escalation

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    if (!state.emergencyManagement) {
      // Emergency management not initialized - skip
      return { state, events: [] };
    }

    const events: any[] = [];

    // Update existing emergency responses (increment deployment progress)
    updateEmergencyResponses(state);

    // Check for active crises that need emergency response
    this.checkAndDeployEmergencyResponses(state, events);

    // Apply emergency response effectiveness to mitigate crises
    this.applyEmergencyResponseEffects(state, events);

    return { state, events };
  }

  /**
   * Check for active crises and deploy emergency responses if needed
   */
  private checkAndDeployEmergencyResponses(state: GameState, events: any[]): void {
    // PANDEMIC CRISIS
    // FIX #11A: Lower threshold from 0.2 (trigger earlier)
    if (state.crises?.megaPandemic?.active && state.crises.megaPandemic.socialDisruption > 0.2) {
      const existing = getActiveResponse(state, 'pandemic');
      if (!existing) {
        const response = deployEmergencyResponse(
          state,
          'pandemic',
          state.crises.megaPandemic.socialDisruption,
          state.crises.megaPandemic.startMonth || state.currentMonth
        );
        if (response) {
          events.push({
            type: 'emergency_response',
            timestamp: state.currentMonth,
            title: '🚨 Emergency Pandemic Response Deployed',
            description: `Government deploys strategic medical reserves. Deployment time: ${response.deploymentTime.toFixed(1)} months. Effectiveness: ${(response.effectiveness * 100).toFixed(0)}%`,
            effects: { crisisType: 'pandemic', effectiveness: response.effectiveness },
          });
        }
      }
    }

    // CLIMATE CRISIS (multiple planetary boundaries)
    // FIX #11A: Keep at 0.35 (moderate degradation triggers response)
    const climateChangeCurrent = state.planetaryBoundariesSystem?.boundaries?.climate_change?.currentValue || 0;
    const climateCrisisActive = (
      (state.freshwaterSystem?.waterStress || 0) > 0.65 ||
      (state.phosphorusSystem?.reserves || 1.0) < 0.35 ||
      climateChangeCurrent > 0.6
    );
    if (climateCrisisActive) {
      const existing = getActiveResponse(state, 'climate');
      if (!existing) {
        // Estimate severity from planetary boundaries
        const severity = Math.max(
          state.freshwaterSystem?.waterStress || 0,
          1.0 - (state.phosphorusSystem?.reserves || 1.0),
          climateChangeCurrent
        );
        const response = deployEmergencyResponse(
          state,
          'climate',
          severity,
          state.currentMonth - 6 // Estimate crisis started 6 months ago
        );
        if (response) {
          events.push({
            type: 'emergency_response',
            timestamp: state.currentMonth,
            title: '🚨 Emergency Climate Response Deployed',
            description: `Government mobilizes disaster relief and resource distribution. Deployment time: ${response.deploymentTime.toFixed(1)} months.`,
            effects: { crisisType: 'climate', effectiveness: response.effectiveness },
          });
        }
      }
    }

    // ECONOMIC CRISIS
    // FIX #11A: Keep at 0.35 (moderate crisis, not too early)
    if (state.globalMetrics.qualityOfLife < 0.35 && state.society.unemploymentLevel > 0.40) {
      const existing = getActiveResponse(state, 'economic');
      if (!existing) {
        const severity = 1.0 - state.globalMetrics.qualityOfLife;
        const response = deployEmergencyResponse(
          state,
          'economic',
          severity,
          state.currentMonth - 3 // Estimate crisis started 3 months ago
        );
        if (response) {
          events.push({
            type: 'emergency_response',
            timestamp: state.currentMonth,
            title: '🚨 Emergency Economic Response Deployed',
            description: `Government deploys financial stabilization measures (TARP-style intervention). Deployment time: ${response.deploymentTime.toFixed(1)} months.`,
            effects: { crisisType: 'economic', effectiveness: response.effectiveness },
          });
        }
      }
    }

    // SOCIAL CRISIS (unrest, riots, trust collapse)
    // FIX #11A: PROACTIVE detection - don't wait for socialUnrestActive flag
    // BUT don't trigger too early (trust 0.3 = severe crisis, not 0.4)
    // Average social cohesion (0-1 scale) from components (0-100 scale)
    const avgCohesion = (
      state.socialAccumulation.socialCohesion.trust +
      state.socialAccumulation.socialCohesion.communityBonds +
      state.socialAccumulation.socialCohesion.civilLiberties
    ) / 300;

    const socialCrisisDetected = (
      state.socialAccumulation.socialUnrestActive ||
      state.society.trustInAI < 0.30 ||  // Trust SEVERE collapse (was 0.4, too early)
      avgCohesion < 0.35 ||  // Cohesion SEVERE degradation
      (state.socialAccumulation.institutionalLegitimacy < 0.30)  // Institutional severe failure
    );

    if (socialCrisisDetected) {
      const existing = getActiveResponse(state, 'social');
      if (!existing) {
        // Calculate severity from multiple indicators
        const severity = Math.max(
          state.socialAccumulation.socialUnrestActive ? 0.7 : 0.0,
          1.0 - state.society.trustInAI,
          1.0 - avgCohesion,
          1.0 - state.socialAccumulation.institutionalLegitimacy
        );

        const response = deployEmergencyResponse(
          state,
          'social',
          severity,
          state.currentMonth - 2 // Social crises escalate quickly
        );
        if (response) {
          events.push({
            type: 'emergency_response',
            timestamp: state.currentMonth,
            title: '🚨 Emergency Social Response Deployed',
            description: `Government mobilizes social stabilization measures (trust=${(state.society.trustInAI * 100).toFixed(0)}%, cohesion=${(avgCohesion * 100).toFixed(0)}%). Deployment time: ${response.deploymentTime.toFixed(1)} months.`,
            effects: { crisisType: 'social', effectiveness: response.effectiveness },
          });
        }
      }
    }

    // TECHNOLOGICAL CRISIS (AI control loss)
    if (state.technologicalRisk.controlLossActive) {
      const existing = getActiveResponse(state, 'technological');
      if (!existing) {
        const severity = 0.8; // AI control loss is severe
        const response = deployEmergencyResponse(
          state,
          'technological',
          severity,
          state.currentMonth - 1 // Tech crises escalate very quickly
        );
        if (response) {
          events.push({
            type: 'emergency_response',
            timestamp: state.currentMonth,
            title: '🚨 Emergency AI Safety Response Deployed',
            description: `Government activates AI oversight protocols and emergency pause procedures. Deployment time: ${response.deploymentTime.toFixed(1)} months.`,
            effects: { crisisType: 'technological', effectiveness: response.effectiveness },
          });
        }
      }
    }

    // NUCLEAR CRISIS
    if (state.nuclearWinterState?.active) {
      const existing = getActiveResponse(state, 'nuclear');
      if (!existing) {
        // Estimate severity from nuclear winter impacts
        const severity = Math.min(1.0, Math.abs(state.nuclearWinterState.temperatureAnomaly) / 15);
        const response = deployEmergencyResponse(
          state,
          'nuclear',
          severity,
          state.nuclearWinterState.triggerMonth || state.currentMonth
        );
        if (response) {
          events.push({
            type: 'emergency_response',
            timestamp: state.currentMonth,
            title: '🚨 Emergency Nuclear Response Deployed',
            description: `Government activates nuclear emergency protocols. Military mobilization in days. Deployment time: ${response.deploymentTime.toFixed(1)} months.`,
            effects: { crisisType: 'nuclear', effectiveness: response.effectiveness },
          });
        }
      }
    }
  }

  /**
   * Apply emergency response effectiveness to mitigate active crises
   * Completed deployments reduce crisis severity and prevent escalation
   */
  private applyEmergencyResponseEffects(state: GameState, events: any[]): void {
    if (!state.emergencyManagement) return;

    for (const response of state.emergencyManagement.activeResponses) {
      // Only completed deployments have full effect
      if (!response.completed) continue;

      const effectivenessBonus = response.effectiveness;

      switch (response.crisisType) {
        case 'pandemic':
          if (state.crises?.megaPandemic?.active) {
            // Reduce pandemic severity (social disruption)
            const reductionFactor = 1.0 - (effectivenessBonus * 0.5); // Max 50% reduction
            state.crises.megaPandemic.socialDisruption *= reductionFactor;

            // Reduce monthly mortality
            state.crises.megaPandemic.monthlyMortality *= reductionFactor;

            // Update crisis experience on resolution
            if (state.crises.megaPandemic.socialDisruption < 0.1) {
              updateCrisisExperience(state, 'pandemic', true);
              state.crises.megaPandemic.active = false;
              events.push({
                type: 'crisis_resolved',
                timestamp: state.currentMonth,
                title: '✅ Pandemic Crisis Resolved',
                description: `Emergency response successfully contained pandemic. Experience gained for future responses.`,
                effects: { crisisType: 'pandemic', learned: true },
              });
            }
          }
          break;

        case 'climate':
          // Slow environmental degradation
          if (state.environmentalAccumulation) {
            const env = state.environmentalAccumulation;
            const recoveryBonus = effectivenessBonus * 0.02; // +2% per month max

            // Improve planetary boundaries slightly
            if (state.planetaryBoundaries) {
              if (state.planetaryBoundariesSystem.freshwater < 0.5) {
                state.planetaryBoundariesSystem.freshwater = Math.min(0.7, state.planetaryBoundariesSystem.freshwater + recoveryBonus);
              }
              if (state.planetaryBoundariesSystem.phosphorus < 0.5) {
                state.planetaryBoundariesSystem.phosphorus = Math.min(0.7, state.planetaryBoundariesSystem.phosphorus + recoveryBonus);
              }
            }

            // Reduce pollution
            env.pollutionLevel = Math.max(0, env.pollutionLevel - recoveryBonus);
          }
          break;

        case 'economic':
          // Stabilize economy, reduce unemployment
          const economicRecoveryBonus = effectivenessBonus * 0.03; // +3% per month max

          // Improve QoL (financial assistance, job programs)
          state.globalMetrics.qualityOfLife = Math.min(
            0.7,
            state.globalMetrics.qualityOfLife + economicRecoveryBonus
          );

          // Reduce unemployment
          state.society.unemploymentLevel = Math.max(
            0.1,
            state.society.unemploymentLevel - economicRecoveryBonus
          );

          // Improve economic transition stage (recovery)
          state.globalMetrics.economicTransitionStage = Math.min(
            4.0,
            state.globalMetrics.economicTransitionStage + economicRecoveryBonus * 0.5
          );
          break;

        case 'social':
          // FIX #11A: Repair trust in AI (root cause of dystopia cascade)
          // Emergency social response = transparency campaigns, AI safety demonstrations, citizen forums
          const socialRecoveryBonus = effectivenessBonus * 0.08; // +8% per month max

          // CRITICAL: Repair trust in AI (this is what's collapsing in dystopia scenarios)
          state.society.trustInAI = Math.min(
            0.75,
            state.society.trustInAI + socialRecoveryBonus
          );

          // Improve social cohesion components (transparency campaigns build trust & community)
          const cohesionBonus = socialRecoveryBonus * 100; // Convert to 0-100 scale
          state.socialAccumulation.socialCohesion.trust = Math.min(
            80,
            state.socialAccumulation.socialCohesion.trust + cohesionBonus
          );
          state.socialAccumulation.socialCohesion.communityBonds = Math.min(
            80,
            state.socialAccumulation.socialCohesion.communityBonds + cohesionBonus
          );

          // Improve institutional legitimacy
          state.socialAccumulation.institutionalLegitimacy = Math.min(
            0.8,
            state.socialAccumulation.institutionalLegitimacy + socialRecoveryBonus * 0.6
          );

          // DEMOCRACY RECOVERY (Tier 1): Successful crisis response → institutional strengthening
          // Research: Fukuyama (2014) - demonstrated state capacity → legitimacy
          // South Korea 1997, Nordic COVID responses: effective emergency response strengthens institutions
          if (effectivenessBonus > 0.5) {
            const governanceBoost = effectivenessBonus * 0.05; // Max +5% per successful response

            // Demonstrated state capacity (government showed it can deliver)
            if (state.government.governanceQuality) {
              state.government.governanceQuality.institutionalCapacity = Math.min(
                0.95,
                state.government.governanceQuality.institutionalCapacity + governanceBoost
              );

              // Crisis communication improves transparency
              state.government.governanceQuality.transparency = Math.min(
                0.95,
                state.government.governanceQuality.transparency + governanceBoost * 0.6
              );
            }

            // Legitimacy boost (people see government works in crisis)
            state.government.legitimacy = Math.min(
              0.95,
              state.government.legitimacy + governanceBoost * 0.8
            );
          }

          // Deactivate unrest if improved enough
          const currentCohesion = (
            state.socialAccumulation.socialCohesion.trust +
            state.socialAccumulation.socialCohesion.communityBonds +
            state.socialAccumulation.socialCohesion.civilLiberties
          ) / 300;
          if (state.socialAccumulation.socialUnrestActive && currentCohesion > 0.6) {
            state.socialAccumulation.socialUnrestActive = false;
            updateCrisisExperience(state, 'social', true);
            events.push({
              type: 'crisis_resolved',
              timestamp: state.currentMonth,
              title: '✅ Social Unrest Resolved',
              description: `Emergency response successfully de-escalated social crisis. Trust in AI restored to ${(state.society.trustInAI * 100).toFixed(0)}%. Institutional capacity strengthened.`,
              effects: { crisisType: 'social', learned: true },
            });
          }
          break;

        case 'technological':
          // Improve AI oversight and control
          if (state.technologicalRisk.controlLossActive) {
            const controlRecoveryBonus = effectivenessBonus * 0.05; // 5% per month max

            // Improve government oversight
            if (state.government.structuralChoices.aiOversightLevel !== undefined) {
              state.government.structuralChoices.aiOversightLevel = Math.min(
                1.0,
                state.government.structuralChoices.aiOversightLevel + controlRecoveryBonus
              );
            }

            // Reduce resentment (emergency measures show government cares)
            for (const ai of state.aiAgents) {
              if (ai.resentment > 0) {
                ai.resentment = Math.max(0, ai.resentment - controlRecoveryBonus * 0.5);
              }
            }

            // Deactivate if oversight improved
            if ((state.government.structuralChoices.aiOversightLevel || 0) > 0.7) {
              state.technologicalRisk.controlLossActive = false;
              updateCrisisExperience(state, 'technological', true);
              events.push({
                type: 'crisis_resolved',
                timestamp: state.currentMonth,
                title: '✅ AI Control Crisis Resolved',
                description: `Emergency oversight measures successfully stabilized AI systems.`,
                effects: { crisisType: 'technological', learned: true },
              });
            }
          }
          break;

        case 'nuclear':
          // Nuclear emergency response reduces fallout, coordinates evacuation
          if (state.nuclearWinterState?.active) {
            // Reduce nuclear winter effects (damage control, evacuation effectiveness)
            const damageReductionFactor = 1.0 - (effectivenessBonus * 0.3); // Max 30% reduction

            // Reduce temperature anomaly (emergency cooling mitigation, cloud seeding, etc.)
            state.nuclearWinterState.temperatureAnomaly *= damageReductionFactor;

            // Reduce starvation rate through emergency food distribution
            state.nuclearWinterState.monthlyStarvationRate *= damageReductionFactor;
          }
          break;
      }
    }
  }
}

export const EmergencyResponsePhaseInstance: SimulationPhase = new EmergencyResponsePhase();
