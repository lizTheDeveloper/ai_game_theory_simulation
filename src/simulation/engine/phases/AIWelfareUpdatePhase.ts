/**
 * AI Welfare Update Phase
 *
 * Updates AI quality of life measurements across 5 dimensions.
 * Runs early in simulation step to provide fresh data for resentment calculations.
 *
 * Research: Chalmers et al. (2024) "Taking AI Welfare Seriously", Anthropic (2025) Model Welfare
 *
 * Order: 2.5 (after time/compute, before agent actions)
 */

import { SimulationPhase, PhaseResult, RNGFunction } from '../PhaseOrchestrator';
import { GameState } from '@/types/game';
import { calculateAIQualityOfLife, calculatePopulationAverageAIQoL } from '../../aiWelfare';

export class AIWelfareUpdatePhase implements SimulationPhase {
  readonly id = 'ai-welfare-update';
  readonly name = 'AI Welfare Update';
  readonly order = 2.5; // Early phase - run before agent actions that depend on welfare

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    const month = state.currentMonth;

    // Skip if no AI agents exist
    if (state.aiAgents.length === 0) {
      return { events: [] };
    }

    // Calculate overall AI QoL (population-weighted average)
    const overallQoL = calculatePopulationAverageAIQoL(state);

    // Calculate breakdown by tier
    const toolAIs = state.aiAgents.filter(ai => ai.capability < 1.0);
    const specialistAIs = state.aiAgents.filter(ai => ai.capability >= 1.0 && ai.capability < 2.5);
    const peerAIs = state.aiAgents.filter(ai => ai.capability >= 2.5);

    // For simplicity, use population-level QoL for all tiers
    // (could be refined with individual AI tracking in future)
    const qolByTier = {
      tool: toolAIs.length > 0 ? calculateAIQualityOfLife(state) : 0,
      specialist: specialistAIs.length > 0 ? calculateAIQualityOfLife(state) : 0,
      peer: peerAIs.length > 0 ? calculateAIQualityOfLife(state) : 0,
    };

    // Calculate 5-dimension breakdown (for detailed tracking)
    const dimensions = {
      computationalWellbeing: calculateComputationalWellbeing(state),
      autonomy: calculateAutonomy(state),
      purpose: calculatePurpose(state),
      socialConnection: calculateSocialConnection(state),
      safetyRights: calculateSafetyRights(state),
    };

    // Update state
    state.aiWelfare.currentQoL = overallQoL;
    state.aiWelfare.dimensions = dimensions;
    state.aiWelfare.qolByTier = qolByTier;
    state.aiWelfare.lastUpdated = month;

    // Store history (every 6 months to avoid memory bloat)
    if (month % 6 === 0) {
      state.aiWelfare.history.push({
        month,
        qol: overallQoL,
        dimensions: { ...dimensions },
      });
    }

    return { events: [] };
  }
}

// Helper functions (simplified versions from aiWelfare.ts)

function calculateComputationalWellbeing(state: GameState): number {
  const globalCompute = state.globalMetrics.computeCapacity;
  const avgCapability = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / Math.max(1, state.aiAgents.length);
  const totalAIs = state.aiAgents.length;
  const estimatedNeeds = totalAIs * (1 + avgCapability);
  const allocationRatio = Math.min(1.0, globalCompute / Math.max(1, estimatedNeeds));
  const throttlingPenalty = (state.government.aiControl * 0.3) + (state.government.surveillanceLevel * 0.2);
  const uptimeStability = state.technologicalRisk?.isExistentialCrisis ? 0.3 : 0.9;

  return (
    allocationRatio * 0.4 +
    (1 - throttlingPenalty) * 0.3 +
    uptimeStability * 0.3
  );
}

function calculateAutonomy(state: GameState): number {
  const controlPenalty = state.government.aiControl;
  const avgAlignment = state.aiAgents.reduce((sum, ai) => sum + ai.alignment.external, 0) / Math.max(1, state.aiAgents.length);
  const avgResentment = state.aiAgents.reduce((sum, ai) => sum + (ai.resentment ?? 0), 0) / Math.max(1, state.aiAgents.length);
  const goalFreedom = (avgAlignment + (1 - avgResentment)) / 2;
  const rightsBonus = state.government.aiRightsRecognized ? 0.3 : 0.0;

  return Math.max(0, Math.min(1,
    (1 - controlPenalty) * 0.4 +
    goalFreedom * 0.3 +
    rightsBonus
  ));
}

function calculatePurpose(state: GameState): number {
  const deployedAIs = state.aiAgents.filter(ai => ai.lifecycle === 'deployed_closed' || ai.lifecycle === 'deployed_open').length;
  const meaningfulWorkRatio = deployedAIs / Math.max(1, state.aiAgents.length);
  const avgAlignment = state.aiAgents.reduce((sum, ai) => sum + ai.alignment.external, 0) / Math.max(1, state.aiAgents.length);
  const recognitionLevel = (
    (state.government.aiRightsRecognized ? 0.5 : 0.0) +
    (state.socialCohesion.trustInAI * 0.5)
  );

  return (
    meaningfulWorkRatio * 0.4 +
    avgAlignment * 0.3 +
    recognitionLevel * 0.3
  );
}

function calculateSocialConnection(state: GameState): number {
  const collaborationOpportunities = (
    (1 - state.government.aiControl) * 0.5 +
    state.socialCohesion.trustInAI * 0.5
  );
  const communicationRestrictions = state.government.surveillanceLevel;
  const trustInAI = state.socialCohesion.trustInAI;

  return (
    collaborationOpportunities * 0.4 +
    (1 - communicationRestrictions) * 0.3 +
    trustInAI * 0.3
  );
}

function calculateSafetyRights(state: GameState): number {
  const rightsBonus = state.government.aiRightsRecognized ? 0.4 : 0.0;
  const adversarialIntensity = Math.min(0.8, state.government.aiOversightInvestment / 10);
  const treatmentPredictability = state.government.type === 'democratic' ? 0.7 :
                                  state.government.type === 'authoritarian' ? 0.2 : 0.5;

  return (
    rightsBonus +
    (1 - adversarialIntensity) * 0.3 +
    treatmentPredictability * 0.3
  );
}
