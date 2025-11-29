/**
 * Resource Depletion & CO2 Coupling (Phase 2.9 - Part 2)
 * 
 * Monthly update functions for:
 * - Resource extraction and depletion
 * - CO2 emissions from fossil fuel use
 * - Ocean acidification and degradation
 * - Industry opposition dynamics
 * - Substitution technology effects
 */

import { GameState, GameEvent } from '../types/game';
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
  CO2System,
} from '../types/resources';
import { assertEconomicStage, assertStateProperty, assertFinite, assertPlanetaryBoundary, assertProbability } from './utils/assertions';
import { deterministicRandom } from '@/simulation/utils/deterministicRng';
import { interpolateClimateForMonth } from '@/data/loaders/historicalClimateLoader';
import { isHistoricalModeActive } from './utils/historicalMode';

// Helper to add events to state
function addEvent(state: GameState, event: Omit<GameEvent, 'id' | 'timestamp'>): void {
  const fullEvent: GameEvent = {
    ...event,
    id: `${event.type}_${state.currentMonth}_${deterministicRandom().toString(36).substr(2, 9)}`,
    timestamp: state.currentMonth,
  };
  state.eventLog.push(fullEvent);
}

// ============================================================================
// MAIN UPDATE FUNCTION
// ============================================================================

export function updateResourceEconomy(state: GameState): void {
  const resources = state.resourceEconomy;
  if (!resources) return; // Not initialized yet
  
  // Update in order of dependencies
  updateFossilFuelDepletion(state, resources);
  updateMetalDepletion(state, resources);
  updateRenewableRegeneration(state, resources);
  updateEnergySystem(state, resources);
  updateCO2System(state, resources);

  // FIX (Oct 26, 2025): Verify annualEmissions persists through remaining updates
  if (!isFinite(resources.co2.annualEmissions)) {
    console.error(`❌ annualEmissions corrupted IMMEDIATELY after updateCO2System (month ${state.currentMonth})`);
    console.error(`   Value: ${resources.co2.annualEmissions}`);
    throw new Error(`❌ annualEmissions NaN after updateCO2System - corruption in updateResourceEconomy`);
  }

  updateOceanHealth(state, resources);
  updateIndustryOpposition(state, resources);

  // Calculate aggregates
  updateAggregates(state, resources);

  // Check for critical events
  checkResourceEvents(state, resources);

  // FIX (Oct 26, 2025): Final check at end of updateResourceEconomy
  if (!isFinite(resources.co2.annualEmissions)) {
    console.error(`❌ annualEmissions corrupted at END of updateResourceEconomy (month ${state.currentMonth})`);
    console.error(`   Value: ${resources.co2.annualEmissions}`);
    throw new Error(`❌ annualEmissions NaN at end of updateResourceEconomy`);
  }
}

// ============================================================================
// FOSSIL FUEL DEPLETION
// ============================================================================

function updateFossilFuelDepletion(state: GameState, resources: ResourceEconomy): void {
  // Base depletion scales with economic stage
  // FIX (Oct 25, 2025): Replaced defensive fallback with assertion
  const economicStage = assertEconomicStage(state, 'resourceDepletion');
  const economicMultiplier = 0.5 + economicStage * 0.5; // 1.0x at stage 1, 2.5x at stage 3
  
  // Update each fossil fuel
  updateFossilFuel(resources.oil, economicMultiplier, resources);
  updateFossilFuel(resources.coal, economicMultiplier, resources);
  updateFossilFuel(resources.naturalGas, economicMultiplier, resources);
  
  // Oil spills (random events)
  if (resources.oil.reserves > 0 && deterministicRandom() < resources.oil.spillRisk) {
    resources.oil.spillSeverity = deterministicRandom() * 0.3 + 0.1; // 10-40% severity
    resources.ocean.pollutionLoad += resources.oil.spillSeverity * 0.05;
    
    addEvent(state, {
      type: 'crisis',
      severity: 'warning',
      agent: 'environmental',
      title: '🛢️ Oil Spill',
      description: `Major oil spill occurred. ${(resources.oil.spillSeverity * 100).toFixed(0)}% severity. Ocean pollution increasing.`,
      effects: { ocean_pollution: resources.oil.spillSeverity }
    });
  }
}

function updateFossilFuel(
  fuel: FossilFuelResource,
  economicMultiplier: number,
  resources: ResourceEconomy
): void {
  // Validate inputs
  assertFinite(fuel.reserves, {
    location: 'updateFossilFuel',
    valueName: 'fuel.reserves',
    additionalInfo: { economicMultiplier }
  });
  assertFinite(economicMultiplier, {
    location: 'updateFossilFuel',
    valueName: 'economicMultiplier'
  });

  if (fuel.reserves <= 0) {
    fuel.monthlyExtraction = 0;
    fuel.monthlyConsumption = 0;
    return;
  }

  // Extraction scales with depletion rate, economic activity, and substitution
  assertFinite(fuel.substitutionLevel, {
    location: 'updateFossilFuel',
    valueName: 'fuel.substitutionLevel'
  });
  assertFinite(fuel.depletionRate, {
    location: 'updateFossilFuel',
    valueName: 'fuel.depletionRate'
  });

  const substitutionFactor = 1 - fuel.substitutionLevel * 0.8; // Up to 80% reduction
  fuel.monthlyExtraction = assertFinite(
    fuel.depletionRate * economicMultiplier * substitutionFactor,
    {
      location: 'updateFossilFuel',
      valueName: 'monthlyExtraction',
      additionalInfo: { depletionRate: fuel.depletionRate, economicMultiplier, substitutionFactor }
    }
  );

  // FIX #18 (Oct 22, 2025): Consumption responds to renewable energy deployment
  // Research: IEA World Energy Outlook 2024, IPCC AR6 WG3 (2022)
  // - Clean energy substitution reduces fossil fuel demand independently of extraction
  // - Peak fossil fuel demand: 2025 (oil/coal), 2030 (gas) - IEA Net Zero Scenario
  // - At 50% renewable penetration, fossil consumption drops ~60-70% (not 50%)
  // - At 80% renewable, fossil consumption drops ~90-95% (grid optimization + storage)

  const renewablePercentage = assertFinite(resources.energy.renewablePercentage, {
    location: 'updateFossilFuel',
    valueName: 'renewablePercentage'
  });

  // Consumption reduction from renewable substitution
  // Accelerates faster than linear: grid optimization, storage, efficiency gains
  // Formula: consumptionReduction = renewablePercentage ^ 0.9 (slightly sublinear)
  // At 0% renewable → 0% reduction
  // At 50% renewable → 46% reduction
  // At 80% renewable → 76% reduction
  // At 100% renewable → 100% reduction (but capped at 95% for baseline demand)
  const consumptionReduction = Math.min(0.95, Math.pow(renewablePercentage, 0.9));

  fuel.monthlyConsumption = assertFinite(
    fuel.monthlyExtraction * (1 - consumptionReduction),
    {
      location: 'updateFossilFuel',
      valueName: 'monthlyConsumption',
      additionalInfo: { monthlyExtraction: fuel.monthlyExtraction, consumptionReduction }
    }
  );

  // Deplete reserves
  fuel.reserves = Math.max(0, fuel.reserves - fuel.monthlyExtraction);

  // Extraction cost increases as reserves deplete (harder to extract)
  assertFinite(fuel.initialReserves, {
    location: 'updateFossilFuel',
    valueName: 'fuel.initialReserves'
  });
  assertFinite(fuel.extractionCost, {
    location: 'updateFossilFuel',
    valueName: 'fuel.extractionCost (before update)'
  });

  const depletionFactor = assertFinite(
    fuel.reserves / Math.max(0.001, fuel.initialReserves), // Prevent division by zero
    {
      location: 'updateFossilFuel',
      valueName: 'depletionFactor',
      additionalInfo: { reserves: fuel.reserves, initialReserves: fuel.initialReserves }
    }
  );

  fuel.extractionCost = assertFinite(
    fuel.extractionCost * (1 + (1 - depletionFactor) * 0.05),
    {
      location: 'updateFossilFuel',
      valueName: 'extractionCost (after update)',
      additionalInfo: { oldCost: fuel.extractionCost, depletionFactor }
    }
  );

  // Market price follows supply/demand
  assertFinite(fuel.marketPrice, {
    location: 'updateFossilFuel',
    valueName: 'fuel.marketPrice (before update)'
  });

  if (fuel.reserves < 0.3) {
    fuel.marketPrice = assertFinite(
      fuel.marketPrice * 1.02,
      {
        location: 'updateFossilFuel',
        valueName: 'marketPrice (after increase)',
        additionalInfo: { oldPrice: fuel.marketPrice }
      }
    );
  }
}

// ============================================================================
// METAL DEPLETION & RECYCLING
// ============================================================================

function updateMetalDepletion(state: GameState, resources: ResourceEconomy): void {
  // FIX (Oct 25, 2025): Replaced defensive fallback with assertion
  const economicStage = assertEconomicStage(state, 'resourceDepletion');
  const economicMultiplier = 0.5 + economicStage * 0.5;
  
  // Update each metal
  updateMetal(resources.iron, economicMultiplier, resources);
  updateMetal(resources.copper, economicMultiplier, resources);
  updateMetal(resources.rareEarths, economicMultiplier, resources);
  updateMetal(resources.lithium, economicMultiplier, resources);
  
  // Special: Copper and Rare Earths demand increases with clean energy transition
  const renewablePercentage = assertFinite(resources.energy.renewablePercentage, {
    location: 'updateMetalDepletion',
    valueName: 'renewablePercentage'
  });

  if (renewablePercentage > 0.3) {
    // Clean energy needs 3x more copper, 5x more rare earths
    const cleanEnergyDemand = (renewablePercentage - 0.3) * 2; // Peaks at +1.4x at 100% renewable

    assertFinite(resources.copper.monthlyExtraction, {
      location: 'updateMetalDepletion',
      valueName: 'copper.monthlyExtraction (before clean energy boost)'
    });
    resources.copper.monthlyExtraction = assertFinite(
      resources.copper.monthlyExtraction * (1 + cleanEnergyDemand),
      {
        location: 'updateMetalDepletion',
        valueName: 'copper.monthlyExtraction (after clean energy boost)',
        additionalInfo: { cleanEnergyDemand }
      }
    );

    assertFinite(resources.rareEarths.monthlyExtraction, {
      location: 'updateMetalDepletion',
      valueName: 'rareEarths.monthlyExtraction (before clean energy boost)'
    });
    resources.rareEarths.monthlyExtraction = assertFinite(
      resources.rareEarths.monthlyExtraction * (1 + cleanEnergyDemand * 1.5),
      {
        location: 'updateMetalDepletion',
        valueName: 'rareEarths.monthlyExtraction (after clean energy boost)',
        additionalInfo: { cleanEnergyDemand }
      }
    );
  }

  // Special: Lithium demand increases with EVs
  const oilSubstitution = assertFinite(resources.oil.substitutionLevel, {
    location: 'updateMetalDepletion',
    valueName: 'oil.substitutionLevel'
  });

  if (oilSubstitution > 0.1) {
    // EVs need massive lithium
    const evDemand = oilSubstitution * 5; // 5x multiplier

    assertFinite(resources.lithium.monthlyExtraction, {
      location: 'updateMetalDepletion',
      valueName: 'lithium.monthlyExtraction (before EV boost)'
    });
    resources.lithium.monthlyExtraction = assertFinite(
      resources.lithium.monthlyExtraction * (1 + evDemand),
      {
        location: 'updateMetalDepletion',
        valueName: 'lithium.monthlyExtraction (after EV boost)',
        additionalInfo: { evDemand }
      }
    );
  }
}

