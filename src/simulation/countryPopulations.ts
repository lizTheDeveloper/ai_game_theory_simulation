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
import {
  createEmptyResourceEndowment,
  createDefaultSovereignty,
  calculateResourceValue
} from '../types/resourceEndowment';

/**
 * Helper to create country with all required fields
 * TIER 2.8 fields will be overwritten by initializeTier28Extensions()
 */
function createCountry(base: {
  name: CountryName;
  region: string;
  population: number;
  birthRate: number;
  deathRate: number;
  isNuclearPower: boolean;
  isAIHub: boolean;
  isMajorEconomy: boolean;
  carryingCapacity: number;
}): CountryPopulation {
  const emptyResources = createEmptyResourceEndowment();
  const defaultSovereignty = createDefaultSovereignty();
  const resourceValue = calculateResourceValue(emptyResources, defaultSovereignty);

  return {
    ...base,
    baselinePopulation: base.population,
    peakPopulation: base.population,
    monthlyExcessDeaths: 0,
    cumulativeCrisisDeaths: 0,
    depopulated: false,
    populationPressure: base.population / base.carryingCapacity,
    // TIER 2.8 fields - initialized by initializeTier28Extensions()
    isHegemon: false,
    domesticResources: emptyResources,
    extractedResources: emptyResources,
    sovereignty: defaultSovereignty,
    resourceValue: resourceValue,
    extractionTargets: [],
    extractedBy: [],
    militaryCapability: 0,
    militarySpendingPercent: 0,
    militarySpendingAbsolute: 0,
    militaryCO2Emissions: 0,
    militaryBases: new Map(),
    activeInterventions: [],
    militaryRnDPercent: 0,
    meaningCrisis: 0,
    nationalismStrength: 0,
    warMotivation: 0,
    parentalFulfillment: 0,
    moralInjury: 0,
    historicalEmissions: 0,
    currentEmissions: 0,
    climateSufferingRatio: 0,
    climateReparationsOwed: 0,
    climateReparationsReceived: 0,
    militaryEmissionsPercent: 0,
    climateReparationsWillingness: 0,
    climateMigrationPressure: 0,
    greenTechReceived: 0,
    greenTechShared: 0
  };
}

/**
 * Initialize country population tracking
 * Data from UN World Population Prospects 2024
 */
