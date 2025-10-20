/**
 * Coalition Stability
 *
 * Models coalition stability and breakup probability
 *
 * Research Foundation:
 * - Saalfeld (2008): Intra-party politics and coalition governments
 * - Debus & Bräuninger (2009): Measuring coalition stability
 * - Historical data: Average coalition duration varies by country (2-5 years typical)
 *
 * Stability Factors:
 * 1. Policy distance (cohesion)
 * 2. Seat margin (buffer against defections)
 * 3. External pressure (crises, scandals)
 * 4. Time in power (honeymoon period vs fatigue)
 *
 * @module coalition/CoalitionStability
 */

import { Coalition } from './Coalition.js';
import { PoliticalParty } from '../core/PoliticalParty.js';
import { calculatePolicyDistance } from '../policy/PolicyVector.js';

/**
 * Stability metrics for a coalition
 */
export interface StabilityMetrics {
  /** Policy cohesion score (0-1, higher = more cohesive) */
  policyCohesion: number;

  /** Seat margin score (0-1, higher = more seats beyond threshold) */
  seatMargin: number;

  /** External pressure score (0-1, higher = more pressure) */
  externalPressure: number;

  /** Time-in-power score (0-1, accounts for honeymoon and fatigue) */
  timeInPower: number;

  /** Overall stability score (0-1, higher = more stable) */
  overallStability: number;

  /** Monthly breakup probability (0-1) */
  monthlyBreakupProbability: number;
}

/**
 * External events that can destabilize coalitions
 */
export interface ExternalPressure {
  /** Economic crisis severity (0-1) */
  economicCrisis?: number;

  /** Scandal severity (0-1) */
  scandal?: number;

  /** Policy failure severity (0-1) */
  policyFailure?: number;

  /** International crisis severity (0-1) */
  internationalCrisis?: number;

  /** Public opinion drop (0-1) */
  opinionDrop?: number;
}

/**
 * Calculate coalition stability metrics
 *
 * @param coalition - Coalition to analyze
 * @param monthsInPower - How long coalition has been in government
 * @param externalPressure - External destabilizing factors
 * @returns Stability metrics
 */
export function calculateStability(
  coalition: Coalition,
  monthsInPower: number,
  externalPressure: ExternalPressure = {}
): StabilityMetrics {
  // 1. Policy cohesion (lower distance = more stable)
  const policyCohesion = calculatePolicyCohesionScore(coalition.parties);

  // 2. Seat margin (excess seats beyond majority)
  const seatMargin = calculateSeatMarginScore(coalition);

  // 3. External pressure
  const pressureScore = calculateExternalPressureScore(externalPressure);

  // 4. Time in power (honeymoon period, then increasing fatigue)
  const timeScore = calculateTimeInPowerScore(monthsInPower);

  // Overall stability (weighted average)
  // Policy cohesion: 35%
  // Seat margin: 25%
  // External pressure: 25% (inverted)
  // Time in power: 15%
  const overallStability =
    policyCohesion * 0.35 +
    seatMargin * 0.25 +
    (1 - pressureScore) * 0.25 +
    timeScore * 0.15;

  // Monthly breakup probability
  // Base: 0.5% per month (6% per year)
  // Modified by stability score
  const baseProbability = 0.005;
  const monthlyBreakupProbability = baseProbability * (2 - overallStability);

  return {
    policyCohesion,
    seatMargin,
    externalPressure: pressureScore,
    timeInPower: timeScore,
    overallStability,
    monthlyBreakupProbability,
  };
}

/**
 * Calculate policy cohesion score (0-1)
 * Based on average pairwise policy distance
 */
function calculatePolicyCohesionScore(parties: PoliticalParty[]): number {
  if (parties.length <= 1) {
    return 1.0; // Single party = perfect cohesion
  }

  let totalDistance = 0;
  let pairCount = 0;

  for (let i = 0; i < parties.length; i++) {
    for (let j = i + 1; j < parties.length; j++) {
      const party1 = parties[i]!;
      const party2 = parties[j]!;
      totalDistance += calculatePolicyDistance(party1.policies, party2.policies);
      pairCount++;
    }
  }

  const avgDistance = pairCount > 0 ? totalDistance / pairCount : 0;

  // Maximum possible distance in 6D space: sqrt(6 * 2^2) = sqrt(24) ≈ 4.9
  const maxDistance = Math.sqrt(24);

  // Convert to cohesion score (1 = perfect cohesion, 0 = maximum distance)
  return 1 - Math.min(1, avgDistance / maxDistance);
}

