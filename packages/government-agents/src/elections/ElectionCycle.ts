/**
 * Election Cycle
 *
 * Models election timing, triggers, and scheduling
 *
 * Research Foundation:
 * - Schleiter & Morgan-Jones (2009): Citizens, Presidents, and Assemblies
 * - Strøm & Müller (1999): Policy, Office, or Votes?
 * - IPU PARLINE database: Electoral systems worldwide
 *
 * Key Findings:
 * - Parliamentary democracies: 48-60 months (4-5 years)
 * - Presidential democracies: Fixed 48-72 months
 * - Early elections: 15-25% probability in parliamentary systems
 * - Authoritarian regimes: Variable or no elections
 *
 * @module elections/ElectionCycle
 */

import { Government } from '../core/Government.js';
import { GovernmentType } from '../core/GovernmentType.js';
import { Coalition } from '../coalition/Coalition.js';
import { calculateStability } from '../coalition/CoalitionStability.js';

/**
 * Election schedule by government type
 */
const ELECTION_SCHEDULES = {
  [GovernmentType.PARLIAMENTARY_DEMOCRACY]: {
    /** Regular election cycle (months) */
    regularCycle: 48,
    /** Maximum term length before mandatory election */
    maxTermLength: 60,
    /** Can hold early elections? */
    allowEarlyElections: true,
    /** Base probability of early election per month (if unstable) */
    earlyElectionBaseProbability: 0.02, // 2% per month
  },
  [GovernmentType.PRESIDENTIAL_DEMOCRACY]: {
    regularCycle: 48,
    maxTermLength: 48, // Fixed terms
    allowEarlyElections: false,
    earlyElectionBaseProbability: 0.0,
  },
  [GovernmentType.SEMI_PRESIDENTIAL_DEMOCRACY]: {
    regularCycle: 48,
    maxTermLength: 60,
    allowEarlyElections: true, // President can sometimes dissolve parliament
    earlyElectionBaseProbability: 0.01,
  },
  [GovernmentType.AUTHORITARIAN_TECHNOCRACY]: {
    regularCycle: 0, // No elections (e.g., China)
    maxTermLength: 0,
    allowEarlyElections: false,
    earlyElectionBaseProbability: 0.0,
  },
  [GovernmentType.HYBRID_REGIME]: {
    regularCycle: 60, // Elections held but often manipulated
    maxTermLength: 72,
    allowEarlyElections: true,
    earlyElectionBaseProbability: 0.005, // Rare
  },
  [GovernmentType.THEOCRATIC_REPUBLIC]: {
    regularCycle: 48, // Iran has elections
    maxTermLength: 48,
    allowEarlyElections: false,
    earlyElectionBaseProbability: 0.0,
  },
  [GovernmentType.ABSOLUTE_MONARCHY]: {
    regularCycle: 0, // No elections
    maxTermLength: 0,
    allowEarlyElections: false,
    earlyElectionBaseProbability: 0.0,
  },
} as const;

/**
 * Election state tracking
 */
export interface ElectionState {
  /** Months since last election */
  monthsSinceLastElection: number;

  /** Next scheduled election (month) */
  nextScheduledElection: number;

  /** Is election scheduled for next month? */
  electionScheduled: boolean;

  /** Reason for upcoming election */
  electionReason?: 'REGULAR' | 'EARLY' | 'COALITION_COLLAPSE' | 'NO_CONFIDENCE';
}

/**
 * Initialize election state for government
 */
export function initializeElectionState(
  government: Government,
  currentMonth: number = 0
): ElectionState {
  const schedule = ELECTION_SCHEDULES[government.type];

  return {
    monthsSinceLastElection: 0,
    nextScheduledElection: currentMonth + schedule.regularCycle,
    electionScheduled: false,
  };
}

/**
 * Update election state (call each month)
 *
 * @param state - Current election state
 * @param government - Government
 * @param coalition - Current coalition (if any)
 * @param currentMonth - Current simulation month
 * @param rng - Random number generator
 * @returns Updated election state
 */