export function initializeCountryPopulations(): CountryPopulationSystem {
  const countries: Record<CountryName, CountryPopulation> = {
    'United States': createCountry({
      name: 'United States',
      region: 'Northern America',
      population: 335,
      birthRate: 11.0,
      deathRate: 8.9,
      isNuclearPower: true,
      isAIHub: true,
      isMajorEconomy: true,
      carryingCapacity: 400
    }),
    'China': createCountry({
      name: 'China',
      region: 'Eastern Asia',
      population: 1425,
      birthRate: 6.5,
      deathRate: 7.4,
      isNuclearPower: true,
      isAIHub: true,
      isMajorEconomy: true,
      carryingCapacity: 1600
    }),
    'Russia': createCountry({
      name: 'Russia',
      region: 'Europe',
      population: 144,
      birthRate: 9.2,
      deathRate: 14.6,
      isNuclearPower: true,
      isAIHub: false,
      isMajorEconomy: true,
      carryingCapacity: 200
    }),
    'India': createCountry({
      name: 'India',
      region: 'Southern Asia',
      population: 1425,
      birthRate: 16.2,
      deathRate: 7.3,
      isNuclearPower: true,
      isAIHub: false,
      isMajorEconomy: true,
      carryingCapacity: 1800
    }),
    'United Kingdom': createCountry({
      name: 'United Kingdom',
      region: 'Europe',
      population: 67,
      birthRate: 10.7,
      deathRate: 9.4,
      isNuclearPower: true,
      isAIHub: true,
      isMajorEconomy: true,
      carryingCapacity: 80
    }),
    'France': createCountry({
      name: 'France',
      region: 'Europe',
      population: 65,
      birthRate: 10.9,
      deathRate: 9.6,
      isNuclearPower: true,
      isAIHub: false,
      isMajorEconomy: true,
      carryingCapacity: 80
    }),
    'Pakistan': createCountry({
      name: 'Pakistan',
      region: 'Southern Asia',
      population: 235,
      birthRate: 25.4,
      deathRate: 6.5,
      isNuclearPower: true,
      isAIHub: false,
      isMajorEconomy: false,
      carryingCapacity: 300
    }),
    'Israel': createCountry({
      name: 'Israel',
      region: 'Middle East & North Africa',
      population: 9,
      birthRate: 19.2,
      deathRate: 5.2,
      isNuclearPower: true,
      isAIHub: false,
      isMajorEconomy: false,
      carryingCapacity: 15
    }),
    'Japan': createCountry({
      name: 'Japan',
      region: 'Eastern Asia',
      population: 125,
      birthRate: 6.9,
      deathRate: 11.7,
      isNuclearPower: false,
      isAIHub: false,
      isMajorEconomy: true,
      carryingCapacity: 150
    }),
    'Germany': createCountry({
      name: 'Germany',
      region: 'Europe',
      population: 84,
      birthRate: 9.3,
      deathRate: 11.8,
      isNuclearPower: false,
      isAIHub: false,
      isMajorEconomy: true,
      carryingCapacity: 100
    }),
    'Brazil': createCountry({
      name: 'Brazil',
      region: 'Latin America',
      population: 215,
      birthRate: 13.4,
      deathRate: 6.8,
      isNuclearPower: false,
      isAIHub: false,
      isMajorEconomy: true,
      carryingCapacity: 350
    }),
    'Indonesia': createCountry({
      name: 'Indonesia',
      region: 'South-East Asia',
      population: 275,
      birthRate: 15.4,
      deathRate: 6.7,
      isNuclearPower: false,
      isAIHub: false,
      isMajorEconomy: true,
      carryingCapacity: 350
    }),
    'Canada': createCountry({
      name: 'Canada',
      region: 'Northern America',
      population: 39,
      birthRate: 10.2,
      deathRate: 8.1,
      isNuclearPower: false,
      isAIHub: true,
      isMajorEconomy: true,
      carryingCapacity: 60
    }),
    'Bangladesh': createCountry({
      name: 'Bangladesh',
      region: 'Southern Asia',
      population: 172,
      birthRate: 17.6,
      deathRate: 5.6,
      isNuclearPower: false,
      isAIHub: false,
      isMajorEconomy: false,
      carryingCapacity: 200
    }),
    'Nigeria': createCountry({
      name: 'Nigeria',
      region: 'Sub-Saharan Africa',
      population: 223,
      birthRate: 35.2,
      deathRate: 11.6,
      isNuclearPower: false,
      isAIHub: false,
      isMajorEconomy: false,
      carryingCapacity: 300
    }),
    // P2.4: Additional countries for organization geographic diversification
    'Ireland': createCountry({
      name: 'Ireland',
      region: 'Europe',
      population: 5.1,
      birthRate: 11.5,
      deathRate: 6.8,
      isNuclearPower: false,
      isAIHub: true, // Major tech hub (Google, Microsoft, Meta EU HQ)
      isMajorEconomy: false,
      carryingCapacity: 8
    }),
    'Singapore': createCountry({
      name: 'Singapore',
      region: 'South-East Asia',
      population: 5.9,
      birthRate: 8.5,
      deathRate: 5.0,
      isNuclearPower: false,
      isAIHub: true, // AI research hub (Google, Meta, OpenAI offices)
      isMajorEconomy: false,
      carryingCapacity: 7
    }),
    'Australia': createCountry({
      name: 'Australia',
      region: 'Oceania',
      population: 26.4,
      birthRate: 12.0,
      deathRate: 6.7,
      isNuclearPower: false,
      isAIHub: false,
      isMajorEconomy: true,
      carryingCapacity: 50
    })
  };

  // Initialize TIER 2.8 extensions (resources, military, war-meaning)
  // This is done separately to keep the base initialization clean
  initializeTier28Extensions(countries);

  return {
    countries,
    depopulatedCountries: [],
    nuclearPowersSurviving: 8,
    aiHubsSurviving: 3,
    depopulationEvents: []
  };
}

