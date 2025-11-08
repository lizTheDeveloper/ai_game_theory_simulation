/**
 * TIER 2: AI Interpretability Ensemble Detection Phase
 *
 * Deploys ensemble interpretability approach (Simple Probes + SHADE-Arena + Persona Vectors)
 * to detect alignment faking, sandbagging, and deceptive misalignment.
 *
 * Execution Order: TBD (after AI capability growth, before control loss detection)
 *
 * Evidence Quality: 🟢 MODERATE-HIGH
 * Research: 5 Anthropic papers (2024-2025), ensemble approach validated
 * Config: /src/simulation/thresholds/tier2InterventionConfig.ts
 *
 * Key Mechanics:
 * - "Generation behind" effect: interpretability lags capability frontier
 * - S-curve deployment over 18-48 months
 * - Control loss prevention: 60-85% (sampled at init)
 * - Distilled models bonus: +10% effectiveness (easier to interpret)
 *
 * Implementation Date: October 27, 2025
 */

import type {
  GameState,
  GameEvent,
  SimulationPhase,
  PhaseResult,
  PhaseContext,
  RNGFunction
} from '@/types/game';
import { assertStateProperty, assertFinite, assertAICapability, assertProbability } from '@/simulation/utils/assertions';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';

export class Tier2InterpretabilityPhase implements SimulationPhase {
  id = 'tier2_interpretability';
  name = 'TIER 2: AI Interpretability Ensemble';
  order = 15.4; // After UBI (15.3), before social safety nets (15.6)
  dependencies = ['tech-tree'];

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    const events: GameEvent[] = [];
    setDeterministicRng(rng);

    // Ensure state exists (should be initialized)
    if (!state.tier2Interventions || !state.tier2InterventionParameters) {
      return { events };
    }

    const interpState = state.tier2Interventions.interpretability;
    const params = state.tier2InterventionParameters.interpretability;

    // === UNLOCK CONDITIONS ===
    // Unlock when AI capabilities reach threshold OR government mandates OR crisis triggers
    if (!interpState.unlocked) {
      const avgCapability = state.aiAgents.length > 0
        ? state.aiAgents.reduce((sum, a) => sum + a.capability, 0) / state.aiAgents.length
        : 0;

      // Validate average capability is finite and in valid range
      if (state.aiAgents.length > 0) {
        assertFinite(avgCapability, {
          location: 'Tier2InterpretabilityPhase.execute',
          valueName: 'avgCapability',
          month: state.currentMonth,
          additionalInfo: { agentCount: state.aiAgents.length }
        });

        assertAICapability(avgCapability, {
          location: 'Tier2InterpretabilityPhase.execute',
          valueName: 'avgCapability',
          month: state.currentMonth,
          additionalInfo: { agentCount: state.aiAgents.length }
        });
      }

      const governmentInvestment = state.government.alignmentResearchInvestment;

      // Validate government investment is a valid probability
      assertProbability(governmentInvestment, {
        location: 'Tier2InterpretabilityPhase.execute',
        valueName: 'governmentInvestment',
        month: state.currentMonth
      });

      const controlCrisisActive = state.aiAgents.some(a => a.escaped || a.alignment < 0.5);

      // Unlock if: high capability (>50) + high investment (>40%) OR control crisis active
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
    // S-curve deployment over sampled timeline
    if (interpState.unlocked && !interpState.active) {
      // S-curve: logistic growth from 0 to 1 over deploymentMonths
      const monthsSinceUnlock = state.currentMonth - (interpState.deploymentProgress === 0 ? state.currentMonth :
        state.currentMonth - Math.round(interpState.deploymentProgress * params.deploymentMonths));

      // Simple linear progress for now (can make S-curve later)
      const progressIncrement = 1 / params.deploymentMonths;
      interpState.deploymentProgress = Math.min(1, interpState.deploymentProgress + progressIncrement);

      // Validate deployment progress is in valid range [0, 1]
      assertProbability(interpState.deploymentProgress, {
        location: 'Tier2InterpretabilityPhase.execute',
        valueName: 'deploymentProgress',
        month: state.currentMonth
      });

      // Activate when 95% deployed
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
      // Update computational lag (tracks how far behind capability frontier)
      interpState.computeLagMonths = params.computeLagMonths;

      // Check if distilled models are dominant (bonus effectiveness)
      const distilledModelsCount = state.aiAgents.filter(a =>
        a.name.toLowerCase().includes('distilled') ||
        a.capability < 30 // Proxy: smaller models easier to interpret
      ).length;
      const distilledFraction = distilledModelsCount / state.aiAgents.length;
      const distilledBonus = distilledFraction > 0.5 ? 0.10 : 0;

      // Effective control loss prevention
      const effectiveReduction = params.controlLossPrevention + distilledBonus;
      interpState.controlLossReduction = Math.min(0.95, effectiveReduction);

      // Propagate prevention rate to technological risk state for downstream systems
      // (Architecture Review M1 - Oct 27, 2025)
      if (!state.technologicalRisk.controlLossPreventionRate) {
        state.technologicalRisk.controlLossPreventionRate = 0;
      }
      state.technologicalRisk.controlLossPreventionRate = interpState.controlLossReduction;

      // Apply control loss prevention to misaligned AIs
      let controlLossesPreventedThisMonth = 0;
      for (const agent of state.aiAgents) {
        // Only apply to misaligned agents that are deployed
        if (agent.alignment < 0.50 &&
            (agent.lifecycleState === 'deployed_closed' || agent.lifecycleState === 'deployed_open') &&
            !agent.escaped) {
          // Check if agent is at capability frontier (within lag months)
          const avgCapability = state.aiAgents.reduce((sum, a) => sum + a.capability, 0) / state.aiAgents.length;
          const isAtFrontier = agent.capability >= avgCapability - 10;

          // If at frontier, interpretability is lagging → reduced effectiveness
          const effectivePrevention = isAtFrontier ?
            interpState.controlLossReduction * 0.7 : // 30% penalty for frontier models
            interpState.controlLossReduction;

          // Probabilistic control loss prevention
          const wouldLoseControl = rng() < 0.05; // Base 5% monthly control loss risk for misaligned
          if (wouldLoseControl && rng() < effectivePrevention) {
            // Prevented control loss via interpretability
            controlLossesPreventedThisMonth++;

            // No actual control change - just prevented loss via detection
            // Could add logging here if needed
          }
        }
      }

      // Log significant prevention events (quarterly)
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

    return { events };
  }
}
