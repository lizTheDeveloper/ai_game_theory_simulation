/**
 * Resource Economy System (Phase 2.9)
 * 
 * Comprehensive resource modeling with:
 * - 12 specific resource types
 * - CO2 coupling (fossil use → climate collapse)
 * - Industry opposition (fossil fuel lobby)
 * - Substitution technologies
 * - Ocean health & geoengineering
 */

import { GameState } from '../types/game';
import {
  ResourceEconomy,
  FossilFuelResource,
  OilResource,
  CoalResource,
  NaturalGasResource,
  MetalResource,
  FoodResource,
  WaterResource,
  TimberResource,
  EnergySystem,
  CO2System,
  FossilFuelIndustry,
  MiningIndustry,
  OceanHealth,
} from '../types/resources';

// ============================================================================
// INITIALIZATION
// ============================================================================

export function initializeResourceEconomy(): ResourceEconomy {
  return {
    // Fossil fuels (baseline 2023 levels)
    oil: initializeOil(),
    coal: initializeCoal(),
    naturalGas: initializeNaturalGas(),
    
    // Metals & minerals
    iron: initializeMetal('iron', 0.80, 0.005, 0.90), // Abundant, highly recyclable
    copper: initializeMetal('copper', 0.75, 0.008, 0.95), // Critical for clean tech
    rareEarths: initializeMetal('rareEarths', 0.70, 0.015, 0.80), // Bottleneck!
    lithium: initializeMetal('lithium', 0.60, 0.020, 0.70), // Battery bottleneck!
    
    // Renewable resources
    food: initializeFood(),
    water: initializeWater(),
    timber: initializeTimber(),
    
    // Energy system
    energy: initializeEnergy(),
    
    // Climate & CO2
    co2: initializeCO2(),
    
    // Industry opposition
    fossilIndustry: initializeFossilIndustry(),
    miningIndustry: initializeMiningIndustry(),
    
    // Ocean health
    ocean: initializeOceanHealth(),
    
    // Geoengineering (not yet deployed)
    geoengineering: {},
    
    // Aggregates
    totalResourceSecurity: 0.85, // Calculated each month
    energyIndependence: 0.25,     // 25% from renewables (2023 baseline)
    circularityIndex: 0.10,       // 10% recycled (low!)
    fossilDependence: 0.82,       // 82% of energy from fossil (2023)
    criticalBottlenecks: [],
    
    // Legacy compatibility
    resourceReserves: 0.85,       // Weighted average
  };
}

// ============================================================================
// FOSSIL FUELS
// ============================================================================

function initializeOil(): OilResource {
  return {
    // Reserves (2023: ~1.7 trillion barrels, 50 years at current use)
    reserves: 1.0,
    initialReserves: 1.0,
    depletionRate: 0.015,          // 1.5%/month baseline (exhausted in ~67 months)
    
    // Usage (scales with economic stage)
    monthlyExtraction: 0.015,
    monthlyConsumption: 0.015,
    
    // Economics
    extractionCost: 50,            // $/barrel baseline
    marketPrice: 80,               // $/barrel (2023 avg)
    
    // Environmental
    co2PerUnit: 2.3,               // kg CO2 per kg oil (combustion)
    pollutionPerUnit: 1.0,
    
    // Substitution
    substitutionLevel: 0.05,       // 5% substituted (EVs starting)
    substituteEfficiency: 0.7,     // EVs 70% as convenient as ICE (charging time)
    
    // Oil-specific
    spillRisk: 0.01,               // 1% per month
    spillSeverity: 0.0,            // No spill yet
    plasticProduction: 0.10,       // 10% of oil goes to plastics
  };
}

function initializeCoal(): CoalResource {
  return {
    // Reserves (2023: ~1.1 trillion tonnes, 130 years at current use)
    reserves: 1.0,
    initialReserves: 1.0,
    depletionRate: 0.008,          // 0.8%/month (exhausted in ~125 months)
    
    // Usage
    monthlyExtraction: 0.008,
    monthlyConsumption: 0.008,
    
    // Economics
    extractionCost: 30,            // $/tonne
    marketPrice: 50,               // $/tonne
    
    // Environmental (WORST CO2!)
    co2PerUnit: 2.86,              // kg CO2 per kg coal (highest!)
    pollutionPerUnit: 1.5,         // Mining damage, air pollution
    
    // Substitution
    substitutionLevel: 0.10,       // 10% substituted (solar/wind)
    substituteEfficiency: 0.9,     // Solar/wind pretty good for electricity
    
    // Coal-specific
    steelProduction: 0.20,         // 20% for steel (vs 80% electricity)
    miningHazard: 0.3,             // Dangerous mining
  };
}