function updateMetal(
  metal: MetalResource,
  economicMultiplier: number,
  resources: ResourceEconomy
): void {
  // Validate inputs
  assertFinite(metal.reserves, {
    location: 'updateMetal',
    valueName: 'metal.reserves'
  });
  assertFinite(economicMultiplier, {
    location: 'updateMetal',
    valueName: 'economicMultiplier'
  });

  // Virgin extraction
  if (metal.reserves > 0) {
    assertFinite(metal.depletionRate, {
      location: 'updateMetal',
      valueName: 'metal.depletionRate'
    });

    metal.monthlyExtraction = assertFinite(
      metal.depletionRate * economicMultiplier,
      {
        location: 'updateMetal',
        valueName: 'monthlyExtraction',
        additionalInfo: { depletionRate: metal.depletionRate, economicMultiplier }
      }
    );

    metal.reserves = Math.max(0, metal.reserves - metal.monthlyExtraction);

    // Extraction cost increases as depletes
    assertFinite(metal.initialReserves, {
      location: 'updateMetal',
      valueName: 'metal.initialReserves'
    });
    assertFinite(metal.extractionCost, {
      location: 'updateMetal',
      valueName: 'metal.extractionCost (before update)'
    });

    const depletionFactor = assertFinite(
      metal.reserves / Math.max(0.001, metal.initialReserves), // Prevent division by zero
      {
        location: 'updateMetal',
        valueName: 'depletionFactor',
        additionalInfo: { reserves: metal.reserves, initialReserves: metal.initialReserves }
      }
    );

    metal.extractionCost = assertFinite(
      metal.extractionCost * (1 + (1 - depletionFactor) * 0.03),
      {
        location: 'updateMetal',
        valueName: 'extractionCost (after update)',
        additionalInfo: { oldCost: metal.extractionCost, depletionFactor }
      }
    );
  } else {
    metal.monthlyExtraction = 0;
  }

  // Recycling (from circular economy tech)
  const circularEconomy = assertFinite(resources.circularityIndex, {
    location: 'updateMetal',
    valueName: 'circularityIndex'
  });

  assertFinite(metal.monthlyConsumption, {
    location: 'updateMetal',
    valueName: 'metal.monthlyConsumption (before recycling calc)'
  });
  assertFinite(metal.recyclingRate, {
    location: 'updateMetal',
    valueName: 'metal.recyclingRate'
  });

  metal.monthlyRecycling = assertFinite(
    metal.monthlyConsumption * metal.recyclingRate * circularEconomy,
    {
      location: 'updateMetal',
      valueName: 'monthlyRecycling',
      additionalInfo: { monthlyConsumption: metal.monthlyConsumption, recyclingRate: metal.recyclingRate, circularEconomy }
    }
  );

  assertFinite(metal.recycledStock, {
    location: 'updateMetal',
    valueName: 'metal.recycledStock (before update)'
  });
  assertFinite(metal.recyclingEfficiency, {
    location: 'updateMetal',
    valueName: 'metal.recyclingEfficiency'
  });

  metal.recycledStock = Math.min(1.0, metal.recycledStock + metal.monthlyRecycling * metal.recyclingEfficiency);

  // Total consumption (virgin + recycled)
  const recycledContribution = assertFinite(
    metal.recycledStock * metal.recyclingRate,
    {
      location: 'updateMetal',
      valueName: 'recycledContribution',
      additionalInfo: { recycledStock: metal.recycledStock, recyclingRate: metal.recyclingRate }
    }
  );

  metal.monthlyConsumption = assertFinite(
    metal.monthlyExtraction + recycledContribution,
    {
      location: 'updateMetal',
      valueName: 'monthlyConsumption (after recycling)',
      additionalInfo: { monthlyExtraction: metal.monthlyExtraction, recycledContribution }
    }
  );

  // Use up recycled stock
  metal.recycledStock = Math.max(0, metal.recycledStock - recycledContribution);

  // Criticality increases as reserves deplete
  if (metal.reserves < 0.4) {
    assertFinite(metal.criticality, {
      location: 'updateMetal',
      valueName: 'metal.criticality (before update)'
    });
    metal.criticality = Math.min(1.0, metal.criticality + 0.01);
  }
}

// ============================================================================
// RENEWABLE RESOURCES
// ============================================================================

function updateRenewableRegeneration(state: GameState, resources: ResourceEconomy): void {
  updateRenewable(resources.food, state, resources);
  updateRenewable(resources.water, state, resources);
  updateRenewable(resources.timber, state, resources);

  // Food-specific: Pollinators and soil health
  const food = resources.food;
  const biodiversity = assertStateProperty(
    state.environmentalAccumulation,
    'biodiversityIndex',
    { location: 'updateRenewableRegeneration', month: state.currentMonth }
  );

  // Pollinators decline with biodiversity and pesticides
  food.pollinatorPopulation = Math.max(0.1, biodiversity * 0.9); // Track biodiversity closely

  // Soil health degrades with monoculture, improves with sustainable ag
  assertFinite(food.overharvest, {
    location: 'updateRenewableRegeneration',
    valueName: 'food.overharvest'
  });
  assertFinite(food.soilHealth, {
    location: 'updateRenewableRegeneration',
    valueName: 'food.soilHealth (before degradation)'
  });

  const soilDegradation = food.overharvest * 0.02; // Overharvest damages soil
  food.soilHealth = Math.max(0.3, food.soilHealth - soilDegradation);

  // Climate stress from temperature
  const tempAnomaly = assertFinite(resources.co2.temperatureAnomaly, {
    location: 'updateRenewableRegeneration',
    valueName: 'temperatureAnomaly'
  });

  food.climateStress = Math.min(1.0, tempAnomaly / 4.0); // Maxes at +4°C
  food.waterAvailability = Math.max(0.3, 1.0 - food.climateStress * 0.5); // Droughts

  // TIER 2 HIGH (Nov 15, 2025): Nitrogen-food coupling
  // Research: research/nitrogen_food_coupling_20251115.md (29 sources, Grade B)
  // Apply yield penalties from nitrogen reduction (if technologies reduce fertilizer use)
  let nitrogenAvailability = 1.0;  // Default: no penalty

  if (state.planetaryBoundariesSystem?.regionalNitrogenManagement && state.techTreeState) {
    // Calculate nitrogen reduction from deployed technologies
    const { calculateTechnologyNitrogenReduction, calculateNitrogenYieldPenalty } = require('./nitrogenFoodCoupling');

    // Get deployed nitrogen-reducing technologies from global deployment
    const globalDeployments = state.techTreeState.regionalDeployment['global'] || [];
    const nitrogenTechs = [
      'food_waste_reduction',
      'rhizosphere_engineering',
      'phytoremediation_networks',
      'alternative_protein_insects_algae',
      'nitroplast_integration'
    ];

    // HIGH PERFORMANCE FIX (Nov 20, 2025): Use O(1) lookup instead of O(n) find()
    // Extract effectiveness values for nitrogen-reducing technologies
    const { getTechDeployment } = require('./techTree/engine');
    const techEffectiveness = nitrogenTechs.map(techId => {
      return getTechDeployment(state.techTreeState, techId);
    });

    // Calculate global nitrogen reduction
    const nitrogenReduction = calculateTechnologyNitrogenReduction(techEffectiveness);

    // Calculate yield penalty (uses regional differentiation internally)
    const yieldPenalty = calculateNitrogenYieldPenalty(nitrogenReduction, 'global');

    // Nitrogen availability = 1 - penalty (so penalty of 0.2 → availability 0.8)
    nitrogenAvailability = assertProbability(1.0 - yieldPenalty, {
      location: 'updateRenewableRegeneration.nitrogenCoupling',
      valueName: 'nitrogenAvailability',
      additionalInfo: { nitrogenReduction, yieldPenalty }
    });
  }

  // Regeneration multiplier reduced by stress and nitrogen constraints
  food.regenerationMultiplier = assertFinite(
    food.soilHealth * food.pollinatorPopulation * (1 - food.climateStress * 0.5) * nitrogenAvailability,
    {
      location: 'updateRenewableRegeneration',
      valueName: 'food.regenerationMultiplier',
      additionalInfo: {
        soilHealth: food.soilHealth,
        pollinatorPopulation: food.pollinatorPopulation,
        climateStress: food.climateStress,
        nitrogenAvailability
      }
    }
  );

  // Water-specific: Aquifer depletion and climate
  const water = resources.water;
  assertFinite(water.overharvest, {
    location: 'updateRenewableRegeneration',
    valueName: 'water.overharvest'
  });
  assertFinite(water.aquiferLevels, {
    location: 'updateRenewableRegeneration',
    valueName: 'water.aquiferLevels (before depletion)'
  });

  if (water.overharvest > 0) {
    water.aquiferLevels = Math.max(0.1, water.aquiferLevels - water.overharvest * 0.5);
  }

  water.regenerationMultiplier = assertFinite(
    Math.max(0.5, 1.0 - resources.co2.temperatureAnomaly * 0.15),
    {
      location: 'updateRenewableRegeneration',
      valueName: 'water.regenerationMultiplier',
      additionalInfo: { temperatureAnomaly: resources.co2.temperatureAnomaly }
    }
  );

  // Timber-specific: Old growth doesn't regenerate
  const timber = resources.timber;
  assertFinite(timber.monthlyHarvest, {
    location: 'updateRenewableRegeneration',
    valueName: 'timber.monthlyHarvest'
  });
  assertFinite(timber.sustainableHarvestRate, {
    location: 'updateRenewableRegeneration',
    valueName: 'timber.sustainableHarvestRate'
  });
  assertFinite(timber.oldGrowthRemaining, {
    location: 'updateRenewableRegeneration',
    valueName: 'timber.oldGrowthRemaining (before depletion)'
  });

  if (timber.monthlyHarvest > timber.sustainableHarvestRate) {
    timber.oldGrowthRemaining = Math.max(0, timber.oldGrowthRemaining - 0.005);
  }
}

function updateRenewable(
  resource: FoodResource | WaterResource | TimberResource,
  state: GameState,
  resources: ResourceEconomy
): void {
  // Validate inputs
  assertFinite(resource.monthlyRegeneration, {
    location: 'updateRenewable',
    valueName: 'monthlyRegeneration'
  });
  assertFinite(resource.regenerationMultiplier, {
    location: 'updateRenewable',
    valueName: 'regenerationMultiplier'
  });
  assertFinite(resource.reserves, {
    location: 'updateRenewable',
    valueName: 'reserves (before regeneration)'
  });
  assertFinite(resource.capacity, {
    location: 'updateRenewable',
    valueName: 'capacity'
  });

  // Regeneration
  const regen = assertFinite(
    resource.monthlyRegeneration * resource.regenerationMultiplier,
    {
      location: 'updateRenewable',
      valueName: 'regen',
      additionalInfo: { monthlyRegeneration: resource.monthlyRegeneration, regenerationMultiplier: resource.regenerationMultiplier }
    }
  );

  // CRITICAL-1 FIX (Nov 26, 2025): Add floor at 0 to prevent negative reserves
  // Conservation law: reserves cannot be negative (you can't harvest what doesn't exist)
  // Bug: Line 634 uses Math.max(0, ...) but if reserves somehow become negative before
  // regeneration runs, Math.min(capacity, reserves + regen) doesn't fix it.
  const newReserves = resource.reserves + regen;
  const clampedReserves = Math.max(0, Math.min(resource.capacity, newReserves));

  resource.reserves = clampedReserves;

  // Harvesting (scales with economic stage)
  // FIX (Oct 25, 2025): Replaced defensive fallback with assertion
  const economicStage = assertEconomicStage(state, 'resourceDepletion');
  const economicMultiplier = 0.8 + economicStage * 0.2; // 1.0x to 1.4x

  assertFinite(resource.sustainableHarvestRate, {
    location: 'updateRenewable',
    valueName: 'sustainableHarvestRate'
  });

  resource.monthlyHarvest = assertFinite(
    resource.sustainableHarvestRate * economicMultiplier,
    {
      location: 'updateRenewable',
      valueName: 'monthlyHarvest',
      additionalInfo: { sustainableHarvestRate: resource.sustainableHarvestRate, economicMultiplier }
    }
  );

  // Consume
  const reservesAfterHarvest = resource.reserves - resource.monthlyHarvest;
  resource.reserves = Math.max(0, reservesAfterHarvest);

  // CRITICAL-1: Early warning for low reserves (before they hit 0)
  if (resource.reserves < 0.10 && state.currentMonth % 12 === 0) {
    const resourceType = (resource as any).type || 'unknown';
    console.log(`⚠️ LOW RESOURCE RESERVES: ${resourceType} at ${(resource.reserves * 100).toFixed(1)}%`);
    console.log(`   Monthly harvest: ${resource.monthlyHarvest.toFixed(4)}`);
    console.log(`   Sustainable rate: ${resource.sustainableHarvestRate.toFixed(4)}`);
    console.log(`   Monthly regen: ${regen.toFixed(4)}`);
    console.log(`   Net depletion: ${(resource.monthlyHarvest - regen).toFixed(4)}/month`);

    if (reservesAfterHarvest < 0) {
      console.log(`   🚨 CONSERVATION LAW VIOLATION: Harvest (${resource.monthlyHarvest.toFixed(4)}) exceeded reserves (${(resource.reserves + resource.monthlyHarvest).toFixed(4)})`);
      console.log(`      Clamped to 0. This indicates unsustainable resource extraction.`);
    }
  }

  // Overharvest if consumption exceeds regeneration
  resource.overharvest = Math.max(0, resource.monthlyHarvest - regen);

  // Sustainability index
  if (regen > 0) {
    resource.sustainabilityIndex = assertFinite(
      Math.min(1.0, resource.monthlyHarvest / regen),
      {
        location: 'updateRenewable',
        valueName: 'sustainabilityIndex',
        additionalInfo: { monthlyHarvest: resource.monthlyHarvest, regen }
      }
    );
  } else {
    resource.sustainabilityIndex = 0; // Collapse
  }

  // Capacity degrades with persistent overharvest
  assertFinite(resource.capacity, {
    location: 'updateRenewable',
    valueName: 'capacity (before degradation)'
  });

  if (resource.overharvest > resource.sustainableHarvestRate * 0.2) {
    resource.capacity = Math.max(0.5, resource.capacity - 0.002); // 0.2% per month
  }
}

