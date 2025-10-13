/**
 * TIER 1.7.2: Per-Country Population Tracking
 * 
 * Tracks 15 key countries individually to detect depopulation
 * and support organization survival mechanics.
 * 
 * Research backing:
 * - UN World Population Prospects 2024
 * - SIPRI Nuclear Forces Data 2025
 * - World Bank GDP rankings 2024
 */

import { GameState } from '../types/game';
import {
  CountryPopulation,
  CountryPopulationSystem,
  CountryName
} from '../types/countryPopulations';

/**
 * Initialize country population tracking
 * Data from UN World Population Prospects 2024
 */
export function initializeCountryPopulations(): CountryPopulationSystem {
  const countries: Record<CountryName, CountryPopulation> = {
    'United States': {
      name: 'United States',
      region: 'North America',
      population: 335,
      baselinePopulation: 335,
      peakPopulation: 335,
      birthRate: 11.0,
      deathRate: 8.9,
      isNuclearPower: true,
      isAIHub: true,
      isMajorEconomy: true,
      monthlyExcessDeaths: 0,
      cumulativeCrisisDeaths: 0,
      depopulated: false,
      carryingCapacity: 400,
      populationPressure: 0.84
    },
    'China': {
      name: 'China',
      region: 'East Asia',
      population: 1425,
      baselinePopulation: 1425,
      peakPopulation: 1425,
      birthRate: 6.5,
      deathRate: 7.4,
      isNuclearPower: true,
      isAIHub: true,
      isMajorEconomy: true,
      monthlyExcessDeaths: 0,
      cumulativeCrisisDeaths: 0,
      depopulated: false,
      carryingCapacity: 1600,
      populationPressure: 0.89
    },
    'Russia': {
      name: 'Russia',
      region: 'Eastern Europe',
      population: 144,
      baselinePopulation: 144,
      peakPopulation: 144,
      birthRate: 9.2,
      deathRate: 14.6,
      isNuclearPower: true,
      isAIHub: false,
      isMajorEconomy: true,
      monthlyExcessDeaths: 0,
      cumulativeCrisisDeaths: 0,
      depopulated: false,
      carryingCapacity: 200,
      populationPressure: 0.72
    },
    'India': {
      name: 'India',
      region: 'South Asia',
      population: 1425,
      baselinePopulation: 1425,
      peakPopulation: 1425,
      birthRate: 16.2,
      deathRate: 7.3,
      isNuclearPower: true,
      isAIHub: false,
      isMajorEconomy: true,
      monthlyExcessDeaths: 0,
      cumulativeCrisisDeaths: 0,
      depopulated: false,
      carryingCapacity: 1800,
      populationPressure: 0.79
    },
    'United Kingdom': {
      name: 'United Kingdom',
      region: 'Western Europe',
      population: 67,
      baselinePopulation: 67,
      peakPopulation: 67,
      birthRate: 10.7,
      deathRate: 9.4,
      isNuclearPower: true,
      isAIHub: true,
      isMajorEconomy: true,
      monthlyExcessDeaths: 0,
      cumulativeCrisisDeaths: 0,
      depopulated: false,
      carryingCapacity: 80,
      populationPressure: 0.84
    },
    'France': {
      name: 'France',
      region: 'Western Europe',
      population: 65,
      baselinePopulation: 65,
      peakPopulation: 65,
      birthRate: 10.9,
      deathRate: 9.6,
      isNuclearPower: true,
      isAIHub: false,
      isMajorEconomy: true,
      monthlyExcessDeaths: 0,
      cumulativeCrisisDeaths: 0,
      depopulated: false,
      carryingCapacity: 80,
      populationPressure: 0.81
    },
    'Pakistan': {
      name: 'Pakistan',
      region: 'South Asia',
      population: 235,
      baselinePopulation: 235,
      peakPopulation: 235,
      birthRate: 25.4,
      deathRate: 6.5,
      isNuclearPower: true,
      isAIHub: false,
      isMajorEconomy: false,
      monthlyExcessDeaths: 0,
      cumulativeCrisisDeaths: 0,
      depopulated: false,
      carryingCapacity: 300,
      populationPressure: 0.78
    },
    'Israel': {
      name: 'Israel',
      region: 'Middle East',
      population: 9,
      baselinePopulation: 9,
      peakPopulation: 9,
      birthRate: 19.2,
      deathRate: 5.2,
      isNuclearPower: true,
      isAIHub: false,
      isMajorEconomy: false,
      monthlyExcessDeaths: 0,
      cumulativeCrisisDeaths: 0,
      depopulated: false,
      carryingCapacity: 15,
      populationPressure: 0.60
    },
    'Japan': {
      name: 'Japan',
      region: 'East Asia',
      population: 125,
      baselinePopulation: 125,
      peakPopulation: 125,
      birthRate: 6.9,
      deathRate: 11.7,
      isNuclearPower: false,
      isAIHub: false,
      isMajorEconomy: true,
      monthlyExcessDeaths: 0,
      cumulativeCrisisDeaths: 0,
      depopulated: false,
      carryingCapacity: 150,
      populationPressure: 0.83
    },
    'Germany': {
      name: 'Germany',
      region: 'Western Europe',
      population: 84,
      baselinePopulation: 84,
      peakPopulation: 84,
      birthRate: 9.3,
      deathRate: 11.8,
      isNuclearPower: false,
      isAIHub: false,
      isMajorEconomy: true,
      monthlyExcessDeaths: 0,
      cumulativeCrisisDeaths: 0,
      depopulated: false,
      carryingCapacity: 100,
      populationPressure: 0.84
    },
    'Brazil': {
      name: 'Brazil',
      region: 'South America',
      population: 215,
      baselinePopulation: 215,
      peakPopulation: 215,
      birthRate: 13.4,
      deathRate: 6.8,
      isNuclearPower: false,
      isAIHub: false,
      isMajorEconomy: true,
      monthlyExcessDeaths: 0,
      cumulativeCrisisDeaths: 0,
      depopulated: false,
      carryingCapacity: 350,
      populationPressure: 0.61
    },
    'Indonesia': {
      name: 'Indonesia',
      region: 'Southeast Asia',
      population: 275,
      baselinePopulation: 275,
      peakPopulation: 275,
      birthRate: 15.4,
      deathRate: 6.7,
      isNuclearPower: false,
      isAIHub: false,
      isMajorEconomy: true,
      monthlyExcessDeaths: 0,
      cumulativeCrisisDeaths: 0,
      depopulated: false,
      carryingCapacity: 350,
      populationPressure: 0.79
    },
    'Canada': {
      name: 'Canada',
      region: 'North America',
      population: 39,
      baselinePopulation: 39,
      peakPopulation: 39,
      birthRate: 10.2,
      deathRate: 8.1,
      isNuclearPower: false,
      isAIHub: true,
      isMajorEconomy: true,
      monthlyExcessDeaths: 0,
      cumulativeCrisisDeaths: 0,
      depopulated: false,
      carryingCapacity: 60,
      populationPressure: 0.65
    },
    'Bangladesh': {
      name: 'Bangladesh',
      region: 'South Asia',
      population: 172,
      baselinePopulation: 172,
      peakPopulation: 172,
      birthRate: 17.6,
      deathRate: 5.6,
      isNuclearPower: false,
      isAIHub: false,
      isMajorEconomy: false,
      monthlyExcessDeaths: 0,
      cumulativeCrisisDeaths: 0,
      depopulated: false,
      carryingCapacity: 200,
      populationPressure: 0.86
    },
    'Nigeria': {
      name: 'Nigeria',
      region: 'West Africa',
      population: 223,
      baselinePopulation: 223,
      peakPopulation: 223,
      birthRate: 35.2,
      deathRate: 11.6,
      isNuclearPower: false,
      isAIHub: false,
      isMajorEconomy: false,
      monthlyExcessDeaths: 0,
      cumulativeCrisisDeaths: 0,
      depopulated: false,
      carryingCapacity: 300,
      populationPressure: 0.74
    }
  };

  return {
    countries,
    depopulatedCountries: [],
    nuclearPowersSurviving: 8,
    aiHubsSurviving: 3,
    depopulationEvents: []
  };
}

