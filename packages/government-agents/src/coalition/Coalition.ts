/**
 * Coalition
 *
 * Represents a governing coalition of multiple political parties
 *
 * Research Foundation:
 * - Laver (2020): Minimal winning coalitions in parliamentary systems
 * - Martin & Stevenson (2001): Government formation in parliamentary democracies
 *
 * @module coalition/Coalition
 */

import { PoliticalParty } from '../core/PoliticalParty.js';
import { PolicyVector, calculateWeightedPolicyCentroid } from '../policy/PolicyVector.js';

/**
 * Coalition configuration
 */
export interface CoalitionConfig {
  /** Member parties */
  parties: PoliticalParty[];

  /** Formation date (month in simulation) */
  formationDate: number;

  /** Is this coalition currently in government? */
  isGoverning?: boolean;
}

/**
 * Coalition
 *
 * Represents a political coalition with member parties and stability metrics
 */
export class Coalition {
  public readonly parties: PoliticalParty[];
  public readonly formationDate: number;
  public isGoverning: boolean;

  /** Cached values for performance */
  private _totalSeats: number | null = null;
  private _policyCentroid: PolicyVector | null = null;

  constructor(config: CoalitionConfig) {
    this.parties = config.parties;
    this.formationDate = config.formationDate;
    this.isGoverning = config.isGoverning ?? true;
  }

  /**
   * Get total seat share of coalition (0-1)
   */
  public getTotalSeats(): number {
    if (this._totalSeats === null) {
      this._totalSeats = this.parties.reduce((sum, p) => sum + p.seatShare, 0);
    }
    return this._totalSeats;
  }

  /**
   * Get policy centroid of coalition (weighted by seat share)
   *
   * This represents the coalition's effective policy position,
   * weighted by each party's influence (seat share)
   */
  public getPolicyCentroid(): PolicyVector {
    if (this._policyCentroid === null) {
      const policies = this.parties.map(p => p.policies);
      const weights = this.parties.map(p => p.seatShare);
      this._policyCentroid = calculateWeightedPolicyCentroid(policies, weights);
    }
    return this._policyCentroid;
  }

  /**
   * Check if coalition has majority (>50% seats)
   */
  public hasMajority(): boolean {
    return this.getTotalSeats() > 0.5;
  }

  /**
   * Check if coalition is minimal winning
   * (removing any party would lose majority)
   *
   * Research: Minimal winning coalitions are most common (Laver 2020)
   */
  public isMinimalWinning(): boolean {
    if (!this.hasMajority()) {
      return false;
    }

    const totalSeats = this.getTotalSeats();

    // Check if removing any party would lose majority
    for (const party of this.parties) {
      const seatsWithoutParty = totalSeats - party.seatShare;
      if (seatsWithoutParty > 0.5) {
        return false; // Party is redundant
      }
    }

    return true;
  }

  /**
   * Get excess seats beyond majority threshold
   * Higher values = more stable (buffer against defections)
   */
  public getExcessSeats(): number {
    return Math.max(0, this.getTotalSeats() - 0.5);
  }

  /**
   * Get number of parties in coalition
   */
  public getSize(): number {
    return this.parties.length;
  }

  /**
   * Check if coalition contains specific party
   */
  public hasParty(partyId: string): boolean {
    return this.parties.some(p => p.id === partyId);
  }

  /**
   * Get party IDs in coalition
   */
  public getPartyIds(): string[] {
    return this.parties.map(p => p.id);
  }

  /**
   * Check if all parties are compatible with each other
   * (no blacklisted combinations)
   */
  public areAllPartiesCompatible(): boolean {
    for (let i = 0; i < this.parties.length; i++) {
      for (let j = i + 1; j < this.parties.length; j++) {
        const party1 = this.parties[i]!;
        const party2 = this.parties[j]!;

        if (!party1.isCompatibleWith(party2.id) || !party2.isCompatibleWith(party1.id)) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * String representation
   */
  public toString(): string {
    const partyNames = this.parties.map(p => p.name).join(' + ');
    const seats = (this.getTotalSeats() * 100).toFixed(1);
    return `${partyNames} (${seats}% seats)`;
  }

  /**
   * Clone coalition
   */
  public clone(): Coalition {
    return new Coalition({
      parties: [...this.parties],
      formationDate: this.formationDate,
      isGoverning: this.isGoverning,
    });
  }
}