// ============================================================================
// ENERGY SYSTEM
// ============================================================================

function updateEnergySystem(state: GameState, resources: ResourceEconomy): void {
  const energy = resources.energy;
  
  // Demand scales with economic stage
  // FIX (Oct 25, 2025): Replaced defensive fallback with assertion
  const economicStage = assertEconomicStage(state, 'resourceDepletion');
  energy.totalDemand = 95 + economicStage * 10; // 95 → 125 units
  
  // Production from each source (limited by capacity and fuel availability)
  // FIX (Oct 26, 2025): Assert finite values to catch NaN propagation
  energy.sources.oil = assertFinite(
    Math.min(energy.capacity.oil, energy.sources.oil),
    { location: 'updateEnergySystem[oil capping]', valueName: 'energy.sources.oil', month: state.currentMonth }
  );
  energy.sources.coal = assertFinite(
    Math.min(energy.capacity.coal, energy.sources.coal),
    { location: 'updateEnergySystem[coal capping]', valueName: 'energy.sources.coal', month: state.currentMonth }
  );
  energy.sources.naturalGas = assertFinite(
    Math.min(energy.capacity.naturalGas, energy.sources.naturalGas),
    { location: 'updateEnergySystem[gas capping]', valueName: 'energy.sources.naturalGas', month: state.currentMonth }
  );

  // Fossil sources decline as fuels deplete
  if (resources.oil.reserves < 0.1) energy.sources.oil *= 0.9; // 10% reduction per month when nearly depleted
  if (resources.coal.reserves < 0.1) energy.sources.coal *= 0.9;
  if (resources.naturalGas.reserves < 0.1) energy.sources.naturalGas *= 0.9;
  
  // Renewables grow with clean energy tech (handled in tech deployment)
  // Fusion unlocks when tech deployed (handled in tech deployment)
  
  // Total production
  // Validate all sources before summing
  assertFinite(energy.sources.nuclear, {
    location: 'updateEnergySystem',
    valueName: 'energy.sources.nuclear'
  });
  assertFinite(energy.sources.solar, {
    location: 'updateEnergySystem',
    valueName: 'energy.sources.solar'
  });
  assertFinite(energy.sources.wind, {
    location: 'updateEnergySystem',
    valueName: 'energy.sources.wind'
  });
  assertFinite(energy.sources.hydro, {
    location: 'updateEnergySystem',
    valueName: 'energy.sources.hydro'
  });
  assertFinite(energy.sources.fusion, {
    location: 'updateEnergySystem',
    valueName: 'energy.sources.fusion'
  });

  energy.totalProduction = assertFinite(
    energy.sources.oil +
    energy.sources.coal +
    energy.sources.naturalGas +
    energy.sources.nuclear +
    energy.sources.solar +
    energy.sources.wind +
    energy.sources.hydro +
    energy.sources.fusion,
    {
      location: 'updateEnergySystem',
      valueName: 'totalProduction',
      additionalInfo: {
        oil: energy.sources.oil,
        coal: energy.sources.coal,
        gas: energy.sources.naturalGas,
        nuclear: energy.sources.nuclear,
        solar: energy.sources.solar,
        wind: energy.sources.wind,
        hydro: energy.sources.hydro,
        fusion: energy.sources.fusion
      }
    }
  );

  // Surplus/deficit
  assertFinite(energy.totalDemand, {
    location: 'updateEnergySystem',
    valueName: 'totalDemand'
  });

  energy.surplus = assertFinite(
    energy.totalProduction - energy.totalDemand,
    {
      location: 'updateEnergySystem',
      valueName: 'surplus',
      additionalInfo: { totalProduction: energy.totalProduction, totalDemand: energy.totalDemand }
    }
  );

  // Renewable percentage
  energy.renewablePercentage = assertFinite(
    (
      energy.sources.solar +
      energy.sources.wind +
      energy.sources.hydro +
      energy.sources.fusion
    ) / Math.max(1, energy.totalProduction),
    {
      location: 'updateEnergySystem',
      valueName: 'renewablePercentage',
      additionalInfo: {
        solar: energy.sources.solar,
        wind: energy.sources.wind,
        hydro: energy.sources.hydro,
        fusion: energy.sources.fusion,
        totalProduction: energy.totalProduction
      }
    }
  );

  // Carbon intensity (kg CO2 per unit energy)
  const fossilProduction = energy.sources.oil + energy.sources.coal + energy.sources.naturalGas;

  assertFinite(resources.oil.co2PerUnit, {
    location: 'updateEnergySystem',
    valueName: 'oil.co2PerUnit'
  });
  assertFinite(resources.coal.co2PerUnit, {
    location: 'updateEnergySystem',
    valueName: 'coal.co2PerUnit'
  });
  assertFinite(resources.naturalGas.co2PerUnit, {
    location: 'updateEnergySystem',
    valueName: 'naturalGas.co2PerUnit'
  });

  const fossilCO2 = assertFinite(
    energy.sources.oil * resources.oil.co2PerUnit * 0.1 +
    energy.sources.coal * resources.coal.co2PerUnit * 0.1 +
    energy.sources.naturalGas * resources.naturalGas.co2PerUnit * 0.1,
    {
      location: 'updateEnergySystem',
      valueName: 'fossilCO2',
      additionalInfo: {
        oil: energy.sources.oil,
        coal: energy.sources.coal,
        gas: energy.sources.naturalGas,
        oilCO2: resources.oil.co2PerUnit,
        coalCO2: resources.coal.co2PerUnit,
        gasCO2: resources.naturalGas.co2PerUnit
      }
    }
  );

  energy.carbonIntensity = assertFinite(
    fossilCO2 / Math.max(1, energy.totalProduction),
    {
      location: 'updateEnergySystem',
      valueName: 'carbonIntensity',
      additionalInfo: { fossilCO2, totalProduction: energy.totalProduction }
    }
  );
}

// ============================================================================
// HISTORICAL EMISSIONS FORCING MODE (Nov 26, 2025)
// ============================================================================

/**
 * Global Carbon Project emissions data (1990-2010)
 *
 * Research: research/climate_hindcast_data_20251126.md
 * Source: Global Carbon Project via Our World in Data
 * Units: GtCO2/year (gigatonnes CO2 per year, fossil fuel + cement production)
 *
 * Used for hindcast validation when config.historicalEmissionsMode = true.
 * Bypasses endogenous emissions calculation to test carbon sink mechanics independently.
 *
 * Root cause: Endogenous model generates 18% excess CO2 (17.53% deviation in Phase 4 validation).
 * Temperature trajectory PASSED (validates climate sensitivity + sinks), so only emissions need override.
 */
const HISTORICAL_EMISSIONS_GCP: Record<number, number> = {
  1990: 22.7,  // UNFCCC baseline year
  1991: 22.8,  // Linear interpolation estimate
  1992: 22.9,
  1993: 23.0,
  1994: 23.2,
  1995: 23.5,  // Slow growth decade
  1996: 23.8,
  1997: 24.1,
  1998: 24.4,
  1999: 24.7,
  2000: 25.5,  // Pre-China acceleration
  2001: 25.9,
  2002: 26.3,
  2003: 26.7,
  2004: 27.5,
  2005: 29.0,  // Rapid growth phase
  2006: 30.0,
  2007: 31.0,
  2008: 31.8,
  2009: 32.0,  // Post-recession
  2010: 33.5,  // Post-recession surge (+5.9% single-year growth)
};

/**
 * Get historical emissions for a given year with monthly interpolation
 *
 * @param year - Calendar year (1990-2010)
 * @param month - Month of year (0-11)
 * @returns Annual emissions in GtCO2/year
 * @throws Error if year is outside historical range (1990-2010)
 */
function getHistoricalEmissions(year: number, month: number): number {
  // Fail loudly if out of range (no silent fallbacks in research simulation)
  if (year < 1990 || year > 2010) {
    throw new Error(
      `❌ HISTORICAL EMISSIONS MODE: Year ${year} outside valid range (1990-2010). ` +
      `This mode is ONLY for hindcast validation. Use endogenous emissions for other periods.`
    );
  }

  // Get annual values for current and next year
  const currentYearEmissions = HISTORICAL_EMISSIONS_GCP[year];
  const nextYearEmissions = HISTORICAL_EMISSIONS_GCP[year + 1];

  if (currentYearEmissions === undefined) {
    throw new Error(`❌ HISTORICAL EMISSIONS MODE: No data for year ${year}`);
  }

  // Linear interpolation for monthly resolution
  // If next year doesn't exist (year 2010), use current year value
  if (nextYearEmissions === undefined) {
    return currentYearEmissions;
  }

  const monthFraction = month / 12;
  const interpolated = currentYearEmissions + (nextYearEmissions - currentYearEmissions) * monthFraction;

  return assertFinite(interpolated, {
    location: 'getHistoricalEmissions',
    valueName: 'interpolatedEmissions',
    additionalInfo: { year, month, currentYearEmissions, nextYearEmissions }
  });
}

// ============================================================================
// CO2 & CLIMATE SYSTEM
// ============================================================================

