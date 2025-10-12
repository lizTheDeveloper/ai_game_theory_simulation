/**
 * TIER 1.7.2: Per-Country Population Tracking
 * 
 * Track major countries individually to:
 * - Detect country-level depopulation
 * - Link organizations to countries (for survival mechanics)
 * - Model regional impacts of crises
 * 
 * Focuses on:
 * - Nuclear powers (US, Russia, China, UK, France, Pakistan, India, Israel)
 * - Major economies (Japan, Germany, Brazil, Indonesia)
 * - AI hubs (US, UK, Canada, China)
 * - Strategic nations (Nigeria, Bangladesh)
 */

export type CountryName =
  | 'United States'
  | 'China'
  | 'Russia'
  | 'India'
  | 'United Kingdom'
  | 'France'
  | 'Pakistan'
  | 'Israel'
  | 'Japan'
  | 'Germany'
  | 'Brazil'
  | 'Indonesia'
  | 'Canada'
  | 'Bangladesh'
  | 'Nigeria';

export interface CountryPopulation {
  name: CountryName;
  region: string;                    // e.g., "North America", "East Asia"
  
  // Population tracking
  population: number;                // Current population (in millions)
  baselinePopulation: number;        // Initial population (in millions)
  peakPopulation: number;            // Highest ever reached (in millions)
  
  // Demographics
  birthRate: number;                 // Births per 1000 people per year
  deathRate: number;                 // Deaths per 1000 people per year
  
  // Strategic importance
  isNuclearPower: boolean;           // Has nuclear weapons
  isAIHub: boolean;                  // Major AI development center
  isMajorEconomy: boolean;           // Top 15 GDP
  
  // Crisis tracking
  monthlyExcessDeaths: number;       // Deaths beyond baseline
  cumulativeCrisisDeaths: number;    // Total crisis deaths
  depopulated: boolean;              // Population reached zero
  depopulatedAt?: number;            // Month when depopulation occurred
  
  // Health tracking
  carryingCapacity: number;          // Maximum sustainable population
  populationPressure: number;        // population / carryingCapacity
}

export interface CountryPopulationSystem {
  countries: Record<CountryName, CountryPopulation>;
  
  // Tracking
  depopulatedCountries: CountryName[];
  nuclearPowersSurviving: number;
  aiHubsSurviving: number;
  
  // Events
  depopulationEvents: {
    country: CountryName;
    month: number;
    finalPopulation: number;
  }[];
}