function initializeNaturalGas(): NaturalGasResource {
  return {
    // Reserves (2023: ~200 trillion m³, 50-60 years)
    reserves: 1.0,
    initialReserves: 1.0,
    depletionRate: 0.012,          // 1.2%/month (exhausted in ~83 months)
    
    // Usage
    monthlyExtraction: 0.012,
    monthlyConsumption: 0.012,
    
    // Economics
    extractionCost: 20,            // $/MCF
    marketPrice: 35,               // $/MCF
    
    // Environmental (cleaner than coal/oil)
    co2PerUnit: 2.0,               // kg CO2 per kg gas
    pollutionPerUnit: 0.5,         // Cleaner
    
    // Substitution
    substitutionLevel: 0.08,       // 8% substituted
    substituteEfficiency: 0.85,    // Heat pumps, green H2
    
    // Gas-specific
    methaneLeakage: 0.02,          // 2% leaks (CH4 is 80x worse than CO2!)
    fertilizerProduction: 0.15,    // 15% for ammonia/fertilizer
  };
}

// ============================================================================
// METALS & MINERALS
// ============================================================================

function initializeMetal(
  type: string,
  initialReserves: number,
  depletionRate: number,
  recyclingEfficiency: number
): MetalResource {
  const baseRecyclingRate = {
    iron: 0.30,      // 30% recycled (2023 baseline)
    copper: 0.35,    // 35% recycled
    rareEarths: 0.01, // 1% recycled (very hard!)
    lithium: 0.05,   // 5% recycled (new industry)
  }[type] || 0.10;
  
  return {
    // Reserves
    reserves: initialReserves,
    initialReserves,
    depletionRate,
    
    // Extraction
    monthlyExtraction: depletionRate,
    extractionCost: 100,           // Varies by type
    extractionPollution: type === 'rareEarths' ? 0.03 : 0.01, // Rare earths worst
    
    // Recycling
    recycledStock: baseRecyclingRate * 0.5, // Some recycled stock available
    recyclingRate: baseRecyclingRate,
    recyclingEfficiency,
    monthlyRecycling: 0,           // Calculated
    
    // Usage
    monthlyConsumption: depletionRate,
    
    // Strategic
    criticality: {
      rareEarths: 0.8,             // Critical bottleneck!
      lithium: 0.7,                // Battery bottleneck
      copper: 0.6,                 // Clean tech needs 3x more
      iron: 0.3,                   // Abundant
    }[type] || 0.5,
    substitutionProgress: 0.0,     // No substitutes yet
  };
}

// ============================================================================
// RENEWABLE RESOURCES
// ============================================================================

function initializeFood(): FoodResource {
  return {
    // Stock (2023: stressed but functional)
    reserves: 0.90,
    capacity: 1.0,
    
    // Regeneration (3-4 month growing cycle)
    monthlyRegeneration: 0.03,     // 3% natural regeneration
    regenerationMultiplier: 0.9,   // Soil health declining
    
    // Harvesting
    monthlyHarvest: 0.025,         // Sustainable for now
    sustainableHarvestRate: 0.03,
    overharvest: 0.0,
    
    // Sustainability
    sustainabilityIndex: 0.85,     // Harvest vs regen balance
    
    // Food-specific
    soilHealth: 0.85,              // Degrading (monoculture, chemicals)
    pollinatorPopulation: 0.70,    // Bees declining (pesticides)
    waterAvailability: 0.80,       // Aquifers depleting
    climateStress: 0.15,           // Droughts, floods increasing
  };
}

function initializeWater(): WaterResource {
  return {
    // Stock (2023: stressed in many regions)
    reserves: 0.85,
    capacity: 1.0,
    
    // Regeneration (rain cycle)
    monthlyRegeneration: 0.005,    // 0.5% natural (slow!)
    regenerationMultiplier: 0.85,  // Climate change disrupts cycle
    
    // Harvesting
    monthlyHarvest: 0.008,         // Extracting faster than regen
    sustainableHarvestRate: 0.005,
    overharvest: 0.003,            // Aquifer depletion
    
    // Sustainability
    sustainabilityIndex: 0.75,     // Unsustainable
    
    // Water-specific
    aquiferLevels: 0.75,           // Declining (Ogallala, etc.)
    surfaceWater: 0.85,            // Rivers, lakes
    desalinationCapacity: 0.02,    // 2% from desalination (expensive)
    pollutionLevel: 0.20,          // Industrial runoff, agriculture
  };
}