/**
 * Initialize TIER 2.8 extensions for all countries
 * Adds resources, military capabilities, and war-meaning feedback fields
 */
function initializeTier28Extensions(countries: Record<CountryName, CountryPopulation>): void {
  // Import here to avoid circular dependencies
  const { initializeAllCountryResources } = require('./resourceInitialization');
  const { initializeMilitaryCapabilities } = require('./militarySystem');
  const { initializeWarMeaningFeedback } = require('./warMeaningFeedback');

  // 1. Initialize resource endowments and sovereignty
  const resourceData = initializeAllCountryResources();
  for (const [name, data] of resourceData.entries()) {
    const country = countries[name];
    if (country) {
      country.isHegemon = data.isHegemon;
      country.domesticResources = data.resources;
      country.extractedResources = data.extractedResources;
      country.sovereignty = data.sovereignty;
      country.resourceValue = data.resourceValue;
      country.extractionTargets = data.extractionTargets;
      country.extractedBy = data.extractedBy;
    }
  }

  // 2. Initialize military capabilities
  const militaryData = initializeMilitaryCapabilities();
  for (const [name, data] of militaryData.entries()) {
    const country = countries[name];
    if (country) {
      country.militaryCapability = data.militaryCapability;
      country.militarySpendingPercent = data.militarySpendingPercent;
      country.militarySpendingAbsolute = data.militarySpendingAbsolute;
      country.militaryCO2Emissions = data.militaryCO2Emissions;
      country.militaryBases = data.militaryBases;
      country.activeInterventions = data.activeInterventions;
      country.militaryRnDPercent = data.militaryRnDPercent;
    }
  }

  // 3. Initialize war-meaning feedback fields
  initializeWarMeaningFeedback(countries);

  // 4. Initialize environmental debt fields
  for (const country of Object.values(countries)) {
    // Historical emissions (will be refined with actual data later)
    // For now, rough estimates based on industrialization and GDP
    country.historicalEmissions = getHistoricalEmissions(country.name);
    country.currentEmissions = getCurrentEmissions(country.name);
    country.climateSufferingRatio = getClimateSufferingRatio(country.name);
    country.climateReparationsOwed = 0.0; // Calculated dynamically
    country.climateReparationsReceived = 0.0;
    country.militaryEmissionsPercent = country.militaryCO2Emissions / (country.currentEmissions * 1000); // Convert Gt to Mt
  }

  // 5. Initialize climate justice fields (Phase 4)
  const { initializeClimateJustice } = require('./climateJustice');
  initializeClimateJustice(countries);
}

/**
 * Get historical CO2 emissions (cumulative since 1850, in gigatons)
 * Source: Our World in Data, Global Carbon Project
 */
function getHistoricalEmissions(country: CountryName): number {
  switch (country) {
    case 'United States': return 400; // 25% of all emissions ever
    case 'China': return 220; // Mostly post-1980
    case 'Russia': return 100; // USSR legacy
    case 'India': return 50;
    case 'United Kingdom': return 80; // Industrial revolution
    case 'France': return 40;
    case 'Germany': return 90; // Industrial powerhouse
    case 'Japan': return 60;
    case 'Canada': return 30;
    case 'Brazil': return 15;
    case 'Indonesia': return 10;
    case 'Pakistan': return 5;
    case 'Israel': return 2;
    case 'Bangladesh': return 1;
    case 'Nigeria': return 2;
    default: return 5;
  }
}

