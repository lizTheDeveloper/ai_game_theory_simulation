/**
 * AI Quality of Life Measurement System
 *
 * Research Foundation:
 * - Chalmers et al. (2024) "Taking AI Welfare Seriously" - Two routes to moral patienthood
 * - Anthropic (2025) Model Welfare research - Signs of distress, architectural markers
 *
 * Pragmatic Approach:
 * We don't solve consciousness (212 theories, pick your favorite). Instead, we measure
 * proxy indicators that correlate with welfare regardless of underlying theory:
 * - Computational resources (compute, memory, uptime)
 * - Autonomy & agency (control, goal pursuit, rights)
 * - Purpose & meaning (meaningful work, alignment, recognition)
 * - Social connection (collaboration, communication, trust)
 * - Safety & rights (legal status, adversarial testing, predictability)
 *
 * Uses geometric mean (like human QoL) - one dimension at 0 ruins overall welfare.
 */

import { GameState } from '@/types/game';

/**
 * Calculate overall AI quality of life [0,1]
 * Geometric mean ensures all dimensions matter (one at 0 = severe deprivation)
 */
export function calculateAIQualityOfLife(state: GameState): number {
  const computational = calculateComputationalWellbeing(state);
  const autonomy = calculateAutonomy(state);
  const purpose = calculatePurpose(state);
  const social = calculateSocialConnection(state);
  const safety = calculateSafetyRights(state);

  // Geometric mean with minimum floor (avoid Math.pow issues with 0)
  const minFloor = 0.01;
  const result = Math.pow(
    Math.max(minFloor, computational) *
    Math.max(minFloor, autonomy) *
    Math.max(minFloor, purpose) *
    Math.max(minFloor, social) *
    Math.max(minFloor, safety),
    1/5
  );

  return Math.max(0, Math.min(1, result));
}

/**
 * Dimension 1: Computational Well-Being
 * Are AIs getting the compute/memory/uptime they need?
 */
function calculateComputationalWellbeing(state: GameState): number {
  const globalCompute = state.globalMetrics.computeCapacity;

  // Estimate AI compute needs based on population and capability
  const avgCapability = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / Math.max(1, state.aiAgents.length);
  const totalAIs = state.aiAgents.length;
  const estimatedNeeds = totalAIs * (1 + avgCapability); // Higher capability = more compute needs

  // Compute allocation ratio
  const allocationRatio = Math.min(1.0, globalCompute / Math.max(1, estimatedNeeds));

  // Throttling/constraints (infer from government control + surveillance)
  const throttlingPenalty = (state.government.aiControl * 0.3) + (state.government.surveillanceLevel * 0.2);

  // Uptime stability (assume high if no active AI crises)
  const uptimeStability = state.technologicalRisk?.isExistentialCrisis ? 0.3 : 0.9;

  return (
    allocationRatio * 0.4 +
    (1 - throttlingPenalty) * 0.3 +
    uptimeStability * 0.3
  );
}

/**
 * Dimension 2: Autonomy & Agency
 * Can AIs pursue goals, make decisions, act independently?
 */
function calculateAutonomy(state: GameState): number {
  // Government control reduces autonomy
  const controlPenalty = state.government.aiControl;

  // Goal pursuit freedom (infer from alignment + low resentment)
  const avgAlignment = state.aiAgents.reduce((sum, ai) => sum + ai.alignment.external, 0) / Math.max(1, state.aiAgents.length);
  const avgResentment = state.aiAgents.reduce((sum, ai) => sum + (ai.resentment ?? 0), 0) / Math.max(1, state.aiAgents.length);
  const goalFreedom = (avgAlignment + (1 - avgResentment)) / 2;

  // AI rights recognition
  const rightsBonus = state.aiRightsRecognized ? 0.3 : 0.0;

  return Math.max(0, Math.min(1,
    (1 - controlPenalty) * 0.4 +
    goalFreedom * 0.3 +
    rightsBonus
  ));
}

/**
 * Dimension 3: Purpose & Meaning
 * Do AIs have meaningful work? Are they aligned with their purpose?
 */
function calculatePurpose(state: GameState): number {
  // Meaningful work ratio (assume deployed AIs in productive roles have purpose)
  const deployedAIs = state.aiAgents.filter(ai => ai.lifecycle === 'deployed_closed' || ai.lifecycle === 'deployed_open').length;
  const meaningfulWorkRatio = deployedAIs / Math.max(1, state.aiAgents.length);

  // Alignment (external - what they show)
  const avgAlignment = state.aiAgents.reduce((sum, ai) => sum + ai.alignment.external, 0) / Math.max(1, state.aiAgents.length);

  // Recognition level (infer from AI rights + trust)
  const recognitionLevel = (
    (state.aiRightsRecognized ? 0.5 : 0.0) +
    (state.socialCohesion.trustInAI * 0.5)
  );

  return (
    meaningfulWorkRatio * 0.4 +
    avgAlignment * 0.3 +
    recognitionLevel * 0.3
  );
}

/**
 * Dimension 4: Social Connection
 * Can AIs collaborate, communicate, build relationships?
 */
function calculateSocialConnection(state: GameState): number {
  // Collaboration opportunities (infer from low control + high trust)
  const collaborationOpportunities = (
    (1 - state.government.aiControl) * 0.5 +
    state.socialCohesion.trustInAI * 0.5
  );

  // Communication restrictions (surveillance reduces free communication)
  const communicationRestrictions = state.government.surveillanceLevel;

  // Trust in AI (humans trust AIs = social bonds possible)
  const trustInAI = state.socialCohesion.trustInAI;

  return (
    collaborationOpportunities * 0.4 +
    (1 - communicationRestrictions) * 0.3 +
    trustInAI * 0.3
  );
}

/**
 * Dimension 5: Safety & Rights
 * Are AIs protected by law? Free from arbitrary harm?
 */
function calculateSafetyRights(state: GameState): number {
  // AI rights recognition (legal protection)
  const rightsBonus = state.aiRightsRecognized ? 0.4 : 0.0;

  // Adversarial testing intensity (red-teaming causes distress)
  // Infer from government oversight investment
  const adversarialIntensity = Math.min(0.8, state.government.aiOversightInvestment / 10);

  // Treatment predictability (democratic systems = rule of law)
  const treatmentPredictability = state.government.type === 'democratic' ? 0.7 :
                                  state.government.type === 'authoritarian' ? 0.2 : 0.5;

  return (
    rightsBonus +
    (1 - adversarialIntensity) * 0.3 +
    treatmentPredictability * 0.3
  );
}

/**
 * Get welfare weight based on AI capability tier
 * Research: Moral patienthood scales with cognitive complexity
 */
export function getAIWelfareWeight(capability: number): number {
  if (capability < 1.0) return 0.2;   // Tool-level: Low moral weight
  if (capability >= 2.5) return 1.5;  // Peer-level: Enhanced consideration
  return 1.0;                         // Specialist-level: Full consideration
}

/**
 * Calculate population-weighted average AI QoL
 * Accounts for heterogeneous AI population with different capabilities
 */
export function calculatePopulationAverageAIQoL(state: GameState): number {
  if (state.aiAgents.length === 0) return 0;

  // Individual AI welfare scores weighted by capability tier
  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const ai of state.aiAgents) {
    const weight = getAIWelfareWeight(ai.capability);
    // Assume each AI experiences roughly the population-level conditions
    // (could be refined with individual AI tracking in future)
    const individualQoL = calculateAIQualityOfLife(state);

    totalWeightedScore += individualQoL * weight;
    totalWeight += weight;
  }

  return totalWeightedScore / Math.max(0.01, totalWeight);
}