/**
 * Calculate seat margin score (0-1)
 * Higher score = more excess seats beyond majority threshold
 */
function calculateSeatMarginScore(coalition: Coalition): number {
  const excessSeats = coalition.getExcessSeats();

  // Normalize: 20% excess seats = perfect score
  // Research: Most stable coalitions have 5-15% margin (Saalfeld 2008)
  return Math.min(1, excessSeats / 0.20);
}

/**
 * Calculate external pressure score (0-1)
 * Higher score = more destabilizing pressure
 */
function calculateExternalPressureScore(pressure: ExternalPressure): number {
  const {
    economicCrisis = 0,
    scandal = 0,
    policyFailure = 0,
    internationalCrisis = 0,
    opinionDrop = 0,
  } = pressure;

  // Weighted average of pressure factors
  // Economic crisis has highest weight (can topple governments)
  const score =
    economicCrisis * 0.35 +
    scandal * 0.20 +
    policyFailure * 0.20 +
    internationalCrisis * 0.15 +
    opinionDrop * 0.10;

  return Math.min(1, score);
}

/**
 * Calculate time-in-power score (0-1)
 * Accounts for honeymoon period and increasing fatigue
 *
 * Research: Coalitions most stable in months 6-24 (Debus & Bräuninger 2009)
 */
function calculateTimeInPowerScore(monthsInPower: number): number {
  // Honeymoon period: First 6 months (ramping up to 1.0)
  if (monthsInPower < 6) {
    return 0.7 + (monthsInPower / 6) * 0.3;
  }

  // Stable period: Months 6-24 (high stability)
  if (monthsInPower < 24) {
    return 1.0;
  }

  // Fatigue period: After 24 months (declining stability)
  // Linear decline to 0.5 at 60 months (5 years)
  const monthsInFatigue = monthsInPower - 24;
  const fatigueDecline = (monthsInFatigue / 36) * 0.5; // Decline over 36 months

  return Math.max(0.5, 1.0 - fatigueDecline);
}

/**
 * Check if coalition should break up this month
 *
 * @param coalition - Coalition to check
 * @param monthsInPower - How long coalition has been in government
 * @param externalPressure - External destabilizing factors
 * @param rng - Random number generator (0-1)
 * @returns True if coalition breaks up
 */
export function shouldCoalitionBreakup(
  coalition: Coalition,
  monthsInPower: number,
  externalPressure: ExternalPressure = {},
  rng: () => number = Math.random
): boolean {
  const stability = calculateStability(coalition, monthsInPower, externalPressure);
  return rng() < stability.monthlyBreakupProbability;
}

/**
 * Predict coalition duration (expected months)
 *
 * Based on stability metrics and historical data
 */
export function predictCoalitionDuration(
  coalition: Coalition,
  externalPressure: ExternalPressure = {}
): number {
  // Calculate initial stability
  const stability = calculateStability(coalition, 0, externalPressure);

  // Average coalition duration: 36 months (3 years)
  // Modulated by stability score
  const baseDuration = 36;

  // High stability (>0.8): 48+ months
  // Medium stability (0.5-0.8): 24-48 months
  // Low stability (<0.5): 12-24 months
  const durationMultiplier = stability.overallStability * 1.5;

  return Math.round(baseDuration * durationMultiplier);
}

/**
 * Get coalition health status
 */
export function getCoalitionHealth(stability: StabilityMetrics): string {
  if (stability.overallStability >= 0.8) {
    return 'STABLE';
  } else if (stability.overallStability >= 0.6) {
    return 'MODERATE';
  } else if (stability.overallStability >= 0.4) {
    return 'FRAGILE';
  } else {
    return 'CRITICAL';
  }
}
