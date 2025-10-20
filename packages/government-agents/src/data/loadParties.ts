/**
 * Political Party Data Loader
 *
 * Loads real political party data for 5 key countries
 *
 * @module data/loadParties
 */

import { PoliticalParty, PoliticalPartyConfig } from '../core/PoliticalParty';
import deuParties from './parties/DEU_parties.json';
import usaParties from './parties/USA_parties.json';
import chnParties from './parties/CHN_parties.json';
import jpnParties from './parties/JPN_parties.json';
import indParties from './parties/IND_parties.json';

/**
 * All party data by country
 */
const PARTY_DATA: Record<string, PoliticalPartyConfig[]> = {
  DEU: deuParties,
  USA: usaParties,
  CHN: chnParties,
  JPN: jpnParties,
  IND: indParties,
};

/**
 * Load all parties for a specific country
 *
 * @param countryCode - ISO 3166-1 alpha-3 country code
 * @returns Array of PoliticalParty instances, or empty array if country not found
 */
export function loadParties(countryCode: string): PoliticalParty[] {
  const partyConfigs = PARTY_DATA[countryCode];

  if (!partyConfigs) {
    return [];
  }

  return partyConfigs.map(config => new PoliticalParty(config));
}

/**
 * Load all parties from all countries
 *
 * @returns Map of country codes to party arrays
 */
export function loadAllParties(): Map<string, PoliticalParty[]> {
  const allParties = new Map<string, PoliticalParty[]>();

  for (const [countryCode, partyConfigs] of Object.entries(PARTY_DATA)) {
    allParties.set(countryCode, partyConfigs.map(config => new PoliticalParty(config)));
  }

  return allParties;
}

/**
 * Get governing parties for a country
 *
 * @param countryCode - ISO 3166-1 alpha-3 country code
 * @returns Array of parties currently in government
 */
export function getGoverningParties(countryCode: string): PoliticalParty[] {
  const parties = loadParties(countryCode);
  return parties.filter(party => party.inGovernment);
}

/**
 * Get opposition parties for a country
 *
 * @param countryCode - ISO 3166-1 alpha-3 country code
 * @returns Array of parties currently in opposition
 */
export function getOppositionParties(countryCode: string): PoliticalParty[] {
  const parties = loadParties(countryCode);
  return parties.filter(party => !party.inGovernment);
}

/**
 * Get a specific party by country and party ID
 *
 * @param countryCode - ISO 3166-1 alpha-3 country code
 * @param partyId - Party ID
 * @returns PoliticalParty instance or undefined if not found
 */
export function getParty(countryCode: string, partyId: string): PoliticalParty | undefined {
  const parties = loadParties(countryCode);
  return parties.find(party => party.id === partyId);
}

/**
 * Get list of all countries with party data
 */
export function getCountriesWithPartyData(): string[] {
  return Object.keys(PARTY_DATA);
}

/**
 * Check if a country has party data available
 */
export function hasPartyData(countryCode: string): boolean {
  return countryCode in PARTY_DATA;
}

/**
 * Get party count for a country
 */
export function getPartyCount(countryCode: string): number {
  const partyConfigs = PARTY_DATA[countryCode];
  return partyConfigs ? partyConfigs.length : 0;
}

/**
 * Get largest party by seat share
 */
export function getLargestParty(countryCode: string): PoliticalParty | undefined {
  const parties = loadParties(countryCode);

  if (parties.length === 0) {
    return undefined;
  }

  return parties.reduce((largest, party) =>
    party.seatShare > largest.seatShare ? party : largest
  );
}

/**
 * Check if government has majority
 *
 * @param countryCode - ISO 3166-1 alpha-3 country code
 * @returns True if governing parties have >50% seats
 */
export function hasGovernmentMajority(countryCode: string): boolean {
  const governingParties = getGoverningParties(countryCode);
  const totalSeats = governingParties.reduce((sum, party) => sum + party.seatShare, 0);
  return totalSeats > 0.5;
}