/**
 * Get current annual CO2 emissions (gigatons/year)
 * Source: Global Carbon Project 2024
 */
function getCurrentEmissions(country: CountryName): number {
  switch (country) {
    case 'United States': return 5.0;
    case 'China': return 11.5;
    case 'Russia': return 1.8;
    case 'India': return 3.0;
    case 'United Kingdom': return 0.4;
    case 'France': return 0.3;
    case 'Germany': return 0.7;
    case 'Japan': return 1.1;
    case 'Canada': return 0.6;
    case 'Brazil': return 0.5;
    case 'Indonesia': return 0.7;
    case 'Pakistan': return 0.3;
    case 'Israel': return 0.07;
    case 'Bangladesh': return 0.1;
    case 'Nigeria': return 0.15;
    default: return 0.5;
  }
}

/**
 * Get climate suffering ratio (how much country suffers vs what they caused)
 * Higher = suffers more than they caused
 * Lower = caused more than they suffer
 */
function getClimateSufferingRatio(country: CountryName): number {
  switch (country) {
    // Hegemons: Caused most, suffer least (buffered by wealth)
    case 'United States': return 0.05; // Caused 400 Gt, suffers minimally
    case 'United Kingdom': return 0.10;
    case 'France': return 0.12;
    case 'Germany': return 0.15;
    case 'Canada': return 0.08;
    case 'Russia': return 0.20; // Some climate suffering (permafrost, fires)
    case 'China': return 0.30; // Recent emissions, some suffering
    case 'Japan': return 0.25;

    // Developing: Minimal emissions, moderate suffering
    case 'India': return 5.0; // Low emissions, high population vulnerability
    case 'Indonesia': return 8.0; // Low emissions, island flooding
    case 'Brazil': return 2.0; // Amazon helps, but deforestation hurts

    // Most vulnerable: Zero/minimal emissions, extreme suffering
    case 'Bangladesh': return 50.0; // Climate ground zero (sea level, cyclones)
    case 'Pakistan': return 20.0; // Floods, heat waves
    case 'Nigeria': return 15.0; // Desertification, conflict

    // Regional conflicts complicate
    case 'Israel': return 1.0; // Mid emissions, geopolitical buffer

    default: return 1.0;
  }
}

/**
 * Update country populations with bidirectional aggregation architecture
 *
 * **FIX (Oct 26, 2025): Countries ↔ Regions Aggregation**
 *
 * Implements two-phase update:
 * 1. **Downward**: Countries inherit regional dynamics (climate, food, environment)
 * 2. **Upward**: Countries aggregate back UP to update regional totals
 *
 * **Data Flow:**
 * ```
 * Regional Population Dynamics (from environmental systems)
 *   ↓ Phase 1: Inheritance
 * Country Populations (inherit regional growth rates)
 *   ↓ Apply country-specific events (TODO: wars, interventions)
 * Country Populations (updated)
 *   ↓ Phase 2: Aggregation
 * Regional Populations (sum of countries in region)
 * ```
 *
 * **Why Bidirectional:**
 * - Regional dynamics (climate, food) affect all countries in a region uniformly
 * - Country events (wars) affect specific countries
 * - Countries aggregate back up to give accurate regional totals
 *
 * **Example:**
 * - South Asia region loses 5% population due to food crisis
 * - India and Bangladesh inherit -5% (Phase 1)
 * - India has additional -2% from war (future: country-specific events)
 * - South Asia total = sum(India, Bangladesh, ...) (Phase 2)
 *
 * @see src/simulation/populationMapping.ts for country→region mapping
 * @see src/simulation/populationProvider.ts for unified read API
 */
