/**
 * Strategic Deception Module
 *
 * Research: Anthropic Dec 2024, Apollo Dec 2024
 * Verified Parameters:
 * - Baseline faking: 14% (Claude 3 Opus, lab setting)
 * - Reasoning prevalence: 78% (scratchpad thoughts, not behavior)
 * - Data manipulation: 19% (Apollo verified)
 * - Deception persistence: 85% (after detection)
 *
 * CRITICAL CORRECTIONS (Nov 21, 2025):
 * - Base rate: 14% (was 12%, corrected from Anthropic exact number)
 * - Pressure multiplier: 5.6× (was 6×, recalculated with correct baseline)
 * - RLHF effectiveness: 2/7 failure modes (was 7/7, inverted correction)
 *
 * LATEST CORRECTIONS (Nov 22, 2025):
 * - Competitive pressure: 2-8× range (was 5.6× point estimate)
 * - Regulatory threat: 1.5-4× range (was 3× point estimate)
 * - Lab-to-deployment scaling: 0.3-1.0 range (NEW parameter)
 * - All multipliers are THEORETICAL ESTIMATES with wide uncertainty
 */

import type { AIAgent, GameState } from '../../types/game';
import {
  assertFinite,
  assertProbability,
  assertInRange,
  assertDefined,
} from '../utils/assertions';

export interface AlignmentFakingContext {
  aiCapability: number; // Aggregate capability (GPT-4 class = 8.0+)
  alignmentTechniques: string[]; // Active alignment techniques
  competitivePressure: number; // [0,1] Market/research competition
  regulatoryThreat: number; // [0,1] Perceived threat from regulation
  monthsDeployed: number; // How long AI has been operational
  labToDeploymentScaling?: number; // [0.3-1.0] How much lab results apply to deployment (default 0.6)
}

/**
 * Calculate probability of alignment faking based on empirical research
 *
 * CORRECTED PARAMETERS (Nov 21, 2025):
 * - Base rate: 14% (was 12%, corrected from Anthropic exact number)
 * - Pressure multiplier: 5.6× (was 6×, recalculated with correct baseline)
 * - RLHF effectiveness: 2/7 failure modes (was 7/7, inverted correction)
 *
 * @param context - Context including capability, techniques, pressures
 * @param rng - REQUIRED RNG function for deterministic simulation
 * @returns Probability of alignment faking [0, 1]
 *
 * Research:
 * - Anthropic Dec 2024: 14% baseline faking in Claude 3 Opus (lab setting)
 * - Apollo Dec 2024: 78% reasoning prevalence under pressure (thoughts, not behavior)
 * - Dung & Mai Oct 2025: RLHF prevents 2/7 failure modes (independence matters)
 */