function updateCO2System(state: GameState, resources: ResourceEconomy): void {
  const co2 = resources.co2;
  const energy = resources.energy;

  // FIX (Oct 26, 2025): Check if annualEmissions is already NaN on entry
  if (!isFinite(co2.annualEmissions)) {
    console.error(`❌ annualEmissions is NaN at START of updateCO2System (month ${state.currentMonth})`);
    console.error(`   This means it was corrupted by a previous phase`);
    console.error(`   Current value: ${co2.annualEmissions}`);
    throw new Error(`❌ annualEmissions corrupted by previous phase - initialization or phase bug`);
  }

  // === EMISSIONS FROM FOSSIL FUEL USE ===

  // HISTORICAL EMISSIONS FORCING MODE (Nov 26, 2025): Phase 5 of Climate Mini-Hindcast Validation
  // When enabled, bypass endogenous emissions calculation and use empirical Global Carbon Project data.
  // This isolates carbon sink mechanics for testing (temperature trajectory PASSED, but emissions deviated 17.53%).
  //
  // HYBRID HINDCAST MODE (Nov 27, 2025): Extended to support full 1990-2024 validation.
  // Uses empirical GCP data (1990-2010) and switches to endogenous model (2011+).
  let monthlyEmissions: number;
  let calculatedAnnual: number;

  // Calculate current year for mode switching logic
  const startYear = state.config?.startYear ?? 2025;
  const currentYear = startYear + Math.floor(state.currentMonth / 12);
  const monthOfYear = state.currentMonth % 12;

  // Determine if we should use historical emissions (only for 1990-2010 when mode is enabled)
  const useHistoricalEmissions = state.config?.historicalEmissionsMode === true &&
                                  currentYear >= 1990 &&
                                  currentYear <= 2010;

  if (useHistoricalEmissions) {
    // HISTORICAL EMISSIONS MODE: Use Global Carbon Project empirical data (1990-2010)
    calculatedAnnual = getHistoricalEmissions(currentYear, monthOfYear);

    // Convert to monthly (assume uniform distribution across year)
    monthlyEmissions = assertFinite(
      calculatedAnnual / 12,
      {
        location: 'updateCO2System (historical emissions mode)',
        valueName: 'monthlyEmissions',
        month: state.currentMonth,
        additionalInfo: { year: currentYear, monthOfYear, annualEmissions: calculatedAnnual }
      }
    );

    // Log annually for monitoring
    if (state.currentMonth % 12 === 0) {
      console.log(
        `  📊 [Historical Emissions Mode] Year ${currentYear}: ${calculatedAnnual.toFixed(2)} GtCO2/yr ` +
        `(${monthlyEmissions.toFixed(3)} GtCO2/mo) - Global Carbon Project data`
      );
    }
  } else {
    // ENDOGENOUS EMISSIONS MODE: Calculate from economic model
    // Used for: (1) standard future projections, (2) hindcast years outside GCP data range (2011-2024)

    // Log mode switch for hindcast validation (only when transitioning out of historical data)
    if (state.config?.historicalEmissionsMode === true && state.currentMonth % 12 === 0) {
      console.log(
        `  📊 [Endogenous Emissions] Year ${currentYear}: Using economic model ` +
        `(GCP data only available 1990-2010)`
      );
    }
    // Standard mode: Calculate emissions from endogenous economic model
    // Scale: 1 unit of monthly extraction ≈ 1% of global reserves ≈ 3 Gt CO2
    // FIX (Oct 26, 2025): Assert inputs are finite before calculation
    if (!isFinite(resources.oil.monthlyConsumption) || !isFinite(resources.oil.co2PerUnit)) {
      throw new Error(`❌ Oil inputs not finite: consumption=${resources.oil.monthlyConsumption}, co2PerUnit=${resources.oil.co2PerUnit} (month ${state.currentMonth})`);
    }
    if (!isFinite(resources.coal.monthlyConsumption) || !isFinite(resources.coal.co2PerUnit)) {
      throw new Error(`❌ Coal inputs not finite: consumption=${resources.coal.monthlyConsumption}, co2PerUnit=${resources.coal.co2PerUnit} (month ${state.currentMonth})`);
    }
    if (!isFinite(resources.naturalGas.monthlyConsumption) || !isFinite(resources.naturalGas.co2PerUnit)) {
      throw new Error(`❌ Gas inputs not finite: consumption=${resources.naturalGas.monthlyConsumption}, co2PerUnit=${resources.naturalGas.co2PerUnit} (month ${state.currentMonth})`);
    }

    const oilEmissions = resources.oil.monthlyConsumption * resources.oil.co2PerUnit * 3.0;
    const coalEmissions = resources.coal.monthlyConsumption * resources.coal.co2PerUnit * 3.0;
    const gasEmissions = resources.naturalGas.monthlyConsumption * resources.naturalGas.co2PerUnit * 3.0;

    // Methane leakage (CH4 is 80x worse than CO2 over 20 years)
    if (!isFinite(resources.naturalGas.methaneLeakage)) {
      throw new Error(`❌ Methane leakage not finite: ${resources.naturalGas.methaneLeakage} (month ${state.currentMonth})`);
    }
    const methaneEmissions = resources.naturalGas.monthlyConsumption *
      resources.naturalGas.methaneLeakage * 80;

    // Total monthly emissions (Gt CO2 equivalent)
    monthlyEmissions = oilEmissions + coalEmissions + gasEmissions + methaneEmissions;

    // Calculate annual from monthly
    calculatedAnnual = monthlyEmissions * 12;
  }

  // Catch NaN at source with detailed debugging
  if (!isFinite(monthlyEmissions)) {
    console.error(`❌ NaN detected in CO2 emissions calculation (month ${state.currentMonth}):`);
    if (state.config?.historicalEmissionsMode === true) {
      console.error(`   [Historical Emissions Mode]`);
      console.error(`   monthlyEmissions: ${monthlyEmissions}`);
      console.error(`   annualEmissions: ${calculatedAnnual}`);
    } else {
      console.error(`   [Endogenous Emissions Model]`);
      console.error(`   oil: ${resources.oil.monthlyConsumption} * ${resources.oil.co2PerUnit} * 3.0 = ${resources.oil.monthlyConsumption * resources.oil.co2PerUnit * 3.0}`);
      console.error(`   coal: ${resources.coal.monthlyConsumption} * ${resources.coal.co2PerUnit} * 3.0 = ${resources.coal.monthlyConsumption * resources.coal.co2PerUnit * 3.0}`);
      console.error(`   gas: ${resources.naturalGas.monthlyConsumption} * ${resources.naturalGas.co2PerUnit} * 3.0 = ${resources.naturalGas.monthlyConsumption * resources.naturalGas.co2PerUnit * 3.0}`);
      console.error(`   methane: ${resources.naturalGas.monthlyConsumption} * ${resources.naturalGas.methaneLeakage} * 80 = ${resources.naturalGas.monthlyConsumption * resources.naturalGas.methaneLeakage * 80}`);
      console.error(`   renewablePercentage: ${resources.energy.renewablePercentage}`);
      console.error(`   energy.sources.oil: ${resources.energy.sources.oil}`);
      console.error(`   energy.sources.coal: ${resources.energy.sources.coal}`);
      console.error(`   energy.sources.solar: ${resources.energy.sources.solar}`);
      console.error(`   energy.sources.wind: ${resources.energy.sources.wind}`);
      console.error(`   energy.totalProduction: ${resources.energy.totalProduction}`);
    }
    throw new Error(`❌ Non-finite monthlyEmissions in updateCO2System`);
  }

  // Validate annual emissions (already calculated above in both modes)
  if (!isFinite(calculatedAnnual)) {
    console.error(`❌ Annual emissions calculation produced NaN (month ${state.currentMonth}):`);
    console.error(`   monthlyEmissions: ${monthlyEmissions}`);
    console.error(`   calculatedAnnual: ${calculatedAnnual}`);
    throw new Error(`❌ Annual emissions calculation is NaN`);
  }

  co2.annualEmissions = calculatedAnnual;

  // CALIBRATION DEBUG (Nov 25, 2025): Log emissions for hindcast validation
  if (state.currentMonth % 60 === 0) {
    console.log(`  📊 CO2 Emissions (month ${state.currentMonth}):`);
    console.log(`     Monthly: ${monthlyEmissions.toFixed(2)} Gt CO2/month`);
    console.log(`     Annual: ${calculatedAnnual.toFixed(2)} Gt CO2/year`);
    if (state.config?.historicalEmissionsMode !== true) {
      // Only log breakdown if using endogenous model
      const oilEmissions = resources.oil.monthlyConsumption * resources.oil.co2PerUnit * 3.0;
      const coalEmissions = resources.coal.monthlyConsumption * resources.coal.co2PerUnit * 3.0;
      const gasEmissions = resources.naturalGas.monthlyConsumption * resources.naturalGas.co2PerUnit * 3.0;
      const methaneEmissions = resources.naturalGas.monthlyConsumption * resources.naturalGas.methaneLeakage * 80;
      console.log(`     Oil: ${oilEmissions.toFixed(3)} Gt/mo (${resources.oil.monthlyConsumption.toFixed(4)} * ${resources.oil.co2PerUnit} * 3.0)`);
      console.log(`     Coal: ${coalEmissions.toFixed(3)} Gt/mo (${resources.coal.monthlyConsumption.toFixed(4)} * ${resources.coal.co2PerUnit} * 3.0)`);
      console.log(`     Gas: ${gasEmissions.toFixed(3)} Gt/mo (${resources.naturalGas.monthlyConsumption.toFixed(4)} * ${resources.naturalGas.co2PerUnit} * 3.0)`);
      console.log(`     Methane: ${methaneEmissions.toFixed(3)} Gt CO2eq/mo`);
    } else {
      console.log(`     Source: Historical Global Carbon Project data (1990-2010)`);
    }
  }

  // Verify it stuck
  if (!isFinite(co2.annualEmissions)) {
    console.error(`❌ annualEmissions became NaN AFTER assignment (month ${state.currentMonth}):`);
    console.error(`   calculatedAnnual: ${calculatedAnnual}`);
    console.error(`   co2.annualEmissions: ${co2.annualEmissions}`);
    console.error(`   co2 object: ${JSON.stringify(co2).substring(0, 200)}`);
    throw new Error(`❌ annualEmissions is NaN after valid calculation`);
  }

  // === ATMOSPHERIC CO2 ===

  // Natural sinks absorb some emissions (ocean + land)
  assertFinite(co2.oceanAbsorption, {
    location: 'updateCO2System',
    valueName: 'oceanAbsorption',
    month: state.currentMonth
  });
  assertFinite(co2.landAbsorption, {
    location: 'updateCO2System',
    valueName: 'landAbsorption',
    month: state.currentMonth
  });
  assertFinite(co2.sinkSaturation, {
    location: 'updateCO2System',
    valueName: 'sinkSaturation',
    month: state.currentMonth
  });

  // PHASE 9 (Nov 26, 2025): Temporal evolution of carbon sinks (1990-2010)
  // Research shows sinks GROW over hindcast period:
  // - Ocean: 8.1 → 10.6 GtCO2/yr (+32%)
  // - Land: 5.1 → 11.4 GtCO2/yr (+121%)
  // Source: research/carbon_sinks_1990_2025_20251126.md (Global Carbon Project data)
  if (state.config?.historicalEmissionsMode === true) {
    const startYear = state.config?.startYear ?? 2025;
    const currentYear = startYear + Math.floor(state.currentMonth / 12);

    // Only apply temporal evolution during hindcast period (1990-2010)
    if (currentYear >= 1990 && currentYear <= 2010) {
      const yearsSince1990 = currentYear - 1990;
      const progressFraction = yearsSince1990 / 20.0;  // 0.0 at 1990, 1.0 at 2010

      // Linear interpolation from 1990 to 2010 values
      // FIX (Nov 29, 2025 - Phase 12): Airborne fraction approach (conceptually correct)
      //
      // HISTORY OF THIS FIX:
      // - Phase 10 (Nov 26): Used research sink values (8.1→9.9, 5.1→8.8), produced 437 ppm (12.1% error)
      // - Phase 11 (Nov 27): Empirically boosted sinks (8.1→14.2, 5.1→16.1), still used saturation model
      // - Phase 12 (Nov 29): Switched to airborne fraction model, reverted to research sink values
      //
      // CONCEPTUAL ERROR (Phases 10-11):
      // Model treated sink "saturation" as REDUCED CAPACITY: sinkCapacity = (ocean + land) * (1 - saturation)
      // When saturation = 0.46, sinks operated at only 54% capacity (wrong!)
      //
      // RESEARCH REALITY:
      // Sinks are GROWING absolutely (2.2→2.9 GtC ocean, 1.3→3.1 GtC land per GCP)
      // They're just not keeping pace with emissions growth (6.1→9.1 GtC/yr)
      // Result: Stable airborne fraction ~0.44 (44% of emissions stay in atmosphere)
      //
      // NEW APPROACH (Phase 12):
      // Use airborne fraction model during hindcast: atmospheric_increase = emissions * 0.44
      // This is empirically correct and makes sink values decorative (not used in calculation)
      // For projection mode (post-2010), revert to mechanistic saturation model
      //
      // Research: Global Carbon Project 2024, Friedlingstein et al. 2023
      //          research/carbon_sinks_1990_2025_20251126.md
      const ocean1990 = 8.1;   // GtCO2/yr (2.2 GtC/yr × 3.67) - GCP 1990 baseline
      const ocean2010 = 10.6;  // GtCO2/yr (2.9 GtC/yr × 3.67) - GCP 2010 value
      const land1990 = 4.8;    // GtCO2/yr (1.3 GtC/yr × 3.67) - GCP 1990 baseline
      const land2010 = 11.4;   // GtCO2/yr (3.1 GtC/yr × 3.67) - GCP 2010 value

      co2.oceanAbsorption = assertFinite(
        ocean1990 + (ocean2010 - ocean1990) * progressFraction,
        {
          location: 'updateCO2System (temporal evolution)',
          valueName: 'oceanAbsorption',
          month: state.currentMonth,
          additionalInfo: { year: currentYear, progressFraction }
        }
      );

      co2.landAbsorption = assertFinite(
        land1990 + (land2010 - land1990) * progressFraction,
        {
          location: 'updateCO2System (temporal evolution)',
          valueName: 'landAbsorption',
          month: state.currentMonth,
          additionalInfo: { year: currentYear, progressFraction }
        }
      );

      // During hindcast, disable sink saturation (empirical values are already "effective" sinks)
      co2.sinkSaturation = 0;

      // Log every 5 years for verification (with complete CO2 budget)
      if (state.currentMonth % 60 === 0) {
        // Calculate annual totals for budget analysis
        const totalSink = co2.oceanAbsorption + co2.landAbsorption;
        const annualEmissions = assertFinite(
          state.config?.historicalEmissionsMode === true
            ? getHistoricalEmissions(currentYear, 0)
            : calculatedAnnual,
          {
            location: 'CO2 budget logging',
            valueName: 'annualEmissions',
            month: state.currentMonth
          }
        );
        const netToAtmosphere = assertFinite(
          annualEmissions - totalSink,
          {
            location: 'CO2 budget logging',
            valueName: 'netToAtmosphere',
            month: state.currentMonth,
            additionalInfo: { annualEmissions, totalSink }
          }
        );
        const airborneFraction = assertFinite(
          netToAtmosphere / annualEmissions,
          {
            location: 'CO2 budget logging',
            valueName: 'airborneFraction',
            month: state.currentMonth,
            additionalInfo: { netToAtmosphere, annualEmissions }
          }
        );

        console.log(`  🌍 [Carbon Budget] Year ${currentYear}:`);
        console.log(`     Emissions:  ${annualEmissions.toFixed(2)} GtCO2/yr (GCP data)`);
        console.log(`     Ocean sink: ${co2.oceanAbsorption.toFixed(2)} GtCO2/yr (${ocean1990} → ${ocean2010})`);
        console.log(`     Land sink:  ${co2.landAbsorption.toFixed(2)} GtCO2/yr (${land1990} → ${land2010})`);
        console.log(`     Total sink: ${totalSink.toFixed(2)} GtCO2/yr`);
        console.log(`     Net to atm: ${netToAtmosphere.toFixed(2)} GtCO2/yr`);
        console.log(`     Airborne fraction: ${(airborneFraction * 100).toFixed(1)}% (target: 45%)`);
        console.log(`     Current CO2: ${co2.atmosphericCO2.toFixed(2)} ppm`);
      }
    }
  }

  // === SINK CAPACITY CALCULATION ===
  // Two modes: airborne fraction (hindcast 1990-2010) vs mechanistic saturation (projection 2025+)

  let netEmissions: number;

  if (state.config?.historicalEmissionsMode === true) {
    // HINDCAST MODE (1990-2010): Use empirical airborne fraction approach
    // Research: GCP shows airborne fraction ~0.44 (stable 1990-2010)
    // Emissions grow from 6.1 → 9.1 GtC/yr, sinks grow from 4.8 → 5.8 GtC/yr
    // Ratio stays constant: 44% stays in atmosphere, 56% absorbed by sinks
    //
    // Fix (Nov 29, 2025): Replace sink saturation model with airborne fraction
    // Old approach: sinkCapacity = (ocean + land) * (1 - saturation)
    // Problem: Treated saturation as reduced sink CAPACITY (wrong!)
    // Reality: Sinks GROW absolutely, just not fast enough to keep up with emissions
    //
    // New approach: atmospheric_increase = emissions * airborne_fraction
    // This is empirically correct for 1990-2010 period
    const AIRBORNE_FRACTION_1990_2010 = 0.44;  // GCP empirical value (stable)

    netEmissions = assertFinite(
      monthlyEmissions * AIRBORNE_FRACTION_1990_2010,
      {
        location: 'updateCO2System (airborne fraction mode)',
        valueName: 'netEmissions',
        month: state.currentMonth,
        additionalInfo: {
          monthlyEmissions,
          airborneFraction: AIRBORNE_FRACTION_1990_2010,
          mode: 'hindcast_airborne_fraction'
        }
      }
    );
  } else {
    // PROJECTION MODE (2025+): Use mechanistic sink saturation model
    // Saturation effects become important as sinks approach capacity limits
    const sinkCapacity = assertFinite(
      (co2.oceanAbsorption + co2.landAbsorption) * (1 - co2.sinkSaturation),
      {
        location: 'updateCO2System',
        valueName: 'sinkCapacity',
        month: state.currentMonth,
        additionalInfo: {
          oceanAbsorption: co2.oceanAbsorption,
          landAbsorption: co2.landAbsorption,
          sinkSaturation: co2.sinkSaturation
        }
      }
    );

    netEmissions = assertFinite(
      Math.max(0, monthlyEmissions - sinkCapacity / 12),
      {
        location: 'updateCO2System',
        valueName: 'netEmissions',
        month: state.currentMonth,
        additionalInfo: { monthlyEmissions, sinkCapacity, mode: 'projection_saturation' }
      }
    );
  }

  // Convert to ppm (2.13 GtC = 1 ppm, or 7.82 GtCO2 = 1 ppm)
  // netEmissions is in GtCO2/yr, so use 7.82 conversion factor (not 2.13)
  const ppmIncrease = assertFinite(
    netEmissions / 7.82,
    {
      location: 'updateCO2System',
      valueName: 'ppmIncrease',
      month: state.currentMonth,
      additionalInfo: { netEmissions }
    }
  );

  assertFinite(co2.atmosphericCO2, {
    location: 'updateCO2System',
    valueName: 'atmosphericCO2 (before increase)',
    month: state.currentMonth
  });

  co2.atmosphericCO2 = assertPlanetaryBoundary(
    co2.atmosphericCO2 + ppmIncrease,
    'co2',
    {
      location: 'updateCO2System',
      valueName: 'atmosphericCO2',
      month: state.currentMonth
    }
  );

  // Track cumulative emissions (PERMANENT!)
  assertFinite(co2.cumulativeEmissions, {
    location: 'updateCO2System',
    valueName: 'cumulativeEmissions (before update)',
    month: state.currentMonth
  });

  co2.cumulativeEmissions = assertFinite(
    co2.cumulativeEmissions + monthlyEmissions,
    {
      location: 'updateCO2System',
      valueName: 'cumulativeEmissions (after update)',
      month: state.currentMonth,
      additionalInfo: { oldValue: co2.cumulativeEmissions, monthlyEmissions }
    }
  );
  
  // === SINKS SATURATE ===
  // NOTE: During hindcast mode (1990-2010), use empirical sink evolution instead of mechanistic saturation.
  // Mixing empirical and mechanistic models breaks validation.
  const inHindcastPeriod = state.config?.historicalEmissionsMode === true &&
    state.config.startYear !== undefined &&
    (state.config.startYear + Math.floor(state.currentMonth / 12)) <= 2010;

  if (!inHindcastPeriod) {
    // Ocean absorption decreases with acidification (FUTURE PROJECTION ONLY)
    const ocean = resources.ocean;
    if (ocean.pH < 8.0) {
      const acidificationFactor = (8.0 - ocean.pH) / 0.5; // 0 to 1
      co2.oceanAbsorption = Math.max(5, 10 * (1 - acidificationFactor * 0.5)); // Drops to 5 Gt/year
    }

    // Land absorption decreases with deforestation (FUTURE PROJECTION ONLY)
    const forestLoss = 1 - resources.timber.forestCover;
    co2.landAbsorption = Math.max(5, 11 * (1 - forestLoss * 0.3)); // Drops to 7.7 Gt/year

    // Sinks saturate with cumulative emissions (FUTURE PROJECTION ONLY)
    co2.sinkSaturation = Math.min(0.8, co2.cumulativeEmissions / 1000); // 80% saturated at 1000 Gt
  }
  
  // === TEMPERATURE ===
  //
  // Uses sampled climate sensitivity (ECS) from uncertainty parameters for Monte Carlo variance.
  // IPCC AR6 formula: T = ECS * log2(CO2 / CO2_preindustrial)
  //
  // ECS = Equilibrium Climate Sensitivity: Long-term temperature per CO2 doubling
  //   - Sampled from log-normal distribution at initialization
  //   - IPCC AR6: Best estimate 3.0C, very likely [2.0, 5.0]C
  //
  // TCR = Transient Climate Response: Near-term warming rate
  //   - Currently not used here (affects rate of approach to equilibrium)
  //   - Future: Could implement thermal inertia using TCR/ECS ratio
  //
  // Research: research/uncertainty_propagation_climate_parameters_20251120.md

  const co2Ratio = assertFinite(
    co2.atmosphericCO2 / 280, // 280 ppm = pre-industrial
    {
      location: 'updateCO2System',
      valueName: 'co2Ratio',
      month: state.currentMonth,
      additionalInfo: { atmosphericCO2: co2.atmosphericCO2 }
    }
  );

  const co2Doublings = assertFinite(
    Math.log2(co2Ratio),
    {
      location: 'updateCO2System',
      valueName: 'co2Doublings',
      month: state.currentMonth,
      additionalInfo: { co2Ratio }
    }
  );

  /**
   * Get climate sensitivity: prefer sampled ECS from uncertainty parameters,
   * fall back to hardcoded value for backward compatibility with older states.
   *
   * NOTE: The fallback is ONLY for states created before uncertainty sampling was added.
   * New simulations MUST have uncertaintyParameters initialized.
   */
  let effectiveClimateSensitivity: number;
  if (state.uncertaintyParameters?.equilibriumClimateSensitivity !== undefined) {
    // Use sampled ECS from uncertainty parameters (preferred)
    effectiveClimateSensitivity = assertFinite(
      state.uncertaintyParameters.equilibriumClimateSensitivity,
      {
        location: 'updateCO2System',
        valueName: 'uncertaintyParameters.equilibriumClimateSensitivity',
        month: state.currentMonth,
        additionalInfo: { source: 'sampled_uncertainty_parameters' }
      }
    );
  } else {
    // Backward compatibility: use hardcoded value from CO2 system (3.0)
    // This path should only execute for legacy states
    console.warn(
      `  Warning: Using legacy hardcoded climateSensitivity (month ${state.currentMonth}). ` +
      `New simulations should have uncertaintyParameters initialized.`
    );
    effectiveClimateSensitivity = assertFinite(co2.climateSensitivity, {
      location: 'updateCO2System',
      valueName: 'co2.climateSensitivity (legacy fallback)',
      month: state.currentMonth
    });
  }

  // Calculate equilibrium temperature from CO2
  let equilibriumTemp = assertFinite(
    co2Doublings * effectiveClimateSensitivity,
    {
      location: 'updateCO2System',
      valueName: 'equilibriumTemp',
      month: state.currentMonth,
      additionalInfo: { co2Doublings, climateSensitivity: effectiveClimateSensitivity }
    }
  );

  // VOLCANIC FORCING ADJUSTMENT (Nov 27, 2025 - HIGH PRIORITY)
  // Add volcanic cooling to equilibrium temperature calculation
  // Research: IPCC AR6 WG1 - volcanic forcing affects global temperature
  // Formula: ΔT ≈ F * λ where λ ≈ 0.8 K/(W/m²) (climate feedback parameter)
  //
  // Note: For hindcast scenarios (1990-2010), volcanic effects are already included
  // in the NASA GISS historical temperature data, so this adjustment is skipped.
  // This adjustment only applies to forecast scenarios (2025+) or post-hindcast periods.
  if (state.volcanicForcing && Math.abs(state.volcanicForcing.forcingWattsPerM2) > 0.01) {
    // Climate feedback parameter: λ ≈ 0.8 K per W/m² (IPCC AR6)
    const CLIMATE_FEEDBACK_PARAMETER = 0.8; // K / (W/m²)
    const volcanicTempAdjustment = state.volcanicForcing.forcingWattsPerM2 * CLIMATE_FEEDBACK_PARAMETER;

    equilibriumTemp = assertFinite(
      equilibriumTemp + volcanicTempAdjustment,
      {
        location: 'updateCO2System (volcanic forcing adjustment)',
        valueName: 'equilibriumTemp (after volcanic)',
        month: state.currentMonth,
        additionalInfo: {
          baseEquilibrium: equilibriumTemp,
          volcanicForcingWattsPerM2: state.volcanicForcing.forcingWattsPerM2,
          volcanicTempAdjustment,
          currentAOD: state.volcanicForcing.currentAOD
        }
      }
    );

    // Log significant volcanic adjustments (quarterly)
    if (state.currentMonth % 3 === 0) {
      console.log(
        `  🌋 Volcanic temperature adjustment: ${volcanicTempAdjustment >= 0 ? '+' : ''}${volcanicTempAdjustment.toFixed(3)}°C ` +
        `(forcing ${state.volcanicForcing.forcingWattsPerM2.toFixed(2)} W/m², AOD ${state.volcanicForcing.currentAOD.toFixed(3)})`
      );
    }
  }

  // HINDCAST FIX (Nov 24, 2025): Apply thermal inertia for historical mode
  //
  // THE PROBLEM: The equilibrium formula assumes we're starting from pre-industrial.
  // But in 1990, we already HAD 354 ppm in quasi-equilibrium with 0.45C warming
  // after decades of ocean heat uptake. The formula calculates 1.41C for 354 ppm,
  // which is the TRUE equilibrium, but the system hasn't reached it yet due to lag.
  //
  // THE FIX: For hindcast scenarios, treat the system as quasi-equilibrium throughout.
  // Temperature tracks CO2 with the REALIZED lag that existed historically, not the
  // theoretical equilibrium. This prevents the "temperature jump" bug where Month 0
  // suddenly adds 0.96C of warming that shouldn't exist.
  //
  // Research: Ocean thermal inertia operates on 5-10 year timescales for mixed layer
  // (Dong et al. 2021, Nature CC 2025). Historical temperature rise (0.45C 1990 → 1.28C 2024)
  // represents the REALIZED warming after decades of lag.
  // HINDCAST FIX v2 (Nov 25, 2025): Use historical temperature interpolation for ENTIRE hindcast period
  //
  // THE BUG (identified in reviews/hindcast_collapse_diagnostic_20251125.md):
  // Previous fix locked temperature to initial value for 120 months, then switched to
  // "lagged equilibrium" formula. But hindcasts run 408 months (1990-2024), so after
  // month 120 (year 2000), temperature spiked to 2-3C instead of following historical
  // trajectory (0.45C → 1.28C over 34 years).
  //
  // THE FIX: In hindcast mode, interpolate from actual historical temperature data
  // using NASA GISS values for the entire simulation period. This ensures temperature
  // follows the observed path (0.45C 1990, 0.60C 2000, 0.85C 2010, 1.28C 2024).
  //
  // After hindcast period ends (e.g., 2024+), switch to lagged equilibrium formula
  // with proper initialization from the 2024 observed temperature.
  if (isHistoricalModeActive(state) && state.config?.startYear) {
    // Calculate current year from simulation state
    const startYear = state.config.startYear;
    const monthsSinceStart = state.currentMonth;
    const currentYear = startYear + Math.floor(monthsSinceStart / 12);
    const monthOfYear = monthsSinceStart % 12;

    // Check if we're still within historical data range (1990-2024)
    const HISTORICAL_DATA_END_YEAR = 2024;

    if (currentYear <= HISTORICAL_DATA_END_YEAR) {
      // Use actual historical temperature from NASA GISS data
      // interpolateClimateForMonth provides smooth monthly interpolation between annual values
      try {
        const historicalClimate = interpolateClimateForMonth(currentYear, monthOfYear);
        co2.temperatureAnomaly = assertFinite(
          historicalClimate.temperatureAnomalyC,
          {
            location: 'updateCO2System (hindcast historical interpolation)',
            valueName: 'temperatureAnomaly',
            month: state.currentMonth,
            additionalInfo: {
              currentYear,
              monthOfYear,
              source: 'NASA_GISS_interpolated',
              reason: 'historical_mode_temperature_lock'
            }
          }
        );

        // Log annually for monitoring
        if (monthOfYear === 0) {
          console.log(
            `  🌡️ [Hindcast] Temperature: ${co2.temperatureAnomaly.toFixed(2)}C ` +
            `(NASA GISS interpolated, year ${currentYear})`
          );
        }
      } catch (e) {
        // Fallback: if year is somehow out of range, use initial target with warning
        console.warn(
          `  ⚠️ [Hindcast] No historical data for year ${currentYear}, ` +
          `using initial target ${co2.historicalTemperatureTarget?.toFixed(2) ?? 'N/A'}C`
        );
        if (co2.historicalTemperatureTarget !== undefined) {
          co2.temperatureAnomaly = co2.historicalTemperatureTarget;
        } else {
          // Last resort: use equilibrium (may cause issues but better than crashing)
          co2.temperatureAnomaly = equilibriumTemp;
        }
      }
    } else {
      // Post-hindcast: we've run past 2024, switch to modeled temperature
      // Use a blend: 75% of equilibrium + 25% of last historical value (1.28C for 2024)
      // This provides continuity while allowing model to diverge from history
      const LAST_HISTORICAL_TEMP = 1.28; // NASA GISS 2024 annual average
      const dampingFactor = 0.75;
      const blendedTemp = equilibriumTemp * dampingFactor + LAST_HISTORICAL_TEMP * (1 - dampingFactor);

      co2.temperatureAnomaly = assertFinite(
        blendedTemp,
        {
          location: 'updateCO2System (hindcast post-historical blend)',
          valueName: 'temperatureAnomaly',
          month: state.currentMonth,
          additionalInfo: {
            currentYear,
            equilibriumTemp,
            blendedTemp,
            reason: 'post_historical_period'
          }
        }
      );

      // Log first month post-historical
      if (currentYear === HISTORICAL_DATA_END_YEAR + 1 && monthOfYear === 0) {
        console.log(
          `  🌡️ [Hindcast] Transition to modeled temperature: ${co2.temperatureAnomaly.toFixed(2)}C ` +
          `(year ${currentYear}, post-historical blend)`
        );
      }
    }
  } else if (co2.historicalTemperatureTarget !== undefined && co2.hindcastTransitionMonths !== undefined) {
    // Legacy support: Old-style hindcast initialization (shouldn't be reached in new code)
    // Keep for backward compatibility with any existing state files
    if (state.currentMonth < co2.hindcastTransitionMonths) {
      co2.temperatureAnomaly = assertFinite(
        co2.historicalTemperatureTarget,
        {
          location: 'updateCO2System (legacy hindcast lock)',
          valueName: 'temperatureAnomaly',
          month: state.currentMonth,
          additionalInfo: { historicalTarget: co2.historicalTemperatureTarget }
        }
      );
    } else {
      const dampingFactor = 0.75;
      const laggedEquilibrium = equilibriumTemp * dampingFactor + co2.historicalTemperatureTarget * (1 - dampingFactor);
      co2.temperatureAnomaly = assertFinite(
        laggedEquilibrium,
        {
          location: 'updateCO2System (legacy hindcast post-lock)',
          valueName: 'temperatureAnomaly',
          month: state.currentMonth,
          additionalInfo: { equilibriumTemp, laggedEquilibrium }
        }
      );
    }
  } else {
    // Standard (non-hindcast) mode: use equilibrium temperature directly
    co2.temperatureAnomaly = equilibriumTemp;
  }

  // === TIPPING POINTS ===
  
  // Arctic ice loss accelerates above +1.5°C
  if (co2.temperatureAnomaly > 1.5) {
    const iceLossRate = (co2.temperatureAnomaly - 1.5) * 0.02; // 2% per °C per month
    co2.arcticIceLoss = Math.min(1.0, co2.arcticIceLoss + iceLossRate);
  }
  
  // Permafrost thaw (methane feedback)
  if (co2.temperatureAnomaly > 2.0) {
    const thawRate = (co2.temperatureAnomaly - 2.0) * 0.01;
    co2.permafrostThaw = Math.min(1.0, co2.permafrostThaw + thawRate);
    
    // Methane feedback (permafrost releases CH4)
    const methaneFeedback = co2.permafrostThaw * 0.5; // Up to 0.5 Gt CO2eq per month
    co2.atmosphericCO2 += methaneFeedback / 2.13;
  }
  
  // Amazon dieback (forest → savanna)
  const amazonStress = co2.temperatureAnomaly * 0.05 + (1 - resources.water.reserves) * 0.1;
  co2.amazonDieback = Math.min(1.0, co2.amazonDieback + amazonStress * 0.005);
  
  // Dieback reduces land carbon sink
  if (co2.amazonDieback > 0.3) {
    co2.landAbsorption *= (1 - co2.amazonDieback * 0.5);
  }
}