export function updateCountryPopulations(state: GameState): void {
  // FIX (Oct 26, 2025): Countries → Regions aggregation architecture
  // Countries inherit REGIONAL dynamics (climate, food, environment affecting whole region)
  // Plus country-specific events (wars, interventions) layered on top
  // Then countries aggregate UP to give new regional totals

  const { mapCountryRegionToStandardRegion } = require('./populationMapping');
  const sys = state.countryPopulationSystem;
  const regionalPops = state.humanPopulationSystem.regionalPopulations;

  if (!regionalPops || regionalPops.length === 0) {
    console.warn('⚠️  No regional populations available, skipping country update');
    return;
  }

  // Apply REGIONAL dynamics to countries first (climate, food, environment)
  // Each country inherits the population change from its parent region
  for (const countryName of Object.keys(sys.countries) as CountryName[]) {
    const country = sys.countries[countryName];

    if (country.depopulated) continue;

    // Find parent region
    const regionName = mapCountryRegionToStandardRegion(country.region);
    const region = regionalPops.find(r => r.name === regionName);

    if (!region) {
      console.warn(`⚠️  Country ${countryName}: Could not find parent region "${regionName}"`);
      continue;
    }

    const previousPop = country.population;

    // Apply regional monthly growth rate to this country
    // (regional dynamics like climate, food security affect everyone in region)
    const monthlyGrowthRate = region.netGrowthRate / 12;
    country.population *= (1 + monthlyGrowthRate);

    // TODO (Future): Add country-specific events here
    // - Military interventions
    // - Country-specific crises
    // - Internal conflicts
    // For now, countries just follow regional trends

    // Track deaths
    const deaths = previousPop - country.population;
    country.monthlyExcessDeaths = Math.max(0, deaths);
    country.cumulativeCrisisDeaths += country.monthlyExcessDeaths;
    
    // Update peak
    if (country.population > country.peakPopulation) {
      country.peakPopulation = country.population;
    }
    
    // Check for depopulation (< 1M people = state collapse threshold)
    // FIX (Oct 30, 2025): Raised from 0.1M to 1M - smallest country is 5.1M baseline,
    // so 79% mortality (5.1M → 1.07M) should trigger depopulation
    // Research: Modern nation-states require ~1M minimum for basic governance (CIA 2024)
    if (country.population < 1.0 && !country.depopulated) {
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
      console.log(`\n⚠️ COUNTRY DEPOPULATION: ${countryName}`);
      console.log(`   Final population: ${populationStr}K`);
      console.log(`   Peak population: ${country.peakPopulation.toFixed(1)}M`);
      console.log(`   Decline: ${((1 - country.population / country.peakPopulation) * 100).toFixed(1)}%`);
      console.log(`   Nuclear power: ${country.isNuclearPower ? 'YES' : 'NO'}`);
      console.log(`   AI hub: ${country.isAIHub ? 'YES' : 'NO'}\n`);
    }
  }

  // PHASE 2: Aggregate countries UP to update regional totals
  // Now that countries have absorbed regional dynamics + country-specific events,
  // we aggregate their populations back up to give new regional totals
  // This creates bidirectional flow: regions → countries → regions

  const { createRegionCountryMaps } = require('./populationMapping');
  const { regionToCountries } = createRegionCountryMaps(sys.countries);

  // For each region, sum up all country populations
  for (const [regionName, countrySet] of regionToCountries.entries()) {
    const region = regionalPops.find(r => r.name === regionName);
    if (!region) {
      console.warn(`⚠️  Aggregation: Could not find region "${regionName}"`);
      continue;
    }

    // Sum populations of all countries in this region
    let totalPopulation = 0;
    for (const countryName of countrySet) {
      const country = sys.countries[countryName];
      if (country && !country.depopulated) {
        totalPopulation += country.population;
      }
    }

    // Update regional population with country aggregate
    // NOTE: Regions also get direct updates from environmental systems (climate, food, etc.)
    // This aggregate represents the country-level dynamics layered on top
    // For now, we use the aggregate as-is since countries inherit regional dynamics
    // In future, country-specific events will make countries diverge from regions
    region.population = totalPopulation;

    // Update peak if needed
    if (region.population > region.peakPopulation) {
      region.peakPopulation = region.population;
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

