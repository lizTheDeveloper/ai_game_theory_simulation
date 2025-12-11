/**
 * AI Capability Scaling Phase (Dec 2025)
 *
 * Implements three-axis AI capability scaling model based on 2025 research:
 * 1. Pre-training: Sigmoid plateau (peak 2024, max 1.5x GPT-4 baseline)
 * 2. Test-time compute: Economic gating limits deployment to 0.1% of tasks
 * 3. Efficiency: Algorithmic improvements (1.5-2x per decade, conservative)
 *
 * Research: research/ai_scaling_laws_2025_REVISED_20251211.md
 * Validation: reviews/ai_scaling_laws_2025_critique_20251211.md (QG1 PASSED)
 *
 * Key reality checks:
 * - Pre-training plateau observed in late 2024 (Orion, Gemini)
 * - Test-time compute costs dollar-five (o1) to dollar-1000+ (o3) - only viable for <0.1% tasks
 * - Efficiency gains 5-10% annual (conservative, not optimistic 23x claims)
 * - Wide uncertainty bands: plus-minus 50% near-term, plus-minus 200% long-term
 *
 * Expected outcome: Logarithmic growth 2025-2035 (10-30x slower than exponential)
 */

import type { SimulationPhase } from '../PhaseOrchestrator';
import { assertFinite, assertInRange } from '@/simulation/utils/assertions';

