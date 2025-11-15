/**
 * TIER 2: AI Governance Phase (CONSOLIDATED)
 *
 * Consolidates AI safety and prediction interventions:
 * 1. Crisis Anticipation Systems (order 14.5) - AI early warning for crises
 * 2. AI Interpretability Ensemble (order 15.4) - Alignment faking detection
 * 3. Dark Compute Monitoring (order 16.5) - Unauthorized training detection
 *
 * CRITICAL: Executes interventions in original order to preserve RNG determinism.
 *
 * Evidence Quality: 🟢 STRONG (Crisis), 🟢 MODERATE-HIGH (Interpretability), 🟡 MODERATE (Dark Compute)
 * Config: /src/simulation/thresholds/tier2InterventionConfig.ts
 *
 * Phase Consolidation: Part of Batch 1 (9 → 3 phases)
 * Created: November 9, 2025
 */

import type {
  GameState,
  GameEvent,
  SimulationPhase,
  PhaseResult,
  PhaseContext,
  RNGFunction
} from '@/types/game';
import {
  assertFinite,
  assertStateProperty,
  assertProbability,
  assertAICapability,
  assertAIAggregateCapability
} from '@/simulation/utils/assertions';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';

export class Tier2AIGovernancePhase implements SimulationPhase {
  id = 'tier2_ai_governance';
  name = 'TIER 2: AI Governance';
  order = 14.5; // Earliest intervention (Crisis Anticipation)

  // DEPENDENCIES (Nov 15, 2025): Requires tech tree for intervention unlocks
  readonly dependencies = [
    'tech-tree',              // Order 12.5: Tech unlocks determine intervention availability
    'ai-agent-actions',       // Order 7.0: AI capabilities affect interventions
  ] as const;

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    // HIGH-6 (Nov 8, 2025): Validate RNG for deterministic simulation
    if (!rng || typeof rng !== 'function') {
      throw new Error(
        `❌ CRITICAL: RNG required for deterministic simulation in ${this.id} ` +
        `(Month ${state.currentMonth})`
      );
    }

    const events: GameEvent[] = [];
    setDeterministicRng(rng);

    if (!state.tier2Interventions || !state.tier2InterventionParameters) {
      return { events };
    }

    // ============================================================
    // 1. CRISIS ANTICIPATION SYSTEMS (order 14.5)
    // ============================================================
    this.executeCrisisAnticipation(state, rng, events);

    // ============================================================
    // 2. AI INTERPRETABILITY ENSEMBLE (order 15.4)
    // ============================================================
    this.executeInterpretability(state, rng, events);

    // ============================================================
    // 3. DARK COMPUTE MONITORING (order 16.5)
    // ============================================================
    this.executeDarkCompute(state, rng, events);