function initializeTimber(): TimberResource {
  return {
    // Stock (2023: forests declining)
    reserves: 0.80,
    capacity: 1.0,
    
    // Regeneration (trees grow slowly)
    monthlyRegeneration: 0.008,    // 0.8% (20+ year cycle)
    regenerationMultiplier: 0.80,  // Old growth gone
    
    // Harvesting
    monthlyHarvest: 0.010,         // Overharvesting
    sustainableHarvestRate: 0.008,
    overharvest: 0.002,
    
    // Sustainability
    sustainabilityIndex: 0.75,     // Deforestation continuing
    
    // Timber-specific
    forestCover: 0.80,             // 80% of original (Amazon, etc.)
    oldGrowthRemaining: 0.30,      // 30% of ancient forests left
    plantationEfficiency: 0.60,    // Plantations less biodiverse
  };
}

// ============================================================================
// ENERGY SYSTEM
// ============================================================================

function initializeEnergy(): EnergySystem {
  // 2023 global energy mix (IEA data)
  return {
    totalProduction: 100,          // Abstract units
    totalDemand: 95,               // 5% surplus
    surplus: 5,
    
    // Sources (must sum to ~100%)
    sources: {
      oil: 31,                     // 31%
      coal: 27,                    // 27%
      naturalGas: 24,              // 24%
      nuclear: 4,                  // 4%
      solar: 5,                    // 5% (growing fast!)
      wind: 7,                     // 7%
      hydro: 7,                    // 7%
      fusion: 0,                   // 0% (not yet)
    },
    
    // Capacity (room to grow)
    capacity: {
      oil: 35,
      coal: 35,
      naturalGas: 30,
      nuclear: 5,
      solar: 50,                   // Massive potential
      wind: 40,
      hydro: 10,                   // Limited sites
      fusion: 0,                   // Not unlocked
    },
    
    // Infrastructure
    gridEfficiency: 0.85,          // 15% transmission losses
    storageCapacity: 0.05,         // 5% (batteries, pumped hydro) - LOW!
    
    // Metrics
    renewablePercentage: 0.19,     // 19% from clean (solar+wind+hydro)
    carbonIntensity: 0.50,         // kg CO2 per unit energy (high!)
  };
}

// ============================================================================
// CO2 & CLIMATE
// ============================================================================

function initializeCO2(): CO2System {
  // 2023 baseline
  return {
    // Atmospheric
    atmosphericCO2: 420,           // ppm (May 2023: 424 ppm)
    annualEmissions: 37,           // Gt CO2/year (2023)
    cumulativeEmissions: 0,        // Track total above baseline
    
    // Sinks
    oceanAbsorption: 10,           // Gt CO2/year absorbed
    landAbsorption: 11,            // Gt CO2/year (forests, soil)
    sinkSaturation: 0.30,          // 30% saturated (slowing absorption)
    
    // Temperature
    temperatureAnomaly: 1.2,       // °C above 1850-1900 (2023 actual)
    climateSensitivity: 3.0,       // °C per CO2 doubling (IPCC central estimate)
    
    // Tipping points
    arcticIceLoss: 0.50,           // 50% summer ice lost (2023)
    permafrostThaw: 0.10,          // 10% thawed (accelerating)
    amazonDieback: 0.15,           // 15% degraded
  };
}

// ============================================================================
// INDUSTRY OPPOSITION
// ============================================================================

function initializeFossilIndustry(): FossilFuelIndustry {
  return {
    // Power (strong in 2023)
    politicalPower: 0.80,          // 80% - very powerful
    economicShare: 0.82,           // 82% of energy (from initialEnergy)
    
    // Desperation (not desperate yet)
    desperation: 0.20,             // 20% - starting to feel threatened
    sabotageAttempts: 0,
    
    // Opposition intensity
    researchResistance: 0.25,      // 25% slowdown of clean tech research
    deploymentResistance: 0.35,    // 35% slowdown of adoption
    
    // Tactics
    governmentCapture: false,      // Not yet (depends on govt type)
    mediaDisinformation: 0.30,     // 30% intensity
    politicalDonations: 20,        // $20B/year
    
    // State
    collapsed: false,
  };
}