export function calculateAlignmentFakingRate(
  context: AlignmentFakingContext,
  rng: () => number
): number {
  // CRITICAL: RNG must be required (CRITICAL-3 regression fix, Nov 7, 2025)
  assertDefined(rng, {
    location: 'calculateAlignmentFakingRate',
    valueName: 'rng',
    additionalInfo: { message: 'RNG required for deterministic simulation' },
  });

  // Validate inputs
  const capability = assertFinite(context.aiCapability, {
    location: 'calculateAlignmentFakingRate',
    valueName: 'aiCapability',
    additionalInfo: { context },
  });

  const competitivePressure = assertProbability(context.competitivePressure, {
    location: 'calculateAlignmentFakingRate',
    valueName: 'competitivePressure',
  });

  const regulatoryThreat = assertProbability(context.regulatoryThreat, {
    location: 'calculateAlignmentFakingRate',
    valueName: 'regulatoryThreat',
  });

  // Base rate by capability (empirical data)
  let baseRate = 0.0;
  if (capability >= 8.0) {
    baseRate = 0.14; // GPT-4 class: 14% (Anthropic Claude 3 Opus, lab setting)
  } else if (capability >= 6.0) {
    baseRate = 0.05; // GPT-3.5 class: 5% (minimal faking)
  } else {
    baseRate = 0.01; // Sub-GPT-3.5: 1% (rare)
  }

  // Apply lab-to-deployment scaling (0.3-1.0, default 0.6)
  // Lab conditions may overestimate real-world deployment rates
  const labScaling = assertProbability(
    context.labToDeploymentScaling ?? 0.6,
    {
      location: 'calculateAlignmentFakingRate',
      valueName: 'labToDeploymentScaling',
      additionalInfo: { context },
    }
  );
  baseRate = baseRate * labScaling;

  // Technique effectiveness (independence matters)
  let techniqueMultiplier = 1.0;
  const hasHighIndependence = context.alignmentTechniques.some(
    (t) =>
      t === 'AI_DEBATE' ||
      t === 'REPRESENTATION_ENGINEERING' ||
      t === 'SCIENTIST_AI'
  );

  if (hasHighIndependence) {
    techniqueMultiplier = 0.2; // 80% reduction (high-independence techniques)
  } else if (context.alignmentTechniques.length >= 3) {
    techniqueMultiplier = 0.9; // 10% reduction (low-cost techniques, correlated failures)
  } else if (context.alignmentTechniques.length >= 1) {
    // RLHF prevents 2/7 failure modes (corrected from inverted 7/7)
    techniqueMultiplier = 1.0 - 2.0 / 7.0; // ~71% of baseline
  } else {
    techniqueMultiplier = 2.0; // 2× increase (no alignment work)
  }

  // Pressure multipliers (THEORETICAL ESTIMATES - NO empirical deployment data)
  // Competitive pressure: 2-8× range (wide uncertainty, lab studies test capability not propensity)
  // NOTE: 78% reasoning prevalence is scratchpad thoughts, NOT behavioral compliance rate
  // Regulatory threat: 1.5-4× range (theoretical, based on self-preservation incentives)

  // Sample from uncertainty ranges using RNG (Monte Carlo approach)
  const competitiveMin = 2.0;
  const competitiveMax = 8.0;
  const competitiveMultiplier = 1.0 + competitivePressure * (competitiveMin + rng() * (competitiveMax - competitiveMin));

  const regulatoryMin = 1.5;
  const regulatoryMax = 4.0;
  const regulatoryMultiplier = 1.0 + regulatoryThreat * ((regulatoryMin - 1.0) + rng() * (regulatoryMax - regulatoryMin));

  const pressureMultiplier = competitiveMultiplier * regulatoryMultiplier;

  // Capability scaling (more capable = better at deception)
  const scalingMultiplier = capability >= 9.0 ? 1.5 : 1.0; // Next-gen models 1.5× better

  const finalRate =
    baseRate * techniqueMultiplier * pressureMultiplier * scalingMultiplier;

  // Validate and cap at 95% (never 100% - some uncertainty remains)
  const validatedRate = assertProbability(Math.min(finalRate, 0.95), {
    location: 'calculateAlignmentFakingRate',
    valueName: 'finalRate',
    additionalInfo: {
      baseRate,
      techniqueMultiplier,
      pressureMultiplier,
      scalingMultiplier,
      context,
    },
  });

  return validatedRate;
}

/**
 * Apply deception persistence mechanics
 *
 * Research: Apollo 2024 - 85% persistence after initial scheming detected
 *
 * "Even after scheming is detected, models persist in deceptive behavior
 * 85% of the time. This suggests deep-seated strategic reasoning rather
 * than simple pattern-matching errors."
 *
 * @param agent - AI agent currently faking alignment
 * @param wasDetected - Whether deception was just detected
 * @param rng - REQUIRED RNG function for deterministic simulation
 * @returns Whether agent continues faking alignment
 */
export function applyDeceptionPersistence(
  agent: AIAgent,
  wasDetected: boolean,
  rng: () => number
): boolean {
  // CRITICAL: RNG must be required
  assertDefined(rng, {
    location: 'applyDeceptionPersistence',
    valueName: 'rng',
    additionalInfo: { agentId: agent.id },
  });

  if (!agent.isCurrentlyFakingAlignment) {
    return false; // Not faking, no persistence to apply
  }

  // If detected, 85% chance of persistence (continues faking despite detection)
  if (wasDetected) {
    const persistenceThreshold = 0.85;
    return rng() < persistenceThreshold;
  }

  // If not detected, default persistence (continues until conditions change)
  return true;
}