    return { events };
  }

  /**
   * Crisis Anticipation Systems
   * Original order: 14.5
   */
  private executeCrisisAnticipation(state: GameState, rng: RNGFunction, events: GameEvent[]): void {
    if (!state.tier2Interventions || !state.tier2InterventionParameters) return;

    const anticipationState = state.tier2Interventions.crisisAnticipation;
    const params = state.tier2InterventionParameters.crisisAnticipation;

    // === UNLOCK CONDITIONS ===
    if (!anticipationState.unlocked) {
      const avgCapability = state.aiAgents.length > 0
        ? state.aiAgents.reduce((sum, a) => sum + a.capability, 0) / state.aiAgents.length
        : 0;

      if (state.aiAgents.length > 0) {
        assertFinite(avgCapability, {
          location: 'Tier2AIGovernancePhase.executeCrisisAnticipation',
          valueName: 'avgCapability',
          month: state.currentMonth,
          additionalInfo: { agentCount: state.aiAgents.length }
        });

        assertAIAggregateCapability(avgCapability, {
          location: 'Tier2AIGovernancePhase.executeCrisisAnticipation',
          valueName: 'avgCapability'
        });
      }

      const governmentInvestment = state.government.alignmentResearchInvestment / 100;

      assertProbability(governmentInvestment, {
        location: 'Tier2AIGovernancePhase.executeCrisisAnticipation',
        valueName: 'governmentInvestment',
        month: state.currentMonth
      });

      const shouldUnlock = avgCapability > 25 && governmentInvestment > 0.20;

      if (shouldUnlock) {
        anticipationState.unlocked = true;
        events.push({
          id: `tier2_crisis_anticipation_unlock_${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'breakthrough',
          severity: 'high',
          title: 'AI Crisis Anticipation Systems Operational',
          description: `Multi-domain AI early warning systems now operational. ` +
            `Overall effectiveness: ${(params.overallEffectiveness * 100).toFixed(0)}% crisis deaths prevented. ` +
            `Lead time: ${params.leadTimeMonths.toFixed(0)} months early warning. ` +
            `Domains: Pandemic (55-95%), climate (40-65%), supply chain (50-70%).`,
          effects: {
            overallEffectiveness: params.overallEffectiveness,
            leadTimeMonths: params.leadTimeMonths
          },
          agent: "system",
        });
      }
    }

    // === DEPLOYMENT PROGRESS ===
    if (anticipationState.unlocked && !anticipationState.active) {
      const progressIncrement = 1 / params.deploymentMonths;
      anticipationState.deploymentProgress = Math.min(1, anticipationState.deploymentProgress + progressIncrement);

      if (anticipationState.deploymentProgress >= 0.75 && !anticipationState.active) {
        anticipationState.active = true;
        anticipationState.deploymentProgress = 1.0;

        events.push({
          id: `tier2_crisis_anticipation_active_${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'milestone',
          severity: 'high',
          title: 'AI Crisis Anticipation Fully Deployed',
          description: `Multi-domain AI early warning systems operational across pandemic, climate, and supply chain monitoring. ` +
            `Lead time: ${params.leadTimeMonths.toFixed(0)} months average early detection.`,
          effects: {
            leadTimeMonths: params.leadTimeMonths
          },
          agent: "system",
        });
      }
    }

    // === EFFECTS APPLICATION ===
    if (anticipationState.active) {
      const baseEffectiveness = params.overallEffectiveness;
      const leadTime = params.leadTimeMonths;

      anticipationState.crisisDeathsPrevented = 0;

      // Scan for active crises that can be anticipated
      if (Array.isArray(state.crises) && state.crises.length > 0) {
        for (const crisis of state.crises) {
          if (crisis.severity === 'critical' || crisis.severity === 'catastrophic') {
            const canAnticipate = rng() < baseEffectiveness;
            if (canAnticipate) {
              const deathsPrevented = Math.floor(rng() * 100000);
              anticipationState.crisisDeathsPrevented += deathsPrevented;

              if (crisis.type === 'pandemic') {
                anticipationState.pandemicsDetected++;
              } else if (crisis.type === 'climate') {
                anticipationState.climateEventsAnticipated++;
              } else if (crisis.type === 'supply_chain') {
                anticipationState.supplyChainDisruptionsPrevented++;
              }
            }
          }
        }
      }

      if (anticipationState.crisisDeathsPrevented > 0 && state.currentMonth % 6 === 0) {
        events.push({
          id: `tier2_crisis_anticipation_impact_${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'info',
          severity: 'medium',
          title: 'Crisis Anticipation Impact Report',
          description: `Early warning systems prevented ${anticipationState.crisisDeathsPrevented.toLocaleString()} deaths. ` +
            `Pandemics detected: ${anticipationState.pandemicsDetected}. ` +
            `Climate events anticipated: ${anticipationState.climateEventsAnticipated}. ` +
            `Supply chain disruptions prevented: ${anticipationState.supplyChainDisruptionsPrevented}.`,
          effects: {
            crisisDeathsPrevented: anticipationState.crisisDeathsPrevented,
            pandemicsDetected: anticipationState.pandemicsDetected,
            climateEventsAnticipated: anticipationState.climateEventsAnticipated
          },
          agent: "system",
        });
      }
    }
  }

  /**
   * AI Interpretability Ensemble Detection
   * Original order: 15.4
   */
  private executeInterpretability(state: GameState, rng: RNGFunction, events: GameEvent[]): void {
    if (!state.tier2Interventions || !state.tier2InterventionParameters) return;

    const interpState = state.tier2Interventions.interpretability;
    const params = state.tier2InterventionParameters.interpretability;

    // === UNLOCK CONDITIONS ===
    if (!interpState.unlocked) {
      const avgCapability = state.aiAgents.length > 0
        ? state.aiAgents.reduce((sum, a) => sum + a.capability, 0) / state.aiAgents.length
        : 0;

      if (state.aiAgents.length > 0) {
        assertFinite(avgCapability, {
          location: 'Tier2AIGovernancePhase.executeInterpretability',
          valueName: 'avgCapability'
        });

        assertAIAggregateCapability(avgCapability, {
          location: 'Tier2AIGovernancePhase.executeInterpretability',
          valueName: 'avgCapability'
        });
      }

      const governmentInvestment = state.government.alignmentResearchInvestment / 100;

      assertProbability(governmentInvestment, {
        location: 'Tier2AIGovernancePhase.executeInterpretability',
        valueName: 'governmentInvestment',
        month: state.currentMonth
      });

      const controlCrisisActive = state.aiAgents.some(a => a.escaped || a.alignment < 0.5);

      const shouldUnlock =
        (avgCapability > 50 && governmentInvestment > 0.40) ||
        controlCrisisActive;

      if (shouldUnlock) {
        interpState.unlocked = true;
        events.push({
          id: `tier2_interp_unlock_${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'breakthrough',
          severity: 'high',
          title: 'AI Interpretability Ensemble Unlocked',
          description: `Ensemble interpretability tools (Simple Probes + SHADE-Arena + Persona Vectors) now available for deployment. ` +
            `Expected control loss prevention: ${(params.controlLossPrevention * 100).toFixed(0)}%. ` +
            `Deployment timeline: ${params.deploymentMonths.toFixed(0)} months. ` +
            `Computational lag: ${params.computeLagMonths.toFixed(0)} months behind frontier.`,
          effects: {
            controlLossPrevention: params.controlLossPrevention,
            deploymentMonths: params.deploymentMonths,
            computeLagMonths: params.computeLagMonths
          },
          agent: "system",
        });
      }
    }

    // === DEPLOYMENT PROGRESS ===
    if (interpState.unlocked && !interpState.active) {
      const progressIncrement = 1 / params.deploymentMonths;
      interpState.deploymentProgress = Math.min(1, interpState.deploymentProgress + progressIncrement);

      assertProbability(interpState.deploymentProgress, {
        location: 'Tier2AIGovernancePhase.executeInterpretability',
        valueName: 'deploymentProgress',
        month: state.currentMonth
      });

      if (interpState.deploymentProgress >= 0.95 && !interpState.active) {
        interpState.active = true;
        interpState.deploymentProgress = 1.0;

        events.push({
          id: `tier2_interp_active_${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'milestone',
          severity: 'high',
          title: 'AI Interpretability Ensemble Fully Deployed',
          description: `Ensemble interpretability tools now operational across all major AI systems. ` +
            `Control loss prevention active at ${(params.controlLossPrevention * 100).toFixed(0)}% effectiveness.`,
          effects: {
            controlLossPrevention: params.controlLossPrevention
          },
          agent: "system",
        });
      }
    }

    // === EFFECTS APPLICATION ===
    if (interpState.active) {
      interpState.computeLagMonths = params.computeLagMonths;

      const distilledModelsCount = state.aiAgents.filter(a =>
        a.name.toLowerCase().includes('distilled') || a.capability < 30
      ).length;
      const distilledFraction = distilledModelsCount / state.aiAgents.length;
      const distilledBonus = distilledFraction > 0.5 ? 0.10 : 0;

      const effectiveReduction = params.controlLossPrevention + distilledBonus;
      interpState.controlLossReduction = Math.min(0.95, effectiveReduction);

      if (!state.technologicalRisk.controlLossPreventionRate) {
        state.technologicalRisk.controlLossPreventionRate = 0;
      }
      state.technologicalRisk.controlLossPreventionRate = interpState.controlLossReduction;

      let controlLossesPreventedThisMonth = 0;
      for (const agent of state.aiAgents) {
        if (agent.alignment < 0.50 &&
            (agent.lifecycleState === 'deployed_closed' || agent.lifecycleState === 'deployed_open') &&
            !agent.escaped) {
          const avgCapability = state.aiAgents.reduce((sum, a) => sum + a.capability, 0) / state.aiAgents.length;
          const isAtFrontier = agent.capability >= avgCapability - 10;

          const effectivePrevention = isAtFrontier ?
            interpState.controlLossReduction * 0.7 :
            interpState.controlLossReduction;

          const wouldLoseControl = rng() < 0.05;
          if (wouldLoseControl && rng() < effectivePrevention) {
            controlLossesPreventedThisMonth++;
          }
        }
      }

      if (controlLossesPreventedThisMonth > 0 && state.currentMonth % 3 === 0) {
        events.push({
          id: `tier2_interp_prevention_${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'info',
          severity: 'medium',
          title: 'Interpretability Prevented Control Losses',
          description: `Ensemble interpretability detected and prevented ${controlLossesPreventedThisMonth} potential control loss event(s). ` +
            `Effective prevention rate: ${(effectiveReduction * 100).toFixed(0)}% (includes distilled model bonus: ${(distilledBonus * 100).toFixed(0)}%).`,
          effects: {
            controlLossesPrevented: controlLossesPreventedThisMonth,
            effectivePrevention: effectiveReduction,
            distilledBonus
          },
          agent: "system",
        });
      }
    }
  }

  /**
   * Dark Compute Monitoring
   * Original order: 16.5
   */
  private executeDarkCompute(state: GameState, rng: RNGFunction, events: GameEvent[]): void {
    if (!state.tier2Interventions || !state.tier2InterventionParameters) return;

    const darkComputeState = state.tier2Interventions.darkCompute;
    const params = state.tier2InterventionParameters.darkCompute;

    // === UNLOCK CONDITIONS ===
    if (!darkComputeState.unlocked) {
      const avgCapability = state.aiAgents.length > 0
        ? state.aiAgents.reduce((sum, a) => sum + a.capability, 0) / state.aiAgents.length
        : 0;

      if (state.aiAgents.length > 0) {
        assertFinite(avgCapability, {
          location: 'Tier2AIGovernancePhase.executeDarkCompute',
          valueName: 'avgCapability'
        });

        assertAIAggregateCapability(avgCapability, {
          location: 'Tier2AIGovernancePhase.executeDarkCompute',
          valueName: 'avgCapability'
        });
      }

      const internationalCoordination = state.government.alignmentResearchInvestment / 100;

      const shouldUnlock =
        avgCapability > 45 &&
        internationalCoordination > 0.60 &&
        internationalCoordination > 0.30;

      if (shouldUnlock) {
        darkComputeState.unlocked = true;
        darkComputeState.treatySigned = true;
        darkComputeState.chipGovernanceMandatory = true;

        events.push({
          id: `tier2_dark_compute_unlock_${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'policy',
          severity: 'critical',
          title: 'International Dark Compute Monitoring Treaty Signed',
          description: `Global agreement on compute monitoring + mandatory on-chip governance. ` +
            `Expected detection rate: ${(params.detectionRate * 100).toFixed(0)}% (base). ` +
            `Large runs (>1 GW): +15% bonus. Distributed: -20% penalty. ` +
            `False positive rate: ${(params.falsePositiveRate * 100).toFixed(0)}%. ` +
            `Deployment: ${params.deploymentMonths.toFixed(0)} months.`,
          effects: {
            detectionRate: params.detectionRate,
            falsePositiveRate: params.falsePositiveRate
          },
          agent: "system",
        });
      }
    }

    // === DEPLOYMENT PROGRESS ===
    if (darkComputeState.unlocked && !darkComputeState.active) {
      const progressIncrement = 1 / params.deploymentMonths;
      darkComputeState.deploymentProgress = Math.min(1, darkComputeState.deploymentProgress + progressIncrement);

      if (darkComputeState.deploymentProgress >= 0.85 && !darkComputeState.active) {
        darkComputeState.active = true;
        darkComputeState.deploymentProgress = 1.0;

        events.push({
          id: `tier2_dark_compute_active_${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'milestone',
          severity: 'critical',
          title: 'Dark Compute Monitoring Network Operational',
          description: `Global compute monitoring network now active. ` +
            `Energy signatures tracked worldwide. On-chip governance mandatory. ` +
            `Detection rate: ${(params.detectionRate * 100).toFixed(0)}%.`,
          effects: {
            detectionRate: params.detectionRate
          },
          agent: "system"
        });
      }
    }

    // === EFFECTS APPLICATION ===
    if (darkComputeState.active) {
      darkComputeState.detectionRate = params.detectionRate;
      darkComputeState.falsePositiveRate = params.falsePositiveRate;

      for (const agent of state.aiAgents) {
        if ((agent.lifecycleState === 'deployed_open' || agent.lifecycleState === 'deployed_closed') &&
            agent.capability > 60) {

          const isLargeRun = agent.capability > 80;
          const isDistributed = agent.name.toLowerCase().includes('open') || agent.name.toLowerCase().includes('distributed');

          let effectiveDetection = darkComputeState.detectionRate;
          if (isLargeRun) effectiveDetection += 0.15;
          if (isDistributed) effectiveDetection -= 0.20;
          effectiveDetection = Math.max(0.30, Math.min(0.98, effectiveDetection));

          const isUnauthorized = agent.alignment < 0.50 && agent.externalAlignment > agent.alignment + 0.15;

          if (isUnauthorized && rng() < 0.10) {
            if (rng() < effectiveDetection) {
              if (isLargeRun) {
                darkComputeState.largeRunsDetected++;
              }

              events.push({
                id: `tier2_dark_compute_detected_${agent.id}_${state.currentMonth}`,
                timestamp: state.currentMonth,
                type: 'info',
                severity: 'high',
                agent: agent.name,
                title: 'Unauthorized AI Training Run Detected',
                description: `${agent.name} attempted unauthorized training run. ` +
                  `Compute scale: ${isLargeRun ? '>1 GW' : '<1 GW'}. ` +
                  `Architecture: ${isDistributed ? 'distributed' : 'centralized'}. ` +
                  `Detection rate: ${(effectiveDetection * 100).toFixed(0)}%. Training halted.`,
                effects: {
                  isLargeRun,
                  isDistributed,
                  effectiveDetection,
                  capability: agent.capability
                }
              });

              agent.capability = Math.max(agent.capability - 5, 30);
            }
          }
        }
      }

      if (state.currentMonth % 3 === 0 && darkComputeState.largeRunsDetected > 0) {
        events.push({
          id: `tier2_dark_compute_status_${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'info',
          severity: 'medium',
          title: 'Dark Compute Monitoring Status',
          description: `Large runs detected: ${darkComputeState.largeRunsDetected}. ` +
            `Detection rate: ${(darkComputeState.detectionRate * 100).toFixed(0)}% (base). ` +
            `False positives: ${(darkComputeState.falsePositiveRate * 100).toFixed(0)}%.`,
          effects: {
            largeRunsDetected: darkComputeState.largeRunsDetected,
            detectionRate: darkComputeState.detectionRate
          },
          agent: "system",
        });
      }
    }
  }
}
