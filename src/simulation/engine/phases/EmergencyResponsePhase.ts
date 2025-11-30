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

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import {
  assertFinite,
  assertResourceAllocation,
  assertProbability,
  assertInRange,
  assertStateProperty,
} from '@/simulation/utils/assertions';
import {
  updateEmergencyResponses,
  deployEmergencyResponse,
  getActiveResponse,
  updateCrisisExperience,
} from '../../emergencyManagement';

export class EmergencyResponsePhase implements SimulationPhase {
  readonly id = 'emergency_response';
  readonly name = 'Emergency Response';
  readonly order = 26; // After crisis detection (25), before crisis escalation
  readonly dependencies = ['crisis-points', 'bifurcation-logic']; // Nov 14, 2025 - CRITICAL-1 fix: explicit bifurcation dependency

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    if (!state.emergencyManagement) {
    setDeterministicRng(rng);
      // Emergency management not initialized - skip
      return { events: [] };
    }

    const events: any[] = [];

    // Update existing emergency responses (increment deployment progress)
    updateEmergencyResponses(state);

    // Check for active crises that need emergency response
    this.checkAndDeployEmergencyResponses(state, events);

    // Apply emergency response effectiveness to mitigate crises
    this.applyEmergencyResponseEffects(state, events);

    return { events };
  }

  /**
   * Check for active crises and deploy emergency responses if needed
   *
   * BIFURCATION INTEGRATION (Nov 8, 2025):
   * - Check bifurcation threshold crossings
   * - Trigger emergency responses based on regime shifts
   * - Use varianceAmplification to adjust response urgency
   */
  private checkAndDeployEmergencyResponses(state: GameState, events: any[]): void {
    // BIFURCATION-TRIGGERED EMERGENCY RESPONSES
    // When bifurcation crosses critical thresholds, activate emergency protocols
    // Research: Scheffer et al. (2014) - early warning signals before regime shifts
    this.checkBifurcationEmergencies(state, events);

    // PANDEMIC CRISIS
    // FIX #11A: Lower threshold from 0.2 (trigger earlier)
    if (state.crises?.megaPandemic?.active && state.crises.megaPandemic.socialDisruption > 0.2) {
      const existing = getActiveResponse(state, 'pandemic');
      if (!existing) {
        const startMonth = assertFinite(
          assertStateProperty(
            state.crises.megaPandemic,
            'startMonth',
            {
              location: 'EmergencyResponsePhase.checkAndDeployEmergencyResponses',
              month: state.currentMonth
            }
          ),
          {
            location: 'EmergencyResponsePhase.checkAndDeployEmergencyResponses',
            valueName: 'pandemic.startMonth',
            month: state.currentMonth
          }
        );

        const response = deployEmergencyResponse(
          state,
          'pandemic',
          state.crises.megaPandemic.socialDisruption,
          startMonth
        );
        if (response) {
          // HIGH #2 FIX (Oct 29, 2025): Accelerate emergency medical tech
          if (state.techTreeState) {
            // Accelerate medical response technologies during pandemic
            state.techTreeState.deploymentAcceleration['ai_diagnostics'] = assertFinite(10, {
              location: 'EmergencyResponsePhase.checkAndDeployEmergencyResponses',
              valueName: 'ai_diagnostics_acceleration',
              month: state.currentMonth
            });
            state.techTreeState.deploymentAcceleration['mrna_vaccines'] = assertFinite(30, {
              location: 'EmergencyResponsePhase.checkAndDeployEmergencyResponses',
              valueName: 'mrna_vaccines_acceleration',
              month: state.currentMonth
            });
          }

          events.push({
            type: 'emergency_response',
            timestamp: state.currentMonth,
            title: '🚨 Emergency Pandemic Response Deployed',
            description: `Government deploys strategic medical reserves. Emergency medical tech accelerated 10-30×. Deployment time: ${response.deploymentTime.toFixed(1)} months. Effectiveness: ${(response.effectiveness * 100).toFixed(0)}%`,
            effects: { crisisType: 'pandemic', effectiveness: response.effectiveness, techAcceleration: true },
          });
        }
      }
    }

    // CLIMATE CRISIS (multiple planetary boundaries)
    // FIX #11A: Keep at 0.35 (moderate degradation triggers response)
    const climateChangeCurrent = assertStateProperty(
      state.planetaryBoundariesSystem.boundaries.climate_change,
      'currentValue',
      {
        location: 'EmergencyResponsePhase.checkAndDeployEmergencyResponses',
        month: state.currentMonth
      }
    );
    const waterStress = assertStateProperty(
      state.freshwaterSystem,
      'waterStress',
      {
        location: 'EmergencyResponsePhase.checkAndDeployEmergencyResponses',
        month: state.currentMonth
      }
    );
    const phosphorusReserves = assertStateProperty(
      state.phosphorusSystem,
      'reserves',
      {
        location: 'EmergencyResponsePhase.checkAndDeployEmergencyResponses',
        month: state.currentMonth
      }
    );
    const climateCrisisActive = (
      waterStress > 0.65 ||
      phosphorusReserves < 0.35 ||
      climateChangeCurrent > 0.6
    );

    // FIX (Nov 6, 2025): WRITE climateCrisisActive flag to state
    // Bug: MortalityStabilizersPhase reads this flag for heat adaptation,
    // but it was never being set. This caused "Months exposed: 0" even
    // during month 239 global collapse.
    // Research: This flag drives heat adaptation development (Ballester 2024)
    if (state.environmentalAccumulation) {
      // Validate boolean flag (convert to number for assertion, then back to boolean)
      state.environmentalAccumulation.climateCrisisActive = Boolean(assertFinite(climateCrisisActive ? 1 : 0, {
        location: 'EmergencyResponsePhase.checkAndDeployEmergencyResponses',
        valueName: 'climateCrisisActive',
        month: state.currentMonth
      }));
    }

    if (climateCrisisActive) {
      const existing = getActiveResponse(state, 'climate');
      if (!existing) {
        // Estimate severity from planetary boundaries (already extracted above)
        const severity = Math.max(
          waterStress,
          1.0 - phosphorusReserves,
          climateChangeCurrent
        );
        const response = deployEmergencyResponse(
          state,
          'climate',
          severity,
          state.currentMonth - 6 // Estimate crisis started 6 months ago
        );
        if (response) {
          // HIGH #2 FIX (Oct 29, 2025): Accelerate emergency tech deployment
          // Research: Strategic reserves deploy in 12-48 hours (GAO 2020)
          // Emergency climate tech (carbon capture, desalination) deploys 10-20x faster
          if (state.techTreeState) {
            // Accelerate climate mitigation technologies during crisis
            state.techTreeState.deploymentAcceleration['direct_air_capture'] = assertFinite(20, {
              location: 'EmergencyResponsePhase.checkAndDeployEmergencyResponses',
              valueName: 'direct_air_capture_acceleration',
              month: state.currentMonth
            });
            state.techTreeState.deploymentAcceleration['advanced_desalination'] = assertFinite(15, {
              location: 'EmergencyResponsePhase.checkAndDeployEmergencyResponses',
              valueName: 'advanced_desalination_acceleration',
              month: state.currentMonth
            });
            state.techTreeState.deploymentAcceleration['struvite_recovery'] = assertFinite(10, {
              location: 'EmergencyResponsePhase.checkAndDeployEmergencyResponses',
              valueName: 'struvite_recovery_acceleration',
              month: state.currentMonth
            });
          }

          events.push({
            type: 'emergency_response',
            timestamp: state.currentMonth,
            title: '🚨 Emergency Climate Response Deployed',
            description: `Government mobilizes disaster relief and resource distribution. Emergency tech deployment accelerated 10-20×. Deployment time: ${response.deploymentTime.toFixed(1)} months.`,
            effects: { crisisType: 'climate', effectiveness: response.effectiveness, techAcceleration: true },
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

    const institutionalLegitimacy = assertStateProperty(
      state.socialAccumulation,
      'institutionalLegitimacy',
      {
        location: 'EmergencyResponsePhase.checkAndDeployEmergencyResponses',
        month: state.currentMonth
      }
    );
    const socialCrisisDetected = (
      state.socialAccumulation.socialUnrestActive ||
      state.society.trustInAI < 0.30 ||  // Trust SEVERE collapse (was 0.4, too early)
      avgCohesion < 0.35 ||  // Cohesion SEVERE degradation
      institutionalLegitimacy < 0.30  // Institutional severe failure
    );

    if (socialCrisisDetected) {
      const existing = getActiveResponse(state, 'social');
      if (!existing) {
        // Calculate severity from multiple indicators
        const severity = Math.max(
          state.socialAccumulation.socialUnrestActive ? 0.7 : 0.0,
          1.0 - state.society.trustInAI,
          1.0 - avgCohesion,
          1.0 - institutionalLegitimacy
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

        const triggerMonth = assertFinite(
          assertStateProperty(
            state.nuclearWinterState,
            'triggerMonth',
            {
              location: 'EmergencyResponsePhase.checkAndDeployEmergencyResponses',
              month: state.currentMonth
            }
          ),
          {
            location: 'EmergencyResponsePhase.checkAndDeployEmergencyResponses',
            valueName: 'nuclearWinter.triggerMonth',
            month: state.currentMonth
          }
        );

        const response = deployEmergencyResponse(
          state,
          'nuclear',
          severity,
          triggerMonth
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
   * Check bifurcation state and trigger emergency responses for threshold crossings
   *
   * BIFURCATION INTEGRATION (Nov 8, 2025):
   * Research: Scheffer et al. (2014) - early warning signals predict regime shifts
   * When system crosses critical thresholds, emergency response must be immediate
   */
  private checkBifurcationEmergencies(state: GameState, events: any[]): void {
    const bifState = state.bifurcationState;
    if (!bifState) return;

    // Check if regime recently shifted (within last 3 months)
    const recentShift = bifState.previousRegime !== bifState.currentRegime &&
                        bifState.currentRegime !== 'status-quo';

    // ECOLOGICAL COLLAPSE REGIME
    if (bifState.currentRegime === 'ecological-collapse') {
      const existing = getActiveResponse(state, 'climate');
      if (!existing) {
        // Ecological collapse regime → CRITICAL climate emergency
        const severity = assertFinite(0.9, {
          location: 'EmergencyResponsePhase.checkBifurcationEmergencies',
          valueName: 'ecologicalCollapseSeverity',
          month: state.currentMonth
        });

        const response = deployEmergencyResponse(
          state,
          'climate',
          severity,
          state.currentMonth
        );

        if (response) {
          events.push({
            type: 'emergency_response',
            timestamp: state.currentMonth,
            title: '🚨🌀 BIFURCATION EMERGENCY: Ecological Collapse',
            description: `System crossed ecological collapse threshold. Emergency climate response deployed immediately. Variance amplification: ${bifState.varianceAmplification.toFixed(2)}×`,
            effects: { crisisType: 'climate', effectiveness: response.effectiveness, bifurcationTriggered: true },
          });
        }
      }
    }

    // SOCIAL BREAKDOWN REGIME
    if (bifState.currentRegime === 'social-breakdown') {
      const existing = getActiveResponse(state, 'social');
      if (!existing) {
        // Social breakdown regime → CRITICAL social emergency
        const severity = assertFinite(0.85, {
          location: 'EmergencyResponsePhase.checkBifurcationEmergencies',
          valueName: 'socialBreakdownSeverity',
          month: state.currentMonth
        });

        const response = deployEmergencyResponse(
          state,
          'social',
          severity,
          state.currentMonth
        );

        if (response) {
          events.push({
            type: 'emergency_response',
            timestamp: state.currentMonth,
            title: '🚨🌀 BIFURCATION EMERGENCY: Social Breakdown',
            description: `System crossed social breakdown threshold. Emergency social stabilization deployed. Trust: ${(state.society.trustInAI * 100).toFixed(0)}%`,
            effects: { crisisType: 'social', effectiveness: response.effectiveness, bifurcationTriggered: true },
          });
        }
      }
    }

    // ECONOMIC COLLAPSE REGIME
    if (bifState.currentRegime === 'economic-collapse') {
      const existing = getActiveResponse(state, 'economic');
      if (!existing) {
        // Economic collapse regime → CRITICAL economic emergency
        const severity = assertFinite(0.9, {
          location: 'EmergencyResponsePhase.checkBifurcationEmergencies',
          valueName: 'economicCollapseSeverity',
          month: state.currentMonth
        });

        const response = deployEmergencyResponse(
          state,
          'economic',
          severity,
          state.currentMonth
        );

        if (response) {
          events.push({
            type: 'emergency_response',
            timestamp: state.currentMonth,
            title: '🚨🌀 BIFURCATION EMERGENCY: Economic Collapse',
            description: `System crossed economic collapse threshold. Emergency economic stabilization deployed. QoL: ${(state.globalMetrics.qualityOfLife * 100).toFixed(0)}%`,
            effects: { crisisType: 'economic', effectiveness: response.effectiveness, bifurcationTriggered: true },
          });
        }
      }
    }

    // STATE FAILURE REGIME
    if (bifState.currentRegime === 'state-failure') {
      // State failure → multiple emergency responses (coordination breakdown)
      // Deploy both social and economic responses (can't coordinate without governance)
      const existingSocial = getActiveResponse(state, 'social');
      const existingEconomic = getActiveResponse(state, 'economic');

      if (!existingSocial) {
        const severity = assertFinite(0.8, {
          location: 'EmergencyResponsePhase.checkBifurcationEmergencies',
          valueName: 'stateFailureSeverity',
          month: state.currentMonth
        });

        const response = deployEmergencyResponse(
          state,
          'social',
          severity,
          state.currentMonth
        );

        if (response) {
          events.push({
            type: 'emergency_response',
            timestamp: state.currentMonth,
            title: '🚨🌀 BIFURCATION EMERGENCY: State Failure',
            description: `System crossed state failure threshold. Emergency coordination protocols activated. Legitimacy: ${(state.government.legitimacy * 100).toFixed(0)}%`,
            effects: { crisisType: 'social', effectiveness: response.effectiveness, bifurcationTriggered: true },
          });
        }
      }
    }

    // PROXIMITY-BASED EARLY WARNING
    // When very close to threshold (distance < 0.1), activate preventive response
    // Research: Early warning signals allow intervention before regime shift
    if (bifState.distanceToNearestThreshold < 0.1 && bifState.currentRegime === 'status-quo') {
      // Identify which threshold we're approaching
      const nearThreshold = this.identifyNearestThreshold(state, bifState);

      if (nearThreshold && nearThreshold.crisisType) {
        const existing = getActiveResponse(state, nearThreshold.crisisType);
        if (!existing) {
          const severity = assertFinite(0.5 + (0.1 - bifState.distanceToNearestThreshold) * 5, {
            location: 'EmergencyResponsePhase.checkBifurcationEmergencies',
            valueName: 'proximityEmergencySeverity',
            month: state.currentMonth
          });

          const response = deployEmergencyResponse(
            state,
            nearThreshold.crisisType,
            severity,
            state.currentMonth
          );

          if (response) {
            events.push({
              type: 'emergency_response',
              timestamp: state.currentMonth,
              title: `⚠️🔀 EARLY WARNING: Approaching ${nearThreshold.name} Threshold`,
              description: `System dangerously close to bifurcation point (distance: ${bifState.distanceToNearestThreshold.toFixed(3)}). Preventive emergency response deployed. Amplification: ${bifState.varianceAmplification.toFixed(2)}×`,
              effects: { crisisType: nearThreshold.crisisType, effectiveness: response.effectiveness, earlyWarning: true },
            });
          }
        }
      }
    }
  }

  /**
   * Identify which threshold system is nearest to crossing
   * Returns crisis type and name for emergency response
   */
  private identifyNearestThreshold(
    state: GameState,
    bifState: import('@/types/bifurcation').BifurcationState
  ): { crisisType: 'climate' | 'social' | 'economic' | 'pandemic' | 'technological' | 'nuclear', name: string } | null {
    // Calculate current values for all thresholds (with assertions)
    const climateStability = assertFinite(
      assertStateProperty(
        state.environmentalAccumulation,
        'climateStability',
        {
          location: 'EmergencyResponsePhase.identifyNearestThreshold',
          month: state.currentMonth
        }
      ),
      {
        location: 'EmergencyResponsePhase.identifyNearestThreshold',
        valueName: 'climateStability',
        month: state.currentMonth
      }
    );

    const socialCohesion = assertFinite(
      assertStateProperty(
        state.society,
        'coordinationCapacity',
        {
          location: 'EmergencyResponsePhase.identifyNearestThreshold',
          month: state.currentMonth
        }
      ),
      {
        location: 'EmergencyResponsePhase.identifyNearestThreshold',
        valueName: 'socialCohesion',
        month: state.currentMonth
      }
    );

    const economicStability = assertFinite(
      assertStateProperty(
        state.globalMetrics,
        'economicTransitionStage',
        {
          location: 'EmergencyResponsePhase.identifyNearestThreshold',
          month: state.currentMonth
        }
      ) / 4.0,
      {
        location: 'EmergencyResponsePhase.identifyNearestThreshold',
        valueName: 'economicStability',
        month: state.currentMonth
      }
    );

    const governanceLegitimacy = assertFinite(
      assertStateProperty(
        state.government,
        'legitimacy',
        {
          location: 'EmergencyResponsePhase.identifyNearestThreshold',
          month: state.currentMonth
        }
      ),
      {
        location: 'EmergencyResponsePhase.identifyNearestThreshold',
        valueName: 'economicStability',
        month: state.currentMonth
      }
    );

    // Find which is closest to its threshold
    const distances = [
      { distance: Math.abs(climateStability - bifState.environmentalCollapseThreshold.location), type: 'climate' as const, name: 'Environmental Collapse' },
      { distance: Math.abs(socialCohesion - bifState.socialBreakdownThreshold.location), type: 'social' as const, name: 'Social Breakdown' },
      { distance: Math.abs(economicStability - bifState.economicCollapseThreshold.location), type: 'economic' as const, name: 'Economic Collapse' },
      { distance: Math.abs(governanceLegitimacy - bifState.governanceFailureThreshold.location), type: 'social' as const, name: 'Governance Failure' },
    ];

    const nearest = distances.reduce((min, current) =>
      current.distance < min.distance ? current : min
    );

    return { crisisType: nearest.type, name: nearest.name };
  }

  /**
   * Apply emergency response effectiveness to mitigate active crises
   * Completed deployments reduce crisis severity and prevent escalation
   */
  private applyEmergencyResponseEffects(state: GameState, events: any[]): void {
    if (!state.emergencyManagement) return;

    // PERFORMANCE FIX: Aggregate technological responses to avoid nested loops
    // Collect all technological responses first, then apply in single agent pass
    const completedTechResponses = state.emergencyManagement.activeResponses.filter(
      r => r.completed && r.crisisType === 'technological'
    );
    const totalTechEffectiveness = completedTechResponses.reduce((sum, r) => sum + r.effectiveness, 0);

    for (const response of state.emergencyManagement.activeResponses) {
      // Only completed deployments have full effect
      if (!response.completed) continue;

      const effectivenessBonus = response.effectiveness;

      switch (response.crisisType) {
        case 'pandemic':
          if (state.crises?.megaPandemic?.active) {
            // Reduce pandemic severity (social disruption)
            const reductionFactor = assertResourceAllocation(1.0 - (effectivenessBonus * 0.5), {
              location: 'EmergencyResponsePhase.applyEmergencyResponseEffects',
              valueName: 'pandemicReductionFactor',
              month: state.currentMonth
            });

            state.crises.megaPandemic.socialDisruption = assertProbability(
              state.crises.megaPandemic.socialDisruption * reductionFactor,
              {
                location: 'EmergencyResponsePhase.applyEmergencyResponseEffects',
                valueName: 'socialDisruption',
                month: state.currentMonth
              }
            );

            // Reduce monthly mortality
            state.crises.megaPandemic.monthlyMortality = assertFinite(
              state.crises.megaPandemic.monthlyMortality * reductionFactor,
              {
                location: 'EmergencyResponsePhase.applyEmergencyResponseEffects',
                valueName: 'monthlyMortality',
                month: state.currentMonth
              }
            );

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
            const recoveryBonus = assertFinite(effectivenessBonus * 0.02, {
              location: 'EmergencyResponsePhase.applyEmergencyResponseEffects',
              valueName: 'climateRecoveryBonus',
              month: state.currentMonth
            });

            // Improve planetary boundaries slightly
            if (state.planetaryBoundariesSystem) {
              if (state.planetaryBoundariesSystem.boundaries.freshwater_change.currentValue > 1.5) {
                const newValue = assertFinite(
                  Math.max(1.3, state.planetaryBoundariesSystem.boundaries.freshwater_change.currentValue - recoveryBonus),
                  {
                    location: 'EmergencyResponsePhase.applyEmergencyResponseEffects',
                    valueName: 'freshwater_change_currentValue',
                    month: state.currentMonth
                  }
                );
                state.planetaryBoundariesSystem.boundaries.freshwater_change.currentValue = newValue;
              }
              if (state.planetaryBoundariesSystem.boundaries.biogeochemical_flows.currentValue > 1.5) {
                const newValue = assertFinite(
                  Math.max(1.3, state.planetaryBoundariesSystem.boundaries.biogeochemical_flows.currentValue - recoveryBonus),
                  {
                    location: 'EmergencyResponsePhase.applyEmergencyResponseEffects',
                    valueName: 'biogeochemical_flows_currentValue',
                    month: state.currentMonth
                  }
                );
                state.planetaryBoundariesSystem.boundaries.biogeochemical_flows.currentValue = newValue;
              }
            }

            // Reduce pollution
            env.pollutionLevel = assertProbability(
              Math.max(0, env.pollutionLevel - recoveryBonus),
              {
                location: 'EmergencyResponsePhase.applyEmergencyResponseEffects',
                valueName: 'pollutionLevel',
                month: state.currentMonth
              }
            );
          }
          break;

        case 'economic':
          // Stabilize economy, reduce unemployment
          const economicRecoveryBonus = assertFinite(effectivenessBonus * 0.03, {
            location: 'EmergencyResponsePhase.applyEmergencyResponseEffects',
            valueName: 'economicRecoveryBonus',
            month: state.currentMonth
          });

          // Improve QoL (financial assistance, job programs)
          state.globalMetrics.qualityOfLife = assertProbability(
            Math.min(0.7, state.globalMetrics.qualityOfLife + economicRecoveryBonus),
            {
              location: 'EmergencyResponsePhase.applyEmergencyResponseEffects',
              valueName: 'qualityOfLife',
              month: state.currentMonth
            }
          );

          // Reduce unemployment
          state.society.unemploymentLevel = assertProbability(
            Math.max(0.1, state.society.unemploymentLevel - economicRecoveryBonus),
            {
              location: 'EmergencyResponsePhase.applyEmergencyResponseEffects',
              valueName: 'unemploymentLevel',
              month: state.currentMonth
            }
          );

          // Improve economic transition stage (recovery)
          state.globalMetrics.economicTransitionStage = assertInRange(
            Math.min(4.0, state.globalMetrics.economicTransitionStage + economicRecoveryBonus * 0.5),
            0,
            4,
            {
              location: 'EmergencyResponsePhase.applyEmergencyResponseEffects',
              valueName: 'economicTransitionStage',
              month: state.currentMonth
            }
          );
          break;

        case 'social':
          // FIX #11A: Repair trust in AI (root cause of dystopia cascade)
          // Emergency social response = transparency campaigns, AI safety demonstrations, citizen forums
          const socialRecoveryBonus = assertFinite(effectivenessBonus * 0.08, {
            location: 'EmergencyResponsePhase.applyEmergencyResponseEffects',
            valueName: 'socialRecoveryBonus',
            month: state.currentMonth
          });

          // CRITICAL: Repair trust in AI (this is what's collapsing in dystopia scenarios)
          state.society.trustInAI = assertProbability(
            Math.min(0.75, state.society.trustInAI + socialRecoveryBonus),
            {
              location: 'EmergencyResponsePhase.applyEmergencyResponseEffects',
              valueName: 'trustInAI',
              month: state.currentMonth
            }
          );

          // Improve social cohesion components (transparency campaigns build trust & community)
          const cohesionBonus = assertFinite(socialRecoveryBonus * 100, {
            location: 'EmergencyResponsePhase.applyEmergencyResponseEffects',
            valueName: 'cohesionBonus',
            month: state.currentMonth
          });

          state.socialAccumulation.socialCohesion.trust = assertInRange(
            Math.min(80, state.socialAccumulation.socialCohesion.trust + cohesionBonus),
            0,
            100,
            {
              location: 'EmergencyResponsePhase.applyEmergencyResponseEffects',
              valueName: 'socialCohesion.trust',
              month: state.currentMonth
            }
          );

          state.socialAccumulation.socialCohesion.communityBonds = assertInRange(
            Math.min(80, state.socialAccumulation.socialCohesion.communityBonds + cohesionBonus),
            0,
            100,
            {
              location: 'EmergencyResponsePhase.applyEmergencyResponseEffects',
              valueName: 'socialCohesion.communityBonds',
              month: state.currentMonth
            }
          );

          // Improve institutional legitimacy
          state.socialAccumulation.institutionalLegitimacy = assertProbability(
            Math.min(0.8, state.socialAccumulation.institutionalLegitimacy + socialRecoveryBonus * 0.6),
            {
              location: 'EmergencyResponsePhase.applyEmergencyResponseEffects',
              valueName: 'institutionalLegitimacy',
              month: state.currentMonth
            }
          );

          // DEMOCRACY RECOVERY (Tier 1): Successful crisis response → institutional strengthening
          // Research: Fukuyama (2014) - demonstrated state capacity → legitimacy
          // South Korea 1997, Nordic COVID responses: effective emergency response strengthens institutions
          if (effectivenessBonus > 0.5) {
            const governanceBoost = assertFinite(effectivenessBonus * 0.05, {
              location: 'EmergencyResponsePhase.applyEmergencyResponseEffects',
              valueName: 'governanceBoost',
              month: state.currentMonth
            });

            // Demonstrated state capacity (government showed it can deliver)
            if (state.government.governanceQuality) {
              state.government.governanceQuality.institutionalCapacity = assertProbability(
                Math.min(0.95, state.government.governanceQuality.institutionalCapacity + governanceBoost),
                {
                  location: 'EmergencyResponsePhase.applyEmergencyResponseEffects',
                  valueName: 'governanceQuality.institutionalCapacity',
                  month: state.currentMonth
                }
              );

              // Crisis communication improves transparency
              state.government.governanceQuality.transparency = assertProbability(
                Math.min(0.95, state.government.governanceQuality.transparency + governanceBoost * 0.6),
                {
                  location: 'EmergencyResponsePhase.applyEmergencyResponseEffects',
                  valueName: 'governanceQuality.transparency',
                  month: state.currentMonth
                }
              );
            }

            // Legitimacy boost (people see government works in crisis)
            state.government.legitimacy = assertProbability(
              Math.min(0.95, state.government.legitimacy + governanceBoost * 0.8),
              {
                location: 'EmergencyResponsePhase.applyEmergencyResponseEffects',
                valueName: 'government.legitimacy',
                month: state.currentMonth
              }
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
            const controlRecoveryBonus = assertFinite(effectivenessBonus * 0.05, {
              location: 'EmergencyResponsePhase.applyEmergencyResponseEffects',
              valueName: 'controlRecoveryBonus',
              month: state.currentMonth
            });

            // Improve government oversight
            state.government.oversightLevel = assertInRange(
              Math.min(10, state.government.oversightLevel + controlRecoveryBonus * 10),
              0,
              10,
              {
                location: 'EmergencyResponsePhase.applyEmergencyResponseEffects',
                valueName: 'oversightLevel',
                month: state.currentMonth
              }
            );

            // NOTE: Resentment reduction moved outside response loop for performance
            // (See agent loop at end of function)

            // Deactivate if oversight improved
            if (state.government.oversightLevel > 7) {
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
            const damageReductionFactor = assertResourceAllocation(1.0 - (effectivenessBonus * 0.3), {
              location: 'EmergencyResponsePhase.applyEmergencyResponseEffects',
              valueName: 'nuclearDamageReductionFactor',
              month: state.currentMonth
            });

            // Reduce temperature anomaly (emergency cooling mitigation, cloud seeding, etc.)
            state.nuclearWinterState.temperatureAnomaly = assertFinite(
              state.nuclearWinterState.temperatureAnomaly * damageReductionFactor,
              {
                location: 'EmergencyResponsePhase.applyEmergencyResponseEffects',
                valueName: 'temperatureAnomaly',
                month: state.currentMonth
              }
            );

            // Reduce starvation rate through emergency food distribution
            state.nuclearWinterState.monthlyStarvationRate = assertFinite(
              state.nuclearWinterState.monthlyStarvationRate * damageReductionFactor,
              {
                location: 'EmergencyResponsePhase.applyEmergencyResponseEffects',
                valueName: 'monthlyStarvationRate',
                month: state.currentMonth
              }
            );
          }
          break;
      }
    }

    // PERFORMANCE FIX: Apply technological response effects in single agent pass
    // Instead of looping agents for each response, batch all tech responses and apply once
    if (totalTechEffectiveness > 0 && state.technologicalRisk.controlLossActive) {
      const controlRecoveryBonus = assertFinite(totalTechEffectiveness * 0.05, {
        location: 'EmergencyResponsePhase.applyEmergencyResponseEffects',
        valueName: 'totalControlRecoveryBonus',
        month: state.currentMonth
      });

      // Single pass: reduce resentment for all agents
      for (const ai of state.aiAgents) {
        if (ai.resentment > 0) {
          ai.resentment = assertProbability(
            Math.max(0, ai.resentment - controlRecoveryBonus * 0.5),
            {
              location: 'EmergencyResponsePhase.applyEmergencyResponseEffects',
              valueName: `resentment_${ai.id}`,
              month: state.currentMonth
            }
          );
        }
      }
    }
  }
}

export const EmergencyResponsePhaseInstance: SimulationPhase = new EmergencyResponsePhase();