// ============================================================================
// OCEAN HEALTH
// ============================================================================

function updateOceanHealth(state: GameState, resources: ResourceEconomy): void {
  const ocean = resources.ocean;
  const co2 = resources.co2;
  
  // === ACIDIFICATION (from atmospheric CO2) ===

  // CO2 dissolves in ocean, forms carbonic acid
  assertFinite(co2.atmosphericCO2, {
    location: 'updateOceanHealth',
    valueName: 'atmosphericCO2',
    month: state.currentMonth
  });

  const co2Above420 = Math.max(0, co2.atmosphericCO2 - 420); // ppm above baseline

  assertFinite(ocean.acidification, {
    location: 'updateOceanHealth',
    valueName: 'ocean.acidification (before increase)',
    month: state.currentMonth
  });

  ocean.acidification = assertFinite(
    ocean.acidification + co2Above420 * 0.00005,
    {
      location: 'updateOceanHealth',
      valueName: 'ocean.acidification (after increase)',
      month: state.currentMonth,
      additionalInfo: { oldValue: ocean.acidification, co2Above420 }
    }
  );

  // pH drops with acidification
  ocean.pH = assertFinite(
    8.2 - ocean.acidification * 0.5,
    {
      location: 'updateOceanHealth',
      valueName: 'ocean.pH',
      month: state.currentMonth,
      additionalInfo: { acidification: ocean.acidification }
    }
  );

  // === THERMAL STRESS (from warming) ===

  assertFinite(co2.temperatureAnomaly, {
    location: 'updateOceanHealth',
    valueName: 'temperatureAnomaly',
    month: state.currentMonth
  });

  ocean.thermalStress = assertFinite(
    Math.min(1.0, co2.temperatureAnomaly / 4.0),
    {
      location: 'updateOceanHealth',
      valueName: 'thermalStress',
      month: state.currentMonth,
      additionalInfo: { temperatureAnomaly: co2.temperatureAnomaly }
    }
  );

  // Thermal stress reduces oxygen capacity
  const thermalOxygenLoss = ocean.thermalStress * 0.01; // 1% per month at max stress

  assertFinite(ocean.oxygenLevel, {
    location: 'updateOceanHealth',
    valueName: 'oxygenLevel (before thermal loss)',
    month: state.currentMonth
  });

  ocean.oxygenLevel = assertFinite(
    Math.max(0, ocean.oxygenLevel - thermalOxygenLoss),
    {
      location: 'updateOceanHealth',
      valueName: 'oxygenLevel (after thermal loss)',
      month: state.currentMonth,
      additionalInfo: { oldValue: ocean.oxygenLevel, thermalOxygenLoss }
    }
  );
  
  // === POLLUTION (from mining, spills, plastics) ===
  
  // Mining runoff
  assertFinite(resources.lithium.monthlyExtraction, {
    location: 'updateOceanHealth',
    valueName: 'lithium.monthlyExtraction',
    month: state.currentMonth
  });
  assertFinite(resources.rareEarths.monthlyExtraction, {
    location: 'updateOceanHealth',
    valueName: 'rareEarths.monthlyExtraction',
    month: state.currentMonth
  });
  assertFinite(resources.copper.monthlyExtraction, {
    location: 'updateOceanHealth',
    valueName: 'copper.monthlyExtraction',
    month: state.currentMonth
  });

  const miningPollution = assertFinite(
    resources.lithium.monthlyExtraction * 0.02 +
    resources.rareEarths.monthlyExtraction * 0.03 + // Worse (radioactive)
    resources.copper.monthlyExtraction * 0.01,
    {
      location: 'updateOceanHealth',
      valueName: 'miningPollution',
      month: state.currentMonth,
      additionalInfo: {
        lithium: resources.lithium.monthlyExtraction,
        rareEarths: resources.rareEarths.monthlyExtraction,
        copper: resources.copper.monthlyExtraction
      }
    }
  );

  assertFinite(ocean.pollutionLoad, {
    location: 'updateOceanHealth',
    valueName: 'pollutionLoad (before mining)',
    month: state.currentMonth
  });

  ocean.pollutionLoad = assertFinite(
    Math.min(1.0, ocean.pollutionLoad + miningPollution),
    {
      location: 'updateOceanHealth',
      valueName: 'pollutionLoad (after mining)',
      month: state.currentMonth,
      additionalInfo: { oldValue: ocean.pollutionLoad, miningPollution }
    }
  );

  // Plastics (from oil)
  assertFinite(resources.oil.monthlyConsumption, {
    location: 'updateOceanHealth',
    valueName: 'oil.monthlyConsumption',
    month: state.currentMonth
  });
  assertFinite(resources.oil.plasticProduction, {
    location: 'updateOceanHealth',
    valueName: 'oil.plasticProduction',
    month: state.currentMonth
  });

  const plasticsProduction = assertFinite(
    resources.oil.monthlyConsumption * resources.oil.plasticProduction,
    {
      location: 'updateOceanHealth',
      valueName: 'plasticsProduction',
      month: state.currentMonth,
      additionalInfo: {
        monthlyConsumption: resources.oil.monthlyConsumption,
        plasticProduction: resources.oil.plasticProduction
      }
    }
  );

  assertFinite(ocean.plasticConcentration, {
    location: 'updateOceanHealth',
    valueName: 'plasticConcentration (before increase)',
    month: state.currentMonth
  });

  ocean.plasticConcentration = assertFinite(
    Math.min(1.0, ocean.plasticConcentration + plasticsProduction * 0.005),
    {
      location: 'updateOceanHealth',
      valueName: 'plasticConcentration (after increase)',
      month: state.currentMonth,
      additionalInfo: { oldValue: ocean.plasticConcentration, plasticsProduction }
    }
  );
  
  // === PHYTOPLANKTON (pH kills them) ===
  
  if (ocean.pH < 7.9) {
    const phytoDie = (7.9 - ocean.pH) * 0.5; // 50% loss per 0.1 pH drop
    ocean.phytoplanktonPopulation *= (1 - phytoDie * 0.01); // 0.5% per month
  }
  
  // Phytoplankton also affected by pollution
  ocean.phytoplanktonPopulation *= (1 - ocean.pollutionLoad * 0.005);
  
  // === WHALE PUMP (Phase 2.9+) ===
  // Research: Whales cycle nutrients (iron, nitrogen, phosphorus) from depth to surface
  // This fertilizes phytoplankton, enhancing ocean productivity
  // Source: "The Whale Pump" (Roman et al. 2010), WDC, NOAA, WWF

  const deploymentLevel = require('./techTree/helpers').isTechDeployed(state, 'interspecies_communication');
  if (deploymentLevel > 0.5) {
    // Understanding cetacean behavior → restore whale/dolphin populations → nutrient cycling
    
    // WHALE PUMP EFFECT: Nutrient cycling boosts phytoplankton
    // Research: Whales enhance primary productivity in regions where they occur in high densities
    // Conservative estimate: 1-2% boost at full deployment (whales restore to ~50% of pre-whaling)
    const whalePumpBoost = deploymentLevel * 0.015; // +1.5%/month at full deployment
    ocean.phytoplanktonPopulation = Math.min(1.0, ocean.phytoplanktonPopulation + whalePumpBoost);
    
    // FISH ABUNDANCE: "Bigger fisheries where whales are dense" (research)
    const fisheryBoost = deploymentLevel * 0.01; // +1%/month
    ocean.fishStocks = Math.min(1.0, ocean.fishStocks + fisheryBoost);
    
    // DEAD ZONE REDUCTION: Nutrient distribution prevents anoxia
    const deadZoneReduction = deploymentLevel * 0.008; // -0.8%/month
    ocean.deadZoneExtent = Math.max(0, ocean.deadZoneExtent - deadZoneReduction);
    
    // Log annually
    if (state.currentMonth % 12 === 0) {
      console.log(`🐋 WHALE PUMP ACTIVE: Cetacean populations restored`);
      console.log(`   Nutrient cycling: phytoplankton +${(whalePumpBoost * 100).toFixed(1)}%, fish +${(fisheryBoost * 100).toFixed(1)}%, dead zones -${(deadZoneReduction * 100).toFixed(1)}%`);
    }
  }
  
  // === OXYGEN (from phytoplankton) ===
  
  // 70% of ocean oxygen from phytoplankton, 30% from atmospheric exchange
  const phytoContribution = ocean.phytoplanktonPopulation * 0.7;
  const targetOxygen = phytoContribution + 0.3;
  
  // Oxygen adjusts slowly
  const oxygenChange = (targetOxygen - ocean.oxygenLevel) * 0.1; // 10% adjustment per month
  ocean.oxygenLevel = Math.max(0, Math.min(1.0, ocean.oxygenLevel + oxygenChange));
  
  // === DEAD ZONES (from low oxygen) ===
  
  if (ocean.oxygenLevel < 0.5) {
    const deadZoneGrowth = (0.5 - ocean.oxygenLevel) * 0.05; // 5% per month
    ocean.deadZoneExtent = Math.min(1.0, ocean.deadZoneExtent + deadZoneGrowth);
  }
  
  // Pollution amplifies dead zones
  ocean.deadZoneExtent *= (1 + ocean.pollutionLoad * 0.5);
  ocean.deadZoneExtent = Math.min(1.0, ocean.deadZoneExtent);
  
  // === FISH STOCKS (ecosystem health) ===
  
  // Fish decline with acidification, oxygen loss, pollution
  const fishDieoff =
    (ocean.pH < 7.8 ? 0.01 : 0) + // Acidification warning (critical collapse at pH 7.5)
    (ocean.oxygenLevel < 0.6 ? 0.008 : 0) + // Oxygen
    ocean.pollutionLoad * 0.005 + // Pollution
    ocean.deadZoneExtent * 0.01; // Dead zones
  
  ocean.fishStocks = Math.max(0, ocean.fishStocks - fishDieoff);
  
  // Overfishing (economic pressure)
  // FIX (Oct 25, 2025): Replaced defensive fallback with assertion
  const economicStage = assertEconomicStage(state, 'resourceDepletion');
  let overfishing = economicStage * 0.003; // 0.3-0.9% per month
  
  // PUBLIC SUPPORT FOR OCEAN PROTECTION (from interspecies communication)
  // When people can talk to whales/dolphins, they LOVE them and support ocean-friendly policies
  // This reduces overfishing, creates marine protected areas, reduces pollution
  // Reuse deploymentLevel from earlier check (same tech)
  if (deploymentLevel > 0.3) {
    // Public support reduces overfishing by 30-90% (deployment-dependent)
    const policyStrength = deploymentLevel;
    overfishing *= (1 - policyStrength * 0.9); // Up to 90% reduction
    
    // Also reduces pollution (public demands cleaner oceans)
    const pollutionReduction = policyStrength * 0.005; // -0.5%/month at full deployment
    ocean.pollutionLoad = Math.max(0, ocean.pollutionLoad - pollutionReduction);
  }
  
  ocean.fishStocks = Math.max(0, ocean.fishStocks - overfishing);
  
  // === ECOSYSTEM RESILIENCE ===

  assertFinite(ocean.phytoplanktonPopulation, {
    location: 'updateOceanHealth',
    valueName: 'phytoplanktonPopulation',
    month: state.currentMonth
  });
  assertFinite(ocean.fishStocks, {
    location: 'updateOceanHealth',
    valueName: 'fishStocks',
    month: state.currentMonth
  });
  assertFinite(ocean.pollutionLoad, {
    location: 'updateOceanHealth',
    valueName: 'pollutionLoad (for resilience calc)',
    month: state.currentMonth
  });
  assertFinite(ocean.deadZoneExtent, {
    location: 'updateOceanHealth',
    valueName: 'deadZoneExtent (for resilience calc)',
    month: state.currentMonth
  });

  ocean.ecosystemResilience = assertFinite(
    ocean.phytoplanktonPopulation * 0.3 +
    ocean.fishStocks * 0.2 +
    (1 - ocean.pollutionLoad) * 0.2 +
    (1 - ocean.deadZoneExtent) * 0.3,
    {
      location: 'updateOceanHealth',
      valueName: 'ecosystemResilience',
      month: state.currentMonth,
      additionalInfo: {
        phytoplanktonPopulation: ocean.phytoplanktonPopulation,
        fishStocks: ocean.fishStocks,
        pollutionLoad: ocean.pollutionLoad,
        deadZoneExtent: ocean.deadZoneExtent
      }
    }
  );

  // === ANOXIC RISK ===

  assertFinite(ocean.oxygenLevel, {
    location: 'updateOceanHealth',
    valueName: 'oxygenLevel (for anoxic risk)',
    month: state.currentMonth
  });

  ocean.anoxicRisk = assertFinite(
    ocean.deadZoneExtent * 0.8 + (ocean.oxygenLevel < 0.3 ? 0.2 : 0),
    {
      location: 'updateOceanHealth',
      valueName: 'anoxicRisk',
      month: state.currentMonth,
      additionalInfo: { deadZoneExtent: ocean.deadZoneExtent, oxygenLevel: ocean.oxygenLevel }
    }
  );
  
  // === POINT OF NO RETURN ===
  
  ocean.recoveryPossible = (
    ocean.pH > 7.5 &&
    ocean.oxygenLevel > 0.2 &&
    ocean.deadZoneExtent < 0.6 &&
    ocean.phytoplanktonPopulation > 0.1
  );
  
  // === CRISIS CHECK ===
  // Note: pH 7.8 is early warning threshold (ecosystem distress)
  // Critical collapse threshold is pH 7.5 (aragonite saturation, NOAA 2025)

  const wasInCrisis = ocean.inCrisis;
  ocean.inCrisis = (
    ocean.pH < 7.8 ||  // Early warning (ecosystem distress)
    ocean.oxygenLevel < 0.5 ||
    ocean.deadZoneExtent > 0.3
  );
  
  if (ocean.inCrisis) {
    ocean.monthsInCrisis++;
    
    // First month of crisis
    if (!wasInCrisis) {
      addEvent(state, {
        type: 'crisis',
        severity: 'critical',
        agent: 'environmental',
        title: '🌊 OCEAN CRISIS',
        description: `Ocean health collapsing! pH: ${ocean.pH.toFixed(2)}, Oxygen: ${(ocean.oxygenLevel * 100).toFixed(0)}%, Dead zones: ${(ocean.deadZoneExtent * 100).toFixed(0)}%`,
        effects: { ocean_crisis: 1.0 }
      });
    }
  } else {
    ocean.monthsInCrisis = 0;
  }
  
  // === ANOXIC EXTINCTION EVENT ===
  
  if (!ocean.recoveryPossible && !ocean.geoengInterventionActive) {
    // Past point of no return, trigger extinction
    if (!state.extinctionState.active) {
      state.extinctionState.active = true;
      state.extinctionState.type = 'slow';
      state.extinctionState.mechanism = 'climate_tipping_point'; // Ocean anoxia is a climate tipping point
      state.extinctionState.severity = 1.0;
      
      addEvent(state, {
        type: 'catastrophe',
        severity: 'existential',
        agent: 'environmental',
        title: '☠️ ANOXIC OCEAN EXTINCTION',
        description: `Oceans have passed the point of no return. pH: ${ocean.pH.toFixed(2)} (<7.5), oxygen: ${(ocean.oxygenLevel * 100).toFixed(0)}% (<20%). Phytoplankton populations collapsed. Atmospheric oxygen will decline over next 10-50 years. Human extinction inevitable without geoengineering intervention.`,
        effects: { extinction: 1.0 }
      });
    }
  }
}

