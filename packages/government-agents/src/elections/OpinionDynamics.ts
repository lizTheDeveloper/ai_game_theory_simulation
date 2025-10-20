/**
 * Opinion Dynamics
 *
 * Models how public opinion and party support shift over time
 *
 * Research Foundation:
 * - Erikson et al. (2002): The Macro Polity - public opinion dynamics
 * - Powell & Whitten (1993): Economic voting in post-communist states
 * - Lewis-Beck & Stegmaier (2000): Economic determinants of electoral outcomes
 *
 * Key Findings:
 * - Economic performance drives 30-50% of vote swing
 * - Scandals: -5 to -15% support
 * - Policy successes: +3 to +8% support
 * - Crises: Major realignment (-20% to +20% for opposition)
 *
 * @module elections/OpinionDynamics
 */

// import { PoliticalParty } from '../core/PoliticalParty.js';
import { VoteShares } from './VotingSystem.js';

/**
 * Event that affects public opinion
 */
export interface OpinionEvent {
  /** Event type */
  type: OpinionEventType;

  /** Severity (0-1) */
  severity: number;

  /** Which party/coalition is responsible? */
  responsibleParty?: string;

  /** Which policy domain is affected? */
  policyDomain?: string;
}

/**
 * Opinion event types
 */
export enum OpinionEventType {
  /** Economic crisis (recession, unemployment) */
  ECONOMIC_CRISIS = 'ECONOMIC_CRISIS',

  /** Economic boom (growth, prosperity) */
  ECONOMIC_BOOM = 'ECONOMIC_BOOM',

  /** Political scandal */
  SCANDAL = 'SCANDAL',

  /** Major policy success */
  POLICY_SUCCESS = 'POLICY_SUCCESS',

  /** Major policy failure */
  POLICY_FAILURE = 'POLICY_FAILURE',

  /** AI catastrophe or disaster */
  AI_CATASTROPHE = 'AI_CATASTROPHE',

  /** Environmental crisis */
  ENVIRONMENTAL_CRISIS = 'ENVIRONMENTAL_CRISIS',

  /** International crisis */
  INTERNATIONAL_CRISIS = 'INTERNATIONAL_CRISIS',

  /** Social unrest */
  SOCIAL_UNREST = 'SOCIAL_UNREST',
}

/**
 * Update vote shares based on opinion event
 *
 * @param currentShares - Current vote/support shares
 * @param event - Opinion event
 * @param incumbentPartyId - Which party is in government
 * @param oppositionPartyIds - Opposition parties
 * @returns Updated vote shares
 */
export function updateOpinionFromEvent(
  currentShares: VoteShares,
  event: OpinionEvent,
  incumbentPartyId: string,
  oppositionPartyIds: string[]
): VoteShares {
  const result = { ...currentShares };

  // Calculate opinion shift magnitude
  const shiftMagnitude = calculateOpinionShift(event);

  // Determine which parties gain/lose
  const { losers, gainers } = determineGainersAndLosers(
    event,
    incumbentPartyId,
    oppositionPartyIds
  );

  // Apply shifts
  const totalLoss = applyOpinionLoss(result, losers, shiftMagnitude);
  applyOpinionGain(result, gainers, totalLoss);

  // Normalize to sum to 1.0
  return normalizeShares(result);
}

/**
 * Calculate magnitude of opinion shift
 */
function calculateOpinionShift(event: OpinionEvent): number {
  const baseMagnitudes: Record<OpinionEventType, number> = {
    [OpinionEventType.ECONOMIC_CRISIS]: 0.15, // -15% for incumbent
    [OpinionEventType.ECONOMIC_BOOM]: 0.08, // +8% for incumbent
    [OpinionEventType.SCANDAL]: 0.10, // -10% for responsible party
    [OpinionEventType.POLICY_SUCCESS]: 0.05, // +5% for incumbent
    [OpinionEventType.POLICY_FAILURE]: 0.08, // -8% for incumbent
    [OpinionEventType.AI_CATASTROPHE]: 0.25, // -25% for incumbent (major crisis)
    [OpinionEventType.ENVIRONMENTAL_CRISIS]: 0.12, // -12% for incumbent
    [OpinionEventType.INTERNATIONAL_CRISIS]: 0.10, // Rally-round-the-flag or blame incumbent
    [OpinionEventType.SOCIAL_UNREST]: 0.15, // -15% for incumbent
  };

  const baseMagnitude = baseMagnitudes[event.type] ?? 0.05;

  // Scale by severity
  return baseMagnitude * event.severity;
}

/**
 * Determine which parties gain and lose from event
 */