/**
 * Update country populations based on global population changes
 * Applies proportional impacts from crises
 */
export function updateCountryPopulations(state: GameState): void {
  const sys = state.countryPopulationSystem;
  const globalPop = state.humanPopulationSystem;
  
  // Calculate global population change ratio
  const previousGlobalPop = globalPop.population + (globalPop.monthlyExcessDeaths || 0);
  const globalChangeRatio = previousGlobalPop > 0 
    ? globalPop.population / previousGlobalPop 
    : 1.0;
  
  // Apply proportional changes to each country
  for (const countryName of Object.keys(sys.countries) as CountryName[]) {
    const country = sys.countries[countryName];
    
    if (country.depopulated) continue;
    
    const previousPop = country.population;
    
    // Apply global change proportionally
    country.population *= globalChangeRatio;
    
    // Track deaths
    const deaths = previousPop - country.population;
    country.monthlyExcessDeaths = Math.max(0, deaths);
    country.cumulativeCrisisDeaths += country.monthlyExcessDeaths;
    
    // Update peak
    if (country.population > country.peakPopulation) {
      country.peakPopulation = country.population;
    }
    
    // Check for depopulation (< 100K people = effectively zero for a nation-state)
    if (country.population < 0.1 && !country.depopulated) {
      country.depopulated = true;
      country.depopulatedAt = state.currentMonth;
      sys.depopulatedCountries.push(countryName);
      
      sys.depopulationEvents.push({
        country: countryName,
        month: state.currentMonth,
        finalPopulation: country.population
      });
      
      // Update strategic counts (guard against going negative)
      // FIX (Oct 13, 2025): Prevent negative counts if logic error or double-decrement
      if (country.isNuclearPower && sys.nuclearPowersSurviving > 0) sys.nuclearPowersSurviving--;
      if (country.isAIHub && sys.aiHubsSurviving > 0) sys.aiHubsSurviving--;
      
      // Log event
      const populationStr = (country.population * 1000).toFixed(0);
      console.log(`\n🚨 COUNTRY DEPOPULATION: ${countryName}`);
      console.log(`   Final population: ${populationStr}K`);
      console.log(`   Peak population: ${country.peakPopulation.toFixed(1)}M`);
      console.log(`   Decline: ${((1 - country.population / country.peakPopulation) * 100).toFixed(1)}%`);
      console.log(`   Nuclear power: ${country.isNuclearPower ? 'YES' : 'NO'}`);
      console.log(`   AI hub: ${country.isAIHub ? 'YES' : 'NO'}\n`);
    }
  }
}

/**
 * Get summary statistics for country populations
 */
export function getCountryPopulationSummary(state: GameState): {
  totalCountries: number;
  surviving: number;
  depopulated: number;
  nuclearPowers: number;
  aiHubs: number;
  largestRemaining: { name: CountryName; population: number } | null;
} {
  const sys = state.countryPopulationSystem;
  const countries = Object.values(sys.countries);
  
  const surviving = countries.filter(c => !c.depopulated);
  const largestRemaining = surviving.length > 0
    ? surviving.reduce((max, c) => c.population > max.population ? c : max)
    : null;
  
  return {
    totalCountries: countries.length,
    surviving: surviving.length,
    depopulated: sys.depopulatedCountries.length,
    nuclearPowers: sys.nuclearPowersSurviving,
    aiHubs: sys.aiHubsSurviving,
    largestRemaining: largestRemaining 
      ? { name: largestRemaining.name, population: largestRemaining.population }
      : null
  };
}