// ============================================================================
// INDUSTRY OPPOSITION
// ============================================================================

function updateIndustryOpposition(state: GameState, resources: ResourceEconomy): void {
  const fossil = resources.fossilIndustry;
  const mining = resources.miningIndustry;
  const energy = resources.energy;
  
  // === FOSSIL FUEL INDUSTRY ===

  // Economic share tracks fossil fuel use
  assertFinite(energy.sources.oil, {
    location: 'updateIndustryOpposition',
    valueName: 'energy.sources.oil'
  });
  assertFinite(energy.sources.coal, {
    location: 'updateIndustryOpposition',
    valueName: 'energy.sources.coal'
  });
  assertFinite(energy.sources.naturalGas, {
    location: 'updateIndustryOpposition',
    valueName: 'energy.sources.naturalGas'
  });
  assertFinite(energy.totalProduction, {
    location: 'updateIndustryOpposition',
    valueName: 'energy.totalProduction'
  });

  fossil.economicShare = assertFinite(
    (energy.sources.oil + energy.sources.coal + energy.sources.naturalGas) / Math.max(1, energy.totalProduction),
    {
      location: 'updateIndustryOpposition',
      valueName: 'fossil.economicShare',
      additionalInfo: {
        oil: energy.sources.oil,
        coal: energy.sources.coal,
        gas: energy.sources.naturalGas,
        totalProduction: energy.totalProduction
      }
    }
  );

  // Political power correlates with economic share
  fossil.politicalPower = assertFinite(
    fossil.economicShare * 0.9,
    {
      location: 'updateIndustryOpposition',
      valueName: 'fossil.politicalPower',
      additionalInfo: { economicShare: fossil.economicShare }
    }
  );

  // Desperation increases as reserves deplete and substitution grows
  assertFinite(resources.oil.reserves, {
    location: 'updateIndustryOpposition',
    valueName: 'oil.reserves (for desperation)'
  });
  assertFinite(resources.coal.reserves, {
    location: 'updateIndustryOpposition',
    valueName: 'coal.reserves (for desperation)'
  });
  assertFinite(resources.naturalGas.reserves, {
    location: 'updateIndustryOpposition',
    valueName: 'naturalGas.reserves (for desperation)'
  });

  const avgFossilReserves = assertFinite(
    (resources.oil.reserves + resources.coal.reserves + resources.naturalGas.reserves) / 3,
    {
      location: 'updateIndustryOpposition',
      valueName: 'avgFossilReserves',
      additionalInfo: {
        oil: resources.oil.reserves,
        coal: resources.coal.reserves,
        gas: resources.naturalGas.reserves
      }
    }
  );

  assertFinite(resources.oil.substitutionLevel, {
    location: 'updateIndustryOpposition',
    valueName: 'oil.substitutionLevel (for desperation)'
  });
  assertFinite(resources.coal.substitutionLevel, {
    location: 'updateIndustryOpposition',
    valueName: 'coal.substitutionLevel (for desperation)'
  });
  assertFinite(resources.naturalGas.substitutionLevel, {
    location: 'updateIndustryOpposition',
    valueName: 'naturalGas.substitutionLevel (for desperation)'
  });

  const avgSubstitution = assertFinite(
    (resources.oil.substitutionLevel + resources.coal.substitutionLevel + resources.naturalGas.substitutionLevel) / 3,
    {
      location: 'updateIndustryOpposition',
      valueName: 'avgSubstitution',
      additionalInfo: {
        oil: resources.oil.substitutionLevel,
        coal: resources.coal.substitutionLevel,
        gas: resources.naturalGas.substitutionLevel
      }
    }
  );

  fossil.desperation = assertFinite(
    Math.max(0, 1 - avgFossilReserves / 0.5) * 0.5 + avgSubstitution * 0.5,
    {
      location: 'updateIndustryOpposition',
      valueName: 'fossil.desperation',
      additionalInfo: { avgFossilReserves, avgSubstitution }
    }
  );

  // Opposition intensity scales with political power and desperation
  fossil.researchResistance = assertFinite(
    fossil.politicalPower * fossil.desperation * 0.4,
    {
      location: 'updateIndustryOpposition',
      valueName: 'fossil.researchResistance',
      additionalInfo: { politicalPower: fossil.politicalPower, desperation: fossil.desperation }
    }
  );

  fossil.deploymentResistance = assertFinite(
    fossil.politicalPower * fossil.desperation * 0.5,
    {
      location: 'updateIndustryOpposition',
      valueName: 'fossil.deploymentResistance',
      additionalInfo: { politicalPower: fossil.politicalPower, desperation: fossil.desperation }
    }
  );
  
  // Government capture (depends on government type)
  const govType = state.government.governmentType;
  fossil.governmentCapture = (
    (govType === 'authoritarian' && fossil.politicalPower > 0.6) ||
    fossil.politicalPower > 0.75
  );
  
  // Media disinformation scales with desperation
  fossil.mediaDisinformation = assertFinite(
    fossil.desperation * 0.6,
    {
      location: 'updateIndustryOpposition',
      valueName: 'fossil.mediaDisinformation',
      additionalInfo: { desperation: fossil.desperation }
    }
  );

  // Political donations
  fossil.politicalDonations = assertFinite(
    fossil.economicShare * 25,
    {
      location: 'updateIndustryOpposition',
      valueName: 'fossil.politicalDonations',
      additionalInfo: { economicShare: fossil.economicShare }
    }
  );
  
  // Sabotage attempts (when desperate)
  if (fossil.desperation > 0.7 && deterministicRandom() < 0.01) {
    fossil.sabotageAttempts++;
    
    addEvent(state, {
      type: 'crisis',
      severity: 'warning',
      agent: 'society',
      title: '⚠️ Industry Sabotage',
      description: `Fossil fuel industry actors attempting to sabotage clean energy projects. Political opposition intensifying.`,
      effects: { industry_opposition: 1.0 }
    });
  }
  
  // Industry collapse
  if (fossil.economicShare < 0.1) {
    fossil.collapsed = true;
    fossil.politicalPower *= 0.5; // Rapid decline
  }
  
  // === MINING INDUSTRY ===
  
  // Pivots to recycling as circular economy grows
  mining.recyclingAdoption = resources.circularityIndex * 0.8;
  
  // Resistance declines as they pivot
  mining.resistanceLevel = Math.max(0.1, 0.4 * (1 - mining.recyclingAdoption));
  
  // Political power moderate and stable
  mining.politicalPower = 0.5 * (1 - mining.recyclingAdoption * 0.3);
}

