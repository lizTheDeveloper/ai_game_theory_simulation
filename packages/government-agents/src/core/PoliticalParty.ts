/**
 * Political Party
 *
 * Represents a political party with policy positions and electoral characteristics
 *
 * @module core/PoliticalParty
 */

import { PolicyVector } from '../policy/PolicyVector';

/**
 * Political party configuration
 */
export interface PoliticalPartyConfig {
  /** Party ID (unique within country) */
  id: string;

  /** Party name */
  name: string;

  /** Country code (ISO 3166-1 alpha-3) */
  countryCode: string;

  /** Policy positions (6D vector) */
  policies: PolicyVector;

  /** Current seat share (0-1) */
  seatShare: number;

  /** Vote share in last election (0-1) */
  voteShare?: number;

  /** Coalition preferences (party IDs) */
  coalitionPreferences?: string[];

  /** Coalition blacklist (party IDs that won't work with) */
  coalitionBlacklist?: string[];

  /** Is this party in government? */
  inGovernment?: boolean;

  /** Year of data */
  year?: number;
}

/**
 * Political Party
 */
export class PoliticalParty {
  public readonly id: string;
  public readonly name: string;
  public readonly countryCode: string;
  public readonly policies: PolicyVector;
  public seatShare: number;
  public voteShare: number;
  public coalitionPreferences: string[];
  public coalitionBlacklist: string[];
  public inGovernment: boolean;
  public year: number;

  constructor(config: PoliticalPartyConfig) {
    this.id = config.id;
    this.name = config.name;
    this.countryCode = config.countryCode;
    this.policies = config.policies;
    this.seatShare = config.seatShare;
    this.voteShare = config.voteShare ?? config.seatShare;
    this.coalitionPreferences = config.coalitionPreferences ?? [];
    this.coalitionBlacklist = config.coalitionBlacklist ?? [];
    this.inGovernment = config.inGovernment ?? false;
    this.year = config.year ?? 2024;
  }

  /**
   * Check if this party would work with another party in coalition
   */
  public isCompatibleWith(otherPartyId: string): boolean {
    return !this.coalitionBlacklist.includes(otherPartyId);
  }

  /**
   * Get preference score for working with another party (0-1)
   * Higher = more preferred
   */
  public getCoalitionPreferenceScore(otherPartyId: string): number {
    if (this.coalitionBlacklist.includes(otherPartyId)) {
      return 0;
    }

    if (this.coalitionPreferences.includes(otherPartyId)) {
      return 1;
    }

    return 0.5; // Neutral
  }

  /**
   * String representation
   */
  public toString(): string {
    return `${this.name} (${this.countryCode}) - ${(this.seatShare * 100).toFixed(1)}% seats`;
  }
}
