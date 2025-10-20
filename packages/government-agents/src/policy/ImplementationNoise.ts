/**
 * Implementation Noise
 *
 * Models the gap between policy intent and actual outcomes
 * due to corruption, bureaucratic inefficiency, and implementation failures
 *
 * Research Foundation:
 * - Pressman & Wildavsky (1973): Implementation - classic study of policy failure
 * - World Bank WGI Control of Corruption indicator
 * - Kaufmann et al. (2010): Worldwide Governance Indicators
 *
 * Key Findings:
 * - Intent-outcome gap correlates with corruption (WGI Control of Corruption)
 * - Best governments (Singapore): 5% noise
 * - Worst governments (Venezuela, Somalia): 40%+ noise
 * - Noise affects both policy direction and magnitude
 *
 * @module policy/ImplementationNoise
 */

import { Government } from '../core/Government.js';
import { PolicyVector } from './PolicyVector.js';

/**
 * Apply implementation noise to intended policy
 *
 * Corrupts policy outcome based on state capacity
 *
 * @param intendedPolicy - What government intends to do
 * @param government - Government implementing policy
 * @param rng - Random number generator (0-1)
 * @returns Actual policy outcome (with noise applied)
 */
export function applyImplementationNoise(
  intendedPolicy: PolicyVector,
  government: Government,
  rng: () => number = Math.random
): PolicyVector {
  // Get implementation noise from government capacity
  const noise = government.getImplementationNoise();

  // Apply noise to each policy dimension
  return {
    economic: applyNoiseToDimension(intendedPolicy.economic, noise, rng),
    environmental: applyNoiseToDimension(intendedPolicy.environmental, noise, rng),
    technology: applyNoiseToDimension(intendedPolicy.technology, noise, rng),
    social: applyNoiseToDimension(intendedPolicy.social, noise, rng),
    civilLiberties: applyNoiseToDimension(intendedPolicy.civilLiberties, noise, rng),
    international: applyNoiseToDimension(intendedPolicy.international, noise, rng),
  };
}

/**
 * Apply noise to single policy dimension
 */
function applyNoiseToDimension(
  intendedValue: number,
  noiseLevel: number,
  rng: () => number
): number {
  // Random deviation in range [-noiseLevel, +noiseLevel]
  const deviation = (rng() - 0.5) * 2 * noiseLevel;

  // Apply deviation
  const actualValue = intendedValue + deviation;

  // Clamp to valid range [-1, 1]
  return Math.max(-1, Math.min(1, actualValue));
}

/**
 * Calculate implementation success probability
 *
 * Probability that policy is implemented as intended
 * (without significant corruption or failure)
 *
 * @param government - Government implementing policy
 * @param policyComplexity - How complex is the policy (0-1)
 * @returns Success probability (0-1)
 */
export function calculateImplementationSuccessProbability(
  government: Government,
  policyComplexity: number = 0.5
): number {
  // Base success rate from state capacity
  const baseSuccess = government.getPolicySuccessRate();

  // Complexity penalty (complex policies harder to implement)
  const complexityPenalty = policyComplexity * 0.3;

  // Final probability
  const probability = baseSuccess * (1 - complexityPenalty);

  return Math.max(0.1, Math.min(0.99, probability));
}

/**
 * Simulate policy implementation outcome
 *
 * Returns whether policy succeeds, partially succeeds, or fails
 *
 * @param government - Government implementing policy
 * @param policyComplexity - Policy complexity (0-1)
 * @param rng - Random number generator
 * @returns Implementation outcome
 */
export function simulateImplementationOutcome(
  government: Government,
  policyComplexity: number = 0.5,
  rng: () => number = Math.random
): 'SUCCESS' | 'PARTIAL' | 'FAILURE' {
  const successProbability = calculateImplementationSuccessProbability(
    government,
    policyComplexity
  );

  const roll = rng();

  if (roll < successProbability) {
    return 'SUCCESS'; // Implemented as intended
  } else if (roll < successProbability + 0.3) {
    return 'PARTIAL'; // Partially implemented
  } else {
    return 'FAILURE'; // Failed to implement
  }
}

/**
 * Calculate effectiveness multiplier based on implementation outcome
 *
 * @param outcome - Implementation outcome
 * @returns Effectiveness multiplier (0-1)
 */
export function getEffectivenessMultiplier(
  outcome: 'SUCCESS' | 'PARTIAL' | 'FAILURE'
): number {
  switch (outcome) {
    case 'SUCCESS':
      return 1.0; // Full effectiveness
    case 'PARTIAL':
      return 0.5; // Half effectiveness
    case 'FAILURE':
      return 0.1; // Minimal effectiveness
  }
}

/**
 * Calculate corruption cost
 *
 * Economic cost of corruption as percentage of policy budget
 *
 * Research: Corruption can waste 10-40% of public spending
 * (Transparency International, World Bank)
 *
 * @param government - Government implementing policy
 * @param policyBudget - Policy budget (arbitrary units)
 * @returns Corruption cost (same units as budget)
 */
export function calculateCorruptionCost(
  government: Government,
  policyBudget: number
): number {
  // Implementation noise correlates with corruption
  const noise = government.getImplementationNoise();

  // Corruption percentage (0-40%)
  const corruptionRate = noise * 0.4;

  return policyBudget * corruptionRate;
}

/**
 * Calculate bureaucratic delay
 *
 * Additional months added to policy implementation due to bureaucracy
 *
 * @param government - Government implementing policy
 * @param baseImplementationTime - Base time (months)
 * @returns Additional delay (months)
 */
export function calculateBureaucraticDelay(
  government: Government,
  baseImplementationTime: number
): number {
  // Regulatory quality affects bureaucratic efficiency
  const regulatoryQuality = government.capacity.metrics.regulatoryQuality;

  // Low regulatory quality (poor bureaucracy) adds 20-50% delay
  // High regulatory quality (efficient bureaucracy) adds 0-10% delay
  const delayFactor = 0.3 - (regulatoryQuality / 2.5) * 0.25;

  const delay = Math.max(0, baseImplementationTime * delayFactor);

  return Math.round(delay);
}