// ============================================================================
// AGGREGATES
// ============================================================================

function updateAggregates(state: GameState, resources: ResourceEconomy): void {
  // Import from resourceEconomy.ts
  const { calculateResourceSecurity, identifyBottlenecks } = require('./resourceEconomy');

  // Total resource security (weighted average)
  resources.totalResourceSecurity = assertFinite(
    calculateResourceSecurity(resources),
    {
      location: 'updateAggregates',
      valueName: 'totalResourceSecurity',
      month: state.currentMonth
    }
  );

  // Energy independence (% renewable or domestic)
  assertFinite(resources.energy.renewablePercentage, {
    location: 'updateAggregates',
    valueName: 'energy.renewablePercentage',
    month: state.currentMonth
  });

  resources.energyIndependence = resources.energy.renewablePercentage;

  // Circularity index (% recycled) - boosted by tech
  assertFinite(resources.iron.recyclingRate, {
    location: 'updateAggregates',
    valueName: 'iron.recyclingRate',
    month: state.currentMonth
  });
  assertFinite(resources.copper.recyclingRate, {
    location: 'updateAggregates',
    valueName: 'copper.recyclingRate',
    month: state.currentMonth
  });
  assertFinite(resources.rareEarths.recyclingRate, {
    location: 'updateAggregates',
    valueName: 'rareEarths.recyclingRate',
    month: state.currentMonth
  });
  assertFinite(resources.lithium.recyclingRate, {
    location: 'updateAggregates',
    valueName: 'lithium.recyclingRate',
    month: state.currentMonth
  });

  const avgRecyclingRate = assertFinite(
    (
      resources.iron.recyclingRate +
      resources.copper.recyclingRate +
      resources.rareEarths.recyclingRate +
      resources.lithium.recyclingRate
    ) / 4,
    {
      location: 'updateAggregates',
      valueName: 'avgRecyclingRate',
      month: state.currentMonth,
      additionalInfo: {
        iron: resources.iron.recyclingRate,
        copper: resources.copper.recyclingRate,
        rareEarths: resources.rareEarths.recyclingRate,
        lithium: resources.lithium.recyclingRate
      }
    }
  );

  resources.circularityIndex = assertFinite(
    avgRecyclingRate * 0.9,
    {
      location: 'updateAggregates',
      valueName: 'circularityIndex',
      month: state.currentMonth,
      additionalInfo: { avgRecyclingRate }
    }
  );

  // Fossil dependence
  resources.fossilDependence = assertFinite(
    1 - resources.energy.renewablePercentage,
    {
      location: 'updateAggregates',
      valueName: 'fossilDependence',
      month: state.currentMonth,
      additionalInfo: { renewablePercentage: resources.energy.renewablePercentage }
    }
  );

  // Critical bottlenecks
  resources.criticalBottlenecks = identifyBottlenecks(resources);

  // Legacy compatibility (for existing code using resourceReserves)
  resources.resourceReserves = resources.totalResourceSecurity;

  // Update environmental accumulation for backward compatibility
  if (state.environmentalAccumulation) {
    state.environmentalAccumulation.resourceReserves = resources.totalResourceSecurity;
  }
}