function initializeMiningIndustry(): MiningIndustry {
  return {
    politicalPower: 0.50,          // Moderate power
    recyclingAdoption: 0.10,       // 10% pivoted to recycling
    resistanceLevel: 0.40,         // 40% resistance to circular economy
  };
}

// ============================================================================
// OCEAN HEALTH
// ============================================================================

function initializeOceanHealth(): OceanHealth {
  // 2023 baseline: stressed but not collapsed
  return {
    // Core metrics
    pH: 8.1,                       // Current (down from 8.2 pre-industrial)
    oxygenLevel: 0.90,             // 90% of baseline (declining)
    phytoplanktonPopulation: 0.85, // 85% (declining since 1950s)
    fishStocks: 0.60,              // 60% (90% of large fish gone)
    
    // Stressors
    acidification: 0.10,           // 10% cumulative stress
    pollutionLoad: 0.25,           // 25% (plastics, chemicals, spills)
    plasticConcentration: 0.30,    // 30% (8M tons/year added)
    thermalStress: 0.15,           // 15% (warming oceans)
    
    // Dead zones
    deadZoneExtent: 0.05,          // 5% (700+ dead zones globally)
    anoxicRisk: 0.10,              // 10% risk
    
    // Recovery
    ecosystemResilience: 0.70,     // 70% (degraded but functional)
    naturalRecoveryRate: 0.001,    // 0.1% per month (very slow!)
    
    // Crisis
    inCrisis: false,               // Not yet, but stressed
    monthsInCrisis: 0,
    recoveryPossible: true,        // Still possible to save
    
    // Geoengineering
    geoengInterventionActive: false,
    geoengIntensity: 0.0,
    terminationShockRisk: 0.0,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate weighted average resource security
 * Weights reflect importance to civilization
 */
export function calculateResourceSecurity(resources: ResourceEconomy): number {
  const weights = {
    // Fossil fuels (declining weight as we transition)
    oil: 0.15 * (1 - resources.energy.renewablePercentage),
    coal: 0.10 * (1 - resources.energy.renewablePercentage),
    naturalGas: 0.10 * (1 - resources.energy.renewablePercentage),
    
    // Critical metals
    copper: 0.08,
    rareEarths: 0.07,
    lithium: 0.06,
    iron: 0.05,
    
    // Renewable resources (always important!)
    food: 0.15,
    water: 0.15,
    timber: 0.05,
    
    // Energy (critical!)
    energy: 0.10,
  };
  
  const energySecurity = Math.min(1.0, resources.energy.surplus / resources.energy.totalDemand);
  
  const weighted =
    weights.oil * resources.oil.reserves +
    weights.coal * resources.coal.reserves +
    weights.naturalGas * resources.naturalGas.reserves +
    weights.copper * resources.copper.reserves +
    weights.rareEarths * resources.rareEarths.reserves +
    weights.lithium * resources.lithium.reserves +
    weights.iron * resources.iron.reserves +
    weights.food * resources.food.reserves +
    weights.water * resources.water.reserves +
    weights.timber * resources.timber.reserves +
    weights.energy * energySecurity;
  
  return weighted;
}

/**
 * Identify critical bottlenecks (resources below threshold)
 */
export function identifyBottlenecks(resources: ResourceEconomy): string[] {
  const bottlenecks: string[] = [];
  
  // Check each resource
  if (resources.oil.reserves < 0.30) bottlenecks.push('oil');
  if (resources.coal.reserves < 0.30) bottlenecks.push('coal');
  if (resources.naturalGas.reserves < 0.30) bottlenecks.push('naturalGas');
  if (resources.copper.reserves < 0.40) bottlenecks.push('copper');
  if (resources.rareEarths.reserves < 0.50) bottlenecks.push('rareEarths'); // Higher threshold!
  if (resources.lithium.reserves < 0.40) bottlenecks.push('lithium');
  if (resources.food.reserves < 0.60) bottlenecks.push('food');
  if (resources.water.reserves < 0.60) bottlenecks.push('water');
  if (resources.ocean.pH < 7.9) bottlenecks.push('ocean_acidification');
  if (resources.ocean.oxygenLevel < 0.60) bottlenecks.push('ocean_oxygen');
  if (resources.energy.surplus < 0) bottlenecks.push('energy_shortage');
  
  return bottlenecks;
}

