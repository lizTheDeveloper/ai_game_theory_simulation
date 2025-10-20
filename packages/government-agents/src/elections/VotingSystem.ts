/**
 * Voting Systems
 *
 * Models different electoral systems and seat allocation
 *
 * Research Foundation:
 * - Lijphart (1999): Patterns of Democracy
 * - Gallagher & Mitchell (2005): The Politics of Electoral Systems
 * - IPU PARLINE database: Electoral systems worldwide
 *
 * Main Systems:
 * - First-Past-The-Post (FPTP): USA, UK, India
 * - Proportional Representation (PR): Netherlands, Israel, Nordic countries
 * - Mixed systems: Germany, New Zealand, Japan
 *
 * @module elections/VotingSystem
 */

/**
 * Voting system types
 */
export enum VotingSystemType {
  /** First-Past-The-Post (winner takes all) */
  FPTP = 'FPTP',

  /** Proportional Representation (seats proportional to votes) */
  PROPORTIONAL = 'PROPORTIONAL',

  /** Mixed-Member Proportional (Germany-style) */
  MIXED = 'MIXED',

  /** Two-Round System (France) */
  TWO_ROUND = 'TWO_ROUND',

  /** Single Transferable Vote (Ireland) */
  STV = 'STV',
}

/**
 * Voting system configuration
 */
export interface VotingSystemConfig {
  /** System type */
  type: VotingSystemType;

  /** Electoral threshold (% of votes needed for seats) */
  threshold?: number;

  /** District magnitude (avg seats per district) */
  districtMagnitude?: number;

  /** Number of total seats in parliament */
  totalSeats?: number;
}

/**
 * Election results
 * Maps party ID to vote share (0-1)
 */
export type VoteShares = Record<string, number>;

/**
 * Seat allocation results
 * Maps party ID to seat share (0-1)
 */
export type SeatShares = Record<string, number>;

/**
 * Allocate seats based on vote shares
 *
 * @param voteShares - Vote shares by party
 * @param config - Voting system configuration
 * @returns Seat shares by party
 */
export function allocateSeats(
  voteShares: VoteShares,
  config: VotingSystemConfig
): SeatShares {
  switch (config.type) {
    case VotingSystemType.FPTP:
      return allocateSeatsFPTP(voteShares);

    case VotingSystemType.PROPORTIONAL:
      return allocateSeatsProportional(voteShares, config.threshold ?? 0.0);

    case VotingSystemType.MIXED:
      return allocateSeatsMixed(voteShares, config.threshold ?? 0.05);

    case VotingSystemType.TWO_ROUND:
      return allocateSeatsTwoRound(voteShares);

    case VotingSystemType.STV:
      return allocateSeatsProportional(voteShares, config.threshold ?? 0.0);

    default:
      return allocateSeatsProportional(voteShares, 0.0);
  }
}

/**
 * FPTP seat allocation
 *
 * Winner-takes-all system with disproportional results
 * Research: Tends to over-represent largest party
 */
function allocateSeatsFPTP(voteShares: VoteShares): SeatShares {
  const parties = Object.keys(voteShares);

  // Sort parties by vote share
  parties.sort((a, b) => (voteShares[b] ?? 0) - (voteShares[a] ?? 0));

  const result: SeatShares = {};

  // Simulate district-level winners
  // In FPTP, parties get bonus seats relative to vote share
  // Research: "Winner's bonus" of ~5-15% seat share over vote share

  for (const party of parties) {
    const votes = voteShares[party] ?? 0;

    if (votes === 0) {
      result[party] = 0;
      continue;
    }

    // Apply FPTP bonus (squared vote share approximation)
    // Research: "Cube rule" - seats proportional to votes^3
    // Simplified to votes^1.5 for less extreme distortion
    const seatShare = Math.pow(votes, 1.3);

    result[party] = seatShare;
  }

  // Normalize to sum to 1.0
  return normalizeSeatShares(result);
}

/**
 * Proportional representation seat allocation
 *
 * Pure PR with electoral threshold
 */
function allocateSeatsProportional(
  voteShares: VoteShares,
  threshold: number
): SeatShares {
  const result: SeatShares = {};

  // Filter parties below threshold
  const qualifyingParties = Object.keys(voteShares).filter(
    (party) => (voteShares[party] ?? 0) >= threshold
  );

  // Calculate total votes for qualifying parties
  const totalQualifyingVotes = qualifyingParties.reduce(
    (sum, party) => sum + (voteShares[party] ?? 0),
    0
  );

  // Allocate seats proportionally
  for (const party of qualifyingParties) {
    const votes = voteShares[party] ?? 0;
    result[party] = votes / totalQualifyingVotes;
  }

  return result;
}

/**
 * Mixed-member proportional (Germany-style)
 *
 * Combination of FPTP districts + PR seats to achieve proportionality
 */