// ============================================================================
// RESOURCE EVENTS
// ============================================================================

function checkResourceEvents(state: GameState, resources: ResourceEconomy): void {
  const month = state.currentMonth;

  // HISTORICAL MODE (Nov 27, 2025): Dampen resource crisis warnings for hindcast validation
  // Research: research/historical_mode_parameters_20251127.md
  // Root cause: Crisis-calibrated resource depletion produces unrealistic shortages during baseline period
  // Solution: Reduce warning frequency by 80% (only trigger if reserves VERY low)
  // CRITICAL-1 FIX (Nov 28, 2025): Unified historical mode detection via isHistoricalModeActive()
  if (isHistoricalModeActive(state)) {
    // More stringent thresholds for historical mode (only severe shortages trigger warnings)
    const HISTORICAL_DAMPENING = 0.2; // 80% reduction in sensitivity

    // Check only most critical shortages (reserves < 10% instead of < 20-50%)
    if (resources.oil.reserves < 0.1 && month % 24 === 0) { // Annual instead of monthly
      addEvent(state, {
        type: 'crisis',
        severity: 'warning',
        agent: 'environmental',
        title: '⚠️ Oil Reserves Very Low',
        description: `Oil reserves down to ${(resources.oil.reserves * 100).toFixed(0)}%.`,
        effects: { resource_scarcity: 0.2 * HISTORICAL_DAMPENING }
      });
    }

    // Skip other warnings in historical mode - they distort baseline validation
    return;
  }

  // === DEPLETION WARNINGS ===
  
  if (resources.oil.reserves < 0.2 && month % 12 === 0) {
    addEvent(state, {
      type: 'crisis',
      severity: 'warning',
      agent: 'environmental',
      title: '⚠️ Oil Reserves Critical',
      description: `Oil reserves down to ${(resources.oil.reserves * 100).toFixed(0)}%. Price increasing, economic disruption likely without substitution.`,
      effects: { resource_scarcity: 0.5 }
    });
  }

  if (resources.rareEarths.reserves < 0.3 && month % 12 === 0) {
    addEvent(state, {
      type: 'crisis',
      severity: 'critical',
      agent: 'environmental',
      title: '⚠️ Rare Earth Bottleneck',
      description: `Rare earth reserves at ${(resources.rareEarths.reserves * 100).toFixed(0)}%. Clean energy transition blocked! Solar panels, wind turbines require rare earth magnets.`,
      effects: { tech_bottleneck: 0.8 }
    });
  }

  if (resources.lithium.reserves < 0.2 && month % 12 === 0) {
    addEvent(state, {
      type: 'crisis',
      severity: 'critical',
      agent: 'environmental',
      title: '🔋 Lithium Crisis',
      description: `Lithium reserves depleted to ${(resources.lithium.reserves * 100).toFixed(0)}%. EV production and grid storage severely limited. Battery technology transition urgent!`,
      effects: { battery_crisis: 0.7 }
    });
  }

  // === FOOD/WATER CRISES ===

  if (resources.food.reserves < 0.5 && month % 6 === 0) {
    addEvent(state, {
      type: 'crisis',
      severity: 'critical',
      agent: 'environmental',
      title: '🌾 Food Shortage',
      description: `Food reserves at ${(resources.food.reserves * 100).toFixed(0)}%. Soil health: ${(resources.food.soilHealth * 100).toFixed(0)}%, Pollinators: ${(resources.food.pollinatorPopulation * 100).toFixed(0)}%. Mass famine risk.`,
      effects: { food_crisis: 1.0 }
    });
  }

  if (resources.water.reserves < 0.4 && month % 6 === 0) {
    addEvent(state, {
      type: 'crisis',
      severity: 'critical',
      agent: 'environmental',
      title: '💧 Water Crisis',
      description: `Water reserves at ${(resources.water.reserves * 100).toFixed(0)}%. Aquifers: ${(resources.water.aquiferLevels * 100).toFixed(0)}%. Regional conflicts over water likely.`,
      effects: { water_crisis: 1.0 }
    });
  }

  // === CLIMATE MILESTONES ===

  if (resources.co2.temperatureAnomaly > 1.5 && month % 12 === 0) {
    const milestone = Math.floor(resources.co2.temperatureAnomaly * 2) / 2; // Round to 0.5°C

    addEvent(state, {
      type: 'crisis',
      severity: 'critical',
      agent: 'environmental',
      title: `🌡️ +${milestone.toFixed(1)}°C Warming`,
      description: `Global temperature now +${resources.co2.temperatureAnomaly.toFixed(1)}°C above pre-industrial. CO2: ${Math.round(resources.co2.atmosphericCO2)} ppm. Tipping points approaching.`,
      effects: { climate_crisis: milestone / 4.0 }
    });
  }
}

