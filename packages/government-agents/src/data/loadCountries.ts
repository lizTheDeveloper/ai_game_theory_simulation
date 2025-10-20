/**
 * Country Data Loader
 *
 * Loads country data with government characteristics and WGI metrics
 *
 * @module data/loadCountries
 */

import { GovernmentType } from '../core/GovernmentType';
import { StateCapacityMetrics } from '../core/StateCapacity';
import countriesData from './countries.json';

/**
 * Country data structure
 */
export interface CountryData {
  /** Country name */
  name: string;

  /** Government type */
  type: GovernmentType;

  /** Population (millions) */
  population: number;

  /** GDP PPP (billions USD) */
  gdpPPP: number;

  /** World Governance Indicators (2024) */
  wgi: StateCapacityMetrics;
}

/**
 * Load all country data
 *
 * @returns Map of country codes to country data
 */
export function loadCountries(): Map<string, CountryData> {
  const countries = new Map<string, CountryData>();

  for (const [code, data] of Object.entries(countriesData)) {
    countries.set(code, {
      name: data.name,
      type: data.type as GovernmentType,
      population: data.population,
      gdpPPP: data.gdpPPP,
      wgi: data.wgi,
    });
  }

  return countries;
}

/**
 * Load a specific country's data
 *
 * @param countryCode - ISO 3166-1 alpha-3 country code
 * @returns Country data or undefined if not found
 */
export function loadCountry(countryCode: string): CountryData | undefined {
  const countries = loadCountries();
  return countries.get(countryCode);
}

/**
 * Get list of all country codes
 */
export function getCountryCodes(): string[] {
  return Object.keys(countriesData);
}

/**
 * Get list of all country names
 */
export function getCountryNames(): string[] {
  return Object.values(countriesData).map(data => data.name);
}

/**
 * Get countries by government type
 */
export function getCountriesByType(type: GovernmentType): Map<string, CountryData> {
  const countries = loadCountries();
  const filtered = new Map<string, CountryData>();

  for (const [code, data] of countries) {
    if (data.type === type) {
      filtered.set(code, data);
    }
  }

  return filtered;
}

/**
 * Get countries sorted by GDP PPP (descending)
 */
export function getCountriesByGDP(): Array<[string, CountryData]> {
  const countries = loadCountries();
  return Array.from(countries.entries()).sort((a, b) => b[1].gdpPPP - a[1].gdpPPP);
}

/**
 * Get countries sorted by state capacity (descending)
 */
export function getCountriesByStateCapacity(): Array<[string, CountryData]> {
  const countries = loadCountries();
  return Array.from(countries.entries()).sort((a, b) => {
    const capacityA = a[1].wgi.governmentEffectiveness;
    const capacityB = b[1].wgi.governmentEffectiveness;
    return capacityB - capacityA;
  });
}