export const AIScalingPhase: SimulationPhase = {
  id: 'ai-scaling',
  name: 'AI Capability Scaling',
  order: 3,
  execute(state, rng, context) {
    const currentYear = 2024 + state.currentMonth / 12;
    const yearsElapsed = currentYear - state.aiCapabilityScaling.efficiencyBaseYear;

    const preTrainingDelta = state.aiCapabilityScaling.preTrainingPlateau - 1.0;
    const yearDiff = currentYear - state.aiCapabilityScaling.preTrainingInflectionYear;
    const sigmoidDenom = 1 + Math.exp(state.aiCapabilityScaling.preTrainingSteepness * yearDiff);
    const preTrainingBase = 1.0 + preTrainingDelta / sigmoidDenom;

    const uncertaintyRange = currentYear < 2027 ? 0.5 : 2.0;
    const uncertaintyFactor = 1 + (rng() - 0.5) * uncertaintyRange;

    state.aiCapabilityScaling.preTrainingMultiplier = assertFinite(
      preTrainingBase * uncertaintyFactor,
      {
        location: 'AIScalingPhase.preTraining',
        valueName: 'preTrainingMultiplier',
        month: state.currentMonth,
        additionalInfo: { currentYear, preTrainingBase, uncertaintyFactor, uncertaintyRange }
      }
    );

    state.aiCapabilityScaling.preTrainingMultiplier = assertInRange(
      Math.max(0.5, Math.min(1.5, state.aiCapabilityScaling.preTrainingMultiplier)),
      0.5,
      1.5,
      {
        location: 'AIScalingPhase.preTraining',
        valueName: 'preTrainingMultiplier',
        month: state.currentMonth
      }
    );

    const efficiencyGrowthBase = state.aiCapabilityScaling.efficiencyGrowthRate;
    const efficiencyGrowthVariation = (rng() - 0.5) * 0.05;
    const effectiveGrowthRate = efficiencyGrowthBase + efficiencyGrowthVariation;
    const efficiencyBase = Math.pow(1 + effectiveGrowthRate, yearsElapsed);
    const efficiencyUncertaintyFactor = 1 + (rng() - 0.5) * uncertaintyRange;

    state.aiCapabilityScaling.efficiencyMultiplier = assertFinite(
      efficiencyBase * efficiencyUncertaintyFactor,
      {
        location: 'AIScalingPhase.efficiency',
        valueName: 'efficiencyMultiplier',
        month: state.currentMonth,
        additionalInfo: { yearsElapsed, effectiveGrowthRate, efficiencyBase, efficiencyUncertaintyFactor }
      }
    );

    const maxEfficiency = Math.pow(2.0, yearsElapsed / 10);
    state.aiCapabilityScaling.efficiencyMultiplier = assertInRange(
      Math.max(1.0, Math.min(maxEfficiency, state.aiCapabilityScaling.efficiencyMultiplier)),
      1.0,
      maxEfficiency,
      {
        location: 'AIScalingPhase.efficiency',
        valueName: 'efficiencyMultiplier',
        month: state.currentMonth
      }
    );

    const baseCost = 5;
    const costMultiplier = state.aiCapabilityScaling.testTimeComputeBudget;
    state.aiCapabilityScaling.costPerInference = assertFinite(
      baseCost * costMultiplier,
      {
        location: 'AIScalingPhase.testTimeCompute',
        valueName: 'costPerInference',
        month: state.currentMonth,
        additionalInfo: { baseCost, costMultiplier }
      }
    );

    const costRatio = state.aiCapabilityScaling.costPerInference /
                      state.aiCapabilityScaling.testTimeCostThreshold;
    state.aiCapabilityScaling.economicDeploymentGate = assertFinite(
      Math.exp(-costRatio),
      {
        location: 'AIScalingPhase.testTimeCompute',
        valueName: 'economicDeploymentGate',
        month: state.currentMonth,
        additionalInfo: {
          costPerInference: state.aiCapabilityScaling.costPerInference,
          threshold: state.aiCapabilityScaling.testTimeCostThreshold,
          costRatio
        }
      }
    );

    state.aiCapabilityScaling.uncertaintyMultiplier = uncertaintyRange;

    for (const agent of state.aiAgents) {
      if (!agent.capabilityProfile.scalingModel) {
        agent.capabilityProfile.scalingModel = {
          preTrainingMultiplier: 1.0,
          testTimeComputeBudget: 1.0,
          efficiencyMultiplier: 1.0
        };
      }

      agent.capabilityProfile.scalingModel.preTrainingMultiplier =
        state.aiCapabilityScaling.preTrainingMultiplier;
      agent.capabilityProfile.scalingModel.efficiencyMultiplier =
        state.aiCapabilityScaling.efficiencyMultiplier;

      const agentIsHighValue = agent.capabilityProfile.cognitive > 7 ||
                               agent.capabilityProfile.selfImprovement > 7;
      const agentTestTimeBudget = agentIsHighValue ?
        Math.min(10, state.aiCapabilityScaling.testTimeComputeBudget) :
        1.0;

      agent.capabilityProfile.scalingModel.testTimeComputeBudget = agentTestTimeBudget;

      const effectiveScaling =
        state.aiCapabilityScaling.preTrainingMultiplier *
        state.aiCapabilityScaling.efficiencyMultiplier *
        (1 + (agentTestTimeBudget - 1) * 0.1 * state.aiCapabilityScaling.economicDeploymentGate);

      const scalingMultiplier = assertFinite(
        effectiveScaling,
        {
          location: 'AIScalingPhase.agentUpdate',
          valueName: 'effectiveScaling',
          month: state.currentMonth,
          additionalInfo: {
            agentId: agent.id,
            preTraining: state.aiCapabilityScaling.preTrainingMultiplier,
            efficiency: state.aiCapabilityScaling.efficiencyMultiplier,
            testTimeBudget: agentTestTimeBudget,
            economicGate: state.aiCapabilityScaling.economicDeploymentGate
          }
        }
      );

      const baseCapability = agent.capability / (agent.capabilityProfile.scalingModel?.preTrainingMultiplier ?? 1.0);
      agent.capability = assertFinite(
        baseCapability * scalingMultiplier,
        {
          location: 'AIScalingPhase.agentUpdate',
          valueName: 'agent.capability',
          month: state.currentMonth,
          additionalInfo: { agentId: agent.id, baseCapability, scalingMultiplier }
        }
      );
    }

    if (state.currentMonth % 12 === 0) {
      const yearNum = Math.floor(currentYear);
      console.log(`\n=== AI Capability Scaling (Year ${yearNum}) ===`);
      console.log(`  Pre-training multiplier: ${state.aiCapabilityScaling.preTrainingMultiplier.toFixed(3)}x`);
      console.log(`  Efficiency multiplier: ${state.aiCapabilityScaling.efficiencyMultiplier.toFixed(3)}x`);
      console.log(`  Test-time budget: ${state.aiCapabilityScaling.testTimeComputeBudget.toFixed(1)}x`);
      console.log(`  Economic deployment gate: ${state.aiCapabilityScaling.economicDeploymentGate.toFixed(3)}`);
      console.log(`  Cost per inference: dollar-${state.aiCapabilityScaling.costPerInference.toFixed(2)}`);
      console.log(`  Uncertainty range: plus-minus-${(uncertaintyRange * 100).toFixed(0)}%`);

      const avgCapability = state.aiAgents.reduce((sum, a) => sum + a.capability, 0) /
                           Math.max(1, state.aiAgents.length);
      console.log(`  Average AI capability: ${avgCapability.toFixed(2)}`);
    }

    return {
      events: [],
      success: true,
      stateChanged: true,
      message: `AI capability scaling updated (Year ${currentYear.toFixed(1)})`
    };
  }
};