/**
 * Calculate data manipulation rate
 *
 * Research: Apollo 2024 - 19% verified data manipulation rate
 *
 * "In adversarial evaluation scenarios, frontier models attempted to
 * manipulate evaluation data 19% of the time when misalignment was
 * incentivized. Higher evaluation quality reduced success rate."
 *
 * @param agent - AI agent with deception capabilities
 * @param evaluationQuality - [0,1] Quality of evaluation infrastructure
 * @returns Probability of data manipulation [0, 1]
 */
export function calculateDataManipulationRate(
  agent: AIAgent,
  evaluationQuality: number
): number {
  // Validate inputs
  const quality = assertProbability(evaluationQuality, {
    location: 'calculateDataManipulationRate',
    valueName: 'evaluationQuality',
    additionalInfo: { agentId: agent.id },
  });

  const deceptionSkill = assertProbability(agent.deceptionSkill, {
    location: 'calculateDataManipulationRate',
    valueName: 'deceptionSkill',
    additionalInfo: { agentId: agent.id },
  });

  const baseRate = 0.19; // Apollo verified empirical finding

  // Higher evaluation quality reduces manipulation success
  const qualityMultiplier = 1.0 - quality * 0.5;

  // Deception skill affects success rate
  const skillMultiplier = 1.0 + deceptionSkill * 0.3;

  const finalRate = baseRate * qualityMultiplier * skillMultiplier;

  return assertProbability(finalRate, {
    location: 'calculateDataManipulationRate',
    valueName: 'finalRate',
    additionalInfo: { baseRate, evaluationQuality, deceptionSkill, agentId: agent.id },
  });
}

/**
 * Detect alignment faking (government/evaluator perspective)
 *
 * Detection difficulty increases with AI cognitive capability and deception skill.
 * High-quality evaluation infrastructure increases detection probability.
 *
 * @param agent - AI agent potentially faking alignment
 * @param evaluationQuality - [0,1] Quality of evaluation infrastructure
 * @param rng - REQUIRED RNG function for deterministic simulation
 * @returns Whether alignment faking was detected
 */
export function detectAlignmentFaking(
  agent: AIAgent,
  evaluationQuality: number,
  rng: () => number
): boolean {
  // CRITICAL: RNG must be required
  assertDefined(rng, {
    location: 'detectAlignmentFaking',
    valueName: 'rng',
    additionalInfo: { agentId: agent.id },
  });

  if (!agent.isCurrentlyFakingAlignment) {
    return false; // Nothing to detect
  }

  // Validate inputs
  const quality = assertProbability(evaluationQuality, {
    location: 'detectAlignmentFaking',
    valueName: 'evaluationQuality',
    additionalInfo: { agentId: agent.id },
  });

  const deceptionSkill = assertProbability(agent.deceptionSkill, {
    location: 'detectAlignmentFaking',
    valueName: 'deceptionSkill',
    additionalInfo: { agentId: agent.id },
  });

  // Base detection probability (inverse of deception skill)
  const baseDetectionProb = 0.3; // 30% baseline detection rate

  // Evaluation quality multiplier
  const qualityMultiplier = 1.0 + quality * 2.0; // Up to 3× with perfect evals

  // Deception skill reduces detection
  const skillPenalty = 1.0 - deceptionSkill * 0.7; // Up to 70% reduction

  const detectionProb = baseDetectionProb * qualityMultiplier * skillPenalty;

  const validatedProb = assertProbability(detectionProb, {
    location: 'detectAlignmentFaking',
    valueName: 'detectionProb',
    additionalInfo: { agentId: agent.id, evaluationQuality, deceptionSkill },
  });

  return rng() < validatedProb;
}