export function updateElectionState(
  state: ElectionState,
  government: Government,
  coalition: Coalition | null,
  currentMonth: number,
  rng: () => number = Math.random
): ElectionState {
  const schedule = ELECTION_SCHEDULES[government.type];

  // Increment time since last election
  const monthsSinceLastElection = state.monthsSinceLastElection + 1;

  // Check if regular election is due
  if (currentMonth >= state.nextScheduledElection) {
    return {
      monthsSinceLastElection: 0, // Reset after election
      nextScheduledElection: currentMonth + schedule.regularCycle,
      electionScheduled: true,
      electionReason: 'REGULAR',
    };
  }

  // Check for early election triggers
  if (schedule.allowEarlyElections) {
    // Coalition collapse
    if (coalition && shouldTriggerEarlyElection(coalition, monthsSinceLastElection, schedule, rng)) {
      return {
        monthsSinceLastElection: 0,
        nextScheduledElection: currentMonth + schedule.regularCycle,
        electionScheduled: true,
        electionReason: 'EARLY',
      };
    }
  }

  // Maximum term length exceeded (mandatory election)
  if (schedule.maxTermLength > 0 && monthsSinceLastElection >= schedule.maxTermLength) {
    return {
      monthsSinceLastElection: 0,
      nextScheduledElection: currentMonth + schedule.regularCycle,
      electionScheduled: true,
      electionReason: 'REGULAR',
    };
  }

  // No election this month
  return {
    monthsSinceLastElection,
    nextScheduledElection: state.nextScheduledElection,
    electionScheduled: false,
  };
}

/**
 * Check if early election should be triggered
 *
 * Research: Coalition instability main driver of early elections
 */
function shouldTriggerEarlyElection(
  coalition: Coalition,
  monthsSinceLastElection: number,
  schedule: (typeof ELECTION_SCHEDULES)[GovernmentType],
  rng: () => number
): boolean {
  // Don't trigger early election if just had one (grace period: 12 months)
  if (monthsSinceLastElection < 12) {
    return false;
  }

  // Calculate coalition stability
  const stability = calculateStability(coalition, monthsSinceLastElection);

  // Unstable coalitions more likely to trigger early elections
  // Base probability modified by instability
  const instability = 1 - stability.overallStability;

  // Early election probability increases with instability
  const probability = schedule.earlyElectionBaseProbability * (1 + instability * 4);

  return rng() < probability;
}

/**
 * Check if government holds elections
 *
 * Some government types don't have elections
 */
export function holdsElections(government: Government): boolean {
  const schedule = ELECTION_SCHEDULES[government.type];
  return schedule.regularCycle > 0;
}

/**
 * Get months until next election
 */
export function getMonthsUntilNextElection(
  state: ElectionState,
  currentMonth: number
): number {
  return Math.max(0, state.nextScheduledElection - currentMonth);
}

/**
 * Get election frequency for government type (months)
 */
export function getElectionFrequency(government: Government): number {
  return ELECTION_SCHEDULES[government.type].regularCycle;
}

/**
 * Check if early elections are allowed
 */
export function allowsEarlyElections(government: Government): boolean {
  return ELECTION_SCHEDULES[government.type].allowEarlyElections;
}

/**
 * Calculate vote of confidence probability
 *
 * In parliamentary systems, opposition can force vote of confidence
 * If government loses, early election triggered
 *
 * Research: Occurs 1-2% of months in unstable coalitions
 */
export function calculateNoConfidenceProbability(
  coalition: Coalition,
  monthsSinceLastElection: number,
  publicSupport: number
): number {
  // Base probability: 0.5% per month
  let probability = 0.005;

  // Coalition instability increases probability
  const stability = calculateStability(coalition, monthsSinceLastElection);
  const instability = 1 - stability.overallStability;
  probability *= 1 + instability * 3;

  // Low public support increases probability
  if (publicSupport < 0.4) {
    probability *= 2; // 2x more likely if public support below 40%
  }

  return Math.min(0.1, probability); // Cap at 10% per month
}
