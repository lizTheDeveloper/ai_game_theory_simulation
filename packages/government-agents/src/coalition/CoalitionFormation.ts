/**
 * Coalition Formation Algorithm
 *
 * Implements minimal winning coalition theory with policy distance optimization
 *
 * Research Foundation:
 * - Laver (2020): Agent-based modeling in political decision making
 * - Martin & Stevenson (2001): Government formation in parliamentary democracies
 * - Spatial model: Parties closer in policy space more likely to form coalitions
 *
 * Algorithm:
 * 1. Generate all possible coalitions that exceed threshold (>50% seats)
 * 2. Filter to minimal winning coalitions (no redundant parties)
 * 3. Filter incompatible party combinations (blacklists)
 * 4. Calculate policy distance for each viable coalition
 * 5. Select coalition with minimum policy distance (most cohesive)
 *
 * @module coalition/CoalitionFormation
 */

import { PoliticalParty } from '../core/PoliticalParty.js';
import { Coalition } from './Coalition.js';
import { calculatePolicyDistance } from '../policy/PolicyVector.js';

/**
 * Coalition formation options
 */
export interface CoalitionFormationOptions {
  /** Seat threshold for coalition (default: 0.5 for majority) */
  threshold?: number;

  /** Current month in simulation (for formation date) */
  currentMonth?: number;

  /** Maximum coalition size (default: 4 parties) */
  maxCoalitionSize?: number;

  /** Prefer minimal winning coalitions? (default: true) */
  preferMinimalWinning?: boolean;
}

/**
 * Coalition candidate with score
 */
interface CoalitionCandidate {
  coalition: Coalition;
  policyDistance: number;
  isMinimalWinning: boolean;
}

/**
 * Form government coalition from election results
 *
 * @param parties - All parties with seat shares
 * @param options - Formation options
 * @returns Coalition, or null if no viable coalition exists
 */
export function formCoalition(
  parties: PoliticalParty[],
  options: CoalitionFormationOptions = {}
): Coalition | null {
  const threshold = options.threshold ?? 0.5;
  const currentMonth = options.currentMonth ?? 0;
  const maxSize = options.maxCoalitionSize ?? 4;
  const preferMinimal = options.preferMinimalWinning ?? true;

  // Sort parties by seat share (descending)
  const sortedParties = [...parties].sort((a, b) => b.seatShare - a.seatShare);

  // Check if single party has majority
  const largestParty = sortedParties[0];
  if (largestParty && largestParty.seatShare > threshold) {
    return new Coalition({
      parties: [largestParty],
      formationDate: currentMonth,
    });
  }

  // Generate all viable coalitions
  const candidates: CoalitionCandidate[] = [];

  // Generate all possible subsets up to maxSize
  for (let size = 2; size <= Math.min(maxSize, sortedParties.length); size++) {
    const subsets = generateSubsets(sortedParties, size);

    for (const subset of subsets) {
      const coalition = new Coalition({
        parties: subset,
        formationDate: currentMonth,
      });

      // Check if coalition has enough seats
      if (coalition.getTotalSeats() <= threshold) {
        continue;
      }

      // Check if all parties are compatible
      if (!coalition.areAllPartiesCompatible()) {
        continue;
      }

      // Calculate policy distance (cohesion metric)
      const policyDistance = calculateCoalitionPolicyDistance(subset);

      candidates.push({
        coalition,
        policyDistance,
        isMinimalWinning: coalition.isMinimalWinning(),
      });
    }
  }

  // No viable coalitions found
  if (candidates.length === 0) {
    return null;
  }

  // Filter to minimal winning if preferred
  let viableCandidates = candidates;
  if (preferMinimal) {
    const minimalCandidates = candidates.filter(c => c.isMinimalWinning);
    if (minimalCandidates.length > 0) {
      viableCandidates = minimalCandidates;
    }
  }

  // Sort by policy distance (lower = more cohesive)
  viableCandidates.sort((a, b) => a.policyDistance - b.policyDistance);

  // Return most cohesive coalition
  return viableCandidates[0]!.coalition;
}

/**
 * Calculate total policy distance within coalition
 * Sum of pairwise distances between all parties
 *
 * Lower distance = more cohesive coalition
 */
function calculateCoalitionPolicyDistance(parties: PoliticalParty[]): number {
  if (parties.length <= 1) {
    return 0;
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

  return pairCount > 0 ? totalDistance / pairCount : 0;
}

/**
 * Generate all subsets of specific size
 * Used for exhaustive coalition search
 */
function generateSubsets<T>(items: T[], size: number): T[][] {
  if (size === 0) {
    return [[]];
  }

  if (size > items.length) {
    return [];
  }

  if (size === items.length) {
    return [items];
  }

  const result: T[][] = [];

  function helper(start: number, current: T[]): void {
    if (current.length === size) {
      result.push([...current]);
      return;
    }

    for (let i = start; i < items.length; i++) {
      current.push(items[i]!);
      helper(i + 1, current);
      current.pop();
    }
  }

  helper(0, []);
  return result;
}

/**
 * Find all minimal winning coalitions
 *
 * Useful for analyzing coalition options
 */
export function findAllMinimalWinningCoalitions(
  parties: PoliticalParty[],
  _threshold: number = 0.5,
  maxSize: number = 4
): Coalition[] {
  const result: Coalition[] = [];

  // Generate all possible subsets up to maxSize
  for (let size = 1; size <= Math.min(maxSize, parties.length); size++) {
    const subsets = generateSubsets(parties, size);

    for (const subset of subsets) {
      const coalition = new Coalition({
        parties: subset,
        formationDate: 0,
      });

      // Check if coalition is minimal winning
      if (coalition.isMinimalWinning() && coalition.areAllPartiesCompatible()) {
        result.push(coalition);
      }
    }
  }

  return result;
}

/**
 * Calculate formation probability for a coalition
 * Based on policy distance and coalition preferences
 *
 * @returns Probability 0-1
 */
export function calculateFormationProbability(coalition: Coalition): number {
  // Base probability from policy cohesion
  const policyDistance = calculateCoalitionPolicyDistance(coalition.parties);
  const maxDistance = Math.sqrt(6) * 2; // Maximum possible distance in 6D space (-1 to +1)
  const cohesionScore = 1 - (policyDistance / maxDistance);

  // Bonus for coalition preferences
  let preferenceBonus = 0;
  const parties = coalition.parties;

  for (let i = 0; i < parties.length; i++) {
    for (let j = i + 1; j < parties.length; j++) {
      const party1 = parties[i]!;
      const party2 = parties[j]!;
      preferenceBonus += party1.getCoalitionPreferenceScore(party2.id);
      preferenceBonus += party2.getCoalitionPreferenceScore(party1.id);
    }
  }

  const pairCount = (parties.length * (parties.length - 1)) / 2;
  const normalizedPreference = pairCount > 0 ? preferenceBonus / (pairCount * 2) : 0;

  // Combine scores (70% policy cohesion, 30% preferences)
  return cohesionScore * 0.7 + normalizedPreference * 0.3;
}