function determineGainersAndLosers(
  event: OpinionEvent,
  incumbentPartyId: string,
  oppositionPartyIds: string[]
): { losers: string[]; gainers: string[] } {
  switch (event.type) {
    case OpinionEventType.ECONOMIC_CRISIS:
    case OpinionEventType.POLICY_FAILURE:
    case OpinionEventType.AI_CATASTROPHE:
    case OpinionEventType.ENVIRONMENTAL_CRISIS:
    case OpinionEventType.SOCIAL_UNREST:
      // Incumbent loses, opposition gains
      return {
        losers: [incumbentPartyId],
        gainers: oppositionPartyIds,
      };

    case OpinionEventType.ECONOMIC_BOOM:
    case OpinionEventType.POLICY_SUCCESS:
      // Incumbent gains, opposition loses
      return {
        losers: oppositionPartyIds,
        gainers: [incumbentPartyId],
      };

    case OpinionEventType.SCANDAL:
      // Responsible party loses (if specified), all others gain
      const responsibleParty = event.responsibleParty ?? incumbentPartyId;
      const others = [incumbentPartyId, ...oppositionPartyIds].filter(
        (p) => p !== responsibleParty
      );
      return {
        losers: [responsibleParty],
        gainers: others,
      };

    case OpinionEventType.INTERNATIONAL_CRISIS:
      // Rally-round-the-flag effect (50% chance)
      // Otherwise, opposition gains
      const rally = Math.random() > 0.5;
      if (rally) {
        return {
          losers: oppositionPartyIds,
          gainers: [incumbentPartyId],
        };
      } else {
        return {
          losers: [incumbentPartyId],
          gainers: oppositionPartyIds,
        };
      }

    default:
      return { losers: [], gainers: [] };
  }
}

/**
 * Apply opinion loss to parties
 *
 * @returns Total support lost
 */
function applyOpinionLoss(
  shares: VoteShares,
  losers: string[],
  shiftMagnitude: number
): number {
  let totalLoss = 0;

  for (const party of losers) {
    const currentShare = shares[party] ?? 0;

    // Can't lose more than current share
    const loss = Math.min(shiftMagnitude / losers.length, currentShare * 0.5);

    shares[party] = Math.max(0, currentShare - loss);
    totalLoss += loss;
  }

  return totalLoss;
}

/**
 * Apply opinion gain to parties (proportional to current strength)
 */
function applyOpinionGain(
  shares: VoteShares,
  gainers: string[],
  totalGain: number
): void {
  if (gainers.length === 0 || totalGain === 0) {
    return;
  }

  // Calculate total current share of gainers
  const totalGainerShare = gainers.reduce((sum, p) => sum + (shares[p] ?? 0), 0);

  if (totalGainerShare === 0) {
    // Equal distribution if all at zero
    for (const party of gainers) {
      shares[party] = totalGain / gainers.length;
    }
  } else {
    // Proportional distribution
    for (const party of gainers) {
      const currentShare = shares[party] ?? 0;
      const proportion = currentShare / totalGainerShare;
      shares[party] = currentShare + totalGain * proportion;
    }
  }
}

/**
 * Normalize shares to sum to 1.0
 */
function normalizeShares(shares: VoteShares): VoteShares {
  const total = Object.values(shares).reduce((sum, share) => sum + share, 0);

  if (total === 0) {
    return shares;
  }

  const result: VoteShares = {};

  for (const party of Object.keys(shares)) {
    result[party] = (shares[party] ?? 0) / total;
  }

  return result;
}

/**
 * Apply gradual opinion drift (month-to-month random walk)
 *
 * Research: Opinion fluctuates ±1-2% per month randomly
 */
export function applyOpinionDrift(
  currentShares: VoteShares,
  rng: () => number = Math.random
): VoteShares {
  const result = { ...currentShares };
  const parties = Object.keys(result);

  if (parties.length <= 1) {
    return result;
  }

  // Random party loses support
  const loserIndex = Math.floor(rng() * parties.length);
  const loser = parties[loserIndex]!;

  // Random party gains support
  let gainerIndex = Math.floor(rng() * parties.length);
  while (gainerIndex === loserIndex && parties.length > 1) {
    gainerIndex = Math.floor(rng() * parties.length);
  }
  const gainer = parties[gainerIndex]!;

  // Small random shift (0.5-1.5%)
  const shift = 0.005 + rng() * 0.01;

  const loserShare = result[loser] ?? 0;
  const actualShift = Math.min(shift, loserShare * 0.1); // Max 10% of current share

  result[loser] = loserShare - actualShift;
  result[gainer] = (result[gainer] ?? 0) + actualShift;

  return normalizeShares(result);
}

/**
 * Calculate incumbent approval rating
 *
 * Based on current vote share and recent events
 */
export function calculateApprovalRating(
  incumbentVoteShare: number,
  recentEvents: OpinionEvent[]
): number {
  // Base approval from vote share
  let approval = incumbentVoteShare;

  // Adjust for recent events (last 3-6 months matter most)
  for (const event of recentEvents) {
    const shift = calculateOpinionShift(event);

    switch (event.type) {
      case OpinionEventType.ECONOMIC_BOOM:
      case OpinionEventType.POLICY_SUCCESS:
        approval += shift * 0.5; // Boost approval
        break;

      case OpinionEventType.ECONOMIC_CRISIS:
      case OpinionEventType.POLICY_FAILURE:
      case OpinionEventType.AI_CATASTROPHE:
      case OpinionEventType.SCANDAL:
        approval -= shift * 0.5; // Reduce approval
        break;
    }
  }

  // Clamp to 0-1
  return Math.max(0, Math.min(1, approval));
}
