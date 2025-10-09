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
  CO2System,
} from '../types/resources';
import { addEvent } from '../lib/eventSystem';

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
  updateOceanHealth(state, resources);
  updateIndustryOpposition(state, resources);
  
  // Calculate aggregates
  updateAggregates(state, resources);
  
  // Check for critical events
  checkResourceEvents(state, resources);
}

// ============================================================================
// FOSSIL FUEL DEPLETION
// ============================================================================

function updateFossilFuelDepletion(state: GameState, resources: ResourceEconomy): void {
  // Base depletion scales with economic stage
  const economicStage = state.globalMetrics?.economicTransitionStage || 1;
  const economicMultiplier = 0.5 + economicStage * 0.5; // 1.0x at stage 1, 2.5x at stage 3
  
  // Update each fossil fuel
  updateFossilFuel(resources.oil, economicMultiplier, resources);
  updateFossilFuel(resources.coal, economicMultiplier, resources);
  updateFossilFuel(resources.naturalGas, economicMultiplier, resources);
  
  // Oil spills (random events)
  if (resources.oil.reserves > 0 && Math.random() < resources.oil.spillRisk) {
    resources.oil.spillSeverity = Math.random() * 0.3 + 0.1; // 10-40% severity
    resources.ocean.pollutionLoad += resources.oil.spillSeverity * 0.05;
    
    addEvent({
      id: `oil_spill_${state.currentMonth}`,
      timestamp: state.currentMonth,
      type: 'crisis',
      severity: 'warning',
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
  if (fuel.reserves <= 0) {
    fuel.monthlyExtraction = 0;
    fuel.monthlyConsumption = 0;
    return;
  }
  
  // Extraction scales with depletion rate, economic activity, and substitution
  const substitutionFactor = 1 - fuel.substitutionLevel * 0.8; // Up to 80% reduction
  fuel.monthlyExtraction = fuel.depletionRate * economicMultiplier * substitutionFactor;
  
  // Consumption = extraction (for now; could add stockpiling later)
  fuel.monthlyConsumption = fuel.monthlyExtraction;
  
  // Deplete reserves
  fuel.reserves = Math.max(0, fuel.reserves - fuel.monthlyExtraction);
  
  // Extraction cost increases as reserves deplete (harder to extract)
  const depletionFactor = fuel.reserves / fuel.initialReserves;
  fuel.extractionCost = fuel.extractionCost * (1 + (1 - depletionFactor) * 0.05); // Up to 5% increase per month
  
  // Market price follows supply/demand
  if (fuel.reserves < 0.3) {
    fuel.marketPrice *= 1.02; // 2% price increase per month when scarce
  }
}

// ============================================================================
// METAL DEPLETION & RECYCLING
// ============================================================================

function updateMetalDepletion(state: GameState, resources: ResourceEconomy): void {
  const economicStage = state.globalMetrics?.economicTransitionStage || 1;
  const economicMultiplier = 0.5 + economicStage * 0.5;
  
  // Update each metal
  updateMetal(resources.iron, economicMultiplier, resources);
  updateMetal(resources.copper, economicMultiplier, resources);
  updateMetal(resources.rareEarths, economicMultiplier, resources);
  updateMetal(resources.lithium, economicMultiplier, resources);
  
  // Special: Copper and Rare Earths demand increases with clean energy transition
  const renewablePercentage = resources.energy.renewablePercentage;
  if (renewablePercentage > 0.3) {
    // Clean energy needs 3x more copper, 5x more rare earths
    const cleanEnergyDemand = (renewablePercentage - 0.3) * 2; // Peaks at +1.4x at 100% renewable
    resources.copper.monthlyExtraction *= (1 + cleanEnergyDemand);
    resources.rareEarths.monthlyExtraction *= (1 + cleanEnergyDemand * 1.5);
  }
  
  // Special: Lithium demand increases with EVs
  const oilSubstitution = resources.oil.substitutionLevel;
  if (oilSubstitution > 0.1) {
    // EVs need massive lithium
    const evDemand = oilSubstitution * 5; // 5x multiplier
    resources.lithium.monthlyExtraction *= (1 + evDemand);
  }
}

function updateMetal(
  metal: MetalResource,
  economicMultiplier: number,
  resources: ResourceEconomy
): void {
  // Virgin extraction
  if (metal.reserves > 0) {
    metal.monthlyExtraction = metal.depletionRate * economicMultiplier;
    metal.reserves = Math.max(0, metal.reserves - metal.monthlyExtraction);
    
    // Extraction cost increases as depletes
    const depletionFactor = metal.reserves / metal.initialReserves;
    metal.extractionCost *= (1 + (1 - depletionFactor) * 0.03); // 3% per month
  } else {
    metal.monthlyExtraction = 0;
  }
  
  // Recycling (from circular economy tech)
  const circularEconomy = resources.circularityIndex; // Boosted by tech
  metal.monthlyRecycling = metal.monthlyConsumption * metal.recyclingRate * circularEconomy;
  metal.recycledStock = Math.min(1.0, metal.recycledStock + metal.monthlyRecycling * metal.recyclingEfficiency);
  
  // Total consumption (virgin + recycled)
  const recycledContribution = metal.recycledStock * metal.recyclingRate;
  metal.monthlyConsumption = metal.monthlyExtraction + recycledContribution;
  
  // Use up recycled stock
  metal.recycledStock = Math.max(0, metal.recycledStock - recycledContribution);
  
  // Criticality increases as reserves deplete
  if (metal.reserves < 0.4) {
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
  const biodiversity = state.environmentalAccumulation?.biodiversityIndex || 0.8;
  
  // Pollinators decline with biodiversity and pesticides
  food.pollinatorPopulation = Math.max(0.1, biodiversity * 0.9); // Track biodiversity closely
  
  // Soil health degrades with monoculture, improves with sustainable ag
  const soilDegradation = food.overharvest * 0.02; // Overharvest damages soil
  food.soilHealth = Math.max(0.3, food.soilHealth - soilDegradation);
  
  // Climate stress from temperature
  const tempAnomaly = resources.co2.temperatureAnomaly;
  food.climateStress = Math.min(1.0, tempAnomaly / 4.0); // Maxes at +4°C
  food.waterAvailability = Math.max(0.3, 1.0 - food.climateStress * 0.5); // Droughts
  
  // Regeneration multiplier reduced by stress
  food.regenerationMultiplier = food.soilHealth * food.pollinatorPopulation * (1 - food.climateStress * 0.5);
  
  // Water-specific: Aquifer depletion and climate
  const water = resources.water;
  if (water.overharvest > 0) {
    water.aquiferLevels = Math.max(0.1, water.aquiferLevels - water.overharvest * 0.5);
  }
  water.regenerationMultiplier = Math.max(0.5, 1.0 - resources.co2.temperatureAnomaly * 0.15); // Climate disrupts water cycle
  
  // Timber-specific: Old growth doesn't regenerate
  const timber = resources.timber;
  if (timber.monthlyHarvest > timber.sustainableHarvestRate) {
    timber.oldGrowthRemaining = Math.max(0, timber.oldGrowthRemaining - 0.005);
  }
}

function updateRenewable(
  resource: FoodResource | WaterResource | TimberResource,
  state: GameState,
  resources: ResourceEconomy
): void {
  // Regeneration
  const regen = resource.monthlyRegeneration * resource.regenerationMultiplier;
  resource.reserves = Math.min(resource.capacity, resource.reserves + regen);
  
  // Harvesting (scales with economic stage)
  const economicStage = state.globalMetrics?.economicTransitionStage || 1;
  const economicMultiplier = 0.8 + economicStage * 0.2; // 1.0x to 1.4x
  resource.monthlyHarvest = resource.sustainableHarvestRate * economicMultiplier;
  
  // Consume
  resource.reserves = Math.max(0, resource.reserves - resource.monthlyHarvest);
  
  // Overharvest if consumption exceeds regeneration
  resource.overharvest = Math.max(0, resource.monthlyHarvest - regen);
  
  // Sustainability index
  if (regen > 0) {
    resource.sustainabilityIndex = Math.min(1.0, resource.monthlyHarvest / regen);
  } else {
    resource.sustainabilityIndex = 0; // Collapse
  }
  
  // Capacity degrades with persistent overharvest
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
  const economicStage = state.globalMetrics?.economicTransitionStage || 1;
  energy.totalDemand = 95 + economicStage * 10; // 95 → 125 units
  
  // Production from each source (limited by capacity and fuel availability)
  energy.sources.oil = Math.min(energy.capacity.oil, energy.sources.oil);
  energy.sources.coal = Math.min(energy.capacity.coal, energy.sources.coal);
  energy.sources.naturalGas = Math.min(energy.capacity.naturalGas, energy.sources.naturalGas);
  
  // Fossil sources decline as fuels deplete
  if (resources.oil.reserves < 0.1) energy.sources.oil *= 0.9; // 10% reduction per month when nearly depleted
  if (resources.coal.reserves < 0.1) energy.sources.coal *= 0.9;
  if (resources.naturalGas.reserves < 0.1) energy.sources.naturalGas *= 0.9;
  
  // Renewables grow with clean energy tech (handled in tech deployment)
  // Fusion unlocks when tech deployed (handled in tech deployment)
  
  // Total production
  energy.totalProduction = 
    energy.sources.oil +
    energy.sources.coal +
    energy.sources.naturalGas +
    energy.sources.nuclear +
    energy.sources.solar +
    energy.sources.wind +
    energy.sources.hydro +
    energy.sources.fusion;
  
  // Surplus/deficit
  energy.surplus = energy.totalProduction - energy.totalDemand;
  
  // Renewable percentage
  energy.renewablePercentage = (
    energy.sources.solar +
    energy.sources.wind +
    energy.sources.hydro +
    energy.sources.fusion
  ) / Math.max(1, energy.totalProduction);
  
  // Carbon intensity (kg CO2 per unit energy)
  const fossilProduction = energy.sources.oil + energy.sources.coal + energy.sources.naturalGas;
  const fossilCO2 = 
    energy.sources.oil * resources.oil.co2PerUnit * 0.1 +
    energy.sources.coal * resources.coal.co2PerUnit * 0.1 +
    energy.sources.naturalGas * resources.naturalGas.co2PerUnit * 0.1;
  energy.carbonIntensity = fossilCO2 / Math.max(1, energy.totalProduction);
}

// ============================================================================
// CO2 & CLIMATE SYSTEM
// ============================================================================

function updateCO2System(state: GameState, resources: ResourceEconomy): void {
  const co2 = resources.co2;
  const energy = resources.energy;
  
  // === EMISSIONS FROM FOSSIL FUEL USE ===
  
  // Calculate emissions (Gt CO2 per month)
  // Scale: 1 unit of monthly extraction ≈ 1% of global reserves ≈ 3 Gt CO2
  const oilEmissions = resources.oil.monthlyConsumption * resources.oil.co2PerUnit * 3.0;
  const coalEmissions = resources.coal.monthlyConsumption * resources.coal.co2PerUnit * 3.0;
  const gasEmissions = resources.naturalGas.monthlyConsumption * resources.naturalGas.co2PerUnit * 3.0;
  
  // Methane leakage (CH4 is 80x worse than CO2 over 20 years)
  const methaneEmissions = resources.naturalGas.monthlyConsumption * 
    resources.naturalGas.methaneLeakage * 80;
  
  // Total monthly emissions (Gt CO2 equivalent)
  const monthlyEmissions = oilEmissions + coalEmissions + gasEmissions + methaneEmissions;
  co2.annualEmissions = monthlyEmissions * 12;
  
  // === ATMOSPHERIC CO2 ===
  
  // Natural sinks absorb some emissions (ocean + land)
  const sinkCapacity = (co2.oceanAbsorption + co2.landAbsorption) * (1 - co2.sinkSaturation);
  const netEmissions = Math.max(0, monthlyEmissions - sinkCapacity / 12);
  
  // Convert to ppm (2.13 Gt CO2 = 1 ppm)
  const ppmIncrease = netEmissions / 2.13;
  co2.atmosphericCO2 += ppmIncrease;
  
  // Track cumulative emissions (PERMANENT!)
  co2.cumulativeEmissions += monthlyEmissions;
  
  // === SINKS SATURATE ===
  
  // Ocean absorption decreases with acidification
  const ocean = resources.ocean;
  if (ocean.pH < 8.0) {
    const acidificationFactor = (8.0 - ocean.pH) / 0.5; // 0 to 1
    co2.oceanAbsorption = Math.max(5, 10 * (1 - acidificationFactor * 0.5)); // Drops to 5 Gt/year
  }
  
  // Land absorption decreases with deforestation
  const forestLoss = 1 - resources.timber.forestCover;
  co2.landAbsorption = Math.max(5, 11 * (1 - forestLoss * 0.3)); // Drops to 7.7 Gt/year
  
  // Sinks saturate with cumulative emissions
  co2.sinkSaturation = Math.min(0.8, co2.cumulativeEmissions / 1000); // 80% saturated at 1000 Gt
  
  // === TEMPERATURE ===
  
  // IPCC formula: T = sensitivity * log2(CO2 / CO2_preindustrial)
  const co2Ratio = co2.atmosphericCO2 / 280; // 280 ppm = pre-industrial
  const co2Doublings = Math.log2(co2Ratio);
  co2.temperatureAnomaly = co2Doublings * co2.climateSensitivity;
  
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
  const co2Above420 = Math.max(0, co2.atmosphericCO2 - 420); // ppm above baseline
  ocean.acidification += co2Above420 * 0.00005; // Accumulates slowly
  
  // pH drops with acidification
  ocean.pH = 8.2 - ocean.acidification * 0.5; // Starts at 8.2, drops to 7.7 at 100% acidification
  
  // === THERMAL STRESS (from warming) ===
  
  ocean.thermalStress = Math.min(1.0, co2.temperatureAnomaly / 4.0); // Maxes at +4°C
  
  // Thermal stress reduces oxygen capacity
  const thermalOxygenLoss = ocean.thermalStress * 0.01; // 1% per month at max stress
  ocean.oxygenLevel = Math.max(0, ocean.oxygenLevel - thermalOxygenLoss);
  
  // === POLLUTION (from mining, spills, plastics) ===
  
  // Mining runoff
  const miningPollution = 
    resources.lithium.monthlyExtraction * 0.02 +
    resources.rareEarths.monthlyExtraction * 0.03 + // Worse (radioactive)
    resources.copper.monthlyExtraction * 0.01;
  ocean.pollutionLoad = Math.min(1.0, ocean.pollutionLoad + miningPollution);
  
  // Plastics (from oil)
  const plasticsProduction = resources.oil.monthlyConsumption * resources.oil.plasticProduction;
  ocean.plasticConcentration = Math.min(1.0, ocean.plasticConcentration + plasticsProduction * 0.005);
  
  // === PHYTOPLANKTON (pH kills them) ===
  
  if (ocean.pH < 7.9) {
    const phytoDie = (7.9 - ocean.pH) * 0.5; // 50% loss per 0.1 pH drop
    ocean.phytoplanktonPopulation *= (1 - phytoDie * 0.01); // 0.5% per month
  }
  
  // Phytoplankton also affected by pollution
  ocean.phytoplanktonPopulation *= (1 - ocean.pollutionLoad * 0.005);
  
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
    (ocean.pH < 7.8 ? 0.01 : 0) + // Acidification
    (ocean.oxygenLevel < 0.6 ? 0.008 : 0) + // Oxygen
    ocean.pollutionLoad * 0.005 + // Pollution
    ocean.deadZoneExtent * 0.01; // Dead zones
  
  ocean.fishStocks = Math.max(0, ocean.fishStocks - fishDieoff);
  
  // Overfishing (economic pressure)
  const economicStage = state.globalMetrics?.economicTransitionStage || 1;
  const overfishing = economicStage * 0.003; // 0.3-0.9% per month
  ocean.fishStocks = Math.max(0, ocean.fishStocks - overfishing);
  
  // === ECOSYSTEM RESILIENCE ===
  
  ocean.ecosystemResilience = (
    ocean.phytoplanktonPopulation * 0.3 +
    ocean.fishStocks * 0.2 +
    (1 - ocean.pollutionLoad) * 0.2 +
    (1 - ocean.deadZoneExtent) * 0.3
  );
  
  // === ANOXIC RISK ===
  
  ocean.anoxicRisk = ocean.deadZoneExtent * 0.8 + (ocean.oxygenLevel < 0.3 ? 0.2 : 0);
  
  // === POINT OF NO RETURN ===
  
  ocean.recoveryPossible = (
    ocean.pH > 7.5 &&
    ocean.oxygenLevel > 0.2 &&
    ocean.deadZoneExtent < 0.6 &&
    ocean.phytoplanktonPopulation > 0.1
  );
  
  // === CRISIS CHECK ===
  
  const wasInCrisis = ocean.inCrisis;
  ocean.inCrisis = (
    ocean.pH < 7.8 ||
    ocean.oxygenLevel < 0.5 ||
    ocean.deadZoneExtent > 0.3
  );
  
  if (ocean.inCrisis) {
    ocean.monthsInCrisis++;
    
    // First month of crisis
    if (!wasInCrisis) {
      addEvent({
        id: `ocean_crisis_${state.currentMonth}`,
        timestamp: state.currentMonth,
        type: 'crisis',
        severity: 'critical',
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
      state.extinctionState.mechanism = 'anoxic_ocean';
      state.extinctionState.severity = 1.0;
      
      addEvent({
        id: `anoxic_extinction_${state.currentMonth}`,
        timestamp: state.currentMonth,
        type: 'catastrophe',
        severity: 'existential',
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
  fossil.economicShare = (energy.sources.oil + energy.sources.coal + energy.sources.naturalGas) / 
    Math.max(1, energy.totalProduction);
  
  // Political power correlates with economic share
  fossil.politicalPower = fossil.economicShare * 0.9; // Slightly less than economic share
  
  // Desperation increases as reserves deplete and substitution grows
  const avgFossilReserves = (resources.oil.reserves + resources.coal.reserves + resources.naturalGas.reserves) / 3;
  const avgSubstitution = (resources.oil.substitutionLevel + resources.coal.substitutionLevel + resources.naturalGas.substitutionLevel) / 3;
  
  fossil.desperation = Math.max(0, 1 - avgFossilReserves / 0.5) * 0.5 + avgSubstitution * 0.5;
  
  // Opposition intensity scales with political power and desperation
  fossil.researchResistance = fossil.politicalPower * fossil.desperation * 0.4; // Up to 40%
  fossil.deploymentResistance = fossil.politicalPower * fossil.desperation * 0.5; // Up to 50%
  
  // Government capture (depends on government type)
  const govType = state.government.type;
  fossil.governmentCapture = (
    (govType === 'authoritarian' && fossil.politicalPower > 0.6) ||
    fossil.politicalPower > 0.75
  );
  
  // Media disinformation scales with desperation
  fossil.mediaDisinformation = fossil.desperation * 0.6;
  
  // Political donations
  fossil.politicalDonations = fossil.economicShare * 25; // Up to $25B/year
  
  // Sabotage attempts (when desperate)
  if (fossil.desperation > 0.7 && Math.random() < 0.01) {
    fossil.sabotageAttempts++;
    
    addEvent({
      id: `fossil_sabotage_${state.currentMonth}`,
      timestamp: state.currentMonth,
      type: 'crisis',
      severity: 'warning',
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
  resources.totalResourceSecurity = calculateResourceSecurity(resources);
  
  // Energy independence (% renewable or domestic)
  resources.energyIndependence = resources.energy.renewablePercentage;
  
  // Circularity index (% recycled) - boosted by tech
  const avgRecyclingRate = (
    resources.iron.recyclingRate +
    resources.copper.recyclingRate +
    resources.rareEarths.recyclingRate +
    resources.lithium.recyclingRate
  ) / 4;
  resources.circularityIndex = avgRecyclingRate * 0.9; // Close to recycling rate
  
  // Fossil dependence
  resources.fossilDependence = 1 - resources.energy.renewablePercentage;
  
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
  
  // === DEPLETION WARNINGS ===
  
  if (resources.oil.reserves < 0.2 && month % 12 === 0) {
    addEvent({
      id: `oil_depletion_${month}`,
      timestamp: month,
      type: 'crisis',
      severity: 'warning',
      title: '⚠️ Oil Reserves Critical',
      description: `Oil reserves down to ${(resources.oil.reserves * 100).toFixed(0)}%. Price increasing, economic disruption likely without substitution.`,
      effects: { resource_scarcity: 0.5 }
    });
  }
  
  if (resources.rareEarths.reserves < 0.3 && month % 12 === 0) {
    addEvent({
      id: `rare_earth_bottleneck_${month}`,
      timestamp: month,
      type: 'crisis',
      severity: 'critical',
      title: '⚠️ Rare Earth Bottleneck',
      description: `Rare earth reserves at ${(resources.rareEarths.reserves * 100).toFixed(0)}%. Clean energy transition blocked! Solar panels, wind turbines require rare earth magnets.`,
      effects: { tech_bottleneck: 0.8 }
    });
  }
  
  if (resources.lithium.reserves < 0.2 && month % 12 === 0) {
    addEvent({
      id: `lithium_crisis_${month}`,
      timestamp: month,
      type: 'crisis',
      severity: 'critical',
      title: '🔋 Lithium Crisis',
      description: `Lithium reserves depleted to ${(resources.lithium.reserves * 100).toFixed(0)}%. EV production and grid storage severely limited. Battery technology transition urgent!`,
      effects: { battery_crisis: 0.7 }
    });
  }
  
  // === FOOD/WATER CRISES ===
  
  if (resources.food.reserves < 0.5 && month % 6 === 0) {
    addEvent({
      id: `food_shortage_${month}`,
      timestamp: month,
      type: 'crisis',
      severity: 'critical',
      title: '🌾 Food Shortage',
      description: `Food reserves at ${(resources.food.reserves * 100).toFixed(0)}%. Soil health: ${(resources.food.soilHealth * 100).toFixed(0)}%, Pollinators: ${(resources.food.pollinatorPopulation * 100).toFixed(0)}%. Mass famine risk.`,
      effects: { food_crisis: 1.0 }
    });
  }
  
  if (resources.water.reserves < 0.4 && month % 6 === 0) {
    addEvent({
      id: `water_crisis_${month}`,
      timestamp: month,
      type: 'crisis',
      severity: 'critical',
      title: '💧 Water Crisis',
      description: `Water reserves at ${(resources.water.reserves * 100).toFixed(0)}%. Aquifers: ${(resources.water.aquiferLevels * 100).toFixed(0)}%. Regional conflicts over water likely.`,
      effects: { water_crisis: 1.0 }
    });
  }
  
  // === CLIMATE MILESTONES ===
  
  if (resources.co2.temperatureAnomaly > 1.5 && month % 12 === 0) {
    const milestone = Math.floor(resources.co2.temperatureAnomaly * 2) / 2; // Round to 0.5°C
    
    addEvent({
      id: `climate_milestone_${milestone}_${month}`,
      timestamp: month,
      type: 'crisis',
      severity: 'critical',
      title: `🌡️ +${milestone.toFixed(1)}°C Warming`,
      description: `Global temperature now +${resources.co2.temperatureAnomaly.toFixed(1)}°C above pre-industrial. CO2: ${Math.round(resources.co2.atmosphericCO2)} ppm. Tipping points approaching.`,
      effects: { climate_crisis: milestone / 4.0 }
    });
  }
}