function allocateSeatsMixed(voteShares: VoteShares, threshold: number): SeatShares {
  // 50% FPTP, 50% PR
  const fptpSeats = allocateSeatsFPTP(voteShares);
  const prSeats = allocateSeatsProportional(voteShares, threshold);

  const result: SeatShares = {};

  for (const party of Object.keys(voteShares)) {
    const fptp = fptpSeats[party] ?? 0;
    const pr = prSeats[party] ?? 0;

    // Average of both systems
    result[party] = (fptp + pr) / 2;
  }

  return normalizeSeatShares(result);
}

/**
 * Two-round system (France)
 *
 * Simplified: parties below 50% in first round compete in runoff
 */
function allocateSeatsTwoRound(voteShares: VoteShares): SeatShares {
  const parties = Object.keys(voteShares);
  parties.sort((a, b) => (voteShares[b] ?? 0) - (voteShares[a] ?? 0));

  const topParty = parties[0];
  const topVotes = voteShares[topParty ?? ''] ?? 0;

  // If top party has majority (>50%), they win
  if (topVotes > 0.5) {
    return allocateSeatsFPTP(voteShares);
  }

  // Otherwise, simulate runoff between top 2 parties
  // Simplified: top 2 get proportional boost
  const result: SeatShares = {};

  for (const party of parties) {
    const votes = voteShares[party] ?? 0;

    // Top 2 parties get advantage
    const isTopTwo = parties.indexOf(party) < 2;
    const bonus = isTopTwo ? 1.2 : 0.8;

    result[party] = votes * bonus;
  }

  return normalizeSeatShares(result);
}

/**
 * Normalize seat shares to sum to 1.0
 */
function normalizeSeatShares(seatShares: SeatShares): SeatShares {
  const total = Object.values(seatShares).reduce((sum, share) => sum + share, 0);

  if (total === 0) {
    return {};
  }

  const result: SeatShares = {};

  for (const party of Object.keys(seatShares)) {
    result[party] = (seatShares[party] ?? 0) / total;
  }

  return result;
}

/**
 * Calculate disproportionality index (Gallagher index)
 *
 * Measures how much seat shares deviate from vote shares
 * 0 = perfectly proportional, higher = more disproportional
 *
 * Research: Gallagher (1991)
 * - Pure PR: 1-3
 * - Mixed systems: 3-8
 * - FPTP: 10-20
 */
export function calculateDisproportionality(
  voteShares: VoteShares,
  seatShares: SeatShares
): number {
  let sumSquaredDifferences = 0;

  const allParties = new Set([...Object.keys(voteShares), ...Object.keys(seatShares)]);

  for (const party of allParties) {
    const votes = voteShares[party] ?? 0;
    const seats = seatShares[party] ?? 0;
    const difference = votes - seats;
    sumSquaredDifferences += difference * difference;
  }

  return Math.sqrt(sumSquaredDifferences / 2);
}

/**
 * Get typical electoral threshold by country
 */
export const TYPICAL_THRESHOLDS: Record<string, number> = {
  // No threshold
  NLD: 0.0067, // Netherlands: ~0.67% (1 seat in 150)
  ISR: 0.0325, // Israel: 3.25%

  // Low thresholds
  DNK: 0.02, // Denmark: 2%
  SWE: 0.04, // Sweden: 4%

  // Standard thresholds
  DEU: 0.05, // Germany: 5%
  POL: 0.05, // Poland: 5%
  ESP: 0.03, // Spain: 3%

  // No formal threshold (FPTP)
  USA: 0.0, // United States
  GBR: 0.0, // United Kingdom
  IND: 0.0, // India

  // High thresholds
  TUR: 0.10, // Turkey: 10% (very high)
};

/**
 * Get typical voting system by country
 */
export const TYPICAL_VOTING_SYSTEMS: Record<string, VotingSystemType> = {
  // FPTP
  USA: VotingSystemType.FPTP,
  GBR: VotingSystemType.FPTP,
  IND: VotingSystemType.FPTP,
  CAN: VotingSystemType.FPTP,

  // Proportional
  NLD: VotingSystemType.PROPORTIONAL,
  ISR: VotingSystemType.PROPORTIONAL,
  SWE: VotingSystemType.PROPORTIONAL,
  NOR: VotingSystemType.PROPORTIONAL,
  DNK: VotingSystemType.PROPORTIONAL,

  // Mixed
  DEU: VotingSystemType.MIXED,
  NZL: VotingSystemType.MIXED,
  JPN: VotingSystemType.MIXED,
  MEX: VotingSystemType.MIXED,

  // Two-round
  FRA: VotingSystemType.TWO_ROUND,

  // STV
  IRL: VotingSystemType.STV,
};
